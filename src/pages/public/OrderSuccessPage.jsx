import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle } from 'react-icons/hi';

const OrderSuccessPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
      <HiOutlineCheckCircle className="w-20 h-20 text-success mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-text mb-3">Order Placed Successfully!</h1>
      <p className="text-text-light mb-2">Thank you for your order. You'll receive a confirmation email shortly.</p>
      <p className="text-sm text-text-muted mb-8">Order Number: <strong className="text-text">ANI-20260713-0001</strong></p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard/orders" className="btn-primary">View My Orders</Link>
        <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
      </div>
    </motion.div>
  </div>
);
export default OrderSuccessPage;
