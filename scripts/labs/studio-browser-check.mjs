import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { verifyPreview } from './browser-fixture.mjs';

// Serve the local build-browser-preview.mjs artifact on this origin. Hashes reject an old build or
// another checkout before a successful QA report can be written.
const origin = 'http://127.0.0.1:5175';
const root = new URL('../../', import.meta.url);
const output = new URL('.local/labs/browser/', root);
const sourcePaths = [
  'src/modules/ux/pages/Simulacao.tsx',
  'src/modules/ux/components/labs/LabStudioBuilderModal.tsx',
  'src/modules/core/services/labStudioService.ts',
  'src/modules/core/constants/learningLevels.ts',
];
const levels = ['fundamental_1', 'fundamental_2', 'medio', 'graduacao', 'pos_graduacao', 'profissional'];
const fixtures = [
  { level: 'fundamental_1', label: 'Fundamental I', file: 'fundamental1.json', sourceId: 'fund1_mat_02',
    title: 'Trocas na balança — verificação Studio Fundamental I', subject: 'Matemática', topic: 'Igualdade e quantidades',
    objective: 'Explicar como acrescentar ou retirar a mesma quantidade dos dois pratos conserva a igualdade.' },
  { level: 'pos_graduacao', label: 'Pós-Graduação', file: 'postgraduate-ai.json', sourceId: 'pos_ia_03',
    title: 'Atenção causal — verificação Studio Pós-Graduação', subject: 'Inteligência Artificial Avançada', topic: 'Máscara causal e atenção',
    objective: 'Comparar agregações por atenção com e sem máscara causal e justificar a influência dos tokens permitidos.' },
  { level: 'profissional', label: 'Formação Profissional', file: 'legacy-hardSkills.json', sourceId: 'hard_1',
    title: 'Regra de retirada — verificação Studio Profissional', subject: 'Tecnologia', topic: 'Condições booleanas',
    objective: 'Rastrear a decisão de retirada com autorização e idade mínima, justificando a condição booleana.' },
];
const hash = source => createHash('sha256').update(source).digest('hex');
const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sourceHashes = {};
const errors = [];
const blockedOrigins = new Set();
const checked = [];
await mkdir(output, { recursive: true });
await writeFile(new URL('studio-result.json', output), JSON.stringify({ status: 'running', checkedAt: new Date().toISOString(), origin }, null, 2));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
await context.route('**/*', route => {
  const requested = new URL(route.request().url());
  if (requested.origin === origin) return route.continue();
  blockedOrigins.add(requested.origin);
  return route.abort();
});
const page = await context.newPage();
page.setDefaultTimeout(15_000);
page.on('pageerror', error => errors.push(error.message));
const catalog = page.getByRole('region', { name: 'Catálogo de laboratórios', exact: true });

async function verifyServedSources() {
  const preview = await verifyPreview(page.request);
  for (const path of sourcePaths) {
    const disk = await readFile(new URL(path, root), 'utf8');
    assert.equal(hash(disk), preview.sources[path], `${path}: fonte mudou após a compilação.`);
    sourceHashes[path] = hash(disk);
  }
}

async function chooseLevel(fixture) {
  const name = new RegExp(`^${escapeRegExp(fixture.label)} \\(\\d+\\)$`);
  const navigation = page.getByRole('navigation', { name: 'Níveis de aprendizagem', exact: true });
  await navigation.getByRole('button', { name }).click();
  await page.waitForURL(url => url.searchParams.get('level') === fixture.level && !url.searchParams.has('lab'));
  await navigation.getByRole('button', { name, pressed: true }).waitFor();
  await catalog.getByLabel('Disciplina', { exact: true }).selectOption('');
  await catalog.getByLabel('Buscar laboratórios', { exact: true }).fill('');
}

