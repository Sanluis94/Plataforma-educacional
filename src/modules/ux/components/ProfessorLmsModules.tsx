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
  DigitalCertificate
} from '../../data/types';
import {
  saveAttendanceRecord,
  getAttendanceByClass,
  calculateStudentAttendanceRate,
  calculateClassGradebook,
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

interface ProfessorLmsModulesProps {
  turmas: Turma[];
  selectedClassId: string | null;
  onSelectClass: (id: string) => void;
  professorName: string;
}

// Roster de alunos padrão para demonstração caso a turma ainda não tenha alunos reais no Firestore
const DEFAULT_DEMO_STUDENTS = [
  { id: 'std_01', name: 'Ana Clara Silva' },
  { id: 'std_02', name: 'Bruno Henrique Santos' },
  { id: 'std_03', name: 'Camila Duarte Souza' },
  { id: 'std_04', name: 'Diego Ferreira Lima' },
  { id: 'std_05', name: 'Elena Souza Ramos' },
  { id: 'std_06', name: 'Felipe Augusto Rocha' }
];

export function ProfessorLmsModules({
  turmas,
  selectedClassId,
  onSelectClass,
  professorName
}: ProfessorLmsModulesProps) {
  const [subTab, setSubTab] = useState<'attendance' | 'gradebook' | 'forum' | 'certificates'>('attendance');

  const activeClassId = selectedClassId || turmas[0]?.id || '';
  const currentTurma = turmas.find(t => t.id === activeClassId);

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
    if (!activeClassId) return;
    const fetchAttendance = async () => {
      const records = await getAttendanceByClass(activeClassId);
      setAttendanceRecords(records);
    };
    fetchAttendance();
  }, [activeClassId]);

  // Inicializa mapa de presença com todos presentes
  const handleOpenAttendanceModal = () => {
    const initial: Record<string, 'presente' | 'falta' | 'justificada'> = {};
    DEFAULT_DEMO_STUDENTS.forEach(s => {
      initial[s.id] = 'presente';
    });
    setAttendanceStatusMap(initial);
    setAttendanceContent('Aula Prática em Laboratório Virtual & Resolução de Problemas');
    setIsRecordingAttendance(true);
  };

  const handleSaveAttendance = async () => {
    if (!activeClassId || !attendanceContent.trim()) return;
    setSavingAttendance(true);
    try {
      const registros = DEFAULT_DEMO_STUDENTS.map(s => ({
        studentId: s.id,
        studentName: s.name,
        status: attendanceStatusMap[s.id] || 'presente'
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
      DEFAULT_DEMO_STUDENTS,
      activeClassId,
      [], // submissions
      [], // exam attempts
      weights
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
  }, [activeClassId, weights, attendanceRecords]);

  // Exportar Boletim em CSV
  const handleExportGradebookCSV = () => {
    const headers = 'ID Aluno,Nome Aluno,Provas (40%),Labs (30%),Atividades (20%),Participacao (10%),Media Final,Situacao,Frequencia %,Alerta LDB\n';
    const rows = gradeReports.map(r => 
      `"${r.studentId}","${r.studentName}",${r.notaProvas},${r.notaLabs},${r.notaAtividades},${r.notaParticipacao},${r.mediaFinal},"${r.situacao}",${r.frequenciaPercentual}%,"${r.alertaFrequencia ? 'ALERTA LDB (<75%)' : 'REGULAR'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boletim_${currentTurma?.name || 'turma'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─────────────────────────────────────────────────────────────
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
  const [certStudentName, setCertStudentName] = useState(DEFAULT_DEMO_STUDENTS[0].name);
  const [certSubject, setCertSubject] = useState('Ciências da Natureza & Física Experimental');
  const [certHours, setCertHours] = useState(40);
  const [issuedCert, setIssuedCert] = useState<DigitalCertificate | null>(null);
  const [validationCodeInput, setValidationCodeInput] = useState('');
  const [validatedResult, setValidatedResult] = useState<{ cert: DigitalCertificate | null; searched: boolean }>({ cert: null, searched: false });

  const handleIssueCertificate = () => {
    const student = DEFAULT_DEMO_STUDENTS.find(s => s.name === certStudentName) || DEFAULT_DEMO_STUDENTS[0];
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
      {/* Seletor de Turma & Sub-navegação do Módulo LMS */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Turma Ativa:</span>
          <select
            value={activeClassId}
            onChange={(e) => onSelectClass(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(6,182,212,0.4)',
              background: 'rgba(0,0,0,0.3)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            {turmas.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#18181b', color: '#fff' }}>
                {t.name} (Código: {(t as any).code || t.id.slice(0, 6)})
              </option>
            ))}
          </select>
        </div>

        {/* Sub-tabs Moodle LMS */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '10px' }}>
          {[
            { id: 'attendance', label: 'Diário & Frequência', icon: Calendar },
            { id: 'gradebook', label: 'Livro de Notas', icon: Award },
            { id: 'forum', label: `Fórum da Turma (${forumTopics.length})`, icon: MessageSquare },
            { id: 'certificates', label: 'Certificação Digital', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                background: subTab === tab.id ? '#06b6d4' : 'transparent',
                color: subTab === tab.id ? '#000' : 'var(--text-secondary)',
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
                <Calendar style={{ color: '#06b6d4', width: '1.4rem', height: '1.4rem' }} />
                Diário de Classe & Controle de Frequência
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Registro de chamada escolar, presença em laboratórios e monitoramento de infrequência conforme a LDB (mínimo 75%).
              </p>
            </div>
            <button
              onClick={handleOpenAttendanceModal}
              className="btn-gradient"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 700 }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Registrar Chamada do Dia
            </button>
          </div>

          {/* Modal / Card para Registro de Chamada */}
          {isRecordingAttendance && (
            <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(6,182,212,0.4)', background: 'rgba(6,182,212,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  📝 Realizar Chamada Escolar
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const allPres: Record<string, 'presente' | 'falta' | 'justificada'> = {};
                      DEFAULT_DEMO_STUDENTS.forEach(s => { allPres[s.id] = 'presente'; });
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
                {DEFAULT_DEMO_STUDENTS.map(student => {
                  const currentStatus = attendanceStatusMap[student.id] || 'presente';
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
                  className="btn-outline-cyan"
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}
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
              <Users style={{ width: '1.2rem', height: '1.2rem', color: '#06b6d4' }} />
              Taxa Geral de Assiduidade por Estudante (LDB 75%)
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
                    <th style={{ padding: '0.75rem 0.5rem' }}>Conformidade LDB</th>
                  </tr>
                </thead>
                <tbody>
                  {DEFAULT_DEMO_STUDENTS.map(student => {
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
                              <div style={{ width: `${stats.taxaPercentual}%`, height: '100%', background: stats.alertaLDB ? '#ef4444' : '#10b981' }} />
                            </div>
                            <span style={{ fontWeight: 800, color: stats.alertaLDB ? '#ef4444' : '#10b981' }}>
                              {stats.taxaPercentual}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          {stats.alertaLDB ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}>
                              <AlertTriangle style={{ width: '0.85rem', height: '0.85rem' }} />
                              Risco de Reprovação (&lt; 75%)
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
                    <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#06b6d4' }}>{rec.data}</span>
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
                <Award style={{ color: '#06b6d4', width: '1.4rem', height: '1.4rem' }} />
                Livro de Notas & Boletim Ponderado (Gradebook)
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Ponderação automática com Provas (40%), Labs (30%), Atividades (20%) e Participação (10%). Média para aprovação: 6.0.
              </p>
            </div>
            <button
              onClick={handleExportGradebookCSV}
              className="btn-outline-cyan"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 700 }}
            >
              <Download style={{ width: '1rem', height: '1rem' }} />
              Exportar Boletim (CSV)
            </button>
          </div>

          {/* Configuração dos Pesos Avaliativos */}
          <div className="glass-card" style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Pesos de Avaliação Bimestral (%):
            </div>
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
          </div>

          {/* Tabela de Boletim Escolar */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Estudante</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Provas ({weights.pesoProvas}%)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Labs ({weights.pesoLabs}%)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Atividades ({weights.pesoAtividades}%)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Participação ({weights.pesoParticipacao}%)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Média Final</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Situação</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeReports.map(rep => (
                    <tr key={rep.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {rep.studentName}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#06b6d4', fontWeight: 700 }}>
                        {rep.notaProvas.toFixed(1)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#8b5cf6', fontWeight: 700 }}>
                        {rep.notaLabs.toFixed(1)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#10b981', fontWeight: 700 }}>
                        {rep.notaAtividades.toFixed(1)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#f59e0b', fontWeight: 700 }}>
                        {rep.notaParticipacao.toFixed(1)}
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', fontSize: '1rem', fontWeight: 900, color: rep.mediaFinal >= 6.0 ? '#10b981' : rep.mediaFinal >= 4.0 ? '#f59e0b' : '#ef4444' }}>
                        {rep.mediaFinal.toFixed(1)}
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
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{ fontWeight: 700, color: rep.alertaFrequencia ? '#ef4444' : 'var(--text-secondary)' }}>
                          {rep.frequenciaPercentual}%
                        </span>
                      </td>
                    </tr>
                  ))}
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
                <MessageSquare style={{ color: '#06b6d4', width: '1.4rem', height: '1.4rem' }} />
                Fórum Pedagógico & Discussões Acadêmicas
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
            <form onSubmit={handleCreateTopic} className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(6,182,212,0.4)' }}>
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
                <button type="button" onClick={() => setIsCreatingTopic(false)} className="btn-outline-cyan" style={{ padding: '0.55rem 1.15rem' }}>
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
                background: forumFilter === 'all' ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.04)',
                border: forumFilter === 'all' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                color: forumFilter === 'all' ? '#06b6d4' : 'var(--text-secondary)',
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
                        border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#06b6d4', background: 'rgba(6,182,212,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
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
                        <span>Por: <strong style={{ color: '#fff' }}>{top.autorNome}</strong></span>
                        <span style={{ color: '#06b6d4', fontWeight: 700 }}>
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
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4' }}>{selectedTopic.disciplina}</span>
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
                    Criado por <strong style={{ color: '#fff' }}>{selectedTopic.autorNome}</strong> em {new Date(selectedTopic.criadoEm).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    {selectedTopic.conteudo}
                  </div>
                </div>

                {/* Respostas encadeadas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', maxHeight: '380px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Respostas da Turma ({selectedTopic.respostas?.length || 0}):
                  </div>

                  {(!selectedTopic.respostas || selectedTopic.respostas.length === 0) ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
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
                          border: reply.isMelhorResposta ? '1px solid #f59e0b' : reply.autorRole === 'professor' ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.06)',
                          background: reply.isMelhorResposta ? 'rgba(245,158,11,0.08)' : reply.autorRole === 'professor' ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{reply.autorNome}</strong>
                            {reply.autorRole === 'professor' && (
                              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: '#06b6d4', color: '#000', fontWeight: 800 }}>
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
                  background: 'rgba(0,0,0,0.25)',
                  padding: '1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(6,182,212,0.25)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.82rem', color: '#06b6d4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
              <ShieldCheck style={{ color: '#06b6d4', width: '1.4rem', height: '1.4rem' }} />
              Certificação Digital & Validação de Autenticidade
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
                    {DEFAULT_DEMO_STUDENTS.map(s => (
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
                    Código de Autenticidade: <strong style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{issuedCert.codigoValidacao}</strong>
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
                  className="btn-outline-cyan"
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
    </div>
  );
}
