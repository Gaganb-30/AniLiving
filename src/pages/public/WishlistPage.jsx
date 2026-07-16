import { motion } from 'framer-motion';
const WishlistPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-text mb-8">My Wishlist</h1>
      <div className="bg-white rounded-2xl shadow-soft p-10 text-center">
        <span className="text-6xl block mb-4">❤️</span>
        <h3 className="font-semibold text-text text-lg mb-2">Your wishlist is empty</h3>
        <p className="text-text-muted text-sm">Browse our products and add your favorites here.</p>
      </div>
    </motion.div>
  </div>
);
export default WishlistPage;
