import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {root,origin,readCatalog,verifyPreview,isolateBrowserData} from './browser-fixture.mjs';
const output=new URL('.local/labs/polish-benches/',root);await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});await isolateBrowserData(context);
const page=await context.newPage();page.setDefaultTimeout(15000);const checks=[],errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
  await verifyPreview(page.request);await page.goto(origin+'/simulacao');await page.getByRole('button',{name:'Entrar localmente',exact:true}).click();
  const labs=(await readCatalog()).filter(lab=>lab.source==='legacy');
  for(const lab of labs){
    await page.goto(origin+'/simulacao?lab='+lab.id);await page.getByRole('button',{name:'Abrir bancada',exact:true}).click();
    await page.getByRole('button',{name:'Roteiro e avaliação',exact:true}).waitFor();
    await page.waitForFunction(()=>[...document.querySelectorAll('main h2,main h3')].some(node=>node.getBoundingClientRect().height>0));
    await page.waitForTimeout(70);
    assert.equal(await page.getByText(/\+50 XP|\+10 Moedas|IA ADAPTATIVA|Avaliação de IA comportamental/).count(),0,lab.id+': promessa não corresponde à exploração');
    assert.ok((await page.locator('main').textContent()).trim().length>200,lab.id+': bancada vazia');
    {
      await page.setViewportSize({width:320,height:844});const width=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));assert.ok(width.document<=width.viewport+1,lab.id+': '+JSON.stringify(width));
      if(lab.id.endsWith('_1'))await page.screenshot({path:fileURLToPath(new URL(lab.id+'-320.png',output)),fullPage:false,animations:'disabled'});await page.setViewportSize({width:1280,height:900});
    }
    await page.getByRole('button',{name:'Roteiro e avaliação',exact:true}).click();await page.getByRole('region',{name:'Laboratório: '+lab.title,exact:true}).waitFor();
    checks.push({id:lab.id,status:'passed'});if(checks.length%12===0)console.log('Bancadas abertas e retorno ao roteiro: '+checks.length+'/72');
  }
  assert.equal(checks.length,72);assert.deepEqual(errors,[]);await verifyPreview(page.request);
}catch(error){checks.push({status:'failed',url:page.url(),error:String(error)});await page.screenshot({path:fileURLToPath(new URL('failure.png',output)),fullPage:false});console.error(String(error));process.exitCode=1;}
finally{await writeFile(new URL('report.json',output),JSON.stringify({checkedAt:new Date().toISOString(),checks,errors,scope:'72 legacy benches render at desktop and 320px, then return to their individual lessons; fictional local data only'},null,2));await browser.close();}
