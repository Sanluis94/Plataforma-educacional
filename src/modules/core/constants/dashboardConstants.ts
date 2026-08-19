import { MathSimulator } from '../../ux/pages/simuladores/MathSimulator';
import { ChemistryLab } from '../../ux/pages/simuladores/ChemistryLab';
import { MicroscopeSimulator } from '../../ux/pages/simuladores/MicroscopeSimulator';
import { PortugueseModule } from '../../ux/pages/simuladores/PortugueseModule';
import { EssayModule } from '../../ux/pages/simuladores/EssayModule';
import { HistoryTimeline } from '../../ux/pages/simuladores/HistoryTimeline';
import { LanguagesModule } from '../../ux/pages/simuladores/LanguagesModule';
import { SoftSkillsModule } from '../../ux/pages/simuladores/SoftSkillsModule';
import { HardSkillsSimulator } from '../../ux/pages/simuladores/HardSkillsSimulator';
import { GeographySimulator } from '../../ux/pages/simuladores/GeographySimulator';
import { PhilosophySimulator } from '../../ux/pages/simuladores/PhilosophySimulator';
import { Simulacao } from '../../ux/pages/Simulacao';
import type { GradeLevel } from '../contexts/AuthContext';

export const SUBJECT_THEMES: Record<string, { primary: string; secondary: string; emoji: string; bg: string }> = {
  matematica: { primary: '#7c4dff', secondary: '#b388ff', emoji: '📐', bg: 'linear-gradient(135deg, #1a1035 0%, #12002a 100%)' },
  fisica: { primary: '#ef5350', secondary: '#ff8a80', emoji: '⚛️', bg: 'linear-gradient(135deg, #1c0505 0%, #0d0000 100%)' },
  quimica: { primary: '#00bcd4', secondary: '#80deea', emoji: '🧪', bg: 'linear-gradient(135deg, #001a1f 0%, #00080d 100%)' },
  biologia: { primary: '#4caf50', secondary: '#a5d6a7', emoji: '🔬', bg: 'linear-gradient(135deg, #0a1f0a 0%, #010d01 100%)' },
  portugues: { primary: '#ff7043', secondary: '#ffccbc', emoji: '📖', bg: 'linear-gradient(135deg, #1a0c08 0%, #0d0400 100%)' },
  redacao: { primary: '#ec407a', secondary: '#f48fb1', emoji: '✍️', bg: 'linear-gradient(135deg, #1a0610 0%, #0d0008 100%)' },
  historia: { primary: '#ff8f00', secondary: '#ffe082', emoji: '🌍', bg: 'linear-gradient(135deg, #1a1000 0%, #0d0800 100%)' },
  idiomas: { primary: '#26a69a', secondary: '#80cbc4', emoji: '🌐', bg: 'linear-gradient(135deg, #001a18 0%, #000d0c 100%)' },
  softskills: { primary: '#5c6bc0', secondary: '#9fa8da', emoji: '💼', bg: 'linear-gradient(135deg, #0a0c1a 0%, #03040d 100%)' },
  hardskills: { primary: '#0288d1', secondary: '#81d4fa', emoji: '🖥️', bg: 'linear-gradient(135deg, #00060f 0%, #000208 100%)' },
  geografia: { primary: '#00e676', secondary: '#69f0ae', emoji: '🌋', bg: 'linear-gradient(135deg, #001d0f 0%, #000a05 100%)' },
  filosofia: { primary: '#ffc400', secondary: '#ffe082', emoji: '🏛️', bg: 'linear-gradient(135deg, #1d1600 0%, #0a0800 100%)' },
};

