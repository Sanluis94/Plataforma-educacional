/**
 * Admin Repository — Dados administrativos do Firestore.
 * Busca professores reais da coleção "users" e logs do sistema.
 */
import {
  collection, query, where, getDocs, orderBy, limit as firestoreLimit, getCountFromServer
} from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import type { SystemLog } from '../types';

// Interface legada mantida para compatibilidade com UI
export interface Teacher {
  name: string;
  email: string;
  classes: number;
  students: number;
}

export interface LogEntry {
  time: string;
  type: 'auth' | 'ai' | 'error' | 'activity' | 'system';
  message: string;
}

/**
 * Busca todos os professores cadastrados e enriquece com contagem de turmas.
 */
export const getTeachers = async (): Promise<Teacher[]> => {
  if (!db) {
    console.warn('[AdminRepository] Firestore não inicializado.');
    return [];
  }

  try {
    // 1. Buscar usuários com role 'professor'
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'professor')
    );
    const usersSnap = await getDocs(usersQuery);

    // 2. Para cada professor, contar turmas e alunos
    const teachers: Teacher[] = [];

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const professorId = userDoc.id;

      // Buscar turmas deste professor
      const classesQuery = query(
        collection(db, 'classes'),
        where('professorId', '==', professorId)
      );
      const classesSnap = await getDocs(classesQuery);

      let totalStudents = 0;
      classesSnap.docs.forEach(c => {
        totalStudents += c.data().studentsCount || 0;
      });

      teachers.push({
        name: userData.name || 'Professor',
        email: userData.email || '',
        classes: classesSnap.size,
        students: totalStudents,
      });
    }

    return teachers;
  } catch (error) {
    console.error('[AdminRepository] Erro ao buscar professores:', error);
    return [];
  }
};

/**
 * Busca logs do sistema ordenados por timestamp (mais recentes primeiro).
 */
export const getLogs = async (maxResults = 50): Promise<LogEntry[]> => {
  if (!db) return [];

  try {
    const logsQuery = query(
      collection(db, 'system_logs'),
      orderBy('timestamp', 'desc'),
      firestoreLimit(maxResults)
    );
    const snap = await getDocs(logsQuery);

    return snap.docs.map(d => {
      const data = d.data() as SystemLog;
      // Extrair hora do timestamp ISO para compatibilidade com UI
      const time = data.timestamp
        ? new Date(data.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '--:--:--';
      return {
        time,
        type: data.type as LogEntry['type'],
        message: data.message,
      };
    });
  } catch (error) {
    console.error('[AdminRepository] Erro ao buscar logs:', error);
    return [];
  }
};

/**
 * Obtém estatísticas globais da plataforma.
 */
export const getGlobalStats = async (): Promise<{
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalActivities: number;
}> => {
  if (!db) {
    return emptyGlobalStats();
  }

  try {
    const [studentsSnap, teachersSnap, classesSnap, activitiesSnap] = await Promise.all([
      getCountFromServer(query(collection(db, 'users'), where('role', '==', 'estudante'))),
      getCountFromServer(query(collection(db, 'users'), where('role', '==', 'professor'))),
      getCountFromServer(collection(db, 'classes')),
      getCountFromServer(collection(db, 'activities')),
    ]);

    return {
      totalStudents: studentsSnap.data().count,
      totalTeachers: teachersSnap.data().count,
      totalClasses: classesSnap.data().count,
      totalActivities: activitiesSnap.data().count,
    };
  } catch (error) {
    console.error('[AdminRepository] Erro ao calcular estatísticas:', error);
    return emptyGlobalStats();
  }
};

function emptyGlobalStats() {
  return {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalActivities: 0,
  };
}

/**
 * Wrapper legado para compatibilidade com useAdminDashboard.
 */
export const getAdminData = async () => {
  const [teachers, logs] = await Promise.all([
    getTeachers(),
    getLogs(),
  ]);
  return { teachers, logs };
};
