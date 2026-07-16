import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLocationMarker } from 'react-icons/hi';

export const DashboardHome = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-xl font-bold text-text mb-6">Dashboard Overview</h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { icon: HiOutlineShoppingBag, label: 'Total Orders', value: '0', color: 'bg-blue-50 text-blue-600' },
        { icon: HiOutlineHeart, label: 'Wishlist Items', value: '0', color: 'bg-pink-50 text-pink-600' },
        { icon: HiOutlineLocationMarker, label: 'Addresses', value: '0', color: 'bg-green-50 text-green-600' },
      ].map((stat, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-soft p-5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}><stat.icon className="w-6 h-6" /></div>
          <div><p className="text-2xl font-bold text-text">{stat.value}</p><p className="text-sm text-text-muted">{stat.label}</p></div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
      <span className="text-5xl block mb-4">📦</span>
      <h3 className="font-semibold text-text text-lg mb-2">No recent orders</h3>
      <p className="text-text-muted text-sm">Your recent orders will appear here.</p>
    </div>
  </motion.div>
);

export const ProfilePage = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-xl font-bold text-text mb-6">My Profile</h2>
    <div className="bg-white rounded-2xl shadow-soft p-8">
      <form className="space-y-4 max-w-lg" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-text-light mb-1 block">First Name</label><input className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
          <div><label className="text-sm font-medium text-text-light mb-1 block">Last Name</label><input className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
        </div>
        <div><label className="text-sm font-medium text-text-light mb-1 block">Email</label><input type="email" disabled className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-background text-text-muted" /></div>
        <div><label className="text-sm font-medium text-text-light mb-1 block">Phone</label><input className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
  </motion.div>
);

export const OrdersPage = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-xl font-bold text-text mb-6">My Orders</h2>
    <div className="bg-white rounded-2xl shadow-soft p-8 text-center"><span className="text-5xl block mb-4">📦</span><h3 className="font-semibold text-text text-lg mb-2">No orders yet</h3><p className="text-text-muted text-sm">Your orders will appear here.</p></div>
  </motion.div>
);

export const AddressesPage = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-text">My Addresses</h2><button className="btn-primary text-sm py-2 px-4">+ Add Address</button></div>
    <div className="bg-white rounded-2xl shadow-soft p-8 text-center"><span className="text-5xl block mb-4">📍</span><h3 className="font-semibold text-text text-lg mb-2">No addresses saved</h3><p className="text-text-muted text-sm">Add your first address to get started.</p></div>
  </motion.div>
);

export const ChangePasswordPage = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h2 className="text-xl font-bold text-text mb-6">Change Password</h2>
    <div className="bg-white rounded-2xl shadow-soft p-8">
      <form className="space-y-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
        <div><label className="text-sm font-medium text-text-light mb-1 block">Current Password</label><input type="password" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
        <div><label className="text-sm font-medium text-text-light mb-1 block">New Password</label><input type="password" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
        <div><label className="text-sm font-medium text-text-light mb-1 block">Confirm New Password</label><input type="password" className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" /></div>
        <button type="submit" className="btn-primary">Update Password</button>
      </form>
    </div>
  </motion.div>
);
