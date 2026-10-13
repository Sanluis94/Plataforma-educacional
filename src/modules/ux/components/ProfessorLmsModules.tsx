import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, CheckCircle, AlertTriangle,  Award,
  Users, MessageSquare, Plus, ShieldCheck, Download, Star,
  Send, Trash2, Filter
} from 'lucide-react';
import type { Turma } from '../../data/repositories/classRepository';
import type {
  AttendanceRecord,
  ForumTopic,
  GradebookWeights,
  StudentGradeReport,
  ExamAttempt,
  ExamData,
  ActivityData
} from '../../data/types';
import {
  saveAttendanceRecord,
  getAttendanceByClass,
  calculateStudentAttendanceRate,
  calculateClassGradebook,
  calculateSemesterGrade,
  DEFAULT_WEIGHTS,
  saveForumTopic,
  subscribeForumTopicsByClass,
  addForumReply,
  markForumBestReply,
  deleteForumTopic,
  deleteForumReply
} from '../../data/repositories/gradebookRepository';
import {
  getSubmissionsByClass,
  getSubmissionReviewsByClass,
  type SubmissionReview
} from '../../data/repositories/submissionRepository';
import type { SubmissionData } from '../../data/types';
import { getExamAttemptsByClass, getExamsByClass } from '../../data/repositories/examRepository';
import { getLiveClassReport } from '../../data/repositories/reportRepository';
import { useAuth } from '../../core/contexts/AuthContext';
import { getActivitiesByClass } from '../../data/repositories/activityRepository';
import { getGradePolicy, saveGradePolicy, GRADE_PERIODS, applyPublishedReviews, type GradePolicy, type GradePeriod, type GradePolicyValues } from '../../data/repositories/gradePolicyRepository';
import { gradePolicyDataInPeriod } from '../../data/services/gradePolicyPeriod';
import { useNavigationParams } from '../hooks/useNavigationParams';
import { TeacherCorrectionWorkspace } from './TeacherCorrectionWorkspace';
import { TeacherCertificates } from './TeacherCertificates';
import { TeacherLabStudio } from './TeacherLabStudio';
import './ProfessorWorkflow.css';

interface ProfessorLmsModulesProps {
  turmas: Turma[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  professorName: string;
  onOpenMaterials?: () => void;
  onPublishActivity?: (activity: Partial<ActivityData>) => Promise<ActivityData>;
}

const formatGrade = (grade: number | null | undefined) => grade == null ? 'Sem dados' : grade.toFixed(1);
const csvCell = (value: unknown) => `"${String(value ?? '').replace(/^[\s]*[=+@-]/, "'$&").replace(/"/g, '""')}"`;
const localDate = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; };

