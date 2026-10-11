import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { productionEnvironment } from './productionEnvironment.ts';

const scriptPath = fileURLToPath(import.meta.url);
const projectDir = resolve(dirname(scriptPath), '../..');

function runStep(binary, args, env) {
  return new Promise(resolveStep => {
    const child = spawn(process.execPath, [binary, ...args], {
      cwd: projectDir,
      env,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
    });
    child.once('error', () => resolveStep(1));
    child.once('close', (code, signal) => resolveStep(code ?? (signal === 'SIGINT' ? 130 : 1)));
  });
}

async function buildProduction() {
  const tsc = join(projectDir, 'node_modules/typescript/bin/tsc');
  const vite = join(projectDir, 'node_modules/vite/bin/vite.js');
  if (!existsSync(tsc) || !existsSync(vite)) throw new Error('Dependências ausentes. Execute npm ci.');
  let productionProject;
  try {
    productionProject = JSON.parse(readFileSync(join(projectDir, '.firebaserc'), 'utf8')).projects?.production;
  } catch {
    throw new Error('Não foi possível ler o alias production de .firebaserc.');
  }
  const loaded = loadEnv('production', projectDir, 'VITE_');
  const env = productionEnvironment({ ...process.env, ...loaded }, productionProject);
  const typecheckCode = await runStep(tsc, ['-b'], env);
  if (typecheckCode !== 0) {
    process.exitCode = typecheckCode;
    return;
  }
  process.exitCode = await runStep(vite, ['build', '--mode', 'production'], env);
}

// Importing this module never starts a compiler or build process.
if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  buildProduction().catch(error => {
    console.error(error instanceof Error ? error.message : 'Falha na compilação de produção.');
    process.exitCode = 1;
  });
}
