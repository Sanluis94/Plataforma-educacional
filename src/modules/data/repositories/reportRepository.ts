import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../core/services/firebaseConfig';
import { getLocalEtlClassReport } from '../services/localEtlClient';
import type { LocalClassReport } from '../services/localEtlClient';
import type { ActivityData, SubmissionData, ClassData, ProgressData } from '../types';

export const getLiveClassReport = async (classId: string): Promise<LocalClassReport | null> => {
  if (!db) {
    return getLocalEtlClassReport(classId);
  }

  try {
    // 1. Buscar a Turma
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (!classDoc.exists()) return null;
    const classData = classDoc.data() as ClassData;
    const studentIds = classData.studentIds || [];

    // 2. Buscar as Atividades Publicadas (pelo professor)
    const actQuery = query(
      collection(db, 'activities'),
      where('professorId', '==', classData.professorId)
    );
    const actSnap = await getDocs(actQuery);
    const activities = actSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ActivityData[];
    const publishedCount = activities.filter(a => a.status === 'published').length;

    // 3. Buscar Submissões da turma
    const subQuery = query(collection(db, 'submissions'), where('classId', '==', classId));
    const subSnap = await getDocs(subQuery);
    const submissions = subSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SubmissionData[];

    // 4. Buscar o Progresso e Dados dos Estudantes (Individualmente para evitar limite de 10 do Firestore 'in')
    const studentsData: any[] = [];
    for (const sid of studentIds) {
      // Nome do estudante é salvo na submission, mas o progresso está na collection 'student_progress'
      const progDoc = await getDoc(doc(db, 'student_progress', sid));
      const prog = progDoc.exists() ? (progDoc.data() as ProgressData) : { level: 1, xp: 0, coins: 0, completedModules: [] };
      
      // Achar o nome dele numa submissão ou colocar genérico
      const sName = submissions.find(s => s.studentId === sid)?.studentName || 'Aluno(a)';
      studentsData.push({ id: sid, name: sName, progress: prog });
    }

    // 5. Agregar os Dados
    const totalSubmissions = submissions.length;
    const averageScore = totalSubmissions > 0
      ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / totalSubmissions)
      : 0;

    const expectedCompletions = Math.max(studentIds.length * publishedCount, 1);
    const completionRate = Math.min(100, Math.round((totalSubmissions / expectedCompletions) * 100));

    // Agrupar submissões por módulo/atividade
    const moduleGroups = submissions.reduce((acc, sub) => {
      const title = sub.activityTitle;
      if (!acc[title]) acc[title] = { count: 0, totalScore: 0 };
      acc[title].count++;
      acc[title].totalScore += sub.score;
      return acc;
    }, {} as Record<string, { count: number; totalScore: number }>);

    const modulesList = Object.keys(moduleGroups).map(title => ({
      module: title,
      eventsCount: moduleGroups[title].count,
      averageScore: Math.round(moduleGroups[title].totalScore / moduleGroups[title].count),
      totalTimeSpentMinutes: moduleGroups[title].count * 15, // Mock de tempo
    })).sort((a, b) => b.eventsCount - a.eventsCount);

    // Estudantes Reports
    const studentReports = studentsData.map(st => {
      const stSubs = submissions.filter(s => s.studentId === st.id);
      const stAvg = stSubs.length > 0 ? Math.round(stSubs.reduce((acc, s) => acc + s.score, 0) / stSubs.length) : 0;
      
      let status: 'em_destaque' | 'regular' | 'precisa_apoio' = 'regular';
      if (stAvg >= 85) status = 'em_destaque';
      else if (stAvg > 0 && stAvg < 70) status = 'precisa_apoio';

      return {
        studentId: st.id,
        studentName: st.name,
        level: st.progress.level || 1,
        xp: st.progress.xp || 0,
        coins: st.progress.coins || 0,
        completedModulesCount: st.progress.completedModules?.length || 0,
        averageScore: stAvg,
        lastActive: stSubs.length > 0 ? stSubs[0].submittedAt : new Date().toISOString(), // Simples
        status
      };
    });

    const atRisk = studentReports.filter(s => s.status === 'precisa_apoio').map(s => s.studentName);

    return {
      classId,
      className: classData.name,
      professorName: classData.professorName || 'Professor',
      studentsCount: studentIds.length,
      activitiesCount: publishedCount,
      completedActivitiesCount: totalSubmissions,
      averageScore,
      averageTimeSpentMinutes: 15,
      completionRate,
      topModule: modulesList[0]?.module || 'Nenhum',
      atRiskStudents: atRisk,
      modules: modulesList,
      students: studentReports,
    };

  } catch (error) {
    console.error('[ReportRepository] Erro ao gerar report live:', error);
    return null;
  }
};
