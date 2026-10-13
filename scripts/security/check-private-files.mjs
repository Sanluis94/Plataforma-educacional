import {execFileSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true});
const prohibited=path=>/(^|\/)(\.env(?:\.[^/]+)?|\.local|\.terraform|node_modules|secrets\.json)(\/|$)/.test(path)&&!path.endsWith('.env.example')||/(?:service[-_]account|firebase-adminsdk|credentials).*\.json$/i.test(path)||/\.(?:pem|key|p12|pfx|tfstate(?:\.[^/]*)?|tfplan|tfvars(?:\.json)?)$/i.test(path)||/^deploy\/installation\.[^.]+\.json$/.test(path);
const tracked=git(['ls-files','-z']).split('\0').filter(Boolean);
const failures=tracked.filter(prohibited);
const examples=['.env','.env.production','src/.env.local','.local/installation.json','service-account.json','secret-service_account.json','project-firebase-adminsdk-abc.json','credentials.json','secrets.json','private.pem','certificate.pfx','terraform.tfstate','production.tfvars','deploy/installation.school.json'];
const ignored=new Set(git(['check-ignore','--no-index','--',...examples]).trim().split('\n'));
for(const path of examples)if(!ignored.has(path))failures.push(`Proteção ausente: ${path}`);
for(const path of ['.env.example','deploy/installation.school.example.json','deploy/installation.home.example.json'])if(!tracked.includes(path))failures.push(`Exemplo público esperado ausente: ${path}`);
if(failures.length){console.error('Verificação de arquivos privados falhou:\n'+failures.join('\n'));process.exitCode=1;}
else console.log(`Proteções do Git conferidas: ${examples.length} casos privados e ${tracked.length} arquivos versionados. O histórico deve ser analisado separadamente.`);
