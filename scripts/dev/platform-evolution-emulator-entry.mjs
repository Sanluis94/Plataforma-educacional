import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {initializeApp as adminApp} from 'firebase-admin/app';
import {getAuth as adminAuth} from 'firebase-admin/auth';
import {getFirestore as adminStore} from 'firebase-admin/firestore';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,inMemoryPersistence,setPersistence,signOut} from 'firebase/auth';
import {doc,setDoc,getDocFromServer,updateDoc,getDocs,collection,query,where,terminate} from 'firebase/firestore';
import {app,auth,db} from '../../src/modules/core/services/firebaseConfig.ts';
import {saveClass,enrollStudent,sendStudentMessage,getStudentMessages,replyStudentMessage,claimStudentMessageReward} from '../../src/modules/data/repositories/classRepository.ts';
import {publishClassActivity} from '../../src/modules/data/repositories/classPublicationRepository.ts';
import {saveSubmission,saveSubmissionReview,getPublishedSubmissionReviewsByStudent} from '../../src/modules/data/repositories/submissionRepository.ts';
import {getGradePolicy,saveGradePolicy} from '../../src/modules/data/repositories/gradePolicyRepository.ts';
import {getLiveClassReport,invalidateClassLearningSnapshot} from '../../src/modules/data/repositories/reportRepository.ts';
import {createFamilyInvitation,acceptFamilyInvitation,getFamilyStudentSummary,revokeFamilyInvitation,sendFamilyMessage} from '../../src/modules/data/repositories/familyRepository.ts';
import {getCoordinatorClasses,assignCoordinatorToClass} from '../../src/modules/data/repositories/institutionalRepository.ts';
import {createStudentGuidance,getStudentGuidance} from '../../src/modules/data/repositories/guidanceRepository.ts';
import {issueCertificate,verifyCertificate,revokeCertificate} from '../../src/modules/core/services/certificateService.ts';
assert.equal(process.env.GCLOUD_PROJECT,'demo-kortex');assert.equal(app.options.projectId,'demo-kortex');assert.equal(process.env.FIRESTORE_EMULATOR_HOST,'127.0.0.1:8080');assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,'127.0.0.1:9099');
globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const privileged=adminApp({projectId:'demo-kortex'},'evolution-seed');const seed=adminStore(privileged);
const suffix=crypto.randomUUID(),password='FicticioLocal123!',actors={},checks=[];
const timeout=setTimeout(()=>{console.error('Verificação da evolução excedeu 180 segundos.');process.exit(1);},180000);
async function actor(name,role){const email=name+'-'+suffix+'@example.test';const {user}=await createUserWithEmailAndPassword(auth,email,password);await adminAuth(privileged).updateUser(user.uid,{emailVerified:true});const data={name:'Perfil fictício '+name,email,role,createdAt:new Date().toISOString()};if(role==='admin')await seed.doc('users/'+user.uid).set(data);else await setDoc(doc(db,'users',user.uid),data);actors[name]={uid:user.uid,email};return user.uid;}
async function login(name){await signInWithEmailAndPassword(auth,actors[name].email,password);invalidateClassLearningSnapshot();}
async function allowed(name,run){await run();checks.push({name,status:'passed'});console.log('OK: '+name);}
async function denied(name,run){await assert.rejects(run,error=>error?.code==='permission-denied');checks.push({name,status:'passed'});console.log('OK (acesso negado): '+name);}
try{
  await setPersistence(auth,inMemoryPersistence);
  for(const [name,role] of [['teacher','professor'],['other','professor'],['student','estudante'],['peer','estudante'],['parent','estudante'],['outsider','estudante'],['coordinator','coordenador'],['admin','admin']])await actor(name,role);
  await login('teacher');const turma=await saveClass('Turma fictícia de integração',actors.teacher.uid,'Professora fictícia');
  const misleading='activity-'+actors.teacher.uid+'-foreign';await seed.doc('classes/foreign-'+suffix).set({name:'Turma alheia fictícia',professorId:actors.other.uid,studentIds:[],studentsCount:0});await seed.doc('activities/'+misleading).set({professorId:actors.other.uid,classId:'foreign-'+suffix,status:'published',title:'Atividade alheia fictícia'});
  await denied('prefixo de ID não concede leitura de atividade alheia',()=>getDocFromServer(doc(db,'activities',misleading)));
  await allowed('turma e código criados no mesmo lote',async()=>assert.equal((await getDocFromServer(doc(db,'class_codes',turma.code))).data().classId,turma.id));
  const activity=await publishClassActivity(actors.teacher.uid,{classId:turma.id,className:turma.name,title:'Comparar cenários',description:'Observe os dois cenários e explique a relação.',questions:[{question:'Qual relação é observada?',options:['Relação A','Relação B'],correctOption:0}],config:{publicationId:crypto.randomUUID()}});
  await allowed('publicação de atividade é confirmada e recuperável',async()=>assert.equal((await getDocFromServer(doc(db,'activities',activity.id))).data().title,activity.title));
  await login('student');await enrollStudent(turma.code,actors.student.uid);await enrollStudent(turma.code,actors.student.uid);
  await login('teacher');
  for(const name of ['exams','lesson_plans','attendance','forum_topics']){
    const reference=doc(db,name,'qa-bound-'+suffix),common={turmaId:turma.id};
    const data=name==='forum_topics'?{...common,autorId:actors.teacher.uid,titulo:'Fórum fictício',conteudo:'Comparar as relações observadas.',respostas:[]}:name==='attendance'?{...common,data:'2026-10-12',registros:[{studentId:actors.student.uid,status:'presente'}],criadoEm:new Date().toISOString()}:{...common,professorId:actors.teacher.uid,titulo:'Material fictício'};
    await setDoc(reference,data);
    await allowed('atualização legítima preserva turma: '+name,()=>updateDoc(reference,name==='attendance'?{data:'2026-10-13'}:name==='forum_topics'?{titulo:'Comparação revisada'}:{titulo:'Material revisado'}));
    await denied('atualização não transfere documento a outra turma: '+name,()=>updateDoc(reference,{turmaId:'foreign-'+suffix,...(name==='exams'||name==='lesson_plans'?{professorId:actors.other.uid}:{})}));
  }
  const guidance=await createStudentGuidance({classId:turma.id,studentId:actors.student.uid,professorId:actors.teacher.uid,text:'Retome o conceito antes da próxima atividade.'});
  await denied('orientação não troca turma, professor ou estudante',()=>updateDoc(doc(db,'student_guidance',guidance.id),{classId:'foreign-'+suffix,professorId:actors.other.uid,studentId:actors.outsider.uid}));
  await login('student');

  await allowed('matrícula própria idempotente e perfil mínimo',async()=>{assert.equal((await getDocFromServer(doc(db,'classes',turma.id))).data().studentsCount,1);assert.equal((await getDocFromServer(doc(db,'classes',turma.id,'student_profiles',actors.student.uid))).data().name,'Perfil fictício student');});
  await seed.doc('users/'+actors.student.uid).update({legacyHint:'preservado'});
  await allowed('perfil antigo preserva campos sem conceder novo papel',async()=>{await updateDoc(doc(db,'users',actors.student.uid),{gradeLevel:'medio'});assert.equal((await getDocFromServer(doc(db,'users',actors.student.uid))).data().legacyHint,'preservado');});
  await denied('campo legado não permite alterar privilégios',()=>updateDoc(doc(db,'users',actors.student.uid),{role:'professor'}));
  await denied('aluno não pode remover colegas ao matricular',()=>updateDoc(doc(db,'classes',turma.id),{studentIds:[actors.student.uid,actors.outsider.uid],studentsCount:2,updatedAt:new Date().toISOString()}));
  const evidence={schemaVersion:1,source:'activity',stage:'assessment',sessionId:crypto.randomUUID(),activeSeconds:90,questions:[{questionId:'q',question:'Qual relação é observada?',selectedOption:0,correct:true,selectedText:'Relação A',expectedText:'Relação A'}]};
  const submission=await saveSubmission({activityId:activity.id,activityTitle:activity.title,classId:turma.id,studentId:actors.student.uid,studentName:'Perfil fictício student',score:100,status:'completed',submittedAt:new Date().toISOString(),evidence});
  await allowed('aluno confirma sua entrega',async()=>assert.equal((await getDocFromServer(doc(db,'submissions',submission.id))).data().score,100));
  const question=await sendStudentMessage(turma.id,actors.student.uid,'Perfil fictício student','Como posso melhorar a explicação?');
  await allowed('aluno consulta somente suas próprias dúvidas',async()=>assert.equal((await getStudentMessages(turma.id,actors.student.uid)).length,1));
  await login('teacher');await replyStudentMessage(turma.id,question.id,'Compare os cenários apresentados.',20,50,actors.student.uid);
  await denied('professor não lê o progresso privado do aluno',()=>getDocFromServer(doc(db,'progress',actors.student.uid)));
  await login('student');await allowed('recompensa da resposta recebida uma única vez',async()=>{assert.equal(await claimStudentMessageReward(turma.id,question.id,actors.student.uid),true);assert.equal(await claimStudentMessageReward(turma.id,question.id,actors.student.uid),false);const progress=(await getDocFromServer(doc(db,'progress',actors.student.uid))).data();assert.equal(progress.xp,50);assert.equal(progress.coins,20);});

  await login('peer');await enrollStudent(turma.code,actors.peer.uid);
  await denied('colega não lê entrega individual',()=>getDocFromServer(doc(db,'submissions',submission.id)));
  await login('other');await denied('outro professor não lê entrega de turma alheia',()=>getDocFromServer(doc(db,'submissions',submission.id)));await denied('outro professor não lê cadastro individual',()=>getDocFromServer(doc(db,'users',actors.student.uid)));
  await login('teacher');let review=await saveSubmissionReview({submissionId:submission.id,classId:turma.id,studentId:actors.student.uid,professorId:actors.teacher.uid,status:'draft',rubricScores:{crit_1:4,crit_2:3,crit_3:3},totalScore:10,generalFeedback:'Compare a justificativa com os dois cenários.',gradedAt:new Date().toISOString(),expectedVersion:0});
  await login('student');await denied('rascunho docente permanece privado',()=>getDocFromServer(doc(db,'submission_reviews',submission.id)));
  await login('teacher');review=await saveSubmissionReview({...review,status:'published',expectedVersion:review.version});
  await allowed('publicação do parecer com histórico',async()=>assert.equal(review.version,2));
  assert.deepEqual(review.history,[],'Versões de rascunho não podem aparecer no histórico publicado.');
  const policy={classId:turma.id,period:'atual',professorId:actors.teacher.uid,weights:{turmaId:turma.id,pesoProvas:0,pesoLabs:0,pesoAtividades:90,pesoParticipacao:10},mode:'school',universityWeights:{p1:40,p2:40,labs:20,minPassDireta:6,minExameFinal:4},p1ExamId:null,p2ExamId:null,participationScores:{[actors.student.uid]:8,[actors.peer.uid]:4},explanation:'A atividade vale 90% e participação vale 10%.',reviewMode:'replace-submission-score',startDate:null,endDate:null};
  await saveGradePolicy(policy);
  await createStudentGuidance({classId:turma.id,studentId:actors.student.uid,professorId:actors.teacher.uid,text:'Retome o conceito e revise sua explicação.'});
  const certificate=await issueCertificate(actors.student.uid,'Perfil fictício student','Curso fictício conferido',2,{classId:turma.id,issuerId:actors.teacher.uid,requirements:{minimumCompleted:1,minScore:70}});
  await allowed('certificado preserva a identidade das evidências',async()=>{const record=(await getDocFromServer(doc(db,'certificate_records',certificate.id))).data();const unrelated=await saveClass('Outra turma fictícia',actors.teacher.uid);await seed.doc('classes/'+unrelated.id).update({studentIds:[actors.student.uid],studentsCount:1});const id=crypto.randomUUID();await denied('evidência de outra turma não autoriza certificado',()=>setDoc(doc(db,'certificate_records',id),{...record,id,publicCode:id,classId:unrelated.id}));});
  const invitation=await createFamilyInvitation({classId:turma.id,studentId:actors.student.uid,email:actors.parent.email});
  await login('student');await allowed('aluno recebe parecer e orientação',async()=>{assert.equal((await getPublishedSubmissionReviewsByStudent(actors.student.uid,turma.id)).length,1);assert.equal((await getStudentGuidance(turma.id,actors.student.uid)).length,2);});
  await allowed('critérios comuns preservam nota individual',async()=>{const value=await getGradePolicy(turma.id);assert.deepEqual(value.participationScores,{[actors.student.uid]:8});});
  await denied('nota de participação do colega é privada',()=>getDocFromServer(doc(db,'grade_policies',turma.id+'__atual','student_scores',actors.peer.uid)));
  await login('outsider');await denied('convite não pode ser aceito por outro email',()=>getDocFromServer(doc(db,'family_invitations',invitation.id)));await denied('turma não pode ser enumerada por visitante autenticado',()=>getDocs(collection(db,'classes')));
  await login('parent');const link=await acceptFamilyInvitation(invitation.id);await allowed('família autorizada acompanha entrega e devolutiva',async()=>{const summary=await getFamilyStudentSummary(link.id);assert.equal(summary.completedCount,1);assert.equal(summary.reviews.length,1);assert.equal(summary.guidance.length,2);});
  await sendFamilyMessage(link.id,'Como posso ajudar na revisão?');await denied('responsável não recebe a lista de colegas',()=>getDocFromServer(doc(db,'classes',turma.id)));
  await login('teacher');await sendFamilyMessage(link.id,'Ajudem a comparar os cenários.');await revokeFamilyInvitation(invitation.id);
  await login('parent');await denied('revogação bloqueia novas leituras da criança',()=>getDocFromServer(doc(db,'submissions',submission.id)));
  await login('coordinator');assert.deepEqual(await getCoordinatorClasses(),[]);await denied('coordenação sem vínculo não lê a turma',()=>getDocFromServer(doc(db,'classes',turma.id)));
  await login('admin');await assignCoordinatorToClass(turma.id,actors.coordinator.uid);
  await login('coordinator');await allowed('coordenação vinculada usa relatório real',async()=>{assert.equal((await getCoordinatorClasses()).length,1);assert.equal((await getLiveClassReport(turma.id)).studentsCount,2);});
  await denied('coordenação vinculada não edita turma de outro docente',()=>updateDoc(doc(db,'classes',turma.id),{name:'Alteração não autorizada'}));
  await allowed('coordenação pode gerenciar somente sua própria turma docente',async()=>{await saveClass('Turma própria fictícia',actors.coordinator.uid,'Docente da coordenação');assert.equal((await getCoordinatorClasses()).length,2);});
  await signOut(auth);await allowed('consulta pública do certificado sem dados pessoais',async()=>{const value=await verifyCertificate(certificate.codigoValidacao);assert.equal(value.status,'active');assert.equal(value.completedCount,1);assert.ok(!Object.hasOwn(value,'studentName'));});await denied('registro privado do certificado exige vínculo',()=>getDocFromServer(doc(db,'certificate_records',certificate.id)));await denied('registros públicos não podem ser listados',()=>getDocs(collection(db,'certificate_public')));
  await login('teacher');await revokeCertificate(certificate.id,actors.teacher.uid,'Correção de emissão fictícia');await signOut(auth);await allowed('revogação aparece na consulta pública',async()=>assert.equal((await verifyCertificate(certificate.codigoValidacao)).status,'revoked'));
  await mkdir(new URL('../../.local/labs/',import.meta.url),{recursive:true});await writeFile(new URL('../../.local/labs/platform-evolution-emulator.json',import.meta.url),JSON.stringify({project:'demo-kortex',checkedAt:new Date().toISOString(),checks},null,2));
}finally{clearTimeout(timeout);await terminate(db);await app.delete?.();await seed.terminate();await privileged.delete();}
