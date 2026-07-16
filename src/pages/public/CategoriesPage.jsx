import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Leashes & Harnesses', image: '🦮', color: 'from-blue-100 to-blue-50', count: 48 },
  { name: 'Bowls & Feeders', image: '🥣', color: 'from-orange-100 to-orange-50', count: 36 },
  { name: 'Collars & Tags', image: '📿', color: 'from-purple-100 to-purple-50', count: 52 },
  { name: 'Toys & Enrichment', image: '🎾', color: 'from-green-100 to-green-50', count: 64 },
  { name: 'Beds & Furniture', image: '🛏️', color: 'from-pink-100 to-pink-50', count: 28 },
  { name: 'Grooming', image: '🪮', color: 'from-cyan-100 to-cyan-50', count: 41 },
  { name: 'Food & Treats', image: '🦴', color: 'from-amber-100 to-amber-50', count: 73 },
  { name: 'Health & Wellness', image: '💊', color: 'from-emerald-100 to-emerald-50', count: 25 },
  { name: 'Clothing & Accessories', image: '👕', color: 'from-rose-100 to-rose-50', count: 34 },
];

const CategoriesPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="section-title"><h2>All Categories</h2><p>Browse products by category.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {categories.map((cat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/shop?category=${cat.name}`} className="group block bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all hover:-translate-y-1">
              <div className={`bg-gradient-to-br ${cat.color} h-40 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300`}>{cat.image}</div>
              <div className="p-5">
                <h3 className="font-bold text-text text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-sm text-text-muted mt-1">{cat.count} products</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-text-muted mt-10 text-sm">Categories are dynamically loaded from the admin panel.</p>
    </motion.div>
  </div>
);

export default CategoriesPage;
