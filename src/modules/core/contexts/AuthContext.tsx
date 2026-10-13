/**
 * AuthContext — Contexto de autenticação global.
 * Gerencia login/logout com Google, perfis no Firestore,
 * criação automática de progresso para estudantes e logs de sistema.
 */
import { createContext, useContext, useEffect, useState,useRef } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc,writeBatch } from 'firebase/firestore';
import { writeLog } from '../../data/repositories/logRepository';
import { DEFAULT_PROGRESS } from '../../data/types';
import { getLocalEtlUserByRole } from '../../data/services/localEtlClient';
import { LEARNING_LEVELS, isLearningLevel, normalizeLearningLevel, type LearningLevel } from '../constants/learningLevels';
import { productDeployment } from '../config/productConfiguration';
import { getInitialRegistrationRole } from '../config/registrationPolicy';
import { getConfirmedInstallationPolicy } from '../../data/repositories/installationPolicyRepository';

export type GradeLevel = LearningLevel;

export const GRADE_LABELS = Object.fromEntries(LEARNING_LEVELS.map(level => [level.id, level.label])) as Record<GradeLevel, string>;

interface UserData {
  role: 'professor' | 'coordenador' | 'estudante' | 'admin';
  name: string;
  email: string;
  gradeLevel: GradeLevel;
}

/** Normaliza somente a sessão; a leitura de um perfil não regrava seu cadastro. */
function normalizeUserData(data: Record<string, unknown>, fallback: GradeLevel = 'medio'): UserData {
  const gradeLevel = isLearningLevel(data.gradeLevel)
    ? data.gradeLevel
    : normalizeLearningLevel(data.academicLevel, normalizeLearningLevel(data.gradeLevel, fallback));
  return { ...data, gradeLevel } as unknown as UserData;
}

type AuthRole = UserData['role'];
const AUTH_LOG_ERROR_CODES = new Set([
  'auth/popup-closed-by-user', 'auth/popup-blocked', 'auth/cancelled-popup-request',
  'auth/network-request-failed', 'auth/unauthorized-domain', 'auth/operation-not-allowed',
  'auth/account-exists-with-different-credential', 'auth/user-disabled', 'auth/too-many-requests',
  'permission-denied', 'unavailable', 'failed-precondition',
  'auth/installation-policy-unavailable', 'auth/staff-not-assigned',
]);
function authLogErrorCode(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  return typeof code === 'string' && AUTH_LOG_ERROR_CODES.has(code) ? code : 'unknown';
}

type LocalAuthUser = {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
};

type LocalSession = {
  currentUser: LocalAuthUser;
  userData: UserData;
};

interface AuthContextType {
  profileError?:string;
  currentUser: User | LocalAuthUser | null;
  userData: UserData | null;
  loading: boolean;
  isLocalAuthMode: boolean;
  loginWithGoogle: (role: AuthRole, gradeLevel: GradeLevel) => Promise<void>;
  logout: () => Promise<void>;
  updateGradeLevel: (gradeLevel: GradeLevel) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
const LOCAL_SESSION_KEY = 'edu-interact-local-auth-session';
function clearPrivateTutorKey(uid?:string){
  try{if(!uid||localStorage.getItem('edu_gemini_key_owner')!==uid){localStorage.removeItem('gemini_api_key');localStorage.removeItem('edu_gemini_key_owner');}}catch{/* Storage failure does not prevent leaving the account. */}
}

const LOCAL_PROFILES: Record<AuthRole, { uid: string; name: string; email: string }> = {
  estudante: {
    uid: 'local-student-001',
    name: 'Ana Clara',
    email: 'ana.clara.local@edu-interact.test',
  },
  professor: {
    uid: 'local-professor-001',
    name: 'Marina Azevedo',
    email: 'marina.local@edu-interact.test',
  },
  coordenador: {
    uid: 'local-coordinator-001',
    name: 'Prof. Dr. Ricardo Valença',
    email: 'ricardo.coordenacao@kortex.edu.br',
  },
  admin: {
    uid: 'local-admin-001',
    name: 'Admin Local',
    email: 'admin.local@edu-interact.test',
  },
};

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | LocalAuthUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const isLocalAuthMode = !auth || !db;
  const loginInFlight=useRef(false),profileGeneration=useRef(0);
  const [profileError,setProfileError]=useState('');
  const [profileRefresh,setProfileRefresh]=useState(0);

