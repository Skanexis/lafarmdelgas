import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  LogOut,
  Package,
  Plus,
  Edit3,
  Trash2,
  Search,
  Snowflake,
  Star,
  X,
  Save,
  Eye,
  Image as ImageIcon,
  Leaf,
  Settings,
  Tags,
  Upload,
  Video,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Product, WeightPrice } from '../data/products';
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  fetchAdminMedia,
  fetchCategories,
  fetchContacts,
  fetchProducts,
  fetchSettings,
  resolveMediaUrl,
  updateAdminContacts,
  updateAdminSettings,
  updateAdminCategory,
  updateAdminProduct,
  uploadAdminFile,
  verifyAdminSession,
} from '../api/client';
import type { ContactSettings, MediaItem, SiteSettings } from '../api/client';

const ADMIN_USER = 'admin';
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'lafarm2026';

const defaultContacts: ContactSettings = {
  whatsappGroupName: 'LA FARM DEL GAS',
  whatsappGroupUrl: 'https://chat.whatsapp.com/',
  whatsappContactLabel: '+39 333 000 0000',
  whatsappContactUrl: 'https://wa.me/393330000000',
  instagramLabel: '@lafarmdelgas',
  instagramUrl: 'https://instagram.com/lafarmdelgas',
};

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
      setError('Credenziali non valide');
      setLoading(false);
      return;
    }

    try {
      await verifyAdminSession(pass);
      onLogin(pass);
    } catch {
      setError('Backend admin non raggiungibile o token non valido');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(217,120,47,0.2)',
    borderRadius: '6px',
    color: '#F2E2C4',
    fontSize: '14px',
    outline: 'none',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orb */}
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '6px',
          background: '#7B4A88',
          filter: 'blur(120px)',
          opacity: 0.15,
          top: '20%',
          left: '30%',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(123,74,136,0.3)',
          borderRadius: '6px',
          padding: '44px 36px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.48)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '6px',
              background: 'rgba(123,74,136,0.15)',
              border: '1px solid rgba(123,74,136,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={26} color="#7B4A88" />
          </div>
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: '22px',
              letterSpacing: '2px',
              background: 'linear-gradient(135deg, #7B4A88, #D9782F)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
            }}
          >
            ADMIN PANEL
          </h1>
          <p style={{ color: 'rgba(242,226,196,0.35)', fontSize: '12px', letterSpacing: '1px' }}>
            LA FARM DEL GAS — Gestione contenuti
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(242,226,196,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '7px' }}>
              Username
            </label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="admin"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(123,74,136,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(217,120,47,0.2)')}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: 'rgba(242,226,196,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '7px' }}>
              Password
            </label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(123,74,136,0.6)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(217,120,47,0.2)')}
            />
          </div>

          {error && (
            <p style={{ color: '#FF6B6B', fontSize: '13px', textAlign: 'center' }}>{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px',
              borderRadius: '13px',
              border: '1px solid rgba(123,74,136,0.5)',
              background: 'linear-gradient(135deg, rgba(123,74,136,0.3), rgba(123,74,136,0.15))',
              color: '#7B4A88',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              <div style={{ width: '16px', height: '16px', borderRadius: '6px', border: '2px solid rgba(123,74,136,0.3)', borderTopColor: '#7B4A88', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <Lock size={15} />
            )}
            {loading ? 'Accesso…' : 'ACCEDI'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(242,226,196,0.2)', fontSize: '11px', marginTop: '24px' }}>
          Demo: admin / lafarm2026
        </p>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

type FormProduct = Omit<Product, 'id'> & { id?: string };

const emptyForm: FormProduct = {
  name: '',
  brand: '',
  origin: '',
  description: '',
  images: [''],
  hasVideo: false,
  weights: [{ weight: '25g', price: 50 }],
  badge: null,
  category: '',
  isNew: false,
};

function ProductForm({
  initial,
  onSave,
  onCancel,
  saving,
  categories,
  onUploadFile,
}: {
  initial: FormProduct;
  onSave: (p: FormProduct) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  categories: string[];
  onUploadFile: (file: File) => Promise<MediaItem>;
}) {
  const [form, setForm] = useState<FormProduct>({ ...initial });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const updateWeight = (i: number, field: keyof WeightPrice, val: string) => {
    const ws = [...form.weights];
    if (field === 'price') {
      ws[i] = { ...ws[i], price: val === 'pvt' ? 'pvt' : Number(val) };
    } else {
      ws[i] = { ...ws[i], [field]: val };
    }
    setForm(f => ({ ...f, weights: ws }));
  };

  const addWeight = () => setForm(f => ({ ...f, weights: [...f.weights, { weight: '', price: 0 }] }));
  const removeWeight = (i: number) => setForm(f => ({ ...f, weights: f.weights.filter((_, idx) => idx !== i) }));

  const updateImage = (i: number, val: string) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm(f => ({ ...f, images: imgs }));
  };
  const addImage = () => setForm(f => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i: number) => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const uploadProductMedia = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploadingMedia(true);
    try {
      for (const file of Array.from(files)) {
        const uploaded = await onUploadFile(file);
        if (uploaded.type === 'image') {
          setForm(f => ({
            ...f,
            images: [...f.images.filter(Boolean), uploaded.url],
          }));
        } else if (uploaded.type === 'video') {
          setForm(f => ({
            ...f,
            hasVideo: true,
            videoUrl: uploaded.url,
          }));
        }
      }
      toast.success('Media caricato');
    } catch {
      toast.error('Upload media non riuscito');
    } finally {
      setUploadingMedia(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(217,120,47,0.2)',
    borderRadius: '6px',
    color: '#F2E2C4',
    fontSize: '13px',
    outline: 'none',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(242,226,196,0.45)',
    fontSize: '11px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '6px',
  };

  return (
    <motion.div
      className="admin-form-card"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(217,120,47,0.15)',
        borderRadius: '8px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div className="admin-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '16px', color: '#D9782F', letterSpacing: '1px' }}>
          {form.id ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
        </h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(242,226,196,0.4)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Basic fields */}
      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nome prodotto</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="es. MAROCCO DRY GOLD" />
        </div>
        <div>
          <label style={labelStyle}>Brand</label>
          <input style={inputStyle} value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="Brand / selezione" />
        </div>
        <div>
          <label style={labelStyle}>Origine</label>
          <input style={inputStyle} value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="es. Marocco" />
        </div>
        <div>
          <label style={labelStyle}>Categoria</label>
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {categories.map(category => (
              <option key={category} value={category} style={{ background: '#17100A' }}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Badge</label>
          <select
            value={form.badge ?? ''}
            onChange={e => setForm(f => ({ ...f, badge: (e.target.value as 'FROZEN' | 'TOP' | null) || null }))}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#17100A' }}>Nessuno</option>
            <option value="TOP" style={{ background: '#17100A' }}>TOP</option>
            <option value="FROZEN" style={{ background: '#17100A' }}>FROZEN</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Descrizione</label>
          <textarea
            style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Descrizione del prodotto..."
          />
        </div>

        {/* Checkboxes */}
        <div className="admin-checkbox-row" style={{ display: 'flex', gap: '20px', gridColumn: '1 / -1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'rgba(242,226,196,0.6)', fontSize: '13px' }}>
            <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
            Nuovo prodotto
          </label>
        </div>
      </div>

      {/* Weights */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={labelStyle}>Pesi e prezzi</label>
          <button
            onClick={addWeight}
            style={{ background: 'rgba(143,166,74,0.1)', border: '1px solid rgba(143,166,74,0.3)', borderRadius: '8px', padding: '4px 10px', color: '#8FA64A', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {form.weights.map((w, i) => (
            <div key={i} className="admin-weight-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={w.weight}
                onChange={e => updateWeight(i, 'weight', e.target.value)}
                placeholder="es. 25g"
              />
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={w.price === 'pvt' ? 'pvt' : w.price}
                onChange={e => updateWeight(i, 'price', e.target.value)}
                placeholder="€ o 'pvt'"
              />
              <button
                onClick={() => removeWeight(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.6)', padding: '4px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={labelStyle}>URL Immagini</label>
          <button
            onClick={addImage}
            style={{ background: 'rgba(217,120,47,0.1)', border: '1px solid rgba(217,120,47,0.3)', borderRadius: '8px', padding: '4px 10px', color: '#D9782F', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={12} /> Aggiungi
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {form.images.map((img, i) => (
            <div key={i} className="admin-image-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={img}
                onChange={e => updateImage(i, e.target.value)}
                placeholder="https://..."
              />
              {form.images.length > 1 && (
                <button
                  onClick={() => removeImage(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,100,100,0.6)', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Video prodotto</label>
        <input
          style={inputStyle}
          value={form.videoUrl || ''}
          onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value, hasVideo: Boolean(e.target.value.trim()) }))}
          placeholder="URL video oppure carica file"
        />
      </div>

      <div>
        <label style={labelStyle}>Carica file prodotto</label>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '13px',
            borderRadius: '6px',
            border: '1px dashed rgba(217,120,47,0.38)',
            background: 'rgba(217,120,47,0.06)',
            color: '#D9782F',
            cursor: uploadingMedia ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <Upload size={15} />
          {uploadingMedia ? 'Upload in corso...' : 'Foto o video'}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={uploadingMedia}
            onChange={e => {
              uploadProductMedia(e.target.files);
              e.currentTarget.value = '';
            }}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Actions */}
      <div className="admin-form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button
          onClick={onCancel}
          style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(242,226,196,0.5)', cursor: 'pointer', fontSize: '13px' }}
        >
          Annulla
        </button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSave(form)}
          disabled={saving}
          style={{
            padding: '10px 24px', borderRadius: '6px',
            border: '1px solid rgba(217,120,47,0.4)',
            background: 'linear-gradient(135deg, rgba(217,120,47,0.2), rgba(217,120,47,0.1))',
            color: '#D9782F', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Save size={14} />
          {saving ? 'Salvataggio...' : form.id ? 'Salva modifiche' : 'Crea prodotto'}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('laFarmAdminToken') || '');
  const [productList, setProductList] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<FormProduct | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'products' | 'contacts' | 'categories' | 'media'>('products');
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ logoUrl: '', heroMediaUrl: '' });
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingContacts, setSavingContacts] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!adminToken) return;

    setLoadingProducts(true);
    verifyAdminSession(adminToken)
      .then(() =>
        Promise.all([fetchProducts(), fetchCategories(), fetchSettings(), fetchContacts(), fetchAdminMedia(adminToken)]),
      )
      .then(([apiProducts, apiCategories, apiSettings, apiContacts, apiMedia]) => {
        setProductList(apiProducts);
        setCategoryList(apiCategories);
        setSettings(apiSettings);
        setContacts(apiContacts);
        setMediaList(apiMedia);
      })
      .catch(() => {
        sessionStorage.removeItem('laFarmAdminToken');
        setAdminToken('');
        toast.error('Sessione admin non valida');
      })
      .finally(() => setLoadingProducts(false));
  }, [adminToken]);

  if (!adminToken) {
    return (
      <LoginScreen
        onLogin={token => {
          sessionStorage.setItem('laFarmAdminToken', token);
          setAdminToken(token);
        }}
      />
    );
  }

  const filtered = productList.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (form: FormProduct) => {
    setSavingProduct(true);

    try {
      if (form.id) {
        const saved = await updateAdminProduct(adminToken, form.id, form);
        setProductList(list => list.map(p => (p.id === saved.id ? saved : p)));
        toast.success('Prodotto aggiornato!');
      } else {
        const created = await createAdminProduct(adminToken, form);
        setProductList(list => [created, ...list]);
        toast.success('Prodotto creato!');
      }

      setShowForm(false);
      setEditingProduct(null);
    } catch {
      toast.error('Salvataggio non riuscito');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Eliminare questo prodotto?')) {
      try {
        await deleteAdminProduct(adminToken, id);
        setProductList(list => list.filter(p => p.id !== id));
        toast.success('Prodotto eliminato');
      } catch {
        toast.error('Eliminazione non riuscita');
      }
    }
  };

  const handleEdit = (p: Product) => {
    setEditingProduct({ ...p });
    setShowForm(true);
  };

  const handleUploadFile = async (file: File) => {
    const uploaded = await uploadAdminFile(adminToken, file);
    setMediaList(list => [uploaded, ...list]);
    return uploaded;
  };

  const handleUploadLogo = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const uploaded = await handleUploadFile(file);
      if (uploaded.type !== 'image') {
        toast.error('Per il logo serve un file immagine');
        return;
      }

      const nextSettings = await updateAdminSettings(adminToken, { logoUrl: uploaded.url });
      setSettings(nextSettings);
      toast.success('Logo aggiornato');
    } catch {
      toast.error('Upload logo non riuscito');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSaveContacts = async () => {
    setSavingContacts(true);

    try {
      const updated = await updateAdminContacts(adminToken, contacts);
      setContacts(updated);
      toast.success('Contatti aggiornati');
    } catch {
      toast.error('Salvataggio contatti non riuscito');
    } finally {
      setSavingContacts(false);
    }
  };

  const handleCreateCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;

    setSavingCategory(true);
    try {
      const created = await createAdminCategory(adminToken, name);
      setCategoryList(list => [...list, created]);
      setNewCategory('');
      toast.success('Categoria creata');
    } catch {
      toast.error('Impossibile creare la categoria');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async (currentName: string) => {
    const nextName = editingCategoryName.trim();
    if (!nextName) return;

    setSavingCategory(true);
    try {
      const updated = await updateAdminCategory(adminToken, currentName, nextName);
      setCategoryList(list => list.map(category => (category === currentName ? updated : category)));
      setProductList(list => list.map(product => (product.category === currentName ? { ...product, category: updated } : product)));
      setEditingCategory(null);
      setEditingCategoryName('');
      toast.success('Categoria aggiornata');
    } catch {
      toast.error('Impossibile aggiornare la categoria');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (!confirm(`Eliminare la categoria "${name}"?`)) return;

    setSavingCategory(true);
    try {
      await deleteAdminCategory(adminToken, name);
      setCategoryList(list => list.filter(category => category !== name));
      toast.success('Categoria eliminata');
    } catch {
      toast.error('Categoria usata da prodotti o non eliminabile');
    } finally {
      setSavingCategory(false);
    }
  };

  const sidebarItems = [
    { key: 'brand', label: 'Brand', icon: <Settings size={17} /> },
    { key: 'products', label: 'Prodotti', icon: <Package size={17} /> },
    { key: 'contacts', label: 'Contatti', icon: <MessageCircle size={17} /> },
    { key: 'categories', label: 'Categorie', icon: <Tags size={17} /> },
    { key: 'media', label: 'Media', icon: <Eye size={17} /> },
  ];

  return (
    <div className="admin-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div
        className="admin-topbar"
        style={{
          background: 'rgba(18,12,7,0.95)',
          borderBottom: '1px solid rgba(123,74,136,0.2)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          position: 'sticky',
          top: '73px',
          zIndex: 40,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Leaf size={18} color="#7B4A88" />
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '14px', letterSpacing: '2px', color: '#7B4A88' }}>
            PANNELLO ADMIN
          </span>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('laFarmAdminToken');
            setAdminToken('');
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '6px', padding: '7px 14px', color: 'rgba(255,150,150,0.8)',
            cursor: 'pointer', fontSize: '12px',
          }}
        >
          <LogOut size={13} /> Esci
        </button>
      </div>

      <div className="admin-layout" style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div
          className="admin-sidebar"
          style={{
            width: '200px',
            background: 'rgba(9,6,4,0.6)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {sidebarItems.map(item => (
            <button
              className="admin-sidebar-button"
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
                border: 'none', width: '100%', textAlign: 'left',
                background: activeTab === item.key ? 'rgba(123,74,136,0.15)' : 'transparent',
                color: activeTab === item.key ? '#7B4A88' : 'rgba(242,226,196,0.45)',
                fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {/* Stats */}
          <div className="admin-stats" style={{ marginTop: 'auto', padding: '16px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: 'rgba(242,226,196,0.3)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>Statistiche</p>
            {[
              { label: 'Prodotti', value: productList.length, color: '#D9782F' },
              { label: 'TOP', value: productList.filter(p => p.badge === 'TOP').length, color: '#D9782F' },
              { label: 'FROZEN', value: productList.filter(p => p.badge === 'FROZEN').length, color: '#7EA6A0' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(242,226,196,0.4)', fontSize: '12px' }}>{stat.label}</span>
                <span style={{ color: stat.color, fontWeight: 700, fontSize: '13px' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="admin-main" style={{ flex: 1, padding: '28px', overflow: 'auto' }}>
          {activeTab === 'brand' && (
            <div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '2px', color: '#F2E2C4', marginBottom: '24px' }}>
                BRAND E LOGO
              </h2>

              <div
                className="admin-brand-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(220px, 320px) minmax(280px, 1fr)',
                  gap: '24px',
                  alignItems: 'start',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(217,120,47,0.16)',
                    borderRadius: '8px',
                    padding: '18px',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '1',
                      borderRadius: '50%',
                      border: '1px solid rgba(243,198,106,0.32)',
                      background: 'rgba(9,6,4,0.62)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(242,226,196,0.35)',
                    }}
                  >
                    {settings.logoUrl ? (
                      <img
                        src={resolveMediaUrl(settings.logoUrl)}
                        alt="Logo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImageIcon size={42} />
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(217,120,47,0.16)',
                    borderRadius: '8px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <p style={{ color: '#F2E2C4', fontWeight: 800, fontSize: '15px' }}>Logo homepage</p>
                  <p style={{ color: 'rgba(242,226,196,0.48)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                    Carica un'immagine quadrata o rotonda. Verrà mostrata sopra il titolo nella schermata iniziale.
                  </p>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: 'fit-content',
                      padding: '11px 16px',
                      borderRadius: '6px',
                      border: '1px solid rgba(217,120,47,0.38)',
                      background: 'rgba(217,120,47,0.1)',
                      color: '#D9782F',
                      cursor: uploadingFile ? 'not-allowed' : 'pointer',
                      fontWeight: 800,
                      fontSize: '13px',
                    }}
                  >
                    <Upload size={15} />
                    {uploadingFile ? 'Upload...' : 'Carica logo'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingFile}
                      onChange={e => {
                        handleUploadLogo(e.target.files);
                        e.currentTarget.value = '';
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="admin-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '2px', color: '#F2E2C4' }}>
                  GESTIONE PRODOTTI
                </h2>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setEditingProduct({ ...emptyForm, category: categoryList[0] || '' });
                    setShowForm(true);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '6px',
                    border: '1px solid rgba(143,166,74,0.4)',
                    background: 'rgba(143,166,74,0.1)',
                    color: '#8FA64A', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <Plus size={15} />
                  Nuovo Prodotto
                </motion.button>
              </div>

              {/* Search */}
              <div className="admin-search" style={{ position: 'relative', maxWidth: '380px', marginBottom: '20px' }}>
                <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(217,120,47,0.5)' }} />
                <input
                  type="text"
                  placeholder="Cerca prodotto..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px 10px 40px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(217,120,47,0.2)',
                    borderRadius: '6px', color: '#F2E2C4', fontSize: '13px', outline: 'none',
                    fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Form */}
              <AnimatePresence>
                {showForm && (
                  <div style={{ marginBottom: '24px' }}>
                    <ProductForm
                      initial={editingProduct || { ...emptyForm, category: categoryList[0] || '' }}
                      onSave={handleSave}
                      onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                      saving={savingProduct}
                      categories={categoryList}
                      onUploadFile={handleUploadFile}
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Product list */}
              <div className="admin-product-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loadingProducts && (
                  <div style={{ padding: '28px', color: 'rgba(242,226,196,0.45)', fontSize: '13px', textAlign: 'center' }}>
                    Caricamento prodotti...
                  </div>
                )}

                {!loadingProducts && filtered.map((p, i) => (
                  <motion.div
                    className="admin-product-row"
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '8px', padding: '14px 18px',
                      transition: 'border-color 0.2s',
                    }}
                    onHoverStart={e => ((e.target as HTMLElement).closest('[data-row]')?.setAttribute('style', 'border-color: rgba(217,120,47,0.2)'))}
                  >
                    {/* Image */}
                    <img
                      src={resolveMediaUrl(p.images[0])}
                      alt={p.name}
                      style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                    />

                    {/* Info */}
                    <div className="admin-product-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="admin-product-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <p style={{ color: '#F2E2C4', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </p>
                        {p.badge && (
                          <span style={{
                            padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                            ...(p.badge === 'FROZEN'
                              ? { background: 'rgba(126,166,160,0.15)', color: '#7EA6A0' }
                              : { background: 'rgba(217,120,47,0.15)', color: '#D9782F' }),
                          }}>
                            {p.badge}
                          </span>
                        )}
                        {p.isNew && (
                          <span style={{ padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, background: 'rgba(143,166,74,0.12)', color: '#8FA64A' }}>NUOVO</span>
                        )}
                      </div>
                      <p style={{ color: 'rgba(242,226,196,0.4)', fontSize: '12px' }}>{p.brand} · {p.origin} · {p.weights.length} varianti</p>
                    </div>

                    {/* Price range */}
                    <div className="admin-product-price" style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ color: '#D9782F', fontWeight: 700, fontSize: '14px' }}>
                        €{(p.weights.find(w => w.price !== 'pvt')?.price as number) ?? '—'}+
                      </p>
                      <p style={{ color: 'rgba(242,226,196,0.3)', fontSize: '11px' }}>{p.category}</p>
                    </div>

                    {/* Actions */}
                    <div className="admin-product-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{
                          padding: '7px', borderRadius: '9px', cursor: 'pointer',
                          background: 'rgba(217,120,47,0.1)', border: '1px solid rgba(217,120,47,0.25)',
                          color: '#D9782F', display: 'flex',
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          padding: '7px', borderRadius: '9px', cursor: 'pointer',
                          background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.25)',
                          color: 'rgba(255,150,150,0.8)', display: 'flex',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {!loadingProducts && filtered.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(242,226,196,0.3)' }}>
                    <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>Nessun prodotto trovato</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div>
              <div className="admin-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '2px', color: '#F2E2C4', marginBottom: '6px' }}>
                    CONTATTI
                  </h2>
                  <p style={{ color: 'rgba(242,226,196,0.42)', fontSize: '13px', margin: 0 }}>
                    Modifica i tre canali mostrati nella pagina Contatti.
                  </p>
                </div>
                <button
                  onClick={handleSaveContacts}
                  disabled={savingContacts}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '1px solid rgba(143,166,74,0.4)',
                    background: 'rgba(143,166,74,0.1)',
                    color: '#8FA64A',
                    cursor: savingContacts ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 800,
                    opacity: savingContacts ? 0.65 : 1,
                  }}
                >
                  <Save size={15} />
                  {savingContacts ? 'Salvataggio...' : 'Salva contatti'}
                </button>
              </div>

              <div
                className="admin-contacts-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px',
                  maxWidth: '900px',
                }}
              >
                {([
                  { name: 'whatsappGroupName', label: 'Nome gruppo WhatsApp', placeholder: 'LA FARM DEL GAS' },
                  { name: 'whatsappGroupUrl', label: 'Link gruppo WhatsApp', placeholder: 'https://chat.whatsapp.com/...' },
                  { name: 'whatsappContactLabel', label: 'Etichetta contatto WhatsApp', placeholder: '+39 333 000 0000' },
                  { name: 'whatsappContactUrl', label: 'Link contatto WhatsApp', placeholder: 'https://wa.me/393330000000' },
                  { name: 'instagramLabel', label: 'Etichetta Instagram', placeholder: '@lafarmdelgas' },
                  { name: 'instagramUrl', label: 'Link Instagram', placeholder: 'https://instagram.com/lafarmdelgas' },
                ] as Array<{ name: keyof ContactSettings; label: string; placeholder: string }>).map(field => (
                  <label
                    key={field.name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(217,120,47,0.14)',
                      borderRadius: '8px',
                      padding: '14px',
                    }}
                  >
                    <span style={{ color: 'rgba(242,226,196,0.54)', fontSize: '12px', fontWeight: 700 }}>
                      {field.label}
                    </span>
                    <input
                      value={contacts[field.name]}
                      onChange={e => setContacts(current => ({ ...current, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        background: 'rgba(9,6,4,0.5)',
                        border: '1px solid rgba(242,226,196,0.09)',
                        borderRadius: '6px',
                        color: '#F2E2C4',
                        outline: 'none',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </label>
                ))}
              </div>

              <div
                style={{
                  marginTop: '18px',
                  maxWidth: '900px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(123,74,136,0.16)',
                  background: 'rgba(123,74,136,0.08)',
                  color: 'rgba(242,226,196,0.45)',
                  fontSize: '12px',
                  lineHeight: 1.6,
                }}
              >
                La pagina pubblica mostra solo Gruppo WhatsApp, Contatto WhatsApp e Instagram. I link vengono aperti in una nuova scheda.
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="admin-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '2px', color: '#F2E2C4' }}>
                  GESTIONE CATEGORIE
                </h2>
              </div>

              <div
                className="admin-category-create"
                style={{
                  display: 'flex',
                  gap: '10px',
                  maxWidth: '520px',
                  marginBottom: '22px',
                }}
              >
                <input
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Nuova categoria"
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(217,120,47,0.2)',
                    borderRadius: '6px',
                    color: '#F2E2C4',
                    outline: 'none',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
                <button
                  onClick={handleCreateCategory}
                  disabled={savingCategory}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    border: '1px solid rgba(143,166,74,0.4)',
                    background: 'rgba(143,166,74,0.1)',
                    color: '#8FA64A',
                    cursor: savingCategory ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    opacity: savingCategory ? 0.7 : 1,
                  }}
                >
                  <Plus size={15} />
                  Aggiungi
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '720px' }}>
                {categoryList.map(category => {
                  const productsCount = productList.filter(product => product.category === category).length;
                  const editing = editingCategory === category;

                  return (
                    <div
                      className="admin-category-row"
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                      }}
                    >
                      <Tags size={16} color="#D9782F" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {editing ? (
                          <input
                            value={editingCategoryName}
                            onChange={e => setEditingCategoryName(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '9px 12px',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(217,120,47,0.28)',
                              borderRadius: '6px',
                              color: '#F2E2C4',
                              outline: 'none',
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          />
                        ) : (
                          <>
                            <p style={{ color: '#F2E2C4', fontWeight: 700, fontSize: '14px' }}>{category}</p>
                            <p style={{ color: 'rgba(242,226,196,0.38)', fontSize: '12px' }}>
                              {productsCount} prodott{productsCount === 1 ? 'o' : 'i'}
                            </p>
                          </>
                        )}
                      </div>

                      {editing ? (
                        <>
                          <button
                            onClick={() => handleUpdateCategory(category)}
                            disabled={savingCategory}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              cursor: savingCategory ? 'not-allowed' : 'pointer',
                              background: 'rgba(143,166,74,0.1)',
                              border: '1px solid rgba(143,166,74,0.3)',
                              color: '#8FA64A',
                              display: 'flex',
                            }}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategory(null);
                              setEditingCategoryName('');
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: 'rgba(242,226,196,0.62)',
                              display: 'flex',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setEditingCategoryName(category);
                            }}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: 'rgba(217,120,47,0.1)',
                              border: '1px solid rgba(217,120,47,0.25)',
                              color: '#D9782F',
                              display: 'flex',
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category)}
                            disabled={savingCategory || productsCount > 0}
                            title={productsCount > 0 ? 'Categoria usata da prodotti' : 'Elimina categoria'}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              cursor: savingCategory || productsCount > 0 ? 'not-allowed' : 'pointer',
                              background: 'rgba(255,100,100,0.1)',
                              border: '1px solid rgba(255,100,100,0.25)',
                              color: 'rgba(255,150,150,0.8)',
                              display: 'flex',
                              opacity: productsCount > 0 ? 0.45 : 1,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <p style={{ color: 'rgba(242,226,196,0.38)', fontSize: '12px', marginTop: '18px', maxWidth: '720px' }}>
                "Tutti" non si modifica qui: resta un filtro automatico della vetrina.
              </p>
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              <div className="admin-section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '14px', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: '20px', letterSpacing: '2px', color: '#F2E2C4' }}>
                  MEDIA LIBRARY
                </h2>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid rgba(143,166,74,0.38)',
                    background: 'rgba(143,166,74,0.1)',
                    color: '#8FA64A',
                    cursor: uploadingFile ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  <Upload size={15} />
                  {uploadingFile ? 'Upload...' : 'Carica media'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    disabled={uploadingFile}
                    onChange={async e => {
                      const files = Array.from(e.target.files || []);
                      e.currentTarget.value = '';
                      if (!files.length) return;

                      setUploadingFile(true);
                      try {
                        for (const file of files) {
                          await handleUploadFile(file);
                        }
                        toast.success('Media caricati');
                      } catch {
                        toast.error('Upload media non riuscito');
                      } finally {
                        setUploadingFile(false);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="admin-media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
                {mediaList.map((media, i) => (
                  <div
                    key={media.url}
                    style={{
                      borderRadius: '6px', overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.08)',
                      aspectRatio: '4/3', position: 'relative',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {media.type === 'video' ? (
                      <video src={resolveMediaUrl(media.url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                    ) : (
                      <img src={resolveMediaUrl(media.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(9,6,4,0.8) 0%, transparent 60%)',
                    }} />
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(242,226,196,0.72)', fontSize: '10px' }}>
                      {media.type === 'video' ? <Video size={12} /> : <ImageIcon size={12} />}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{media.name || i + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
              {mediaList.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(242,226,196,0.3)' }}>
                  <Eye size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>Nessun media caricato</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
