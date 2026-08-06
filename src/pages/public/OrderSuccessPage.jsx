import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiOutlineDownload, HiOutlineTruck } from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { orderService, downloadBlob } from '../../services/apiServices';
import { formatCurrency, formatDate, variantLabel } from '../../utils/format';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    orderService.getOrderById(orderId)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const downloadInvoice = async () => {
    setDownloading(true);
    try {
      const { data } = await orderService.downloadInvoice(orderId);
      downloadBlob(data, `invoice-${order.orderNumber}.pdf`);
    } catch {
      // The invoice is also available later from My Orders
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container-custom section-padding">
      <Seo title="Order confirmed" noindex canonical="/order-success" />

      <motion.div
        className="order-result"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.span
          className="order-result-icon is-success"
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        >
          <HiCheckCircle />
        </motion.span>

        <h1>Thank you — your order is confirmed!</h1>
        <p className="order-result-lead">
          We&apos;ve emailed you a confirmation. You can follow your order&apos;s progress any time from
          your account or the tracking page.
        </p>

        {loading && <LoadingSpinner text="Loading your order…" />}

        {order && (
          <div className="order-result-card">
            <div className="order-result-head">
              <div>
                <span className="order-result-label">Order number</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span className="order-result-label">Placed on</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <div>
                <span className="order-result-label">Total paid</span>
                <strong>{formatCurrency(order.totalPrice)}</strong>
              </div>
              <div>
                <span className="order-result-label">Payment</span>
                <strong>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}</strong>
              </div>
            </div>

            <ul className="order-result-items">
              {order.items.map((item) => (
                <li key={item._id}>
                  <span className="order-result-item-image">
                    {item.thumbnail ? <img src={item.thumbnail} alt="" /> : '🐾'}
                  </span>
                  <span className="order-result-item-body">
                    <strong>{item.name}</strong>
                    {variantLabel(item.variant) && <span>{variantLabel(item.variant)}</span>}
                    <span>Qty {item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="order-result-address">
              <span className="order-result-label">Delivering to</span>
              <p>
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
                📞 {order.shippingAddress.phone}
              </p>
            </div>
          </div>
        )}

        <div className="order-result-actions">
          {order && (
            <button type="button" className="btn-secondary" onClick={downloadInvoice} disabled={downloading}>
              <HiOutlineDownload /> {downloading ? 'Preparing…' : 'Download invoice'}
            </button>
          )}
          <Link to="/dashboard/orders" className="btn-secondary">
            <HiOutlineTruck /> Track my orders
          </Link>
          <Link to="/shop" className="btn-primary">Continue shopping</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
