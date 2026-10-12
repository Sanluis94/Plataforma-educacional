import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { root, origin, verifyPreview, isolateBrowserData } from './browser-fixture.mjs';

// Run against the identified local preview after build-browser-preview.mjs.
// All accounts and records below are fictitious; no private ETL export is read.
const output = new URL('.local/labs/navigation-browser/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [], runtimeErrors = [], blockedOrigins = new Set();
const roleHomes = { estudante: '/estudante', professor: '/professor', coordenador: '/coordenacao', admin: '/admin' };
const panelNames = { estudante: 'Meu aprendizado', professor: 'Minhas turmas', coordenador: 'Coordenação', admin: 'Administração' };
const allowed = {
  estudante: ['/', '/estudante', '/simulacao', '/enem'],
  professor: ['/', '/professor', '/simulacao', '/enem'],
  coordenador: ['/', '/coordenacao', '/professor', '/simulacao', '/enem'],
  admin: ['/', '/admin', '/coordenacao', '/professor', '/estudante', '/simulacao', '/enem'],
};
const selectedScenario = process.argv.find(argument => argument.startsWith('--scenario='))?.slice(11);
const skipEnem = process.argv.includes('--skip-enem');
let build;

async function seed(context) {
  await isolateBrowserData(context, blocked => blockedOrigins.add(blocked));
  await context.addInitScript(() => {
    if (sessionStorage.getItem('qa-navigation-seeded')) return;
    const db = JSON.parse(localStorage.getItem('edu_local_db'));
    db.classes = ['a', 'b'].map((suffix, index) => ({
      id: `qa-class-${suffix}`, name: `Turma fictícia ${suffix.toUpperCase()}`, code: `QA000${index + 1}`,
      professorId: 'qa-professor', professorName: 'Perfil de teste professor', studentIds: ['qa-estudante'],
      studentsCount: 1, gradeLevel: index ? 'graduacao' : 'medio', createdAt: '2026-10-11T00:00:00Z', updatedAt: '2026-10-11T00:00:00Z',
    }));
    db.activities = [];
    db.learningEvents = [];
    db.progress['qa-estudante'] = { level: 1, xp: 0, coins: 0, completedModules: [], purchasedItems: [], updatedAt: '2026-10-11T00:00:00Z' };
    localStorage.setItem('edu_local_db', JSON.stringify(db));
    localStorage.setItem('edu_local_lesson_plans', JSON.stringify([{
      id: 'qa-plan-a', turmaId: 'qa-class-a', professorId: 'qa-professor', periodo: '1º Bimestre', ordemSemana: 1,
      topico: 'Aula fictícia de funções', metodologia: 'Compare os cenários e explique as relações.', laboratorioAssociadoId: 'math_1',
      status: 'planejada', criadoEm: '2026-10-11T00:00:00Z',
    }]));
    sessionStorage.setItem('qa-navigation-seeded', 'true');
  });
}

async function loginDialog(page, role) {
  const dialog = page.getByRole('dialog', { name: 'Entrar na plataforma', exact: true });
  await dialog.getByText('Modo local ativo para testes neste clone.', { exact: true }).waitFor();
  await dialog.getByRole('button', { name: new RegExp(`${role === 'coordenador' ? 'Coordenação' : role}$`, 'i') }).click();
  await dialog.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
}

async function login(page, role) {
  await page.goto(`${origin}/`);
  await page.locator('header.app-header').getByRole('button', { name: 'Entrar', exact: true }).click();
  await loginDialog(page, role);
  await page.waitForURL(url => url.pathname === roleHomes[role]);
  await page.locator('main h1').first().waitFor();
}

async function menu(page) {
  const trigger = page.getByRole('button', { name: 'Abrir menu', exact: true });
  await trigger.click();
  const close = page.getByRole('button', { name: 'Fechar menu', exact: true });
  assert.equal(await close.getAttribute('aria-expanded'), 'true');
  assert.equal(await close.getAttribute('aria-controls'), 'navigation-menu');
  const navigation = page.getByRole('navigation', { name: 'Menu de páginas', exact: true });
  await navigation.waitFor();
  return navigation;
}

async function clickMenu(page, name, pathname) {
  const navigation = await menu(page);
  await navigation.getByRole('link', { name, exact: true }).click();
  await page.waitForURL(url => url.pathname === pathname);
  const headings = { '/': /^Olá,/, '/professor': 'Painel do Professor', '/estudante': 'Portal do Estudante', '/simulacao': 'Laboratórios por nível de aprendizagem', '/enem': 'Treino para o ENEM', '/coordenacao': 'Escola de demonstração', '/admin': /Painel Administrativo/ };
  await page.locator('main').getByRole('heading', { name: headings[pathname], level: 1 }).waitFor();
  assert.equal(await page.getByRole('navigation', { name: 'Menu de páginas', exact: true }).count(), 0, 'O menu deve fechar após navegar.');
}

async function checkAllowedLinks(page, role, scope) {
  const links = await scope.locator('a[href]').evaluateAll(elements => elements.map(element => ({ href: element.getAttribute('href'), name: element.getAttribute('aria-label') || element.textContent?.trim() })));
  assert.ok(links.length, 'Nenhum caminho de navegação disponível.');
  for (const link of links) {
    assert.ok(link.name, `Link sem nome acessível: ${link.href}`);
    if (!link.href.startsWith('/') || link.href.startsWith('//')) continue;
    const path = new URL(link.href, origin).pathname;
    assert.ok(allowed[role].includes(path), `${role}: destino proibido ${link.href}`);
  }
}

async function checkCurrentMenu(page, role) {
  const navigation = await menu(page);
  await checkAllowedLinks(page, role, navigation);
  const current = navigation.locator('[aria-current="page"]');
  assert.equal(await current.count(), 1, 'O menu deve indicar exatamente a página atual.');
  assert.equal(new URL(await current.getAttribute('href'), origin).pathname, new URL(page.url()).pathname);
  await page.keyboard.press('Escape');
  assert.equal(await navigation.count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Abrir menu', exact: true }).evaluate(element => element === document.activeElement), true, 'Escape deve devolver foco ao botão do menu.');
}

async function checkOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scroll: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(dimensions.scroll <= dimensions.width + 1 && dimensions.body <= dimensions.width + 1, `${label}: transbordamento horizontal ${JSON.stringify(dimensions)}`);
}

async function scenario(name, role, callback, width = 1280) {
  if (selectedScenario && !name.includes(selectedScenario)) return;
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, serviceWorkers: 'block' });
  await seed(context);
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  page.setDefaultNavigationTimeout(30_000);
  const localErrors = [];
  page.on('pageerror', error => { localErrors.push(error.message); runtimeErrors.push({ scenario: name, error: error.message }); });
  const startedAt = Date.now();
  try {
    if (role) await login(page, role);
    await callback(page);
    assert.deepEqual(localErrors, [], 'Erro de execução no navegador.');
    checks.push({ name, status: 'passed', durationMs: Date.now() - startedAt, url: page.url() });
    console.log(`OK: ${name}`);
  } catch (error) {
    const screenshot = `${name.replace(/[^a-z0-9-]/gi, '-')}.png`;
    await page.screenshot({ path: fileURLToPath(new URL(screenshot, output)), fullPage: false, animations: 'disabled' }).catch(() => {});
    checks.push({ name, status: 'failed', durationMs: Date.now() - startedAt, url: page.url(), error: String(error), screenshot });
    console.error(`FALHOU: ${name}: ${String(error)}`);
  } finally { await context.close(); }
}

