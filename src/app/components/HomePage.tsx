import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { MessageCircle, Store, MapPin } from 'lucide-react';
import { fetchSettings, resolveMediaUrl } from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    let active = true;

    fetchSettings()
      .then(settings => {
        if (active) setLogoUrl(resolveMediaUrl(settings.logoUrl));
      })
      .catch(() => {
        if (active) setLogoUrl('');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: '#090604',
        color: '#F2E2C4',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(90deg, rgba(9,6,4,0.94) 0%, rgba(9,6,4,0.66) 46%, rgba(9,6,4,0.9) 100%), linear-gradient(180deg, rgba(9,6,4,0.08) 0%, rgba(9,6,4,0.92) 100%), url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1800&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.02)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(217,120,47,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(217,120,47,0.06) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage: 'linear-gradient(to bottom, transparent, black 18%, black 78%, transparent)',
          pointerEvents: 'none',
        }}
      />

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '64px 7vw 96px',
          boxSizing: 'border-box',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          style={{
            width: 'min(920px, 100%)',
          }}
        >
          {logoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45 }}
              style={{
                width: 'clamp(128px, 16vw, 220px)',
                aspectRatio: '1',
                marginBottom: '24px',
                borderRadius: '50%',
                border: '1px solid rgba(243,198,106,0.4)',
                background: 'rgba(9,6,4,0.62)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.48)',
                overflow: 'hidden',
              }}
            >
              <img
                src={logoUrl}
                alt="LA FARM DEL GAS"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </motion.div>
          )}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              border: '1px solid rgba(217,120,47,0.38)',
              background: 'rgba(23,16,10,0.72)',
              color: '#F3C66A',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            <MapPin size={14} />
            Campania Selection
          </div>

          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(54px, 9vw, 124px)',
              lineHeight: 0.92,
              letterSpacing: 0,
              color: '#F2E2C4',
              textTransform: 'uppercase',
              margin: 0,
              maxWidth: '820px',
              textShadow: '0 18px 42px rgba(0,0,0,0.42)',
            }}
          >
            LA FARM
            <span
              style={{
                display: 'block',
                color: '#8FA64A',
                textShadow: '0 18px 42px rgba(0,0,0,0.42)',
              }}
            >
              DEL GAS
            </span>
          </h1>

          <div
            style={{
              width: 'min(560px, 100%)',
              height: '4px',
              margin: '28px 0 24px',
              background: 'linear-gradient(90deg, #D9782F, #F3C66A 44%, rgba(143,166,74,0.65), transparent)',
            }}
          />

          <p
            style={{
              margin: 0,
              maxWidth: '560px',
              color: 'rgba(242,226,196,0.74)',
              fontSize: '16px',
              lineHeight: 1.7,
              letterSpacing: '0.2px',
            }}
          >
            Catalogo riservato con selezioni curate, disponibilità aggiornata e contatto diretto.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '34px',
            }}
          >
            <HeroButton label="VETRINA" icon={<Store size={19} />} variant="primary" onClick={() => navigate('/vetrina')} />
            <HeroButton label="CONTATTI" icon={<MessageCircle size={19} />} onClick={() => navigate('/contatti')} />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function HeroButton({
  label,
  icon,
  onClick,
  variant = 'secondary',
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const primary = variant === 'primary';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        minWidth: '178px',
        padding: '14px 22px',
        borderRadius: '8px',
        border: primary ? '1px solid rgba(243,198,106,0.55)' : '1px solid rgba(242,226,196,0.18)',
        background: primary ? '#D9782F' : 'rgba(23,16,10,0.72)',
        color: primary ? '#090604' : '#F2E2C4',
        cursor: 'pointer',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900,
        fontSize: '13px',
        letterSpacing: '1.6px',
        boxShadow: primary ? '0 14px 34px rgba(0,0,0,0.36)' : 'none',
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}
