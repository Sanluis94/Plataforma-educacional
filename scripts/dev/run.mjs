import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const projectDir = resolve(dirname(scriptPath), '../..');
const firebaseKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_EMULATOR_HOST',
  'VITE_FIREBASE_AUTH_EMULATOR_PORT',
  'VITE_FIREBASE_FIRESTORE_EMULATOR_PORT',
];

export function runtimeEnvironment(mode, source = process.env) {
  const env = { ...source };

  // Empty process values take precedence over Vite's .env and .env.local files.
  // Deleting these keys would allow the real project configuration to return.
  for (const key of new Set([...firebaseKeys, ...Object.keys(env).filter(key => key.startsWith('VITE_FIREBASE_'))])) {
    env[key] = '';
  }
  env.VITE_GEMINI_API_KEY = '';
  env.VITE_USE_FIREBASE_EMULATORS = 'false';
  env.VITE_DISABLE_AI = 'true';

  if (mode === 'emulator') {
    Object.assign(env, {
      VITE_USE_FIREBASE_EMULATORS: 'true',
      VITE_FIREBASE_API_KEY: 'demo-kortex-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'demo-kortex.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'demo-kortex',
      VITE_FIREBASE_STORAGE_BUCKET: 'demo-kortex.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
      VITE_FIREBASE_APP_ID: '1:1234567890:web:demo-kortex',
      VITE_FIREBASE_EMULATOR_HOST: '127.0.0.1',
      VITE_FIREBASE_AUTH_EMULATOR_PORT: '9099',
      VITE_FIREBASE_FIRESTORE_EMULATOR_PORT: '8080',
    });
  }

  return env;
}

function run(mode, args) {
  if (!['local', 'emulator', 'test'].includes(mode)) {
    console.error('Uso: node scripts/dev/run.mjs <local|emulator|test> [argumentos do Vite/Vitest]');
    process.exitCode = 2;
    return;
  }

  const binary = mode === 'test' ? 'vitest/vitest.mjs' : 'vite/bin/vite.js';
  const binaryPath = join(projectDir, 'node_modules', binary);
  if (!existsSync(binaryPath)) {
    console.error('Dependências ausentes. Execute npm ci na pasta plataforma-educacional.');
    process.exitCode = 1;
    return;
  }

  const child = spawn(process.execPath, [binaryPath, ...(mode === 'test' ? ['run'] : []), ...args], {
    cwd: projectDir,
    env: runtimeEnvironment(mode),
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });

  let cancelledExitCode;
  function cancel(signal) {
    if (cancelledExitCode !== undefined) return;
    cancelledExitCode = signal === 'SIGINT' ? 130 : 143;
    if (!child.pid) return;

    if (process.platform === 'win32') {
      // Also terminate Vite/Vitest workers on Windows; no shell interpolation.
      const taskkill = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'taskkill.exe');
      const terminator = spawn(taskkill, ['/PID', String(child.pid), '/T', '/F'], {
        stdio: 'ignore', shell: false, windowsHide: true,
      });
      terminator.on('error', () => child.kill());
    } else {
      child.kill(signal);
    }
  }

  const onInterrupt = () => cancel('SIGINT');
  const onTerminate = () => cancel('SIGTERM');
  process.on('SIGINT', onInterrupt);
  process.on('SIGTERM', onTerminate);
  child.once('error', () => {
    console.error('Não foi possível iniciar o processo de desenvolvimento. Verifique Node.js e npm ci.');
    process.exitCode = 1;
  });
  child.once('close', (code, signal) => {
    process.removeListener('SIGINT', onInterrupt);
    process.removeListener('SIGTERM', onTerminate);
    process.exitCode = cancelledExitCode ?? code ?? (signal === 'SIGINT' ? 130 : 1);
  });
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  run(process.argv[2], process.argv.slice(3));
}