  const loginWithGoogle = async (role: AuthRole, gradeLevel: GradeLevel) => {
    const registrationRole = getInitialRegistrationRole(productDeployment.mode, role);
    if (!auth || !db) {
      if (productDeployment.mode !== 'pilot') throw Object.assign(new Error('A configuração de acesso desta instalação está incompleta.'), { code: 'auth/installation-policy-unavailable' });
      const etlProfile = await getLocalEtlUserByRole(registrationRole);
      const fallbackProfile = LOCAL_PROFILES[registrationRole];
      const profile = {
        uid: etlProfile?.id ?? fallbackProfile.uid,
        name: etlProfile?.name ?? fallbackProfile.name,
        email: etlProfile?.email ?? fallbackProfile.email,
        gradeLevel: etlProfile?.gradeLevel ?? gradeLevel,
      };
      const localUser: LocalAuthUser = {
        uid: profile.uid,
        displayName: profile.name,
        email: profile.email,
        photoURL: null,
      };
      const localUserData: UserData = {
        name: profile.name,
        email: profile.email,
        role: registrationRole,
        gradeLevel: normalizeLearningLevel(profile.gradeLevel, gradeLevel),
      };

      clearPrivateTutorKey(localUser.uid);
      setCurrentUser(localUser);
      setUserData(localUserData);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
        currentUser: localUser,
        userData: localUserData,
      } satisfies LocalSession));
      return;
    }

    if (registrationRole === 'admin') {
      throw { code: 'auth/admin-local-only', message: 'Admin local só está disponível sem Firebase configurado.' };
    }

    const provider = new GoogleAuthProvider();
    if(loginInFlight.current)throw new Error('O acesso já está em andamento.');
    loginInFlight.current=true;profileGeneration.current++;setProfileError('');
    try {
      const installationPolicy = await getConfirmedInstallationPolicy(productDeployment);
      const result = await signInWithPopup(auth!, provider);
      const user = result.user;
      
      const userDocRef = doc(db!, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        if (installationPolicy?.staffRegistration === 'assigned-only' && registrationRole !== 'estudante') {
          throw Object.assign(new Error('O cadastro da equipe precisa ser autorizado pela escola antes do acesso.'), { code: 'auth/staff-not-assigned' });
        }
        // Primeiro login — cria perfil
        const newData: UserData = {
          name: user.displayName || 'Novo Usuário',
          email: user.email || '',
          role: registrationRole,
          gradeLevel,
        };
        const batch=writeBatch(db!);
        batch.set(userDocRef, { ...newData, createdAt: new Date().toISOString() });

        // A recriação do cadastro não deve apagar progresso já existente.
        if (registrationRole === 'estudante') {
          const progressRef = doc(db!, 'progress', user.uid);
          const progress = await getDoc(progressRef);
          if (!progress.exists()) batch.set(progressRef, {
            ...DEFAULT_PROGRESS,
            updatedAt: new Date().toISOString(),
          });
        }
        await batch.commit();
        setUserData(newData);

        // Log de registro
        await writeLog(
          'auth',
          'Cadastro criado via Google.',
          user.uid
        );
      } else {
        setUserData(normalizeUserData(docSnap.data(), gradeLevel));
      }
      setCurrentUser(user);setLoading(false);

      // Log de login
      await writeLog(
        'auth',
        'Login via Google concluído.',
        user.uid
      );
    } catch (error) {
      const code = authLogErrorCode(error);
      console.error('Não foi possível concluir o login com Google.', code);
      await writeLog('error', `Falha no login com Google (${code}).`, auth?.currentUser?.uid);
      throw error;
    }finally{loginInFlight.current=false;}
  };

  const updateGradeLevel = async (gradeLevel: GradeLevel) => {
    if (isLocalAuthMode) {
      setUserData(prev => {
        if (!prev || !currentUser) return prev;
        const updatedUserData = { ...prev, gradeLevel };
        const localUser = currentUser as LocalAuthUser;
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
          currentUser: localUser,
          userData: updatedUserData,
        } satisfies LocalSession));
        return updatedUserData;
      });
      return;
    }

    if (!auth?.currentUser || !db) return;
    const userDocRef = doc(db!, 'users', auth.currentUser.uid);
    await setDoc(userDocRef, { gradeLevel }, { merge: true });
    setUserData(prev => prev ? { ...prev, gradeLevel } : null);
  };

  const logout = async () => {
    clearPrivateTutorKey();
    if (isLocalAuthMode) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      setCurrentUser(null);
      setUserData(null);
      return;
    }

    if (!auth) return;
    
    // Log de logout antes de sair
    if (auth.currentUser) {
      await writeLog(
        'auth',
        'Sessão encerrada.',
        auth.currentUser.uid
      );
    }

    await signOut(auth!);
  };

  useEffect(() => {
    if (!auth || !db) {
      if (productDeployment.mode !== 'pilot') {
        setCurrentUser(null);setUserData(null);setProfileError('A configuração de acesso desta instalação está incompleta. Avise o responsável pela plataforma.');setLoading(false);return;
      }
      const storedSession = localStorage.getItem(LOCAL_SESSION_KEY);

      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession) as LocalSession;
          clearPrivateTutorKey(parsedSession.currentUser.uid);
          setCurrentUser(parsedSession.currentUser);
          setUserData(normalizeUserData(parsedSession.userData as unknown as Record<string, unknown>));
        } catch {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      }

      setLoading(false);
      return;
    }
    let active=true;
    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      if(!active)return;
      const generation=++profileGeneration.current;
      clearPrivateTutorKey(user?.uid);
      setCurrentUser(user);
      setUserData(null);
      if(loginInFlight.current){setLoading(false);return;}
      if (user) {
        // Fetch user role data from Firestore
        const docRef = doc(db!, 'users', user.uid);
        try{await getConfirmedInstallationPolicy(productDeployment);const docSnap = await getDoc(docRef);
        if(!active||generation!==profileGeneration.current||auth?.currentUser?.uid!==user.uid)return;
        if (docSnap.exists()) {
          setUserData(normalizeUserData(docSnap.data()));
        } else {
           setUserData(null);
        }
        setProfileError('');
        }catch(error){if(active&&generation===profileGeneration.current)setProfileError(error&&typeof error==='object'&&'code'in error&&error.code==='auth/installation-policy-unavailable'?'A política de acesso desta instalação não pôde ser confirmada. Avise o responsável pela plataforma.':'Não foi possível confirmar seu perfil. Tente consultar novamente.');}
      } else {
        setUserData(null);
      }
      if(active&&generation===profileGeneration.current)setLoading(false);
    });

    return ()=>{active=false;unsubscribe();};
  }, [profileRefresh]);

const value: AuthContextType = { currentUser, userData, loading, isLocalAuthMode, loginWithGoogle, logout, updateGradeLevel,profileError };

  return (
    <AuthContext.Provider value={value}>
      {loading&&<p role="status">Conferindo seu acesso…</p>}{profileError&&<p role="alert">{profileError} <button onClick={()=>{setProfileError('');setProfileRefresh(value=>value+1);}}>Consultar perfil novamente</button></p>}
      {!loading && children}
    </AuthContext.Provider>
  );
}
