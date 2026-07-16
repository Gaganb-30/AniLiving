import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineUser, HiOutlineHeart, HiOutlineShoppingBag, HiOutlineLocationMarker, HiOutlineLockClosed, HiOutlineHome } from 'react-icons/hi';

const sidebarLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome },
  { name: 'My Profile', path: '/dashboard/profile', icon: HiOutlineUser },
  { name: 'My Orders', path: '/dashboard/orders', icon: HiOutlineShoppingBag },
  { name: 'Wishlist', path: '/dashboard/wishlist', icon: HiOutlineHeart },
  { name: 'Addresses', path: '/dashboard/addresses', icon: HiOutlineLocationMarker },
  { name: 'Change Password', path: '/dashboard/change-password', icon: HiOutlineLockClosed },
];

/**
 * User Dashboard Layout with sidebar navigation
 */
const DashboardLayout = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="container-custom section-padding">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24">
            {/* User Info */}
            <div className="text-center mb-6 pb-6 border-b border-border-light">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <p className="font-semibold text-text">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-text-muted">{user?.email}</p>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-button'
                        : 'text-text-light hover:bg-accent-light hover:text-primary'
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
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
