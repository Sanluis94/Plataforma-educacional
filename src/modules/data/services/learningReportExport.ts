import type { ClassLearningReport } from '../learningAnalyticsTypes';

export const LEARNING_STATUS_LABELS = {
  sem_dados: 'Sem evidências', em_destaque: 'Destaque', regular: 'Em acompanhamento', precisa_apoio: 'Precisa de apoio',
} as const;

export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);
  // Spreadsheet applications can evaluate text as a formula even inside quotes.
  const firstContent = [...text].find(character => character.charCodeAt(0) > 31 && character.trim() !== '');
  if ((firstContent && '=+-@'.includes(firstContent)) || ['\t', '\r', '\n'].includes(text[0])) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Uniform columns: a student without evidence still gets an explicit row. */
export function buildClassLearningReportCSV(report: ClassLearningReport): string {
  const headers = [
    'Turma ID', 'Turma', 'Atualizado em', 'Origem dos dados', 'Aluno ID', 'Aluno', 'Situação de acompanhamento',
    'Motivos para acompanhamento', 'Entregas atribuídas concluídas', 'Entregas atribuídas esperadas',
    'Média consolidada (%)', 'Último registro', 'Registro ID', 'Tipo', 'Atividade ID', 'Atividade', 'Disciplina',
    'Estado da entrega', 'Nota da tentativa (%)', 'Tempo ativo medido (segundos)', 'Data da tentativa',
    'Respostas e correção', 'Hipóteses', 'Conclusão do aluno', 'Parâmetros experimentais', 'Leituras experimentais', 'Amostras do experimento', 'Nota estimada do treino (0–1000)',
  ];
  const rows: unknown[][] = [headers];
  for (const student of report.students) {
    const records = student.records.length ? student.records : [null];
    for (const record of records) rows.push([
      report.classId, report.className, report.generatedAt, report.source,
      student.studentId, student.studentName, LEARNING_STATUS_LABELS[student.status], student.supportReasons.join(' | '),
      student.completedAssignedCount, student.expectedCount, student.averageScore, student.lastActive,
      record?.id, record?.source, record?.itemId, record?.title, record?.subject,
      record ? record.evidence?.stage === 'exploration' ? 'Exploração' : record.evidence?.stage === 'response' ? 'Resposta entregue sem correção automática' : record.completed ? 'Concluída' : 'Pendente' : 'Sem evidências',
      record?.score, record?.activeSeconds, record?.submittedAt,
      record?.evidence?.questions?.map(question => `${question.question}: ${question.selectedText || `alternativa ${question.selectedOption === null ? 'não respondida' : question.selectedOption + 1}`}; ${question.correct === null ? 'sem correção' : question.correct ? 'correta' : 'incorreta'}`).join(' | '),
      record?.evidence?.observations?.map(observation => `${observation.scenarioLabel || observation.scenarioId}${observation.observed === undefined ? '' : observation.observed ? ' (observação consultada)' : ' (previsão inicial)'}: ${observation.hypothesis}`).join(' | '),
      record?.evidence?.reflection,
      record?.evidence?.experiment ? JSON.stringify({ values: record.evidence.experiment.parameters, labels: record.evidence.experiment.parameterLabels, units: record.evidence.experiment.parameterUnits }) : null,
      record?.evidence?.experiment ? JSON.stringify({ values: record.evidence.experiment.telemetry, labels: record.evidence.experiment.telemetryLabels, units: record.evidence.experiment.telemetryUnits }) : null,
      record?.evidence?.experiment?.samples, record?.evidence?.estimatedScore?.value,
    ]);
  }
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
}
