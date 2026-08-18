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
      { id: 'math_1', title: 'Função de 1º Grau', component: MathSimulator, props: { functionType: 'linear' } },
      { id: 'math_2', title: 'Função de 2º Grau', component: MathSimulator, props: { functionType: 'quadratic' } },
      { id: 'math_3', title: 'Funções Trigonométricas', component: MathSimulator, props: { functionType: 'trigonometric' } },
      { id: 'math_4', title: 'Geometria Espacial', component: MathSimulator, props: { functionType: 'generic', title: 'Geometria Espacial - Volume e Área' } },
      { id: 'math_5', title: 'Estatística Descritiva', component: MathSimulator, props: { functionType: 'generic', title: 'Estatística Descritiva - Gráficos de Dispersão' } },
      { id: 'math_6', title: 'Matrizes e Sistemas', component: MathSimulator, props: { functionType: 'generic', title: 'Matrizes e Sistemas Lineares' } },
    ]
  },
  {
    id: 'fisica', label: 'Física',
    labs: [
      { id: 'fis_1', title: 'Cinemática do Pêndulo', component: Simulacao, props: {} },
      { id: 'fis_2', title: 'Leis de Newton', component: Simulacao, props: {} },
      { id: 'fis_3', title: 'Óptica Geométrica', component: Simulacao, props: {} },
      { id: 'fis_4', title: 'Eletromagnetismo', component: Simulacao, props: {} },
      { id: 'fis_5', title: 'Termodinâmica', component: Simulacao, props: {} },
      { id: 'fis_6', title: 'Física Moderna', component: Simulacao, props: {} },
    ]
  },
  {
    id: 'quimica', label: 'Química',
    labs: [
      { id: 'qui_1', title: 'Escala de pH', component: ChemistryLab, props: {} },
      { id: 'qui_2', title: 'Titulação Ácido-Base', component: ChemistryLab, props: {} },
      { id: 'qui_3', title: 'Estequiometria', component: ChemistryLab, props: {} },
      { id: 'qui_4', title: 'Química Orgânica', component: ChemistryLab, props: {} },
      { id: 'qui_5', title: 'Eletroquímica', component: ChemistryLab, props: {} },
      { id: 'qui_6', title: 'Gases Ideais', component: ChemistryLab, props: {} },
    ]
  },
  {
    id: 'biologia', label: 'Biologia',
    labs: [
      { id: 'bio_1', title: 'Microscopia Celular', component: MicroscopeSimulator, props: {} },
      { id: 'bio_2', title: 'Genética Mandeliana', component: MicroscopeSimulator, props: {} },
      { id: 'bio_3', title: 'Anatomia Humana', component: MicroscopeSimulator, props: {} },
      { id: 'bio_4', title: 'Ecossistemas', component: MicroscopeSimulator, props: {} },
      { id: 'bio_5', title: 'Evolução', component: MicroscopeSimulator, props: {} },
      { id: 'bio_6', title: 'Bioquímica', component: MicroscopeSimulator, props: {} },
    ]
  },
  {
    id: 'portugues', label: 'Português',
    labs: [
      { id: 'port_1', title: 'Sintaxe Dinâmica', component: PortugueseModule, props: {} },
      { id: 'port_2', title: 'Morfologia', component: PortugueseModule, props: {} },
      { id: 'port_3', title: 'Literatura Clássica', component: PortugueseModule, props: {} },
      { id: 'port_4', title: 'Figuras de Linguagem', component: PortugueseModule, props: {} },
      { id: 'port_5', title: 'Interpretação de Texto', component: PortugueseModule, props: {} },
      { id: 'port_6', title: 'Fonética', component: PortugueseModule, props: {} },
    ]
  },
  {
    id: 'redacao', label: 'Redação',
    labs: [
      { id: 'red_1', title: 'Estrutura Dissertativa', component: EssayModule, props: {} },
      { id: 'red_2', title: 'Coesão e Coerência', component: EssayModule, props: {} },
      { id: 'red_3', title: 'Proposta de Intervenção', component: EssayModule, props: {} },
      { id: 'red_4', title: 'Análise de Tema', component: EssayModule, props: {} },
      { id: 'red_5', title: 'Repertório Sociocultural', component: EssayModule, props: {} },
      { id: 'red_6', title: 'Correção de Falhas', component: EssayModule, props: {} },
    ]
  },
  {
    id: 'historia', label: 'História',
    labs: [
      { id: 'hist_1', title: 'Linha do Tempo Interativa', component: HistoryTimeline, props: {} },
      { id: 'hist_2', title: 'Brasil Colonial', component: HistoryTimeline, props: {} },
      { id: 'hist_3', title: 'Revolução Industrial', component: HistoryTimeline, props: {} },
      { id: 'hist_4', title: 'Guerras Mundiais', component: HistoryTimeline, props: {} },
      { id: 'hist_5', title: 'Grécia e Roma', component: HistoryTimeline, props: {} },
      { id: 'hist_6', title: 'Guerra Fria', component: HistoryTimeline, props: {} },
    ]
  },
  {
    id: 'idiomas', label: 'Idiomas',
    labs: [
      { id: 'lang_1', title: 'Vocabulário Essencial', component: LanguagesModule, props: {} },
      { id: 'lang_2', title: 'Tempos Verbais', component: LanguagesModule, props: {} },
      { id: 'lang_3', title: 'Listening Comprehension', component: LanguagesModule, props: {} },
      { id: 'lang_4', title: 'Expressões Idiomáticas', component: LanguagesModule, props: {} },
      { id: 'lang_5', title: 'Conversação Básica', component: LanguagesModule, props: {} },
      { id: 'lang_6', title: 'Falsos Cognatos', component: LanguagesModule, props: {} },
    ]
  },
  {
    id: 'softskills', label: 'Soft Skills',
    labs: [
      { id: 'soft_1', title: 'Comunicação Interpessoal', component: SoftSkillsModule, props: {} },
      { id: 'soft_2', title: 'Liderança', component: SoftSkillsModule, props: {} },
      { id: 'soft_3', title: 'Gestão de Tempo', component: SoftSkillsModule, props: {} },
      { id: 'soft_4', title: 'Inteligência Emocional', component: SoftSkillsModule, props: {} },
      { id: 'soft_5', title: 'Resolução de Conflitos', component: SoftSkillsModule, props: {} },
      { id: 'soft_6', title: 'Trabalho em Equipe', component: SoftSkillsModule, props: {} },
    ]
  },
  {
    id: 'hardskills', label: 'Hard Skills',
    labs: [
      { id: 'hard_1', title: 'Lógica de Programação', component: HardSkillsSimulator, props: {} },
      { id: 'hard_2', title: 'Estruturas de Dados', component: HardSkillsSimulator, props: {} },
      { id: 'hard_3', title: 'Banco de Dados', component: HardSkillsSimulator, props: {} },
      { id: 'hard_4', title: 'Desenvolvimento Web', component: HardSkillsSimulator, props: {} },
      { id: 'hard_5', title: 'Algoritmos', component: HardSkillsSimulator, props: {} },
      { id: 'hard_6', title: 'Redes de Computadores', component: HardSkillsSimulator, props: {} },
    ]
  },
  {
    id: 'geografia', label: 'Geografia',
    labs: [
      { id: 'geo_1', title: 'Placas Tectônicas', component: GeographySimulator, props: {} },
      { id: 'geo_2', title: 'Agentes do Relevo', component: GeographySimulator, props: {} },
      { id: 'geo_3', title: 'Tipos de Clima', component: GeographySimulator, props: {} },
      { id: 'geo_4', title: 'Cartografia Digital', component: GeographySimulator, props: {} },
      { id: 'geo_5', title: 'Bacias Hidrográficas', component: GeographySimulator, props: {} },
      { id: 'geo_6', title: 'Biomas Brasileiros', component: GeographySimulator, props: {} },
    ]
  },
  {
    id: 'filosofia', label: 'Filosofia',
    labs: [
      { id: 'fil_1', title: 'Dilemas Éticos', component: PhilosophySimulator, props: {} },
      { id: 'fil_2', title: 'O Mito da Caverna', component: PhilosophySimulator, props: {} },
      { id: 'fil_3', title: 'Contratualismo', component: PhilosophySimulator, props: {} },
      { id: 'fil_4', title: 'Lógica e Argumentação', component: PhilosophySimulator, props: {} },
      { id: 'fil_5', title: 'Filosofia Política', component: PhilosophySimulator, props: {} },
      { id: 'fil_6', title: 'Ciência e Método', component: PhilosophySimulator, props: {} },
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
