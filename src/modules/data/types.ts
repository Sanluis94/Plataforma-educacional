/**
 * Tipos centrais da camada Data.
 * Definem a estrutura dos documentos no Cloud Firestore.
 */

// ─── Coleção: users ───────────────────────────────────────────
export type UserRole = 'admin' | 'professor' | 'estudante';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  gradeLevel?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// ─── Coleção: classes ─────────────────────────────────────────
export interface ClassData {
  id?: string;
  name: string;
  professorId: string;
  professorName: string;
  gradeLevel?: string;
  studentsCount: number;
  studentIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Coleção: activities ──────────────────────────────────────
export interface ActivityQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ActivityData {
  id?: string;
  title: string;
  type: string; // 'quiz' | 'simulation_physics' | 'simulation_chemistry' | 'simulation_biology' | 'simulation_math' | 'essay' | 'lesson_theory'
  subject?: string;
  description?: string;
  theoryContent?: string;
  questions?: ActivityQuestion[];
  config: Record<string, unknown>;
  classId?: string;
  className?: string;
  professorId: string;
  xpReward?: number;
  coinReward?: number;
  dueDate?: string;
  createdAt: string;
  status: 'published' | 'draft';
}

// ─── Coleção: submissions ─────────────────────────────────────
export interface SubmissionData {
  id?: string;
  activityId: string;
  activityTitle: string;
  classId: string;
  studentId: string;
  studentName: string;
  score: number;
  answers?: Record<string, unknown>;
  submittedAt: string;
  status: 'completed' | 'pending';
}

// ─── Coleção: progress ────────────────────────────────────────
export interface ProgressData {
  level: number;
  xp: number;
  coins: number;
  completedModules: string[];
  purchasedItems: string[];
  enrolledClasses?: string[];
  updatedAt: string;
}

// ─── Coleção: system_logs ─────────────────────────────────────
export type LogType = 'auth' | 'ai' | 'error' | 'activity' | 'system';

export interface SystemLog {
  id?: string;
  timestamp: string;
  type: LogType;
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// ─── Coleção: exams (Provas e Avaliações Formais estilo Edu-Interact-v2) ───
export interface ExamOption {
  texto: string;
  isCorreta: boolean;
}

export interface ExamQuestion {
  enunciado: string;
  tema: string;
  nivelDificuldade: 'Fácil' | 'Médio' | 'Difícil';
  valorPeso: number;
  justificativa: string;
  opcoes: ExamOption[];
}

export interface ExamData {
  id?: string;
  professorId: string;
  professorName?: string;
  titulo: string;
  descricao?: string;
  disciplina: string;
  turmaId?: string; // se atribuída a uma turma
  turmaNome?: string;
  duracaoMinutos?: number; // ex: 45 minutos (ou sem limite se 0/undefined)
  dataInicio?: string;
  dataLimite?: string;
  status: 'Rascunho' | 'Aberta' | 'Encerrada';
  pesoTotal: number;
  questoes: ExamQuestion[];
  criadoEm: string;
  atualizadoEm?: string;
}

export interface ExamAnswer {
  questaoIndex: number;
  opcaoEscolhidaIndex: number;
  acertou: boolean;
  pontosObtidos: number;
}

export interface ExamAttempt {
  id?: string;
  examId: string;
  examTitle: string;
  turmaId: string;
  alunoId: string;
  alunoNome: string;
  pontuacaoObtida: number;
  pontuacaoMaxima: number;
  porcentagemAproveitamento: number;
  classificacao: 'Insuficiente' | 'Regular' | 'Bom' | 'Excelente';
  respostas: ExamAnswer[];
  dataEnvio: string;
}

// ─── Coleção: lesson_plans (Plano de Aulas e Cronograma Bimestral/Semestral) ───
export type BimesterPeriod = '1º Bimestre' | '2º Bimestre' | '3º Bimestre' | '4º Bimestre' | '1º Semestre' | '2º Semestre';

export interface LessonPlanItem {
  id?: string;
  professorId: string;
  turmaId: string;
  turmaNome?: string;
  periodo: BimesterPeriod;
  ordemSemana?: number;
  dataPrevista?: string;
  topico: string;
  competenciasBNCC?: string;
  metodologia: string;
  laboratorioAssociadoId?: string; // ID dos 72 labs
  laboratorioTitulo?: string;
  avaliacaoAssociadaId?: string;
  status: 'planejada' | 'em_andamento' | 'concluida';
  criadoEm: string;
}

// ─── Coleção: notices (Mural de Avisos da Turma) ───────────────────
export interface ClassNotice {
  id?: string;
  turmaId: string;
  professorId: string;
  professorNome?: string;
  titulo: string;
  texto: string;
  criadoEm: string;
}

// ─── Coleção: materials (Materiais de Apoio com Upload/Anexo) ─────
export interface ClassMaterial {
  id?: string;
  turmaId: string;
  professorId?: string;
  title: string;
  description: string;
  tipo: 'pdf' | 'link' | 'texto' | 'arquivo';
  linkOuConteudo: string; // URL do link ou Base64 data-uri do arquivo ou texto
  nomeArquivo?: string;
  tamanhoFormatado?: string;
  disciplina?: string;
  periodo?: BimesterPeriod;
  criadoEm: string;
}

// ─── Coleção: attendance (Controle de Frequência e Diário de Classe) ───
export interface StudentAttendance {
  studentId: string;
  studentName: string;
  status: 'presente' | 'falta' | 'justificada';
}

export interface AttendanceRecord {
  id?: string;
  turmaId: string;
  data: string;
  aulaNumero?: number;
  conteudoResumo?: string;
  registros: StudentAttendance[];
  criadoEm: string;
}

// ─── Coleção: forum_topics (Fórum Pedagógico da Turma) ────────────
export interface ForumReply {
  id: string;
  autorId: string;
  autorNome: string;
  autorRole: 'professor' | 'estudante';
  texto: string;
  isMelhorResposta?: boolean;
  moedasGanhas?: number;
  criadoEm: string;
}

export interface ForumTopic {
  id?: string;
  turmaId: string;
  autorId: string;
  autorNome: string;
  autorRole: 'professor' | 'estudante';
  titulo: string;
  conteudo: string;
  disciplina: string;
  periodo?: string;
  respostas: ForumReply[];
  resolvido?: boolean;
  criadoEm: string;
}

// ─── Livro de Notas & Boletim Escolar (Gradebook Ponderado) ───────
export interface GradebookWeights {
  turmaId: string;
  pesoProvas: number; // ex: 40%
  pesoLabs: number; // ex: 30%
  pesoAtividades: number; // ex: 20%
  pesoParticipacao: number; // ex: 10%
}

export interface StudentGradeReport {
  studentId: string;
  studentName: string;
  notaProvas: number; // 0 a 10
  notaLabs: number; // 0 a 10
  notaAtividades: number; // 0 a 10
  notaParticipacao: number; // 0 a 10
  mediaFinal: number; // 0 a 10
  situacao: 'Aprovado' | 'Recuperação' | 'Insuficiente';
  frequenciaPercentual: number; // 0 a 100%
  alertaFrequencia: boolean; // true se < 75%
}

// ─── Certificados Digitais de Conclusão ────────────────────────────
export interface DigitalCertificate {
  id: string;
  alunoId: string;
  alunoNome: string;
  tituloCurso: string;
  cargaHorariaHoras: number;
  dataEmissao: string;
  codigoValidacao: string;
}

// ─── Constantes padrão ────────────────────────────────────────
export const DEFAULT_PROGRESS: ProgressData = {
  level: 1,
  xp: 0,
  coins: 0,
  completedModules: [],
  purchasedItems: [],
  enrolledClasses: [],
  updatedAt: new Date().toISOString(),
};

