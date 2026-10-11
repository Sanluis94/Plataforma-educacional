import { spawn } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { root, hash } from './browser-fixture.mjs';

async function run(path, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(new URL(path, root)), ...args], {
      cwd: fileURLToPath(root), stdio: 'inherit', shell: false, windowsHide: true,
    });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error(`Compilação local interrompida: ${code}`)));
  });
}
async function files(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...await files(new URL(`${entry.name}/`, directory), `${path}/`));
    else result.push(path);
  }
  return result;
}
const sourcePaths = [...(await files(new URL('src/', root))).map(path => `src/${path}`), 'scripts/dev/run.mjs', 'vite.config.ts'];
const sources = Object.fromEntries(await Promise.all(sourcePaths.map(async path => [path, hash(await readFile(new URL(path, root)))])));
await run('node_modules/typescript/bin/tsc', ['-b']);
await run('scripts/dev/run.mjs', ['local', 'build']);
for (const path of sourcePaths) {
  if (hash(await readFile(new URL(path, root))) !== sources[path]) throw new Error(`${path}: fonte mudou durante a compilação.`);
}
const outputPaths = (await files(new URL('dist/', root))).filter(path => !path.startsWith('local-data/'));
const output = Object.fromEntries(await Promise.all(outputPaths.map(async path => [path, hash(await readFile(new URL(`dist/${path}`, root)))])));
await writeFile(new URL('dist/qa-build.json', root), JSON.stringify({ builtAt: new Date().toISOString(), localOnly: true, sources, files: output }, null, 2));
console.log('Preview local identificado: fontes e arquivos prontos para verificação no navegador.');
