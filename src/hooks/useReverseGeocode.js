import { useState, useEffect, useRef } from 'react';
import { reverseGeocode } from '../services/reverseGeocode.js';

export const useReverseGeocode = (lat, lon, baseUrl) => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!lat || !lon) {
      setAddress(null);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    reverseGeocode(lat, lon, baseUrl)
      .then((addr) => !cancelled && setAddress(addr))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [lat, lon, baseUrl]);

  return { address, loading, error };
};