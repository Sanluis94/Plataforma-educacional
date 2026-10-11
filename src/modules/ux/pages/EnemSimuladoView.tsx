import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Award, Clock, CheckCircle2, XCircle, RotateCcw, Sparkles, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { getReturnDestination, getRoleHome } from '../../core/utils/navigation';
import { BANCO_ITENS_ENEM_PADRAO } from '../../data/services/triCalculationService';
import {
  createEnemAttempt, ENEM_DURATION_SECONDS, finishEnemAttempt, readEnemAttempt, saveEnemAttempt, type EnemAttempt,
} from '../../data/services/enemAttemptSession';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';

const cardStyle: CSSProperties = { padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: 'var(--radius-lg, 14px)', minWidth: 0 };
const actionStyle: CSSProperties = { padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm, 10px)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };
const mutedStyle: CSSProperties = { color: 'var(--text-secondary)', lineHeight: 1.6 };
const items = BANCO_ITENS_ENEM_PADRAO;

function remainingSeconds(attempt: EnemAttempt): number {
  return attempt.deadlineAt === null ? ENEM_DURATION_SECONDS : Math.max(0, Math.ceil((attempt.deadlineAt - Date.now()) / 1000));
}

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function EnemSimuladoView() {
  const { currentUser, userData } = useAuth();
  const location = useLocation();
  const returnTo = new URLSearchParams(location.search).get('returnTo');
  const roleHome = getRoleHome(userData?.role);
  const requestedDestination = getReturnDestination(userData?.role, returnTo);
  const destination = requestedDestination.split(/[?#]/)[0] === '/enem' ? roleHome : requestedDestination;
  // A change of account replaces all state before reading that account's attempt.
  return <EnemSimuladoSession key={currentUser?.uid ?? 'guest'} userId={currentUser?.uid ?? null} destination={destination} roleHome={roleHome} />;
}

function EnemSimuladoSession({ userId, destination, roleHome }: { userId: string | null; destination: string; roleHome: string }) {
  const [attempt, setAttempt] = useState(() => readEnemAttempt(userId));
  const attemptRef = useRef(attempt);
  const [timeRemaining, setTimeRemaining] = useState(() => remainingSeconds(attempt));
  const [savingFailed, setSavingFailed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const closeConfirmation = useCallback(() => setShowConfirmation(false), []);
  const dialogRef = useDialogAccessibility(showConfirmation, closeConfirmation);

  const commitAttempt = useCallback((next: EnemAttempt) => {
    attemptRef.current = next;
    setAttempt(next);
    setTimeRemaining(remainingSeconds(next));
    setSavingFailed(!saveEnemAttempt(userId, next));
  }, [userId]);

  useEffect(() => {
    if (attempt.status !== 'active') return;
    const tick = () => {
      const current = attemptRef.current;
      if (current.status !== 'active') return;
      const remaining = remainingSeconds(current);
      setTimeRemaining(remaining);
      if (remaining === 0) {
        setShowConfirmation(false);
        commitAttempt(finishEnemAttempt(current, 'expired'));
      }
    };
    const interval = window.setInterval(tick, 1000);
    const onVisibility = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', tick);
    };
  }, [attempt.status, commitAttempt]);

  useEffect(() => {
    if (attempt.status === 'finished') resultHeadingRef.current?.focus();
  }, [attempt.status]);

  const start = () => {
    const now = Date.now();
    commitAttempt({ ...createEnemAttempt(), status: 'active', startedAt: now, deadlineAt: now + ENEM_DURATION_SECONDS * 1000 });
  };
  const selectOption = (optionIndex: number) => {
    const current = attemptRef.current;
    if (current.status !== 'active') return;
    if (remainingSeconds(current) === 0) { commitAttempt(finishEnemAttempt(current, 'expired')); return; }
    commitAttempt({ ...current, answers: { ...current.answers, [items[current.currentIndex].id]: optionIndex } });
  };
  const finish = () => {
    const current = attemptRef.current;
    if (current.status !== 'active') return;
    commitAttempt(finishEnemAttempt(current, remainingSeconds(current) === 0 ? 'expired' : 'submitted'));
    setShowConfirmation(false);
  };
  const requestFinish = () => {
    if (remainingSeconds(attemptRef.current) === 0 || Object.keys(attemptRef.current.answers).length === items.length) finish();
    else setShowConfirmation(true);
  };
  const changeQuestion = (index: number) => {
    const current = attemptRef.current;
    if (current.status !== 'active') return;
    if (remainingSeconds(current) === 0) { commitAttempt(finishEnemAttempt(current, 'expired')); return; }
    commitAttempt({ ...current, currentIndex: index });
  };
  const currentItem = items[attempt.currentIndex];
  const answeredCount = Object.keys(attempt.answers).length;
  const missingCount = items.length - answeredCount;
  const result = attempt.result;

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      <nav aria-label="Navegação do simulado" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <Link to={destination} className="btn-outline" style={actionStyle}><ArrowLeft size={16} aria-hidden="true" /> Voltar</Link>
        {destination !== roleHome && <Link to={roleHome} className="btn-outline" style={actionStyle}>Meu painel</Link>}
      </nav>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flex: '1 1 26rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>SIMULADO DE TREINO</span>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0.35rem 0', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>Treino para o ENEM</h1>
          <p style={{ ...mutedStyle, margin: 0 }}>Pratique, revise suas respostas e receba uma nota estimada. Este treino usa um modelo próprio inspirado na TRI; não é uma prova nem um cálculo oficial do INEP.</p>
        </div>
        {attempt.status === 'active' && (
          <div role="timer" aria-label="Tempo restante" aria-live="off" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 800, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm, 10px)', color: timeRemaining < 300 ? 'var(--color-vermelho, #BC391F)' : 'var(--text-main)' }}>
            <Clock size={20} aria-hidden="true" /> {formatTime(timeRemaining)}
          </div>
        )}
      </header>

      {savingFailed && <p role="alert" style={mutedStyle}>Não foi possível salvar a tentativa nesta aba. Suas respostas continuam nesta tela, mas podem se perder ao sair ou atualizar a página.</p>}

      {attempt.status === 'ready' && (
        <section className="glass-card" style={{ ...cardStyle, maxWidth: '48rem', margin: '0 auto' }} aria-labelledby="enem-preparation-title">
          <h2 id="enem-preparation-title" style={{ marginTop: 0, color: 'var(--text-main)' }}>Antes de começar</h2>
          <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{items.length} questões · {ENEM_DURATION_SECONDS / 60} minutos</p>
          <ul style={mutedStyle}>
            <li>O tempo começa quando você selecionar “Começar simulado”.</li>
            <li>Você pode navegar entre as questões e alterar as respostas antes da entrega.</li>
            <li>A tentativa é salva nesta aba para seu perfil. Ao sair ou atualizar a página, o prazo continua correndo; fechar a aba pode apagar a tentativa.</li>
            <li>Ao terminar o tempo, as respostas já marcadas serão entregues. Questões em branco contam como não respondidas.</li>
          </ul>
          <button type="button" className="btn-gradient" onClick={start} style={actionStyle}>Começar simulado <ChevronRight size={18} aria-hidden="true" /></button>
        </section>
      )}

      {attempt.status === 'active' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
          <section className="glass-card" style={{ ...cardStyle, flex: '2 1 35rem' }} aria-labelledby="enem-question-title">
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{currentItem.area} · Habilidade: {currentItem.habilidadeBNCC}</p>
            <h2 id="enem-question-title" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Questão {attempt.currentIndex + 1} de {items.length}</h2>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--text-main)', marginBottom: '1.5rem' }}>{currentItem.enunciado}</p>
            <fieldset style={{ border: 0, padding: 0, margin: '0 0 1.75rem', minWidth: 0 }}>
              <legend style={{ ...mutedStyle, marginBottom: '0.75rem', fontWeight: 700 }}>Escolha uma resposta</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentItem.opcoes.map((option, index) => {
                  const selected = attempt.answers[currentItem.id] === index;
                  return (
                    <label key={`${currentItem.id}-${index}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm, 10px)', cursor: 'pointer', border: selected ? '2px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)', background: selected ? 'var(--color-primary-light, rgba(228, 104, 63, 0.12))' : 'var(--bg-glass)', color: 'var(--text-main)' }}>
                      <input type="radio" name={`enem-${currentItem.id}`} checked={selected} onChange={() => selectOption(index)} style={{ flexShrink: 0, accentColor: 'var(--color-primary, #E4683F)' }} />
                      <span><strong>{String.fromCharCode(65 + index)}.</strong> {option}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button type="button" onClick={() => changeQuestion(attempt.currentIndex - 1)} disabled={attempt.currentIndex === 0} className="btn-outline" style={actionStyle}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button>
              {attempt.currentIndex < items.length - 1
                ? <button type="button" onClick={() => changeQuestion(attempt.currentIndex + 1)} className="btn-gradient" style={actionStyle}>Próxima <ChevronRight size={16} aria-hidden="true" /></button>
                : <button type="button" onClick={requestFinish} className="btn-gradient" style={actionStyle}>Entregar simulado</button>}
            </div>
          </section>
          <aside style={{ display: 'flex', flexDirection: 'column', flex: '1 1 17rem', minWidth: 0, gap: '1rem' }}>
            <section className="glass-card" style={cardStyle} aria-labelledby="enem-answer-sheet-title">
              <h2 id="enem-answer-sheet-title" style={{ fontSize: '1rem', marginTop: 0, color: 'var(--text-main)' }}>Cartão de respostas</h2>
              <p role="status" style={{ ...mutedStyle, fontSize: '0.85rem' }}>Respondidas: {answeredCount} de {items.length}. Faltam {missingCount}.</p>
              <div role="group" aria-label="Navegar pelas questões" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {items.map((item, index) => {
                  const answered = attempt.answers[item.id] !== undefined;
                  const isCurrent = index === attempt.currentIndex;
                  return <button type="button" key={item.id} onClick={() => changeQuestion(index)} aria-label={`Questão ${index + 1}, ${answered ? 'respondida' : 'não respondida'}`} aria-current={isCurrent ? 'step' : undefined} style={{ minHeight: '2.75rem', fontWeight: 800, cursor: 'pointer', borderRadius: 'var(--radius-sm, 10px)', border: isCurrent ? '2px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)', background: answered ? 'var(--color-verde-light, rgba(41, 62, 36, 0.15))' : 'var(--bg-glass)', color: 'var(--text-main)' }}>{index + 1}{answered && <span aria-hidden="true"> ✓</span>}</button>;
                })}
              </div>
              <button type="button" onClick={requestFinish} className="btn-gradient" style={{ ...actionStyle, width: '100%' }}>Finalizar simulado</button>
            </section>
            <section className="glass-card" style={{ ...cardStyle, padding: '1.25rem' }}>
              <h2 style={{ fontSize: '0.95rem', marginTop: 0, color: 'var(--text-main)' }}><Sparkles size={16} aria-hidden="true" /> Dica de estudo</h2>
              <p style={{ ...mutedStyle, fontSize: '0.85rem', marginBottom: 0 }}>Comece pelas questões que você conhece melhor. Use o cartão para revisar as que ficaram em branco antes de entregar.</p>
              <p style={{ ...mutedStyle, fontSize: '0.8rem' }}>O prazo continua correndo enquanto você estiver fora desta página.</p>
            </section>
          </aside>
        </div>
      )}

      {attempt.status === 'finished' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section className="glass-card" style={{ ...cardStyle, textAlign: 'center' }} aria-labelledby="enem-result-title">
            <Award size={48} aria-hidden="true" style={{ color: 'var(--color-primary-accessible, #B8441F)' }} />
            <h2 id="enem-result-title" ref={resultHeadingRef} tabIndex={-1} style={{ color: 'var(--text-main)' }}>Resultado do treino</h2>
            <p role="status" style={mutedStyle}>{attempt.completionReason === 'expired' ? 'O tempo terminou. Entregamos as respostas que você marcou.' : 'Simulado entregue.'}</p>
            <p style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>Nota estimada</p>
            <p style={{ margin: '0.5rem 0', fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 900, color: 'var(--text-main)' }}>{result.notaEnem} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>pontos</span></p>
            <p style={mutedStyle}>{result.acertosBrutos} de {result.totalQuestoes} acertos ({result.porcentagemAcerto}%) · {missingCount} não respondidas</p>
            <p style={{ ...mutedStyle, maxWidth: '42rem', margin: '1rem auto' }}>Use este resultado para orientar seus estudos. Ele não equivale à nota oficial do ENEM e não prevê aprovação ou nota de corte no SiSU.</p>
            <details style={{ textAlign: 'left', maxWidth: '44rem', margin: '1.5rem auto 0', ...mutedStyle }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Como esta estimativa é calculada</summary>
              <p>O modelo próprio considera acertos, dificuldade das questões e padrões de resposta. Uma diferença de dificuldade entre acertos e erros não demonstra que você chutou.</p>
              <p>Detalhes do modelo: TRI de três parâmetros (3PL); proficiência estimada (θ): {result.thetaEstimado}; índice de consistência do modelo: {result.indiceCoerenciaPedagogica}%. Esses parâmetros são usados para este treino e não reproduzem a calibração oficial.</p>
            </details>
          </section>
          <section className="glass-card" style={cardStyle} aria-labelledby="enem-guidance-title">
            <h2 id="enem-guidance-title" style={{ fontSize: '1.15rem', marginTop: 0, color: 'var(--text-main)' }}>Próximos passos para estudar</h2>
            {result.recomendacoesPedagogicas.map((recommendation, index) => <p key={index} style={mutedStyle}>{recommendation}</p>)}
          </section>
          <section className="glass-card" style={cardStyle} aria-labelledby="enem-review-title">
            <h2 id="enem-review-title" style={{ fontSize: '1.15rem', marginTop: 0, color: 'var(--text-main)' }}>Gabarito comentado do treino</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item, index) => {
                const selected = attempt.answers[item.id];
                const correct = selected === item.respostaCorreta;
                return <article key={item.id} style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm, 10px)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'var(--text-main)', marginTop: 0 }}>
                    {correct ? <CheckCircle2 size={20} aria-hidden="true" /> : <XCircle size={20} aria-hidden="true" />} Questão {index + 1} · {correct ? 'Resposta correta' : selected === undefined ? 'Não respondida' : 'Resposta incorreta'}
                  </h3>
                  <p style={mutedStyle}>{item.enunciado}</p>
                  <p style={mutedStyle}>Sua resposta: <strong>{selected === undefined ? 'Não respondida' : `${String.fromCharCode(65 + selected)}. ${item.opcoes[selected]}`}</strong></p>
                  <p style={mutedStyle}>Resposta esperada: <strong>{String.fromCharCode(65 + item.respostaCorreta)}. {item.opcoes[item.respostaCorreta]}</strong></p>
                  <p style={mutedStyle}><strong>Resolução comentada: </strong>{item.justificativa}</p>
                </article>;
              })}
            </div>
          </section>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <button type="button" onClick={() => commitAttempt(createEnemAttempt())} className="btn-outline" style={actionStyle}><RotateCcw size={16} aria-hidden="true" /> Fazer outro simulado</button>
            <Link to={destination} className="btn-gradient" style={actionStyle}>Voltar para onde eu estava</Link>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={event => { if (event.target === event.currentTarget) closeConfirmation(); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="enem-confirm-title" aria-describedby="enem-confirm-description" tabIndex={-1} className="glass-card" style={{ ...cardStyle, background: 'var(--bg-card, #fff)', maxWidth: '30rem', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 id="enem-confirm-title" style={{ marginTop: 0, color: 'var(--text-main)' }}>Entregar com questões em branco?</h2>
            <p id="enem-confirm-description" style={mutedStyle}>Faltam {missingCount} de {items.length} respostas. Se entregar agora, elas serão registradas como não respondidas e não poderão ser alteradas nesta tentativa.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button type="button" data-dialog-autofocus className="btn-outline" style={actionStyle} onClick={closeConfirmation}>Continuar respondendo</button>
              <button type="button" className="btn-gradient" style={actionStyle} onClick={finish}>Entregar mesmo assim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnemSimuladoView;
