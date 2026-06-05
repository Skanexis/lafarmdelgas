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
        onClick={onClose}
        aria-label="Chiudi gallery"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '6px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#F2E2C4',
          zIndex: 10,
        }}
      >
        <X size={20} />
      </button>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(100%, 1040px)',
          height: 'min(72vh, 760px)',
          minHeight: '260px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(57,255,20,0.24)',
          background: '#020403',
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
                  background: '#020403',
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
            onClick={() => setCurrent(c => c - 1)}
            aria-label="Media precedente"
            style={navButtonStyle('left')}
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {current < media.length - 1 && (
          <button
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
            background: 'rgba(2,4,3,0.82)',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'rgba(244,244,239,0.76)',
          }}
        >
          {current + 1} / {media.length}
        </div>
      </div>

      {media.length > 1 && (
        <div
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
              key={`${item.type}-${item.url}-${i}`}
              onClick={() => setCurrent(i)}
              style={{
                position: 'relative',
                flexShrink: 0,
                width: '76px',
                height: '56px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: i === current ? '2px solid #39ff14' : '2px solid transparent',
                background: '#020403',
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
                      color: '#39ff14',
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
    border: '1px solid rgba(57,255,20,0.34)',
    borderRadius: '6px',
    width: '46px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#39ff14',
  };
}
