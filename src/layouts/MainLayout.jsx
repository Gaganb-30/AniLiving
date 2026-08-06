import { Outlet, ScrollRestoration } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Seo, { organizationSchema, websiteSchema } from '../components/seo/Seo';
import { useSettings } from '../hooks/useSettings';
import { useAuthBootstrap } from '../hooks/useAuth';

/**
 * Main public layout — the shell every customer-facing page renders inside.
 *
 * It also carries the two site-wide JSON-LD blocks (Organization and WebSite,
 * the latter enabling Google's sitelinks search box). Individual pages layer
 * their own Product/Breadcrumb/FAQ schema on top.
 */
const MainLayout = () => {
  const { settings } = useSettings();
  useAuthBootstrap();   // revalidate the persisted session once per load

  return (
    <div className="site-shell">
      <Seo jsonLd={[organizationSchema(settings), websiteSchema()]} />

      {/* Keyboard users land here first */}
      <a href="#main-content" className="skip-link">Skip to content</a>

      <Navbar />

      <main id="main-content" className="site-main">
        <Outlet />
      </main>

      <Footer />
      <ScrollRestoration />
    </div>
  );
};

export default MainLayout;
