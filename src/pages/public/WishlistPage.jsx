import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard, { ProductCardSkeleton } from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Seo from '../../components/seo/Seo';
import { userService } from '../../services/apiServices';
import { useWishlist } from '../../hooks/useWishlist';

/**
 * Wishlist — rendered both as a public route (/wishlist) and inside the user
 * dashboard. Signed-out visitors get a prompt to sign in rather than a broken
 * empty page.
 */
const WishlistPage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    setLoading(true);
    userService.getWishlist()
      .then(({ data }) => setProducts(data.data.wishlist || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => { load(); }, [load]);

  // Drop items the shopper un-hearts without needing a round trip
  const visible = products.filter((p) => wishlist.includes(p._id));

  if (!isAuthenticated) {
    return (
      <div className="container-custom section-padding">
        <Seo title="My wishlist" noindex canonical="/wishlist" />
        <EmptyState
          icon="❤️"
          title="Sign in to see your wishlist"
          description="Save products you love and find them here on any device."
          actionText="Sign in"
          actionLink="/login?redirect=/wishlist"
        />
      </div>
    );
  }

  return (
    <div className="container-custom section-padding">
      <Seo title="My wishlist" noindex canonical="/wishlist" />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-title" style={{ textAlign: 'left' }}>
          <h1 className="page-heading">My wishlist</h1>
          <p className="page-subheading">
            {loading ? 'Loading…' : `${visible.length} item${visible.length === 1 ? '' : 's'} saved`}
          </p>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="Your wishlist is empty"
            description="Tap the heart on any product to save it for later."
            actionText="Browse products"
            actionLink="/shop"
          />
        ) : (
          <>
            <div className="product-grid">
              <AnimatePresence>
                {visible.map((product) => (
                  <motion.div key={product._id} layout exit={{ opacity: 0, scale: 0.95 }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <p className="wishlist-note">
              Prices and availability update automatically. <Link to="/shop">Keep shopping →</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default WishlistPage;
