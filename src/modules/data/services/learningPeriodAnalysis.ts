import type { LearningRecord } from '../learningAnalyticsTypes';
export interface LearningPeriod { from:string; to:string }
const assessment=(record:LearningRecord)=>record.completed&&record.evidence?.stage!=='exploration'&&record.evidence?.stage!=='response'&&record.score!==null;
export function analyzeLearningPeriod(input:LearningRecord[],period:LearningPeriod) {
  const start=period.from?Date.parse(period.from+'T00:00:00'):Number.NEGATIVE_INFINITY;
  const end=period.to?Date.parse(period.to+'T23:59:59.999'):Number.POSITIVE_INFINITY;
  const invalid=Number.isNaN(start)||Number.isNaN(end)||start>end;
  const seen=new Set<string>();
  const records=invalid?[]:input.filter(record=>{if(seen.has(record.source+':'+record.id))return false;seen.add(record.source+':'+record.id);const time=Date.parse(record.submittedAt);return Number.isFinite(time)&&time>=start&&time<=end;}).sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)||a.id.localeCompare(b.id));
  const groups=new Map<string,LearningRecord[]>();
  for(const record of records){const key=[record.studentId,record.source,record.itemId].join(':');groups.set(key,[...(groups.get(key)||[]),record]);}
  const topics=new Map<string,{topic:string;responses:number;correct:number}>();const comparisons:{studentId:string;itemId:string;before:number;after:number}[]=[];
  const scores:number[]=[];
  for(const values of groups.values()){
    const graded=values.filter(assessment);const latest=graded.at(-1);if(latest?.score!==null&&latest?.score!==undefined)scores.push(latest.score);
    for(const question of latest?.evidence?.questions||[]){if(question.correct===null)continue;const topic=question.topic?.trim()||latest?.subject||latest?.title||'Atividade';const aggregate=topics.get(topic)||{topic,responses:0,correct:0};aggregate.responses++;if(question.correct)aggregate.correct++;topics.set(topic,aggregate);}
    const versions=new Map<string,LearningRecord[]>();for(const value of graded){const signature=JSON.stringify(value.evidence?.questions?.map(q=>[q.question,q.expectedText])||[]);versions.set(signature,[...(versions.get(signature)||[]),value]);}
    for(const attempts of versions.values()){if(attempts.length<2)continue;const first=attempts[0],last=attempts.at(-1)!;if(first.score!==null&&last.score!==null)comparisons.push({studentId:first.studentId,itemId:first.itemId,before:first.score,after:last.score});}
  }
  const mean=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
  return {invalid,records,students:new Set(records.map(r=>r.studentId)).size,average:mean(scores),scored:scores.length,topics:[...topics.values()].sort((a,b)=>a.correct/a.responses-b.correct/b.responses),comparisons,before:mean(comparisons.map(v=>v.before)),after:mean(comparisons.map(v=>v.after))};
}
