import axios from 'axios';
import { ENDPOINTS, NOMINATIM_DELAY_MS } from '../config/endpoints.js';
import { delay } from '../utils/delay.js';

export const geocode = async (address, baseUrl = ENDPOINTS.NOMINATIM) => {
  if (!address?.trim()) throw new Error('Address is required');

  const url = `${baseUrl}/search?format=json&q=${encodeURIComponent(address)}`;
  await delay(NOMINATIM_DELAY_MS);

  const { data } = await axios.get(url);
  if (!data.length) throw new Error('No results found');

  return data.map((item) => ({
    display_name: item.display_name,
    lat: item.lat,
    lon: item.lon,
  }));
};