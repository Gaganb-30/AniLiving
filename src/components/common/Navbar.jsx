import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineHeart, HiOutlineShoppingBag, HiOutlineUser,
  HiOutlineMenu, HiOutlineX, HiChevronDown, HiOutlineLogout,
  HiOutlineClipboardList, HiOutlineCog,
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
  { name: 'Brands', path: '/brands' },
  { name: 'Track Order', path: '/track-order' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { mobileMenuOpen } = useSelector((state) => state.ui);
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  const accountRef = useClickOutside(() => setAccountOpen(false), accountOpen);
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Top-level categories drive the mega menu — nothing here is hardcoded, so a
  // new category the admin creates appears in the nav automatically.
  useEffect(() => {
    categoryService.getCategories()
      .then(({ data }) => setCategories((data.data?.categories || []).filter((c) => !c.parent)))
      .catch(() => setCategories([]));
  }, []);

  // Close every popover on navigation
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
    setAccountOpen(false);
    setCategoryMenuOpen(false);
  }, [location.pathname, location.search, dispatch]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span className="navbar-logo-paw">🐾</span>
                <span className="navbar-logo-ani">Ani</span>
                <span className="navbar-logo-living">Living</span>
              </div>
              <div className="navbar-logo-tagline">Everything Your Pet Deserves</div>
            </div>
          </Link>

          {/* Desktop search */}
          <div className="navbar-search-wrap">
            <SearchBox />
          </div>

          <div className="navbar-actions">
            <Link
              to={isAuthenticated ? '/dashboard/wishlist' : '/wishlist'}
              className="navbar-action-btn navbar-action-desktop"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="navbar-action-icon" />
              {wishlistCount > 0 && <span className="navbar-action-badge">{wishlistCount}</span>}
              <span>Wishlist</span>
            </Link>

            <Link to="/cart" className="navbar-action-btn" aria-label={`Cart, ${cartCount} items`}>
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
                  className="navbar-action-btn navbar-action-desktop"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                >
                  <HiOutlineUser className="navbar-action-icon" />
                  <span>{user?.firstName || 'Account'}</span>
                  <HiChevronDown className="navbar-account-chevron" />
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
              <Link to="/login" className="navbar-action-btn navbar-action-desktop" aria-label="Sign in">
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
            <div
              className="sub-nav-category"
              ref={categoryRef}
              onMouseEnter={() => setCategoryMenuOpen(true)}
              onMouseLeave={() => setCategoryMenuOpen(false)}
            >
              <button
                type="button"
                className="sub-nav-category-btn"
                onClick={() => setCategoryMenuOpen((o) => !o)}
                aria-expanded={categoryMenuOpen}
              >
                <HiOutlineMenu />
                Shop by Category
                <HiChevronDown />
              </button>

              <AnimatePresence>
                {categoryMenuOpen && categories.length > 0 && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {categories.map((category) => (
                      <div key={category._id} className="mega-menu-col">
                        <Link to={`/shop?category=${category._id}`} className="mega-menu-title">
                          {category.name}
                        </Link>
                        {category.subcategories?.slice(0, 6).map((sub) => (
                          <Link key={sub._id} to={`/shop?category=${sub._id}`} className="mega-menu-link">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sub-nav-links">
              {categories.slice(0, 4).map((category) => (
                <Link key={category._id} to={`/shop?category=${category._id}`} className="sub-nav-link">
                  {category.name}
                </Link>
              ))}
              {STATIC_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  end={link.path === '/shop'}
                >
                  {link.name}
                </NavLink>
              ))}
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
                    {categories.map((category) => (
                      <Link key={category._id} to={`/shop?category=${category._id}`} className="mobile-menu-link">
                        {category.name}
                      </Link>
                    ))}
                  </>
                )}

                <span className="mobile-menu-heading">Explore</span>
                {STATIC_LINKS.map((link) => (
                  <Link key={link.path} to={link.path} className="mobile-menu-link">{link.name}</Link>
                ))}

                {isAuthenticated && (
                  <>
                    <span className="mobile-menu-heading">My account</span>
                    <Link to="/dashboard" className="mobile-menu-link">Dashboard</Link>
                    <Link to="/dashboard/orders" className="mobile-menu-link">My orders</Link>
                    <Link to="/dashboard/wishlist" className="mobile-menu-link">Wishlist</Link>
                    <Link to="/dashboard/addresses" className="mobile-menu-link">Addresses</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="mobile-menu-link">Admin panel</Link>}
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
