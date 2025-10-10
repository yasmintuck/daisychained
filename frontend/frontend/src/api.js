// src/api.js
const API_URL = import.meta.env.VITE_BACKEND_URL;

// export async function getWeather() {
//   const response = await fetch(`${API_URL}/weatherforecast`);
//   if (!response.ok) throw new Error('Failed to fetch weather data');
//   return await response.json();
// }

export async function getBlogPosts() {
  const r = await fetch(`${API_URL}/api/blog?publishedOnly=true`);
  if (!r.ok) throw new Error("Failed to load posts");
  return r.json();
}

export async function getBlogPost(slug) {
  const r = await fetch(`${API_URL}/api/blog/${slug}`);
  if (!r.ok) throw new Error("Not found");
  return r.json();
}