async function fillLesson(dialog, fixture) {
  const pack = JSON.parse(await readFile(new URL(`src/modules/core/content/${fixture.file}`, root), 'utf8'));
  const lesson = structuredClone(pack[fixture.sourceId]);
  assert.equal(lesson.investigation.length, 3, `${fixture.sourceId}: o editor oferece três etapas.`);
  assert.equal(lesson.scenarios.length, 3);
  assert.equal(lesson.questions.length, 2);
  // Local QA fixtures keep each source lesson's level and avoid identical
  // production text triggering the Studio's duplicate-content guard.
  const prefix = `Exercício local de verificação (${fixture.label}): `;
  for (const key of ['context', 'theory', 'workedExample', 'expectedEvidence', 'reflection']) lesson[key] = prefix + lesson[key];
  lesson.investigation = lesson.investigation.map(text => prefix + text);
  lesson.scenarios.forEach(scenario => {
    for (const key of ['situation', 'observation', 'explanation']) scenario[key] = prefix + scenario[key];
  });
  lesson.questions.forEach(question => {
    question.question = prefix + question.question;
    question.options.forEach(option => { option.explanation = prefix + option.explanation; });
  });
  for (const [label, value] of [
    ['Título do laboratório', fixture.title], ['Disciplina', fixture.subject], ['Tópico', fixture.topic],
    ['Objetivo de aprendizagem', fixture.objective],
  ]) await dialog.getByLabel(label, { exact: true }).fill(value);
  await dialog.getByLabel('Tempo de estudo estimado (horas)', { exact: true }).fill('0.5');
  for (const [label, value] of [
    ['Problema contextualizado', lesson.context], ['Explicação conceitual', lesson.theory],
    ['Exemplo resolvido e explicado', lesson.workedExample], ['Critérios para uma boa resposta', lesson.expectedEvidence],
    ['Pergunta de reflexão', lesson.reflection],
  ]) await dialog.getByLabel(label, { exact: false }).fill(value);
  for (const [index, step] of lesson.investigation.entries()) {
    await dialog.getByLabel(`Etapa ${index + 1} (mínimo`, { exact: false }).fill(step);
  }
  for (const [index, scenario] of lesson.scenarios.entries()) {
    const group = dialog.getByRole('group', { name: `Cenário ${index + 1}`, exact: true });
    for (const [label, value] of [
      ['Nome do cenário', scenario.label], ['Situação e condições do caso', scenario.situation],
      ['Observação fornecida ao aluno', scenario.observation], ['Explicação da observação', scenario.explanation],
    ]) await group.getByLabel(label, { exact: false }).fill(value);
  }
  for (const [index, question] of lesson.questions.entries()) {
    const group = dialog.getByRole('group', { name: `Questão ${index + 1}`, exact: true });
    await group.getByLabel('Enunciado da questão', { exact: false }).fill(question.question);
    for (const [optionIndex, option] of question.options.entries()) {
      await group.getByLabel(new RegExp(`^Alternativa ${optionIndex + 1} `)).fill(option.text);
      await group.getByLabel(`Feedback da alternativa ${optionIndex + 1}`, { exact: false }).fill(option.explanation);
    }
    await group.getByLabel(`Resposta correta da questão ${index + 1}`, { exact: true })
      .selectOption(String(question.options.findIndex(option => option.correct)));
  }
  return lesson;
}

