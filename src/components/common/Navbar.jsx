import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHeart, HiOutlineShoppingBag, HiOutlineUser,
  HiOutlineMenu, HiOutlineX, HiChevronDown, HiOutlineLogout,
  HiOutlineClipboardList, HiOutlineCog, HiSparkles, HiOutlineFire,
} from 'react-icons/hi';
import { setMobileMenuOpen } from '../../redux/slices/uiSlice';
import SearchBox from './SearchBox';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { categoryService } from '../../services/apiServices';
import { useClickOutside } from '../../hooks/useDebounce';

const STATIC_LINKS = [
  { name: 'Shop', path: '/shop' },
  { name: 'Categories', path: '/categories' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const dispatch = useDispatch();
  const { mobileMenuOpen } = useSelector((state) => state.ui);
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const categoryRef = useRef(null);
  const accountRef = useRef(null);

  useClickOutside(categoryRef, () => setCategoryMenuOpen(false));
  useClickOutside(accountRef, () => setAccountOpen(false));

  useEffect(() => {
    categoryService.getCategories()
      .then(({ data }) => setCategories(data?.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    setCategoryMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, dispatch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const searchParams = new URLSearchParams(location.search);
  const activeCategoryId = searchParams.get('category');
  const isFlashDealActive = searchParams.get('isFlashDeal') === 'true';

  const isStaticActive = (path) => {
    if (path === '/shop') {
      return location.pathname === '/shop' && !activeCategoryId && !isFlashDealActive;
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* ─── Top promo bar ─── */}
      <div className="top-bar">
        <div className="container-custom">
          <div className="top-bar-content">
            <div className="top-bar-item"><span>🚚</span><span>Free delivery on prepaid orders</span></div>
            <div className="top-bar-divider" />
            <div className="top-bar-item"><span>💳</span><span>COD available</span></div>
            <div className="top-bar-divider" />
            <div className="top-bar-item"><span>🔥</span><span>Up to 40% off top brands</span></div>
          </div>
        </div>
      </div>

      {/* ─── Main navbar ─── */}
      <nav className={`main-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-custom navbar-inner">
          <Link to="/" className="navbar-logo" aria-label="AniLiving home">
            <div>
              <img src="/logo.png" alt="AniLiving" className="navbar-logo-img" />
            </div>
          </Link>

          {/* Desktop search */}
          <div className="navbar-search-wrap">
            <SearchBox />
          </div>

          <div className="navbar-actions">
            <Link
              to={isAuthenticated ? '/dashboard/wishlist' : '/wishlist'}
              className={`navbar-action-btn ${location.pathname.includes('wishlist') ? 'active' : ''}`}
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="navbar-action-icon" />
              {wishlistCount > 0 && <span className="navbar-action-badge">{wishlistCount}</span>}
              <span>Wishlist</span>
            </Link>

            <Link
              to="/cart"
              className={`navbar-action-btn ${location.pathname === '/cart' ? 'active' : ''}`}
              aria-label={`Cart, ${cartCount} items`}
            >
              <HiOutlineShoppingBag className="navbar-action-icon" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="navbar-action-badge"
                >
                  {cartCount}
                </motion.span>
              )}
              <span>Cart</span>
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <div className="navbar-account" ref={accountRef}>
                <button
                  type="button"
                  className={`navbar-action-btn ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  aria-label="User Account"
                >
                  <HiOutlineUser className="navbar-action-icon" />
                  <span>{user?.firstName || 'Account'}</span>
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      className="navbar-account-menu"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="navbar-account-head">
                        <strong>{user?.firstName} {user?.lastName}</strong>
                        <span>{user?.email}</span>
                      </div>
                      <Link to="/dashboard"><HiOutlineUser /> My account</Link>
                      <Link to="/dashboard/orders"><HiOutlineClipboardList /> My orders</Link>
                      <Link to="/dashboard/wishlist"><HiOutlineHeart /> Wishlist</Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin"><HiOutlineCog /> Admin panel</Link>
                      )}
                      <button type="button" onClick={logout}><HiOutlineLogout /> Sign out</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className={`navbar-action-btn ${location.pathname === '/login' ? 'active' : ''}`}
                aria-label="Sign in"
              >
                <HiOutlineUser className="navbar-action-icon" />
                <span>Sign in</span>
              </Link>
            )}

            <Link to="/shop" className="navbar-shop-btn">Shop Now</Link>

            <button
              type="button"
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              className="navbar-action-btn navbar-mobile-toggle"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <HiOutlineX className="navbar-action-icon" /> : <HiOutlineMenu className="navbar-action-icon" />}
            </button>
          </div>
        </div>

        {/* Mobile search sits below the logo row so it always has full width */}
        <div className="navbar-search-mobile">
          <SearchBox placeholder="Search products…" />
        </div>

        {/* ─── Sub navigation ─── */}
        <div className="sub-nav">
          <div className="container-custom sub-nav-inner">
            <div className="sub-nav-links">
              {categories.slice(0, 6).map((category) => {
                const isCatActive = location.pathname === '/shop' && activeCategoryId === category._id;
                return (
                  <Link
                    key={category._id}
                    to={`/shop?category=${category._id}`}
                    className={`sub-nav-link ${isCatActive ? 'active' : ''}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
              {STATIC_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`sub-nav-link ${isStaticActive(link.path) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="sub-nav-right">
              <Link
                to="/shop?isFlashDeal=true"
                className={`sub-nav-deal-btn ${isFlashDealActive && location.pathname === '/shop' ? 'active' : ''}`}
              >
                <HiOutlineFire className="sub-nav-deal-icon" />
                <span>Flash Deals</span>
                <span className="sub-nav-deal-badge">Hot</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile menu ─── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => dispatch(setMobileMenuOpen(false))}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              role="dialog"
              aria-label="Menu"
            >
              <div className="mobile-menu-head">
                {isAuthenticated ? (
                  <div className="mobile-menu-user">
                    <span className="mobile-menu-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                    <div>
                      <strong>{user?.firstName} {user?.lastName}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                    Sign in / Create account
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(setMobileMenuOpen(false))}
                  className="mobile-menu-close"
                  aria-label="Close menu"
                >
                  <HiOutlineX />
                </button>
              </div>

              <nav className="mobile-menu-links">
                {categories.length > 0 && (
                  <>
                    <span className="mobile-menu-heading">Categories</span>
                    {categories.map((category) => {
                      const isCatActive = location.pathname === '/shop' && activeCategoryId === category._id;
                      return (
                        <Link
                          key={category._id}
                          to={`/shop?category=${category._id}`}
                          className={`mobile-menu-link ${isCatActive ? 'active' : ''}`}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </>
                )}

                <span className="mobile-menu-heading">Explore</span>
                {STATIC_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`mobile-menu-link ${isStaticActive(link.path) ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <span className="mobile-menu-heading">My account</span>
                    <Link
                      to="/dashboard"
                      className={`mobile-menu-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/orders"
                      className={`mobile-menu-link ${location.pathname === '/dashboard/orders' ? 'active' : ''}`}
                    >
                      My orders
                    </Link>
                    <Link
                      to="/dashboard/wishlist"
                      className={`mobile-menu-link ${location.pathname.includes('wishlist') ? 'active' : ''}`}
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/dashboard/addresses"
                      className={`mobile-menu-link ${location.pathname === '/dashboard/addresses' ? 'active' : ''}`}
                    >
                      Addresses
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className={`mobile-menu-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                      >
                        Admin panel
                      </Link>
                    )}
                    <button type="button" className="mobile-menu-link mobile-menu-signout" onClick={logout}>
                      Sign out
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
