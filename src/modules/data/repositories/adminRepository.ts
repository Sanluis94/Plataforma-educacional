export interface Teacher {
  name: string;
  email: string;
  classes: number;
  students: number;
}

export interface LogEntry {
  time: string;
  type: 'auth' | 'ai' | 'error';
  message: string;
}

export const MOCK_TEACHERS: Teacher[] = [
  { name: 'Profa. Ana Lima', email: 'ana@escola.edu.br', classes: 3, students: 87 },
  { name: 'Prof. Carlos Melo', email: 'carlos@escola.edu.br', classes: 2, students: 61 },
  { name: 'Profa. Fernanda Costa', email: 'fernanda@escola.edu.br', classes: 4, students: 112 },
];

export const MOCK_LOGS: LogEntry[] = [
  { time: '14:32:01', type: 'auth', message: 'Login via Google — ana@escola.edu.br (Professor)' },
  { time: '14:35:10', type: 'ai', message: 'Gemini API chamada — Recomendação adaptativa para estudante #1041' },
  { time: '14:40:05', type: 'auth', message: 'Login via Google — joao.silva@escola.edu.br (Estudante)' },
  { time: '14:41:33', type: 'ai', message: 'Gemini API — Cache HIT para perfil level=5 (sem chamada à API)' },
  { time: '14:55:00', type: 'error', message: 'Tentativa de acessar dados sem autenticação — IP 192.168.1.45 bloqueado' },
];

export const getAdminData = async () => {
  return {
    teachers: MOCK_TEACHERS,
    logs: MOCK_LOGS,
  };
};
