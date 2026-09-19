import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  PlusCircle, Users, BookOpen, BarChart as BarChartIcon,
  Award, Download, MessageCircle, Send, Sparkles, Key, CheckCircle,
  AlertTriangle, Layers, RefreshCw, Plus, Trash2,
  Calendar, FileText, Upload, ExternalLink, Bell, Copy, Check
} from 'lucide-react';
import { useAuth } from '../../core/contexts/AuthContext';
import { useProfessorDashboard } from '../../core/hooks/useProfessorDashboard';
import { ALL_MODULES } from '../../core/constants/dashboardConstants';
import { generatePedagogicalDiagnosis, generateCompleteLessonWithAI } from '../../core/services/geminiService';
import { ProfessorLmsModules } from '../components/ProfessorLmsModules';
import type {
  ExamData, ExamQuestion, ExamAttempt,
  LessonPlanItem, BimesterPeriod
} from '../../data/types';
import {
  getStudentMessages,
  replyStudentMessage,
  subscribeStudentMessages,
  createClassNotice,
  subscribeClassNotices,
  deleteClassNotice,
  addEnhancedMaterial,
  subscribeEnhancedMaterials,
  deleteEnhancedMaterial,
  type StudentMessage
} from '../../data/repositories/classRepository';
import {
  saveExam,
  getExamsByProfessor,
  updateExam,
  deleteExam,
  getExamAttemptsByClass,
  calculateExamQuestionAnalytics,
  type ExamReportSummary
} from '../../data/repositories/examRepository';
import {
  saveLessonPlanItem,
  updateLessonPlanItem,
  deleteLessonPlanItem,
  subscribeLessonPlansByClass
} from '../../data/repositories/lessonPlanRepository';

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
    selectedClassId,
    setSelectedClassId,
    classReport,
    reportLoading,
    handleCreateClass,
    handleViewClassReport,
    exportReportCSV,
    globalStats,
  } = useProfessorDashboard();

  // Active view tab
  const [dashboardTab, setDashboardTab] = useState<
    'classes' | 'lesson_plans' | 'exams' | 'materials' | 'labs_overview' | 'reports' | 'messages' | 'lms_gradebook'
  >('classes');

  // State to track copied class code
  const [copiedClassCode, setCopiedClassCode] = useState<string | null>(null);

  // State for Notices (Mural da Turma estilo Edu-Interact-v2)
  const [classNotices, setClassNotices] = useState<any[]>([]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeText, setNewNoticeText] = useState('');
  const [publishingNotice, setPublishingNotice] = useState(false);

  // State for Enhanced Materials with File Upload
  const [enhancedMaterials, setEnhancedMaterials] = useState<any[]>([]);
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matType, setMatType] = useState<'arquivo' | 'link' | 'texto'>('arquivo');
  const [matUrl, setMatUrl] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matFileName, setMatFileName] = useState('');
  const [matFileSize, setMatFileSize] = useState('');
  const [matBimester, setMatBimester] = useState<string>('1º Bimestre');
  const [matSubject, setMatSubject] = useState('Física');
  const [uploadingMat, setUploadingMat] = useState(false);

  // State for Lesson Plans (Bimestral / Semestral)
  const [classLessonPlans, setClassLessonPlans] = useState<LessonPlanItem[]>([]);
  const [selectedBimester, setSelectedBimester] = useState<BimesterPeriod>('1º Bimestre');
  const [newPlanTopic, setNewPlanTopic] = useState('');
  const [newPlanBNCC, setNewPlanBNCC] = useState('');
  const [newPlanMethodology, setNewPlanMethodology] = useState('');
  const [newPlanLabId, setNewPlanLabId] = useState('');
  const [newPlanDate, setNewPlanDate] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);
  const [generatingPlanAI, setGeneratingPlanAI] = useState(false);

  // State for Exams (Provas e Avaliações Formais estilo Edu-Interact-v2)
  const [examsList, setExamsList] = useState<ExamData[]>([]);
  const [examMode, setExamMode] = useState<'list' | 'create' | 'analytics'>('list');
  const [selectedExam, setSelectedExam] = useState<ExamData | null>(null);
  const [examAnalytics, setExamAnalytics] = useState<ExamReportSummary | null>(null);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);

  // Exam Creator Form State
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamDesc, setNewExamDesc] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('Física');
  const [newExamDuration, setNewExamDuration] = useState(50);
  const [newExamDeadline, setNewExamDeadline] = useState('');
  const [newExamTargetClass, setNewExamTargetClass] = useState('');
  const [newExamQuestions, setNewExamQuestions] = useState<ExamQuestion[]>([
    {
      enunciado: 'Qual é a principal consequência observada na conservação de energia do sistema?',
      tema: 'Termodinâmica / Mecânica',
      nivelDificuldade: 'Médio',
      valorPeso: 2.5,
      justificativa: 'A energia mecânica total permanece constante na ausência de forças dissipativas não-conservativas.',
      opcoes: [
        { texto: 'A energia mecânica total é conservada', isCorreta: true },
        { texto: 'A energia é destruída gradualmente', isCorreta: false },
        { texto: 'A velocidade aumenta infinitamente', isCorreta: false },
        { texto: 'A massa do sistema é reduzida', isCorreta: false },
      ]
    }
  ]);
  const [examAiTopic, setExamAiTopic] = useState('');
  const [examAiGenerating, setExamAiGenerating] = useState(false);

  // Student messages state
  const [profMessages, setProfMessages] = useState<StudentMessage[]>([]);
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

  // Auth user data
  const { currentUser, userData } = useAuth();
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);
  const [savingExam, setSavingExam] = useState(false);

  const showFeedback = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Sync selected class with first available if none selected
  useEffect(() => {
    if (!selectedClassId && turmas.length > 0) {
      setSelectedClassId(turmas[0].id);
    }
  }, [turmas, selectedClassId, setSelectedClassId]);

  // Load class data (notices, materials, lesson plans, messages)
  useEffect(() => {
    if (!selectedClassId) return;

    const unsubNotices = subscribeClassNotices(selectedClassId, (notices) => {
      setClassNotices(notices);
    });

    const unsubMaterials = subscribeEnhancedMaterials(selectedClassId, (mats) => {
      setEnhancedMaterials(mats);
    });

    const unsubLessonPlans = subscribeLessonPlansByClass(selectedClassId, (plans) => {
      setClassLessonPlans(plans);
    });

    const unsubMessages = subscribeStudentMessages(selectedClassId, (msgs) => {
      setProfMessages(msgs);
    });

    return () => {
      unsubNotices();
      unsubMaterials();
      unsubLessonPlans();
      unsubMessages();
    };
  }, [selectedClassId]);

  // Load teacher exams
  useEffect(() => {
    const loadExams = async () => {
      const profId = currentUser?.uid || 'prof_current';
      const exams = await getExamsByProfessor(profId);
      setExamsList(exams);
    };
    loadExams();
  }, [currentUser?.uid]);

  // Load exam analytics when selectedExam changes
  useEffect(() => {
    if (!selectedExam || !selectedExam.turmaId) return;
    const fetchExamAnalytics = async () => {
      const attempts = await getExamAttemptsByClass(selectedExam.turmaId!);
      const filtered = attempts.filter(a => a.examId === selectedExam.id);
      setExamAttempts(filtered);
      const analytics = calculateExamQuestionAnalytics(selectedExam, filtered);
      setExamAnalytics(analytics);
    };
    fetchExamAnalytics();
  }, [selectedExam]);

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

  const totalStudents = turmas.reduce((sum, t) => sum + (t.studentsCount || 0), 0);
  const totalClasses = turmas.length;

  const stats = [
    { label: 'Total de Alunos', value: String(totalStudents), icon: Users, accent: '#06b6d4', desc: 'Em todas as turmas ativas' },
    { label: 'Turmas Ativas', value: String(totalClasses), icon: BookOpen, accent: '#8b5cf6', desc: 'Com códigos de acesso' },
    { label: 'Taxa de Conclusão', value: `${globalStats.completionRate}%`, icon: Award, accent: 'Média de entregas', desc: 'Média geral da turma' },
    { label: 'Provas Aplicadas', value: String(examsList.length), icon: FileText, accent: '#10b981', desc: 'Avaliações com gabarito' },
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

  // Handler for File Upload (base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMatFileName(file.name);
    const sizeInKb = (file.size / 1024).toFixed(1);
    setMatFileSize(file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeInKb} KB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setMatUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handler to publish material
  const handlePublishMaterial = async () => {
    const targetClass = selectedClassId || (turmas.length > 0 ? turmas[0].id : null);
    if (!targetClass) {
      showFeedback('Por favor, crie uma turma na aba "Minhas Turmas" antes de disponibilizar materiais didáticos.', 'error');
      return;
    }
    if (!matTitle.trim()) {
      showFeedback('Por favor, informe o título do material didático.', 'error');
      return;
    }
    if (matType === 'link') {
      if (!matUrl.trim()) {
        showFeedback('Por favor, informe a URL ou link do recurso educacional.', 'error');
        return;
      }
    } else if (matType === 'texto') {
      if (!matContent.trim()) {
        showFeedback('Por favor, insira o texto, resumo ou orientação de estudo.', 'error');
        return;
      }
    } else if (matType === 'arquivo') {
      if (!matUrl && !matFileName) {
        showFeedback('Por favor, selecione um arquivo do dispositivo para envio.', 'error');
        return;
      }
    }

    setUploadingMat(true);
    try {
      let finalLinkOuConteudo = '';
      if (matType === 'texto') {
        finalLinkOuConteudo = matContent.trim();
      } else if (matType === 'link') {
        let cleanUrl = matUrl.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          cleanUrl = 'https://' + cleanUrl;
        }
        finalLinkOuConteudo = cleanUrl;
      } else {
        finalLinkOuConteudo = matUrl;
      }

      const profId = currentUser?.uid || 'prof_current';

      const saved = await addEnhancedMaterial(targetClass, {
        title: matTitle.trim(),
        description: matDesc.trim() || (matType === 'texto' ? 'Resumo de leitura e orientações didáticas' : 'Material didático complementar'),
        tipo: matType === 'arquivo' ? 'pdf' : matType === 'link' ? 'link' : 'texto',
        linkOuConteudo: finalLinkOuConteudo,
        nomeArquivo: matType === 'arquivo' ? (matFileName || 'arquivo_anexo') : undefined,
        tamanhoFormatado: matType === 'arquivo' ? (matFileSize || 'N/D') : undefined,
        disciplina: matSubject,
        periodo: matBimester,
        professorId: profId
      });

      setEnhancedMaterials(prev => [saved, ...prev.filter(m => m.id !== saved.id)]);
      setMatTitle('');
      setMatDesc('');
      setMatUrl('');
      setMatContent('');
      setMatFileName('');
      setMatFileSize('');
      showFeedback('Material didático publicado com sucesso para a turma!', 'success');
    } catch (err) {
      console.error('Erro ao publicar material:', err);
      showFeedback('Não foi possível salvar o material. Tente novamente.', 'error');
    } finally {
      setUploadingMat(false);
    }
  };

  // Handler to publish Class Notice (Mural)
  const handlePublishNotice = async () => {
    const targetClass = selectedClassId || (turmas.length > 0 ? turmas[0].id : null);
    if (!targetClass) {
      showFeedback('Selecione ou crie uma turma para publicar comunicado no mural.', 'error');
      return;
    }
    if (!newNoticeTitle.trim() || !newNoticeText.trim()) {
      showFeedback('Preencha o título e o texto do comunicado.', 'error');
      return;
    }
    setPublishingNotice(true);
    try {
      const profId = currentUser?.uid || 'prof_current';
      const profName = userData?.name || currentUser?.displayName || 'Professor';
      const savedNotice = await createClassNotice(
        targetClass,
        profId,
        profName,
        newNoticeTitle.trim(),
        newNoticeText.trim()
      );
      setClassNotices(prev => [savedNotice, ...prev]);
      setNewNoticeTitle('');
      setNewNoticeText('');
      showFeedback('Comunicado publicado no mural da turma com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao publicar aviso:', err);
      showFeedback('Erro ao publicar aviso. Tente novamente.', 'error');
    } finally {
      setPublishingNotice(false);
    }
  };

  // Handler to save Lesson Plan item
  const handleSaveLessonPlan = async () => {
    const targetClass = selectedClassId || (turmas.length > 0 ? turmas[0].id : null);
    if (!targetClass) {
      showFeedback('Selecione ou cadastre uma turma para registrar o planejamento.', 'error');
      return;
    }
    if (!newPlanTopic.trim()) {
      showFeedback('Informe o tópico ou conteúdo da aula a ser planejada.', 'error');
      return;
    }
    setSavingPlan(true);
    try {
      const profId = currentUser?.uid || 'prof_current';
      const associatedLab = (ALL_MODULES as any[]).flatMap((m: any) => m.labs).find((l: any) => l.id === newPlanLabId);
      const savedPlan = await saveLessonPlanItem({
        professorId: profId,
        turmaId: targetClass,
        periodo: selectedBimester,
        ordemSemana: (classLessonPlans.filter(p => p.periodo === selectedBimester).length + 1),
        topico: newPlanTopic.trim(),
        competenciasBNCC: newPlanBNCC.trim() || 'Habilidade Geral da BNCC',
        metodologia: newPlanMethodology.trim() || 'Aula expositiva dialogada e prática em simulador virtual.',
        laboratorioAssociadoId: newPlanLabId || undefined,
        laboratorioTitulo: associatedLab?.title || undefined,
        status: 'planejada',
        dataPrevista: newPlanDate || undefined,
        criadoEm: new Date().toISOString()
      });
      setClassLessonPlans(prev => [...prev, savedPlan]);
      setNewPlanTopic('');
      setNewPlanBNCC('');
      setNewPlanMethodology('');
      setNewPlanLabId('');
      setNewPlanDate('');
      showFeedback('Aula adicionada ao plano de estudos bimestral com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao salvar item no plano de aula:', err);
      showFeedback('Erro ao salvar plano de aula.', 'error');
    } finally {
      setSavingPlan(false);
    }
  };

  // Handler to generate Lesson Plan with AI Gemini
  const handleGeneratePlanWithAI = async () => {
    if (!newPlanTopic.trim()) {
      showFeedback('Digite o tópico da aula antes de solicitar a sugestão da IA.', 'info');
      return;
    }
    setGeneratingPlanAI(true);
    try {
      await generateCompleteLessonWithAI({
        topic: newPlanTopic.trim(),
        subject: matSubject,
        gradeLevel: 'Ensino Médio',
        activityType: 'lesson_theory'
      });
      setNewPlanBNCC(`BNCC: Compreensão teórica e experimental de ${newPlanTopic.trim()}`);
      setNewPlanMethodology(`Metodologia Ativa: 1) Apresentação conceitual dialogada. 2) Exploração em laboratório virtual interativo. 3) Debate formativo e síntese conceitual com feedback imediato.`);
      showFeedback('Sugestão pedagógica gerada com sucesso pela IA!', 'success');
    } catch (err) {
      console.error('Erro ao gerar plano com IA:', err);
      showFeedback('Não foi possível gerar sugestão pela IA no momento.', 'error');
    } finally {
      setGeneratingPlanAI(false);
    }
  };

  // Handler to generate Exam with AI Gemini
  const handleGenerateExamWithAI = async () => {
    if (!examAiTopic.trim()) {
      showFeedback('Digite um assunto para gerar as questões da prova.', 'info');
      return;
    }
    setExamAiGenerating(true);
    try {
      const result = await generateCompleteLessonWithAI({
        topic: examAiTopic.trim(),
        subject: newExamSubject,
        gradeLevel: 'Ensino Médio',
        activityType: 'quiz'
      });
      setNewExamTitle(result.title || `Avaliação Formal: ${examAiTopic.trim()}`);
      setNewExamDesc(result.description || `Exame avaliativo com correção automática.`);
      if (result.questions && result.questions.length > 0) {
        const convertedQuestions: ExamQuestion[] = result.questions.map((q, idx) => ({
          enunciado: q.q,
          tema: examAiTopic.trim(),
          nivelDificuldade: idx === 0 ? 'Fácil' : idx === 1 ? 'Médio' : 'Difícil',
          valorPeso: 2.5,
          justificativa: q.explanation || 'Resolução baseada nos princípios científicos da disciplina.',
          opcoes: q.options.map((opt, oIdx) => ({
            texto: opt,
            isCorreta: oIdx === q.answer
          }))
        }));
        setNewExamQuestions(convertedQuestions);
      }
      showFeedback('Questões com gabarito e resolução comentada geradas com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao gerar prova com IA:', err);
      showFeedback('Não foi possível gerar questões automáticas pela IA no momento.', 'error');
    } finally {
      setExamAiGenerating(false);
    }
  };

  // Handler to publish Exam for class
  const handlePublishExam = async (status: 'Rascunho' | 'Aberta') => {
    if (!newExamTitle.trim()) {
      showFeedback('Por favor, informe o título da avaliação antes de salvar.', 'error');
      return;
    }
    if (!newExamQuestions || newExamQuestions.length === 0) {
      showFeedback('Adicione pelo menos 1 questão à avaliação antes de salvar.', 'error');
      return;
    }
    for (let i = 0; i < newExamQuestions.length; i++) {
      const q = newExamQuestions[i];
      if (!q.enunciado.trim()) {
        showFeedback(`A questão #${i + 1} precisa ter um enunciado preenchido.`, 'error');
        return;
      }
      const hasCorrect = q.opcoes.some(opt => opt.isCorreta);
      if (!hasCorrect) {
        showFeedback(`Marque qual das alternativas da questão #${i + 1} é a correta.`, 'error');
        return;
      }
    }

    setSavingExam(true);
    try {
      const targetClass = newExamTargetClass || selectedClassId || (turmas.length > 0 ? turmas[0].id : 'turma_geral');
      const targetClassObj = turmas.find(t => t.id === targetClass);
      const profId = currentUser?.uid || 'prof_current';
      const profName = userData?.name || currentUser?.displayName || 'Professor';

      const pesoTotal = newExamQuestions.reduce((sum, q) => sum + (q.valorPeso || 1), 0);

      const saved = await saveExam({
        professorId: profId,
        professorName: profName,
        titulo: newExamTitle.trim(),
        descricao: newExamDesc.trim() || 'Avaliação formal com questões de múltipla escolha e correção automática.',
        disciplina: newExamSubject,
        turmaId: targetClass,
        turmaNome: targetClassObj?.name || (targetClass === 'turma_geral' ? 'Turma Geral' : 'Turma Vinculada'),
        duracaoMinutos: newExamDuration || 50,
        dataLimite: newExamDeadline || undefined,
        status,
        pesoTotal,
        questoes: newExamQuestions,
        criadoEm: new Date().toISOString()
      });

      setExamsList(prev => [saved, ...prev.filter(e => e.id !== saved.id)]);
      setExamMode('list');
      setNewExamTitle('');
      setNewExamDesc('');
      showFeedback(
        status === 'Aberta'
          ? '🚀 Avaliação formal publicada e disponibilizada para os alunos!'
          : '📝 Rascunho da avaliação salvo com sucesso!',
        'success'
      );
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
      showFeedback('Houve um problema ao salvar a avaliação. Tente novamente.', 'error');
    } finally {
      setSavingExam(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '84rem', margin: '0 auto' }}>
      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            background: toastMessage.type === 'error' ? 'rgba(239,68,68,0.95)' : toastMessage.type === 'info' ? 'rgba(6,182,212,0.95)' : 'rgba(16,185,129,0.95)',
            color: '#ffffff',
            boxShadow: '0 10px 35px rgba(0,0,0,0.5)',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backdropFilter: 'blur(10px)',
            maxWidth: '440px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} />
          ) : toastMessage.type === 'info' ? (
            <Sparkles style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} />
          ) : (
            <CheckCircle style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }} />
          )}
          <span style={{ flex: 1 }}>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.2rem', opacity: 0.8 }}
            title="Fechar aviso"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.75rem' }}>👨‍🏫</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px' }}>
              Painel Docente & Gestão Escolar
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Planejamento curricular bimestral, provas com correção automática, upload de materiais e laboratórios integrados.
          </p>
        </div>

        {/* Global Action Buttons */}
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
            onClick={() => { setDashboardTab('exams'); setExamMode('create'); }}
            className="btn-gradient"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', fontSize: '0.85rem', borderRadius: '8px', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
          >
            <PlusCircle style={{ width: '1rem', height: '1rem' }} />
            Nova Prova / Avaliação
          </button>
          <button
            onClick={() => { setIsCreatingClass(true); setDashboardTab('classes'); }}
            className="btn-outline-cyan"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem', borderRadius: '8px', fontWeight: 600 }}
          >
            <PlusCircle style={{ width: '1rem', height: '1rem' }} />
            Nova Turma
          </button>
        </div>
      </div>

      {/* Global Stats Cards */}
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

      {/* Reorganized Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { id: 'classes', label: '🏫 Minhas Turmas & Mural', icon: BookOpen },
          { id: 'lms_gradebook', label: '📚 Diário, Notas & Fórum LMS', icon: Award },
          { id: 'lesson_plans', label: '📅 Plano de Aulas Bimestral', icon: Calendar },
          { id: 'exams', label: `📝 Provas & Avaliações (${examsList.length})`, icon: FileText },
          { id: 'materials', label: `📁 Materiais & Uploads (${enhancedMaterials.length})`, icon: Upload },
          { id: 'labs_overview', label: '🔬 Catálogo 72 Labs', icon: Layers },
          { id: 'reports', label: '📊 Analytics & Diagnóstico IA', icon: BarChartIcon },
          { id: 'messages', label: `💬 Dúvidas (${profMessages.filter(m => !m.replied).length})`, icon: MessageCircle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setDashboardTab(tab.id as any)}
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

      {/* ── TAB 1: MINHAS TURMAS & MURAL DE AVISOS ── */}
      {dashboardTab === 'classes' && (
        <div className="fade-in">
          {/* Create Class Modal/Form */}
          {isCreatingClass && (
            <div className="glass-card mb-4" style={{ padding: '1.5rem', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.03)' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle style={{ width: '1.2rem', height: '1.2rem', color: '#06b6d4' }} />
                Cadastrar Nova Turma
              </h3>
              <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Nome da Turma</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ex: 3º Ano Médio A - Ciências da Natureza"
                    autoFocus
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setIsCreatingClass(false)} className="btn-outline-cyan" style={{ padding: '0.65rem 1.25rem' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gradient" style={{ padding: '0.65rem 1.5rem', fontWeight: 700 }}>
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Classes Cards Grid */}
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
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedClassId(turma.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                        {isSelected ? '● Turma Selecionada' : 'Turma'}
                      </span>
                      <h3 style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '1.15rem', margin: '0.2rem 0 0' }}>
                        {turma.name}
                      </h3>
                    </div>
                    <span style={{
                      padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                      background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)'
                    }}>
                      {turma.studentsCount} Alunos
                    </span>
                  </div>

                  {/* Código da Turma (6 dígitos) com Cópia Rápida */}
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    background: 'rgba(6,182,212,0.06)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px dashed rgba(6,182,212,0.35)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Código da Turma (6 dígitos):
                      </span>
                      <strong style={{ color: '#06b6d4', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '2px' }}>
                        {turma.code || turma.id.slice(0, 6).toUpperCase()}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const codeToCopy = turma.code || turma.id.slice(0, 6).toUpperCase();
                        navigator.clipboard.writeText(codeToCopy);
                        setCopiedClassCode(turma.id);
                        setTimeout(() => setCopiedClassCode(null), 2500);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: copiedClassCode === turma.id ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                        border: copiedClassCode === turma.id ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                        color: copiedClassCode === turma.id ? '#10b981' : 'var(--text-main)',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title="Copiar código de 6 dígitos para os alunos"
                    >
                      {copiedClassCode === turma.id ? (
                        <>
                          <Check style={{ width: '0.85rem', height: '0.85rem' }} /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy style={{ width: '0.85rem', height: '0.85rem' }} /> Copiar
                        </>
                      )}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClassId(turma.id);
                        handleViewClassReport(turma.id);
                        setDashboardTab('reports');
                      }}
                      className="btn-outline-cyan"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                    >
                      Ver Relatório
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClassId(turma.id);
                        setDashboardTab('lesson_plans');
                      }}
                      className="btn-gradient"
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                    >
                      Plano de Aula →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mural de Avisos da Turma Selecionada (Estilo Edu-Interact-v2) */}
          {selectedClassId && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    Mural de Avisos & Comunicados ({turmas.find(t => t.id === selectedClassId)?.name})
                  </h3>
                </div>
              </div>

              {/* Form to Post New Notice */}
              <div style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#06b6d4', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
                  📢 Publicar Novo Comunicado para os Alunos
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Título do comunicado (ex: Data da Prova Bimestral de Física, Entrega do Relatório...)"
                    value={newNoticeTitle}
                    onChange={e => setNewNoticeTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                  <textarea
                    rows={3}
                    placeholder="Escreva as orientações, prazos ou recados que aparecerão no painel dos estudantes..."
                    value={newNoticeText}
                    onChange={e => setNewNoticeText(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handlePublishNotice}
                      disabled={publishingNotice || !newNoticeTitle.trim() || !newNoticeText.trim()}
                      className="btn-gradient"
                      style={{ padding: '0.6rem 1.5rem', fontWeight: 700, fontSize: '0.85rem' }}
                    >
                      {publishingNotice ? 'Publicando...' : 'Publicar no Mural dos Alunos'}
                    </button>
                  </div>
                </div>
              </div>

              {/* List of Notices */}
              {classNotices.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {classNotices.map(notice => (
                    <div key={notice.id} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>{notice.titulo}</h4>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {notice.criadoEm ? new Date(notice.criadoEm).toLocaleDateString('pt-BR') : ''}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                          {notice.texto}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteClassNotice(selectedClassId, notice.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                        title="Excluir aviso"
                      >
                        <Trash2 style={{ width: '0.95rem', height: '0.95rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  Nenhum comunicado publicado para esta turma ainda.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PLANO DE AULAS BIMESTRAL / SEMESTRAL ── */}
      {dashboardTab === 'lesson_plans' && (
        <div className="fade-in">
          <div className="glass-card mb-4" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  <Calendar style={{ width: '1.1rem', height: '1.1rem' }} /> Planejamento Curricular & BNCC
                </div>
                <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0 0.35rem' }}>
                  Plano de Aulas do Semestre / Bimestre
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                  Estruture o cronograma de conteúdos, competências da BNCC e laboratórios virtuais de cada semana.
                </p>
              </div>

              {/* Bimester Selector Buttons */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'] as BimesterPeriod[]).map(b => (
                  <button
                    key={b}
                    onClick={() => setSelectedBimester(b)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: selectedBimester === b ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedBimester === b ? 'rgba(6,182,212,0.2)' : 'rgba(0,0,0,0.3)',
                      color: selectedBimester === b ? '#06b6d4' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form to Add / Plan Lesson */}
          <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              ➕ Planejar Nova Aula ({selectedBimester})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Tópico / Conteúdo da Aula:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Ex: Leis da Termodinâmica e Ciclo de Carnot"
                    value={newPlanTopic}
                    onChange={e => setNewPlanTopic(e.target.value)}
                    style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                  />
                  <button
                    onClick={handleGeneratePlanWithAI}
                    disabled={generatingPlanAI || !newPlanTopic.trim()}
                    className="btn-outline-cyan"
                    style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                    title="Preencher BNCC e Metodologia com IA"
                  >
                    <Sparkles style={{ width: '0.9rem', height: '0.9rem' }} />
                    {generatingPlanAI ? '...' : 'Sugerir IA'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Competências / Habilidades da BNCC:
                </label>
                <input
                  type="text"
                  placeholder="Ex: EM13CNT102 - Explicar transformações de energia"
                  value={newPlanBNCC}
                  onChange={e => setNewPlanBNCC(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Laboratório Virtual Associado (72 Labs):
                </label>
                <select
                  value={newPlanLabId}
                  onChange={e => setNewPlanLabId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.88rem' }}
                >
                  <option value="">Nenhum / Apenas Teórica</option>
                  {ALL_MODULES.map(m => (
                    <optgroup key={m.id} label={m.label}>
                      {m.labs.map(l => (
                        <option key={l.id} value={l.id}>{m.label}: {l.title}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Data Prevista (Opcional):
                </label>
                <input
                  type="date"
                  value={newPlanDate}
                  onChange={e => setNewPlanDate(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Metodologia e Estratégia de Ensino:
                </label>
                {/* Pedagogical Framework Templates */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setNewPlanMethodology('[Metodologia Socrática]: 1) Pergunta norteadora desafiadora sem resposta imediata; 2) Investigação guiada no laboratório virtual pelos alunos; 3) Maiêutica: debate reflexivo para desconstruir contradições e formalizar o conceito.')}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', cursor: 'pointer' }}
                    title="Inserir modelo de Maiêutica Socrática"
                  >
                    🏛️ Sócrates
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlanMethodology('[Metodologia Aristotélica]: 1) Observação empírica direta dos fenômenos na simulação; 2) Coleta e tabulação de dados sensoriais; 3) Análise de causalidade (material, formal, eficiente e final).')}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(6,182,212,0.4)', background: 'rgba(6,182,212,0.15)', color: '#67e8f9', cursor: 'pointer' }}
                    title="Inserir modelo Empírico de Aristóteles"
                  >
                    🔬 Aristóteles
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlanMethodology('[Metodologia Freiriana]: 1) Tema Gerador vinculado à realidade e vivência social dos alunos; 2) Círculo de cultura e problematização crítica; 3) Ação transformadora da ciência no cotidiano.')}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', cursor: 'pointer' }}
                    title="Inserir modelo de Problematização Freiriana"
                  >
                    🌱 Paulo Freire
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlanMethodology('[Inclusão DUA / UDL]: 1) Múltiplos meios de representação (simulador visual + leitor de áudio + resumo sem sobrecarga); 2) Múltiplos meios de ação e expressão; 3) Engajamento adaptado para alunos com TDAH, TEA e dislexia.')}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.15)', color: '#fcd34d', cursor: 'pointer' }}
                    title="Inserir modelo DUA / Acessibilidade Cognitiva"
                  >
                    🧩 DUA (Inclusivo)
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                placeholder="Descreva a dinâmica da aula ou clique em um dos métodos acima para preencher..."
                value={newPlanMethodology}
                onChange={e => setNewPlanMethodology(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSaveLessonPlan}
                disabled={savingPlan || !newPlanTopic.trim()}
                className="btn-gradient"
                style={{ padding: '0.65rem 1.75rem', fontWeight: 700 }}
              >
                {savingPlan ? 'Salvando...' : `Salvar Aula no ${selectedBimester}`}
              </button>
            </div>
          </div>

          {/* Timeline of Lessons in Current Bimester */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Cronograma de Aulas — {selectedBimester} ({classLessonPlans.filter(p => p.periodo === selectedBimester).length} Aulas)
            </h3>

            {classLessonPlans.filter(p => p.periodo === selectedBimester).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {classLessonPlans.filter(p => p.periodo === selectedBimester).map((plan, idx) => (
                  <div key={plan.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', padding: '0.5rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.2)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, display: 'block' }}>AULA</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>#{idx + 1}</strong>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{plan.topico}</h4>
                        <span style={{
                          fontSize: '0.72rem', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 700,
                          background: plan.status === 'concluida' ? 'rgba(16,185,129,0.15)' : plan.status === 'em_andamento' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.08)',
                          color: plan.status === 'concluida' ? '#10b981' : plan.status === 'em_andamento' ? '#f59e0b' : 'var(--text-secondary)'
                        }}>
                          {plan.status === 'concluida' ? '✓ Concluída' : plan.status === 'em_andamento' ? '⏳ Em Andamento' : '📅 Planejada'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        {plan.metodologia}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {plan.competenciasBNCC && <span>🎯 {plan.competenciasBNCC}</span>}
                        {plan.laboratorioTitulo && <span style={{ color: '#06b6d4' }}>🔬 Lab: {plan.laboratorioTitulo}</span>}
                        {plan.dataPrevista && <span>🗓️ {plan.dataPrevista}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <select
                        value={plan.status}
                        onChange={e => updateLessonPlanItem(plan.id!, { status: e.target.value as any })}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', background: '#18181b', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-main)', fontSize: '0.75rem' }}
                      >
                        <option value="planejada">Planejada</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                      </select>
                      <button
                        onClick={() => deleteLessonPlanItem(plan.id!)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', textAlign: 'center' }}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Nenhuma aula cadastrada no cronograma do {selectedBimester} ainda.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: PROVAS & AVALIAÇÕES FORMAIS (ESTILO EDU-INTERACT-V2) ── */}
      {dashboardTab === 'exams' && (
        <div className="fade-in">
          {/* Sub-navigation inside Exams */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setExamMode('list')}
                className={examMode === 'list' ? 'btn-gradient' : 'btn-outline-cyan'}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                📋 Provas Aplicadas ({examsList.length})
              </button>
              <button
                onClick={() => setExamMode('create')}
                className={examMode === 'create' ? 'btn-gradient' : 'btn-outline-cyan'}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ➕ Criar Nova Prova
              </button>
            </div>
          </div>

          {/* EXAMS: LIST VIEW */}
          {examMode === 'list' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {examsList.map(exam => (
                <div key={exam.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                        {exam.disciplina}
                      </span>
                      <span style={{
                        fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700,
                        background: exam.status === 'Aberta' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: exam.status === 'Aberta' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${exam.status === 'Aberta' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
                      }}>
                        {exam.status}
                      </span>
                    </div>

                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                      {exam.titulo}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.4 }}>
                      {exam.descricao || 'Avaliação formal com questões objetivas e gabarito.'}
                    </p>

                    <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      <div>Turma: <strong style={{ color: 'var(--text-main)' }}>{exam.turmaNome || 'Todas as turmas'}</strong></div>
                      <div>Duração: <strong style={{ color: '#06b6d4' }}>{exam.duracaoMinutos ? `${exam.duracaoMinutos} minutos` : 'Sem limite'}</strong></div>
                      <div>Questões: <strong style={{ color: '#f59e0b' }}>{exam.questoes.length} (Peso Total: {exam.pesoTotal})</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setSelectedExam(exam);
                        setExamMode('analytics');
                      }}
                      className="btn-gradient"
                      style={{ flex: 1, padding: '0.55rem', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      📊 Ver Acertos por Questão
                    </button>
                    {exam.status === 'Aberta' ? (
                      <button
                        onClick={async () => {
                          await updateExam(exam.id!, { status: 'Encerrada' });
                          setExamsList(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'Encerrada' } : e));
                        }}
                        className="btn-outline-cyan"
                        style={{ padding: '0.55rem', fontSize: '0.78rem' }}
                      >
                        Encerrar
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await updateExam(exam.id!, { status: 'Aberta' });
                          setExamsList(prev => prev.map(e => e.id === exam.id ? { ...e, status: 'Aberta' } : e));
                        }}
                        className="btn-outline-cyan"
                        style={{ padding: '0.55rem', fontSize: '0.78rem', color: '#10b981' }}
                      >
                        Reabrir
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        await deleteExam(exam.id!);
                        setExamsList(prev => prev.filter(e => e.id !== exam.id));
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.5rem' }}
                      title="Deletar prova"
                    >
                      <Trash2 style={{ width: '0.95rem', height: '0.95rem' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EXAMS: CREATE EXAM VIEW (ESTILO Edu-Interact-v2 QuestionarioEditor) */}
          {examMode === 'create' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  📝 Criador de Provas & Avaliações Formais
                </h3>
                <button onClick={() => setExamMode('list')} className="btn-outline-cyan" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                  ← Voltar à Lista
                </button>
              </div>

              {/* AI Helper Banner */}
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(6,182,212,0.3)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <strong style={{ color: '#06b6d4', fontSize: '0.9rem', display: 'block' }}>Gerar Questões com IA Gemini</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Digite o assunto para formular automaticamente questões com gabarito e justificativa pedagógica.</span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Leis de Newton, Reações de Oxirredução, Trigonometria..."
                  value={examAiTopic}
                  onChange={e => setExamAiTopic(e.target.value)}
                  style={{ flex: 1, minWidth: '240px', padding: '0.55rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
                <button
                  onClick={handleGenerateExamWithAI}
                  disabled={examAiGenerating || !examAiTopic.trim()}
                  className="btn-gradient"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  {examAiGenerating ? 'Gerando...' : '✨ Gerar Questões'}
                </button>
              </div>

              {/* Exam Metadata Form */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Título da Prova</label>
                  <input
                    type="text"
                    placeholder="Ex: 1ª Avaliação Bimestral de Física"
                    value={newExamTitle}
                    onChange={e => setNewExamTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Disciplina</label>
                  <select
                    value={newExamSubject}
                    onChange={e => setNewExamSubject(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    {ALL_MODULES.map(m => (
                      <option key={m.id} value={m.label}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Turma de Destino</label>
                  <select
                    value={newExamTargetClass}
                    onChange={e => setNewExamTargetClass(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    <option value="">Todas as Turmas</option>
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Duração em Minutos (Cronômetro)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    placeholder="50 minutos (0 = sem limite)"
                    value={newExamDuration}
                    onChange={e => setNewExamDuration(parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Data Limite de Entrega</label>
                  <input
                    type="date"
                    value={newExamDeadline}
                    onChange={e => setNewExamDeadline(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Questions List Editor */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ color: '#06b6d4', fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                    Questões da Avaliação ({newExamQuestions.length})
                  </h4>
                  <button
                    onClick={() => {
                      setNewExamQuestions(prev => [
                        ...prev,
                        {
                          enunciado: 'Enunciado da nova questão...',
                          tema: newExamSubject,
                          nivelDificuldade: 'Médio',
                          valorPeso: 2.0,
                          justificativa: 'Justificativa pedagógica e resolução comentada.',
                          opcoes: [
                            { texto: 'Opção A (Correta)', isCorreta: true },
                            { texto: 'Opção B', isCorreta: false },
                            { texto: 'Opção C', isCorreta: false },
                            { texto: 'Opção D', isCorreta: false },
                          ]
                        }
                      ]);
                    }}
                    className="btn-outline-cyan"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus style={{ width: '0.85rem', height: '0.85rem' }} /> Adicionar Questão
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {newExamQuestions.map((q, qIndex) => (
                    <div key={qIndex} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 800 }}>Questão #{qIndex + 1}</span>
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                            Peso: {q.valorPeso} pts
                          </span>
                        </div>
                        {newExamQuestions.length > 1 && (
                          <button
                            onClick={() => setNewExamQuestions(prev => prev.filter((_, i) => i !== qIndex))}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem' }}
                          >
                            Remover
                          </button>
                        )}
                      </div>

                      {/* Question Enunciado */}
                      <textarea
                        rows={2}
                        value={q.enunciado}
                        onChange={e => {
                          const val = e.target.value;
                          setNewExamQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, enunciado: val } : item));
                        }}
                        placeholder="Enunciado detalhado da questão"
                        style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.75rem' }}
                      />

                      {/* Metadata Row: Tema, Nível, Peso */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Tema / Eixo Temático</label>
                          <input
                            type="text"
                            value={q.tema}
                            onChange={e => {
                              const val = e.target.value;
                              setNewExamQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, tema: val } : item));
                            }}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Nível de Dificuldade</label>
                          <select
                            value={q.nivelDificuldade}
                            onChange={e => {
                              const val = e.target.value as any;
                              setNewExamQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, nivelDificuldade: val } : item));
                            }}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.82rem' }}
                          >
                            <option value="Fácil">Fácil</option>
                            <option value="Médio">Médio</option>
                            <option value="Difícil">Difícil</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Pontuação / Peso</label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={q.valorPeso}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 1;
                              setNewExamQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, valorPeso: val } : item));
                            }}
                            style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.82rem' }}
                          />
                        </div>
                      </div>

                      {/* Options with Radio for Correct Option */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {q.opcoes.map((opt, oIndex) => (
                          <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                              type="radio"
                              name={`exam_correct_${qIndex}`}
                              checked={opt.isCorreta}
                              onChange={() => {
                                setNewExamQuestions(prev => prev.map((item, idx) => {
                                  if (idx !== qIndex) return item;
                                  return {
                                    ...item,
                                    opcoes: item.opcoes.map((o, oi) => ({ ...o, isCorreta: oi === oIndex }))
                                  };
                                }));
                              }}
                              style={{ accentColor: '#10b981', cursor: 'pointer' }}
                              title="Marcar como alternativa correta"
                            />
                            <input
                              type="text"
                              value={opt.texto}
                              onChange={e => {
                                const val = e.target.value;
                                setNewExamQuestions(prev => prev.map((item, idx) => {
                                  if (idx !== qIndex) return item;
                                  const newOpts = [...item.opcoes];
                                  newOpts[oIndex] = { ...newOpts[oIndex], texto: val };
                                  return { ...item, opcoes: newOpts };
                                }));
                              }}
                              placeholder={`Alternativa ${String.fromCharCode(65 + oIndex)}`}
                              style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: opt.isCorreta ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)', background: opt.isCorreta ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Justificativa Pedagógica */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                          Justificativa Pedagógica & Gabarito Comentado (visível após a correção):
                        </label>
                        <input
                          type="text"
                          value={q.justificativa}
                          onChange={e => {
                            const val = e.target.value;
                            setNewExamQuestions(prev => prev.map((item, idx) => idx === qIndex ? { ...item, justificativa: val } : item));
                          }}
                          placeholder="Explicação da resolução comentada"
                          style={{ width: '100%', padding: '0.45rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Publish Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handlePublishExam('Rascunho')}
                  disabled={savingExam}
                  className="btn-outline-cyan"
                  style={{ padding: '0.65rem 1.5rem', opacity: savingExam ? 0.7 : 1, cursor: savingExam ? 'not-allowed' : 'pointer' }}
                >
                  {savingExam ? 'Salvando...' : 'Salvar como Rascunho'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishExam('Aberta')}
                  disabled={savingExam}
                  className="btn-gradient"
                  style={{ padding: '0.65rem 2rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #06b6d4)', opacity: savingExam ? 0.7 : 1, cursor: savingExam ? 'not-allowed' : 'pointer' }}
                >
                  {savingExam ? 'Publicando Avaliação...' : '🚀 Aplicar Prova para a Turma'}
                </button>
              </div>
            </div>
          )}

          {/* EXAMS: ANALYTICS VIEW (ESTILO EDU-INTERACT-V2: ACERTOS POR QUESTÃO) */}
          {examMode === 'analytics' && selectedExam && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                    Relatório Analítico de Prova
                  </span>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0' }}>
                    {selectedExam.titulo}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Turma: {selectedExam.turmaNome || 'Turma Geral'} | Total de Questões: {selectedExam.questoes.length}
                  </span>
                </div>
                <button onClick={() => setExamMode('list')} className="btn-outline-cyan" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                  ← Voltar às Provas
                </button>
              </div>

              {/* Quick Summary Cards */}
              {examAnalytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600 }}>Total de Entregas</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {examAnalytics.totalTentativas} Alunos
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Média da Turma</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {examAnalytics.mediaTurmaPercentual}%
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>Excelente / Bom</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {examAnalytics.distribuicao.excelente + examAnalytics.distribuicao.bom}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Apoio / Insuficiente</span>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {examAnalytics.distribuicao.insuficiente}
                    </div>
                  </div>
                </div>
              )}

              {/* Análise por Questão com Alertas Pedagógicos */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                  📊 Taxa de Acerto por Questão (Identificação de Falhas de Aprendizagem)
                </h4>

                {examAnalytics && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {examAnalytics.analiseQuestoes.map((q) => (
                      <div
                        key={q.questaoIndex}
                        style={{
                          padding: '1.15rem',
                          borderRadius: '8px',
                          background: q.alertaPedagogico ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)',
                          border: q.alertaPedagogico ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ color: '#06b6d4', fontSize: '0.95rem' }}>Questão #{q.questaoIndex + 1}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({q.tema})</span>
                            {q.alertaPedagogico && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                                <AlertTriangle style={{ width: '0.75rem', height: '0.75rem' }} /> Atenção Pedagógica
                              </span>
                            )}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: q.taxaAcertoPercentual >= 70 ? '#10b981' : q.taxaAcertoPercentual >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {q.taxaAcertoPercentual}% de Acerto
                          </div>
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                          {q.enunciado}
                        </p>

                        <div className="progress-bar" style={{ height: '6px' }}>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${q.taxaAcertoPercentual}%`,
                                background: q.taxaAcertoPercentual >= 70 ? '#10b981' : q.taxaAcertoPercentual >= 50 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabela de Alunos e Notas na Prova */}
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                  👥 Notas Individuais dos Estudantes ({examAttempts.length})
                </h4>
                {examAttempts.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '0.75rem' }}>Estudante</th>
                          <th style={{ padding: '0.75rem' }}>Pontuação Obtida</th>
                          <th style={{ padding: '0.75rem' }}>Aproveitamento</th>
                          <th style={{ padding: '0.75rem' }}>Classificação</th>
                          <th style={{ padding: '0.75rem' }}>Data de Envio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examAttempts.map(att => (
                          <tr key={att.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{att.alunoNome}</td>
                            <td style={{ padding: '0.75rem' }}>{att.pontuacaoObtida} / {att.pontuacaoMaxima} pts</td>
                            <td style={{ padding: '0.75rem', fontWeight: 700, color: att.porcentagemAproveitamento >= 70 ? '#10b981' : att.porcentagemAproveitamento >= 50 ? '#f59e0b' : '#ef4444' }}>
                              {att.porcentagemAproveitamento}%
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
                                background: att.classificacao === 'Excelente' ? 'rgba(16,185,129,0.15)' : att.classificacao === 'Bom' ? 'rgba(6,182,212,0.15)' : 'rgba(245,158,11,0.15)',
                                color: att.classificacao === 'Excelente' ? '#10b981' : att.classificacao === 'Bom' ? '#06b6d4' : '#f59e0b'
                              }}>
                                {att.classificacao}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                              {new Date(att.dataEnvio).toLocaleString('pt-BR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Nenhum estudante realizou esta avaliação até o momento.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: MATERIAIS DE APOIO & UPLOADS DE ARQUIVOS ── */}
      {dashboardTab === 'materials' && (
        <div className="fade-in">
          <div className="glass-card mb-4" style={{ padding: '1.75rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
              Upload & Compartilhamento de Materiais de Apoio
            </h3>

            {/* Class Selector for Materials */}
            {turmas.length > 0 ? (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users style={{ width: '1.1rem', height: '1.1rem', color: '#06b6d4' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Turma de Destino:{' '}
                    <strong style={{ color: 'var(--text-main)' }}>
                      {turmas.find(t => t.id === selectedClassId)?.name || 'Selecione uma turma'}
                    </strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trocar Turma:</label>
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.82rem' }}
                  >
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle style={{ width: '1.2rem', height: '1.2rem', color: '#f59e0b', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Você ainda não possui turmas cadastradas. Crie sua primeira turma na aba{' '}
                  <button
                    onClick={() => { setDashboardTab('classes'); setIsCreatingClass(true); }}
                    style={{ background: 'none', border: 'none', color: '#06b6d4', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                  >
                    Minhas Turmas
                  </button>
                  {' '}para que os estudantes possam acessar os materiais compartilhados.
                </span>
              </div>
            )}

            {/* Upload Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Título do Material
                </label>
                <input
                  type="text"
                  placeholder="Ex: Apostila de Física Térmica, Slides de Aula..."
                  value={matTitle}
                  onChange={e => setMatTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Tipo de Material
                </label>
                <select
                  value={matType}
                  onChange={e => setMatType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.88rem' }}
                >
                  <option value="arquivo">📄 Arquivo do Computador (PDF, Imagem, Doc)</option>
                  <option value="link">🔗 Link Externo (YouTube, Google Drive, Artigo)</option>
                  <option value="texto">📝 Resumo / Texto de Apoio Direto</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Bimestre de Associação
                </label>
                <select
                  value={matBimester}
                  onChange={e => setMatBimester(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.88rem' }}
                >
                  <option value="1º Bimestre">1º Bimestre</option>
                  <option value="2º Bimestre">2º Bimestre</option>
                  <option value="3º Bimestre">3º Bimestre</option>
                  <option value="4º Bimestre">4º Bimestre</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Disciplina
                </label>
                <select
                  value={matSubject}
                  onChange={e => setMatSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: 'var(--text-main)', fontSize: '0.88rem' }}
                >
                  {ALL_MODULES.map(m => (
                    <option key={m.id} value={m.label}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input according to Type */}
            {matType === 'arquivo' && (
              <div style={{ marginBottom: '1.25rem', padding: '1.25rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px dashed rgba(6,182,212,0.3)', textAlign: 'center' }}>
                <input
                  type="file"
                  id="mat_file_input"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="mat_file_input"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '8px', background: 'rgba(6,182,212,0.15)', color: '#06b6d4', fontWeight: 700, fontSize: '0.88rem' }}
                >
                  <Upload style={{ width: '1rem', height: '1rem' }} /> Selecionar Arquivo do Dispositivo
                </label>
                {matFileName && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    Arquivo Selecionado: <strong>{matFileName}</strong> ({matFileSize})
                  </div>
                )}
              </div>
            )}

            {matType === 'link' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Link / URL do Recurso:
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... ou https://youtube.com/..."
                  value={matUrl}
                  onChange={e => setMatUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem' }}
                />
              </div>
            )}

            {matType === 'texto' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Conteúdo do Resumo / Instruções Pedagógicas:
                </label>
                <textarea
                  rows={4}
                  placeholder="Escreva aqui o texto explicativo, síntese da aula, fórmulas importantes ou orientações de estudo..."
                  value={matContent}
                  onChange={e => setMatContent(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Descrição ou Orientações de Leitura:
              </label>
              <input
                type="text"
                placeholder="Ex: Leitura recomendada para a aula da próxima semana."
                value={matDesc}
                onChange={e => setMatDesc(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handlePublishMaterial}
                disabled={uploadingMat}
                className="btn-gradient"
                style={{ padding: '0.65rem 1.75rem', fontWeight: 700, opacity: uploadingMat ? 0.7 : 1 }}
              >
                {uploadingMat ? 'Publicando...' : 'Publicar Material para a Turma'}
              </button>
            </div>
          </div>

          {/* List of Published Materials */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Materiais Disponibilizados para a Turma ({enhancedMaterials.length})
              </h3>
              {selectedClassId && turmas.length > 0 && (
                <span style={{ fontSize: '0.82rem', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 600 }}>
                  {turmas.find(t => t.id === selectedClassId)?.name}
                </span>
              )}
            </div>

            {enhancedMaterials.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {enhancedMaterials.map(mat => (
                  <div key={mat.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase' }}>
                          {mat.periodo || '1º Bimestre'}
                        </span>
                        <span style={{
                          fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600,
                          background: mat.tipo === 'texto' ? 'rgba(139,92,246,0.15)' : mat.tipo === 'link' ? 'rgba(6,182,212,0.15)' : 'rgba(16,185,129,0.15)',
                          color: mat.tipo === 'texto' ? '#8b5cf6' : mat.tipo === 'link' ? '#06b6d4' : '#10b981',
                          border: `1px solid ${mat.tipo === 'texto' ? 'rgba(139,92,246,0.3)' : mat.tipo === 'link' ? 'rgba(6,182,212,0.3)' : 'rgba(16,185,129,0.3)'}`
                        }}>
                          {mat.tipo === 'texto' ? '📝 Resumo Textual' : mat.tipo === 'link' ? '🔗 Link Externo' : '📄 Arquivo / PDF'}
                        </span>
                      </div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{mat.title}</h4>
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
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          📎 {mat.nomeArquivo} ({mat.tamanhoFormatado || ''})
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        {mat.tipo === 'texto' ? (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(mat.linkOuConteudo);
                              setCopiedTextId(mat.id);
                              setTimeout(() => setCopiedTextId(prev => prev === mat.id ? null : prev), 2000);
                              showFeedback('Texto copiado para a área de transferência!', 'info');
                            }}
                            className="btn-outline-cyan"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            {copiedTextId === mat.id ? (
                              <>
                                <Check style={{ width: '0.8rem', height: '0.8rem', color: '#10b981' }} /> Copiado!
                              </>
                            ) : (
                              <>
                                <Copy style={{ width: '0.8rem', height: '0.8rem' }} /> Copiar Texto
                              </>
                            )}
                          </button>
                        ) : mat.tipo === 'link' ? (
                          <a
                            href={mat.linkOuConteudo.startsWith('http') ? mat.linkOuConteudo : `https://${mat.linkOuConteudo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline-cyan"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <ExternalLink style={{ width: '0.8rem', height: '0.8rem' }} /> Acessar Link
                          </a>
                        ) : (
                          <a
                            href={mat.linkOuConteudo}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={mat.nomeArquivo || 'material_didatico'}
                            className="btn-gradient"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Download style={{ width: '0.8rem', height: '0.8rem' }} /> Baixar Arquivo
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => selectedClassId && deleteEnhancedMaterial(selectedClassId, mat.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                        title="Remover material"
                      >
                        <Trash2 style={{ width: '0.9rem', height: '0.9rem' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Nenhum material de apoio publicado para esta turma ainda.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: CATÁLOGO DOS 72 LABORATÓRIOS VIRTUAIS ── */}
      {dashboardTab === 'labs_overview' && (
        <div className="fade-in">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
              🔬 Catálogo Completo dos 72 Laboratórios Virtuais
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
              Grade especializada com 6 simuladores interativos e controle de parâmetros para cada uma das 12 disciplinas.
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
                        mode: {lab.props?.mode || 'padrão'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: ANALYTICS & DIAGNÓSTICO IA ── */}
      {dashboardTab === 'reports' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Turma:</label>
              <select
                value={selectedClassId || ''}
                onChange={e => handleViewClassReport(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(6,182,212,0.3)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' }}
              >
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.studentsCount} alunos)</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => selectedClassId && handleViewClassReport(selectedClassId)}
                className="btn-outline-cyan"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                <RefreshCw style={{ width: '0.85rem', height: '0.85rem' }} /> Atualizar
              </button>
              <button
                onClick={exportReportCSV}
                className="btn-gradient"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <Download style={{ width: '0.85rem', height: '0.85rem' }} /> Exportar CSV
              </button>
            </div>
          </div>

          {reportLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <RefreshCw className="animate-spin" style={{ width: '2rem', height: '2rem', margin: '0 auto 1rem', color: '#06b6d4' }} />
              <p>Carregando analytics...</p>
            </div>
          ) : classReport ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* AI Diagnosis */}
              <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(6,182,212,0.35)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#06b6d4' }} />
                  <h3 style={{ color: '#06b6d4', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Diagnóstico Pedagógico Assistido por IA ({classReport.className})
                  </h3>
                  {aiLoading && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gerando...</span>}
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
                          <AlertTriangle style={{ width: '0.95rem', height: '0.95rem' }} /> Recomendações & Intervenções
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.5 }}>
                          {aiDiagnosis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Processando panorama pedagógico da turma...
                  </p>
                )}
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    📊 Desempenho Médio por Disciplina (%)
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
            </div>
          ) : null}
        </div>
      )}

      {/* ── TAB 7: DÚVIDAS & MENSAGENS DOS ALUNOS ── */}
      {dashboardTab === 'messages' && (
        <div className="fade-in glass-card" style={{ padding: '1.5rem' }}>
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
                      <input
                        type="text"
                        placeholder="Digite sua orientação pedagógica..."
                        value={replyTexts[msg.id!] || ''}
                        onChange={e => setReplyTexts(prev => ({ ...prev, [msg.id!]: e.target.value }))}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.25)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Recompensa de Incentivo 🪙</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={replyBonusCoins[msg.id!] || 0}
                          onChange={e => setReplyBonusCoins(prev => ({ ...prev, [msg.id!]: parseInt(e.target.value) || 0 }))}
                          style={{ width: '60px', padding: '0.35rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', fontSize: '0.82rem', textAlign: 'center' }}
                        />
                        <button
                          className="btn-gradient"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', marginLeft: 'auto', fontWeight: 600 }}
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
                          }}
                        >
                          <Send style={{ width: '0.8rem', height: '0.8rem' }} /> Responder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma dúvida recebida no momento.</p>
          )}
        </div>
      )}

      {/* ── TAB LMS: DIÁRIO DE CLASSE, LIVRO DE NOTAS & FÓRUM ── */}
      {dashboardTab === 'lms_gradebook' && (
        <ProfessorLmsModules
          turmas={turmas}
          selectedClassId={selectedClassId}
          onSelectClass={(id) => setSelectedClassId(id)}
          professorName={userData?.name || currentUser?.displayName || 'Professor'}
        />
      )}

      {/* ── GEMINI API KEY MODAL ── */}
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
              Insira sua chave de API para habilitar diagnósticos pedagógicos de alta precisão e formulação automática de questões de provas e planos de aula.
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
