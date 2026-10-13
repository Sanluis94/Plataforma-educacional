import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GRADE_PERIODS, getGradePolicy, applyPublishedReviews, type GradePolicy, type GradePeriod } from '../../data/repositories/gradePolicyRepository';
import { gradePolicyDataInPeriod } from '../../data/services/gradePolicyPeriod';
import { getPublishedSubmissionReviewsByStudent, type SubmissionReview } from '../../data/repositories/submissionRepository';
import { StudentReviewCard } from './StudentReviewCard';
import {
  Calendar, CheckCircle, AlertTriangle,
  MessageSquare, Star, Plus
} from 'lucide-react';
import type {
  AttendanceRecord,
  ForumTopic,
  SubmissionData, ExamAttempt, ActivityData
} from '../../data/types';
import {
  getAttendanceByClass,
  calculateStudentAttendanceRate,
  calculateClassGradebook,
  DEFAULT_WEIGHTS,
  calculateSemesterGrade,
  subscribeForumTopicsByClass,
  saveForumTopic,
  addForumReply
} from '../../data/repositories/gradebookRepository';
import {
  getStudentCertificates,
  type Certificate
} from '../../core/services/certificateService';
import { getSubmissionsByStudentInClass } from '../../data/repositories/submissionRepository';
import { getExamAttemptsByStudent } from '../../data/repositories/examRepository';
import { getActivitiesByClass } from '../../data/repositories/activityRepository';
const gradeLabel = (score: number | null) => score === null ? 'Sem dados' : score.toFixed(1);

interface StudentLmsModulesProps {
  studentId: string;
  studentName: string;
  selectedClassId: string | null;
  activeView: 'gradebook' | 'forum' | 'certificates';
  onViewChange: (view: 'gradebook' | 'forum' | 'certificates') => void;
  period?: GradePeriod;
  onPeriodChange?: (period: GradePeriod) => void;
}

