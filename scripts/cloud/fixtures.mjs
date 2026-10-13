// Synthetic configurations for offline tests. No issued credential belongs here.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export async function fixtureInstallation(mode){
  if(!['school','home'].includes(mode))throw new Error('Fixture desconhecida.');
  const item=JSON.parse(await readFile(new URL(`../../deploy/installation.${mode}.example.json`,import.meta.url),'utf8'));
  item.firebase.apiKey='AI'+'za'+(mode==='school'?'A':'B').repeat(35);
  return item;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const directory=fileURLToPath(new URL('../../.local/cloud-fixtures/',import.meta.url));
  await mkdir(directory,{recursive:true});
  for(const mode of ['school','home'])await writeFile(resolve(directory,`${mode}.json`),JSON.stringify(await fixtureInstallation(mode),null,2)+'\n');
  console.log('Fixtures sem credenciais emitidas geradas em pasta privada.');
}
