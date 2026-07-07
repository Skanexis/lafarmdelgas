import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { verifyTelegramSession } from '../api/client';

type GateState = 'checking' | 'allowed' | 'blocked' | 'subscribe';

interface TelegramGateProps {
  disabled?: boolean;
  children: ReactNode;
}

interface ApiError extends Error {
  status?: number;
  payload?: {
    joinUrl?: string;
  };
}

export function TelegramGate({ disabled = false, children }: TelegramGateProps) {
  const [state, setState] = useState<GateState>('checking');
  const [joinUrl, setJoinUrl] = useState('');

  const checkSession = useCallback(async () => {
    if (disabled) {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    const initData = webApp?.initData || '';

    webApp?.ready?.();
    webApp?.expand?.();

    if (!initData) {
      setState('blocked');
      return;
    }

    setState('checking');

    try {
      await verifyTelegramSession(initData);
      setState('allowed');
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.status === 403) {
        setJoinUrl(apiError.payload?.joinUrl || '');
        setState('subscribe');
        return;
      }

      setState('blocked');
    }
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    checkSession();
  }, [checkSession, disabled]);

  if (disabled) {
    return <>{children}</>;
  }

  if (state === 'allowed') {
    return <>{children}</>;
  }

  return (
    <main className="telegram-gate">
      <div className="telegram-gate-mark">TD</div>

      {state === 'checking' && <div className="telegram-gate-spinner" />}

      {state === 'blocked' && (
        <>
          <h1>TERPS DRAGON</h1>
          <p>Apri da Telegram</p>
        </>
      )}

      {state === 'subscribe' && (
        <>
          <h1>TERPS DRAGON</h1>
          <p>Iscriviti al canale</p>
          <div className="telegram-gate-actions">
            {joinUrl && (
              <a href={joinUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={15} />
                Canale
              </a>
            )}
            <button type="button" onClick={checkSession}>
              <RefreshCw size={15} />
              Riprova
            </button>
          </div>
        </>
      )}
    </main>
  );
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}
