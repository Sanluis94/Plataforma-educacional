import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {initializeApp,deleteApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';

assert.equal(process.env.GCLOUD_PROJECT,'demo-school-a');
assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');
assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,'127.0.0.1:9099');
const projects=['demo-school-a','demo-home-b'];
const authOrigin='http://127.0.0.1:9099',storeOrigin='http://127.0.0.1:8080';
const checks=[],apps=[],tokens={},users={},suffix=randomUUID();
const rules=await readFile(new URL('../../firestore.rules',import.meta.url),'utf8');
const report={schemaVersion:1,projects,checkedAt:new Date().toISOString(),rulesSha256:createHash('sha256').update(rules).digest('hex'),checks,externalResourcesAccessed:false,firestoreAudienceIsolationVerified:false,audienceProbes:[],limitations:[]};
async function request(url,method='GET',body,token){
  if(!url.startsWith(authOrigin+'/')&&!url.startsWith(storeOrigin+'/'))throw new Error('Endpoint externo recusado.');
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
  const data=await response.json().catch(()=>null);return {status:response.status,data};
}
const authUrl=operation=>`${authOrigin}/identitytoolkit.googleapis.com/v1/accounts:${operation}?key=demo-local-api-key`;
const docUrl=(project,path)=>`${storeOrigin}/v1/projects/${project}/databases/(default)/documents/${path}`;
const fields=object=>Object.fromEntries(Object.entries(object).map(([key,value])=>[key,typeof value==='number'?{integerValue:String(value)}:typeof value==='string'?{stringValue:value}:Array.isArray(value)?{arrayValue:{values:value.map(item=>({stringValue:item}))}}:{booleanValue:value}]));
async function check(name,run){await run();checks.push({name,status:'passed'});console.log('OK: '+name);}
async function denied(name,run){await check(name,async()=>{const result=await run();assert.ok([401,403].includes(result.status),`Acesso deveria ser negado, mas retornou HTTP${result.status}.`);});}
try{
  for(const project of projects){
    const loaded=await request(`${storeOrigin}/emulator/v1/projects/${project}:securityRules`,'PUT',{rules:{files:[{name:'firestore.rules',content:rules}]}});
    assert.equal(loaded.status,200);assert.ok(!(loaded.data?.issues??[]).some(issue=>issue.severity==='ERROR'));
    await check(`regras do repositório carregadas em ${project}`,async()=>{const result=await request(docUrl(project,'progress/not-authenticated'));assert.equal(result.status,403);});
    // The emulator's local owner credential selects the namespace for fixture
    // creation. It is never used for client reads/writes or sent off loopback.
    const signup=await request(authUrl('signUp'),'POST',{email:`isolamento-${suffix}@example.test`,password:'FicticioLocal123!',returnSecureToken:true,targetProjectId:project},'owner');
    assert.equal(signup.status,200,signup.data?.error?.message??'Falha no cadastro fictício local.');users[project]=signup.data.localId;
    const signin=await request(authUrl('signInWithPassword'),'POST',{email:`isolamento-${suffix}@example.test`,password:'FicticioLocal123!',returnSecureToken:true,targetProjectId:project},'owner');
    assert.equal(signin.status,200,signin.data?.error?.message??'Falha no login fictício local.');tokens[project]=signin.data.idToken;
    const decoded=JSON.parse(Buffer.from(tokens[project].split('.')[1],'base64url').toString('utf8'));assert.equal(decoded.aud,project);
    const admin=initializeApp({projectId:project},project);apps.push(admin);
    await denied(`projeto sem política bloqueia cadastro inclusive de estudante em ${project}`,()=>request(docUrl(project,`users/${users[project]}`),'PATCH',{fields:fields({name:'Estudante fictício',email:`isolamento-${suffix}@example.test`,role:'estudante'})},tokens[project]));
    const mode=project==='demo-school-a'?'school':'home';
    const policy={schemaVersion:1,installationId:project,mode,staffRegistration:mode==='school'?'assigned-only':'students-only'};
    assert.equal((await request(docUrl(project,'installation_policy/public'),'PATCH',{fields:fields(policy)},'owner')).status,200);
    await check(`política pública pode ser consultada sem sessão em ${project}`,async()=>{const result=await request(docUrl(project,'installation_policy/public'));assert.equal(result.status,200);assert.equal(result.data.fields.mode.stringValue,mode);});
    await denied(`políticas não podem ser enumeradas por visitante em ${project}`,()=>request(docUrl(project,'installation_policy')));
    await denied(`cliente não altera a política de instalação em ${project}`,()=>request(docUrl(project,'installation_policy/public'),'PATCH',{fields:fields({...policy,mode:mode==='home'?'school':'home'})},tokens[project]));
    const profile={name:'Estudante fictício de isolamento',email:`isolamento-${suffix}@example.test`,role:'estudante',createdAt:new Date().toISOString()};
    for(const role of ['professor','coordenador','admin'])await denied(`autorregistro ${role} bloqueado em ${mode}`,()=>request(docUrl(project,`users/${users[project]}`),'PATCH',{fields:fields({...profile,role})},tokens[project]));
    await check(`estudante pode criar seu próprio perfil em ${mode}`,async()=>assert.equal((await request(docUrl(project,`users/${users[project]}`),'PATCH',{fields:fields(profile)},tokens[project])).status,200));
    const staffSignup=await request(authUrl('signUp'),'POST',{email:`equipe-${suffix}@example.test`,password:'FicticioLocal123!',returnSecureToken:true,targetProjectId:project},'owner');assert.equal(staffSignup.status,200);
    const staffSignin=await request(authUrl('signInWithPassword'),'POST',{email:`equipe-${suffix}@example.test`,password:'FicticioLocal123!',returnSecureToken:true,targetProjectId:project},'owner');assert.equal(staffSignin.status,200);
    const staffUid=staffSignup.data.localId,staffToken=staffSignin.data.idToken;
    assert.equal((await request(docUrl(project,`users/${staffUid}`),'PATCH',{fields:fields({name:'Equipe fictícia atribuída',email:`equipe-${suffix}@example.test`,role:'professor',createdAt:new Date().toISOString()})},'owner')).status,200);
    await check(`perfil docente previamente atribuído é preservado em ${mode}`,async()=>{const result=await request(docUrl(project,`users/${staffUid}`),'GET',undefined,staffToken);assert.equal(result.status,200);assert.equal(result.data.fields.role.stringValue,'professor');});
  }
  await check('mesmo email recebe cadastros e UIDs distintos nos dois projetos',async()=>assert.notEqual(users[projects[0]],users[projects[1]]));
  for(const [index,project]of projects.entries()){
    await check(`token correto é validado em ${project}`,async()=>assert.equal((await getAuth(apps[index]).verifyIdToken(tokens[project])).aud,project));
    await check(`token de outro projeto não é validado em ${project}`,async()=>{await assert.rejects(()=>getAuth(apps[index]).verifyIdToken(tokens[projects[1-index]]),error=>error.code==='auth/argument-error'&&/audience|aud/.test(error.message));});
    await check(`cadastro Auth de outra instalação não existe em ${project}`,async()=>{await assert.rejects(()=>getAuth(apps[index]).getUser(users[projects[1-index]]),error=>error.code==='auth/user-not-found');});
    const progress={level:1,xp:index===0?80:25,coins:index===0?30:10,completedModules:[],purchasedItems:[],enrolledClasses:[],updatedAt:new Date().toISOString()};
    await check(`gravação e leitura do próprio progresso em ${project}`,async()=>{const write=await request(docUrl(project,`progress/${users[project]}`),'PATCH',{fields:fields(progress)},tokens[project]);assert.equal(write.status,200);const read=await request(docUrl(project,`progress/${users[project]}`),'GET',undefined,tokens[project]);assert.equal(read.status,200);assert.equal(read.data.fields.xp.integerValue,String(progress.xp));});
  }
  const [school,home]=projects;
  for(const [source,target]of [[school,home],[home,school]]){
    const uid=users[source],path=`progress/${uid}`,progress={level:1,xp:80,coins:30,completedModules:[],purchasedItems:[],enrolledClasses:[],updatedAt:new Date().toISOString()};
    assert.equal((await request(docUrl(target,path),'GET',undefined,'owner')).status,404);
    const attempt=await request(docUrl(target,path),'PATCH',{fields:fields(progress)},tokens[source]);
    const deniedByAudience=[401,403].includes(attempt.status);
    report.audienceProbes.push({sourceProject:source,targetProject:target,tokenAudience:source,resourceUidMatchesToken:true,authUserInTarget:false,httpStatus:attempt.status,result:deniedByAudience?'denied':'emulator-accepted-foreign-audience'});
    if(!deniedByAudience){
      assert.equal(attempt.status,200);
      const read=await request(docUrl(target,path),'GET',undefined,tokens[source]);assert.equal(read.status,200);
      assert.equal((await request(docUrl(target,path),'DELETE',undefined,'owner')).status,200);
      const limitation=`O emulador Firestore aceitou token sem assinatura de ${source} no namespace ${target} quando o UID do recurso coincidiu. A rejeição por audiência no endpoint Firestore não foi comprovada localmente.`;
      report.limitations.push(limitation);console.log('LIMITAÇÃO: '+limitation);
    }else console.log(`OK: audiência ${source} recusada pelo Firestore ${target}.`);
  }
  report.firestoreAudienceIsolationVerified=report.audienceProbes.every(probe=>probe.result==='denied');
  await denied('token escolar não lê progresso doméstico',()=>request(docUrl(home,`progress/${users[home]}`),'GET',undefined,tokens[school]));
  await denied('token doméstico não lê progresso escolar',()=>request(docUrl(school,`progress/${users[school]}`),'GET',undefined,tokens[home]));
  await denied('token escolar não escreve progresso doméstico',()=>request(docUrl(home,`progress/${users[home]}`),'PATCH',{fields:fields({level:1,xp:999,coins:999,completedModules:[],purchasedItems:[],enrolledClasses:[],updatedAt:new Date().toISOString()})},tokens[school]));
  await check('progresso escolar não existe no namespace doméstico',async()=>assert.equal((await request(docUrl(home,`progress/${users[school]}`),'GET',undefined,'owner')).status,404));
  await check('progresso doméstico conserva seus dados após operação na escola',async()=>{assert.equal((await request(docUrl(school,`progress/${users[school]}`),'DELETE',undefined,tokens[school])).status,200);const read=await request(docUrl(home,`progress/${users[home]}`),'GET',undefined,tokens[home]);assert.equal(read.status,200);assert.equal(read.data.fields.xp.integerValue,'25');});
  report.outcome=report.limitations.length?'passed-with-emulator-limitation':'passed';
}catch(error){report.error=error.message;report.outcome='failed';process.exitCode=1;console.error(error.message);}
finally{report.checkedAt=new Date().toISOString();await mkdir(new URL('../../.local/cloud-isolation/',import.meta.url),{recursive:true});await writeFile(new URL('../../.local/cloud-isolation/report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');await Promise.all(apps.map(deleteApp));}
