import { beforeEach, describe, expect, it, vi } from 'vitest';

const transport = vi.hoisted(() => ({ remote: false, error: null as Error | null, document: null as Record<string, unknown> | null, transactions: 0, writes: [] as Record<string, unknown>[] }));
vi.mock('../modules/core/services/firebaseConfig', () => ({ get db() { return transport.remote ? {} : null; }, auth: null }));
vi.mock('firebase/firestore', () => {
  const snapshot = () => ({ exists: () => !!transport.document, data: () => transport.document });
  const write = async (_reference: unknown, data: Record<string, unknown>) => {
    if (transport.error) throw transport.error;
    transport.writes.push(data);
    return { id: 'remote-id' };
  };
  return {
    collection: (...args: unknown[]) => ({ args }), doc: (...args: unknown[]) => ({ args, id: 'remote-id' }),
    query: (...args: unknown[]) => ({ args }), where: (...args: unknown[]) => ({ args }),
    addDoc: write, updateDoc: write, setDoc: write,
    deleteDoc: async () => { if (transport.error) throw transport.error; },
    getDocs: async () => { if (transport.error) throw transport.error; return { docs: [] }; },
    getDoc: async () => { if (transport.error) throw transport.error; return snapshot(); },
    getDocFromServer: async () => { if (transport.error) throw transport.error; return snapshot(); },
    onSnapshot: (_reference: unknown, callback: (data: { docs: unknown[] }) => void, onError: (error: Error) => void) => {
      if (transport.error) onError(transport.error); else callback({ docs: [] });
      return () => {};
    },
    runTransaction: async (_database: unknown, callback: (transaction: unknown) => unknown) => {
      transport.transactions++;
      if (transport.error) throw transport.error;
      return callback({ get: async () => snapshot(), update: (_reference: unknown, data: Record<string, unknown>) => transport.writes.push(data) });
    },
    arrayUnion: vi.fn(), arrayRemove: vi.fn(), increment: vi.fn(), writeBatch: vi.fn()
  };
});

import { saveExam, getExamsByClass, getExamsByProfessor, getExamAttemptsByClass, getExamAttemptsByStudent, saveExamAttempt } from '../modules/data/repositories/examRepository';
import { saveLessonPlanItem, getLessonPlansByClass } from '../modules/data/repositories/lessonPlanRepository';
import { saveForumTopic, getForumTopicsByClass, subscribeForumTopicsByClass, addForumReply, markForumBestReply, deleteForumReply, saveAttendanceRecord, getAttendanceByClass, calculateStudentAttendanceRate } from '../modules/data/repositories/gradebookRepository';
import { addEnhancedMaterial, getEnhancedMaterials, deleteEnhancedMaterial, createClassNotice, getClassNotices, deleteClassNotice, getComplementaryMaterials, getStudentMessages, replyStudentMessage, claimStudentMessageReward } from '../modules/data/repositories/classRepository';

const exam = { professorId: 'teacher-a', turmaId: 'class-a', titulo: 'Prova fictícia', disciplina: 'Ciências', status: 'Aberta' as const, pesoTotal: 1, questoes: [], criadoEm: '2026-10-13T10:00:00Z' };
const plan = { professorId: 'teacher-a', turmaId: 'class-a', topico: 'Aula fictícia', metodologia: 'Investigação', periodo: '1º Bimestre' as const, status: 'planejada' as const, criadoEm: '2026-10-13T10:00:00Z' };
const topic = { turmaId: 'class-a', autorId: 'teacher-a', autorNome: 'Docente fictício', autorRole: 'professor' as const, titulo: 'Discussão fictícia', conteudo: 'Compare as hipóteses.', disciplina: 'Ciências' };
const material = { title: 'Texto fictício', description: 'Leitura', tipo: 'texto' as const, linkOuConteudo: 'Conteúdo fictício.' };

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('edu_local_db', JSON.stringify({ users: [], classes: [], activities: [], progress: {}, messages: {}, complementaryMaterials: {} }));
  transport.remote = false; transport.error = null; transport.document = null; transport.transactions = 0; transport.writes = [];
});

