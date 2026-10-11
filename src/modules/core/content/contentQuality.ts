import type { LabLearningContent } from './labLearningContent';

const boilerplate = /ao realizar a modelagem experimental no laboratório|a resposta do sistema valida o modelo teórico|perturbações nas condições iniciais afetam as grandezas|sistema comporta-se de maneira estática e totalmente invariante|solvers analíticos e numéricos fundamentados rigorosamente/i;

export function normalizeContentText(text: string): string {
  // Keep mathematical signs, decimals and coordinates meaningful: +3 and -3
  // are different answers even though their letters/digits are identical.
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/−/g, '-').replace(/\s+/g, ' ').trim();
}

export function validateLearningContent(id: string, candidate: unknown): string[] {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== 'object') return [`${id}: conteúdo ausente`];
  const content = candidate as LabLearningContent;
  const checkText = (value: unknown, field: string, minimum: number) => {
    if (typeof value !== 'string' || value.trim().length < minimum) errors.push(`${id}: ${field} incompleto (mínimo ${minimum} caracteres)`);
    if (typeof value === 'string' && boilerplate.test(value)) errors.push(`${id}: ${field} contém o molde genérico antigo`);
  };
  checkText(content.context, 'contexto', 60);
  checkText(content.theory, 'teoria', 160);
  checkText(content.workedExample, 'exemplo explicado', 80);
  checkText(content.expectedEvidence, 'critérios de evidência', 60);
  checkText(content.reflection, 'reflexão', 30);
  if (!Array.isArray(content.investigation) || content.investigation.length < 3) errors.push(`${id}: roteiro precisa de três etapas`);
  else content.investigation.forEach((step, index) => checkText(step, `etapa ${index + 1}`, 20));
  if (!Array.isArray(content.scenarios) || content.scenarios.length < 3) errors.push(`${id}: precisa de três cenários próprios`);
  else {
    const ids = new Set<string>();
    content.scenarios.forEach((scenario, index) => {
      if (!scenario || typeof scenario !== 'object') { errors.push(`${id}: cenário ${index + 1} inválido`); return; }
      if (!scenario.id || ids.has(scenario.id)) errors.push(`${id}: ID de cenário ausente ou duplicado`);
      ids.add(scenario.id);
      checkText(scenario.label, 'rótulo do cenário', 3);
      checkText(scenario.situation, `situação ${index + 1}`, 20);
      checkText(scenario.observation, `observação ${index + 1}`, 10);
      checkText(scenario.explanation, `explicação ${index + 1}`, 30);
    });
    const situations = content.scenarios.map(scenario => typeof scenario?.situation === 'string' ? normalizeContentText(scenario.situation) : '');
    if (new Set(situations).size !== situations.length) errors.push(`${id}: cenários repetidos`);
  }
  if (!Array.isArray(content.questions) || content.questions.length < 2) errors.push(`${id}: precisa de duas questões próprias`);
  else content.questions.forEach((question, index) => {
    if (!question || typeof question !== 'object') { errors.push(`${id}: questão ${index + 1} inválida`); return; }
    checkText(question.question, `questão ${index + 1}`, 30);
    if (!Array.isArray(question.options) || question.options.length < 3) errors.push(`${id}: questão ${index + 1} precisa de três alternativas`);
    else {
      if (question.options.filter(option => option?.correct === true).length !== 1) errors.push(`${id}: questão ${index + 1} deve ter exatamente uma resposta correta`);
      const optionTexts = new Set<string>();
      question.options.forEach(option => {
        if (!option || typeof option !== 'object') { errors.push(`${id}: alternativa inválida`); return; }
        checkText(option.text, 'alternativa', 1);
        checkText(option.explanation, 'feedback da alternativa', 20);
        if (typeof option.correct !== 'boolean') errors.push(`${id}: alternativa sem correção booleana`);
        if (typeof option.text === 'string') optionTexts.add(normalizeContentText(option.text));
      });
      if (optionTexts.size !== question.options.length) errors.push(`${id}: alternativas repetidas`);
    }
  });
  if (Array.isArray(content.questions)) {
    const questions = content.questions.map(question => typeof question?.question === 'string' ? normalizeContentText(question.question) : '');
    if (new Set(questions).size !== questions.length) errors.push(`${id}: questões repetidas`);
  }
  if (content.sources !== undefined) {
    if (!Array.isArray(content.sources)) errors.push(`${id}: fontes inválidas`);
    else content.sources.forEach(source => {
      if (!source || typeof source.title !== 'string' || !source.title.trim() || typeof source.url !== 'string' || !/^https:\/\//.test(source.url)) errors.push(`${id}: fonte sem título ou URL HTTPS`);
    });
  }
  return errors;
}

export function findRepeatedContent(entries: Record<string, LabLearningContent>): string[] {
  const seen = new Map<string, string>();
  const errors: string[] = [];
  for (const [id, content] of Object.entries(entries)) {
    const segments = [content.context, content.theory, content.workedExample, content.expectedEvidence, content.reflection,
      ...(content.investigation ?? []), ...(content.scenarios ?? []).flatMap(item => [item.situation, item.observation, item.explanation]),
      ...(content.questions ?? []).flatMap(item => [item.question, ...(item.options ?? []).map(option => option.explanation)])];
    for (const text of segments) {
      if (typeof text !== 'string') continue;
      const key = normalizeContentText(text);
      const previousId = seen.get(key);
      if (previousId && previousId !== id) errors.push(`${id}: trecho idêntico ao de ${previousId}: ${text.slice(0, 65)}`);
      else seen.set(key, id);
    }
  }
  return errors;
}
