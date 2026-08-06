import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { brandService } from '../../services/apiServices';
import Seo, { breadcrumbSchema } from '../../components/seo/Seo';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const res = await brandService.getBrands();
        setBrands(res.data?.data?.brands || []);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading brands..." />;

  return (
    <div className="container-custom section-padding">
      <Seo
        title="Shop by Brand"
        description="Explore the pet brands stocked at AniLiving — trusted names in food, treats, toys and grooming."
        canonical="/brands"
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Brands', path: '/brands' }])}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="section-title" style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>Our Brands</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            We partner with the best brands to bring you quality pet products.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}>
          {brands.map((brand, i) => (
            <motion.div key={brand._id} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
              <Link to={`/shop?brand=${brand._id}`} className="brand-card">
                <div className="brand-card-logo">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} />
                  ) : (
                    <span style={{ fontSize: '2.5rem' }}>🏷️</span>
                  )}
                </div>
                <h3 className="brand-card-name">{brand.name}</h3>
                {brand.description && (
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--color-text-muted)',
                    margin: '0.25rem 0 0', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {brand.description}
                  </p>
                )}
                {brand.productCount !== undefined && (
                  <p className="brand-card-count">{brand.productCount} Products</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🏷️</span>
            <h3 className="empty-state-title">No brands yet</h3>
            <p className="empty-state-description">Brands will appear here once they are added.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BrandsPage;
