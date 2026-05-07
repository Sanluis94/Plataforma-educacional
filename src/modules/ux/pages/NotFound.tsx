import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1
          className="gradient-text"
          style={{ fontSize: '8rem', fontWeight: 800, lineHeight: 1, marginBottom: '1rem' }}
        >
          404
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Página não encontrada
        </p>
        <Link to="/" className="btn-gradient" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
          <Home style={{ width: '1.25rem', height: '1.25rem' }} />
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
