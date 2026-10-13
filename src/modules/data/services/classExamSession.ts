import type {ExamData,ExamAttempt} from '../types';
export interface ClassExamSession{exam:ExamData;answers:Record<number,number>;questionIndex:number;deadlineAt:number|null;frozen:Omit<ExamAttempt,'id'>|null;result:ExamAttempt|null;pending:boolean;activeSeconds:number}
const key=(uid:string,classId:string,examId:string)=>`edu_class_exam_v1:${uid}:${classId}:${examId}`;
const object=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
const number=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
const text=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0;
const optionalText=(value:unknown)=>value===undefined||typeof value==='string';
const timestamp=(value:unknown):value is string=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
const close=(actual:unknown,expected:number)=>number(actual)&&Math.abs(actual-expected)<0.000001;

function validExam(value:unknown):value is ExamData{
  if(!object(value)||!text(value.id)||!text(value.turmaId)||!text(value.professorId)||!text(value.titulo)||!text(value.disciplina)||!['Rascunho','Aberta','Encerrada'].includes(String(value.status))||!number(value.pesoTotal)||value.pesoTotal<=0||!timestamp(value.criadoEm)||!Array.isArray(value.questoes)||value.questoes.length===0)return false;
  if(!['professorName','descricao','turmaNome','dataInicio','dataLimite','atualizadoEm'].every(field=>optionalText(value[field]))||(value.duracaoMinutos!==undefined&&(!number(value.duracaoMinutos)||value.duracaoMinutos<0))||(value.deadlineAtMillis!==undefined&&value.deadlineAtMillis!==null&&(!number(value.deadlineAtMillis)||value.deadlineAtMillis<0)))return false;
  return value.questoes.every(question=>object(question)&&text(question.enunciado)&&typeof question.tema==='string'&&['Fácil','Médio','Difícil'].includes(String(question.nivelDificuldade))&&number(question.valorPeso)&&question.valorPeso>0&&typeof question.justificativa==='string'&&Array.isArray(question.opcoes)&&question.opcoes.length>=2&&question.opcoes.every(option=>object(option)&&text(option.texto)&&typeof option.isCorreta==='boolean')&&question.opcoes.filter(option=>option.isCorreta).length===1);
}

function validAttempt(value:unknown,uid:string,exam:ExamData,answers:Record<number,number>):value is ExamAttempt{
  if(!object(value)||value.examId!==exam.id||value.turmaId!==exam.turmaId||value.alunoId!==uid||!text(value.examTitle)||typeof value.alunoNome!=='string'||!timestamp(value.dataEnvio)||!Array.isArray(value.respostas)||value.respostas.length!==exam.questoes.length)return false;
  const seen=new Set<number>();let obtained=0;
  for(const response of value.respostas){
    if(!object(response)||!number(response.questaoIndex)||!Number.isInteger(response.questaoIndex)||response.questaoIndex<0||response.questaoIndex>=exam.questoes.length||seen.has(response.questaoIndex))return false;
    seen.add(response.questaoIndex);
    const question=exam.questoes[response.questaoIndex],selected=answers[response.questaoIndex]??-1;
    const correct=selected>=0&&question.opcoes[selected].isCorreta,points=correct?question.valorPeso:0;
    if(response.opcaoEscolhidaIndex!==selected||response.acertou!==correct||!close(response.pontosObtidos,points))return false;
    obtained+=points;
  }
  const maximum=exam.questoes.reduce((sum,question)=>sum+question.valorPeso,0),percentage=Math.round(obtained/maximum*10000)/100;
  const classification=percentage>=85?'Excelente':percentage>=70?'Bom':percentage>=50?'Regular':'Insuficiente';
  if(!close(value.pontuacaoObtida,obtained)||!close(value.pontuacaoMaxima,maximum)||!close(value.porcentagemAproveitamento,percentage)||value.classificacao!==classification)return false;
  const evidence=value.evidence;
  if(!object(evidence)||evidence.schemaVersion!==1||evidence.source!=='exam'||evidence.stage!=='assessment'||!text(evidence.sessionId)||(evidence.activeSeconds!==undefined&&(!number(evidence.activeSeconds)||evidence.activeSeconds<0))||!['startedAt','subject','reflection'].every(field=>optionalText(evidence[field]))||!Array.isArray(evidence.questions)||evidence.questions.length!==exam.questoes.length)return false;
  return evidence.questions.every((response,index)=>{
    const question=exam.questoes[index],selected=answers[index]??null;
    return object(response)&&text(response.questionId)&&typeof response.question==='string'&&response.selectedOption===selected&&response.correct===(selected!==null&&question.opcoes[selected].isCorreta)&&['selectedText','expectedText','explanation','topic'].every(field=>optionalText(response[field]));
  });
}

/** Validate the complete snapshot before restoring any timer or locked delivery. */
export function isClassExamSession(value:unknown,uid:string,exam:Pick<ExamData,'id'|'turmaId'>):value is ClassExamSession{
  if(!uid||!object(value)||!validExam(value.exam)||value.exam.id!==exam.id||value.exam.turmaId!==exam.turmaId||!object(value.answers)||!number(value.questionIndex)||!Number.isInteger(value.questionIndex)||value.questionIndex<0||value.questionIndex>=value.exam.questoes.length||(value.deadlineAt!==null&&(!number(value.deadlineAt)||value.deadlineAt<0))||typeof value.pending!=='boolean'||!number(value.activeSeconds)||value.activeSeconds<0)return false;
  const snapshot=value.exam;
  if(!Object.entries(value.answers).every(([index,answer])=>/^(0|[1-9]\d*)$/.test(index)&&Number(index)<snapshot.questoes.length&&number(answer)&&Number.isInteger(answer)&&answer>=0&&answer<snapshot.questoes[Number(index)].opcoes.length))return false;
  const answers=value.answers as Record<number,number>;
  if(value.frozen!==null&&!validAttempt(value.frozen,uid,snapshot,answers))return false;
  if(value.result!==null&&(!validAttempt(value.result,uid,snapshot,answers)||!text(value.result.id)))return false;
  if(value.pending&&value.result===null)return false;
  if(value.result!==null){
    if(value.frozen===null)return false;
    return value.frozen.evidence?.sessionId===value.result.evidence?.sessionId&&value.frozen.dataEnvio===value.result.dataEnvio;
  }
  return true;
}

export function readClassExamSession(uid:string,exam:ExamData):ClassExamSession|null{
  if(!uid||!exam.id||!exam.turmaId)return null;
  try{
    const raw=sessionStorage.getItem(key(uid,exam.turmaId,exam.id));if(!raw)return null;
    const saved:unknown=JSON.parse(raw),now=Date.now();
    if(!object(saved)||saved.version!==1||!number(saved.updatedAt)||saved.updatedAt<0||saved.updatedAt>now||now-saved.updatedAt>=7*86400000||!isClassExamSession(saved.value,uid,exam))return null;
    return saved.value;
  }catch{return null;}
}
export function saveClassExamSession(uid:string,value:ClassExamSession):boolean{
  try{
    if(!isClassExamSession(value,uid,value.exam))return false;
    sessionStorage.setItem(key(uid,value.exam.turmaId!,value.exam.id!),JSON.stringify({version:1,updatedAt:Date.now(),value}));return true;
  }catch{return false;}
}
export function classExamRemainingSeconds(deadlineAt:number|null,now=Date.now()):number|null{return deadlineAt===null?null:!number(deadlineAt)||!number(now)?0:Math.max(0,Math.ceil((deadlineAt-now)/1000));}
