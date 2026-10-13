import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateInstallation,validateInstallationSet,installationEnvironment,installationFingerprint,assertInstallationFingerprint} from './installation.mjs';
import {createServer} from 'node:http';
import {probeHttp} from './http-probe.mjs';
import {prepareInstallations} from './prepare-installations.mjs';
import {verifyCloudArtifact} from './build-installation.mjs';
import {fixtureInstallation} from './fixtures.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const school=await fixtureInstallation('school');
const home=await fixtureInstallation('home');
const fixtureParent=join(root,'.local','cloud-tests');await mkdir(fixtureParent,{recursive:true});
const fixtureDirectory=await mkdtemp(join(fixtureParent,'fixtures-'));
const schoolPath=join(fixtureDirectory,'school.json'),homePath=join(fixtureDirectory,'home.json');
await writeFile(schoolPath,JSON.stringify(school));await writeFile(homePath,JSON.stringify(home));
after(()=>rm(fixtureDirectory,{recursive:true,force:true}));
const clone=()=>structuredClone(school);

test('probe preserva o Host destinado à escola, sem trocá-lo pelo loopback',async()=>{
  const server=createServer((request,response)=>{response.setHeader('Content-Type','application/json');response.end(JSON.stringify({host:request.headers.host,forwarded:request.headers['x-forwarded-host']}));});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  try{const response=await probeHttp(`http://127.0.0.1:${server.address().port}/installation.json`,{Host:'escola.example.org','X-Forwarded-Host':'outra.example.org'});assert.equal(response.status,200);assert.deepEqual(await response.json(),{host:'escola.example.org',forwarded:'outra.example.org'});assert.throws(()=>probeHttp('https://example.org/'),/loopback/);}finally{await new Promise(done=>server.close(done));}
});

test('cache de compilação exige fingerprint atual e diferente por instalação/configuração',()=>{
  assert.notEqual(installationFingerprint(school),installationFingerprint(home));
  assert.doesNotThrow(()=>assertInstallationFingerprint(school,installationFingerprint(school)));
  assert.throws(()=>assertInstallationFingerprint(home,installationFingerprint(school)),/cache/);
  const changed=clone();changed.name='Novo nome da escola';assert.throws(()=>assertInstallationFingerprint(changed,installationFingerprint(school)),/cache/);
  assert.throws(()=>assertInstallationFingerprint(school,undefined),/cache/);
});

