import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineSearch, HiCheckCircle, HiOutlineTruck, HiOutlineExternalLink,
} from 'react-icons/hi';
import Seo from '../../components/seo/Seo';
import {
  formatDate, formatDateTime, orderStatusLabel, orderStatusTone, ORDER_TIMELINE, errorMessage,
} from '../../utils/format';
import { orderService } from '../../services/apiServices';

/**
 * Public order tracking. Deliberately available without signing in — the order
 * number is the credential, and only non-sensitive status fields are returned.
 * If the admin has attached a courier tracking ID or link, it shows here.
 */
const TrackOrderPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const track = useCallback(async (value) => {
    const number = (value || '').trim().toUpperCase();
    if (!number) return;

    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await orderService.trackOrder(number);
      setOrder(data.data.order);
    } catch (err) {
      setError(errorMessage(err, 'We could not find that order number.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Deep link support: /track-order?order=ANI-... (used in status emails)
  useEffect(() => {
    const fromUrl = searchParams.get('order');
    if (fromUrl) track(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSearchParams(orderNumber.trim() ? { order: orderNumber.trim().toUpperCase() } : {});
    track(orderNumber);
  };

  // Where the order sits on the happy path; cancelled/returned orders sit outside it
  const stageIndex = order ? ORDER_TIMELINE.indexOf(order.status) : -1;
  const isTerminalFailure = order && ['cancelled', 'returned', 'refunded'].includes(order.status);

  return (
    <div className="container-custom section-padding">
      <Seo
        title="Track your order"
        description="Enter your AniLiving order number to see live delivery status and courier tracking details."
        canonical="/track-order"
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="track-wrap">
        <div className="section-title">
          <h1 className="page-heading">Track your order</h1>
          <p className="page-subheading">Enter the order number from your confirmation email.</p>
        </div>

        <form className="track-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="e.g. ANI-20260802-0001A1B2"
            aria-label="Order number"
          />
          <button type="submit" className="btn-primary" disabled={loading || !orderNumber.trim()}>
            <HiOutlineSearch /> {loading ? 'Checking…' : 'Track'}
          </button>
        </form>

        {error && <p className="track-error">{error}</p>}

        {order && (
          <motion.div className="track-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <header className="track-result-head">
              <div>
                <span className="track-label">Order</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span className="track-label">Placed on</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>
              <span className={`status-pill tone-${orderStatusTone(order.status)}`}>
                {orderStatusLabel(order.status)}
              </span>
            </header>

            {/* Courier tracking supplied by the admin */}
            {(order.trackingNumber || order.trackingUrl) && (
              <div className="track-courier">
                <HiOutlineTruck />
                <div>
                  <strong>Courier tracking</strong>
                  {order.courierName && <span>{order.courierName}</span>}
                  {order.trackingNumber && <span>Tracking ID: <code>{order.trackingNumber}</code></span>}
                </div>
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="btn-primary">
                    Track parcel <HiOutlineExternalLink />
                  </a>
                )}
              </div>
            )}

            {order.estimatedDelivery && !order.isDelivered && (
              <p className="track-eta">
                Estimated delivery by <strong>{formatDate(order.estimatedDelivery)}</strong>
              </p>
            )}

            {/* Progress timeline */}
            {!isTerminalFailure ? (
              <ol className="track-timeline">
                {ORDER_TIMELINE.map((stage, index) => {
                  const reached = stageIndex >= index;
                  const entry = [...(order.statusHistory || [])].reverse().find((h) => h.status === stage);
                  return (
                    <li key={stage} className={reached ? 'is-done' : ''}>
                      <span className="track-timeline-dot">{reached ? <HiCheckCircle /> : index + 1}</span>
                      <span className="track-timeline-body">
                        <strong>{orderStatusLabel(stage)}</strong>
                        {entry && <span>{formatDateTime(entry.timestamp)}</span>}
                        {entry?.note && <em>{entry.note}</em>}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="track-terminal">
                <p>This order was <strong>{orderStatusLabel(order.status).toLowerCase()}</strong>.</p>
                {order.statusHistory?.slice(-1)[0]?.note && (
                  <p className="track-terminal-note">{order.statusHistory.slice(-1)[0].note}</p>
                )}
              </div>
            )}

            {order.items?.length > 0 && (
              <ul className="track-items">
                {order.items.map((item, i) => (
                  <li key={i}>
                    <span className="track-item-image">
                      {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : '🐾'}
                    </span>
                    <span>{item.name}</span>
                    <em>×{item.quantity}</em>
                  </li>
                ))}
              </ul>
            )}

            <p className="track-help">
              Something not right? <Link to="/contact">Contact our support team</Link> with your order number.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default TrackOrderPage;
