import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Check, Copy, ExternalLink, Instagram, Menu, MessageCircle, Search, Store, Users, X, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../data/products';
import type { ContactSettings } from '../api/client';
import { fetchCategories, fetchContacts, fetchProducts, fetchSettings, resolveMediaUrl } from '../api/client';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';

type ActivePanel = 'catalogo' | 'canali' | null;

const defaultContacts: ContactSettings = {
  whatsappGroupName: 'LA FARM DEL GAS',
  whatsappGroupUrl: 'https://chat.whatsapp.com/',
  whatsappContactLabel: '+39 333 000 0000',
  whatsappContactUrl: 'https://wa.me/393330000000',
  instagramLabel: '@lafarmdelgas',
  instagramUrl: 'https://instagram.com/lafarmdelgas',
};

export default function HomePage() {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
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
    <main className="farm-onepage">
      <section className="farm-hero">
        {heroMediaUrl && <img className="farm-hero-media" src={heroMediaUrl} alt="" />}
        <div className="farm-hero-shade" />
        <div className="farm-hero-grid" />
        <div className="farm-scanline" aria-hidden="true" />
        <div className="farm-light farm-light-left" aria-hidden="true" />
        <div className="farm-light farm-light-right" aria-hidden="true" />
        <div className="farm-neon-line farm-neon-line-a" aria-hidden="true" />
        <div className="farm-neon-line farm-neon-line-b" aria-hidden="true" />

        <div className="farm-topbar">
          <div className="farm-topbrand">
            <div className="farm-topmark">
              {logoUrl ? <img src={logoUrl} alt="" /> : <span>LF</span>}
            </div>
            <span>LA FARM DEL GAS</span>
          </div>

          <button
            type="button"
            className="farm-menu-button"
            aria-label="Apri canali"
            onClick={() => openPanel('canali')}
          >
            <Menu size={22} />
          </button>
        </div>

        <motion.div
          className="farm-hero-inner"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="farm-logo-wrap">
            <span className="farm-logo-ring farm-logo-ring-a" aria-hidden="true" />
            <span className="farm-logo-ring farm-logo-ring-b" aria-hidden="true" />
            {logoUrl ? (
              <img className="farm-logo" src={logoUrl} alt="LA FARM DEL GAS" />
            ) : (
              <div className="farm-logo-fallback">
                <span>LA</span>
                <strong>FARM</strong>
                <em>DEL GAS</em>
              </div>
            )}
          </div>

          <h1>LA FARM DEL GAS</h1>
          <p className="farm-hero-tagline">QUALITÀ PREMIUM · SELEZIONE DIRETTA · CANALI RISERVATI</p>
          <div className="farm-stars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="farm-actions" aria-label="Sezioni principali">
            <PanelButton
              active={activePanel === 'catalogo'}
              icon={<Zap size={20} />}
              label="CATALOGO"
              onClick={() => openPanel('catalogo')}
            />
            <PanelButton
              active={activePanel === 'canali'}
              icon={<MessageCircle size={20} />}
              label="CANALI"
              onClick={() => openPanel('canali')}
            />
          </div>
        </motion.div>
      </section>

      <div ref={contentRef} className="farm-panel-anchor">
        <AnimatePresence mode="wait">
          {activePanel === 'catalogo' && (
            <motion.section
              key="catalogo"
              className="farm-panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28 }}
            >
              <div className="farm-section-head">
                <p>Catalogo</p>
                <h2>SELEZIONE DISPONIBILE</h2>
              </div>

              <div className="farm-controls">
                <div className="farm-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Cerca prodotto"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} aria-label="Cancella ricerca">
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="farm-categories">
                  {categoryList.map(category => (
                    <button
                      key={category}
                      className={activeCategory === category ? 'active' : ''}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <p className="farm-results">
                {filteredProducts.length} prodott{filteredProducts.length === 1 ? 'o' : 'i'}
              </p>

              {filteredProducts.length === 0 ? (
                <div className="farm-empty">
                  <Search size={42} />
                  <p>Nessun prodotto trovato</p>
                </div>
              ) : (
                <div className="farm-product-grid">
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
              className="farm-panel farm-panel-narrow"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.28 }}
            >
              <div className="farm-section-head">
                <p>Canali</p>
                <h2>CANALI UFFICIALI</h2>
              </div>

              <div className="farm-contact-grid">
                <ContactCard
                  icon={<Users size={22} />}
                  label="Gruppo WhatsApp"
                  value={contacts.whatsappGroupName}
                  href={contacts.whatsappGroupUrl}
                  color="#39ff14"
                  index={0}
                />
                <ContactCard
                  icon={<MessageCircle size={22} />}
                  label="Contatto WhatsApp"
                  value={contacts.whatsappContactLabel}
                  href={contacts.whatsappContactUrl}
                  color="#f4c95d"
                  index={1}
                />
                <ContactCard
                  icon={<Instagram size={22} />}
                  label="Instagram"
                  value={contacts.instagramLabel}
                  href={contacts.instagramUrl}
                  color="#a855f7"
                  index={2}
                />
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
              openPanel('canali');
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .farm-onepage {
          min-height: 100vh;
          color: #f4f4ef;
          background:
            radial-gradient(circle at 22% 12%, rgba(57, 255, 20, 0.14), transparent 26%),
            radial-gradient(circle at 76% 20%, rgba(244, 201, 93, 0.12), transparent 28%),
            linear-gradient(180deg, #020403 0%, #090b08 48%, #020403 100%);
          overflow-x: hidden;
        }

        .farm-onepage::selection {
          background: rgba(57, 255, 20, 0.34);
          color: #ffffff;
        }

        .farm-hero {
          min-height: 100svh;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 92px 18px 72px;
          box-sizing: border-box;
          isolation: isolate;
        }

        .farm-topbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 4;
          min-height: 72px;
          padding: 14px clamp(16px, 4vw, 34px);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background:
            linear-gradient(180deg, rgba(10, 10, 9, 0.96), rgba(10, 10, 9, 0.84)),
            rgba(5, 5, 5, 0.9);
          border-bottom: 1px solid rgba(244, 201, 93, 0.18);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.36);
          backdrop-filter: blur(16px);
        }

        .farm-topbrand {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #f4f4ef;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .farm-topmark {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          overflow: visible;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 38%, rgba(244, 201, 93, 0.34), rgba(5, 5, 5, 0.92));
          border: 1px solid rgba(244, 201, 93, 0.36);
          color: #f4c95d;
          font-size: 10px;
          box-shadow: 0 0 16px rgba(244, 201, 93, 0.16);
        }

        .farm-topmark img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 50%;
        }

        .farm-menu-button {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background:
            radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.18), transparent 42%),
            linear-gradient(145deg, rgba(255, 64, 64, 0.72), rgba(104, 22, 22, 0.92));
          color: #fff6f6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 0 24px rgba(255, 64, 64, 0.28), 0 14px 30px rgba(0, 0, 0, 0.36);
          transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
          animation: farmMenuPulse 2.4s ease-in-out infinite;
        }

        .farm-menu-button:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 0 28px rgba(255, 64, 64, 0.36), 0 18px 34px rgba(0, 0, 0, 0.42);
        }

        .farm-hero-media {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.42;
          filter: saturate(1.1) contrast(1.08);
          z-index: -3;
          animation: farmHeroDrift 16s ease-in-out infinite alternate;
        }

        .farm-hero-shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(2, 4, 3, 0.7) 0%, rgba(2, 4, 3, 0.25) 46%, rgba(2, 4, 3, 0.92) 100%),
            radial-gradient(circle at 50% 42%, rgba(57, 255, 20, 0.12), transparent 38%);
          z-index: -2;
        }

        .farm-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(57, 255, 20, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244, 201, 93, 0.05) 1px, transparent 1px);
          background-size: 74px 74px;
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
          z-index: -1;
          animation: farmGridSlide 14s linear infinite;
        }

        .farm-scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: -20%;
          height: 22%;
          z-index: -1;
          pointer-events: none;
          background: linear-gradient(180deg, transparent, rgba(57, 255, 20, 0.08), transparent);
          filter: blur(1px);
          animation: farmScan 5.8s ease-in-out infinite;
        }

        .farm-light {
          position: absolute;
          width: min(34vw, 420px);
          aspect-ratio: 1;
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
          filter: blur(28px);
          opacity: 0.36;
          mix-blend-mode: screen;
          animation: farmPulseGlow 4.8s ease-in-out infinite;
        }

        .farm-light-left {
          left: -12vw;
          bottom: 14vh;
          background: radial-gradient(circle, rgba(57, 255, 20, 0.72), transparent 64%);
        }

        .farm-light-right {
          right: -14vw;
          top: 18vh;
          background: radial-gradient(circle, rgba(244, 201, 93, 0.56), transparent 66%);
          animation-delay: -2s;
        }

        .farm-neon-line {
          position: absolute;
          z-index: -1;
          pointer-events: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 210, 255, 0.9), rgba(57, 255, 20, 0.72), transparent);
          box-shadow: 0 0 18px rgba(0, 210, 255, 0.42);
          opacity: 0.56;
          animation: farmNeonLine 4.8s ease-in-out infinite;
        }

        .farm-neon-line-a {
          left: 8vw;
          right: 18vw;
          top: 26%;
        }

        .farm-neon-line-b {
          left: 18vw;
          right: 8vw;
          bottom: 19%;
          animation-delay: -2.2s;
          background: linear-gradient(90deg, transparent, rgba(244, 201, 93, 0.75), rgba(0, 210, 255, 0.76), transparent);
        }

        .farm-hero-inner {
          width: min(620px, 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .farm-logo-wrap {
          position: relative;
          width: clamp(210px, 34vw, 380px);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          border-radius: 50%;
          border: 1px solid rgba(244, 201, 93, 0.34);
          background: radial-gradient(circle at 50% 40%, rgba(0, 210, 255, 0.16), rgba(0, 0, 0, 0.5) 58%);
          box-shadow:
            0 0 0 10px rgba(255, 255, 255, 0.018),
            0 0 72px rgba(0, 210, 255, 0.22),
            0 0 42px rgba(244, 201, 93, 0.14),
            0 26px 90px rgba(0, 0, 0, 0.72);
          overflow: hidden;
          transform: rotate(-1deg);
          animation: farmLogoFloat 4.8s ease-in-out infinite;
        }

        .farm-logo-wrap::before {
          content: "";
          position: absolute;
          inset: -2px;
          pointer-events: none;
          background: linear-gradient(120deg, transparent 15%, rgba(255,255,255,0.28), transparent 45%);
          transform: translateX(-120%);
          animation: farmShine 4.2s ease-in-out infinite;
          z-index: 3;
        }

        .farm-logo-ring {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          pointer-events: none;
          border: 1px solid rgba(0, 210, 255, 0.26);
          box-shadow: 0 0 26px rgba(0, 210, 255, 0.24);
          animation: farmRingSpin 8s linear infinite;
        }

        .farm-logo-ring-b {
          inset: -22px;
          border-color: rgba(57, 255, 20, 0.18);
          box-shadow: 0 0 34px rgba(57, 255, 20, 0.16);
          animation-duration: 12s;
          animation-direction: reverse;
        }

        .farm-logo {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .farm-logo-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 52% 14%, rgba(244, 201, 93, 0.2), transparent 34%),
            linear-gradient(145deg, #141414, #020403);
          text-transform: uppercase;
          color: #f4f4ef;
          font-family: 'Montserrat', sans-serif;
          text-shadow: 0 0 22px rgba(57, 255, 20, 0.35);
        }

        .farm-logo-fallback span {
          font-size: 25px;
          font-weight: 900;
          color: #f4c95d;
        }

        .farm-logo-fallback strong {
          font-size: clamp(44px, 8vw, 82px);
          line-height: 0.9;
          font-weight: 900;
          letter-spacing: 0;
        }

        .farm-logo-fallback em {
          font-style: normal;
          font-size: clamp(28px, 5vw, 54px);
          line-height: 0.9;
          font-weight: 900;
          color: #39ff14;
        }

        .farm-hero h1 {
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(34px, 8vw, 86px);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
          color: #f4f4ef;
          text-shadow:
            0 1px 0 #9d9d9d,
            0 4px 22px rgba(0, 0, 0, 0.7),
            0 0 26px rgba(57, 255, 20, 0.2),
            0 0 46px rgba(0, 210, 255, 0.12);
          animation: farmTitleGlow 3.2s ease-in-out infinite alternate;
        }

        .farm-hero-tagline {
          width: min(470px, 100%);
          margin: 18px 0 0;
          color: rgba(244, 244, 239, 0.62);
          font-size: clamp(12px, 2.6vw, 15px);
          font-weight: 800;
          letter-spacing: 2.8px;
          line-height: 1.55;
          text-transform: uppercase;
          text-shadow: 0 0 18px rgba(0, 210, 255, 0.18);
        }

        .farm-stars {
          display: flex;
          gap: 8px;
          margin: 18px 0 28px;
        }

        .farm-stars span {
          width: 23px;
          height: 23px;
          clip-path: polygon(50% 0%, 61% 34%, 98% 34%, 68% 55%, 79% 91%, 50% 70%, 21% 91%, 32% 55%, 2% 34%, 39% 34%);
          background: linear-gradient(145deg, #fff2a6, #f4c95d 45%, #a66817);
          box-shadow: 0 0 16px rgba(244, 201, 93, 0.32);
          animation: farmStarPop 1.9s ease-in-out infinite;
        }

        .farm-stars span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .farm-stars span:nth-child(3) {
          animation-delay: 0.24s;
        }

        .farm-stars span:nth-child(4) {
          animation-delay: 0.36s;
        }

        .farm-stars span:nth-child(5) {
          animation-delay: 0.48s;
        }

        .farm-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          width: min(370px, 100%);
        }

        .farm-action-button {
          min-height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: 14px;
          border: 1px solid rgba(57, 255, 20, 0.52);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
            rgba(4, 7, 4, 0.84);
          color: #f4f4ef;
          font-family: 'Montserrat', sans-serif;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: 1.4px;
          cursor: pointer;
          box-shadow: inset 0 0 22px rgba(255, 255, 255, 0.03), 0 18px 38px rgba(0, 0, 0, 0.38);
          overflow: hidden;
          position: relative;
          transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
          animation: farmButtonBreath 3.6s ease-in-out infinite;
        }

        .farm-action-button::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.26) 44%, transparent 62%);
          transform: translateX(-120%);
          transition: transform 0.55s ease;
        }

        .farm-action-button:hover::after,
        .farm-action-button.active::after {
          transform: translateX(120%);
        }

        .farm-action-button.active,
        .farm-action-button:hover {
          border-color: rgba(57, 255, 20, 0.68);
          background:
            linear-gradient(145deg, rgba(57, 255, 20, 0.18), rgba(255, 255, 255, 0.025)),
            rgba(3, 9, 4, 0.92);
          color: #d9ffd2;
          box-shadow: 0 0 22px rgba(57, 255, 20, 0.14), 0 20px 46px rgba(0, 0, 0, 0.46);
        }

        .farm-action-button svg {
          filter: drop-shadow(0 0 8px rgba(57, 255, 20, 0.22));
        }

        .farm-panel-anchor {
          min-height: 1px;
        }

        .farm-panel {
          width: min(1380px, calc(100% - 28px));
          margin: 0 auto;
          padding: 42px 0 86px;
        }

        .farm-panel-narrow {
          width: min(1040px, calc(100% - 28px));
        }

        .farm-section-head {
          margin-bottom: 24px;
        }

        .farm-section-head p {
          margin: 0 0 7px;
          color: #39ff14;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 3px;
          text-transform: uppercase;
          text-shadow: 0 0 16px rgba(57, 255, 20, 0.36);
        }

        .farm-section-head h2 {
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(28px, 5vw, 58px);
          line-height: 1;
          font-weight: 900;
          letter-spacing: 0;
          color: #f4f4ef;
          text-shadow: 0 0 30px rgba(57, 255, 20, 0.16);
        }

        .farm-controls {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 12px;
        }

        .farm-search {
          position: relative;
          width: min(500px, 100%);
        }

        .farm-search svg {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(57, 255, 20, 0.72);
        }

        .farm-search input {
          width: 100%;
          min-height: 46px;
          box-sizing: border-box;
          padding: 12px 42px 12px 43px;
          border-radius: 8px;
          border: 1px solid rgba(57, 255, 20, 0.28);
          outline: none;
          background: rgba(2, 4, 3, 0.72);
          color: #f4f4ef;
          font-family: 'Poppins', sans-serif;
        }

        .farm-search input:focus {
          border-color: rgba(244, 201, 93, 0.68);
        }

        .farm-search button {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: rgba(244, 244, 239, 0.62);
          cursor: pointer;
          display: flex;
        }

        .farm-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .farm-categories button {
          padding: 8px 15px;
          border-radius: 6px;
          border: 1px solid rgba(244, 244, 239, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(244, 244, 239, 0.68);
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .farm-categories button.active {
          border-color: rgba(57, 255, 20, 0.72);
          background: rgba(57, 255, 20, 0.14);
          color: #39ff14;
        }

        .farm-results {
          margin: 0 0 22px;
          color: rgba(244, 244, 239, 0.42);
          font-size: 12px;
        }

        .farm-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 70px 18px;
          color: rgba(244, 244, 239, 0.36);
          text-align: center;
        }

        .farm-empty p {
          margin: 0;
        }

        .farm-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          perspective: 1200px;
        }

        .farm-contact-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .farm-contact-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 22px;
          border-radius: 8px;
          border: 1px solid var(--card-color);
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02)),
            rgba(2, 4, 3, 0.82);
          box-shadow: 0 22px 54px rgba(0, 0, 0, 0.42);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }

        .farm-contact-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--card-color) 82%, white);
          box-shadow: 0 0 34px color-mix(in srgb, var(--card-color) 18%, transparent), 0 26px 60px rgba(0, 0, 0, 0.5);
        }

        .farm-contact-card:hover .farm-contact-icon {
          animation: farmIconHit 0.42s ease;
        }

        .farm-contact-top {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .farm-contact-icon {
          width: 50px;
          height: 50px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid var(--card-color);
          background: color-mix(in srgb, var(--card-color) 15%, transparent);
          color: var(--card-color);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .farm-contact-card p {
          margin: 0;
        }

        .farm-contact-label {
          margin-bottom: 4px !important;
          color: rgba(244, 244, 239, 0.45);
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
        }

        .farm-contact-value {
          max-width: 100%;
          color: #f4f4ef;
          font-size: 17px;
          font-weight: 900;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .farm-contact-actions {
          display: flex;
          gap: 10px;
        }

        .farm-contact-actions a,
        .farm-contact-actions button {
          min-height: 42px;
          border-radius: 6px;
          border: 1px solid rgba(244, 244, 239, 0.12);
          font-weight: 900;
          cursor: pointer;
        }

        .farm-contact-actions a {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--card-color);
          background: color-mix(in srgb, var(--card-color) 12%, transparent);
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .farm-contact-actions button {
          width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(244, 244, 239, 0.7);
          background: rgba(255, 255, 255, 0.05);
        }

        @keyframes farmHeroDrift {
          from {
            transform: scale(1.02) translate3d(-0.8%, -0.6%, 0);
          }
          to {
            transform: scale(1.08) translate3d(0.8%, 0.6%, 0);
          }
        }

        @keyframes farmGridSlide {
          from {
            background-position: 0 0, 0 0;
          }
          to {
            background-position: 74px 74px, 74px 74px;
          }
        }

        @keyframes farmScan {
          0%, 52%, 100% {
            transform: translateY(-18vh);
            opacity: 0;
          }
          62% {
            opacity: 0.72;
          }
          78% {
            transform: translateY(118vh);
            opacity: 0;
          }
        }

        @keyframes farmPulseGlow {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.22;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.42;
          }
        }

        @keyframes farmNeonLine {
          0%, 100% {
            transform: scaleX(0.22);
            opacity: 0;
          }
          35% {
            opacity: 0.72;
          }
          55% {
            transform: scaleX(1);
            opacity: 0.42;
          }
          78% {
            opacity: 0;
          }
        }

        @keyframes farmLogoFloat {
          0%, 100% {
            transform: rotate(-1deg) translateY(0);
            box-shadow:
              0 0 0 8px rgba(255, 255, 255, 0.02),
              0 0 44px rgba(57, 255, 20, 0.18),
              0 26px 90px rgba(0, 0, 0, 0.72);
          }
          50% {
            transform: rotate(0.6deg) translateY(-8px);
            box-shadow:
              0 0 0 8px rgba(255, 255, 255, 0.03),
              0 0 68px rgba(57, 255, 20, 0.3),
              0 34px 110px rgba(0, 0, 0, 0.78);
          }
        }

        @keyframes farmShine {
          0%, 58% {
            transform: translateX(-125%);
          }
          78%, 100% {
            transform: translateX(125%);
          }
        }

        @keyframes farmRingSpin {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.035);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes farmMenuPulse {
          0%, 100% {
            box-shadow: 0 0 22px rgba(255, 64, 64, 0.24), 0 14px 30px rgba(0, 0, 0, 0.36);
          }
          50% {
            box-shadow: 0 0 34px rgba(255, 64, 64, 0.42), 0 18px 36px rgba(0, 0, 0, 0.42);
          }
        }

        @keyframes farmButtonBreath {
          0%, 100% {
            box-shadow: inset 0 0 22px rgba(255, 255, 255, 0.03), 0 18px 38px rgba(0, 0, 0, 0.38);
          }
          50% {
            box-shadow: inset 0 0 28px rgba(57, 255, 20, 0.08), 0 0 24px rgba(57, 255, 20, 0.1), 0 20px 42px rgba(0, 0, 0, 0.42);
          }
        }

        @keyframes farmTitleGlow {
          from {
            filter: drop-shadow(0 0 0 rgba(57, 255, 20, 0));
          }
          to {
            filter: drop-shadow(0 0 18px rgba(57, 255, 20, 0.18));
          }
        }

        @keyframes farmStarPop {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-2px) scale(1.08);
          }
        }

        @keyframes farmIconHit {
          0% {
            transform: scale(1) rotate(0);
          }
          45% {
            transform: scale(1.12) rotate(-5deg);
          }
          100% {
            transform: scale(1) rotate(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .farm-hero-media,
          .farm-hero-grid,
          .farm-scanline,
          .farm-light,
          .farm-neon-line,
          .farm-logo-ring,
          .farm-menu-button,
          .farm-logo-wrap,
          .farm-logo-wrap::before,
          .farm-hero h1,
          .farm-stars span {
            animation: none !important;
          }

          .farm-action-button,
          .farm-contact-card,
          .farm-contact-icon {
            transition: none !important;
          }
        }

        @media (min-width: 720px) {
          .farm-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .farm-product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 22px;
          }
        }

        @media (min-width: 1320px) {
          .farm-product-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .farm-hero {
            min-height: 100svh;
            padding: 88px 14px 54px;
          }

          .farm-topbar {
            min-height: 64px;
            padding: 10px 14px;
          }

          .farm-topbrand {
            font-size: 12px;
            letter-spacing: 0.8px;
          }

          .farm-topmark {
            width: 30px;
            height: 30px;
          }

          .farm-menu-button {
            width: 44px;
            height: 44px;
            border-radius: 14px;
          }

          .farm-logo-wrap {
            width: min(76vw, 310px);
            margin-bottom: 18px;
          }

          .farm-stars {
            margin: 15px 0 24px;
          }

          .farm-actions {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .farm-action-button {
            min-height: 64px;
            padding: 0 10px;
            font-size: 16px;
            letter-spacing: 1.2px;
          }

          .farm-panel {
            width: calc(100% - 24px);
            padding: 30px 0 64px;
          }

          .farm-product-grid {
            gap: 10px;
          }

          .farm-contact-grid {
            grid-template-columns: 1fr;
          }

          .farm-contact-card {
            padding: 18px;
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

        @media (max-width: 380px) {
          .farm-actions {
            grid-template-columns: 1fr;
          }

          .farm-action-button {
            min-height: 50px;
          }
        }
      `}</style>
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
      className={`farm-action-button${active ? ' active' : ''}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  color,
  index,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  color: string;
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
      className="farm-contact-card"
      style={{ '--card-color': color } as React.CSSProperties}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="farm-contact-top">
        <div className="farm-contact-icon">{icon}</div>
        <div style={{ minWidth: 0 }}>
          <p className="farm-contact-label">{label}</p>
          <p className="farm-contact-value">{value}</p>
        </div>
      </div>

      <div className="farm-contact-actions">
        <a href={href} target="_blank" rel="noreferrer">
          <ExternalLink size={14} />
          Apri
        </a>
        <button type="button" onClick={handleCopy} aria-label={`Copia ${label}`}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </motion.div>
  );
}
