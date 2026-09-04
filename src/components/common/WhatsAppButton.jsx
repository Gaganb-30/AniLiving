import { FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../hooks/useSettings';

const WhatsAppButton = () => {
  const { settings } = useSettings();

  const rawTarget = settings?.socialLinks?.whatsapp || settings?.contactPhone || '';

  let whatsappUrl = 'https://wa.me/';
  if (rawTarget) {
    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://')) {
      whatsappUrl = rawTarget;
    } else {
      const cleaned = rawTarget.replace(/[^0-9]/g, '');
      whatsappUrl = cleaned ? `https://wa.me/${cleaned}` : 'https://wa.me/';
    }
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
