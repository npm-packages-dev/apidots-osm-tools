// src/index.js – @apidots-osmtools – Production-ready single file
// All exports are unique, no duplicate exports, clean structure

import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG & ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────
export const OSM_ENDPOINTS = {
  NOMINATIM: 'https://nominatim.openstreetmap.org',
  OVERPASS: 'https://overpass-api.de/api/interpreter',
  ROUTING: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
};

const NOMINATIM_DEBOUNCE_MS = 1100;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// ─────────────────────────────────────────────────────────────────────────────
// CORE SERVICES
// ─────────────────────────────────────────────────────────────────────────────

// 1. Autocomplete Search (Place suggestions)
export const searchPlaces = async (query, limit = 10, baseUrl = OSM_ENDPOINTS.NOMINATIM) => {
  if (!query?.trim()) throw new Error('Search query is required');
  await delay(NOMINATIM_DEBOUNCE_MS);
  const url = `${baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}&addressdetails=1`;
  const { data } = await axios.get(url);
  return data.map((item) => ({
    label: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    placeId: item.place_id,
    type: item.type,
    importance: item.importance,
  }));
};

// 2. Geocode Address to Coordinates
export const geocodeAddress = async (address, baseUrl = OSM_ENDPOINTS.NOMINATIM) => {
  if (!address?.trim()) throw new Error('Address is required');
  await delay(NOMINATIM_DEBOUNCE_MS);
  const url = `${baseUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const { data } = await axios.get(url);
  if (!data.length) throw new Error('No geocoding results found');
  const item = data[0];
  return {
    label: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    boundingBox: item.boundingbox?.map(parseFloat),
  };
};

// 3. Reverse Geocode Coordinates to Address
export const reverseGeocodeCoords = async (lat, lon, baseUrl = OSM_ENDPOINTS.NOMINATIM) => {
  if (lat == null || lon == null) throw new Error('Latitude and longitude are required');
  await delay(NOMINATIM_DEBOUNCE_MS);
  const url = `${baseUrl}/reverse?format=json&lat=${lat}&lon=${lon}`;
  const { data } = await axios.get(url);
  if (data.error) throw new Error(data.error);
  return {
    label: data.display_name,
    address: data.address,
    placeId: data.place_id,
  };
};

// 4. Search Nearby POIs by Type
export const findNearbyPOIs = async (
  lat,
  lon,
  type = 'amenity',
  radius = 1000,
  baseUrl = OSM_ENDPOINTS.OVERPASS
) => {
  if (lat == null || lon == null) throw new Error('Coordinates are required');
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["${type}"](around:${radius},${lat},${lon});
      way["${type}"](around:${radius},${lat},${lon});
      relation["${type}"](around:${radius},${lat},${lon});
    );
    out center;
  `;
  const url = `${baseUrl}?data=${encodeURIComponent(overpassQuery)}`;
  const { data } = await axios.get(url);
  return data.elements.map((el) => {
    const center = el.center || { lat: el.lat, lon: el.lon };
    return {
      id: el.id,
      type: el.type,
      tags: el.tags || {},
      latitude: center.lat,
      longitude: center.lon,
      name: el.tags?.name || el.tags?.operator || 'Unnamed POI',
    };
  });
};

// 5. Calculate Distance & Estimated Driving Time (Haversine)
export const getDistanceAndTime = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const avgSpeedKmh = 50; // Urban average
  const durationMinutes = (distance / avgSpeedKmh) * 60;

  return {
    distance: parseFloat(distance.toFixed(2)),
    duration: Math.round(durationMinutes),
    unit: 'km',
  };
};

// 6. Fetch Driving Route (GeoJSON)
export const getDrivingRoute = async (startLonLat, endLonLat, serverUrl = OSM_ENDPOINTS.ROUTING) => {
  if (!startLonLat || !endLonLat) throw new Error('Start and end must be "lon,lat" strings');
  const url = `${serverUrl}/${startLonLat};${endLonLat}?overview=full&geometries=geojson&steps=true`;
  const { data } = await axios.get(url);
  if (!data.routes?.length) throw new Error('No route found');
  const route = data.routes[0];
  return {
    distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
    durationMin: Math.round(route.duration / 60),
    geometry: route.geometry,
    legs: route.legs,
    steps: route.legs[0]?.steps || [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// REACT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

// 1. usePlaceSearch (Autocomplete)
export const usePlaceSearch = (query, limit = 10, baseUrl) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(() => {});

  useEffect(() => {
    if (!query?.trim()) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => { cancelled = true; };

    setLoading(true);
    setError(null);

    searchPlaces(query, limit, baseUrl)
      .then((data) => !cancelled && setSuggestions(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
      cancelRef.current();
    };
  }, [query, limit, baseUrl]);

  return { suggestions, loading, error, cancel: cancelRef.current };
};

// 2. useAddressGeocode
export const useAddressGeocode = (address, baseUrl) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address?.trim()) {
      setResult(null);
      return;
    }

    setLoading(true);
    geocodeAddress(address, baseUrl)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address, baseUrl]);

  return { result, loading, error };
};

// 3. useCoordsReverseGeocode
export const useCoordsReverseGeocode = (lat, lon, baseUrl) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) {
      setResult(null);
      return;
    }

    setLoading(true);
    reverseGeocodeCoords(lat, lon, baseUrl)
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lat, lon, baseUrl]);

  return { result, loading, error };
};

// 4. useNearbyPOIs
export const useNearbyPOIs = (lat, lon, type = 'amenity', radius = 1000, baseUrl) => {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) {
      setPois([]);
      return;
    }

    setLoading(true);
    findNearbyPOIs(lat, lon, type, radius, baseUrl)
      .then(setPois)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [lat, lon, type, radius, baseUrl]);

  return { pois, loading, error };
};

// 5. useDistanceCalculator
export const useDistanceCalculator = (lat1, lon1, lat2, lon2) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if ([lat1, lon1, lat2, lon2].some(v => v == null)) {
      setResult(null);
      return;
    }
    setResult(getDistanceAndTime(lat1, lon1, lat2, lon2));
  }, [lat1, lon1, lat2, lon2]);

  return result;
};

// 6. useDrivingRoute
export const useDrivingRoute = (startLonLat, endLonLat, serverUrl) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!startLonLat || !endLonLat) {
      setRoute(null);
      return;
    }

    setLoading(true);
    setError(null);

    getDrivingRoute(startLonLat, endLonLat, serverUrl)
      .then(setRoute)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [startLonLat, endLonLat, serverUrl]);

  return { route, loading, error };
};