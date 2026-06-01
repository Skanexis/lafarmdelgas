import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ExternalLink, Instagram, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { fetchContacts } from '../api/client';
import type { ContactSettings } from '../api/client';

const defaultContacts: ContactSettings = {
  whatsappGroupName: 'LA FARM DEL GAS',
  whatsappGroupUrl: 'https://chat.whatsapp.com/',
  whatsappContactLabel: '+39 333 000 0000',
  whatsappContactUrl: 'https://wa.me/393330000000',
  instagramLabel: '@lafarmdelgas',
  instagramUrl: 'https://instagram.com/lafarmdelgas',
};

function ContactCard({
  icon,
  label,
  value,
  href,
  color,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copiato`);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      style={{
        background: 'rgba(18,12,7,0.86)',
        border: `1px solid ${color}42`,
        borderRadius: '8px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 14px 42px rgba(0,0,0,0.28)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: `${color}18`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              color: 'rgba(242,226,196,0.42)',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {label}
          </p>
          <p
            style={{
              color: '#F2E2C4',
              fontSize: '17px',
              fontWeight: 800,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px 12px',
            borderRadius: '6px',
            border: `1px solid ${color}55`,
            background: `${color}1A`,
            color,
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 900,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          <ExternalLink size={14} />
          Apri
        </a>
        <button
          onClick={handleCopy}
          style={{
            width: '44px',
            borderRadius: '6px',
            border: '1px solid rgba(242,226,196,0.12)',
            background: copied ? `${color}22` : 'rgba(255,255,255,0.04)',
            color: copied ? color : 'rgba(242,226,196,0.55)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </motion.div>
  );
}

export default function ContattPage() {
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);

  useEffect(() => {
    fetchContacts()
      .then(setContacts)
      .catch(() => setContacts(defaultContacts));
  }, []);

  const contactItems = [
    {
      icon: <Users size={22} />,
      label: 'Gruppo WhatsApp',
      value: contacts.whatsappGroupName,
      href: contacts.whatsappGroupUrl,
      color: '#8FA64A',
    },
    {
      icon: <MessageCircle size={22} />,
      label: 'Contatto WhatsApp',
      value: contacts.whatsappContactLabel,
      href: contacts.whatsappContactUrl,
      color: '#D9782F',
    },
    {
      icon: <Instagram size={22} />,
      label: 'Instagram',
      value: contacts.instagramLabel,
      href: contacts.instagramUrl,
      color: '#7B4A88',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px 24px 80px',
        maxWidth: '1040px',
        margin: '0 auto',
        background:
          'radial-gradient(circle at 12% 0%, rgba(217,120,47,0.12), transparent 30%), radial-gradient(circle at 86% 14%, rgba(123,74,136,0.1), transparent 32%)',
      }}
    >
      <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '42px' }}>
        <p
          style={{
            color: '#F3C66A',
            fontSize: '12px',
            letterSpacing: '4px',
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}
        >
          Canali ufficiali
        </p>
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(32px, 6vw, 64px)',
            letterSpacing: '1px',
            color: '#F2E2C4',
            textShadow: '0 8px 26px rgba(0,0,0,0.38)',
            marginBottom: '12px',
          }}
        >
          CONTATTI
        </h1>
        <p style={{ color: 'rgba(242,226,196,0.58)', fontSize: '14px', lineHeight: 1.7, maxWidth: '560px' }}>
          Usa solo questi canali per richieste, disponibilità e aggiornamenti.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {contactItems.map((item, index) => (
          <ContactCard key={item.label} {...item} index={index} />
        ))}
      </div>
    </div>
  );
}
