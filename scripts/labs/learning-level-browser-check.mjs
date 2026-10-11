import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { root, origin, levels, readCatalog, verifyPreview } from './browser-fixture.mjs';

const catalog = await readCatalog();
const output = new URL('.local/labs/browser/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
const page = await context.newPage();
page.setDefaultTimeout(15_000);
const errors = [];
const checks = [];
page.on('pageerror', error => errors.push(error.message));
const sessionKey = 'edu-interact-local-auth-session';
const catalogRegion = page.getByRole('region', { name: 'Catálogo de laboratórios', exact: true });

async function profile(gradeLevel, role = 'estudante') {
  await page.evaluate(({ key, gradeLevel, role }) => {
    const session = JSON.parse(localStorage.getItem(key));
    session.userData.gradeLevel = gradeLevel;
    session.userData.role = role;
    localStorage.setItem(key, JSON.stringify(session));
  }, { key: sessionKey, gradeLevel, role });
}
async function ids(locator) {
  return locator.locator('[data-lab-id]').evaluateAll(cards => cards.map(card => ({
    id: card.dataset.labId, level: card.dataset.academicLevel, title: card.getAttribute('aria-label'),
  })));
}
async function verifyPartition(route) {
  const visited = [];
  await page.goto(`${origin}/${route}`);
  for (const level of levels) {
    if (route === 'estudante') {
      await page.getByRole('combobox', { name: 'Nível de aprendizado', exact: true }).selectOption(level.id);
      await page.waitForURL(url => url.searchParams.get('level') === level.id);
      await page.getByRole('status').getByText(`${level.label}: ${level.count} laboratórios`, { exact: false }).waitFor();
    }
    else {
      await page.getByRole('navigation', { name: 'Níveis de aprendizagem', exact: true })
        .getByRole('button', { name: `${level.label} (${level.count})`, exact: true }).click();
      await catalogRegion.getByLabel('Buscar laboratórios', { exact: true }).fill('');
    }
    const subjectSelect = page.getByRole('combobox', { name: 'Disciplina', exact: true });
    const subjects = await subjectSelect.locator('option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
    const expected = catalog.filter(lab => lab.academicLevel === level.id);
    assert.deepEqual([...subjects].sort(), [...new Set(expected.map(lab => lab.subject))].sort());
    const visitedAtLevel = [];
    for (const subject of subjects) {
      await subjectSelect.selectOption(subject);
      const matches = expected.filter(lab => lab.subject === subject);
      await page.locator(`[data-lab-id="${matches[0].id}"]`).waitFor();
      const cards = await ids(route === 'estudante' ? page : catalogRegion);
      assert.deepEqual(cards.map(card => card.id).sort(), matches.map(lab => lab.id).sort(), `${route}: ${level.id}/${subject}`);
      for (const card of cards) {
        assert.equal(card.level, level.id);
        assert.equal(card.title, catalog.find(lab => lab.id === card.id).title);
      }
      visitedAtLevel.push(...cards.map(card => card.id));
    }
    assert.equal(visitedAtLevel.length, level.count);
    visited.push(...visitedAtLevel);
    if (level.id === 'fundamental_1' || level.id === 'pos_graduacao') {
      await page.screenshot({ path: fileURLToPath(new URL(`${route}-${level.id}-catalog.png`, output)), fullPage: false, animations: 'disabled' });
    }
  }
  assert.equal(visited.length, 582);
  assert.equal(new Set(visited).size, 582);
  checks.push({ check: `${route}: filtros por nível e disciplina`, verifiedIds: visited.sort() });
}
try {
  await verifyPreview(page.request);
  await page.goto(`${origin}/estudante`);
  await page.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await verifyPartition('estudante');
  await verifyPartition('simulacao');

  for (const level of levels) {
    await profile(level.id);
    await page.goto(`${origin}/estudante`);
    assert.equal(await page.getByRole('combobox', { name: 'Nível de aprendizado', exact: true }).inputValue(), level.id);
    await page.goto(`${origin}/simulacao`);
    await page.getByRole('navigation', { name: 'Níveis de aprendizagem', exact: true })
      .getByRole('button', { name: `${level.label} (${level.count})`, exact: true, pressed: true }).waitFor();
  }
  checks.push({ check: 'nível inicial do perfil', levels: levels.map(level => level.id) });

  await page.goto(`${origin}/simulacao?lab=math_3&level=fundamental_1`);
  await page.getByRole('region', { name: 'Laboratório: Funções Trigonométricas', exact: true }).waitFor();
  assert.equal(await catalogRegion.getByLabel('Disciplina', { exact: true }).inputValue(), 'Matemática');
  await page.getByRole('navigation', { name: 'Níveis de aprendizagem', exact: true })
    .getByRole('button', { name: 'Ensino Médio (134)', exact: true, pressed: true }).waitFor();
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog');
  await palette.getByPlaceholder('Buscar laboratórios, turmas, páginas ou comandos...', { exact: false }).fill('port_3');
  const portugueseLab = catalog.find(lab => lab.id === 'port_3');
  await palette.getByText(portugueseLab.title, { exact: true }).click();
  await page.waitForURL(url => url.searchParams.get('lab') === 'port_3');
  await page.getByRole('region', { name: `Laboratório: ${portugueseLab.title}`, exact: true }).waitFor();
  assert.equal(await catalogRegion.getByLabel('Disciplina', { exact: true }).inputValue(), portugueseLab.subject);
  checks.push({ check: 'link conflitante e busca global reconciliam nível, ID e disciplina', ids: ['math_3', 'port_3'] });

  await page.goto(`${origin}/simulacao?lab=fis_1&level=pos_graduacao`);
  await page.getByRole('region', { name: 'Laboratório: Cinemática do Pêndulo', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Abrir bancada', exact: true }).click();
  await page.getByRole('heading', { name: 'Bancada: Cinemática do Pêndulo', exact: true }).waitFor();
  assert.equal(await page.getByRole('navigation', { name: 'Níveis de aprendizagem', exact: true }).count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Refração', exact: true }).count(), 0);
  assert.equal(new URL(page.url()).searchParams.get('lab'), 'fis_1');
  await page.getByRole('button', { name: 'Roteiro e avaliação', exact: true }).click();
  checks.push({ check: 'bancada de Física preserva o ID', id: 'fis_1' });

  for (const [role, dashboard] of [['estudante', '/estudante'], ['professor', '/professor'], ['coordenador', '/coordenacao'], ['admin', '/admin']]) {
    await profile('profissional', role);
    await page.goto(`${origin}/simulacao?lab=hard_1&level=medio`);
    await page.getByRole('region', { name: `Laboratório: ${catalog.find(lab => lab.id === 'hard_1').title}`, exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Meu aprendizado', exact: true }).getAttribute('href'), dashboard);
    assert.equal(await page.getByText('Acesso Restrito', { exact: true }).count(), 0);
  }
  checks.push({ check: 'legado profissional abre para os quatro perfis e retorna ao painel correto' });

  await profile('graduacao');
  await page.goto(`${origin}/simulacao?level=nivel-inexistente&lab=id-inexistente`);
  await page.getByRole('alert').getByText('Laboratório não encontrado.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('region', { name: /^Laboratório:/ }).count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/simulacao?level=fundamental_1`);
  await catalogRegion.waitFor();
  assert.ok(await catalogRegion.evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'Catálogo transborda no celular.');
  await page.screenshot({ path: fileURLToPath(new URL('learning-level-mobile.png', output)), animations: 'disabled' });
  checks.push({ check: 'ID inválido não abre outro lab; catálogo funciona no celular' });
  assert.deepEqual(errors, []);
  await verifyPreview(page.request);
  await writeFile(new URL('learning-level-result.json', output), JSON.stringify({ status: 'passed', checkedAt: new Date().toISOString(), checks, pageErrors: errors }, null, 2));
  console.log('Níveis aprovados: 582 IDs em ambos os catálogos, seis perfis de nível, busca, links, quatro cargos e bancada fixa.');
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('learning-level-failure.png', output)) }).catch(() => {});
  await writeFile(new URL('learning-level-result.json', output), JSON.stringify({ status: 'failed', checks, error: String(error), pageErrors: errors }, null, 2));
  throw error;
} finally { await browser.close(); }
