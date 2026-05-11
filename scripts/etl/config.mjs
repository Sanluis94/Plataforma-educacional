import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const defaultSource = resolve(repoRoot, 'scripts/etl/source/educational-platform.seed.json');
export const defaultOutputDir = resolve(repoRoot, 'public/local-data/etl');

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
  return /^https?:\/\//i.test(value) || value.startsWith('file://') ? value : resolveRepoPath(value);
}
