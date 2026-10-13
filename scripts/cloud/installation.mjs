import {createHash} from 'node:crypto';

function fail(message){throw new Error(message);}
function object(value,path,keys){
  if(!value||typeof value!=='object'||Array.isArray(value))fail(`${path}: informe um objeto.`);
  if(Object.keys(value).some(key=>!keys.includes(key)))fail(`${path}: campo não permitido; este manifesto aceita somente configuração pública.`);
  return value;
}
function string(value,path,max=300){if(typeof value!=='string'||value.length>max||/[\r\n\0]/.test(value))fail(`${path}: texto inválido.`);return value.trim();}
const publicFields=['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId'];

/** Public configuration only. Unknown fields are rejected before writing/building. */
export function validateInstallation(input){
  const source=object(input,'installation',['schemaVersion','id','name','mode','releaseStage','origin','firebase','controller','operationalReadiness']);
  if(source.schemaVersion!==1)fail('schemaVersion: use 1.');
  const id=string(source.id,'id',48),name=string(source.name,'name',160);
  if(!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id)||id.length<3)fail('id: use 3 a 48 letras minúsculas, números e hífens.');
  if(!name)fail('name: informe o nome público da instalação.');
  if(!['school','home'].includes(source.mode))fail('mode: use school ou home.');
  if(!['pilot','commercial'].includes(source.releaseStage))fail('releaseStage: use pilot ou commercial.');
  let origin;
  try{const url=new URL(string(source.origin,'origin'));const labels=url.hostname.split('.');if(url.protocol!=='https:'||url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||url.hostname.length>253||labels.length<2||labels.some(label=>!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))||!/[a-z]/.test(labels.at(-1))||/^(localhost|127\.|\[)/.test(url.hostname))throw new Error();origin=url.origin;}catch{fail('origin: informe uma origem HTTPS com domínio DNS válido, sem caminho, porta ou credenciais.');}
  const firebase=object(source.firebase,'firebase',publicFields);
  const config=Object.fromEntries(publicFields.map(field=>[field,string(firebase[field],`firebase.${field}`,200)]));
  if(!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(config.projectId)||config.projectId.startsWith('demo-'))fail('firebase.projectId: use um projeto dedicado real, com 6 a 30 caracteres.');
  if(config.projectId==='plataforma-educacional-73df6')fail('firebase.projectId: a produção compartilhada existente não é uma instalação isolada.');
  if(!/^AIza[A-Za-z0-9_-]{35}$/.test(config.apiKey))fail('firebase.apiKey: formato de chave web Firebase inválido.');
  if(config.authDomain!==`${config.projectId}.firebaseapp.com`)fail('firebase.authDomain: deve corresponder ao projeto dedicado.');
  if(![`${config.projectId}.firebasestorage.app`,`${config.projectId}.appspot.com`].includes(config.storageBucket))fail('firebase.storageBucket: deve corresponder ao projeto dedicado.');
  if(!/^\d{6,20}$/.test(config.messagingSenderId)||!new RegExp(`^1:${config.messagingSenderId}:web:[a-f0-9]{20,40}$`).test(config.appId))fail('firebase.appId/messagingSenderId: identificadores web inconsistentes.');
  const controller=object(source.controller,'controller',['name','document','privacyContactEmail']);
  const contact={name:string(controller.name,'controller.name',200),document:string(controller.document,'controller.document',40),privacyContactEmail:string(controller.privacyContactEmail,'controller.privacyContactEmail',254)};
  if(contact.privacyContactEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.privacyContactEmail))fail('controller.privacyContactEmail: email inválido.');
  const readiness=object(source.operationalReadiness,'operationalReadiness',['legalApproved','securityApproved','dataProcessingApproved','backupRestoreTested','legalApprovalReference']);
  for(const field of ['legalApproved','securityApproved','dataProcessingApproved','backupRestoreTested'])if(typeof readiness[field]!=='boolean')fail(`operationalReadiness.${field}: informe true ou false.`);
  const legalApprovalReference=string(readiness.legalApprovalReference,'operationalReadiness.legalApprovalReference',300);
  if(source.releaseStage==='commercial'&&(!contact.name||!contact.privacyContactEmail||!legalApprovalReference||['legalApproved','securityApproved','dataProcessingApproved','backupRestoreTested'].some(field=>readiness[field]!==true)))fail('Liberação comercial exige responsável, contato de privacidade, referência da revisão jurídica e os quatro registros operacionais aprovados.');
  return {schemaVersion:1,id,name,mode:source.mode,releaseStage:source.releaseStage,origin,firebase:config,controller:contact,operationalReadiness:{...readiness,legalApprovalReference}};
}

export function validateInstallationSet(inputs){
  const installations=inputs.map(validateInstallation);
  for(const [field,get]of [['id',item=>item.id],['projeto Firebase',item=>item.firebase.projectId],['identificador de aplicativo',item=>item.firebase.appId],['número do projeto',item=>item.firebase.messagingSenderId],['origem HTTPS',item=>item.origin]]){
    const used=new Set();for(const item of installations){const value=get(item);if(used.has(value))fail(`Isolamento inválido: ${field} repetido entre instalações.`);used.add(value);}
  }
  if(!installations.length)fail('Informe pelo menos uma instalação.');
  return installations;
}

export function installationEnvironment(installation){
  const item=validateInstallation(installation);
  return {
    VITE_FIREBASE_API_KEY:item.firebase.apiKey,VITE_FIREBASE_AUTH_DOMAIN:item.firebase.authDomain,VITE_FIREBASE_PROJECT_ID:item.firebase.projectId,VITE_FIREBASE_STORAGE_BUCKET:item.firebase.storageBucket,VITE_FIREBASE_MESSAGING_SENDER_ID:item.firebase.messagingSenderId,VITE_FIREBASE_APP_ID:item.firebase.appId,
    VITE_INSTALLATION_ID:item.id,VITE_INSTALLATION_NAME:item.name,VITE_INSTALLATION_MODE:item.mode,VITE_PUBLIC_RELEASE_STAGE:item.releaseStage,
    VITE_DATA_CONTROLLER_NAME:item.controller.name,VITE_DATA_CONTROLLER_DOCUMENT:item.controller.document,VITE_PRIVACY_CONTACT_EMAIL:item.controller.privacyContactEmail,
    VITE_USE_FIREBASE_EMULATORS:'false',VITE_GEMINI_API_KEY:'',VITE_DISABLE_AI:'true'
  };
}
export function installationFingerprint(item){return createHash('sha256').update(JSON.stringify(validateInstallation(item))).digest('hex');}