describe('A confirmação representa persistência real', () => {
  it('não transforma rejeições remotas em publicações locais bem-sucedidas', async () => {
    transport.remote = true; transport.error = new Error('permission-denied');
    await expect(saveExam(exam)).rejects.toThrow('permission-denied');
    await expect(saveLessonPlanItem(plan)).rejects.toThrow('permission-denied');
    await expect(saveForumTopic(topic)).rejects.toThrow('permission-denied');
    await expect(addEnhancedMaterial('class-a', material)).rejects.toThrow('permission-denied');
    await expect(createClassNotice('class-a', 'teacher-a', 'Docente', 'Aviso', 'Texto')).rejects.toThrow('permission-denied');
    expect(localStorage.getItem('edu_local_exams')).toBeNull();
    expect(localStorage.getItem('edu_local_lesson_plans')).toBeNull();
    expect(localStorage.getItem('edu_local_forum_class-a')).toBeNull();
  });

  it('não ressuscita provas, avisos, materiais ou tópicos excluídos da nuvem', async () => {
    await saveExam(exam); await saveLessonPlanItem(plan); await saveForumTopic(topic);
    await addEnhancedMaterial('class-a', material);
    await createClassNotice('class-a', 'teacher-a', 'Docente', 'Aviso', 'Texto');
    transport.remote = true;
    for (const result of await Promise.all([getExamsByClass('class-a'), getExamsByProfessor('teacher-a'), getLessonPlansByClass('class-a'), getForumTopicsByClass('class-a'), getEnhancedMaterials('class-a'), getClassNotices('class-a')])) expect(result).toEqual([]);
  });

  it('propaga falhas de leitura, sem apresentar cache local como informação atual', async () => {
    transport.remote = true; transport.error = new Error('unavailable');
    for (const read of [() => getExamsByClass('class-a'), () => getExamsByProfessor('teacher-a'), () => getLessonPlansByClass('class-a'), () => getForumTopicsByClass('class-a'), () => getAttendanceByClass('class-a'), () => getExamAttemptsByClass('class-a'), () => getExamAttemptsByStudent('student-a'), () => getClassNotices('class-a'), () => getEnhancedMaterials('class-a'), () => getComplementaryMaterials('class-a')]) await expect(read()).rejects.toThrow('unavailable');
  });

  it('informa erros de subscrição sem emitir uma falsa lista vazia', () => {
    transport.remote = true; transport.error = new Error('permission-denied');
    const callback = vi.fn(), onError = vi.fn();
    subscribeForumTopicsByClass('class-a', callback, onError);
    expect(callback).not.toHaveBeenCalled(); expect(onError).toHaveBeenCalledWith(transport.error);
  });

  it('não confirma gravação local quando o navegador não consegue guardá-la', async () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    try {
      await expect(saveExam(exam)).rejects.toThrow('guardar');
      await expect(saveLessonPlanItem(plan)).rejects.toThrow('guardar');
      await expect(saveForumTopic(topic)).rejects.toThrow('guardar');
    } finally { storage.mockRestore(); }
  });
});

