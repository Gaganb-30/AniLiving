import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../hooks/useSettings';

const WhatsAppButton = () => {
  const { settings } = useSettings();

  const FALLBACK_NUMBER = '918929772812';
  const PREFILL_MESSAGE = encodeURIComponent(
    'Hi AniLiving! I have a question about your products.'
  );

  const rawTarget = settings?.socialLinks?.whatsapp || settings?.contactPhone || '';

  let whatsappUrl;
  if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
    // Admin has set a full wa.me or whatsapp.com URL — use it as-is
    whatsappUrl = rawTarget;
  } else {
    const cleaned = rawTarget.replace(/[^0-9]/g, '') || FALLBACK_NUMBER;
    whatsappUrl = `https://wa.me/${cleaned}?text=${PREFILL_MESSAGE}`;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-btn"
      aria-label="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <FaWhatsapp className="whatsapp-float-icon" />
    </a>
  );
};

export default WhatsAppButton;
