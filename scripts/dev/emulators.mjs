import { existsSync } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const mode = process.argv[2];
const cliPath = join(projectDir, 'node_modules/firebase-tools/lib/bin/firebase.js');

if (!['start', 'check'].includes(mode) || process.argv.length > 3) {
  console.error('Uso: node scripts/dev/emulators.mjs <start|check>');
  process.exitCode = 2;
} else if (!existsSync(cliPath)) {
  console.error('Firebase CLI local ausente. Execute npm ci.');
  process.exitCode = 1;
} else {
  // The project is fixed here, independently of .firebaserc or the active CLI account.
  // Neither command exports data, deploys resources, or accepts a project override.
  const args = [
    cliPath,
    mode === 'check' ? 'emulators:exec' : 'emulators:start',
    '--project', 'demo-kortex',
    '--only', 'auth,firestore',
    '--config', join(projectDir, 'firebase.json'),
    '--non-interactive',
  ];
  if (mode === 'check') args.push('node scripts/dev/emulator-smoke.mjs');

  process.env.GCLOUD_PROJECT = 'demo-kortex';
  process.env.GOOGLE_CLOUD_PROJECT = 'demo-kortex';
  for (const key of ['GOOGLE_APPLICATION_CREDENTIALS', 'FIREBASE_CONFIG', 'FIREBASE_TOKEN']) delete process.env[key];
  const javaBin = process.env.JAVA_HOME && join(process.env.JAVA_HOME, 'bin');
  if (javaBin && existsSync(join(javaBin, process.platform === 'win32' ? 'java.exe' : 'java'))) {
    // Oracle's Windows javapath launcher can leave its real Java child running
    // after Firebase stops the launcher. Prefer the JDK executable directly.
    process.env.PATH = `${javaBin}${delimiter}${process.env.PATH || ''}`;
  }
  process.chdir(projectDir);
  process.argv = [process.execPath, ...args];
  // Keep Firebase's own shutdown handlers in this process. On Windows, killing a
  // child CLI with SIGINT would terminate it before it could stop its Java child.
  await import(pathToFileURL(cliPath).href);
}
