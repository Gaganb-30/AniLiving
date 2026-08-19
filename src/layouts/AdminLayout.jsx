import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineCollection,
  HiOutlineTag, HiOutlineCog, HiOutlineUsers, HiOutlineTicket,
  HiOutlinePhotograph, HiOutlineArchive, HiOutlineStar,
  HiOutlineClipboardList, HiOutlineMenu, HiOutlineX, HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ADMIN_LINKS = [
  { name: 'Dashboard', path: '/admin', icon: HiOutlineChartBar, end: true },
  { name: 'Products', path: '/admin/products', icon: HiOutlineShoppingBag },
  { name: 'Inventory', path: '/admin/inventory', icon: HiOutlineClipboardList },
  { name: 'Orders', path: '/admin/orders', icon: HiOutlineArchive },
  { name: 'Categories', path: '/admin/categories', icon: HiOutlineCollection },
  { name: 'Customers', path: '/admin/customers', icon: HiOutlineUsers },
  { name: 'Reviews', path: '/admin/reviews', icon: HiOutlineStar },
  { name: 'Coupons', path: '/admin/coupons', icon: HiOutlineTicket },
  { name: 'Banners', path: '/admin/banners', icon: HiOutlinePhotograph },
  { name: 'Settings', path: '/admin/settings', icon: HiOutlineCog },
];

/**
 * Admin shell.
 *
 * Access is gated here for the UX, but every admin API route is independently
 * protected server-side — this guard is convenience, not security.
 */
const AdminLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // redux-persist rehydration can briefly leave `user` empty on a hard refresh
  if (isAuthenticated && !user) {
    return <div className="route-fallback"><LoadingSpinner size="lg" text="Checking access…" /></div>;
  }
  if (!isAuthenticated) return <Navigate to="/login?redirect=/admin" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const sidebar = (
    <>
      <Link to="/" className="admin-brand">
        <img src="/logo.png" alt="AniLiving" className="admin-brand-logo" />
        <span className="admin-brand-tag">Admin</span>
      </Link>

      <nav className="admin-nav">
        {ADMIN_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end}
            className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
          >
            <link.icon />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-foot">
        <Link to="/" className="admin-nav-link">← View store</Link>
        <button type="button" className="admin-nav-link" onClick={logout}>
          <HiOutlineLogout /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-shell">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar">{sidebar}</aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="admin-sidebar is-mobile"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open admin menu"
          >
            {sidebarOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>

          <span className="admin-topbar-title">
            {ADMIN_LINKS.find((l) => (l.end ? location.pathname === l.path : location.pathname.startsWith(l.path)))?.name || 'Admin'}
          </span>

          <div className="admin-topbar-user">
            <span className="admin-avatar">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            <span className="admin-topbar-name">{user?.firstName} {user?.lastName}</span>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
