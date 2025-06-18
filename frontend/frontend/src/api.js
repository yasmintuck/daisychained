// src/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function getWeather() {
  const response = await fetch(`${API_URL}/weatherforecast`);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  return await response.json();
}
