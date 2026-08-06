import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiExclamationCircle, HiOutlineRefresh } from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import { orderService } from '../../services/apiServices';
import { useSettings } from '../../hooks/useSettings';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { formatCurrency, errorMessage } from '../../utils/format';

/**
 * Shown when an online payment didn't go through. The order itself still
 * exists in `pending` state, so the shopper can retry payment without
 * rebuilding their basket — which is the difference between a recovered sale
 * and an abandoned one.
 */
const OrderFailedPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order');
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSettings();

  const [order, setOrder] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    orderService.getOrderById(orderId)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => setOrder(null));
  }, [orderId]);

  const retryPayment = async () => {
    if (!order) return;
    setRetrying(true);
    try {
      const { data } = await orderService.retryPayment(order._id);
      await openRazorpayCheckout({
        razorpayOrder: data.data.razorpayOrder,
        order: data.data.order,
        user,
        settings,
        onSuccess: async (response) => {
          try {
            await orderService.verifyPayment(order._id, {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate(`/order-success?order=${order._id}`, { replace: true });
          } catch (err) {
            toast.error(errorMessage(err, 'Payment could not be verified.'));
            setRetrying(false);
          }
        },
        onDismiss: () => setRetrying(false),
        onFailure: () => { toast.error('Payment failed again. Please try another method.'); setRetrying(false); },
      });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not restart the payment.'));
      setRetrying(false);
    }
  };

  return (
    <div className="container-custom section-padding">
      <Seo title="Payment unsuccessful" noindex canonical="/order-failed" />

      <motion.div className="order-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <span className="order-result-icon is-error"><HiExclamationCircle /></span>

        <h1>Payment didn&apos;t go through</h1>
        <p className="order-result-lead">
          No money has been taken. If your account was debited, it will be refunded automatically
          within 5–7 working days.
        </p>

        {order && (
          <div className="order-result-card order-result-card-compact">
            <div className="order-result-head">
              <div>
                <span className="order-result-label">Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span className="order-result-label">Amount</span>
                <strong>{formatCurrency(order.totalPrice)}</strong>
              </div>
              <div>
                <span className="order-result-label">Status</span>
                <strong>Awaiting payment</strong>
              </div>
            </div>
            <p className="order-result-note">
              Your items are still reserved. You can complete the payment now or later from My Orders.
            </p>
          </div>
        )}

        <div className="order-result-actions">
          {order && !order.isPaid && order.paymentMethod === 'razorpay' && (
            <button type="button" className="btn-primary" onClick={retryPayment} disabled={retrying}>
              <HiOutlineRefresh /> {retrying ? 'Opening payment…' : 'Retry payment'}
            </button>
          )}
          <Link to="/dashboard/orders" className="btn-secondary">Go to My Orders</Link>
          <Link to="/contact" className="btn-secondary">Contact support</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderFailedPage;
