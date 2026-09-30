import { useState } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import type { GradeLevel } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';
import { X } from 'lucide-react';
import { Logo } from './Logo';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { isLocalAuthMode, loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'estudante' | 'professor' | 'admin'>('estudante');
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
      if (code === 'auth/admin-local-only') {
        setError('Login como administrador só está disponível no modo local.');
      } else if (code === 'auth/not-configured') {
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
        className="fade-in card"
        style={{
          padding: '2rem', width: '100%', maxWidth: '440px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Logo symbolSize={26} />
            </div>
            <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
              Entrar na plataforma
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Selecione seu perfil para continuar
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--border-color)',
              borderRadius: '10px', padding: '0.35rem',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X style={{ width: '1.1rem', height: '1.1rem' }} />
          </button>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: isLocalAuthMode ? 'repeat(3, 1fr)' : '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['estudante', 'professor', ...(isLocalAuthMode ? ['admin' as const] : [])] as const).map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: '0.85rem 0.5rem', borderRadius: '10px', cursor: 'pointer',
                border: selectedRole === role ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                background: selectedRole === role
                  ? 'rgba(228, 104, 63, 0.08)'
                  : 'transparent',
                color: selectedRole === role ? 'var(--text-main)' : 'var(--text-secondary)',
                fontWeight: selectedRole === role ? 600 : 400,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                {role === 'estudante' ? '🎓' : role === 'professor' ? '👨‍🏫' : '🛡️'}
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                {role === 'estudante' ? 'Estudante' : role === 'professor' ? 'Professor' : 'Admin'}
              </div>
            </button>
          ))}
        </div>

        {/* Grade Selector */}
        {selectedRole !== 'admin' && (
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
                  textAlign: 'left', padding: '0.65rem 0.9rem', borderRadius: '10px', cursor: 'pointer',
                  background: selectedGrade === key ? 'rgba(228, 104, 63, 0.08)' : 'transparent',
                  border: selectedGrade === key ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                  color: selectedGrade === key ? 'var(--color-primary-accessible, #B8441F)' : 'var(--text-main)',
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
        )}

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary"
          style={{
            width: '100%', padding: '0.85rem', fontSize: '0.95rem',
            borderRadius: '10px',
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '⏳ Entrando...' : isLocalAuthMode ? 'Entrar localmente' : 'Entrar com Google'}
        </button>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '0.75rem', padding: '0.75rem', borderRadius: '10px',
            background: 'var(--color-vermelho-bg)', border: '1px solid var(--color-vermelho-border)',
            color: 'var(--color-vermelho)', fontSize: '0.8rem', lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
          {isLocalAuthMode ? 'Modo local ativo para testes neste clone.' : 'Seus dados são armazenados com segurança no Firebase.'}
        </p>
      </div>
    </div>
  );
}

