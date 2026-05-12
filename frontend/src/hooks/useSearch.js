import { useState, useCallback } from 'react';
import { searchApi } from '../services/api';

export function useSearch() {
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(null); // type string while loading more
  const [error, setError]         = useState(false);

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setError(false);
    setResults(null);
    try {
      const data = await searchApi.search({ q: q.trim() });
      setResults(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (type, q) => {
    if (!results?.[type]) return;
    const { data, pagination } = results[type];
    if (!pagination.has_more) return;

    setLoadingMore(type);
    try {
      const next = await searchApi.search({
        q: q.trim(),
        type,
        limit: pagination.limit,
        offset: pagination.offset + pagination.limit,
      });
      const group = next[type];
      if (!group) return;
      setResults(prev => ({
        ...prev,
        [type]: {
          data: [...data, ...group.data],
          pagination: group.pagination,
        },
      }));
    } catch {
      // silently ignore load-more errors
    } finally {
      setLoadingMore(null);
    }
  }, [results]);

  return { results, loading, loadingMore, error, search, loadMore };
}
