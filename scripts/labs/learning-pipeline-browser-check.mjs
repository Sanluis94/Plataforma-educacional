import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { root, origin, verifyPreview, isolateBrowserData } from './browser-fixture.mjs';

// All identities/content below are fictitious. Only the identified local preview
// is reachable; private exports and external services are blocked by the fixture.
const output = new URL('.local/labs/learning-pipeline-browser/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [], runtimeErrors = [], blockedOrigins = new Set();
const selected = process.argv.find(argument => argument.startsWith('--scenario='))?.slice(11);
const sessionKey = 'edu-interact-local-auth-session';
const studentName = 'Aluna fictícia Ana';
const absentName = 'Aluno fictício Beto';
const activityTitle = 'Investigação fictícia de energia';
const reflection = 'Comparei os resultados; minha conclusão tem evidências, "aspas" e\nsegunda linha.';
const questions = [
  { q: 'Qual resultado descreve a conservação de energia?', options: ['Energia preservada num sistema isolado', 'Energia desaparece sem transferência'], answer: 0, explanation: 'A energia total permanece conservada em um sistema isolado.' },
  { q: 'Qual procedimento produz evidência?', options: ['Registrar parâmetros e comparar resultados', 'Ignorar as observações'], answer: 0, explanation: 'Resultados registrados permitem comparar as hipóteses.' },
];
let build;

async function seed(context, { essay = false, exam = false } = {}) {
  await isolateBrowserData(context, value => blockedOrigins.add(value));
  await context.addInitScript(({ questions, activityTitle, essay, exam, studentName, absentName }) => {
    if (sessionStorage.getItem('qa-learning-pipeline-seeded')) return;
    const db = JSON.parse(localStorage.getItem('edu_local_db'));
    db.users.find(user => user.id === 'qa-estudante').name = studentName;
    db.users.push({ id: 'qa-student-absent', name: absentName, email: 'absent@example.test', role: 'estudante', gradeLevel: 'fundamental_1', createdAt: '2026-01-01T00:00:00Z' });
    db.classes = ['a', 'b'].map((suffix, index) => ({ id: `qa-class-${suffix}`, name: `Turma fictícia ${suffix.toUpperCase()}`, code: `QA000${index + 1}`, professorId: 'qa-professor', professorName: 'Perfil de teste professor', studentIds: index ? ['qa-estudante'] : ['qa-estudante', 'qa-student-absent'], studentsCount: index ? 1 : 2, gradeLevel: 'fundamental_1', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }));
    db.activities = ['a', 'b'].map(suffix => ({ id: `qa-activity-${suffix}`, title: activityTitle, classId: `qa-class-${suffix}`, className: `Turma fictícia ${suffix.toUpperCase()}`, professorId: 'qa-professor', subject: 'Física', description: `Atividade da turma ${suffix.toUpperCase()}.`, type: 'quiz', config: {}, questions, status: 'published', createdAt: '2026-01-01T00:00:00Z' }));
    if (essay) db.activities.push({ id: 'qa-reflection-a', title: 'Conclusão fictícia sem correção automática', classId: 'qa-class-a', professorId: 'qa-professor', subject: 'Ciências', type: 'lesson_theory', config: {}, questions: [], status: 'published', createdAt: '2026-01-01T00:00:00Z' });
    db.submissions = []; db.learningEvents = [];
    db.progress['qa-estudante'] = { level: 1, xp: 0, coins: 0, completedModules: [], purchasedItems: [], enrolledClasses: ['qa-class-a', 'qa-class-b'], updatedAt: '2026-01-01T00:00:00Z' };
    localStorage.setItem('edu_local_db', JSON.stringify(db));
    localStorage.setItem('edu_local_lesson_plans', JSON.stringify([{ id: 'qa-plan-a', turmaId: 'qa-class-a', professorId: 'qa-professor', periodo: '1º Bimestre', ordemSemana: 1, topico: 'Aula fictícia de sistema decimal', metodologia: 'Compare os cenários e justifique sua conclusão.', laboratorioAssociadoId: 'fund1_mat_01', status: 'planejada', criadoEm: '2026-01-01T00:00:00Z' }]));
    localStorage.setItem('edu_local_exam_attempts', '[]');
    localStorage.setItem('edu_local_exams', JSON.stringify(exam ? [{ id: 'qa-exam-a', professorId: 'qa-professor', titulo: 'Avaliação fictícia ponderada', disciplina: 'Física', turmaId: 'qa-class-a', status: 'Aberta', duracaoMinutos: 30, pesoTotal: 4, criadoEm: '2026-01-01T00:00:00Z', questoes: questions.map((question, index) => ({ enunciado: question.q, tema: 'Evidências', nivelDificuldade: 'Fácil', valorPeso: index ? 1 : 3, justificativa: question.explanation, opcoes: question.options.map((texto, option) => ({ texto, isCorreta: option === question.answer })) })) }] : []));
    sessionStorage.setItem('qa-learning-pipeline-seeded', 'true');
  }, { questions, activityTitle, essay, exam, studentName, absentName });
}

async function role(page, role) {
  await page.evaluate(({ role, sessionKey }) => {
    const user = JSON.parse(localStorage.getItem('edu_local_db')).users.find(user => user.id === `qa-${role}`);
    localStorage.setItem(sessionKey, JSON.stringify({ currentUser: { uid: user.id, displayName: user.name, email: user.email, photoURL: null }, userData: user }));
  }, { role, sessionKey });
}
async function start(page) {
  await page.goto(`${origin}/`);
  await role(page, 'estudante');
  await page.goto(`${origin}/estudante?tab=activities&class=qa-class-a`);
  await page.getByRole('heading', { name: 'Atividades da Turma', exact: true }).waitFor();
}
async function submissions(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('edu_local_db')).submissions ?? []); }
async function deliverActivity(page, score = 0, text = reflection) {
  const before = (await submissions(page)).length;
  const activity = page.getByRole('heading', { name: activityTitle, exact: true }).locator('..');
  await activity.waitFor();
  for (const question of questions) await activity.getByRole('radio', { name: question.options[score ? 0 : 1], exact: true }).check();
  await activity.getByRole('textbox', { name: 'Minha resposta e conclusões (opcional)', exact: true }).fill(text);
  // Foreground time is measured by the application, rather than seeded into the evidence.
  await page.waitForTimeout(1100);
  await activity.getByRole('button', { name: 'Entregar atividade', exact: true }).click();
  await activity.getByText(`Entrega salva. Aproveitamento: ${score}%.`, { exact: true }).waitFor();
  await page.waitForFunction(before => (JSON.parse(localStorage.getItem('edu_local_db')).submissions ?? []).length === before + 1, before);
  const saved = (await submissions(page)).at(-1);
  assert.equal(saved.classId, 'qa-class-a'); assert.equal(saved.score, score);
  assert.equal(saved.evidence.reflection, text); assert.ok(saved.evidence.activeSeconds >= 1);
  assert.equal(saved.evidence.questions[0].selectedText, questions[0].options[score ? 0 : 1]);
  return saved;
}
async function report(page, classId = 'qa-class-a') {
  await role(page, 'professor');
  await page.goto(`${origin}/professor?tab=reports&class=${classId}`);
  const surface = page.getByRole('region', { name: `Acompanhamento da turma Turma fictícia ${classId.endsWith('a') ? 'A' : 'B'}`, exact: true });
  await surface.waitFor();
  return surface;
}
async function metric(surface, title) { return surface.getByRole('heading', { name: title, exact: true }).locator('..').locator('strong').first().textContent(); }
async function student(surface, name = studentName) { return surface.getByRole('heading', { name, exact: true }).locator('..').locator('..'); }
async function overflow(page, label) {
  const widths = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(widths.document <= widths.viewport + 1 && widths.body <= widths.viewport + 1, `${label}: ${JSON.stringify(widths)}`);
}
async function downloadCsv(page) {
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV', exact: true }).click();
  return readFile(await (await download).path(), 'utf8');
}
function parseCsv(csv) {
  const rows = [], row = []; let field = '', quoted = false;
  const source = csv.replace(/^\uFEFF/, '');
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === '"') { if (quoted && source[index + 1] === '"') { field += '"'; index++; } else quoted = !quoted; }
    else if (!quoted && character === ';') { row.push(field); field = ''; }
    else if (!quoted && character === '\n') { row.push(field.replace(/\r$/, '')); rows.push([...row]); row.length = 0; field = ''; }
    else field += character;
  }
  return rows.slice(1).map(values => Object.fromEntries(rows[0].map((header, index) => [header, values[index]])));
}
async function screenshot(page, name) { const file = `${name}.png`; await page.screenshot({ path: fileURLToPath(new URL(file, output)), fullPage: true, animations: 'disabled' }); return file; }
async function scenario(name, callback, settings = {}) {
  if (selected && !name.includes(selected)) return;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  await seed(context, settings);
  const page = await context.newPage(); page.setDefaultTimeout(20_000); page.setDefaultNavigationTimeout(30_000);
  const errors = []; page.on('pageerror', error => { errors.push(error.message); runtimeErrors.push({ name, error: error.message }); });
  const startedAt = Date.now();
  try { await start(page); const evidence = await callback(page, context); assert.deepEqual(errors, [], 'Erro de execução no navegador.'); checks.push({ name, status: 'passed', durationMs: Date.now() - startedAt, evidence }); console.log(`OK: ${name}`); }
  catch (error) { const file = await screenshot(page, `${name}-failure`).catch(() => null); checks.push({ name, status: 'failed', durationMs: Date.now() - startedAt, url: page.url(), error: String(error), screenshot: file }); console.error(`FALHOU: ${name}: ${error}`); }
  finally { await context.close(); }
}

