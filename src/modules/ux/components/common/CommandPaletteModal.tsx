import { useState, useRef, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Users,
  Beaker,
  GraduationCap,
  Building2,
  Sun,
  Moon,
  Heart,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X
} from 'lucide-react';
import { LEARNING_LABS_CATALOG, searchLearningLabs } from '../../../core/constants/learningCatalog';
import { learningLevelLabel } from '../../../core/constants/learningLevels';
import { useAuth } from '../../../core/contexts/AuthContext';
import { canAccessPath, withReturnTo } from '../../../core/utils/navigation';
import { useLocation } from 'react-router-dom';
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onOpenPricing: () => void;
  onOpenParentBridge: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navegação' | 'Laboratórios' | 'Ações Rápidas';
  icon: LucideIcon;
  onSelect: () => void;
  badge?: string;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  theme,
  onThemeToggle,
  onOpenPricing,
  onOpenParentBridge
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();
  const dialogRef = useDialogAccessibility(isOpen, onClose);
  const returnTo = location.pathname + location.search;

  // Navigation base items
  const baseNavigationActions: PaletteAction[] = useMemo(() => [
    {
      id: 'nav-home',
      title: 'Página inicial',
      subtitle: 'Página inicial, visão geral da plataforma e recursos',
      category: 'Navegação',
      icon: BookOpen,
      onSelect: () => { navigate('/'); onClose(); }
    },
    {
      id: 'nav-simulacao',
      title: 'Bancada Virtual de Laboratórios',
      subtitle: 'Atividades organizadas por nível e disciplina',
      category: 'Navegação',
      icon: Beaker,
      badge: `${LEARNING_LABS_CATALOG.length} atividades`,
      onSelect: () => { navigate(withReturnTo('/simulacao', returnTo)); onClose(); }
    },
    {
      id: 'nav-professor',
      title: 'Minhas Turmas & Diário de Classe',
      subtitle: 'Turmas, provas, notas e relatórios',
      category: 'Navegação',
      icon: Users,
      badge: 'Docente',
      onSelect: () => { navigate('/professor'); onClose(); }
    },
    {
      id: 'nav-estudante',
      title: 'Meu Aprendizado & Matrículas',
      subtitle: 'Minhas turmas, atividades e progresso',
      category: 'Navegação',
      icon: BookOpen,
      badge: 'Aluno',
      onSelect: () => { navigate('/estudante'); onClose(); }
    },
    {
      id: 'nav-enem',
      title: 'Simulado ENEM para praticar',
      subtitle: 'Questões, cronômetro e nota estimada',
      category: 'Navegação',
      icon: GraduationCap,
      onSelect: () => { navigate(withReturnTo('/enem', returnTo)); onClose(); }
    },
    {
      id: 'nav-coordenacao',
      title: 'Coordenação escolar',
      subtitle: 'Métricas de engajamento, retenção e taxas de sucesso',
      category: 'Navegação',
      icon: Building2,
      onSelect: () => { navigate('/coordenacao'); onClose(); }
    },
    {
      id: 'action-theme',
      title: theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro',
      subtitle: 'Alternar contraste e paleta visual da interface',
      category: 'Ações Rápidas',
      icon: theme === 'dark' ? Sun : Moon,
      onSelect: () => { onThemeToggle(); onClose(); }
    },
    {
      id: 'action-pricing',
      title: 'Conhecer planos (demonstração)',
      subtitle: 'Planos Estudante Pro, Escola Conectada e Campus Universitário',
      category: 'Ações Rápidas',
      icon: Sparkles,
      badge: 'Demonstração',
      onSelect: () => { onClose(); onOpenPricing(); }
    },
    {
      id: 'action-family',
      title: 'Portal da família (demonstração)',
      subtitle: 'Conheça a proposta de acompanhamento familiar',
      category: 'Ações Rápidas',
      icon: Heart,
      onSelect: () => { onClose(); onOpenParentBridge(); }
    }
  ].filter(action => {
    const paths: Record<string, string> = { 'nav-home': '/', 'nav-professor': '/professor', 'nav-estudante': '/estudante', 'nav-coordenacao': '/coordenacao' };
    return !paths[action.id] || canAccessPath(userData?.role, paths[action.id]);
  }) as PaletteAction[], [navigate, onClose, theme, onThemeToggle, onOpenPricing, onOpenParentBridge, userData?.role, returnTo]);

  // Dynamic search on masterLabsCatalog
  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return baseNavigationActions;
    }

    // Filter base actions
    const matchedBase = baseNavigationActions.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.subtitle.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );

    // Search labs using searchLabsCatalog (limit to top 15 matches for speed)
    const matchedLabs: PaletteAction[] = searchLearningLabs({ query: q }).slice(0, 15).map(lab => ({
      id: `lab-${lab.id}`,
      title: lab.title,
      subtitle: `${lab.subject} · ${learningLevelLabel(lab.academicLevel)}`,
      category: 'Laboratórios' as const,
      icon: Beaker,
      badge: learningLevelLabel(lab.academicLevel),
      onSelect: () => {
        navigate(withReturnTo(`/simulacao?lab=${encodeURIComponent(lab.id)}&level=${lab.academicLevel}`, returnTo));
        onClose();
      }
    }));

    return [...matchedBase, ...matchedLabs];
  }, [query, baseNavigationActions, navigate, onClose, returnTo]);

  // Keyboard navigation inside list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].onSelect();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12vh 1rem 2rem 1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar na plataforma"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--bg-card, #FAF7EE)',
          border: '1px solid var(--border-color, #E2D7C3)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh'
        }}
      >
        {/* Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color, #E2D7C3)',
            gap: '0.75rem',
            background: 'var(--bg-surface, #F1EAD9)'
          }}
        >
          <Search style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-primary, #E4683F)' }} />
          <input
            ref={inputRef}
            data-dialog-autofocus
            aria-label="Buscar páginas e laboratórios"
            id="command-palette-title"
            type="text"
            placeholder="Buscar laboratórios, turmas, páginas ou comandos... (ex: Pêndulo, Termodinâmica)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleInputKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-main, #172314)',
              fontWeight: 500
            }}
          />
          {query ? (
            <button
              aria-label="Limpar busca"
              onClick={() => { setQuery(''); setSelectedIndex(0); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #556B51)',
                padding: '0.2rem'
              }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.06)',
                color: 'var(--text-muted, #556B51)',
                fontWeight: 700
              }}
            >
              ESC para fechar
            </span>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            overflowY: 'auto',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          {filteredActions.length === 0 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: 'var(--text-muted, #556B51)',
                fontSize: '0.9rem'
              }}
            >
              Nenhum laboratório ou comando encontrado para <strong>"{query}"</strong>.
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = action.icon;
              return (
                <button type="button"
                  key={action.id}
                  onClick={() => action.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    textAlign: 'left', width: '100%', font: 'inherit',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: isSelected
                      ? 'var(--color-primary-light, rgba(228, 104, 63, 0.12))'
                      : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(228, 104, 63, 0.35)'
                      : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    color: isSelected
                      ? 'var(--color-primary-accessible, #B8441F)'
                      : 'var(--text-main, #172314)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '8px',
                        background: isSelected
                          ? 'var(--color-primary, #E4683F)'
                          : 'rgba(41, 62, 36, 0.08)',
                        color: isSelected ? '#ffffff' : 'var(--color-verde-700, #293E24)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon style={{ width: '1.1rem', height: '1.1rem' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {action.title}
                        </span>
                        {action.badge && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              background: 'rgba(228, 104, 63, 0.15)',
                              color: 'var(--color-primary-accessible, #B8441F)',
                              fontWeight: 800
                            }}
                          >
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          color: isSelected
                            ? 'var(--color-primary-accessible, #B8441F)'
                            : 'var(--text-muted, #556B51)',
                          display: 'block',
                          marginTop: '0.1rem'
                        }}
                      >
                        {action.subtitle}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isSelected && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--color-primary-accessible, #B8441F)'
                        }}
                      >
                        <CornerDownLeft style={{ width: '0.8rem', height: '0.8rem' }} /> Enter
                      </span>
                    )}
                    <ArrowRight
                      style={{
                        width: '0.9rem',
                        height: '0.9rem',
                        opacity: isSelected ? 1 : 0.25,
                        transform: isSelected ? 'translateX(2px)' : 'none',
                        transition: 'transform 0.15s ease'
                      }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderTop: '1px solid var(--border-color, #E2D7C3)',
            background: 'var(--bg-surface, #F1EAD9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: 'var(--text-muted, #556B51)',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span><kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)' }}>↑</kbd> <kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)' }}>↓</kbd> navegar</span>
            <span><kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)' }}>↵</kbd> selecionar</span>
            <span><kbd style={{ padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(0,0,0,0.06)' }}>esc</kbd> fechar</span>
          </div>
          <span style={{ fontWeight: 600 }}>Busca da plataforma</span>
        </div>
      </div>
    </div>
  );
}
