import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('../../', import.meta.url);
const pack = JSON.parse(await readFile(new URL('src/modules/core/content/legacy-hardSkills.json', root), 'utf8'));
const lesson = structuredClone(pack.hard_1);
const prefix = 'Exercício da turma de verificação: ';
for (const key of ['context', 'theory', 'workedExample', 'expectedEvidence', 'reflection']) lesson[key] = prefix + lesson[key];
lesson.investigation = lesson.investigation.map(text => prefix + text);
lesson.scenarios.forEach(scenario => { for (const key of ['situation', 'observation', 'explanation']) scenario[key] = prefix + scenario[key]; });
lesson.questions.forEach(question => { question.question = prefix + question.question; question.options.forEach(option => { option.explanation = prefix + option.explanation; }); });
const title = 'Regra de retirada — verificação do Studio';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
page.setDefaultTimeout(15_000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const output = new URL('.local/labs/browser/', root);
await mkdir(output, { recursive: true });

try {
  await page.goto('http://127.0.0.1:5175/simulacao');
  await page.getByText('Modo local ativo para testes neste clone.', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await page.goto('http://127.0.0.1:5175/simulacao');
  await page.getByRole('button', { name: /Studio/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Criar atividade no Kortex Studio' });
  await dialog.waitFor();
  await dialog.getByRole('button', { name: 'Adicionar à sessão' }).click();
  assert.ok(await dialog.isVisible(), 'Um formulário vazio não deve criar uma atividade.');
  assert.equal(await page.getByRole('region', { name: `Laboratório: ${title}` }).count(), 0);
  for (const [label, value] of [
    ['Título do laboratório', title], ['Disciplina', 'Tecnologia'], ['Tópico', 'Condições booleanas'],
    ['Objetivo de aprendizagem', 'Rastrear a decisão de retirada com autorização e idade mínima.'],
  ]) await dialog.getByLabel(label, { exact: true }).fill(value);
  await dialog.getByLabel('Tempo de estudo estimado (horas)', { exact: true }).fill('0.5');
  for (const [label, value] of [
    ['Problema contextualizado', lesson.context], ['Explicação conceitual', lesson.theory],
    ['Exemplo resolvido e explicado', lesson.workedExample], ['Critérios para uma boa resposta', lesson.expectedEvidence], ['Pergunta de reflexão', lesson.reflection],
  ]) await dialog.getByLabel(label, { exact: false }).fill(value);
  for (const [index, step] of lesson.investigation.entries()) await dialog.getByLabel(`Etapa ${index + 1} (mínimo`, { exact: false }).fill(step);
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
    await group.getByLabel(`Resposta correta da questão ${index + 1}`, { exact: true }).selectOption(String(question.options.findIndex(option => option.correct)));
  }
  await dialog.getByRole('button', { name: 'Adicionar à sessão' }).click();
  const activity = page.getByRole('region', { name: `Laboratório: ${title}`, exact: true });
  await activity.waitFor();
  assert.ok(await activity.getByText(lesson.context, { exact: true }).isVisible());
  assert.equal(await activity.locator('canvas').count(), 0);
  for (const scenario of lesson.scenarios) {
    await activity.getByRole('button', { name: scenario.label, exact: true }).click();
    await activity.getByRole('button', { name: 'Conferir observação' }).click();
    assert.ok(await activity.getByText(scenario.observation, { exact: true }).isVisible());
  }
  await activity.getByRole('button', { name: 'Compreender', exact: true }).click();
  assert.ok(await activity.getByText(lesson.theory, { exact: true }).isVisible());
  await activity.evaluate(element => window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top - 85));
  await page.screenshot({ path: fileURLToPath(new URL('studio-created.png', output)) });
  await page.getByRole('button', { name: 'Abrir Navegador de 500 Labs', exact: true }).click();
  await page.getByPlaceholder('Pesquisar entre 500+ laboratórios', { exact: false }).fill(title);
  assert.equal(await page.getByRole('button', { name: 'Em Execução', exact: true }).count(), 1, 'A atividade deve aparecer uma vez, sem duplicar o catálogo.');
  await page.getByPlaceholder('Pesquisar entre 500+ laboratórios', { exact: false }).fill('fund1_mat_01');
  assert.equal(await page.getByRole('button', { name: 'Em Execução', exact: true }).count(), 0, 'Pesquisa deve filtrar também as atividades da sessão.');
  assert.deepEqual(errors, []);
  await page.screenshot({ path: fileURLToPath(new URL('studio-search.png', output)) });
  await writeFile(new URL('studio-result.json', output), JSON.stringify({ checkedAt: new Date().toISOString(), title, created: true, duplicateEntries: false, pageErrors: errors }, null, 2));
  console.log('Studio aprovado no navegador: formulário vazio recusado, conteúdo completo exibido, catálogo sem duplicação e busca funcional.');
} finally { await browser.close(); }
