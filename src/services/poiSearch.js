import axios from 'axios';
import { ENDPOINTS } from '../config/endpoints.js';

export const searchPOI = async (lat, lon, query, radius = 1000, baseUrl = ENDPOINTS.OVERPASS) => {
  if (!lat || !lon || !query) throw new Error('Latitude, longitude, and query are required');

  const overpassQuery = `
    [out:json];
    node["name"~"${query}",i](around:${radius},${lat},${lon});
    out body;
  `;

  const { data } = await axios.post(
    baseUrl,
    `data=${encodeURIComponent(overpassQuery)}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  if (!data?.elements?.length) throw new Error('No POIs found');

  return data.elements.map((item) => ({
    id: item.id,
    lat: item.lat,
    lon: item.lon,
    name: item.tags?.name || 'Unnamed',
    type: item.tags?.amenity || item.tags?.shop || 'unknown',
  }));
};