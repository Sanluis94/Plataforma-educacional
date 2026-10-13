import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { root, origin, verifyPreview, isolateBrowserData } from './browser-fixture.mjs';

const directory = new URL('.local/labs/browser/', root);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, serviceWorkers: 'block' });
await isolateBrowserData(context);
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(45000);
const errors = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
const sessionKey = 'edu-interact-local-auth-session';

async function role(role) {
  await page.evaluate(({ role, key }) => {
    const db = JSON.parse(localStorage.getItem('edu_local_db'));
    const user = db.users.find(user => user.role === role);
    localStorage.setItem(key, JSON.stringify({ currentUser: { uid: user.id, displayName: user.name, email: user.email, photoURL: null }, userData: user }));
  }, { role, key: sessionKey });
}
async function progress() {
  return page.evaluate(() => JSON.parse(localStorage.getItem('edu_local_db')).progress['qa-estudante']);
}
async function assess(id, title, content) {
  const activity = page.getByRole('region', { name: `Laboratório: ${title}`, exact: true });
  await activity.waitFor();
  await activity.getByRole('button', { name: 'Avaliar', exact: true }).click();
  if (await activity.getByRole('button', { name: 'Tentar novamente', exact: true }).count()) await activity.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  for (const question of content.questions) await activity.getByLabel(question.options.find(option => option.correct).text, { exact: true }).check();
  await activity.getByRole('button', { name: 'Corrigir respostas', exact: true }).click();
  await page.waitForFunction(id => JSON.parse(localStorage.getItem('edu_local_db')).progress['qa-estudante']?.completedModules.includes(id), id);
  assert.equal(await page.getByRole('button', { name: 'Tentar salvar progresso', exact: true }).count(), 0);
}

