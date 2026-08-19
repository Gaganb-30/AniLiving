import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCurrencyRupee, HiOutlineShoppingCart, HiOutlineUsers,
  HiOutlineCube, HiOutlineExclamation, HiOutlineClock,
} from 'react-icons/hi';
import { AdminPageHeader, StatCard, AdminTable } from '../../components/admin/AdminUI';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { dashboardService } from '../../services/apiServices';
import {
  formatCurrency, formatDate, orderStatusLabel, orderStatusTone,
} from '../../utils/format';

/**
 * Admin analytics home.
 *
 * The revenue chart is drawn as an inline SVG rather than pulling in a charting
 * library — it's one series of thirty points, and the bundle saving matters
 * more than the flexibility would.
 */
const RevenueChart = ({ data = [] }) => {
  if (data.length < 2) {
    return <p className="admin-chart-empty">Not enough data yet — the chart appears once you have a few days of orders.</p>;
  }

  const width = 640;
  const height = 200;
  const padding = { top: 12, right: 8, bottom: 24, left: 8 };
  const max = Math.max(...data.map((d) => d.revenue)) || 1;
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - (d.revenue / max) * innerH;
    return { x, y, ...d };
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${points.at(-1).x.toFixed(1)},${(padding.top + innerH).toFixed(1)} L${points[0].x.toFixed(1)},${(padding.top + innerH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart" role="img" aria-label="Revenue over the last 30 days">
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFD60A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#revFill)" />
      <path d={line} fill="none" stroke="#FFD60A" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p) => (
        <circle key={p._id} cx={p.x} cy={p.y} r="3" fill="#fff" stroke="#FFD60A" strokeWidth="2">
          <title>{`${p._id}: ${formatCurrency(p.revenue)} from ${p.orders} order(s)`}</title>
        </circle>
      ))}
      <text x={padding.left} y={height - 6} className="admin-chart-axis">{data[0]._id}</text>
      <text x={width - padding.right} y={height - 6} textAnchor="end" className="admin-chart-axis">{data.at(-1)._id}</text>
    </svg>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Crunching the numbers…" />;
  if (error || !stats) return <p className="admin-error">{error || 'No data available.'}</p>;

  const { overview, recentOrders, topProducts, ordersByStatus, dailyRevenue } = stats;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Dashboard"
        subtitle="How the store is performing right now."
      />

      <div className="admin-stat-grid">
        <StatCard
          icon={HiOutlineCurrencyRupee}
          label="Revenue this month"
          value={formatCurrency(overview.monthlyRevenue)}
          hint={`${formatCurrency(overview.totalRevenue)} all time`}
          trend={overview.revenueGrowth}
          tone="primary"
        />
        <StatCard
          icon={HiOutlineShoppingCart}
          label="Orders this month"
          value={overview.monthlyOrders}
          hint={`${overview.totalOrders} all time`}
          tone="blue"
        />
        <StatCard
          icon={HiOutlineClock}
          label="Awaiting fulfilment"
          value={overview.pendingOrders}
          hint="Pending, confirmed or processing"
          tone="amber"
        />
        <StatCard
          icon={HiOutlineUsers}
          label="Customers"
          value={overview.totalCustomers}
          tone="green"
        />
        <StatCard
          icon={HiOutlineCube}
          label="Products"
          value={overview.totalProducts}
          tone="purple"
        />
        <StatCard
          icon={HiOutlineExclamation}
          label="Low stock items"
          value={overview.lowStockProducts}
          hint="At or below their alert level"
          tone="red"
        />
      </div>

      <section className="admin-card">
        <header className="admin-card-head">
          <h2>Revenue — last 30 days</h2>
        </header>
        <RevenueChart data={dailyRevenue} />
      </section>

      <div className="admin-two-col">
        <section className="admin-card">
          <header className="admin-card-head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders">View all →</Link>
          </header>
          <AdminTable
            columns={['Order', 'Customer', 'Status', 'Total']}
            empty={recentOrders.length === 0 ? 'No orders yet.' : null}
          >
            {recentOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <Link to={`/admin/orders/${order._id}`} className="admin-link">{order.orderNumber}</Link>
                  <span className="admin-cell-sub">{formatDate(order.createdAt)}</span>
                </td>
                <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}</td>
                <td>
                  <span className={`status-pill tone-${orderStatusTone(order.status)}`}>
                    {orderStatusLabel(order.status)}
                  </span>
                </td>
                <td className="admin-cell-num">{formatCurrency(order.totalPrice)}</td>
              </tr>
            ))}
          </AdminTable>
        </section>

        <section className="admin-card">
          <header className="admin-card-head">
            <h2>Best sellers</h2>
            <Link to="/admin/products">Manage →</Link>
          </header>
          <AdminTable
            columns={['Product', 'Sold', 'Revenue']}
            empty={topProducts.length === 0 ? 'No sales yet.' : null}
          >
            {topProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td className="admin-cell-num">{product.totalSold}</td>
                <td className="admin-cell-num">{formatCurrency(product.revenue)}</td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </div>

      <section className="admin-card">
        <header className="admin-card-head"><h2>Orders by status</h2></header>
        <div className="admin-status-grid">
          {ordersByStatus.map((entry) => (
            <Link key={entry._id} to={`/admin/orders?status=${entry._id}`} className="admin-status-chip">
              <span className={`status-dot tone-${orderStatusTone(entry._id)}`} />
              <strong>{entry.count}</strong>
              <span>{orderStatusLabel(entry._id)}</span>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default AdminDashboard;
