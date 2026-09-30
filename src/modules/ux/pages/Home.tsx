import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import {
  ArrowRight, Beaker, Trophy, BookOpen, Users,
  GraduationCap, Building2, Sparkles, FileText,
  MessageSquare, Compass, LayoutDashboard,
  LogIn, Award, BarChart3,
  BookMarked, PenTool
} from 'lucide-react';
import { Logo } from '../components/Logo';

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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100%',
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
  const userName = userData?.name || currentUser?.displayName || (isProfessor ? 'Professor(a)' : 'Estudante');

  // Hub Navigation Cards com a paleta oficial da identidade visual (Verde, Laranja, Nude)
  const getHubCards = () => {
    if (isProfessor) {
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
          color: '#B8441F',
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
          badgeText: '6 Laboratórios ativos',
          actionText: 'Abrir simuladores'
        },
        {
          id: 'enem',
          title: 'Simulado oficial ENEM (TRI)',
          category: 'Avaliação oficial',
          description: 'Acesse o banco de questões calibrado do ENEM com régua de proficiência TRI oficial e cronômetro de aplicação.',
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
          description: 'Radar preventivo de evasão escolar, importação de turmas em massa via CSV e relatórios consolidados da escola.',
          href: '/coordenacao',
          icon: Building2,
          color: '#293E24',
          badgeText: 'Radar de evasão + CSV',
          actionText: 'Abrir coordenação'
        },
        {
          id: 'forum',
          title: 'Fórum pedagógico e dúvidas',
          category: 'Comunidade escolar',
          description: 'Responda dúvidas enviadas pelos estudantes, promova discussões científicas e selecione a melhor resposta da turma.',
          href: '/professor?tab=lms_gradebook',
          icon: MessageSquare,
          color: '#B8441F',
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
          description: 'Importação de alunos, monitoramento de evasão e relatórios educacionais.',
          href: '/coordenacao',
          icon: Building2,
          color: '#293E24',
          badgeText: 'Visão escolar',
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
        title: 'Simulado oficial ENEM (TRI)',
        category: 'Preparatório vestibular',
        description: 'Treine com itens oficiais do ENEM com cronômetro real de 30 minutos e veja sua nota TRI calculada na hora.',
        href: '/enem',
        icon: GraduationCap,
        color: '#172314',
        badgeText: 'Nota TRI oficial',
        actionText: 'Fazer simulado'
      },
      {
        id: 'redacao',
        title: 'Laboratório de redação com IA',
        category: 'Produção textual',
        description: 'Escreva dissertações temáticas com tema gerador e receba nota e comentários imediatos nas 5 competências do ENEM.',
        href: '/estudante?tab=labs',
        icon: PenTool,
        color: '#B8441F',
        badgeText: 'Correção IA C1-C5',
        actionText: 'Escrever redação'
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
        color: '#B8441F',
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
        description: 'Emita seu certificado formal de conclusão com carga horária e consulte o histórico de notas e experimentos realizados.',
        href: '/estudante?tab=certificates',
        icon: Award,
        color: '#293E24',
        badgeText: 'Emissão de certificado',
        actionText: 'Ver certificados'
      }
    ];
  };

  const hubCards = getHubCards();

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '3.75rem',
                height: '3.75rem',
                borderRadius: '12px',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '1.6rem',
                fontWeight: 700,
                fontFamily: 'var(--font-display)'
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span className={isProfessor ? 'badge badge-secondary' : isAdmin ? 'badge badge-error' : 'badge badge-primary'}>
                    {isProfessor ? 'Painel do professor' : isAdmin ? 'Administrador' : 'Painel do estudante'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Hub central de navegação</span>
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
              to={isProfessor ? '/professor' : isAdmin ? '/admin' : '/estudante'}
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
              <Compass style={{ width: '1.4rem', height: '1.4rem', color: 'var(--color-primary-accessible, #B8441F)' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Opções de navegação da plataforma
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Selecione o módulo para iniciar seus estudos ou atividades pedagógicas
            </span>
          </div>

          {/* Grid of Clickable Hub Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
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
                  to={card.href}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  Simulador em tempo real
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.35rem 0 0.75rem' }}>
                  Experimentação científica interativa
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Arraste o pêndulo ao lado com o mouse ou toque para conferir a precisão da física newtoniana na nossa plataforma.
                </p>
                <Link to="/simulacao" className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Beaker style={{ width: '1rem', height: '1rem' }} />
                  Abrir todos os 6 laboratórios virtuais
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
        /* ─── CASO 2: VISITANTE (LANDING PAGE COM IDENTIDADE VISUAL EDU-INTERACT) ─── */
        <>
          {/* Hero Section */}
          <section className="bg-circuit-root" style={{ position: 'relative', overflow: 'hidden', padding: '4.5rem 1rem 3rem' }}>
            <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.95rem', borderRadius: '10px', background: 'rgba(228,104,63,0.1)', border: '1px solid rgba(184,68,31,0.25)', color: 'var(--color-primary-accessible, #B8441F)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                <Sparkles style={{ width: '0.9rem', height: '0.9rem' }} />
                Onde a raiz encontra o circuito • Educação científica inclusiva
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <Logo symbolSize={44} showTagline={false} />
              </div>

              <p style={{
                fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
                color: 'var(--text-secondary)',
                maxWidth: '46rem', margin: '0 auto 2.25rem',
                lineHeight: 1.65,
                fontFamily: 'var(--font-body)'
              }}>
                Uma plataforma educacional que une o rigor da tecnologia à calidez do olhar humano. Laboratórios virtuais, simulador oficial do ENEM com correção TRI e metodologias ativas baseadas em Sócrates, Aristóteles e Freire.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
                <button
                  onClick={onLoginOpen}
                  className="btn-primary"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <LogIn style={{ width: '1.15rem', height: '1.15rem' }} />
                  Entrar na plataforma
                  <ArrowRight style={{ width: '1.15rem', height: '1.15rem' }} />
                </button>
                <Link
                  to="/simulacao"
                  className="btn-secondary"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Beaker style={{ width: '1.15rem', height: '1.15rem' }} />
                  Explorar laboratórios virtuais
                </Link>
                <Link
                  to="/enem"
                  className="btn-outline"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <GraduationCap style={{ width: '1.15rem', height: '1.15rem' }} />
                  Testar simulado ENEM TRI
                </Link>
              </div>

              {/* Hub Preview for Visitors */}
              <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  Conheça os ambientes da plataforma
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  <div
                    onClick={onLoginOpen}
                    className="card card-interactive"
                    style={{ padding: '1.5rem', borderRadius: '14px', cursor: 'pointer' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'rgba(41, 62, 36, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <Users style={{ width: '1.3rem', height: '1.3rem', color: 'var(--color-verde-700)' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Área do professor</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.55 }}>
                      Criação de turmas com código de 6 dígitos, planos de aula BNCC com IA e avaliações com correção automática.
                    </p>
                  </div>

                  <div
                    onClick={onLoginOpen}
                    className="card card-interactive"
                    style={{ padding: '1.5rem', borderRadius: '14px', cursor: 'pointer' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'rgba(228, 104, 63, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <BookOpen style={{ width: '1.3rem', height: '1.3rem', color: 'var(--color-primary-accessible, #B8441F)' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Área do estudante</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.55 }}>
                      Mural da turma, roteiros de laboratórios práticos, simulado ENEM oficial, gamificação com XP e loja de avatares.
                    </p>
                  </div>

                  <Link
                    to="/simulacao"
                    className="card card-interactive"
                    style={{ padding: '1.5rem', borderRadius: '14px', textDecoration: 'none' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'rgba(41, 62, 36, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <Beaker style={{ width: '1.3rem', height: '1.3rem', color: 'var(--color-verde-700)' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Laboratórios virtuais</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.55 }}>
                      Experimentos interativos de mecânica, gravitação, óptica, termodinâmica, eletromagnetismo e matemática prática.
                    </p>
                  </Link>

                  <Link
                    to="/enem"
                    className="card card-interactive"
                    style={{ padding: '1.5rem', borderRadius: '14px', textDecoration: 'none' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10px', background: 'rgba(23, 35, 20, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <GraduationCap style={{ width: '1.3rem', height: '1.3rem', color: 'var(--color-verde-900)' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Simulado oficial ENEM</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.55 }}>
                      Algoritmo estatístico TRI oficial do INEP avaliando a coerência pedagógica das respostas em tempo real.
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Preview Card with Pendulum */}
          <section style={{ padding: '2rem 1rem 4rem' }}>
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
              <div className="card" style={{
                padding: '2rem',
                borderRadius: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem', alignItems: 'center',
                }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                      Demonstração interativa
                    </span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.35rem 0 1rem' }}>
                      Sinta a física em tempo real
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.65 }}>
                      Puxe e solte o pêndulo para testar a conservação de energia e a física newtoniana diretamente no seu navegador.
                    </p>
                    <Link to="/simulacao" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      color: 'var(--color-primary-accessible, #B8441F)', textDecoration: 'none', fontWeight: 700,
                    }}>
                      Acessar todos os laboratórios completos
                      <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                    </Link>
                  </div>
                  <div style={{
                    height: '12rem', borderRadius: '10px',
                    background: 'rgba(41, 62, 36, 0.03)',
                    border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '1rem',
                    boxSizing: 'border-box'
                  }}>
                    <InteractivePendulum />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
