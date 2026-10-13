import {afterEach,it,expect,vi} from 'vitest';
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {GuidedLabActivity} from '../modules/ux/components/labs/GuidedLabActivity';
import {StudentClassActivity} from '../modules/ux/components/StudentClassActivity';
import {LAB_LEARNING_CONTENT} from '../modules/core/content/labLearningContent';
afterEach(()=>{cleanup();localStorage.clear();vi.restoreAllMocks();});
const content=LAB_LEARNING_CONTENT.fund1_mat_01;
const props={labId:'fund1_mat_01',title:'Ábaco',subject:'Matemática',objective:'Compor e decompor números.',content};
it('restaura previsões, conclusões e respostas de um roteiro ao recarregar',()=>{
  const view=render(<GuidedLabActivity {...props}/>);fireEvent.change(screen.getByLabelText('Minha previsão e justificativa'),{target:{value:'Minha previsão privada'}});fireEvent.change(screen.getByLabelText(/Minha resposta com evidências/),{target:{value:'Observei uma dezena'}});fireEvent.click(screen.getByRole('button',{name:'Avaliar'}));fireEvent.click(screen.getByLabelText(content.questions[0].options[0].text));view.unmount();render(<GuidedLabActivity {...props}/>);expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue('Minha previsão privada');expect(screen.getByLabelText(/Minha resposta com evidências/)).toHaveValue('Observei uma dezena');fireEvent.click(screen.getByRole('button',{name:'Avaliar'}));expect(screen.getByLabelText(content.questions[0].options[0].text)).toBeChecked();
});
it('resposta escrita restaura por aluno e não aparece para outra conta',()=>{
  const activity={id:'activity-a',classId:'class-a',title:'Comparar',description:'Explique as relações',professorId:'teacher',createdAt:new Date().toISOString(),status:'published' as const,type:'written_response',config:{},questions:[]};const submit=vi.fn();let view=render(<StudentClassActivity activity={activity} studentId="one" onSubmit={submit}/>);fireEvent.change(screen.getByLabelText(/Minha resposta e conclusões/),{target:{value:'Minha conclusão reservada'}});view.unmount();view=render(<StudentClassActivity activity={activity} studentId="two" onSubmit={submit}/>);expect(screen.getByLabelText(/Minha resposta e conclusões/)).toHaveValue('');view.unmount();render(<StudentClassActivity activity={activity} studentId="one" onSubmit={submit}/>);expect(screen.getByLabelText(/Minha resposta e conclusões/)).toHaveValue('Minha conclusão reservada');
});
it('recarregar depois de falha repete a mesma evidência, sem gerar entrega duplicada',async()=>{
  const submit=vi.fn().mockRejectedValueOnce(new Error('Sem conexão')).mockResolvedValue(undefined);const view=render(<GuidedLabActivity {...props} onComplete={submit}/>);fireEvent.click(screen.getByRole('button',{name:'Avaliar'}));for(const question of content.questions)fireEvent.click(screen.getByLabelText(question.options[0].text));fireEvent.click(screen.getByRole('button',{name:'Corrigir respostas'}));await screen.findByRole('alert');const first=submit.mock.calls[0][0];view.unmount();render(<GuidedLabActivity {...props} onComplete={submit}/>);fireEvent.click(screen.getByRole('button',{name:'Avaliar'}));fireEvent.click(screen.getByRole('button',{name:'tente salvar novamente'}));await waitFor(()=>expect(submit).toHaveBeenCalledTimes(2));expect(submit.mock.calls[1][0]).toEqual(first);
});

it.each([
  {hypotheses:null}, {hypotheses:{0:{text:'inválido'}}}, {answers:null}, {answers:{0:-1}},
  {revealedScenarios:null}, {revealedScenarios:[999]}, {notes:[]}, {activeSeconds:'20'},
  {submitted:true,report:null}, {submitted:true,report:{score:80,telemetryRows:0,evidence:null}},
  {submitted:true,report:{score:80,telemetryRows:0,evidence:{schemaVersion:1,source:'lab',sessionId:'s',questions:[null]}}}
])('abre o roteiro com aviso e edição funcional quando o rascunho contém %j',corruption=>{
  const first=render(<GuidedLabActivity {...props}/>);
  first.unmount();
  const key=Object.keys(localStorage).find(key=>key.startsWith('edu_guided_draft_v1:'))!;
  const draft=JSON.parse(localStorage.getItem(key)!);
  localStorage.setItem(key,JSON.stringify({...draft,value:{...draft.value,...corruption}}));
  render(<GuidedLabActivity {...props}/>);
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível restaurar');
  expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue('');
  fireEvent.change(screen.getByLabelText('Minha previsão e justificativa'),{target:{value:'Previsão recuperada'}});
  expect(screen.getByLabelText('Minha previsão e justificativa')).toHaveValue('Previsão recuperada');
  fireEvent.click(screen.getByRole('button',{name:'Avaliar'}));
  expect(screen.getByRole('button',{name:'Corrigir respostas'})).toBeDisabled();
});

it.each([
  {answers:null}, {answers:{0:999}}, {reflection:null}, {delivered:'qualquer'},
  {delivered:'saved',frozen:null}, {frozen:{score:80,evidence:null}},
  {frozen:{score:80,evidence:{schemaVersion:1,source:'activity',sessionId:'s',questions:[null]}}}
])('abre a atividade com aviso e campos válidos quando o rascunho contém %j',corruption=>{
  const activity={id:'activity-corrupt',classId:'class-a',title:'Comparar',description:'Compare as relações',professorId:'teacher',createdAt:new Date().toISOString(),status:'published' as const,type:'quiz',config:{},questions:[{q:'Qual relação?',options:['A','B'],answer:0,explanation:'A comparação indica a relação A.'}]};
  const submit=vi.fn();const first=render(<StudentClassActivity activity={activity} studentId="one" onSubmit={submit}/>);first.unmount();
  const key=Object.keys(localStorage).find(key=>key.startsWith('edu_activity_answer_v1:'))!;
  const draft=JSON.parse(localStorage.getItem(key)!);
  localStorage.setItem(key,JSON.stringify({...draft,value:{...draft.value,...corruption}}));
  render(<StudentClassActivity activity={activity} studentId="one" onSubmit={submit}/>);
  expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível restaurar');
  expect(screen.getByLabelText(/Minha resposta e conclusões/)).toHaveValue('');
  expect(screen.getByRole('button',{name:'Entregar atividade'})).toBeDisabled();
  fireEvent.click(screen.getByLabelText('A'));
  expect(screen.getByRole('button',{name:'Entregar atividade'})).toBeEnabled();
});
