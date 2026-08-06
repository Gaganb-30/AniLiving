import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight, HiOutlineTruck, HiOutlineShieldCheck,
  HiOutlineHeart, HiOutlineShoppingCart, HiOutlineFire,
  HiOutlineBadgeCheck, HiOutlineCash, HiStar,
} from 'react-icons/hi';
import ProductCard, { ProductCardSkeleton } from '../../components/common/ProductCard';
import Seo from '../../components/seo/Seo';
import { productService, categoryService, brandService, bannerService } from '../../services/apiServices';
import { useSettings } from '../../hooks/useSettings';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.08, 0.4), duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

/** A product rail — reused for flash deals, featured, new, best sellers, trending */
const ProductRail = ({ title, subtitle, icon, products, loading, viewAllTo, skeletonCount = 4 }) => {
  if (!loading && (!products || products.length === 0)) return null;

  return (
    <section className="container-custom section-padding rail-section">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
        <div className="rail-head">
          <div>
            <h2 className="rail-title">{title} {icon}</h2>
            {subtitle && <p className="rail-subtitle">{subtitle}</p>}
          </div>
          {viewAllTo && <Link to={viewAllTo} className="btn-view-all rail-view-all">View all</Link>}
        </div>

        <div className="product-grid">
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product, i) => (
              <motion.div key={product._id} variants={fadeInUp} custom={i}>
                <ProductCard product={product} />
              </motion.div>
            ))}
        </div>
      </motion.div>
    </section>
  );
};

const TESTIMONIALS = [
  { name: 'Ananya R.', pet: 'Labrador parent', rating: 5, text: 'Ordered on a Tuesday, food arrived Thursday morning. Bruno finishes his bowl now — that never happened with his old kibble.' },
  { name: 'Karthik S.', pet: 'Two Persian cats', rating: 5, text: 'The litter I use is impossible to find locally. AniLiving stocks it and the price is better than the pet shop down my road.' },
  { name: 'Meera J.', pet: 'Beagle parent', rating: 4, text: 'Packaging was solid and the harness sizing guide was accurate. Support replied within an hour when I asked about a swap.' },
];

