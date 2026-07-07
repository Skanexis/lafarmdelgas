import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ExternalLink, Eye, Play, Snowflake, Star } from 'lucide-react';
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
    <motion.article
      className="product-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ delay: Math.min(index * 0.035, 0.24), duration: 0.32 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.997 }}
    >
      <button className="product-card-media" onClick={openDetail} type="button" aria-label={`Apri ${product.name}`}>
        <img
          className="product-card-image"
          src={imageError ? 'https://placehold.co/500x380/060606/e81123?text=TERPS+DRAGON' : primaryImage}
          alt={product.name}
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {product.badge && (
          <span className={`product-card-badge ${product.badge === 'FROZEN' ? 'frozen' : 'standard'}`}>
            {product.badge === 'FROZEN' ? <Snowflake size={11} /> : <Star size={11} />}
            {product.badge}
          </span>
        )}

        {product.isNew && <span className="product-card-badge product-card-new-badge">New</span>}

        {hasVideo && (
          <span className="product-card-play">
            <Play size={14} fill="currentColor" />
          </span>
        )}

        {mediaCount > 1 && (
          <span className="product-card-media-count">
            <Eye size={12} />
            {mediaCount}
          </span>
        )}
      </button>

      <div className="product-card-content">
        <button className="product-card-header" onClick={openDetail} type="button">
          <span className="product-card-origin">{product.origin}</span>
          <h3 className="product-card-title">{product.name}</h3>
          <span className="product-card-brand">{product.brand}</span>
        </button>

        <div className="product-card-weight-list">
          {numericWeights.map(weight => (
            <button
              className={`product-card-weight-button ${selectedWeight.weight === weight.weight ? 'selected' : ''}`}
              key={weight.weight}
              onClick={() => setSelectedWeight(weight)}
              type="button"
            >
              <span>{weight.weight}</span>
              <span>{weight.price === 'pvt' ? 'PVT' : `€${weight.price}`}</span>
            </button>
          ))}
          {pvtWeights.length > 0 && <div className="product-card-bulk">PVT</div>}
        </div>

        <div className="product-card-price-row">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedWeight.weight}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
            >
              {selectedWeight.price === 'pvt' ? (
                <span className="product-card-pvt">PVT</span>
              ) : (
                <div className="product-card-price-stack">
                  <span className="product-card-price">€{selectedWeight.price}</span>
                  <span className="product-card-price-unit">/{selectedWeight.weight}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.button
            className="product-card-detail-button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openDetail}
            type="button"
            aria-label={`Dettaglio ${product.name}`}
          >
            <ExternalLink size={14} />
            <span>Apri</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
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
