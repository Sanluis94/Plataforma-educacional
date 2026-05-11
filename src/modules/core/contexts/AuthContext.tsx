/**
 * AuthContext — Contexto de autenticação global.
 * Gerencia login/logout com Google, perfis no Firestore,
 * criação automática de progresso para estudantes e logs de sistema.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { writeLog } from '../../data/repositories/logRepository';
import { DEFAULT_PROGRESS } from '../../data/types';
import { getLocalEtlUserByRole } from '../../data/services/localEtlClient';

export type GradeLevel = 'fundamental_1' | 'fundamental_2' | 'medio' | 'profissional';

export const GRADE_LABELS: Record<GradeLevel, string> = {
  fundamental_1: 'Ensino Fundamental I (1º ao 5º ano)',
  fundamental_2: 'Ensino Fundamental II (6º ao 9º ano)',
  medio: 'Ensino Médio (1º ao 3º ano)',
  profissional: 'Capacitação Profissional',
};

interface UserData {
  role: 'professor' | 'estudante' | 'admin';
  name: string;
  email: string;
  gradeLevel: GradeLevel;
}

type AuthRole = UserData['role'];

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

  const loginWithGoogle = async (role: AuthRole, gradeLevel: GradeLevel) => {
    if (!auth || !db) {
      const etlProfile = await getLocalEtlUserByRole(role);
      const fallbackProfile = LOCAL_PROFILES[role];
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
        role,
        gradeLevel: normalizeGradeLevel(profile.gradeLevel, gradeLevel),
      };

      setCurrentUser(localUser);
      setUserData(localUserData);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
        currentUser: localUser,
        userData: localUserData,
      } satisfies LocalSession));
      return;
    }

    if (role === 'admin') {
      throw { code: 'auth/admin-local-only', message: 'Admin local só está disponível sem Firebase configurado.' };
    }

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth!, provider);
      const user = result.user;
      
      const userDocRef = doc(db!, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        // Primeiro login — cria perfil
        const newData: UserData = {
          name: user.displayName || 'Novo Usuário',
          email: user.email || '',
          role,
          gradeLevel,
        };
        await setDoc(userDocRef, { ...newData, createdAt: new Date().toISOString() });
        setUserData(newData);

        // Se for estudante, cria documento de progresso default
        if (role === 'estudante') {
          const progressRef = doc(db!, 'progress', user.uid);
          await setDoc(progressRef, {
            ...DEFAULT_PROGRESS,
            updatedAt: new Date().toISOString(),
          });
        }

        // Log de registro
        await writeLog(
          'auth',
          `Novo usuário registrado: ${user.email} (${role})`,
          user.uid
        );
      } else {
        setUserData(docSnap.data() as UserData);
      }

      // Log de login
      await writeLog(
        'auth',
        `Login via Google — ${user.email} (${role})`,
        user.uid
      );
    } catch (error) {
      console.error("Erro no login com Google:", error);
      await writeLog('error', `Falha no login: ${(error as Error).message}`);
      throw error;
    }
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
        `Logout — ${auth.currentUser.email}`,
        auth.currentUser.uid
      );
    }

    await signOut(auth!);
  };

  useEffect(() => {
    if (!auth || !db) {
      const storedSession = localStorage.getItem(LOCAL_SESSION_KEY);

      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession) as LocalSession;
          setCurrentUser(parsedSession.currentUser);
          setUserData(parsedSession.userData);
        } catch {
          localStorage.removeItem(LOCAL_SESSION_KEY);
        }
      }

      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role data from Firestore
        const docRef = doc(db!, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
           setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

const value: AuthContextType = { currentUser, userData, loading, isLocalAuthMode, loginWithGoogle, logout, updateGradeLevel };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

function normalizeGradeLevel(value: string | undefined, fallback: GradeLevel): GradeLevel {
  return value && value in GRADE_LABELS ? value as GradeLevel : fallback;
}
