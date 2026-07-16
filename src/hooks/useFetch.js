import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data-fetching hook with loading/error state
 * @param {Function} fetchFn - API call function that returns { data }
 * @param {Array} deps - Dependency array for re-fetching
 * @param {boolean} immediate - Whether to fetch immediately on mount
 */
export function useFetch(fetchFn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn(...args);
      setData(response.data?.data || response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedFetch(fetchFn) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn(params);
      const result = response.data?.data || response.data;
      setData(result.products || result.orders || result.reviews || result.users || result.categories || result.brands || []);
      if (result.pagination) setPagination(result.pagination);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  return { data, pagination, loading, error, fetch, setData };
}
