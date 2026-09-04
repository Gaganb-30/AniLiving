import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiOutlineArrowRight, HiOutlineTruck, HiOutlineShieldCheck,
  HiOutlineHeart, HiOutlineFire,
  HiOutlineBadgeCheck, HiOutlineCash, HiStar,
  HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';
import ProductCard, { ProductCardSkeleton } from '../../components/common/ProductCard';
import AutoMarquee from '../../components/common/AutoMarquee';
import Seo from '../../components/seo/Seo';
import { productService, categoryService, bannerService } from '../../services/apiServices';
import { useSettings } from '../../hooks/useSettings';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: Math.min(i * 0.08, 0.4), duration: 0.5, ease: 'easeOut' },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const carouselSlideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
  }),
};

/** A product rail — reused for flash deals, featured, new, best sellers, trending */
const ProductRail = ({ title, subtitle, icon, products, loading, viewAllTo, skeletonCount = 4, marqueeSpeed = 30 }) => {
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

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: skeletonCount }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <AutoMarquee speed={marqueeSpeed} className="rail-marquee" showControls={true}>
            <div className="product-grid">
              {products.map((product, i) => (
                <motion.div key={product._id} variants={fadeInUp} custom={i}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </AutoMarquee>
        )}
      </motion.div>
    </section>
  );
};

const TESTIMONIALS = [
  { name: 'Ananya R.', pet: 'Labrador parent', rating: 5, text: 'Ordered on a Tuesday, food arrived Thursday morning. Bruno finishes his bowl now — that never happened with his old kibble.' },
  { name: 'Karthik S.', pet: 'Golden Retriever parent', rating: 5, text: 'The treats I use are impossible to find locally. AniLiving stocks them and the price is better than the pet shop down my road.' },
  { name: 'Meera J.', pet: 'Beagle parent', rating: 4, text: 'Packaging was solid and the harness sizing guide was accurate. Support replied within an hour when I asked about a swap.' },
];

const HomePage = () => {
  const { settings } = useSettings();

  const [banners, setBanners] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [categories, setCategories] = useState([]);


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



    bannerService.getBanners()
      .then(({ data }) => setBanners(data?.data?.banners || []))
      .catch(() => setBanners([]));
  }, []);

  const nextSlide = () => {
    if (banners.length < 2) return;
    setDirection(1);
    setActiveSlide((s) => (s + 1) % banners.length);
  };

  const prevSlide = () => {
    if (banners.length < 2) return;
    setDirection(-1);
    setActiveSlide((s) => (s - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index) => {
    if (index === activeSlide || index < 0 || index >= banners.length) return;
    setDirection(index > activeSlide ? 1 : -1);
    setActiveSlide(index);
  };

  // Rotate the hero when the admin has published more than one banner (pauses on hover)
  useEffect(() => {
    if (banners.length < 2 || carouselPaused) return undefined;
    const timer = setInterval(() => {
      setDirection(1);
      setActiveSlide((s) => (s + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length, carouselPaused]);

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
                {banner?.subtitle || 'Premium toys and accessories for your pet— free delivery on all orders.'}
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
              onMouseEnter={() => setCarouselPaused(true)}
              onMouseLeave={() => setCarouselPaused(false)}
            >
              <div className="hero-carousel-wrapper">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={banner?._id || activeSlide}
                    custom={direction}
                    variants={carouselSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
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

                {banners.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="hero-carousel-arrow hero-carousel-prev"
                      onClick={prevSlide}
                      aria-label="Previous banner"
                    >
                      <HiChevronLeft />
                    </button>
                    <button
                      type="button"
                      className="hero-carousel-arrow hero-carousel-next"
                      onClick={nextSlide}
                      aria-label="Next banner"
                    >
                      <HiChevronRight />
                    </button>

                    <div className="hero-carousel-dots-overlay">
                      {banners.map((b, i) => (
                        <button
                          key={b._id || i}
                          type="button"
                          className={`hero-carousel-dot ${i === activeSlide ? 'active' : ''}`}
                          onClick={() => goToSlide(i)}
                          aria-label={`Show banner ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
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
          CATEGORIES
          ============================================================ */}
      <section className="container-custom section-padding" style={{ paddingTop: 0 }}>
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>✨ Popular Categories ✨</h2>
            <p>Top picks for your furry friends</p>
          </motion.div>

          {loadingCategories ? (
            <motion.div className="category-grid" variants={stagger}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="category-card skeleton">
                  <div className="category-card-image skeleton-image" style={{ borderRadius: '50%' }} />
                  <div className="skeleton-line" style={{ width: '60%', height: '14px', margin: '0.5rem auto 0' }} />
                </div>
              ))}
            </motion.div>
          ) : (
            <AutoMarquee speed={22} className="categories-marquee" showControls={true}>
              <motion.div className="category-grid" variants={stagger}>
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
              </motion.div>
            </AutoMarquee>
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
        marqueeSpeed={26}
      />

      <ProductRail
        title="Featured Products"
        subtitle="Handpicked favourites for your pets"
        icon={<HiOutlineHeart style={{ color: 'var(--color-primary)' }} />}
        products={featured}
        loading={loadingProducts}
        viewAllTo="/shop?isFeatured=true"
        marqueeSpeed={28}
      />

      <ProductRail
        title="New Arrivals"
        subtitle="Fresh on the shelves this week"
        icon={<span>🆕</span>}
        products={newArrivals}
        loading={false}
        viewAllTo="/shop?isNewArrival=true"
        marqueeSpeed={26}
      />

      <ProductRail
        title="Best Sellers"
        subtitle="What pet parents keep coming back for"
        icon={<span>🏆</span>}
        products={bestSellers}
        loading={false}
        viewAllTo="/shop?isBestSeller=true"
        marqueeSpeed={30}
      />

      <ProductRail
        title="Trending Now"
        subtitle="Popular with pet parents right now"
        icon={<span>📈</span>}
        products={trending}
        loading={false}
        viewAllTo="/shop?isTrending=true"
        marqueeSpeed={28}
      />



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
          >
            <AutoMarquee speed={24} className="trustbar-marquee">
              <div className="trust-bar-grid">
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
              </div>
            </AutoMarquee>
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

          <AutoMarquee speed={32} className="testimonials-marquee">
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
          </AutoMarquee>
        </motion.div>
      </section>

      {/* ============================================================
          NEWSLETTER
          ============================================================ */}
      {/* <section className="newsletter-section">
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
      </section> */}
    </>
  );
};

export default HomePage;
