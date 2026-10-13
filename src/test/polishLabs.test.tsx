import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UniversalLabContainer, type UniversalLabConfig } from '../modules/ux/components/UniversalLabContainer';
import { SecureExamModal } from '../modules/ux/components/labs/SecureExamModal';
import { LabNotebookDrawer } from '../modules/ux/components/labs/LabNotebookDrawer';
import { generateLabReportLatex, generateLabReportMarkdown, triggerPrintLabReport, type LabReportData } from '../modules/core/services/labReportService';

const auth = vi.hoisted(() => ({ currentUser: { uid: 'polish-student-a' }, userData: { name: 'Estudante fictício' } }));
vi.mock('../modules/core/contexts/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../modules/ux/components/SocraticTutorWidget', () => ({ SocraticTutorWidget: () => null }));
vi.mock('../modules/core/services/webAudioSonifier', () => ({ sonifier: { stopContinuousPitch: vi.fn(), updateContinuousPitch: vi.fn(), playSuccessChime: vi.fn(), setMuted: vi.fn() } }));

let frames: Map<number, FrameRequestCallback>;
let frameId: number;
let clock: number;
const context = { clearRect: vi.fn(), createRadialGradient: () => ({ addColorStop: vi.fn() }), fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), arc: vi.fn(), fill: vi.fn(), closePath: vi.fn(), strokeRect: vi.fn(), fillText: vi.fn() };
const config = (): UniversalLabConfig => ({
  id: 'polish-physical-bench', title: 'Bancada de teste fictícia', academicLevel: 'medio', subject: 'Física', topic: 'Movimento', objective: 'Medir variações.', theoreticalBackground: 'Fundamentação de teste.',
  parameters: [{ id: 'massa', label: 'Massa', unit: 'kg', min: 1, max: 10, step: 1, defaultValue: 2 }], initialState: { position: 0 },
  physicsStep: vi.fn((params, state, dt) => ({ nextState: { position: (state.position as number) + dt }, telemetry: { velocidade: params.massa, posicao: (state.position as number) + dt } })), renderCanvas: vi.fn(),
  questions: [
    { question: 'Qual é a massa inicial?', options: [{ text: 'Dois quilogramas', correct: true, explanation: 'A massa inicial é dois.' }, { text: 'Cinco quilogramas', correct: false, explanation: 'Confira a massa inicial.' }] },
    { question: 'Qual grandeza foi ajustada?', options: [{ text: 'Massa', correct: true, explanation: 'A grandeza é massa.' }, { text: 'Tempo', correct: false, explanation: 'O tempo não é o controle.' }] },
  ],
});
const runFrames = (count: number) => act(() => {
  for (let index = 0; index < count; index++) {
    clock = Math.max(clock,performance.now())+16;
    const pending = Array.from(frames.values());
    frames.clear();
    pending.forEach(callback => callback(clock));
  }
});
beforeEach(() => {
  localStorage.clear();
  auth.currentUser = { uid: 'polish-student-a' };
  frames = new Map(); frameId = 0; clock = performance.now();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
});
afterEach(() => { cleanup();window.history.replaceState({},'','/'); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('Continuidade e sentido da bancada', () => {
  it('separa os rascunhos de aulas diferentes usando os parâmetros reais da navegação',()=>{
    window.history.replaceState({},'','/simulacao?class=class-a&lessonPlan=plan-a');const view=render(<UniversalLabContainer config={config()}/>);fireEvent.change(screen.getByRole('spinbutton',{name:'Massa (kg)'}),{target:{value:'7'}});
    window.history.replaceState({},'','/simulacao?class=class-b&lessonPlan=plan-b');view.rerender(<UniversalLabContainer config={config()}/>);expect(screen.getByRole('spinbutton',{name:'Massa (kg)'})).toHaveValue(2);
    window.history.replaceState({},'','/simulacao?class=class-a&lessonPlan=plan-a');view.rerender(<UniversalLabContainer config={config()}/>);expect(screen.getByRole('spinbutton',{name:'Massa (kg)'})).toHaveValue(7);
  });
  it('caderno da mesma bancada conserva notas de cada turma sem misturar relatórios',()=>{
    window.history.replaceState({},'','/simulacao?class=class-a&lessonPlan=plan-a');const view=render(<UniversalLabContainer config={config()}/>);
    fireEvent.click(screen.getByRole('button',{name:/Caderno/}));fireEvent.change(screen.getByRole('textbox',{name:/Suas hipóteses/}),{target:{value:'Notas privadas da aula A'}});
    window.history.replaceState({},'','/simulacao?class=class-b&lessonPlan=plan-b');view.rerender(<UniversalLabContainer config={config()}/>);
    fireEvent.click(screen.getByRole('button',{name:/Caderno/}));expect(screen.getByRole('textbox',{name:/Suas hipóteses/})).toHaveValue('');
    window.history.replaceState({},'','/simulacao?class=class-a&lessonPlan=plan-a');view.rerender(<UniversalLabContainer config={config()}/>);
    fireEvent.click(screen.getByRole('button',{name:/Caderno/}));expect(screen.getByRole('textbox',{name:/Suas hipóteses/})).toHaveValue('Notas privadas da aula A');
  });
  it('caderno indisponível avisa antes de qualquer edição e não anuncia salvamento',()=>{
    vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('storage blocked');});
    render(<LabNotebookDrawer isOpen onClose={()=>{}} labId="test-lab" labTitle="Teste"/>);
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível recuperar');
    expect(screen.getByRole('status')).not.toHaveTextContent('Salvas neste navegador');
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'Continuo com a anotação na tela.'}});
    expect(screen.getByRole('textbox')).toHaveValue('Continuo com a anotação na tela.');
  });
  it('aguarda salvar, mantém a tentativa para retry após reload e preserva o mesmo identificador', async () => {
    const complete = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const first = render(<UniversalLabContainer config={config()} onComplete={complete} />);
    fireEvent.click(screen.getByRole('button', { name: /Perguntas/ }));
    expect(screen.getByRole('button', { name: 'Corrigir respostas' })).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Dois quilogramas'));
    fireEvent.click(screen.getByLabelText('Massa', { selector: 'input[type=radio]' }));
    fireEvent.click(screen.getByRole('button', { name: 'Corrigir respostas' }));
    await screen.findByText(/Não foi possível salvar suas respostas/);
    expect(screen.queryByText(/Respostas salvas e corrigidas/)).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dois quilogramas' })).toBeDisabled();
    const firstReport = complete.mock.calls[0][0];
    expect(firstReport.score).toBe(100);
    expect(firstReport.evidence.questions).toHaveLength(2);
    first.unmount();
    render(<UniversalLabContainer config={config()} onComplete={complete} />);
    fireEvent.click(screen.getByRole('button', { name: /Perguntas/ }));
    expect(screen.getByText(/tentativa ainda não salva foi recuperada/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar salvar novamente' }));
    await screen.findByText(/Respostas salvas e corrigidas/);
    expect(complete.mock.calls[1][0]).toEqual(firstReport);
    fireEvent.click(screen.getByRole('button', { name: 'Responder novamente' }));
    expect(screen.getByRole('radio', { name: 'Dois quilogramas' })).not.toBeChecked();
  });

  it('não deixa uma conta ler respostas e parâmetros de outra conta', () => {
    const view = render(<UniversalLabContainer config={config()} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Massa (kg)' }), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: /Perguntas/ }));
    fireEvent.click(screen.getByLabelText('Cinco quilogramas'));
    auth.currentUser = { uid: 'polish-student-b' };
    view.rerender(<UniversalLabContainer config={config()} />);
    expect(screen.getByRole('spinbutton', { name: 'Massa (kg)' })).toHaveValue(2);
    fireEvent.click(screen.getByRole('button', { name: /Perguntas/ }));
    expect(screen.getByRole('radio', { name: 'Cinco quilogramas' })).not.toBeChecked();
  });

  it('pausa ao ler teoria e reproduz estados capturados sem alterar o estado ao vivo', () => {
    const lab = config();
    render(<UniversalLabContainer config={lab} />);
    runFrames(70);
    expect(lab.physicsStep).toHaveBeenCalled();
    const callsBeforeTheory = vi.mocked(lab.physicsStep).mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: /Teoria/ }));
    runFrames(20);
    expect(lab.physicsStep).toHaveBeenCalledTimes(callsBeforeTheory);
    fireEvent.click(screen.getByRole('button', { name: /Experimento/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Rever experimento' }));
    fireEvent.change(screen.getByRole('slider', { name: 'Amostra do experimento' }), { target: { value: '0' } });
    runFrames(1);
    const firstState = vi.mocked(lab.renderCanvas).mock.calls.at(-1)?.[1];
    expect(firstState?.position).toBeLessThan(0.2);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    runFrames(1);
    const liveState = vi.mocked(lab.renderCanvas).mock.calls.at(-1)?.[1];
    expect(liveState?.position).toBeGreaterThan(0.9);
  });

  it('o modo com tempo abre as perguntas e mantém a entrega pendente quando salvar falha', async () => {
    const complete = vi.fn().mockResolvedValue(false);
    render(<UniversalLabContainer config={config()} onComplete={complete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Avaliação com tempo' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar e responder às perguntas' }));
    await screen.findByRole('region', { name: 'Sessão de avaliação com tempo' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Dois quilogramas'));
    fireEvent.click(screen.getByLabelText('Massa', { selector: 'input[type=radio]' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar e salvar respostas' }));
    await screen.findByText(/As respostas ainda não foram salvas/);
    expect(screen.getByRole('timer')).toBeInTheDocument();
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('continua calculando em 3D, limita a variação aos controles e volta ao canvas real', () => {
    const lab = config();
    render(<UniversalLabContainer config={lab} />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Massa (kg)' }), { target: { value: '10' } });
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar variação' }));
    fireEvent.click(screen.getByRole('button', { name: 'Visualizar valor em 3D' }));
    runFrames(15);
    expect(screen.getByText(/não representa a geometria/)).toBeInTheDocument();
    expect(lab.physicsStep).toHaveBeenCalled();
    for (const [params] of vi.mocked(lab.physicsStep).mock.calls) expect(params.massa).toBeLessThanOrEqual(10);
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao experimento' }));
    runFrames(1);
    expect(lab.renderCanvas).toHaveBeenCalled();
  });

  it('exporta medições reais em colunas estáveis e tempo relativo da sessão', async () => {
    let captured: Blob | undefined;
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn((blob: Blob) => { captured = blob; return 'blob:test'; }) });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const lab = config();
    let count = 0;
    lab.physicsStep = () => ({ nextState: {}, telemetry: count++ < 10 ? { alpha: 1, beta: 2 } : { beta: 4, alpha: 3 } });
    render(<UniversalLabContainer config={lab} />);
    expect(screen.getByRole('button', { name: 'Exportar dados (.csv)' })).toBeDisabled();
    runFrames(25);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar dados (.csv)' }));
    expect(captured).toBeDefined();
    const text = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(captured!); });
    const lines = text.replace(/^\uFEFF/, '').split('\r\n');
    expect(lines[0]).toBe('"alpha","beta","time"');
    expect(lines[1]).toMatch(/^"1","2","0\.1/);
    expect(lines.at(-1)).toMatch(/^"3","4",/);
  });

  it('não confirma cópia rejeitada nem laudo100% sem avaliação', async () => {
    const clipboard = { writeText: vi.fn().mockRejectedValue(new Error('blocked')) };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
    render(<UniversalLabContainer config={config()} />);
    fireEvent.click(screen.getByRole('button', { name: /Relatório/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Copiar .md' }));
    await screen.findByText(/Não foi possível copiar/);
    expect(screen.queryByText('Copiado!')).not.toBeInTheDocument();
    const copied = clipboard.writeText.mock.calls[0][0];
    expect(copied).toContain('Não avaliada');
    expect(copied).not.toContain('100%');
    expect(copied).not.toContain('Dois quilogramas');
  });
});

describe('Cronômetro, caderno e relatórios reais', () => {
  it('finaliza uma vez no prazo e cancela o relógio e observação ao desmontar', async () => {
    vi.useFakeTimers();
    const finish = vi.fn().mockResolvedValue(false);
    const close = vi.fn();
    const view = render(<SecureExamModal isOpen onClose={close} labTitle="Teste" durationMinutes={1 / 60} onFinishExam={finish} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Iniciar e responder às perguntas' })); });
    fireEvent.blur(window);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(finish).toHaveBeenCalledExactlyOnceWith(1);
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(finish).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();
    view.unmount();
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it('isola o caderno por conta, restaura após reload e ignora notas legadas sem autor', async () => {
    localStorage.setItem('kortex_notebook_test-lab', 'nota sem autor');
    const props = { isOpen: true, labId: 'test-lab', labTitle: 'Teste', onClose: vi.fn() };
    const view = render(<LabNotebookDrawer {...props} />);
    const textbox = screen.getByRole('textbox', { name: /Suas hipóteses/ });
    expect(textbox).toHaveValue('');
    fireEvent.change(textbox, { target: { value: 'Minha hipótese privada.' } });
    auth.currentUser = { uid: 'polish-student-b' };
    view.rerender(<LabNotebookDrawer {...props} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
    auth.currentUser = { uid: 'polish-student-a' };
    view.rerender(<LabNotebookDrawer {...props} />);
    expect(screen.getByRole('textbox')).toHaveValue('Minha hipótese privada.');
  });

  it('exporta zero real, todos os resultados e escapa texto de impressão e LaTeX', () => {
    const data: LabReportData = { labId: 'x_y', labTitle: '<img src=x onerror=alert(1)>', studentName: 'Ana & Bia_#1', date: '13/10/2026', academicLevel: 'Médio', subject: 'Física', durationSeconds: 4, parametersUsed: { massa_kg: 2 }, telemetrySnapshot: {}, scorePct: 0, diagnosticResults: [{ question: 'Q1?', selectedAnswer: 'Errada', correct: false }, { question: 'Q2?', correct: false }] };
    expect(generateLabReportMarkdown(data)).toContain('0% de acertos');
    expect(generateLabReportMarkdown(data)).toContain('Não respondida');
    const latex = generateLabReportLatex(data);
    expect(latex).toContain('Ana \\& Bia\\_\\#1');
    expect(latex).toContain('massa\\_kg');
    expect(latex).toContain('0\\% de acertos');
    const write = vi.fn();
    vi.spyOn(window, 'open').mockReturnValue({ document: { write, close: vi.fn() }, close: vi.fn() } as unknown as Window);
    expect(triggerPrintLabReport(data)).toBe(true);
    const html = write.mock.calls[0][0];
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img');
    expect(html).toContain('Q2?');
    expect(html).not.toMatch(/Validação criptográfica|Código de verificação SHA/);
    vi.mocked(window.open).mockReturnValue(null);
    expect(triggerPrintLabReport(data)).toBe(false);
  });
});
