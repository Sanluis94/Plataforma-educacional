import { useState } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import type { GradeLevel } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';
import { X } from 'lucide-react';
import { Logo } from './Logo';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialRole?: 'estudante' | 'professor' | 'coordenador' | 'admin';
  purpose?: 'learning' | 'family';
}

export function LoginModal({ onClose, onSuccess, initialRole = 'estudante', purpose = 'learning' }: LoginModalProps) {
  const { isLocalAuthMode, loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'estudante' | 'professor' | 'coordenador' | 'admin'>(initialRole);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('medio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestClose = () => { if (!loading) onClose(); };
  const dialogRef = useDialogAccessibility(true, requestClose);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(selectedRole, selectedGrade);
      (onSuccess ?? onClose)();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/admin-local-only') {
        setError('Login como administrador só está disponível no modo local.');
      } else if (code === 'auth/not-configured') {
        setError('O acesso está indisponível no momento. Tente novamente mais tarde.');
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Login cancelado. Tente novamente e conclua o processo na janela do Google.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('Não foi possível entrar por este endereço. Acesse o endereço publicado da plataforma.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('O acesso com Google está indisponível no momento. Tente novamente mais tarde.');
      } else if (code === 'auth/popup-blocked') {
        setError('O navegador bloqueou a janela do Google. Permita janelas para este site e tente novamente.');
      } else if (code === 'auth/network-request-failed') {
        setError('Não foi possível conectar. Confira sua conexão e tente novamente.');
      } else if (code === 'auth/invalid-api-key' || !code) {
        setError('Não foi possível entrar agora. Tente novamente mais tarde.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
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
      onClick={requestClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="fade-in card"
        style={{
          padding: '2rem', width: '100%', maxWidth: '440px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          maxHeight: 'calc(100dvh - 2rem)', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ marginBottom: '0.5rem' }}>
              <Logo symbolSize={26} />
            </div>
            <h2 id="login-title" style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>
              Entrar na plataforma
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {purpose === 'family' ? 'Entre com o mesmo email informado ao professor.' : 'Selecione seu perfil para continuar'}
            </p>
          </div>
          <button
            onClick={requestClose}
            aria-label="Fechar acesso"
            disabled={loading}
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
        {purpose !== 'family' && <div style={{ display: 'grid', gridTemplateColumns: isLocalAuthMode ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['estudante', 'professor', 'coordenador', ...(isLocalAuthMode ? ['admin' as const] : [])] as const).map(role => (
            <button
              key={role}
              aria-pressed={selectedRole === role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: '0.85rem 0.35rem', borderRadius: '10px', cursor: 'pointer',
                border: selectedRole === role ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                background: selectedRole === role
                  ? 'rgba(228, 104, 63, 0.08)'
                  : 'transparent',
                color: selectedRole === role ? 'var(--text-main)' : 'var(--text-secondary)',
                fontWeight: selectedRole === role ? 600 : 400,
                transition: 'all 0.2s', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                {role === 'estudante' ? '🎓' : role === 'professor' ? '👨‍🏫' : role === 'coordenador' ? '🏛️' : '🛡️'}
              </div>
              <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                {role === 'coordenador' ? 'Coordenação' : role}
              </div>
            </button>
          ))}
        </div>}

        {/* Grade Selector */}
        {purpose !== 'family' && selectedRole !== 'admin' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            color: 'var(--text-secondary)', fontSize: '0.82rem',
            display: 'block', marginBottom: '0.5rem',
          }}>
            {selectedRole === 'estudante' ? 'Em qual nível você estuda?' : 'Nível de ensino para começar'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
              <button
                key={key}
                aria-pressed={selectedGrade === key}
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
          <div role="alert" style={{
            marginTop: '0.75rem', padding: '0.75rem', borderRadius: '10px',
            background: 'var(--color-vermelho-bg)', border: '1px solid var(--color-vermelho-border)',
            color: 'var(--color-vermelho)', fontSize: '0.8rem', lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
          {isLocalAuthMode ? 'Modo local ativo para testes neste clone.' : 'Use sua conta Google. Se você já tem cadastro, seu perfil será mantido.'}
        </p>
      </div>
    </div>
  );
}

