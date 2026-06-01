import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Snowflake,
  Star,
  MapPin,
  ZoomIn,
  X,
} from 'lucide-react';
import type { Product } from '../data/products';
import { resolveMediaUrl } from '../api/client';
import { GalleryModal } from './GalleryModal';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onContact: () => void;
}

export function ProductDetailModal({ product, onClose, onContact }: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState(product.weights[0]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryStart, setGalleryStart] = useState(0);
  const imageUrls = product.images.map(resolveMediaUrl);
  const videoUrl = resolveMediaUrl(product.videoUrl);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 900,
          background: 'rgba(9,6,4,0.78)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <motion.article
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          onClick={event => event.stopPropagation()}
          className="product-detail-modal"
          style={{
            width: 'clamp(340px, 30vw, 480px)',
            maxHeight: '86vh',
            overflowY: 'auto',
            background: 'rgba(18,12,7,0.96)',
            border: '1px solid rgba(217,120,47,0.22)',
            borderRadius: '10px',
            boxShadow: '0 24px 70px rgba(0,0,0,0.62)',
          }}
        >
          <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '10px 10px 0 0' }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.24 }}
                src={imageUrls[activeImage]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AnimatePresence>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(9,6,4,0.82) 0%, transparent 56%)',
                pointerEvents: 'none',
              }}
            />

            <button
              onClick={onClose}
              aria-label="Chiudi dettaglio"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(9,6,4,0.72)',
                color: '#F2E2C4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={17} />
            </button>

            {product.badge && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 11px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  ...(product.badge === 'FROZEN'
                    ? {
                        background: 'rgba(126,166,160,0.18)',
                        border: '1px solid rgba(126,166,160,0.45)',
                        color: '#7EA6A0',
                      }
                    : {
                        background: 'rgba(217,120,47,0.18)',
                        border: '1px solid rgba(217,120,47,0.45)',
                        color: '#D9782F',
                      }),
                }}
              >
                {product.badge === 'FROZEN' ? <Snowflake size={11} /> : <Star size={11} />}
                {product.badge}
              </div>
            )}

            <button
              onClick={() => {
                setGalleryStart(activeImage);
                setGalleryOpen(true);
              }}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(9,6,4,0.72)',
                borderRadius: '6px',
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: 'rgba(242,226,196,0.72)',
                fontSize: '11px',
                cursor: 'zoom-in',
              }}
            >
              <ZoomIn size={13} />
              Zoom
            </button>

            {activeImage > 0 && (
              <button
                onClick={() => setActiveImage(i => i - 1)}
                aria-label="Immagine precedente"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(9,6,4,0.7)',
                  border: '1px solid rgba(217,120,47,0.3)',
                  borderRadius: '6px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#D9782F',
                }}
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {activeImage < product.images.length - 1 && (
              <button
                onClick={() => setActiveImage(i => i + 1)}
                aria-label="Immagine successiva"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(9,6,4,0.7)',
                  border: '1px solid rgba(217,120,47,0.3)',
                  borderRadius: '6px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#D9782F',
                }}
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>

          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {imageUrls.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
                {imageUrls.map((image, i) => (
                  <button
                    key={image}
                    onClick={() => setActiveImage(i)}
                    style={{
                      flexShrink: 0,
                      width: '56px',
                      height: '42px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      padding: 0,
                      border: i === activeImage ? '2px solid #D9782F' : '2px solid rgba(255,255,255,0.1)',
                      opacity: i === activeImage ? 1 : 0.58,
                      cursor: 'pointer',
                    }}
                  >
                    <img src={image} alt={`Thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {videoUrl && (
              <div
                style={{
                  border: '1px solid rgba(217,120,47,0.22)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'rgba(9,6,4,0.56)',
                }}
              >
                <video
                  src={videoUrl}
                  controls
                  playsInline
                  style={{
                    display: 'block',
                    width: '100%',
                    aspectRatio: '16/9',
                    objectFit: 'cover',
                    background: '#090604',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <MapPin size={13} color="#8FA64A" />
              <span style={{ color: '#8FA64A', fontSize: '11px', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
                {product.origin}
              </span>
              {product.isNew && (
                <span
                  style={{
                    marginLeft: 'auto',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(143,166,74,0.14)',
                    border: '1px solid rgba(143,166,74,0.28)',
                    color: '#8FA64A',
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                  }}
                >
                  NUOVO
                </span>
              )}
            </div>

            <div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: '24px',
                  letterSpacing: '1.4px',
                  lineHeight: 1.1,
                  color: '#F2E2C4',
                  marginBottom: '5px',
                }}
              >
                {product.name}
              </h2>
              <p style={{ color: 'rgba(242,226,196,0.45)', fontSize: '12px' }}>{product.brand}</p>
            </div>

            <p
              style={{
                color: 'rgba(242,226,196,0.64)',
                lineHeight: 1.65,
                fontSize: '12px',
                padding: '12px',
                background: 'rgba(255,255,255,0.035)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.07)',
                margin: 0,
              }}
            >
              {product.description}
            </p>

            <div>
              <p
                style={{
                  color: 'rgba(217,120,47,0.7)',
                  fontSize: '10px',
                  letterSpacing: '2.4px',
                  textTransform: 'uppercase',
                  marginBottom: '9px',
                }}
              >
                Prezzi per grammatura
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '8px',
                }}
              >
                {product.weights.map(weight => {
                  const selected = selectedWeight.weight === weight.weight;
                  return (
                    <button
                      key={weight.weight}
                      onClick={() => setSelectedWeight(weight)}
                      style={{
                        border: selected ? '1px solid rgba(217,120,47,0.72)' : '1px solid rgba(255,255,255,0.08)',
                        background: selected ? 'rgba(217,120,47,0.12)' : 'rgba(255,255,255,0.035)',
                        borderRadius: '6px',
                        padding: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          color: selected ? '#D9782F' : '#F2E2C4',
                          fontSize: '13px',
                          fontWeight: 800,
                        }}
                      >
                        {weight.weight}
                      </span>
                      <span
                        style={{
                          color: weight.price === 'pvt' ? '#7B4A88' : 'rgba(242,226,196,0.58)',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {weight.price === 'pvt' ? 'In pvt' : `€${weight.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                background: 'rgba(217,120,47,0.07)',
                border: '1px solid rgba(217,120,47,0.24)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <span style={{ color: 'rgba(242,226,196,0.58)', fontSize: '12px' }}>Prezzo ({selectedWeight.weight})</span>
              <span
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 900,
                  fontSize: '22px',
                  background: 'linear-gradient(135deg, #D9782F, #F3C66A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  whiteSpace: 'nowrap',
                }}
              >
                {selectedWeight.price === 'pvt' ? 'Su richiesta' : `€${selectedWeight.price}`}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContact}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(217,120,47,0.24), rgba(143,166,74,0.14))',
                border: '1px solid rgba(217,120,47,0.48)',
                color: '#D9782F',
                cursor: 'pointer',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 800,
                fontSize: '13px',
                letterSpacing: '1.5px',
              }}
            >
              <MessageCircle size={17} />
              RICHIEDI INFORMAZIONI
            </motion.button>
          </div>
        </motion.article>
      </motion.div>

      <AnimatePresence>
        {galleryOpen && (
          <GalleryModal images={imageUrls} startIndex={galleryStart} onClose={() => setGalleryOpen(false)} />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 720px) {
          .product-detail-modal {
            width: calc(100vw - 28px) !important;
            max-height: 90vh !important;
          }
        }
      `}</style>
    </>
  );
}
