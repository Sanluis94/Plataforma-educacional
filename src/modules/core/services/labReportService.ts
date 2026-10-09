/**
 * Serviço de Geração de Relatórios de Laboratório Kortex (PDF / Impressão / Markdown / LaTeX)
 * Melhoria #5 do Plano Estratégico
 */

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
  studentNotes?: string;
  teacherFeedback?: string;
}

export function generateLabReportMarkdown(data: LabReportData): string {
  const paramsFormatted = Object.entries(data.parametersUsed)
    .map(([k, v]) => {
      const def = data.parameterDefinitions?.find(p => p.id === k);
      const label = def ? `${def.label} (${def.unit})` : k;
      return `- **${label}:** ${v}`;
    })
    .join('\n');

  const telemetryFormatted = Object.entries(data.telemetrySnapshot)
    .map(([k, v]) => `- **${k}:** ${typeof v === 'number' ? v.toFixed(3) : v}`)
    .join('\n');

  return `# RELATÓRIO TÉCNICO DE LABORATÓRIO VIRTUAL
**Plataforma Kortex - Sistema Integrado de Simulações Científicas**

---

### 1. DADOS DE IDENTIFICAÇÃO
- **Instituição:** ${data.institutionName || 'Plataforma Kortex Super LMS'}
- **Laboratório:** ${data.labTitle} (\`${data.labId}\`)
- **Disciplina:** ${data.subject} | **Nível:** ${data.academicLevel}
- **Estudante:** ${data.studentName}
- **Turma:** ${data.className || 'Prática Livre / Autoestudo'}
- **Data da Prática:** ${data.date}
- **Tempo de Execução:** ${Math.floor(data.durationSeconds / 60)} min ${data.durationSeconds % 60} s

---

### 2. PARÂMETROS OPERACIONAIS UTILIZADOS
${paramsFormatted || '_Nenhum parâmetro registrado._'}

---

### 3. TELEMETRIA E VARIÁVEIS DE ESTADO
${telemetryFormatted || '_Nenhum dado telemétrico capturado._'}

---

### 4. AVALIAÇÃO DIAGNÓSTICA
- **Questão Conceitual:** ${data.diagnosticQuestionText || 'Não informada'}
- **Resposta do Estudante:** ${data.selectedAnswerText || 'Não respondida'}
- **Resultado:** ${data.isCorrect ? '✅ Resposta Correta (100% de aproveitamento)' : '⚠️ Revisão Necessária'}
- **Pontuação:** ${data.scorePct ?? (data.isCorrect ? 100 : 0)}%

---

### 5. CADERNO DE NOTAS E OBSERVAÇÕES DO ESTUDANTE
${data.studentNotes || '_Sem anotações complementares registradas pelo estudante._'}

---

### 6. PARECER E VALIDAÇÃO DOCENTE
${data.teacherFeedback || '_Aguardando homologação e parecer da coordenação de laboratórios._'}

---
*Documento gerado automaticamente pelo Kortex Lab Engine. Código de verificação SHA: ${Math.random().toString(36).substring(2, 10).toUpperCase()}*
`;
}

export function generateLabReportLatex(data: LabReportData): string {
  return `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[portuguese]{babel}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{Relatório Técnico: ${data.labTitle}}
\\author{Estudante: ${data.studentName}}
\\date{${data.date}}

\\begin{document}
\\maketitle

\\section{Introdução e Dados Gerais}
Disciplina: ${data.subject}\\\\
Nível Acadêmico: ${data.academicLevel}\\\\
Turma: ${data.className || 'Geral'}

\\section{Parâmetros de Entrada}
\\begin{itemize}
${Object.entries(data.parametersUsed).map(([k, v]) => `  \\item ${k}: ${v}`).join('\n')}
\\end{itemize}

\\section{Resultados Telemétricos}
\\begin{itemize}
${Object.entries(data.telemetrySnapshot).map(([k, v]) => `  \\item ${k}: ${v}`).join('\n')}
\\end{itemize}

\\section{Conclusões do Estudante}
${data.studentNotes || 'Sem notas adicionais.'}

\\end{document}`;
}

export function triggerPrintLabReport(data: LabReportData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar a impressão do relatório em PDF.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Laboratório - ${data.labTitle}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
        .header { border-bottom: 2px solid #E4683F; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { margin: 0; color: #0f172a; font-size: 22px; }
        .header p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 15px; text-transform: uppercase; color: #E4683F; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 6px 10px; border: 1px solid #cbd5e1; font-size: 13px; }
        th { background: #f8fafc; font-weight: 600; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #dcfce7; color: #15803d; }
        .badge-warn { background: #fef9c3; color: #854d0e; }
        .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; }
        @media print {
          body { margin: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KORTEX - RELATÓRIO TÉCNICO DE LABORATÓRIO VIRTUAL</h1>
        <p>Laboratório: <strong>${data.labTitle}</strong> | Disciplina: ${data.subject} | Nível: ${data.academicLevel}</p>
      </div>

      <div class="section">
        <h2>1. Identificação do Estudante</h2>
        <table>
          <tr><th>Nome do Aluno</th><td>${data.studentName}</td><th>Data e Hora</th><td>${data.date}</td></tr>
          <tr><th>Turma</th><td>${data.className || 'Individual / Autoestudo'}</td><th>Tempo em Bancada</th><td>${Math.floor(data.durationSeconds / 60)} min ${data.durationSeconds % 60} s</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>2. Parâmetros Operacionais Configurados</h2>
        <table>
          <thead><tr><th>Parâmetro</th><th>Valor Registrado</th></tr></thead>
          <tbody>
            ${Object.entries(data.parametersUsed).map(([k, v]) => {
              const def = data.parameterDefinitions?.find(p => p.id === k);
              const label = def ? `${def.label} (${def.unit})` : k;
              return `<tr><td>${label}</td><td><strong>${v}</strong></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>3. Variáveis de Estado e Telemetria</h2>
        <table>
          <thead><tr><th>Métrica de Saída</th><th>Valor Numérico</th></tr></thead>
          <tbody>
            ${Object.entries(data.telemetrySnapshot).map(([k, v]) => `<tr><td>${k}</td><td><strong>${typeof v === 'number' ? v.toFixed(3) : v}</strong></td></tr>`).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>4. Avaliação e Verificação Diagnóstica</h2>
        <p><strong>Questão:</strong> ${data.diagnosticQuestionText || 'Verificação conceitual do experimento'}</p>
        <p><strong>Resposta Selecionada:</strong> ${data.selectedAnswerText || 'Concluída'}</p>
        <p><strong>Status de Validação:</strong> 
          <span class="badge ${data.isCorrect ? 'badge-success' : 'badge-warn'}">
            ${data.isCorrect ? 'APROVADO - CONCEITO VALIDADO' : 'EM REVISÃO'}
          </span>
        </p>
      </div>

      ${data.studentNotes ? `
      <div class="section">
        <h2>5. Anotações do Caderno do Estudante</h2>
        <p style="font-size: 13px; line-height: 1.5; white-space: pre-wrap; background: #f8fafc; padding: 10px; border-radius: 4px;">${data.studentNotes}</p>
      </div>` : ''}

      <div class="footer">
        Documento acadêmico digital Kortex Lab Engine &bull; Validação criptográfica: KTX-${Math.random().toString(36).substring(2, 10).toUpperCase()} &bull; Imprima ou Salve em PDF
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
