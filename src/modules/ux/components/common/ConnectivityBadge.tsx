import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { offlineSyncService, type PendingOfflineSubmission } from '../../../core/services/offlineSyncService';

export function ConnectivityBadge() {
  const [isOnline, setIsOnline] = useState<boolean>(offlineSyncService.getIsOnline());
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const updatePendingCount = () => {
    const list: PendingOfflineSubmission[] = offlineSyncService.getPendingSubmissions();
    const count = list.filter(item => !item.synced).length;
    setPendingCount(count);
  };

  useEffect(() => {
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
  }, []);

  const handleManualSync = async () => {
    if (isSyncing || !isOnline) return;
    setIsSyncing(true);
    try {
      await offlineSyncService.syncOutbox();
      updatePendingCount();
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  if (isOnline && pendingCount === 0) {
    return (
      <div
        title="Conexão ativa com nuvem e sincronização em tempo real"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          color: '#16a34a',
          fontSize: '0.72rem',
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
            background: '#22c55e',
            display: 'inline-block',
            boxShadow: '0 0 6px #22c55e'
          }}
        />
        <Wifi style={{ width: '0.8rem', height: '0.8rem' }} />
        <span className="desktop-nav">Online</span>
      </div>
    );
  }

  return (
    <div
      title={isOnline ? `${pendingCount} item(ns) na fila de sincronização` : 'Modo Offline: Seus dados estão salvos localmente e serão sincronizados ao reconectar'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '999px',
        background: isOnline ? 'rgba(234, 179, 8, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        border: isOnline ? '1px solid rgba(234, 179, 8, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
        color: isOnline ? '#b45309' : '#dc2626',
        fontSize: '0.72rem',
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
        {isOnline ? `Sincronizando (${pendingCount})` : `Offline (${pendingCount})`}
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
          title="Forçar sincronização imediata"
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
