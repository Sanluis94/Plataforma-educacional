import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {compareBackendMetadata} from './preflight-backend.mjs';
import {operationalRecords} from './operational-records.mjs';
import {fixtureInstallation} from './fixtures.mjs';
import {prepareInstallations} from './prepare-installations.mjs';

const school=await fixtureInstallation('school'),home=await fixtureInstallation('home');
test('preflight compara todos os campos web sem alegar consulta remota',()=>{const result=compareBackendMetadata(school,school.firebase);assert.equal(result.sdkFieldsMatched,true);assert.equal(result.remoteResourcesVerified,false);assert.equal(result.firebaseProjectId,school.firebase.projectId);assert.equal(result.authorizedDomainRequired,new URL(school.origin).hostname);assert.ok(!JSON.stringify(result).includes(school.firebase.apiKey));});
for(const field of ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'])test(`preflight recusa ${field} de outra instalação`,()=>{assert.throws(()=>compareBackendMetadata(school,{...school.firebase,[field]:home.firebase[field]}),new RegExp(field));});
test('preflight recusa conta de serviço em lugar do SDK público',()=>{assert.throws(()=>compareBackendMetadata(school,{...school.firebase,type:'service_account',private_key:'ficticio'}),/pública/);});
test('modelos registram projeto correto e deixam resultado operacional pendente',()=>{const records=operationalRecords(school);assert.equal(Object.keys(records).length,2);for(const text of Object.values(records)){assert.ok(text.includes(school.firebase.projectId));assert.ok(!text.includes(home.firebase.projectId));assert.ok(text.includes('não executado'));assert.ok(!text.includes(school.firebase.apiKey));}assert.ok(records['BACKUP-RESTAURACAO.md'].includes('Authentication'));assert.ok(records['BACKUP-RESTAURACAO.md'].includes('RPO/RTO'));assert.ok(records['RESPOSTA-INCIDENTE.md'].includes('Controlador'));});
test('pacote privado inclui política pronta para aprovação administrativa e modelos por instalação',async()=>{
  const root=fileURLToPath(new URL('../../',import.meta.url)),parent=join(root,'.local','cloud-tests');await mkdir(parent,{recursive:true});const temporary=await mkdtemp(join(parent,'policy-'));
  try{
    const schoolPath=join(temporary,'school.json'),homePath=join(temporary,'home.json');await writeFile(schoolPath,JSON.stringify(school));await writeFile(homePath,JSON.stringify(home));
    const output=join(temporary,'prepared');await prepareInstallations([schoolPath,homePath],output);
    for(const item of [school,home]){
      const policy=JSON.parse(await readFile(join(output,item.id,'installation-policy.json'),'utf8'));assert.equal(policy.path,'installation_policy/public');assert.deepEqual(policy.data,{schemaVersion:1,installationId:item.id,mode:item.mode,staffRegistration:item.mode==='school'?'assigned-only':'students-only'});
      assert.ok((await readFile(join(output,item.id,'BACKUP-RESTAURACAO.md'),'utf8')).includes(item.firebase.projectId));assert.ok((await readFile(join(output,item.id,'RESPOSTA-INCIDENTE.md'),'utf8')).includes('não executado'));
    }
  }finally{await rm(temporary,{recursive:true,force:true});}
});
test('launcher multiprojeto fixa demo e loopback sem alterar o runner convencional',async()=>{const script=await readFile(new URL('./check-project-isolation.mjs',import.meta.url),'utf8');assert.ok(script.includes("'demo-school-a'"));assert.ok(script.includes('singleProjectMode:false'));assert.ok(script.includes("host:'127.0.0.1'"));assert.ok(script.includes('portFree'));const entry=await readFile(new URL('./project-isolation-entry.mjs',import.meta.url),'utf8');assert.ok(entry.includes("['demo-school-a','demo-home-b']"));assert.ok(entry.includes(':securityRules'));assert.ok(entry.includes('rulesSha256'));});
