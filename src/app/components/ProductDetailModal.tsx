import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
  Play,
  Snowflake,
  Star,
  Tag,
  MapPin,
  ZoomIn,
  X,
} from 'lucide-react';
import type { Product } from '../data/products';
import { resolveMediaUrl } from '../api/client';
import { GalleryModal } from './GalleryModal';
import type { GalleryMediaItem } from './GalleryModal';

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
  const productMedia = buildProductMedia(product);
  const activeMedia = productMedia[activeImage] || productMedia[0];

  useEffect(() => {
    setActiveImage(0);
    setGalleryOpen(false);
  }, [product.id]);

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
        className="product-detail-overlay"
      >
        <motion.article
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          onClick={event => event.stopPropagation()}
          className="product-detail-modal"
        >
          <div className="product-detail-hero">
            <AnimatePresence mode="wait">
              {activeMedia?.type === 'video' ? (
                <motion.video
                  key={activeMedia.url}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.24 }}
                  src={activeMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="product-detail-media"
                />
              ) : (
                <motion.img
                  key={activeMedia?.url || activeImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.24 }}
                  src={activeMedia?.url}
                  alt={product.name}
                  decoding="async"
                  className="product-detail-media"
                />
              )}
            </AnimatePresence>

            <div className="product-detail-hero-overlay" />

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              aria-label="Chiudi dettaglio"
              className="product-detail-close"
            >
              <X size={17} />
            </motion.button>

            {product.badge && (
              <div className={`product-detail-badge ${product.badge === 'FROZEN' ? 'frozen' : 'standard'}`}>
                {product.badge === 'FROZEN' ? <Snowflake size={11} /> : <Star size={11} />}
                {product.badge}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setGalleryStart(activeImage);
                setGalleryOpen(true);
              }}
              className="product-detail-zoom"
              aria-label="Zoom"
            >
              <ZoomIn size={13} />
            </motion.button>

            {activeImage > 0 && (
              <motion.button
                className="product-detail-nav-button prev"
                onClick={() => setActiveImage(i => i - 1)}
                aria-label="Media precedente"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <ChevronLeft size={18} />
              </motion.button>
            )}

            {activeImage < productMedia.length - 1 && (
              <motion.button
                className="product-detail-nav-button next"
                onClick={() => setActiveImage(i => i + 1)}
                aria-label="Media successivo"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            )}
          </div>

          <div className="product-detail-body">
            {productMedia.length > 1 && (
              <div className="product-detail-thumb-row">
                {productMedia.map((item, i) => (
                  <button
                  key={`${item.type}-${item.url}`}
                  onClick={() => setActiveImage(i)}
                  className={`product-detail-thumb ${i === activeImage ? 'active' : ''}`}
                >
                    {item.type === 'video' ? (
                      <>
                        <video
                          src={item.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="product-detail-thumb-media"
                        />
                        <span className="product-detail-thumb-play">
                          <Play size={13} fill="currentColor" />
                        </span>
                      </>
                    ) : (
                      <img
                        className="product-detail-thumb-media"
                        src={item.url}
                        alt={`Thumb ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="product-detail-meta">
              <MapPin size={13} />
              <span className="product-detail-origin">{product.origin}</span>
              {product.isNew && <span className="product-detail-new-chip">New</span>}
            </div>

            <div>
              <h2 className="product-detail-title">
                {product.name}
              </h2>
              <p className="product-detail-brand">{product.brand}</p>
            </div>

            <p className="product-detail-description">
              {product.description}
            </p>

            <div>
              <p className="product-detail-price-label">
                Tagli
              </p>
              <div className="product-detail-weight-grid">
                {product.weights.map(weight => {
                  const selected = selectedWeight.weight === weight.weight;
                  return (
                    <button
                      key={weight.weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`product-detail-weight-button ${selected ? 'selected' : ''}`}
                      type="button"
                    >
                      <div>
                        <span className="product-detail-weight-name">
                          {weight.weight}
                        </span>
                        <span className="product-detail-weight-price">
                          {weight.price === 'pvt' ? 'In pvt' : `€${weight.price}`}
                        </span>
                      </div>
                      {selected && <Check size={14} className="product-detail-weight-selected-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="product-detail-price-summary">
              <span className="product-detail-price-note">
                <Tag size={14} /> {selectedWeight.weight}
              </span>
              <span className="product-detail-price-highlight">
                {selectedWeight.price === 'pvt' ? 'Su richiesta' : `€${selectedWeight.price}`}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContact}
              className="product-detail-contact-button"
            >
              <MessageCircle size={17} />
              Info
            </motion.button>
          </div>
        </motion.article>
      </motion.div>

      <AnimatePresence>
        {galleryOpen && (
          <GalleryModal media={productMedia} startIndex={galleryStart} onClose={() => setGalleryOpen(false)} />
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 720px) {
          .product-detail-overlay {
            align-items: flex-end !important;
            padding: 0 10px max(10px, env(safe-area-inset-bottom)) !important;
          }

          .product-detail-modal {
            width: min(520px, calc(100vw - 20px)) !important;
            max-height: min(92svh, 760px) !important;
            border-radius: 8px 8px 0 0 !important;
          }

          .product-detail-hero {
            max-height: 42svh !important;
          }

          .product-detail-body {
            padding: 14px !important;
            gap: 12px !important;
          }

          .product-detail-title {
            font-size: 23px !important;
            letter-spacing: 0.4px !important;
            overflow-wrap: anywhere !important;
          }

          .product-detail-description {
            font-size: 12px !important;
            line-height: 1.55 !important;
          }

          .product-detail-meta {
            flex-wrap: wrap !important;
          }

          .product-detail-new-chip {
            margin-left: 0 !important;
          }

          .product-detail-contact-button {
            min-height: 48px !important;
            text-align: center !important;
            line-height: 1.2 !important;
          }
        }

        @media (max-width: 420px) {
          .product-detail-overlay {
            padding: 0 !important;
          }

          .product-detail-modal {
            width: 100vw !important;
            max-height: 94svh !important;
            border-radius: 8px 8px 0 0 !important;
            border-left: 0 !important;
            border-right: 0 !important;
            border-bottom: 0 !important;
          }

          .product-detail-hero {
            aspect-ratio: 1.12 !important;
            max-height: 38svh !important;
          }

          .product-detail-close,
          .product-detail-nav-button {
            width: 38px !important;
            height: 38px !important;
          }

          .product-detail-thumb {
            width: 62px !important;
            height: 46px !important;
          }

          .product-detail-price-summary {
            align-items: flex-start !important;
          }
        }

        @media (max-width: 360px) {
          .product-detail-weight-grid {
            grid-template-columns: 1fr !important;
          }

          .product-detail-price-summary {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .product-detail-contact-button {
            font-size: 12px !important;
            letter-spacing: 0.8px !important;
          }
        }
      `}</style>
    </>
  );
}

function buildProductMedia(product: Product): GalleryMediaItem[] {
  const media: GalleryMediaItem[] = [];
  const seen = new Set<string>();

  const add = (type: 'image' | 'video', url?: string, label?: string) => {
    if (!url) return;
    const resolvedUrl = resolveMediaUrl(url);
    if (!resolvedUrl || seen.has(resolvedUrl)) return;
    seen.add(resolvedUrl);
    media.push({ type, url: resolvedUrl, label });
  };

  for (const file of product.files || []) {
    if (file.type === 'image' || file.type === 'video') {
      add(file.type, file.url, file.originalName || file.name);
    }
  }

  for (const image of product.images || []) {
    add('image', image, product.name);
  }

  add('video', product.videoUrl, `${product.name} video`);

  return media;
}
