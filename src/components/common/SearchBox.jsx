import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineClock, HiX, HiTrendingUp } from 'react-icons/hi';
import { searchService } from '../../services/apiServices';
import { useDebounce, useClickOutside, useLocalStorage } from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';

const RECENT_KEY = 'aniliving_recent_searches';
const MAX_RECENT = 6;

/**
 * SearchBox — instant search with product previews, suggestions, recent
 * searches and popular terms.
 *
 * Requests are debounced so a fast typist triggers one call, not twelve, and
 * results are keyed to the query they were fetched for so a slow response can
 * never overwrite a newer one.
 */
const SearchBox = ({ placeholder = 'Search for food, toys, accessories…', autoFocus = false, onNavigate }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState({ popularSearches: [], topCategories: [] });
  const [highlighted, setHighlighted] = useState(-1);

  const [recent, setRecent] = useLocalStorage(RECENT_KEY, []);
  const debouncedQuery = useDebounce(query, 280);

  const close = useCallback(() => { setOpen(false); setHighlighted(-1); }, []);
  const containerRef = useClickOutside(close, open);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Popular terms are fetched once, lazily, the first time the panel opens
  useEffect(() => {
    if (!open || popular.popularSearches.length) return;
    searchService.getPopularSearches()
      .then(({ data }) => setPopular(data.data))
      .catch(() => {});
  }, [open, popular.popularSearches.length]);

  // Instant search
  useEffect(() => {
    const term = debouncedQuery.trim();
    if (term.length < 2) { setResults(null); setLoading(false); return undefined; }

    let alive = true;
    setLoading(true);
    searchService.search(term, 6)
      .then(({ data }) => {
        // Ignore a response that arrived after the query moved on
        if (alive && data.data.query === term) setResults(data.data);
      })
      .catch(() => { if (alive) setResults(null); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [debouncedQuery]);

  const rememberSearch = (term) => {
    const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
  };

  const goToSearch = (term) => {
    const value = (term ?? query).trim();
    if (!value) return;
    rememberSearch(value);
    close();
    setQuery(value);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const goToProduct = (product) => {
    rememberSearch(product.name);
    close();
    onNavigate?.();
    navigate(`/product/${product.slug}`);
  };

  // Keyboard navigation through the product previews
  const handleKeyDown = (event) => {
    const items = results?.products || [];
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setHighlighted((i) => Math.min(items.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => Math.max(-1, i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlighted >= 0 && items[highlighted]) goToProduct(items[highlighted]);
      else goToSearch();
    } else if (event.key === 'Escape') {
      close();
    }
  };

  const showSuggestionPanel = open && query.trim().length < 2;
  const showResultsPanel = open && query.trim().length >= 2;

  return (
    <div className="searchbox" ref={containerRef}>
      <div className="searchbox-field">
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-label="Search products"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button type="button" className="searchbox-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear search">
            <HiX />
          </button>
        )}
        <button type="button" className="navbar-search-btn" onClick={() => goToSearch()} aria-label="Search">
          <HiOutlineSearch />
        </button>
      </div>

      <AnimatePresence>
        {(showSuggestionPanel || showResultsPanel) && (
          <motion.div
            className="searchbox-panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {/* ── Idle state: recent + popular ─────────────────────── */}
            {showSuggestionPanel && (
              <>
                {recent.length > 0 && (
                  <section className="searchbox-section">
                    <header>
                      <h3><HiOutlineClock /> Recent searches</h3>
                      <button type="button" onClick={() => setRecent([])}>Clear</button>
                    </header>
                    <div className="searchbox-chips">
                      {recent.map((term) => (
                        <button key={term} type="button" className="searchbox-chip" onClick={() => goToSearch(term)}>
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {popular.popularSearches?.length > 0 && (
                  <section className="searchbox-section">
                    <header><h3><HiTrendingUp /> Popular right now</h3></header>
                    <div className="searchbox-chips">
                      {popular.popularSearches.map((term) => (
                        <button key={term} type="button" className="searchbox-chip" onClick={() => goToSearch(term)}>
                          {term}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {popular.topCategories?.length > 0 && (
                  <section className="searchbox-section">
                    <header><h3>Shop by category</h3></header>
                    <div className="searchbox-chips">
                      {popular.topCategories.map((category) => (
                        <button
                          key={category._id}
                          type="button"
                          className="searchbox-chip"
                          onClick={() => { close(); onNavigate?.(); navigate(`/shop?category=${category.slug}`); }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── Live results ─────────────────────────────────────── */}
            {showResultsPanel && (
              loading && !results ? (
                <div className="searchbox-loading">Searching…</div>
              ) : results && (results.products.length || results.categories.length || results.brands.length) ? (
                <>
                  {results.suggestions?.length > 0 && (
                    <section className="searchbox-section">
                      <div className="searchbox-chips">
                        {results.suggestions.map((term) => (
                          <button key={term} type="button" className="searchbox-chip" onClick={() => goToSearch(term)}>
                            <HiOutlineSearch /> {term}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {results.products.length > 0 && (
                    <section className="searchbox-section">
                      <header><h3>Products</h3></header>
                      <ul className="searchbox-results">
                        {results.products.map((product, index) => (
                          <li key={product._id}>
                            <button
                              type="button"
                              className={`searchbox-result ${index === highlighted ? 'is-highlighted' : ''}`}
                              onClick={() => goToProduct(product)}
                              onMouseEnter={() => setHighlighted(index)}
                            >
                              {product.thumbnail
                                ? <img src={product.thumbnail} alt="" loading="lazy" />
                                : <span className="searchbox-result-placeholder">🐾</span>}
                              <span className="searchbox-result-body">
                                <strong>{product.name}</strong>
                                {product.brand?.name && <em>{product.brand.name}</em>}
                              </span>
                              <span className="searchbox-result-price">{formatCurrency(product.price)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {(results.categories.length > 0 || results.brands.length > 0) && (
                    <section className="searchbox-section">
                      <div className="searchbox-chips">
                        {results.categories.map((category) => (
                          <button
                            key={category._id}
                            type="button"
                            className="searchbox-chip"
                            onClick={() => { close(); onNavigate?.(); navigate(`/shop?category=${category.slug}`); }}
                          >
                            in {category.name}
                          </button>
                        ))}
                        {results.brands.map((brand) => (
                          <button
                            key={brand._id}
                            type="button"
                            className="searchbox-chip"
                            onClick={() => { close(); onNavigate?.(); navigate(`/shop?brand=${brand.slug}`); }}
                          >
                            {brand.name}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <button type="button" className="searchbox-all" onClick={() => goToSearch()}>
                    See all results for &ldquo;{query.trim()}&rdquo;
                  </button>
                </>
              ) : (
                <div className="searchbox-empty">
                  <p>No matches for &ldquo;{query.trim()}&rdquo;</p>
                  <button type="button" onClick={() => goToSearch()}>Search the full catalogue anyway</button>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBox;