test('contato público não aceita injeção de parâmetros em links de email',()=>{
  const item=clone();item.controller.privacyContactEmail='nome?subject=outro@example.test';assert.throws(()=>validateInstallation(item),/email inválido/);
});
test('instalações escolar e doméstica usam projetos, aplicativos e origens distintos',()=>assert.equal(validateInstallationSet([school,home]).length,2));
test('configuração compilada não inclui chaves privadas ou emuladores',()=>{
  const env=installationEnvironment(school);assert.equal(env.VITE_FIREBASE_PROJECT_ID,school.firebase.projectId);assert.equal(env.VITE_INSTALLATION_MODE,'school');assert.equal(env.VITE_GEMINI_API_KEY,'');assert.equal(env.VITE_DISABLE_AI,'true');assert.equal(env.VITE_USE_FIREBASE_EMULATORS,'false');assert.equal(env.VITE_DATA_CONTROLLER_NAME,'');assert.equal(env.VITE_PUBLIC_RELEASE_STAGE,'pilot');
});
test('comercial exige responsável, email e registro da revisão jurídica',()=>{const item=clone();item.releaseStage='commercial';assert.throws(()=>validateInstallation(item),/Liberação comercial/);item.controller={name:'Responsável fictício',document:'',privacyContactEmail:'privacidade@example.test'};item.operationalReadiness={legalApproved:true,securityApproved:true,dataProcessingApproved:true,backupRestoreTested:true,legalApprovalReference:'Revisão fictícia para teste'};assert.equal(validateInstallation(item).releaseStage,'commercial');});
for(const field of ['legalApproved','securityApproved','dataProcessingApproved','backupRestoreTested'])test(`comercial recusa requisito pendente: ${field}`,()=>{const item=clone();item.releaseStage='commercial';item.controller={name:'Responsável fictício',document:'',privacyContactEmail:'privacidade@example.test'};item.operationalReadiness={legalApproved:true,securityApproved:true,dataProcessingApproved:true,backupRestoreTested:true,legalApprovalReference:'Teste'};item.operationalReadiness[field]=false;assert.throws(()=>validateInstallation(item),/Liberação comercial/);});
for(const [label,modify]of [
  ['segredo de IA',item=>{item.geminiApiKey='não-permitido';}],['conta de serviço',item=>{item.firebase.private_key='não-permitido';}],['emulador',item=>{item.firebase.projectId='demo-kortex';}],['projeto compartilhado antigo',item=>{item.firebase.projectId='plataforma-educacional-73df6';}],['authDomain de outra escola',item=>{item.firebase.authDomain=home.firebase.authDomain;}],['bucket de outra escola',item=>{item.firebase.storageBucket=home.firebase.storageBucket;}],['appId incompatível',item=>{item.firebase.appId=home.firebase.appId;}],['origem HTTP',item=>{item.origin='http://example.org';}],['origem com caminho',item=>{item.origin='https://example.org/escola';}],['nome com newline',item=>{item.name='Nome\nquebrado';}],['domínio com caractere Nginx',item=>{item.origin='https://example.org;';}],['domínio com label inválida',item=>{item.origin='https://escola-.example.org';}],['origem IP',item=>{item.origin='https://10.1.2.3';}]
])test(`manifesto recusa ${label}`,()=>{const item=clone();modify(item);assert.throws(()=>validateInstallation(item));});
test('inventário recusa compartilhar projeto, origem, aplicativo ou número de projeto',()=>{
  assert.throws(()=>validateInstallationSet([school,school]),/repetido/);
  for(const change of [item=>{item.origin=school.origin;},item=>{item.firebase={...school.firebase};},item=>{item.firebase.messagingSenderId=school.firebase.messagingSenderId;item.firebase.appId=school.firebase.appId;}]){const item=structuredClone(home);change(item);assert.throws(()=>validateInstallationSet([school,item]),/repetido/);}
});
test('preparação escreve inventário privado e cópias das regras sem alias compartilhado',async()=>{
  const parent=join(root,'.local','cloud-tests');await mkdir(parent,{recursive:true});const temporary=await mkdtemp(join(parent,'prepare-'));const output=join(temporary,'prepared');
  try{const result=await prepareInstallations([schoolPath,homePath],output);assert.equal(result.count,2);const inventory=JSON.parse(await readFile(join(output,'isolation-inventory.json'),'utf8'));assert.equal(inventory.installations.length,2);assert.equal(inventory.installations[0].manifestSha256,installationFingerprint(school));const config=JSON.parse(await readFile(join(output,school.id,'firebase.json'),'utf8'));assert.ok(!config.hosting);assert.equal(await readFile(join(output,school.id,'firestore.rules'),'utf8'),await readFile(join(root,'firestore.rules'),'utf8'));await assert.rejects(()=>prepareInstallations([schoolPath],output),error=>error.code==='EEXIST');}finally{await rm(temporary,{recursive:true,force:true});}
});
test('preparação não escreve em public/ nem fora da pasta privada',async()=>{await assert.rejects(()=>prepareInstallations([schoolPath],join(root,'public','cloud')),/privada/);});
test('preparação cria pastas privadas pai sem exigir diretório cloud pré-existente',async()=>{
  const parent=join(root,'.local','cloud-tests');await mkdir(parent,{recursive:true});const temporary=await mkdtemp(join(parent,'parent-'));
  try{const result=await prepareInstallations([schoolPath],join(temporary,'nested','prepared'));assert.equal(result.count,1);}finally{await rm(temporary,{recursive:true,force:true});}
});
test('artefato verifica instalação e rejeita outra chave, conta de serviço e exportação',async()=>{
  const parent=join(root,'.local','cloud-tests');await mkdir(parent,{recursive:true});const temporary=await mkdtemp(join(parent,'artifact-'));
  try{
    await writeFile(join(temporary,'installation.json'),JSON.stringify({id:school.id,firebaseProjectId:school.firebase.projectId,origin:school.origin,manifestSha256:installationFingerprint(school)}));
    await writeFile(join(temporary,'app.js'),JSON.stringify(installationEnvironment(school)));assert.equal((await verifyCloudArtifact(temporary,school)).files,2);
    await writeFile(join(temporary,'app.js'),home.firebase.apiKey);await assert.rejects(()=>verifyCloudArtifact(temporary,school),/chave diferente/);
    await writeFile(join(temporary,'app.js'),'-----BEGIN PRIVATE KEY-----');await assert.rejects(()=>verifyCloudArtifact(temporary,school),/credencial privada/);
    await writeFile(join(temporary,'app.js'),'configuração pública');await mkdir(join(temporary,'local-data'));await writeFile(join(temporary,'local-data','export.json'),'{}');await assert.rejects(()=>verifyCloudArtifact(temporary,school),/privado|locais/);
  }finally{await rm(temporary,{recursive:true,force:true});}
});
test('Docker usa cópias limitadas, usuário sem root e montagem temporária do manifesto',async()=>{
  const docker=await readFile(join(root,'Dockerfile'),'utf8'),ignore=await readFile(join(root,'.dockerignore'),'utf8');
  assert.ok(!/^COPY\s+\.\s/m.test(docker));assert.match(docker,/type=secret,id=installation,required=true/);assert.match(docker,/USER 101:101/);assert.match(ignore,/^\*\*$/m);for(const pattern of ['**/.env*','**/*service*account*','public/local-data/**'])assert.ok(ignore.includes(pattern));
});
test('nginx usa health separado, rotas SPA, arquivos ausentes404 e cache sem instalação compartilhada',async()=>{
  const nginx=await readFile(join(root,'deploy/nginx.conf'),'utf8');assert.match(nginx,/listen 8080/);assert.match(nginx,/location = \/healthz/);assert.match(nginx,/location \^~ \/assets\/ \{ try_files \$uri =404;/);assert.match(nginx,/location \/ \{ try_files \$uri \$uri\/ \/index.html;/);assert.match(nginx,/\/installation.json "no-store"/);
});
