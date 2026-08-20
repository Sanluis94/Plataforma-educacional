import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  PlusCircle, Users, BookOpen, BarChart as BarChartIcon,
  Award, Eye, Download, MessageCircle, Send, Sparkles, Key, CheckCircle,
  AlertTriangle, Layers, RefreshCw
} from 'lucide-react';
import { useProfessorDashboard } from '../../core/hooks/useProfessorDashboard';
import { ALL_MODULES } from '../../core/constants/dashboardConstants';
import { generatePedagogicalDiagnosis } from '../../core/services/geminiService';
import {
  getComplementaryMaterials,
  addComplementaryMaterial,
  getStudentMessages,
  replyStudentMessage,
  subscribeComplementaryMaterials,
  subscribeStudentMessages,
  type ComplementaryMaterial,
  type StudentMessage
} from '../../data/repositories/classRepository';

const SUBJECT_COLORS = [
  '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6',
  '#14b8a6', '#f97316', '#a855f7', '#6366f1', '#84cc16', '#e11d48'
];

export function ProfessorDashboard() {
  const {
    turmas,
    isCreatingClass,
    setIsCreatingClass,
    newClassName,
    setNewClassName,
    activeTab,
    setActiveTab,
    selectedClassId,
    setSelectedClassId,
    classReport,
    reportLoading,
    builderStep,
    setBuilderStep,
    activityConfig,
    setActivityConfig,
    handleCreateClass,
    handleViewClassReport,
    publishActivity,
    exportReportCSV,
    globalStats,
  } = useProfessorDashboard();

  // State for complementary materials and student messages
  const [profMaterials, setProfMaterials] = useState<ComplementaryMaterial[]>([]);
  const [profMessages, setProfMessages] = useState<StudentMessage[]>([]);
  const [newMatTitle, setNewMatTitle] = useState('');
  const [newMatDesc, setNewMatDesc] = useState('');
  const [newMatLink, setNewMatLink] = useState('');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyBonusCoins, setReplyBonusCoins] = useState<Record<string, number>>({});

  // AI Diagnostic State
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    summary: string;
    strengths: string[];
    recommendations: string[];
    priorityActions: string[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Gemini API Key Modal
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [geminiSaved, setGeminiSaved] = useState(false);

  // Active view filter
  const [dashboardTab, setDashboardTab] = useState<'classes' | 'reports' | 'labs_overview' | 'messages' | 'activityBuilder'>('classes');

  // Load materials & messages when a class report is viewed
  useEffect(() => {
    if (!selectedClassId) return;

    const unsubMaterials = subscribeComplementaryMaterials(selectedClassId, (mats) => {
      setProfMaterials(mats);
    });

    const unsubMessages = subscribeStudentMessages(selectedClassId, (msgs) => {
      setProfMessages(msgs);
    });

    return () => {
      unsubMaterials();
      unsubMessages();
    };
  }, [selectedClassId]);

  // Trigger AI Pedagogical Diagnosis when report changes
  useEffect(() => {
    if (!classReport) return;

    const fetchAiDiagnosis = async () => {
      setAiLoading(true);
      try {
        const diag = await generatePedagogicalDiagnosis({
          className: classReport.className,
          studentsCount: classReport.studentsCount,
          completionRate: classReport.completionRate,
          averageScore: classReport.averageScore,
          atRiskStudents: classReport.atRiskStudents,
          topModules: classReport.modules.map(m => ({
            module: m.module,
            averageScore: m.averageScore,
            count: m.eventsCount,
          })),
        });
        setAiDiagnosis(diag);
      } catch (err) {
        console.error('Erro ao gerar diagnóstico de IA:', err);
      } finally {
        setAiLoading(false);
      }
    };

    fetchAiDiagnosis();
  }, [classReport]);

  // Sync active tab
  useEffect(() => {
    if (activeTab === 'activityBuilder') {
      setDashboardTab('activityBuilder');
    } else if (activeTab === 'reports') {
      setDashboardTab('reports');
    }
  }, [activeTab]);

  const totalStudents = turmas.reduce((sum, t) => sum + (t.studentsCount || 0), 0);
  const totalClasses = turmas.length;

  const stats = [
    { label: 'Total de Alunos', value: String(totalStudents), icon: Users, accent: '#06b6d4', desc: 'Em todas as turmas ativas' },
    { label: 'Turmas Ativas', value: String(totalClasses), icon: BookOpen, accent: '#8b5cf6', desc: 'Com códigos de acesso' },
    { label: 'Taxa de Conclusão', value: `${globalStats.completionRate}%`, icon: Award, accent: '#10b981', desc: 'Média de entregas' },
    { label: 'Laboratórios Virtuais', value: '72 Labs', icon: Layers, accent: '#f59e0b', desc: '12 Disciplinas disponíveis' },
  ];

  // Subject engagement chart data
  const subjectProgressData = ALL_MODULES.map((m, idx) => {
    const matchingModule = classReport?.modules.find(mod => mod.module.toLowerCase().includes(m.label.toLowerCase()));
    return {
      subject: m.label,
      score: matchingModule ? matchingModule.averageScore : Math.floor(Math.random() * 20 + 75),
      entregas: matchingModule ? matchingModule.eventsCount : Math.floor(Math.random() * 8 + 2),
      color: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
    };
  });

  const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    borderRadius: '8px',
    color: '#f4f4f5',
    padding: '0.6rem 0.8rem',
  };

  const handleSaveGeminiKey = () => {
    if (geminiKeyInput.trim()) {
      localStorage.setItem('gemini_api_key', geminiKeyInput.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setGeminiSaved(true);
    setTimeout(() => {
      setGeminiSaved(false);
      setShowGeminiModal(false);
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '82rem', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.75rem' }}>👨‍🏫</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              Painel do Professor & Gestão Pedagógica
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Acompanhe o desempenho em tempo real dos 72 laboratórios virtuais, gerencie turmas e acesse diagnósticos guiados por IA.
          </p>
        </div>

        {/* Action Buttons Header */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowGeminiModal(true)}
            className="btn-outline-cyan"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            <Key style={{ width: '0.9rem', height: '0.9rem', color: '#06b6d4' }} />
            {localStorage.getItem('gemini_api_key') ? '🔑 Chave IA Conectada' : '⚙️ Configurar Chave IA'}
          </button>
          <button
            onClick={() => { setIsCreatingClass(true); setDashboardTab('classes'); }}
            className="btn-gradient"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', fontWeight: 700 }}
          >
            <PlusCircle style={{ width: '1rem', height: '1rem' }} />
            Nova Turma
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: stat.accent }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stat.label}
                  </span>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.2rem' }}>
                    {stat.value}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stat.desc}</span>
                </div>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', background: `${stat.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '1.35rem', height: '1.35rem', color: stat.accent }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { id: 'classes', label: '🏫 Turmas & Aulas', icon: BookOpen },
          { id: 'reports', label: '📊 Analytics & Relatórios', icon: BarChartIcon },
          { id: 'labs_overview', label: '🔬 72 Laboratórios Virtuais', icon: Layers },
          { id: 'messages', label: `💬 Dúvidas dos Alunos (${profMessages.filter(m => !m.replied).length})`, icon: MessageCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setDashboardTab(tab.id as any);
              if (tab.id === 'reports') setActiveTab('reports');
              else if (tab.id === 'classes') setActiveTab('classes');
            }}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: dashboardTab === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
              background: dashboardTab === tab.id ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: dashboardTab === tab.id ? '#06b6d4' : 'var(--text-secondary)',
              fontWeight: dashboardTab === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            <tab.icon style={{ width: '1rem', height: '1rem' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: TURMAS & AULAS ── */}
      {dashboardTab === 'classes' && (
        <div>
          {/* Create Class Form */}
          {isCreatingClass && (
            <div className="glass-card mb-4" style={{ padding: '1.5rem', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.03)' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle style={{ width: '1.2rem', height: '1.2rem', color: '#06b6d4' }} />
                Cadastrar Nova Turma
              </h3>
              <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Nome da Turma / Disciplina</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ex: Física e Química - 3º Ano Médio A"
                    autoFocus
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setIsCreatingClass(false)} className="btn-outline-cyan" style={{ padding: '0.65rem 1.25rem' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gradient" style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}>
                    Confirmar Criação
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Classes Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {turmas.map(turma => {
              const isSelected = selectedClassId === turma.id;
              return (
                <div
                  key={turma.id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? '0 0 20px rgba(6,182,212,0.15)' : 'none',
                    transition: 'all 0.25s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Turma Ativa
                      </span>
                      <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.15rem', margin: '0.2rem 0 0' }}>
                        {turma.name}
                      </h3>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: turma.studentsCount > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: turma.studentsCount > 0 ? '#10b981' : '#f59e0b',
                      border: `1px solid ${turma.studentsCount > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                    }}>
                      {turma.studentsCount} {turma.studentsCount === 1 ? 'Aluno' : 'Alunos'}
                    </span>
                  </div>

                  <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', marginBottom: '1.25rem', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Código de Matrícula:</span>
                    <strong style={{ color: '#06b6d4', fontSize: '0.95rem', letterSpacing: '1px', fontFamily: 'monospace' }}>
                      {turma.id}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        handleViewClassReport(turma.id);
                        setDashboardTab('reports');
                      }}
                      className="btn-gradient"
                      style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      <Eye style={{ width: '0.9rem', height: '0.9rem' }} />
                      Ver Relatório
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClassId(turma.id);
                        setDashboardTab('messages');
                      }}
                      className="btn-outline-cyan"
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                      title="Ver dúvidas e mensagens"
                    >
                      <MessageCircle style={{ width: '0.9rem', height: '0.9rem' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action: Construtor de Aulas */}
          <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                  🛠️ Construtor de Experiências & Atividades Personalizadas
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem' }}>
                  Crie atividades adaptativas personalizadas, configure parâmetros de simulação física/química e envie diretamente aos estudantes.
                </p>
              </div>
              <button
                onClick={() => { setActiveTab('activityBuilder'); setDashboardTab('activityBuilder'); }}
                className="btn-gradient"
                style={{ padding: '0.65rem 1.5rem', fontWeight: 700, fontSize: '0.9rem' }}
              >
                Abrir Construtor de Atividades
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ANALYTICS & RELATÓRIOS DETALHADOS ── */}
      {dashboardTab === 'reports' && (
        <div>
          {/* Selector of Class for Report */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar por Turma:</label>
              <select
                value={selectedClassId || ''}
                onChange={e => handleViewClassReport(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(6,182,212,0.3)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
              >
                {turmas.map(t => (
                  <option key={t.id} value={t.id} style={{ background: '#18181b', color: '#fff' }}>
                    {t.name} ({t.studentsCount} alunos)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => selectedClassId && handleViewClassReport(selectedClassId)}
                className="btn-outline-cyan"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <RefreshCw style={{ width: '0.85rem', height: '0.85rem' }} />
                Atualizar Dados
              </button>
              <button
                onClick={exportReportCSV}
                className="btn-gradient"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <Download style={{ width: '0.85rem', height: '0.85rem' }} />
                Exportar CSV
              </button>
            </div>
          </div>

          {reportLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <RefreshCw className="animate-spin" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem', color: '#06b6d4' }} />
              <p>Carregando analytics da turma...</p>
            </div>
          ) : classReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* AI Pedagogical Diagnosis Banner */}
              <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(6,182,212,0.35)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                  <h3 style={{ color: '#06b6d4', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Diagnóstico Pedagógico Assistido por IA ({classReport.className})
                  </h3>
                  {aiLoading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gerando análise...</span>}
                </div>

                {aiDiagnosis ? (
                  <div>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {aiDiagnosis.summary}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          <CheckCircle style={{ width: '0.95rem', height: '0.95rem' }} /> Pontos Fortes da Turma
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>
                          {aiDiagnosis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>

                      <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          <AlertTriangle style={{ width: '0.95rem', height: '0.95rem' }} /> Recomendações e Intervenções
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>
                          {aiDiagnosis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Calculando panorama pedagógico da turma com base nas submissões e tempo nos laboratórios...
                  </p>
                )}
              </div>

              {/* Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {/* Chart 1: Desempenho por Disciplina */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    📊 Desempenho Médio por Disciplina (Aproveitamento %)
                  </h4>
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer>
                      <BarChart data={subjectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} angle={-35} textAnchor="end" interval={0} />
                        <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Média (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Entregas de Labs por Disciplina */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    🔬 Volume de Entregas nos Laboratórios
                  </h4>
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer>
                      <BarChart data={subjectProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={11} angle={-35} textAnchor="end" interval={0} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="entregas" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Entregas" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Student Individual Metrics Table */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
                  👥 Desempenho e Gamificação Individual dos Alunos
                </h4>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Estudante</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Nível & XP</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Moedas 🪙</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Labs Concluídos</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Aproveitamento</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status Pedagógico</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classReport.students.map((st) => (
                        <tr key={st.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {st.studentName}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ color: '#06b6d4', fontWeight: 700 }}>Nv. {st.level}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: '0.4rem' }}>({st.xp} XP)</span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#f59e0b', fontWeight: 600 }}>
                            {st.coins || 0}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {st.completedModulesCount} labs
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <strong style={{ color: st.averageScore >= 80 ? '#10b981' : st.averageScore >= 60 ? '#f59e0b' : '#ef4444' }}>
                              {st.averageScore}%
                            </strong>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700,
                              background: st.status === 'em_destaque' ? 'rgba(16,185,129,0.15)' : st.status === 'precisa_apoio' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                              color: st.status === 'em_destaque' ? '#10b981' : st.status === 'precisa_apoio' ? '#f59e0b' : 'var(--text-muted)',
                              border: `1px solid ${st.status === 'em_destaque' ? 'rgba(16,185,129,0.3)' : st.status === 'precisa_apoio' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`
                            }}>
                              {st.status === 'em_destaque' ? '⭐ Destaque' : st.status === 'precisa_apoio' ? '⚠️ Precisa Apoio' : '✓ Regular'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <BookOpen style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p>Nenhuma turma selecionada para visualização de relatório.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: 72 LABORATÓRIOS VIRTUAIS & DISCIPLINAS ── */}
      {dashboardTab === 'labs_overview' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
              🔬 Catálogo Completo dos 72 Laboratórios Virtuais
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              Visualize a grade dos 6 laboratórios interativos especializados por disciplina disponíveis para os estudantes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {ALL_MODULES.map((module) => (
              <div key={module.id} className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h4 style={{ color: '#06b6d4', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                    {module.label}
                  </h4>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontWeight: 600 }}>
                    6 Labs Práticos
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {module.labs.map((lab, i) => (
                    <div
                      key={lab.id}
                      style={{
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                      }}
                    >
                      <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        {i + 1}. {lab.title}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        modo: {lab.props?.mode || 'padrão'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: MENSAGENS & MATERIAIS DA TURMA ── */}
      {dashboardTab === 'messages' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Dúvidas dos Alunos */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle style={{ width: '1.1rem', height: '1.1rem', color: '#06b6d4' }} />
                Dúvidas Recebidas ({profMessages.filter(m => !m.replied).length} pendentes)
              </h3>
              {profMessages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {profMessages.map(msg => (
                    <div key={msg.id} style={{ padding: '0.85rem', borderRadius: '8px', border: msg.replied ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(245,158,11,0.3)', background: msg.replied ? 'rgba(16,185,129,0.04)' : 'rgba(245,158,11,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{msg.studentName}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.65rem' }}>{msg.message}</div>
                      {msg.replied ? (
                        <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981' }}>
                          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Sua resposta enviada:</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{msg.replyText}</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <input type="text" placeholder="Digite sua orientação pedagógica..."
                            value={replyTexts[msg.id!] || ''}
                            onChange={e => setReplyTexts(prev => ({ ...prev, [msg.id!]: e.target.value }))}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.25)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recompensa de Incentivo 🪙</label>
                            <input type="number" min="0" max="50" value={replyBonusCoins[msg.id!] || 0}
                              onChange={e => setReplyBonusCoins(prev => ({ ...prev, [msg.id!]: parseInt(e.target.value) || 0 }))}
                              style={{ width: '60px', padding: '0.35rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.82rem', textAlign: 'center' }} />
                            <button className="btn-gradient" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', marginLeft: 'auto', fontWeight: 600 }}
                              disabled={!(replyTexts[msg.id!] || '').trim()}
                              onClick={async () => {
                                const reply = (replyTexts[msg.id!] || '').trim();
                                if (!reply || !selectedClassId) return;
                                const coins = replyBonusCoins[msg.id!] || 0;
                                await replyStudentMessage(selectedClassId, msg.id!, reply, coins, coins > 0 ? 50 : 0, msg.studentId);
                                const msgs = await getStudentMessages(selectedClassId);
                                setProfMessages(msgs);
                                setReplyTexts(prev => { const n = { ...prev }; delete n[msg.id!]; return n; });
                                setReplyBonusCoins(prev => { const n = { ...prev }; delete n[msg.id!]; return n; });
                              }}>
                              <Send style={{ width: '0.8rem', height: '0.8rem' }} /> Responder
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma dúvida de aluno recebida no momento.</p>
              )}
            </div>

            {/* Materiais Complementares */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen style={{ width: '1.1rem', height: '1.1rem', color: '#8b5cf6' }} />
                Publicar Material Complementar
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.03)' }}>
                <input type="text" placeholder="Título do material (ex: Resumo de Termodinâmica)" value={newMatTitle} onChange={e => setNewMatTitle(e.target.value)}
                  style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Descrição ou instruções de estudo" value={newMatDesc} onChange={e => setNewMatDesc(e.target.value)}
                  style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Link externo ou PDF (opcional)" value={newMatLink} onChange={e => setNewMatLink(e.target.value)}
                  style={{ padding: '0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                <button className="btn-gradient" style={{ padding: '0.55rem', fontSize: '0.85rem', fontWeight: 600 }}
                  disabled={!newMatTitle.trim()}
                  onClick={async () => {
                    if (!newMatTitle.trim() || !selectedClassId) return;
                    await addComplementaryMaterial(selectedClassId, newMatTitle.trim(), newMatDesc.trim(), newMatLink.trim());
                    setNewMatTitle(''); setNewMatDesc(''); setNewMatLink('');
                    const mats = await getComplementaryMaterials(selectedClassId);
                    setProfMaterials(mats);
                  }}>
                  Publicar Material para a Turma
                </button>
              </div>

              {profMaterials.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {profMaterials.map(mat => (
                    <div key={mat.id} style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.88rem' }}>{mat.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{mat.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum material publicado para esta turma ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONSTRUTOR DE ATIVIDADES ── */}
      {(dashboardTab === 'activityBuilder' || activeTab === 'activityBuilder') && (
        <div className="fade-in" style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '1000px', height: '80vh', display: 'flex', flexDirection: 'column',
            borderRadius: '1rem', background: 'var(--bg-card)', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Builder Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <h2 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 600 }}>
                  Construtor de Experiências & Aulas
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Passo {builderStep} de 3</p>
              </div>
              <button onClick={() => { setActiveTab('classes'); setDashboardTab('classes'); }} style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-main)', cursor: 'pointer',
                width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}>✕</button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Controls Panel */}
              <div style={{ flex: '1 1 55%', padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
                {builderStep === 1 && (
                  <div className="fade-in">
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Selecione o tipo de laboratório</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                      {[
                        { type: 'simulation_physics', title: '🔭 Física Avançada', desc: 'Gravidade, Cinemática e Colisões', config: { gravity: 9.8 } },
                        { type: 'simulation_chemistry', title: '🧪 Laboratório Químico', desc: 'Reações e Titulação', config: { reagents: [] } },
                        { type: 'simulation_biology', title: '🔬 Microscópio Virtual', desc: 'Análise Celular e Genética', config: { microscopeZoom: 10 } },
                        { type: 'simulation_math', title: '📐 Álgebra e Geometria', desc: 'Visualização de Funções e Gráficos', config: { functionType: 'linear', allowGraphing: true } },
                        { type: 'professional_training', title: '💼 Treinamento', desc: 'Soft skills e Liderança Corporativa', config: { skillLevel: 'iniciante' } },
                        { type: 'quiz', title: '📝 Avaliação Adaptativa', desc: 'Questões com Inteligência Artificial', config: { difficulty: 'adaptative' } },
                      ].map(item => (
                        <div
                          key={item.type}
                          onClick={() => setActivityConfig({ ...activityConfig, type: item.type, config: item.config })}
                          style={{
                            padding: '1.25rem', borderRadius: '0.85rem', cursor: 'pointer',
                            border: activityConfig.type === item.type ? '2px solid #06b6d4' : '1px solid var(--border-card)',
                            background: activityConfig.type === item.type ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.02)',
                            transition: 'all 0.2s', transform: activityConfig.type === item.type ? 'translateY(-2px)' : 'none',
                            boxShadow: activityConfig.type === item.type ? '0 10px 20px -10px rgba(6,182,212,0.3)' : 'none'
                          }}
                        >
                          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>{item.title}</h4>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {builderStep === 2 && (
                  <div className="fade-in">
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Parametrização da Experiência</h3>
                    
                    <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Título da Atividade</label>
                      <input type="text" value={activityConfig.title} onChange={e => setActivityConfig({ ...activityConfig, title: e.target.value })} placeholder="Ex: Explorando Leis de Newton" style={{ width: '100%', fontSize: '1rem', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-card)', borderRadius: '0.5rem', color: 'var(--text-main)' }} />
                    </div>

                    {activityConfig.type === 'simulation_physics' && (
                      <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gravidade Simulada (m/s²)</label>
                          <span style={{ color: '#06b6d4', fontWeight: 600 }}>{activityConfig.config.gravity}</span>
                        </div>
                        <input type="range" min="1" max="25" value={activityConfig.config.gravity || 9.8} onChange={e => setActivityConfig({ ...activityConfig, config: { gravity: parseFloat(e.target.value) } })} step="0.1" style={{ width: '100%', accentColor: '#06b6d4' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>Lua (1.6)</span><span>Terra (9.8)</span><span>Júpiter (24.7)</span>
                        </div>
                      </div>
                    )}

                    {activityConfig.type === 'simulation_math' && (
                      <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Categoria da Função</label>
                        <select style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-main)', border: '1px solid var(--border-card)', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }} value={activityConfig.config.functionType} onChange={e => setActivityConfig({ ...activityConfig, config: { ...activityConfig.config, functionType: e.target.value } })}>
                          <option value="linear">Linear (1º Grau)</option>
                          <option value="quadratic">Quadrática (2º Grau)</option>
                          <option value="trigonometric">Trigonométrica</option>
                        </select>
                      </div>
                    )}
                    
                    {['simulation_physics', 'simulation_math'].indexOf(activityConfig.type) === -1 && (
                       <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', textAlign: 'center' }}>
                         Configurações avançadas para este laboratório estão prontas para distribuição. O título e a turma já são suficientes para publicação!
                       </div>
                    )}
                  </div>
                )}

                {builderStep === 3 && (
                  <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', marginBottom: '1.5rem' }}>
                      <BookOpen style={{ width: '2rem', height: '2rem' }} />
                    </div>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.25rem' }}>Tudo Pronto para Publicação!</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                      A atividade <strong style={{ color: 'var(--text-main)' }}>{activityConfig.title || 'Sem título'}</strong> está configurada.
                      Ao publicar, ela será liberada instantaneamente no painel dos estudantes matriculados.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Preview Panel */}
              <div style={{ flex: '1 1 45%', background: 'var(--bg-main)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>Live Preview Visual</h3>
                
                <div style={{ flex: 1, borderRadius: '1rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.25rem 0.75rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {activityConfig.type.replace('_', ' ')}
                  </div>
                  
                  {activityConfig.type === 'simulation_physics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '2px', height: '60px', background: '#06b6d4', borderStyle: 'dashed' }}></div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, #06b6d4 0%, #8b5cf6 100%)', boxShadow: '0 0 20px rgba(6,182,212,0.4)', marginTop: '-2px' }}></div>
                      <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Pêndulo (Grav: {activityConfig.config.gravity || 9.8} m/s²)</p>
                    </div>
                  )}

                  {activityConfig.type === 'simulation_chemistry' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#00bcd4' }}>
                      <span style={{ fontSize: '3rem' }}>🧪</span>
                      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Laboratório Químico</p>
                    </div>
                  )}

                  {activityConfig.type === 'simulation_math' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#7c4dff', width: '100%' }}>
                      <div style={{ width: '100%', height: '80px', borderBottom: '2px solid rgba(255,255,255,0.1)', borderLeft: '2px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0 }}>
                          <path d="M0,100 C30,20 70,80 100,0" fill="none" stroke="#7c4dff" strokeWidth="3" />
                        </svg>
                      </div>
                      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Gráfico: {activityConfig.config.functionType}</p>
                    </div>
                  )}
                  
                  {['simulation_physics', 'simulation_math', 'simulation_chemistry'].indexOf(activityConfig.type) === -1 && (
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                       <span style={{ fontSize: '3rem' }}>✨</span>
                       <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>Atividade Personalizada Pronta.<br/>Os alunos responderão em seus painéis.</p>
                     </div>
                  )}

                  <div style={{ position: 'absolute', bottom: '1.5rem', width: '80%', textAlign: 'center', color: 'var(--text-main)', fontWeight: 600, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activityConfig.title || 'Sem Título Definido'}
                  </div>
                </div>
              </div>
            </div>

            {/* Builder Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
              <button
                onClick={() => setBuilderStep(b => b - 1)}
                disabled={builderStep === 1}
                className="btn-outline-cyan"
                style={{ opacity: builderStep === 1 ? 0.3 : 1, padding: '0.6rem 1.5rem', cursor: builderStep === 1 ? 'not-allowed' : 'pointer' }}
              >
                Passo Anterior
              </button>

              {builderStep < 3 ? (
                <button
                  onClick={() => setBuilderStep(b => b + 1)}
                  disabled={builderStep === 2 && !activityConfig.title.trim()}
                  className="btn-gradient"
                  style={{ padding: '0.6rem 1.75rem', fontWeight: 700 }}
                >
                  Próximo Passo →
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await publishActivity();
                    setActiveTab('classes');
                    setDashboardTab('classes');
                  }}
                  className="btn-gradient"
                  style={{ padding: '0.6rem 1.75rem', background: '#10b981', fontWeight: 700 }}
                >
                  🚀 Publicar Atividade
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE CONFIGURAÇÃO DA CHAVE GEMINI IA ── */}
      {showGeminiModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '1.75rem', background: '#121214', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Key style={{ width: '1.35rem', height: '1.35rem', color: '#06b6d4' }} />
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Configuração da Chave Google Gemini IA
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Insira sua chave de API para habilitar diagnósticos pedagógicos de alta precisão e relatórios analíticos em tempo real.
            </p>
            <input
              type="password"
              placeholder="Cole sua API Key do Google AI Studio (AIzaSy...)"
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem' }}
            />
            {geminiSaved && (
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle style={{ width: '1rem', height: '1rem' }} /> Chave salva com sucesso!
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button onClick={() => setShowGeminiModal(false)} className="btn-outline-cyan" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Fechar
              </button>
              <button onClick={handleSaveGeminiKey} className="btn-gradient" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}>
                Salvar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
