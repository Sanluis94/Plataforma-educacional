import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Beaker, Trophy, BookOpen, Clock, FileText,
  Calendar, Upload, ExternalLink, Play, Bell,
  Award, ShieldCheck, MessageSquare, Copy, Check, Download, Home as HomeIcon
} from 'lucide-react';
import { useStudentDashboard } from '../../core/hooks/useStudentDashboard';
import { ALL_MODULES } from '../../core/constants/dashboardConstants';
import SoundEffects from '../../core/services/soundEffects';
import { StudentLmsModules } from '../components/StudentLmsModules';
import { 
  sendStudentMessage,
  subscribeStudentMessages,
  subscribeClassNotices,
  subscribeEnhancedMaterials,
  type StudentMessage 
} from '../../data/repositories/classRepository';
import {
  subscribeExamsByClass,
  saveExamAttempt,
  getExamAttemptsByStudent
} from '../../data/repositories/examRepository';
import {
  subscribeLessonPlansByClass
} from '../../data/repositories/lessonPlanRepository';
import type {
  ExamData, ExamAttempt, ExamAnswer,
  LessonPlanItem
} from '../../data/types';
import { useAuth } from '../../core/contexts/AuthContext';

function ConfettiCanvas({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const colors = ['#06b6d4', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
    const particles: Particle[] = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height + 10,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 16,
        speedY: -Math.random() * 15 - 10,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    let animId: number;
    let frames = 0;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.28;
        p.speedX *= 0.98;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height + 20) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      frames++;
      if (alive && frames < 180) {
        animId = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [active, onComplete]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}

// Science & Knowledge Area Categorization
const KNOWLEDGE_AREAS = [
  { id: 'nature', label: '🌿 Ciências da Natureza', subjects: ['fisica', 'quimica', 'biologia'] },
  { id: 'exact', label: '📐 Exatas & Tecnologia', subjects: ['matematica', 'hardskills'] },
  { id: 'human', label: '🌍 Ciências Humanas', subjects: ['geografia', 'historia', 'filosofia'] },
  { id: 'languages', label: '📖 Linguagens & Competências', subjects: ['portugues', 'redacao', 'idiomas', 'softskills'] },
];

export function EstudanteDashboard() {
  const { currentUser } = useAuth();
  const studentUid = currentUser?.uid || 'student-demo';
  const studentName = currentUser?.displayName || 'Estudante';

  const {
    progress,
    completedModules,
    activeLab,
    setActiveLab,
    shopItems,
    buyItem,
    achievements,
    studentClasses,
    joinClass,
    handleActivitySubmit,
  } = useStudentDashboard();

  const { level, xp, coins } = progress;

  // Active top-level navigation tab
  const [activeTab, setActiveTab] = useState<
    'labs' | 'exams' | 'lesson_plans' | 'materials' | 'classes' | 'gamification' | 'gradebook' | 'forum' | 'certificates'
  >('labs');

  // Sync tab with query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const validTabs = ['labs', 'exams', 'lesson_plans', 'materials', 'classes', 'gamification', 'gradebook', 'forum', 'certificates'];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, []);

  // Hub de Laboratórios Filter States
  const [selectedArea, setSelectedArea] = useState<string>('nature');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('fisica');

  // Class selection state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Real-time Class Data States
  const [classNotices, setClassNotices] = useState<any[]>([]);
  const [classMaterials, setClassMaterials] = useState<any[]>([]);
  const [classLessonPlans, setClassLessonPlans] = useState<LessonPlanItem[]>([]);
  const [classExams, setClassExams] = useState<ExamData[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<ExamAttempt[]>([]);

  // Class Messages
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  // Confetti State
  const [showConfetti, setShowConfetti] = useState(false);

  // Exam Taking Modal State
  const [activeExam, setActiveExam] = useState<ExamData | null>(null);
  const [examCurrentQIndex, setExamCurrentQIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examTimeRemaining, setExamTimeRemaining] = useState<number | null>(null);
  const [examResult, setExamResult] = useState<ExamAttempt | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [copiedMatId, setCopiedMatId] = useState<string | null>(null);

  // Auto-select first class when available
  useEffect(() => {
    if (!selectedClassId && studentClasses.length > 0) {
      setSelectedClassId(studentClasses[0].id);
    }
  }, [studentClasses, selectedClassId]);

  // Subscribe to real-time class data
  useEffect(() => {
    if (!selectedClassId) return;

    const unsubNotices = subscribeClassNotices(selectedClassId, setClassNotices);
    const unsubMaterials = subscribeEnhancedMaterials(selectedClassId, setClassMaterials);
    const unsubLessonPlans = subscribeLessonPlansByClass(selectedClassId, setClassLessonPlans);
    const unsubExams = subscribeExamsByClass(selectedClassId, setClassExams);
    const unsubMessages = subscribeStudentMessages(selectedClassId, setMessages);

    return () => {
      unsubNotices();
      unsubMaterials();
      unsubLessonPlans();
      unsubExams();
      unsubMessages();
    };
  }, [selectedClassId]);

  // Load student's past exam attempts
  useEffect(() => {
    const fetchAttempts = async () => {
      const atts = await getExamAttemptsByStudent(studentUid);
      setStudentAttempts(atts);
    };
    fetchAttempts();
  }, [studentUid]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeExam || examTimeRemaining === null || examResult) return;
    if (examTimeRemaining <= 0) {
      handleFinishExam();
      return;
    }
    const timer = setInterval(() => {
      setExamTimeRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam, examTimeRemaining, examResult]);

  // Handler to Join Class by Code
  const handleJoinClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    setJoinLoading(true);
    try {
      await joinClass(classCodeInput.trim());
      setClassCodeInput('');
      SoundEffects.playSuccess();
    } catch (err) {
      console.error('Erro ao matricular na turma:', err);
    } finally {
      setJoinLoading(false);
    }
  };

  // Handler to Send Message to Teacher
  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !newMessage.trim()) return;
    setSendingMessage(true);
    try {
      await sendStudentMessage(selectedClassId, studentUid, studentName, newMessage.trim());
      setNewMessage('');
      SoundEffects.playClick();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handler to Start an Exam
  const handleStartExam = (exam: ExamData) => {
    setActiveExam(exam);
    setExamCurrentQIndex(0);
    setExamAnswers({});
    setExamResult(null);
    setExamTimeRemaining(exam.duracaoMinutos ? exam.duracaoMinutos * 60 : null);
    SoundEffects.playClick();
  };

  // Handler to Submit Exam with Automatic Correction
  const handleFinishExam = async () => {
    if (!activeExam || submittingExam) return;
    setSubmittingExam(true);

    let totalScore = 0;
    const maxScore = activeExam.questoes.reduce((sum, q) => sum + (q.valorPeso || 1), 0);
    const answersList: ExamAnswer[] = [];

    activeExam.questoes.forEach((q, idx) => {
      const selectedOption = examAnswers[idx];
      const correctOptionIndex = q.opcoes.findIndex(o => o.isCorreta);
      const isCorrect = selectedOption !== undefined && selectedOption === correctOptionIndex;
      const points = isCorrect ? (q.valorPeso || 1) : 0;
      totalScore += points;

      answersList.push({
        questaoIndex: idx,
        opcaoEscolhidaIndex: selectedOption ?? -1,
        acertou: isCorrect,
        pontosObtidos: points
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const classificacao = percentage >= 85 ? 'Excelente' : percentage >= 70 ? 'Bom' : percentage >= 50 ? 'Regular' : 'Insuficiente';

    const attempt: Omit<ExamAttempt, 'id'> = {
      examId: activeExam.id!,
      examTitle: activeExam.titulo,
      turmaId: activeExam.turmaId || selectedClassId || 'geral',
      alunoId: studentUid,
      alunoNome: studentName,
      pontuacaoObtida: totalScore,
      pontuacaoMaxima: maxScore,
      porcentagemAproveitamento: percentage,
      classificacao,
      respostas: answersList,
      dataEnvio: new Date().toISOString()
    };

    try {
      const saved = await saveExamAttempt(attempt);
      setExamResult(saved);
      setStudentAttempts(prev => [saved, ...prev]);

      // Award XP & Coins for completing formal exam
      await handleActivitySubmit({ id: activeExam.id, title: activeExam.titulo }, percentage);

      setShowConfetti(true);
      SoundEffects.playLevelUp();
    } catch (err) {
      console.error('Erro ao submeter prova:', err);
    } finally {
      setSubmittingExam(false);
    }
  };

  // Filter modules for Hub
  const currentAreaSubjects = KNOWLEDGE_AREAS.find(a => a.id === selectedArea)?.subjects || [];
  const currentSubjectModule = ALL_MODULES.find(m => m.id === selectedSubjectId);

  // Pending exams that student has not yet submitted
  const pendingExams = classExams.filter(
    exam => exam.status === 'Aberta' && !studentAttempts.some(att => att.examId === exam.id)
  );

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '84rem', margin: '0 auto' }}>
      <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Navigation Breadcrumb / Hub Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.6rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.9rem',
            borderRadius: '8px',
            background: 'rgba(6,182,212,0.12)',
            border: '1px solid rgba(6,182,212,0.3)',
            color: '#06b6d4',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          className="hover:scale-102"
        >
          <HomeIcon style={{ width: '1rem', height: '1rem' }} />
          ← Voltar ao Hub Inicial
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Acesso rápido:</span>
          <Link to="/simulacao" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            🔬 Catálogo de 72 Labs
          </Link>
          <span>•</span>
          <Link to="/enem" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            📝 Simulado ENEM TRI
          </Link>
        </div>
      </div>

      {/* Header with Student Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🎓</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              Portal do Estudante
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem' }}>
            Hub de Laboratórios Virtuais, Provas Formais, Cronograma de Aulas e Materiais Didáticos.
          </p>
        </div>

        {/* Gamification Stats Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>NÍVEL {level}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#06b6d4' }}>{xp} XP</div>
          </div>
          <div style={{ width: '1px', height: '2rem', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>MOEDAS</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f59e0b' }}>🪙 {coins}</div>
          </div>
        </div>
      </div>

      {/* Reorganized Student Navigation Bar with Dynamic Badges */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { id: 'labs', label: '🔬 Laboratórios de Ciências', icon: Beaker },
          {
            id: 'exams',
            label: '📝 Provas & Avaliações',
            icon: FileText,
            count: classExams.length,
            badge: pendingExams.length > 0 ? `${pendingExams.length} pendente${pendingExams.length > 1 ? 's' : ''}` : undefined,
            badgeColor: '#f59e0b'
          },
          { id: 'gradebook', label: '📊 Boletim & Frequência', icon: Award },
          { id: 'forum', label: `💬 Fórum da Turma`, icon: MessageSquare },
          { id: 'certificates', label: '📜 Meus Certificados', icon: ShieldCheck },
          { id: 'lesson_plans', label: `📅 Plano de Aulas (${classLessonPlans.length})`, icon: Calendar },
          { id: 'materials', label: `📁 Materiais & Downloads (${classMaterials.length})`, icon: Upload },
          { id: 'classes', label: `🏫 Minha Turma & Avisos (${classNotices.length})`, icon: BookOpen },
          { id: 'gamification', label: '🏆 Conquistas & Loja', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setActiveLab(null);
            }}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
              background: activeTab === tab.id ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: activeTab === tab.id ? '#06b6d4' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 700 : 500,
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
            {tab.label} {tab.count !== undefined && !tab.badge && `(${tab.count})`}
            {tab.badge && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  background: 'rgba(245,158,11,0.2)',
                  color: '#fbbf24',
                  fontWeight: 700,
                  border: '1px solid rgba(245,158,11,0.3)',
                }}
              >
                ● {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB 1: HUB DE LABORATÓRIOS VIRTUAIS (CIÊNCIAS & EXATAS) ── */}
      {activeTab === 'labs' && !activeLab && (
        <div className="fade-in">
          {/* Areas Filter Banner */}
          <div className="glass-card mb-4" style={{ padding: '1.25rem', background: 'rgba(6,182,212,0.03)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Selecione a Grande Área do Conhecimento:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {KNOWLEDGE_AREAS.map(area => (
                <button
                  key={area.id}
                  onClick={() => {
                    setSelectedArea(area.id);
                    setSelectedSubjectId(area.subjects[0]);
                  }}
                  style={{
                    padding: '0.6rem 1.15rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: selectedArea === area.id ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedArea === area.id ? 'rgba(6,182,212,0.2)' : 'rgba(0,0,0,0.3)',
                    color: selectedArea === area.id ? '#06b6d4' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {area.label}
                </button>
              ))}
            </div>

            {/* Sub-selector for Subjects within Selected Area */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Disciplina:</span>
              {currentAreaSubjects.map(subjId => {
                const mod = ALL_MODULES.find(m => m.id === subjId);
                if (!mod) return null;
                const isSelected = selectedSubjectId === subjId;
                return (
                  <button
                    key={subjId}
                    onClick={() => setSelectedSubjectId(subjId)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: isSelected ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(139,92,246,0.2)' : 'rgba(0,0,0,0.2)',
                      color: isSelected ? '#a78bfa' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {mod.label} (6 Labs)
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6 Specialized Labs Grid for Selected Subject */}
          {currentSubjectModule && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Laboratórios de {currentSubjectModule.label} (Simuladores com Parâmetros Interativos)
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  6 experiências interativas dedicadas
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {currentSubjectModule.labs.map((lab, index) => {
                  const isCompleted = completedModules.includes(lab.id);
                  return (
                    <div
                      key={lab.id}
                      className="glass-card"
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        background: isCompleted ? 'rgba(16,185,129,0.02)' : 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 800 }}>LAB #{index + 1}</span>
                          {isCompleted ? (
                            <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                              ✓ Concluído
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                              Disponível
                            </span>
                          )}
                        </div>

                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                          {lab.title}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.4 }}>
                          Simulação dinâmica com controle de variáveis, visualizações científicas e validação imediata de conceitos.
                        </p>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '1.25rem' }}>
                          Parâmetros: mode="{lab.props?.mode || 'padrão'}"
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveLab({
                            id: lab.id,
                            title: lab.title,
                            component: lab.component,
                            props: lab.props,
                          });
                          SoundEffects.playClick();
                        }}
                        className="btn-gradient"
                        style={{ width: '100%', padding: '0.65rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        <Play style={{ width: '0.9rem', height: '0.9rem' }} /> Iniciar Laboratório Virtual
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── INTERACTIVE LAB RUNNER VIEW ── */}
      {activeTab === 'labs' && activeLab && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setActiveLab(null)}
              className="btn-outline-cyan"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              ← Voltar aos Laboratórios
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Laboratório Ativo: <strong style={{ color: '#06b6d4' }}>{activeLab.title}</strong>
            </span>
          </div>

          <div className="glass-card" style={{ padding: '1rem', minHeight: '520px' }}>
            <activeLab.component
              {...activeLab.props}
              labTitle={activeLab.title}
              labId={activeLab.id}
              onComplete={async (score: number) => {
                await handleActivitySubmit({ id: activeLab.id, title: activeLab.title }, score);
                setShowConfetti(true);
                SoundEffects.playSuccess();
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 2: PROVAS & AVALIAÇÕES FORMAIS (ESTILO EDU-INTERACT-V2) ── */}
      {activeTab === 'exams' && !activeExam && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.35rem' }}>
                📝 Provas & Avaliações da Turma
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Exames com contagem regressiva, questões com gabarito comentado e correção automática instantânea.
              </p>
            </div>
          </div>

          {/* Active Exams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {classExams.map(exam => {
              const attempt = studentAttempts.find(a => a.examId === exam.id);
              return (
                <div key={exam.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                        {exam.disciplina}
                      </span>
                      {attempt ? (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontWeight: 700 }}>
                          ✓ Concluída ({attempt.porcentagemAproveitamento}%)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontWeight: 700 }}>
                          Pendente
                        </span>
                      )}
                    </div>

                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                      {exam.titulo}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.4 }}>
                      {exam.descricao || 'Avaliação formal com questões objetivas.'}
                    </p>

                    <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock style={{ width: '0.85rem', height: '0.85rem', color: '#06b6d4' }} />
                        <span>Duração: <strong>{exam.duracaoMinutos ? `${exam.duracaoMinutos} min` : 'Sem limite'}</strong></span>
                      </div>
                      <div>Questões: <strong style={{ color: '#f59e0b' }}>{exam.questoes.length} (Peso Total: {exam.pesoTotal} pts)</strong></div>
                    </div>
                  </div>

                  {attempt ? (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>PROVA REALIZADA</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                        Nota: {attempt.pontuacaoObtida} / {attempt.pontuacaoMaxima} pts ({attempt.classificacao})
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Entregue em: {new Date(attempt.dataEnvio).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartExam(exam)}
                      className="btn-gradient"
                      style={{ width: '100%', padding: '0.65rem', fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                    >
                      Realizar Prova 📝
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {classExams.length === 0 && (
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>Nenhuma prova formal agendada para sua turma no momento.</p>
            </div>
          )}
        </div>
      )}

      {/* ── EXAM TAKING MODAL / RUNNER VIEW ── */}
      {activeExam && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem', maxWidth: '48rem', margin: '0 auto' }}>
          {/* Exam Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                {activeExam.disciplina}
              </span>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0' }}>
                {activeExam.titulo}
              </h3>
            </div>

            {/* Timer if duration set */}
            {examTimeRemaining !== null && !examResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: examTimeRemaining < 300 ? 'rgba(239,68,68,0.15)' : 'rgba(6,182,212,0.15)', border: `1px solid ${examTimeRemaining < 300 ? '#ef4444' : '#06b6d4'}` }}>
                <Clock style={{ width: '1rem', height: '1rem', color: examTimeRemaining < 300 ? '#ef4444' : '#06b6d4' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: examTimeRemaining < 300 ? '#ef4444' : '#06b6d4', fontFamily: 'monospace' }}>
                  {Math.floor(examTimeRemaining / 60)}:{(examTimeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>

          {/* ACTIVE EXAM RUNNING: QUESTION BY QUESTION */}
          {!examResult ? (
            <div>
              {/* Question Navigation Bubbles */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                {activeExam.questoes.map((_, idx) => {
                  const isAnswered = examAnswers[idx] !== undefined;
                  const isCurrent = examCurrentQIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setExamCurrentQIndex(idx)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: isCurrent ? '2px solid #06b6d4' : isAnswered ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                        background: isCurrent ? 'rgba(6,182,212,0.25)' : isAnswered ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0.3)',
                        color: isCurrent ? '#06b6d4' : isAnswered ? '#10b981' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question Body */}
              {activeExam.questoes[examCurrentQIndex] && (
                <div style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 800 }}>
                      Questão {examCurrentQIndex + 1} de {activeExam.questoes.length}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 600 }}>
                      Peso: {activeExam.questoes[examCurrentQIndex].valorPeso} pts
                    </span>
                  </div>

                  <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {activeExam.questoes[examCurrentQIndex].enunciado}
                  </h4>

                  {/* Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeExam.questoes[examCurrentQIndex].opcoes.map((opt, oIdx) => {
                      const isSelected = examAnswers[examCurrentQIndex] === oIdx;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => setExamAnswers(prev => ({ ...prev, [examCurrentQIndex]: oIdx }))}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '8px',
                            border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                            background: isSelected ? 'rgba(6,182,212,0.15)' : 'rgba(0,0,0,0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.15s'
                          }}
                        >
                          <input
                            type="radio"
                            name={`exam_runner_q_${examCurrentQIndex}`}
                            checked={isSelected}
                            onChange={() => {}}
                            style={{ accentColor: '#06b6d4', cursor: 'pointer' }}
                          />
                          <span style={{ color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400 }}>
                            {opt.texto}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation and Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => setExamCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={examCurrentQIndex === 0}
                  className="btn-outline-cyan"
                  style={{ padding: '0.55rem 1.25rem', opacity: examCurrentQIndex === 0 ? 0.4 : 1 }}
                >
                  ← Questão Anterior
                </button>

                {examCurrentQIndex < activeExam.questoes.length - 1 ? (
                  <button
                    onClick={() => setExamCurrentQIndex(prev => prev + 1)}
                    className="btn-outline-cyan"
                    style={{ padding: '0.55rem 1.25rem' }}
                  >
                    Próxima Questão →
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExam}
                    disabled={submittingExam}
                    className="btn-gradient"
                    style={{ padding: '0.65rem 1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                  >
                    {submittingExam ? 'Entregando...' : '✓ Finalizar & Entregar Prova'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* EXAM RESULT VIEW: INSTANT SCORE + GABARITO COMENTADO */
            <div className="fade-in">
              <div style={{ textAlign: 'center', padding: '1.5rem 0 2rem' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: 800, margin: '0.5rem 0' }}>
                  Prova Concluída com Sucesso!
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: examResult.porcentagemAproveitamento >= 70 ? '#10b981' : '#f59e0b', margin: '0.5rem 0' }}>
                  {examResult.porcentagemAproveitamento}%
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  Pontuação: <strong>{examResult.pontuacaoObtida} / {examResult.pontuacaoMaxima} pontos</strong> ({examResult.classificacao})
                </div>
              </div>

              {/* Gabarito Comentado com Justificativas Pedagógicas */}
              <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                📖 Gabarito Comentado da Avaliação
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {activeExam.questoes.map((q, idx) => {
                  const userAns = examResult.respostas.find(r => r.questaoIndex === idx);
                  const isCorrect = userAns?.acertou;
                  return (
                    <div key={idx} style={{ padding: '1rem', borderRadius: '8px', background: isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCorrect ? '#10b981' : '#ef4444' }}>
                          Questão #{idx + 1} — {isCorrect ? '✓ Acertou (+ ' + q.valorPeso + ' pts)' : '✗ Errou (0 pts)'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {q.enunciado}
                      </div>
                      <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(0,0,0,0.25)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <strong style={{ color: '#06b6d4', display: 'block', marginBottom: '0.2rem' }}>Justificativa Pedagógica:</strong>
                        {q.justificativa}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setActiveExam(null)}
                  className="btn-gradient"
                  style={{ padding: '0.65rem 2rem', fontWeight: 700 }}
                >
                  Voltar às Provas
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: PLANO DE AULAS DA TURMA ── */}
      {activeTab === 'lesson_plans' && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            📅 Cronograma & Plano de Aulas da Turma
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Acompanhe a sequência didática planejada pelo professor para cada bimestre letivo.
          </p>

          {classLessonPlans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {classLessonPlans.map((plan, idx) => (
                <div key={plan.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '0.45rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 700, display: 'block' }}>AULA</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>#{idx + 1}</strong>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700 }}>{plan.periodo}</span>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{plan.topico}</h4>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                      {plan.metodologia}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {plan.competenciasBNCC && <span>🎯 {plan.competenciasBNCC}</span>}
                      {plan.dataPrevista && <span>🗓️ {plan.dataPrevista}</span>}
                    </div>
                  </div>

                  <div>
                    {plan.laboratorioAssociadoId && (
                      <button
                        onClick={() => {
                          const lab = (ALL_MODULES as any[]).flatMap((m: any) => m.labs).find((l: any) => l.id === plan.laboratorioAssociadoId);
                          if (lab) {
                            setActiveLab({
                              id: lab.id,
                              title: lab.title,
                              component: lab.component,
                              props: lab.props,
                            });
                            setActiveTab('labs');
                          }
                        }}
                        className="btn-outline-cyan"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                      >
                        🔬 Abrir Lab da Aula
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Nenhum plano de aula disponibilizado pelo professor para esta turma ainda.
            </p>
          )}
        </div>
      )}

      {/* ── TAB 4: MATERIAIS DE APOIO & DOWNLOADS ── */}
      {activeTab === 'materials' && (
        <div className="fade-in glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            📁 Materiais Didáticos & Downloads
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Acesse apostilas, PDFs, links de estudo recomendados e resumos postados pelo professor.
          </p>

          {classMaterials.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {classMaterials.map(mat => (
                <div key={mat.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700 }}>
                        {mat.periodo || '1º Bimestre'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                        {mat.tipo}
                      </span>
                    </div>

                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{mat.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                      {mat.description}
                    </p>
                    {/* Polymorphic Content Display */}
                    {mat.tipo === 'texto' && mat.linkOuConteudo && (
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(139,92,246,0.2)',
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        marginBottom: '0.75rem',
                        lineHeight: 1.5
                      }}>
                        {mat.linkOuConteudo}
                      </div>
                    )}

                    {mat.nomeArquivo && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        📎 {mat.nomeArquivo} ({mat.tamanhoFormatado || ''})
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {mat.tipo === 'texto' ? (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(mat.linkOuConteudo);
                          setCopiedMatId(mat.id);
                          setTimeout(() => setCopiedMatId(prev => prev === mat.id ? null : prev), 2000);
                        }}
                        className="btn-outline-cyan"
                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        {copiedMatId === mat.id ? (
                          <>
                            <Check style={{ width: '0.85rem', height: '0.85rem', color: '#10b981' }} /> Texto Copiado!
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: '0.85rem', height: '0.85rem' }} /> Copiar Conteúdo
                          </>
                        )}
                      </button>
                    ) : mat.tipo === 'link' ? (
                      <a
                        href={mat.linkOuConteudo.startsWith('http') ? mat.linkOuConteudo : `https://${mat.linkOuConteudo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline-cyan"
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxSizing: 'border-box' }}
                      >
                        <ExternalLink style={{ width: '0.85rem', height: '0.85rem' }} /> Acessar Link Externo
                      </a>
                    ) : (
                      <a
                        href={mat.linkOuConteudo}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={mat.nomeArquivo || 'material_didatico'}
                        className="btn-gradient"
                        style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxSizing: 'border-box' }}
                      >
                        <Download style={{ width: '0.85rem', height: '0.85rem' }} /> Baixar Arquivo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Nenhum material didático publicado para esta turma até o momento.
            </p>
          )}
        </div>
      )}

      {/* ── TAB 5: MINHA TURMA & AVISOS (MURAL) ── */}
      {activeTab === 'classes' && (
        <div className="fade-in">
          {/* Join New Class Form */}
          <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              ➕ Matricular-se em uma Nova Turma
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '1rem' }}>
              Insira o <strong>código de 6 dígitos</strong> fornecido pelo seu professor (ex: <code>K7M9P2</code>) para acessar os avisos, materiais e provas da turma.
            </p>
            <form onSubmit={handleJoinClassSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Código de 6 dígitos (ex: K7M9P2)..."
                value={classCodeInput}
                maxLength={25}
                onChange={e => setClassCodeInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  fontFamily: 'monospace',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              />
              <button
                type="submit"
                disabled={joinLoading || !classCodeInput.trim()}
                className="btn-gradient"
                style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
              >
                {joinLoading ? 'Matriculando...' : 'Entrar na Turma'}
              </button>
            </form>
          </div>

          {/* Lista de Turmas Matriculadas */}
          {studentClasses.length > 0 && (
            <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                🏫 Suas Turmas Matriculadas ({studentClasses.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {studentClasses.map(turma => {
                  const isSelected = selectedClassId === turma.id;
                  const shortCode = turma.code || turma.id.slice(0, 6).toUpperCase();
                  return (
                    <div
                      key={turma.id}
                      onClick={() => setSelectedClassId(turma.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
                        border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: isSelected ? '#06b6d4' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isSelected ? '● Turma Ativa' : 'Clique para Selecionar'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#06b6d4',
                          background: 'rgba(6,182,212,0.12)',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px'
                        }}>
                          {shortCode}
                        </span>
                      </div>
                      <h4 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', margin: '0 0 0.25rem' }}>
                        {turma.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Professor: <strong>{turma.professorName || 'Docente'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mural de Avisos da Turma */}
          <div className="glass-card mb-4" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bell style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                Mural de Avisos Oficiais da Turma
              </h3>
            </div>

            {classNotices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {classNotices.map(notice => (
                  <div key={notice.id} style={{ padding: '1.1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>{notice.titulo}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {notice.criadoEm ? new Date(notice.criadoEm).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                      {notice.texto}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Nenhum comunicado publicado pelo professor no momento.
              </p>
            )}
          </div>

          {/* Dúvidas e Mensagens ao Professor */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
              💬 Enviar Dúvida ao Professor
            </h3>
            <form onSubmit={handleSendMessageSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Pergunte ao professor sobre exercícios, prazos ou conceitos de aula..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="btn-gradient"
                style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}
              >
                {sendingMessage ? 'Enviando...' : 'Enviar Dúvida'}
              </button>
            </form>

            {/* Past Messages List */}
            {messages.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: 'var(--text-main)', fontSize: '0.88rem', marginBottom: '0.4rem' }}>{msg.message}</div>
                    {msg.replied ? (
                      <div style={{ padding: '0.6rem', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', borderLeft: '3px solid #10b981' }}>
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>Resposta do Professor:</span>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>{msg.replyText}</p>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Aguardando resposta do professor...</span>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── TAB 6: GAMIFICAÇÃO, CONQUISTAS & LOJA ── */}
      {activeTab === 'gamification' && (
        <div className="fade-in">
          {/* Shop Section */}
          <div className="glass-card mb-4" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              🛍️ Loja de Customização do Perfil
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Use suas moedas virtuais conquistadas em simuladores e avaliações para desbloquear itens!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {shopItems.map(item => (
                <div key={item.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: item.owned ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: '0 0 0.25rem' }}>{item.name}</h4>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>🪙 {item.price}</span>
                    <button
                      onClick={() => buyItem(item.id)}
                      disabled={item.owned || coins < item.price}
                      className="btn-gradient"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', opacity: item.owned ? 0.6 : (coins < item.price ? 0.5 : 1) }}
                    >
                      {item.owned ? 'Adquirido' : 'Adquirir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              🏆 Conquistas & Medalhas Acadêmicas
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Desbloqueie conquistas ao explorar os laboratórios e obter excelência nas provas.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {achievements.map(ach => (
                <div key={ach.id} style={{ padding: '1.25rem', borderRadius: '10px', background: ach.unlocked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', border: ach.unlocked ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '2.25rem', opacity: ach.unlocked ? 1 : 0.4 }}>{ach.icon}</div>
                  <div>
                    <div style={{ color: ach.unlocked ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.95rem' }}>{ach.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{ach.description}</div>
                    {ach.unlocked && <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 700 }}>✓ Conquistada</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB LMS: BOLETIM ESCOLAR, FÓRUM & CERTIFICADOS DIGITAIS ── */}
      {(activeTab === 'gradebook' || activeTab === 'forum' || activeTab === 'certificates') && (
        <StudentLmsModules
          studentId={studentUid}
          studentName={studentName}
          selectedClassId={selectedClassId}
          activeView={activeTab as 'gradebook' | 'forum' | 'certificates'}
          onViewChange={(view) => setActiveTab(view)}
        />
      )}
    </div>
  );
}
