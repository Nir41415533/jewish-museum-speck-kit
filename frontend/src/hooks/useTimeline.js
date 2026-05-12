import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../services/api';

export function useTimeline() {
  const [years, setYears]           = useState([]);   // [{year, count}]
  const [eventsByYear, setByYear]   = useState({});   // {1939: [...events]}
  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingYear, setLoadingYear]   = useState(null); // year currently being fetched
  const [error, setError]           = useState(false);

  useEffect(() => {
    eventsApi.listYears()
      .then(res => setYears(res.data))
      .catch(() => setError(true))
      .finally(() => setLoadingYears(false));
  }, []);

  const loadYear = useCallback((year) => {
    if (eventsByYear[year]) return; // already loaded
    setLoadingYear(year);
    eventsApi.listByYear(year)
      .then(res => setByYear(prev => ({ ...prev, [year]: res.data })))
      .catch(() => setError(true))
      .finally(() => setLoadingYear(null));
  }, [eventsByYear]);

  return { years, eventsByYear, loadingYears, loadingYear, error, loadYear };
}