export const ALL_MODULES = [
  {
    id: 'matematica', label: 'Matemática',
    labs: [
      { id: 'math_1', title: 'Função de 1º Grau', component: MathSimulator, props: { mode: 'linear', functionType: 'linear' } },
      { id: 'math_2', title: 'Função de 2º Grau', component: MathSimulator, props: { mode: 'quadratic', functionType: 'quadratic' } },
      { id: 'math_3', title: 'Funções Trigonométricas', component: MathSimulator, props: { mode: 'trigonometric', functionType: 'trigonometric' } },
      { id: 'math_4', title: 'Geometria Espacial', component: MathSimulator, props: { mode: 'spatial', functionType: 'generic', title: 'Geometria Espacial - Volume e Área' } },
      { id: 'math_5', title: 'Estatística Descritiva', component: MathSimulator, props: { mode: 'statistics', functionType: 'generic', title: 'Estatística Descritiva - Gráficos de Dispersão' } },
      { id: 'math_6', title: 'Matrizes e Sistemas', component: MathSimulator, props: { mode: 'matrices', functionType: 'generic', title: 'Matrizes e Sistemas Lineares' } },
    ]
  },
  {
    id: 'fisica', label: 'Física',
    labs: [
      { id: 'fis_1', title: 'Cinemática do Pêndulo', component: Simulacao, props: { mode: 'pendulum' } },
      { id: 'fis_2', title: 'Leis de Newton', component: Simulacao, props: { mode: 'collisions' } },
      { id: 'fis_3', title: 'Óptica Geométrica', component: Simulacao, props: { mode: 'optics' } },
      { id: 'fis_4', title: 'Eletromagnetismo', component: Simulacao, props: { mode: 'electromagnetism' } },
      { id: 'fis_5', title: 'Termodinâmica', component: Simulacao, props: { mode: 'thermodynamics' } },
      { id: 'fis_6', title: 'Física Moderna', component: Simulacao, props: { mode: 'modern_physics' } },
    ]
  },
  {
    id: 'quimica', label: 'Química',
    labs: [
      { id: 'qui_1', title: 'Escala de pH', component: ChemistryLab, props: { mode: 'ph_scale' } },
      { id: 'qui_2', title: 'Titulação Ácido-Base', component: ChemistryLab, props: { mode: 'titration' } },
      { id: 'qui_3', title: 'Estequiometria', component: ChemistryLab, props: { mode: 'stoichiometry' } },
      { id: 'qui_4', title: 'Química Orgânica', component: ChemistryLab, props: { mode: 'organic' } },
      { id: 'qui_5', title: 'Eletroquímica', component: ChemistryLab, props: { mode: 'electrochemistry' } },
      { id: 'qui_6', title: 'Gases Ideais', component: ChemistryLab, props: { mode: 'gases' } },
    ]
  },
  {
    id: 'biologia', label: 'Biologia',
    labs: [
      { id: 'bio_1', title: 'Microscopia Celular', component: MicroscopeSimulator, props: { mode: 'microscopy' } },
      { id: 'bio_2', title: 'Genética Mendeliana', component: MicroscopeSimulator, props: { mode: 'genetics' } },
      { id: 'bio_3', title: 'Anatomia Humana', component: MicroscopeSimulator, props: { mode: 'anatomy' } },
      { id: 'bio_4', title: 'Ecossistemas', component: MicroscopeSimulator, props: { mode: 'ecosystems' } },
      { id: 'bio_5', title: 'Evolução', component: MicroscopeSimulator, props: { mode: 'evolution' } },
      { id: 'bio_6', title: 'Bioquímica', component: MicroscopeSimulator, props: { mode: 'biochemistry' } },
    ]
  },
  {
    id: 'portugues', label: 'Português',
    labs: [
      { id: 'port_1', title: 'Sintaxe Dinâmica', component: PortugueseModule, props: { mode: 'syntax' } },
      { id: 'port_2', title: 'Morfologia', component: PortugueseModule, props: { mode: 'morphology' } },
      { id: 'port_3', title: 'Literatura Clássica', component: PortugueseModule, props: { mode: 'literature' } },
      { id: 'port_4', title: 'Figuras de Linguagem', component: PortugueseModule, props: { mode: 'figures' } },
      { id: 'port_5', title: 'Interpretação de Texto', component: PortugueseModule, props: { mode: 'comprehension' } },
      { id: 'port_6', title: 'Fonética', component: PortugueseModule, props: { mode: 'phonetics' } },
    ]
  },
  {
    id: 'redacao', label: 'Redação',
    labs: [
      { id: 'red_1', title: 'Estrutura Dissertativa', component: EssayModule, props: { mode: 'structure' } },
      { id: 'red_2', title: 'Coesão e Coerência', component: EssayModule, props: { mode: 'cohesion' } },
      { id: 'red_3', title: 'Proposta de Intervenção', component: EssayModule, props: { mode: 'intervention' } },
      { id: 'red_4', title: 'Análise de Tema', component: EssayModule, props: { mode: 'theme_analysis' } },
      { id: 'red_5', title: 'Repertório Sociocultural', component: EssayModule, props: { mode: 'repertoire' } },
      { id: 'red_6', title: 'Correção de Falhas', component: EssayModule, props: { mode: 'correction' } },
    ]
  },
  {
    id: 'historia', label: 'História',
    labs: [
      { id: 'hist_1', title: 'Linha do Tempo Interativa', component: HistoryTimeline, props: { mode: 'timeline' } },
      { id: 'hist_2', title: 'Brasil Colonial', component: HistoryTimeline, props: { mode: 'brazil_colony' } },
      { id: 'hist_3', title: 'Revolução Industrial', component: HistoryTimeline, props: { mode: 'industrial_rev' } },
      { id: 'hist_4', title: 'Guerras Mundiais', component: HistoryTimeline, props: { mode: 'world_wars' } },
      { id: 'hist_5', title: 'Grécia e Roma', component: HistoryTimeline, props: { mode: 'greece_rome' } },
      { id: 'hist_6', title: 'Guerra Fria', component: HistoryTimeline, props: { mode: 'cold_war' } },
    ]
  },
  {
    id: 'idiomas', label: 'Idiomas',
    labs: [
      { id: 'lang_1', title: 'Vocabulário Essencial', component: LanguagesModule, props: { mode: 'vocabulary' } },
      { id: 'lang_2', title: 'Tempos Verbais', component: LanguagesModule, props: { mode: 'grammar' } },
      { id: 'lang_3', title: 'Listening Comprehension', component: LanguagesModule, props: { mode: 'listening' } },
      { id: 'lang_4', title: 'Expressões Idiomáticas', component: LanguagesModule, props: { mode: 'idioms' } },
      { id: 'lang_5', title: 'Conversação Básica', component: LanguagesModule, props: { mode: 'conversation' } },
      { id: 'lang_6', title: 'Falsos Cognatos', component: LanguagesModule, props: { mode: 'false_friends' } },
    ]
  },
  {
    id: 'softskills', label: 'Soft Skills',
    labs: [
      { id: 'soft_1', title: 'Comunicação Interpessoal', component: SoftSkillsModule, props: { mode: 'communication' } },
      { id: 'soft_2', title: 'Liderança', component: SoftSkillsModule, props: { mode: 'leadership' } },
      { id: 'soft_3', title: 'Gestão de Tempo', component: SoftSkillsModule, props: { mode: 'time_management' } },
      { id: 'soft_4', title: 'Inteligência Emocional', component: SoftSkillsModule, props: { mode: 'emotional_intelligence' } },
      { id: 'soft_5', title: 'Resolução de Conflitos', component: SoftSkillsModule, props: { mode: 'conflict_resolution' } },
      { id: 'soft_6', title: 'Trabalho em Equipe', component: SoftSkillsModule, props: { mode: 'teamwork' } },
    ]
  },
  {
    id: 'hardskills', label: 'Hard Skills',
    labs: [
      { id: 'hard_1', title: 'Lógica de Programação', component: HardSkillsSimulator, props: { mode: 'programming' } },
      { id: 'hard_2', title: 'Estruturas de Dados', component: HardSkillsSimulator, props: { mode: 'data_structures' } },
      { id: 'hard_3', title: 'Banco de Dados', component: HardSkillsSimulator, props: { mode: 'databases' } },
      { id: 'hard_4', title: 'Desenvolvimento Web', component: HardSkillsSimulator, props: { mode: 'web_dev' } },
      { id: 'hard_5', title: 'Algoritmos', component: HardSkillsSimulator, props: { mode: 'algorithms' } },
      { id: 'hard_6', title: 'Redes de Computadores', component: HardSkillsSimulator, props: { mode: 'networks' } },
    ]
  },
  {
    id: 'geografia', label: 'Geografia',
    labs: [
      { id: 'geo_1', title: 'Placas Tectônicas', component: GeographySimulator, props: { mode: 'tectonics' } },
      { id: 'geo_2', title: 'Agentes do Relevo', component: GeographySimulator, props: { mode: 'relief' } },
      { id: 'geo_3', title: 'Tipos de Clima', component: GeographySimulator, props: { mode: 'climate' } },
      { id: 'geo_4', title: 'Cartografia Digital', component: GeographySimulator, props: { mode: 'cartography' } },
      { id: 'geo_5', title: 'Bacias Hidrográficas', component: GeographySimulator, props: { mode: 'hydrography' } },
      { id: 'geo_6', title: 'Biomas Brasileiros', component: GeographySimulator, props: { mode: 'biomes' } },
    ]
  },
  {
    id: 'filosofia', label: 'Filosofia',
    labs: [
      { id: 'fil_1', title: 'Dilemas Éticos', component: PhilosophySimulator, props: { mode: 'ethics' } },
      { id: 'fil_2', title: 'O Mito da Caverna', component: PhilosophySimulator, props: { mode: 'cave_myth' } },
      { id: 'fil_3', title: 'Contratualismo', component: PhilosophySimulator, props: { mode: 'contractualism' } },
      { id: 'fil_4', title: 'Lógica e Argumentação', component: PhilosophySimulator, props: { mode: 'logic' } },
      { id: 'fil_5', title: 'Filosofia Política', component: PhilosophySimulator, props: { mode: 'political_philosophy' } },
      { id: 'fil_6', title: 'Ciência e Método', component: PhilosophySimulator, props: { mode: 'epistemology' } },
    ]
  },
];

export const MODULES_BY_GRADE: Record<GradeLevel, string[]> = {
  fundamental_1: ['matematica', 'portugues'],
  fundamental_2: ['matematica', 'portugues', 'historia', 'biologia', 'idiomas', 'geografia'],
  medio: ['matematica', 'fisica', 'quimica', 'biologia', 'portugues', 'redacao', 'historia', 'idiomas', 'geografia', 'filosofia'],
  profissional: ['softskills', 'hardskills', 'portugues', 'redacao', 'idiomas', 'filosofia'],
};

export const SHOP_ITEMS = [
  { id: 'avatar_hero', name: 'Avatar Herói', price: 200, icon: '🦸', owned: false },
  { id: 'frame_gold', name: 'Moldura Dourada', price: 150, icon: '🏅', owned: false },
  { id: 'badge_genius', name: 'Badge Gênio', price: 100, icon: '🧠', owned: false },
  { id: 'theme_neon', name: 'Tema Neon', price: 300, icon: '✨', owned: false },
];
