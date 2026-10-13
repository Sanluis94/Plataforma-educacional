import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {getProfessorClasses,getStudentClasses} from '../../data/repositories/classRepository';
import {useAuth} from '../../core/contexts/AuthContext';
export function HomeNextStep(){
  const {currentUser,userData}=useAuth();const uid=currentUser?.uid,role=userData?.role;
  const [result,setResult]=useState<{uid?:string;role?:string;classes:number|null;error:string}>({classes:null,error:''});
  const current=result.uid===uid&&result.role===role?result:{classes:null,error:''};
  const {classes,error}=current;
  useEffect(()=>{let active=true;if(!uid||!['professor','estudante'].includes(role||''))return;void(role==='professor'?getProfessorClasses(uid):getStudentClasses(uid)).then(values=>{if(active)setResult({uid,role,classes:values.length,error:''});}).catch(()=>{if(active)setResult({uid,role,classes:null,error:'Não foi possível atualizar suas turmas. Abra seu painel para tentar novamente.'});});return()=>{active=false;};},[uid,role]);
  const student=role==='estudante',teacher=role==='professor';
  const href=teacher?'/professor?tab=classes':student?classes===0?'/estudante?tab=classes':'/estudante?tab=activities':role==='coordenador'?'/coordenacao':'/admin';
  const action=teacher?classes===0?'Criar minha primeira turma':'Abrir minha turma e publicar atividade':student?classes===0?'Entrar na minha turma':'Ver atividades da minha turma':role==='coordenador'?'Acompanhar turmas vinculadas':'Abrir administração';
  return <section className="card" style={{padding:'1.25rem',marginBottom:'1.5rem',border:'2px solid var(--color-primary)'}} aria-label="Seu próximo passo"><h2 style={{fontSize:'1.25rem'}}>Seu próximo passo</h2><p>{teacher?'Crie a turma, compartilhe o código e publique uma atividade. As entregas aparecerão no acompanhamento.':student?'Entre na turma com o código do professor, confira as atividades e acompanhe suas devolutivas.':'Abra seu painel para consultar os dados autorizados ao seu perfil.'}</p>{error&&<p role="alert">{error}</p>}<Link className="btn-primary" to={href}>{action}</Link><p style={{marginTop:12,fontSize:'.85rem'}}>As demais ferramentas continuam disponíveis nas opções abaixo.</p></section>;
}