const HomePage = () => {
  const { settings } = useSettings();

  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // -------------------------------------------------------------------
  // Load everything in parallel. Each rail simply hides itself if its
  // request fails, so one bad endpoint never blanks the homepage.
  // -------------------------------------------------------------------
  useEffect(() => {
    const safeProducts = (promise) => promise
      .then(({ data }) => data?.data?.products || [])
      .catch(() => []);

    Promise.all([
      safeProducts(productService.getFeatured(8)),
      safeProducts(productService.getNewArrivals(8)),
      safeProducts(productService.getBestSellers(8)),
      safeProducts(productService.getTrending(8)),
      safeProducts(productService.getFlashDeals(8)),
    ]).then(([f, n, b, t, d]) => {
      setFeatured(f);
      setNewArrivals(n);
      setBestSellers(b);
      setTrending(t);
      setFlashDeals(d);
      setLoadingProducts(false);
    });

    categoryService.getCategories()
      .then(({ data }) => setCategories((data?.data?.categories || []).filter((c) => !c.parent)))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));

    brandService.getBrands()
      .then(({ data }) => setBrands(data?.data?.brands || []))
      .catch(() => setBrands([]));

    bannerService.getBanners()
      .then(({ data }) => setBanners(data?.data?.banners || []))
      .catch(() => setBanners([]));
  }, []);

  // Rotate the hero when the admin has published more than one banner
  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => setActiveSlide((s) => (s + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const banner = banners[activeSlide];

  return (
    <>
      <Seo
        description={settings.seo?.description}
        keywords={settings.seo?.keywords}
        canonical="/"
      />

      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="hero-section">
        <div className="container-custom">
          <div className="hero-grid">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeInUp} custom={0} className="hero-trust-badge">
                <div className="hero-trust-avatars">
                  {['🐕', '🐈', '🐾', '🐶'].map((e, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: '#FFF',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginLeft: i > 0 ? '-8px' : '0',
                      }}
                    >
                      {e}
                    </span>
                  ))}
                </div>
                <span className="hero-trust-text">
                  Trusted by <strong style={{ color: '#222' }}>10,000+</strong> Pet Parents
                  <HiOutlineBadgeCheck style={{ display: 'inline', color: '#3B82F6', marginLeft: '4px', verticalAlign: 'middle' }} />
                </span>
              </motion.div>

              <motion.h1 variants={fadeInUp} custom={1} className="hero-heading">
                {banner?.title || (
                  <>
                    Everything Your Pet Needs,<br />
                    <span className="highlight">Delivered</span> to Your Door.
                  </>
                )}
              </motion.h1>

              <motion.p variants={fadeInUp} custom={2} className="hero-subtitle">
                {banner?.subtitle || 'Premium pet essentials for dogs and cats. Because they deserve the best.'}
              </motion.p>

              <motion.div variants={fadeInUp} custom={3} className="hero-buttons">
                <Link to={banner?.link || '/shop'} className="btn-primary hero-cta">
                  {banner?.buttonText || 'Shop Now'} <HiOutlineArrowRight />
                </Link>
                <Link to="/categories" className="btn-secondary hero-cta">
                  Explore Categories
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} custom={4} className="hero-features">
                {[
                  { icon: <HiOutlineTruck />, title: 'Fast Delivery', desc: 'On prepaid orders' },
                  { icon: <HiOutlineCash />, title: 'COD Available', desc: 'Easy payments' },
                  { icon: <HiOutlineShieldCheck />, title: 'Quality Checked', desc: 'Premium products' },
                  { icon: <HiOutlineHeart />, title: 'Pet Friendly', desc: 'Loved by pets' },
                ].map((f, i) => (
                  <div key={i} className="hero-feature-item">
                    <div className="hero-feature-icon">{f.icon}</div>
                    <div className="hero-feature-title">{f.title}</div>
                    <div className="hero-feature-desc">{f.desc}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero image — the admin's banner when one is published, otherwise
                the default art. `mobileImage` lets a shorter crop be served to
                phones so the banner never eats the whole first screen. */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              className="hero-image-container"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={banner?._id || 'default'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="hero-image-frame"
                >
                  <picture>
                    {banner?.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={banner.mobileImage} />
                    )}
                    <img
                      src={banner?.image || '/images/hero-banner.png'}
                      alt={banner?.title || 'Happy golden retriever and cat with pet supplies'}
                      loading="eager"
                      width="640"
                      height="480"
                    />
                  </picture>
                </motion.div>
              </AnimatePresence>

              <div className="hero-watermark">
                <span>🐾</span>
                <span style={{ color: '#F7931E' }}>Ani</span>
                <span style={{ color: '#222' }}>Living</span>
                <span style={{ fontSize: '1rem' }}>🐾</span>
              </div>
            </motion.div>
          </div>

          {banners.length > 1 && (
            <div className="carousel-dots hero-dots">
              {banners.map((b, i) => (
                <button
                  key={b._id}
                  type="button"
                  className={`carousel-dot ${i === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Show banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SHOP BY PET
          ============================================================ */}
      <section className="container-custom section-padding">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>✨ Shop by Pet ✨</h2>
            <p>Everything specially curated for your furry companions</p>
          </motion.div>

          <div className="shop-by-pet-grid">
            <motion.div variants={fadeInUp} custom={0}>
              <div className="shop-by-pet-card">
                <div className="shop-by-pet-image">
                  <img src="/images/dog-card.png" alt="Golden retriever dog" loading="lazy" />
                </div>
                <div className="shop-by-pet-content">
                  <div className="shop-by-pet-icon"><HiOutlineShoppingCart /></div>
                  <h3 className="shop-by-pet-title">Dogs</h3>
                  <p className="shop-by-pet-desc">Food, toys, grooming &amp; more for your best friend.</p>
                  <Link to="/shop?tags=dog" className="shop-by-pet-link">
                    Shop for Dogs <HiOutlineArrowRight />
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} custom={1}>
              <div className="shop-by-pet-card">
                <div className="shop-by-pet-image">
                  <img src="/images/cat-card.png" alt="Tabby cat" loading="lazy" />
                </div>
                <div className="shop-by-pet-content">
                  <div className="shop-by-pet-icon"><HiOutlineShoppingCart /></div>
                  <h3 className="shop-by-pet-title">Cats</h3>
                  <p className="shop-by-pet-desc">Everything your cat needs, in one place.</p>
                  <Link to="/shop?tags=cat" className="shop-by-pet-link">
                    Shop for Cats <HiOutlineArrowRight />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          CATEGORIES
          ============================================================ */}
      <section className="container-custom section-padding" style={{ paddingTop: 0 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>✨ Popular Categories ✨</h2>
            <p>Top picks for your furry friends</p>
          </motion.div>

          {loadingCategories ? (
            <div className="category-grid">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="category-card skeleton">
                  <div className="category-card-image skeleton-image" style={{ borderRadius: '50%' }} />
                  <div className="skeleton-line" style={{ width: '60%', height: '14px', margin: '0.5rem auto 0' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="category-grid">
              {categories.slice(0, 10).map((cat, i) => (
                <motion.div key={cat._id} variants={fadeInUp} custom={i}>
                  <Link to={`/shop?category=${cat._id}`} className="category-circle-card">
                    <div className="category-circle-image">
                      {cat.image
                        ? <img src={cat.image} alt={cat.name} loading="lazy" />
                        : <span style={{ fontSize: '2rem' }}>🐾</span>}
                    </div>
                    <div className="category-circle-name">{cat.name}</div>
                    {cat.productCount !== undefined && (
                      <div className="category-circle-count">{cat.productCount} products</div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div variants={fadeInUp} style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/categories" className="btn-view-all">View All Categories</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================
          PRODUCT RAILS
          ============================================================ */}
      <ProductRail
        title="Flash Deals"
        subtitle="Limited-time prices — while stocks last"
        icon={<HiOutlineFire style={{ color: 'var(--color-error)' }} />}
        products={flashDeals}
        loading={false}
        viewAllTo="/shop?isFlashDeal=true"
      />

      <ProductRail
        title="Featured Products"
        subtitle="Handpicked favourites for your pets"
        icon={<HiOutlineHeart style={{ color: 'var(--color-primary)' }} />}
        products={featured}
        loading={loadingProducts}
        viewAllTo="/shop?isFeatured=true"
      />

      <ProductRail
        title="New Arrivals"
        subtitle="Fresh on the shelves this week"
        icon={<span>🆕</span>}
        products={newArrivals}
        loading={false}
        viewAllTo="/shop?isNewArrival=true"
      />

      <ProductRail
        title="Best Sellers"
        subtitle="What pet parents keep coming back for"
        icon={<span>🏆</span>}
        products={bestSellers}
        loading={false}
        viewAllTo="/shop?isBestSeller=true"
      />

      <ProductRail
        title="Trending Now"
        subtitle="Popular with pet parents right now"
        icon={<span>📈</span>}
        products={trending}
        loading={false}
        viewAllTo="/shop?isTrending=true"
      />

      {/* ============================================================
          SHOP BY BRAND
          ============================================================ */}
      {brands.length > 0 && (
        <section className="container-custom section-padding" style={{ paddingTop: 0 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeInUp} className="section-title">
              <h2>Shop by Brand</h2>
              <p>The names pet parents trust</p>
            </motion.div>

            <div className="brand-strip">
              {brands.slice(0, 12).map((brand, i) => (
                <motion.div key={brand._id} variants={fadeInUp} custom={i}>
                  <Link to={`/shop?brand=${brand._id}`} className="brand-strip-item">
                    {brand.logo
                      ? <img src={brand.logo} alt={brand.name} loading="lazy" />
                      : <span>{brand.name}</span>}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/brands" className="btn-view-all">View All Brands</Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* ============================================================
          WHY CHOOSE ANILIVING
          ============================================================ */}
      <section className="trust-bar">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="trust-bar-grid"
          >
            {[
              { icon: '🐾', title: 'Loved by Pets', desc: 'Happy pets, happy pet parents', cls: 'pets' },
              { icon: '🏆', title: 'Premium Quality', desc: 'Carefully selected trusted brands', cls: 'quality' },
              { icon: '🛡️', title: 'Safe & Secure', desc: '100% secure payments', cls: 'secure' },
              { icon: '🎧', title: 'Dedicated Support', desc: 'We are always here to help', cls: 'support' },
            ].map((item, i) => (
              <div key={i} className="trust-bar-item">
                <div className={`trust-bar-icon ${item.cls}`}>{item.icon}</div>
                <div>
                  <div className="trust-bar-title">{item.title}</div>
                  <div className="trust-bar-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          ============================================================ */}
      <section className="container-custom section-padding">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>What Pet Parents Say</h2>
            <p>Real reviews from the AniLiving community</p>
          </motion.div>

          <div className="testimonial-grid">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.figure key={testimonial.name} variants={fadeInUp} custom={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {Array.from({ length: testimonial.rating }).map((_, s) => <HiStar key={s} />)}
                </div>
                <blockquote>{testimonial.text}</blockquote>
                <figcaption>
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.pet}</span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          NEWSLETTER
          ============================================================ */}
      <section className="newsletter-section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="newsletter-inner"
          >
            <div className="newsletter-illustration">
              <div style={{ fontSize: '6rem', lineHeight: 1, textAlign: 'center', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
                🐕
              </div>
            </div>

            <div className="newsletter-content">
              <h3><span style={{ marginRight: '8px' }}>📬</span>Stay Updated with AniLiving</h3>
              <p>Get the best deals, new arrivals &amp; pet care tips straight to your inbox.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Enter your email address" required aria-label="Email address" />
                <button type="submit">Subscribe</button>
              </form>
              <div className="newsletter-disclaimer">No spam, unsubscribe anytime.</div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
