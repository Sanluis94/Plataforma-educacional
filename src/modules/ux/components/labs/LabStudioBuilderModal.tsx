import React, { useState } from 'react';
import { PlusCircle, Sliders, HelpCircle, Save, X, Sparkles, Check } from 'lucide-react';
import type { CatalogLabItem } from '../../../core/constants/masterLabsCatalog';

interface LabStudioBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNewLab: (newLab: CatalogLabItem) => void;
}

export const LabStudioBuilderModal: React.FC<LabStudioBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveNewLab
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Física Experimental');
  const [level, setLevel] = useState<CatalogLabItem['academicLevel']>('graduacao');
  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [theory, setTheory] = useState('');
  const [paramLabel, setParamLabel] = useState('Tensão Aplicada');
  const [paramUnit, setParamUnit] = useState('V');
  const [paramMin, setParamMin] = useState(0);
  const [paramMax, setParamMax] = useState(100);
  const [paramDefault, setParamDefault] = useState(25);
  const [question, setQuestion] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [distractor, setDistractor] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      alert('Preencha ao menos o título e o tópico do laboratório.');
      return;
    }

    const labId = `custom_${Date.now()}`;
    const newLab: CatalogLabItem = {
      id: labId,
      title: title.trim(),
      academicLevel: level,
      academicLevelLabel:
        level === 'fundamental_1' ? 'Ensino Fundamental I' :
        level === 'fundamental_2' ? 'Ensino Fundamental II' :
        level === 'medio' ? 'Ensino Médio' :
        level === 'graduacao' ? 'Ensino Superior' : 'Pós-Graduação',
      subject: subject.trim(),
      subjectCategory: 'Personalizados',
      topic: topic.trim(),
      objective: objective.trim() || `Investigação experimental de ${topic}.`,
      theoreticalBackground: theory.trim() || `Fundamentação teórica experimental aplicada ao tema ${topic}.`,
      curriculumCode: 'CUSTOM-LAB',
      simulatedHours: 20,
      icon: '🛠️',
      solverType: 'custom_analytical',
      defaultParams: [
        {
          id: `${labId}_p1`,
          label: paramLabel,
          unit: paramUnit,
          min: Number(paramMin),
          max: Number(paramMax),
          step: 1,
          defaultValue: Number(paramDefault)
        }
      ],
      diagnosticQuestion: {
        question: question.trim() || `Qual é o principal efeito observado ao alterar ${paramLabel}?`,
        options: [
          {
            text: correctOption.trim() || 'Resposta proporcional direta segundo o modelo teórico.',
            correct: true,
            explanation: 'Correto! A resposta é governada pela equação constitutiva do sistema.'
          },
          {
            text: distractor.trim() || 'O sistema permanece completamente invariante.',
            correct: false,
            explanation: 'Incorreto. A alteração das variáveis modifica ativamente o estado dinâmico.'
          }
        ]
      }
    };

    onSaveNewLab(newLab);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[#E4683F]/20 text-[#E4683F] rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">Kortex Studio No-Code</h3>
                <span className="bg-sky-950 text-sky-400 border border-sky-800 text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Criação Visual</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Crie e publique novos laboratórios virtuais sem precisar programar</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Título do Laboratório:</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Pêndulo Eletrostático de Coulomb"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-[#E4683F] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Nível Acadêmico:</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-[#E4683F] focus:outline-none"
              >
                <option value="fundamental_1">Fundamental I</option>
                <option value="fundamental_2">Fundamental II</option>
                <option value="medio">Ensino Médio</option>
                <option value="graduacao">Ensino Superior (Graduação)</option>
                <option value="pos_graduacao">Pós-Graduação & Pesquisa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Disciplina:</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-[#E4683F] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Tópico / Fenômeno:</label>
              <input
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Ex: Força Eletrostática"
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-[#E4683F] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Objetivo Pedagógico da Prática:</label>
            <textarea
              rows={2}
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder="Descreva o que o aluno deve investigar e comprovar empiricamente..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-[#E4683F] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Fundamentação Teórica (Opcional):</label>
            <textarea
              rows={2}
              value={theory}
              onChange={e => setTheory(e.target.value)}
              placeholder="Descreva as leis fundamentais e equações governantes do fenômeno..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-[#E4683F] focus:outline-none resize-none"
            />
          </div>

          {/* Parâmetros */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-bold text-slate-300 flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-[#E4683F]" />
              <span>Configuração do Controle Deslizante Principal (Slider):</span>
            </span>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <input
                type="text"
                placeholder="Nome do Parâmetro"
                value={paramLabel}
                onChange={e => setParamLabel(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-1.5 rounded text-slate-200 col-span-2"
              />
              <input
                type="text"
                placeholder="Unidade (ex: V, kg, m/s)"
                value={paramUnit}
                onChange={e => setParamUnit(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-1.5 rounded text-slate-200"
              />
              <input
                type="number"
                placeholder="Mínimo"
                value={paramMin}
                onChange={e => setParamMin(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 p-1.5 rounded text-slate-200"
              />
              <input
                type="number"
                placeholder="Máximo"
                value={paramMax}
                onChange={e => setParamMax(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 p-1.5 rounded text-slate-200"
              />
              <input
                type="number"
                placeholder="Padrão"
                value={paramDefault}
                onChange={e => setParamDefault(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 p-1.5 rounded text-slate-200"
              />
            </div>
          </div>

          {/* Questão */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-bold text-slate-300 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Questão Diagnóstica de Verificação Conceitual:</span>
            </span>
            <input
              type="text"
              placeholder="Pergunta conceitual para o aluno..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-1.5 rounded text-slate-200"
            />
            <input
              type="text"
              placeholder="Alternativa Correta (Gabarito)"
              value={correctOption}
              onChange={e => setCorrectOption(e.target.value)}
              className="w-full bg-slate-900 border border-emerald-900 p-1.5 rounded text-emerald-300"
            />
            <input
              type="text"
              placeholder="Alternativa Incorreta (Distrator)"
              value={distractor}
              onChange={e => setDistractor(e.target.value)}
              className="w-full bg-slate-900 border border-rose-900 p-1.5 rounded text-rose-300"
            />
          </div>

          {/* Footer Save */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E4683F] hover:bg-[#E4683F]/90 font-bold text-white rounded flex items-center space-x-1.5 shadow"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Publicado!' : 'Publicar Laboratório'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
