import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { Simulacao } from '../modules/ux/pages/Simulacao';
import { SkillTreeExplorerModal } from '../modules/ux/components/labs/SkillTreeExplorerModal';
import { CommandPaletteModal } from '../modules/ux/components/common/CommandPaletteModal';
import { CertificateModal } from '../modules/ux/components/labs/CertificateModal';
import { LEARNING_LABS_CATALOG, getLearningLab, getLearningLabCounts } from '../modules/core/constants/learningCatalog';
import { learningLevelLabel } from '../modules/core/constants/learningLevels';
import { getLabLearningContent } from '../modules/core/content/labLearningContent';

const auth = vi.hoisted(() => ({ userData: { gradeLevel: 'fundamental_1', name: 'Estudante de teste', role: 'estudante' } }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => ({ currentUser: { uid: 'test-user' }, userData: auth.userData }) }));

function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; }
function RouteJump({ to }: { to: string }) { const navigate = useNavigate(); return <button onClick={() => navigate(to)}>Abrir resultado da busca</button>; }
function renderPage(url = '/simulacao', props: React.ComponentProps<typeof Simulacao> = {}) {
  return render(<MemoryRouter initialEntries={[url]}><Simulacao {...props} /><Location /></MemoryRouter>);
}

beforeEach(() => {
  auth.userData.gradeLevel = 'fundamental_1';
  auth.userData.role = 'estudante';
  localStorage.clear();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Navegação de laboratórios por nível', () => {
  it.each([['professor', '/professor'], ['coordenador', '/coordenacao'], ['admin', '/admin'], ['estudante', '/estudante']])('retorna %s ao painel autorizado', (role, path) => {
    auth.userData.role = role;
    renderPage();
    expect(screen.getByRole('link', { name: 'Meu aprendizado' })).toHaveAttribute('href', path);
  });

  it('reconcilia a disciplina quando outra atividade chega pela busca global', async () => {
    const lab = getLearningLab('port_3')!;
    render(<MemoryRouter initialEntries={['/simulacao?level=medio']}><Simulacao /><RouteJump to={`/simulacao?lab=port_3&level=${lab.academicLevel}`} /><Location /></MemoryRouter>);
    fireEvent.change(screen.getByRole('combobox', { name: 'Disciplina' }), { target: { value: getLearningLab('math_2')!.subject } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir resultado da busca' }));
    expect(await screen.findByRole('region', { name: `Laboratório: ${lab.title}` })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Disciplina' })).toHaveValue(lab.subject);
  });

  it('inicia no nível do perfil, com contagem real e sem abrir bancada de outro nível', () => {
    renderPage();
    const counts = getLearningLabCounts();
    expect(screen.getByRole('button', { name: `${learningLevelLabel('fundamental_1')} (${counts.fundamental_1})` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('article', { name: getLearningLab('fund1_mat_01')!.title })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: getLearningLab('pos_ia_01')!.title })).not.toBeInTheDocument();
    expect(screen.queryByText('Bancada: Física')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Certificado deste nível' })).toBeDisabled();
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
    fireEvent.change(screen.getByRole('combobox', { name: 'Disciplina' }), { target: { value: lab.subject } });
    expect(screen.getByRole('article', { name: lab.title })).toBeInTheDocument();
    const otherSubject = LEARNING_LABS_CATALOG.find(item => item.academicLevel === 'fundamental_1' && item.subject !== lab.subject)!;
    expect(screen.queryByRole('article', { name: otherSubject.title })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article').every(article => article.textContent?.includes(lab.subject))).toBe(true);
  });

  it('abre um legado no catálogo global sem enviar o professor ao painel de estudante', async () => {
    auth.userData.role = 'professor';
    const lab = getLearningLab('math_1')!;
    renderPage(`/simulacao?level=${lab.academicLevel}`);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar laboratórios' }), { target: { value: 'math_1' } });
    fireEvent.click(within(screen.getByRole('article', { name: lab.title })).getByRole('button', { name: 'Abrir laboratório' }));
    expect(await screen.findByRole('region', { name: `Laboratório: ${lab.title}` })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(`/simulacao?lab=math_1&level=${lab.academicLevel}`);
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
    fireEvent.click(screen.getByRole('button', { name: 'Certificado deste nível' }));
    expect(await screen.findByText('1 atividades de aprendizagem')).toBeInTheDocument();
    expect(screen.getByText('Carga horária não contabilizada.', { exact: false })).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem('kortex_user_certificates') || '[]');
    expect(saved[0]).toMatchObject({ academicLevelLabel: learningLevelLabel('fundamental_1'), completedLabsCount: 1, totalSimulatedHours: 0 });
  });

  it('cria uma atividade no nível profissional ativo e a abre sem conversão para Médio', () => {
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
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Oficina profissional da turma de teste' })).toBeInTheDocument();
    expect(screen.getByTestId('location').textContent).toMatch(/^\/simulacao\?lab=custom_.+&level=profissional$/);
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
    render(<CertificateModal isOpen onClose={vi.fn()} certificate={{ certificateId: 'test', studentId: 'student', studentName: 'Ana', institutionName: 'Kortex', academicLevelLabel: learningLevelLabel('fundamental_1'), totalSimulatedHours: 0, completedLabsCount: 1, issueDate: '10/10/2026', verificationHash: 'hash', verificationUrl: 'https://example.test/test' }} />);
    expect(screen.getByText('1 atividades de aprendizagem')).toBeInTheDocument();
    expect(screen.queryByText(/laboratórios virtuais avançados/)).not.toBeInTheDocument();
    expect(screen.getByText('Carga horária não contabilizada.', { exact: false })).toBeInTheDocument();
  });
});
