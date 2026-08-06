import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineTruck, HiOutlineDownload, HiOutlineEye,
} from 'react-icons/hi';
import {
  AdminPageHeader, AdminTable, AdminPagination, Modal,
} from '../../components/admin/AdminUI';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { orderService, downloadBlob } from '../../services/apiServices';
import {
  formatCurrency, formatDate, formatDateTime, variantLabel,
  orderStatusLabel, orderStatusTone, errorMessage, ORDER_STATUS,
} from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';

const STATUS_OPTIONS = Object.keys(ORDER_STATUS);

/* ══════════════════════════════════════════════════════════════════════
   Order list
   ══════════════════════════════════════════════════════════════════════ */
export const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const status = searchParams.get('status') || '';
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [paymentMethod, setPaymentMethod] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    orderService.getAllOrders({
      page,
      limit: 20,
      status: status || undefined,
      search: debouncedSearch || undefined,
      paymentMethod: paymentMethod || undefined,
      from: dateRange.from || undefined,
      to: dateRange.to || undefined,
    })
      .then(({ data }) => {
        setOrders(data.data.orders || []);
        setStatusCounts(data.data.statusCounts || {});
        setPagination(data.data.pagination);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, status, debouncedSearch, paymentMethod, dateRange]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [status, debouncedSearch, paymentMethod, dateRange]);

  const setStatus = (value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('status', value); else params.delete('status');
    setSearchParams(params);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Orders"
        subtitle={`${pagination.total} order${pagination.total === 1 ? '' : 's'} match the current filters`}
      />

      {/* Status quick-filter strip */}
      <div className="admin-status-tabs">
        <button type="button" className={!status ? 'is-active' : ''} onClick={() => setStatus('')}>
          All
        </button>
        {STATUS_OPTIONS.map((value) => (
          <button
            key={value}
            type="button"
            className={status === value ? 'is-active' : ''}
            onClick={() => setStatus(value)}
          >
            {orderStatusLabel(value)}
            {statusCounts[value] ? <em>{statusCounts[value]}</em> : null}
          </button>
        ))}
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <HiOutlineSearch />
          <input
            type="search"
            placeholder="Order number, customer name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">All payment methods</option>
          <option value="razorpay">Online (Razorpay)</option>
          <option value="cod">Cash on delivery</option>
        </select>

        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))}
          aria-label="From date"
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
          aria-label="To date"
        />
      </div>

      <AdminTable
        columns={['Order', 'Customer', 'Items', 'Payment', 'Status', 'Total', '']}
        loading={loading}
        empty={!loading && orders.length === 0 ? 'No orders match these filters.' : null}
      >
        {orders.map((order) => (
          <tr key={order._id}>
            <td>
              <Link to={`/admin/orders/${order._id}`} className="admin-link">{order.orderNumber}</Link>
              <span className="admin-cell-sub">{formatDate(order.createdAt)}</span>
            </td>
            <td>
              {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.shippingAddress?.fullName}
              <span className="admin-cell-sub">{order.shippingAddress?.phone}</span>
            </td>
            <td className="admin-cell-num">{order.items?.length || 0}</td>
            <td>
              {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
              <span className={`admin-cell-sub ${order.isPaid ? 'is-positive' : 'is-warning'}`}>
                {order.isPaid ? 'Paid' : 'Unpaid'}
              </span>
            </td>
            <td>
              <span className={`status-pill tone-${orderStatusTone(order.status)}`}>
                {orderStatusLabel(order.status)}
              </span>
              {order.trackingNumber && <span className="admin-cell-sub">📦 {order.trackingNumber}</span>}
            </td>
            <td className="admin-cell-num">{formatCurrency(order.totalPrice)}</td>
            <td>
              <div className="admin-row-actions">
                <Link to={`/admin/orders/${order._id}`} title="Manage order"><HiOutlineEye /></Link>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminPagination pagination={pagination} page={page} onPage={setPage} />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Order detail — status, tracking, payment log
   ══════════════════════════════════════════════════════════════════════ */
export const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsOpen, setLogsOpen] = useState(false);

  const [form, setForm] = useState({
    status: '', note: '', courierName: '', trackingNumber: '',
    trackingUrl: '', estimatedDelivery: '', adminNote: '',
  });

  const load = useCallback(() => {
    setLoading(true);
    orderService.getOrderById(id)
      .then(({ data }) => {
        const o = data.data.order;
        setOrder(o);
        setForm({
          status: o.status,
          note: '',
          courierName: o.courierName || '',
          trackingNumber: o.trackingNumber || '',
          trackingUrl: o.trackingUrl || '',
          estimatedDelivery: o.estimatedDelivery ? o.estimatedDelivery.slice(0, 10) : '',
          adminNote: o.adminNote || '',
        });
      })
      .catch(() => toast.error('Could not load that order.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await orderService.updateOrderStatus(id, {
        status: form.status,
        note: form.note || undefined,
        courierName: form.courierName,
        trackingNumber: form.trackingNumber,
        trackingUrl: form.trackingUrl,
        estimatedDelivery: form.estimatedDelivery || '',
        adminNote: form.adminNote,
      });
      setOrder(data.data.order);
      setForm((f) => ({ ...f, note: '' }));
      toast.success(data.message);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openLogs = async () => {
    setLogsOpen(true);
    try {
      const { data } = await orderService.getPaymentLogs(id);
      setLogs(data.data.logs || []);
    } catch {
      setLogs([]);
    }
  };

  const downloadInvoice = async () => {
    try {
      const { data } = await orderService.downloadInvoice(id);
      downloadBlob(data, `invoice-${order.orderNumber}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading order…" />;
  if (!order) {
    return (
      <div className="admin-card">
        <p>Order not found.</p>
        <button type="button" className="btn-secondary" onClick={() => navigate('/admin/orders')}>
          Back to orders
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
        actions={(
          <>
            <Link to="/admin/orders" className="btn-secondary btn-sm">Back to orders</Link>
            <button type="button" className="btn-secondary btn-sm" onClick={openLogs}>Payment log</button>
            <button type="button" className="btn-secondary btn-sm" onClick={downloadInvoice}>
              <HiOutlineDownload /> Invoice
            </button>
          </>
        )}
      />

      <div className="admin-order-grid">
        {/* ── Left: items + customer ─────────────────────────────── */}
        <div className="admin-order-main">
          <section className="admin-card">
            <header className="admin-card-head"><h2>Items</h2></header>
            <AdminTable columns={['Product', 'SKU', 'Qty', 'Price', 'Total']}>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <div className="admin-product-cell">
                      <span className="admin-thumb">
                        {item.thumbnail ? <img src={item.thumbnail} alt="" /> : '🐾'}
                      </span>
                      <div>
                        {item.product?.slug
                          ? <Link to={`/product/${item.product.slug}`} target="_blank" className="admin-link">{item.name}</Link>
                          : <strong>{item.name}</strong>}
                        {variantLabel(item.variant) && (
                          <span className="admin-cell-sub">{variantLabel(item.variant)}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{item.sku || '—'}</td>
                  <td className="admin-cell-num">{item.quantity}</td>
                  <td className="admin-cell-num">{formatCurrency(item.price)}</td>
                  <td className="admin-cell-num">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </AdminTable>

            <dl className="cart-totals" style={{ marginTop: '1rem' }}>
              <div><dt>Subtotal</dt><dd>{formatCurrency(order.itemsPrice)}</dd></div>
              {order.discountAmount > 0 && (
                <div className="is-discount">
                  <dt>Discount{order.coupon?.code ? ` (${order.coupon.code})` : ''}</dt>
                  <dd>− {formatCurrency(order.discountAmount)}</dd>
                </div>
              )}
              <div><dt>Tax</dt><dd>{formatCurrency(order.taxPrice)}</dd></div>
              <div><dt>Shipping</dt><dd>{formatCurrency(order.shippingPrice)}</dd></div>
              <div className="cart-total-row"><dt>Total</dt><dd>{formatCurrency(order.totalPrice)}</dd></div>
            </dl>
          </section>

          <div className="admin-two-col">
            <section className="admin-card">
              <header className="admin-card-head"><h2>Customer</h2></header>
              <p className="admin-address">
                <strong>{order.user ? `${order.user.firstName} ${order.user.lastName}` : order.shippingAddress.fullName}</strong><br />
                {order.user?.email && <>{order.user.email}<br /></>}
                📞 {order.shippingAddress.phone}
              </p>
              {order.customerNote && (
                <p className="admin-note"><strong>Customer note:</strong> {order.customerNote}</p>
              )}
            </section>

            <section className="admin-card">
              <header className="admin-card-head"><h2>Shipping address</h2></header>
              <p className="admin-address">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
                {order.shippingAddress.country}
              </p>
            </section>
          </div>

          <section className="admin-card">
            <header className="admin-card-head"><h2>Status history</h2></header>
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
        </div>

        {/* ── Right: management panel ────────────────────────────── */}
        <aside className="admin-order-side">
          <section className="admin-card">
            <header className="admin-card-head"><h2>Payment</h2></header>
            <p className="admin-address">
              {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Razorpay (online)'}<br />
              <strong className={order.isPaid ? 'is-positive' : 'is-warning'}>
                {order.isPaid ? `Paid ${formatDate(order.paidAt)}` : 'Payment pending'}
              </strong>
              {order.paymentResult?.razorpayPaymentId && (
                <><br /><span className="admin-cell-sub">Txn: {order.paymentResult.razorpayPaymentId}</span></>
              )}
              {order.paymentResult?.razorpayOrderId && (
                <><br /><span className="admin-cell-sub">RZP order: {order.paymentResult.razorpayOrderId}</span></>
              )}
            </p>
          </section>

          <form className="admin-card" onSubmit={save}>
            <header className="admin-card-head"><h2><HiOutlineTruck /> Fulfilment</h2></header>

            <div className="form-field">
              <label htmlFor="status">Order status</label>
              <select id="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>{orderStatusLabel(value)}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="note">Note for this update</label>
              <input
                id="note"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Optional — shown to the customer in the timeline"
              />
            </div>

            <div className="form-field">
              <label htmlFor="courierName">Courier</label>
              <input
                id="courierName"
                value={form.courierName}
                onChange={(e) => setForm((f) => ({ ...f, courierName: e.target.value }))}
                placeholder="Delhivery, Blue Dart, DTDC…"
              />
            </div>

            <div className="form-field">
              <label htmlFor="trackingNumber">Tracking ID</label>
              <input
                id="trackingNumber"
                value={form.trackingNumber}
                onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                placeholder="AWB / consignment number"
              />
            </div>

            <div className="form-field">
              <label htmlFor="trackingUrl">Tracking link</label>
              <input
                id="trackingUrl"
                type="url"
                value={form.trackingUrl}
                onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))}
                placeholder="https://courier.com/track/123456"
              />
              <span className="form-hint">
                The customer sees this as a &ldquo;Track parcel&rdquo; button on the tracking page and in status emails.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="estimatedDelivery">Estimated delivery</label>
              <input
                id="estimatedDelivery"
                type="date"
                value={form.estimatedDelivery}
                onChange={(e) => setForm((f) => ({ ...f, estimatedDelivery: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="adminNote">Internal note</label>
              <textarea
                id="adminNote"
                rows={3}
                value={form.adminNote}
                onChange={(e) => setForm((f) => ({ ...f, adminNote: e.target.value }))}
                placeholder="Only visible to staff"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? 'Saving…' : 'Update order'}
            </button>
            <p className="form-hint" style={{ marginTop: '0.5rem' }}>
              Changing the status emails the customer automatically. Cancelling or returning an order restores its stock.
            </p>
          </form>
        </aside>
      </div>

      <Modal open={logsOpen} onClose={() => setLogsOpen(false)} title="Payment log" size="lg">
        {logs.length === 0 ? (
          <p>No payment events recorded for this order.</p>
        ) : (
          <AdminTable columns={['When', 'Source', 'Event', 'Status', 'Amount', 'Reference']}>
            {logs.map((log) => (
              <tr key={log._id}>
                <td>{formatDateTime(log.createdAt)}</td>
                <td>{log.source}</td>
                <td>{log.event}</td>
                <td>
                  <span className={`status-pill tone-${log.status === 'paid' ? 'success' : log.status === 'failed' ? 'error' : 'muted'}`}>
                    {log.status}
                  </span>
                </td>
                <td className="admin-cell-num">{log.amount ? formatCurrency(log.amount) : '—'}</td>
                <td>
                  <span className="admin-cell-sub">{log.razorpayPaymentId || log.razorpayOrderId || '—'}</span>
                  {log.errorDescription && <span className="admin-cell-sub is-danger">{log.errorDescription}</span>}
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </Modal>
    </motion.div>
  );
};

export default AdminOrders;
