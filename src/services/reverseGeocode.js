import axios from 'axios';
import { ENDPOINTS, NOMINATIM_DELAY_MS } from '../config/endpoints.js';
import { delay } from '../utils/delay.js';

export const reverseGeocode = async (lat, lon, baseUrl = ENDPOINTS.NOMINATIM) => {
  if (!lat || !lon) throw new Error('Latitude and longitude are required');

  const url = `${baseUrl}/reverse?format=json&lat=${lat}&lon=${lon}`;
  await delay(NOMINATIM_DELAY_MS);

  const { data } = await axios.get(url);
  if (!data?.display_name) throw new Error('No address found');

  return data.display_name;
};