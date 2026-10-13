import { readFile } from 'node:fs/promises';
import { installationFingerprint } from './installation.mjs';
try {
  if (process.argv.length !== 3) throw new Error('Informe o caminho do manifesto público.');
  const item = JSON.parse(await readFile(process.argv[2], 'utf8'));
  console.log(installationFingerprint(item));
} catch (error) { console.error(error.message); process.exitCode = 1; }
