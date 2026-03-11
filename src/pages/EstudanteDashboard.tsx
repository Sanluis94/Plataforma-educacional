import { useState, useEffect, useMemo } from 'react';
import { Star, Award, BrainCircuit } from 'lucide-react';
import { getAdaptiveRecommendation } from '../services/aiAdaptiveEngine';
import { useAuth } from '../contexts/AuthContext';
import type { GradeLevel } from '../contexts/AuthContext';
import { MathSimulator } from './simuladores/MathSimulator';
import { ChemistryLab } from './simuladores/ChemistryLab';
import { MicroscopeSimulator } from './simuladores/MicroscopeSimulator';
import { PortugueseModule } from './simuladores/PortugueseModule';
import { EssayModule } from './simuladores/EssayModule';
import { HistoryTimeline } from './simuladores/HistoryTimeline';
import { LanguagesModule } from './simuladores/LanguagesModule';
import { SoftSkillsModule } from './simuladores/SoftSkillsModule';
import { HardSkillsSimulator } from './simuladores/HardSkillsSimulator';
import './EstudanteDashboard.css';

// Phase 27: Subject themes with dynamic color theming
const SUBJECT_THEMES: Record<string, { primary: string; secondary: string; emoji: string; bg: string }> = {
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

// All modules definition
const ALL_MODULES = [
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

// Grade-based access control: which module IDs are visible per school segment
const MODULES_BY_GRADE: Record<GradeLevel, string[]> = {
  fundamental_1: ['matematica', 'portugues'],
  fundamental_2: ['matematica', 'portugues', 'historia', 'biologia', 'idiomas'],
  medio: ['matematica', 'fisica', 'quimica', 'biologia', 'portugues', 'redacao', 'historia', 'idiomas'],
  profissional: ['softskills', 'hardskills', 'portugues', 'redacao', 'idiomas'],
};

// Phase 28: Virtual Economy items
const SHOP_ITEMS = [
  { id: 'avatar_hero', name: 'Avatar Herói', price: 200, icon: '🦸', owned: false },
  { id: 'frame_gold', name: 'Moldura Dourada', price: 150, icon: '🏅', owned: false },
  { id: 'badge_genius', name: 'Badge Gênio', price: 100, icon: '🧠', owned: false },
  { id: 'theme_neon', name: 'Tema Neon', price: 300, icon: '✨', owned: false },
];

export function EstudanteDashboard() {
  const { userData } = useAuth();
  const gradeLevel: GradeLevel = userData?.gradeLevel || 'medio';

  // Filter modules by school segment (Phase 27 extension)
  const MODULES = useMemo(() => {
    const allowed = MODULES_BY_GRADE[gradeLevel] || [];
    return ALL_MODULES.filter(m => allowed.includes(m.id));
  }, [gradeLevel]);

  const [level, setLevel] = useState(5);
  const [xp, setXp] = useState(1250);
  const [coins, setCoins] = useState(450);
  const [aiTip, setAiTip] = useState('Analisando seu progresso educacional...');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'learning' | 'shop' | 'achievements'>('learning');
  const [shopItems, setShopItems] = useState(SHOP_ITEMS);

  const theme = activeSubject ? SUBJECT_THEMES[activeSubject] : {
    primary: 'var(--color-primary)', secondary: 'var(--color-secondary)',
    emoji: '🎓', bg: 'var(--bg-main)'
  };

  useEffect(() => {
    async function fetchTip() {
      const tip = await getAdaptiveRecommendation({
        level, xp,
        recentModules: activeSubject ? [activeSubject] : [],
        weaknesses: level < 5 ? ['fundamentos'] : [],
      });
      setAiTip(tip);
    }
    fetchTip();
  }, [level, xp, activeSubject]);

  const handleModuleComplete = (score: number) => {
    const earnedXP = Math.floor(score * 0.8);
    const earnedCoins = Math.floor(score * 0.3);
    setXp(x => x + earnedXP);
    setCoins(c => c + earnedCoins);
    if (xp + earnedXP >= level * 500) setLevel(l => l + 1);
    setActiveSubject(null);
  };

  const buyItem = (itemId: string) => {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || item.owned || coins < item.price) return;
    setCoins(c => c - item.price);
    setShopItems(items => items.map(i => i.id === itemId ? { ...i, owned: true } : i));
  };

  const activeModule = activeSubject ? MODULES.find(m => m.id === activeSubject) : null;
  const ActiveComponent = activeModule?.component;

  return (
    <div
      className="dashboard-container fade-in"
      style={{
        background: activeSubject ? theme.bg : undefined,
        transition: 'background 0.8s ease',
        minHeight: '100vh',
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="dashboard-header estudante-header"
        style={{ '--header-primary': typeof theme.primary === 'string' ? theme.primary : 'var(--color-primary)' } as React.CSSProperties}>
        <div>
          <h1>
            {activeSubject ? `${(SUBJECT_THEMES[activeSubject] || {}).emoji || '🎓'} ` : ''}
            {activeSubject ? (MODULES.find(m => m.id === activeSubject)?.label || 'Laboratório') : 'Área do Estudante'}
          </h1>
          <p className="text-secondary">
            {activeSubject ? 'Laboratório Virtual — modo imersivo ativo' : 'Pronto para aprender e ganhar pontos hoje?'}
          </p>
        </div>
        <div className="gamification-stats" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)', color: '#ffd700', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Star size={14} fill="currentColor" /> {xp} XP
          </span>
          <span style={{ background: 'rgba(255,167,38,0.15)', border: '1px solid rgba(255,167,38,0.3)', color: '#ffa726', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            🪙 {coins}
          </span>
          <span style={{ background: 'rgba(var(--color-primary-rgb),0.15)', border: '1px solid rgba(var(--color-primary-rgb),0.3)', color: 'var(--color-primary)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={14} /> Nível {level}
          </span>
        </div>
      </header>

      {/* Nav Tabs */}
      {!activeSubject && (
        <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
           { id: 'learning', label: '📚 Aprendizado' },
            { id: 'shop', label: '🛍️ Loja' },
            { id: 'achievements', label: '🏆 Conquistas' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id as typeof activeView)}
              style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                color: activeView === tab.id ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeView === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                fontWeight: activeView === tab.id ? 'bold' : 'normal', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <main className="dashboard-main" id="main-content">
        {/* Active module view */}
        {activeSubject && ActiveComponent && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button onClick={() => setActiveSubject(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              ← Voltar ao Dashboard
            </button>
            <ActiveComponent
              {...(activeModule?.props || {})}
              onComplete={handleModuleComplete}
            />
          </div>
        )}

        {/* Learning view */}
        {!activeSubject && activeView === 'learning' && (
          <div className="dashboard-grid">
            <section className="trails-section">
              {/* AI Tip */}
              <div style={{ background: 'rgba(var(--color-primary-rgb),0.08)', border: '1px solid rgba(var(--color-primary-rgb),0.2)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <BrainCircuit size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>IA ADAPTATIVA</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0, lineHeight: '1.6' }}>{aiTip}</p>
                </div>
              </div>

              <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Laboratórios Disponíveis</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {MODULES.map(mod => {
                  const t = SUBJECT_THEMES[mod.id];
                  return (
                    <button key={mod.id}
                      onClick={() => mod.component && setActiveSubject(mod.id)}
                      disabled={!mod.component}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.1rem',
                        borderRadius: '12px', cursor: mod.component ? 'pointer' : 'not-allowed',
                        border: `1px solid ${t?.primary || 'rgba(255,255,255,0.1)'}33`,
                        background: `${t?.primary || 'rgba(255,255,255,0.05)'}11`,
                        textAlign: 'left', transition: 'all 0.25s', opacity: mod.component ? 1 : 0.45,
                      }}>
                      <div style={{ fontSize: '1.75rem' }}>{t?.emoji || '📚'}</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.88rem' }}>{mod.label}</div>
                      <div style={{ color: t?.primary || 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 'bold' }}>
                        {mod.component ? 'Acessar →' : 'Em breve'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Right sidebar */}
            <aside className="dashboard-sidebar">
              {/* XP Progress */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>Nível {level}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{xp} / {level * 500} XP</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                  <div style={{ height: '100%', background: 'var(--color-primary)', borderRadius: '3px', width: `${Math.min(100, (xp / (level * 500)) * 100)}%`, transition: 'width 0.6s' }} />
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
                  Faltam {Math.max(0, level * 500 - xp)} XP para o Nível {level + 1}
                </div>
              </div>

              {/* Coins balance */}
              <div style={{ background: 'rgba(255,167,38,0.07)', border: '1px solid rgba(255,167,38,0.2)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>🪙</span>
                <div>
                  <div style={{ color: '#ffa726', fontWeight: 'bold' }}>{coins} Moedas</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Use na loja para personalizar!</div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Shop view (Phase 28) */}
        {!activeSubject && activeView === 'shop' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem 0' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>🛍️ Loja de Itens</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Gaste suas moedas em personalizações exclusivas.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {shopItems.map(item => (
                <div key={item.id} style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: item.owned ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.88rem' }}>{item.name}</div>
                  {item.owned ? (
                    <div style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>✅ Adquirido</div>
                  ) : (
                    <button onClick={() => buyItem(item.id)} disabled={coins < item.price}
                      style={{ marginTop: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', cursor: coins >= item.price ? 'pointer' : 'not-allowed',
                        background: coins >= item.price ? '#ffa726' : 'rgba(255,255,255,0.1)', color: coins >= item.price ? '#000' : 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      🪙 {item.price}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '1.5rem', textAlign: 'center' }}>
              Saldo atual: <strong style={{ color: '#ffa726' }}>🪙 {coins}</strong> — complete laboratórios para ganhar mais moedas!
            </p>
          </div>
        )}

        {/* Achievements view */}
        {!activeSubject && activeView === 'achievements' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem 0' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>🏆 Suas Conquistas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { icon: '🏅', name: 'Pioneiro', desc: 'Completou sua primeira atividade', unlocked: true },
                { icon: '⭐', name: 'Matemático Célere', desc: 'Resolveu 3 equações seguidas', unlocked: true },
                { icon: '🧪', name: 'Cientista Iniciante', desc: 'Completou o lab de Química', unlocked: xp > 1500 },
                { icon: '🌍', name: 'Viajante do Tempo', desc: 'Explorou a Linha do Tempo da História', unlocked: false },
                { icon: '🎓', name: 'Poliglota', desc: 'Concluiu o módulo de Idiomas', unlocked: false },
                { icon: '💡', name: 'Arguto Literário', desc: 'Acertou 100% no quiz de Literatura', unlocked: false },
              ].map((ach, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', borderRadius: '10px',
                  background: ach.unlocked ? 'rgba(var(--color-primary-rgb),0.08)' : 'rgba(255,255,255,0.03)',
                  border: ach.unlocked ? '1px solid rgba(var(--color-primary-rgb),0.25)' : '1px solid rgba(255,255,255,0.06)',
                  opacity: ach.unlocked ? 1 : 0.5 }}>
                  <div style={{ fontSize: '2rem', filter: ach.unlocked ? 'none' : 'grayscale(1)' }}>{ach.icon}</div>
                  <div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' }}>{ach.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ach.desc}</div>
                  </div>
                  {ach.unlocked && <div style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>✅</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
