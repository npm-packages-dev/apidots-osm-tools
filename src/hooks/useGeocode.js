import { useState, useEffect, useRef } from 'react';
import { geocode } from '../services/geocode.js';

export const useGeocode = (address, baseUrl) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!address?.trim()) {
      setResults([]);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    geocode(address, baseUrl)
      .then((data) => !cancelled && setResults(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [address, baseUrl]);

  return { results, loading, error };
};