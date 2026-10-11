import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateLearningContent, findRepeatedContent } from '../../src/modules/core/content/contentQuality.ts';

const root = new URL('../../', import.meta.url);
const catalogSource = await readFile(new URL('src/modules/core/constants/masterLabsCatalog.ts', root), 'utf8');
const catalogMatch = catalogSource.match(/export const MASTER_LABS_CATALOG: CatalogLabItem\[\] = (\[[\s\S]*?\]);/);
if (!catalogMatch) throw new Error('Não foi possível ler o catálogo completo.');
const catalog = JSON.parse(catalogMatch[1]);
const legacySource = await readFile(new URL('src/modules/core/constants/dashboardConstants.ts', root), 'utf8');
const legacy = [...legacySource.matchAll(/\{ id: '((?:math|fis|qui|bio|port|red|hist|lang|soft|hard|geo|fil)_\d+)', title: '([^']+)'/g)]
  .map(match => ({ id: match[1], title: match[2], academicLevel: 'legacy' }));
if (catalog.length !== 510 || legacy.length !== 72) throw new Error('O inventário mudou: revise a cobertura completa antes de usar este relatório.');
const inventory = [...catalog, ...legacy];
const contents = {};
const errors = [];
const contentDirectory = new URL('src/modules/core/content/', root);
for (const filename of (await readdir(contentDirectory)).filter(name => name.endsWith('.json')).sort()) {
  const pack = JSON.parse(await readFile(new URL(filename, contentDirectory), 'utf8'));
  for (const [id, content] of Object.entries(pack)) {
    if (contents[id]) errors.push(`ID de conteúdo duplicado: ${id} em ${filename}`);
    contents[id] = content;
    errors.push(...validateLearningContent(id, content));
  }
}
const knownIds = new Set(inventory.map(lab => lab.id));
for (const id of Object.keys(contents)) if (!knownIds.has(id)) errors.push(`Conteúdo sem laboratório no inventário: ${id}`);
errors.push(...findRepeatedContent(contents));
const missing = inventory.filter(lab => !contents[lab.id]).map(lab => ({ id: lab.id, title: lab.title, level: lab.academicLevel }));
const byLevel = {};
for (const lab of inventory) {
  const row = byLevel[lab.academicLevel] ??= { total: 0, authored: 0 };
  row.total++;
  if (contents[lab.id]) row.authored++;
}
const report = {
  generatedAt: new Date().toISOString(), inventory: inventory.length,
  authored: inventory.length - missing.length, missing, byLevel, errors,
  complete: missing.length === 0 && errors.length === 0,
  note: 'Cobertura de roteiros próprios. A validação estrutural e de repetições não substitui revisão conceitual nem testes da navegação e interação.',
};
const reportDirectory = new URL('.local/labs/', root);
await mkdir(reportDirectory, { recursive: true });
const reportPath = new URL('content-audit.json', reportDirectory);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Roteiros próprios: ${report.authored}/${report.inventory}`);
console.table(byLevel);
console.log(`Pendentes: ${missing.length}; problemas no conteúdo: ${errors.length}`);
for (const error of errors.slice(0, 30)) console.error(error);
console.log(`Relatório completo: ${fileURLToPath(reportPath)}`);
if (!report.complete) process.exitCode = 1;
