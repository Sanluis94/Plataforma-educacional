import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import type { GradeLevel } from '../../core/contexts/AuthContext';
import { GRADE_LABELS } from '../../core/contexts/AuthContext';
import { X, GraduationCap, Presentation, Building2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from './Logo';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';
import { productDeployment } from '../../core/config/productConfiguration';
import { getInitialRegistrationRole } from '../../core/config/registrationPolicy';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialRole?: 'estudante' | 'professor' | 'coordenador' | 'admin';
  purpose?: 'learning' | 'family';
}

export function LoginModal({ onClose, onSuccess, initialRole = 'estudante', purpose = 'learning' }: LoginModalProps) {
  const { isLocalAuthMode, loginWithGoogle } = useAuth();
  const isHome = productDeployment.mode === 'home';
  const isSchool = productDeployment.mode === 'school';
  const [selectedRole, setSelectedRole] = useState<'estudante' | 'professor' | 'coordenador' | 'admin'>(() => getInitialRegistrationRole(productDeployment.mode, initialRole, purpose));
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('medio');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestClose = () => { if (!loading) onClose(); };
  const dialogRef = useDialogAccessibility(true, requestClose);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(getInitialRegistrationRole(productDeployment.mode, selectedRole, purpose), selectedGrade);
      (onSuccess ?? onClose)();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/admin-local-only') {
        setError('Login como administrador só está disponível no modo local.');
      } else if (code === 'auth/installation-policy-unavailable') {
        setError('A política de acesso desta instalação não pôde ser confirmada. Avise o responsável pela plataforma.');
      } else if (code === 'auth/staff-not-assigned') {
        setError('Seu acesso à equipe ainda não foi autorizado. Peça à escola que prepare seu cadastro e tente novamente.');
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

  const roles = ['estudante', 'professor', 'coordenador', ...(isLocalAuthMode ? ['admin' as const] : [])] as const;
  const roleMeta = {
    estudante: { label: 'estudante', icon: GraduationCap },
    professor: { label: 'professor', icon: Presentation },
    coordenador: { label: 'Coordenação', icon: Building2 },
    admin: { label: 'admin', icon: ShieldCheck },
  } as const;

  return (
    <div className="ei-overlay" onClick={requestClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="ei-modal"
        style={{ maxWidth: '30rem' }}
      >
        <div className="ei-modal__header">
          <div>
            <Logo symbolSize={26} />
            <h2 id="login-title" className="ei-modal__title">
              {purpose === 'family' ? 'Entrar para acompanhar' : isHome ? 'Entrar para estudar em casa' : isSchool ? 'Entrar na escola' : 'Entrar na plataforma'}
            </h2>
            <p className="ei-modal__subtitle">
              {purpose === 'family' ? 'Entre com o mesmo email informado no convite.' : isHome ? `${productDeployment.installationName} · Seu primeiro acesso cria um perfil de estudante. Você pode ajustar o nível de estudo no seu painel.` : isSchool ? `${productDeployment.installationName} · Use o endereço indicado pela sua escola. O cadastro da equipe precisa ser autorizado previamente; o acesso às turmas depende dos vínculos autorizados.` : 'Selecione seu perfil para continuar'}
            </p>
          </div>
          <button className="ei-modal__close" onClick={requestClose} aria-label="Fechar acesso" disabled={loading}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {purpose !== 'family' && !isHome && (
          <div className="ei-choice-grid" style={{ gridTemplateColumns: `repeat(${roles.length}, minmax(0, 1fr))`, marginBottom: '1.25rem' }}>
            {roles.map(role => {
              const { label, icon: Icon } = roleMeta[role];
              return (
                <button key={role} type="button" className="ei-choice ei-choice--stacked" aria-pressed={selectedRole === role} onClick={() => setSelectedRole(role)}>
                  <Icon size={24} aria-hidden="true" className="ei-choice__icon" />
                  <span style={{ fontSize: '0.8125rem', textTransform: 'capitalize' }}>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {purpose !== 'family' && !isHome && selectedRole !== 'admin' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <p id="login-grade-label" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {selectedRole === 'estudante' ? 'Em qual nível você estuda?' : 'Nível de ensino para começar'}
            </p>
            <div role="group" aria-labelledby="login-grade-label" className="ei-choice-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 11rem), 1fr))' }}>
              {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
                <button key={key} type="button" className="ei-choice" aria-pressed={selectedGrade === key} onClick={() => setSelectedGrade(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleLogin} disabled={loading} className="btn-primary" style={{ width: '100%', minHeight: '3.25rem', fontSize: '1rem' }}>
          {loading ? <><Loader2 size={18} aria-hidden="true" className="animate-spin" /> Entrando…</> : isLocalAuthMode ? 'Entrar localmente' : 'Entrar com Google'}
        </button>

        {error && (
          <div role="alert" className="ei-alert ei-alert--error" style={{ marginTop: '0.75rem' }}>
            <AlertCircle size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: '0.1rem' }} /> <span>{error}</span>
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', textAlign: 'center', marginTop: '0.75rem' }}>
          {isLocalAuthMode ? 'Modo local ativo para testes neste clone.' : 'Use sua conta Google. Se você já tem cadastro, seu perfil será mantido.'}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          Antes de entrar, consulte <Link to="/privacidade" onClick={requestClose}>como seus dados são usados</Link> e os <Link to="/termos" onClick={requestClose}>termos de uso</Link>. Para menores, o uso deve ser combinado com a escola ou responsável legal.
        </p>
      </div>
    </div>
  );
}
