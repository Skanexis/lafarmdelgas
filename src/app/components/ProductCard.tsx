import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Snowflake, Star, Eye } from 'lucide-react';
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
        background: 'rgba(18,12,7,0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(217,120,47,0.22)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div
        style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', cursor: 'pointer' }}
        onClick={openDetail}
      >
        <img
          src={imageError ? 'https://placehold.co/400x300/1a1a1a/333?text=No+Image' : primaryImage}
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
            background: 'linear-gradient(to top, rgba(9,6,4,0.9) 0%, transparent 60%)',
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
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1.5px',
              ...(product.badge === 'FROZEN'
                ? {
                    background: 'rgba(126,166,160,0.2)',
                    border: '1px solid rgba(126,166,160,0.5)',
                    color: '#7EA6A0',
                  }
                : {
                    background: 'rgba(217,120,47,0.2)',
                    border: '1px solid rgba(217,120,47,0.5)',
                    color: '#D9782F',
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
              background: 'rgba(143,166,74,0.2)',
              border: '1px solid rgba(143,166,74,0.4)',
              color: '#8FA64A',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            NUOVO
          </div>
        )}

        {/* Image count */}
        {product.images.length + (product.videoUrl ? 1 : 0) > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '11px',
            }}
          >
            <Eye size={12} />
            {product.images.length + (product.videoUrl ? 1 : 0)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="product-card-content" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <div onClick={openDetail} style={{ cursor: 'pointer' }}>
          <p
            className="product-card-origin"
            style={{
              color: '#F3C66A',
              fontSize: '11px',
              letterSpacing: '2px',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            {product.origin}
          </p>
          <h3
            className="product-card-title"
            style={{
              color: '#F2E2C4',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '0.5px',
              marginBottom: '2px',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h3>
          <p className="product-card-brand" style={{ color: 'rgba(242,226,196,0.45)', fontSize: '12px' }}>{product.brand}</p>
        </div>

        {/* Weight selector */}
        <div>
          <p className="product-card-weight-label" style={{ color: 'rgba(242,226,196,0.4)', fontSize: '11px', marginBottom: '8px', letterSpacing: '1px' }}>
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
                      ? '1px solid #D9782F'
                      : '1px solid rgba(217,120,47,0.2)',
                  background:
                    selectedWeight.weight === w.weight
                      ? 'rgba(217,120,47,0.2)'
                      : 'rgba(255,255,255,0.03)',
                  color: selectedWeight.weight === w.weight ? '#D9782F' : 'rgba(242,226,196,0.5)',
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
                  border: '1px solid rgba(123,74,136,0.3)',
                  background: 'rgba(123,74,136,0.08)',
                  color: '#7B4A88',
                  letterSpacing: '0.5px',
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
                      background: 'linear-gradient(135deg, #D9782F, #F3C66A)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '24px',
                      fontWeight: 800,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    €{selectedWeight.price}
                  </span>
                  <span style={{ color: 'rgba(242,226,196,0.4)', fontSize: '12px' }}>
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
              background: '#D9782F',
              border: '1px solid rgba(217,120,47,0.4)',
              color: '#090604',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              boxShadow: 'none',
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
