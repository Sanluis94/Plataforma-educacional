import { useNavigationParams } from '../hooks/useNavigationParams';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Beaker, Trophy, BookOpen, Clock, FileText,
  Calendar, Upload, ExternalLink, Play, Bell,
  Award, ShieldCheck, MessageSquare, Copy, Check, Download, Home as HomeIcon
} from 'lucide-react';
import { useStudentDashboard } from '../../core/hooks/useStudentDashboard';
import { ALL_MODULES } from '../../core/constants/dashboardConstants';
import { getLearningLab, type LearningLab } from '../../core/constants/learningCatalog';
import { LEARNING_LEVELS, normalizeLearningLevel, learningLevelLabel } from '../../core/constants/learningLevels';
import { useLabLearningContent } from '../hooks/useLabLearningContent';
import { readLastLearningLab, saveLastLearningLab, lastLearningLabHref } from '../../core/services/studentStudyGuidance';
import { StudentReviewCard } from '../components/StudentReviewCard';
import { getPublishedSubmissionReviewsByStudent, type SubmissionReview } from '../../data/repositories/submissionRepository';
import { getGradePolicy, type GradePolicy } from '../../data/repositories/gradePolicyRepository';
import { StudentGuidanceInbox } from '../components/StudentGuidance';
import { LabLearningWorkspace } from '../components/labs/LabLearningWorkspace';
import SoundEffects from '../../core/services/soundEffects';
import { StudentLmsModules } from '../components/StudentLmsModules';
import { StudentClassActivity } from '../components/StudentClassActivity';
import { subscribeActivitiesByClass } from '../../data/repositories/activityRepository';
import { getSubmissionsByStudent } from '../../data/repositories/submissionRepository';
import { offlineSyncService } from '../../core/services/offlineSyncService';
import { learningDocumentId } from '../../data/services/learningCapture';
import { examAttemptPercentage } from '../../data/services/learningAnalytics';
import { useLearningCapture } from '../hooks/useLearningCapture';
import {readClassExamSession,saveClassExamSession,classExamRemainingSeconds} from '../../data/services/classExamSession';
import {examAcceptingAnswers,examDeadlineAt} from '../../data/services/examTiming';
import {
  sendStudentMessage,
  subscribeStudentMessages,
  claimStudentMessageReward,
  subscribeClassNotices,
  subscribeEnhancedMaterials,
  type StudentMessage
} from '../../data/repositories/classRepository';
import {
  subscribeExamsByClass,
  getExamAttemptsByStudent
} from '../../data/repositories/examRepository';
import {
  subscribeLessonPlansByClass
} from '../../data/repositories/lessonPlanRepository';
import type {
  ActivityData, ExamData, ExamAttempt, ExamAnswer, SubmissionData,
  LessonPlanItem
} from '../../data/types';
import { useAuth } from '../../core/contexts/AuthContext';
import { withReturnTo } from '../../core/utils/navigation';

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

    const colors = ['#E4683F', '#B8441F', '#293E24', '#3D5B36', '#F59C7B', '#E2D7C3'];
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

type LegacyLab = (typeof ALL_MODULES)[number]['labs'][number];
const LEGACY_LABS = ALL_MODULES.flatMap<LegacyLab>(module => module.labs);
const STUDENT_TABS = ['labs', 'activities', 'exams', 'lesson_plans', 'materials', 'classes', 'gamification', 'gradebook', 'forum', 'certificates'] as const;
type StudentTab = typeof STUDENT_TABS[number];

