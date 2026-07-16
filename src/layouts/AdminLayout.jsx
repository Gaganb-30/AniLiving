import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineChartBar, HiOutlineShoppingBag, HiOutlineCollection,
  HiOutlineTag, HiOutlineCog, HiOutlineUsers, HiOutlineTicket,
  HiOutlinePhotograph, HiOutlineArchive, HiOutlineStar,
} from 'react-icons/hi';

const adminLinks = [
  { name: 'Dashboard', path: '/admin', icon: HiOutlineChartBar },
  { name: 'Products', path: '/admin/products', icon: HiOutlineShoppingBag },
  { name: 'Categories', path: '/admin/categories', icon: HiOutlineCollection },
  { name: 'Brands', path: '/admin/brands', icon: HiOutlineTag },
  { name: 'Orders', path: '/admin/orders', icon: HiOutlineArchive },
  { name: 'Customers', path: '/admin/customers', icon: HiOutlineUsers },
  { name: 'Reviews', path: '/admin/reviews', icon: HiOutlineStar },
  { name: 'Coupons', path: '/admin/coupons', icon: HiOutlineTicket },
  { name: 'Banners', path: '/admin/banners', icon: HiOutlinePhotograph },
  { name: 'Settings', path: '/admin/settings', icon: HiOutlineCog },
];

/**
 * Admin Dashboard Layout with sidebar navigation
 */
const AdminLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary-dark text-white min-h-screen fixed left-0 top-0 z-40 overflow-y-auto">
        <div className="p-6">
          <Link to="/" className="inline-block mb-8">
            <span className="text-xl font-extrabold text-primary">Ani</span>
            <span className="text-xl font-extrabold text-white">Living</span>
            <span className="block text-xs text-white/50 mt-0.5">Admin Panel</span>
          </Link>

          <nav className="flex flex-col gap-1">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-border-light px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-lg font-semibold text-text">
            {adminLinks.find((l) => l.path === location.pathname)?.name || 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-text-light hover:text-primary transition-colors">
              View Store →
            </Link>
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
