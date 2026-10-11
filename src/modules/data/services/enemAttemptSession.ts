import {
  BANCO_ITENS_ENEM_PADRAO,
  processarSimuladoEnemTRI,
  type TriResult,
} from './triCalculationService';

export const ENEM_DURATION_SECONDS = 30 * 60;

export interface EnemAttempt {
  version: 1;
  itemIds: string[];
  status: 'ready' | 'active' | 'finished';
  currentIndex: number;
  answers: Record<string, number>;
  startedAt: number | null;
  deadlineAt: number | null;
  completionReason: 'submitted' | 'expired' | null;
  result: TriResult | null;
}

export function enemAttemptStorageKey(userId: string): string {
  return `kortex-enem-attempt:${encodeURIComponent(userId)}`;
}

export function createEnemAttempt(): EnemAttempt {
  return {
    version: 1,
    itemIds: BANCO_ITENS_ENEM_PADRAO.map(item => item.id),
    status: 'ready',
    currentIndex: 0,
    answers: {},
    startedAt: null,
    deadlineAt: null,
    completionReason: null,
    result: null,
  };
}

export function finishEnemAttempt(attempt: EnemAttempt, reason: 'submitted' | 'expired'): EnemAttempt {
  return {
    ...attempt,
    status: 'finished',
    completionReason: reason,
    result: processarSimuladoEnemTRI(BANCO_ITENS_ENEM_PADRAO, BANCO_ITENS_ENEM_PADRAO.map(item => ({
      itemId: item.id,
      respostaEscolhida: attempt.answers[item.id] ?? -1,
    }))),
  };
}

/** Apenas a tentativa desta conta; nenhum nome, e-mail ou perfil é armazenado. */
export function saveEnemAttempt(userId: string | null, attempt: EnemAttempt): boolean {
  if (!userId) return false;
  try {
    const key = enemAttemptStorageKey(userId);
    if (attempt.status === 'ready') sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(attempt));
    return true;
  } catch {
    return false;
  }
}

/** Recalcula resultados restaurados com o mesmo modelo usado na entrega. */
export function readEnemAttempt(userId: string | null, now = Date.now()): EnemAttempt {
  const empty = createEnemAttempt();
  if (!userId) return empty;
  try {
    const raw = sessionStorage.getItem(enemAttemptStorageKey(userId));
    if (!raw) return empty;
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return empty;
    const candidate = saved as Record<string, unknown>;
    if (candidate.version !== 1 || !Array.isArray(candidate.itemIds)
      || candidate.itemIds.length !== empty.itemIds.length
      || candidate.itemIds.some((id, index) => id !== empty.itemIds[index])
      || !['active', 'finished'].includes(String(candidate.status))
      || typeof candidate.startedAt !== 'number' || !Number.isFinite(candidate.startedAt)
      || typeof candidate.deadlineAt !== 'number' || !Number.isFinite(candidate.deadlineAt)
      || candidate.deadlineAt - candidate.startedAt !== ENEM_DURATION_SECONDS * 1000) return empty;

    const answers: Record<string, number> = {};
    if (candidate.answers && typeof candidate.answers === 'object' && !Array.isArray(candidate.answers)) {
      const savedAnswers = candidate.answers as Record<string, unknown>;
      for (const item of BANCO_ITENS_ENEM_PADRAO) {
        const answer = savedAnswers[item.id];
        if (typeof answer === 'number' && Number.isInteger(answer) && answer >= 0 && answer < item.opcoes.length) {
          answers[item.id] = answer;
        }
      }
    }
    const attempt: EnemAttempt = {
      ...empty,
      answers,
      status: 'active',
      startedAt: candidate.startedAt,
      deadlineAt: candidate.deadlineAt,
      currentIndex: typeof candidate.currentIndex === 'number' && Number.isInteger(candidate.currentIndex)
        ? Math.max(0, Math.min(empty.itemIds.length - 1, candidate.currentIndex)) : 0,
    };
    if (candidate.status === 'finished' || candidate.deadlineAt <= now) {
      const completed = finishEnemAttempt(attempt,
        candidate.status === 'finished' && candidate.completionReason !== 'expired' ? 'submitted' : 'expired');
      saveEnemAttempt(userId, completed);
      return completed;
    }
    return attempt;
  } catch {
    return empty;
  }
}
