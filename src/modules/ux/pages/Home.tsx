import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';

export function Home() {
  const { currentUser, userData } = useAuth();

  return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎓</div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
        {currentUser ? `Olá, ${userData?.name?.split(' ')[0]}!` : 'Plataforma Educacional'}
      </h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
        {currentUser
          ? `Bem-vindo de volta. Acesse sua área de ${userData?.role === 'professor' ? 'gerenciamento' : 'aprendizado'} abaixo.`
          : 'Aprendizado imersivo, gamificado e adaptado ao seu ritmo. Faça login para começar.'}
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        {currentUser && userData?.role === 'professor' && (
          <>
            <Link to="/professor" style={cardStyle('#7c4dff')}>
              <span style={{ fontSize: '2.5rem' }}>🏫</span>
              <strong>Minhas Turmas</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Gerenciar e criar atividades</span>
            </Link>
            <Link to="/simulacao" style={cardStyle('#ef5350')}>
              <span style={{ fontSize: '2.5rem' }}>⚗️</span>
              <strong>Laboratórios</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Simulações interativas</span>
            </Link>
          </>
        )}
        {currentUser && userData?.role === 'estudante' && (
          <>
            <Link to="/estudante" style={cardStyle('#7c4dff')}>
              <span style={{ fontSize: '2.5rem' }}>📚</span>
              <strong>Meu Aprendizado</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Trilhas e laboratórios</span>
            </Link>
            <Link to="/simulacao" style={cardStyle('#ef5350')}>
              <span style={{ fontSize: '2.5rem' }}>⚗️</span>
              <strong>Laboratórios de Física</strong>
              <span style={{ fontSize: '0.82rem', opacity: 0.7 }}>Simulação de pêndulos e colisões</span>
            </Link>
          </>
        )}
        {!currentUser && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            👆 Clique em <strong style={{ color: 'var(--color-primary)' }}>Entrar</strong> no topo da página para começar.
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = (accent: string): React.CSSProperties => ({
  display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.75rem',
  borderRadius: '14px', textDecoration: 'none', color: 'var(--text-main)',
  background: `${accent}11`, border: `1px solid ${accent}33`,
  transition: 'all 0.25s', width: '180px', alignItems: 'center',
});