describe('Materiais, avisos e fórum mantêm identidade e continuidade', () => {
  it('um PDF de550KB cabe no limite de persistência com seus metadados usuais',async()=>{
    transport.remote=true;
    const bytes=Buffer.alloc(550_000,32);bytes.write('%PDF-1.7\n');
    const file={title:'Anexo fictício de550KB',description:'Documento de estudo.',tipo:'pdf' as const,nomeArquivo:'ficticio.pdf',linkOuConteudo:'data:application/pdf;base64,'+bytes.toString('base64')};
    const saved=await addEnhancedMaterial('class-a',file);
    expect(saved.id).toBe('remote-id');
    expect(transport.writes).toHaveLength(1);
    expect(Buffer.byteLength(JSON.stringify(transport.writes[0]),'utf8')).toBeLessThan(750_000);
    expect(Buffer.from(saved.linkOuConteudo.split(',')[1],'base64')).toHaveLength(550_000);
  });

  it('aceita750KB exatos e rejeita um byte além sem gravar parcial ou fallback',async()=>{
    transport.remote=true;
    const file={title:'PDF fictício',description:'',tipo:'pdf' as const,linkOuConteudo:'data:application/pdf;base64,'+Buffer.alloc(550_000,32).toString('base64')};
    const envelope={...file,turmaId:'class-a',criadoEm:new Date().toISOString()};
    const available=750_000-Buffer.byteLength(JSON.stringify(envelope),'utf8');
    expect(available).toBeGreaterThan(0);
    await addEnhancedMaterial('class-a',{...file,description:'x'.repeat(available)});
    expect(Buffer.byteLength(JSON.stringify(transport.writes[0]),'utf8')).toBe(750_000);
    await expect(addEnhancedMaterial('class-a',{...file,description:'x'.repeat(available+1)})).rejects.toThrow('grande demais');
    expect(transport.writes).toHaveLength(1);
    expect(localStorage.getItem('edu_local_enhanced_materials_class-a')).toBeNull();
  });

  it('calcula limite em bytes UTF8, incluindo acentos e metadados',async()=>{
    transport.remote=true;
    const file={title:'PDF fictício',description:'',tipo:'pdf' as const,linkOuConteudo:'data:application/pdf;base64,'+Buffer.alloc(550_000,32).toString('base64')};
    const available=750_000-Buffer.byteLength(JSON.stringify({...file,turmaId:'class-a',criadoEm:new Date().toISOString()}),'utf8');
    await expect(addEnhancedMaterial('class-a',{...file,description:'á'.repeat(Math.floor(available/2)+1)})).rejects.toThrow('grande demais');
    expect(transport.writes).toEqual([]);
  });

  it('preserva dois roteiros do mesmo tópico e mantém o ID ao repetir o mesmo plano', async () => {
    const original = await saveLessonPlanItem({ ...plan, laboratorioAssociadoId: 'lab-a' });
    const repeated = await saveLessonPlanItem({ ...plan, laboratorioAssociadoId: 'lab-a' });
    const additional = await saveLessonPlanItem({ ...plan, laboratorioAssociadoId: 'lab-b' });
    expect(repeated.id).toBe(original.id);
    expect(additional.id).not.toBe(original.id);
    expect(await getLessonPlansByClass('class-a')).toHaveLength(2);
  });

  it('recupera e exclui o material pelo mesmo ID retornado ao publicar', async () => {
    const saved = await addEnhancedMaterial('class-a', material);
    expect((await getEnhancedMaterials('class-a'))[0].id).toBe(saved.id);
    await deleteEnhancedMaterial('class-a', saved.id!);
    expect(await getEnhancedMaterials('class-a')).toEqual([]);
  });

  it('exclui material antigo sem fazê-lo reaparecer na leitura de compatibilidade', async () => {
    localStorage.setItem('edu_local_db', JSON.stringify({ complementaryMaterials: { 'class-a': [{ id: 'old-id', title: 'Antigo', description: 'Legado', link: 'https://example.org/arquivo.pdf', createdAt: '2026-10-13T10:00:00Z' }] } }));
    await deleteEnhancedMaterial('class-a', 'old-id');
    expect(await getEnhancedMaterials('class-a')).toEqual([]);
  });

  it('exclui avisos locais e não mistura turmas', async () => {
    const saved = await createClassNotice('class-a', 'teacher-a', 'Docente', 'Aviso', 'Texto');
    expect(await getClassNotices('class-b')).toEqual([]);
    await deleteClassNotice('class-a', saved.id);
    expect(await getClassNotices('class-a')).toEqual([]);
  });

  it('mantém respostas existentes e usa transações para responder, destacar e excluir', async () => {
    transport.remote = true;
    transport.document = { turmaId: 'class-a', respostas: [{ id: 'previous', autorId: 'student-b', texto: 'Anterior', criadoEm: '2026-10-13T10:00:00Z' }] };
    const reply = await addForumReply('class-a', 'topic-a', { autorId: 'student-a', autorNome: 'Aluno', autorRole: 'estudante', texto: 'Nova', isMelhorResposta: true, moedasGanhas: 20 });
    expect(transport.writes[0].respostas).toHaveLength(2);
    expect(reply).toMatchObject({ isMelhorResposta: false, moedasGanhas: 0 });
    transport.document = { turmaId: 'class-a', respostas: transport.writes[0].respostas };
    await markForumBestReply('class-a', 'topic-a', reply.id, true);
    await deleteForumReply('class-a', 'topic-a', reply.id);
    expect(transport.transactions).toBe(3);
  });

  it('não confirma uma resposta enviada para tópico inexistente ou de outra turma', async () => {
    const reply = { autorId: 'student-a', autorNome: 'Aluno', autorRole: 'estudante' as const, texto: 'Nova' };
    await expect(addForumReply('class-a', 'missing', reply)).rejects.toThrow('não está mais disponível');
    transport.remote = true; transport.document = { turmaId: 'class-b', respostas: [] };
    await expect(addForumReply('class-a', 'wrong', reply)).rejects.toThrow('nesta turma');
  });
});

