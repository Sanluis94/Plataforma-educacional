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
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'importacao_csv' | 'radar_evasao' | 'matriz_curricular' | 'dossie_mec' | 'relatorio_oficial'>('visao_geral');
  const [escolaNome] = useState('Universidade Kortex de Tecnologia & Inovação');
  const [diretorNome] = useState('Prof. Dr. Ricardo Valença');

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
      </div>

      {/* Header Institucional White-Label */}
      <div className="glass-card mb-4" style={{
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg, 14px)',
        background: 'var(--bg-glass)',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: 'var(--radius-sm, 10px)',
              background: 'var(--color-verde-700, #293E24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-nude-100, #FAF7EE)',
              fontWeight: 800,
              fontSize: '1.4rem'
            }}>
              <Building2 style={{ width: '1.8rem', height: '1.8rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700 }}>
                  EdTech SaaS B2B
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-Tenancy Escolar</span>
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0', fontFamily: 'var(--font-heading)' }}>
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
              className="btn-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-sm, 10px)' }}
            >
              <Printer style={{ width: '0.9rem', height: '0.9rem' }} /> Imprimir Parecer Oficial
            </button>
          </div>
        </div>
      </div>

      {/* Navegação de Abas da Coordenação */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'visao_geral', label: '📊 Panorama & Indicadores', icon: TrendingUp },
          { id: 'matriz_curricular', label: '🏛️ Matriz Curricular & Semestres', icon: Building2 },
          { id: 'radar_evasao', label: '⚠️ Radar de Retenção & Evasão', icon: AlertTriangle },
          { id: 'importacao_csv', label: '📥 Importação de Alunos (CSV)', icon: FileSpreadsheet },
          { id: 'dossie_mec', label: '📑 Dossiê MEC / SINAES', icon: CheckCircle2 },
          { id: 'relatorio_oficial', label: '📄 Relatório Institucional', icon: Building2 },
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
                borderRadius: 'var(--radius-sm, 10px)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: isActive ? '1px solid var(--color-primary, #E4683F)' : '1px solid transparent',
                background: isActive ? 'var(--color-primary-light, rgba(228, 104, 63, 0.15))' : 'transparent',
                color: isActive ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-secondary)',
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
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Alunos Matriculados</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>482</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', fontWeight: 600 }}>↑ +14 novos este mês</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Corpo Docente Ativo</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-verde-700, #293E24)' }}>28</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>100% integrados na plataforma</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Experimentos Realizados</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-verde-500, #3D5B36)' }}>3.840</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', fontWeight: 600 }}>Média de 7.9 labs por aluno</span>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Média Escolar Geral</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>7.6 <span style={{ fontSize: '1rem' }}>/ 10</span></div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', fontWeight: 600 }}>↑ +0.4 acima da meta BNCC</span>
            </div>
          </div>

          {/* Gráficos de Desempenho por Série */}
          <div className="glass-card mb-4" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg, 14px)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              Desempenho Médio e Taxa de Engajamento por Série Escolar
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DADOS_SERIES_CHART} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="serie" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }} />
                  <Bar dataKey="media" name="Média Escolar" fill="#293E24" radius={[4, 4, 0, 0]} />
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
                className="btn-outline"
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
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>
                      {aluno.frequenciaLabs}%
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={() => alert(`Aviso de apoio pedagógico enviado com sucesso para ${aluno.nome} e seus responsáveis!`)}
                      className="btn-outline"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', borderRadius: 'var(--radius-sm, 10px)' }}
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
          <div className="glass-card mb-4" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 14px)', background: 'var(--color-nude-100, #FAF7EE)', color: 'var(--color-verde-900, #172314)', border: '1px solid var(--color-nude-300, #E2D7C3)' }}>
            {/* Timbre da Escola */}
            <div style={{ borderBottom: '2px solid var(--color-verde-900, #172314)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-verde-900, #172314)', fontFamily: 'var(--font-heading)' }}>{escolaNome}</h2>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--color-verde-700, #293E24)' }}>
                  Secretaria de Educação e Coordenação Pedagógica • Sistema Integrado Edu-Interact
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-verde-700, #293E24)' }}>
                <div>Emitido em: {new Date().toLocaleDateString('pt-BR')}</div>
                <div>Protocolo: #{Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
            </div>

            <h3 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-verde-900, #172314)', fontFamily: 'var(--font-heading)' }}>
              Boletim Institucional de Desempenho e Práticas Laboratoriais
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-nude-500, #F1EAD9)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--color-nude-300, #E2D7C3)' }}>
              <div><strong>Alunos Ativos:</strong> 482</div>
              <div><strong>Aproveitamento Médio:</strong> 76%</div>
              <div><strong>Experimentos Concluídos:</strong> 3.840</div>
              <div><strong>Metodologia Aplicada:</strong> Ativa (Sócrates / Freire / DUA)</div>
              <div><strong>Ano Letivo:</strong> 2026</div>
              <div><strong>Direção:</strong> {diretorNome}</div>
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-verde-700, #293E24)', marginBottom: '2rem' }}>
              Certificamos que as turmas vinculadas a este estabelecimento cumpriram integralmente a carga horária de práticas experimentais científicas e avaliações da Base Nacional Comum Curricular (BNCC), registrando evolução satisfatória nas competências de Ciências da Natureza e Matemática.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid var(--color-nude-300, #E2D7C3)' }}>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ borderBottom: '1px solid var(--color-verde-900, #172314)', marginBottom: '0.4rem' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-verde-900, #172314)' }}>{diretorNome}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)' }}>Diretora Pedagógica</div>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ borderBottom: '1px solid var(--color-verde-900, #172314)', marginBottom: '0.4rem' }}></div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-verde-900, #172314)' }}>Coordenação Geral BNCC</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)' }}>Comitê Acadêmico</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: MATRIZ CURRICULAR & SEMESTRES UNIVERSITÁRIOS ── */}
      {activeTab === 'matriz_curricular' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg, 14px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Estrutura Curricular & Créditos Acadêmicos
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                  Organização modular por semestres, ementas, carga horária prática de laboratório e alocação docente
                </p>
              </div>
              <span style={{ background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', color: 'var(--color-primary-accessible, #B8441F)', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                Graduação em Engenharia & Computação (10 Semestres)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                {
                  semestre: '1º Semestre',
                  materias: [
                    { cod: 'MAT-101', nome: 'Cálculo Diferencial I', ch: '80h', labs: '20h práticas', prof: 'Prof. Marcos Valente' },
                    { cod: 'FIS-101', nome: 'Física Geral: Mecânica', ch: '80h', labs: '30h práticas', prof: 'Profa. Marina Azevedo' },
                    { cod: 'ALG-101', nome: 'Algoritmos e Lógica', ch: '60h', labs: '30h práticas', prof: 'Prof. Carlos Eduardo' },
                  ]
                },
                {
                  semestre: '2º Semestre',
                  materias: [
                    { cod: 'MAT-102', nome: 'Cálculo Integral II', ch: '80h', labs: '20h práticas', prof: 'Prof. Marcos Valente' },
                    { cod: 'FIS-102', nome: 'Oscilações e Ondulatória', ch: '80h', labs: '30h práticas', prof: 'Profa. Marina Azevedo' },
                    { cod: 'QUI-101', nome: 'Química Geral Universitária', ch: '60h', labs: '30h práticas', prof: 'Profa. Beatriz Helena' },
                  ]
                },
                {
                  semestre: '3º Semestre',
                  materias: [
                    { cod: 'CIR-201', nome: 'Circuitos Elétricos I', ch: '80h', labs: '40h práticas', prof: 'Prof. Roberto Silva' },
                    { cod: 'ED-201', nome: 'Estruturas de Dados Avançadas', ch: '80h', labs: '40h práticas', prof: 'Prof. Carlos Eduardo' },
                    { cod: 'EST-201', nome: 'Probabilidade e Estatística', ch: '60h', labs: '20h práticas', prof: 'Profa. Fernanda Lima' },
                  ]
                },
                {
                  semestre: '4º Semestre',
                  materias: [
                    { cod: 'RES-201', nome: 'Resistência dos Materiais', ch: '80h', labs: '30h práticas', prof: 'Prof. Thiago Ramos' },
                    { cod: 'TER-201', nome: 'Termodinâmica Aplicada', ch: '80h', labs: '30h práticas', prof: 'Profa. Juliana Prado' },
                    { cod: 'ARQ-201', nome: 'Arquitetura de Computadores', ch: '80h', labs: '30h práticas', prof: 'Prof. Lucas Mendes' },
                  ]
                }
              ].map((s, idx) => (
                <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem', marginBottom: '0.65rem' }}>
                    {s.semestre}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {s.materias.map((m, mIdx) => (
                      <div key={mIdx} style={{ fontSize: '0.78rem', background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text-main)' }}>
                          <span>{m.cod} - {m.nome}</span>
                          <span style={{ color: 'var(--color-verde-700, #293E24)' }}>{m.ch}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          <span>🔬 {m.labs}</span>
                          <span>👨‍🏫 {m.prof}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ABA: DOSSIÊ MEC / SINAES DE ACREDITAÇÃO INSTITUCIONAL ── */}
      {activeTab === 'dossie_mec' && (
        <div className="fade-in print-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Estilos dedicados para impressão de auditoria MEC/INEP */}
          <style>{`
            @media print {
              body {
                background: #ffffff !important;
                color: #000000 !important;
              }
              header, nav, .btn-outline, .btn-action, .no-print, [title*="Retornar"] {
                display: none !important;
              }
              .print-container {
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
              }
              .glass-card {
                background: #ffffff !important;
                border: 1px solid #cccccc !important;
                box-shadow: none !important;
                color: #000000 !important;
                page-break-inside: avoid;
              }
              .print-page-break {
                page-break-before: always;
              }
            }
          `}</style>

          {/* Barra de Ações Rápidas da Coordenação */}
          <div className="no-print glass-card" style={{ padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-glass)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-verde-700, #293E24)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Governança Regulatória & SINAES
              </span>
              <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Dossiê Oficial para Avaliação In Loco / Virtual do MEC / INEP
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Documento comprobatório de atendimento pleno das Dimensões 1, 2 e 3 do Instrumento de Avaliação de Cursos de Graduação (MEC).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => window.print()}
                className="btn-action"
                style={{
                  background: 'var(--color-verde-700, #293E24)',
                  color: '#ffffff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                <Printer style={{ width: '18px', height: '18px' }} />
                Imprimir Dossiê Oficial (MEC / INEP)
              </button>
            </div>
          </div>

          {/* Dossiê Institucional Timbrado */}
          <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '14px', background: '#FAF7EE', color: '#172314', border: '1px solid #D5C9B3' }}>
            {/* Cabeçalho Oficial da República e IES */}
            <div style={{ borderBottom: '3px double #172314', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3.75rem',
                    height: '3.75rem',
                    borderRadius: '8px',
                    background: '#293E24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FAF7EE',
                    fontWeight: 900,
                    fontSize: '1.8rem'
                  }}>
                    🏛️
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#293E24' }}>
                      República Federativa do Brasil • Ministério da Educação (MEC)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#555555', fontWeight: 600 }}>
                      Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP) • SINAES
                    </div>
                    <h2 style={{ margin: '0.3rem 0', fontSize: '1.5rem', fontWeight: 900, color: '#172314', fontFamily: 'var(--font-heading)' }}>
                      {escolaNome}
                    </h2>
                    <div style={{ fontSize: '0.8rem', color: '#293E24', fontWeight: 600 }}>
                      Código e-MEC: #24819 • Atos Regulatórios: Portaria Normativa nº 23/2017 & Resolução CNE/CES nº 1/2021
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.82rem', background: '#F1EAD9', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D5C9B3' }}>
                  <div style={{ fontWeight: 800, color: '#B8441F' }}>CONCEITO INDICATIVO: NOTA 5.0</div>
                  <div style={{ color: '#444444', fontSize: '0.75rem', marginTop: '0.2rem' }}>Protocolo SINAES: #{Math.floor(10000000 + Math.random() * 90000000)}</div>
                  <div style={{ color: '#444444', fontSize: '0.75rem' }}>Emissão: {new Date().toLocaleDateString('pt-BR')}</div>
                  <div style={{ color: '#293E24', fontSize: '0.72rem', fontWeight: 700, marginTop: '0.25rem' }}>Autenticação: SHA-256 Validada</div>
                </div>
              </div>
            </div>

            {/* Sumário Executivo para Avaliadores */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172314', margin: '0 0 0.5rem 0', borderLeft: '4px solid #293E24', paddingLeft: '0.5rem' }}>
                1. IDENTIFICAÇÃO E CONFORMIDADE COM AS 3 DIMENSÕES DO INEP
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#2b3a28', margin: '0 0 1rem 0' }}>
                Este dossiê atesta a plena conformidade da infraestrutura tecnológica de laboratórios didáticos virtuais Kortex com as exigências dos instrumentos de avaliação de cursos de graduação do Sistema Nacional de Avaliação da Educação Superior (SINAES/INEP).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2D7C3' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#293E24' }}>DIMENSÃO 1: ORGANIZAÇÃO DIDÁTICO-PEDAGÓGICA</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#22c55e', margin: '0.25rem 0' }}>Conceito: 5.0</div>
                  <div style={{ fontSize: '0.75rem', color: '#555555' }}>
                    Aderência às DCNs com metodologia ativa CSFA (Conhecer-Simular-Formular-Agir), rubricas formativas socráticas e registro de telemetria individual.
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2D7C3' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#293E24' }}>DIMENSÃO 2: CORPO DOCENTE E TUTORIAL</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#22c55e', margin: '0.25rem 0' }}>Conceito: 5.0</div>
                  <div style={{ fontSize: '0.75rem', color: '#555555' }}>
                    Ambiente SpeedGrader Kortex com playback de telemetria (60 Hz), verificação de integridade algorítmica e livro de notas ponderado MEC.
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #E2D7C3' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#293E24' }}>DIMENSÃO 3: INFRAESTRUTURA DE LABORATÓRIOS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#22c55e', margin: '0.25rem 0' }}>Conceito: 5.0</div>
                  <div style={{ fontSize: '0.75rem', color: '#555555' }}>
                    Simuladores numéricos com equações diferenciais em tempo real, 100% de disponibilidade em nuvem e acessibilidade WCAG 2.1 AAA / DUA.
                  </div>
                </div>
              </div>
            </div>

            {/* Inventário Oficial de Laboratórios Virtuais */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172314', margin: '0 0 0.5rem 0', borderLeft: '4px solid #293E24', paddingLeft: '0.5rem' }}>
                2. INVENTÁRIO TÉCNICO DE LABORATÓRIOS VIRTUAIS POR DIRETRIZ CURRICULAR (DCN)
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#2b3a28', margin: '0 0 1rem 0' }}>
                Mapeamento dos componentes curriculares práticos, modelos matemáticos de simulação contínua e carga horária equivalente chancelada:
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', background: '#FFFFFF', border: '1px solid #D5C9B3' }}>
                  <thead>
                    <tr style={{ background: '#293E24', color: '#FAF7EE', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Código / Título do Laboratório</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Nível Acadêmico</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Diretriz Curricular (DCN)</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>CH Prática</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Solver Físico-Matemático</th>
                      <th style={{ padding: '0.6rem 0.75rem' }}>Auditoria Digital</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        cod: 'sup_fis_01',
                        nome: 'Oscilações Forçadas e Ressonância Mecânica',
                        nivel: 'Graduação',
                        dcn: 'DCN Engenharia (Art. 6º)',
                        ch: '30h',
                        solver: 'Euler-Cromer ODE (2ª Ordem)',
                        hash: 'SHA256: 4f8a...9c12'
                      },
                      {
                        cod: 'sup_calc_01',
                        nome: 'Somas de Riemann e Convergência Integral',
                        nivel: 'Graduação',
                        dcn: 'DCN Exatas & Computação',
                        ch: '20h',
                        solver: 'Partições de Darboux & Limites',
                        hash: 'SHA256: e81b...34ad'
                      },
                      {
                        cod: 'sup_comp_01',
                        nome: 'Complexidade de Algoritmos de Ordenação O(n)',
                        nivel: 'Graduação',
                        dcn: 'DCN Ciência da Computação',
                        ch: '30h',
                        solver: 'Análise Assintótica Big-O',
                        hash: 'SHA256: 77a0...51ef'
                      },
                      {
                        cod: 'sup_qui_01',
                        nome: 'Cinética Química & Equação de Arrhenius',
                        nivel: 'Graduação',
                        dcn: 'DCN Engenharia Química',
                        ch: '30h',
                        solver: 'Arrhenius k(T) & ODE Reacional',
                        hash: 'SHA256: 12c3...89aa'
                      },
                      {
                        cod: 'sup_eletr_03',
                        nome: 'Circuito RLC Transiente & Osciloscópio Digital',
                        nivel: 'Graduação',
                        dcn: 'DCN Engenharia Elétrica',
                        ch: '40h',
                        solver: 'Equação Característica 2ª Ordem',
                        hash: 'SHA256: b34d...7710'
                      },
                      {
                        cod: 'sup_resmat_01',
                        nome: 'Ensaio de Tração & Curva Tensão-Deformação',
                        nivel: 'Graduação',
                        dcn: 'DCN Eng. Mecânica e Civil',
                        ch: '30h',
                        solver: 'Ramberg-Osgood & Hooke',
                        hash: 'SHA256: 99f1...cc34'
                      },
                      {
                        cod: 'sup_bioq_01',
                        nome: 'Cinética Enzimática de Michaelis-Menten',
                        nivel: 'Graduação',
                        dcn: 'DCN Farmácia e Biomedicina',
                        ch: '30h',
                        solver: 'Lineweaver-Burk & Briggs-Haldane',
                        hash: 'SHA256: dd22...88fe'
                      },
                      {
                        cod: 'pos_ia_01',
                        nome: 'Redes Neurais & Otimização por Gradiente (IA)',
                        nivel: 'Pós-Graduação',
                        dcn: 'CAPES Computação Aplicada',
                        ch: '45h',
                        solver: 'Backpropagation + Momentum SGD',
                        hash: 'SHA256: a120...49bb'
                      },
                      {
                        cod: 'pos_termo_01',
                        nome: 'Termodinâmica Avançada — Ciclo Brayton & Cogeração',
                        nivel: 'Pós-Graduação',
                        dcn: 'CAPES Engenharia Térmica',
                        ch: '45h',
                        solver: '1ª e 2ª Lei (Exergia & Brayton)',
                        hash: 'SHA256: ff38...01ec'
                      }
                    ].map((lab, lIdx) => (
                      <tr key={lab.cod} style={{ borderBottom: '1px solid #E2D7C3', background: lIdx % 2 === 0 ? '#FFFFFF' : '#F9F5EC' }}>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#172314' }}>
                          <span style={{ color: '#B8441F', fontSize: '0.72rem', display: 'block' }}>{lab.cod}</span>
                          {lab.nome}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', color: '#293E24', fontWeight: 600 }}>{lab.nivel}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: '#555555' }}>{lab.dcn}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#293E24' }}>{lab.ch}</td>
                        <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#333333' }}>{lab.solver}</td>
                        <td style={{ padding: '0.55rem 0.75rem', color: '#22c55e', fontWeight: 700, fontSize: '0.72rem' }}>
                          ✓ {lab.hash}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Termo de Homologação, Assinaturas e Autenticidade Digital */}
            <div style={{ borderTop: '2px solid #293E24', paddingTop: '1.5rem', marginTop: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#172314', margin: '0 0 0.35rem 0' }}>
                    DECLARAÇÃO DE IDONEIDADE TÉCNICA E PEDAGÓGICA
                  </h5>
                  <p style={{ fontSize: '0.78rem', color: '#444444', lineHeight: '1.5', margin: 0 }}>
                    Certificamos perante a Comissão de Avaliadores do Ministério da Educação que todos os laboratórios descritos estão plenamente integrados, funcionais e acessíveis a 100% dos discentes regularmente matriculados, dispondo de suporte contínuo, tutoria socrática e auditoria criptográfica de telemetria.
                  </p>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px dashed #293E24', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#293E24', marginBottom: '0.25rem' }}>
                    CHAVE DE SEGURANÇA & VALIDAÇÃO DIGITAL INEP
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#B8441F', fontWeight: 700, wordBreak: 'break-all' }}>
                    KORTEX-MEC-2026-9B4F8A1C3E7D201A88B7C9F0E123
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666666', marginTop: '0.25rem' }}>
                    Documento assinado digitalmente com certificado ICP-Brasil em conformidade com a MP nº 2.200-2/2001.
                  </div>
                </div>
              </div>

              {/* Linhas de Assinatura */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', paddingTop: '1rem', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ textAlign: 'center', minWidth: '220px', flex: 1 }}>
                  <div style={{ borderBottom: '1px solid #172314', marginBottom: '0.4rem' }}></div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#172314' }}>{diretorNome}</div>
                  <div style={{ fontSize: '0.74rem', color: '#444444' }}>Pró-Reitor Acadêmico & Procurador Institucional</div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px', flex: 1 }}>
                  <div style={{ borderBottom: '1px solid #172314', marginBottom: '0.4rem' }}></div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#172314' }}>Comissão Própria de Avaliação (CPA)</div>
                  <div style={{ fontSize: '0.74rem', color: '#444444' }}>Coordenação de Acreditação & SINAES</div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '220px', flex: 1 }}>
                  <div style={{ borderBottom: '1px solid #172314', marginBottom: '0.4rem' }}></div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#172314' }}>Comitê Técnico Kortex EdTech</div>
                  <div style={{ fontSize: '0.74rem', color: '#444444' }}>Auditoria de Infraestrutura Tecnológica</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CoordenacaoDashboard;
