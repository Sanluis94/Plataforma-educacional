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
    const damping = 0.994; // Resistência leve

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

      // Fundo em malha tecnológica
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
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
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, length, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fio do pêndulo
      ctx.beginPath();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // Ponto do pivô
      ctx.beginPath();
      ctx.fillStyle = '#8b5cf6';
      ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Glow do Bob
      ctx.beginPath();
      const radGlow = ctx.createRadialGradient(bobX, bobY, 0, bobX, bobY, 18);
      radGlow.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
      radGlow.addColorStop(0.3, 'rgba(6, 182, 212, 0.3)');
      radGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = radGlow;
      ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Centro do Bob
      ctx.beginPath();
      ctx.fillStyle = '#8b5cf6';
      ctx.arc(bobX, bobY, 7, 0, Math.PI * 2);
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
        background: 'rgba(0,0,0,0.15)',
        borderRadius: '8px',
        border: '1px solid rgba(6, 182, 212, 0.15)',
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

  // Hub Navigation Cards for Authenticated Users
  const getHubCards = () => {
    if (isProfessor) {
      return [
        {
          id: 'classes',
          title: 'Minhas Turmas & Mural',
          category: 'Gestão Docente',
          description: 'Gerencie suas classes, compartilhe códigos de 6 dígitos para matrícula rápida e publique comunicados no mural.',
          href: '/professor?tab=classes',
          icon: Users,
          color: '#06b6d4',
          bgGradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.03) 100%)',
          badgeText: 'Mural & Código 6 Dígitos',
          actionText: 'Acessar Turmas'
        },
        {
          id: 'lesson_plans',
          title: 'Planos de Aula & BNCC com IA',
          category: 'Planejamento Pedagógico',
          description: 'Estruture o plano de estudos bimestral com alinhamento às competências da BNCC e gere sugestões com IA Gemini.',
          href: '/professor?tab=lesson_plans',
          icon: BookMarked,
          color: '#8b5cf6',
          bgGradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.03) 100%)',
          badgeText: 'Gerador IA + BNCC',
          actionText: 'Abrir Planejamento'
        },
        {
          id: 'exams',
          title: 'Criador de Provas & Avaliações',
          category: 'Avaliação da Aprendizagem',
          description: 'Elabore questionários somativos, acompanhe entregas e analise a taxa de acerto por questão para identificar lacunas.',
          href: '/professor?tab=exams',
          icon: FileText,
          color: '#f59e0b',
          bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.03) 100%)',
          badgeText: 'Correção Automática',
          actionText: 'Gerenciar Provas'
        },
        {
          id: 'labs',
          title: 'Laboratórios Virtuais & Simuladores',
          category: 'Ambiente Prático',
          description: 'Explore e ministre experimentos interativos de Física (Pêndulo, Colisões, Óptica, Termodinâmica) e Matemática.',
          href: '/simulacao',
          icon: Beaker,
          color: '#10b981',
          bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.03) 100%)',
          badgeText: '6 Laboratórios Ativos',
          actionText: 'Abrir Simuladores'
        },
        {
          id: 'enem',
          title: 'Simulado Oficial ENEM (TRI)',
          category: 'Avaliação Oficial',
          description: 'Acesse o banco de questões calibrado do ENEM com régua de proficiência TRI oficial e cronômetro de aplicação.',
          href: '/enem',
          icon: GraduationCap,
          color: '#3b82f6',
          bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.03) 100%)',
          badgeText: 'Algoritmo TRI 3PL',
          actionText: 'Acessar Simulado'
        },
        {
          id: 'coordenacao',
          title: 'Painel da Coordenação & Gestão',
          category: 'Coordenação Institucional',
          description: 'Radar preventivo de evasão escolar, importação de turmas em massa via CSV e relatórios consolidados da escola.',
          href: '/coordenacao',
          icon: Building2,
          color: '#ec4899',
          bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.03) 100%)',
          badgeText: 'Radar de Evasão + CSV',
          actionText: 'Abrir Coordenação'
        },
        {
          id: 'forum',
          title: 'Fórum Pedagógico & Dúvidas',
          category: 'Comunidade Escolar',
          description: 'Responda dúvidas enviadas pelos estudantes, promova discussões científicas e selecione a melhor resposta da turma.',
          href: '/professor?tab=lms_gradebook',
          icon: MessageSquare,
          color: '#a855f7',
          bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.03) 100%)',
          badgeText: 'Moderação Docente',
          actionText: 'Ver Discussões'
        },
        {
          id: 'reports',
          title: 'Diagnósticos & Relatórios da Turma',
          category: 'Métricas de Aprendizagem',
          description: 'Consulte taxas de conclusão, alunos que precisam de apoio e exporte históricos completos de desempenho.',
          href: '/professor?tab=reports',
          icon: BarChart3,
          color: '#14b8a6',
          bgGradient: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.03) 100%)',
          badgeText: 'Exportação CSV',
          actionText: 'Ver Relatórios'
        },
      ];
    }

    if (isAdmin) {
      return [
        {
          id: 'admin',
          title: 'Painel de Administração Global',
          category: 'Administração',
          description: 'Controle de acessos, logs de auditoria do sistema, parametrizações de segurança e governança.',
          href: '/admin',
          icon: LayoutDashboard,
          color: '#ef4444',
          bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.03) 100%)',
          badgeText: 'Acesso Restrito',
          actionText: 'Abrir Admin'
        },
        {
          id: 'coordenacao',
          title: 'Coordenação Escolar',
          category: 'Institucional',
          description: 'Importação de alunos, monitoramento de evasão e relatórios educacionais.',
          href: '/coordenacao',
          icon: Building2,
          color: '#ec4899',
          bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.03) 100%)',
          badgeText: 'Visão Escolar',
          actionText: 'Ver Coordenação'
        },
        {
          id: 'labs',
          title: 'Laboratórios Virtuais',
          category: 'Simulações',
          description: 'Visualizar e testar os módulos e laboratórios virtuais de Ciências e Matemática.',
          href: '/simulacao',
          icon: Beaker,
          color: '#10b981',
          bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.03) 100%)',
          badgeText: 'Simuladores',
          actionText: 'Acessar Labs'
        },
        {
          id: 'enem',
          title: 'Simulado ENEM TRI',
          category: 'Avaliação',
          description: 'Interface de testes e calibração estatística do simulado ENEM.',
          href: '/enem',
          icon: GraduationCap,
          color: '#3b82f6',
          bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.03) 100%)',
          badgeText: 'Algoritmo TRI',
          actionText: 'Acessar ENEM'
        }
      ];
    }

    // Estudante
    return [
      {
        id: 'classes',
        title: 'Minha Turma & Mural de Avisos',
        category: 'Área do Aluno',
        description: 'Entre na sua turma usando o código de 6 dígitos, acompanhe recados importantes e materiais anexados pelo professor.',
        href: '/estudante?tab=classes',
        icon: Users,
        color: '#06b6d4',
        bgGradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.03) 100%)',
        badgeText: 'Matrícula & Mural',
        actionText: 'Entrar na Turma'
      },
      {
        id: 'labs',
        title: 'Laboratórios Virtuais & Simuladores',
        category: 'Ciências & Matemática',
        description: 'Faça experimentos reais de Física (Pêndulo, Forças, Óptica, Gases) e resolva desafios práticos de Matemática.',
        href: '/simulacao',
        icon: Beaker,
        color: '#10b981',
        bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.03) 100%)',
        badgeText: 'Simulações Interativas',
        actionText: 'Experimentar Agora'
      },
      {
        id: 'enem',
        title: 'Simulado Oficial ENEM (TRI)',
        category: 'Preparatório Vestibular',
        description: 'Treine com itens oficiais do ENEM com cronômetro real de 30 minutos e veja sua nota TRI calculada na hora.',
        href: '/enem',
        icon: GraduationCap,
        color: '#3b82f6',
        bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.03) 100%)',
        badgeText: 'Nota TRI Oficial',
        actionText: 'Fazer Simulado'
      },
      {
        id: 'redacao',
        title: 'Laboratório de Redação com IA',
        category: 'Produção Textual',
        description: 'Escreva dissertações temáticas com tema gerador e receba nota e comentários imediatos nas 5 competências do ENEM.',
        href: '/estudante?tab=labs',
        icon: PenTool,
        color: '#8b5cf6',
        bgGradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.03) 100%)',
        badgeText: 'Correção IA C1-C5',
        actionText: 'Escrever Redação'
      },
      {
        id: 'exams',
        title: 'Minhas Provas & Avaliações',
        category: 'Desafios & Notas',
        description: 'Consulte e responda as avaliações formais aplicadas pelo seu professor com justificativa pedagógica e gabarito.',
        href: '/estudante?tab=exams',
        icon: FileText,
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.03) 100%)',
        badgeText: 'Avaliações Docentes',
        actionText: 'Ver Provas'
      },
      {
        id: 'gamification',
        title: 'Conquistas & Loja de Recompensas',
        category: 'Gamificação & Recompensas',
        description: 'Ganhe XP em cada atividade, suba de nível, desbloqueie badges científicos e troque suas moedas por avatares na loja.',
        href: '/estudante?tab=gamification',
        icon: Trophy,
        color: '#eab308',
        bgGradient: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(234,179,8,0.03) 100%)',
        badgeText: 'XP & Moedas',
        actionText: 'Acessar Loja'
      },
      {
        id: 'forum',
        title: 'Fórum Pedagógico da Turma',
        category: 'Debates & Dúvidas',
        description: 'Envie suas dúvidas para o professor, ajude colegas e concorra ao destaque de melhor resposta da turma.',
        href: '/estudante?tab=forum',
        icon: MessageSquare,
        color: '#ec4899',
        bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.03) 100%)',
        badgeText: 'Dúvidas & Respostas',
        actionText: 'Ir para o Fórum'
      },
      {
        id: 'certificates',
        title: 'Certificados & Histórico Escolar',
        category: 'Progresso Acadêmico',
        description: 'Emita seu certificado formal de conclusão com carga horária e consulte o histórico de notas e experimentos realizados.',
        href: '/estudante?tab=certificates',
        icon: Award,
        color: '#14b8a6',
        bgGradient: 'linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.03) 100%)',
        badgeText: 'Emissão de Certificado',
        actionText: 'Ver Certificados'
      }
    ];
  };

  const hubCards = getHubCards();

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', paddingBottom: '4rem' }}>
      {/* ─── CASO 1: USUÁRIO AUTENTICADO (HUB CENTRAL DE NAVEGAÇÃO) ─── */}
      {currentUser ? (
        <section style={{ maxWidth: '82rem', margin: '0 auto', padding: '2.5rem 1rem' }}>
          {/* Welcome Banner */}
          <div className="glass-card" style={{
            padding: '2rem 2.25rem',
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(6,182,212,0.3)',
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
                borderRadius: '1rem',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.6rem',
                fontWeight: 800,
                boxShadow: '0 8px 24px rgba(6,182,212,0.35)'
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    background: isProfessor ? 'rgba(6,182,212,0.2)' : isAdmin ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    color: isProfessor ? '#06b6d4' : isAdmin ? '#ef4444' : '#10b981',
                    border: `1px solid ${isProfessor ? 'rgba(6,182,212,0.4)' : isAdmin ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`
                  }}>
                    {isProfessor ? '👨‍🏫 Painel do Professor' : isAdmin ? '🛡️ Administrador' : '🎓 Painel do Estudante'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• Hub Central de Navegação</span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  Olá, {userName}! Para onde você deseja ir?
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  Acesse qualquer módulo da plataforma clicando nas opções abaixo ou retorne a esta tela a qualquer momento pelo menu.
                </p>
              </div>
            </div>

            {/* Quick Action Button to primary profile */}
            <Link
              to={isProfessor ? '/professor' : isAdmin ? '/admin' : '/estudante'}
              className="btn-gradient"
              style={{
                padding: '0.75rem 1.6rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700
              }}
            >
              <LayoutDashboard style={{ width: '1.1rem', height: '1.1rem' }} />
              Ir para meu Painel Principal
              <ArrowRight style={{ width: '1.1rem', height: '1.1rem' }} />
            </Link>
          </div>

          {/* Section Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Compass style={{ width: '1.4rem', height: '1.4rem', color: '#06b6d4' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Opções de Navegação da Plataforma
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
              return (
                <Link
                  key={card.id}
                  to={card.href}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    background: card.bgGradient,
                    border: `1px solid ${card.color}33`,
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.25s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 30px ${card.color}25`;
                    e.currentTarget.style.borderColor = `${card.color}88`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = `${card.color}33`;
                  }}
                >
                  <div>
                    {/* Card Top: Category and Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: card.color
                      }}>
                        {card.category}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        background: `${card.color}15`,
                        color: card.color,
                        border: `1px solid ${card.color}33`
                      }}>
                        {card.badgeText}
                      </span>
                    </div>

                    {/* Card Main: Icon and Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '2.8rem',
                        height: '2.8rem',
                        borderRadius: '0.75rem',
                        background: `${card.color}22`,
                        border: `1px solid ${card.color}44`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon style={{ width: '1.4rem', height: '1.4rem', color: card.color }} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                        {card.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                      {card.description}
                    </p>
                  </div>

                  {/* Card Bottom: Action CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ color: card.color, fontSize: '0.85rem', fontWeight: 700 }}>
                      {card.actionText}
                    </span>
                    <div style={{
                      width: '1.8rem',
                      height: '1.8rem',
                      borderRadius: '50%',
                      background: `${card.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ArrowRight style={{ width: '0.95rem', height: '0.95rem', color: card.color }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Experimento Rápido Integrado */}
          <div className="glass-card" style={{
            padding: '2rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(139,92,246,0.05) 100%)',
            border: '1px solid rgba(139,92,246,0.2)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                  Simulador em Tempo Real
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0 0.75rem' }}>
                  Experimentação Científica Interativa
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  Arraste o pêndulo ao lado com o mouse ou toque para conferir a precisão da física newtoniana na nossa plataforma.
                </p>
                <Link to="/simulacao" className="btn-gradient" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Beaker style={{ width: '1rem', height: '1rem' }} />
                  Abrir Todos os 6 Laboratórios Virtuais
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
        /* ─── CASO 2: VISITANTE (LANDING PAGE COM OPÇÕES CLARAS DE NAVEGAÇÃO) ─── */
        <>
          {/* Hero Section */}
          <section style={{ position: 'relative', overflow: 'hidden', padding: '4.5rem 1rem 3rem' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, rgba(139,92,246,0.06) 50%, transparent 100%)',
            }} />

            <div style={{ position: 'relative', maxWidth: '80rem', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#06b6d4', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                <Sparkles style={{ width: '0.9rem', height: '0.9rem' }} />
                Plataforma Educacional Integrada de Ciências, Matemática & ENEM
              </div>

              <h1 className="gradient-text" style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
                fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.1,
              }}>
                Edu-Interact
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: 'var(--text-secondary)',
                maxWidth: '44rem', margin: '0 auto 2.25rem',
                lineHeight: 1.7,
              }}>
                Laboratórios Virtuais interativos, Simulado oficial do ENEM com correção TRI, Metodologias Ativas e Inteligência Artificial adaptativa para professores e estudantes.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
                <button
                  onClick={onLoginOpen}
                  className="btn-gradient"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                >
                  <LogIn style={{ width: '1.15rem', height: '1.15rem' }} />
                  Entrar na Plataforma
                  <ArrowRight style={{ width: '1.15rem', height: '1.15rem' }} />
                </button>
                <Link
                  to="/simulacao"
                  className="btn-outline-cyan"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                >
                  <Beaker style={{ width: '1.15rem', height: '1.15rem' }} />
                  Explorar Laboratórios Virtuais
                </Link>
                <Link
                  to="/enem"
                  className="btn-outline-cyan"
                  style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa' }}
                >
                  <GraduationCap style={{ width: '1.15rem', height: '1.15rem' }} />
                  Testar Simulado ENEM TRI
                </Link>
              </div>

              {/* Hub Preview for Visitors */}
              <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  Conheça os Ambientes da Plataforma
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  <div
                    onClick={onLoginOpen}
                    className="glass-card"
                    style={{ padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer', border: '1px solid rgba(6,182,212,0.25)' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <Users style={{ width: '1.3rem', height: '1.3rem', color: '#06b6d4' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Área do Professor</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      Criação de turmas com código de 6 dígitos, planos de aula BNCC com IA Gemini e avaliações com correção automática.
                    </p>
                  </div>

                  <div
                    onClick={onLoginOpen}
                    className="glass-card"
                    style={{ padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer', border: '1px solid rgba(139,92,246,0.25)' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <BookOpen style={{ width: '1.3rem', height: '1.3rem', color: '#8b5cf6' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Área do Estudante</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      Mural da turma, roteiros de laboratórios práticos, simulado ENEM oficial, gamificação com XP e loja de avatares.
                    </p>
                  </div>

                  <Link
                    to="/simulacao"
                    className="glass-card"
                    style={{ padding: '1.5rem', borderRadius: '1rem', textDecoration: 'none', border: '1px solid rgba(16,185,129,0.25)' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <Beaker style={{ width: '1.3rem', height: '1.3rem', color: '#10b981' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Laboratórios Virtuais</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      Experimentos interativos de mecânica, gravitação, óptica, termodinâmica, eletromagnetismo e matemática prática.
                    </p>
                  </Link>

                  <Link
                    to="/enem"
                    className="glass-card"
                    style={{ padding: '1.5rem', borderRadius: '1rem', textDecoration: 'none', border: '1px solid rgba(59,130,246,0.25)' }}
                  >
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                      <GraduationCap style={{ width: '1.3rem', height: '1.3rem', color: '#3b82f6' }} />
                    </div>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem' }}>Simulado Oficial ENEM</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
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
              <div className="glass-card" style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, var(--bg-card), var(--bg-card-hover))',
                boxShadow: '0 0 50px rgba(6, 182, 212, 0.1)',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '2rem', alignItems: 'center',
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase' }}>
                      Demonstração Interativa
                    </span>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.35rem 0 1rem' }}>
                      Sinta a Física em Tempo Real
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                      Puxe e solte o pêndulo para testar a conservação de energia e a física newtoniana diretamente no seu navegador.
                    </p>
                    <Link to="/simulacao" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      color: '#06b6d4', textDecoration: 'none', fontWeight: 700,
                      transition: 'gap 0.2s',
                    }}>
                      Acessar todos os laboratórios completos
                      <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                    </Link>
                  </div>
                  <div style={{
                    height: '12rem', borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(139,92,246,0.06))',
                    border: '1px solid rgba(139,92,246,0.15)',
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

