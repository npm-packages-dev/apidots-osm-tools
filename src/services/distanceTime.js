import axios from 'axios';
import { ENDPOINTS } from '../config/endpoints.js';

export const calculateDistanceAndTime = async (startLat, startLon, endLat, endLon, baseUrl = ENDPOINTS.ROUTING) => {
  if (!startLat || !startLon || !endLat || !endLon) {
    throw new Error('Start and end coordinates are required');
  }

  const url = `${baseUrl}/${startLon},${startLat};${endLon},${endLat}?overview=false`;
  const { data } = await axios.get(url);

  if (!data?.routes?.length) throw new Error('Unable to calculate distance and time');

  const { distance, duration } = data.routes[0];
  return {
    distance: Number((distance / 1000).toFixed(2)), // km
    duration: Number((duration / 60).toFixed(1)),   // minutes
  };
};