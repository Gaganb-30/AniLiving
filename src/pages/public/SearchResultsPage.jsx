import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard, { ProductCardSkeleton } from '../../components/common/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Seo, { itemListSchema } from '../../components/seo/Seo';
import { productService, searchService } from '../../services/apiServices';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
];

/**
 * Full search results page. The header dropdown handles quick lookups; this
 * page is the paginated, sortable version people land on when they hit Enter.
 */
const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [related, setRelated] = useState({ categories: [], brands: [], suggestions: [] });
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    try {
      // The catalogue endpoint gives pagination and sorting; the search
      // endpoint supplies the category/brand shortcuts shown alongside.
      const [listRes, searchRes] = await Promise.all([
        productService.getProducts({ search: query, sort, page, limit: 12 }),
        searchService.search(query, 1).catch(() => null),
      ]);

      setProducts(listRes.data.data.products || []);
      setPagination(listRes.data.data.pagination || { page: 1, pages: 1, total: 0 });

      if (searchRes) {
        const d = searchRes.data.data;
        setRelated({
          categories: d.categories || [],
          brands: d.brands || [],
          suggestions: (d.suggestions || []).filter((s) => s.toLowerCase() !== query.toLowerCase()),
        });
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query, sort, page]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  if (!query.trim()) {
    return (
      <div className="container-custom section-padding">
        <Seo title="Search" noindex />
        <EmptyState
          icon="🔍"
          title="What are you looking for?"
          description="Search for food, treats, toys, grooming essentials and more."
          actionText="Browse the shop"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="container-custom shop-page-container">
      <Seo
        title={`Search: ${query}`}
        description={`Search results for "${query}" at AniLiving.`}
        noindex
        jsonLd={itemListSchema(products, `Search results for ${query}`)}
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="shop-header-card">
          <div className="shop-title-row">
            <h1 className="shop-heading">Results for &ldquo;{query}&rdquo;</h1>
            <span className="shop-count-badge">
              {loading ? 'Searching…' : `${pagination.total} product${pagination.total === 1 ? '' : 's'} found`}
            </span>
          </div>
        </div>

        {/* Related shortcuts */}
        {(related.categories.length > 0 || related.brands.length > 0 || related.suggestions.length > 0) && (
          <div className="search-related">
            {related.suggestions.slice(0, 4).map((term) => (
              <button key={term} type="button" onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}>
                {term}
              </button>
            ))}
            {related.categories.map((category) => (
              <Link key={category._id} to={`/shop?category=${category.slug}`}>in {category.name}</Link>
            ))}
            {related.brands.map((brand) => (
              <Link key={brand._id} to={`/shop?brand=${brand.slug}`}>{brand.name}</Link>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="shop-toolbar" style={{ marginBottom: '1.25rem' }}>
            <span className="shop-results-count">
              Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, pagination.total)} of {pagination.total}
            </span>
            <select
              className="shop-sort-select"
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="product-grid">
              {products.map((product) => <ProductCard key={product._id} product={product} />)}
            </div>

            {pagination.pages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page <= 1}
                  onClick={() => setParam('page', String(page - 1))}
                >←</button>
                <span className="pagination-info">Page {page} of {pagination.pages}</span>
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page >= pagination.pages}
                  onClick={() => setParam('page', String(page + 1))}
                >→</button>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            icon="🐾"
            title={`No results for "${query}"`}
            description="Try a different spelling, a broader term, or browse our categories."
            actionText="Browse all products"
            actionLink="/shop"
          />
        )}
      </motion.div>
    </div>
  );
};

export default SearchResultsPage;
