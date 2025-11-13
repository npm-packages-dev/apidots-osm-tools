// src/hooks/use,useRoute.js
import { useState, useEffect, useRef } from 'react';
import { fetchRoute } from '../services/routing.js';

export const useRoute = (start, end, serverUrl) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!start || !end) {
      setRoute(null);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    fetchRoute(start, end, serverUrl)
      .then((data) => !cancelled && setRoute(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [start, end, serverUrl]);

  return { route, loading, error };
};