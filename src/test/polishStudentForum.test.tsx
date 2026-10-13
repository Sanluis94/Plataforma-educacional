import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,render,fireEvent,screen,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {StudentLmsModules} from '../modules/ux/components/StudentLmsModules';
import {getGradePolicy,type GradePeriod} from '../modules/data/repositories/gradePolicyRepository';
vi.mock('../modules/core/services/firebaseConfig',()=>({db:null}));
vi.mock('../modules/data/repositories/submissionRepository',()=>({getSubmissionsByStudentInClass:vi.fn(async()=>[]),getPublishedSubmissionReviewsByStudent:vi.fn(async()=>[])}));
vi.mock('../modules/data/repositories/examRepository',()=>({getExamAttemptsByStudent:vi.fn(async()=>[])}));
vi.mock('../modules/data/repositories/activityRepository',()=>({getActivitiesByClass:vi.fn(async()=>[])}));
vi.mock('../modules/data/repositories/gradePolicyRepository',async load=>({...await load<object>(),getGradePolicy:vi.fn(async()=>null)}));
vi.mock('../modules/core/services/certificateService',()=>({getStudentCertificates:vi.fn(async()=>[])}));
afterEach(()=>{cleanup();localStorage.clear();vi.clearAllMocks();});
it('a publicação no modo local aparece imediatamente na lista sem recarregar',async()=>{
 render(<MemoryRouter><StudentLmsModules studentId="student-a" studentName="Aluno fictício" selectedClassId="class-a" activeView="forum" onViewChange={()=>{}}/></MemoryRouter>);
 fireEvent.click(screen.getByRole('button',{name:'Publicar Nova Dúvida'}));fireEvent.change(screen.getByLabelText('Título da Pergunta / Dúvida'),{target:{value:'Como comparar resultados?'}});fireEvent.change(screen.getByLabelText('Explique sua Dúvida com Detalhes'),{target:{value:'Comparei duas condições e gostaria de discutir a relação observada.'}});fireEvent.click(screen.getByRole('button',{name:'Publicar pergunta para a turma'}));await screen.findByText('Como comparar resultados?');const saved=JSON.parse(localStorage.getItem('edu_local_forum_class-a')!);expect(saved[0].autorId).toBe('student-a');expect(saved).toHaveLength(1);
});
it('normaliza período inválido para o histórico completo antes de consultar critérios',async()=>{
 const change=vi.fn();
 render(<MemoryRouter><StudentLmsModules studentId="student-a" studentName="Aluno fictício" selectedClassId="class-a" activeView="gradebook" onViewChange={()=>{}} period={'periodo-invalido' as GradePeriod} onPeriodChange={change}/></MemoryRouter>);
 await waitFor(()=>expect(getGradePolicy).toHaveBeenCalledWith('class-a','atual'));
 expect(screen.getByRole('combobox',{name:'Período'})).toHaveValue('atual');
 fireEvent.change(screen.getByRole('combobox',{name:'Período'}),{target:{value:'1º Bimestre'}});
 expect(change).toHaveBeenCalledWith('1º Bimestre');
 expect(screen.queryByText(/Não foi possível carregar suas avaliações/)).not.toBeInTheDocument();
});
