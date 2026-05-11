import { useState, useEffect, useCallback } from 'react';
import { countriesApi } from '../services/api';

export function useCountryData(countryId) {
  const [country, setCountry] = useState(null);
  const [soldiers, setSoldiers] = useState([]);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryId) {
      setCountry(null);
      setSoldiers([]);
      setEvents([]);
      setPagination(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSoldiers([]);

    Promise.all([
      countriesApi.getById(countryId),
      countriesApi.getSoldiers(countryId),
      countriesApi.getEvents(countryId),
    ])
      .then(([countryRes, soldiersRes, eventsRes]) => {
        setCountry(countryRes.data);
        setSoldiers(soldiersRes.data);
        setPagination(soldiersRes.pagination);
        setEvents(eventsRes.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [countryId]);

  const loadMoreSoldiers = useCallback(async () => {
    if (!pagination?.has_more || loading) return;
    try {
      const res = await countriesApi.getSoldiers(countryId, {
        after: pagination.next_cursor,
      });
      setSoldiers(prev => [...prev, ...res.data]);
      setPagination(res.pagination);
    } catch (err) {
      setError(err);
    }
  }, [countryId, pagination, loading]);

  return {
    country,
    soldiers,
    events,
    hasMoreSoldiers: pagination?.has_more ?? false,
    loadMoreSoldiers,
    loading,
    error,
  };
}
