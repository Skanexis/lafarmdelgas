import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { fetchProduct } from '../api/client';
import type { Product } from '../data/products';
import { ProductDetailModal } from './ProductDetailModal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);
    fetchProduct(id)
      .then(apiProduct => {
        if (active) setProduct(apiProduct);
      })
      .catch(() => {
        if (active) setProduct(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="fluent-state-page">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fluent-state-page">
        <p>Prodotto non trovato</p>
        <Link to="/vetrina">
          Catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="fluent-detail-route">
      <ProductDetailModal
        product={product}
        onClose={() => navigate('/vetrina')}
        onContact={() => navigate('/contatti')}
      />
    </div>
  );
}
