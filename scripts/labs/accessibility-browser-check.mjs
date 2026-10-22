import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { root, origin, readCatalog, verifyPreview, isolateBrowserData, selectCatalogSubject } from './browser-fixture.mjs';

const output = new URL('.local/labs/accessibility-browser/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
await isolateBrowserData(context);
const page = await context.newPage();
page.setDefaultTimeout(30_000);
const checks = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
function ratio(a, b) {
  const luminance = color => { const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => { const x = n / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722; };
  const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
async function contrast(text, background) {
  const colors = { text: await text.evaluate(e => getComputedStyle(e).color), background: await background.evaluate(e => getComputedStyle(e).backgroundColor) };
  const measured = ratio(colors.text, colors.background);
  assert.ok(measured >= 4.5, `Contraste insuficiente: ${JSON.stringify({ ...colors, measured })}`);
  return { ...colors, ratio: measured };
}
async function overflow() {
  const bounds = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(bounds.scroll <= bounds.width + 1, JSON.stringify(bounds));
}
try {
  const build = await verifyPreview(page.request);
  await page.goto(origin + '/');
  await page.locator('header.app-header').getByRole('button', { name: 'Entrar', exact: true }).click();
  const login = page.getByRole('dialog', { name: 'Entrar na plataforma' });
  await login.getByRole('button', { name: 'Entrar localmente', exact: true }).click();
  await page.goto(origin + '/estudante?tab=labs');
  await page.getByRole('combobox', { name: 'Nível de aprendizado', exact: true }).waitFor();
  for (const [label, name] of [['Conhecer planos (demonstração)', 'Planos para estudantes, escolas e redes'], ['Portal da família', 'Portal da família']]) {
    await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
    await page.getByRole('button', { name: label, exact: true }).click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await dialog.waitFor();
    assert.equal(await dialog.evaluate(e => e.contains(document.activeElement)), true);
    for (let n = 0; n < 25; n++) { await page.keyboard.press('Tab'); assert.equal(await dialog.evaluate(e => e.contains(document.activeElement)), true); }
    if (label === 'Conhecer planos (demonstração)') {
      const investment=dialog.getByText('Investimento anual Edu-Interact:',{exact:true}).locator('..').locator('strong');
      const annual=await investment.textContent();
      await dialog.getByRole('button',{name:'Faturamento mensal',exact:true}).click();
      await dialog.getByText('R$ 9,90',{exact:true}).waitFor();assert.notEqual(await investment.textContent(),annual);
      const monthly=await investment.textContent();const slider=dialog.getByRole('slider');const initial=await slider.inputValue();await slider.focus();await page.keyboard.press('ArrowRight');assert.notEqual(await slider.inputValue(),initial);assert.notEqual(await investment.textContent(),monthly);
      await dialog.getByRole('button',{name:'Ver opção para escola',exact:true}).click();await dialog.getByRole('status').getByText(/Nenhuma contratação foi realizada/).waitFor();
      checks.push({check:'Planos ilustrativos recalculam período e alunos; seleção informa comparação sem contratação'});
    }
    await overflow();
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('button', { name: 'Abrir menu', exact: true }).evaluate(e => e === document.activeElement), true);
    checks.push({ check: label + ': teclado, foco, fechamento e largura' });
  }
  await page.getByRole('button', { name: 'Ativar tema claro', exact: true }).click();
  await page.getByRole('button', { name: 'Opções de acessibilidade', exact: true }).click();
  await page.getByRole('region', { name: 'Opções de acessibilidade' }).getByRole('button', { name: /Reduzir distrações/ }).click();
  await page.keyboard.press('Escape');
  const studentHeading = page.locator('main h1');
  checks.push({ check: 'Modo foco conserva a legibilidade no tema claro', ...await contrast(studentHeading, page.locator('.light-theme .app-container').first()) });

  await page.goto(origin + '/simulacao?level=fundamental_2&returnTo=' + encodeURIComponent('/estudante?tab=exams&level=fundamental_2'));
  const lab = (await readCatalog()).find(item => item.id === 'fund2_mat_01');
  await selectCatalogSubject(page.getByRole('region', { name: 'Catálogo de laboratórios', exact: true }), lab.subject);
  await page.getByRole('searchbox', { name: 'Buscar laboratórios', exact: true }).fill(lab.id);
  await page.getByRole('article', { name: lab.title }).getByRole('button', { name: `Abrir ${lab.title}`, exact: true }).click();
  await page.getByRole('region', { name: 'Laboratório: ' + lab.title, exact: true }).waitFor();
  assert.equal(await page.locator('p[tabindex="-1"]').evaluate(e => e === document.activeElement), true);
  await page.reload();
  await page.getByRole('region', { name: 'Laboratório: ' + lab.title, exact: true }).waitFor();
  await page.getByRole('button', { name: 'Voltar ao catálogo', exact: true }).click();
  assert.equal(await page.getByRole('searchbox', { name: 'Buscar laboratórios' }).inputValue(), lab.id);
  assert.equal(await page.locator('.lab-subject-picker__value').textContent(), lab.subject);
  await page.getByRole('link', { name: 'Voltar à tela anterior', exact: true }).click();
  await page.waitForURL(url => url.pathname === '/estudante' && url.searchParams.get('tab') === 'exams');
  checks.push({ check: 'Catálogo preserva disciplina, busca e origem após atividade e recarga; foco identifica atividade' });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(origin + '/simulacao?lab=sup_fis_01');
  await page.getByRole('button', { name: 'Abrir bancada', exact: true }).click();
  await page.getByRole('button', { name: 'Alto contraste', exact: true }).click();
  const bench = page.locator('.bg-black.text-yellow-300');
  await bench.waitFor();
  await page.waitForFunction(() => { const node=document.querySelector('.bg-black.text-yellow-300'); return node && getComputedStyle(node).backgroundColor==='rgb(0, 0, 0)' && getComputedStyle(node.querySelector('h2')).color==='rgb(255, 255, 255)'; });
  checks.push({ check: 'Alto contraste usa texto claro sobre fundo escuro no tema claro', ...await contrast(bench.locator('h2').first(), bench) });
  const pressed = await page.getByRole('button', { name: 'Alto contraste', exact: true }).getAttribute('aria-pressed');
  await page.getByRole('button', { name: 'Alto contraste', exact: true }).focus();
  await page.keyboard.press('Space');
  assert.notEqual(await page.getByRole('button', { name: 'Alto contraste', exact: true }).getAttribute('aria-pressed'), pressed);
  checks.push({ check: 'Espaço ativa o controle focado sem ser interceptado pelo experimento' });
  await page.setViewportSize({ width: 320, height: 844 });
  await overflow();
  checks.push({ check: 'Bancada avançada cabe em 320px' });
  await verifyPreview(page.request);
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ status: 'passed', build, checks, errors }, null, 2));
  console.log(JSON.stringify({ status: 'passed', checks }));
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)), fullPage: false }).catch(() => {});
  await writeFile(new URL('result.json', output), JSON.stringify({ status: 'failed', checks, errors, error: String(error) }, null, 2));
  throw error;
} finally { await browser.close(); }
