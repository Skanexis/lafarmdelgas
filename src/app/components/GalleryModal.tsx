import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

export interface GalleryMediaItem {
  type: 'image' | 'video';
  url: string;
  label?: string;
}

interface GalleryModalProps {
  media: GalleryMediaItem[];
  startIndex: number;
  onClose: () => void;
}

export function GalleryModal({ media, startIndex, onClose }: GalleryModalProps) {
  const [current, setCurrent] = useState(() => Math.min(Math.max(startIndex, 0), Math.max(media.length - 1, 0)));
  const currentItem = media[current];
  const imagePreloads = useMemo(
    () =>
      [media[current - 1], currentItem, media[current + 1]].filter(
        (item): item is GalleryMediaItem => Boolean(item && item.type === 'image'),
      ),
    [current, currentItem, media],
  );

  useEffect(() => {
    setCurrent(Math.min(Math.max(startIndex, 0), Math.max(media.length - 1, 0)));
  }, [media.length, startIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(media.length - 1, c + 1));
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [media.length, onClose]);

  if (!currentItem) return null;

  return (
    <motion.div
      className="gallery-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.94)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <button
        className="gallery-modal-close"
        onClick={onClose}
        aria-label="Chiudi gallery"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(18,18,18,0.82)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '8px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#f5f5f5',
          zIndex: 10,
        }}
      >
        <X size={20} />
      </button>

      <div
        className="gallery-modal-stage"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(100%, 1040px)',
          height: 'min(72vh, 760px)',
          minHeight: '260px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(232,17,35,0.34)',
          background: '#050505',
          boxShadow: '0 24px 70px rgba(0,0,0,0.58)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentItem.type}-${currentItem.url}`}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', height: '100%' }}
          >
            {currentItem.type === 'video' ? (
              <video
                src={currentItem.url}
                controls
                playsInline
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#050505',
                  display: 'block',
                }}
              />
            ) : (
              <img
                src={currentItem.url}
                alt={currentItem.label || `Gallery ${current + 1}`}
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {current > 0 && (
          <button
            className="gallery-modal-nav gallery-modal-nav-prev"
            onClick={() => setCurrent(c => c - 1)}
            aria-label="Media precedente"
            style={navButtonStyle('left')}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {current < media.length - 1 && (
          <button
            className="gallery-modal-nav gallery-modal-nav-next"
            onClick={() => setCurrent(c => c + 1)}
            aria-label="Media successivo"
            style={navButtonStyle('right')}
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(18,18,18,0.82)',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'rgba(245,245,245,0.76)',
          }}
        >
          {current + 1} / {media.length}
        </div>
      </div>

      {media.length > 1 && (
        <div
          className="gallery-modal-thumbs"
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
            overflowX: 'auto',
            maxWidth: 'min(100%, 1040px)',
            padding: '4px',
          }}
        >
          {media.map((item, i) => (
            <button
              className="gallery-modal-thumb"
              key={`${item.type}-${item.url}-${i}`}
              onClick={() => setCurrent(i)}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: '76px',
                height: '56px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: i === current ? '2px solid #ff3347' : '2px solid transparent',
                background: '#050505',
                cursor: 'pointer',
                opacity: i === current ? 1 : 0.58,
                transition: 'all 0.2s',
                padding: 0,
              }}
            >
              {item.type === 'video' ? (
                <>
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(0,0,0,0.28)',
                      color: '#ff3347',
                    }}
                  >
                    <Play size={17} fill="currentColor" />
                  </span>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={item.label || `Thumb ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'none' }} aria-hidden="true">
        {imagePreloads.map(item => (
          <img key={item.url} src={item.url} alt="" />
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .gallery-modal-overlay {
            padding: 12px !important;
          }

          .gallery-modal-close {
            top: max(12px, env(safe-area-inset-top)) !important;
            right: 12px !important;
            width: 40px !important;
            height: 40px !important;
          }

          .gallery-modal-stage {
            width: 100% !important;
            height: min(66svh, 560px) !important;
            min-height: 220px !important;
            border-radius: 8px !important;
          }

          .gallery-modal-nav {
            width: 40px !important;
            height: 40px !important;
          }

          .gallery-modal-nav-prev {
            left: 8px !important;
          }

          .gallery-modal-nav-next {
            right: 8px !important;
          }

          .gallery-modal-thumbs {
            width: 100% !important;
            max-width: 100% !important;
            gap: 8px !important;
            padding: 4px 2px !important;
          }

          .gallery-modal-thumb {
            width: 64px !important;
            height: 48px !important;
          }
        }

        @media (max-width: 360px) {
          .gallery-modal-stage {
            height: min(60svh, 500px) !important;
          }

          .gallery-modal-thumb {
            width: 58px !important;
            height: 44px !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

function navButtonStyle(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute',
    [side]: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(2,4,3,0.72)',
    border: '1px solid rgba(232,17,35,0.38)',
    borderRadius: '8px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#f5f5f5',
  };
}
