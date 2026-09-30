import { useState, useEffect } from 'react';
import {
  Award, Clock, CheckCircle2, XCircle,
  RotateCcw, Sparkles, ChevronRight, ChevronLeft,
  ArrowLeft, Home as HomeIcon
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import {
  BANCO_ITENS_ENEM_PADRAO,
  processarSimuladoEnemTRI,
  type TriItem,
  type TriResponseSubmission,
  type TriResult
} from '../../data/services/triCalculationService';

export function EnemSimuladoView() {
  const { userData } = useAuth();
  const [itens] = useState<TriItem[]>(BANCO_ITENS_ENEM_PADRAO);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [tempoRestanteSegundos, setTempoRestanteSegundos] = useState(1800); // 30 min
  const [simuladoFinalizado, setSimuladoFinalizado] = useState(false);
  const [resultadoTRI, setResultadoTRI] = useState<TriResult | null>(null);

  // Timer
  useEffect(() => {
    if (simuladoFinalizado || tempoRestanteSegundos <= 0) return;
    const interval = setInterval(() => {
      setTempoRestanteSegundos(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalizarSimulado();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [simuladoFinalizado, tempoRestanteSegundos]);

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelecionarOpcao = (opcaoIndex: number) => {
    if (simuladoFinalizado) return;
    const currentItem = itens[currentIndex];
    setRespostas(prev => ({
      ...prev,
      [currentItem.id]: opcaoIndex
    }));
  };

  const handleFinalizarSimulado = () => {
    const submissoes: TriResponseSubmission[] = itens.map(item => ({
      itemId: item.id,
      respostaEscolhida: respostas[item.id] ?? -1
    }));

    const resultado = processarSimuladoEnemTRI(itens, submissoes);
    setResultadoTRI(resultado);
    setSimuladoFinalizado(true);
  };

  const handleReiniciar = () => {
    setRespostas({});
    setCurrentIndex(0);
    setTempoRestanteSegundos(1800);
    setSimuladoFinalizado(false);
    setResultadoTRI(null);
  };

  const currentItem = itens[currentIndex];
  const totalRespondidas = Object.keys(respostas).length;
  const porcentagemProgresso = Math.round((totalRespondidas / itens.length) * 100);

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {/* Top Hub Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/"
            className="btn-outline"
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
            title="Retornar à página inicial da plataforma"
          >
            <HomeIcon style={{ width: '1rem', height: '1rem' }} />
            <span>Voltar ao Hub Inicial</span>
          </Link>

          <Link
            to={userData?.role === 'professor' ? '/professor' : '/estudante'}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.12)',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <ArrowLeft style={{ width: '0.95rem', height: '0.95rem' }} />
            <span>{userData?.role === 'professor' ? 'Painel do Professor' : 'Meu Aprendizado'}</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', color: 'var(--color-primary-accessible, #B8441F)', border: '1px solid var(--color-primary, #E4683F)' }}>
                ENEM OFICIAL
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--color-verde-light, rgba(41, 62, 36, 0.15))', color: 'var(--color-verde-700, #293E24)', border: '1px solid var(--color-verde-500, #3D5B36)' }}>
                CALIBRAÇÃO TRI (3PL)
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
              Simulado Oficial com Teoria de Resposta ao Item
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Sua nota é calculada pelo algoritmo estatístico do INEP, avaliando coerência e penalizando o chute casual.
            </p>
          </div>
        </div>


        {/* Cronômetro */}
        {!simuladoFinalizado && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-sm, 10px)',
            background: tempoRestanteSegundos < 300 ? 'rgba(188,57,31,0.15)' : 'var(--bg-glass)',
            border: tempoRestanteSegundos < 300 ? '1px solid var(--color-vermelho, #BC391F)' : '1px solid var(--border-color)',
            color: tempoRestanteSegundos < 300 ? 'var(--color-vermelho, #BC391F)' : 'var(--text-main)',
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>
            <Clock style={{ width: '1.2rem', height: '1.2rem' }} />
            {formatarTempo(tempoRestanteSegundos)}
          </div>
        )}
      </div>

      {/* Tela do Simulado Ativo */}
      {!simuladoFinalizado ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
          {/* Card Principal da Questão */}
          <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 14px)' }}>
            {/* Header da Questão */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>
                  QUESTÃO {currentIndex + 1} DE {itens.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentItem.area}</span>
              </div>
              <div style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm, 10px)',
                background: currentItem.b < -0.3 ? 'var(--color-verde-light, rgba(41, 62, 36, 0.15))' : currentItem.b <= 0.8 ? 'var(--color-primary-light, rgba(228, 104, 63, 0.15))' : 'rgba(188,57,31,0.15)',
                color: currentItem.b < -0.3 ? 'var(--color-verde-700, #293E24)' : currentItem.b <= 0.8 ? 'var(--color-primary-accessible, #B8441F)' : 'var(--color-vermelho, #BC391F)',
                fontWeight: 700
              }}>
                Item TRI: {currentItem.b < -0.3 ? 'Conceitual / Fácil' : currentItem.b <= 0.8 ? 'Médio' : 'Complexo / Difícil'}
              </div>
            </div>

            {/* Tag BNCC */}
            <div style={{ fontSize: '0.75rem', color: 'var(--color-verde-700, #293E24)', background: 'var(--color-verde-light, rgba(41, 62, 36, 0.15))', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm, 10px)', marginBottom: '1.25rem', display: 'inline-block', fontWeight: 600 }}>
              Habilidade: {currentItem.habilidadeBNCC}
            </div>

            {/* Enunciado */}
            <p style={{ fontSize: '1.05rem', lineHeight: '1.65', color: 'var(--text-main)', marginBottom: '2rem' }}>
              {currentItem.enunciado}
            </p>

            {/* Alternativas A, B, C, D, E */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
              {currentItem.opcoes.map((opcao, optIdx) => {
                const letra = String.fromCharCode(65 + optIdx);
                const selecionada = respostas[currentItem.id] === optIdx;
                return (
                  <button
                    key={letra}
                    onClick={() => handleSelecionarOpcao(optIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm, 10px)',
                      textAlign: 'left',
                      border: selecionada ? '2px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)',
                      background: selecionada ? 'var(--color-primary-light, rgba(228, 104, 63, 0.12))' : 'var(--bg-glass)',
                      color: selecionada ? 'var(--text-main)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      background: selecionada ? 'var(--color-primary, #E4683F)' : 'var(--bg-glass)',
                      color: selecionada ? '#ffffff' : 'var(--text-secondary)'
                    }}>
                      {letra}
                    </div>
                    <span style={{ fontSize: '0.95rem', flex: 1 }}>{opcao}</span>
                  </button>
                );
              })}
            </div>

            {/* Navegação Entre Questões */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn-outline"
                style={{ padding: '0.6rem 1.25rem', opacity: currentIndex === 0 ? 0.4 : 1, borderRadius: 'var(--radius-sm, 10px)' }}
              >
                <ChevronLeft style={{ width: '1rem', height: '1rem' }} /> Anterior
              </button>

              {currentIndex < itens.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(itens.length - 1, prev + 1))}
                  className="btn-gradient"
                  style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
                >
                  Próxima <ChevronRight style={{ width: '1rem', height: '1rem' }} />
                </button>
              ) : (
                <button
                  onClick={handleFinalizarSimulado}
                  className="btn-gradient"
                  style={{ padding: '0.6rem 1.75rem', fontWeight: 800, borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
                >
                  Entregar Simulado & Gerar Nota TRI
                </button>
              )}
            </div>
          </div>

          {/* Coluna Lateral: Folha de Respostas & Progresso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Cartão-Resposta Digital
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Respondidas: {totalRespondidas} de {itens.length} ({porcentagemProgresso}%)
              </p>

              {/* Grid de Navegação Rápida */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {itens.map((item, idx) => {
                  const respondida = respostas[item.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(idx)}
                      style={{
                        padding: '0.6rem 0',
                        borderRadius: 'var(--radius-sm, 10px)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: isCurrent ? '2px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)',
                        background: isCurrent ? 'var(--color-primary-light, rgba(228, 104, 63, 0.25))' : respondida ? 'var(--color-verde-light, rgba(41, 62, 36, 0.2))' : 'var(--bg-glass)',
                        color: isCurrent ? 'var(--color-primary-accessible, #B8441F)' : respondida ? 'var(--color-verde-700, #293E24)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleFinalizarSimulado}
                disabled={totalRespondidas === 0}
                className="btn-gradient"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', fontWeight: 700, borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
              >
                Finalizar e Obter Nota TRI
              </button>
            </div>

            {/* Dica da TRI */}
            <div className="glass-card" style={{ padding: '1rem', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                <Sparkles style={{ width: '1rem', height: '1rem' }} /> Dica de Ouro da TRI
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                No ENEM, errar uma questão fácil e acertar uma questão difícil indica incoerência (chute casual) e reduz sua nota. Priorize garantir as questões conceituais fundamentais!
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Tela de Resultados TRI */
        resultadoTRI && (
          <div className="fade-in">
            {/* Placar de Notas TRI */}
            <div className="glass-card mb-4" style={{
              padding: '2.5rem',
              borderRadius: 'var(--radius-lg, 14px)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '4.5rem',
                height: '4.5rem',
                borderRadius: '50%',
                background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))',
                border: '2px solid var(--color-primary, #E4683F)',
                color: 'var(--color-primary-accessible, #B8441F)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Award style={{ width: '2.5rem', height: '2.5rem' }} />
              </div>

              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Relatório Oficial de Desempenho TRI (ENEM)
              </span>

              <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.5rem 0', fontFamily: 'var(--font-heading)' }}>
                {resultadoTRI.notaEnem} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/ 1000 pts</span>
              </h2>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Classificação: <strong style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>{resultadoTRI.classificacao}</strong> • {resultadoTRI.acertosBrutos} de {resultadoTRI.totalQuestoes} acertos ({resultadoTRI.porcentagemAcerto}%)
              </p>

              {/* Grid com Indicadores Estatísticos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Índice de Coerência TRI</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: resultadoTRI.indiceCoerenciaPedagogica >= 70 ? 'var(--color-verde-700, #293E24)' : 'var(--color-vermelho, #BC391F)' }}>
                    {resultadoTRI.indiceCoerenciaPedagogica}%
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Padrão lógico vs. Chute</span>
                </div>

                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Proficiência Theta (θ)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-verde-700, #293E24)' }}>
                    {resultadoTRI.thetaEstimado > 0 ? `+${resultadoTRI.thetaEstimado}` : resultadoTRI.thetaEstimado}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Escala Padronizada [-3, +3]</span>
                </div>

                <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Estimativa SiSU / Cursos</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary-accessible, #B8441F)' }}>
                    {resultadoTRI.notaEnem >= 750 ? 'Alta Concorrência' : resultadoTRI.notaEnem >= 600 ? 'Ampla Seleção' : 'Acesso Regular'}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Projeção de corte federal</span>
                </div>
              </div>
            </div>

            {/* Parecer Pedagógico da IA / Sistema */}
            <div className="glass-card mb-4" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                <Sparkles style={{ width: '1.2rem', height: '1.2rem', color: 'var(--color-primary-accessible, #B8441F)' }} />
                Diagnóstico & Orientações Pedagógicas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {resultadoTRI.recomendacoesPedagogicas.map((rec, i) => (
                  <div key={i} style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>

            {/* Gabarito Comentado e Detalhado por Item */}
            <div className="glass-card mb-4" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                Gabarito Oficial Comentado & Análise das Habilidades
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {itens.map((item, idx) => {
                  const detalhe = resultadoTRI.detalhesPorItem.find(d => d.itemId === item.id);
                  const correta = detalhe?.correto ?? false;
                  const escolhidaIdx = respostas[item.id];
                  const letraCorreta = String.fromCharCode(65 + item.respostaCorreta);
                  const letraEscolhida = escolhidaIdx !== undefined ? String.fromCharCode(65 + escolhidaIdx) : 'Não respondida';

                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-sm, 10px)',
                        background: correta ? 'var(--color-verde-light, rgba(41, 62, 36, 0.08))' : 'rgba(188,57,31,0.06)',
                        border: correta ? '1px solid var(--color-verde-500, #3D5B36)' : '1px solid rgba(188,57,31,0.25)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {correta ? (
                            <CheckCircle2 style={{ width: '1.2rem', height: '1.2rem', color: 'var(--color-verde-700, #293E24)' }} />
                          ) : (
                            <XCircle style={{ width: '1.2rem', height: '1.2rem', color: 'var(--color-vermelho, #BC391F)' }} />
                          )}
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            Item #{idx + 1} — {item.area}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem' }}>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            Dificuldade: {detalhe?.dificuldadeNivel}
                          </span>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                            Discriminação a = {item.a}
                          </span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {item.enunciado}
                      </p>

                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                        <div>Sua resposta: <strong style={{ color: correta ? 'var(--color-verde-700, #293E24)' : 'var(--color-vermelho, #BC391F)' }}>{letraEscolhida}</strong></div>
                        <div>Gabarito oficial: <strong style={{ color: 'var(--color-verde-700, #293E24)' }}>{letraCorreta}</strong></div>
                      </div>

                      {/* Justificativa Pedagógica */}
                      <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', borderLeft: '3px solid var(--color-primary, #E4683F)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        <strong style={{ color: 'var(--color-primary-accessible, #B8441F)', display: 'block', marginBottom: '0.2rem' }}>Resolução Oficial Comentada:</strong>
                        {item.justificativa}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações Finais */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={handleReiniciar}
                className="btn-outline"
                style={{ padding: '0.75rem 2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-sm, 10px)' }}
              >
                <RotateCcw style={{ width: '1rem', height: '1rem' }} /> Fazer Outro Simulado
              </button>
              <Link
                to="/estudante"
                className="btn-gradient"
                style={{ padding: '0.75rem 2.5rem', fontWeight: 700, textDecoration: 'none', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
              >
                Voltar ao Painel do Estudante
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
export default EnemSimuladoView;