try {
  const build = await verifyPreview(page.request);
  await page.goto(`${origin}/estudante`);
  await page.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await page.waitForFunction(key => localStorage.getItem(key) !== null, sessionKey);
  await role('estudante');

  const content = JSON.parse(await readFile(new URL('src/modules/core/content/fundamental1.json', root), 'utf8'))['fund1_mat_01'];
  await page.goto(`${origin}/simulacao?lab=fund1_mat_01`);
  await assess('fund1_mat_01', 'Ábaco e Sistema de Numeração Decimal', content);
  const first = await progress();
  assert.equal(first.xp, 80); assert.equal(first.coins, 30);
  await page.reload();
  await assess('fund1_mat_01', 'Ábaco e Sistema de Numeração Decimal', content);
  assert.equal((await progress()).xp, first.xp);
  checks.push('Progresso global persiste após recarregar; repetição não duplica XP ou moedas');

  await page.goto(`${origin}/simulacao?lab=sup_fis_01`);
  await page.getByRole('button', { name: 'Abrir bancada', exact: true }).click();
  const slider = page.locator('input[type="range"]').first();
  await slider.focus(); await slider.press('End');
  assert.equal(await slider.inputValue(), '5');
  const rows = page.getByText('Pontos de telemetria gravados:', { exact: false });
  await page.waitForFunction(() => [...document.querySelectorAll('div,p')].some(el => /^Pontos de telemetria gravados: [1-9]/.test(el.textContent?.trim() || '')));
  await page.getByRole('button', { name: 'Roteiro e avaliação', exact: true }).click();
  const pausedRows = await rows.textContent();
  await page.waitForTimeout(180);
  assert.equal(await rows.textContent(), pausedRows);
  await page.getByRole('button', { name: 'Abrir bancada', exact: true }).click();
  assert.equal(await slider.inputValue(), '5');
  await page.getByRole('button', { name: /Teoria/, exact: false }).click();
  await page.getByText('m·(d²x/dt²) + b·(dx/dt) + k·x = F₀·cos(ω·t)', { exact: false }).waitFor();
  checks.push('Bancada avançada preserva parâmetros e telemetria, pausa oculta e mantém equações');

  await page.goto(`${origin}/estudante?lab=math_1`);
  await page.getByRole('region', { name: 'Laboratório: Função de 1º Grau', exact: true }).waitFor();
  const legacy = JSON.parse(await readFile(new URL('src/modules/core/content/legacy-stem.json', root), 'utf8'))['math_1'];
  await assess('math_1', 'Função de 1º Grau', legacy);
  const inline = await progress();
  assert.equal(inline.xp, 160); assert.equal(inline.coins, 60);
  checks.push('Conclusão pelo painel do estudante usa o mesmo progresso persistente');

  for (const [tab, title] of [['exams', 'Provas & Avaliações'], ['gradebook', 'Boletim & Frequência'], ['forum', 'Fórum da Turma'], ['certificates', 'Meus Certificados'], ['lesson_plans', 'Plano de Aulas'], ['materials', 'Materiais & Downloads'], ['classes', 'Minha Turma & Avisos'], ['gamification', 'Conquistas & Loja']]) {
    await page.goto(`${origin}/estudante?tab=${tab}`);
    await page.getByRole('button', { name: new RegExp(title) }).first().waitFor();
    assert.ok((await page.locator('main').textContent()).trim().length > 100);
    checks.push(`Estudante: aba ${tab} renderiza`);
  }

  await page.goto(`${origin}/enem`);
  await page.getByRole('button', { name: 'Começar simulado', exact: true }).click();
  await page.getByRole('radio', { name: /^A\./ }).first().check();
  await page.getByRole('button', { name: 'Finalizar simulado', exact: true }).click();
  await page.getByRole('button', { name: 'Entregar mesmo assim', exact: true }).click();
  await page.getByRole('button', { name: 'Fazer outro simulado', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Fazer outro simulado', exact: true }).click();
  await page.getByRole('button', { name: 'Começar simulado', exact: true }).waitFor();
  checks.push('ENEM: responder, calcular TRI e reiniciar');

  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('edu_local_db'));
    db.classes.push({ id: 'qa-class', name: 'Turma fictícia Fundamental II', code: 'QA2026', professorId: 'qa-professor', professorName: 'Perfil de teste professor', studentIds: ['qa-estudante'], studentsCount: 1, gradeLevel: 'fundamental_2', createdAt: '2026-10-11T00:00:00Z', updatedAt: '2026-10-11T00:00:00Z' });
    localStorage.setItem('edu_local_db', JSON.stringify(db));
  });
  await role('professor');
  await page.goto(`${origin}/professor`);
  for (const name of ['Minhas Turmas & Mural', 'Diário, Notas e Fórum', 'Plano de Aulas Bimestral', 'Provas & Avaliações', 'Materiais da Turma', 'Catálogo de Laboratórios', 'Relatórios da Turma', 'Dúvidas']) {
    await page.getByRole('button', { name: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
    checks.push(`Professor: aba ${name} renderiza`);
  }
  await page.getByRole('button', { name: /Catálogo de Laboratórios/ }).click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Nível dos laboratórios"]')?.value === 'fundamental_2');
  checks.push('Professor: nível do catálogo acompanha a turma através do repositório real');
  await role('coordenador');
  await page.goto(`${origin}/coordenacao`);
  await page.getByRole('heading', { name: 'Nenhuma turma vinculada', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Exportar relatório', exact: true }).isDisabled(), true);
  await role('admin'); await page.goto(`${origin}/coordenacao`);
  await page.getByRole('heading', { name: 'Autorizar acompanhamento da coordenação', exact: true }).waitFor();
  await page.getByRole('combobox', { name: /^Turma$/ }).selectOption('qa-class');
  await page.getByRole('combobox', { name: /^Perfil de coordenação/ }).selectOption('qa-coordenador');
  await page.getByRole('button', { name: 'Autorizar turma', exact: true }).click();
  await page.getByText('Turma vinculada à coordenação.', { exact: true }).waitFor();
  await role('coordenador'); await page.goto(`${origin}/coordenacao`);
  await page.getByRole('heading', { name: 'Aprendizagem da turma', exact: true }).waitFor();
  const exportPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar relatório', exact: true }).click();
  const exported = await exportPromise;
  assert.ok((await readFile(await exported.path(), 'utf8')).includes('Turma fictícia Fundamental II'));
  checks.push('Coordenação: vínculo autorizado pela administração libera relatório e exportação reais');
  await role('admin');
  await page.goto(`${origin}/admin`);
  await page.getByRole('heading', { name: 'Painel Administrativo', exact: true }).waitFor();
  checks.push('Administração: painel renderiza');
  assert.deepEqual(errors, []);
  await verifyPreview(page.request);
  await writeFile(new URL('regression-result.json', directory), JSON.stringify({ status: 'passed', checkedAt: new Date().toISOString(), checks, errors, build }, null, 2));
  console.log(`Regressão no navegador aprovada: ${checks.length} verificações com dados fictícios.`);
} catch (error) {
  await writeFile(new URL('regression-result.json', directory), JSON.stringify({ status: 'failed', checkedAt: new Date().toISOString(), checks, errors, error: String(error) }, null, 2));
  throw error;
} finally { await browser.close(); }
