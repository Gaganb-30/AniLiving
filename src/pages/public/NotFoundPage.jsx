import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
const NotFoundPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-10">
      <span className="text-8xl block mb-6">🐾</span>
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-text mb-3">Page Not Found</h2>
      <p className="text-text-light mb-8">The page you're looking for seems to have wandered off. Let's get you back on track!</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/shop" className="btn-secondary">Browse Shop</Link>
      </div>
    </motion.div>
  </div>
);
export default NotFoundPage;
