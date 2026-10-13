import { useEffect, useState } from 'react';
import { createStudentGuidance, getStudentGuidance, type StudentGuidance } from '../../data/repositories/guidanceRepository';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';
import { useAuth } from '../../core/contexts/AuthContext';

export function StudentOrientationComposer({classId,studentId,teacherId,studentName='Aluno',onClose,onSaved}:{classId:string;studentId:string;teacherId:string;studentName?:string;onClose:()=>void;onSaved?:()=>void}) {
  const [text,setText]=useState('');const [saving,setSaving]=useState(false);const [error,setError]=useState('');const [sent,setSent]=useState(false);
  const ref=useDialogAccessibility(true,()=>{if(!saving)onClose();});
  async function send(){if(saving||sent)return;setSaving(true);setError('');try{await createStudentGuidance({classId,studentId,professorId:teacherId,text});setSent(true);onSaved?.();}catch(failure){setError(failure instanceof Error?failure.message:'Não foi possível enviar a orientação.');}finally{setSaving(false);}}
  return <div style={{position:'fixed',inset:0,zIndex:1000,background:'var(--bg-overlay)',display:'grid',placeItems:'center',padding:'1rem'}}><section ref={ref} role="dialog" aria-modal="true" aria-labelledby="student-orientation-title" tabIndex={-1} className="card" style={{padding:'1.25rem',width:'100%',maxWidth:560,maxHeight:'90dvh',overflowY:'auto'}}><h2 id="student-orientation-title">Orientar {studentName}</h2><p>A orientação ficará disponível para este aluno nas atividades da turma.</p>{sent?<p role="status">Orientação enviada e disponível para o aluno.</p>:<label style={{display:'grid',gap:8}}>Próximo passo sugerido<textarea rows={5} maxLength={4000} value={text} onChange={event=>setText(event.target.value)} placeholder="Explique o que revisar e indique uma atividade para praticar." /></label>}{error&&<p role="alert">{error}</p>}<div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>{!sent&&<button className="btn-primary" disabled={saving||text.trim().length<5} onClick={()=>void send()}>{saving?'Enviando…':'Enviar orientação'}</button>}<button className="btn-outline" disabled={saving} onClick={onClose}>{sent?'Fechar':'Cancelar'}</button></div></section></div>;
}

export function StudentGuidanceInbox({classId,studentId}:{classId:string|null;studentId:string}) {
  const {currentUser}=useAuth();const uid=currentUser?.uid;const [refresh,setRefresh]=useState(0);
  const scope=`${uid}:${classId}:${studentId}:${refresh}`;
  const [result,setResult]=useState<{scope:string;items:StudentGuidance[];error:string}|null>(null);
  const current=result?.scope===scope?result:null;
  const items=current?.items??[],error=current?.error??'',loading=Boolean(classId&&uid&&!current);
  useEffect(()=>{let cancelled=false;if(!classId||!uid)return;void getStudentGuidance(classId,studentId).then(items=>{if(!cancelled)setResult({scope,items,error:''});}).catch(()=>{if(!cancelled)setResult({scope,items:[],error:'Não foi possível atualizar as orientações do professor.'});});return()=>{cancelled=true;};},[classId,studentId,uid,scope]);
  if(!classId||(!items.length&&!error&&!loading))return null;
  return <section className="card" aria-label="Orientações do professor" style={{padding:'1rem',marginBottom:'1rem'}}><h2>Orientações do professor</h2>{loading&&<p role="status">Carregando orientações…</p>}{error&&<p role="alert">{error}</p>}{items.map(item=><article key={item.id} style={{borderBottom:'1px solid var(--border-color)',padding:'0.75rem 0'}}><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString('pt-BR')}</time><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{item.text}</p></article>)}<button className="btn-outline" disabled={loading} onClick={()=>setRefresh(value=>value+1)}>Atualizar orientações</button></section>;
}
