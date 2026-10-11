import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const root = new URL('../../', import.meta.url);
export const origin = 'http://127.0.0.1:5175';
export const levels = [
  { id: 'fundamental_1', label: 'Fundamental I', count: 21 },
  { id: 'fundamental_2', label: 'Fundamental II', count: 85 },
  { id: 'medio', label: 'Ensino Médio', count: 134 },
  { id: 'graduacao', label: 'Graduação', count: 160 },
  { id: 'pos_graduacao', label: 'Pós-Graduação', count: 170 },
  { id: 'profissional', label: 'Formação Profissional', count: 12 },
];
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');

export async function readCatalog() {
  const source = await readFile(new URL('src/modules/core/constants/masterLabsCatalog.ts', root), 'utf8');
  const master = JSON.parse(source.match(/export const MASTER_LABS_CATALOG: CatalogLabItem\[\] = (\[[\s\S]*?\]);/)[1]);
  const legacySource = await readFile(new URL('src/modules/core/constants/legacyLabsCatalog.ts', root), 'utf8');
  const legacy = [...legacySource.matchAll(/\{ id: '([^']+)', title: '([^']+)', subject: '([^']+)', subjectId: '([^']+)', academicLevel: '([^']+)'/g)]
    .map(([, id, title, subject, subjectId, academicLevel]) => ({ id, title, subject, subjectId, academicLevel, source: 'legacy' }));
  assert.equal(master.length, 510);
  assert.equal(legacy.length, 72);
  const catalog = [...master.map(lab => ({ ...lab, source: 'catalog' })), ...legacy];
  assert.equal(new Set(catalog.map(lab => lab.id)).size, 582);
  for (const level of levels) assert.equal(catalog.filter(lab => lab.academicLevel === level.id).length, level.count);
  return catalog;
}

// Verify both the source used to build and the files actually served. The
// manifest is generated only after the local compiler/build succeeds.
export async function verifyPreview(request) {
  const local = JSON.parse(await readFile(new URL('dist/qa-build.json', root), 'utf8'));
  const response = await request.get(`${origin}/qa-build.json`);
  assert.ok(response.ok(), 'Compile com node scripts/labs/build-browser-preview.mjs e inicie o preview.');
  assert.deepEqual(await response.json(), local, 'O servidor está atendendo outra compilação.');
  for (const [path, expected] of Object.entries(local.sources)) {
    assert.equal(hash(await readFile(new URL(path, root))), expected, `${path}: fonte mudou após a compilação.`);
  }
  for (const [path, expected] of Object.entries(local.files)) {
    const served = await request.get(`${origin}/${path}`);
    assert.ok(served.ok(), `${path}: arquivo do preview ausente.`);
    assert.equal(hash(await served.body()), expected, `${path}: arquivo servido diverge da compilação.`);
  }
  return local;
}
