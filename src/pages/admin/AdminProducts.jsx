import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlineDuplicate, HiOutlinePencil, HiOutlineTrash,
  HiOutlineDownload, HiOutlineUpload, HiOutlineSearch, HiOutlineEye,
} from 'react-icons/hi';
import {
  AdminPageHeader, AdminTable, AdminPagination, ConfirmDialog, Modal,
} from '../../components/admin/AdminUI';
import {
  productService, categoryService, brandService, downloadBlob,
} from '../../services/apiServices';
import { formatCurrency, errorMessage } from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Product list — search, filter, bulk actions, duplicate, CSV import/export.
 * The editor itself lives in AdminProductForm so this screen stays fast.
 */
const AdminProducts = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', brand: '', isActive: '', lowStock: '' });
  const debouncedSearch = useDebounce(search, 350);

  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importCsv, setImportCsv] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    productService.getAdminProducts({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      brand: filters.brand || undefined,
      isActive: filters.isActive || undefined,
      lowStock: filters.lowStock || undefined,
    })
      .then(({ data }) => {
        setProducts(data.data.products || []);
        setPagination(data.data.pagination);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filters]);

  useEffect(() => {
    Promise.all([categoryService.getAdminCategories(), brandService.getAdminBrands()])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data.data.categories || []);
        setBrands(brandRes.data.data.brands || []);
      })
      .catch(() => {});
  }, []);

  // ── Row actions ───────────────────────────────────────────────────
  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSelectAll = () => setSelected((s) => (s.length === products.length ? [] : products.map((p) => p._id)));

  const duplicate = async (product) => {
    try {
      const { data } = await productService.duplicateProduct(product._id);
      toast.success('Duplicated as a draft');
      navigate(`/admin/products/${data.data.product._id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (product) => {
    try {
      await productService.deleteProduct(product._id);
      toast.success('Product deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const bulkDelete = async () => {
    try {
      await productService.bulkDelete(selected);
      toast.success(`${selected.length} product(s) deleted`);
      setSelected([]);
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const bulkStatus = async (updates, label) => {
    try {
      await productService.bulkUpdateStatus(selected, updates);
      toast.success(`${selected.length} product(s) ${label}`);
      setSelected([]);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  // ── CSV ───────────────────────────────────────────────────────────
  const exportCsv = async () => {
    try {
      const { data } = await productService.exportProducts();
      downloadBlob(data, `aniliving-products-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('Export downloaded');
    } catch (err) {
      toast.error(errorMessage(err, 'Export failed.'));
    }
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImportCsv(String(reader.result || '')); setImportOpen(true); };
    reader.readAsText(file);
    event.target.value = '';   // allow re-selecting the same file
  };

  const runImport = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const { data } = await productService.importProducts(importCsv, true);
      setImportResult(data.data);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(errorMessage(err, 'Import failed.'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Products"
        subtitle={`${pagination.total} product${pagination.total === 1 ? '' : 's'} in the catalogue`}
        actions={(
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>
              <HiOutlineUpload /> Import CSV
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={exportCsv}>
              <HiOutlineDownload /> Export CSV
            </button>
            <Link to="/admin/products/new" className="btn-primary btn-sm">
              <HiOutlinePlus /> Add product
            </Link>
          </>
        )}
      />

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="admin-filters">
        <div className="admin-search">
          <HiOutlineSearch />
          <input
            type="search"
            placeholder="Search by name, SKU or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select value={filters.brand} onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>

        <select value={filters.isActive} onChange={(e) => setFilters((f) => ({ ...f, isActive: e.target.value }))}>
          <option value="">Published &amp; drafts</option>
          <option value="true">Published only</option>
          <option value="false">Drafts only</option>
        </select>

        <select value={filters.lowStock} onChange={(e) => setFilters((f) => ({ ...f, lowStock: e.target.value }))}>
          <option value="">Any stock level</option>
          <option value="true">Low stock only</option>
        </select>
      </div>

      {/* ── Bulk bar ─────────────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="admin-bulk-bar">
          <span>{selected.length} selected</span>
          <button type="button" onClick={() => bulkStatus({ isActive: true }, 'published')}>Publish</button>
          <button type="button" onClick={() => bulkStatus({ isActive: false }, 'unpublished')}>Unpublish</button>
          <button type="button" onClick={() => bulkStatus({ isFeatured: true }, 'featured')}>Mark featured</button>
          <button
            type="button"
            className="is-danger"
            onClick={() => setConfirm({ type: 'bulk', count: selected.length })}
          >
            Delete
          </button>
          <button type="button" onClick={() => setSelected([])}>Clear</button>
        </div>
      )}

      <AdminTable
        columns={['', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']}
        loading={loading}
        empty={!loading && products.length === 0 ? 'No products match these filters.' : null}
      >
        {products.map((product) => (
          <tr key={product._id} className={selected.includes(product._id) ? 'is-selected' : ''}>
            <td>
              <input
                type="checkbox"
                checked={selected.includes(product._id)}
                onChange={() => toggleSelect(product._id)}
                aria-label={`Select ${product.name}`}
              />
            </td>
            <td>
              <div className="admin-product-cell">
                <span className="admin-thumb">
                  {product.thumbnail ? <img src={product.thumbnail} alt="" loading="lazy" /> : '🐾'}
                </span>
                <div>
                  <Link to={`/admin/products/${product._id}`} className="admin-link">{product.name}</Link>
                  <span className="admin-cell-sub">
                    {product.sku || 'No SKU'}
                    {product.variantCount > 0 && ` · ${product.variantCount} variant(s)`}
                  </span>
                </div>
              </div>
            </td>
            <td>
              {product.category?.name || '—'}
              <span className="admin-cell-sub">{product.brand?.name || ''}</span>
            </td>
            <td className="admin-cell-num">
              {formatCurrency(product.price)}
              {product.mrp > product.price && (
                <span className="admin-cell-sub">MRP {formatCurrency(product.mrp)}</span>
              )}
            </td>
            <td className="admin-cell-num">
              <span className={product.stock <= 0 ? 'is-danger' : product.stock <= product.lowStockAlert ? 'is-warning' : ''}>
                {product.stock}
              </span>
            </td>
            <td>
              <span className={`status-pill tone-${product.isActive ? 'success' : 'muted'}`}>
                {product.isActive ? 'Published' : 'Draft'}
              </span>
              {product.isFeatured && <span className="admin-flag">Featured</span>}
            </td>
            <td>
              <div className="admin-row-actions">
                <Link to={`/product/${product.slug}`} target="_blank" title="View on site"><HiOutlineEye /></Link>
                <Link to={`/admin/products/${product._id}`} title="Edit"><HiOutlinePencil /></Link>
                <button type="button" onClick={() => duplicate(product)} title="Duplicate"><HiOutlineDuplicate /></button>
                <button
                  type="button"
                  className="is-danger"
                  onClick={() => setConfirm({ type: 'single', product })}
                  title="Delete"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {products.length > 0 && (
        <label className="admin-select-all">
          <input
            type="checkbox"
            checked={selected.length === products.length && products.length > 0}
            onChange={toggleSelectAll}
          />
          Select all on this page
        </label>
      )}

      <AdminPagination pagination={pagination} page={page} onPage={setPage} />

      {/* ── Confirmations ────────────────────────────────────────── */}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.type === 'bulk' ? 'Delete selected products?' : 'Delete this product?'}
        message={confirm?.type === 'bulk'
          ? `${confirm.count} product(s) will be permanently removed. This cannot be undone.`
          : `"${confirm?.product?.name}" will be permanently removed. This cannot be undone.`}
        onCancel={() => setConfirm(null)}
        onConfirm={() => (confirm?.type === 'bulk' ? bulkDelete() : remove(confirm.product))}
      />

      {/* ── CSV import ───────────────────────────────────────────── */}
      <Modal
        open={importOpen}
        onClose={() => { setImportOpen(false); setImportResult(null); }}
        title="Import products from CSV"
        size="lg"
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => { setImportOpen(false); setImportResult(null); }}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={runImport} disabled={importing || !importCsv}>
              {importing ? 'Importing…' : 'Run import'}
            </button>
          </>
        )}
      >
        <p className="admin-modal-note">
          Rows are matched on <strong>SKU</strong> first, then <strong>slug</strong> — matching rows are updated
          rather than duplicated. Categories must already exist. Use <em>Export CSV</em> to get a template with the
          exact column names, and separate list values (images, tags, features) with a <code>|</code> pipe.
        </p>

        <textarea
          className="admin-csv-preview"
          value={importCsv}
          onChange={(e) => setImportCsv(e.target.value)}
          rows={10}
          spellCheck={false}
        />

        {importResult && (
          <div className="admin-import-result">
            <p>
              <strong>{importResult.created}</strong> created ·{' '}
              <strong>{importResult.updated}</strong> updated ·{' '}
              <strong>{importResult.skipped}</strong> skipped
            </p>
            {importResult.errors?.length > 0 && (
              <ul className="admin-import-errors">
                {importResult.errors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default AdminProducts;
