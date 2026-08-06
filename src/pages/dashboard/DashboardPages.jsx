import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingBag, HiOutlineHeart, HiOutlineLocationMarker,
  HiOutlineDownload, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil,
  HiOutlineRefresh, HiOutlineX, HiOutlineTruck,
} from 'react-icons/hi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Seo from '../../components/seo/Seo';
import { orderService, userService, downloadBlob } from '../../services/apiServices';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { useSettings } from '../../hooks/useSettings';
import { openRazorpayCheckout } from '../../utils/razorpay';
import {
  formatCurrency, formatDate, formatDateTime, variantLabel,
  orderStatusLabel, orderStatusTone, errorMessage,
} from '../../utils/format';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

/* ══════════════════════════════════════════════════════════════════════
   Dashboard home
   ══════════════════════════════════════════════════════════════════════ */
export const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth);
  const { count: wishlistCount } = useWishlist({ autoLoad: true });
  const [stats, setStats] = useState({ orders: 0, addresses: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderService.getMyOrders({ limit: 5 }),
      userService.getAddresses(),
    ])
      .then(([ordersRes, addressRes]) => {
        const orders = ordersRes.data.data.orders || [];
        setRecentOrders(orders);
        setStats({
          orders: ordersRes.data.data.pagination?.total || orders.length,
          addresses: (addressRes.data.data.addresses || []).length,
          pending: orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tiles = [
    { icon: HiOutlineShoppingBag, label: 'Total orders', value: stats.orders, to: '/dashboard/orders', tone: 'blue' },
    { icon: HiOutlineTruck, label: 'In progress', value: stats.pending, to: '/dashboard/orders', tone: 'amber' },
    { icon: HiOutlineHeart, label: 'Wishlist items', value: wishlistCount, to: '/dashboard/wishlist', tone: 'pink' },
    { icon: HiOutlineLocationMarker, label: 'Saved addresses', value: stats.addresses, to: '/dashboard/addresses', tone: 'green' },
  ];

  return (
    <motion.div {...fade}>
      <Seo title="My account" noindex />
      <h1 className="dash-heading">Hello, {user?.firstName} 👋</h1>
      <p className="dash-subheading">Here&apos;s what&apos;s happening with your account.</p>

      <div className="dash-tiles">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to} className={`dash-tile tone-${tile.tone}`}>
            <span className="dash-tile-icon"><tile.icon /></span>
            <span className="dash-tile-value">{loading ? '—' : tile.value}</span>
            <span className="dash-tile-label">{tile.label}</span>
          </Link>
        ))}
      </div>

      <section className="dash-card">
        <header className="dash-card-head">
          <h2>Recent orders</h2>
          <Link to="/dashboard/orders">View all →</Link>
        </header>

        {loading ? (
          <LoadingSpinner text="Loading your orders…" />
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No orders yet"
            description="When you place your first order it'll appear here."
            actionText="Start shopping"
            actionLink="/shop"
          />
        ) : (
          <ul className="order-mini-list">
            {recentOrders.map((order) => (
              <li key={order._id}>
                <Link to={`/dashboard/orders/${order._id}`}>
                  <span className="order-mini-number">{order.orderNumber}</span>
                  <span className="order-mini-date">{formatDate(order.createdAt)}</span>
                  <span className={`status-pill tone-${orderStatusTone(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                  <span className="order-mini-total">{formatCurrency(order.totalPrice)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Profile
   ══════════════════════════════════════════════════════════════════════ */
export const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const { updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    },
  });

  useEffect(() => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
  }, [user, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const { data } = await userService.updateProfile(values);
      updateUser(data.data.user);
      toast.success('Profile updated');
      reset(values);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div {...fade}>
      <Seo title="My profile" noindex />
      <h1 className="dash-heading">My profile</h1>

      <div className="dash-card">
        <form className="dash-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">First name *</label>
              <input id="firstName" {...register('firstName', { required: 'First name is required' })} />
              {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="lastName">Last name *</label>
              <input id="lastName" {...register('lastName', { required: 'Last name is required' })} />
              {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={user?.email || ''} disabled />
            <span className="form-hint">
              {user?.authProvider === 'google'
                ? 'Your account is linked to Google, so the email cannot be changed here.'
                : 'Contact support if you need to change your email address.'}
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="phone">Mobile number</label>
            <input
              id="phone"
              inputMode="numeric"
              maxLength={10}
              {...register('phone', {
                pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit mobile number' },
              })}
              placeholder="9876543210"
            />
            {errors.phone && <span className="form-error">{errors.phone.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="avatar">Profile picture URL</label>
            <input id="avatar" {...register('avatar')} placeholder="https://…" />
          </div>

          <button type="submit" className="btn-primary" disabled={saving || !isDirty}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Orders list
   ══════════════════════════════════════════════════════════════════════ */
export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    orderService.getMyOrders({ page, limit: 10, status: status || undefined })
      .then(({ data }) => {
        setOrders(data.data.orders || []);
        setPagination(data.data.pagination);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <motion.div {...fade}>
      <Seo title="My orders" noindex />
      <div className="dash-head-row">
        <h1 className="dash-heading">My orders</h1>
        <select
          className="shop-sort-select"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          aria-label="Filter by status"
        >
          <option value="">All orders</option>
          <option value="pending">Payment pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No orders here"
          description={status ? 'Try a different status filter.' : "You haven't placed an order yet."}
          actionText="Start shopping"
          actionLink="/shop"
        />
      ) : (
        <>
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order._id} className="order-card">
                <header className="order-card-head">
                  <div>
                    <Link to={`/dashboard/orders/${order._id}`} className="order-card-number">
                      {order.orderNumber}
                    </Link>
                    <span className="order-card-date">Placed {formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`status-pill tone-${orderStatusTone(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                </header>

                <ul className="order-card-items">
                  {order.items.slice(0, 3).map((item, i) => (
                    <li key={i}>
                      <span className="order-card-thumb">
                        {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : '🐾'}
                      </span>
                      <span className="order-card-item-name">{item.name}</span>
                      <em>×{item.quantity}</em>
                    </li>
                  ))}
                  {order.items.length > 3 && (
                    <li className="order-card-more">+{order.items.length - 3} more item(s)</li>
                  )}
                </ul>

                <footer className="order-card-foot">
                  <span className="order-card-total">{formatCurrency(order.totalPrice)}</span>
                  <div className="order-card-actions">
                    {!order.isPaid && order.paymentMethod === 'razorpay' && !order.isCancelled && (
                      <Link to={`/order-failed?order=${order._id}`} className="btn-secondary btn-sm">
                        Complete payment
                      </Link>
                    )}
                    <Link to={`/dashboard/orders/${order._id}`} className="btn-secondary btn-sm">
                      View details
                    </Link>
                  </div>
                </footer>
              </li>
            ))}
          </ul>

          {pagination.pages > 1 && (
            <nav className="pagination">
              <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</button>
              <span className="pagination-info">Page {page} of {pagination.pages}</span>
              <button type="button" className="pagination-btn" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>→</button>
            </nav>
          )}
        </>
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Order details
   ══════════════════════════════════════════════════════════════════════ */
export const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { settings } = useSettings();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    orderService.getOrderById(orderId)
      .then(({ data }) => setOrder(data.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const downloadInvoice = async () => {
    setBusy(true);
    try {
      const { data } = await orderService.downloadInvoice(order._id);
      downloadBlob(data, `invoice-${order.orderNumber}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not generate the invoice.'));
    } finally {
      setBusy(false);
    }
  };

  const cancelOrder = async () => {
    // eslint-disable-next-line no-alert
    const reason = window.prompt('Why are you cancelling this order? (optional)');
    if (reason === null) return;
    setBusy(true);
    try {
      await orderService.cancelOrder(order._id, reason || undefined);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const retryPayment = async () => {
    setBusy(true);
    try {
      const { data } = await orderService.retryPayment(order._id);
      await openRazorpayCheckout({
        razorpayOrder: data.data.razorpayOrder,
        order: data.data.order,
        user,
        settings,
        onSuccess: async (response) => {
          await orderService.verifyPayment(order._id, {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          });
          navigate(`/order-success?order=${order._id}`);
        },
        onDismiss: () => setBusy(false),
      });
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading order…" />;
  if (!order) {
    return (
      <EmptyState
        icon="🔍"
        title="Order not found"
        description="We couldn't load that order."
        actionText="Back to my orders"
        actionLink="/dashboard/orders"
      />
    );
  }

  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);

  return (
    <motion.div {...fade}>
      <Seo title={`Order ${order.orderNumber}`} noindex />

      <div className="dash-head-row">
        <div>
          <h1 className="dash-heading">Order {order.orderNumber}</h1>
          <p className="dash-subheading">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`status-pill tone-${orderStatusTone(order.status)}`}>
          {orderStatusLabel(order.status)}
        </span>
      </div>

      {(order.trackingNumber || order.trackingUrl) && (
        <div className="track-courier" style={{ marginBottom: '1.25rem' }}>
          <HiOutlineTruck />
          <div>
            <strong>Courier tracking</strong>
            {order.courierName && <span>{order.courierName}</span>}
            {order.trackingNumber && <span>Tracking ID: <code>{order.trackingNumber}</code></span>}
          </div>
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="btn-primary btn-sm">
              Track parcel
            </a>
          )}
        </div>
      )}

      <div className="order-detail-grid">
        <section className="dash-card">
          <h2 className="dash-card-title">Items</h2>
          <ul className="order-detail-items">
            {order.items.map((item, i) => (
              <li key={i}>
                <span className="order-card-thumb">
                  {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : '🐾'}
                </span>
                <span className="order-detail-item-body">
                  {item.product?.slug
                    ? <Link to={`/product/${item.product.slug}`}>{item.name}</Link>
                    : <strong>{item.name}</strong>}
                  {variantLabel(item.variant) && <span>{variantLabel(item.variant)}</span>}
                  <span>Qty {item.quantity} × {formatCurrency(item.price)}</span>
                </span>
                <span className="order-detail-item-total">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="cart-totals">
            <div><dt>Subtotal</dt><dd>{formatCurrency(order.itemsPrice)}</dd></div>
            {order.discountAmount > 0 && (
              <div className="is-discount">
                <dt>Discount{order.coupon?.code ? ` (${order.coupon.code})` : ''}</dt>
                <dd>− {formatCurrency(order.discountAmount)}</dd>
              </div>
            )}
            <div><dt>Tax</dt><dd>{formatCurrency(order.taxPrice)}</dd></div>
            <div>
              <dt>Delivery</dt>
              <dd>{order.shippingPrice === 0 ? <span className="is-free">FREE</span> : formatCurrency(order.shippingPrice)}</dd>
            </div>
            <div className="cart-total-row"><dt>Total</dt><dd>{formatCurrency(order.totalPrice)}</dd></div>
          </dl>
        </section>

        <aside className="order-detail-side">
          <section className="dash-card">
            <h2 className="dash-card-title">Delivery address</h2>
            <p className="order-detail-address">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </p>
          </section>

          <section className="dash-card">
            <h2 className="dash-card-title">Payment</h2>
            <p className="order-detail-payment">
              {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay (online)'}<br />
              <strong className={order.isPaid ? 'is-paid' : 'is-unpaid'}>
                {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Payment pending'}
              </strong>
              {order.paymentResult?.razorpayPaymentId && (
                <><br /><span className="order-detail-txn">Txn: {order.paymentResult.razorpayPaymentId}</span></>
              )}
            </p>
          </section>

          <section className="dash-card">
            <h2 className="dash-card-title">Order timeline</h2>
            <ol className="order-history">
              {[...(order.statusHistory || [])].reverse().map((entry, i) => (
                <li key={i}>
                  <strong>{orderStatusLabel(entry.status)}</strong>
                  <span>{formatDateTime(entry.timestamp)}</span>
                  {entry.note && <em>{entry.note}</em>}
                </li>
              ))}
            </ol>
          </section>

          <div className="order-detail-actions">
            <button type="button" className="btn-secondary" onClick={downloadInvoice} disabled={busy}>
              <HiOutlineDownload /> Invoice
            </button>
            {!order.isPaid && order.paymentMethod === 'razorpay' && !order.isCancelled && (
              <button type="button" className="btn-primary" onClick={retryPayment} disabled={busy}>
                <HiOutlineRefresh /> Pay now
              </button>
            )}
            {canCancel && (
              <button type="button" className="btn-danger" onClick={cancelOrder} disabled={busy}>
                <HiOutlineX /> Cancel order
              </button>
            )}
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Addresses
   ══════════════════════════════════════════════════════════════════════ */
export const AddressesPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // address object or 'new'
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(() => {
    setLoading(true);
    userService.getAddresses()
      .then(({ data }) => setAddresses(data.data.addresses || []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (address) => {
    setEditing(address || 'new');
    reset(address || {
      fullName: '', phone: '', addressLine1: '', addressLine2: '',
      city: '', state: '', pincode: '', type: 'home', isDefault: addresses.length === 0,
    });
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing === 'new') await userService.addAddress(values);
      else await userService.updateAddress(editing._id, values);
      toast.success(editing === 'new' ? 'Address added' : 'Address updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (address) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Delete this address?')) return;
    try {
      await userService.deleteAddress(address._id);
      toast.success('Address deleted');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <motion.div {...fade}>
      <Seo title="My addresses" noindex />
      <div className="dash-head-row">
        <h1 className="dash-heading">My addresses</h1>
        {!editing && (
          <button type="button" className="btn-primary btn-sm" onClick={() => startEdit(null)}>
            <HiOutlinePlus /> Add address
          </button>
        )}
      </div>

      {editing && (
        <div className="dash-card" style={{ marginBottom: '1.25rem' }}>
          <h2 className="dash-card-title">{editing === 'new' ? 'New address' : 'Edit address'}</h2>
          <form className="address-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="a-name">Full name *</label>
                <input id="a-name" {...register('fullName', { required: 'Required' })} />
                {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="a-phone">Mobile number *</label>
                <input
                  id="a-phone"
                  inputMode="numeric"
                  maxLength={10}
                  {...register('phone', {
                    required: 'Required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit number' },
                  })}
                />
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="a-line1">Address line 1 *</label>
              <input id="a-line1" {...register('addressLine1', { required: 'Required' })} />
              {errors.addressLine1 && <span className="form-error">{errors.addressLine1.message}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="a-line2">Address line 2</label>
              <input id="a-line2" {...register('addressLine2')} />
            </div>

            <div className="form-row form-row-3">
              <div className="form-field">
                <label htmlFor="a-city">City *</label>
                <input id="a-city" {...register('city', { required: 'Required' })} />
                {errors.city && <span className="form-error">{errors.city.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="a-state">State *</label>
                <select id="a-state" {...register('state', { required: 'Required' })}>
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <span className="form-error">{errors.state.message}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="a-pin">Pincode *</label>
                <input
                  id="a-pin"
                  inputMode="numeric"
                  maxLength={6}
                  {...register('pincode', {
                    required: 'Required',
                    pattern: { value: /^\d{6}$/, message: '6 digits' },
                  })}
                />
                {errors.pincode && <span className="form-error">{errors.pincode.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="a-type">Type</label>
                <select id="a-type" {...register('type')}>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <label className="form-check">
                <input type="checkbox" {...register('isDefault')} /> Set as default
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save address'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading addresses…" />
      ) : addresses.length === 0 && !editing ? (
        <EmptyState
          icon="📍"
          title="No addresses saved"
          description="Add a delivery address so checkout is one tap away."
        />
      ) : (
        <div className="address-grid">
          {addresses.map((address) => (
            <div key={address._id} className="address-card">
              <div className="address-card-head">
                <strong>{address.fullName}</strong>
                <span className="address-type">{address.type}</span>
                {address.isDefault && <span className="address-default">Default</span>}
              </div>
              <p>
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                {address.city}, {address.state} — {address.pincode}<br />
                📞 {address.phone}
              </p>
              <div className="address-card-actions">
                <button type="button" onClick={() => startEdit(address)}><HiOutlinePencil /> Edit</button>
                <button type="button" className="is-danger" onClick={() => remove(address)}>
                  <HiOutlineTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Change password
   ══════════════════════════════════════════════════════════════════════ */
export const ChangePasswordPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated');
      reset();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Google-only accounts have no password to change
  if (user?.authProvider === 'google' && user?.hasPassword === false) {
    return (
      <motion.div {...fade}>
        <Seo title="Change password" noindex />
        <h1 className="dash-heading">Change password</h1>
        <div className="dash-card">
          <p>
            You sign in with Google, so there&apos;s no AniLiving password to change. Manage your
            password from your Google account instead. If you&apos;d like to add a password here,
            use <Link to="/forgot-password">Forgot password</Link> to set one.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fade}>
      <Seo title="Change password" noindex />
      <h1 className="dash-heading">Change password</h1>

      <div className="dash-card">
        <form className="dash-form" onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 460 }}>
          <div className="form-field">
            <label htmlFor="currentPassword">Current password *</label>
            <input
              id="currentPassword"
              type="password"
              {...register('currentPassword', { required: 'Required' })}
            />
            {errors.currentPassword && <span className="form-error">{errors.currentPassword.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="newPassword">New password *</label>
            <input
              id="newPassword"
              type="password"
              {...register('newPassword', {
                required: 'Required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            {errors.newPassword && <span className="form-error">{errors.newPassword.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm new password *</label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Required',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};
