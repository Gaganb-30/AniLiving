import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BrandsPage = () => {
  const brands = [
    { name: 'PetLux', logo: '🐾', products: 24 }, { name: 'WoofWear', logo: '🐕', products: 18 },
    { name: 'AquaPet', logo: '🐠', products: 12 }, { name: 'PawPrime', logo: '🦮', products: 32 },
    { name: 'FurEver', logo: '🐈', products: 21 }, { name: 'BiteRight', logo: '🦴', products: 15 },
  ];
  return (
    <div className="container-custom section-padding">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title"><h2>Our Brands</h2><p>Shop from trusted pet supply brands.</p></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {brands.map((b, i) => (
            <Link key={i} to={`/shop?brand=${b.name}`} className="bg-white rounded-2xl shadow-soft p-6 text-center hover:shadow-card transition-all hover:-translate-y-1 group">
              <span className="text-5xl block mb-3 group-hover:scale-110 transition-transform">{b.logo}</span>
              <h3 className="font-semibold text-text text-sm group-hover:text-primary transition-colors">{b.name}</h3>
              <p className="text-xs text-text-muted mt-1">{b.products} products</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
export default BrandsPage;
