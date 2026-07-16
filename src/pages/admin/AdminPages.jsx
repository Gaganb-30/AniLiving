import { motion } from 'framer-motion';

const AdminPlaceholder = ({ title = 'Admin Section' }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="bg-white rounded-2xl shadow-soft p-10 text-center">
      <span className="text-5xl block mb-4">🚧</span>
      <h2 className="font-bold text-text text-xl mb-2">{title}</h2>
      <p className="text-text-muted text-sm">This section will be built in Phase 3 — Admin Dashboard.</p>
    </div>
  </motion.div>
);

export const AdminDashboard = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {[
        { label: 'Total Revenue', value: '₹0', bg: 'bg-gradient-to-br from-primary to-primary-dark', icon: '💰' },
        { label: 'Total Orders', value: '0', bg: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: '📦' },
        { label: 'Total Customers', value: '0', bg: 'bg-gradient-to-br from-green-500 to-green-600', icon: '👥' },
        { label: 'Total Products', value: '0', bg: 'bg-gradient-to-br from-purple-500 to-purple-600', icon: '🛍️' },
      ].map((stat, i) => (
        <div key={i} className={`${stat.bg} rounded-2xl p-6 text-white`}>
          <p className="text-3xl mb-1">{stat.icon}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm text-white/70">{stat.label}</p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-soft p-6"><h3 className="font-bold text-text mb-4">Recent Orders</h3><p className="text-text-muted text-sm text-center py-8">No orders yet. Dashboard data will load from the API.</p></div>
      <div className="bg-white rounded-2xl shadow-soft p-6"><h3 className="font-bold text-text mb-4">Top Products</h3><p className="text-text-muted text-sm text-center py-8">Product analytics will appear here.</p></div>
    </div>
  </motion.div>
);

export const AdminProducts = () => <AdminPlaceholder title="Product Management" />;
export const AdminCategories = () => <AdminPlaceholder title="Category Management" />;
export const AdminBrands = () => <AdminPlaceholder title="Brand Management" />;
export const AdminOrders = () => <AdminPlaceholder title="Order Management" />;
export const AdminCustomers = () => <AdminPlaceholder title="Customer Management" />;
export const AdminReviews = () => <AdminPlaceholder title="Review Moderation" />;
export const AdminCoupons = () => <AdminPlaceholder title="Coupon Management" />;
export const AdminBanners = () => <AdminPlaceholder title="Banner Management" />;
export const AdminSettings = () => <AdminPlaceholder title="Store Settings" />;
