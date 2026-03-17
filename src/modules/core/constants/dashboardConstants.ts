import { MathSimulator } from '../../ux/pages/simuladores/MathSimulator';
import { ChemistryLab } from '../../ux/pages/simuladores/ChemistryLab';
import { MicroscopeSimulator } from '../../ux/pages/simuladores/MicroscopeSimulator';
import { PortugueseModule } from '../../ux/pages/simuladores/PortugueseModule';
import { EssayModule } from '../../ux/pages/simuladores/EssayModule';
import { HistoryTimeline } from '../../ux/pages/simuladores/HistoryTimeline';
import { LanguagesModule } from '../../ux/pages/simuladores/LanguagesModule';
import { SoftSkillsModule } from '../../ux/pages/simuladores/SoftSkillsModule';
import { HardSkillsSimulator } from '../../ux/pages/simuladores/HardSkillsSimulator';
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
};

export const ALL_MODULES = [
  { id: 'matematica', label: 'Matemática', component: MathSimulator, props: { functionType: 'linear' as const } },
  { id: 'fisica', label: 'Física', component: null },
  { id: 'quimica', label: 'Química', component: ChemistryLab, props: {} },
  { id: 'biologia', label: 'Biologia', component: MicroscopeSimulator, props: {} },
  { id: 'portugues', label: 'Português', component: PortugueseModule, props: {} },
  { id: 'redacao', label: 'Redação', component: EssayModule, props: {} },
  { id: 'historia', label: 'História', component: HistoryTimeline, props: {} },
  { id: 'idiomas', label: 'Idiomas', component: LanguagesModule, props: {} },
  { id: 'softskills', label: 'Soft Skills', component: SoftSkillsModule, props: {} },
  { id: 'hardskills', label: 'Hard Skills', component: HardSkillsSimulator, props: {} },
];

export const MODULES_BY_GRADE: Record<GradeLevel, string[]> = {
  fundamental_1: ['matematica', 'portugues'],
  fundamental_2: ['matematica', 'portugues', 'historia', 'biologia', 'idiomas'],
  medio: ['matematica', 'fisica', 'quimica', 'biologia', 'portugues', 'redacao', 'historia', 'idiomas'],
  profissional: ['softskills', 'hardskills', 'portugues', 'redacao', 'idiomas'],
};

export const SHOP_ITEMS = [
  { id: 'avatar_hero', name: 'Avatar Herói', price: 200, icon: '🦸', owned: false },
  { id: 'frame_gold', name: 'Moldura Dourada', price: 150, icon: '🏅', owned: false },
  { id: 'badge_genius', name: 'Badge Gênio', price: 100, icon: '🧠', owned: false },
  { id: 'theme_neon', name: 'Tema Neon', price: 300, icon: '✨', owned: false },
];
