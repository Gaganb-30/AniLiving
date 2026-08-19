import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight } from 'react-icons/hi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { categoryService } from '../../services/apiServices';
import Seo, { breadcrumbSchema } from '../../components/seo/Seo';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data?.data?.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading categories…" />;

  return (
    <div className="container-custom section-padding">
      <Seo
        title="Shop by Category"
        description="Browse every AniLiving category — food, treats, toys, grooming, health and accessories for dogs and more."
        canonical="/categories"
        jsonLd={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Categories', path: '/categories' }])}
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="section-title" style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>Shop by Category</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
            Browse our curated collection of pet essentials by category.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {categories.map((cat, i) => (
            <motion.div key={cat._id} custom={i} initial="hidden" animate="visible" variants={fadeInUp}>
              <Link
                to={`/shop?category=${cat._id}`}
                style={{
                  display: 'flex', flexDirection: 'column',
                  background: 'white', borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-soft)', overflow: 'hidden',
                  textDecoration: 'none', transition: 'all 0.3s ease',
                }}
                className="category-page-card"
              >
                {/* Image */}
                <div style={{
                  height: '180px', background: 'var(--color-accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '4rem' }}>🐾</span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 0.375rem' }}>
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                      {cat.description}
                    </p>
                  )}

                  {/* Subcategories */}
                  {cat.subcategories?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {cat.subcategories.map((sub) => (
                        <span key={sub._id} style={{
                          fontSize: '0.6875rem', padding: '0.25rem 0.625rem',
                          background: 'var(--color-accent-light)', borderRadius: 'var(--radius-full)',
                          color: 'var(--color-primary)', fontWeight: 500,
                        }}>
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      Shop {cat.name}
                    </span>
                    <HiOutlineArrowRight style={{ color: 'var(--color-primary)', width: '16px' }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">📁</span>
            <h3 className="empty-state-title">No categories yet</h3>
            <p className="empty-state-description">Categories will appear here once they are added.</p>
          </div>
        )}
      </motion.div>

      <style>{`
        .category-page-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card);
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;
