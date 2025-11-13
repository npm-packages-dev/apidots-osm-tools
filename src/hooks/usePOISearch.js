import { useState, useEffect, useRef } from 'react';
import { searchPOI } from '../services/poiSearch.js';

export const usePOISearch = (lat, lon, query, radius = 1000, baseUrl) => {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!lat || !lon || !query) {
      setPois([]);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    searchPOI(lat, lon, query, radius, baseUrl)
      .then((data) => !cancelled && setPois(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [lat, lon, query, radius, baseUrl]);

  return { pois, loading, error };
};