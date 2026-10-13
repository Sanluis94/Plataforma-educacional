export interface LabReportData {
  labId: string;
  labTitle: string;
  academicLevel: string;
  subject: string;
  studentName: string;
  className?: string;
  institutionName?: string;
  date: string;
  durationSeconds: number;
  parametersUsed: Record<string, number>;
  parameterDefinitions?: { id: string; label: string; unit: string }[];
  telemetrySnapshot: Record<string, number>;
  diagnosticQuestionText?: string;
  selectedAnswerText?: string;
  isCorrect?: boolean;
  scorePct?: number;
  diagnosticResults?: { question: string; selectedAnswer?: string; correct: boolean }[];
  studentNotes?: string;
  teacherFeedback?: string;
}

const labelFor = (data: LabReportData, key: string) => {
  const definition = data.parameterDefinitions?.find(parameter => parameter.id === key);
  return definition ? `${definition.label}${definition.unit ? ` (${definition.unit})` : ''}` : key;
};
const duration = (data: LabReportData) => {
  const seconds = Math.max(0, Math.round(data.durationSeconds));
  return `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
};
const result = (correct: boolean | undefined) => correct === undefined ? 'Não avaliada' : correct ? 'Resposta correta' : 'Resposta incorreta';
const score = (data: LabReportData) => data.scorePct === undefined ? 'Não avaliada' : `${data.scorePct}% de acertos`;
const questions = (data: LabReportData) => data.diagnosticResults ?? (data.diagnosticQuestionText ? [{ question: data.diagnosticQuestionText, selectedAnswer: data.selectedAnswerText, correct: data.isCorrect }] : []);
const footer = 'Relatório da prática gerado pela Plataforma Kortex. Não é um certificado nem comprova validação docente.';

export function generateLabReportMarkdown(data: LabReportData): string {
  return `# RELATÓRIO TÉCNICO DE LABORATÓRIO VIRTUAL
**Plataforma Kortex**

### 1. IDENTIFICAÇÃO
- **Instituição:** ${data.institutionName || 'Não informada'}
- **Laboratório:** ${data.labTitle} (${data.labId})
- **Disciplina:** ${data.subject} | **Nível:** ${data.academicLevel}
- **Estudante:** ${data.studentName}
- **Turma:** ${data.className || 'Prática livre / autoestudo'}
- **Data:** ${data.date}
- **Tempo de uso ativo:** ${duration(data)}

### 2. PARÂMETROS UTILIZADOS
${Object.entries(data.parametersUsed).map(([key, value]) => `- **${labelFor(data, key)}:** ${value}`).join('\n') || '_Nenhum parâmetro registrado._'}

### 3. MEDIÇÕES DA BANCADA
${Object.entries(data.telemetrySnapshot).map(([key, value]) => `- **${key}:** ${value.toFixed(3)}`).join('\n') || '_Nenhuma medição registrada._'}

### 4. AVALIAÇÃO DIAGNÓSTICA
**Resultado geral:** ${score(data)}
${questions(data).map((question, index) => `\n${index + 1}. ${question.question}\n- Resposta: ${question.selectedAnswer || 'Não respondida'}\n- Resultado: ${result(question.correct)}`).join('\n') || '\n_Nenhuma questão corrigida registrada._'}

### 5. ANOTAÇÕES DO ESTUDANTE
${data.studentNotes || '_Sem anotações registradas._'}

### 6. PARECER DOCENTE
${data.teacherFeedback || '_Não informado._'}

---
${footer}
`;
}

const escapeLatex = (value: unknown) => String(value).replace(/[\\{}$&#%_^~]/g, character => ({ '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '$': '\\$', '&': '\\&', '#': '\\#', '%': '\\%', '_': '\\_', '^': '\\textasciicircum{}', '~': '\\textasciitilde{}' }[character]!));

export function generateLabReportLatex(data: LabReportData): string {
  const text = escapeLatex;
  const list = (entries: string[]) => entries.length ? `\\begin{itemize}\n${entries.map(entry => `  \\item ${entry}`).join('\n')}\n\\end{itemize}` : 'Nenhum dado registrado.';
  return `\\documentclass{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage[portuguese]{babel}
\\usepackage{textcomp}
\\title{Relatório Técnico: ${text(data.labTitle)}}
\\author{Estudante: ${text(data.studentName)}}
\\date{${text(data.date)}}
\\begin{document}
\\maketitle
\\section{Identificação}
Laboratório: ${text(data.labId)}\\\\
Disciplina: ${text(data.subject)}\\\\
Nível: ${text(data.academicLevel)}\\\\
Turma: ${text(data.className || 'Prática livre / autoestudo')}\\\\
Instituição: ${text(data.institutionName || 'Não informada')}\\\\
Tempo de uso ativo: ${text(duration(data))}
\\section{Parâmetros utilizados}
${list(Object.entries(data.parametersUsed).map(([key, value]) => `${text(labelFor(data, key))}: ${text(value)}`))}
\\section{Medições da bancada}
${list(Object.entries(data.telemetrySnapshot).map(([key, value]) => `${text(key)}: ${text(value.toFixed(3))}`))}
\\section{Avaliação diagnóstica}
Resultado geral: ${text(score(data))}
${list(questions(data).map(question => `${text(question.question)} -- Resposta: ${text(question.selectedAnswer || 'Não respondida')}. ${text(result(question.correct))}.`))}
\\section{Anotações do estudante}
${text(data.studentNotes || 'Sem anotações registradas.')}
\\section{Parecer docente}
${text(data.teacherFeedback || 'Não informado.')}
\\bigskip
${text(footer)}
\\end{document}`;
}

const escapeHtml = (value: unknown) => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));

/** Returns false when the browser cannot open the printable report. */
export function triggerPrintLabReport(data: LabReportData): boolean {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  const text = escapeHtml;
  const rows = (entries: [string, number][]) => entries.map(([key, value]) => `<tr><td>${text(key)}</td><td>${text(value)}</td></tr>`).join('') || '<tr><td colspan="2">Nenhum dado registrado.</td></tr>';
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório: ${text(data.labTitle)}</title>
<style>body{font-family:Arial,sans-serif;margin:32px;color:#1e293b}h1{font-size:21px}h2{font-size:16px;margin-top:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}p,li,td{overflow-wrap:anywhere}footer{margin-top:32px;border-top:1px solid #cbd5e1;padding-top:12px;font-size:12px}pre{white-space:pre-wrap;font-family:inherit}@media print{body{margin:15px}}</style></head><body>
<h1>Plataforma Kortex · Relatório do experimento</h1>
<h2>1. Identificação</h2>
<p>Laboratório: ${text(data.labTitle)} (${text(data.labId)})</p><p>Disciplina: ${text(data.subject)} · Nível: ${text(data.academicLevel)}</p>
<p>Estudante: ${text(data.studentName)} · Turma: ${text(data.className || 'Prática livre / autoestudo')}</p><p>Instituição: ${text(data.institutionName || 'Não informada')}</p><p>Data: ${text(data.date)} · Tempo de uso ativo: ${text(duration(data))}</p>
<h2>2. Parâmetros utilizados</h2><table><thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead><tbody>${rows(Object.entries(data.parametersUsed).map(([key, value]) => [labelFor(data, key), value]))}</tbody></table>
<h2>3. Medições da bancada</h2><table><thead><tr><th>Medição</th><th>Valor</th></tr></thead><tbody>${rows(Object.entries(data.telemetrySnapshot))}</tbody></table>
<h2>4. Avaliação diagnóstica</h2><p>Resultado geral: ${text(score(data))}</p>
${questions(data).map((question, index) => `<p><strong>${index + 1}. ${text(question.question)}</strong><br>Resposta: ${text(question.selectedAnswer || 'Não respondida')}<br>Resultado: ${text(result(question.correct))}</p>`).join('') || '<p>Nenhuma questão corrigida registrada.</p>'}
<h2>5. Anotações do estudante</h2><pre>${text(data.studentNotes || 'Sem anotações registradas.')}</pre>
<h2>6. Parecer docente</h2><pre>${text(data.teacherFeedback || 'Não informado.')}</pre>
<footer>${footer}</footer><script>window.onload=function(){window.print();}</script></body></html>`;
  try {
    printWindow.opener = null;
    printWindow.document.write(html);
    printWindow.document.close();
    return true;
  } catch {
    printWindow.close();
    return false;
  }
}
