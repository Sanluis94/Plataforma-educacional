import { useState } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import type { GradeLevel } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';

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
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-secondary)', borderRadius: '16px', padding: '2rem',
        width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ color: 'var(--text-main)', margin: 0 }}>Entrar na Plataforma</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>Selecione seu perfil para continuar</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {(['estudante', 'professor'] as const).map(role => (
            <button key={role} onClick={() => setSelectedRole(role)}
              style={{
                padding: '0.9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: selectedRole === role ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                color: selectedRole === role ? 'white' : 'var(--text-secondary)',
                fontWeight: selectedRole === role ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{role === 'estudante' ? '🎓' : '👨‍🏫'}</div>
              <div style={{ fontSize: '0.88rem' }}>{role === 'estudante' ? 'Sou Estudante' : 'Sou Professor'}</div>
            </button>
          ))}
        </div>

        {/* Grade/Segment selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'block', marginBottom: '0.5rem' }}>
            {selectedRole === 'estudante' ? 'Minha turma pertence a:' : 'Vou lecionar para:'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setSelectedGrade(key)}
                style={{
                  textAlign: 'left', padding: '0.65rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
                  background: selectedGrade === key ? 'rgba(var(--color-primary-rgb),0.15)' : 'rgba(255,255,255,0.04)',
                  border: selectedGrade === key ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.08)',
                  color: selectedGrade === key ? 'var(--color-primary)' : 'var(--text-main)',
                  fontSize: '0.85rem', fontWeight: selectedGrade === key ? '600' : 'normal',
                  transition: 'all 0.2s',
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{
            width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
          }}>
          {loading ? '⏳ Entrando...' : '🚀 Entrar com Google'}
        </button>

        {error && (
          <div style={{
            marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px',
            background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.35)',
            color: '#ef9a9a', fontSize: '0.8rem', lineHeight: '1.5',
          }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
          Seus dados são armazenados com segurança no Firebase.
        </p>
      </div>
    </div>
  );
}
