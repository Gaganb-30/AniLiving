import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineHeart, HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { setSearchOpen, setMobileMenuOpen } from '../../redux/slices/uiSlice';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Categories', path: '/categories' },
  { name: 'Brands', path: '/brands' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const { mobileMenuOpen } = useSelector((state) => state.ui);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cartItems?.filter((i) => !i.savedForLater)?.length || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
  }, [location.pathname, dispatch]);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-secondary text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide">
        Free Delivery on Prepaid Orders • COD Available • Up To 40% Off
      </div>

      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-soft' : 'bg-white'
        }`}
      >
        <div className="container-custom flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-extrabold text-primary tracking-tight group-hover:text-primary-dark transition-colors">
              Ani
            </span>
            <span className="text-2xl font-extrabold text-secondary tracking-tight">
              Living
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[15px] font-semibold transition-colors relative py-1 ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-text hover:text-primary'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => dispatch(setSearchOpen(true))}
              className="p-2.5 rounded-full hover:bg-accent-light transition-colors"
              aria-label="Search"
            >
              <HiOutlineSearch className="w-5 h-5 text-text" />
            </button>

            {/* Wishlist */}
            <Link
              to={isAuthenticated ? '/dashboard/wishlist' : '/login'}
              className="p-2.5 rounded-full hover:bg-accent-light transition-colors hidden sm:flex"
              aria-label="Wishlist"
            >
              <HiOutlineHeart className="w-5 h-5 text-text" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2.5 rounded-full hover:bg-accent-light transition-colors relative"
              aria-label="Cart"
            >
              <HiOutlineShoppingBag className="w-5 h-5 text-text" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* User / Login */}
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="p-2.5 rounded-full hover:bg-accent-light transition-colors hidden sm:flex"
                aria-label="Account"
              >
                <HiOutlineUser className="w-5 h-5 text-text" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex btn-primary text-sm py-2 px-5"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
              className="p-2.5 rounded-full hover:bg-accent-light transition-colors lg:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <HiOutlineX className="w-5 h-5 text-text" />
              ) : (
                <HiOutlineMenu className="w-5 h-5 text-text" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-border-light overflow-hidden"
            >
              <div className="container-custom py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`py-3 px-4 rounded-xl text-[15px] font-semibold transition-colors ${
                      location.pathname === link.path
                        ? 'bg-accent-light text-primary'
                        : 'text-text hover:bg-accent-light hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="btn-primary text-center mt-2"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
