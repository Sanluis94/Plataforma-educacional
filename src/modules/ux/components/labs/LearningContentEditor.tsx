import type { LabLearningContent } from '../../../core/content/labLearningContent';

interface LearningContentEditorProps {
  content: LabLearningContent;
  onChange: (content: LabLearningContent) => void;
}

export function LearningContentEditor({ content, onChange }: LearningContentEditorProps) {
  const textField = (label: string, value: string, minimum: number, change: (value: string) => void, rows = 3) => (
    <label className="studio-field">
      <span>{label} (mínimo {minimum} {minimum === 1 ? 'caractere' : 'caracteres'})</span>
      <textarea value={value} onChange={event => change(event.target.value)} required minLength={minimum} rows={rows} />
    </label>
  );

  return <div className="studio-content-editor">
    <fieldset>
      <legend>Problema e explicação</legend>
      {textField('Problema contextualizado', content.context, 60, context => onChange({ ...content, context }))}
      {textField('Explicação conceitual', content.theory, 160, theory => onChange({ ...content, theory }), 5)}
      {textField('Exemplo resolvido e explicado', content.workedExample, 80, workedExample => onChange({ ...content, workedExample }), 4)}
    </fieldset>
    <fieldset>
      <legend>Investigação e conclusão</legend>
      {content.investigation.map((step, index) => <div key={index}>
        {textField(`Etapa ${index + 1}`, step, 20, value => onChange({ ...content, investigation: content.investigation.map((previous, itemIndex) => itemIndex === index ? value : previous) }), 2)}
      </div>)}
      {textField('Critérios para uma boa resposta', content.expectedEvidence, 60, expectedEvidence => onChange({ ...content, expectedEvidence }))}
      {textField('Pergunta de reflexão', content.reflection, 30, reflection => onChange({ ...content, reflection }), 2)}
    </fieldset>
    {content.scenarios.map((scenario, index) => {
      const update = (patch: Partial<typeof scenario>) => onChange({ ...content, scenarios: content.scenarios.map((previous, itemIndex) => itemIndex === index ? { ...previous, ...patch } : previous) });
      return <fieldset key={scenario.id}>
        <legend>Cenário {index + 1}</legend>
        {textField('Nome do cenário', scenario.label, 3, label => update({ label }), 1)}
        {textField('Situação e condições do caso', scenario.situation, 20, situation => update({ situation }))}
        {textField('Observação fornecida ao aluno', scenario.observation, 10, observation => update({ observation }))}
        {textField('Explicação da observação', scenario.explanation, 30, explanation => update({ explanation }))}
      </fieldset>;
    })}
    {content.questions.map((question, questionIndex) => {
      const update = (patch: Partial<typeof question>) => onChange({ ...content, questions: content.questions.map((previous, index) => index === questionIndex ? { ...previous, ...patch } : previous) });
      return <fieldset key={questionIndex}>
        <legend>Questão {questionIndex + 1}</legend>
        {textField('Enunciado da questão', question.question, 30, value => update({ question: value }))}
        {question.options.map((option, optionIndex) => <div key={optionIndex} className="studio-option">
          {textField(`Alternativa ${optionIndex + 1}`, option.text, 1, text => update({ options: question.options.map((previous, index) => index === optionIndex ? { ...previous, text } : previous) }), 2)}
          {textField(`Feedback da alternativa ${optionIndex + 1}`, option.explanation, 20, explanation => update({ options: question.options.map((previous, index) => index === optionIndex ? { ...previous, explanation } : previous) }))}
        </div>)}
        <label className="studio-field"><span>Resposta correta da questão {questionIndex + 1}</span>
          <select aria-label={`Resposta correta da questão ${questionIndex + 1}`} value={question.options.findIndex(option => option.correct)} onChange={event => update({ options: question.options.map((option, index) => ({ ...option, correct: index === Number(event.target.value) })) })}>
            {question.options.map((_, index) => <option value={index} key={index}>Alternativa {index + 1}</option>)}
          </select>
        </label>
      </fieldset>;
    })}
  </div>;
}
