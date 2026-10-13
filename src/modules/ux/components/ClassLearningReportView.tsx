import { useEffect, useMemo, useRef, useState } from 'react';
import { buildPedagogicalSummary, generatePedagogicalDiagnosis, getEffectiveGeminiApiKey, type PedagogicalDiagnosis } from '../../core/services/geminiService';
import type { ClassLearningReport, LearningRecord, LearningStatus } from '../../data/learningAnalyticsTypes';
import './ClassLearningReportView.css';
import { LearningPeriodAnalysis } from './LearningPeriodAnalysis';
import { analyzeLearningPeriod } from '../../data/services/learningPeriodAnalysis';

interface Props { report: ClassLearningReport; onViewMessages?: () => void; onReviewSubmission?:(studentId:string,submissionId:string)=>void; onPlanRetake?:(topic:string)=>void; onOrientStudent?:(studentId:string)=>void }
const STATUS_LABELS: Record<LearningStatus, string> = { sem_dados: 'Sem evidências', precisa_apoio: 'Precisa de apoio', regular: 'Em acompanhamento', em_destaque: 'Destaque' };
const STATUS_ORDER: Record<LearningStatus, number> = { precisa_apoio: 0, sem_dados: 1, regular: 2, em_destaque: 3 };
const SOURCE_LABELS = { activity: 'Atividade', lab: 'Laboratório', exam: 'Avaliação', enem: 'Treino ENEM' };
const percent = (value: number | null) => value === null ? 'Sem dados' : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
const minutes = (value: number | null) => value === null ? 'Não registrado' : value < 1 ? `${Math.round(value * 60)} s` : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min`;
const dateLabel = (value: string | null) => !value || !Number.isFinite(Date.parse(value)) ? 'Sem registro' : new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const PARAMETER_LABELS: Record<string, string> = { gravity: 'Gravidade', mass: 'Massa', velocity: 'Velocidade', speed: 'Velocidade', temperature: 'Temperatura', pressure: 'Pressão', volume: 'Volume', time: 'Tempo', energy: 'Energia', height: 'Altura', angle: 'Ângulo', force: 'Força', distance: 'Distância', concentration: 'Concentração', acceleration: 'Aceleração', friction: 'Atrito', voltage: 'Tensão', current: 'Corrente', resistance: 'Resistência' };
function variableLabel(key: string) { return PARAMETER_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' '); }

function RecordEvidence({ record, onReview }: { record: LearningRecord; onReview?:()=>void }) {
  const evidence = record.evidence;
  return <article className="learning-report-record">
    <h5>{record.title}</h5>
    {onReview && (record.source==='activity'||record.source==='lab') && <button type="button" className="btn-outline" onClick={onReview}>Corrigir esta entrega</button>}
    <p className="learning-report-muted">{SOURCE_LABELS[record.source]} · {record.assigned ? 'Atribuída à turma' : 'Prática complementar'} · {evidence?.stage === 'exploration' ? 'Exploração registrada' : evidence?.stage === 'response' ? 'Resposta entregue para leitura' : record.completed ? 'Concluída' : 'Em andamento'}</p>
    <dl className="learning-report-record-meta">
      <div><dt>{record.source === 'enem' ? 'Acertos (%)' : 'Nota registrada'}</dt><dd>{evidence?.stage === 'exploration' ? 'Não se aplica à exploração' : evidence?.stage === 'response' ? 'Resposta escrita sem correção automática' : percent(record.score)}</dd></div>
      <div><dt>Enviada em</dt><dd>{dateLabel(record.submittedAt)}</dd></div>
      <div><dt>Tempo de uso medido</dt><dd>{minutes(record.activeSeconds === null ? null : record.activeSeconds / 60)}</dd></div>
    </dl>
    {evidence?.estimatedScore && <p><strong>Nota estimada do treino (escala 0–1000):</strong> {evidence.estimatedScore.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}. Modelo de treino inspirado na TRI; este valor não entra na média percentual da turma.</p>}
    {evidence?.questions?.length ? <div className="learning-report-evidence"><h6>Respostas às questões</h6><ol>{evidence.questions.map((question, index) => <li key={`${question.questionId}-${index}`}>
      <p>{question.question}</p><span>{question.selectedOption === null ? 'Sem resposta' : `Opção marcada: ${question.selectedText || `${question.selectedOption + 1}ª alternativa`}`} · {question.correct === null ? 'Sem correção automática.' : question.correct ? 'Resposta correta.' : 'Resposta incorreta: retomar este conceito.'}</span>
      {question.expectedText && <p><strong>Resposta esperada na entrega:</strong> {question.expectedText}</p>}
      {question.explanation && <p>{question.explanation}</p>}
    </li>)}</ol></div> : null}
    {evidence?.observations?.length ? <div className="learning-report-evidence"><h6>Hipóteses registradas</h6><ul>{evidence.observations.map((observation, index) => <li key={`${observation.scenarioId}-${index}`}><p><strong>{observation.scenarioLabel || observation.scenarioId}</strong>{observation.observed === undefined ? '' : observation.observed ? ' · Observação consultada' : ' · Previsão inicial'}</p><p>{observation.hypothesis || 'Sem hipótese escrita.'}</p></li>)}</ul></div> : null}
    {evidence?.reflection && <div className="learning-report-evidence"><h6>Reflexão do aluno</h6><p className="learning-report-written">{evidence.reflection}</p></div>}
    {evidence?.experiment && <details className="learning-report-experiment"><summary>Ver registros do experimento</summary>
      <p>{evidence.experiment.samples} amostras registradas. Valores preservados como foram enviados pela atividade.</p>
      {Object.entries(evidence.experiment.parameters).length > 0 && <><h6>Parâmetros utilizados</h6><dl>{Object.entries(evidence.experiment.parameters).map(([key, value]) => <div key={key}><dt>{evidence.experiment?.parameterLabels?.[key] || variableLabel(key)}</dt><dd>{value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {evidence.experiment?.parameterUnits?.[key] || '(sem unidade registrada)'}</dd></div>)}</dl></>}
      {Object.entries(evidence.experiment.telemetry).length > 0 && <><h6>Resultados observados</h6><dl>{Object.entries(evidence.experiment.telemetry).map(([key, value]) => <div key={key}><dt>{evidence.experiment?.telemetryLabels?.[key] || variableLabel(key)}</dt><dd>{value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} {evidence.experiment?.telemetryUnits?.[key] || '(sem unidade registrada)'}</dd></div>)}</dl></>}
    </details>}
    {!evidence && <p className="learning-report-muted">Este registro antigo contém apenas o resultado. Respostas, reflexão e tempo não foram registrados.</p>}
    {evidence && !evidence.questions?.length && !evidence.observations?.length && !evidence.reflection && !evidence.experiment && <p className="learning-report-muted">Não há respostas ou observações detalhadas nesta entrega.</p>}
  </article>;
}

/** Dados consolidados e evidências individuais da turma; ausência de dados permanece visível. */
export function ClassLearningReportView({ report, onViewMessages, onReviewSubmission, onPlanRetake, onOrientStudent }: Props) {
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatus, setStudentStatus] = useState('all');
  const [period,setPeriod] = useState({from:'',to:''});
  const [aiResponse, setAiResponse] = useState<{ report: ClassLearningReport; diagnosis: PedagogicalDiagnosis } | null>(null);
  const [loadingReport, setLoadingReport] = useState<ClassLearningReport | null>(null);
  const aiLoading = loadingReport === report;
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, [report]);
  const localSummary = useMemo(() => buildPedagogicalSummary({
    className: report.className, studentsCount: report.studentsCount,
    studentsWithEvidence: report.studentsWithEvidence, scoredRecordsCount: report.scoredRecordsCount,
    averageScore: report.averageScore, completionRate: report.completionRate,
    completedActivitiesCount: report.completedActivitiesCount, expectedCompletions: report.expectedCompletions,
    supportStudentsCount: report.students.filter(student => student.status === 'precisa_apoio').length,
    topModules: report.modules.map(module => ({ module: module.module, averageScore: module.averageScore, count: module.eventsCount })),
  }), [report]);
  const diagnosis = aiResponse?.report === report ? aiResponse.diagnosis : localSummary;
  const visibleStudents = report.students.filter(student => student.studentName.toLocaleLowerCase('pt-BR').includes(studentSearch.toLocaleLowerCase('pt-BR')) && (studentStatus === 'all' || student.status === studentStatus))
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.studentName.localeCompare(b.studentName, 'pt-BR'));
  const generateSummary = async () => {
    const generation = ++request.current;
    setLoadingReport(report);
    try {
      const result = await generatePedagogicalDiagnosis({
        className: report.className, studentsCount: report.studentsCount,
        studentsWithEvidence: report.studentsWithEvidence, scoredRecordsCount: report.scoredRecordsCount,
        averageScore: report.averageScore, completionRate: report.completionRate,
        completedActivitiesCount: report.completedActivitiesCount, expectedCompletions: report.expectedCompletions,
        supportStudentsCount: report.students.filter(student => student.status === 'precisa_apoio').length,
        topModules: report.modules.map(module => ({ module: module.module, averageScore: module.averageScore, count: module.eventsCount })),
      });
      if (generation === request.current) setAiResponse({ report, diagnosis: result });
    } catch {
      if (generation === request.current) setAiResponse({ report, diagnosis: { ...localSummary, notice: 'Não foi possível gerar uma sugestão com IA. O resumo pelos critérios da plataforma foi mantido.' } });
    } finally { if (generation === request.current) setLoadingReport(null); }
  };

  return <section className="learning-report" aria-label={`Acompanhamento da turma ${report.className}`}>
    <header className="learning-report-heading"><div><h2>Aprendizagem da turma</h2><p>{report.className} · Atualizado em {dateLabel(report.generatedAt)}</p></div><span className="learning-report-source">{report.source === 'local' ? 'Dados deste navegador' : report.source === 'batch' ? 'Dados importados' : 'Dados da plataforma'}</span></header>
    {report.source === 'local' && <p className="learning-report-notice">Neste ambiente, as entregas ficam neste navegador. Elas não são compartilhadas automaticamente com outros computadores.</p>}
    <div className="learning-report-metrics">
      <article><h3>Alunos com evidências</h3><strong>{report.studentsWithEvidence} de {report.studentsCount}</strong><p>{report.participationRate === null ? 'Ainda não há alunos matriculados para calcular a participação.' : `${percent(report.participationRate)} dos matriculados enviaram registros.`}</p></article>
      <article><h3>Entregas da turma</h3><strong>{report.completedActivitiesCount} de {report.expectedCompletions}</strong><p>{report.completionRate === null ? 'Ainda não há atividades atribuídas para calcular a conclusão.' : `${percent(report.completionRate)} das entregas esperadas concluídas.`} {report.activitiesCount} atividades atribuídas.</p></article>
      <article><h3>Média das entregas com nota</h3><strong>{percent(report.averageScore)}</strong><p>{report.scoredRecordsCount} resultados com nota, de {report.assessedStudentsCount} alunos. Ausência de nota não equivale a zero.</p></article>
      <article><h3>Tempo médio registrado</h3><strong>{minutes(report.averageTimeSpentMinutes)}</strong><p>Baseado em {report.measuredTimeRecordsCount} registros com tempo medido. Não indica presença nem dedicação.</p></article>
    </div>
    {!report.studentsWithEvidence && <div className="learning-report-notice"><h3>Ainda não há evidências de aprendizagem</h3><p>As primeiras entregas aparecerão aqui após o envio pelos alunos. Confira a matrícula e as atividades atribuídas à turma antes de interpretar a ausência de registros.</p></div>}

    <details className="learning-report-method"><summary>Como lemos estes dados</summary>
      <ul><li>A conclusão conta uma entrega concluída por aluno e atividade atribuída, a partir da última entrega concluída válida. Uma nova tentativa não aumenta a quantidade de atividades concluídas.</li>
        <li>Práticas complementares aparecem nas evidências, mas não aumentam a conclusão das atividades atribuídas.</li>
        <li>A média considera a última avaliação concluída com nota válida de cada aluno e atividade. Explorações e respostas escritas sem correção automática não recebem nota. Uma resposta escrita entregue cumpre a entrega, sem ser transformada em nota zero. Sem nota aparece como “Sem dados”; uma nota zero é um resultado válido.</li>
        <li>“Precisa de apoio” aponta média abaixo de 70% ou atividades com prazo encerrado sem conclusão. “Destaque” aponta média a partir de 85%, sem outros sinais de apoio. Sem entregas, o aluno fica “Sem evidências”. Os motivos aparecem em cada cartão.</li>
        <li>Última evidência significa último envio registrado. O tempo usa os registros representativos com medição disponível. O histórico preserva as tentativas anteriores e as explorações.</li></ul>
      <h3>Conferência dos registros</h3><dl className="learning-report-quality">
        <div><dt>Recebidos</dt><dd>{report.quality.received}</dd></div><div><dt>Válidos</dt><dd>{report.quality.accepted}</dd></div>
        <div><dt>Duplicados removidos</dt><dd>{report.quality.duplicates}</dd></div><div><dt>Novas tentativas consolidadas</dt><dd>{report.quality.retries}</dd></div>
        <div><dt>Descartados por inconsistência</dt><dd>{report.quality.excluded}</dd></div><div><dt>Entregas avaliadas sem nota</dt><dd>{report.quality.missingScores}</dd></div>
        <div><dt>Sem tempo registrado</dt><dd>{report.quality.missingTimes}</dd></div></dl>
      {report.quality.warnings.length > 0 && <><h3>Pontos a conferir</h3><ul>{report.quality.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></>}
    </details>
    <LearningPeriodAnalysis report={report} period={period} onChange={setPeriod} onPlanRetake={onPlanRetake} />
    <section aria-labelledby="learning-students-title"><div className="learning-report-section-heading"><div><h3 id="learning-students-title">Acompanhamento por aluno</h3><p>Confira os motivos e as entregas antes de definir uma intervenção.</p></div>{onViewMessages && <button type="button" className="btn-outline" onClick={onViewMessages}>Abrir mensagens da turma</button>}</div>
      <div className="learning-report-filters"><label>Buscar aluno<input type="search" value={studentSearch} onChange={event => setStudentSearch(event.target.value)} /></label><label>Mostrar<select value={studentStatus} onChange={event => setStudentStatus(event.target.value)}><option value="all">Todos os alunos</option>{Object.entries(STATUS_LABELS).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select></label></div>
      <p className="learning-report-muted" role="status">{visibleStudents.length} de {report.students.length} alunos exibidos.</p>
      <div className="learning-report-students">{visibleStudents.map(student => <article className="learning-report-student" key={student.studentId}><header><h4>{student.studentName}</h4><span className={`learning-report-status status-${student.status}`}>{STATUS_LABELS[student.status]}</span></header>
        <dl className="learning-report-record-meta"><div><dt>Entregas atribuídas</dt><dd>{student.completedAssignedCount} de {student.expectedCount}</dd></div><div><dt>Média com nota</dt><dd>{percent(student.averageScore)}</dd></div><div><dt>Última evidência</dt><dd>{dateLabel(student.lastActive)}</dd></div></dl>
        {student.supportReasons.length > 0 && <ul className="learning-report-reasons">{student.supportReasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>}
        {onOrientStudent&&<button type="button" className="btn-outline" onClick={()=>onOrientStudent(student.studentId)}>Orientar este aluno</button>}
        {student.records.length ? <details><summary>Ver entregas de {student.studentName} no período</summary><div className="learning-report-records">{analyzeLearningPeriod(student.records,period).records.map(record => <RecordEvidence key={`${record.source}:${record.id}`} record={record} onReview={onReviewSubmission?()=>onReviewSubmission(student.studentId,record.id):undefined} />)}{!analyzeLearningPeriod(student.records,period).records.length&&<p>Nenhuma entrega neste período. Ajuste as datas para consultar o histórico.</p>}</div></details> : <p className="learning-report-muted">Nenhuma entrega registrada. Combine com o aluno como iniciar as atividades.</p>}
      </article>)}</div>{!visibleStudents.length && <p className="learning-report-notice">{report.students.length ? 'Nenhum aluno corresponde a este filtro.' : 'Ainda não há alunos matriculados nesta turma.'}</p>}
    </section>
    <section aria-labelledby="learning-activities-title"><h3 id="learning-activities-title">Leitura por atividade</h3><p>Questões com menor acerto ajudam a escolher o que retomar com a turma.</p>
      <div className="learning-report-activities">{report.modules.map(module => <article key={`${module.source}:${module.itemId}`} className="learning-report-activity"><header><div><h4>{module.module}</h4><p className="learning-report-muted">{SOURCE_LABELS[module.source]} · {module.subject || 'Disciplina não informada'} · {module.assigned ? 'Atribuída à turma' : 'Prática complementar'}</p></div><strong>{percent(module.averageScore)}</strong></header>
        <dl className="learning-report-record-meta"><div><dt>Alunos com registro</dt><dd>{module.studentsCount} de {report.studentsCount}</dd></div><div><dt>Entregas concluídas</dt><dd>{module.eventsCount}</dd></div><div><dt>Tentativas válidas</dt><dd>{module.attemptsCount}</dd></div><div><dt>Conclusão</dt><dd>{module.assigned ? percent(module.completionRate) : 'Não se aplica'}</dd></div><div><dt>Tempo total registrado</dt><dd>{minutes(module.totalTimeSpentMinutes)}</dd></div></dl>
        {module.questions.length > 0 ? <details><summary>Ver acertos por questão ({module.questions.length})</summary><ol className="learning-report-questions">{[...module.questions].sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101)).map(question => <li key={question.questionId}><p>{question.question}</p><strong>{question.correct} de {question.responses} respostas corretas · {percent(question.accuracy)}</strong>{question.accuracy !== null && question.accuracy < 70 && <p className="learning-report-reasons">Sugestão: retomar este conceito e revisar as respostas dos alunos.</p>}</li>)}</ol></details> : <p className="learning-report-muted">Sem respostas detalhadas por questão nesta atividade.</p>}
      </article>)}</div>{!report.modules.length && <p className="learning-report-notice">Nenhuma atividade ou entrega disponível para analisar.</p>}
    </section>
    <section className="learning-report-summary" aria-labelledby="learning-summary-title"><div className="learning-report-section-heading"><div><h3 id="learning-summary-title">Resumo para planejar o próximo passo</h3><p>{diagnosis.source === 'gemini' ? 'Resumo gerado com IA a partir dos números da turma. Revise as sugestões antes de agir.' : 'Resumo pelos critérios de acompanhamento da plataforma.'}</p></div><button className="btn-outline" type="button" disabled={aiLoading || !report.studentsWithEvidence} onClick={() => void generateSummary()}>{aiLoading ? 'Gerando resumo…' : 'Gerar sugestão com IA'}</button></div>
      <p>{diagnosis.summary}</p><div className="learning-report-summary-lists"><div><h4>O que os registros mostram</h4><ul>{diagnosis.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div><h4>Próximos passos sugeridos</h4><ul>{diagnosis.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>
      {diagnosis.notice && <p role="status" className="learning-report-notice">{diagnosis.notice}</p>}
      <p className="learning-report-muted">A opção com IA envia apenas números agregados. Nomes, respostas e reflexões dos alunos permanecem fora do pedido. {!getEffectiveGeminiApiKey() && 'Configure sua chave de IA no painel para usar essa opção; o resumo por critérios já está disponível.'}</p>
    </section>
  </section>;
}
