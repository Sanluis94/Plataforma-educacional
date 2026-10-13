import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../core/services/firebaseConfig';
import type { UserRole } from '../types';
export interface RepositoryActor { uid: string; name: string; email: string; role: UserRole; emailVerified: boolean }
export async function getRepositoryActor(): Promise<RepositoryActor> {
  if (db) {
    const user = auth?.currentUser;
    if (!user) throw new Error('Entre na sua conta para continuar.');
    const profile = await getDoc(doc(db, 'users', user.uid));
    if (!profile.exists()) throw new Error('Seu perfil não está disponível.');
    return { uid: user.uid, name: profile.data().name ?? '', email: (user.email ?? '').toLowerCase(), role: profile.data().role, emailVerified: user.emailVerified };
  }
  const raw = localStorage.getItem('edu-interact-local-auth-session');
  const session = raw ? JSON.parse(raw) : null;
  if (!session?.currentUser?.uid || !session?.userData?.role) throw new Error('Entre na sua conta para continuar.');
  return { uid: session.currentUser.uid, name: session.userData.name ?? '', email: (session.currentUser.email ?? '').toLowerCase(), role: session.userData.role, emailVerified: true };
}