describe('Frequência e recompensas registram o que ocorreu', () => {
  it('atualiza a mesma chamada e mantém a falta justificada como ausência', async () => {
    const record = { turmaId: 'class-a', data: '2026-10-13', registros: [{ studentId: 'student-a', studentName: 'Aluno', status: 'presente' as const }], criadoEm: '2026-10-13T10:00:00Z' };
    const original = await saveAttendanceRecord(record);
    const corrected = await saveAttendanceRecord({ ...record, registros: [{ ...record.registros[0], status: 'justificada' }] });
    expect(corrected.id).toBe(original.id);
    const records = await getAttendanceByClass('class-a');
    expect(records).toHaveLength(1);
    expect(calculateStudentAttendanceRate('student-a', records)).toMatchObject({ totalAulas: 1, presencas: 0, faltas: 1, taxaPercentual: 0 });
  });

  it('rejeita datas impossíveis e duplicação de estudante na chamada', async () => {
    const record = { turmaId: 'class-a', data: '2026-02-30', registros: [{ studentId: 'student-a', studentName: 'Aluno', status: 'presente' as const }], criadoEm: '2026-10-13T10:00:00Z' };
    await expect(saveAttendanceRecord(record)).rejects.toThrow('data válida');
    await expect(saveAttendanceRecord({ ...record, data: '2026-10-13', registros: [record.registros[0], record.registros[0]] })).rejects.toThrow('sem duplicatas');
  });

  it('concede recompensa de dúvida apenas uma vez e filtra mensagens do próprio estudante', async () => {
    localStorage.setItem('edu_local_db', JSON.stringify({ progress: {}, messages: { 'class-a': [{ id: 'message-a', studentId: 'student-a', replied: false }, { id: 'message-b', studentId: 'student-b', replied: false }] } }));
    await replyStudentMessage('class-a', 'message-a', 'Resposta docente', 10, 50, 'student-a');
    await replyStudentMessage('class-a', 'message-a', 'Resposta revisada', 10, 50, 'student-a');
    expect(await claimStudentMessageReward('class-a', 'message-a', 'student-a')).toBe(true);
    expect(await claimStudentMessageReward('class-a', 'message-a', 'student-a')).toBe(false);
    expect(JSON.parse(localStorage.getItem('edu_local_db')!).progress['student-a']).toMatchObject({ xp: 50, coins: 10 });
    expect(await getStudentMessages('class-a', 'student-a')).toHaveLength(1);
    await expect(replyStudentMessage('class-a', 'message-a', 'Outra resposta', 20, 50, 'student-a')).rejects.toThrow('já recebida');
  });

  it('recusa substituir respostas de tentativa já enviada com o mesmo identificador', async () => {
    const attempt = { examId: 'exam-a', examTitle: 'Prova', turmaId: 'class-a', alunoId: 'student-a', alunoNome: 'Aluno', pontuacaoObtida: 0, pontuacaoMaxima: 1, porcentagemAproveitamento: 0, classificacao: 'Insuficiente' as const, respostas: [], dataEnvio: '2026-10-13T10:00:00Z', evidence: { schemaVersion: 1 as const, source: 'exam' as const, sessionId: 'session-a' } };
    await saveExamAttempt(attempt);
    await expect(saveExamAttempt({ ...attempt, pontuacaoObtida: 1, porcentagemAproveitamento: 100 })).rejects.toThrow('já foi enviada');
  });
});
