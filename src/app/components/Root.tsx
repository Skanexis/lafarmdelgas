import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { TelegramGate } from './TelegramGate';

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const telegramGateEnabled = ['true', '1', 'yes'].includes(
    String(import.meta.env.VITE_TELEGRAM_GATE || '').toLowerCase(),
  );
  const pageContent = (
    <div style={{ paddingTop: isHome || isAdmin ? 0 : '66px' }}>
      <Outlet />
    </div>
  );

  return (
    <div className="app-shell">
      {!isHome && !isAdmin && (
        <nav className="app-nav">
          <button className="app-nav-back" onClick={() => navigate(-1)} type="button" aria-label="Indietro">
            <ArrowLeft size={17} />
            <span>Indietro</span>
          </button>

          <Link className="app-nav-brand" to="/">
            TERPS DRAGON
          </Link>

          <div className="app-nav-spacer" />
        </nav>
      )}

      {isAdmin || !telegramGateEnabled ? pageContent : <TelegramGate>{pageContent}</TelegramGate>}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(18, 18, 18, 0.96)',
            border: '1px solid rgba(232, 17, 35, 0.32)',
            color: '#f5f5f5',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            borderRadius: '8px',
          },
        }}
      />
    </div>
  );
}
