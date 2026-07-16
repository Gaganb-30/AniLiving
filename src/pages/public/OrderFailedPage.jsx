import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineXCircle } from 'react-icons/hi';

const OrderFailedPage = () => (
  <div className="container-custom section-padding">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
      <HiOutlineXCircle className="w-20 h-20 text-error mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-text mb-3">Payment Failed</h1>
      <p className="text-text-light mb-8">Your payment could not be processed. Don't worry, no amount has been deducted.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/checkout" className="btn-primary">Retry Payment</Link>
        <Link to="/cart" className="btn-secondary">Back to Cart</Link>
      </div>
    </motion.div>
  </div>
);
export default OrderFailedPage;
