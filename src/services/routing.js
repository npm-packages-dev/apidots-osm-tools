import axios from 'axios';
import { ENDPOINTS } from '../config/endpoints.js';

export const fetchRoute = async (start, end, serverUrl) => {
  if (!start || !end) {
    throw new Error("Start and end coordinates required as 'lon,lat'");
  }

  const url = serverUrl
    ? `${serverUrl}?start=${start}&end=${end}`
    : `${ENDPOINTS.ROUTING}/${start};${end}?overview=full&geometries=geojson`;

  const { data } = await axios.get(url, {
    headers: { Accept: 'application/json' },
  });

  if (!data?.routes?.length) throw new Error('No route found');
  return data.routes[0];
};