import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { offlineSyncService, type PendingOfflineSubmission } from '../../../core/services/offlineSyncService';
import { useAuth } from '../../../core/contexts/AuthContext';
import { db } from '../../../core/services/firebaseConfig';

export function ConnectivityBadge() {
  const { currentUser, userData } = useAuth();
  const studentId = userData?.role === 'estudante' ? currentUser?.uid ?? null : null;
  const [isOnline, setIsOnline] = useState<boolean>(offlineSyncService.getIsOnline());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queueError, setQueueError] = useState(false);
  const [legacyRecords, setLegacyRecords] = useState(false);

  const updatePendingCount = useCallback(() => {
    try {
      setLegacyRecords(offlineSyncService.hasLegacyUnassignedRecords());
      const list: PendingOfflineSubmission[] = offlineSyncService.getPendingSubmissions(studentId);
      setPendingCount(list.length);
      setQueueError(list.some(item => Boolean(item.error)));
    } catch { setQueueError(true); }
  }, [studentId]);

  useEffect(() => {
    offlineSyncService.setCurrentStudent(studentId);
    updatePendingCount();

    const unsubscribe = offlineSyncService.subscribeStatus((online) => {
      setIsOnline(online);
      updatePendingCount();
    });

    const interval = setInterval(updatePendingCount, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [studentId, updatePendingCount]);

  const handleManualSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      await offlineSyncService.syncOutbox();
      updatePendingCount();
    } catch {
      setQueueError(true);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !queueError && !legacyRecords) {
    return (
      <div
        title={db ? 'Conexão de internet disponível. As entregas confirmam seu salvamento separadamente.' : 'Dados salvos neste navegador. O modo local não envia dados à nuvem.'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '8px',
          background: 'var(--color-verde-light)',
          border: '1px solid var(--border-control)',
          color: 'var(--color-success)',
          fontSize: '0.8125rem',
          fontWeight: 700,
          cursor: 'default',
          userSelect: 'none'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--color-success)',
            display: 'inline-block',
            boxShadow: 'none'
          }}
        />
        <Wifi style={{ width: '0.8rem', height: '0.8rem' }} />
        <span className="desktop-nav">{db ? 'Internet disponível' : 'Modo local'}</span>
      </div>
    );
  }

  return (
    <div
      title={legacyRecords ? 'Há registros da versão anterior sem conta ou turma confirmadas. Eles foram preservados neste dispositivo e precisam de revisão antes de qualquer envio. As novas entregas usam a fila do perfil atual.' : queueError ? 'Entrega ainda não confirmada. Os itens na fila foram preservados; tente enviar novamente.' : isOnline ? `${pendingCount} entrega(s) aguardando confirmação` : `${pendingCount} entrega(s) guardadas neste dispositivo. A fila será enviada ao reconectar com seu perfil.`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '8px',
        background: isOnline ? 'rgba(var(--color-primary-rgb), 0.12)' : 'var(--color-vermelho-bg)',
        border: isOnline ? '1px solid var(--color-primary-accessible)' : '1px solid var(--color-vermelho-border)',
        color: isOnline ? 'var(--color-primary-accessible)' : 'var(--color-error)',
        fontSize: '0.8125rem',
        fontWeight: 700,
        userSelect: 'none'
      }}
    >
      {isOnline ? (
        <Wifi style={{ width: '0.8rem', height: '0.8rem' }} />
      ) : (
        <WifiOff style={{ width: '0.8rem', height: '0.8rem' }} />
      )}
      
      <span>
        {legacyRecords && pendingCount === 0 ? 'Registros antigos para revisão' : queueError ? `Envio pendente (${pendingCount})` : isOnline ? `Aguardando envio (${pendingCount})` : `Sem internet (${pendingCount})`}
      </span>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'inherit'
          }}
          title="Tentar enviar entregas pendentes"
          aria-label="Tentar enviar entregas pendentes"
        >
          <RefreshCw
            style={{
              width: '0.75rem',
              height: '0.75rem',
              animation: isSyncing ? 'spin 1s linear infinite' : 'none'
            }}
          />
        </button>
      )}
    </div>
  );
}
