import { readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIREBASE_SOURCE, defaultOutputDir, defaultSource, publicSeedOutputDir, loadDotEnv, parseArgs, resolveRepoPath, resolveSource, validateOutputDirectory } from './config.mjs';
import { transformEducationalSnapshot } from './transform.mjs';

try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: 'error', message: error instanceof Error ? error.message : 'Falha no ETL.' }, null, 2));
  process.exitCode = 1;
}

async function main() {
  await loadDotEnv();
  const args = parseArgs(process.argv.slice(2));
  const source = resolveSource(args.source ?? process.env.ETL_SOURCE ?? defaultSource);
  const publicSeed = args['public-seed'] === 'true';
  const outputDir = await validateOutputDirectory(args.output ?? (publicSeed ? publicSeedOutputDir : process.env.ETL_OUTPUT_DIR ?? defaultOutputDir), { source, publicSeed });
  const payload = await extract(source);
  const snapshot = transformEducationalSnapshot(payload, { source: publicSeed ? 'versioned-fictional-seed' : source });
  await load(snapshot, outputDir, { source, publicSeed });
  console.log(JSON.stringify({ status: 'ok', generatedAt: snapshot.generatedAt, visibility: publicSeed ? 'fictional-public-seed' : 'private-local-export', totals: snapshot.metrics.summary, quality: { excluded: snapshot.quality.excluded, duplicates: snapshot.quality.duplicates, issues: snapshot.quality.issues.length } }, null, 2));
}

async function extract(source) {
  if (source === FIREBASE_SOURCE) return extractFirebase();
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Extração ETL indisponível (HTTP ${response.status}).`);
    return response.json();
  }
  return JSON.parse(await readFile(source.startsWith('file://') ? fileURLToPath(source) : source, 'utf8'));
}

async function extractFirebase() {
  const { initializeApp, applicationDefault, cert, getApps } = await import('firebase-admin/app');
  const { getFirestore, Timestamp, GeoPoint, DocumentReference } = await import('firebase-admin/firestore');
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) credential = cert(JSON.parse(await readFile(resolveRepoPath(process.env.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8')));
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) credential = applicationDefault();
  else throw new Error('A extração Firebase exige credenciais administrativas configuradas; não reutiliza sessões do navegador.');
  if (!getApps().length) initializeApp({ credential, ...(projectId ? { projectId } : {}) });
  const db = getFirestore();
  const names = ['users', 'classes', 'activities', 'submissions', 'progress', 'student_progress', 'system_logs', 'exams', 'exam_attempts', 'lesson_plans'];
  const snapshots = await Promise.all(names.map(name => db.collection(name).get()));
  const collections = Object.fromEntries(snapshots.map((snapshot, index) => [names[index], snapshot.docs.map(doc => ({ ...convert(doc.data()), id: doc.id }))]));
  return { metadata: { extractedAt: new Date().toISOString(), source: FIREBASE_SOURCE, collectionCounts: Object.fromEntries(snapshots.map((snapshot, index) => [names[index], snapshot.size])) }, collections };
  function convert(value) {
    if (value instanceof Timestamp) return value.toDate().toISOString();
    if (value instanceof GeoPoint) return { latitude: value.latitude, longitude: value.longitude };
    if (value instanceof DocumentReference) return value.path;
    if (Array.isArray(value)) return value.map(convert);
    if (typeof value === 'object' && value !== null) return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, convert(nested)]));
    return value;
  }
}

/** Writes only owned JSON files; leaves unrelated files untouched. Index commits last. */
async function load(snapshot, output, context) {
  const files = [
    ...Object.entries(snapshot.collections).map(([name, data]) => [`collections/${name}.json`, data]),
    ...Object.entries(snapshot.metrics).map(([name, data]) => [`metrics/${name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}.json`, data]),
    ['quality.json', snapshot.quality], ['index.json', snapshot],
  ];
  for (const [relativePath, data] of files) {
    const path = join(output, relativePath);
    await validateOutputDirectory(dirname(path), context);
    const temporary = `${path}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await rename(temporary, path);
  }
}
