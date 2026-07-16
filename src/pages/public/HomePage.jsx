import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineCash, HiOutlineHeart, HiOutlineStar } from 'react-icons/hi';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Placeholder product data for demo
const sampleProducts = [
  { id: 1, name: 'Premium Nylon Dog Leash', price: 399, mrp: 599, rating: 4.8, reviews: 128, image: '🦮', badge: 'Best Seller' },
  { id: 2, name: 'Anti-Skid Steel Dog Bowl', price: 249, mrp: 399, rating: 4.7, reviews: 96, image: '🥣', badge: 'New' },
  { id: 3, name: 'Adjustable Comfort Collar', price: 299, mrp: 499, rating: 4.9, reviews: 214, image: '📿', badge: 'Trending' },
  { id: 4, name: 'Interactive Dog Toy Ball', price: 199, mrp: 349, rating: 4.6, reviews: 87, image: '⚾', badge: null },
  { id: 5, name: 'Orthopedic Pet Bed', price: 1299, mrp: 1999, rating: 4.8, reviews: 156, image: '🛏️', badge: 'Featured' },
  { id: 6, name: 'Grooming Brush Set', price: 449, mrp: 699, rating: 4.5, reviews: 73, image: '🪮', badge: null },
  { id: 7, name: 'Automatic Pet Feeder', price: 2499, mrp: 3499, rating: 4.7, reviews: 42, image: '🤖', badge: 'New' },
  { id: 8, name: 'Reflective Safety Harness', price: 599, mrp: 899, rating: 4.9, reviews: 189, image: '🦺', badge: 'Best Seller' },
];

const sampleCategories = [
  { name: 'Leashes & Harnesses', image: '🦮', color: 'bg-blue-50', products: 48 },
  { name: 'Bowls & Feeders', image: '🥣', color: 'bg-orange-50', products: 36 },
  { name: 'Collars & Tags', image: '📿', color: 'bg-purple-50', products: 52 },
  { name: 'Toys & Enrichment', image: '🎾', color: 'bg-green-50', products: 64 },
  { name: 'Beds & Furniture', image: '🛏️', color: 'bg-pink-50', products: 28 },
  { name: 'Grooming', image: '🪮', color: 'bg-cyan-50', products: 41 },
];

const testimonials = [
  { name: 'Priya S.', location: 'Mumbai', rating: 5, text: 'Amazing quality! My dog loves the leash. Super comfortable and durable.', avatar: 'PS' },
  { name: 'Rahul M.', location: 'Delhi', rating: 5, text: 'The anti-skid bowl is perfect. Fast delivery and great packaging.', avatar: 'RM' },
  { name: 'Ananya K.', location: 'Bangalore', rating: 5, text: 'Best pet store online! Premium products at reasonable prices.', avatar: 'AK' },
];

