import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch, HiOutlineCube, HiOutlineExclamation,
  HiOutlineBan, HiOutlineCurrencyRupee, HiOutlineCheck,
} from 'react-icons/hi';
import {
  AdminPageHeader, AdminTable, AdminPagination, StatCard,
} from '../../components/admin/AdminUI';
import { productService } from '../../services/apiServices';
import { formatCurrency, errorMessage } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Inventory management.
 *
 * Stock is editable inline, one row at a time, because that's how stock actually
 * gets counted — you walk the shelf and correct numbers as you go, rather than
 * opening a full product editor for each item.
 */
const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({ totalProducts: 0, totalUnits: 0, outOfStock: 0, lowStock: 0, stockValue: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [status, setStatus] = useState('');

  // Row id currently being edited → the draft stock value
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    productService.getInventory({
      page,
      limit: 25,
      search: debouncedSearch || undefined,
      status: status || undefined,
    })
      .then(({ data }) => {
        setItems(data.data.items || []);
        setSummary(data.data.summary);
        setPagination(data.data.pagination);
        setDrafts({});
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const saveStock = async (item, patch) => {
    setSavingId(item._id);
    try {
      const { data } = await productService.updateStock(item._id, patch);
      const updated = data.data.product;
      setItems((list) => list.map((row) => (
        row._id === item._id
          ? { ...row, stock: updated.stock, availability: updated.availability }
          : row
      )));
      setDrafts((d) => { const next = { ...d }; delete next[item._id]; return next; });
      toast.success(`${item.name}: stock updated`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Inventory"
        subtitle="Live stock levels, low-stock alerts and quick adjustments."
      />

      <div className="admin-stat-grid">
        <StatCard icon={HiOutlineCube} label="Products tracked" value={summary.totalProducts} tone="blue" />
        <StatCard icon={HiOutlineCube} label="Units in stock" value={summary.totalUnits} tone="primary" />
        <StatCard icon={HiOutlineExclamation} label="Low stock" value={summary.lowStock} hint="At or below alert level" tone="amber" />
        <StatCard icon={HiOutlineBan} label="Out of stock" value={summary.outOfStock} tone="red" />
        <StatCard
          icon={HiOutlineCurrencyRupee}
          label="Stock value"
          value={formatCurrency(summary.stockValue || 0)}
          hint="At cost price where set"
          tone="green"
        />
      </div>

      <div className="admin-filters">
        <div className="admin-search">
          <HiOutlineSearch />
          <input
            type="search"
            placeholder="Search by product name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All products</option>
          <option value="low">Low stock only</option>
          <option value="out">Out of stock only</option>
        </select>
      </div>

      <AdminTable
        columns={['Product', 'SKU', 'Stock', 'Alert at', 'Availability', 'Adjust', '']}
        loading={loading}
        empty={!loading && items.length === 0 ? 'No products match these filters.' : null}
      >
        {items.map((item) => {
          const draft = drafts[item._id];
          const isLow = item.stock > 0 && item.stock <= item.lowStockAlert;
          const isOut = item.stock <= 0;

          return (
            <tr key={item._id} className={isOut ? 'row-danger' : isLow ? 'row-warning' : ''}>
              <td>
                <div className="admin-product-cell">
                  <span className="admin-thumb">
                    {item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : '🐾'}
                  </span>
                  <div>
                    <Link to={`/admin/products/${item._id}`} className="admin-link">{item.name}</Link>
                    {item.variants?.length > 0 && (
                      <span className="admin-cell-sub">{item.variants.length} variant(s)</span>
                    )}
                  </div>
                </div>
              </td>
              <td>{item.sku || '—'}</td>
              <td className="admin-cell-num">
                <strong className={isOut ? 'is-danger' : isLow ? 'is-warning' : ''}>{item.stock}</strong>
              </td>
              <td className="admin-cell-num">{item.lowStockAlert}</td>
              <td>
                <span className={`status-pill tone-${isOut ? 'error' : isLow ? 'warning' : 'success'}`}>
                  {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'In stock'}
                </span>
              </td>
              <td>
                <div className="inventory-adjust">
                  <button type="button" onClick={() => saveStock(item, { adjust: -1 })} disabled={savingId === item._id || item.stock <= 0}>−1</button>
                  <button type="button" onClick={() => saveStock(item, { adjust: 1 })} disabled={savingId === item._id}>+1</button>
                  <button type="button" onClick={() => saveStock(item, { adjust: 10 })} disabled={savingId === item._id}>+10</button>
                </div>
              </td>
              <td>
                <div className="inventory-set">
                  <input
                    type="number"
                    min="0"
                    value={draft ?? item.stock}
                    onChange={(e) => setDrafts((d) => ({ ...d, [item._id]: e.target.value }))}
                    aria-label={`Set stock for ${item.name}`}
                  />
                  <button
                    type="button"
                    className="btn-primary btn-xs"
                    disabled={draft === undefined || Number(draft) === item.stock || savingId === item._id}
                    onClick={() => saveStock(item, { stock: Number(draft) })}
                    title="Set exact stock"
                  >
                    <HiOutlineCheck />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <AdminPagination pagination={pagination} page={page} onPage={setPage} />
    </motion.div>
  );
};

export default AdminInventory;