export function StudentLmsModules({
  studentId,
  studentName,
  selectedClassId,
  activeView,
  period = 'atual', onPeriodChange
}: StudentLmsModulesProps) {
  // ─────────────────────────────────────────────────────────────
  // 1. DADOS DE FREQUÊNCIA & BOLETIM ESCOLAR
  // ─────────────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [policy, setPolicy] = useState<GradePolicy | null>(null);
  const [reviews, setReviews] = useState<SubmissionReview[]>([]);

  useEffect(() => {
    let alive = true;
    setAttendanceRecords([]);
    setSubmissions([]);
    setExamAttempts([]);
    setActivities([]);
    setPolicy(null); setReviews([]);
    setGradeError(null);
    if (!selectedClassId) return;
    setGradeLoading(true);
    const fetchAtt = async () => {
      try {
        const [recs, subs, attempts, classActivities, publishedPolicy, publishedReviews] = await Promise.all([getAttendanceByClass(selectedClassId), getSubmissionsByStudentInClass(studentId, selectedClassId), getExamAttemptsByStudent(studentId), getActivitiesByClass(selectedClassId), getGradePolicy(selectedClassId, period), getPublishedSubmissionReviewsByStudent(studentId, selectedClassId)]);
        if (!alive) return;
        setAttendanceRecords(recs);
        setSubmissions(subs);
        setExamAttempts(attempts);
        setActivities(classActivities);
        setPolicy(publishedPolicy); setReviews(publishedReviews);
      } catch {
        if (alive) setGradeError('Não foi possível carregar suas avaliações. Recarregue a página para tentar novamente.');
      } finally {
        if (alive) setGradeLoading(false);
      }
    };
    void fetchAtt();
    return () => { alive = false; };
  }, [selectedClassId, studentId, period]);

  const periodData = gradePolicyDataInPeriod(policy, { submissions, examAttempts, attendanceRecords });
  const availablePeriodData = period === 'atual' || policy ? periodData : { submissions: [], examAttempts: [], attendanceRecords: [] };
  const attStats = calculateStudentAttendanceRate(studentId, availablePeriodData.attendanceRecords);

  const weights = policy?.weights ?? DEFAULT_WEIGHTS;
  const finalGrade = calculateClassGradebook([{ id: studentId, name: studentName }], selectedClassId ?? '', applyPublishedReviews(availablePeriodData.submissions, reviews, policy), availablePeriodData.examAttempts, weights, { attendanceRecords: availablePeriodData.attendanceRecords, activities, participationScores: policy?.participationScores, p1ExamId: policy?.p1ExamId ?? undefined, p2ExamId: policy?.p2ExamId ?? undefined })[0];
  const universityGrade = policy?.mode === 'university' ? calculateSemesterGrade({ p1: finalGrade.notaP1 ?? null, p2: finalGrade.notaP2 ?? null, labs: finalGrade.notaLabs }, policy.universityWeights) : null;
  const finalValue = universityGrade ? universityGrade.mediaSemestre : finalGrade.mediaFinal;
  const finalStatus = universityGrade ? universityGrade.statusUniv : finalGrade.situacao;
  const studentScores = finalGrade;

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
  const [myCertificates, setMyCertificates] = useState<Certificate[]>([]);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  useEffect(() => {
    let active = true;
    setCertificateLoading(true); setCertificateError('');
    void getStudentCertificates(studentId).then(certificates => { if (active) setMyCertificates(certificates); }).catch(() => { if (active) setCertificateError('Não foi possível carregar seus documentos. Tente recarregar a página.'); }).finally(() => { if (active) setCertificateLoading(false); });
    return () => { active = false; };
  }, [studentId]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. ABA: MEU BOLETIM ESCOLAR & FREQUÊNCIA
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'gradebook' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section className="card" style={{padding:16,marginBottom:16}} aria-label="Critérios da minha turma"><h2>Critérios da turma e período</h2><label>Período<select value={period} onChange={event=>onPeriodChange?.(event.target.value as GradePeriod)}>{GRADE_PERIODS.map(value=><option key={value} value={value}>{value==='atual'?'Histórico completo':value}</option>)}</select></label>{policy?<><p>{policy.explanation}</p><p>Versão {policy.version} · Atualizada em {new Date(policy.updatedAt).toLocaleString('pt-BR')}.</p>{policy.mode==='university'&&<p>P1: {gradeLabel(finalGrade.notaP1??null)} ({policy.universityWeights.p1}%) · P2: {gradeLabel(finalGrade.notaP2??null)} ({policy.universityWeights.p2}%) · Laboratórios: {gradeLabel(finalGrade.notaLabs)} ({policy.universityWeights.labs}%).</p>}<p>{policy.reviewMode==='replace-submission-score'?'Pareceres publicados substituem a nota automática das entregas corrigidas neste boletim.':'Pareceres publicados orientam o estudo e ficam separados da nota automática.'}</p></>:<p>{period==='atual'?'O professor ainda não publicou critérios. Os valores abaixo usam o modelo padrão, identificado como provisório.':'O professor ainda não publicou critérios para este período; não há média deste recorte.'}</p>}</section>
          {reviews.length>0&&<section aria-label="Pareceres publicados"><h2>Devolutivas do professor</h2>{reviews.map(review=><StudentReviewCard key={review.id} review={review} participatesInGrade={policy?.reviewMode==='replace-submission-score'} />)}</section>}
          {gradeLoading && <p role="status">Carregando suas entregas e avaliações…</p>}
          {gradeError && <p role="alert">{gradeError}</p>}
          {/* Card de Frequência Escolar e Indicador LDB */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', border: attStats.alertaLDB ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.3)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Calendar style={{ color: 'var(--color-secondary, #293E24)', width: '1.25rem', height: '1.25rem' }} />
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Frequência registrada na turma
                </h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Esta taxa considera as chamadas registradas pelo professor. Sem chamadas, a frequência permanece sem dados.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{attStats.presencas} presenças / {attStats.faltas} faltas</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: attStats.alertaLDB ? '#ef4444' : '#10b981' }}>
                  {attStats.taxaPercentual === null ? 'Sem chamada' : `${attStats.taxaPercentual}%`}
                </div>
              </div>
              <div>
                {attStats.taxaPercentual === null ? <span>Sem evidência de frequência</span> : attStats.alertaLDB ? (
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
            <div style={{ display: 'flex', flexWrap:'wrap',gap:'1rem',justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Boletim de Avaliação Contínua
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Panorama das entregas reais e dos critérios compartilhados da turma. Não substitui o boletim oficial da instituição.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Média Final:</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 900, color: finalValue === null ? 'var(--text-muted)' : finalValue >= 6.0 ? '#10b981' : '#ef4444' }}>
                  {finalValue === null ? 'Sem média' : finalValue.toFixed(1)}
                </span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, background: finalStatus === 'Aprovado' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: finalStatus === 'Aprovado' ? '#10b981' : '#ef4444' }}>
                  {finalStatus}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(184,68,31,0.05)', border: '1px solid rgba(184,68,31,0.2)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, textTransform: 'uppercase' }}>📝 Provas formais ({weights.pesoProvas}%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {gradeLabel(studentScores.notaProvas)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentScores.notaProvas === null ? '' : '/ 10'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avaliações com gabarito e tempo limitado</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(41,62,36,0.06)', border: '1px solid var(--border-color, #E2D7C3)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary, #293E24)', fontWeight: 700, textTransform: 'uppercase' }}>🔬 Laboratórios interativos ({weights.pesoLabs}%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {gradeLabel(studentScores.notaLabs)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentScores.notaLabs === null ? '' : '/ 10'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulações práticas e relatórios concluídos</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(41,62,36,0.04)', border: '1px solid var(--border-color, #E2D7C3)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary, #293E24)', fontWeight: 700, textTransform: 'uppercase' }}>📄 Atividades práticas ({weights.pesoAtividades}%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {gradeLabel(studentScores.notaAtividades)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentScores.notaAtividades === null ? '' : '/ 10'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exercícios e questionários de fixação</span>
              </div>

              <div className="glass-card" style={{ padding: '1rem', background: 'rgba(228,104,63,0.06)', border: '1px solid rgba(228,104,63,0.25)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700, textTransform: 'uppercase' }}>💬 Participação & fórum ({weights.pesoParticipacao}%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.15rem' }}>
                  {gradeLabel(studentScores.notaParticipacao)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentScores.notaParticipacao === null ? '' : '/ 10'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Colaboração em dúvidas e respostas da turma</span>
              </div>
            </div>
            {finalGrade.missingCategories.length > 0 && <p style={{ color: 'var(--text-secondary)' }}>A média está incompleta. Categorias sem evidência: {finalGrade.missingCategories.join(', ')}. A nota de participação depende de avaliação declarada pelo professor.</p>}
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
                <MessageSquare style={{ color: 'var(--color-primary-accessible, #B8441F)', width: '1.4rem', height: '1.4rem' }} />
                Fórum de dúvidas & debates da turma
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
            <form onSubmit={handlePostQuestion} className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color, #E2D7C3)' }}>
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
                <button type="button" onClick={() => setIsAskingQuestion(false)} className="btn-outline" style={{ padding: '0.55rem 1.15rem' }}>
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
                        border: isSelected ? '1px solid var(--color-primary, #E4683F)' : '1px solid var(--border-color, #E2D7C3)',
                        background: isSelected ? 'rgba(228, 104, 63, 0.08)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-secondary, #293E24)', background: 'var(--color-neutral-300, #E2D7C3)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
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
                        <span>Autor: <strong style={{ color: 'var(--text-main)' }}>{top.autorNome}</strong></span>
                        <span style={{ color: 'var(--color-primary-accessible, #B8441F)', fontWeight: 700 }}>
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
                <div style={{ borderBottom: '1px solid var(--border-color, #E2D7C3)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary-accessible, #B8441F)' }}>{selectedTopic.disciplina}</span>
                    <button onClick={() => setSelectedTopic(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}>Fechar</button>
                  </div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                    {selectedTopic.titulo}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    Por <strong style={{ color: 'var(--text-main)' }}>{selectedTopic.autorNome}</strong> • {new Date(selectedTopic.criadoEm).toLocaleString('pt-BR')}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, background: 'var(--color-neutral-300, #E2D7C3)', padding: '1rem', borderRadius: '8px' }}>
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
                          border: reply.isMelhorResposta ? '1px solid #f59e0b' : reply.autorRole === 'professor' ? '1px solid var(--color-secondary, #293E24)' : '1px solid var(--border-color, #E2D7C3)',
                          background: reply.isMelhorResposta ? 'rgba(245,158,11,0.08)' : reply.autorRole === 'professor' ? 'rgba(41,62,36,0.08)' : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{reply.autorNome}</strong>
                            {reply.autorRole === 'professor' && (
                              <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--color-secondary, #293E24)', color: 'var(--color-neutral-100, #FAF7EE)', fontWeight: 800 }}>
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
      {activeView === 'certificates' && <section className="fade-in" style={{ color: 'var(--text-main)', minWidth: 0 }}>
        <h2>Meus certificados e comprovantes</h2>
        <p>Certificados de curso são emitidos pelo professor após conferir requisitos e a carga horária autorizada. Comprovantes de laboratórios registram atividades avaliadas e tempo observado; não substituem uma certificação institucional.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '1rem 0' }}><Link to="/simulacao" className="btn-outline">Gerar comprovante de laboratórios</Link><Link to="/verificar-certificado" className="btn-outline">Verificar documento</Link></div>
        {certificateLoading && <p role="status">Carregando documentos…</p>}
        {certificateError && <p role="alert">{certificateError}</p>}
        {!certificateLoading && !certificateError && myCertificates.length === 0 && <p>Você ainda não possui documentos emitidos. Seu professor pode emitir um certificado quando os requisitos forem cumpridos; avaliações registradas nos laboratórios podem gerar um comprovante.</p>}
        <div style={{ display: 'grid', gap: '1rem' }}>{myCertificates.map(certificate => <article key={certificate.id} className="glass-card" style={{ padding: '1.25rem', minWidth: 0 }}>
          <h3>{certificate.tituloCurso}</h3>
          <p>{certificate.kind === 'course' ? 'Certificado de curso autorizado pelo professor' : 'Comprovante de atividades'} · {certificate.status === 'revoked' ? 'Revogado' : 'Registro ativo'}</p>
          <p>Emitido em {new Date(certificate.dataEmissao).toLocaleDateString('pt-BR')}. {certificate.completedCount} atividades verificadas.</p>
          <p>{certificate.kind === 'course' ? certificate.cargaHorariaHoras + ' horas autorizadas do curso; este valor não representa tempo medido de uso.' : 'Este comprovante não atribui carga horária de curso.'}</p>
          <p>Tempo de uso observado: {certificate.observedSeconds === null ? 'medição incompleta, sem estimativa' : Math.round(certificate.observedSeconds / 60) + ' minutos nas atividades verificadas'}.</p>
          <details><summary>Ver dados do meu documento</summary><p>Estudante: {certificate.alunoNome}</p><p>Responsável: {certificate.instituicao}</p><p>Requisitos: {certificate.requirements.minimumCompleted} atividades, com aproveitamento mínimo de {certificate.requirements.minScore}%.</p><p style={{ overflowWrap: 'anywhere' }}>Código: {certificate.codigoValidacao}</p></details>
          <Link to={'/verificar-certificado?codigo=' + encodeURIComponent(certificate.codigoValidacao)} className="btn-outline">Consultar validade pública</Link>
        </article>)}</div>
      </section>}

    </div>
  );
}
