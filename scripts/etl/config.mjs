import { existsSync } from 'node:fs';
import { readFile, lstat, mkdir } from 'node:fs/promises';
import { dirname, isAbsolute, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const defaultSource = resolve(repoRoot, 'scripts/etl/source/educational-platform.seed.json');
export const defaultOutputDir = resolve(repoRoot, '.local/etl');
export const publicSeedOutputDir = resolve(repoRoot, 'public/local-data/etl');
export const FIREBASE_SOURCE = 'firebase';

export async function loadDotEnv() {
  for (const filename of ['.env', '.env.local']) {
    const path = resolve(repoRoot, filename);

    if (!existsSync(path)) {
      continue;
    }

    const content = await readFile(path, 'utf8');

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, '');

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

export function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (!current.startsWith('--')) {
      continue;
    }

    const [rawKey, inlineValue] = current.slice(2).split('=');
    const key = rawKey.trim();

    if (!key) {
      continue;
    }

    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }

    const next = argv[index + 1];
    parsed[key] = next && !next.startsWith('--') ? next : 'true';

    if (next && !next.startsWith('--')) {
      index += 1;
    }
  }

  return parsed;
}

export function resolveRepoPath(value) {
  return isAbsolute(value) ? value : resolve(repoRoot, value);
}

export function resolveSource(value) {
  return value === FIREBASE_SOURCE || /^https?:\/\//i.test(value) || value.startsWith('file://') ? value : resolveRepoPath(value);
}

/** Never publish an export or delete a caller-selected directory. */
export async function validateOutputDirectory(output, { source, publicSeed = false } = {}) {
  const target = resolveRepoPath(output);
  const approvedRoot = publicSeed ? publicSeedOutputDir : defaultOutputDir;
  if (publicSeed && resolveSource(source ?? '') !== defaultSource) throw new Error('Somente o seed fictício versionado pode ser publicado com --public-seed.');
  const within = relative(approvedRoot, target);
  if (within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within)) throw new Error('A saída ETL deve ficar em .local/etl; --public-seed permite somente public/local-data/etl para o seed fictício.');
  const segments = relative(repoRoot, target).split(sep).filter(Boolean);
  let path = repoRoot;
  for (const segment of segments) {
    path = resolve(path, segment);
    try {
      const info = await lstat(path);
      if (info.isSymbolicLink() || !info.isDirectory()) throw new Error('A saída ETL não pode atravessar links ou arquivos.');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await mkdir(path);
    }
  }
  return target;
}
