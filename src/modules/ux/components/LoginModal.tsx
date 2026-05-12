import { useState } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import type { GradeLevel } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';
import { X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'estudante' | 'professor'>('estudante');
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('medio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(selectedRole, selectedGrade);
      onClose();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/not-configured') {
        setError('Firebase não está configurado. Crie um arquivo .env na raiz do projeto com as chaves do Firebase. Consulte .env.example para referência.');
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Login cancelado. Tente novamente e conclua o processo na janela do Google.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Domínio não autorizado. Adicione "localhost" nos Authorized Domains no Firebase Console → Authentication → Settings.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google Sign-In não está ativado. Acesse Firebase Console → Authentication → Sign-in method → Google → Ativar.');
      } else if (code === 'auth/invalid-api-key' || !code) {
        setError('Firebase não está configurado ou a chave da API é inválida. Verifique o arquivo .env.');
      } else {
        setError(`Erro ao fazer login: ${code}`);
      }
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in glass-card"
        style={{
          padding: '2rem', width: '100%', maxWidth: '440px',
          borderRadius: '1rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(6,182,212,0.1)',
          background: 'var(--bg-card)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
              Entrar na Plataforma
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Selecione seu perfil para continuar
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--border-color)',
              borderRadius: '0.5rem', padding: '0.35rem',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X style={{ width: '1.1rem', height: '1.1rem' }} />
          </button>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['estudante', 'professor'] as const).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
                border: selectedRole === role ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                background: selectedRole === role
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))'
                  : 'transparent',
                color: selectedRole === role ? 'var(--text-main)' : 'var(--text-secondary)',
                fontWeight: selectedRole === role ? 600 : 400,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                {role === 'estudante' ? '🎓' : '👨‍🏫'}
              </div>
              <div style={{ fontSize: '0.88rem' }}>
                {role === 'estudante' ? 'Sou Estudante' : 'Sou Professor'}
              </div>
            </button>
          ))}
        </div>

        {/* Grade Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            color: 'var(--text-secondary)', fontSize: '0.82rem',
            display: 'block', marginBottom: '0.5rem',
          }}>
            {selectedRole === 'estudante' ? 'Minha turma pertence a:' : 'Vou lecionar para:'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedGrade(key)}
                style={{
                  textAlign: 'left', padding: '0.65rem 0.9rem', borderRadius: '0.5rem', cursor: 'pointer',
                  background: selectedGrade === key ? 'rgba(6,182,212,0.1)' : 'transparent',
                  border: selectedGrade === key ? '1px solid #06b6d4' : '1px solid var(--border-color)',
                  color: selectedGrade === key ? '#06b6d4' : 'var(--text-main)',
                  fontSize: '0.85rem',
                  fontWeight: selectedGrade === key ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-gradient"
          style={{
            width: '100%', padding: '0.85rem', fontSize: '0.95rem',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Entrando...' : '🚀 Entrar com Google'}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#f87171', fontSize: '0.8rem', lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
          Seus dados são armazenados com segurança no Firebase.
        </p>
      </div>
    </div>
  );
}
