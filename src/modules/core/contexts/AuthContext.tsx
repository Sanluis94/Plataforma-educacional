import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  loginWithGoogle: (role: 'professor' | 'estudante', gradeLevel: GradeLevel) => Promise<void>;
  logout: () => Promise<void>;
  updateGradeLevel: (gradeLevel: GradeLevel) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async (role: 'professor' | 'estudante', gradeLevel: GradeLevel) => {
    if (!auth || !db) {
       console.warn("Firebase Auth ou DB não estão inicializados. Verifique as chaves.");
       return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth!, provider);
      const user = result.user;
      
      const userDocRef = doc(db!, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) {
        const newData: UserData = {
          name: user.displayName || 'Novo Usuário',
          email: user.email || '',
          role,
          gradeLevel,
        };
        await setDoc(userDocRef, { ...newData, createdAt: new Date().toISOString() });
        setUserData(newData);
      } else {
        setUserData(docSnap.data() as UserData);
      }
    } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
    }
  };

  const updateGradeLevel = async (gradeLevel: GradeLevel) => {
    if (!auth?.currentUser || !db) return;
    const userDocRef = doc(db!, 'users', auth.currentUser.uid);
    await setDoc(userDocRef, { gradeLevel }, { merge: true });
    setUserData(prev => prev ? { ...prev, gradeLevel } : null);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth!);
  };

  useEffect(() => {
    if (!auth || !db) {
       setLoading(false);
       return;
    }
    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user rol data from firestore
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

  const value: AuthContextType = { currentUser, userData, loading, loginWithGoogle, logout, updateGradeLevel };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