export function EstudanteDashboard(){const {currentUser}=useAuth();return <StudentDashboardSession key={currentUser?.uid??'visitor'}/>;}
function StudentDashboardSession() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useNavigationParams();
  const linkedLab = getLearningLab(searchParams.get('lab') || '');
  const selectedLevel = linkedLab?.academicLevel || normalizeLearningLevel(searchParams.get('level'), normalizeLearningLevel(userData?.gradeLevel));
  const studentUid = currentUser?.uid || 'student-demo';
  const studentName = currentUser?.displayName || 'Estudante';

  const {
    progress,
    aiTip,
    completedModules,
    activeLab,
    setActiveLab,
    shopItems,
    buyItem,
    purchasedItems,purchaseBusy,purchaseError,purchaseNotice,
    achievements,
    studentClasses,
    joinClass,
    handleActivitySubmit,
    handleLabComplete, labSaveError, labSaving, labPending, retryLabCompletion,
    modules,
    gradeLevel,
    classesLoading, classesError,
    loading:progressLoading,progressError,reloadProgress,
    refreshProgress,
  } = useStudentDashboard(selectedLevel);

  const { level, xp, coins } = progress;
  const labContent = useLabLearningContent(activeLab?.id);
  const lastLab = readLastLearningLab(studentUid);
  const legacyCapture = useLearningCapture();
  const examCapture = useLearningCapture();

  const tabParam = searchParams.get('tab');
  const activeTab: StudentTab = STUDENT_TABS.includes(tabParam as StudentTab) ? tabParam as StudentTab : (searchParams.has('level')||searchParams.has('subject')||searchParams.has('lab')) ? 'labs' : studentClasses.length ? 'activities' : 'classes';
  const panelLocation = location.pathname + location.search;
  const setActiveTab = (tab: StudentTab) => {
    setActiveLab(null);
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('tab', tab);
      next.delete('lab');
      next.delete('labReturnTab');
      next.delete('lessonPlan');
      return next;
    });
  };

  const selectedSubject = linkedLab?.subject || searchParams.get('subject');
  const currentSubjectModule = modules.find(module => module.id === selectedSubject) || modules[0];

  useEffect(() => {
    if (!linkedLab) {
      setActiveLab(null);
      return;
    }
    if (linkedLab.source === 'catalog') {
      const returnParams = new URLSearchParams(searchParams);
      returnParams.delete('lab');
      returnParams.set('tab', returnParams.get('labReturnTab') === 'lesson_plans' ? 'lesson_plans' : 'labs');
    returnParams.delete('labReturnTab');
    returnParams.delete('lessonPlan');
      const assignment = searchParams.get('lessonPlan') ? `&class=${encodeURIComponent(searchParams.get('class') ?? '')}&lessonPlan=${encodeURIComponent(searchParams.get('lessonPlan')!)}` : '';
      navigate(withReturnTo(`/simulacao?lab=${encodeURIComponent(linkedLab.id)}&level=${linkedLab.academicLevel}${assignment}`, `${location.pathname}?${returnParams}`), { replace: true });
      return;
    }
    const lab = LEGACY_LABS.find(item => item.id === linkedLab.id);
    setActiveLab(lab || null);
    if (searchParams.get('level') !== linkedLab.academicLevel || searchParams.get('subject') !== linkedLab.subject || searchParams.get('tab') !== 'labs') {
      const next = new URLSearchParams(searchParams);
      next.set('level', linkedLab.academicLevel);
      next.set('subject', linkedLab.subject);
      next.set('tab', 'labs');
      setSearchParams(next, { replace: true });
    }
  }, [linkedLab, location.pathname, navigate, searchParams, setActiveLab, setSearchParams]);

  const closeLab = () => {
    setActiveLab(null);
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('tab', next.get('labReturnTab') === 'lesson_plans' ? 'lesson_plans' : 'labs');
      next.delete('lab');
      next.delete('labReturnTab');
      next.delete('lessonPlan');
      return next;
    });
  };

  const openLearningLab = (lab: LearningLab, fromTab: StudentTab = activeTab, plan?: LessonPlanItem) => {
    legacyCapture.current.reset();
    if (lab.source === 'catalog') {
      const assignment = plan?.id ? `&class=${encodeURIComponent(plan.turmaId)}&lessonPlan=${encodeURIComponent(plan.id)}` : '';
      navigate(withReturnTo(`/simulacao?lab=${encodeURIComponent(lab.id)}&level=${lab.academicLevel}${assignment}`, panelLocation));
      return;
    }
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      next.set('lab', lab.id);
      next.set('level', lab.academicLevel);
      next.set('subject', lab.subject);
      next.set('tab', 'labs');
      if (fromTab === 'lesson_plans') next.set('labReturnTab', 'lesson_plans');
      else next.delete('labReturnTab');
      if (plan?.id) { next.set('lessonPlan', plan.id); next.set('class', plan.turmaId); }
      else next.delete('lessonPlan');
      return next;
    });
    SoundEffects.playClick();
  };

  const selectedClassId = studentClasses.find(turma => turma.id === searchParams.get('class'))?.id ?? studentClasses[0]?.id ?? null;
  const selectedClassRef = useRef(selectedClassId);
  selectedClassRef.current = selectedClassId;
  const setSelectedClassId = (classId: string) => setSearchParams(previous => {
    const next = new URLSearchParams(previous);
    next.set('class', classId);
    return next;
  });

  // Real-time Class Data States
  const [classNotices, setClassNotices] = useState<any[]>([]);
  const [classMaterials, setClassMaterials] = useState<any[]>([]);
  const [classLessonPlans, setClassLessonPlans] = useState<LessonPlanItem[]>([]);
  const [classExams, setClassExams] = useState<ExamData[]>([]);
  const [classActivities, setClassActivities] = useState<ActivityData[]>([]);
  const [activitiesError, setActivitiesError] = useState('');
  const [activityHistory, setActivityHistory] = useState<SubmissionData[]>([]);
  const [activityHistoryLoading, setActivityHistoryLoading] = useState(true);
  const [activityHistoryError, setActivityHistoryError] = useState('');
  const [publishedReviews, setPublishedReviews] = useState<SubmissionReview[]>([]);
  const [currentGradePolicy, setCurrentGradePolicy] = useState<GradePolicy | null>(null);
  const [reviewsError, setReviewsError] = useState('');
  const [studentAttempts, setStudentAttempts] = useState<ExamAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptsError, setAttemptsError] = useState('');
  const [attemptsRefresh, setAttemptsRefresh] = useState(0);

  // Class Messages
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError,setMessageError]=useState('');
  const [classDataError,setClassDataError]=useState('');
  const [classCodeInput, setClassCodeInput] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinFeedback, setJoinFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Confetti State
  const [showConfetti, setShowConfetti] = useState(false);

  // Exam Taking Modal State
  const [activeExam, setActiveExam] = useState<ExamData | null>(null);
  const [examCurrentQIndex, setExamCurrentQIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examTimeRemaining, setExamTimeRemaining] = useState<number | null>(null);
  const [examResult, setExamResult] = useState<ExamAttempt | null>(null);
  const [submittingExam, setSubmittingExam] = useState(false);
  const [examSaveError, setExamSaveError] = useState('');
  const [examPending, setExamPending] = useState(false);
  const [queuedExamAttempts, setQueuedExamAttempts] = useState<ExamAttempt[]>([]);
  const [examDraftError,setExamDraftError]=useState('');
  const examDeadline=useRef<number|null>(null);
  const frozenExamAttempt = useRef<Omit<ExamAttempt, 'id'> | null>(null);
  const activeExamRef = useRef(activeExam);
  activeExamRef.current = activeExam;
  const [copiedMatId, setCopiedMatId] = useState<string | null>(null);
  useEffect(()=>{
    if(!activeExam)return;
    const save=()=>{if(!saveClassExamSession(studentUid,{exam:activeExam,answers:examAnswers,questionIndex:examCurrentQIndex,deadlineAt:examDeadline.current,frozen:frozenExamAttempt.current,result:examResult,pending:examPending,activeSeconds:examCapture.current.activeSeconds}))setExamDraftError('Não foi possível guardar a prova nesta aba. Mantenha a página aberta até confirmar a entrega.');};
    save();window.addEventListener('pagehide',save);return()=>window.removeEventListener('pagehide',save);
  },[activeExam,examAnswers,examCurrentQIndex,examResult,examPending,submittingExam,studentUid,examCapture]);

  // Keep the class context when refreshing or returning from another screen.
  useEffect(() => {
    if (selectedClassId && searchParams.get('class') !== selectedClassId) {
      setSearchParams(previous => {
        const next = new URLSearchParams(previous);
        next.set('class', selectedClassId);
        return next;
      }, { replace: true });
    }
  }, [selectedClassId, searchParams, setSearchParams]);

  // Subscribe to real-time class data
  useEffect(() => {
    let active = true;
    setClassNotices([]);setClassMaterials([]);setClassLessonPlans([]);setClassExams([]);setMessages([]);setClassDataError('');
    setClassActivities([]);
    setActivitiesError('');
    setActiveExam(null);setExamResult(null);setExamPending(false);setExamAnswers({});setExamTimeRemaining(null);setSubmittingExam(false);setExamSaveError('');setExamDraftError('');setCopiedMatId(null);setNewMessage('');setMessageError('');setSendingMessage(false);
    frozenExamAttempt.current = null;
    if (!selectedClassId) return () => { active = false; };
    const failed=()=>{ if (active) setClassDataError('Não foi possível atualizar todos os dados desta turma. Recarregue a página para tentar novamente.'); };
    const unsubNotices = subscribeClassNotices(selectedClassId, entries => { if (active) setClassNotices(entries); },failed);
    const unsubMaterials = subscribeEnhancedMaterials(selectedClassId, entries => { if (active) setClassMaterials(entries); },failed);
    const unsubLessonPlans = subscribeLessonPlansByClass(selectedClassId, entries => { if (active) setClassLessonPlans(entries); },failed);
    const unsubExams = subscribeExamsByClass(selectedClassId, entries => { if (active) setClassExams(entries); },failed);
    const unsubActivities = subscribeActivitiesByClass(selectedClassId, entries => { if (active) setClassActivities(entries.filter(entry => entry.status === 'published')); }, () => { if (active) setActivitiesError('Não foi possível carregar as atividades desta turma. Recarregue a página para tentar novamente.'); });
    const unsubMessages = subscribeStudentMessages(selectedClassId, messages=>{
      if(!active)return;
      setMessages(messages);
      void Promise.all(messages.filter(message=>message.id&&!message.rewardClaimedAt&&(message.bonusCoins||message.bonusXp)).map(message=>claimStudentMessageReward(selectedClassId,message.id!,studentUid))).then(async claims=>{if(active&&claims.some(Boolean))await refreshProgress();}).catch(()=>{if(active)setActivitiesError('Sua recompensa ainda não foi recebida. Recarregue a página para tentar novamente.');});
    },studentUid,failed);

    return () => {
      active=false;
      unsubNotices();
      unsubMaterials();
      unsubLessonPlans();
      unsubExams();
      unsubActivities();
      unsubMessages();
    };
  }, [selectedClassId,studentUid,refreshProgress]);

  useEffect(() => {
    let active = true;
    setActivityHistory([]);
    setActivityHistoryLoading(true); setActivityHistoryError('');
    if (!selectedClassId) { setActivityHistoryLoading(false); return () => { active = false; }; }
    void getSubmissionsByStudent(studentUid).then(entries => {
      if (active) setActivityHistory(entries.filter(entry => entry.classId === selectedClassId));
    }).catch(() => { if (active) setActivityHistoryError('Não foi possível carregar suas entregas anteriores.'); }).finally(() => { if (active) setActivityHistoryLoading(false); });
    return () => { active = false; };
  }, [studentUid, selectedClassId]);

  useEffect(() => {
    let active = true; setPublishedReviews([]); setCurrentGradePolicy(null); setReviewsError('');
    if (!selectedClassId) return;
    void Promise.all([getPublishedSubmissionReviewsByStudent(studentUid, selectedClassId), getGradePolicy(selectedClassId)]).then(([reviews, policy]) => { if (active) { setPublishedReviews(reviews); setCurrentGradePolicy(policy); } }).catch(() => { if (active) setReviewsError('Não foi possível carregar as orientações publicadas pelo professor. Recarregue para tentar novamente.'); });
    return () => { active = false; };
  }, [studentUid, selectedClassId]);

  useEffect(() => {
    if (activeLab && userData?.role === 'estudante') saveLastLearningLab(studentUid, { labId: activeLab.id, ...(searchParams.get('lessonPlan') && selectedClassId ? { classId: selectedClassId, lessonPlanId: searchParams.get('lessonPlan')! } : {}) });
  }, [activeLab, studentUid, selectedClassId, searchParams, userData?.role]);

  // Load student's past exam attempts
  useEffect(() => {
    let active = true;
    setAttemptsLoading(true); setAttemptsError('');
    const fetchAttempts = async () => {
      const atts = await getExamAttemptsByStudent(studentUid);
      if (active) setStudentAttempts(atts);
    };
    fetchAttempts().catch(()=>{if(active)setAttemptsError('Não foi possível consultar seu histórico de provas. Confirme as entregas anteriores antes de iniciar uma nova tentativa.');}).finally(()=>{if(active)setAttemptsLoading(false);});
    return () => { active = false; };
  }, [studentUid, attemptsRefresh]);

  // A queue acknowledgement concerns this exact attempt, even if other exams remain pending.
  useEffect(() => {
    let active = true;
    let checking = false;
    const unsubscribe = offlineSyncService.subscribeStatus(() => {
      let pending: ReturnType<typeof offlineSyncService.getPendingSubmissions>;
      try { pending = offlineSyncService.getPendingSubmissions(studentUid).filter(entry => entry.kind === 'exam'); }
      catch { if (active) setExamSaveError('Não foi possível consultar a fila de provas. Seus registros foram preservados; tente atualizar a página.'); return; }
      if (!active) return;
      setQueuedExamAttempts(pending.flatMap(entry => entry.kind === 'exam' ? [{ ...entry.examAttempt, id: entry.id }] : []));
      if (!examPending || !examResult || !activeExam || checking) return;
      const queued = pending.find(entry => entry.kind === 'exam' && entry.examAttempt.examId === examResult.examId && entry.examAttempt.turmaId === examResult.turmaId && entry.examAttempt.evidence?.sessionId === examResult.evidence?.sessionId);
      if (queued) {
        const deadline = examDeadlineAt(activeExam);
        if (queued.error && /permission|permiss/i.test(queued.error) && deadline !== null && Date.now() > deadline + 120000) setExamSaveError('O prazo da prova encerrou antes da confirmação de envio. Suas respostas estão preservadas neste dispositivo; peça ao professor para reabrir a prova e tente enviar novamente.');
        return;
      }
      checking = true;
      void getExamAttemptsByStudent(studentUid).then(attempts => {
        if (!active) return;
        const confirmed = attempts.find(attempt => attempt.alunoId === studentUid && attempt.examId === examResult.examId && attempt.turmaId === examResult.turmaId && attempt.evidence?.sessionId === examResult.evidence?.sessionId);
        if (!confirmed) return;
        setExamPending(false);setExamSaveError('');setExamResult(confirmed);
        setStudentAttempts(previous => [confirmed, ...previous.filter(attempt => attempt.id !== confirmed.id)]);
      }).catch(() => { if (active) setExamSaveError('O envio ainda não pôde ser confirmado. Sua tentativa continua guardada; atualize a página para consultar novamente.'); }).finally(() => { checking = false; });
    });
    return () => { active = false; unsubscribe(); };
  }, [studentUid, activeExam, examResult, examPending]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeExam || examTimeRemaining === null || examResult) return;
    if (examTimeRemaining <= 0) {
      handleFinishExam();
      return;
    }
    const timer = setInterval(() => setExamTimeRemaining(classExamRemainingSeconds(examDeadline.current)),1000);
    return () => clearInterval(timer);
  }, [activeExam, examTimeRemaining, examResult]);

  // Handler to Join Class by Code
  const handleJoinClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    setJoinLoading(true);
    setJoinFeedback(null);
    try {
      const joined = await joinClass(classCodeInput.trim());
      if (!joined) {
        setJoinFeedback({ msg: 'Não foi possível entrar na turma. Confira o código com seu professor e tente novamente.', type: 'error' });
        return;
      }
      setClassCodeInput('');
      setSelectedClassId(joined.classId);
      setActiveTab('activities');
      SoundEffects.playSuccess();
      setJoinFeedback({ msg: `Você entrou na turma ${joined.name}. Veja abaixo as atividades publicadas pelo professor.`, type: 'success' });
      setTimeout(() => setJoinFeedback(null), 5000);
    } catch (err: any) {
      console.error('Erro ao matricular na turma:', err);
      setJoinFeedback({ msg: err?.message || 'Código de turma não encontrado. Verifique com seu professor.', type: 'error' });
    } finally {
      setJoinLoading(false);
    }
  };

  // Handler to Send Message to Teacher
  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingMessage||!selectedClassId || !newMessage.trim()) return;
    setSendingMessage(true);
    setMessageError('');
    const requestClassId = selectedClassId;
    try {
      await sendStudentMessage(selectedClassId, studentUid, studentName, newMessage.trim());
      if (selectedClassRef.current !== requestClassId) return;
      setNewMessage('');
      SoundEffects.playClick();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      if (selectedClassRef.current === requestClassId) setMessageError('Não foi possível enviar sua dúvida. O texto continua aqui; tente novamente.');
    } finally {
      if (selectedClassRef.current === requestClassId) setSendingMessage(false);
    }
  };

  // Handler to Start an Exam
  const handleStartExam = (exam: ExamData) => {
    if(!exam.id||exam.turmaId!==selectedClassId){setExamSaveError('Esta prova não pertence à turma selecionada. Confira sua matrícula antes de continuar.');return;}
    const restored=readClassExamSession(studentUid,exam);
    const queuedAttempt = queuedExamAttempts.find(attempt => attempt.examId === exam.id && attempt.turmaId === exam.turmaId);
    const queuedFrozen = queuedAttempt ? { ...queuedAttempt } : null;
    if (queuedFrozen) delete queuedFrozen.id;
    if(!restored&&!queuedAttempt&&(attemptsLoading||attemptsError)){setExamSaveError('Confirme seu histórico de provas antes de iniciar uma nova tentativa.');return;}
    if(!restored&&!queuedAttempt&&!examAcceptingAnswers(exam)){setExamSaveError('Esta prova está fora do período disponível. Confira o prazo com seu professor.');return;}
    examCapture.current.reset({activeSeconds:restored?.activeSeconds??queuedAttempt?.evidence?.activeSeconds??0});
    frozenExamAttempt.current = restored?.frozen??queuedFrozen??null;
    setExamSaveError('');setExamDraftError('');setExamPending(Boolean(queuedAttempt)||Boolean(restored?.pending));
    setActiveExam(restored?.exam??exam);
    setExamCurrentQIndex(restored?.questionIndex??0);
    setExamAnswers(restored?.answers??(queuedAttempt ? Object.fromEntries(queuedAttempt.respostas.filter(answer => answer.opcaoEscolhidaIndex >= 0).map(answer => [answer.questaoIndex, answer.opcaoEscolhidaIndex])) : {}));
    setExamResult(restored?.result??queuedAttempt??null);
    const durationDeadline=restored?restored.deadlineAt:exam.duracaoMinutos?Date.now()+exam.duracaoMinutos*60000:null;
    const courseDeadline=examDeadlineAt(exam);examDeadline.current=durationDeadline===null?courseDeadline:courseDeadline===null?durationDeadline:Math.min(durationDeadline,courseDeadline);
    setExamTimeRemaining(!examAcceptingAnswers(exam) && !restored?.result && !queuedAttempt ? 0 : classExamRemainingSeconds(examDeadline.current));
    SoundEffects.playClick();
  };

  // Handler to Submit Exam with Automatic Correction
  const handleFinishExam = async () => {
    if (!activeExam || submittingExam) return;
    if (activeExam.questoes.length === 0 || activeExam.questoes.some(question => !Number.isFinite(question.valorPeso) || question.valorPeso <= 0 || question.opcoes.filter(option => option.isCorreta).length !== 1)) {
      setExamSaveError('Esta prova está com questões ou pontuação inválidas. Avise seu professor para corrigir a configuração antes da entrega.');
      return;
    }
    setSubmittingExam(true);

    let totalScore = 0;
    const maxScore = activeExam.questoes.reduce((sum, q) => sum + q.valorPeso, 0);
    const answersList: ExamAnswer[] = [];

    activeExam.questoes.forEach((q, idx) => {
      const selectedOption = examAnswers[idx];
      const correctOptionIndex = q.opcoes.findIndex(o => o.isCorreta);
      const isCorrect = selectedOption !== undefined && selectedOption === correctOptionIndex;
      const points = isCorrect ? q.valorPeso : 0;
      totalScore += points;

      answersList.push({
        questaoIndex: idx,
        opcaoEscolhidaIndex: selectedOption ?? -1,
        acertou: isCorrect,
        pontosObtidos: points
      });
    });

    const percentage = examAttemptPercentage({ pontuacaoObtida: totalScore, pontuacaoMaxima: maxScore }) ?? 0;
    const classificacao = percentage >= 85 ? 'Excelente' : percentage >= 70 ? 'Bom' : percentage >= 50 ? 'Regular' : 'Insuficiente';

    const attempt: Omit<ExamAttempt, 'id'> = frozenExamAttempt.current ?? {
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
      dataEnvio: new Date().toISOString(),
      evidence: examCapture.current.evidence('exam', { stage: 'assessment', subject: activeExam.disciplina, questions: activeExam.questoes.map((question, index) => ({ questionId: `${activeExam.id}-q${index + 1}`, question: question.enunciado, selectedOption: examAnswers[index] ?? null, selectedText: question.opcoes[examAnswers[index]]?.texto, expectedText: question.opcoes.find(option => option.isCorreta)?.texto, explanation: question.justificativa, correct: answersList[index].acertou, topic: question.tema })) }),
    };
    frozenExamAttempt.current = attempt;
    setExamSaveError('');

    try {
      const delivery = await offlineSyncService.deliver({ kind: 'exam', studentId: studentUid, examAttempt: attempt, rewardId: `exam:${activeExam.id}` });
      if (selectedClassRef.current !== attempt.turmaId || activeExamRef.current?.id !== attempt.examId) return;
      const saved: ExamAttempt = { ...attempt, id: learningDocumentId(studentUid, attempt.evidence!.sessionId, `exam-${attempt.turmaId}`) };
      setExamPending(delivery.queued);
      setExamResult(saved);
      if (!delivery.queued) setStudentAttempts(prev => [saved, ...prev.filter(value => value.id !== saved.id)]);
      setShowConfetti(!delivery.queued);
      if (!delivery.queued) SoundEffects.playLevelUp();
    } catch (err) {
      console.error('Erro ao submeter prova:', err);
      if (selectedClassRef.current === attempt.turmaId && activeExamRef.current?.id === attempt.examId) setExamSaveError('Não foi possível guardar a prova. Suas respostas continuam aqui; tente entregar novamente antes de sair.');
    } finally {
      if (selectedClassRef.current === attempt.turmaId && activeExamRef.current?.id === attempt.examId) setSubmittingExam(false);
    }
  };

  // Pending exams that student has not yet submitted
  const pendingExams = classExams.filter(
    exam => examAcceptingAnswers(exam) && !studentAttempts.some(att => att.examId === exam.id)
  );

  return (
    <div className="fade-in" style={{ padding: '2rem 1rem', maxWidth: '84rem', margin: '0 auto' }}>
      <ConfettiCanvas active={showConfetti} onComplete={() => setShowConfetti(false)} />
      {classDataError&&<p role="alert">{classDataError}</p>}
      {examDraftError&&<p role="alert">{examDraftError}</p>}
      {progressLoading&&<p role="status">Carregando seu progresso…</p>}{progressError&&<p role="alert">{progressError} <button className="btn-outline" onClick={reloadProgress}>Atualizar progresso</button></p>}

      {/* Navigation Breadcrumb / Hub Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.6rem 1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-sm, 10px)',
            background: 'var(--color-primary-light, rgba(228, 104, 63, 0.12))',
            border: '1px solid var(--color-primary-accessible, #B8441F)',
            color: 'var(--color-primary-accessible, #B8441F)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          className="hover:scale-102"
        >
          <HomeIcon style={{ width: '1rem', height: '1rem' }} />
          ← Página inicial
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', minWidth: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Acesso rápido:</span>
          <Link to={withReturnTo(`/simulacao?level=${gradeLevel}`, panelLocation)} style={{ color: 'var(--color-verde-700, #293E24)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            🔬 Catálogo de Laboratórios
          </Link>
          <span>•</span>
          <Link to={withReturnTo('/enem', panelLocation)} style={{ color: 'var(--color-primary-accessible, #B8441F)', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            📝 Simulado ENEM
          </Link>
        </div>
      </div>

      {/* Header with Student Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span aria-label={purchasedItems.includes('avatar_hero')?'Avatar Herói':'Perfil do estudante'} style={{ fontSize: '1.8rem',padding:6,borderRadius:12,border:purchasedItems.includes('frame_gold')?'3px solid #b8860b':'3px solid transparent',boxShadow:purchasedItems.includes('theme_neon')?'0 0 14px #06b6d4, 0 0 24px #a855f7':undefined }}>{purchasedItems.includes('avatar_hero')?'🦸':'🎓'}</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
              Portal do Estudante
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.92rem' }}>
            Acesse seus laboratórios, provas, aulas e materiais de estudo.
          </p>
          {purchasedItems.includes('badge_genius')&&<p aria-label="Medalha decorativa do perfil">🧠 Medalha do Conhecimento</p>}
        </div>

        {/* Gamification Stats Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>NÍVEL {level}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>{progressLoading||progressError?'—':xp+' XP'}</div>
          </div>
          <div style={{ width: '1px', height: '2rem', background: 'var(--border-color)' }} />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>MOEDAS</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>🪙 {coins}</div>
          </div>
        </div>
      </div>

      {studentClasses.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>
          Turma selecionada
          <select aria-label="Turma selecionada" value={selectedClassId || ''} onChange={event => setSelectedClassId(event.target.value)} style={{ padding: '0.65rem', borderRadius: '8px', background: 'var(--color-bg-card, #FAF7EE)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
            {studentClasses.map(turma => <option key={turma.id} value={turma.id}>{turma.name}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>As atividades, provas, aulas, materiais e avisos são desta turma.</span>
        </label>
      )}

      {classesLoading && <p role="status">Carregando suas turmas…</p>}
      {classesError && <p role="alert">{classesError}</p>}
      {!classesLoading && !classesError && <section className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }} aria-labelledby="student-next-step-title">
        <h2 id="student-next-step-title">{aiTip?.title ?? (studentClasses.length ? 'Comece pelas atividades da turma' : 'Seu primeiro passo: entrar na turma')}</h2>
        <p>{aiTip?.message ?? (studentClasses.length ? 'Leia a proposta, realize a atividade, entregue suas respostas e consulte a orientação do professor.' : 'Peça o código ao professor. Depois da matrícula, suas atividades, materiais e orientações aparecem neste painel.')}</p>
        {aiTip ? <Link className="btn-primary" to={aiTip.href.startsWith('/simulacao') ? withReturnTo(aiTip.href, panelLocation) : aiTip.href}>{aiTip.actionLabel}</Link> : <button className="btn-primary" onClick={() => setActiveTab(studentClasses.length ? 'activities' : 'classes')}>{studentClasses.length ? 'Ver atividades da minha turma' : 'Entrar na turma'}</button>}
        {lastLab && <Link className="btn-outline" style={{ marginLeft: '0.75rem' }} to={withReturnTo(lastLearningLabHref(lastLab), panelLocation)}>Continuar de onde parei</Link>}
        {joinFeedback && activeTab !== 'classes' && <p role={joinFeedback.type === 'success' ? 'status' : 'alert'}>{joinFeedback.msg}</p>}
      </section>}

      {/* Reorganized Student Navigation Bar with Dynamic Badges */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)' }}>
        {[
          { id: 'labs', label: '🔬 Laboratórios por Nível', icon: Beaker },
          { id: 'activities', label: '📋 Atividades da Turma', icon: BookOpen, count: classActivities.length },
          {
            id: 'exams',
            label: '📝 Provas & Avaliações',
            icon: FileText,
            count: classExams.length,
            badge: pendingExams.length > 0 ? `${pendingExams.length} pendente${pendingExams.length > 1 ? 's' : ''}` : undefined,
            badgeColor: 'var(--color-primary-accessible, #B8441F)'
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
            onClick={() => setActiveTab(tab.id as StudentTab)}
            aria-pressed={activeTab === tab.id}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-sm, 10px) var(--radius-sm, 10px) 0 0',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary, #E4683F)' : '2px solid transparent',
              backgroundColor: activeTab === tab.id ? 'var(--color-primary-light, rgba(228, 104, 63, 0.1))' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-secondary)',
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

      {activeTab === 'labs' && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.4rem', flex: '1 1 250px', fontWeight: 700, color: 'var(--text-main)' }}>
              Nível de aprendizado
              <select
                aria-label="Nível de aprendizado"
                value={gradeLevel}
                onChange={event => {
                  const nextLevel = normalizeLearningLevel(event.target.value);
                  setActiveLab(null);
                  setSearchParams(previous => {
                    const next = new URLSearchParams(previous);
                    next.set('level', nextLevel);
                    next.delete('lab');
                    next.delete('subject');
                    return next;
                  });
                }}
                style={{ padding: '0.7rem', borderRadius: '8px', background: 'var(--color-bg-card, #FAF7EE)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              >
                {LEARNING_LEVELS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label style={{ display: 'grid', gap: '0.4rem', flex: '1 1 250px', fontWeight: 700, color: 'var(--text-main)' }}>
              Disciplina
              <select
                aria-label="Disciplina"
                value={currentSubjectModule?.id || ''}
                onChange={event => {
                  const nextSubject = event.target.value;
                  setActiveLab(null);
                  setSearchParams(previous => {
                    const next = new URLSearchParams(previous);
                    next.set('level', gradeLevel);
                    next.set('subject', nextSubject);
                    next.delete('lab');
                    return next;
                  });
                }}
                style={{ padding: '0.7rem', borderRadius: '8px', background: 'var(--color-bg-card, #FAF7EE)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
              >
                {modules.map(module => <option key={module.id} value={module.id}>{module.label} ({module.labs.length} labs)</option>)}
              </select>
            </label>
          </div>
          <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.85rem 0 0' }}>
            {learningLevelLabel(gradeLevel)}: {modules.reduce((total, module) => total + module.labs.length, 0)} laboratórios em {modules.length} disciplinas.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.35rem 0 0' }}>
            Escolha o nível e a disciplina para explorar os tópicos desta etapa.
          </p>
        </div>
      )}

      {/* ── HUB DE LABORATÓRIOS POR NÍVEL E DISCIPLINA ── */}
      {activeTab === 'labs' && !activeLab && (
        <div className="fade-in">
          {/* Laboratórios da disciplina e do nível selecionados */}
          {currentSubjectModule && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Laboratórios de {currentSubjectModule.label}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {currentSubjectModule.labs.length} experiências desta etapa
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
                {currentSubjectModule.labs.map((lab, index) => {
                  const isCompleted = completedModules.includes(lab.id);
                  return (
                    <div
                      key={lab.id}
                      role="article"
                      aria-label={lab.title}
                      data-lab-id={lab.id}
                      data-academic-level={lab.academicLevel}
                      className="glass-card"
                      style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderRadius: 'var(--radius-lg, 14px)',
                        border: isCompleted ? '1px solid var(--color-verde-500, #3D5B36)' : '1px solid var(--border-color)',
                        background: isCompleted ? 'var(--color-verde-light, rgba(41, 62, 36, 0.08))' : 'var(--bg-glass)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 800 }}>LAB #{index + 1}</span>
                          {isCompleted ? (
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', background: 'var(--color-verde-light, rgba(41, 62, 36, 0.15))', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm, 10px)', fontWeight: 700 }}>
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
                          {lab.objective}
                        </p>
                      </div>

                      <button
                        onClick={() => openLearningLab(lab)}
                        aria-label={`Iniciar ${lab.title}`}
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
      {labSaving && <p role="status">Salvando progresso do laboratório…</p>}
      {labSaveError && <div role="alert">Não foi possível salvar seu progresso. Suas respostas continuam disponíveis. <button type="button" onClick={retryLabCompletion} disabled={labSaving}>Tentar salvar progresso</button></div>}
      {labPending && <p role="status">Tentativa guardada neste dispositivo, aguardando confirmação de envio. Reconecte com este mesmo perfil para concluir a entrega.</p>}
      {examSaveError && activeTab === 'exams' && <p role="alert">{examSaveError}</p>}
      {activeTab === 'labs' && activeLab && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              onClick={closeLab}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              {searchParams.get('labReturnTab') === 'lesson_plans' ? '← Voltar ao Plano de Aulas' : '← Voltar aos Laboratórios'}
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Laboratório Ativo: <strong style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>{activeLab.title}</strong>
            </span>
          </div>

          {labContent.loading && <p role="status">Carregando o roteiro do laboratório…</p>}
          {labContent.error && <p role="alert">{labContent.error} <button type="button" onClick={labContent.retry}>Tentar carregar roteiro</button></p>}
          {labContent.content && <div className="glass-card" style={{ padding: '1rem', minHeight: '520px', borderRadius: 'var(--radius-lg, 14px)' }}>
            <LabLearningWorkspace
              key={activeLab.id}
              labId={activeLab.id}
              title={activeLab.title}
              subject={getLearningLab(activeLab.id)?.subject || 'Laboratório'}
              academicLevel={getLearningLab(activeLab.id)?.academicLevel}
              objective="Compare os casos e use as evidências para justificar suas respostas."
              content={labContent.content}
              onComplete={async ({ score, evidence }) => {
                const result = await handleLabComplete({ id: activeLab.id, title: activeLab.title, ...(searchParams.get('lessonPlan') ? { classId: selectedClassId ?? undefined, lessonPlanId: searchParams.get('lessonPlan')! } : {}) }, score, evidence);
                if (result) {
                  setShowConfetti(true);
                  SoundEffects.playSuccess();
                }
                return result;
              }}
            >
            <activeLab.component
              {...activeLab.props}
              labTitle={activeLab.title}
              labId={activeLab.id}
              onComplete={async () => {
                return handleLabComplete({ id: activeLab.id, title: activeLab.title, ...(searchParams.get('lessonPlan') ? { classId: selectedClassId ?? undefined, lessonPlanId: searchParams.get('lessonPlan')! } : {}) }, 0, legacyCapture.current.evidence('lab', { labId: activeLab.id, subject: getLearningLab(activeLab.id)?.subject, stage: 'exploration' }));
              }}
            />
            </LabLearningWorkspace>
          </div>}
        </div>
      )}

      {activeTab === 'activities' && <section className="fade-in" aria-labelledby="class-activities-title">
        <h2 id="class-activities-title">Atividades da Turma</h2>
        <StudentGuidanceInbox classId={selectedClassId} studentId={studentUid} />
        {reviewsError && <p role="alert">{reviewsError}</p>}
        {activitiesError && <p role="alert">{activitiesError}</p>}
        {activityHistoryError && <p role="alert">{activityHistoryError}</p>}
        {!selectedClassId ? <p>Entre em uma turma com o código fornecido pelo professor para receber atividades.</p> : !activitiesError && classActivities.length === 0 ? <p>O professor ainda não publicou atividades para esta turma.</p> : null}
        {activityHistoryLoading ? <p role="status">Carregando suas entregas…</p> : <div style={{ display: 'grid', gap: '1rem' }}>{classActivities.map(activity => {
          let queuedSubmission: SubmissionData | undefined;
          try { const pending = offlineSyncService.getPendingSubmissions(studentUid).find(item => item.kind === 'submission' && item.submission.classId === selectedClassId && item.submission.activityId === activity.id); if (pending?.kind === 'submission') queuedSubmission = { ...pending.submission, id: pending.id }; } catch { /* Global delivery badge reports an unreadable queue. */ }
          const previous = queuedSubmission ?? activityHistory.find(entry => entry.activityId === activity.id);
          return <div key={`${selectedClassId}-${activity.id}`}><StudentClassActivity activity={activity} studentId={studentUid} onSubmit={handleActivitySubmit} previousSubmission={previous} previousQueued={Boolean(queuedSubmission)} /><StudentReviewCard review={publishedReviews.find(review => review.submissionId === previous?.id)} participatesInGrade={currentGradePolicy?.reviewMode === 'replace-submission-score'} /></div>;
        })}</div>}
      </section>}

      {/* ── TAB 2: PROVAS & AVALIAÇÕES FORMAIS (ESTILO EDU-INTERACT-V2) ── */}
      {activeTab === 'exams' && !activeExam && (
        <div className="fade-in">
          {attemptsLoading && <p role="status">Consultando suas provas entregues…</p>}
          {attemptsError && <div role="alert"><p>{attemptsError}</p><button type="button" className="btn-outline" disabled={attemptsLoading} onClick={() => setAttemptsRefresh(previous => previous + 1)}>Consultar histórico novamente</button></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.35rem', fontFamily: 'var(--font-heading)' }}>
                📝 Provas & Avaliações da Turma
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Exames com contagem regressiva, questões com gabarito comentado e correção automática instantânea.
              </p>
            </div>
          </div>

          {/* Active Exams Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {classExams.map(exam => {
              const queued = queuedExamAttempts.some(attempt => attempt.examId === exam.id && attempt.turmaId === exam.turmaId);
              const attempt = queued ? undefined : studentAttempts.find(a => a.examId === exam.id);
              const restored = readClassExamSession(studentUid, exam);
              return (
                <div key={exam.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 'var(--radius-lg, 14px)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {exam.disciplina}
                      </span>
                      {attempt ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', background: 'var(--color-verde-light, rgba(41, 62, 36, 0.15))', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm, 10px)', fontWeight: 700 }}>
                          ✓ Concluída ({attempt.porcentagemAproveitamento}%)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-accessible, #B8441F)', background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm, 10px)', fontWeight: 700 }}>
                          {queued || restored?.pending ? 'Entrega aguardando confirmação' : examAcceptingAnswers(exam) ? 'Pendente' : 'Fora do período'}
                        </span>
                      )}
                    </div>

                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                      {exam.titulo}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.4 }}>
                      {exam.descricao || 'Avaliação formal com questões objetivas.'}
                    </p>

                    <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock style={{ width: '0.85rem', height: '0.85rem', color: 'var(--color-primary-accessible, #B8441F)' }} />
                        <span>Duração: <strong>{exam.duracaoMinutos ? `${exam.duracaoMinutos} min` : 'Sem limite'}</strong></span>
                      </div>
                      {exam.dataLimite && <div>Prazo: {examDeadlineAt(exam) === null ? 'Confira o prazo com seu professor' : new Date(examDeadlineAt(exam)!).toLocaleString('pt-BR')}</div>}
                      <div>Questões: <strong style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>{exam.questoes.length} (Peso Total: {exam.pesoTotal} pts)</strong></div>
                    </div>
                  </div>

                  {attempt ? (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--color-verde-light, rgba(41, 62, 36, 0.1))', border: '1px solid var(--color-verde-500, #3D5B36)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-verde-700, #293E24)', fontWeight: 700 }}>PROVA REALIZADA</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                        Nota: {attempt.pontuacaoObtida} / {attempt.pontuacaoMaxima} pts ({attempt.classificacao})
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Entregue em: {new Date(attempt.dataEnvio).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartExam(exam)} disabled={(!restored && !queued && (attemptsLoading || Boolean(attemptsError))) || (!examAcceptingAnswers(exam) && !restored && !queued)}
                      className="btn-gradient"
                      style={{ width: '100%', padding: '0.65rem', fontWeight: 700, fontSize: '0.85rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
                    >
                      {queued || restored?.pending ? 'Consultar entrega pendente' : restored ? 'Continuar prova ou consultar entrega' : attemptsLoading ? 'Consultando entregas…' : attemptsError ? 'Histórico indisponível' : !examAcceptingAnswers(exam) ? 'Fora do período disponível' : 'Realizar Prova 📝'}
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
        <div className="fade-in glass-card" style={{ padding: '1.75rem', maxWidth: '48rem', margin: '0 auto', borderRadius: 'var(--radius-lg, 14px)' }}>
          {/* Exam Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, textTransform: 'uppercase' }}>
                {activeExam.disciplina}
              </span>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0', fontFamily: 'var(--font-heading)' }}>
                {activeExam.titulo}
              </h3>
            </div>

            {/* Timer if duration set */}
            {examTimeRemaining !== null && !examResult && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm, 10px)', background: examTimeRemaining < 300 ? 'rgba(188,57,31,0.15)' : 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', border: `1px solid ${examTimeRemaining < 300 ? 'var(--color-vermelho, #BC391F)' : 'var(--color-primary, #E4683F)'}` }}>
                <Clock style={{ width: '1rem', height: '1rem', color: examTimeRemaining < 300 ? 'var(--color-vermelho, #BC391F)' : 'var(--color-primary-accessible, #B8441F)' }} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: examTimeRemaining < 300 ? 'var(--color-vermelho, #BC391F)' : 'var(--color-primary-accessible, #B8441F)', fontFamily: 'monospace' }}>
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
                        borderRadius: 'var(--radius-sm, 10px)',
                        border: isCurrent ? '2px solid var(--color-primary, #E4683F)' : isAnswered ? '1px solid var(--color-verde-500, #3D5B36)' : '1px solid var(--border-color)',
                        background: isCurrent ? 'var(--color-primary-light, rgba(228, 104, 63, 0.25))' : isAnswered ? 'var(--color-verde-light, rgba(41, 62, 36, 0.2))' : 'var(--bg-glass)',
                        color: isCurrent ? 'var(--color-primary-accessible, #B8441F)' : isAnswered ? 'var(--color-verde-700, #293E24)' : 'var(--text-secondary)',
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
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 800 }}>
                      Questão {examCurrentQIndex + 1} de {activeExam.questoes.length}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-accessible, #B8441F)', background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-sm, 10px)', fontWeight: 700 }}>
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
                        <label
                          key={oIdx}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm, 10px)',
                            border: isSelected ? '1px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--color-primary-light, rgba(228, 104, 63, 0.15))' : 'var(--bg-glass)',
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
                            onChange={() => setExamAnswers(prev => ({ ...prev, [examCurrentQIndex]: oIdx }))}
                            disabled={submittingExam || Boolean(frozenExamAttempt.current) || examTimeRemaining === 0}
                            style={{ accentColor: 'var(--color-primary, #E4683F)', cursor: 'pointer' }}
                          />
                          <span style={{ color: isSelected ? 'var(--text-main)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: isSelected ? 600 : 400 }}>
                            {opt.texto}
                          </span>
                        </label>
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
                  className="btn-outline"
                  style={{ padding: '0.55rem 1.25rem', opacity: examCurrentQIndex === 0 ? 0.4 : 1, borderRadius: 'var(--radius-sm, 10px)' }}
                >
                  ← Questão Anterior
                </button>

                {examCurrentQIndex < activeExam.questoes.length - 1 ? (
                  <button
                    onClick={() => setExamCurrentQIndex(prev => prev + 1)}
                    className="btn-outline"
                    style={{ padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-sm, 10px)' }}
                  >
                    Próxima Questão →
                  </button>
                ) : (
                  <button
                    onClick={handleFinishExam}
                    disabled={submittingExam}
                    className="btn-gradient"
                    style={{ padding: '0.65rem 1.75rem', fontWeight: 800, borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
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
                  {examPending ? 'Prova guardada neste dispositivo' : 'Prova entregue'}
                </h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: examResult.porcentagemAproveitamento >= 70 ? '#10b981' : '#f59e0b', margin: '0.5rem 0' }}>
                  {examResult.porcentagemAproveitamento}%
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                  Pontuação: <strong>{examResult.pontuacaoObtida} / {examResult.pontuacaoMaxima} pontos</strong> ({examResult.classificacao})
                </div>
              </div>

              {examPending && <div><p role="status">A entrega aguarda confirmação de envio. Suas respostas permanecem guardadas neste dispositivo.</p><button type="button" className="btn-outline" disabled={submittingExam} onClick={() => void handleFinishExam()}>{submittingExam ? 'Tentando enviar…' : 'Tentar enviar novamente'}</button></div>}

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
                      <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--color-primary-accessible, #B8441F)', display: 'block', marginBottom: '0.2rem' }}>Justificativa Pedagógica:</strong>
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
                  style={{ padding: '0.65rem 2rem', fontWeight: 700, borderRadius: 'var(--radius-sm, 10px)', background: 'var(--gradient-primary)' }}
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
        <div className="fade-in glass-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg, 14px)' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
            📅 Cronograma & Plano de Aulas da Turma
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            Acompanhe a sequência didática planejada pelo professor para cada bimestre letivo.
          </p>

          {classLessonPlans.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {classLessonPlans.map((plan, idx) => (
                <div key={plan.id} style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm, 10px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', padding: '0.45rem', background: 'var(--color-primary-light, rgba(228, 104, 63, 0.12))', borderRadius: 'var(--radius-sm, 10px)', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, display: 'block' }}>AULA</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>#{idx + 1}</strong>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', fontWeight: 700 }}>{plan.periodo}</span>
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
                          const lab = getLearningLab(plan.laboratorioAssociadoId || '');
                          if (lab) openLearningLab(lab, 'lesson_plans', plan);
                        }}
                        disabled={!getLearningLab(plan.laboratorioAssociadoId || '')}
                        className="btn-outline"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap', borderRadius: 'var(--radius-sm, 10px)' }}
                      >
                        🔬 Abrir Laboratório da Aula
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
              {classMaterials.map(mat => (
                <div key={mat.id} style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-verde-700, #293E24)', fontWeight: 700 }}>
                        {mat.periodo || '1º Bimestre'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-accessible, #B8441F)', background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm, 10px)', fontWeight: 700 }}>
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
                          if(!navigator.clipboard){setClassDataError('Não foi possível copiar o texto. Selecione o conteúdo e copie manualmente.');return;}void navigator.clipboard.writeText(mat.linkOuConteudo).then(()=>{setCopiedMatId(mat.id);setClassDataError('');setTimeout(()=>setCopiedMatId(previous=>previous===mat.id?null:previous),2000);}).catch(()=>setClassDataError('Não foi possível copiar o texto. Selecione o conteúdo e copie manualmente.'));
                        }}
                        className="btn-outline"
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
                        className="btn-outline"
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
              Insira o <strong>código da turma</strong> fornecido pelo seu professor (ex: <code>K7M9P2</code>) para acessar os avisos, materiais e provas da turma.
            </p>
            <form onSubmit={handleJoinClassSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                aria-label="Código da turma"
                placeholder="Código da turma (ex: K7M9P2)"
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

            {joinFeedback && (
              <div role={joinFeedback.type === 'error' ? 'alert' : 'status'} style={{
                marginTop: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: joinFeedback.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: joinFeedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                color: joinFeedback.type === 'success' ? '#16a34a' : '#dc2626'
              }}>
                {joinFeedback.msg}
              </div>
            )}
          </div>

          {/* Lista de Turmas Matriculadas */}
          {studentClasses.length > 0 && (
            <div className="glass-card mb-4" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                🏫 Suas Turmas Matriculadas ({studentClasses.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '1rem' }}>
                {studentClasses.map(turma => {
                  const isSelected = selectedClassId === turma.id;
                  const shortCode = turma.code || turma.id.slice(0, 6).toUpperCase();
                  return (
                    <div
                      key={turma.id}
                      onClick={() => setSelectedClassId(turma.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm, 10px)',
                        background: isSelected ? 'var(--color-primary-light, rgba(228, 104, 63, 0.12))' : 'var(--bg-glass)',
                        border: isSelected ? '1px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: isSelected ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {isSelected ? '● Turma Ativa' : 'Clique para Selecionar'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--color-primary-accessible, #B8441F)',
                          background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm, 10px)'
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
              {messageError&&<p role="alert">{messageError}</p>}
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
              Use suas moedas virtuais para personalizar o perfil. Os itens adquiridos são aplicados automaticamente e permanecem após recarregar a página.
            </p>
            {purchaseError&&<p role="alert">{purchaseError}</p>}{purchaseNotice&&<p role="status">{purchaseNotice}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
              {shopItems.map(item => (
                <div key={item.id} style={{ padding: '1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: item.owned ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <h4 style={{ color: 'var(--text-main)', fontWeight: 700, margin: '0 0 0.25rem' }}>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>🪙 {item.price}</span>
                    <button
                      onClick={() => buyItem(item.id)}
                      disabled={purchaseBusy || item.owned || coins < item.price}
                      className="btn-gradient"
                      style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', opacity: item.owned ? 0.6 : (coins < item.price ? 0.5 : 1) }}
                    >
                      {item.owned ? 'Adquirido' : purchaseBusy?'Guardando…':'Adquirir'}
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
              Desbloqueie conquistas ao concluir laboratórios, acumular experiência e colecionar itens. Cada medalha descreve seu requisito.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
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
        <StudentLmsModules key={`${studentUid}:${selectedClassId}`} period={searchParams.get('gradePeriod') as import('../../data/repositories/gradePolicyRepository').GradePeriod || 'atual'} onPeriodChange={period=>setSearchParams(previous=>{const next=new URLSearchParams(previous);next.set('gradePeriod',period);return next;})}
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
