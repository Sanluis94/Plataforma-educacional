/**
 * Sistema de Alerta Precoce de Evasão e Desengajamento (Early Warning System)
 * Melhoria #12 do Plano Estratégico
 */

export interface StudentEngagementMetric {
  studentId: string;
  studentName: string;
  className: string;
  lastAccessDaysAgo: number;
  completedLabsCount: number;
  averageScorePct: number;
  failedAttemptsCount: number;
  idleTimeRatioPct: number;
  riskLevel: 'Baixo' | 'Moderado' | 'Crítico';
  riskScore: number; // 0 a 100
  pedagogicalRecommendations: string[];
}

export interface ClassRetentionReport {
  className: string;
  totalStudents: number;
  studentsAtRiskCount: number;
  classHealthScore: number; // 0 a 100
  students: StudentEngagementMetric[];
}

export function evaluateStudentRisk(data: {
  studentId: string;
  studentName: string;
  className: string;
  lastAccessDaysAgo: number;
  completedLabsCount: number;
  averageScorePct: number;
  failedAttemptsCount: number;
  idleTimeRatioPct?: number;
}): StudentEngagementMetric {
  let riskScore = 0;
  const recommendations: string[] = [];

  // 1. Fator Ausência Recente (peso 35%)
  if (data.lastAccessDaysAgo > 14) {
    riskScore += 35;
    recommendations.push('Disparar notificação de reengajamento por inatividade prolongada (> 14 dias).');
  } else if (data.lastAccessDaysAgo > 7) {
    riskScore += 18;
    recommendations.push('Acompanhar frequência semanal.');
  }

  // 2. Fator Baixo Aproveitamento (peso 30%)
  if (data.averageScorePct < 50) {
    riskScore += 30;
    recommendations.push('Liberar trilha de reforço nos laboratórios de fundamentos.');
  } else if (data.averageScorePct < 70) {
    riskScore += 15;
    recommendations.push('Ativar o Tutor de IA Socrático para apoio nas questões diagnósticas.');
  }

  // 3. Fator Frustração por Falhas Repetidas (peso 20%)
  if (data.failedAttemptsCount >= 4) {
    riskScore += 20;
    recommendations.push('Agendar atendimento de monitoria para destravar conceitos difíceis.');
  } else if (data.failedAttemptsCount >= 2) {
    riskScore += 10;
  }

  // 4. Fator Baixo Volume de Práticas Concluídas (peso 15%)
  if (data.completedLabsCount === 0) {
    riskScore += 15;
    recommendations.push('Convidar para sessão prática guiada em laboratório inaugural.');
  }

  let riskLevel: StudentEngagementMetric['riskLevel'] = 'Baixo';
  if (riskScore >= 60) {
    riskLevel = 'Crítico';
  } else if (riskScore >= 30) {
    riskLevel = 'Moderado';
  }

  if (recommendations.length === 0) {
    recommendations.push('Desempenho excelente. Sugerir desafios avançados de pesquisa.');
  }

  return {
    studentId: data.studentId,
    studentName: data.studentName,
    className: data.className,
    lastAccessDaysAgo: data.lastAccessDaysAgo,
    completedLabsCount: data.completedLabsCount,
    averageScorePct: data.averageScorePct,
    failedAttemptsCount: data.failedAttemptsCount,
    idleTimeRatioPct: data.idleTimeRatioPct || 10,
    riskLevel,
    riskScore: Math.min(100, riskScore),
    pedagogicalRecommendations: recommendations
  };
}

export function generateClassRetentionReport(
  className: string,
  studentsData: Array<Parameters<typeof evaluateStudentRisk>[0]>
): ClassRetentionReport {
  const students = studentsData.map(s => evaluateStudentRisk(s));
  const studentsAtRiskCount = students.filter(s => s.riskLevel === 'Crítico' || s.riskLevel === 'Moderado').length;
  const avgRisk = students.reduce((acc, s) => acc + s.riskScore, 0) / Math.max(1, students.length);
  const classHealthScore = Math.round(Math.max(0, 100 - avgRisk));

  return {
    className,
    totalStudents: students.length,
    studentsAtRiskCount,
    classHealthScore,
    students: students.sort((a, b) => b.riskScore - a.riskScore)
  };
}