async function externalReturn(page, linkName, navigationName, returnName) {
  const original = new URL(page.url()).pathname + new URL(page.url()).search;
  await page.locator('main').getByRole('link', { name: linkName }).first().click();
  await page.getByRole('navigation', { name: navigationName, exact: true }).getByRole('link', { name: returnName, exact: true }).click();
  await page.waitForURL(url => url.pathname + url.search === original);
  return original;
}

try {
  const preflight = await browser.newPage();
  build = await verifyPreview(preflight.request);
  await preflight.close();

  for (const role of Object.keys(roleHomes)) {
    await scenario(`perfil-${role}-home-menu`, role, async page => {
      await clickMenu(page, 'Início', '/');
      await checkAllowedLinks(page, role, page.locator('main'));
      await checkCurrentMenu(page, role);
      await page.getByRole('link', { name: 'Ir para meu painel principal', exact: true }).click();
      await page.waitForURL(url => url.pathname === roleHomes[role]);
      await checkCurrentMenu(page, role);
      await clickMenu(page, 'Laboratórios', '/simulacao');
      await checkCurrentMenu(page, role);
      await clickMenu(page, 'Simulado ENEM', '/enem');
      await checkCurrentMenu(page, role);
      await clickMenu(page, panelNames[role], roleHomes[role]);
    });
  }

  await scenario('login-deep-link-busca-preservada', null, async page => {
    await page.goto(`${origin}/simulacao?lab=fund1_mat_01&level=fundamental_1&subject=Matem%C3%A1tica`);
    await loginDialog(page, 'estudante');
    await page.waitForURL(url => url.pathname === '/simulacao' && url.searchParams.get('lab') === 'fund1_mat_01' && url.searchParams.get('subject') === 'Matemática');
    await page.getByRole('region', { name: 'Laboratório: Ábaco e Sistema de Numeração Decimal', exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('level'), 'fundamental_1');
  });

  await scenario('login-cancelamento-sem-reabrir', null, async page => {
    await page.goto(`${origin}/simulacao?lab=math_1`);
    const dialog = page.getByRole('dialog', { name: 'Entrar na plataforma', exact: true });
    await dialog.getByRole('button', { name: 'Fechar acesso', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: /Ativar tema/ }).click();
    assert.equal(await dialog.count(), 0);
    await page.reload();
    await page.locator('main h1').first().waitFor();
    assert.equal(await dialog.count(), 0, 'O login cancelado não deve reabrir na página inicial.');
  });

  await scenario('login-perfil-incompativel-fallback', null, async page => {
    await page.goto(`${origin}/professor?tab=reports&class=qa-class-b`);
    await loginDialog(page, 'estudante');
    await page.waitForURL(url => url.pathname === '/estudante');
    assert.equal(await page.getByRole('heading', { name: 'Acesso Restrito', exact: true }).count(), 0);
    await page.goto(`${origin}/admin`);
    await page.getByRole('heading', { name: 'Acesso Restrito', exact: true }).waitFor();
    await page.getByRole('link', { name: /Ir para Meu Aprendizado/i }).click();
    await page.waitForURL(url => url.pathname === '/estudante');
  });

  await scenario('estudante-abas-turma-voltar-recarregar', 'estudante', async page => {
    const turma = page.getByRole('combobox', { name: 'Turma selecionada', exact: true });
    await turma.selectOption('qa-class-b');
    await page.waitForURL(url => url.searchParams.get('class') === 'qa-class-b');
    await page.getByRole('button', { name: /Plano de Aulas/ }).click();
    await page.waitForURL(url => url.searchParams.get('tab') === 'lesson_plans');
    const current = page.url();
    await page.reload();
    await page.getByText('📅 Cronograma & Plano de Aulas da Turma', { exact: true }).waitFor();
    assert.equal(await turma.inputValue(), 'qa-class-b');
    assert.equal(page.url(), current);
    await page.getByRole('button', { name: /Materiais & Downloads/ }).click();
    await page.goBack();
    await page.waitForURL(url => url.searchParams.get('tab') === 'lesson_plans');
    assert.equal(await turma.inputValue(), 'qa-class-b');
    await page.goto(`${origin}/estudante?tab=materials&class=turma-inexistente`);
    await page.waitForURL(url => url.searchParams.get('class') === 'qa-class-a');
    assert.equal(await turma.inputValue(), 'qa-class-a');
    await page.goto(`${origin}/estudante`);
    await page.getByRole('button', { name: /Plano de Aulas/ }).click();
    await page.goBack();
    await page.getByRole('combobox', { name: 'Nível de aprendizado', exact: true }).waitFor();
  });

  await scenario('estudante-matricula-invalida-retorno-laboratorio', 'estudante', async page => {
    await page.getByRole('button', { name: /Minha Turma & Avisos/ }).click();
    const code = page.getByRole('textbox', { name: 'Código da turma', exact: true });
    await code.fill('INVALIDO');
    await page.getByRole('button', { name: 'Entrar na Turma', exact: true }).click();
    await page.getByRole('alert').getByText(/Não foi possível entrar na turma/).waitFor();
    assert.equal(await code.inputValue(), 'INVALIDO');
    assert.equal(await page.getByText(/Matrícula realizada com sucesso/).count(), 0);
    await page.getByRole('button', { name: /Plano de Aulas/ }).click();
    await page.getByRole('button', { name: /Abrir Laboratório da Aula/ }).click();
    await page.getByRole('region', { name: 'Laboratório: Função de 1º Grau', exact: true }).waitFor();
    await page.getByRole('button', { name: /Voltar ao Plano de Aulas/ }).click();
    await page.getByText('Aula fictícia de funções', { exact: true }).waitFor();
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'lesson_plans');
    assert.equal(new URL(page.url()).searchParams.get('class'), 'qa-class-a');
  });

  await scenario('professor-bimestre-relatorio-refresh-retornos', 'professor', async page => {
    await page.getByRole('combobox', { name: 'Turma selecionada', exact: true }).selectOption('qa-class-b');
    await page.getByRole('button', { name: /Plano de Aulas Bimestral/ }).click();
    await page.getByRole('button', { name: '3º Bimestre', exact: true }).click();
    await page.getByRole('combobox', { name: 'Nível dos laboratórios', exact: true }).selectOption('pos_graduacao');
    const planner = page.url();
    await page.reload();
    await page.getByText(/Cronograma de Aulas — 3º Bimestre/).waitFor();
    assert.equal(page.url(), planner);
    assert.equal(await page.getByRole('combobox', { name: 'Turma selecionada', exact: true }).inputValue(), 'qa-class-b');
    assert.equal(await page.getByRole('combobox', { name: 'Nível dos laboratórios', exact: true }).inputValue(), 'pos_graduacao');
    await externalReturn(page, /Catálogo de Laboratórios/, 'Navegação dos laboratórios', 'Voltar à tela anterior');
    await externalReturn(page, /Simulado ENEM/, 'Navegação do simulado', 'Voltar');
    await page.getByRole('button', { name: /Relatórios da Turma/ }).click();
    await page.getByRole('region', { name: 'Acompanhamento da turma Turma fictícia B', exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'Turma selecionada', exact: true }).selectOption('qa-class-a');
    await page.getByRole('region', { name: 'Acompanhamento da turma Turma fictícia A', exact: true }).waitFor();
    await page.evaluate(() => {
      const db = JSON.parse(localStorage.getItem('edu_local_db'));
      db.classes.find(turma => turma.id === 'qa-class-a').name = 'Turma fictícia A atualizada';
      localStorage.setItem('edu_local_db', JSON.stringify(db));
    });
    await page.getByRole('button', { name: 'Atualizar', exact: true }).click();
    await page.getByRole('region', { name: 'Acompanhamento da turma Turma fictícia A atualizada', exact: true }).waitFor();
  });

  if (!skipEnem) await scenario('enem-inicio-retomada-entrega-resultado', 'estudante', async page => {
    await page.getByRole('button', { name: /Plano de Aulas/ }).click();
    const previous = new URL(page.url()).pathname + new URL(page.url()).search;
    await page.locator('main').getByRole('link', { name: /Simulado ENEM/ }).click();
    await page.getByRole('heading', { name: 'Antes de começar', exact: true }).waitFor();
    assert.equal(await page.getByRole('timer').count(), 0);
    await page.getByRole('button', { name: 'Começar simulado', exact: true }).click();
    await page.getByRole('radio').first().check();
    const firstAnswer = await page.getByRole('radio').first().getAttribute('name');
    const deadline = await page.evaluate(() => JSON.parse(sessionStorage.getItem('kortex-enem-attempt:qa-estudante')).deadlineAt);
    await page.reload();
    await page.getByRole('timer').waitFor();
    assert.equal(await page.getByRole('radio').first().isChecked(), true);
    assert.equal(await page.getByRole('radio').first().getAttribute('name'), firstAnswer);
    assert.equal(await page.evaluate(() => JSON.parse(sessionStorage.getItem('kortex-enem-attempt:qa-estudante')).deadlineAt), deadline);
    await page.getByRole('navigation', { name: 'Navegação do simulado', exact: true }).getByRole('link', { name: 'Voltar', exact: true }).click();
    await page.waitForURL(url => url.pathname + url.search === previous);
    await page.locator('main').getByRole('link', { name: /Simulado ENEM/ }).click();
    await page.getByRole('timer').waitFor();
    assert.equal(await page.getByRole('radio').first().isChecked(), true);
    await page.getByRole('button', { name: 'Finalizar simulado', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: 'Entregar com questões em branco?', exact: true });
    await confirmation.getByRole('button', { name: 'Continuar respondendo', exact: true }).click();
    await page.getByRole('button', { name: 'Finalizar simulado', exact: true }).click();
    await confirmation.getByRole('button', { name: 'Entregar mesmo assim', exact: true }).click();
    await page.getByRole('heading', { name: 'Resultado do treino', exact: true }).waitFor();
    await page.reload();
    await page.getByRole('heading', { name: 'Resultado do treino', exact: true }).waitFor();
    assert.equal(await page.getByRole('timer').count(), 0);
    await page.getByRole('link', { name: 'Voltar para onde eu estava', exact: true }).click();
    await page.waitForURL(url => url.pathname + url.search === previous);
  });

  for (const width of [320, 390]) for (const role of Object.keys(roleHomes)) {
    await scenario(`mobile-${width}-${role}-menu-sem-overflow`, role, async page => {
      await checkOverflow(page, `${role}: painel ${width}px`);
      await checkCurrentMenu(page, role);
      await clickMenu(page, 'Início', '/');
      await checkOverflow(page, `${role}: página inicial ${width}px`);
      await checkAllowedLinks(page, role, page.locator('main'));
      await clickMenu(page, 'Simulado ENEM', '/enem');
      await checkOverflow(page, `${role}: preparação ENEM ${width}px`);
      await page.screenshot({ path: fileURLToPath(new URL(`mobile-${width}-${role}.png`, output)), animations: 'disabled' });
    }, width);
  }

  const finalPreview = await browser.newPage();
  await verifyPreview(finalPreview.request);
  await finalPreview.close();
  assert.ok(checks.length, 'Nenhum cenário selecionado.');
  assert.deepEqual(runtimeErrors, [], 'Erros de execução no navegador.');
  assert.equal(checks.filter(check => check.status === 'failed').length, 0, 'Há fluxos reprovados no relatório.');
} catch (error) {
  checks.push({ name: 'integridade-preview-ou-resultados', status: 'failed', error: String(error) });
} finally {
  const failed = checks.some(check => check.status === 'failed');
  await writeFile(new URL('result.json', output), JSON.stringify({ status: failed ? 'failed' : 'passed', checkedAt: new Date().toISOString(), origin, build, checks, runtimeErrors, blockedOrigins: [...blockedOrigins], skipEnem }, null, 2));
  await browser.close();
  console.log(`Navegação: ${checks.filter(check => check.status === 'passed').length} aprovada(s), ${checks.filter(check => check.status === 'failed').length} reprovada(s). Evidências: ${fileURLToPath(output)}`);
  if (failed) process.exitCode = 1;
}
