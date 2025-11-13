import axios from 'axios';
import { ENDPOINTS, NOMINATIM_DELAY_MS } from '../config/endpoints.js';
import { delay } from '../utils/delay.js';

export const fetchAutocomplete = async (query, limit = 10, baseUrl = ENDPOINTS.NOMINATIM) => {
  if (!query?.trim()) throw new Error('Query parameter "q" is required');

  const url = `${baseUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`;
  await delay(NOMINATIM_DELAY_MS);

  const { data } = await axios.get(url);
  return data.map((item) => ({
    display_name: item.display_name,
    lat: item.lat,
    lon: item.lon,
    place_id: item.place_id,
    addresstype: item.addresstype,
    type: item.type,
  }));
};