import { Outlet, useLocation, Link, useNavigate } from 'react-router';
import { Toaster } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: 'linear-gradient(180deg, #090604 0%, #120C07 100%)',
        minHeight: '100vh',
        color: '#F2E2C4',
      }}
    >
      {/* Floating Nav */}
      {!isHome && (
        <nav
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(9,6,4,0.94)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(217,120,47,0.28)',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(217,120,47,0.1)',
              border: '1px solid rgba(217,120,47,0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#D9782F',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(217,120,47,0.2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(217,120,47,0.1)';
            }}
          >
            <ArrowLeft size={16} />
            Indietro
          </button>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #F3C66A, #D9782F 48%, #8FA64A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '2px',
              }}
            >
              LA FARM DEL GAS
            </span>
          </Link>

          <div style={{ width: '96px' }} />
        </nav>
      )}

      <div style={{ paddingTop: isHome ? 0 : '73px' }}>
        <Outlet />
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(18,12,7,0.97)',
            border: '1px solid rgba(217,120,47,0.3)',
            color: '#F2E2C4',
            fontFamily: "'Poppins', sans-serif",
          },
        }}
      />
    </div>
  );
}
