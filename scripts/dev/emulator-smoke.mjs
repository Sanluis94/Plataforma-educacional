import assert from 'node:assert/strict';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator, deleteUser, getAuth, inMemoryPersistence,
  setPersistence, signInAnonymously,
} from 'firebase/auth';
import {
  connectFirestoreEmulator, deleteDoc, doc, getDocFromServer,
  getFirestore, setDoc, terminate, updateDoc,
} from 'firebase/firestore';

// Fail before initializing any SDK if emulators:exec did not supply the exact
// isolated project and loopback endpoints. No real Firebase key is read.
assert.equal(process.env.GCLOUD_PROJECT, 'demo-kortex', 'Use emulators:check com demo-kortex.');
assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, '127.0.0.1:9099', 'Auth deve usar 127.0.0.1:9099.');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1:8080', 'Firestore deve usar 127.0.0.1:8080.');

const timeout = setTimeout(() => {
  console.error('Smoke dos emuladores excedeu 45 segundos.');
  process.exit(1);
}, 45_000);
const app = initializeApp({
  apiKey: 'demo-kortex-api-key',
  authDomain: 'demo-kortex.firebaseapp.com',
  projectId: 'demo-kortex',
  appId: 'demo-kortex-smoke',
}, 'kortex-emulator-smoke');
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
connectFirestoreEmulator(db, '127.0.0.1', 8080);

try {
  await setPersistence(auth, inMemoryPersistence);
  const { user } = await signInAnonymously(auth);
  assert.ok(user.uid, 'Auth deve criar uma sessão anônima no emulador.');
  const progress = doc(db, 'progress', user.uid);
  await setDoc(progress, { smokeTest: true, completedLabs: 1 });
  assert.equal((await getDocFromServer(progress)).data()?.completedLabs, 1);
  await updateDoc(progress, { completedLabs: 2 });
  assert.equal((await getDocFromServer(progress)).data()?.completedLabs, 2);
  await deleteDoc(progress);
  assert.equal((await getDocFromServer(progress)).exists(), false);
  await deleteUser(user);
  assert.equal(auth.currentUser, null);
  await assert.rejects(getDocFromServer(progress), error => error?.code === 'permission-denied');
  await assert.rejects(setDoc(progress, { smokeTest: true }), error => error?.code === 'permission-denied');
  console.log('Smoke aprovado: Auth anônimo; Firestore cria, lê, atualiza e exclui; acesso sem sessão negado. Projeto demo-kortex.');
} catch (error) {
  console.error(`Smoke reprovado: ${error?.code || error?.name || 'erro desconhecido'}.`);
  process.exitCode = 1;
} finally {
  if (auth.currentUser) await deleteUser(auth.currentUser).catch(() => {});
  await terminate(db);
  await deleteApp(app);
  clearTimeout(timeout);
}
