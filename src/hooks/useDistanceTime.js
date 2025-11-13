import { useState, useEffect, useRef } from 'react';
import { calculateDistanceAndTime } from '../services/distanceTime.js';

export const useDistanceTime = (startLat, startLon, endLat, endLon, baseUrl) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!startLat || !endLat) {
      setResult(null);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    calculateDistanceAndTime(startLat, startLon, endLat, endLon, baseUrl)
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [startLat, startLon, endLat, endLon, baseUrl]);

  return { result, loading, error };
};