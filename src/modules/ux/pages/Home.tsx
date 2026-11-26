import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import {
  ArrowRight, Beaker, Trophy, BookOpen, Users,
  GraduationCap, Building2, FileText,
  MessageSquare, Compass, LayoutDashboard,
  LogIn, Award, BarChart3,
  BookMarked, PenTool, Accessibility, Type, Volume2, Keyboard, Eye,
  CheckCircle2, ChevronDown, Contrast, Moon
} from 'lucide-react';
import { LEARNING_LABS_CATALOG } from '../../core/constants/learningCatalog';
import './Home.css';
import { Logo } from '../components/Logo';
import { HomeNextStep } from '../components/HomeNextStep';
import { canAccessPath, getRoleHome, ROLE_LABELS, withReturnTo } from '../../core/utils/navigation';

export function InteractivePendulum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef<number>(Math.PI / 4); // 45 graus
  const velRef = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const length = 95;
    const gravity = 0.35;
    const damping = 0.994;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const pivotX = width / 2;
      const pivotY = 15;

      if (!isDragging.current) {
        const accel = (-gravity / length) * Math.sin(angleRef.current);
        velRef.current = (velRef.current + accel) * damping;
        angleRef.current += velRef.current;
      }

      const bobX = pivotX + length * Math.sin(angleRef.current);
      const bobY = pivotY + length * Math.cos(angleRef.current);

      // Fundo em malha geométrica sutil (Verde 700 em baixa opacidade)
      ctx.strokeStyle = 'rgba(41, 62, 36, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Linha do arco do pêndulo
      ctx.strokeStyle = 'rgba(41, 62, 36, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, length, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fio do pêndulo (Verde 700 oficial #293E24)
      ctx.beginPath();
      ctx.strokeStyle = '#293E24';
      ctx.lineWidth = 2;
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Ponto do pivô
      ctx.beginPath();
      ctx.fillStyle = '#293E24';
      ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Glow sutil do Bob (Laranja 500 #E4683F)
      ctx.beginPath();
      const radGlow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 18);
      radGlow.addColorStop(0, 'rgba(228, 104, 63, 0.5)');
      radGlow.addColorStop(0.3, 'rgba(228, 104, 63, 0.2)');
      radGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radGlow;
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Centro do Bob (Laranja Oficial #E4683F)
      ctx.beginPath();
      ctx.fillStyle = '#E4683F';
      ctx.arc(bobX, bobY, 7.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleMouseMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const pivotX = canvas.width / 2;
    const pivotY = 15;
    const dx = px - pivotX;
    const dy = py - pivotY;

    if (isDragging.current) {
      angleRef.current = Math.atan2(dx, dy);
      velRef.current = 0;
    } else {
      const length = 95;
      const bobX = pivotX + length * Math.sin(angleRef.current);
      const bobY = pivotY + length * Math.cos(angleRef.current);
      const dist = Math.hypot(px - bobX, py - bobY);
      if (dist < 22) {
        canvas.style.cursor = 'grab';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleMouseDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const pivotX = canvas.width / 2;
    const pivotY = 15;
    const length = 95;
    const bobX = pivotX + length * Math.sin(angleRef.current);
    const bobY = pivotY + length * Math.cos(angleRef.current);
    const dist = Math.hypot(px - bobX, py - bobY);

    if (dist < 25) {
      canvas.setPointerCapture(e.pointerId);
      isDragging.current = true;
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = 'grab';
  };

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={150}
      onPointerMove={handleMouseMove}
      onPointerDown={handleMouseDown}
      onPointerUp={handleMouseUp}
      onPointerCancel={handleMouseUp}
      tabIndex={0}
      aria-label="Pêndulo interativo. Arraste o peso ou use as setas esquerda e direita para mudar sua posição."
      onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();angleRef.current+=event.key==='ArrowLeft'?-.1:.1;velRef.current=0;}}}
      style={{
        width: '100%',
        touchAction: 'none',
        maxWidth: '300px',
        height: '140px',
        background: 'rgba(41, 62, 36, 0.04)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
      }}
    />
  );
}

