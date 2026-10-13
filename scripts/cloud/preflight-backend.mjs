import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateInstallation,installationFingerprint} from './installation.mjs';

/** Compare a public Web SDK configuration exported by an authorized operator.
 * This does not authenticate or claim that remote resources are configured. */
export function compareBackendMetadata(manifest,metadata){
  const item=validateInstallation(manifest);
  if(!metadata||typeof metadata!=='object'||Array.isArray(metadata)||metadata.private_key||metadata.type==='service_account')throw new Error('Use somente a configuração pública JSON do SDK Web Firebase.');
  for(const field of ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'])if(metadata[field]!==item.firebase[field])throw new Error(`A configuração SDK não corresponde à instalação: ${field}.`);
  return {installationId:item.id,firebaseProjectId:item.firebase.projectId,webAppId:item.firebase.appId,origin:item.origin,authorizedDomainRequired:new URL(item.origin).hostname,manifestSha256:installationFingerprint(item),sdkFieldsMatched:true,remoteResourcesVerified:false,requiredManualChecks:['Projeto e aplicativo confirmados pelo operador autorizado','Firestore localizado, ativo e sem regras abertas','Authentication Google e domínio autorizado configurados','IAM, logs e retenção específicos da instalação','Regras e índices ativos correspondem ao pacote testado','Restauração e recuperação Auth documentadas']};
}
const script=fileURLToPath(import.meta.url);
if(process.argv[1]&&resolve(process.argv[1])===script){
  const args=process.argv.slice(2);
  if(args.length!==4||args[2]!=='--out'){console.error('Uso: node scripts/cloud/preflight-backend.mjs installation.json firebase-web-sdk.json --out .local/cloud/preflight.json');process.exitCode=2;}
  else {
    try{
      const target=resolve(args[3]),privateRoot=fileURLToPath(new URL('../../.local/',import.meta.url)),within=relative(privateRoot,target);
      if(!within||within.startsWith('..')||isAbsolute(within))throw new Error('O relatório deve permanecer na pasta privada .local/.');
      const manifest=JSON.parse(await readFile(resolve(args[0]),'utf8')),raw=await readFile(resolve(args[1]),'utf8');
      const result=compareBackendMetadata(manifest,JSON.parse(raw));
      const rules=await readFile(new URL('../../firestore.rules',import.meta.url),'utf8');
      result.rulesSha256=createHash('sha256').update(rules).digest('hex');result.checkedAt=new Date().toISOString();
      await mkdir(dirname(target),{recursive:true});await writeFile(target,JSON.stringify(result,null,2)+'\n');
      console.log('Configuração web conferida contra o manifesto. Backend remoto não consultado.');
    }catch(error){console.error(error.message);process.exitCode=1;}
  }
}
