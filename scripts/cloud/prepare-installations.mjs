import {mkdir,readFile,writeFile,copyFile,lstat} from 'node:fs/promises';
import {resolve,dirname,join,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {validateInstallationSet,installationFingerprint} from './installation.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export async function prepareInstallations(paths,output){
  const installations=validateInstallationSet(await Promise.all(paths.map(async path=>JSON.parse(await readFile(resolve(path),'utf8')))));
  const destination=resolve(output),privateRoot=join(root,'.local');
  const localPath=relative(privateRoot,destination);
  if(!localPath||localPath.startsWith('..')||isAbsolute(localPath))throw new Error('A preparação deve usar uma subpasta privada em .local/.');
  let candidate=privateRoot;
  for(const segment of ['',...localPath.split(/[\\/]/).slice(0,-1)]){
    if(segment)candidate=join(candidate,segment);
    const info=await lstat(candidate).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
    if(info?.isSymbolicLink())throw new Error('A pasta de preparação não pode atravessar links simbólicos.');
  }
  const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();
  const dirty=Boolean(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8',windowsHide:true}).trim());
  await mkdir(dirname(destination),{recursive:true});
  await mkdir(destination,{recursive:false});
  for(const installation of installations){
    const directory=join(destination,installation.id);await mkdir(directory);
    await writeFile(join(directory,'installation.json'),JSON.stringify(installation,null,2)+'\n');
    await Promise.all(['firestore.rules','firestore.indexes.json'].map(file=>copyFile(join(root,file),join(directory,file))));
    await writeFile(join(directory,'firebase.json'),JSON.stringify({firestore:{rules:'firestore.rules',indexes:'firestore.indexes.json'}},null,2)+'\n');
    await writeFile(join(directory,'container.env'),`KORTEX_INSTALLATION_ID=${installation.id}\nKORTEX_FIREBASE_PROJECT_ID=${installation.firebase.projectId}\nKORTEX_PUBLIC_ORIGIN=${installation.origin}\n`);
    await writeFile(join(directory,'deployment-plan.json'),JSON.stringify({installationId:installation.id,mode:installation.mode,releaseStage:installation.releaseStage,origin:installation.origin,firebaseProjectId:installation.firebase.projectId,manifestSha256:installationFingerprint(installation),sourceRevision,workingTreeDirty:dirty,container:{port:8080,healthPath:'/healthz',readOnlyRootFilesystem:true,tmpfs:'/tmp',environment:{KORTEX_INSTALLATION_ID:installation.id,KORTEX_FIREBASE_PROJECT_ID:installation.firebase.projectId,KORTEX_PUBLIC_ORIGIN:installation.origin}},backend:{provider:'Firebase/Google Cloud',authentication:'projeto dedicado',database:'Firestore dedicado',requiredAuthorizedDomain:new URL(installation.origin).hostname},cloudTargets:['AWS ECS/Fargate com ALB HTTPS','Azure Container Apps com ingress HTTPS'],provisioned:false},null,2)+'\n');
  }
  await writeFile(join(destination,'isolation-inventory.json'),JSON.stringify({schemaVersion:1,sourceRevision,workingTreeDirty:dirty,installations:installations.map(item=>({id:item.id,mode:item.mode,origin:item.origin,firebaseProjectId:item.firebase.projectId,manifestSha256:installationFingerprint(item)}))},null,2)+'\n');
  return {directory:destination,count:installations.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),index=args.indexOf('--out');
  if(index<0||!args[index+1]||index!==args.length-2){console.error('Uso: node scripts/cloud/prepare-installations.mjs escola.json casa.json --out .local/cloud/nova-preparacao');process.exitCode=2;}
  else prepareInstallations(args.slice(0,index),args[index+1]).then(result=>console.log(`Preparadas ${result.count} instalações em pasta privada. Nenhum recurso de nuvem foi criado.`)).catch(error=>{console.error(error.message);process.exitCode=1;});
}