async function verifyLesson(fixture, lesson, id) {
  const activity = page.getByRole('region', { name: `Laboratório: ${fixture.title}`, exact: true });
  await activity.waitFor();
  assert.equal(await activity.count(), 1, 'Uma criação deve abrir exatamente um roteiro.');
  await activity.getByText(`${fixture.label} · ${fixture.subject} · Exploração de cenários`, { exact: true }).waitFor();
  await page.getByText(`${fixture.label} › ${fixture.subject} › ${fixture.title}`, { exact: true }).waitFor();
  await activity.getByText(lesson.context, { exact: true }).waitFor();
  for (const step of lesson.investigation) await activity.getByText(step, { exact: true }).waitFor();
  await activity.getByText(lesson.reflection, { exact: true }).waitFor();
  assert.equal(await activity.locator('canvas').count(), 0);
  for (const scenario of lesson.scenarios) {
    await activity.getByRole('button', { name: scenario.label, exact: true }).click();
    await activity.getByText(scenario.situation, { exact: true }).waitFor();
    await activity.getByRole('button', { name: 'Conferir observação', exact: true }).click();
    await activity.getByText(scenario.observation, { exact: true }).waitFor();
    await activity.getByText(scenario.explanation, { exact: true }).waitFor();
  }
  await activity.getByRole('button', { name: 'Conferir critérios de uma boa resposta', exact: true }).click();
  await activity.getByText(lesson.expectedEvidence, { exact: true }).waitFor();
  await activity.getByRole('button', { name: 'Compreender', exact: true }).click();
  await activity.getByText(lesson.theory, { exact: true }).waitFor();
  await activity.getByText(lesson.workedExample, { exact: true }).waitFor();
  await activity.getByRole('button', { name: 'Avaliar', exact: true }).click();
  for (const question of lesson.questions) {
    const group = activity.getByRole('group').filter({ has: page.getByText(question.question, { exact: false }) });
    await group.getByLabel(question.options.find(option => option.correct).text, { exact: true }).check();
  }
  await activity.getByRole('button', { name: 'Corrigir respostas', exact: true }).click();
  await activity.getByRole('status').getByText('Você acertou 2 de 2 questões.', { exact: true }).waitFor();
  for (const question of lesson.questions) {
    for (const option of question.options) await activity.getByText(option.explanation, { exact: false }).waitFor();
  }
  await activity.getByRole('button', { name: 'Investigar', exact: true }).click();
  const note = `Verificação local: ${fixture.objective}`;
  await activity.getByLabel('Minha resposta com evidências dos cenários', { exact: true }).fill(note);
  const downloaded = page.waitForEvent('download');
  await activity.getByRole('button', { name: 'Baixar minhas anotações', exact: true }).click();
  const download = await downloaded;
  const notesPath = new URL(`studio-${fixture.level}-notes.md`, output);
  await download.saveAs(fileURLToPath(notesPath));
  const notes = await readFile(notesPath, 'utf8');
  for (const expected of [`# ${fixture.title}`, `Laboratório: ${id}`, `Nível: ${fixture.label}`, note, 'Avaliação: 2 de 2 questões corretas.']) {
    assert.ok(notes.includes(expected), `${fixture.level}: anotações devem conter ${expected}`);
  }
  await activity.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 85));
  await page.screenshot({ path: fileURLToPath(new URL(`studio-${fixture.level}-created.png`, output)) });
}

async function verifySearchAndReopen(fixture, id) {
  await catalog.getByLabel('Buscar laboratórios', { exact: true }).fill(fixture.title.toLocaleUpperCase('pt-BR'));
  const card = catalog.getByRole('article', { name: fixture.title, exact: true });
  await card.waitFor();
  assert.equal(await card.count(), 1, 'A atividade deve aparecer uma vez no nível correto.');
  assert.equal(await catalog.getByRole('button', { name: 'Abrir laboratório', exact: true }).count(), 1);
  await card.getByText(`${fixture.label} · ${fixture.subject}`, { exact: true }).waitFor();
  await catalog.getByRole('status').getByText(`1 atividades em ${fixture.label}.`, { exact: true }).waitFor();
  const other = fixtures.find(candidate => candidate.level !== fixture.level);
  await chooseLevel(other);
  await catalog.getByLabel('Buscar laboratórios', { exact: true }).fill(fixture.title);
  await catalog.getByRole('status').getByText(`0 atividades em ${other.label}.`, { exact: true }).waitFor();
  assert.equal(await catalog.getByRole('article', { name: fixture.title, exact: true }).count(), 0,
    'Atividades criadas não devem vazar para outro nível.');
  await chooseLevel(fixture);
  for (let attempt = 0; attempt < 2; attempt++) {
    await catalog.getByLabel('Buscar laboratórios', { exact: true }).fill(fixture.title);
    const expand = catalog.getByRole('button', { name: 'Explorar atividades deste nível', exact: true });
    if (await expand.isVisible()) await expand.click();
    await card.waitFor();
    assert.equal(await card.count(), 1, 'Reabrir uma atividade não deve duplicar seu cartão.');
    await card.getByRole('button', { name: 'Abrir laboratório', exact: true }).click();
    await page.waitForURL(url => url.searchParams.get('lab') === id && url.searchParams.get('level') === fixture.level);
    const activity = page.getByRole('region', { name: `Laboratório: ${fixture.title}`, exact: true });
    await activity.waitFor();
    assert.equal(await activity.count(), 1);
    await activity.getByText(`${fixture.label} · ${fixture.subject} · Exploração de cenários`, { exact: true }).waitFor();
  }
  await catalog.getByLabel('Buscar laboratórios', { exact: true }).fill('fund1_mat_01');
  assert.equal(await catalog.getByRole('article', { name: fixture.title, exact: true }).count(), 0,
    'A busca deve filtrar também atividades criadas na sessão.');
}

