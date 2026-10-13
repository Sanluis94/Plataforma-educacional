import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StudentClassActivity } from '../modules/ux/components/StudentClassActivity';
import type { ActivityData, SubmissionData } from '../modules/data/types';

const activity: ActivityData = { id: 'a1', title: 'Versão atual', type: 'quiz', classId: 'c1', professorId: 'p1', status: 'published', config: {}, createdAt: '2026-10-12T00:00:00Z', questions: [{ q: 'Pergunta alterada depois da entrega', options: ['Nova A', 'Nova B'], answer: 0, explanation: 'Explicação alterada' }] };
const previous: SubmissionData = { id: 'r1', activityId: 'a1', activityTitle: 'Versão aplicada', classId: 'c1', studentId: 's1', studentName: 'Aluno fictício', score: 0, status: 'completed', submittedAt: '2026-10-11T00:00:00Z', evidence: { schemaVersion: 1, source: 'activity', sessionId: 'original', stage: 'assessment', reflection: 'Conclusão original', questions: [{ questionId: 'a1-q1', question: 'Pergunta original', selectedOption: 1, selectedText: 'Resposta original B', expectedText: 'Resposta original A', explanation: 'Explicação da versão aplicada', correct: false }] } };
afterEach(()=>{cleanup();localStorage.clear();});

describe('entrega escrita e versão aplicada', () => {
  it('uma nova tentativa sobrevive à recarga e à troca transitória da entrega anterior',async()=>{
    const submit=vi.fn(async()=>({queued:false}));
    let view=render(<StudentClassActivity activity={activity} studentId="s1" previousSubmission={previous} onSubmit={submit}/>);
    fireEvent.click(screen.getByRole('button',{name:'Fazer nova tentativa'}));fireEvent.click(screen.getByLabelText('Nova A'));
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'Minha nova conclusão'}});
    view.unmount();view=render(<StudentClassActivity activity={activity} studentId="s1" previousSubmission={previous} onSubmit={submit}/>);
    expect(screen.getByLabelText('Nova A')).toBeChecked();expect(screen.getByRole('textbox')).toHaveValue('Minha nova conclusão');
    fireEvent.click(screen.getByRole('button',{name:'Entregar atividade'}));await screen.findByText('Entrega salva. Aproveitamento: 100%.');
    view.rerender(<StudentClassActivity activity={activity} studentId="s1" previousSubmission={{...previous,id:'transient-queue-receipt'}} onSubmit={submit}/>);
    view.rerender(<StudentClassActivity activity={activity} studentId="s1" previousSubmission={previous} onSubmit={submit}/>);
    expect(screen.getByText('Entrega salva. Aproveitamento: 100%.')).toBeInTheDocument();expect(screen.getByRole('textbox')).toHaveValue('Minha nova conclusão');
    expect(submit).toHaveBeenCalledExactlyOnceWith(activity,100,expect.objectContaining({reflection:'Minha nova conclusão'}));
  });
  it('a recarga apresenta o que o aluno respondeu, mesmo após edição da atividade', () => {
    render(<StudentClassActivity activity={activity} previousSubmission={previous} onSubmit={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Versão aplicada' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Pergunta original/ })).toBeInTheDocument();
    expect(screen.getByText('Resposta original B')).toBeInTheDocument();
    expect(screen.getByText('Explicação da versão aplicada')).toBeInTheDocument();
    expect(screen.queryByText('Pergunta alterada depois da entrega')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('Conclusão original');
  });
  it('nova tentativa usa o conteúdo atual e registra sua própria evidência e identidade', async () => {
    const submit = vi.fn(async () => ({ queued: false }));
    render(<StudentClassActivity activity={activity} previousSubmission={previous} onSubmit={submit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Fazer nova tentativa' }));
    fireEvent.click(screen.getByLabelText('Nova A'));
    fireEvent.click(screen.getByRole('button', { name: 'Entregar atividade' }));
    await waitFor(() => expect(submit).toHaveBeenCalledOnce());
    const record = submit.mock.calls[0] as unknown as [ActivityData, number, { sessionId: string; questions: { question: string; selectedText: string; expectedText: string; explanation: string }[] }];
    expect(record[1]).toBe(100);
    expect(record[2].sessionId).not.toBe('original');
    expect(record[2].questions[0]).toMatchObject({ question: activity.questions![0].q, selectedText: 'Nova A', expectedText: 'Nova A', explanation: 'Explicação alterada' });
    expect(screen.getByText('Explicação alterada')).toBeInTheDocument();
  });
});
