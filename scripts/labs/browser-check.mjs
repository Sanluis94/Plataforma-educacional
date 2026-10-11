import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';

// Start dev:local on 127.0.0.1:5175 before this check. It deliberately uses the
// actual login, catalog search and runner rather than a separate test page.
const origin = 'http://127.0.0.1:5175';
const root = new URL('../../', import.meta.url);
const source = await readFile(new URL('src/modules/core/constants/masterLabsCatalog.ts', root), 'utf8');
const catalog = JSON.parse(source.match(/export const MASTER_LABS_CATALOG: CatalogLabItem\[\] = (\[[\s\S]*?\]);/)[1]);
const directory = new URL('src/modules/core/content/', root);
const entries = {};
for (const file of (await readdir(directory)).filter(name => name.endsWith('.json'))) {
  const pack = JSON.parse(await readFile(new URL(file, directory), 'utf8'));
  for (const [id, content] of Object.entries(pack)) {
    assert.ok(!entries[id], `ID duplicado: ${id} em ${file}`);
    entries[id] = content;
  }
}
const legacySource = await readFile(new URL('src/modules/core/constants/dashboardConstants.ts', root), 'utf8');
const legacy = [...legacySource.matchAll(/\{\s+id: '([^']+)', label: '([^']+)',\s+labs: \[([\s\S]*?)\]\s+\}/g)].flatMap(module =>
  [...module[3].matchAll(/\{ id: '([^']+)', title: '([^']+)'/g)].map(lab => ({ id: lab[1], title: lab[2], subjectId: module[1], subject: module[2] })));
assert.equal(legacy.length, 72, 'Inventário da biblioteca inicial incompleto.');
const dashboardSource = await readFile(new URL('src/modules/ux/pages/EstudanteDashboard.tsx', root), 'utf8');
const areas = [...dashboardSource.matchAll(/\{ id: '[^']+', label: '([^']+)', subjects: \[([^\]]+)\]/g)].map(match => ({ label: match[1], subjects: [...match[2].matchAll(/'([^']+)'/g)].map(item => item[1]) }));
const selectedIds = process.argv.find(argument => argument.startsWith('--ids='))?.slice(6).split(',').filter(Boolean);
const workers = Number(process.argv.find(argument => argument.startsWith('--workers='))?.slice(10) ?? 1);
assert.ok(Number.isInteger(workers) && workers >= 1 && workers <= 4, 'Use entre um e quatro navegadores de verificação.');
const selected = new Set(selectedIds);
const included = lab => entries[lab.id] && (!selectedIds || selected.has(lab.id));
const labs = process.argv.includes('--legacy-only') ? [] : catalog.filter(included);
const legacyLabs = legacy.filter(included);
const total = labs.length + legacyLabs.length;
assert.ok(total > 0, 'Nenhum conteúdo autorado disponível.');
if (process.argv.includes('--require-complete')) {
  assert.ok(!selectedIds && !process.argv.includes('--legacy-only'), 'A verificação completa não permite recortar o inventário.');
  assert.equal(total, 582, 'A navegação completa exige todos os 582 roteiros.');
}
if (selectedIds) assert.equal(total, selected.size, 'A seleção contém IDs inexistentes, pendentes ou excluídos por --legacy-only.');
const output = new URL('.local/labs/browser/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const pages = [];
const pageErrors = [];
const visited = [];

async function verifyActivity(page, lab) {
  const activity = page.getByRole('region', { name: `Laboratório: ${lab.title}`, exact: true });
  await activity.waitFor();
  const content = entries[lab.id];
  assert.ok(await activity.getByText(content.context, { exact: true }).isVisible(), `${lab.id}: contexto ausente`);
  for (const step of content.investigation) await activity.getByText(step, { exact: true }).waitFor({ state: 'visible' });
  await activity.getByText(content.reflection, { exact: true }).waitFor({ state: 'visible' });
  for (const scenario of content.scenarios) {
    await activity.getByRole('button', { name: scenario.label, exact: true }).click();
    await activity.getByText(scenario.situation, { exact: true }).waitFor({ state: 'visible' });
    await activity.getByRole('button', { name: 'Conferir observação', exact: true }).click();
    await activity.getByText(scenario.observation, { exact: true }).waitFor({ state: 'visible' });
    await activity.getByText(scenario.explanation, { exact: true }).waitFor({ state: 'visible' });
  }
  await activity.getByRole('button', { name: 'Conferir critérios de uma boa resposta', exact: true }).click();
  await activity.getByText(content.expectedEvidence, { exact: true }).waitFor({ state: 'visible' });
  await activity.getByRole('button', { name: 'Compreender', exact: true }).click();
  await activity.getByText(content.theory, { exact: true }).waitFor({ state: 'visible' });
  await activity.getByText(content.workedExample, { exact: true }).waitFor({ state: 'visible' });
  for (const source of content.sources ?? []) {
    assert.equal(await activity.getByRole('link', { name: source.title, exact: true }).getAttribute('href'), source.url);
  }
  await activity.getByRole('button', { name: 'Avaliar', exact: true }).click();
  for (const question of content.questions) {
    const group = activity.getByRole('group').filter({ has: page.getByText(question.question, { exact: false }) });
    for (const option of question.options) await group.getByLabel(option.text, { exact: true }).waitFor({ state: 'visible' });
    await group.getByLabel(question.options.find(option => option.correct).text, { exact: true }).check();
  }
  await activity.getByRole('button', { name: 'Corrigir respostas', exact: true }).click();
  assert.match(await activity.getByRole('status').innerText(), new RegExp(`Você acertou ${content.questions.length} de ${content.questions.length}`));
  for (const question of content.questions) {
    const group = activity.getByRole('group').filter({ has: page.getByText(question.question, { exact: false }) });
    for (const option of question.options) await group.getByText(option.explanation, { exact: false }).first().waitFor({ state: 'visible' });
  }
  await activity.getByRole('button', { name: 'Investigar', exact: true }).click();
  if (lab.id === 'fund1_mat_01') {
    await activity.getByLabel('Minha resposta com evidências dos cenários', { exact: true }).fill('Uma centena equivale a dez dezenas: 10 × 10 = 100 sementes.');
    const downloadPromise = page.waitForEvent('download');
    await activity.getByRole('button', { name: 'Baixar minhas anotações', exact: true }).click();
    const download = await downloadPromise;
    const notesPath = new URL('abaco-notes.md', output);
    await download.saveAs(fileURLToPath(notesPath));
    assert.match(await readFile(notesPath, 'utf8'), /Uma centena equivale a dez dezenas/);
    await activity.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 85));
    await page.screenshot({ path: fileURLToPath(new URL('abaco-desktop.png', output)) });
  }
  if (lab.id === 'fund2_bio_03') {
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await activity.evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'Atividade transborda no celular.');
    await activity.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 70));
    await page.screenshot({ path: fileURLToPath(new URL('digestao-mobile.png', output)) });
    await page.setViewportSize({ width: 1280, height: 900 });
  }
  visited.push(lab.id);
  if (visited.length % 10 === 0) console.log(`Navegação e avaliação: ${visited.length}/${total}`);
}

async function verifyShard(index) {
  // Each page gets an independent local session; no real Firebase or AI calls.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  pages.push(page);
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  page.setDefaultTimeout(15_000);
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(`${origin}/simulacao`);
  // Refuse to use a configured real account or external login for this test.
  await page.getByText('Modo local ativo para testes neste clone.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await page.goto(`${origin}/simulacao`);
  for (const lab of labs.filter((_, position) => position % workers === index)) {
    await page.getByRole('button', { name: 'Abrir Navegador de 500 Labs', exact: true }).click();
    await page.getByPlaceholder('Pesquisar entre 500+ laboratórios', { exact: false }).fill(lab.id);
    await page.getByRole('button', { name: 'Abrir laboratório', exact: true }).click();
    await verifyActivity(page, lab);
  }
  for (const lab of legacyLabs.filter((_, position) => position % workers === index)) {
    await page.goto(origin + '/estudante');
    const area = areas.find(item => item.subjects.includes(lab.subjectId));
    assert.ok(area, lab.id + ': área não encontrada');
    await page.getByRole('button', { name: area.label, exact: true }).click();
    await page.getByRole('button', { name: lab.subject + ' (6 Labs)', exact: true }).click();
    const card = page.getByRole('article', { name: lab.title, exact: true });
    await card.getByRole('button', { name: 'Iniciar Laboratório Virtual', exact: false }).click();
    await verifyActivity(page, lab);
    if (lab.id === 'soft_1') {
      await page.getByRole('button', { name: 'Abrir bancada', exact: true }).click();
      assert.ok(!(await page.getByRole('region', { name: 'Laboratório: ' + lab.title, exact: true }).isVisible()));
      await page.getByRole('button', { name: 'Roteiro e avaliação', exact: true }).click();
      await page.getByRole('region', { name: 'Laboratório: ' + lab.title, exact: true }).waitFor();
      await page.screenshot({ path: fileURLToPath(new URL('comunicacao-desktop.png', output)) });
    }
  }
}

try {
  const results = await Promise.allSettled(Array.from({ length: workers }, (_, index) => verifyShard(index)));
  const failure = results.find(result => result.status === 'rejected');
  if (failure) throw failure.reason;
  assert.deepEqual([...visited].sort(), [...labs, ...legacyLabs].map(lab => lab.id).sort(), 'Nem todos os laboratórios foram visitados exatamente uma vez.');
  assert.deepEqual(pageErrors, [], 'Erros de runtime no navegador.');
  visited.sort();
  const contentHash = createHash('sha256').update(JSON.stringify(visited.map(id => [id, entries[id]]))).digest('hex');
  await writeFile(new URL(selectedIds ? 'subset-result.json' : process.argv.includes('--legacy-only') ? 'legacy-result.json' : 'result.json', output), JSON.stringify({ checkedAt: new Date().toISOString(), origin, workers, visited, contentHash, pageErrors }, null, 2));
  console.log(`Navegação real aprovada: ${visited.length} laboratórios, todos os cenários, teoria e avaliação. Evidências em ${fileURLToPath(output)}`);
} catch (error) {
  await Promise.allSettled(pages.map((page, index) => page.screenshot({ path: fileURLToPath(new URL(index ? `failure-${index}.png` : 'failure.png', output)) })));
  await writeFile(new URL('failure.json', output), JSON.stringify({ checkedAt: new Date().toISOString(), visited, error: String(error), pageErrors }, null, 2));
  throw error;
} finally {
  await browser.close();
}
