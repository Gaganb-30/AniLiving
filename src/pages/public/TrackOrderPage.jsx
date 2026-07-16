import { motion } from 'framer-motion';
const TrackOrderPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
      <div className="section-title"><h2>Track Your Order</h2><p>Enter your order number to check the status.</p></div>
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex gap-3">
          <input type="text" placeholder="Enter Order Number (e.g. ANI-20260713-0001)" className="flex-1 px-4 py-3 border border-border rounded-xl text-sm focus:border-primary focus:outline-none" />
          <button className="btn-primary px-6">Track</button>
        </div>
      </div>
    </motion.div>
  </div>
);
export default TrackOrderPage;
