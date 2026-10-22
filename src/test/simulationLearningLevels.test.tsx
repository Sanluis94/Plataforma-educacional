import {saveLocalSubmission} from '../modules/data/services/localEtlClient';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { Simulacao } from '../modules/ux/pages/Simulacao';
import { SkillTreeExplorerModal } from '../modules/ux/components/labs/SkillTreeExplorerModal';
import { CommandPaletteModal } from '../modules/ux/components/common/CommandPaletteModal';
import { CertificateModal } from '../modules/ux/components/labs/CertificateModal';
import { LEARNING_LABS_CATALOG, getLearningLab, getLearningLabCounts, searchLearningLabs } from '../modules/core/constants/learningCatalog';
import { learningLevelLabel, type LearningLevel } from '../modules/core/constants/learningLevels';
import { getLabLearningContent } from '../modules/core/content/labLearningContent';

const auth = vi.hoisted(() => ({ userData: { gradeLevel: 'fundamental_1', name: 'Estudante de teste', role: 'estudante' }, completeLab: vi.fn() }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'test-user' }, userData: auth.userData }) }));
vi.mock('../modules/core/hooks/useStudentLabCompletion', () => ({ useStudentLabCompletion: () => ({ completeLab: auth.completeLab }) }));

function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; }
function RouteJump({ to }: { to: string }) { const navigate = useNavigate(); return <button onClick={() => navigate(to)}>Abrir resultado da busca</button>; }
function renderPage(url = '/simulacao', props: React.ComponentProps<typeof Simulacao> = {}) {
  return render(<MemoryRouter initialEntries={[url]}><Simulacao {...props} /><Location /></MemoryRouter>);
}

function chooseSubject(subject: string, level: LearningLevel) {
  fireEvent.click(screen.getByRole('button', { name: 'Escolher matéria' }));
  const count = searchLearningLabs({ academicLevel: level, subject }).length;
  fireEvent.click(within(screen.getByRole('group', { name: 'Matérias disponíveis' })).getByRole('button', { name: `${subject} (${count} laboratórios)` }));
}