const HomePage = () => {
  return (
    <>
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-light via-accent to-background" />
        <div className="container-custom relative z-10 py-16 md:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeInUp} custom={0} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-soft">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm font-medium text-text-light">Free delivery on prepaid orders</span>
              </motion.div>
              <motion.h1 variants={fadeInUp} custom={1} className="text-4xl md:text-5xl lg:text-[56px] font-extrabold leading-[1.08] text-text mb-6">
                Premium Pet Supplies for Your{' '}
                <span className="text-primary">Beloved Companions</span>
              </motion.h1>
              <motion.p variants={fadeInUp} custom={2} className="text-lg text-text-light max-w-lg mb-8 leading-relaxed">
                Discover curated, high-quality products for dogs, cats, and all your furry friends. Everything your pet deserves, delivered to your door.
              </motion.p>
              <motion.div variants={fadeInUp} custom={3} className="flex flex-wrap gap-4">
                <Link to="/shop" className="btn-primary text-base px-8 py-3.5">
                  Shop Now <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/categories" className="btn-secondary text-base px-8 py-3.5">
                  View Categories
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} custom={4} className="flex items-center gap-6 mt-10 text-sm text-text-light">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['🐕', '🐈', '🐾'].map((e, i) => (
                      <span key={i} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-base shadow-sm border-2 border-white">{e}</span>
                    ))}
                  </div>
                  <span><strong className="text-text">10,000+</strong> Happy Pets</span>
                </div>
                <div className="flex items-center gap-1">
                  <HiOutlineStar className="w-4 h-4 text-primary fill-primary" />
                  <span><strong className="text-text">4.9</strong> Avg Rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Visual Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="bg-white rounded-[2rem] p-6 shadow-elevated relative">
                <div className="h-[380px] rounded-2xl bg-gradient-to-br from-primary/20 via-accent to-primary/10 flex items-center justify-center text-[140px] select-none">
                  🐶
                </div>
                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -left-6 top-12 bg-white rounded-2xl px-5 py-3 shadow-card font-bold text-sm text-text"
                >
                  ✨ Premium Quality
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -right-6 bottom-20 bg-white rounded-2xl px-5 py-3 shadow-card font-bold text-sm text-text"
                >
                  🚚 Fast Delivery
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURES BAR
          ============================================================ */}
      <section className="container-custom -mt-4 relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-card grid grid-cols-2 md:grid-cols-4 divide-x divide-border-light"
        >
          {[
            { icon: HiOutlineTruck, title: 'Fast Delivery', desc: 'Quick dispatch across India' },
            { icon: HiOutlineCash, title: 'COD Available', desc: 'Easy payment option' },
            { icon: HiOutlineShieldCheck, title: 'Quality Checked', desc: 'Durable daily-use products' },
            { icon: HiOutlineHeart, title: 'Pet Friendly', desc: 'Comfort-first design' },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center py-6 px-4">
              <feature.icon className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-semibold text-text text-sm">{feature.title}</h4>
              <p className="text-xs text-text-muted mt-0.5">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ============================================================
          FEATURED CATEGORIES
          ============================================================ */}
      <section className="container-custom section-padding">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>Shop By Category</h2>
            <p>Find everything your pet needs, organized for easy browsing.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {sampleCategories.map((cat, i) => (
              <motion.div key={i} variants={fadeInUp} custom={i}>
                <Link
                  to={`/shop?category=${cat.name}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`${cat.color} h-28 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300`}>
                    {cat.image}
                  </div>
                  <div className="p-3.5 text-center">
                    <h3 className="font-semibold text-text text-sm">{cat.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{cat.products} products</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          FEATURED PRODUCTS
          ============================================================ */}
      <section className="container-custom section-padding pt-0">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>Featured Products</h2>
            <p>Our most-loved products, hand-picked for your pet.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {sampleProducts.map((product, i) => (
              <motion.div key={product.id} variants={fadeInUp} custom={i}>
                <Link
                  to={`/product/${product.id}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-44 bg-accent-light flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
                    {product.image}
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button
                      className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      aria-label="Add to wishlist"
                    >
                      <HiOutlineHeart className="w-4 h-4 text-text" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-text text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center gap-0.5 text-primary text-xs">
                        {'★'.repeat(Math.floor(product.rating))}
                      </div>
                      <span className="text-xs text-text-muted">({product.reviews})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-text text-lg">₹{product.price}</span>
                      <span className="text-sm text-text-muted line-through">₹{product.mrp}</span>
                      <span className="text-xs font-semibold text-success ml-auto">
                        {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop" className="btn-secondary px-10">
              View All Products <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          PROMO BANNER
          ============================================================ */}
      <section className="container-custom pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-secondary-dark to-secondary rounded-[2rem] p-10 md:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-white"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              Everything Your Pet Deserves, In One Place
            </h2>
            <p className="text-white/70 leading-relaxed mb-6">
              From premium leashes to cozy beds, explore our curated collection designed with love for your furry companions.
            </p>
            <Link to="/shop" className="btn-primary text-base">
              Shop the Collection <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="text-center text-[120px] leading-none select-none hidden md:block">
            🐕‍🦺🐈
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          WHY CHOOSE US
          ============================================================ */}
      <section className="container-custom section-padding">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>Why Choose AniLiving?</h2>
            <p>We go the extra mile for your pet's happiness.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🏆', title: 'Premium Quality', desc: 'Every product is carefully curated and quality-checked before it reaches your doorstep.' },
              { icon: '💰', title: 'Best Prices', desc: 'Competitive pricing with regular offers and discounts. Premium quality without the premium price tag.' },
              { icon: '🚀', title: 'Fast & Safe Delivery', desc: 'Quick dispatch, secure packaging, and doorstep delivery across India. Track your order in real-time.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                className="bg-white rounded-2xl p-8 shadow-soft text-center hover:shadow-card transition-shadow"
              >
                <span className="text-5xl block mb-4">{item.icon}</span>
                <h3 className="font-bold text-text text-lg mb-2">{item.title}</h3>
                <p className="text-text-light text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ============================================================
          TESTIMONIALS
          ============================================================ */}
      <section className="container-custom section-padding pt-0">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeInUp} className="section-title">
            <h2>What Pet Parents Say</h2>
            <p>Real reviews from real pet lovers.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                custom={i}
                className="bg-white rounded-2xl p-7 shadow-soft"
              >
                <div className="text-primary text-sm mb-3">{'★'.repeat(t.rating)}</div>
                <p className="text-text-light text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-primary text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default HomePage;
