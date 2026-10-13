import {spawn} from 'node:child_process';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,dirname,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateInstallation,installationEnvironment,installationFingerprint} from './installation.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export async function verifyCloudArtifact(directory,installation){
  const item=validateInstallation(installation),files=[];
  async function visit(path){for(const entry of await readdir(path,{withFileTypes:true})){const target=join(path,entry.name);if(entry.isSymbolicLink())throw new Error('Artefato não aceita links simbólicos.');if(entry.isDirectory())await visit(target);else files.push(target);}}
  await visit(directory);
  for(const file of files){
    const name=relative(directory,file).replaceAll('\\','/');
    if(/(^|\/)(\.env[^/]*|local-data|node_modules|\.git|\.local)(\/|$)/.test(name)||/service.account|credential|private.key/i.test(name))throw new Error('Artefato contém arquivo privado ou dados locais.');
    if(/\.(json|js|html|txt|md|map)$/.test(name)){
      const text=await readFile(file,'utf8');
      if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|"type"\s*:\s*"service_account"|"private_key"\s*:/.test(text))throw new Error('Artefato contém credencial privada.');
      const apiKeys=text.match(/AIza[A-Za-z0-9_-]{35}/g)??[];
      if(apiKeys.some(key=>key!==item.firebase.apiKey))throw new Error('Artefato contém uma chave diferente da configuração pública autorizada.');
    }
  }
  const metadata=JSON.parse(await readFile(join(directory,'installation.json'),'utf8'));
  if(metadata.id!==item.id||metadata.firebaseProjectId!==item.firebase.projectId||metadata.origin!==item.origin||metadata.manifestSha256!==installationFingerprint(item))throw new Error('Artefato pertence a outra instalação ou manifesto.');
  return {files:files.length};
}

async function buildInstallation(path){
  const installation=validateInstallation(JSON.parse(await readFile(resolve(path),'utf8')));
  for(const key of Object.keys(process.env))if(key.startsWith('VITE_')||['GOOGLE_APPLICATION_CREDENTIALS','FIREBASE_CONFIG','FIREBASE_TOKEN','GEMINI_API_KEY'].includes(key))delete process.env[key];
  Object.assign(process.env,installationEnvironment(installation),{NODE_ENV:'production'});
  const sourceRevision=process.env.KORTEX_SOURCE_REVISION??'unrecorded';
  if(sourceRevision!=='unrecorded'&&!/^[a-f0-9]{40}$/.test(sourceRevision))throw new Error('KORTEX_SOURCE_REVISION: use o SHA completo.');
  const code=await new Promise((done,reject)=>{const child=spawn(process.execPath,[join(root,'node_modules/typescript/bin/tsc'),'-b'],{cwd:root,stdio:'inherit',shell:false,windowsHide:true});child.once('error',reject);child.once('exit',status=>done(status??1));});
  if(code!==0)throw new Error('A verificação TypeScript falhou; o artefato não foi liberado.');
  // Vite must never load the developer's .env or inherit unrelated VITE values.
  const {build}=await import('vite');
  await build({root,mode:'production',envDir:false,define:Object.fromEntries(Object.entries(installationEnvironment(installation)).map(([key,value])=>[`import.meta.env.${key}`,JSON.stringify(value)]))});
  const output=join(root,'dist');
  await writeFile(join(output,'installation.json'),JSON.stringify({schemaVersion:1,id:installation.id,name:installation.name,mode:installation.mode,releaseStage:installation.releaseStage,origin:installation.origin,firebaseProjectId:installation.firebase.projectId,manifestSha256:installationFingerprint(installation),sourceRevision},null,2)+'\n');
  await mkdir(join(root,'.local','cloud-binding'),{recursive:true});
  await writeFile(join(root,'.local','cloud-binding','installation-binding'),[installation.id,installation.firebase.projectId,installation.origin,new URL(installation.origin).hostname].join('\n')+'\n');
  const result=await verifyCloudArtifact(output,installation);
  console.log(`Artefato validado: instalação ${installation.id}, ${result.files} arquivos. Sem provisionamento.`);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.length!==3){console.error('Uso: node scripts/cloud/build-installation.mjs /caminho/installation.json');process.exitCode=2;}
  else buildInstallation(process.argv[2]).catch(error=>{console.error(error.message);process.exitCode=1;});
}
