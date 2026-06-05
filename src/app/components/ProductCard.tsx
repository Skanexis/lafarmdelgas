import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Snowflake, Star, Eye, Play } from 'lucide-react';
import type { Product } from '../data/products';
import { resolveMediaUrl } from '../api/client';

interface ProductCardProps {
  product: Product;
  index: number;
  onOpenDetail?: (product: Product) => void;
}

export function ProductCard({ product, index, onOpenDetail }: ProductCardProps) {
  const navigate = useNavigate();
  const [selectedWeight, setSelectedWeight] = useState(product.weights[0]);
  const [imageError, setImageError] = useState(false);

  const numericWeights = product.weights.filter(w => w.price !== 'pvt');
  const pvtWeights = product.weights.filter(w => w.price === 'pvt');
  const primaryImage = resolveMediaUrl(product.images[0]);
  const mediaCount = getProductMediaCount(product);
  const hasVideo = Boolean(product.videoUrl || product.files?.some(file => file.type === 'video'));
  const openDetail = () => {
    if (onOpenDetail) {
      onOpenDetail(product);
      return;
    }

    navigate(`/vetrina/${product.id}`);
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      whileHover={{
        y: -4,
        boxShadow: '0 18px 42px rgba(0,0,0,0.42)',
      }}
      style={{
        position: 'relative',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025) 38%, rgba(2,4,3,0.92)), #050705',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(57,255,20,0.22)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 16px 44px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(115deg, transparent 0%, rgba(57,255,20,0.08) 34%, transparent 56%), radial-gradient(circle at 18% 0%, rgba(244,201,93,0.16), transparent 34%)',
          opacity: 0.9,
          zIndex: 1,
        }}
      />

      {/* Image */}
      <div
        className="product-card-media"
        style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', cursor: 'pointer', background: '#020403' }}
        onClick={openDetail}
      >
        <img
          src={imageError ? 'https://placehold.co/400x300/020403/39ff14?text=LA+FARM' : primaryImage}
          alt={product.name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(2,4,3,0.96) 0%, rgba(2,4,3,0.38) 48%, transparent 78%), linear-gradient(135deg, rgba(57,255,20,0.18), transparent 42%)',
          }}
        />

        <div
          className="product-card-grid-glow"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(57,255,20,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(244,201,93,0.04) 1px, transparent 1px)',
            backgroundSize: '42px 42px',
            opacity: 0.62,
            maskImage: 'linear-gradient(to top, black, transparent 72%)',
          }}
        />

        {/* Badge */}
        {product.badge && (
          <div
            className="product-card-badge"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
                  gap: '5px',
              padding: '5px 11px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '1.5px',
              ...(product.badge === 'FROZEN'
                ? {
                    background: 'rgba(57,255,20,0.16)',
                    border: '1px solid rgba(57,255,20,0.48)',
                    color: '#39ff14',
                    boxShadow: '0 0 18px rgba(57,255,20,0.18)',
                  }
                : {
                    background: 'rgba(244,201,93,0.18)',
                    border: '1px solid rgba(244,201,93,0.54)',
                    color: '#f4c95d',
                    boxShadow: '0 0 18px rgba(244,201,93,0.2)',
                  }),
            }}
          >
            {product.badge === 'FROZEN' ? <Snowflake size={11} /> : <Star size={11} />}
            {product.badge}
          </div>
        )}

        {/* NEW badge */}
        {product.isNew && (
          <div
            className="product-card-badge product-card-new-badge"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(57,255,20,0.18)',
              border: '1px solid rgba(57,255,20,0.44)',
              color: '#39ff14',
              fontSize: '10px',
              fontWeight: 900,
              letterSpacing: '1px',
              boxShadow: '0 0 18px rgba(57,255,20,0.22)',
            }}
          >
            NUOVO
          </div>
        )}

        {hasVideo && (
          <div
            className="product-card-play"
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#020403',
              background: 'linear-gradient(135deg, #39ff14, #f4c95d)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 0 24px rgba(57,255,20,0.32)',
            }}
          >
            <Play size={15} fill="currentColor" />
          </div>
        )}

        {/* Image count */}
        {mediaCount > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'rgba(244,244,239,0.78)',
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '999px',
              background: 'rgba(2,4,3,0.72)',
              border: '1px solid rgba(57,255,20,0.24)',
            }}
          >
            <Eye size={12} />
            {mediaCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="product-card-content"
        style={{ position: 'relative', zIndex: 2, padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}
      >
        <div onClick={openDetail} style={{ cursor: 'pointer' }}>
          <p
            className="product-card-origin"
            style={{
              color: '#39ff14',
              fontSize: '11px',
              letterSpacing: '2px',
              marginBottom: '4px',
              textTransform: 'uppercase',
              fontWeight: 900,
              textShadow: '0 0 16px rgba(57,255,20,0.28)',
            }}
          >
            {product.origin}
          </p>
          <h3
            className="product-card-title"
            style={{
              color: '#f4f4ef',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: '16px',
              letterSpacing: 0,
              marginBottom: '2px',
              lineHeight: 1.3,
              textTransform: 'uppercase',
              textShadow: '0 10px 26px rgba(0,0,0,0.42)',
            }}
          >
            {product.name}
          </h3>
          <p className="product-card-brand" style={{ color: 'rgba(244,244,239,0.48)', fontSize: '12px', fontWeight: 700 }}>{product.brand}</p>
        </div>

        {/* Weight selector */}
        <div>
          <p className="product-card-weight-label" style={{ color: 'rgba(244,201,93,0.7)', fontSize: '10px', marginBottom: '8px', letterSpacing: '1.8px', fontWeight: 900 }}>
            SELEZIONA QUANTITÀ
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {numericWeights.map(w => (
              <button
                className="product-card-weight-button"
                key={w.weight}
                onClick={() => setSelectedWeight(w)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border:
                    selectedWeight.weight === w.weight
                      ? '1px solid rgba(57,255,20,0.72)'
                      : '1px solid rgba(244,244,239,0.12)',
                  background:
                    selectedWeight.weight === w.weight
                      ? 'linear-gradient(135deg, rgba(57,255,20,0.2), rgba(244,201,93,0.12))'
                      : 'rgba(255,255,255,0.035)',
                  color: selectedWeight.weight === w.weight ? '#39ff14' : 'rgba(244,244,239,0.56)',
                  boxShadow: selectedWeight.weight === w.weight ? '0 0 16px rgba(57,255,20,0.14)' : 'none',
                }}
              >
                {w.weight}
              </button>
            ))}
            {pvtWeights.length > 0 && (
              <div
                className="product-card-bulk"
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  border: '1px solid rgba(244,201,93,0.32)',
                  background: 'rgba(244,201,93,0.08)',
                  color: '#f4c95d',
                  letterSpacing: '0.5px',
                  fontWeight: 900,
                }}
              >
                +bulk
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="product-card-price-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedWeight.weight}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              {selectedWeight.price === 'pvt' ? (
                <span style={{ color: '#7B4A88', fontSize: '16px', fontWeight: 700 }}>In pvt</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span
                    className="product-card-price"
                    style={{
                      background: 'linear-gradient(135deg, #39ff14, #d7ff57 42%, #f4c95d)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '24px',
                      fontWeight: 900,
                      fontFamily: "'Montserrat', sans-serif",
                      filter: 'drop-shadow(0 0 12px rgba(57,255,20,0.22))',
                    }}
                  >
                    €{selectedWeight.price}
                  </span>
                  <span style={{ color: 'rgba(244,244,239,0.42)', fontSize: '12px' }}>
                    / {selectedWeight.weight}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

            <motion.button
            className="product-card-detail-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openDetail}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #39ff14, #b7ff4a 58%, #f4c95d)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: '#020403',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '0.7px',
              boxShadow: '0 10px 28px rgba(57,255,20,0.18)',
            }}
          >
            <ExternalLink size={13} />
            DETTAGLIO
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function getProductMediaCount(product: Product) {
  const mediaUrls = new Set<string>();

  for (const file of product.files || []) {
    if ((file.type === 'image' || file.type === 'video') && file.url) {
      mediaUrls.add(resolveMediaUrl(file.url));
    }
  }

  for (const image of product.images || []) {
    if (image) mediaUrls.add(resolveMediaUrl(image));
  }

  if (product.videoUrl) {
    mediaUrls.add(resolveMediaUrl(product.videoUrl));
  }

  return mediaUrls.size;
}