export function ProfessorLmsModules({
  turmas,
  selectedClassId,
  onSelectClass,
  professorName,
  onOpenMaterials,
  onPublishActivity
}: ProfessorLmsModulesProps) {
  const [navigation, setNavigation] = useNavigationParams();
  const subTabs = ['attendance', 'gradebook', 'speedgrader', 'forum', 'certificates', 'lab_studio'] as const;
  const subTab = subTabs.includes(navigation.get('subtab') as typeof subTabs[number]) ? navigation.get('subtab') as typeof subTabs[number] : 'attendance';
  const setSubTab = (tab: typeof subTabs[number]) => setNavigation(previous => { const next = new URLSearchParams(previous); next.set('subtab', tab); return next; });

  const activeClassId = selectedClassId || turmas[0]?.id || '';
  const currentTurma = turmas.find(t => t.id === activeClassId);
  const { currentUser } = useAuth();
  const scope = `${currentUser?.uid ?? ''}:${activeClassId}`;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [roster, setRoster] = useState<{ id: string; name: string }[]>([]);
  const [realSubmissions, setRealSubmissions] = useState<SubmissionData[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [classExams, setClassExams] = useState<ExamData[]>([]);
  const [classActivities, setClassActivities] = useState<ActivityData[]>([]);
  const [acceptedRecordIds, setAcceptedRecordIds] = useState<string[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [participationScores, setParticipationScores] = useState<Record<string, number>>({});
  const [p1ExamId, setP1ExamId] = useState('');
  const [p2ExamId, setP2ExamId] = useState('');
  const [reviews, setReviews] = useState<SubmissionReview[]>([]);
  const gradePeriod = GRADE_PERIODS.includes(navigation.get('gradePeriod') as GradePeriod) ? navigation.get('gradePeriod') as GradePeriod : 'atual';
  const periodRef = useRef(gradePeriod);
  periodRef.current = gradePeriod;
  const [policy, setPolicy] = useState<GradePolicy | null>(null), [policyLoading, setPolicyLoading] = useState(false), [policySaving, setPolicySaving] = useState(false);
  const [policyError, setPolicyError] = useState(''), [policyMessage, setPolicyMessage] = useState('');
  const [policyReady, setPolicyReady] = useState(false), [policyRetry, setPolicyRetry] = useState(0);
  const [policyExplanation, setPolicyExplanation] = useState('As notas são calculadas a partir das últimas entregas avaliadas. Categorias sem evidência permanecem sem nota.');
  const [reviewMode, setReviewMode] = useState<GradePolicy['reviewMode']>('feedback-only');
  const [startDate, setStartDate] = useState<string | null>(null), [endDate, setEndDate] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────
  // 1. ESTADO DE FREQUÊNCIA (ATTENDANCE)
  // ─────────────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isRecordingAttendance, setIsRecordingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(() => localDate());
  const [attendanceContent, setAttendanceContent] = useState('');
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, 'presente' | 'falta' | 'justificada'>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceRetry, setAttendanceRetry] = useState(0);
  const [attendanceMessage, setAttendanceMessage] = useState('');

  // Carrega histórico de frequência da turma
  useEffect(() => {
    let alive = true;
    setAttendanceRecords([]);
    setSavingAttendance(false);
    setIsRecordingAttendance(false);
    setAttendanceError(''); setAttendanceMessage('');
    if (!activeClassId || !currentUser?.uid) return;
    setAttendanceLoading(true);
    const fetchAttendance = async () => {
      try {
        const records = await getAttendanceByClass(activeClassId);
        if (alive) setAttendanceRecords(records);
      } catch {
        if (alive) setAttendanceError('Não foi possível carregar a frequência desta turma. Tente novamente antes de registrar a chamada.');
      } finally { if (alive) setAttendanceLoading(false); }
    };
    fetchAttendance();
    return () => { alive = false; };
  }, [activeClassId, currentUser?.uid, attendanceRetry]);

  // A chamada é preenchida pelo professor para os estudantes matriculados.
  const selectAttendanceDate = (date: string) => {
    const existing = attendanceRecords.find(record => record.data === date && !record.aulaNumero);
    setAttendanceDate(date);
    setAttendanceStatusMap(existing ? Object.fromEntries(existing.registros.map(record => [record.studentId, record.status])) : {});
    setAttendanceContent(existing?.conteudoResumo ?? '');
    setAttendanceError(''); setAttendanceMessage('');
  };
  const handleOpenAttendanceModal = () => {
    selectAttendanceDate(localDate());
    setIsRecordingAttendance(true);
  };

  const handleSaveAttendance = async () => {
    if (savingAttendance || !activeClassId || !attendanceContent.trim() || !attendanceDate || !roster.length || roster.some(student => !attendanceStatusMap[student.id])) return;
    const requestScope = scope;
    setSavingAttendance(true);
    setAttendanceError('');
    try {
      const registros = roster.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: attendanceStatusMap[s.id]
      }));

      const saved = await saveAttendanceRecord({
        turmaId: activeClassId,
        data: attendanceDate,
        conteudoResumo: attendanceContent.trim(),
        registros,
        criadoEm: new Date().toISOString()
      });

      if (scopeRef.current !== requestScope) return;
      setAttendanceRecords(prev => [saved, ...prev.filter(record => record.id !== saved.id && !(record.data === saved.data && !record.aulaNumero))]);
      setIsRecordingAttendance(false);
      setAttendanceMessage('Chamada salva para esta turma. Registros da mesma data são atualizados, sem contar a aula duas vezes.');
    } catch (err) {
      console.error('Erro ao salvar chamada:', err);
      if (scopeRef.current === requestScope) setAttendanceError('O salvamento da chamada não foi confirmado. Suas marcações continuam nesta tela; tente novamente.');
    } finally {
      if (scopeRef.current === requestScope) setSavingAttendance(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. ESTADO DO LIVRO DE NOTAS & BOLETIM (GRADEBOOK)
  // ─────────────────────────────────────────────────────────────
  const [weights, setWeights] = useState<GradebookWeights>({
    ...DEFAULT_WEIGHTS,
    turmaId: activeClassId
  });
  const [gradeReports, setGradeReports] = useState<StudentGradeReport[]>([]);

  // Gera relatório ponderado do boletim escolar
  useEffect(() => {
    if (!activeClassId) return;

    // Constrói relatório ponderado integrando frequência
    const reports = calculateClassGradebook(
      roster,
      activeClassId,
      gradePolicyDataInPeriod({ startDate, endDate }, { submissions: applyPublishedReviews(realSubmissions, reviews, { classId: activeClassId, reviewMode }), examAttempts, attendanceRecords }).submissions,
      gradePolicyDataInPeriod({ startDate, endDate }, { submissions: realSubmissions, examAttempts, attendanceRecords }).examAttempts,
      weights,
      { attendanceRecords: gradePolicyDataInPeriod({ startDate, endDate }, { submissions: realSubmissions, examAttempts, attendanceRecords }).attendanceRecords, activities: classActivities, acceptedRecordIds, participationScores, p1ExamId, p2ExamId }
    );

    // Mescla com taxas reais de presença
    const enriched = reports.map((rep: StudentGradeReport) => {
      const att = calculateStudentAttendanceRate(rep.studentId, gradePolicyDataInPeriod({ startDate, endDate }, { submissions: realSubmissions, examAttempts, attendanceRecords }).attendanceRecords);
      return {
        ...rep,
        frequenciaPercentual: att.taxaPercentual,
        alertaFrequencia: att.alertaLDB
      };
    });

    setGradeReports(enriched);
  }, [activeClassId, weights, attendanceRecords, roster, realSubmissions, examAttempts, participationScores, p1ExamId, p2ExamId, classActivities, acceptedRecordIds, reviews, reviewMode, startDate, endDate]);

  // Exportar Boletim em CSV
  const handleExportGradebookCSV = () => {
    const headers = isUniversityGradeMode ? ['ID Aluno', 'Nome Aluno', `P1 (${univWeights.p1}%)`, `P2 (${univWeights.p2}%)`, `Labs (${univWeights.labs}%)`, 'Média semestral do modelo', 'Situação no modelo', 'Frequência %', 'Prova P1', 'Prova P2'] : ['ID Aluno', 'Nome Aluno', `Provas (${weights.pesoProvas}%)`, `Labs (${weights.pesoLabs}%)`, `Atividades (${weights.pesoAtividades}%)`, `Participação (${weights.pesoParticipacao}%)`, 'Média Final', 'Situação', 'Frequência %', 'Categorias sem evidência', 'Cobertura dos pesos %'];
    const rows = gradeReports.map(r => isUniversityGradeMode ? [r.studentId, r.studentName, r.notaP1, p1ExamId === p2ExamId ? null : r.notaP2, r.notaLabs, semesterFor(r).mediaSemestre, semesterFor(r).statusUniv, r.frequenciaPercentual, p1ExamId, p2ExamId] : [r.studentId, r.studentName, r.notaProvas, r.notaLabs, r.notaAtividades, r.notaParticipacao, r.mediaFinal, r.situacao, r.frequenciaPercentual, r.missingCategories.join('; '), r.coveragePercent]);
    const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boletim_${currentTurma?.name || 'turma'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────
  // ESTADO: PONDERAÇÃO UNIVERSITÁRIA & SPEEDGRADER AVANÇADO
  // ─────────────────────────────────────────────────────────────
  const [isUniversityGradeMode, setIsUniversityGradeMode] = useState(false);
  const [univWeights, setUnivWeights] = useState({
    p1: 35,
    p2: 35,
    labs: 30,
    minPassDireta: 7.0,
    minExameFinal: 4.0
  });
  const semesterFor = (report: StudentGradeReport) => calculateSemesterGrade({ p1: report.notaP1 ?? null, p2: p1ExamId && p1ExamId === p2ExamId ? null : report.notaP2 ?? null, labs: report.notaLabs }, univWeights);

  // SpeedGrader Submissões e Rubricas Interativas
  useEffect(() => {
    let alive = true;
    setPolicy(null); setPolicyError(''); setPolicyMessage(''); setPolicyReady(false); setPolicySaving(false);
    if (!activeClassId || !currentUser?.uid) return;
    setPolicyLoading(true);
    void getGradePolicy(activeClassId, gradePeriod).then(saved => { if (!alive) return; setPolicy(saved); setPolicyReady(true); setWeights(saved?.weights ?? { ...DEFAULT_WEIGHTS, turmaId: activeClassId }); setParticipationScores(saved?.participationScores ?? {}); setP1ExamId(saved?.p1ExamId ?? ''); setP2ExamId(saved?.p2ExamId ?? ''); setIsUniversityGradeMode(saved?.mode === 'university'); setUnivWeights(saved?.universityWeights ?? { p1: 35, p2: 35, labs: 30, minPassDireta: 7, minExameFinal: 4 }); setPolicyExplanation(saved?.explanation ?? 'As notas são calculadas a partir das últimas entregas avaliadas. Categorias sem evidência permanecem sem nota.'); setReviewMode(saved?.reviewMode ?? 'feedback-only'); setStartDate(saved?.startDate ?? null); setEndDate(saved?.endDate ?? null); }).catch(() => { if (alive) setPolicyError('Não foi possível recuperar os critérios desta turma. Tente novamente para consultar e editar a configuração correta.'); }).finally(() => { if (alive) setPolicyLoading(false); });
    return () => { alive = false; };
  }, [activeClassId, gradePeriod, currentUser?.uid, policyRetry]);
  const policyValues: GradePolicyValues = { classId: activeClassId, period: gradePeriod, professorId: currentUser?.uid ?? '', weights: { ...weights, turmaId: activeClassId }, mode: isUniversityGradeMode ? 'university' : 'school', universityWeights: univWeights, p1ExamId: p1ExamId || null, p2ExamId: p2ExamId || null, participationScores, explanation: policyExplanation, reviewMode, startDate, endDate };
  async function savePolicy() { if (policySaving || policyLoading || !policyReady) return; const requestScope = `${scope}:${gradePeriod}`; setPolicySaving(true); setPolicyError(''); setPolicyMessage(''); try { const saved = await saveGradePolicy({ ...policyValues, expectedVersion: policy?.version ?? 0 }); if (`${scopeRef.current}:${periodRef.current}` !== requestScope) return; setPolicy(saved); setPolicyMessage(`Critérios salvos, versão ${saved.version}. Os alunos desta turma verão a mesma configuração.`); } catch (failure) { if (`${scopeRef.current}:${periodRef.current}` === requestScope) setPolicyError(failure instanceof Error && /pesos|nota|período|datas|critérios|provas|explique|sessão/i.test(failure.message) ? failure.message : 'O salvamento não foi confirmado. As alterações continuam nesta tela; tente novamente.'); } finally { if (`${scopeRef.current}:${periodRef.current}` === requestScope) setPolicySaving(false); } }

  useEffect(() => {
    let alive = true;
    setRoster([]);
    setRealSubmissions([]);
    setExamAttempts([]);
    setClassExams([]);
    setClassActivities([]);
    setAcceptedRecordIds([]);
    setReviews([]);
    setParticipationScores({});
    setP1ExamId('');
    setP2ExamId('');
    setEvidenceError(null);
    if (!activeClassId || !currentUser?.uid) return;
    setEvidenceLoading(true);
    const loadEvidence = async () => {
      try {
        const [report, subs, attempts, exams, activities, savedReviews] = await Promise.all([getLiveClassReport(activeClassId), getSubmissionsByClass(activeClassId), getExamAttemptsByClass(activeClassId), getExamsByClass(activeClassId), getActivitiesByClass(activeClassId), getSubmissionReviewsByClass(activeClassId)]);
        if (!alive) return;
        if (!report) throw new Error('Turma indisponível.');
        setRoster(report.students.map(student => ({ id: student.studentId, name: student.studentName })));
        setRealSubmissions(subs);
        setExamAttempts(attempts);
        setClassExams(exams);
        setClassActivities(activities);
        setReviews(savedReviews);
        setAcceptedRecordIds(report.students.flatMap(student => student.records.map(record => record.id)));
      } catch (e) {
        if (alive) setEvidenceError('Não foi possível carregar os registros da turma. Troque de turma ou recarregue para tentar novamente.');
        console.warn('Erro ao carregar evidências da turma:', e);
      } finally {
        if (alive) setEvidenceLoading(false);
      }
    };
    void loadEvidence();
    return () => { alive = false; };
  }, [activeClassId, currentUser?.uid]);

  const submissionsList = realSubmissions.filter(submission => submission.id && acceptedRecordIds.includes(submission.id)).map((s, idx) => ({
    id: s.id || `sub_real_${idx}`,
    studentId: s.studentId,
    activityTitle: s.activityTitle || 'Atividade Prática de Laboratório',
    studentName: s.studentName || 'Estudante',
    score: s.evidence?.stage === 'exploration' ? null : Number.isFinite(s.score) && s.score >= 0 && s.score <= 100 ? s.score : null,
    status: s.status,
    submittedAt: Number.isFinite(Date.parse(s.submittedAt)) ? new Date(s.submittedAt).toLocaleString('pt-BR') : 'Data não informada',
    hypothesis: s.evidence?.observations?.map(observation => observation.hypothesis).filter(Boolean).join('\n') || s.evidence?.reflection || 'Não informada pelo estudante.',
    telemetry: s.evidence?.experiment ? { ...s.evidence.experiment.parameters, ...s.evidence.experiment.telemetry, 'Amostras registradas': s.evidence.experiment.samples } : s.answers ?? {},
    activeSeconds: s.evidence?.activeSeconds ?? null,
    questions: s.evidence?.questions ?? []
  }));
  const selectedSubIndex = Math.max(0, submissionsList.findIndex(submission => submission.id === navigation.get('submission')));
  const setSelectedSubIndex = (value: React.SetStateAction<number>) => { const index = typeof value === 'function' ? value(selectedSubIndex) : value; const selected = submissionsList[index]; if (selected) setNavigation(previous => { const next = new URLSearchParams(previous); next.set('submission', selected.id); next.set('student', selected.studentId); return next; }); };

  // Atalhos de teclado ergonômicos no SpeedGrader: J (próximo aluno) e K (aluno anterior)
  useEffect(() => {
    if (subTab !== 'speedgrader' || !submissionsList.length) return;

    const handleKeyNavigation = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setSelectedSubIndex(prev => Math.min(submissionsList.length - 1, prev + 1));
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSelectedSubIndex(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [subTab, submissionsList.length,setSelectedSubIndex]);


  // 3. ESTADO DO FÓRUM PEDAGÓGICO DA TURMA
  // ─────────────────────────────────────────────────────────────
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState('Física');
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [forumMutation, setForumMutation] = useState(false);
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState('');
  const [forumRetry, setForumRetry] = useState(0);
  const [forumToast, setForumToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [forumFilter, setForumFilter] = useState<'all' | 'unanswered' | 'answered'>('all');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setForumToast({ msg, type });
    setTimeout(() => setForumToast(previous => previous?.msg === msg ? null : previous), 3500);
  };

  // Formata o nome do docente sem duplicação de 'Prof.'
  const profDisplayName = professorName?.toLowerCase().startsWith('prof')
    ? professorName
    : `Prof. ${professorName || 'Docente'}`;

  // Inscreve no fórum da turma em tempo real
  useEffect(() => {
    let alive = true;
    setForumTopics([]); setSelectedTopic(null); setForumError(''); setForumToast(null);
    setReplyText(''); setSendingReply(false); setCreatingTopic(false); setForumMutation(false);
    if (!activeClassId || !currentUser?.uid) return;
    setForumLoading(true);
    const unsub = subscribeForumTopicsByClass(activeClassId, (topics) => {
      if (!alive) return;
      setForumTopics(topics);
      setForumLoading(false);
      setSelectedTopic(previous => previous ? topics.find(topic => topic.id === previous.id) ?? null : null);
    }, () => {
      if (alive) { setForumLoading(false); setForumError('Não foi possível carregar o fórum desta turma. Tente novamente.'); }
    });
    return () => { alive = false; unsub(); };
  }, [activeClassId, currentUser?.uid, forumRetry]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingTopic || !currentUser?.uid || !newTopicTitle.trim() || !newTopicContent.trim() || !activeClassId) return;
    const requestScope = scope;
    setCreatingTopic(true);
    try {
      const created = await saveForumTopic({
        turmaId: activeClassId,
        titulo: newTopicTitle.trim(),
        conteudo: newTopicContent.trim(),
        autorId: currentUser.uid,
        autorNome: profDisplayName,
        autorRole: 'professor',
        disciplina: newTopicSubject
      });

      if (scopeRef.current !== requestScope) return;
      setForumTopics(prev => [created, ...prev.filter(t => t.id !== created.id)]);
      setSelectedTopic(created);
      setNewTopicTitle('');
      setNewTopicContent('');
      setIsCreatingTopic(false);
      showToast('Novo tópico de discussão criado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao criar tópico:', err);
      if (scopeRef.current === requestScope) showToast('Não foi possível publicar o tópico. O texto continua no formulário; tente novamente.', 'error');
    } finally { if (scopeRef.current === requestScope) setCreatingTopic(false); }
  };

  const handleSendReply = async () => {
    if (sendingReply || !currentUser?.uid || !selectedTopic?.id || !replyText.trim() || !activeClassId) return;
    const requestScope = scope, topicId = selectedTopic.id;
    setSendingReply(true);
    try {
      const newReply = await addForumReply(activeClassId, selectedTopic.id, {
        autorId: currentUser.uid,
        autorNome: profDisplayName,
        autorRole: 'professor',
        texto: replyText.trim()
      });

      if (scopeRef.current !== requestScope) return;
      // Atualiza apenas depois de o repositório confirmar o envio.
      setSelectedTopic(prev => {
        if (!prev || prev.id !== topicId) return prev;
        const currentList = prev.respostas || [];
        const exists = currentList.some(r => r.id === newReply.id);
        if (exists) return prev;
        return {
          ...prev,
          respostas: [...currentList, newReply]
        };
      });

      // Atualização otimista imediata da lista de tópicos
      setForumTopics(prev => prev.map(top => {
        if (top.id === selectedTopic.id) {
          const currentList = top.respostas || [];
          const exists = currentList.some(r => r.id === newReply.id);
          if (exists) return top;
          return {
            ...top,
            respostas: [...currentList, newReply]
          };
        }
        return top;
      }));

      setReplyText('');
      showToast('Resposta do professor publicada com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao enviar resposta no fórum:', err);
      if (scopeRef.current === requestScope) showToast('Erro ao enviar resposta. O texto foi mantido; verifique a conexão e tente novamente.', 'error');
    } finally {
      if (scopeRef.current === requestScope) setSendingReply(false);
    }
  };

  const handleToggleBestReply = async (replyId?: string, currentStatus?: boolean) => {
    if (forumMutation || !selectedTopic?.id || !replyId || !activeClassId) return;
    const requestScope = scope, topicId = selectedTopic.id;
    const newStatus = !currentStatus;
    setForumMutation(true);
    try {
      await markForumBestReply(activeClassId, selectedTopic.id, replyId, newStatus);
      if (scopeRef.current !== requestScope) return;
      setSelectedTopic(prev => {
        if (!prev || prev.id !== topicId) return prev;
        return {
          ...prev,
          respostas: (prev.respostas || []).map(r => ({
            ...r,
            isMelhorResposta: r.id === replyId ? newStatus : (newStatus ? false : r.isMelhorResposta)
          }))
        };
      });
      showToast(newStatus ? 'Resposta destacada como a melhor da discussão.' : 'Destaque removido.', 'success');
    } catch (err) {
      console.error('Erro ao marcar melhor resposta:', err);
      if (scopeRef.current === requestScope) showToast('Não foi possível salvar o destaque. Tente novamente.', 'error');
    } finally { if (scopeRef.current === requestScope) setForumMutation(false); }
  };

  const handleDeleteTopic = async (topicId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (forumMutation || !activeClassId || !topicId) return;
    if (!window.confirm('Tem certeza de que deseja excluir este tópico da turma?')) return;
    const requestScope = scope;
    setForumMutation(true);
    try {
      await deleteForumTopic(activeClassId, topicId);
      if (scopeRef.current !== requestScope) return;
      setForumTopics(prev => prev.filter(t => t.id !== topicId));
      if (selectedTopic?.id === topicId) setSelectedTopic(null);
      showToast('Tópico removido com sucesso.', 'success');
    } catch (err) {
      console.error('Erro ao excluir tópico:', err);
      if (scopeRef.current === requestScope) showToast('Falha ao excluir tópico.', 'error');
    } finally { if (scopeRef.current === requestScope) setForumMutation(false); }
  };

  const handleDeleteReply = async (replyId?: string) => {
    if (forumMutation || !selectedTopic?.id || !replyId || !activeClassId) return;
    if (!window.confirm('Deseja realmente remover esta resposta?')) return;
    const requestScope = scope, topicId = selectedTopic.id;
    setForumMutation(true);
    try {
      await deleteForumReply(activeClassId, selectedTopic.id, replyId);
      if (scopeRef.current !== requestScope) return;
      setSelectedTopic(prev => prev?.id === topicId ? {
        ...prev,
        respostas: (prev.respostas || []).filter(r => r.id !== replyId)
      } : prev);
      setForumTopics(prev => prev.map(top => {
        if (top.id === selectedTopic.id) {
          return {
            ...top,
            respostas: (top.respostas || []).filter(r => r.id !== replyId)
          };
        }
        return top;
      }));
      showToast('Resposta removida.', 'success');
    } catch (err) {
      console.error('Erro ao excluir resposta:', err);
      if (scopeRef.current === requestScope) showToast('Falha ao remover resposta.', 'error');
    } finally { if (scopeRef.current === requestScope) setForumMutation(false); }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. ESTADO DE CERTIFICADOS DIGITAIS & VALIDAÇÃO
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fade-in professor-lms" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {evidenceError && <p role="alert">{evidenceError}</p>}
      {evidenceLoading ? <p role="status">Carregando estudantes e entregas da turma…</p> : !roster.length && <p role="status">Esta turma ainda não tem estudantes matriculados. Os registros aparecerão depois da matrícula e do envio das atividades.</p>}
      {/* Seletor de Turma & Sub-navegação do Módulo LMS */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Turma Ativa:</span>
          <select
            value={activeClassId}
            aria-label="Turma ativa no diário"
            disabled={savingAttendance || policySaving || sendingReply || creatingTopic || forumMutation}
            onChange={(e) => onSelectClass(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-sm, 10px)',
              border: '1px solid var(--border-color, #E2D7C3)',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {turmas.map(t => (
              <option key={t.id} value={t.id} style={{ background: 'var(--color-neutral-500, #F1EAD9)', color: 'var(--color-secondary-dark, #172314)' }}>
                {t.name} (Código: {t.code || t.id.slice(0, 6)})
              </option>
            ))}
          </select>
        </div>

        {/* Sub-tabs Moodle LMS */}
        <div className="lms-subnavigation" style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-card)', padding: '0.3rem', borderRadius: 'var(--radius-sm, 10px)' }}>
          {[
            { id: 'attendance', label: 'Diário & Frequência', icon: Calendar },
            { id: 'gradebook', label: 'Livro de Notas', icon: Award },
            { id: 'speedgrader', label: 'Corrigir entregas', icon: CheckCircle },
            { id: 'forum', label: `Fórum da Turma (${forumTopics.length})`, icon: MessageSquare },
            { id: 'certificates', label: 'Certificação Digital', icon: ShieldCheck },
            { id: 'lab_studio', label: 'Criar laboratório', icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
              aria-pressed={subTab===tab.id}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: 'var(--radius-sm, 10px)',
                border: 'none',
                background: subTab === tab.id ? 'var(--color-primary, #E4683F)' : 'transparent',
                color: subTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: subTab === tab.id ? 800 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon style={{ width: '0.9rem', height: '0.9rem' }} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. SUB-ABA: DIÁRIO DE CLASSE & FREQUÊNCIA
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'attendance' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {attendanceLoading && <p role="status">Carregando chamadas registradas…</p>}
          {attendanceError && <div role="alert"><p>{attendanceError}</p>{!isRecordingAttendance && <button type="button" onClick={() => setAttendanceRetry(previous => previous + 1)}>Tentar carregar novamente</button>}</div>}
          {attendanceMessage && <p role="status">{attendanceMessage}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ color: 'var(--color-secondary, #293E24)', width: '1.4rem', height: '1.4rem' }} />
                Diário de classe & controle de frequência
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Registre presença, falta ou falta justificada. O percentual considera as aulas registradas; faltas justificadas não são contadas como presença.
              </p>
            </div>
            <button
              onClick={handleOpenAttendanceModal}
              disabled={evidenceLoading || attendanceLoading || !!attendanceError || !roster.length}
              className="btn-gradient"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 700 }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Registrar Chamada do Dia
            </button>
          </div>

          {/* Modal / Card para Registro de Chamada */}
          {isRecordingAttendance && (
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color, #E2D7C3)', background: 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  📝 Realizar Chamada Escolar
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    disabled={savingAttendance}
                    onClick={() => {
                      const allPres: Record<string, 'presente' | 'falta' | 'justificada'> = {};
                      roster.forEach(s => { allPres[s.id] = 'presente'; });
                      setAttendanceStatusMap(allPres);
                    }}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ✓ Marcar Todos Presentes
                  </button>
                  <button
                    disabled={savingAttendance}
                    onClick={() => setIsRecordingAttendance(false)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label htmlFor="attendance-date" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Data da Aula</label>
                  <input
                    id="attendance-date"
                    disabled={savingAttendance}
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => selectAttendanceDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label htmlFor="attendance-content" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Conteúdo trabalhado</label>
                  <input
                    id="attendance-content"
                    disabled={savingAttendance}
                    type="text"
                    value={attendanceContent}
                    onChange={(e) => setAttendanceContent(e.target.value)}
                    placeholder="Ex: Leis de Newton aplicadas no Simulador Interativo de Dinâmica"
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Roster de Chamada Rápida */}
              {attendanceRecords.some(record => record.data === attendanceDate && !record.aulaNumero) && <p role="status">Já existe uma chamada nesta data. As marcações salvas foram recuperadas; salvar atualiza esse registro.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Lista de Alunos da Turma:</div>
                {roster.map(student => {
                  const currentStatus = attendanceStatusMap[student.id];
                  return (
                    <div
                      key={student.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {student.name}
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          disabled={savingAttendance}
                          aria-pressed={currentStatus === 'presente'}
                          onClick={() => setAttendanceStatusMap(prev => ({ ...prev, [student.id]: 'presente' }))}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: currentStatus === 'presente' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                            background: currentStatus === 'presente' ? 'rgba(16,185,129,0.25)' : 'rgba(0,0,0,0.2)',
                            color: currentStatus === 'presente' ? '#10b981' : 'var(--text-muted)'
                          }}
                        >
                          Presente
                        </button>
                        <button
                          type="button"
                          disabled={savingAttendance}
                          aria-pressed={currentStatus === 'falta'}
                          onClick={() => setAttendanceStatusMap(prev => ({ ...prev, [student.id]: 'falta' }))}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: currentStatus === 'falta' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                            background: currentStatus === 'falta' ? 'rgba(239,68,68,0.25)' : 'rgba(0,0,0,0.2)',
                            color: currentStatus === 'falta' ? '#ef4444' : 'var(--text-muted)'
                          }}
                        >
                          Falta
                        </button>
                        <button
                          type="button"
                          disabled={savingAttendance}
                          aria-pressed={currentStatus === 'justificada'}
                          onClick={() => setAttendanceStatusMap(prev => ({ ...prev, [student.id]: 'justificada' }))}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: currentStatus === 'justificada' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                            background: currentStatus === 'justificada' ? 'rgba(245,158,11,0.25)' : 'rgba(0,0,0,0.2)',
                            color: currentStatus === 'justificada' ? '#f59e0b' : 'var(--text-muted)'
                          }}
                        >
                          Falta justificada
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  disabled={savingAttendance}
                  onClick={() => setIsRecordingAttendance(false)}
                  className="btn-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance || !attendanceDate || !attendanceContent.trim() || !roster.length || roster.some(student => !attendanceStatusMap[student.id])}
                  className="btn-gradient"
                  style={{ padding: '0.6rem 1.75rem', fontWeight: 800 }}
                >
                  {savingAttendance ? 'Salvando...' : 'Salvar Chamada'}
                </button>
              </div>
            </div>
          )}

          {/* Tabela de Assiduidade Geral dos Alunos */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users style={{ width: '1.2rem', height: '1.2rem', color: 'var(--color-secondary, #293E24)' }} />
              Presença nas aulas registradas (referência de alerta: 75%)
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Estudante</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Aulas Realizadas</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Presenças</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Faltas</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Frequência</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Frequência registrada</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map(student => {
                    const stats = calculateStudentAttendanceRate(student.id, attendanceRecords);
                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {student.name}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>
                          {stats.totalAulas} aulas
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: '#10b981', fontWeight: 700 }}>
                          {stats.presencas}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: stats.faltas > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                          {stats.faltas}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ width: `${stats.taxaPercentual ?? 0}%`, height: '100%', background: stats.alertaLDB ? '#ef4444' : '#10b981' }} />
                            </div>
                            <span style={{ fontWeight: 800, color: stats.alertaLDB ? '#ef4444' : '#10b981' }}>
                              {stats.taxaPercentual === null ? 'Sem chamada' : `${stats.taxaPercentual ?? 0}%`}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          {stats.taxaPercentual === null ? <span>Sem chamada registrada</span> : stats.alertaLDB ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>
                              <AlertTriangle style={{ width: '0.85rem', height: '0.85rem' }} />
                              Atenção: abaixo de 75%
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.78rem', fontWeight: 700 }}>
                              <CheckCircle style={{ width: '0.85rem', height: '0.85rem' }} />
                              Regular
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico das Chamadas Efetuadas */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              📋 Histórico de Aulas e Chamadas Registradas
            </h3>
            {attendanceRecords.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Nenhuma chamada registrada nesta turma ainda. Clique no botão acima para registrar a primeira aula!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {attendanceRecords.map(rec => {
                  const presentCount = rec.registros.filter(r => r.status === 'presente').length;
                  const total = rec.registros.length;
                  const perc = total > 0 ? Math.round((presentCount / total) * 100) : 0;
                  return (
                    <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color, #E2D7C3)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>{rec.data}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>— {rec.conteudoResumo || 'Aula Prática'}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Presenças: {presentCount} de {total} estudantes ({perc}%)
                        </span>
                      </div>
                      <span style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', background: perc >= 75 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: perc >= 75 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                        {perc}% Assiduidade
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. SUB-ABA: LIVRO DE NOTAS & BOLETIM PONDERADO
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'gradebook' && (
        <div className="fade-in">
          {!policyReady && !policyLoading && policyError && <button type="button" onClick={() => setPolicyRetry(previous => previous + 1)}>Tentar carregar critérios novamente</button>}
          <fieldset disabled={policyLoading || policySaving || !policyReady} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, border: 0, padding: 0, margin: 0 }}>
          <section className="professor-workflow card" style={{padding:16,marginBottom:16}} aria-label="Critérios compartilhados do boletim">
            <h2>Critérios de avaliação da turma</h2><p>Salve a configuração para que os estudantes consultem os mesmos pesos e regras. Alterações ainda não salvas valem apenas nesta tela.</p>
            <div className="workflow-grid"><label>Período<select value={gradePeriod} onChange={event=>setNavigation(previous=>{const next=new URLSearchParams(previous);next.set('gradePeriod',event.target.value);return next;})}>{GRADE_PERIODS.map(value=><option key={value} value={value}>{value==='atual'?'Histórico completo':value}</option>)}</select></label><label>Data inicial<input type="date" value={startDate||''} onChange={event=>setStartDate(event.target.value||null)} /></label><label>Data final<input type="date" value={endDate||''} onChange={event=>setEndDate(event.target.value||null)} /></label><label>Uso dos pareceres publicados<select value={reviewMode} onChange={event=>setReviewMode(event.target.value as GradePolicy['reviewMode'])}><option value="feedback-only">Orientação separada da nota automática</option><option value="replace-submission-score">Usar a nota do parecer nas entregas corrigidas</option></select></label></div>
            <label>Explicação para os estudantes<textarea rows={3} value={policyExplanation} onChange={event=>setPolicyExplanation(event.target.value)} maxLength={4000} /></label>
            {policyLoading&&<p role="status">Carregando critérios salvos…</p>}{policyError&&<p role="alert">{policyError}</p>}{policyMessage&&<p role="status">{policyMessage}</p>}
            <button className="btn-primary" disabled={policyLoading||policySaving||!policyReady||!activeClassId} onClick={()=>void savePolicy()}>{policySaving?'Salvando…':'Salvar critérios para a turma'}</button>{policy&&<p>Versão {policy.version} · {new Date(policy.updatedAt).toLocaleString('pt-BR')}. {policy.history.length} alterações anteriores registradas.</p>}
          </section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award style={{ color: 'var(--color-primary-accessible, #B8441F)', width: '1.4rem', height: '1.4rem' }} />
                Livro de notas & boletim ponderado (Gradebook)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Notas de 0 a 10 a partir das entregas avaliadas. A média final aparece quando todas as categorias com peso têm evidência. Salve os critérios para compartilhar os pesos e as regras com os estudantes.
              </p>
            </div>
            <button
              onClick={handleExportGradebookCSV}
              disabled={evidenceLoading || !gradeReports.length}
              className="btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 700 }}
            >
              <Download style={{ width: '1rem', height: '1rem' }} />
              Exportar boletim (CSV)
            </button>
          </div>

          {/* Seletor de Modelo de Avaliação: Ensino Básico vs Universitário */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '10px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
            <button
              onClick={() => setIsUniversityGradeMode(false)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: !isUniversityGradeMode ? 'var(--color-primary, #E4683F)' : 'transparent',
                color: !isUniversityGradeMode ? '#fff' : 'var(--text-secondary)',
                fontWeight: !isUniversityGradeMode ? 800 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🏫 Educação Básica / Médio (Média 6.0)
            </button>
            <button
              onClick={() => setIsUniversityGradeMode(true)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: isUniversityGradeMode ? 'var(--color-primary, #E4683F)' : 'transparent',
                color: isUniversityGradeMode ? '#fff' : 'var(--text-secondary)',
                fontWeight: isUniversityGradeMode ? 800 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🎓 Modelo semestral (P1 + P2 + Labs)
            </button>
          </div>

          {/* Configuração dos Pesos Avaliativos */}
          <div className="glass-card" style={{ padding: '1.25rem', background: 'transparent' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary, #293E24)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {isUniversityGradeMode ? 'Pesos Ponderados Universitários (%):' : 'Pesos de avaliação bimestral (%):'}
            </div>
            {!isUniversityGradeMode ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>📝 Provas Formais</label>
                  <input aria-label="📝 Provas Formais"
                    type="number"
                    value={weights.pesoProvas}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoProvas: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🔬 Laboratórios Virtuais</label>
                  <input aria-label="🔬 Laboratórios Virtuais"
                    type="number"
                    value={weights.pesoLabs}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoLabs: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>📄 Atividades Práticas</label>
                  <input aria-label="📄 Atividades Práticas"
                    type="number"
                    value={weights.pesoAtividades}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoAtividades: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>💬 Participação & Fórum</label>
                  <input aria-label="💬 Participação & Fórum"
                    type="number"
                    value={weights.pesoParticipacao}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoParticipacao: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div><label htmlFor="gradebook-p1">Prova usada como P1</label><select id="gradebook-p1" value={p1ExamId} onChange={event => setP1ExamId(event.target.value)}><option value="">Selecione uma prova</option>{classExams.map(exam => <option key={exam.id} value={exam.id}>{exam.titulo}</option>)}</select></div>
                <div><label htmlFor="gradebook-p2">Prova usada como P2</label><select id="gradebook-p2" value={p2ExamId} onChange={event => setP2ExamId(event.target.value)}><option value="">Selecione outra prova</option>{classExams.map(exam => <option key={exam.id} value={exam.id} disabled={exam.id === p1ExamId}>{exam.titulo}</option>)}</select></div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>📚 Prova Teórica 1 (P1)</label>
                  <input aria-label="📚 Prova Teórica 1 (P1)"
                    type="number"
                    value={univWeights.p1}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, p1: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>📚 Prova Teórica 2 (P2)</label>
                  <input aria-label="📚 Prova Teórica 2 (P2)"
                    type="number"
                    value={univWeights.p2}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, p2: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🔬 Prática / Laboratórios</label>
                  <input aria-label="🔬 Prática / Laboratórios"
                    type="number"
                    value={univWeights.labs}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, labs: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🎯 Nota de Corte Direta</label>
                  <input aria-label="🎯 Nota de Corte Direta"
                    type="number"
                    step="0.5"
                    value={univWeights.minPassDireta}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, minPassDireta: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tabela de Boletim Escolar / Universitário */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Estudante</th>
                    {!isUniversityGradeMode ? (
                      <>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Provas ({weights.pesoProvas}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Labs ({weights.pesoLabs}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Atividades ({weights.pesoAtividades}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Participação ({weights.pesoParticipacao}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Média Final</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Situação</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '0.75rem 0.5rem' }}>P1 ({univWeights.p1}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>P2 ({univWeights.p2}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Labs ({univWeights.labs}%)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Média Semestral</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Exame Final (Mínimo)</th>
                        <th style={{ padding: '0.75rem 0.5rem' }}>Status Universitário</th>
                      </>
                    )}
                    <th style={{ padding: '0.75rem 0.5rem' }}>Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeReports.map(rep => {
                    if (!isUniversityGradeMode) {
                      return (
                        <tr key={rep.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                            {rep.studentName}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700 }}>
                            {formatGrade(rep.notaProvas)}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-secondary, #293E24)', fontWeight: 700 }}>
                            {formatGrade(rep.notaLabs)}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', color: '#10b981', fontWeight: 700 }}>
                            {formatGrade(rep.notaAtividades)}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', color: '#f59e0b', fontWeight: 700 }}>
                            <input type="number" min="0" max="10" step="0.5" aria-label={`Nota de participação de ${rep.studentName}`} value={participationScores[rep.studentId] ?? ''} placeholder="Sem nota" style={{ width: '90px' }} onChange={event => setParticipationScores(previous => { const next = { ...previous }; if (event.target.value === '') delete next[rep.studentId]; else next[rep.studentId] = Number(event.target.value); return next; })} />
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem', fontSize: '1rem', fontWeight: 900, color: rep.mediaFinal === null ? 'var(--text-muted)' : rep.mediaFinal >= 6.0 ? '#10b981' : rep.mediaFinal >= 4.0 ? '#f59e0b' : '#ef4444' }}>
                            {formatGrade(rep.mediaFinal)}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span
                              style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                background: rep.situacao === 'Aprovado' ? 'rgba(16,185,129,0.15)' : rep.situacao === 'Recuperação' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                                color: rep.situacao === 'Aprovado' ? '#10b981' : rep.situacao === 'Recuperação' ? '#f59e0b' : '#ef4444'
                              }}
                            >
                              {rep.situacao}
                            </span>
                            {rep.missingCategories.length > 0 && <small style={{ display: 'block', color: 'var(--text-secondary)' }}>Aguardando: {rep.missingCategories.join(', ')}. Cobertura: {rep.coveragePercent}% dos pesos.</small>}
                          </td>
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span style={{ fontWeight: 700, color: rep.alertaFrequencia ? '#ef4444' : 'var(--text-secondary)' }}>
                              {rep.frequenciaPercentual === null ? 'Sem chamada' : `${rep.frequenciaPercentual}%`}
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    // Cálculo da Média Ponderada Universitária
                    const p1 = rep.notaP1 ?? null;
                    const p2 = p1ExamId && p1ExamId === p2ExamId ? null : rep.notaP2 ?? null;
                    const labs = rep.notaLabs;
                    const { mediaSemestre, statusUniv, notaExameNecessaria } = semesterFor(rep);

                    return (
                      <tr key={rep.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {rep.studentName}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700 }}>
                          {formatGrade(p1)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: '#38bdf8', fontWeight: 700 }}>
                          {formatGrade(p2)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--color-secondary, #293E24)', fontWeight: 700 }}>
                          {formatGrade(labs)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontSize: '1rem', fontWeight: 900, color: mediaSemestre === null ? 'var(--text-muted)' : mediaSemestre >= 7.0 ? '#10b981' : mediaSemestre >= 4.0 ? '#f59e0b' : '#ef4444' }}>
                          {formatGrade(mediaSemestre)}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 700, color: notaExameNecessaria === '-' ? 'var(--text-muted)' : '#f59e0b' }}>
                          {mediaSemestre === null ? 'Aguardando notas' : notaExameNecessaria !== '-' ? `Nota ≥ ${notaExameNecessaria}` : statusUniv === 'Aprovado no modelo' ? 'Dispensado' : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: statusUniv === 'Aprovado no modelo' ? 'rgba(16,185,129,0.15)' : statusUniv === 'Exame final no modelo' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                              color: statusUniv === 'Aprovado no modelo' ? '#10b981' : statusUniv === 'Exame final no modelo' ? '#f59e0b' : '#ef4444'
                            }}
                          >
                            {statusUniv}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span style={{ fontWeight: 700, color: rep.alertaFrequencia ? '#ef4444' : 'var(--text-secondary)' }}>
                            {rep.frequenciaPercentual === null ? 'Sem chamada' : `${rep.frequenciaPercentual}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </fieldset>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SUB-ABA: FÓRUM PEDAGÓGICO DA TURMA
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'forum' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {forumLoading && <p role="status">Carregando discussões da turma…</p>}
          {forumError && <div role="alert"><p>{forumError}</p><button type="button" onClick={() => setForumRetry(previous => previous + 1)}>Tentar carregar fórum novamente</button></div>}
          {/* Toast Notification do Fórum */}
          {forumToast && (
            <div role={forumToast.type === 'error' ? 'alert' : 'status'} style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: forumToast.type === 'success' ? 'rgba(16,185,129,0.92)' : 'rgba(239,68,68,0.92)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {forumToast.type === 'success' ? <CheckCircle style={{ width: '1.1rem', height: '1.1rem' }} /> : <AlertTriangle style={{ width: '1.1rem', height: '1.1rem' }} />}
                <span>{forumToast.msg}</span>
              </div>
              <button onClick={() => setForumToast(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare style={{ color: 'var(--color-primary-accessible, #B8441F)', width: '1.4rem', height: '1.4rem' }} />
                Fórum pedagógico & discussões acadêmicas
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Ambiente colaborativo para esclarecimento de dúvidas conceituais, debates científicos e respostas oficiais do corpo docente.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingTopic(!isCreatingTopic)}
              className="btn-gradient"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 700 }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Novo Tópico de Discussão
            </button>
          </div>

          {/* Form para Criar Tópico */}
          {isCreatingTopic && (
            <form onSubmit={handleCreateTopic} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color, #E2D7C3)' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                💬 Abrir Novo Tópico com a Turma
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="forum-topic-title" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Título da Discussão</label>
                  <input
                    id="forum-topic-title"
                    disabled={creatingTopic}
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="Ex: Discussão sobre o efeito estufa no simulador de termodinâmica"
                    required
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Disciplina</label>
                  <select aria-label="Disciplina"
                    disabled={creatingTopic}
                    value={newTopicSubject}
                    onChange={(e) => setNewTopicSubject(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: '#fff', fontSize: '0.9rem' }}
                  >
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biologia">Biologia</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Geral">Geral / Avisos</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="forum-topic-content" style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mensagem Inicial / Pergunta Orientadora</label>
                <textarea
                  id="forum-topic-content"
                  disabled={creatingTopic}
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={3}
                  placeholder="Compartilhe uma pergunta instigante ou instruções para os estudantes participarem..."
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" disabled={creatingTopic} onClick={() => setIsCreatingTopic(false)} className="btn-outline" style={{ padding: '0.55rem 1.15rem' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={creatingTopic || !newTopicTitle.trim() || !newTopicContent.trim()} className="btn-gradient" style={{ padding: '0.55rem 1.5rem', fontWeight: 700 }}>
                  {creatingTopic ? 'Publicando tópico…' : 'Publicar Tópico'}
                </button>
              </div>
            </form>
          )}

          {/* Barra de Filtros dos Tópicos */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.25rem' }}>
              <Filter style={{ width: '0.85rem', height: '0.85rem' }} /> Filtrar:
            </span>
            <button
              onClick={() => setForumFilter('all')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: forumFilter === 'all' ? 700 : 500,
                background: forumFilter === 'all' ? 'rgba(228, 104, 63, 0.15)' : 'transparent',
                border: forumFilter === 'all' ? '1px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color, #E2D7C3)',
                color: forumFilter === 'all' ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Todos ({forumTopics.length})
            </button>
            <button
              onClick={() => setForumFilter('unanswered')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: forumFilter === 'unanswered' ? 700 : 500,
                background: forumFilter === 'unanswered' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                border: forumFilter === 'unanswered' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                color: forumFilter === 'unanswered' ? '#f59e0b' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              ⏳ Aguardando Professor ({forumTopics.filter(t => !t.respostas?.some(r => r.autorRole === 'professor')).length})
            </button>
            <button
              onClick={() => setForumFilter('answered')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: forumFilter === 'answered' ? 700 : 500,
                background: forumFilter === 'answered' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)',
                border: forumFilter === 'answered' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                color: forumFilter === 'answered' ? '#10b981' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              ✓ Respondidos ({forumTopics.filter(t => t.respostas?.some(r => r.autorRole === 'professor')).length})
            </button>
          </div>

          {/* Grid de Tópicos e Visualizador de Thread */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedTopic ? '1fr 1.6fr' : '1fr', gap: '1.5rem' }}>
            {/* Lista de Tópicos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                const displayedTopics = forumTopics.filter(t => {
                  const hasProf = t.respostas?.some(r => r.autorRole === 'professor');
                  if (forumFilter === 'unanswered') return !hasProf;
                  if (forumFilter === 'answered') return hasProf;
                  return true;
                });

                if (displayedTopics.length === 0) {
                  return (
                    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        {forumTopics.length === 0
                          ? 'Nenhum tópico criado nesta turma ainda. Abra a primeira discussão!'
                          : 'Nenhum tópico corresponde ao filtro selecionado.'}
                      </p>
                    </div>
                  );
                }

                return displayedTopics.map(top => {
                  const isSelected = selectedTopic?.id === top.id;
                  const hasProfReply = top.respostas?.some(r => r.autorRole === 'professor');
                  return (
                    <div
                      key={top.id}
                      onClick={() => { if (!sendingReply && !forumMutation) { setSelectedTopic(top); setReplyText(''); } }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={event => { if (event.currentTarget === event.target && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); if (!sendingReply && !forumMutation) { setSelectedTopic(top); setReplyText(''); } } }}
                      className="glass-card"
                      style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color, #E2D7C3)',
                        background: isSelected ? 'rgba(228, 104, 63, 0.08)' : 'transparent',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-secondary, #293E24)', background: 'var(--color-neutral-300, #E2D7C3)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {top.disciplina || 'Ciências'}
                          </span>
                          {hasProfReply ? (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                              ✓ Respondido
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245,158,11,0.3)' }}>
                              ⏳ Aguarda Professor
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(top.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                          <button
                            type="button"
                            disabled={forumMutation || sendingReply}
                            onClick={(e) => handleDeleteTopic(top.id, e)}
                            title="Excluir tópico"
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                          >
                            <Trash2 style={{ width: '0.85rem', height: '0.85rem' }} />
                          </button>
                        </div>
                      </div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                        {top.titulo}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {top.conteudo}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>Por: <strong style={{ color: 'var(--text-main)' }}>{top.autorNome}</strong></span>
                        <span style={{ color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700 }}>
                          💬 {top.respostas?.length || 0} respostas
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Thread de Discussão Selecionada */}
            {selectedTopic && (
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                <div style={{ borderBottom: '1px solid var(--border-color, #E2D7C3)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>{selectedTopic.disciplina}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        disabled={forumMutation || sendingReply}
                        onClick={(e) => handleDeleteTopic(selectedTopic.id, e)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Trash2 style={{ width: '0.8rem', height: '0.8rem' }} /> Excluir Tópico
                      </button>
                      <button onClick={() => setSelectedTopic(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Fechar</button>
                    </div>
                  </div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                    {selectedTopic.titulo}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    Criado por <strong style={{ color: 'var(--text-main)' }}>{selectedTopic.autorNome}</strong> em {new Date(selectedTopic.criadoEm).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, background: 'var(--color-neutral-300, #E2D7C3)', padding: '1rem', borderRadius: '8px' }}>
                    {selectedTopic.conteudo}
                  </div>
                </div>

                {/* Respostas encadeadas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', maxHeight: '380px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Respostas da Turma ({selectedTopic.respostas?.length || 0}):
                  </div>

                  {(!selectedTopic.respostas || selectedTopic.respostas.length === 0) ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: 'transparent', borderRadius: '8px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Nenhuma resposta ainda. Escreva uma orientação pedagógica abaixo para ajudar a turma!
                      </p>
                    </div>
                  ) : (
                    selectedTopic.respostas.map(reply => (
                      <div
                        key={reply.id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          border: reply.isMelhorResposta ? '1px solid #f59e0b' : reply.autorRole === 'professor' ? '1px solid var(--color-secondary, #293E24)' : '1px solid var(--border-color, #E2D7C3)',
                          background: reply.isMelhorResposta ? 'rgba(245,158,11,0.08)' : reply.autorRole === 'professor' ? 'rgba(41,62,36,0.08)' : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{reply.autorNome}</strong>
                            {reply.autorRole === 'professor' && (
                              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--color-secondary, #293E24)', color: 'var(--color-neutral-100, #FAF7EE)', fontWeight: 800 }}>
                                PROFESSOR
                              </span>
                            )}
                            {reply.isMelhorResposta && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: '#f59e0b', color: '#000', fontWeight: 800 }}>
                                <Star style={{ width: '0.7rem', height: '0.7rem', fill: '#000' }} />
                                MELHOR RESPOSTA
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {new Date(reply.criadoEm).toLocaleDateString('pt-BR')}
                            </span>
                            <button
                              type="button"
                              disabled={forumMutation || sendingReply}
                              onClick={() => handleDeleteReply(reply.id)}
                              title="Excluir resposta"
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                            >
                              <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                            </button>
                          </div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.45, marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                          {reply.texto}
                        </div>
                        {/* Ação do Professor de Marcar Melhor Resposta */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            disabled={forumMutation || sendingReply}
                            onClick={() => handleToggleBestReply(reply.id, !!reply.isMelhorResposta)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: reply.isMelhorResposta ? '#f59e0b' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontWeight: 700
                            }}
                          >
                            <Star style={{ width: '0.8rem', height: '0.8rem', fill: reply.isMelhorResposta ? '#f59e0b' : 'none' }} />
                            {reply.isMelhorResposta ? 'Desmarcar Melhor Resposta' : 'Destacar como Melhor Resposta'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Caixa de Resposta Aprimorada do Professor */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  background: 'transparent',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm, 10px)',
                  border: '1px solid var(--border-color, #E2D7C3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.82rem', color: 'var(--color-secondary, #293E24)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MessageSquare style={{ width: '0.9rem', height: '0.9rem' }} />
                      Responder como Professor:
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Atalho: <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.68rem' }}>Ctrl</kbd> + <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.68rem' }}>Enter</kbd>
                    </span>
                  </div>
                  <textarea
                    disabled={sendingReply}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escreva uma orientação conceitual, resposta pedagógica ou resolução de dúvida para a turma..."
                    rows={3}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(0,0,0,0.3)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      lineHeight: 1.45
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Sua resposta será publicada com a insígnia oficial de Docente.
                    </span>
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyText.trim()}
                      className="btn-gradient"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        padding: '0.55rem 1.35rem',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: (sendingReply || !replyText.trim()) ? 'not-allowed' : 'pointer',
                        opacity: (sendingReply || !replyText.trim()) ? 0.6 : 1
                      }}
                    >
                      <Send style={{ width: '0.85rem', height: '0.85rem' }} />
                      {sendingReply ? 'Publicando Resposta...' : 'Publicar Resposta'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SUB-ABA: CERTIFICAÇÃO DIGITAL & VALIDAÇÃO MEC/LTI
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'certificates' && <TeacherCertificates key={activeClassId} classId={activeClassId} professorId={currentUser?.uid||''} roster={roster} />}
      {subTab === 'speedgrader' && <TeacherCorrectionWorkspace submissions={realSubmissions.filter(value=>acceptedRecordIds.includes(value.id||''))} selectedId={navigation.get('submission')||submissionsList[selectedSubIndex]?.id} professorId={currentUser?.uid||''} onSelect={id=>setNavigation(previous=>{const next=new URLSearchParams(previous);next.set('submission',id);return next;})} onReviewed={review=>setReviews(previous=>[...previous.filter(value=>value.id!==review.id),review])} />}

      {subTab === 'lab_studio' && <TeacherLabStudio key={currentUser?.uid} professorId={currentUser?.uid || ''} classId={activeClassId} className={currentTurma?.name || ''} onPublish={onPublishActivity} onShare={onOpenMaterials} />}

    </div>
  );
}
