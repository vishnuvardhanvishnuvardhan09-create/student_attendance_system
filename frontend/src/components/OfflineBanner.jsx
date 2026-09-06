import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { getOfflineStatus, getPendingCounts, syncPendingData } from '../api/offlineSync';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(getOfflineStatus());
  const [pendingCounts, setPendingCounts] = useState(getPendingCounts());
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState('');

  useEffect(() => {
    const handleStatusChange = (e) => {
      setIsOffline(e.detail.isOffline);
    };

    const handleQueueChange = () => {
      setPendingCounts(getPendingCounts());
    };

    const handleSyncComplete = (e) => {
      const { syncedAttendance, syncedFeedback, syncedNotices, syncedHolidays, failedItems } = e.detail;
      const totalSynced = syncedAttendance + syncedFeedback + syncedNotices + syncedHolidays;
      if (totalSynced > 0) {
        setSyncFeedback(`Synced ${totalSynced} items to server.`);
        setTimeout(() => setSyncFeedback(''), 4000);
      } else if (failedItems > 0) {
        setSyncFeedback('Backend still unreachable. Retrying later.');
        setTimeout(() => setSyncFeedback(''), 4000);
      }
    };

    window.addEventListener('offline-status-change', handleStatusChange);
    window.addEventListener('pending-queue-updated', handleQueueChange);
    window.addEventListener('sync-completed', handleSyncComplete);

    // Also check standard browser navigator.onLine
    const handleOnline = () => {
      syncPendingData();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline-status-change', handleStatusChange);
      window.removeEventListener('pending-queue-updated', handleQueueChange);
      window.removeEventListener('sync-completed', handleSyncComplete);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncFeedback('');
    try {
      await syncPendingData();
    } catch (err) {
      setSyncFeedback('Sync failed. Please verify server connection.');
    } finally {
      setSyncing(false);
    }
  };

  // Banner removed per user request: sync still runs silently in background
  return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))',
        color: '#ffffff',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.88rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WifiOff size={17} color="#ffffff" />
        </div>
        <span>
          <strong>Offline mode</strong> — showing locally saved data.
          {pendingCounts.total > 0 && (
            <span style={{ marginLeft: '8px', opacity: 0.9 }}>
              ({pendingCounts.total} change{pendingCounts.total > 1 ? 's' : ''} queued locally)
            </span>
          )}
          {syncFeedback && (
            <span style={{ marginLeft: '12px', fontWeight: 600, color: '#fef3c7' }}>
              &bull; {syncFeedback}
            </span>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleManualSync}
          disabled={syncing}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
          onMouseEnter={(e) => {
            if (!syncing) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>
    </aside>
  );
}
