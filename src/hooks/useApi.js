import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading/error/refetch.
 * @param {Function} fetchFn - Async function that returns an Axios response
 * @param {Array} deps - Dependency array (refetch when deps change)
 * @param {Object} options - { immediate: boolean }
 */
const useApi = (fetchFn, deps = [], options = {}) => {
  const { immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn(...args);
      const result = response.data?.data || response.data;
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
};

export default useApi;
