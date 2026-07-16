import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { name: 'All Products', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'Brands', path: '/brands' },
    { name: 'New Arrivals', path: '/shop?filter=new-arrivals' },
    { name: 'Best Sellers', path: '/shop?filter=best-sellers' },
  ];

  const helpLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Track Order', path: '/track-order' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Refund Policy', path: '/refund-policy' },
    { name: 'Shipping Policy', path: '/shipping-policy' },
    { name: 'Terms & Conditions', path: '/terms-and-conditions' },
    { name: 'Cancellation Policy', path: '/cancellation-policy' },
    { name: 'Disclaimer', path: '/disclaimer' },
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
    { icon: FaYoutube, href: '#', label: 'YouTube' },
    { icon: FaWhatsapp, href: '#', label: 'WhatsApp' },
  ];

  return (
    <footer className="bg-secondary-dark text-white">
      {/* Newsletter */}
      <div className="bg-secondary">
        <div className="container-custom py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Subscribe to Our Newsletter</h3>
            <p className="text-white/70 text-sm">Get updates on new products, exclusive offers, and pet care tips.</p>
          </div>
          <form className="flex w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 md:w-72 px-5 py-3 rounded-l-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-r-full hover:bg-primary-dark transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-block mb-4">
            <span className="text-2xl font-extrabold text-primary">Ani</span>
            <span className="text-2xl font-extrabold text-white">Living</span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            Everything Your Pet Deserves. Premium pet supplies for dogs, cats, and all your beloved companions.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-lg font-bold mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {shopLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-white/60 hover:text-primary transition-colors text-sm">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="text-lg font-bold mb-4">Help & Info</h4>
          <ul className="space-y-2.5">
            {helpLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-white/60 hover:text-primary transition-colors text-sm">
                  {link.name}
                </Link>
              </li>
            ))}
            {legalLinks.slice(0, 3).map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="text-white/60 hover:text-primary transition-colors text-sm">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-lg font-bold mb-4">Get in Touch</h4>
          <ul className="space-y-3.5">
            <li className="flex items-start gap-3">
              <HiOutlineMail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-white/60 text-sm">support@aniliving.com</span>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlinePhone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-white/60 text-sm">+91 XXXXXXXXXX</span>
            </li>
            <li className="flex items-start gap-3">
              <HiOutlineLocationMarker className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <span className="text-white/60 text-sm">India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm">
            © {currentYear} AniLiving. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/40">
            {legalLinks.map((link) => (
              <Link key={link.path} to={link.path} className="hover:text-primary transition-colors">
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
