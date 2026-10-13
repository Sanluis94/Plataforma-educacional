import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../../core/services/firebaseConfig';
import type { UserData } from '../types';
export interface StudentGuidance { id:string; classId:string; studentId:string; professorId:string; text:string; activityId?:string; createdAt:string }
const key='edu_local_student_guidance';
function local():StudentGuidance[] { const value=JSON.parse(localStorage.getItem(key)||'[]'); if(!Array.isArray(value)) throw new Error('Não foi possível ler as orientações deste navegador.'); return value; }
export async function createStudentGuidance(input:Omit<StudentGuidance,'id'|'createdAt'>):Promise<StudentGuidance> {
  const text=input.text.trim();
  if(!input.classId||!input.studentId||!input.professorId||text.length<5||text.length>4000) throw new Error('Informe a turma, o aluno e uma orientação entre 5 e 4.000 caracteres.');
  const value={...input,text,id:crypto.randomUUID(),createdAt:new Date().toISOString()};
  if(db){
    if(auth?.currentUser?.uid!==input.professorId) throw new Error('Entre novamente antes de enviar a orientação.');
    const {id,...data}=value; await setDoc(doc(db,'student_guidance',id),data);
  } else {
    const session=JSON.parse(localStorage.getItem('edu-interact-local-auth-session')||'null');
    const database=JSON.parse(localStorage.getItem('edu_local_db')||'{}');
    const turma=(database.classes||[]).find((entry:{id:string})=>entry.id===input.classId);
    const role=(database.users||[]).find((entry:UserData)=>entry.id===session?.currentUser?.uid)?.role||session?.userData?.role;
    if(!session||session.currentUser.uid!==input.professorId||!turma||!(turma.studentIds||[]).includes(input.studentId)||(turma.professorId!==input.professorId&&role!=='admin')) throw new Error('Esta turma ou aluno não pertence ao seu acesso.');
    localStorage.setItem(key,JSON.stringify([...local(),value]));
  }
  return value;
}
export async function getStudentGuidance(classId:string,studentId:string):Promise<StudentGuidance[]> {
  if(!classId||!studentId)return [];
  const values=db?(await getDocs(query(collection(db,'student_guidance'),where('classId','==',classId),where('studentId','==',studentId)))).docs.map(entry=>({...entry.data(),id:entry.id})as StudentGuidance):local().filter(entry=>entry.classId===classId&&entry.studentId===studentId);
  return values.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
