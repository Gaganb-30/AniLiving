import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineAdjustments, HiX, HiChevronDown } from 'react-icons/hi';
import ProductCard, { ProductCardSkeleton } from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Seo, { breadcrumbSchema, itemListSchema } from '../../components/seo/Seo';
import { productService } from '../../services/apiServices';
import { formatCurrency } from '../../utils/format';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
];

/** A collapsible sidebar group — keeps a long facet list from swamping the page */
const FilterGroup = ({ title, children, defaultOpen = true, count }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="shop-filter-group">
      <button
        type="button"
        className="shop-filter-title"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}{count ? ` (${count})` : ''}</span>
        <HiChevronDown className={`shop-filter-chevron ${open ? 'is-open' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="shop-filter-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Price inputs stay local until committed, so typing doesn't refetch per digit
  const [priceDraft, setPriceDraft] = useState({ min: '', max: '' });

  // ---------------------------------------------------------------
  // Query params → API params. Every key except the pure-UI ones is
  // forwarded, which is what makes new attribute filters work with no
  // code change: `attr_Flavour=Chicken` just flows through.
  // ---------------------------------------------------------------
  const queryObject = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const currentPage = parseInt(queryObject.page || '1', 10);
  const currentSort = queryObject.sort || 'newest';

  const activeFilters = useMemo(() => {
    const entries = [];
    for (const [key, value] of Object.entries(queryObject)) {
      if (['page', 'sort', 'limit'].includes(key) || !value) continue;

      if (key.startsWith('attr_')) {
        for (const v of value.split(',')) {
          entries.push({ key, value: v, multi: true, label: `${key.slice(5)}: ${v}` });
        }
      } else if (key === 'category' || key === 'brand') {
        const pool = key === 'category' ? facets?.categories : facets?.brands;
        for (const v of value.split(',')) {
          const name = pool?.find((item) => item._id === v || item.slug === v)?.name;
          entries.push({ key, value: v, multi: true, label: name || (key === 'category' ? 'Category' : 'Brand') });
        }
      } else if (key === 'tags') {
        for (const v of value.split(',')) entries.push({ key, value: v, multi: true, label: v });
      } else if (key === 'rating') {
        entries.push({ key, value, label: `${value}★ & up` });
      } else if (key === 'minPrice') {
        entries.push({ key, value, label: `Min ${formatCurrency(value)}` });
      } else if (key === 'maxPrice') {
        entries.push({ key, value, label: `Max ${formatCurrency(value)}` });
      } else if (key === 'inStock') {
        entries.push({ key, value, label: 'In stock only' });
      } else if (key === 'search') {
        entries.push({ key, value, label: `"${value}"` });
      } else {
        entries.push({ key, value, label: `${key}: ${value}` });
      }
    }
    return entries;
  }, [queryObject, facets]);

  // ---------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productService.getProducts({ limit: 12, ...queryObject });
      setProducts(data.data.products || []);
      setFacets(data.data.filters || null);
      setPagination(data.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setProducts([]);
      setPagination({ page: 1, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [queryObject]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Keep the price inputs in step with the URL
  useEffect(() => {
    setPriceDraft({ min: queryObject.minPrice || '', max: queryObject.maxPrice || '' });
  }, [queryObject.minPrice, queryObject.maxPrice]);

  // Scroll back up to the grid when the page changes
  useEffect(() => {
    if (currentPage > 1) window.scrollTo({ top: 200, behavior: 'smooth' });
  }, [currentPage]);

  // ---------------------------------------------------------------
  // Filter mutations
  // ---------------------------------------------------------------
  const setParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') params.delete(key);
    else params.set(key, value);
    if (key !== 'page') params.delete('page');   // any filter change resets paging
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  /** Toggle one value inside a comma-separated multi-select param */
  const toggleMulti = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    const current = (params.get(key) || '').split(',').filter(Boolean);
    const next = current.includes(String(value))
      ? current.filter((v) => v !== String(value))
      : [...current, String(value)];
    if (next.length) params.set(key, next.join(','));
    else params.delete(key);
    params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const removeFilter = useCallback((entry) => {
    if (entry.multi) toggleMulti(entry.key, entry.value);
    else setParam(entry.key, null);
  }, [toggleMulti, setParam]);

  const clearAll = () => {
    const params = new URLSearchParams();
    if (queryObject.search) params.set('search', queryObject.search);
    setSearchParams(params);
  };

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams);
    if (priceDraft.min) params.set('minPrice', priceDraft.min); else params.delete('minPrice');
    if (priceDraft.max) params.set('maxPrice', priceDraft.max); else params.delete('maxPrice');
    params.delete('page');
    setSearchParams(params);
  };

  const isChecked = (key, value) => (searchParams.get(key) || '').split(',').includes(String(value));

  // ---------------------------------------------------------------
  // Sidebar (shared between desktop rail and mobile drawer)
  // ---------------------------------------------------------------
  const sidebar = (
    <>
      {facets?.categories?.length > 0 && (
        <FilterGroup title="Category">
          {facets.categories.map((category) => (
            <label key={category._id} className="shop-filter-option">
              <input
                type="checkbox"
                checked={isChecked('category', category._id)}
                onChange={() => toggleMulti('category', category._id)}
              />
              <span>{category.name}</span>
              <em>{category.count}</em>
            </label>
          ))}
        </FilterGroup>
      )}

      {facets?.brands?.length > 0 && (
        <FilterGroup title="Brand">
          {facets.brands.map((brand) => (
            <label key={brand._id} className="shop-filter-option">
              <input
                type="checkbox"
                checked={isChecked('brand', brand._id)}
                onChange={() => toggleMulti('brand', brand._id)}
              />
              <span>{brand.name}</span>
              <em>{brand.count}</em>
            </label>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Price">
        <div className="shop-price-inputs">
          <input
            type="number"
            min="0"
            placeholder={facets?.priceRange?.min ? String(facets.priceRange.min) : 'Min'}
            value={priceDraft.min}
            onChange={(e) => setPriceDraft((p) => ({ ...p, min: e.target.value }))}
            aria-label="Minimum price"
          />
          <span>—</span>
          <input
            type="number"
            min="0"
            placeholder={facets?.priceRange?.max ? String(facets.priceRange.max) : 'Max'}
            value={priceDraft.max}
            onChange={(e) => setPriceDraft((p) => ({ ...p, max: e.target.value }))}
            aria-label="Maximum price"
          />
        </div>
        <button type="button" className="shop-price-apply" onClick={applyPrice}>Apply</button>
      </FilterGroup>

      {/* Dynamic attributes — whatever the admin has defined on products */}
      {facets?.attributes?.map((attribute) => (
        <FilterGroup key={attribute.name} title={attribute.name} defaultOpen={false}>
          {attribute.values.slice(0, 15).map((option) => (
            <label key={option.value} className="shop-filter-option">
              <input
                type="checkbox"
                checked={isChecked(`attr_${attribute.name}`, option.value)}
                onChange={() => toggleMulti(`attr_${attribute.name}`, option.value)}
              />
              <span>{option.value}</span>
              <em>{option.count}</em>
            </label>
          ))}
        </FilterGroup>
      ))}

      <FilterGroup title="Customer rating">
        {[4, 3, 2].map((rating) => (
          <label key={rating} className="shop-filter-option">
            <input
              type="radio"
              name="rating"
              checked={queryObject.rating === String(rating)}
              onChange={() => setParam('rating', queryObject.rating === String(rating) ? null : String(rating))}
            />
            <span style={{ color: 'var(--color-primary)' }}>
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
            </span>
            <em>&amp; up</em>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="shop-filter-option">
          <input
            type="checkbox"
            checked={queryObject.inStock === 'true'}
            onChange={() => setParam('inStock', queryObject.inStock === 'true' ? null : 'true')}
          />
          <span>In stock only</span>
        </label>
      </FilterGroup>

      {facets?.tags?.length > 0 && (
        <FilterGroup title="Tags" defaultOpen={false}>
          <div className="shop-tag-cloud">
            {facets.tags.map((tag) => (
              <button
                key={tag.value}
                type="button"
                className={`shop-tag ${isChecked('tags', tag.value) ? 'is-active' : ''}`}
                onClick={() => toggleMulti('tags', tag.value)}
              >
                {tag.value}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}
    </>
  );

  const heading = queryObject.search
    ? `Results for "${queryObject.search}"`
    : facets?.categories?.find((c) => c._id === queryObject.category)?.name || 'All Products';

  return (
    <div className="container-custom section-padding">
      <Seo
        title={heading}
        description="Browse the full AniLiving range of pet food, treats, toys, grooming essentials and accessories. Filter by brand, price and more."
        canonical="/shop"
        jsonLd={[
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]),
          itemListSchema(products, heading),
        ]}
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="section-title" style={{ textAlign: 'left' }}>
          <h1 className="shop-heading">{heading}</h1>
          <p className="shop-subheading">
            {loading ? 'Finding the best picks…' : `${pagination.total} product${pagination.total === 1 ? '' : 's'} available`}
          </p>
        </div>

        {activeFilters.length > 0 && (
          <div className="shop-active-filters">
            {activeFilters.map((entry) => (
              <span key={`${entry.key}-${entry.value}`} className="shop-filter-tag">
                {entry.label}
                <button type="button" onClick={() => removeFilter(entry)} aria-label={`Remove ${entry.label}`}>
                  <HiX />
                </button>
              </span>
            ))}
            <button type="button" className="shop-clear-all" onClick={clearAll}>Clear all</button>
          </div>
        )}

        <div className="shop-layout">
          {/* Desktop sidebar */}
          <aside className="shop-sidebar">
            <div className="shop-sidebar-inner">{sidebar}</div>
          </aside>

          <div className="shop-content">
            <div className="shop-toolbar">
              <button type="button" className="shop-filter-toggle" onClick={() => setDrawerOpen(true)}>
                <HiOutlineAdjustments />
                Filters
                {activeFilters.length > 0 && <span className="shop-filter-count">{activeFilters.length}</span>}
              </button>

              <span className="shop-results-count">
                {loading ? 'Loading…' : `${pagination.total} result${pagination.total === 1 ? '' : 's'}`}
              </span>

              <select
                className="shop-sort-select"
                value={currentSort}
                onChange={(e) => setParam('sort', e.target.value)}
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="product-grid">
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
            ) : (
              <EmptyState
                icon="🔍"
                title="No products match these filters"
                description="Try widening your price range or clearing a filter or two."
                actionText="Clear filters"
                actionLink="/shop"
              />
            )}

            {!loading && pagination.pages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setParam('page', String(currentPage - 1))}
                  aria-label="Previous page"
                >←</button>

                {/* Windowed page numbers so 40 pages don't wrap the screen */}
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
                  .map((page, i, arr) => (
                    <span key={page} style={{ display: 'contents' }}>
                      {i > 0 && page - arr[i - 1] > 1 && <span className="pagination-gap">…</span>}
                      <button
                        type="button"
                        className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => setParam('page', String(page))}
                        aria-current={page === currentPage ? 'page' : undefined}
                      >{page}</button>
                    </span>
                  ))}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => setParam('page', String(currentPage + 1))}
                  aria-label="Next page"
                >→</button>
              </nav>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Mobile filter drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="filter-drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              role="dialog"
              aria-label="Filters"
            >
              <header className="filter-drawer-head">
                <h2>Filters</h2>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
                  <HiX />
                </button>
              </header>
              <div className="filter-drawer-body">{sidebar}</div>
              <footer className="filter-drawer-foot">
                <button type="button" className="btn-secondary" onClick={clearAll}>Clear all</button>
                <button type="button" className="btn-primary" onClick={() => setDrawerOpen(false)}>
                  Show {pagination.total} result{pagination.total === 1 ? '' : 's'}
                </button>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
