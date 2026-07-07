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
        if (active) setProductList(apiProducts);
      })
      .catch(() => {
        if (active) setProductList([]);
      });

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
      list = list.filter(product => product.category === activeCategory);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        product =>
          product.name.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          product.origin.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q),
      );
    }

    return list;
  }, [query, activeCategory, productList]);

  return (
    <main className="fluent-page fluent-route-page">
      <motion.section
        className="fluent-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26 }}
      >
        <div className="fluent-panel-head">
          <h1>Catalogo</h1>
          <span>{filtered.length}</span>
        </div>

        <div className="fluent-toolbar">
          <div className="fluent-search">
            <Search size={16} />
            <input type="text" placeholder="Cerca" value={query} onChange={event => setQuery(event.target.value)} />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Cancella ricerca">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="fluent-segments">
            {categoryList.map(category => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="fluent-empty">
            <Search size={36} />
            <p>Nessun prodotto</p>
          </div>
        ) : (
          <div className="fluent-product-grid">
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onOpenDetail={setSelectedProduct} />
            ))}
          </div>
        )}
      </motion.section>

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
    </main>
  );
}
