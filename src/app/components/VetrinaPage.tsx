import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import type { Product } from '../data/products';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { fetchCategories, fetchProducts } from '../api/client';

export default function VetrinaPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tutti');
  const [productList, setProductList] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<string[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;

    fetchProducts()
      .then(apiProducts => {
        if (active) {
          setProductList(apiProducts);
        }
      })
      .catch(() => {
        if (active) {
          setProductList([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetchCategories()
      .then(categories => {
        if (active) setAdminCategories(categories);
      })
      .catch(() => {
        if (active) setAdminCategories(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const categoryList = useMemo(() => {
    const source = adminCategories ?? productList.map(product => product.category);
    const uniqueCategories = Array.from(new Set(source.filter(Boolean)));
    return ['Tutti', ...uniqueCategories];
  }, [adminCategories, productList]);

  useEffect(() => {
    if (!categoryList.includes(activeCategory)) {
      setActiveCategory('Tutti');
    }
  }, [activeCategory, categoryList]);

  const filtered = useMemo(() => {
    let list = [...productList];

    if (activeCategory !== 'Tutti') {
      list = list.filter(p => p.category === activeCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    return list;
  }, [query, activeCategory, productList]);

  return (
    <div
      className="vetrina-page"
      style={{
        minHeight: '100vh',
        padding: '40px 24px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
        background:
          'radial-gradient(circle at 12% 0%, rgba(217,120,47,0.12), transparent 28%), radial-gradient(circle at 88% 8%, rgba(143,166,74,0.08), transparent 30%)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <p
          style={{
            color: '#F3C66A',
            fontSize: '12px',
            letterSpacing: '4px',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          LA FARM DEL GAS
        </p>
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(28px, 5vw, 52px)',
            letterSpacing: '3px',
            color: '#F2E2C4',
            textShadow: '0 8px 26px rgba(0,0,0,0.38)',
            marginBottom: '0',
          }}
        >
          CATALOGO SELEZIONATO
        </h1>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(217,120,47,0.6)',
            }}
          />
          <input
            type="text"
            placeholder="Cerca nella vetrina…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 40px 13px 44px',
              background: 'rgba(18,12,7,0.84)',
              border: '1px solid rgba(217,120,47,0.25)',
              borderRadius: '8px',
              color: '#F2E2C4',
              fontSize: '14px',
              outline: 'none',
              fontFamily: "'Poppins', sans-serif",
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(217,120,47,0.6)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(217,120,47,0.25)')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(242,226,196,0.4)',
                display: 'flex',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Category chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categoryList.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border:
                    activeCategory === cat
                      ? '1px solid #F3C66A'
                      : '1px solid rgba(143,166,74,0.2)',
                  background:
                    activeCategory === cat
                      ? 'rgba(217,120,47,0.18)'
                      : 'rgba(255,255,255,0.03)',
                  color: activeCategory === cat ? '#F3C66A' : 'rgba(242,226,196,0.55)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: 'rgba(242,226,196,0.35)', fontSize: '12px' }}>
          {filtered.length} prodott{filtered.length === 1 ? 'o' : 'i'} trovat{filtered.length === 1 ? 'o' : 'i'}
        </p>
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'rgba(242,226,196,0.3)',
          }}
        >
          <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '18px' }}>Nessun prodotto trovato</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Prova a modificare i filtri di ricerca</p>
        </motion.div>
      ) : (
        <div
          className="product-grid"
          style={{
            display: 'grid',
            gap: '24px',
          }}
        >
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} onOpenDetail={setSelectedProduct} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onContact={() => {
              setSelectedProduct(null);
              navigate('/contatti');
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media (min-width: 720px) {
          .product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px !important;
          }
        }

        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 22px !important;
          }
        }

        @media (min-width: 1320px) {
          .product-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 24px !important;
          }
        }

        @media (max-width: 719px) {
          .vetrina-page {
            padding: 28px 12px 64px !important;
          }

          .product-grid {
            gap: 10px !important;
          }

          .product-card {
            border-radius: 6px !important;
          }

          .product-card-content {
            padding: 10px !important;
            gap: 8px !important;
          }

          .product-card-badge {
            top: 7px !important;
            left: 7px !important;
            padding: 3px 6px !important;
            font-size: 8px !important;
            letter-spacing: 0.7px !important;
          }

          .product-card-new-badge {
            right: 7px !important;
            left: auto !important;
          }

          .product-card-origin {
            font-size: 9px !important;
            letter-spacing: 1px !important;
            margin-bottom: 3px !important;
          }

          .product-card-title {
            font-size: 12px !important;
            line-height: 1.22 !important;
            letter-spacing: 0 !important;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .product-card-brand {
            font-size: 10px !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .product-card-weight-label {
            display: none;
          }

          .product-card-weight-button,
          .product-card-bulk {
            padding: 4px 7px !important;
            font-size: 10px !important;
            border-radius: 4px !important;
          }

          .product-card-price-row {
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px;
          }

          .product-card-price {
            font-size: 18px !important;
          }

          .product-card-detail-button {
            width: 100%;
            justify-content: center;
            padding: 7px 8px !important;
            font-size: 10px !important;
            letter-spacing: 0.4px !important;
          }
        }
      `}</style>
    </div>
  );
}