try {
  await verifyServedSources();
  await page.goto(`${origin}/simulacao?level=fundamental_1`);
  await page.getByText('Modo local ativo para testes neste clone.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await page.goto(`${origin}/simulacao?level=fundamental_1`);
  await page.getByRole('heading', { name: 'Laboratórios por nível de aprendizagem', exact: true }).waitFor();
  for (const [index, fixture] of fixtures.entries()) {
    await chooseLevel(fixture);
    await catalog.getByRole('button', { name: 'Criar atividade', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Criar atividade no Kortex Studio', exact: true });
    await dialog.waitFor();
    const levelSelect = dialog.getByLabel('Nível acadêmico', { exact: true });
    assert.equal(await levelSelect.inputValue(), fixture.level, `${fixture.label}: Studio deve herdar o nível ativo.`);
    assert.deepEqual((await levelSelect.locator('option').evaluateAll(options => options.map(option => option.value))).sort(), [...levels].sort());
    if (index === 0) {
      await dialog.getByRole('button', { name: 'Adicionar à sessão', exact: true }).click();
      assert.ok(await dialog.isVisible(), 'Um formulário vazio não deve criar uma atividade.');
      assert.equal(await page.getByRole('region', { name: `Laboratório: ${fixture.title}`, exact: true }).count(), 0);
    }
    const lesson = await fillLesson(dialog, fixture);
    // Do not select a level: creation must preserve the initial selection.
    assert.equal(await levelSelect.inputValue(), fixture.level);
    await dialog.getByRole('button', { name: 'Adicionar à sessão', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.waitForURL(url => /^custom_/.test(url.searchParams.get('lab') ?? '') && url.searchParams.get('level') === fixture.level);
    const id = new URL(page.url()).searchParams.get('lab');
    assert.ok(!checked.some(item => item.id === id), 'Criações distintas precisam de IDs distintos.');
    await verifyLesson(fixture, lesson, id);
    await verifySearchAndReopen(fixture, id);
    checked.push({ id, title: fixture.title, level: fixture.level, initialLevelInherited: true,
      scenarios: lesson.scenarios.length, questions: lesson.questions.length, noteLevelVerified: true,
      isolatedByLevel: true, duplicateEntries: false, reopenedTwice: true });
    console.log(`Studio verificado: ${fixture.label}, três cenários, duas questões, nível exportado e reabertura sem duplicação.`);
  }
  for (const path of sourcePaths) {
    assert.equal(hash(await readFile(new URL(path, root), 'utf8')), sourceHashes[path], `${path}: fonte mudou durante o QA; execute novamente.`);
  }
  assert.deepEqual(errors, []);
  await page.screenshot({ path: fileURLToPath(new URL('studio-search.png', output)) });
  await writeFile(new URL('studio-result.json', output), JSON.stringify({ status: 'passed', checkedAt: new Date().toISOString(),
    origin, sourceHashes, cases: checked, externalOriginsBlocked: [...blockedOrigins].sort(), pageErrors: errors }, null, 2));
  console.log('Studio aprovado na UI atual: login local, seis níveis, três criações completas e catálogo sem duplicação.');
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('studio-failure.png', output)) }).catch(() => {});
  await writeFile(new URL('studio-result.json', output), JSON.stringify({ status: 'failed', checkedAt: new Date().toISOString(),
    origin, sourceHashes, cases: checked, error: error instanceof Error ? error.message : String(error),
    externalOriginsBlocked: [...blockedOrigins].sort(), pageErrors: errors }, null, 2));
  throw error;
} finally {
  await browser.close();
}
