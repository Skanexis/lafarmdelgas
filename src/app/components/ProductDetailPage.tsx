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
      <div
        style={{
          minHeight: 'calc(100vh - 73px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(242,226,196,0.5)',
        }}
      >
        <p style={{ fontSize: '18px' }}>Caricamento prodotto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 73px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          color: 'rgba(242,226,196,0.5)',
        }}
      >
        <p style={{ fontSize: '24px' }}>Prodotto non trovato</p>
        <Link to="/vetrina" style={{ color: '#D9782F', textDecoration: 'none', fontSize: '14px' }}>
          Torna alla vetrina
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 73px)' }}>
      <ProductDetailModal
        product={product}
        onClose={() => navigate('/vetrina')}
        onContact={() => navigate('/contatti')}
      />
    </div>
  );
}