try {
  const preflight = await browser.newPage(); build = await verifyPreview(preflight.request); await preflight.close();

  await scenario('atividade-zero-recarga-professor-csv', async page => {
    const saved = await deliverActivity(page); await page.reload();
    assert.equal((await submissions(page)).length, 1, 'Recarga não pode reenviar a entrega.');
    const surface = await report(page);
    assert.equal(await metric(surface, 'Alunos com evidências'), '1 de 2');
    assert.equal(await metric(surface, 'Entregas da turma'), '1 de 4');
    assert.equal(await metric(surface, 'Média das entregas com nota'), '0%');
    const ana = await student(surface), beto = await student(surface, absentName);
    assert.equal(await ana.getByText('Precisa de apoio', { exact: true }).count(), 1);
    assert.equal(await beto.getByText('Sem evidências', { exact: true }).count(), 1);
    assert.equal(await beto.getByText('Sem dados', { exact: true }).count(), 1);
    await ana.locator('summary').first().click();
    await ana.getByText(reflection, { exact: true }).waitFor();
    await ana.getByText(`Opção marcada: ${questions[0].options[1]} · Resposta incorreta: retomar este conceito.`, { exact: true }).waitFor();
    const record = ana.locator('.learning-report-record').first();
    const measuredText = await record.getByText('Tempo de uso medido', { exact: true }).locator('..').locator('dd').textContent();
    assert.equal(measuredText, `${saved.evidence.activeSeconds} s`);
    const rows = parseCsv(await downloadCsv(page)); assert.equal(rows.length, 2);
    const anaRow = rows.find(row => row['Aluno ID'] === 'qa-estudante');
    assert.equal(anaRow['Nota da tentativa (%)'], '0'); assert.equal(anaRow['Conclusão do aluno'], reflection);
    assert.equal(anaRow['Tempo ativo medido (segundos)'], String(saved.evidence.activeSeconds)); assert.ok(anaRow['Respostas e correção'].includes(questions[0].options[1]));
    assert.equal(rows.find(row => row['Aluno ID'] === 'qa-student-absent')['Média consolidada (%)'], '');
    return { recordId: saved.id, activeSeconds: saved.evidence.activeSeconds, csvRows: rows.length, screenshot: await screenshot(page, 'teacher-zero-evidence') };
  });

  await scenario('nova-tentativa-historico-duplicata', async page => {
    const first = await deliverActivity(page, 0); await page.reload(); await page.getByRole('button', { name: 'Fazer nova tentativa', exact: true }).click(); const second = await deliverActivity(page, 100, 'Revisei meu raciocínio e corrigi as respostas.');
    assert.notEqual(first.id, second.id); assert.notEqual(first.evidence.sessionId, second.evidence.sessionId);
    await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('edu_local_db')); db.submissions.push(structuredClone(db.submissions[0])); localStorage.setItem('edu_local_db', JSON.stringify(db)); });
    const surface = await report(page); assert.equal(await metric(surface, 'Entregas da turma'), '1 de 4'); assert.equal(await metric(surface, 'Média das entregas com nota'), '100%');
    const ana = await student(surface); await ana.getByText(`Ver 2 entregas de ${studentName}`, { exact: true }).click();
    assert.equal(await ana.locator('.learning-report-record').count(), 2);
    await surface.getByText('Como lemos estes dados', { exact: true }).click();
    assert.equal(await surface.getByText('Duplicados removidos', { exact: true }).locator('..').locator('dd').textContent(), '1');
    assert.equal(await surface.getByText('Novas tentativas consolidadas', { exact: true }).locator('..').locator('dd').textContent(), '1');
    const rows = parseCsv(await downloadCsv(page)); assert.equal(rows.filter(row => row['Aluno ID'] === 'qa-estudante').length, 2);
    return { attempts: 2, duplicatesRemoved: 1, consolidatedCompletion: 1, screenshot: await screenshot(page, 'teacher-history-quality') };
  });

  await scenario('duas-turmas-separadas-sem-dados', async page => {
    await deliverActivity(page, 100); const surfaceA = await report(page); assert.equal(await metric(surfaceA, 'Média das entregas com nota'), '100%');
    await page.getByRole('combobox', { name: 'Turma:', exact: true }).selectOption('qa-class-b');
    const surfaceB = page.getByRole('region', { name: 'Acompanhamento da turma Turma fictícia B', exact: true }); await surfaceB.waitFor();
    assert.equal(await metric(surfaceB, 'Entregas da turma'), '0 de 1'); assert.equal(await metric(surfaceB, 'Média das entregas com nota'), 'Sem dados');
    assert.equal(await metric(surfaceB, 'Tempo médio registrado'), 'Não registrado'); assert.equal(await surfaceB.locator('.learning-report-record').count(), 0);
    assert.equal(await surfaceB.locator('svg.recharts-surface').count(), 0); assert.equal(await page.getByText('Lucas Ferreira', { exact: true }).count(), 0);
    await page.reload(); await surfaceB.waitFor(); assert.equal(new URL(page.url()).searchParams.get('class'), 'qa-class-b');
    return { classACompletion: 1, classBCompletion: 0, sameTitlesRemainSeparate: true, screenshot: await screenshot(page, 'teacher-empty-class-b') };
  });

  await scenario('laboratorio-do-plano-hipotese-reflexao', async page => {
    await page.goto(`${origin}/estudante?tab=lesson_plans&class=qa-class-a`);
    await page.getByRole('button', { name: /Abrir Laboratório da Aula/ }).click();
    await page.waitForURL(url => url.pathname === '/simulacao' && url.searchParams.get('class') === 'qa-class-a' && url.searchParams.get('lessonPlan') === 'qa-plan-a');
    const activity = page.getByRole('region', { name: 'Laboratório: Ábaco e Sistema de Numeração Decimal', exact: true }); await activity.waitFor();
    const prediction = 'Prevejo que trocar dez unidades forma uma dezena.';
    const conclusion = 'Comparei os cenários e expliquei a troca por dez.';
    await activity.getByRole('textbox', { name: 'Minha previsão e justificativa', exact: true }).fill(prediction);
    await activity.getByRole('button', { name: 'Conferir observação', exact: true }).click();
    await activity.getByRole('textbox', { name: 'Minha resposta com evidências dos cenários', exact: true }).fill(conclusion);
    const content = JSON.parse(await readFile(new URL('src/modules/core/content/fundamental1.json', root), 'utf8'))['fund1_mat_01'];
    await activity.getByRole('button', { name: 'Avaliar', exact: true }).click();
    for (const question of content.questions) await activity.getByRole('radio', { name: question.options.find(option => option.correct).text, exact: true }).check();
    await activity.getByRole('button', { name: 'Corrigir respostas', exact: true }).click();
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem('edu_local_db')).submissions ?? []).some(record => record.evidence?.lessonPlanId === 'qa-plan-a'));
    const saved = (await submissions(page)).find(record => record.evidence.lessonPlanId === 'qa-plan-a');
    assert.equal(saved.classId, 'qa-class-a'); assert.equal(saved.evidence.labId, 'fund1_mat_01'); assert.equal(saved.score, 100);
    assert.equal(saved.evidence.reflection, conclusion); assert.equal(saved.evidence.observations[0].hypothesis, prediction);
    const returnTo = new URL(page.url()).searchParams.get('returnTo'); assert.ok(returnTo.includes('tab=lesson_plans')); assert.ok(returnTo.includes('class=qa-class-a'));
    const surface = await report(page); assert.equal(await metric(surface, 'Entregas da turma'), '1 de 4');
    const ana = await student(surface); await ana.locator('summary').first().click(); await ana.getByText(prediction, { exact: true }).waitFor(); await ana.getByText(conclusion, { exact: true }).waitFor();
    assert.equal(await ana.getByText('Atribuída à turma', { exact: false }).count(), 1);
    return { planId: saved.evidence.lessonPlanId, correctQuestions: saved.evidence.questions.length, screenshot: await screenshot(page, 'teacher-assigned-lab') };
  });

  await scenario('offline-fila-reconexao-recarga', async (page, context) => {
    const activity = page.getByRole('heading', { name: activityTitle, exact: true }).locator('..');
    for (const question of questions) await activity.getByRole('radio', { name: question.options[1], exact: true }).check();
    await activity.getByRole('textbox', { name: 'Minha resposta e conclusões (opcional)', exact: true }).fill(reflection);
    await context.setOffline(true); await activity.getByRole('button', { name: 'Entregar atividade', exact: true }).click();
    await activity.getByText(/Entrega guardada neste dispositivo, aguardando confirmação/).waitFor();
    assert.equal((await submissions(page)).length, 0);
    const pending = await page.evaluate(() => JSON.parse(localStorage.getItem('kortex_offline_outbox_v2')));
    assert.equal(pending.length, 1); assert.equal(pending[0].submission.evidence.reflection, reflection);
    await context.setOffline(false);
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem('edu_local_db')).submissions ?? []).length === 1 && JSON.parse(localStorage.getItem('kortex_offline_outbox_v2')).length === 0);
    await page.reload(); assert.equal((await submissions(page)).length, 1);
    const surface = await report(page); assert.equal(await metric(surface, 'Entregas da turma'), '1 de 4'); assert.equal(await metric(surface, 'Média das entregas com nota'), '0%');
    return { queued: 1, deliveredAfterReconnect: 1, duplicatedAfterReload: false };
  });

  await scenario('resposta-escrita-entregue-sem-nota', async page => {
    const activity = page.getByRole('heading', { name: 'Conclusão fictícia sem correção automática', exact: true }).locator('..');
    await activity.getByRole('textbox', { name: 'Minha resposta e conclusões (obrigatória)', exact: true }).fill('Minha conclusão ainda precisa da leitura do professor.');
    await activity.getByRole('button', { name: 'Entregar atividade', exact: true }).click(); await activity.getByText('Resposta entregue para leitura do professor, sem nota automática.', { exact: true }).waitFor();
    const saved = (await submissions(page))[0]; assert.equal(saved.status, 'completed'); assert.equal(saved.evidence.stage, 'response');
    const surface = await report(page); assert.equal(await metric(surface, 'Média das entregas com nota'), 'Sem dados'); assert.equal(await metric(surface, 'Entregas da turma'), '1 de 6');
    const ana = await student(surface); await ana.locator('summary').first().click(); await ana.getByText('Resposta escrita sem correção automática', { exact: true }).waitFor();
    const rows = parseCsv(await downloadCsv(page)); const row = rows.find(row => row['Aluno ID'] === 'qa-estudante'); assert.equal(row['Nota da tentativa (%)'], ''); assert.equal(row['Estado da entrega'], 'Resposta entregue sem correção automática');
    return { writtenEvidencePreserved: true, writtenDeliveryCounted: true, responseNotScoredAsZero: true };
  }, { essay: true });

  await scenario('prova-formal-ponderada-questoes', async page => {
    await page.goto(`${origin}/estudante?tab=exams&class=qa-class-a`);
    await page.getByRole('button', { name: /Realizar Prova/ }).click();
    await page.getByRole('radio', { name: questions[0].options[0], exact: true }).check();
    await page.getByRole('button', { name: /Próxima Questão/ }).click();
    await page.getByRole('radio', { name: questions[1].options[1], exact: true }).check();
    await page.getByRole('button', { name: /Finalizar & Entregar Prova/ }).click(); await page.getByRole('heading', { name: 'Prova entregue', exact: true }).waitFor();
    const attempts = await page.evaluate(() => JSON.parse(localStorage.getItem('edu_local_exam_attempts')));
    assert.equal(attempts.length, 1); assert.equal(attempts[0].porcentagemAproveitamento, 75);
    const surface = await report(page); assert.equal(await metric(surface, 'Média das entregas com nota'), '75%'); assert.equal(await metric(surface, 'Entregas da turma'), '1 de 6');
    const ana = await student(surface); await ana.locator('summary').first().click(); await ana.getByText(`Opção marcada: ${questions[0].options[0]} · Resposta correta.`, { exact: true }).waitFor();
    const rows = parseCsv(await downloadCsv(page)); const row = rows.find(row => row['Tipo'] === 'exam'); assert.equal(row['Nota da tentativa (%)'], '75');
    return { weightedScore: 75, questions: 2, screenshot: await screenshot(page, 'teacher-formal-exam') };
  }, { exam: true });

  await scenario('filtros-mensagens-teclado-celular320', async page => {
    await deliverActivity(page, 0); const surface = await report(page); await page.setViewportSize({ width: 320, height: 844 }); await overflow(page, 'relatório 320');
    await surface.getByRole('searchbox', { name: 'Buscar aluno', exact: true }).fill('beto');
    assert.equal(await surface.getByRole('heading', { name: studentName, exact: true }).count(), 0); assert.equal(await surface.getByRole('heading', { name: absentName, exact: true }).count(), 1);
    await surface.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption('precisa_apoio'); await surface.getByText('Nenhum aluno corresponde a este filtro.', { exact: true }).waitFor();
    await surface.getByRole('searchbox', { name: 'Buscar aluno', exact: true }).fill('');
    const ana = await student(surface), toggle = ana.locator('summary').first(); await toggle.focus(); await page.keyboard.press('Enter'); assert.equal(await toggle.locator('..').getAttribute('open'), '');
    await overflow(page, 'evidências abertas 320');
    const captured = await screenshot(page, 'teacher-mobile320-evidence');
    await surface.getByRole('button', { name: 'Abrir mensagens da turma', exact: true }).click(); await page.waitForURL(url => url.searchParams.get('tab') === 'messages'); assert.equal(new URL(page.url()).searchParams.get('class'), 'qa-class-a');
    await page.getByRole('button', { name: /Relatórios da Turma/ }).click(); await surface.waitFor(); assert.equal(new URL(page.url()).searchParams.get('class'), 'qa-class-a');
    await overflow(page, 'retorno ao relatório 320'); return { keyboardDetails: true, filters: true, preservesClassToMessages: true, screenshot: captured };
  });

  await scenario('treino-enem-historico-compartilhamento-explicito', async page => {
    await page.goto(`${origin}/enem`); await page.getByRole('button', { name: 'Começar simulado', exact: true }).click();
    for (let index = 0; index < 5; index++) {
      await page.getByRole('radio', { name: /^A\./ }).first().check();
      if (index < 4) await page.getByRole('button', { name: 'Próxima', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Finalizar simulado', exact: true }).click();
    await page.getByText('Resultado salvo no seu histórico pessoal.', { exact: true }).waitFor();
    const personal = (await submissions(page)).find(record => record.evidence?.source === 'enem');
    assert.equal(personal.classId, ''); assert.ok(personal.score >= 0 && personal.score <= 100);
    assert.ok(personal.evidence.estimatedScore.value >= 0 && personal.evidence.estimatedScore.value <= 1000);
    const unshared = await report(page); assert.equal(await metric(unshared, 'Média das entregas com nota'), 'Sem dados');
    assert.equal(await unshared.locator('.learning-report-record').count(), 0);
    await role(page, 'estudante'); await page.goto(`${origin}/enem`); await page.getByRole('heading', { name: 'Meu histórico e compartilhamento', exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'Turma para compartilhar', exact: true }).selectOption('qa-class-a');
    await page.getByRole('button', { name: 'Compartilhar resultado com professor', exact: true }).click();
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem('edu_local_db')).submissions ?? []).some(record => record.evidence?.source === 'enem' && record.classId === 'qa-class-a'));
    await page.reload(); await page.getByRole('heading', { name: 'Meu histórico e compartilhamento', exact: true }).waitFor();
    assert.equal((await submissions(page)).filter(record => record.evidence?.source === 'enem').length, 2, 'Recarga preserva tentativa pessoal e compartilhada sem repetir.');
    await page.getByRole('combobox', { name: 'Turma para compartilhar', exact: true }).selectOption('qa-class-a');
    await page.getByRole('button', { name: 'Compartilhar resultado com professor', exact: true }).click();
    await page.getByText(/Resultado compartilhado com o professor/, { exact: false }).waitFor();
    assert.equal((await submissions(page)).filter(record => record.evidence?.source === 'enem').length, 2);
    const surface = await report(page); assert.equal(await metric(surface, 'Média das entregas com nota'), `${personal.score}%`); assert.equal(await metric(surface, 'Entregas da turma'), '0 de 4');
    const ana = await student(surface); await ana.locator('summary').first().click(); await ana.getByText('Acertos (%)', { exact: true }).waitFor(); await ana.getByText('Nota estimada do treino (escala 0–1000):', { exact: true }).waitFor();
    const rows = parseCsv(await downloadCsv(page)); const row = rows.find(row => row['Tipo'] === 'enem'); assert.equal(row['Nota da tentativa (%)'], String(personal.score));
    return { sharedOnlyAfterClick: true, percentage: personal.score, estimatedScore: personal.evidence.estimatedScore.value, duplicateShareRemoved: true, screenshot: await screenshot(page, 'teacher-shared-enem') };
  });

  await verifyPreview((await browser.newPage()).request);
  const result = { status: checks.every(check => check.status === 'passed') && checks.length > 0 ? 'passed' : 'failed', checkedAt: new Date().toISOString(), checks, runtimeErrors, blockedOrigins: [...blockedOrigins], build };
  await writeFile(new URL('result.json', output), JSON.stringify(result, null, 2));
  assert.equal(result.status, 'passed', `${checks.filter(check => check.status === 'failed').length} jornadas falharam.`);
  console.log(`ETL no navegador aprovado: ${checks.length} jornadas com envio real pela interface e dados fictícios.`);
} catch (error) {
  await writeFile(new URL('result.json', output), JSON.stringify({ status: 'failed', checkedAt: new Date().toISOString(), checks, runtimeErrors, blockedOrigins: [...blockedOrigins], build, error: String(error) }, null, 2));
  throw error;
} finally { await browser.close(); }
