import { useState, useEffect, useRef } from 'react';
import { fetchAutocomplete } from '../services/autocomplete.js';

export const useAutocomplete = (query, limit = 10, baseUrl) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!query?.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    setError(null);

    fetchAutocomplete(query, limit, baseUrl)
      .then((data) => !cancelled && setSuggestions(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [query, limit, baseUrl]);

  return { suggestions, loading, error };
};