interface HomeProps {
  onLoginOpen: () => void;
}

export function Home({ onLoginOpen }: HomeProps) {
  const { currentUser, userData } = useAuth();
  const isProfessor = userData?.role === 'professor';
  const isAdmin = userData?.role === 'admin';
  const isCoordinator = userData?.role === 'coordenador';
  const userName = userData?.name || currentUser?.displayName || (isProfessor ? 'Professor(a)' : 'Estudante');

  // Hub Navigation Cards com a paleta oficial da identidade visual (Verde, Laranja, Nude)
  const getHubCards = () => {
    if (isProfessor || isCoordinator) {
      return [
        {
          id: 'classes',
          title: 'Minhas turmas e mural',
          category: 'Gestão docente',
          description: 'Gerencie suas classes, compartilhe códigos de 6 dígitos para matrícula rápida e publique comunicados no mural.',
          href: '/professor?tab=classes',
          icon: Users,
          color: '#293E24',
          badgeText: 'Mural e código 6 dígitos',
          actionText: 'Acessar turmas'
        },
        {
          id: 'lesson_plans',
          title: 'Planos de aula e BNCC com IA',
          category: 'Planejamento pedagógico',
          description: 'Estruture o plano de estudos bimestral com alinhamento às competências da BNCC e sugestões adaptativas.',
          href: '/professor?tab=lesson_plans',
          icon: BookMarked,
          color: 'var(--color-primary-accessible, #A63D1B)',
          badgeText: 'Gerador IA + BNCC',
          actionText: 'Abrir planejamento'
        },
        {
          id: 'exams',
          title: 'Criador de provas e avaliações',
          category: 'Avaliação da aprendizagem',
          description: 'Elabore questionários somativos, acompanhe entregas e analise a taxa de acerto por questão para identificar lacunas.',
          href: '/professor?tab=exams',
          icon: FileText,
          color: '#E4683F',
          badgeText: 'Correção automática',
          actionText: 'Gerenciar provas'
        },
        {
          id: 'labs',
          title: 'Laboratórios virtuais e simuladores',
          category: 'Ambiente prático',
          description: 'Explore e ministre experimentos interativos de Física (Pêndulo, Colisões, Óptica, Termodinâmica) e Matemática.',
          href: '/simulacao',
          icon: Beaker,
          color: '#293E24',
          badgeText: 'Atividades por nível',
          actionText: 'Abrir simuladores'
        },
        {
          id: 'enem',
          title: 'Simulado ENEM para praticar',
          category: 'Preparação para o ENEM',
          description: 'Pratique com questões, acompanhe o tempo e consulte uma nota estimada para orientar seus estudos.',
          href: '/enem',
          icon: GraduationCap,
          color: '#172314',
          badgeText: 'Algoritmo TRI 3PL',
          actionText: 'Acessar simulado'
        },
        {
          id: 'coordenacao',
          title: 'Painel da coordenação e gestão',
          category: 'Coordenação institucional',
          description: 'Acompanhe entregas e relatórios reais das turmas vinculadas ao seu perfil de coordenação.',
          href: '/coordenacao',
          icon: Building2,
          color: '#293E24',
          badgeText: 'Turmas autorizadas',
          actionText: 'Abrir coordenação'
        },
        {
          id: 'forum',
          title: 'Fórum pedagógico e dúvidas',
          category: 'Comunidade escolar',
          description: 'Responda dúvidas enviadas pelos estudantes, promova discussões científicas e selecione a melhor resposta da turma.',
          href: '/professor?tab=lms_gradebook',
          icon: MessageSquare,
          color: 'var(--color-primary-accessible, #A63D1B)',
          badgeText: 'Moderação docente',
          actionText: 'Ver discussões'
        },
        {
          id: 'reports',
          title: 'Diagnósticos e relatórios da turma',
          category: 'Métricas de aprendizagem',
          description: 'Consulte taxas de conclusão, alunos que precisam de apoio e exporte históricos completos de desempenho.',
          href: '/professor?tab=reports',
          icon: BarChart3,
          color: '#293E24',
          badgeText: 'Exportação CSV',
          actionText: 'Ver relatórios'
        },
      ];
    }

    if (isAdmin) {
      return [
        {
          id: 'admin',
          title: 'Painel de administração global',
          category: 'Administração',
          description: 'Controle de acessos, logs de auditoria do sistema, parametrizações de segurança e governança.',
          href: '/admin',
          icon: LayoutDashboard,
          color: '#BC391F',
          badgeText: 'Acesso restrito',
          actionText: 'Abrir admin'
        },
        {
          id: 'coordenacao',
          title: 'Coordenação escolar',
          category: 'Institucional',
          description: 'Consulte relatórios reais e autorize quais turmas cada pessoa da coordenação acompanha.',
          href: '/coordenacao',
          icon: Building2,
          color: '#293E24',
          badgeText: 'Vínculos institucionais',
          actionText: 'Ver coordenação'
        },
        {
          id: 'labs',
          title: 'Laboratórios virtuais',
          category: 'Simulações',
          description: 'Visualizar e testar os módulos e laboratórios virtuais de Ciências e Matemática.',
          href: '/simulacao',
          icon: Beaker,
          color: '#E4683F',
          badgeText: 'Simuladores',
          actionText: 'Acessar labs'
        },
        {
          id: 'enem',
          title: 'Simulado ENEM TRI',
          category: 'Avaliação',
          description: 'Interface de testes e calibração estatística do simulado ENEM.',
          href: '/enem',
          icon: GraduationCap,
          color: '#172314',
          badgeText: 'Algoritmo TRI',
          actionText: 'Acessar ENEM'
        }
      ];
    }

    // Estudante
    return [
      {
        id: 'classes',
        title: 'Minha turma e mural de avisos',
        category: 'Área do aluno',
        description: 'Entre na sua turma usando o código de 6 dígitos, acompanhe recados importantes e materiais anexados pelo professor.',
        href: '/estudante?tab=classes',
        icon: Users,
        color: '#293E24',
        badgeText: 'Matrícula e mural',
        actionText: 'Entrar na turma'
      },
      {
        id: 'labs',
        title: 'Laboratórios virtuais e simuladores',
        category: 'Ciências e matemática',
        description: 'Faça experimentos reais de Física (Pêndulo, Forças, Óptica, Gases) e resolva desafios práticos de Matemática.',
        href: '/simulacao',
        icon: Beaker,
        color: '#E4683F',
        badgeText: 'Simulações interativas',
        actionText: 'Experimentar agora'
      },
      {
        id: 'enem',
        title: 'Simulado ENEM para praticar',
        category: 'Preparatório vestibular',
        description: 'Pratique com questões em 30 minutos e consulte uma nota estimada. O resultado serve para orientar seus estudos.',
        href: '/enem',
        icon: GraduationCap,
        color: '#172314',
        badgeText: 'Nota estimada',
        actionText: 'Fazer simulado'
      },
      {
        id: 'redacao',
        title: 'Atividades de redação',
        category: 'Produção textual',
        description: 'Pratique a construção de teses, a coesão do texto e a proposta de intervenção nas atividades de redação.',
        href: '/simulacao?level=medio&subject=Reda%C3%A7%C3%A3o+Dissertativa+Nota+1000',
        icon: PenTool,
        color: 'var(--color-primary-accessible, #A63D1B)',
        badgeText: 'Prática de escrita',
        actionText: 'Abrir atividades de redação'
      },
      {
        id: 'exams',
        title: 'Minhas provas e avaliações',
        category: 'Desafios e notas',
        description: 'Consulte e responda as avaliações formais aplicadas pelo seu professor com justificativa pedagógica e gabarito.',
        href: '/estudante?tab=exams',
        icon: FileText,
        color: '#E4683F',
        badgeText: 'Avaliações docentes',
        actionText: 'Ver provas'
      },
      {
        id: 'gamification',
        title: 'Conquistas e recompensas',
        category: 'Gamificação e evolução',
        description: 'Ganhe XP em cada atividade, suba de nível, desbloqueie badges científicos e troque suas moedas por avatares.',
        href: '/estudante?tab=gamification',
        icon: Trophy,
        color: 'var(--color-primary-accessible, #A63D1B)',
        badgeText: 'XP e conquistas',
        actionText: 'Acessar conquistas'
      },
      {
        id: 'forum',
        title: 'Fórum pedagógico da turma',
        category: 'Debates e dúvidas',
        description: 'Envie suas dúvidas para o professor, ajude colegas e concorra ao destaque de melhor resposta da turma.',
        href: '/estudante?tab=forum',
        icon: MessageSquare,
        color: '#293E24',
        badgeText: 'Dúvidas e respostas',
        actionText: 'Ir para o fórum'
      },
      {
        id: 'certificates',
        title: 'Certificados e histórico escolar',
        category: 'Progresso acadêmico',
        description: 'Consulte comprovantes de atividades e certificados emitidos pelo professor após a conferência dos requisitos.',
        href: '/estudante?tab=certificates',
        icon: Award,
        color: '#293E24',
        badgeText: 'Registros verificáveis',
        actionText: 'Ver certificados'
      }
    ];
  };

  const hubCards = getHubCards().filter(card => canAccessPath(userData?.role, card.href));

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', paddingBottom: '4rem' }}>
      {/* ─── CASO 1: USUÁRIO AUTENTICADO (HUB CENTRAL DE NAVEGAÇÃO) ─── */}
      {currentUser ? (
        <section style={{ maxWidth: '82rem', margin: '0 auto', padding: '2.5rem 1rem' }}>
          {/* Welcome Banner com 1px Nude 300 e sem sombras projetadas */}
          <div className="card" style={{
            padding: '2rem 2.25rem',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', minWidth: 0 }}>
              <div style={{
                width: '3.75rem',
                flexShrink: 0,
                height: '3.75rem',
                borderRadius: '12px',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-on-primary, #172314)',
                fontSize: '1.6rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)'
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span className={isProfessor ? 'badge badge-secondary' : isAdmin ? 'badge badge-error' : 'badge badge-primary'}>
                    {userData ? ROLE_LABELS[userData.role] : 'Minha conta'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Página inicial</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 700, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  Olá, {userName}! Para onde você deseja ir?
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  Acesse qualquer módulo da plataforma clicando nas opções abaixo ou retorne a esta tela a qualquer momento pelo menu.
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <Link
              to={getRoleHome(userData?.role)}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.6rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600
              }}
            >
              <LayoutDashboard style={{ width: '1.1rem', height: '1.1rem' }} />
              Ir para meu painel principal
              <ArrowRight style={{ width: '1.1rem', height: '1.1rem' }} />
            </Link>
          </div>

          {/* Section Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Compass style={{ width: '1.4rem', height: '1.4rem', color: 'var(--color-primary-accessible, #A63D1B)' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Opções de navegação da plataforma
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Selecione o módulo para iniciar seus estudos ou atividades pedagógicas
            </span>
          </div>

          <HomeNextStep />
          {/* Grid of Clickable Hub Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))',
            gap: '1.25rem',
            marginBottom: '3rem'
          }}>
            {hubCards.map((card) => {
              const Icon = card.icon;
              // Mapeia cores para tokens acessíveis tanto no tema claro quanto no escuro
              const accentColor = (() => {
                if (card.color === '#293E24' || card.color === '#172314') {
                  return 'var(--color-verde-700, #293E24)';
                }
                if (card.color === '#E4683F' || card.color === '#B8441F') {
                  return 'var(--color-primary-accessible, #E4683F)';
                }
                if (card.color === '#BC391F') {
                  return 'var(--color-danger, #BC391F)';
                }
                return card.color;
              })();

              return (
                <Link
                  key={card.id}
                  to={['/simulacao', '/enem'].includes(card.href.split('?')[0]) ? withReturnTo(card.href, '/') : card.href}
                  className="card card-interactive"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                >
                  <div>
                    {/* Card Top: Category and Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: accentColor,
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}>
                        {card.category}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        background: 'var(--color-verde-light, rgba(41, 62, 36, 0.08))',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)'
                      }}>
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Card Main: Icon and Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.8rem',
                        height: '2.8rem',
                        borderRadius: '10px',
                        background: 'var(--color-verde-light, rgba(41, 62, 36, 0.08))',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon style={{ width: '1.4rem', height: '1.4rem', color: accentColor }} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                        {card.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55, margin: '0 0 1.25rem' }}>
                      {card.description}
                    </p>
                  </div>

                  {/* Card Bottom: Action CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-color)'
                  }}>
                    <span style={{ color: accentColor, fontSize: '0.85rem', fontWeight: 600 }}>
                      {card.actionText}
                    </span>
                    <ArrowRight style={{ width: '1rem', height: '1rem', color: accentColor }} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Experimento Rápido Integrado */}
          <div className="card" style={{
            padding: '2rem',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Simulador em tempo real
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.35rem 0 0.75rem' }}>
                  Experimentação científica interativa
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Arraste o peso com o mouse ou toque para observar o movimento do pêndulo. Você também pode usar as setas do teclado.
                </p>
                <Link to="/simulacao" className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Beaker style={{ width: '1rem', height: '1rem' }} />
                  Abrir o catálogo de laboratórios
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <InteractivePendulum />
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ─── CASO 2: VISITANTE — landing page (padrão Product Demo + Features, UI UX Pro Max) ─── */
        <div className="landing">
          {/* 1. Hero com demonstração real do produto */}
          <section className="lp-hero" aria-labelledby="landing-title">
            <div className="lp-hero__bg" aria-hidden="true" />
            <div className="lp-container lp-hero__grid">
              <div className="lp-hero__copy">
                <p className="lp-pill">
                  <span className="lp-pill__dot" aria-hidden="true" />
                  Educação científica inclusiva · DUA + BNCC
                </p>
                <h1 id="landing-title" className="lp-hero__title">
                  Aprenda e ensine com atividades práticas
                </h1>
                <p className="lp-hero__lead">
                  Laboratórios virtuais, turmas, simulado ENEM e um tutor que faz perguntas em vez de dar respostas. Tudo no navegador, com acessibilidade desde o primeiro clique.
                </p>
                <div className="lp-hero__actions">
                  <button type="button" onClick={onLoginOpen} className="btn-primary lp-cta">
                    <LogIn size={20} aria-hidden="true" />
                    Entrar na plataforma
                    <ArrowRight size={20} aria-hidden="true" />
                  </button>
                  <Link to="/simulacao" className="btn-outline lp-cta">
                    <Beaker size={20} aria-hidden="true" />
                    Entrar e explorar laboratórios
                  </Link>
                </div>
                <ul className="lp-hero__trust" role="list">
                  <li><CheckCircle2 size={18} aria-hidden="true" /> Funciona no navegador</li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /> Guarda entregas sem internet</li>
                  <li><CheckCircle2 size={18} aria-hidden="true" /> <Link to="/enem">Testar simulado ENEM TRI</Link></li>
                </ul>
              </div>

              <div className="lp-demo">
                <div className="lp-demo__window">
                  <div className="lp-demo__bar" aria-hidden="true">
                    <span /><span /><span />
                    <p>Pêndulo simples · Física · Ensino Médio</p>
                  </div>
                  <div className="lp-demo__body">
                    <div className="lp-demo__stage">
                      <InteractivePendulum />
                      <p className="lp-demo__hint">Arraste o pêndulo e solte</p>
                    </div>
                    <div className="lp-demo__panel" aria-hidden="true">
                      <p className="lp-demo__label">Variáveis</p>
                      <div className="lp-demo__var"><span>Comprimento</span><b>1,2 m</b><i style={{ width: '60%' }} /></div>
                      <div className="lp-demo__var"><span>Gravidade</span><b>9,8 m/s²</b><i style={{ width: '75%' }} /></div>
                      <div className="lp-demo__var"><span>Massa</span><b>0,5 kg</b><i style={{ width: '35%' }} /></div>
                    </div>
                  </div>
                </div>
                <div className="lp-float lp-float--tutor" aria-hidden="true">
                  <span className="lp-float__icon"><MessageSquare size={18} /></span>
                  <div><b>Tutor socrático</b><span>E se você dobrar o comprimento, o período dobra também?</span></div>
                </div>
                <div className="lp-float lp-float--xp" aria-hidden="true">
                  <Trophy size={18} /> <b>+20 XP</b> experimento concluído
                </div>
              </div>
            </div>
          </section>

          {/* 2. Números reais do catálogo */}
          <section className="lp-metrics" aria-label="A plataforma em números">
            <dl className="lp-container lp-metrics__grid">
              <div><dt>Laboratórios virtuais</dt><dd>{LEARNING_LABS_CATALOG.length}</dd></div>
              <div><dt>Trilhas de estudo</dt><dd>{new Set(LEARNING_LABS_CATALOG.map(lab => lab.subjectId)).size}</dd></div>
              <div><dt>Níveis de ensino</dt><dd>{new Set(LEARNING_LABS_CATALOG.map(lab => lab.academicLevel)).size}</dd></div>
              <div><dt>Perfis de acesso</dt><dd>4</dd></div>
            </dl>
          </section>

          {/* 3. Recursos em grade bento */}
          <section id="recursos" className="lp-section" aria-labelledby="lp-features-title">
            <div className="lp-container">
              <header className="lp-section__head">
                <p className="lp-eyebrow">Recursos</p>
                <h2 id="lp-features-title" className="lp-section__title">Tudo o que uma turma precisa para aprender fazendo</h2>
                <p className="lp-section__lead">Da primeira pergunta à nota do simulado, cada ferramenta conversa com a outra.</p>
              </header>
              <ul className="lp-bento" role="list">
                <li className="lp-card lp-card--hero">
                  <span className="ei-icon-box ei-icon-box--accent" aria-hidden="true"><Beaker size={22} /></span>
                  <h3>Laboratórios virtuais</h3>
                  <p>Física, química, biologia, matemática e muito mais. O estudante manipula variáveis, formula hipóteses e registra o que observou no caderno de laboratório.</p>
                  <ul className="lp-chips" role="list" aria-label="Algumas disciplinas">
                    {['Física', 'Química', 'Biologia', 'Matemática', 'Geografia', 'História', 'Português', 'Idiomas'].map(subject => <li key={subject}>{subject}</li>)}
                  </ul>
                  <Link to="/simulacao" className="lp-link">Ver catálogo completo <ArrowRight size={18} aria-hidden="true" /></Link>
                </li>
                <li className="lp-card">
                  <span className="ei-icon-box" aria-hidden="true"><MessageSquare size={22} /></span>
                  <h3>Tutor socrático</h3>
                  <p>Em vez de entregar a resposta, faz perguntas que levam o estudante à própria conclusão.</p>
                </li>
                <li className="lp-card">
                  <span className="ei-icon-box" aria-hidden="true"><GraduationCap size={22} /></span>
                  <h3>Simulado ENEM</h3>
                  <p>Treino com nota estimada por um modelo inspirado na TRI, para orientar os estudos.</p>
                </li>
                <li className="lp-card">
                  <span className="ei-icon-box" aria-hidden="true"><Users size={22} /></span>
                  <h3>Turmas e mural</h3>
                  <p>Código de acesso, avisos, materiais, plano de aulas e dúvidas num só lugar.</p>
                </li>
                <li className="lp-card">
                  <span className="ei-icon-box" aria-hidden="true"><BarChart3 size={22} /></span>
                  <h3>Relatórios de aprendizagem</h3>
                  <p>Entregas, critérios e sinais de apoio para planejar a retomada com cada estudante.</p>
                </li>
                <li className="lp-card lp-card--wide">
                  <span className="ei-icon-box ei-icon-box--accent" aria-hidden="true"><Award size={22} /></span>
                  <div>
                    <h3>Conquistas que valorizam o processo</h3>
                    <p>XP, moedas e certificados reconhecem experimentos concluídos — sem transformar a aprendizagem em competição.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 4. Como funciona: Ciclo CSFA */}
          <section id="como-funciona" className="lp-section lp-section--dark" aria-labelledby="lp-how-title">
            <svg className="lp-pattern brand-circuit" viewBox="0 0 620 80" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M0 40c30-24 60-24 90 0s60 24 90 0h60l40 30c40-40 90-40 130 0s70 20 90-30h60l30 20" />
              <circle cx="90" cy="40" r="4" fill="currentColor" /><circle cx="240" cy="40" r="4" fill="currentColor" /><circle cx="560" cy="40" r="4" fill="currentColor" />
            </svg>
            <div className="lp-container">
              <header className="lp-section__head">
                <p className="lp-eyebrow lp-eyebrow--light">Como funciona</p>
                <h2 id="lp-how-title" className="lp-section__title">O Ciclo CSFA: três nós, como no nosso símbolo</h2>
                <p className="lp-section__lead">Uma metodologia que une Sócrates, Aristóteles, Freire e o Desenho Universal para a Aprendizagem.</p>
              </header>
              <ol className="lp-steps">
                {[
                  { n: '01', title: 'Provocação', text: 'Uma pergunta real abre o tema e desperta a curiosidade antes de qualquer fórmula.', icon: Compass },
                  { n: '02', title: 'Experimentação', text: 'No laboratório virtual, o estudante muda variáveis, observa e testa as próprias hipóteses.', icon: Beaker },
                  { n: '03', title: 'Maiêutica', text: 'O tutor e o professor fazem perguntas que conduzem à conclusão — construída, não decorada.', icon: MessageSquare },
                ].map(step => (
                  <li key={step.n} className="lp-step">
                    <span className="lp-step__node" aria-hidden="true" />
                    <span className="lp-step__n" aria-hidden="true">{step.n}</span>
                    <step.icon size={24} aria-hidden="true" className="lp-step__icon" />
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* 5. Para quem */}
          <section id="para-quem" className="lp-section" aria-labelledby="landing-areas-title">
            <div className="lp-container">
              <header className="lp-section__head">
                <p className="lp-eyebrow">Para quem</p>
                <h2 id="landing-areas-title" className="lp-section__title">Conheça os ambientes da plataforma</h2>
                <p className="lp-section__lead">Cada perfil tem um espaço próprio, com as ferramentas certas para estudar, ensinar e acompanhar.</p>
              </header>
              <ul className="lp-audience" role="list">
                {[
                  { to: '/estudante', icon: BookOpen, title: 'Área do estudante', points: ['Atividades e avisos da turma', 'Laboratórios do seu nível', 'Simulado ENEM e conquistas'] },
                  { to: '/professor', icon: Users, title: 'Área do professor', points: ['Turmas com código de acesso', 'Planos de aula alinhados à BNCC', 'Avaliações com correção automática'] },
                  { to: '/coordenacao', icon: Building2, title: 'Área da coordenação', points: ['Turmas vinculadas ao seu perfil', 'Entregas e critérios reais', 'Relatórios exportáveis'] },
                  { to: '/simulacao', icon: Beaker, title: 'Laboratórios virtuais', points: ['Catálogo por nível e disciplina', 'Caderno de laboratório', 'Atividades guiadas passo a passo'] },
                ].map(({ to, icon: Icon, title, points }) => (
                  <li key={to}>
                    <Link to={to} className="lp-audience__card card card-interactive">
                      <span className="ei-icon-box ei-icon-box--accent" aria-hidden="true"><Icon size={22} /></span>
                      <h3>{title}</h3>
                      <ul role="list">
                        {points.map(point => <li key={point}><CheckCircle2 size={16} aria-hidden="true" />{point}</li>)}
                      </ul>
                      <span className="lp-link" aria-hidden="true">Acessar <ArrowRight size={18} /></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 6. Acessibilidade como pilar */}
          <section id="acessibilidade" className="lp-section lp-section--paper" aria-labelledby="landing-a11y-title">
            <div className="lp-container lp-a11y">
              <div>
                <p className="lp-eyebrow"><Accessibility size={16} aria-hidden="true" /> Desenho Universal para a Aprendizagem</p>
                <h2 id="landing-a11y-title" className="lp-section__title">Acessível desde o primeiro clique</h2>
                <p className="lp-section__lead">
                  Ajuste a plataforma ao seu jeito de ler e aprender pelo botão <strong>Opções de acessibilidade</strong>, no topo da página. Suas escolhas ficam salvas neste navegador.
                </p>
              </div>
              <ul className="lp-a11y__grid" role="list">
                {[
                  { icon: Type, title: 'Texto do seu tamanho', text: 'Até 130%, fonte de leitura facilitada e espaçamento ampliado.' },
                  { icon: Volume2, title: 'Leitura em voz alta', text: 'Ouça a página inteira ou só o trecho selecionado.' },
                  { icon: Keyboard, title: 'Tudo pelo teclado', text: 'Foco sempre visível e busca rápida com Ctrl+K.' },
                  { icon: Eye, title: 'Menos distrações', text: 'Remove animações para quem precisa de calma visual.' },
                  { icon: Contrast, title: 'Alto contraste', text: 'Textos de apoio e contornos reforçados.' },
                  { icon: Moon, title: 'Tema claro ou escuro', text: 'Segue a preferência do seu sistema.' },
                ].map(({ icon: Icon, title, text }) => (
                  <li key={title}>
                    <span className="ei-icon-box" aria-hidden="true"><Icon size={20} /></span>
                    <div><strong>{title}</strong><span>{text}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 7. Perguntas frequentes */}
          <section id="perguntas" className="lp-section" aria-labelledby="lp-faq-title">
            <div className="lp-container lp-faq">
              <header className="lp-section__head">
                <p className="lp-eyebrow">Perguntas</p>
                <h2 id="lp-faq-title" className="lp-section__title">Perguntas frequentes</h2>
              </header>
              <div className="lp-faq__list">
                {[
                  { q: 'Preciso instalar alguma coisa?', a: 'Não. A plataforma funciona no navegador do computador, tablet ou celular. Os laboratórios rodam direto na página.' },
                  { q: 'Quem pode usar?', a: 'Estudantes, professores e coordenação, cada um com seu próprio perfil e painel. As famílias acompanham pelo Portal da família, com o convite enviado pela escola.' },
                  { q: 'A nota do simulado ENEM é oficial?', a: 'Não. O treino usa um modelo próprio inspirado na TRI para orientar os estudos. Ele não substitui a nota oficial do INEP.' },
                  { q: 'E se a internet cair durante uma atividade?', a: 'As entregas ficam guardadas neste dispositivo e são enviadas quando a conexão voltar. O selo no topo mostra o que ainda aguarda envio.' },
                  { q: 'Como os dados dos estudantes são tratados?', a: 'Cada perfil vê apenas o que lhe foi autorizado. Consulte a página Privacidade e seus dados para detalhes e solicitações.' },
                ].map(item => (
                  <details key={item.q} className="lp-faq__item">
                    <summary>{item.q}<ChevronDown size={20} aria-hidden="true" /></summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* 8. Chamada final */}
          <section className="lp-final" aria-labelledby="lp-final-title">
            <div className="lp-container lp-final__box">
              <Logo variant="symbol-only" symbolSize={56} colorMode="negative" />
              <h2 id="lp-final-title">Raiz e circuito, sempre juntos.</h2>
              <p>Comece agora: entre com seu perfil ou explore os laboratórios.</p>
              <div className="lp-hero__actions" style={{ justifyContent: 'center' }}>
                <button type="button" onClick={onLoginOpen} className="btn-primary lp-cta">Começar agora <ArrowRight size={20} aria-hidden="true" /></button>
                <Link to="/simulacao" className="btn-secondary btn-on-dark lp-cta"><Beaker size={20} aria-hidden="true" /> Explorar laboratórios</Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Home;
