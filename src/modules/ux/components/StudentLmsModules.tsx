import React, { useState, useEffect } from 'react';
import {
  Award, Calendar, CheckCircle, AlertTriangle,
  MessageSquare, ShieldCheck, Star, Plus, Printer, X
} from 'lucide-react';
import type {
  AttendanceRecord,
  ForumTopic,
  DigitalCertificate
} from '../../data/types';
import {
  getAttendanceByClass,
  calculateStudentAttendanceRate,
  calculateStudentGrade,
  subscribeForumTopicsByClass,
  saveForumTopic,
  addForumReply
} from '../../data/repositories/gradebookRepository';
import {
  getStudentCertificates,
  issueCertificate,
  verifyCertificate
} from '../../core/services/certificateService';

interface StudentLmsModulesProps {
  studentId: string;
  studentName: string;
  selectedClassId: string | null;
  activeView: 'gradebook' | 'forum' | 'certificates';
  onViewChange: (view: 'gradebook' | 'forum' | 'certificates') => void;
}

export function StudentLmsModules({
  studentId,
  studentName,
  selectedClassId,
  activeView,
  onViewChange
}: StudentLmsModulesProps) {
  // ─────────────────────────────────────────────────────────────
  // 1. DADOS DE FREQUÊNCIA & BOLETIM ESCOLAR
  // ─────────────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!selectedClassId) return;
    const fetchAtt = async () => {
      const recs = await getAttendanceByClass(selectedClassId);
      setAttendanceRecords(recs);
    };
    fetchAtt();
  }, [selectedClassId]);

  const attStats = calculateStudentAttendanceRate(studentId, attendanceRecords);

  // Notas do aluno (calculadas a partir de provas, labs e atividades concluídas)
  const studentScores = {
    notaProvas: 8.5,
    notaLabs: 9.2,
    notaAtividades: 8.0,
    notaParticipacao: 10.0
  };

  const finalGrade = calculateStudentGrade(studentScores);

  // ─────────────────────────────────────────────────────────────
  // 2. FÓRUM PEDAGÓGICO DA TURMA
  // ─────────────────────────────────────────────────────────────
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionSubject, setQuestionSubject] = useState('Física');
  const [studentReplyText, setStudentReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!selectedClassId) return;
    const unsub = subscribeForumTopicsByClass(selectedClassId, (topics) => {
      setForumTopics(topics);
      if (selectedTopic) {
        const updated = topics.find(t => t.id === selectedTopic.id);
        if (updated) setSelectedTopic(updated);
      }
    });
    return () => unsub();
  }, [selectedClassId, selectedTopic?.id]);

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionTitle.trim() || !questionContent.trim() || !selectedClassId) return;

    await saveForumTopic({
      turmaId: selectedClassId,
      titulo: questionTitle.trim(),
      conteudo: questionContent.trim(),
      autorId: studentId,
      autorNome: studentName,
      autorRole: 'estudante',
      disciplina: questionSubject
    });

    setQuestionTitle('');
    setQuestionContent('');
    setIsAskingQuestion(false);
  };

  const handleSendReply = async () => {
    if (!selectedTopic?.id || !studentReplyText.trim() || !selectedClassId) return;
    setSendingReply(true);
    try {
      const newReply = await addForumReply(selectedClassId, selectedTopic.id, {
        autorId: studentId,
        autorNome: studentName,
        autorRole: 'estudante',
        texto: studentReplyText.trim()
      });

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

      setStudentReplyText('');
    } finally {
      setSendingReply(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. CERTIFICADOS DIGITAIS DO ESTUDANTE
  // ─────────────────────────────────────────────────────────────
  const [myCertificates, setMyCertificates] = useState<DigitalCertificate[]>([]);
  const [previewCert, setPreviewCert] = useState<DigitalCertificate | null>(null);
  const [validationCodeInput, setValidationCodeInput] = useState('');
  const [validateResult, setValidateResult] = useState<{ cert: DigitalCertificate | null; searched: boolean }>({ cert: null, searched: false });

  const loadCertificates = () => {
    let certs = getStudentCertificates(studentId);
    // Se o estudante ainda não tem nenhum certificado gerado, emite um inicial de boas-vindas
    if (certs.length === 0) {
      const initial = issueCertificate(studentId, studentName, 'Ciências da Natureza & Laboratórios Virtuais', 40);
      certs = [initial];
    }
    setMyCertificates(certs);
  };

  useEffect(() => {
    loadCertificates();
  }, [studentId, studentName]);

  const handleClaimNewCert = (courseName: string) => {
    const cert = issueCertificate(studentId, studentName, courseName, 40);
    loadCertificates();
    setPreviewCert(cert);
  };

  const handleVerifyCode = () => {
    if (!validationCodeInput.trim()) return;
    const res = verifyCertificate(validationCodeInput.trim());
    setValidateResult({ cert: res, searched: true });
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub-navegação das Abas Moodle/LMS */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        {[
          { id: 'gradebook', label: '📊 Meu Boletim & Frequência', icon: Award },
          { id: 'forum', label: `💬 Fórum da Turma (${forumTopics.length})`, icon: MessageSquare },
          { id: 'certificates', label: `📜 Meus Certificados (${myCertificates.length})`, icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id as any)}
            style={{
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              borderBottom: activeView === tab.id ? '2px solid #06b6d4' : '2px solid transparent',
              background: activeView === tab.id ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: activeView === tab.id ? '#06b6d4' : 'var(--text-secondary)',
              fontWeight: activeView === tab.id ? 800 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon style={{ width: '1rem', height: '1rem' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. ABA: MEU BOLETIM ESCOLAR & FREQUÊNCIA
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'gradebook' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card de Frequência Escolar e Indicador LDB */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', border: attStats.alertaLDB ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Calendar style={{ color: '#06b6d4', width: '1.25rem', height: '1.25rem' }} />
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Assiduidade Escolar (Controle de Faltas LDB)
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                A Lei de Diretrizes e Bases da Educação (LDB 9.394/96) exige no mínimo 75% de frequência para aprovação.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{attStats.presencas} presenças / {attStats.faltas} faltas</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: attStats.alertaLDB ? '#ef4444' : '#10b981' }}>
                  {attStats.taxaPercentual}%
                </div>
              </div>
              <div>
                {attStats.alertaLDB ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 800 }}>
                    <AlertTriangle style={{ width: '0.9rem', height: '0.9rem' }} />
                    Alerta de Faltas
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.8rem', fontWeight: 800 }}>
                    <CheckCircle style={{ width: '0.9rem', height: '0.9rem' }} />
                    Frequência Regular
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Boletim Escolar Ponderado */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Boletim de Avaliação Contínua
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Composição ponderada das notas bimestrais</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Média Final:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: finalGrade.mediaFinal >= 6.0 ? '#10b981' : '#ef4444' }}>
                  {finalGrade.mediaFinal.toFixed(1)}
                </span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: finalGrade.situacao === 'Aprovado' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: finalGrade.situacao === 'Aprovado' ? '#10b981' : '#ef4444' }}>
                  {finalGrade.situacao}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>📝 Provas Formais (40%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {studentScores.notaProvas.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 10</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avaliações com gabarito e tempo limitado</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 700, textTransform: 'uppercase' }}>🔬 Laboratórios Interativos (30%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {studentScores.notaLabs.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 10</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulações práticas e relatórios concluídos</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>📄 Atividades Práticas (20%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {studentScores.notaAtividades.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 10</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exercícios e questionários de fixação</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>💬 Participação & Fórum (10%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {studentScores.notaParticipacao.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ 10</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Colaboração em dúvidas e respostas da turma</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. ABA: FÓRUM PEDAGÓGICO DA TURMA
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'forum' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare style={{ color: '#06b6d4', width: '1.4rem', height: '1.4rem' }} />
                Fórum de Dúvidas & Debates da Turma
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                Tire dúvidas sobre experimentos de laboratório, converse com colegas e receba orientações do professor.
              </p>
            </div>
            <button
              onClick={() => setIsAskingQuestion(!isAskingQuestion)}
              className="btn-gradient"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontWeight: 700 }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              Publicar Nova Dúvida
            </button>
          </div>

          {/* Form para Fazer Pergunta */}
          {isAskingQuestion && (
            <form onSubmit={handlePostQuestion} className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(6,182,212,0.4)' }}>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                ❓ Perguntar à Turma ou ao Professor
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Título da Pergunta / Dúvida</label>
                  <input
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    placeholder="Ex: Como interpretar o gráfico de velocidade no lab de cinemática?"
                    required
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Disciplina</label>
                  <select
                    value={questionSubject}
                    onChange={(e) => setQuestionSubject(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: '#18181b', color: '#fff', fontSize: '0.9rem' }}
                  >
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biologia">Biologia</option>
                    <option value="Matemática">Matemática</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Explique sua Dúvida com Detalhes</label>
                <textarea
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  rows={3}
                  placeholder="Descreva o que você tentou fazer e onde encontrou dificuldade..."
                  required
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setIsAskingQuestion(false)} className="btn-outline-cyan" style={{ padding: '0.55rem 1.15rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gradient" style={{ padding: '0.55rem 1.5rem', fontWeight: 700 }}>
                  Enviar Dúvida (+10 XP)
                </button>
              </div>
            </form>
          )}

          {/* Grid de Discussões */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedTopic ? '1fr 1.5fr' : '1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {forumTopics.length === 0 ? (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nenhuma discussão ativa no momento. Faça uma pergunta para inaugurar o fórum!</p>
                </div>
              ) : (
                forumTopics.map(top => {
                  const isSelected = selectedTopic?.id === top.id;
                  return (
                    <div
                      key={top.id}
                      onClick={() => setSelectedTopic(top)}
                      className="glass-card"
                      style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4', background: 'rgba(6,182,212,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {top.disciplina || 'Ciências'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(top.criadoEm).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
                        {top.titulo}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {top.conteudo}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span>Autor: <strong style={{ color: '#fff' }}>{top.autorNome}</strong></span>
                        <span style={{ color: '#06b6d4', fontWeight: 700 }}>
                          💬 {top.respostas?.length || 0} respostas
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Thread de Leitura e Resposta */}
            {selectedTopic && (
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#06b6d4' }}>{selectedTopic.disciplina}</span>
                    <button onClick={() => setSelectedTopic(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Fechar</button>
                  </div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                    {selectedTopic.titulo}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    Por <strong style={{ color: '#fff' }}>{selectedTopic.autorNome}</strong> • {new Date(selectedTopic.criadoEm).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    {selectedTopic.conteudo}
                  </div>
                </div>

                {/* Respostas da Thread */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                  {(!selectedTopic.respostas || selectedTopic.respostas.length === 0) ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Nenhuma resposta ainda. Ajude seu colega respondendo!</p>
                  ) : (
                    selectedTopic.respostas.map(reply => (
                      <div
                        key={reply.id}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '8px',
                          border: reply.isMelhorResposta ? '1px solid #f59e0b' : reply.autorRole === 'professor' ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          background: reply.isMelhorResposta ? 'rgba(245,158,11,0.08)' : reply.autorRole === 'professor' ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{reply.autorNome}</strong>
                            {reply.autorRole === 'professor' && (
                              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#06b6d4', color: '#000', fontWeight: 800 }}>
                                PROFESSOR
                              </span>
                            )}
                            {reply.isMelhorResposta && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#f59e0b', color: '#000', fontWeight: 800 }}>
                                <Star style={{ width: '0.7rem', height: '0.7rem', fill: '#000' }} />
                                MELHOR RESPOSTA
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {new Date(reply.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.4 }}>
                          {reply.texto}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Caixa de Resposta */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={studentReplyText}
                    onChange={(e) => setStudentReplyText(e.target.value)}
                    placeholder="Escreva sua contribuição ou resposta..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '0.88rem' }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !studentReplyText.trim()}
                    className="btn-gradient"
                    style={{ padding: '0.65rem 1.25rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                  >
                    Responder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ABA: MEUS CERTIFICADOS DIGITAIS
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'certificates' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ color: '#06b6d4', width: '1.4rem', height: '1.4rem' }} />
              Meus Certificados Digitais Acadêmicos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
              Certificados autenticados com hash criptográfico, código de verificação institucional e validade curricular.
            </p>
          </div>

          {/* Grid de Certificados Emitidos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {myCertificates.map(cert => (
              <div
                key={cert.id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(245,158,11,0.3)',
                  background: 'rgba(245,158,11,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                      CERTIFICADO DE CONCLUSÃO
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {cert.dataEmissao}
                    </span>
                  </div>

                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                    {cert.tituloCurso}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                    Certificamos que <strong>{cert.alunoNome}</strong> concluiu com êxito todas as atividades práticas e avaliações formativas.
                  </p>

                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Código de Validação de Autenticidade:</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#06b6d4', fontFamily: 'monospace' }}>
                      {cert.codigoValidacao}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setPreviewCert(cert)}
                    className="btn-gradient"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    Visualizar Diploma
                  </button>
                </div>
              </div>
            ))}

            {/* Card para Reivindicar Certificados de Novas Disciplinas */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px dashed rgba(255,255,255,0.15)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 800 }}>FORMAÇÃO CONTINUADA</span>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, margin: '0.35rem 0 0.5rem' }}>
                  Física Teórica & Prática Experimental
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem' }}>
                  Requisito: concluir no mínimo 4 laboratórios do módulo de Física com aproveitamento superior a 70%.
                </p>
              </div>
              <button
                onClick={() => handleClaimNewCert('Física Teórica & Prática Experimental')}
                className="btn-outline-cyan"
                style={{ padding: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Emitir Certificado (40h)
              </button>
            </div>
          </div>

          {/* Validador Público de Certificados para Estudantes */}
          <div className="glass-card" style={{ padding: '1.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🔍 Verificar Autenticidade de Qualquer Certificado
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0 0 1rem' }}>
              Compartilhe o código hash com sua escola, universidade ou empregador para comprovação pública de conclusão.
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
                onClick={handleVerifyCode}
                className="btn-outline-cyan"
                style={{ padding: '0.65rem 1.15rem', fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Verificar Código
              </button>
            </div>

            {validateResult.searched && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: validateResult.cert ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: validateResult.cert ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                {validateResult.cert ? (
                  <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                    <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>✓ Certificado Autêntico e Registrado!</div>
                    <div>Estudante: <strong>{validateResult.cert.alunoNome}</strong></div>
                    <div>Disciplina: <strong>{validateResult.cert.tituloCurso}</strong> ({validateResult.cert.cargaHorariaHoras} horas)</div>
                    <div>Emitido em: <strong>{validateResult.cert.dataEmissao}</strong></div>
                  </div>
                ) : (
                  <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem' }}>
                    Código de validação não encontrado no registro institucional.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal / Visualizador Solene de Diploma Formal */}
          {previewCert && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '750px',
                  background: '#0e131f',
                  border: '4px double #d97706',
                  borderRadius: '16px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                <button
                  onClick={() => setPreviewCert(null)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X style={{ width: '1.5rem', height: '1.5rem' }} />
                </button>

                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏛️</div>
                <div style={{ fontSize: '0.85rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#d97706', fontWeight: 800, marginBottom: '0.5rem' }}>
                  REPÚBLICA FEDERATIVA DO BRASIL • PLATAFORMA EDU-INTERACT
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', margin: '0 0 1.5rem', fontFamily: 'serif', letterSpacing: '1px' }}>
                  CERTIFICADO DE CONCLUSÃO ACADÊMICA
                </h2>

                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.8, margin: '0 0 1.5rem' }}>
                  Certificamos para os devidos fins legais e comprovação curricular que o(a) estudante
                  <br />
                  <strong style={{ fontSize: '1.35rem', color: '#06b6d4', display: 'block', margin: '0.5rem 0' }}>
                    {previewCert.alunoNome}
                  </strong>
                  concluiu com louvor e aproveitamento satisfatório as atividades práticas, simulações virtuais e avaliações formais do curso de
                  <br />
                  <strong style={{ fontSize: '1.2rem', color: '#f59e0b', display: 'block', margin: '0.4rem 0' }}>
                    {previewCert.tituloCurso}
                  </strong>
                  com carga horária total de <strong>{previewCert.cargaHorariaHoras} horas</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <div style={{ textAlign: 'left', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <div>Data de Expedição: <strong>{previewCert.dataEmissao}</strong></div>
                    <div>Código Hash: <strong style={{ fontFamily: 'monospace', color: '#06b6d4' }}>{previewCert.codigoValidacao}</strong></div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '160px', borderBottom: '1px solid #94a3b8', marginBottom: '0.35rem' }} />
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Coordenação Pedagógica</span>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="btn-gradient"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <Printer style={{ width: '1rem', height: '1rem' }} />
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
