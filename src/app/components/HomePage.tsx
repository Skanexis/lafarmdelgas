import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Check, Copy, ExternalLink, Instagram, Menu, MessageCircle, Search, ShoppingBag, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../data/products';
import type { ContactSettings } from '../api/client';
import { fetchCategories, fetchContacts, fetchProducts, fetchSettings, resolveMediaUrl } from '../api/client';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';

type ActivePanel = 'catalogo' | 'canali' | null;

const defaultContacts: ContactSettings = {
  whatsappGroupName: 'TERPS DRAGON',
  whatsappGroupUrl: 'https://chat.whatsapp.com/',
  whatsappContactLabel: '+39 333 000 0000',
  whatsappContactUrl: 'https://wa.me/393330000000',
  instagramLabel: '@terpsdragon',
  instagramUrl: 'https://instagram.com/terpsdragon',
};

export default function HomePage() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>('catalogo');
  const [logoUrl, setLogoUrl] = useState('');
  const [heroMediaUrl, setHeroMediaUrl] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tutti');
  const [productList, setProductList] = useState<Product[]>([]);
  const [adminCategories, setAdminCategories] = useState<string[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);

  useEffect(() => {
    let active = true;

    fetchSettings()
      .then(settings => {
        if (!active) return;
        setLogoUrl(resolveMediaUrl(settings.logoUrl));
        setHeroMediaUrl(resolveMediaUrl(settings.heroMediaUrl));
      })
      .catch(() => {
        if (!active) return;
        setLogoUrl('');
        setHeroMediaUrl('');
      });

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

    fetchContacts()
      .then(apiContacts => {
        if (active) setContacts(apiContacts);
      })
      .catch(() => {
        if (active) setContacts(defaultContacts);
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

  const filteredProducts = useMemo(() => {
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
  }, [activeCategory, productList, query]);

  const openPanel = (panel: ActivePanel) => {
    setActivePanel(current => (current === panel ? null : panel));

    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <main className="fluent-page">
      <section className="fluent-hero">
        {heroMediaUrl && <img className="fluent-hero-media" src={heroMediaUrl} alt="" />}
        <div className="fluent-hero-scrim" />

        <header className="fluent-topbar">
          <div className="fluent-brand">
            <div className="fluent-brand-mark">
              {logoUrl ? <img src={logoUrl} alt="" /> : <span>TD</span>}
            </div>
            <span>TERPS DRAGON</span>
          </div>

          <button type="button" className="fluent-icon-button" aria-label="Canali" onClick={() => openPanel('canali')}>
            <Menu size={21} />
          </button>
        </header>

        <motion.div
          className="fluent-hero-content"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="fluent-logo-stage">
            {logoUrl ? (
              <img className="fluent-logo" src={logoUrl} alt="TERPS DRAGON" />
            ) : (
              <div className="fluent-logo-fallback">
                <span>TERPS</span>
                <strong>DRAGON</strong>
              </div>
            )}
          </div>

          <h1>TERPS DRAGON</h1>

          <div className="fluent-actions" aria-label="Sezioni">
            <PanelButton active={activePanel === 'catalogo'} icon={<ShoppingBag size={19} />} label="Catalogo" onClick={() => openPanel('catalogo')} />
            <PanelButton active={activePanel === 'canali'} icon={<MessageCircle size={19} />} label="Canali" onClick={() => openPanel('canali')} />
          </div>
        </motion.div>
      </section>

      <div ref={contentRef} className="fluent-panel-wrap">
        <AnimatePresence mode="wait">
          {activePanel === 'catalogo' && (
            <motion.section
              key="catalogo"
              className="fluent-panel"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="fluent-panel-head">
                <h2>Catalogo</h2>
                <span>{filteredProducts.length}</span>
              </div>

              <div className="fluent-toolbar">
                <div className="fluent-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Cerca"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                  />
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

              {filteredProducts.length === 0 ? (
                <div className="fluent-empty">
                  <Search size={36} />
                  <p>Nessun prodotto</p>
                </div>
              ) : (
                <div className="fluent-product-grid">
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} onOpenDetail={setSelectedProduct} />
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {activePanel === 'canali' && (
            <motion.section
              key="canali"
              className="fluent-panel fluent-panel-narrow"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22 }}
            >
              <div className="fluent-panel-head">
                <h2>Canali</h2>
              </div>

              <div className="fluent-contact-grid">
                <ContactCard icon={<Users size={21} />} label="Gruppo" value={contacts.whatsappGroupName} href={contacts.whatsappGroupUrl} index={0} />
                <ContactCard icon={<MessageCircle size={21} />} label="WhatsApp" value={contacts.whatsappContactLabel} href={contacts.whatsappContactUrl} index={1} />
                <ContactCard icon={<Instagram size={21} />} label="Instagram" value={contacts.instagramLabel} href={contacts.instagramUrl} index={2} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onContact={() => {
              setSelectedProduct(null);
              setActivePanel('canali');
              window.setTimeout(() => {
                contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 80);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function PanelButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      className={`fluent-action-button${active ? ' active' : ''}`}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  index,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copiato`);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Copia non riuscita');
    }
  };

  return (
    <motion.div
      className="fluent-contact-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ delay: index * 0.06, duration: 0.2 }}
    >
      <div className="fluent-contact-main">
        <div className="fluent-contact-icon">{icon}</div>
        <div>
          <p>{label}</p>
          <strong>{value}</strong>
        </div>
      </div>

      <div className="fluent-contact-actions">
        <a href={href} target="_blank" rel="noreferrer" aria-label={`Apri ${label}`}>
          <ExternalLink size={15} />
        </a>
        <button type="button" onClick={handleCopy} aria-label={`Copia ${label}`}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </motion.div>
  );
}