beforeEach(() => {
  auth.userData.gradeLevel = 'fundamental_1';
  auth.userData.role = 'estudante';
  localStorage.clear();
  localStorage.setItem('edu_local_db',JSON.stringify({users:[],classes:[],activities:[],submissions:[],progress:{'test-user':{level:1,xp:0,coins:0,completedModules:[],purchasedItems:[]}},learningEvents:[],systemLogs:[]}));
  auth.completeLab.mockReset().mockImplementation(async(lab,score,evidence)=>{await saveLocalSubmission({activityId:lab.id,activityTitle:lab.title,classId:'',studentId:'test-user',studentName:'Estudante de teste',score,status:'completed',submittedAt:new Date().toISOString(),evidence});const data=JSON.parse(localStorage.getItem('edu_local_db')!);data.progress['test-user'].completedModules=[lab.id];localStorage.setItem('edu_local_db',JSON.stringify(data));return {alreadyCompleted:false,queued:false};});
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Navegação de laboratórios por nível', () => {
  it.each([['professor', '/professor'], ['coordenador', '/coordenacao'], ['admin', '/admin'], ['estudante', '/estudante']])('retorna %s ao painel autorizado', (role, path) => {
    auth.userData.role = role;
    renderPage();
    expect(screen.getByRole('link', { name: role === 'estudante' ? 'Meu aprendizado' : 'Voltar ao meu painel' })).toHaveAttribute('href', path);
  });

  it('reconcilia a disciplina quando outra atividade chega pela busca global', async () => {
    const lab = getLearningLab('port_3')!;
    render(<MemoryRouter initialEntries={['/simulacao?level=medio']}><Simulacao /><RouteJump to={`/simulacao?lab=port_3&level=${lab.academicLevel}`} /><Location /></MemoryRouter>);
    chooseSubject(getLearningLab('math_2')!.subject, getLearningLab('math_2')!.academicLevel);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir resultado da busca' }));
    expect(await screen.findByRole('region', { name: `Laboratório: ${lab.title}` }, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Escolher matéria' })).toHaveTextContent(lab.subject);
  });

  it('inicia no nível do perfil, com contagem real e sem abrir bancada de outro nível', () => {
    renderPage();
    const counts = getLearningLabCounts();
    expect(screen.getByRole('button', { name: `${learningLevelLabel('fundamental_1')} (${counts.fundamental_1})` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('article', { name: getLearningLab('fund1_mat_01')!.title })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: getLearningLab('pos_ia_01')!.title })).not.toBeInTheDocument();
    expect(screen.queryByText('Bancada: Física')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comprovante deste nível' })).toBeDisabled();
  });

  it('resolve o laboratório da URL e usa seu nível mesmo com parâmetro conflitante', () => {
    renderPage('/simulacao?lab=pos_ia_01&level=fundamental_1');
    expect(screen.getByRole('heading', { name: getLearningLab('pos_ia_01')!.title })).toBeInTheDocument();
    const counts = getLearningLabCounts();
    expect(screen.getByRole('button', { name: `${learningLevelLabel('pos_graduacao')} (${counts.pos_graduacao})` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(new RegExp(`${learningLevelLabel('pos_graduacao')} · .*Exploração de cenários`))).toBeInTheDocument();
  });

  it('troca o nível e encerra a atividade anterior, mantendo os resultados no novo nível', () => {
    renderPage('/simulacao?lab=pos_ia_01');
    fireEvent.click(screen.getByRole('button', { name: `${learningLevelLabel('fundamental_1')} (${getLearningLabCounts().fundamental_1})` }));
    expect(screen.queryByRole('heading', { name: getLearningLab('pos_ia_01')!.title })).not.toBeInTheDocument();
    expect(screen.getByRole('article', { name: getLearningLab('fund1_mat_01')!.title })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/simulacao?level=fundamental_1');
  });

  it('filtra por disciplina dentro do nível atual', () => {
    const lab = getLearningLab('fund1_mat_01')!;
    renderPage();
    chooseSubject(lab.subject, lab.academicLevel);
    expect(screen.getByRole('article', { name: lab.title })).toBeInTheDocument();
    const otherSubject = LEARNING_LABS_CATALOG.find(item => item.academicLevel === 'fundamental_1' && item.subject !== lab.subject)!;
    expect(screen.queryByRole('article', { name: otherSubject.title })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article').every(article => article.textContent?.includes(lab.subject))).toBe(true);
    expect(screen.getByTestId('location')).toHaveTextContent('/simulacao?subject=');
    expect(screen.getByRole('button', { name: 'Escolher matéria' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('fecha o painel de matérias com Escape e oferece a opção de limpar o filtro', () => {
    const lab = getLearningLab('fund1_mat_01')!;
    renderPage();
    const trigger = screen.getByRole('button', { name: 'Escolher matéria' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    chooseSubject(lab.subject, lab.academicLevel);
    fireEvent.click(trigger);
    fireEvent.click(within(screen.getByRole('group', { name: 'Matérias disponíveis' })).getByRole('button', { name: 'Todas as matérias (21 laboratórios)' }));
    expect(screen.getByTestId('location')).not.toHaveTextContent('subject=');
    expect(screen.getAllByRole('article')).toHaveLength(getLearningLabCounts().fundamental_1);
  });

  it('limpa a matéria com laboratório aberto sem fechar a atividade', () => {
    const lab = getLearningLab('fund1_mat_01')!;
    renderPage(`/simulacao?lab=${lab.id}`);
    fireEvent.click(screen.getByRole('button', { name: 'Escolher matéria' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Matérias disponíveis' })).getByRole('button', { name: 'Todas as matérias (21 laboratórios)' }));
    expect(screen.getByRole('button', { name: 'Escolher matéria' })).toHaveTextContent('Todas as matérias');
    expect(within(screen.getByRole('region', { name: 'Catálogo de laboratórios' })).getAllByRole('article')).toHaveLength(getLearningLabCounts().fundamental_1);
    expect(screen.getByRole('heading', { name: lab.title })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(`lab=${lab.id}`);
  });

  it('abre um legado no catálogo global sem enviar o professor ao painel de estudante', async () => {
    auth.userData.role = 'professor';
    const lab = getLearningLab('math_1')!;
    renderPage(`/simulacao?level=${lab.academicLevel}`);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar laboratórios' }), { target: { value: 'math_1' } });
    fireEvent.click(within(screen.getByRole('article', { name: lab.title })).getByRole('button', { name: `Abrir ${lab.title}` }));
    expect(await screen.findByRole('region', { name: `Laboratório: ${lab.title}` }, { timeout: 10000 })).toBeInTheDocument();
    const url = new URL(screen.getByTestId('location').textContent!, 'https://test.invalid');
    expect(url.pathname).toBe('/simulacao');
    expect(url.searchParams.get('lab')).toBe('math_1');
    expect(url.searchParams.get('level')).toBe(lab.academicLevel);
    expect(url.searchParams.get('q')).toBe('math_1');
  });

  it('mantém a bancada de Física embutida no ID recebido e conclui seu próprio desafio', () => {
    const onComplete = vi.fn();
    renderPage('/simulacao?lab=pos_ia_01', { mode: 'optics', labId: 'fis_3', labTitle: 'Óptica Geométrica', onComplete });
    expect(screen.getByRole('heading', { name: 'Bancada: Óptica Geométrica' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Níveis de aprendizagem' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mapa de atividades' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: getLearningLab('pos_ia_01')!.title })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Aproxima-se da reta normal/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Validar Conclusão' }));
    expect(onComplete).toHaveBeenCalledExactlyOnceWith(100);
  });

  it('informa ID inválido e oferece o catálogo em vez de abrir pêndulo', () => {
    renderPage('/simulacao?lab=inexistente');
    expect(screen.getByRole('alert')).toHaveTextContent('Laboratório não encontrado');
    expect(screen.getByRole('article', { name: getLearningLab('fund1_mat_01')!.title })).toBeInTheDocument();
  });

  it('registra somente conclusões da sessão e usa o nível real sem inventar horas', async () => {
    const content = getLabLearningContent('fund1_mat_01')!;
    renderPage('/simulacao?lab=fund1_mat_01');
    fireEvent.click(screen.getByRole('button', { name: 'Avaliar' }));
    for (const question of content.questions) fireEvent.click(screen.getByLabelText(question.options.find(option => option.correct)!.text));
    fireEvent.click(screen.getByRole('button', { name: 'Corrigir respostas' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Comprovante deste nível' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Comprovante deste nível' }));
    expect(await screen.findByText('1 atividades de aprendizagem')).toBeInTheDocument();
    expect(screen.getByText('Carga horária não contabilizada.', { exact: false })).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem('kortex_certificate_records_v2') || '[]');
    expect(saved[0]).toMatchObject({ academicLevelLabel: learningLevelLabel('fundamental_1'), completedItemIds:['fund1_mat_01'], authorizedCourseHours:null });
  });

  it('abre a bancada avançada embutida pelo ID recebido', () => {
    renderPage('/simulacao', { mode: 'sup_fis_01', labId: 'sup_fis_01' });
    expect(screen.getByRole('region', { name: `Laboratório: ${getLearningLab('sup_fis_01')!.title}` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir bancada' }));
    expect(screen.getByText('Massa (m)')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('mantém respostas e permite salvar novamente após falha no progresso global', async () => {
    auth.completeLab.mockRejectedValueOnce(new Error('permission-denied')).mockResolvedValueOnce({ alreadyCompleted: false });
    const content = getLabLearningContent('fund1_mat_01')!;
    renderPage('/simulacao?lab=fund1_mat_01');
    fireEvent.click(screen.getByRole('button', { name: 'Avaliar' }));
    for (const question of content.questions) fireEvent.click(screen.getByLabelText(question.options.find(option => option.correct)!.text));
    fireEvent.click(screen.getByRole('button', { name: 'Corrigir respostas' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível guardar');
    expect(screen.getByRole('button', { name: 'Comprovante deste nível' })).toBeDisabled();
    for (const question of content.questions) expect(screen.getByLabelText(question.options.find(option => option.correct)!.text)).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'tente salvar novamente' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Comprovante deste nível' })).toBeEnabled());
    expect(auth.completeLab).toHaveBeenCalledTimes(2);
    expect(auth.completeLab).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'fund1_mat_01' }), 100, expect.objectContaining({ stage: 'assessment', questions: expect.any(Array) }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('cria uma atividade no nível profissional ativo e a abre sem conversão para Médio', async () => {
    renderPage('/simulacao?level=profissional');
    fireEvent.click(screen.getByRole('button', { name: 'Criar atividade' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Criar atividade no Kortex Studio' }));
    expect(dialog.getByRole('combobox', { name: 'Nível acadêmico' })).toHaveValue('profissional');
    fireEvent.change(dialog.getByLabelText('Título do laboratório'), { target: { value: 'Oficina profissional da turma de teste' } });
    fireEvent.change(dialog.getByLabelText('Disciplina'), { target: { value: 'Tecnologia profissional' } });
    fireEvent.change(dialog.getByLabelText('Tópico'), { target: { value: 'Condições de retirada' } });
    fireEvent.change(dialog.getByLabelText('Objetivo de aprendizagem'), { target: { value: 'Comparar condições de retirada com autorização e idade mínima.' } });
    // Variation confined to the test fixture exercises saving and routing.
    const content = structuredClone(getLabLearningContent('hard_1')!);
    const unique = (text: string) => `Situação da oficina de teste profissional: ${text}`;
    const fill = (label: RegExp, value: string) => fireEvent.change(dialog.getByLabelText(label), { target: { value } });
    fill(/^Problema contextualizado/, unique(content.context));
    fill(/^Explicação conceitual/, unique(content.theory));
    fill(/^Exemplo resolvido/, unique(content.workedExample));
    content.investigation.forEach((step, index) => fill(new RegExp(`^Etapa ${index + 1} `), unique(step)));
    fill(/^Critérios para uma boa resposta/, unique(content.expectedEvidence));
    fill(/^Pergunta de reflexão/, unique(content.reflection));
    content.scenarios.forEach((scenario, index) => {
      const group = within(dialog.getByRole('group', { name: `Cenário ${index + 1}` }));
      for (const [label, value] of [[/^Nome do cenário/, scenario.label], [/^Situação e condições/, unique(scenario.situation)], [/^Observação fornecida/, unique(scenario.observation)], [/^Explicação da observação/, unique(scenario.explanation)]] as const) {
        fireEvent.change(group.getByLabelText(label), { target: { value } });
      }
    });
    content.questions.forEach((question, index) => {
      const group = within(dialog.getByRole('group', { name: `Questão ${index + 1}` }));
      fireEvent.change(group.getByLabelText(/^Enunciado da questão/), { target: { value: unique(question.question) } });
      question.options.forEach((option, optionIndex) => {
        fireEvent.change(group.getByLabelText(new RegExp(`^Alternativa ${optionIndex + 1} `)), { target: { value: option.text } });
        fireEvent.change(group.getByLabelText(new RegExp(`^Feedback da alternativa ${optionIndex + 1} `)), { target: { value: unique(option.explanation) } });
      });
      fireEvent.change(group.getByRole('combobox'), { target: { value: String(question.options.findIndex(option => option.correct)) } });
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Adicionar à sessão' }));
    await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByRole('heading', { name: 'Oficina profissional da turma de teste' })).toBeInTheDocument();
    const url = new URL(screen.getByTestId('location').textContent!, 'https://test.invalid');
    expect(url.pathname).toBe('/simulacao');
    expect(url.searchParams.get('lab')).toMatch(/^custom_/);
    expect(url.searchParams.get('level')).toBe('profissional');
    expect(screen.getByText(/Formação Profissional · Tecnologia profissional · Exploração de cenários/)).toBeInTheDocument();
  });
});

describe('Mapa e busca global', () => {
  it('organiza o filtro atual por disciplinas, sem faixas artificiais de pré-requisitos', () => {
    const lab = getLearningLab('math_1')!;
    render(<SkillTreeExplorerModal isOpen onClose={vi.fn()} onSelectLab={vi.fn()} academicLevel={lab.academicLevel} subject={lab.subject} query="math_1" />);
    expect(screen.getByRole('button', { name: new RegExp(lab.title) })).toBeInTheDocument();
    expect(screen.queryByText(/Pré-requisitos|Entrada Livre|Nível 3/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(getLearningLab('pos_ia_01')!.title) })).not.toBeInTheDocument();
  });

  it('busca os legados e gera uma URL resolvível para qualquer perfil autorizado', () => {
    render(<MemoryRouter><CommandPaletteModal isOpen onClose={vi.fn()} theme="light" onThemeToggle={vi.fn()} onOpenPricing={vi.fn()} onOpenParentBridge={vi.fn()} /><Location /></MemoryRouter>);
    fireEvent.change(screen.getByPlaceholderText(/Buscar laboratórios, turmas/), { target: { value: 'math_1' } });
    fireEvent.click(screen.getByText(getLearningLab('math_1')!.title));
    expect(screen.getByTestId('location')).toHaveTextContent(`/simulacao?lab=math_1&level=${getLearningLab('math_1')!.academicLevel}`);
  });

  it('apresenta um registro escolar sem chamar a atividade de avançada', () => {
    render(<CertificateModal isOpen onClose={vi.fn()} certificate={{ certificateId: 'test', observedSeconds:null,status:'active', studentId: 'student', studentName: 'Ana', institutionName: 'Kortex', academicLevelLabel: learningLevelLabel('fundamental_1'), totalSimulatedHours: 0, completedLabsCount: 1, issueDate: '10/10/2026', verificationHash: 'hash', verificationUrl: 'https://example.test/test' }} />);
    expect(screen.getByText('1 atividades de aprendizagem')).toBeInTheDocument();
    expect(screen.queryByText(/laboratórios virtuais avançados/)).not.toBeInTheDocument();
    expect(screen.getByText('Carga horária não contabilizada.', { exact: false })).toBeInTheDocument();
  });
});
