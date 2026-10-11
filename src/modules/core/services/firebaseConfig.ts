import { getApps, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";

export const useFirebaseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

// Não permita que um build publicado use emuladores ou volte ao projeto real
// silenciosamente quando foi configurado para trabalhar apenas com dados locais.
if (useFirebaseEmulators && !import.meta.env.DEV) {
  throw new Error("Os emuladores Firebase só podem ser usados no servidor de desenvolvimento.");
}

function emulatorPort(value: string | undefined, fallback: number): number {
  const port = Number(value || fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Porta de emulador Firebase inválida; use um número entre 1 e 65535.");
  }
  return port;
}

const emulatorHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";
const authEmulatorPort = useFirebaseEmulators
  ? emulatorPort(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT, 9099)
  : 9099;
const firestoreEmulatorPort = useFirebaseEmulators
  ? emulatorPort(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT, 8080)
  : 8080;

// Um projeto demo- não tem serviços reais. Mesmo que .env.local contenha a
// configuração de produção, o modo local não a utiliza.
const firebaseConfig = useFirebaseEmulators ? {
  apiKey: "demo-kortex-api-key",
  authDomain: "demo-kortex.firebaseapp.com",
  projectId: "demo-kortex",
  appId: "demo-kortex-app"
} : {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verifica se as chaves essenciais estão presentes antes de inicializar
const isConfigValid = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId
);

// A app nomeada também separa a sessão de autenticação local da sessão real.
// Reutilizar a instância evita inicialização e conexão repetidas durante HMR.
const appName = useFirebaseEmulators ? "kortex-emulator" : "[DEFAULT]";
const existingApp = isConfigValid ? getApps().find(candidate => candidate.name === appName) : undefined;
export const app = isConfigValid ? existingApp ?? initializeApp(firebaseConfig, appName) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

if (useFirebaseEmulators && !existingApp && db && auth) {
  connectFirestoreEmulator(db, emulatorHost, firestoreEmulatorPort);
  connectAuthEmulator(auth, `http://${emulatorHost}:${authEmulatorPort}`);
}

if (!app) {
  console.warn("Firebase não inicializado: Variáveis de ambiente faltando no arquivo .env");
}
