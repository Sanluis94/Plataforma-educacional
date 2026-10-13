import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { root, origin, isolateBrowserData, verifyPreview } from './browser-fixture.mjs';

const output = new URL('.local/labs/certificate-browser/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [], runtimeErrors = [], blockedOrigins = new Set();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
await isolateBrowserData(context, value => blockedOrigins.add(value));
await context.addInitScript(() => {
  if (sessionStorage.getItem('certificate-browser-seed')) return;
  const data = JSON.parse(localStorage.getItem('edu_local_db'));
  data.classes = [{ id: 'qa-cert-class', name: 'Turma fictícia de certificados', professorId: 'qa-professor', professorName: 'Perfil de teste professor', studentIds: ['qa-estudante'], studentsCount: 1, code: 'CERT23', gradeLevel: 'medio', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
  data.activities = []; data.submissions = []; data.learningEvents = [];
  data.progress = { 'qa-estudante': { level: 1, xp: 0, coins: 0, completedModules: [], purchasedItems: [], enrolledClasses: ['qa-cert-class'], updatedAt: new Date().toISOString() } };
  localStorage.setItem('edu_local_db', JSON.stringify(data));
  sessionStorage.setItem('certificate-browser-seed', 'yes');
});
const page = await context.newPage(); page.setDefaultTimeout(15_000);
page.on('pageerror', error => runtimeErrors.push(error.message));
let anonymousContext, anonymousPage, certificateId;
async function record(name, action) { await action(); checks.push({ name, status: 'passed' }); console.log(`OK: ${name}`); }
async function screenshot(surface, name) { await surface.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: false, animations: 'disabled' }); }
async function role(name, url) {
  await page.goto(origin);
  await page.evaluate(roleName => {
    const data = JSON.parse(localStorage.getItem('edu_local_db'));
    const profile = data.users.find(value => value.id === `qa-${roleName}`);
    localStorage.setItem('edu-interact-local-auth-session', JSON.stringify({ currentUser: { uid: profile.id, email: profile.email, displayName: profile.name, photoURL: null }, userData: { name: profile.name, email: profile.email, role: profile.role, gradeLevel: 'medio' } }));
  }, name);
  await page.goto(origin + url);
}
const readRecords = () => page.evaluate(() => JSON.parse(localStorage.getItem('kortex_certificate_records_v2') ?? '[]'));

// This preview deliberately has no Firebase credentials. A second context gets
// only a projected fictitious public ledger, never the student's private record.
// Real cross-device Firestore permissions are verified by the emulator suite.
async function assertAnonymousPrivacy() {
  const values = await anonymousPage.evaluate(() => ({ markup: document.body.innerHTML, ledger: localStorage.getItem('kortex_certificate_public_v1'), privateLedger: localStorage.getItem('kortex_certificate_records_v2'), signedIn: localStorage.getItem('edu-interact-local-auth-session') }));
  assert.equal(values.signedIn, null); assert.equal(values.privateLedger, null);
  for (const sensitive of ['Perfil de teste estudante', 'qa-estudante', 'estudante@example.test', 'qa-professor', 'qa-cert-class']) {
    assert.ok(!values.markup.includes(sensitive), `Consulta pública exibiu ${sensitive}`);
    assert.ok(!values.ledger.includes(sensitive), `Projeção pública recebeu ${sensitive}`);
  }
}
try {
  await verifyPreview(page.request);
  await role('professor', '/professor?tab=activities&class=qa-cert-class');
  const publisher = page.getByRole('region', { name: 'Publicar atividade da turma' });
  await publisher.getByLabel('Título da atividade', { exact: true }).fill('Conferência de aprendizagem fictícia');
  await publisher.getByLabel('O que o aluno deve fazer', { exact: true }).fill('Responda à questão e explique o raciocínio utilizado.');
  await publisher.getByLabel('Disciplina (opcional)', { exact: true }).fill('Matemática');
  await publisher.getByLabel('Tipo de resposta').selectOption('quiz');
  await publisher.getByLabel('Enunciado da questão 1').fill('Quanto é 2 + 2?');
  for (const [index, answer] of ['4', '3', '5', '6'].entries()) await publisher.getByLabel(`Alternativa ${index + 1} da questão 1`).fill(answer);
  await publisher.getByLabel('Resposta correta da questão 1').selectOption('0');
  await publisher.getByLabel('Explicação que o aluno verá após entregar').fill('Somar duas unidades a duas unidades resulta em quatro unidades.');
  await publisher.getByRole('button', { name: 'Ver prévia e revisar' }).click();
  await publisher.getByRole('article', { name: 'Prévia da tela do aluno' }).waitFor();
  await publisher.getByRole('button', { name: 'Publicar atividade para a turma' }).click();
  await record('professor publica quiz real de uma questão com prévia', async () => {
    await page.getByText(/Atividade publicada/).first().waitFor();
    const activities = await page.evaluate(() => JSON.parse(localStorage.getItem('edu_local_db')).activities);
    assert.equal(activities.length, 1); assert.equal(activities[0].questions.length, 1);
  });
  await role('estudante', '/estudante?tab=activities&class=qa-cert-class');
  await page.getByRole('heading', { name: 'Conferência de aprendizagem fictícia', exact: true }).waitFor();
  await page.getByRole('radio', { name: '4', exact: true }).check();
  await page.getByLabel('Minha resposta e conclusões (opcional)').fill('Reuni dois grupos com duas unidades cada e contei quatro.');
  await page.getByRole('button', { name: /Entregar atividade|Enviar atividade/ }).click();
  await record('aluno entrega resposta correta e evidência completa', async () => {
    await page.getByText('Entrega salva. Aproveitamento: 100%.', { exact: true }).waitFor();
    const submissions = await page.evaluate(() => JSON.parse(localStorage.getItem('edu_local_db')).submissions);
    assert.equal(submissions.length, 1); assert.equal(submissions[0].score, 100);
    assert.equal(submissions[0].evidence.questions[0].selectedText, '4');
    assert.equal(submissions[0].evidence.questions[0].correct, true);
    assert.ok(submissions[0].evidence.reflection.includes('quatro'));
  });
  await screenshot(page, 'student-delivery');
  await role('professor', '/professor?tab=lms_gradebook&class=qa-cert-class&subtab=certificates');
  await page.getByRole('heading', { name: 'Certificados da turma', exact: true }).waitFor();
  const certificates = page.locator('section.professor-workflow').filter({ has: page.getByRole('heading', { name: 'Certificados da turma', exact: true }) });
  await certificates.getByLabel('Título do curso').fill('Curso fictício de Matemática');
  await certificates.getByLabel('Carga horária autorizada (horas)').fill('2');
  await certificates.getByLabel('Mínimo de atividades avaliadas').fill('2');
  await certificates.getByLabel('Aproveitamento mínimo (%)').fill('70');
  await certificates.getByLabel('Disciplina (opcional)').fill('Matemática');
  await certificates.getByRole('button', { name: 'Conferir requisitos e emitir' }).click();
  await record('requisito não cumprido bloqueia emissão', async () => {
    await certificates.getByRole('alert').filter({ hasText: /requisitos ainda não foram cumpridos/ }).waitFor();
    assert.equal((await readRecords()).length, 0);
  });
  await certificates.getByLabel('Mínimo de atividades avaliadas').fill('1');
  await certificates.getByRole('button', { name: 'Conferir requisitos e emitir' }).click();
  await record('professor emite após conferir mínimo1, aproveitamento70 e curso2h', async () => {
    await certificates.getByText(/Certificado registrado após conferir as entregas/).waitFor();
    const records = await readRecords(); assert.equal(records.length, 1);
    const saved = records[0]; certificateId = saved.id;
    assert.equal(saved.status, 'active'); assert.equal(saved.authorizedCourseHours, 2);
    assert.equal(saved.requirements.minimumCompleted, 1); assert.equal(saved.requirements.minScore, 70);
    assert.equal(saved.completedItemIds.length, 1); assert.equal(saved.evidenceSubmissionIds.length, 1);
    assert.ok(saved.observedSeconds === null || saved.observedSeconds < 7200, 'Carga horária do curso não pode virar tempo observado.');
  });
  await screenshot(page, 'teacher-issued');
  await page.reload();
  await record('registro emitido sobrevive à recarga docente', async () => {
    await page.getByText('Curso fictício de Matemática', { exact: true }).waitFor();
    assert.equal((await readRecords())[0].id, certificateId);
  });
  await role('estudante', '/estudante?tab=certificates&class=qa-cert-class');
  await record('aluno consulta certificado e horas claramente autorizadas', async () => {
    await page.getByRole('heading', { name: 'Curso fictício de Matemática', exact: true }).waitFor();
    await page.getByText('2 horas autorizadas do curso; este valor não representa tempo medido de uso.', { exact: true }).waitFor();
    assert.equal((await readRecords()).length, 1);
  });
  await screenshot(page, 'student-certificate');

  const projection = await page.evaluate(() => JSON.parse(localStorage.getItem('kortex_certificate_public_v1'))[0]);
  anonymousContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await isolateBrowserData(anonymousContext, value => blockedOrigins.add(value));
  await anonymousContext.addInitScript(value => {
    localStorage.removeItem('edu-interact-local-auth-session');
    localStorage.setItem('edu_local_db', JSON.stringify({ users: [], classes: [], activities: [], submissions: [], progress: {}, systemLogs: [], learningEvents: [] }));
    localStorage.setItem('kortex_certificate_public_v1', JSON.stringify([value]));
  }, projection);
  anonymousPage = await anonymousContext.newPage(); anonymousPage.setDefaultTimeout(15_000);
  anonymousPage.on('pageerror', error => runtimeErrors.push(error.message));
  await anonymousPage.goto(`${origin}/verificar-certificado?codigo=${encodeURIComponent(certificateId)}`);
  await record('consulta pública em contexto anônimo mostra somente metadados mínimos', async () => {
    await anonymousPage.getByRole('heading', { name: 'Registro válido', exact: true }).waitFor();
    await anonymousPage.getByText('Curso fictício de Matemática', { exact: true }).waitFor();
    await anonymousPage.getByText('2 horas declaradas e autorizadas pelo professor; não representam tempo medido no site', { exact: true }).waitFor();
    await assertAnonymousPrivacy();
    const dimensions = await anonymousPage.evaluate(() => ({ screen: innerWidth, document: document.documentElement.scrollWidth }));
    assert.ok(dimensions.document <= dimensions.screen + 1, JSON.stringify(dimensions));
  });
  await screenshot(anonymousPage, 'public-active-390');
  await role('professor', '/professor?tab=lms_gradebook&class=qa-cert-class&subtab=certificates');
  await page.getByRole('button', { name: 'Revogar certificado', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Revogar certificado', exact: true }).click();
  await page.getByLabel('Motivo da revogação').fill('Correção fictícia de registro para verificação de QA.');
  await page.getByRole('button', { name: 'Confirmar revogação', exact: true }).click();
  await record('professor revoga com motivo e estado persistido', async () => {
    await page.getByText('Certificado revogado. A consulta pública mostra o novo estado.', { exact: true }).waitFor();
    const revoked = (await readRecords())[0]; assert.equal(revoked.status, 'revoked'); assert.ok(revoked.revokedAt); assert.ok(revoked.revocationReason);
  });
  await screenshot(page, 'teacher-revoked');
  const revokedProjection = await page.evaluate(() => JSON.parse(localStorage.getItem('kortex_certificate_public_v1'))[0]);
  await anonymousPage.evaluate(value => localStorage.setItem('kortex_certificate_public_v1', JSON.stringify([value])), revokedProjection);
  // Replace the initial fixture so reload represents the current public ledger.
  await anonymousPage.addInitScript(value => localStorage.setItem('kortex_certificate_public_v1', JSON.stringify([value])), revokedProjection);
  await anonymousPage.reload();
  await record('consulta anônima passa a mostrar revogação sem nome, UID ou email', async () => {
    await anonymousPage.getByRole('heading', { name: 'Documento revogado', exact: true }).waitFor();
    await assertAnonymousPrivacy();
  });
  await screenshot(anonymousPage, 'public-revoked-390');
  await record('fontes verificadas e nenhuma exceção de execução', async () => { await verifyPreview(page.request); assert.deepEqual(runtimeErrors, []); });
  console.log('Fluxo de certificados aprovado.');
} catch (error) {
  await screenshot(page, 'failure').catch(() => undefined);
  if (anonymousPage) await screenshot(anonymousPage, 'public-failure').catch(() => undefined);
  checks.push({ name: 'fluxo interrompido', status: 'failed', url: anonymousPage?.url() ?? page.url(), error: String(error) });
  console.error(String(error)); process.exitCode = 1;
} finally {
  await writeFile(new URL('report.json', output), JSON.stringify({ checkedAt: new Date().toISOString(), backendScope: 'isolated local preview; anonymous context receives only a fictitious public projection, not remote Firestore', certificateId, checks, runtimeErrors, blockedOrigins: [...blockedOrigins] }, null, 2));
  await browser.close();
}
