import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, TrendingUp, AlertTriangle,
  FileSpreadsheet, Printer, CheckCircle2, Home as HomeIcon
} from 'lucide-react';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ImportPreviewStudent {
  nome: string;
  email: string;
  turma: string;
  matricula: string;
  valido: boolean;
  erro?: string;
}

interface StudentRiskItem {
  id: string;
  nome: string;
  turma: string;
  mediaGeral: number;
  frequenciaLabs: number; // %
  nivelRisco: 'Crítico' | 'Médio' | 'Leve';
  fatorPrincipal: string;
}

const DADOS_SERIES_CHART = [
  { serie: '6º Ano', media: 7.8, engajamento: 84 },
  { serie: '7º Ano', media: 7.2, engajamento: 79 },
  { serie: '8º Ano', media: 6.9, engajamento: 71 },
  { serie: '9º Ano', media: 7.4, engajamento: 76 },
  { serie: '1º EM', media: 6.5, engajamento: 68 },
  { serie: '2º EM', media: 7.1, engajamento: 82 },
  { serie: '3º EM (ENEM)', media: 8.2, engajamento: 91 },
];

const ALUNOS_RISCO_PADRAO: StudentRiskItem[] = [
  { id: 'risk_1', nome: 'Matheus Henrique Silva', turma: '1º Ano EM - B', mediaGeral: 4.8, frequenciaLabs: 25, nivelRisco: 'Crítico', fatorPrincipal: 'Queda de 60% nas entregas de experimentos de Física' },
  { id: 'risk_2', nome: 'Beatriz Vasconcelos', turma: '8º Ano Fundamental', mediaGeral: 5.2, frequenciaLabs: 35, nivelRisco: 'Crítico', fatorPrincipal: 'Dificuldade concentrada em Matemática e ausência no último simulado' },
  { id: 'risk_3', nome: 'Gabriel Souza Ferreira', turma: '2º Ano EM - A', mediaGeral: 5.9, frequenciaLabs: 45, nivelRisco: 'Médio', fatorPrincipal: 'Falta de submissão do plano de experimentos de Química' },
  { id: 'risk_4', nome: 'Larissa Mendes Duarte', turma: '9º Ano Fundamental', mediaGeral: 6.1, frequenciaLabs: 48, nivelRisco: 'Leve', fatorPrincipal: 'Oscilação na entrega dos roteiros socráticos' },
];

