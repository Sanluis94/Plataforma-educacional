import {collection,query,where,getDocs,doc,getDoc} from 'firebase/firestore';
import {db,auth} from '../../core/services/firebaseConfig';
import {getLocalEtlClassReport} from '../services/localEtlClient';
import {buildClassLearningReport} from '../services/learningAnalytics';
import type {ClassLearningReport,ClassReportInput} from '../learningAnalyticsTypes';
import type {ActivityData,SubmissionData,ClassData,UserData,ExamData,ExamAttempt,LessonPlanItem} from '../types';

export interface ClassLearningSnapshot {report:ClassLearningReport|null;input:ClassReportInput|null}
const snapshots=new Map<string,{expires:number;request:Promise<ClassLearningSnapshot>}>();
let cacheActor:string|null=null;
export function invalidateClassLearningSnapshot(classId?:string){if(classId){for(const key of snapshots.keys())if(key.endsWith(':'+classId))snapshots.delete(key);}else snapshots.clear();}
export async function getClassLearningSnapshot(classId:string,options:{force?:boolean}={}):Promise<ClassLearningSnapshot>{
  if(!db)return {report:await getLocalEtlClassReport(classId),input:null};
  const database=db,actor=auth?.currentUser?.uid;if(!actor)throw Error('Entre novamente para consultar o relatório.');
  if(cacheActor!==actor){snapshots.clear();cacheActor=actor;}
  const key=actor+':'+classId,cached=snapshots.get(key);
  if(!options.force&&cached&&cached.expires>Date.now())return cached.request;
  const request=(async()=>{
    const classDoc=await getDoc(doc(database,'classes',classId));if(!classDoc.exists())return {report:null,input:null};
    const classData={...classDoc.data(),id:classDoc.id} as ClassData&{id:string;coordinatorIds?:string[]};
    if(actor!==classData.professorId){const profile=await getDoc(doc(database,'users',actor));const role=profile.data()?.role;if(role!=='admin'&&!(role==='coordenador'&&classData.coordinatorIds?.includes(actor)))throw Error('Esta turma não está vinculada ao seu perfil.');}
    async function rows<T>(name:string,field:string):Promise<T[]>{const response=await getDocs(query(collection(database,name),where(field,'==',classId)));return response.docs.map(entry=>({...entry.data(),id:entry.id})) as T[];}
    const [activities,submissions,exams,examAttempts,lessonPlans,profiles]=await Promise.all([rows<ActivityData>('activities','classId'),rows<SubmissionData>('submissions','classId'),rows<ExamData>('exams','turmaId'),rows<ExamAttempt>('exam_attempts','turmaId'),rows<LessonPlanItem>('lesson_plans','turmaId'),getDocs(collection(database,'classes',classId,'student_profiles'))]);
    if(auth?.currentUser?.uid!==actor)throw Error('A conta mudou durante o carregamento. Entre novamente.');
    const names=new Map<string,string>(submissions.filter(item=>item.studentName).map(item=>[item.studentId,item.studentName]));
    profiles.docs.forEach(entry=>{if(typeof entry.data().name==='string')names.set(entry.id,entry.data().name);});
    const users=(classData.studentIds||[]).flatMap(id=>names.has(id)?[{id,name:names.get(id)!,role:'estudante' as const,email:'',createdAt:classData.createdAt} as UserData]:[]);
    const input:ClassReportInput={classData,activities,submissions,exams,examAttempts,lessonPlans,users,source:'firestore'};
    return {report:buildClassLearningReport(input),input};
  })();
  snapshots.set(key,{expires:Date.now()+20000,request});
  try{return await request;}catch(error){if(snapshots.get(key)?.request===request)snapshots.delete(key);throw error;}
}
export async function getLiveClassReport(classId:string,options:{force?:boolean}={}):Promise<ClassLearningReport|null>{return (await getClassLearningSnapshot(classId,options)).report;}
export async function getProfessorLearningOverview(classIds:string[],reuse:ClassLearningReport[]=[]){
  const ready=new Map(reuse.map(report=>[report.classId,report]));
  const reports=await Promise.all([...new Set(classIds)].map(id=>ready.has(id)?ready.get(id)!:getLiveClassReport(id)));
  if(reports.some(report=>report===null))throw Error('Uma turma não está disponível para o relatório.');
  const available=reports.filter((report):report is ClassLearningReport=>Boolean(report));
  const expected=available.reduce((sum,report)=>sum+report.expectedCompletions,0),completed=available.reduce((sum,report)=>sum+report.completedActivitiesCount,0);
  const enrolled=available.reduce((sum,report)=>sum+report.studentsCount,0),participated=available.reduce((sum,report)=>sum+report.studentsWithEvidence,0);
  return {completionRate:expected?Math.round(completed/expected*100):null,engagement:enrolled?Math.round(participated/enrolled*100):null};
}
