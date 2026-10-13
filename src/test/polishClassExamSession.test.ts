import {afterEach,it,expect,vi} from 'vitest';
import {readClassExamSession,saveClassExamSession,classExamRemainingSeconds,type ClassExamSession} from '../modules/data/services/classExamSession';
import type {ExamData,ExamAttempt} from '../modules/data/types';
afterEach(()=>{sessionStorage.clear();vi.restoreAllMocks();});
const exam:ExamData={id:'exam-a',turmaId:'class-a',professorId:'teacher-a',titulo:'Comparar relações',disciplina:'Ciências',status:'Aberta',pesoTotal:2,criadoEm:'2026-10-13T10:00:00Z',questoes:[{enunciado:'Qual condição preserva as demais variáveis?',tema:'Controle de variáveis',nivelDificuldade:'Médio',valorPeso:2,justificativa:'O experimento controlado altera uma variável por vez.',opcoes:[{texto:'Alterar todas as condições.',isCorreta:false},{texto:'Omitir as observações.',isCorreta:false},{texto:'Alterar apenas a variável investigada.',isCorreta:true}]}],duracaoMinutos:10};
const value:ClassExamSession={exam,answers:{0:2},questionIndex:0,deadlineAt:100000,frozen:null,result:null,pending:false,activeSeconds:42};
const attempt:Omit<ExamAttempt,'id'>={examId:'exam-a',examTitle:exam.titulo,turmaId:'class-a',alunoId:'student',alunoNome:'Aluno fictício',pontuacaoObtida:2,pontuacaoMaxima:2,porcentagemAproveitamento:100,classificacao:'Excelente',respostas:[{questaoIndex:0,opcaoEscolhidaIndex:2,acertou:true,pontosObtidos:2}],dataEnvio:'2026-10-13T10:10:00Z',evidence:{schemaVersion:1,source:'exam',stage:'assessment',sessionId:'attempt-a',activeSeconds:42,questions:[{questionId:'exam-a-q1',question:exam.questoes[0].enunciado,selectedOption:2,correct:true}]}};
it('restaura resposta e prazo absoluto, sem dar tempo novo após recarregar',()=>{expect(saveClassExamSession('student',value)).toBe(true);const restored=readClassExamSession('student',exam)!;expect(restored.answers).toEqual({0:2});expect(restored.activeSeconds).toBe(42);expect(classExamRemainingSeconds(restored.deadlineAt,40000)).toBe(60);expect(classExamRemainingSeconds(restored.deadlineAt,110000)).toBe(0);});
it('contas e turmas não recebem a tentativa de outra pessoa',()=>{saveClassExamSession('student',value);expect(readClassExamSession('peer',exam)).toBeNull();expect(readClassExamSession('student',{...exam,turmaId:'class-b'})).toBeNull();});
it('falha de storage não anuncia que o rascunho foi salvo',()=>{vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});expect(saveClassExamSession('student',value)).toBe(false);});
it('conteúdo quebrado do navegador não impede abrir a prova',()=>{sessionStorage.setItem('edu_class_exam_v1:student:class-a:exam-a','{');expect(readClassExamSession('student',exam)).toBeNull();});
it('restaura uma entrega pendente com a mesma tentativa e evidência',()=>{
 const pending={...value,frozen:attempt,result:{...attempt,id:'attempt-result-a'},pending:true};
 expect(saveClassExamSession('student',pending)).toBe(true);
 expect(readClassExamSession('student',exam)).toEqual(pending);
});
it('preserva tentativa congelada após falha sem inventar resultado entregue',()=>{
 const failed={...value,frozen:attempt};
 expect(saveClassExamSession('student',failed)).toBe(true);
 expect(readClassExamSession('student',exam)).toEqual(failed);
});
it('preserva a versão original das questões sem misturar alterações posteriores',()=>{
 saveClassExamSession('student',value);
 const revised={...exam,questoes:[{...exam.questoes[0],enunciado:'Questão revisada'}]};
 expect(readClassExamSession('student',revised)?.exam.questoes[0].enunciado).toBe(exam.questoes[0].enunciado);
});
it.each([
 {answers:[]},{answers:'0:2'},{answers:{0:'2'}},{answers:{0:-1}},{answers:{0:3}},{answers:{0:1.5}},{answers:{1:2}},{answers:{'00':2}},
 {questionIndex:-1},{questionIndex:1},{questionIndex:'0'},{activeSeconds:null},{activeSeconds:-1},{pending:'false'},{pending:true},
 {deadlineAt:'100000'},{deadlineAt:-1},{frozen:{}},{frozen:[]},{result:{}},
 {exam:{...exam,questoes:[]}},{exam:{...exam,questoes:[null]}},{exam:{...exam,questoes:[{...exam.questoes[0],opcoes:null}]}},
 {exam:{...exam,questoes:[{...exam.questoes[0],opcoes:[null,null]}]}},{exam:{...exam,questoes:[{...exam.questoes[0],valorPeso:'2'}]}},
 {exam:{...exam,questoes:[{...exam.questoes[0],opcoes:exam.questoes[0].opcoes.map(option=>({...option,isCorreta:true}))}]}}
])('rejeita sessão com estrutura ou estado inválido: %j',corruption=>{
 const corrupted={...value,...corruption};
 sessionStorage.setItem('edu_class_exam_v1:student:class-a:exam-a',JSON.stringify({version:1,updatedAt:Date.now(),value:corrupted}));
 expect(readClassExamSession('student',exam)).toBeNull();
 expect(saveClassExamSession('student',corrupted as ClassExamSession)).toBe(false);
});
it('não lê um snapshot de outra prova ou turma mesmo quando foi colocado sob a chave atual',()=>{
 for(const snapshot of [{...exam,turmaId:'class-b'},{...exam,id:'exam-b'}]){
  sessionStorage.setItem('edu_class_exam_v1:student:class-a:exam-a',JSON.stringify({version:1,updatedAt:Date.now(),value:{...value,exam:snapshot}}));
  expect(readClassExamSession('student',exam)).toBeNull();
 }
});
it.each([
 {frozen:{...attempt,alunoId:'peer'}},{frozen:{...attempt,examId:'exam-b'}},{frozen:{...attempt,turmaId:'class-b'}},
 {frozen:{...attempt,evidence:null}},{frozen:{...attempt,respostas:[null]}},{frozen:{...attempt,pontuacaoObtida:0}},
 {frozen:{...attempt,evidence:{...attempt.evidence,questions:[null]}}},
 {frozen:null,result:{...attempt,id:'result-a'}},
 {frozen:attempt,result:{...attempt,id:'result-a',alunoId:'peer'}},
 {frozen:attempt,result:{...attempt,id:'result-a',examId:'exam-b'}},
 {frozen:attempt,result:{...attempt,id:'result-a',turmaId:'class-b'}},
 {frozen:attempt,result:{...attempt,id:'result-a',evidence:{...attempt.evidence,sessionId:'other-attempt'}}}
])('não restaura resultado ou tentativa de outro vínculo ou evidência inválida: %j',corruption=>{
 sessionStorage.setItem('edu_class_exam_v1:student:class-a:exam-a',JSON.stringify({version:1,updatedAt:Date.now(),value:{...value,...corruption}}));
 expect(readClassExamSession('student',exam)).toBeNull();
});
it.each([undefined,null,'agora',-1,Number.NaN,Number.POSITIVE_INFINITY])('rejeita timestamp de validade não finito: %j',updatedAt=>{
 sessionStorage.setItem('edu_class_exam_v1:student:class-a:exam-a',JSON.stringify({version:1,updatedAt,value}));
 expect(readClassExamSession('student',exam)).toBeNull();
});
it('expira em sete dias e rejeita timestamps futuros sem prolongar a tentativa',()=>{
 const now=Date.now();vi.spyOn(Date,'now').mockReturnValue(now);
 for(const updatedAt of [now-7*86400000,now+1]){
  sessionStorage.setItem('edu_class_exam_v1:student:class-a:exam-a',JSON.stringify({version:1,updatedAt,value}));
  expect(readClassExamSession('student',exam)).toBeNull();
 }
});
it('um prazo quebrado nunca aparece como tempo adicional ou NaN',()=>{
 expect(classExamRemainingSeconds(Number.NaN)).toBe(0);
 expect(classExamRemainingSeconds(Number.POSITIVE_INFINITY)).toBe(0);
 expect(classExamRemainingSeconds(null)).toBeNull();
});