export function CoordenacaoDashboard() {
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'importacao_csv' | 'radar_evasao' | 'relatorio_oficial'>('visao_geral');
  const [escolaNome] = useState('Colégio Modelo Integrado');
  const [diretorNome] = useState('Dra. Helena Cavalcanti');

  // Estado da importação CSV
  const [csvRawText, setCsvRawText] = useState('');
  const [previewAlunos, setPreviewAlunos] = useState<ImportPreviewStudent[]>([]);
  const [importSucesso, setImportSucesso] = useState(false);
  const [totalImportados, setTotalImportados] = useState(0);

  // Parse CSV simples
  const handleProcessarCSV = (texto: string) => {
    setCsvRawText(texto);
    setImportSucesso(false);
    if (!texto.trim()) {
      setPreviewAlunos([]);
      return;
    }

    const linhas = texto.trim().split('\n');
    const resultado: ImportPreviewStudent[] = [];

    // Ignora cabeçalho se existir
    const inicio = linhas[0].toLowerCase().includes('nome') ? 1 : 0;

    for (let i = inicio; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;

      const partes = linha.split(/[,;\t]/).map(p => p.trim());
      const nome = partes[0] || '';
      const email = partes[1] || '';
      const turma = partes[2] || 'Geral';
      const matricula = partes[3] || `MAT-${Math.floor(1000 + Math.random() * 9000)}`;

      let valido = true;
      let erro = '';

      if (!nome || nome.length < 3) {
        valido = false;
        erro = 'Nome inválido ou curto';
      } else if (!email || !email.includes('@')) {
        valido = false;
        erro = 'E-mail inválido';
      }

      resultado.push({ nome, email, turma, matricula, valido, erro });
    }

    setPreviewAlunos(resultado);
  };

  const handleEfetivarMatriculaLote = () => {
    const validos = previewAlunos.filter(a => a.valido);
    setTotalImportados(validos.length);
    setImportSucesso(true);
  };

  const handleCarregarExemploCSV = () => {
    const exemplo = `Nome,Email,Turma,Matricula
Lucas Albuquerque Ramos,lucas.ramos@escola.com.br,1º Ano EM - A,20260101
Fernanda Montenegro Silva,fernanda.silva@escola.com.br,1º Ano EM - A,20260102
Rodrigo Faro Castro,rodrigo.castro@escola.com.br,1º Ano EM - B,20260103
Mariana Ximenes Rocha,mariana.rocha@escola.com.br,2º Ano EM - A,20260104
Thiago Lacerda Prado,thiago.prado@escola.com.br,3º Ano EM - A,20260105`;
    handleProcessarCSV(exemplo);
  };

  const handleImprimirRelatorio = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '80rem', margin: '0 auto' }}>
      {/* Top Hub Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link
          to="/"
          className="btn-outline-cyan"
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
      </div>

      {/* Header Institucional White-Label */}
      <div className="glass-card mb-4" style={{
        padding: '1.75rem',
        borderRadius: '1rem',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(6,182,212,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.4rem'
            }}>
              <Building2 style={{ width: '1.8rem', height: '1.8rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', fontWeight: 700 }}>
                  EDTECH SAAS B2B
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-Tenancy Escolar</span>
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                {escolaNome}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Coordenação Pedagógica • Gestão: {diretorNome} • Ano Letivo 2026
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleImprimirRelatorio}
              className="btn-outline-cyan"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer style={{ width: '0.9rem', height: '0.9rem' }} /> Imprimir Parecer Oficial
            </button>
          </div>
        </div>
      </div>

      {/* Navegação de Abas da Coordenação */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'visao_geral', label: '📊 Panorama & Indicadores', icon: TrendingUp },
          { id: 'importacao_csv', label: '📥 Importação em Massa (CSV)', icon: FileSpreadsheet },
          { id: 'radar_evasao', label: '⚠️ Radar de Risco Escolar', icon: AlertTriangle },
          { id: 'relatorio_oficial', label: '📄 Relatório White-Label', icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: isActive ? '1px solid #06b6d4' : '1px solid transparent',
                background: isActive ? 'rgba(6,182,212,0.15)' : 'transparent',
                color: isActive ? '#06b6d4' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon style={{ width: '1rem', height: '1rem' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── ABA 1: PANORAMA & INDICADORES GERAIS ── */}
      {activeTab === 'visao_geral' && (
        <div className="fade-in">
          {/* Métricas Principais da Escola */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Alunos Matriculados</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4' }}>482</div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>↑ +14 novos este mês</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Corpo Docente Ativo</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#8b5cf6' }}>28</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>100% integrados na plataforma</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Experimentos Realizados</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>3.840</div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Média de 7.9 labs por aluno</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Média Escolar Geral</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>7.6 <span style={{ fontSize: '1rem' }}>/ 10</span></div>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>↑ +0.4 acima da meta BNCC</span>
            </div>
          </div>

          {/* Gráficos de Desempenho por Série */}
          <div className="glass-card mb-4" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Desempenho Médio e Taxa de Engajamento por Série Escolar
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DADOS_SERIES_CHART} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="serie" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px' }} />
                  <Bar dataKey="media" name="Média Escolar" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 2: IMPORTAÇÃO EM MASSA VIA CSV / PLANILHA ── */}
      {activeTab === 'importacao_csv' && (
        <div className="fade-in">
          <div className="glass-card mb-4" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem' }}>
                  Matrícula e Cadastro em Lote via Planilha (CSV)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Insira os dados no formato: <code>Nome, Email, Turma, Matricula</code> ou cole diretamente do Excel.
                </p>
              </div>

              <button
                onClick={handleCarregarExemploCSV}
                className="btn-outline-cyan"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
              >
                Carregar Exemplo Modelo
              </button>
            </div>

            <textarea
              rows={6}
              value={csvRawText}
              onChange={e => handleProcessarCSV(e.target.value)}
              placeholder="Cole os dados aqui no formato:&#10;Maria Eduarda, maria@escola.com.br, 1º Ano EM, MAT-202601&#10;João Pedro Lima, joao@escola.com.br, 1º Ano EM, MAT-202602"
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}
            />

            {/* Pré-visualização com Validação */}
            {previewAlunos.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Prévia da Importação ({previewAlunos.filter(a => a.valido).length} válidos de {previewAlunos.length})
                  </span>
                  <button
                    onClick={handleEfetivarMatriculaLote}
                    disabled={previewAlunos.filter(a => a.valido).length === 0}
                    className="btn-gradient"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    Efetivar Matrículas dos Válidos
                  </button>
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-card)', borderRadius: '0.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Status</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Nome Completo</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>E-mail</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Turma Alvo</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Matrícula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewAlunos.map((aluno, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: aluno.valido ? 'transparent' : 'rgba(239,68,68,0.08)' }}>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            {aluno.valido ? (
                              <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle2 style={{ width: '0.9rem', height: '0.9rem' }} /> Válido
                              </span>
                            ) : (
                              <span style={{ color: '#ef4444', fontWeight: 700 }}>
                                ⚠️ {aluno.erro}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>{aluno.nome}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{aluno.email}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-secondary)' }}>{aluno.turma}</td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>{aluno.matricula}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sucesso na Importação */}
            {importSucesso && (
              <div style={{ padding: '1rem', borderRadius: '0.5rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#34d399' }}>
                <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                <div>
                  <strong>Sucesso!</strong> {totalImportados} alunos foram cadastrados no sistema com sucesso e receberam acesso instantâneo às turmas.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ABA 3: RADAR PREDITIVO DE EVASÃO & RISCO ESCOLAR ── */}
      {activeTab === 'radar_evasao' && (
        <div className="fade-in">
          <div className="glass-card mb-4" style={{ padding: '1.75rem', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem' }}>
              <AlertTriangle style={{ width: '1.1rem', height: '1.1rem' }} />
              ALERTA PREDITIVO COM INTELIGÊNCIA ARTIFICIAL
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
              Estudantes em Risco de Desengajamento / Reprovação
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              O algoritmo analisa a frequência nos laboratórios virtuais, queda de notas em simulados e intervalos prolongados sem login para sinalizar intervenção pedagógica preventiva.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {ALUNOS_RISCO_PADRAO.map(aluno => (
                <div
                  key={aluno.id}
                  style={{
                    padding: '1.2rem',
                    borderRadius: '0.75rem',
                    background: aluno.nivelRisco === 'Crítico' ? 'rgba(239,68,68,0.08)' : aluno.nivelRisco === 'Médio' ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
                    border: aluno.nivelRisco === 'Crítico' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px 140px auto',
                    gap: '1rem',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: aluno.nivelRisco === 'Crítico' ? '#ef4444' : '#f59e0b',
                        color: '#fff',
                        fontWeight: 700
                      }}>
                        Risco {aluno.nivelRisco}
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{aluno.nome}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({aluno.turma})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {aluno.fatorPrincipal}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Média Escolar</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: aluno.mediaGeral < 5 ? '#ef4444' : '#f59e0b' }}>
                      {aluno.mediaGeral} / 10
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Frequência Labs</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#06b6d4' }}>
                      {aluno.frequenciaLabs}%
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => alert(`Aviso de apoio pedagógico enviado com sucesso para ${aluno.nome} e seus responsáveis!`)}
                      className="btn-outline-cyan"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                    >
                      Enviar Intervenção
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA 4: RELATÓRIO OFICIAL WHITE-LABEL ── */}
      {activeTab === 'relatorio_oficial' && (
        <div className="fade-in">
          <div className="glass-card mb-4" style={{ padding: '2rem', borderRadius: '1rem', background: '#ffffff', color: '#0f172a' }}>
            {/* Timbre da Escola */}
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{escolaNome}</h2>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#475569' }}>
                  Secretaria de Educação e Coordenação Pedagógica • Sistema Integrado Edu-Interact
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                <div>Emitido em: {new Date().toLocaleDateString('pt-BR')}</div>
                <div>Protocolo: #{Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              Boletim Institucional de Desempenho e Práticas Laboratoriais
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div><strong>Alunos Ativos:</strong> 482</div>
              <div><strong>Aproveitamento Médio:</strong> 76%</div>
              <div><strong>Experimentos Concluídos:</strong> 3.840</div>
              <div><strong>Metodologia Aplicada:</strong> Ativa (Sócrates / Freire / DUA)</div>
              <div><strong>Ano Letivo:</strong> 2026</div>
              <div><strong>Direção:</strong> {diretorNome}</div>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#334155', marginBottom: '2rem' }}>
              Certificamos que as turmas vinculadas a este estabelecimento cumpriram integralmente a carga horária de práticas experimentais científicas e avaliações da Base Nacional Comum Curricular (BNCC), registrando evolução satisfatória nas competências de Ciências da Natureza e Matemática.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ borderBottom: '1px solid #000', marginBottom: '0.4rem' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{diretorNome}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Diretora Pedagógica</div>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ borderBottom: '1px solid #000', marginBottom: '0.4rem' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Coordenação Geral BNCC</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Comitê Acadêmico</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CoordenacaoDashboard;
