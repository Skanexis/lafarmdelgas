import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryModalProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export function GalleryModal({ images, startIndex, onClose }: GalleryModalProps) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(images.length - 1, c + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, onClose]);

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
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
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

      {/* Main image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          aspectRatio: '4/3',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(217,120,47,0.2)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.58)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            src={images[current]}
            alt={`Gallery ${current + 1}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AnimatePresence>

        {/* Nav arrows */}
        {current > 0 && (
          <button
            onClick={() => setCurrent(c => c - 1)}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(9,6,4,0.7)',
              border: '1px solid rgba(217,120,47,0.3)',
              borderRadius: '6px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#D9782F',
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {current < images.length - 1 && (
          <button
            onClick={() => setCurrent(c => c + 1)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(9,6,4,0.7)',
              border: '1px solid rgba(217,120,47,0.3)',
              borderRadius: '6px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#D9782F',
            }}
          >
            <ChevronRight size={22} />
          </button>
        )}

        {/* Counter */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(9,6,4,0.8)',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'rgba(242,226,196,0.7)',
          }}
        >
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '16px',
            overflowX: 'auto',
            maxWidth: '900px',
            padding: '4px',
          }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                flexShrink: 0,
                width: '72px',
                height: '54px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: i === current ? '2px solid #D9782F' : '2px solid transparent',
                cursor: 'pointer',
                opacity: i === current ? 1 : 0.55,
                transition: 'all 0.2s',
                padding: 0,
              }}
            >
              <img src={img} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
