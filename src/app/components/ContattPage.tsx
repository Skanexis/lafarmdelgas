import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ExternalLink, Instagram, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { fetchContacts } from '../api/client';
import type { ContactSettings } from '../api/client';

const defaultContacts: ContactSettings = {
  whatsappGroupName: 'TERPS DRAGON',
  whatsappGroupUrl: 'https://chat.whatsapp.com/',
  whatsappContactLabel: '+39 333 000 0000',
  whatsappContactUrl: 'https://wa.me/393330000000',
  instagramLabel: '@terpsdragon',
  instagramUrl: 'https://instagram.com/terpsdragon',
};

function ContactCard({
  icon,
  label,
  value,
  href,
  index,
}: {
  icon: React.ReactNode;
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
      transition={{ delay: index * 0.06, duration: 0.2 }}
      whileHover={{ y: -2 }}
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

export default function ContattPage() {
  const [contacts, setContacts] = useState<ContactSettings>(defaultContacts);

  useEffect(() => {
    fetchContacts()
      .then(setContacts)
      .catch(() => setContacts(defaultContacts));
  }, []);

  const contactItems = [
    {
      icon: <Users size={21} />,
      label: 'Gruppo',
      value: contacts.whatsappGroupName,
      href: contacts.whatsappGroupUrl,
    },
    {
      icon: <MessageCircle size={21} />,
      label: 'WhatsApp',
      value: contacts.whatsappContactLabel,
      href: contacts.whatsappContactUrl,
    },
    {
      icon: <Instagram size={21} />,
      label: 'Instagram',
      value: contacts.instagramLabel,
      href: contacts.instagramUrl,
    },
  ];

  return (
    <main className="fluent-page fluent-route-page">
      <section className="fluent-panel fluent-panel-narrow">
        <div className="fluent-panel-head">
          <h1>Canali</h1>
        </div>

        <div className="fluent-contact-grid">
          {contactItems.map((item, index) => (
            <ContactCard key={item.label} {...item} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
