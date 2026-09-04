import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../../hooks/useSettings';
import { categoryService } from '../../services/apiServices';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();
  const [categories, setCategories] = useState([]);

  // Footer category links come from the database, so a new category the admin
  // creates is linked from the footer without a code change.
  useEffect(() => {
    categoryService.getCategories()
      .then(({ data }) => setCategories((data?.data?.categories || []).filter((c) => !c.parent).slice(0, 5)))
      .catch(() => setCategories([]));
  }, []);

  const shopLinks = [
    { name: 'All Products', path: '/shop' },
    { name: 'New Arrivals', path: '/shop?isNewArrival=true' },
    { name: 'Best Sellers', path: '/shop?isBestSeller=true' },
    { name: 'Flash Deals', path: '/shop?isFlashDeal=true' },
    ...categories.map((c) => ({ name: c.name, path: `/shop?category=${c._id}` })),
  ];

  const helpLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
    // { name: 'Track Order', path: '/track-order' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Refund Policy', path: '/refund-policy' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
    { name: 'Terms & Conditions', path: '/terms-and-conditions' },
    { name: 'Cancellation Policy', path: '/cancellation-policy' },
    { name: 'Disclaimer', path: '/disclaimer' },
  ];

  // Only render a social icon when the admin has actually set that link
  const socialLinks = [
    { icon: FaFacebookF, href: settings.socialLinks?.facebook, label: 'Facebook' },
    { icon: FaInstagram, href: settings.socialLinks?.instagram, label: 'Instagram' },
    { icon: FaTwitter, href: settings.socialLinks?.twitter, label: 'Twitter' },
    { icon: FaYoutube, href: settings.socialLinks?.youtube, label: 'YouTube' },
    { icon: FaWhatsapp, href: settings.socialLinks?.whatsapp, label: 'WhatsApp' },
  ].filter((link) => Boolean(link.href));

  return (
    <footer className="footer-root">

      {/* Main Footer */}
      <div className="container-custom footer-main-grid">
        {/* Brand */}
        <div className="footer-col footer-col-brand">
          <div className="footer-brand-container">
            <Link to="/" className="footer-logo-link">
              <img src="/logo.png" alt="AniLiving" className="footer-logo-img" />
            </Link>
            <div className="footer-brand-text">
              <p className="footer-tagline">
                {settings.tagline || 'Everything Your Pet Deserves.'} Premium pet supplies for dogs
                and all your beloved companions.
              </p>
              <div className="footer-social-links">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="footer-social-icon"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="footer-social-svg" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shop */}
        <div className="footer-col">
          <h4 className="footer-col-title">Shop</h4>
          <ul className="footer-links-list">
            {shopLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="footer-link">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="footer-col">
          <h4 className="footer-col-title">Help & Info</h4>
          <ul className="footer-links-list">
            {helpLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="footer-link">
                  {link.name}
                </Link>
              </li>
            ))}
            {legalLinks.slice(0, 3).map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="footer-link">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col footer-col-contact">
          <h4 className="footer-col-title">Get in Touch</h4>
          <ul className="footer-links-list footer-contact-list">
            <li className="footer-contact-item">
              <HiOutlineMail className="footer-contact-icon" />
              <a
                href={`mailto:${settings.contactEmail || 'support@aniliving.com'}`}
                className="footer-link"
              >
                {settings.contactEmail || 'support@aniliving.com'}
              </a>
            </li>
            {settings.contactPhone && (
              <li className="footer-contact-item">
                <HiOutlinePhone className="footer-contact-icon" />
                <a
                  href={`tel:${settings.contactPhone.replace(/\s+/g, '')}`}
                  className="footer-link"
                >
                  {settings.contactPhone}
                </a>
              </li>
            )}
            <li className="footer-contact-item">
              <HiOutlineLocationMarker className="footer-contact-icon" />
              <span className="footer-contact-text">{settings.address || 'India'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="container-custom footer-bottom-inner">
          <p className="footer-copyright">
            © {currentYear} {settings.siteName || 'AniLiving'}. All rights reserved.
          </p>
          <div className="footer-legal-links">
            {legalLinks.map((link) => (
              <Link key={link.path} to={link.path} className="footer-legal-link">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
