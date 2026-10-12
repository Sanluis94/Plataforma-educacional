import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle, AlertTriangle, XCircle, Award,
  Users, MessageSquare, Plus, ShieldCheck, Download, Star,
  Send, Trash2, Filter
} from 'lucide-react';
import type { Turma } from '../../data/repositories/classRepository';
import type {
  AttendanceRecord,
  ForumTopic,
  GradebookWeights,
  StudentGradeReport,
  DigitalCertificate,
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
  issueCertificate,
  verifyCertificate
} from '../../core/services/certificateService';
import {
  getSubmissionsByClass,
  saveSubmissionReview
} from '../../data/repositories/submissionRepository';
import type { SubmissionData } from '../../data/types';
import { getExamAttemptsByClass, getExamsByClass } from '../../data/repositories/examRepository';
import { getLiveClassReport } from '../../data/repositories/reportRepository';
import { useAuth } from '../../core/contexts/AuthContext';
import { getActivitiesByClass } from '../../data/repositories/activityRepository';

interface ProfessorLmsModulesProps {
  turmas: Turma[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  professorName: string;
}

const formatGrade = (grade: number | null | undefined) => grade == null ? 'Sem dados' : grade.toFixed(1);
const csvCell = (value: unknown) => `"${String(value ?? '').replace(/^[\s]*[=+@-]/, "'$&").replace(/"/g, '""')}"`;

export function ProfessorLmsModules({
  turmas,
  selectedClassId,
  onSelectClass,
  professorName
}: ProfessorLmsModulesProps) {
  const [subTab, setSubTab] = useState<'attendance' | 'gradebook' | 'speedgrader' | 'forum' | 'certificates' | 'lab_studio'>('attendance');

  const activeClassId = selectedClassId || turmas[0]?.id || '';
  const currentTurma = turmas.find(t => t.id === activeClassId);
  const { currentUser } = useAuth();
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

  // ─────────────────────────────────────────────────────────────
  // 1. ESTADO DE FREQUÊNCIA (ATTENDANCE)
  // ─────────────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isRecordingAttendance, setIsRecordingAttendance] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceContent, setAttendanceContent] = useState('');
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, 'presente' | 'falta' | 'justificada'>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Carrega histórico de frequência da turma
  useEffect(() => {
    let alive = true;
    setAttendanceRecords([]);
    if (!activeClassId) return;
    const fetchAttendance = async () => {
      const records = await getAttendanceByClass(activeClassId);
      if (alive) setAttendanceRecords(records);
    };
    fetchAttendance();
    return () => { alive = false; };
  }, [activeClassId]);

  // A chamada é preenchida pelo professor para os estudantes matriculados.
  const handleOpenAttendanceModal = () => {
    const initial: Record<string, 'presente' | 'falta' | 'justificada'> = {};
    setAttendanceStatusMap(initial);
    setAttendanceContent('Aula Prática em Laboratório Virtual & Resolução de Problemas');
    setIsRecordingAttendance(true);
  };

  const handleSaveAttendance = async () => {
    if (!activeClassId || !attendanceContent.trim() || !roster.length || roster.some(student => !attendanceStatusMap[student.id])) return;
    setSavingAttendance(true);
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

      setAttendanceRecords(prev => [saved, ...prev]);
      setIsRecordingAttendance(false);
    } catch (err) {
      console.error('Erro ao salvar chamada:', err);
    } finally {
      setSavingAttendance(false);
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
      realSubmissions,
      examAttempts,
      weights,
      { attendanceRecords, activities: classActivities, acceptedRecordIds, participationScores, p1ExamId, p2ExamId }
    );

    // Mescla com taxas reais de presença
    const enriched = reports.map((rep: StudentGradeReport) => {
      const att = calculateStudentAttendanceRate(rep.studentId, attendanceRecords);
      return {
        ...rep,
        frequenciaPercentual: att.taxaPercentual,
        alertaFrequencia: att.alertaLDB
      };
    });

    setGradeReports(enriched);
  }, [activeClassId, weights, attendanceRecords, roster, realSubmissions, examAttempts, participationScores, p1ExamId, p2ExamId, classActivities, acceptedRecordIds]);

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
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [docenteFeedback, setDocenteFeedback] = useState('');
  const [speedGraderToast, setSpeedGraderToast] = useState<string | null>(null);
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    let alive = true;
    setRoster([]);
    setRealSubmissions([]);
    setExamAttempts([]);
    setClassExams([]);
    setClassActivities([]);
    setAcceptedRecordIds([]);
    setParticipationScores({});
    setP1ExamId('');
    setP2ExamId('');
    setEvidenceError(null);
    if (!activeClassId) return;
    setEvidenceLoading(true);
    const loadEvidence = async () => {
      try {
        const [report, subs, attempts, exams, activities] = await Promise.all([getLiveClassReport(activeClassId), getSubmissionsByClass(activeClassId), getExamAttemptsByClass(activeClassId), getExamsByClass(activeClassId), getActivitiesByClass(activeClassId)]);
        if (!alive) return;
        if (!report) throw new Error('Turma indisponível.');
        setRoster(report.students.map(student => ({ id: student.studentId, name: student.studentName })));
        setRealSubmissions(subs);
        setExamAttempts(attempts);
        setClassExams(exams);
        setClassActivities(activities);
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
  }, [activeClassId]);

  const submissionsList = realSubmissions.filter(submission => submission.id && acceptedRecordIds.includes(submission.id)).map((s, idx) => ({
    id: s.id || `sub_real_${idx}`,
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
  }, [subTab, submissionsList.length]);

  const selectedSubmissionId = submissionsList[selectedSubIndex]?.id ?? submissionsList[0]?.id;
  useEffect(() => {
    setRubricScores({});
    setDocenteFeedback('');
  }, [selectedSubmissionId]);

  // AI Lab Studio (Gerador Zero-Code de Laboratórios)
  const [studioPrompt, setStudioPrompt] = useState('Transferência de Calor e Condução em Barras Metálicas (Lei de Fourier)');
  const [studioSubject, setStudioSubject] = useState('Engenharia Térmica');
  const [isGeneratingStudioLab, setIsGeneratingStudioLab] = useState(false);
  const [generatedLab, setGeneratedLab] = useState<{
    id: string;
    title: string;
    subject: string;
    diffEquation: string;
    params: { name: string; unit: string; val: number }[];
    quizQuestion: string;
  } | null>(null);

  const handleGenerateStudioLab = () => {
    if (!studioPrompt.trim()) return;
    setIsGeneratingStudioLab(true);
    setTimeout(() => {
      setGeneratedLab({
        id: `custom_lab_${Date.now()}`,
        title: studioPrompt.trim(),
        subject: studioSubject,
        diffEquation: '∂T/∂t = α · (∂²T/∂x²)  (Equação da Difusão Térmica Unidimensional)',
        params: [
          { name: 'Condutividade Térmica (k)', unit: 'W/(m·K)', val: 401 }, // Cobre
          { name: 'Temperatura da Fonte (T₁)', unit: '°C', val: 100 },
          { name: 'Temperatura Ambiente (T₀)', unit: '°C', val: 25 },
          { name: 'Comprimento da Haste (L)', unit: 'm', val: 0.5 }
        ],
        quizQuestion: 'Como o coeficiente de difusividade térmica afeta a velocidade com que o perfil estacionário de temperatura é alcançado na extremidade isolada?'
      });
      setIsGeneratingStudioLab(false);
    }, 700);
  };

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
  const [forumToast, setForumToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [forumFilter, setForumFilter] = useState<'all' | 'unanswered' | 'answered'>('all');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setForumToast({ msg, type });
    setTimeout(() => setForumToast(null), 3500);
  };

  // Formata o nome do docente sem duplicação de 'Prof.'
  const profDisplayName = professorName?.toLowerCase().startsWith('prof')
    ? professorName
    : `Prof. ${professorName || 'Docente'}`;

  // Inscreve no fórum da turma em tempo real
  useEffect(() => {
    if (!activeClassId) return;
    const unsub = subscribeForumTopicsByClass(activeClassId, (topics) => {
      setForumTopics(topics);
      if (selectedTopic) {
        const updated = topics.find(t => t.id === selectedTopic.id);
        if (updated) setSelectedTopic(updated);
      }
    });
    return () => unsub();
  }, [activeClassId, selectedTopic?.id]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !activeClassId) return;

    try {
      const created = await saveForumTopic({
        turmaId: activeClassId,
        titulo: newTopicTitle.trim(),
        conteudo: newTopicContent.trim(),
        autorId: 'prof_current',
        autorNome: profDisplayName,
        autorRole: 'professor',
        disciplina: newTopicSubject
      });

      setForumTopics(prev => [created, ...prev.filter(t => t.id !== created.id)]);
      setSelectedTopic(created);
      setNewTopicTitle('');
      setNewTopicContent('');
      setIsCreatingTopic(false);
      showToast('Novo tópico de discussão criado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao criar tópico:', err);
      showToast('Erro ao criar tópico no fórum.', 'error');
    }
  };

  const handleSendReply = async () => {
    if (!selectedTopic?.id || !replyText.trim() || !activeClassId) return;
    setSendingReply(true);
    try {
      const newReply = await addForumReply(activeClassId, selectedTopic.id, {
        autorId: 'prof_current',
        autorNome: profDisplayName,
        autorRole: 'professor',
        texto: replyText.trim()
      });

      // Atualização otimista imediata do selectedTopic
      setSelectedTopic(prev => {
        if (!prev) return null;
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
      showToast('Erro ao enviar resposta. Verifique a conexão e tente novamente.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleBestReply = async (replyId?: string, currentStatus?: boolean) => {
    if (!selectedTopic?.id || !replyId || !activeClassId) return;
    const newStatus = !currentStatus;
    try {
      await markForumBestReply(activeClassId, selectedTopic.id, replyId, newStatus);
      setSelectedTopic(prev => {
        if (!prev) return null;
        return {
          ...prev,
          respostas: (prev.respostas || []).map(r => ({
            ...r,
            isMelhorResposta: r.id === replyId ? newStatus : (newStatus ? false : r.isMelhorResposta)
          }))
        };
      });
      showToast(newStatus ? 'Resposta destacada como a melhor da discussão! (+20 XP para o aluno)' : 'Destaque removido.', 'success');
    } catch (err) {
      console.error('Erro ao marcar melhor resposta:', err);
    }
  };

  const handleDeleteTopic = async (topicId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeClassId || !topicId) return;
    if (!window.confirm('Tem certeza de que deseja excluir este tópico da turma?')) return;
    try {
      await deleteForumTopic(activeClassId, topicId);
      setForumTopics(prev => prev.filter(t => t.id !== topicId));
      if (selectedTopic?.id === topicId) setSelectedTopic(null);
      showToast('Tópico removido com sucesso.', 'success');
    } catch (err) {
      console.error('Erro ao excluir tópico:', err);
      showToast('Falha ao excluir tópico.', 'error');
    }
  };

  const handleDeleteReply = async (replyId?: string) => {
    if (!selectedTopic?.id || !replyId || !activeClassId) return;
    if (!window.confirm('Deseja realmente remover esta resposta?')) return;
    try {
      await deleteForumReply(activeClassId, selectedTopic.id, replyId);
      setSelectedTopic(prev => prev ? {
        ...prev,
        respostas: (prev.respostas || []).filter(r => r.id !== replyId)
      } : null);
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
      showToast('Falha ao remover resposta.', 'error');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. ESTADO DE CERTIFICADOS DIGITAIS & VALIDAÇÃO
  // ─────────────────────────────────────────────────────────────
  const [certStudentName, setCertStudentName] = useState('');
  const [certSubject, setCertSubject] = useState('Ciências da Natureza & Física Experimental');
  const [certHours, setCertHours] = useState(40);
  const [issuedCert, setIssuedCert] = useState<DigitalCertificate | null>(null);
  const [validationCodeInput, setValidationCodeInput] = useState('');
  const [validatedResult, setValidatedResult] = useState<{ cert: DigitalCertificate | null; searched: boolean }>({ cert: null, searched: false });

  const handleIssueCertificate = () => {
    const student = roster.find(s => s.name === certStudentName);
    if (!student) return;
    const cert = issueCertificate(student.id, student.name, certSubject, certHours);
    setIssuedCert(cert);
  };

  const handleValidateCode = () => {
    if (!validationCodeInput.trim()) return;
    const result = verifyCertificate(validationCodeInput.trim());
    setValidatedResult({ cert: result, searched: true });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {evidenceError && <p role="alert">{evidenceError}</p>}
      {evidenceLoading ? <p role="status">Carregando estudantes e entregas da turma…</p> : !roster.length && <p role="status">Esta turma ainda não tem estudantes matriculados. Os registros aparecerão depois da matrícula e do envio das atividades.</p>}
      {/* Seletor de Turma & Sub-navegação do Módulo LMS */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Turma Ativa:</span>
          <select
            value={activeClassId}
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
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--color-neutral-300, #E2D7C3)', padding: '0.3rem', borderRadius: 'var(--radius-sm, 10px)' }}>
          {[
            { id: 'attendance', label: 'Diário & Frequência', icon: Calendar },
            { id: 'gradebook', label: 'Livro de Notas', icon: Award },
            { id: 'speedgrader', label: '⚡ SpeedGrader & Rubricas', icon: CheckCircle },
            { id: 'forum', label: `Fórum da Turma (${forumTopics.length})`, icon: MessageSquare },
            { id: 'certificates', label: 'Certificação Digital', icon: ShieldCheck },
            { id: 'lab_studio', label: '🪄 AI Lab Studio', icon: Plus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as typeof subTab)}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ color: 'var(--color-secondary, #293E24)', width: '1.4rem', height: '1.4rem' }} />
                Diário de classe & controle de frequência
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Registro de chamada escolar, presença em laboratórios e monitoramento de infrequência conforme a LDB (mínimo 75%).
              </p>
            </div>
            <button
              onClick={handleOpenAttendanceModal}
              disabled={evidenceLoading || !roster.length}
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
                    onClick={() => setIsRecordingAttendance(false)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Data da Aula</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Conteúdo / Habilidade BNCC Trabalhada</label>
                  <input
                    type="text"
                    value={attendanceContent}
                    onChange={(e) => setAttendanceContent(e.target.value)}
                    placeholder="Ex: Leis de Newton aplicadas no Simulador Interativo de Dinâmica"
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Roster de Chamada Rápida */}
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
                          Justificada
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRecordingAttendance(false)}
                  className="btn-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance || !roster.length || roster.some(student => !attendanceStatusMap[student.id])}
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
              Taxa geral de assiduidade por estudante (LDB 75%)
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
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award style={{ color: 'var(--color-primary-accessible, #B8441F)', width: '1.4rem', height: '1.4rem' }} />
                Livro de notas & boletim ponderado (Gradebook)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Notas de 0 a 10 a partir das entregas avaliadas. A média final aparece quando todas as categorias com peso têm evidência. Os pesos e a participação configurados aqui valem para esta consulta e exportação.
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
                  <input
                    type="number"
                    value={weights.pesoProvas}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoProvas: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🔬 Laboratórios Virtuais</label>
                  <input
                    type="number"
                    value={weights.pesoLabs}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoLabs: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>📄 Atividades Práticas</label>
                  <input
                    type="number"
                    value={weights.pesoAtividades}
                    onChange={(e) => setWeights(prev => ({ ...prev, pesoAtividades: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>💬 Participação & Fórum</label>
                  <input
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
                  <input
                    type="number"
                    value={univWeights.p1}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, p1: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>📚 Prova Teórica 2 (P2)</label>
                  <input
                    type="number"
                    value={univWeights.p2}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, p2: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🔬 Prática / Laboratórios</label>
                  <input
                    type="number"
                    value={univWeights.labs}
                    onChange={(e) => setUnivWeights(prev => ({ ...prev, labs: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>🎯 Nota de Corte Direta</label>
                  <input
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
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SUB-ABA: FÓRUM PEDAGÓGICO DA TURMA
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'forum' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Toast Notification do Fórum */}
          {forumToast && (
            <div style={{
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
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Título da Discussão</label>
                  <input
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
                  <select
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
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mensagem Inicial / Pergunta Orientadora</label>
                <textarea
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  rows={3}
                  placeholder="Compartilhe uma pergunta instigante ou instruções para os estudantes participarem..."
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsCreatingTopic(false)} className="btn-outline" style={{ padding: '0.55rem 1.15rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gradient" style={{ padding: '0.55rem 1.5rem', fontWeight: 700 }}>
                  Publicar Tópico
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
                      onClick={() => setSelectedTopic(top)}
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
                            {reply.isMelhorResposta ? 'Desmarcar Melhor Resposta' : 'Destacar como Melhor Resposta (+20 XP)'}
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
      {subTab === 'certificates' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ color: 'var(--color-secondary, #293E24)', width: '1.4rem', height: '1.4rem' }} />
              Certificação digital & validação de autenticidade
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
              Emissão formal de certificados de conclusão para estudantes aprovados e ferramenta de validação instantânea de códigos hash.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Emissor de Certificados pelo Professor */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🎓 Emitir Novo Certificado Acadêmico
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Selecione o Estudante</label>
                  <select
                    value={certStudentName}
                    onChange={(e) => setCertStudentName(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: '#fff', fontSize: '0.9rem' }}
                  >
                    <option value="">Selecione um estudante matriculado</option>
                    {roster.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Disciplina / Formação Concluída</label>
                  <input
                    type="text"
                    value={certSubject}
                    onChange={(e) => setCertSubject(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Carga Horária (Horas)</label>
                  <input
                    type="number"
                    value={certHours}
                    onChange={(e) => setCertHours(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                onClick={handleIssueCertificate}
                className="btn-gradient"
                style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
              >
                Gerar & Autenticar Certificado
              </button>

              {/* Pré-visualização do Certificado Emitido */}
              {issuedCert && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800, fontSize: '0.88rem', marginBottom: '0.4rem' }}>
                    <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                    Certificado Emitido com Sucesso!
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Código de Autenticidade: <strong style={{ color: 'var(--color-primary-accessible, #B8441F)', fontFamily: 'monospace' }}>{issuedCert.codigoValidacao}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Validador Público de Autenticidade */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                🔍 Validador Público de Código de Autenticidade
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 1rem' }}>
                Digite o código hash presente no rodapé do certificado para verificar sua validade institucional em tempo real.
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={validationCodeInput}
                  onChange={(e) => setValidationCodeInput(e.target.value)}
                  placeholder="Ex: EDU-2026-F1A8-7B9C"
                  style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.88rem', fontFamily: 'monospace' }}
                />
                <button
                  onClick={handleValidateCode}
                  className="btn-outline"
                  style={{ padding: '0.65rem 1.15rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                  Verificar
                </button>
              </div>

              {validatedResult.searched && (
                <div style={{ padding: '1rem', borderRadius: '8px', background: validatedResult.cert ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: validatedResult.cert ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                  {validatedResult.cert ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                        <CheckCircle style={{ width: '1.1rem', height: '1.1rem' }} />
                        Certificado Válido e Autêntico!
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        <div>Aluno: <strong>{validatedResult.cert.alunoNome}</strong></div>
                        <div>Curso: <strong>{validatedResult.cert.tituloCurso}</strong></div>
                        <div>Carga Horária: <strong>{validatedResult.cert.cargaHorariaHoras} horas</strong></div>
                        <div>Data de Emissão: <strong>{validatedResult.cert.dataEmissao}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700, fontSize: '0.88rem' }}>
                      <XCircle style={{ width: '1.1rem', height: '1.1rem' }} />
                      Código de certificado não localizado ou inválido no sistema.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────────────
          SPEEDGRADER & RUBRICAS KORTEX (TELA DIVIDIDA ESTILO CANVAS LMS)
          ───────────────────────────────────────────────────────────── */}
      {/* ─────────────────────────────────────────────────────────────
          SPEEDGRADER & RUBRICAS KORTEX (TELA DIVIDIDA ESTILO CANVAS LMS)
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'speedgrader' && (() => {
        const currentSub = submissionsList[selectedSubIndex] || submissionsList[0];
        if (!currentSub) return <div className="glass-card" role="status" style={{ padding: '1.5rem' }}>Nenhuma entrega registrada nesta turma. As respostas dos estudantes aparecerão aqui após o envio.</div>;
        const totalRubricScore = Number((
          (rubricScores['crit_1'] || 0) +
          (rubricScores['crit_2'] || 0) +
          (rubricScores['crit_3'] || 0)
        ).toFixed(1));

        const handleSaveReview = async () => {
          if (savingReview || !currentUser?.uid || Object.keys(rubricScores).length < 3) return;
          setSavingReview(true);
          try {
            await saveSubmissionReview({
              submissionId: currentSub.id,
              professorId: currentUser?.uid ?? '',
              rubricScores,
              totalScore: totalRubricScore,
              generalFeedback: docenteFeedback,
              gradedAt: new Date().toISOString()
            });
            setSpeedGraderToast(`Parecer de ${currentSub.studentName} guardado. A rubrica é uma avaliação separada da nota automática do boletim.`);
            setTimeout(() => setSpeedGraderToast(null), 4000);
          } catch (err) {
            console.error('Erro ao salvar review:', err);
            setSpeedGraderToast('Erro ao persistir avaliação da rubrica.');
            setTimeout(() => setSpeedGraderToast(null), 3000);
          } finally {
            setSavingReview(false);
          }
        };

        const handleExportSpeedGraderCsv = () => {
          const headers = ['ID_Submissao', 'Estudante', 'Atividade', 'Turma', 'Data_Entrega', 'Nota', 'Status', 'Hipotese_Investigativa'];
          const rows = submissionsList.map(s => [
            s.id,
            s.studentName,
            s.activityTitle,
            currentTurma?.name ?? '',
            s.submittedAt,
            s.score,
            s.status,
            s.hypothesis
          ]);
          const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `pauta_speedgrader_${currentTurma?.name || 'turma'}_${new Date().toISOString().slice(0, 10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setSpeedGraderToast('✓ Planilha de notas e submissões exportada com sucesso em CSV!');
          setTimeout(() => setSpeedGraderToast(null), 3500);
        };

        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Feedback Toast */}
            {speedGraderToast && (
              <div style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: 'rgba(16,185,129,0.92)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
              }}>
                <CheckCircle style={{ width: '1.1rem', height: '1.1rem' }} />
                <span>{speedGraderToast}</span>
              </div>
            )}

            {/* Barra Seletora de Entregas dos Alunos */}
            <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Fila de Submissões ({submissionsList.length}):
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {submissionsList.map((sub, sIdx) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubIndex(sIdx)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: selectedSubIndex === sIdx ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                        background: selectedSubIndex === sIdx ? 'var(--color-primary-light, rgba(228,104,63,0.18))' : 'transparent',
                        color: selectedSubIndex === sIdx ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-main)',
                        fontWeight: selectedSubIndex === sIdx ? 800 : 500,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      {sub.studentName} ({sub.score === null ? 'sem nota' : `${sub.score} pts`})
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Navegar: <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)' }}>K</kbd> anterior / <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)', border: '1px solid var(--border-color)' }}>J</kbd> próximo
                </span>
                <button
                  onClick={handleExportSpeedGraderCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(41, 62, 36, 0.08)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--color-verde-700, #293E24)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Baixar pauta de notas e avaliações em CSV"
                >
                  <Download style={{ width: '0.85rem', height: '0.85rem' }} />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Grade Dividida SpeedGrader */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem' }}>
              {/* Lado Esquerdo: Visualizador de Submissão e Telemetria do Aluno */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                        Visualizador de Submissão Prática de Laboratório
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Aluno: <strong>{currentSub.studentName}</strong> · Turma: <strong>{currentTurma?.name || 'Turma A'}</strong> · Entregue {currentSub.submittedAt}
                      </span>
                    </div>
                    <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {currentSub.status === 'completed' ? 'Entrega concluída' : 'Entrega pendente'}
                    </span>
                  </div>

                  {/* Pré-visualização do Laudo do Aluno */}
                  <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-accessible, #B8441F)', marginBottom: '0.4rem' }}>
                      Atividade: {currentSub.activityTitle}
                    </div>
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                      <strong>Hipótese Formulada pelo Estudante:</strong> "{currentSub.hypothesis}"
                    </p>
                    <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      {Object.entries(currentSub.telemetry).map(([k, v]) => (
                        <div key={k}>{k}: <strong>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</strong></div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 0.5rem' }}>Evidências registradas no envio</h4>
                    <p>Tempo ativo: {currentSub.activeSeconds === null ? 'Não medido' : `${Math.round(currentSub.activeSeconds)} segundos`}.</p>
                    {currentSub.questions.length ? currentSub.questions.map(question => <div key={question.questionId} style={{ marginBottom: '0.5rem' }}><strong>{question.question}</strong><br />Resposta: {question.selectedOption === null ? 'Não respondida' : question.selectedOption + 1} · {question.correct === null ? 'Sem correção' : question.correct ? 'Correta' : 'Rever conteúdo'}</div>) : <p>Nenhuma resposta por questão foi registrada neste envio.</p>}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Parâmetros e medidas acima representam o estado guardado pelo estudante ao enviar a atividade.</p>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Rubrica de Avaliação Interativa & Feedback do Professor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg, 14px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Rubrica de avaliação docente
                    </h4>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary-accessible, #B8441F)' }}>
                      {Object.keys(rubricScores).length < 3 ? 'Preencha os três critérios' : `Prévia: ${totalRubricScore} / 10`}
                    </div>
                  </div>

                  {/* Critérios da Rubrica Interativa */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {[
                      {
                        id: 'crit_1',
                        titulo: '1. Coleta e Interpretação de Dados',
                        peso: '4.0 pts',
                        niveis: [
                          { label: 'Insuficiente (1.0)', score: 1.0 },
                          { label: 'Bom (3.0)', score: 3.0 },
                          { label: 'Excelente (4.0)', score: 4.0 },
                        ]
                      },
                      {
                        id: 'crit_2',
                        titulo: '2. Rigor Científico e Dedução Teórica',
                        peso: '3.0 pts',
                        niveis: [
                          { label: 'Regular (1.5)', score: 1.5 },
                          { label: 'Bom (2.5)', score: 2.5 },
                          { label: 'Excelente (3.0)', score: 3.0 },
                        ]
                      },
                      {
                        id: 'crit_3',
                        titulo: '3. Conclusão Metodológica & ABNT',
                        peso: '3.0 pts',
                        niveis: [
                          { label: 'Regular (1.5)', score: 1.5 },
                          { label: 'Bom (2.0)', score: 2.0 },
                          { label: 'Excelente (3.0)', score: 3.0 },
                        ]
                      }
                    ].map((crit) => {
                      const currentVal = rubricScores[crit.id] ?? 0;
                      return (
                        <div key={crit.id} style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                            <span>{crit.titulo}</span>
                            <span style={{ color: 'var(--color-primary-accessible, #B8441F)' }}>{currentVal.toFixed(1)} / {crit.peso}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {crit.niveis.map((niv, nIdx) => {
                              const isSelected = Math.abs(currentVal - niv.score) < 0.05;
                              return (
                                <button
                                  key={nIdx}
                                  onClick={() => setRubricScores(prev => ({ ...prev, [crit.id]: niv.score }))}
                                  style={{
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '6px',
                                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                                    background: isSelected ? 'var(--color-primary-light, rgba(228,104,63,0.18))' : 'transparent',
                                    color: isSelected ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-secondary)',
                                    fontSize: '0.72rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {niv.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Caixa de Feedback e Envio */}
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Parecer Docente / Comentário Socrático:
                    </label>
                    <textarea
                      value={docenteFeedback}
                      onChange={(e) => setDocenteFeedback(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: '0.82rem', resize: 'vertical' }}
                    />

                    <button
                      onClick={handleSaveReview}
                      disabled={savingReview || Object.keys(rubricScores).length < 3 || !currentUser?.uid}
                      className="btn-primary"
                      style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'var(--color-verde-700, #293E24)', color: '#fff', marginTop: '0.25rem' }}
                    >
                      {savingReview ? 'Salvando...' : '✓ Lançar Nota Oficial no Diário'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─────────────────────────────────────────────────────────────
          AI LAB STUDIO — CONSTRUTOR ZERO-CODE DE LABORATÓRIOS
          ───────────────────────────────────────────────────────────── */}
      {subTab === 'lab_studio' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg, 14px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🪄 Kortex AI Lab Studio — Construtor Zero-Code de Laboratórios
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
                  Crie simulações computacionais em segundos a partir de equações diferenciais ou descrições em linguagem natural.
                </p>
              </div>
              <span style={{ background: 'var(--color-primary-light, rgba(228, 104, 63, 0.15))', color: 'var(--color-primary-accessible, #B8441F)', padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                Motor Universal v2.0
              </span>
            </div>

            {/* Prompt e Configuração */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Tema do Experimento ou Equação Diferencial:
                </label>
                <input
                  type="text"
                  value={studioPrompt}
                  onChange={(e) => setStudioPrompt(e.target.value)}
                  placeholder="Ex: Pêndulo Duplo com EDOs Não-Lineares de Lagrange"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Disciplina / Área Acadêmica:
                </label>
                <select
                  value={studioSubject}
                  onChange={(e) => setStudioSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="Engenharia Térmica">Engenharia Térmica & Fluidos</option>
                  <option value="Engenharia Mecânica">Engenharia Mecânica & Vibrações</option>
                  <option value="Engenharia Elétrica">Engenharia Elétrica & Telecom</option>
                  <option value="Química Industrial">Química & Processos Industriais</option>
                  <option value="Ciência da Computação">Ciência da Computação & IA</option>
                  <option value="Biotecnologia">Bioquímica & Biotecnologia</option>
                </select>
              </div>
            </div>

            {/* Sugestões Rápidas de Prompt */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Sugestões rápidas:</span>
              {[
                'Transferência de Calor em Aletas (Fourier)',
                'Pêndulo Duplo Caótico (Lagrangiano)',
                'Reator CSTR e Cinética de 2ª Ordem',
                'Cinética de Crescimento Celular (Monod)',
              ].map((sug, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => setStudioPrompt(sug)}
                  style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  💡 {sug}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateStudioLab}
              disabled={isGeneratingStudioLab}
              className="btn-gradient"
              style={{ width: '100%', padding: '0.85rem', fontWeight: 800, fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isGeneratingStudioLab ? 'Sintetizando Solvers Numéricos...' : '⚡ Compilar e Gerar Laboratório com IA'}
            </button>

            {/* Resultado do Laboratório Gerado */}
            {generatedLab && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--color-primary, #E4683F)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>🔬</span>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{generatedLab.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700 }}>
                    ✓ Solver Numérico Pronto
                  </span>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--color-primary-accessible, #B8441F)' }}>
                  <strong>Equação Governante:</strong> {generatedLab.diffEquation}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Parâmetros e Variáveis de Controle:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {generatedLab.params.map((p, pIdx) => (
                      <div key={pIdx} style={{ background: 'var(--bg-card)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{p.name}:</span>
                        <strong style={{ color: 'var(--color-verde-700, #293E24)' }}>{p.val} {p.unit}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(228,104,63,0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(228,104,63,0.2)', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <strong>Desafio Diagnóstico:</strong> {generatedLab.quizQuestion}
                </div>

                <button
                  onClick={() => alert(`Laboratório "${generatedLab.title}" publicado com sucesso no catálogo oficial da turma!`)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontWeight: 800, background: 'var(--color-verde-700, #293E24)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  ✓ Publicar Laboratório no Catálogo da Turma
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
