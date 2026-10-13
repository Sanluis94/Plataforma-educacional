import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {initializeApp as adminApp} from 'firebase-admin/app';
import {getAuth as adminAuth} from 'firebase-admin/auth';
import {getFirestore as adminStore} from 'firebase-admin/firestore';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,inMemoryPersistence,setPersistence,signOut} from 'firebase/auth';
import {doc,setDoc,getDocFromServer,updateDoc,getDocs,collection,query,where,terminate} from 'firebase/firestore';
import {app,auth,db} from '../../src/modules/core/services/firebaseConfig.ts';
import {saveClass,enrollStudent,subscribeStudentClasses,ensureClassEnrollmentCode,sendStudentMessage,getStudentMessages,replyStudentMessage,claimStudentMessageReward,addEnhancedMaterial,getEnhancedMaterials,deleteEnhancedMaterial} from '../../src/modules/data/repositories/classRepository.ts';
import {saveForumTopic,addForumReply,getForumTopicsByClass,markForumBestReply,deleteForumReply,saveAttendanceRecord,getAttendanceByClass} from '../../src/modules/data/repositories/gradebookRepository.ts';
import {purchaseStudentItem} from '../../src/modules/data/repositories/studentRepository.ts';
import {saveExam,updateExam,saveExamAttempt} from '../../src/modules/data/repositories/examRepository.ts';
import {saveLessonPlanItem,getLessonPlansByClass,updateLessonPlanItem,deleteLessonPlanItem} from '../../src/modules/data/repositories/lessonPlanRepository.ts';
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
async function actor(name,role,emailVerified=true){const email=name+'-'+suffix+'@example.test';const {user}=await createUserWithEmailAndPassword(auth,email,password);await adminAuth(privileged).updateUser(user.uid,{emailVerified});const data={name:'Perfil fictício '+name,email,role,createdAt:new Date().toISOString()};if(role==='admin')await seed.doc('users/'+user.uid).set(data);else await setDoc(doc(db,'users',user.uid),data);actors[name]={uid:user.uid,email};return user.uid;}
async function login(name){await signInWithEmailAndPassword(auth,actors[name].email,password);invalidateClassLearningSnapshot();}
async function allowed(name,run){try{await run();}catch(error){const coverage=await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-kortex:ruleCoverage').then(response=>response.text()).catch(()=>null);if(coverage)await writeFile(new URL('../../.local/labs/platform-evolution-rules-coverage.json',import.meta.url),coverage);throw error;}checks.push({name,status:'passed'});console.log('OK: '+name);}
async function denied(name,run){await assert.rejects(run,error=>error?.code==='permission-denied');checks.push({name,status:'passed'});console.log('OK (acesso negado): '+name);}
try{
  await setPersistence(auth,inMemoryPersistence);
  for(const [name,role,verified] of [['teacher','professor'],['other','professor'],['student','estudante'],['peer','estudante'],['parent','estudante'],['outsider','estudante'],['coordinator','coordenador'],['admin','admin'],['unverified','estudante',false]])await actor(name,role,verified??true);
  await login('teacher');const turma=await saveClass('Turma fictícia de integração',actors.teacher.uid,'Professora fictícia');
  const misleading='activity-'+actors.teacher.uid+'-foreign';await seed.doc('classes/foreign-'+suffix).set({name:'Turma alheia fictícia',professorId:actors.other.uid,studentIds:[],studentsCount:0});await seed.doc('activities/'+misleading).set({professorId:actors.other.uid,classId:'foreign-'+suffix,status:'published',title:'Atividade alheia fictícia'});
  await denied('prefixo de ID não concede leitura de atividade alheia',()=>getDocFromServer(doc(db,'activities',misleading)));
  await allowed('turma e código criados no mesmo lote',async()=>assert.equal((await getDocFromServer(doc(db,'class_codes',turma.code))).data().classId,turma.id));
  await allowed('disponibilizar código simultaneamente preserva a turma',async()=>{await Promise.all([ensureClassEnrollmentCode(turma.id),ensureClassEnrollmentCode(turma.id)]);assert.equal((await getDocFromServer(doc(db,'class_codes',turma.code))).data().classId,turma.id);});
  const forum=await saveForumTopic({turmaId:turma.id,autorId:actors.teacher.uid,autorNome:'Docente fictício',autorRole:'professor',titulo:'Comparação fictícia',conteudo:'Compare os cenários da investigação.',disciplina:'Ciências'});
  let material;
  await allowed('material publicado conserva ID e metadados, exclusão não reaparece',async()=>{material=await addEnhancedMaterial(turma.id,{title:'Leitura fictícia',description:'Orientação fictícia',tipo:'texto',linkOuConteudo:'Texto de apoio.'});assert.equal((await getEnhancedMaterials(turma.id)).find(item=>item.id===material.id).linkOuConteudo,'Texto de apoio.');await deleteEnhancedMaterial(turma.id,material.id);assert.equal((await getEnhancedMaterials(turma.id)).length,0);});
  const activity=await publishClassActivity(actors.teacher.uid,{classId:turma.id,className:turma.name,title:'Comparar cenários',description:'Observe os dois cenários e explique a relação.',questions:[{q:'Qual relação é observada?',options:['Relação A','Relação B'],answer:0,explanation:'Compare os cenários e as relações observadas.'}],theoryContent:'Texto fictício de investigação, teoria, exemplo explicado e reflexão.',config:{publicationId:crypto.randomUUID()}});
  await allowed('publicação de atividade é confirmada e recuperável',async()=>{const stored=(await getDocFromServer(doc(db,'activities',activity.id))).data();assert.equal(stored.title,activity.title);assert.equal(stored.theoryContent,activity.theoryContent);assert.equal(stored.questions[0].answer,0);});
  await allowed('retry de publicação conserva ID e recusa conteúdo diferente',async()=>{assert.equal((await publishClassActivity(actors.teacher.uid,activity)).id,activity.id);await assert.rejects(()=>publishClassActivity(actors.teacher.uid,{...activity,description:'Outro conteúdo com o mesmo identificador.'}),/outro conteúdo/);assert.equal((await getDocFromServer(doc(db,'activities',activity.id))).data().description,activity.description);});
  await allowed('plano remoto conserva roteiro, data e ID ao salvar, editar e excluir',async()=>{
    const plan=await saveLessonPlanItem({professorId:actors.teacher.uid,turmaId:turma.id,turmaNome:turma.name,periodo:'1º Bimestre',ordemSemana:1,dataPrevista:'2026-11-16',topico:'Comparar equilíbrio na balança',metodologia:'Investigar cenários e explicar a relação entre as quantidades.',laboratorioAssociadoId:'fund1_mat_02',laboratorioTitulo:'Balança de equivalências',status:'planejada',criadoEm:new Date().toISOString()});
    const read=()=>getLessonPlansByClass(turma.id,'1º Bimestre');
    const first=(await read()).find(item=>item.id===plan.id);assert.equal(first.laboratorioAssociadoId,'fund1_mat_02');assert.equal(first.dataPrevista,'2026-11-16');
    await updateLessonPlanItem(plan.id,{status:'concluida',dataPrevista:'2026-11-17'});
    const changed=(await read()).filter(item=>item.id===plan.id);assert.equal(changed.length,1);assert.equal(changed[0].status,'concluida');assert.equal(changed[0].dataPrevista,'2026-11-17');assert.equal(changed[0].laboratorioAssociadoId,first.laboratorioAssociadoId);
    await deleteLessonPlanItem(plan.id);assert.equal((await read()).some(item=>item.id===plan.id),false);
  });
  await login('student');await Promise.all([enrollStudent(turma.code,actors.student.uid),enrollStudent(turma.code,actors.student.uid)]);
  let forumReplies;
  await allowed('respostas simultâneas preservam todas as contribuições no fórum',async()=>{forumReplies=await Promise.all(['Hipótese A','Hipótese B'].map(texto=>addForumReply(turma.id,forum.id,{autorId:actors.student.uid,autorNome:'Aluno fictício',autorRole:'estudante',texto})));const saved=(await getForumTopicsByClass(turma.id)).find(item=>item.id===forum.id);assert.equal(saved.respostas.length,2);assert.deepEqual(new Set(saved.respostas.map(item=>item.id)),new Set(forumReplies.map(item=>item.id)));assert.ok(saved.respostas.every(item=>!item.isMelhorResposta&&item.moedasGanhas===0));});
  await login('teacher');
  await allowed('destaque e moderação do fórum preservam a resposta restante',async()=>{await markForumBestReply(turma.id,forum.id,forumReplies[0].id,true);await deleteForumReply(turma.id,forum.id,forumReplies[1].id);const saved=(await getForumTopicsByClass(turma.id)).find(item=>item.id===forum.id);assert.equal(saved.respostas.length,1);assert.equal(saved.respostas[0].isMelhorResposta,true);assert.equal(saved.respostas[0].moedasGanhas,0);});
  await allowed('correção da mesma chamada não duplica a aula',async()=>{const record={turmaId:turma.id,data:'2026-11-15',aulaNumero:1,registros:[{studentId:actors.student.uid,studentName:'Aluno fictício',status:'presente'}],criadoEm:new Date().toISOString()};const first=await saveAttendanceRecord(record);const corrected=await saveAttendanceRecord({...record,registros:[{...record.registros[0],status:'justificada'}],criadoEm:new Date().toISOString()});assert.equal(first.id,corrected.id);const saved=(await getAttendanceByClass(turma.id)).filter(item=>item.data===record.data);assert.equal(saved.length,1);assert.equal(saved[0].registros[0].status,'justificada');});
  const timedQuestion={enunciado:'Como comparar o efeito de uma variável no experimento?',tema:'Controle de variáveis',nivelDificuldade:'Fácil',valorPeso:1,justificativa:'Uma comparação controlada altera apenas a variável investigada.',opcoes:[{texto:'Alterar uma variável por vez e conservar as demais.',isCorreta:true},{texto:'Alterar todas as variáveis ao mesmo tempo.',isCorreta:false}]};
  const timedExam = await saveExam({professorId:actors.teacher.uid,turmaId:turma.id,titulo:'Prova fictícia com prazo',disciplina:'Ciências',status:'Aberta',pesoTotal:1,questoes:[timedQuestion],criadoEm:new Date().toISOString(),dataLimite:new Date(Date.now()-300000).toISOString()});
  const timedAttempt=()=>({examId:timedExam.id,examTitle:timedExam.titulo,turmaId:turma.id,alunoId:actors.student.uid,alunoNome:'Aluno fictício',pontuacaoObtida:1,pontuacaoMaxima:1,porcentagemAproveitamento:100,classificacao:'Excelente',respostas:[{questaoIndex:0,opcaoEscolhidaIndex:0,acertou:true,pontosObtidos:1}],dataEnvio:new Date().toISOString(),evidence:{schemaVersion:1,source:'exam',stage:'assessment',sessionId:crypto.randomUUID(),activeSeconds:30,questions:[{questionId:timedExam.id+'-q1',question:timedQuestion.enunciado,selectedOption:0,selectedText:timedQuestion.opcoes[0].texto,expectedText:timedQuestion.opcoes[0].texto,correct:true,explanation:timedQuestion.justificativa,topic:timedQuestion.tema}]}});
  await login('student');
  await denied('prova após o prazo não aceita nova entrega',()=>saveExamAttempt(timedAttempt()));
  await login('teacher');await updateExam(timedExam.id,{dataLimite:new Date(Date.now()+600000).toISOString()});
  await login('student');
  await allowed('prazo futuro aceita entrega e retry conserva o identificador',async()=>{const attempt=timedAttempt();const first=await saveExamAttempt(attempt);assert.equal((await saveExamAttempt(attempt)).id,first.id);});
  await login('teacher');await updateExam(timedExam.id,{dataLimite:new Date(Date.now()-30000).toISOString()});
  await login('student');
  await allowed('margem de transporte aceita entrega imediatamente após o prazo',()=>saveExamAttempt(timedAttempt()));
  await login('teacher');await updateExam(timedExam.id,{dataLimite:''});
  await allowed('reabrir sem prazo remove também o limite do servidor',async()=>{const stored=(await getDocFromServer(doc(db,'exams',timedExam.id))).data();assert.equal(stored.dataLimite,'');assert.equal(stored.deadlineAtMillis,null);});
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
  await seed.doc('progress/'+actors.student.uid).update({coins:400,purchasedItems:[]});
  await allowed('compra simultânea do mesmo item cobra uma única vez',async()=>{await Promise.all([purchaseStudentItem(actors.student.uid,'avatar_hero'),purchaseStudentItem(actors.student.uid,'avatar_hero')]);const progress=(await getDocFromServer(doc(db,'progress',actors.student.uid))).data();assert.equal(progress.coins,200);assert.deepEqual(progress.purchasedItems,['avatar_hero']);});
  await seed.doc('progress/'+actors.student.uid).update({coins:500});
  await allowed('compras simultâneas diferentes preservam saldo e todos os itens',async()=>{await Promise.all([purchaseStudentItem(actors.student.uid,'frame_gold'),purchaseStudentItem(actors.student.uid,'badge_genius')]);const progress=(await getDocFromServer(doc(db,'progress',actors.student.uid))).data();assert.equal(progress.coins,250);assert.deepEqual(new Set(progress.purchasedItems),new Set(['avatar_hero','frame_gold','badge_genius']));});

  await login('peer');await enrollStudent(turma.code,actors.peer.uid);
  await denied('colega não lê entrega individual',()=>getDocFromServer(doc(db,'submissions',submission.id)));
  await login('other');await denied('outro professor não lê entrega de turma alheia',()=>getDocFromServer(doc(db,'submissions',submission.id)));await denied('outro professor não lê cadastro individual',()=>getDocFromServer(doc(db,'users',actors.student.uid)));
  await login('teacher');let review=await saveSubmissionReview({submissionId:submission.id,classId:turma.id,studentId:actors.student.uid,professorId:actors.teacher.uid,status:'draft',rubricScores:{crit_1:4,crit_2:3,crit_3:3},totalScore:10,generalFeedback:'Compare a justificativa com os dois cenários.',gradedAt:new Date().toISOString(),expectedVersion:0});
  await login('student');await denied('rascunho docente permanece privado',()=>getDocFromServer(doc(db,'submission_reviews',submission.id)));
  await login('teacher');review=await saveSubmissionReview({...review,status:'published',expectedVersion:review.version});
  await allowed('publicação do parecer com histórico',async()=>assert.equal(review.version,2));
  assert.deepEqual(review.history,[],'Versões de rascunho não podem aparecer no histórico publicado.');
  await allowed('parecer desatualizado não sobrescreve publicação mais recente',async()=>{
    const old=review;
    review=await saveSubmissionReview({...old,generalFeedback:'Devolutiva publicada mais recente.',expectedVersion:old.version});
    await assert.rejects(()=>saveSubmissionReview({...old,generalFeedback:'Texto de outra sessão desatualizada.',expectedVersion:old.version}),/outra sessão/);
    const stored=(await getDocFromServer(doc(db,'submission_reviews',submission.id))).data();assert.equal(stored.version,review.version);assert.equal(stored.generalFeedback,review.generalFeedback);assert.equal(stored.history.length,1);assert.equal(stored.history[0].version,old.version);
  });
  const policy={classId:turma.id,period:'atual',professorId:actors.teacher.uid,weights:{turmaId:turma.id,pesoProvas:0,pesoLabs:0,pesoAtividades:90,pesoParticipacao:10},mode:'school',universityWeights:{p1:40,p2:40,labs:20,minPassDireta:6,minExameFinal:4},p1ExamId:null,p2ExamId:null,participationScores:{[actors.student.uid]:8,[actors.peer.uid]:4},explanation:'A atividade vale 90% e participação vale 10%.',reviewMode:'replace-submission-score',startDate:null,endDate:null};
  const firstPolicy=await saveGradePolicy(policy);
  await allowed('critérios desatualizados não sobrescrevem versão publicada',async()=>{
    const current=await saveGradePolicy({...policy,explanation:'Critérios revisados: atividade90% e participação10%.',expectedVersion:firstPolicy.version});
    await assert.rejects(()=>saveGradePolicy({...policy,explanation:'Texto de uma sessão desatualizada.',expectedVersion:firstPolicy.version}),/outra sessão/);
    const stored=await getGradePolicy(turma.id);assert.equal(stored.version,current.version);assert.equal(stored.explanation,current.explanation);assert.deepEqual(stored.participationScores,policy.participationScores);
  });
  await createStudentGuidance({classId:turma.id,studentId:actors.student.uid,professorId:actors.teacher.uid,text:'Retome o conceito e revise sua explicação.'});
  const certificate=await issueCertificate(actors.student.uid,'Perfil fictício student','Curso fictício conferido',2,{classId:turma.id,issuerId:actors.teacher.uid,requirements:{minimumCompleted:1,minScore:70}});
  await allowed('certificado preserva a identidade das evidências',async()=>{const record=(await getDocFromServer(doc(db,'certificate_records',certificate.id))).data();const unrelated=await saveClass('Outra turma fictícia',actors.teacher.uid);await seed.doc('classes/'+unrelated.id).update({studentIds:[actors.student.uid],studentsCount:1});const id=crypto.randomUUID();await denied('evidência de outra turma não autoriza certificado',()=>setDoc(doc(db,'certificate_records',id),{...record,id,publicCode:id,classId:unrelated.id}));});
  const invitation=await createFamilyInvitation({classId:turma.id,studentId:actors.student.uid,email:actors.parent.email});
  const expiredInvite=await createFamilyInvitation({classId:turma.id,studentId:actors.student.uid,email:actors.parent.email});
  await seed.doc('family_invitations/'+expiredInvite.id).update({expiresAt:new Date(Date.now()-60000)});
  const unverifiedInvite=await createFamilyInvitation({classId:turma.id,studentId:actors.student.uid,email:actors.unverified.email});
  await login('unverified');assert.equal(auth.currentUser.emailVerified,false);
  await allowed('serviço recusa aceite familiar com email não verificado',()=>assert.rejects(()=>acceptFamilyInvitation(unverifiedInvite.id),/verificado/));
  await denied('email não verificado não recebe o convite pelas regras',()=>getDocFromServer(doc(db,'family_invitations',unverifiedInvite.id)));
  await denied('email não verificado não aceita convite contornando o serviço',()=>updateDoc(doc(db,'family_invitations',unverifiedInvite.id),{status:'accepted',acceptedBy:actors.unverified.uid,acceptedAt:new Date().toISOString()}));
  await login('parent');
  await allowed('serviço recusa convite familiar expirado',()=>assert.rejects(()=>acceptFamilyInvitation(expiredInvite.id),/não está disponível/));
  await denied('convite expirado não pode ser aceito contornando o serviço',()=>updateDoc(doc(db,'family_invitations',expiredInvite.id),{status:'accepted',acceptedBy:actors.parent.uid,acceptedAt:new Date().toISOString()}));
  await login('student');await allowed('aluno recebe parecer e orientação',async()=>{assert.equal((await getPublishedSubmissionReviewsByStudent(actors.student.uid,turma.id)).length,1);assert.equal((await getStudentGuidance(turma.id,actors.student.uid)).length,2);});
  await allowed('critérios comuns preservam nota individual',async()=>{const value=await getGradePolicy(turma.id);assert.deepEqual(value.participationScores,{[actors.student.uid]:8});});
  await denied('nota de participação do colega é privada',()=>getDocFromServer(doc(db,'grade_policies',turma.id+'__atual','student_scores',actors.peer.uid)));
  await login('outsider');await denied('convite não pode ser aceito por outro email',()=>getDocFromServer(doc(db,'family_invitations',invitation.id)));await denied('turma não pode ser enumerada por visitante autenticado',()=>getDocs(collection(db,'classes')));
  await login('parent');const link=await acceptFamilyInvitation(invitation.id);await allowed('família autorizada acompanha entrega e devolutiva',async()=>{const summary=await getFamilyStudentSummary(link.id);assert.equal(summary.completedCount,1);assert.equal(summary.reviews.length,1);assert.equal(summary.guidance.length,2);});
  await sendFamilyMessage(link.id,'Como posso ajudar na revisão?');await denied('responsável não recebe a lista de colegas',()=>getDocFromServer(doc(db,'classes',turma.id)));
  await login('teacher');await sendFamilyMessage(link.id,'Ajudem a comparar os cenários.');await revokeFamilyInvitation(invitation.id);
  await login('parent');await denied('revogação bloqueia novas leituras da criança',()=>getDocFromServer(doc(db,'submissions',submission.id)));
  await denied('responsável não reativa vínculo revogado sem novo convite',()=>updateDoc(doc(db,'family_links',link.id),{status:'active'}));
  await login('teacher');const renewedInvite=await createFamilyInvitation({classId:turma.id,studentId:actors.student.uid,email:actors.parent.email});
  await login('parent');await allowed('novo convite legítimo restaura o vínculo familiar revogado',async()=>{const restored=await acceptFamilyInvitation(renewedInvite.id);assert.equal(restored.id,link.id);assert.equal((await getFamilyStudentSummary(restored.id)).completedCount,1);});

  await login('coordinator');assert.deepEqual(await getCoordinatorClasses(),[]);await denied('coordenação sem vínculo não lê a turma',()=>getDocFromServer(doc(db,'classes',turma.id)));
  await login('admin');await assignCoordinatorToClass(turma.id,actors.coordinator.uid);
  await login('coordinator');await allowed('coordenação vinculada usa relatório real',async()=>{assert.equal((await getCoordinatorClasses()).length,1);assert.equal((await getLiveClassReport(turma.id)).studentsCount,2);});
  await denied('coordenação vinculada não edita turma de outro docente',()=>updateDoc(doc(db,'classes',turma.id),{name:'Alteração não autorizada'}));
  await allowed('coordenação pode gerenciar somente sua própria turma docente',async()=>{await saveClass('Turma própria fictícia',actors.coordinator.uid,'Docente da coordenação');assert.equal((await getCoordinatorClasses()).length,2);});
  await signOut(auth);await allowed('consulta pública do certificado sem dados pessoais',async()=>{const value=await verifyCertificate(certificate.codigoValidacao);assert.equal(value.status,'active');assert.equal(value.completedCount,1);assert.ok(!Object.hasOwn(value,'studentName'));});await denied('registro privado do certificado exige vínculo',()=>getDocFromServer(doc(db,'certificate_records',certificate.id)));await denied('registros públicos não podem ser listados',()=>getDocs(collection(db,'certificate_public')));
  await login('teacher');await revokeCertificate(certificate.id,actors.teacher.uid,'Correção de emissão fictícia');await signOut(auth);await allowed('revogação aparece na consulta pública',async()=>assert.equal((await verifyCertificate(certificate.codigoValidacao)).status,'revoked'));
  await login('student');
  await allowed('remoção remota da matrícula atualiza a lista do aluno sem recarregar',async()=>{
    let unsubscribe=()=>{},initialSeen=false;
    const watched=new Promise((resolve,reject)=>{
      unsubscribe=subscribeStudentClasses(actors.student.uid,entries=>{
        if(!initialSeen){
          if(!entries.some(entry=>entry.id===turma.id))return reject(new Error('A turma deveria aparecer antes da remoção.'));
          initialSeen=true;
          void seed.doc('classes/'+turma.id).update({studentIds:[actors.peer.uid],studentsCount:1}).catch(reject);
        }else if(!entries.some(entry=>entry.id===turma.id))resolve();
      },reject);
    });
    let timer;try{await Promise.race([watched,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Matrícula não atualizou em tempo real.')),10000);})]);}finally{clearTimeout(timer);unsubscribe();}
  });
  await mkdir(new URL('../../.local/labs/',import.meta.url),{recursive:true});await writeFile(new URL('../../.local/labs/platform-evolution-emulator.json',import.meta.url),JSON.stringify({project:'demo-kortex',checkedAt:new Date().toISOString(),checks},null,2));
}finally{clearTimeout(timeout);await terminate(db);await app.delete?.();await seed.terminate();await privileged.delete();}
