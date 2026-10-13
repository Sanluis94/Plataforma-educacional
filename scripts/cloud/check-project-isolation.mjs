import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,join,delimiter} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import net from 'node:net';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
function portFree(port){return new Promise((done,reject)=>{const server=net.createServer();server.once('error',()=>reject(new Error(`A porta local ${port} está ocupada. Aguarde o outro emulador terminar.`)));server.listen(port,'127.0.0.1',()=>server.close(done));});}
async function run(){
  if(process.argv.length!==2)throw new Error('Este teste não aceita projeto ou endpoint externo. Use node scripts/cloud/check-project-isolation.mjs.');
  const cli=join(root,'node_modules/firebase-tools/lib/bin/firebase.js');
  if(!existsSync(cli))throw new Error('Execute npm ci antes do teste.');
  await Promise.all([8080,9099].map(portFree));
  const directory=join(root,'.local','cloud-isolation');await mkdir(directory,{recursive:true});
  const config=join(directory,'firebase.json');
  await writeFile(config,JSON.stringify({firestore:{rules:join(root,'firestore.rules'),indexes:join(root,'firestore.indexes.json')},emulators:{auth:{host:'127.0.0.1',port:9099},firestore:{host:'127.0.0.1',port:8080},ui:{enabled:false},singleProjectMode:false}},null,2));
  for(const field of ['GOOGLE_APPLICATION_CREDENTIALS','FIREBASE_CONFIG','FIREBASE_TOKEN','FIREBASE_AUTH_EMULATOR_HOST','FIRESTORE_EMULATOR_HOST'])delete process.env[field];
  process.env.GCLOUD_PROJECT='demo-school-a';process.env.GOOGLE_CLOUD_PROJECT='demo-school-a';
  const java=process.env.JAVA_HOME&&join(process.env.JAVA_HOME,'bin');
  if(java&&existsSync(join(java,process.platform==='win32'?'java.exe':'java')))process.env.PATH=`${java}${delimiter}${process.env.PATH??''}`;
  process.chdir(root);
  process.argv=[process.execPath,cli,'emulators:exec','--project','demo-school-a','--only','auth,firestore','--config',config,'--non-interactive','node scripts/cloud/project-isolation-entry.mjs'];
  await import(pathToFileURL(cli).href);
}
run().catch(error=>{console.error(error.message);process.exitCode=1;});
