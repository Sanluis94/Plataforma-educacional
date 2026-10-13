import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateInstallation,installationFingerprint} from './installation.mjs';
import {probeHttp} from './http-probe.mjs';

function docker(args){return new Promise((done,reject)=>{const child=spawn('docker',args,{shell:false,windowsHide:true,stdio:['ignore','pipe','pipe']});let out='',error='';const timer=setTimeout(()=>{child.kill();reject(new Error('Docker não respondeu em60segundos.'));},60000);child.stdout.on('data',chunk=>{out+=chunk;});child.stderr.on('data',chunk=>{error+=chunk;});child.once('error',()=>{clearTimeout(timer);reject(new Error('Docker não está disponível; a validação real do container continua pendente.'));});child.once('exit',code=>{clearTimeout(timer);code===0?done(out.trim()):reject(new Error(error.trim()||'Docker não concluiu a operação.'));});});}
async function checkContainer(manifest,image){
  const item=validateInstallation(JSON.parse(await readFile(resolve(manifest),'utf8'))),name=`kortex-check-${randomUUID()}`;
  const checks=[];
  await docker(['version','--format','{{.Server.Version}}']);
  await docker(['run','--rm','-d','--name',name,'--read-only','--cap-drop=ALL','--security-opt=no-new-privileges','--tmpfs','/tmp:rw,noexec,nosuid,size=32m','-p','127.0.0.1::8080','-e',`KORTEX_INSTALLATION_ID=${item.id}`,'-e',`KORTEX_FIREBASE_PROJECT_ID=${item.firebase.projectId}`,'-e',`KORTEX_PUBLIC_ORIGIN=${item.origin}`,image]);
  try{
    const info=JSON.parse(await docker(['inspect',name]))[0];
    if(info.Config.User!=='101:101'||info.HostConfig.ReadonlyRootfs!==true)throw new Error('Container precisa de usuário101 e filesystem somente leitura.');
    checks.push('usuário sem root e filesystem somente leitura');
    const port=info.NetworkSettings.Ports['8080/tcp'][0].HostPort,origin=`http://127.0.0.1:${port}`;
    const request=(path,host=new URL(item.origin).hostname)=>probeHttp(origin+path,{Host:host});
    for(let retry=0;retry<30;retry++){try{if((await request('/healthz','127.0.0.1')).status===200)break;}catch{/* Wait for local nginx, not a cloud resource. */}if(retry===29)throw new Error('Nginx não respondeu ao health check.');await new Promise(done=>setTimeout(done,250));}
    if((await request('/','another-school.example.org')).status!==421||(await request('/','127.0.0.1')).status!==421)throw new Error('Nginx precisa recusar o domínio de outra instalação.');
    const spoof=await probeHttp(origin+'/',{Host:'wrong.example.org','X-Forwarded-Host':new URL(item.origin).hostname});
    if(spoof.status!==421)throw new Error('X-Forwarded-Host não pode trocar a instalação autorizada.');
    checks.push('host de outra instalação recusado, sem confiar em X-Forwarded-Host');
    const metadataResponse=await request('/installation.json');
    if(metadataResponse.status!==200)throw new Error(`Metadados da instalação responderam HTTP${metadataResponse.status}.`);
    const metadata=await metadataResponse.json();
    if(metadata.id!==item.id||metadata.firebaseProjectId!==item.firebase.projectId||metadata.origin!==item.origin||metadata.manifestSha256!==installationFingerprint(item))throw new Error('Container vinculado a outra instalação.');
    if(metadataResponse.headers.get('cache-control')!=='no-store')throw new Error('Metadata da instalação precisa de no-store.');
    checks.push('identidade da instalação e cache de metadados');
    for(const route of ['/estudante','/professor','/verificar-certificado?codigo=ficticio']){const response=await request(route);if(response.status!==200||!response.headers.get('content-type')?.includes('text/html'))throw new Error('Rota SPA não serviu HTML.');if(response.headers.get('x-frame-options')!=='DENY'||!response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'")||response.headers.get('x-content-type-options')!=='nosniff')throw new Error('Headers de segurança da SPA não estão ativos.');}
    checks.push('rotas profundas da aplicação');
    const html=await request('/').then(response=>response.text()),asset=html.match(/src="(\/assets\/[^" ]+\.js)"/)?.[1];
    if(!asset||(await request(asset)).headers.get('cache-control')!=='public, max-age=31536000, immutable')throw new Error('Asset compilado não tem cache imutável.');
    checks.push('headers de segurança e cache do asset compilado');
    for(const route of ['/assets/missing.js','/local-data/etl/index.json','/.env','/missing.json'])if((await request(route)).status!==404)throw new Error('Arquivo privado/inexistente deve responder404.');
    checks.push('arquivos privados e ausentes respondem404');
  }finally{await docker(['stop','--time','5',name]).catch(()=>{});}
  for(const [field,wrong]of [['KORTEX_INSTALLATION_ID','wrong'],['KORTEX_FIREBASE_PROJECT_ID','other-project'],['KORTEX_PUBLIC_ORIGIN','https://other.example.org']]){
    const env={KORTEX_INSTALLATION_ID:item.id,KORTEX_FIREBASE_PROJECT_ID:item.firebase.projectId,KORTEX_PUBLIC_ORIGIN:item.origin,[field]:wrong};
    const failure=await docker(['run','--rm','--name',name+'-'+field.toLowerCase(),...Object.entries(env).flatMap(([key,value])=>['-e',`${key}=${value}`]),image]).then(()=>false,error=>error.message.includes('não correspondem'));
    if(!failure)throw new Error('Uma imagem não pode iniciar sob a identidade de outra instalação.');
    checks.push('inicialização recusa configuração incorreta: '+field);
  }
  const directory=fileURLToPath(new URL('../../.local/cloud/',import.meta.url));await mkdir(directory,{recursive:true});await writeFile(resolve(directory,`container-check-${item.id}.json`),JSON.stringify({checkedAt:new Date().toISOString(),installationId:item.id,image,checks},null,2)+'\n');
  console.log(`Container validado: ${checks.length} verificações locais.`);
}
const args=process.argv.slice(2);
if(args.length!==3||args[1]!=='--image'||!args[2]){console.error('Uso: node scripts/cloud/check-container.mjs installation.json --image kortex/escola:REVISAO');process.exitCode=2;}
else checkContainer(args[0],args[2]).catch(error=>{console.error(error.message);process.exitCode=1;});
