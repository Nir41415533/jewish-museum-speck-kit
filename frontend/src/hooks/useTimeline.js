import { useState, useEffect } from 'react';
import { eventsApi } from '../services/api';

export function useTimeline() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    eventsApi.list({ sort: 'date_asc', limit: 50 })
      .then(res => setEvents(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}
