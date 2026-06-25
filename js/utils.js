import { FALLBACK_BACKDROP, FALLBACK_POSTER, TMDB_IMAGE_BASE, TMDB_IMAGE_SIZES } from "./config.js";

const STORAGE_KEYS = {
  favorites: "cineseeker-favorites",
  theme: "cineseeker-theme",
  recentlyViewed: "cineseeker-recently-viewed",
};

export function debounce(fn, delay = 300) {
  let timerId;
  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => fn(...args), delay);
  };
}

export function formatYear(dateValue) {
  if (!dateValue) return "Unknown";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "Unknown" : String(date.getFullYear());
}

export function formatReleaseDate(dateValue) {
  if (!dateValue) return "Unknown";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

export function formatRuntime(minutes) {
  if (!minutes && minutes !== 0) return "Unknown";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
}

export function formatCurrency(amount) {
  if (!amount && amount !== 0) return "Unknown";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatVote(value) {
  return Number(value || 0).toFixed(1);
}

export function truncateText(text, maxLength = 160) {
  if (!text) return "No overview available.";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function getPosterUrl(path, size = TMDB_IMAGE_SIZES.poster) {
  if (!path) return FALLBACK_POSTER;
  if (path.startsWith("./") || path.startsWith("/")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path, size = TMDB_IMAGE_SIZES.backdrop) {
  if (!path) return FALLBACK_BACKDROP;
  if (path.startsWith("./") || path.startsWith("/")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function setStoredValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredValue(key, fallbackValue) {
  const rawValue = localStorage.getItem(key);
  if (!rawValue) return fallbackValue;

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

export function getFavorites() {
  return getStoredValue(STORAGE_KEYS.favorites, []);
}

export function saveFavorites(favorites) {
  setStoredValue(STORAGE_KEYS.favorites, favorites);
}

export function isFavorite(movieId) {
  return getFavorites().some((movie) => Number(movie.id) === Number(movieId));
}

export function toggleFavorite(movie) {
  const favorites = getFavorites();
  const movieId = Number(movie.id);
  const existingIndex = favorites.findIndex((item) => Number(item.id) === movieId);

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.unshift({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path || null,
      backdrop_path: movie.backdrop_path || null,
      vote_average: movie.vote_average || 0,
      release_date: movie.release_date || "",
      genre_ids: movie.genre_ids || [],
      genres: movie.genres || [],
      overview: movie.overview || "",
    });
  }

  saveFavorites(favorites);
  return favorites;
}

export function removeFavorite(movieId) {
  const favorites = getFavorites().filter((movie) => Number(movie.id) !== Number(movieId));
  saveFavorites(favorites);
  return favorites;
}

export function clearFavorites() {
  saveFavorites([]);
}

export function getRecentlyViewed() {
  return getStoredValue(STORAGE_KEYS.recentlyViewed, []);
}

export function addRecentlyViewed(movie) {
  const items = getRecentlyViewed().filter((item) => Number(item.id) !== Number(movie.id));
  items.unshift({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    vote_average: movie.vote_average || 0,
    release_date: movie.release_date || "",
    genre_ids: movie.genre_ids || [],
  });
  setStoredValue(STORAGE_KEYS.recentlyViewed, items.slice(0, 12));
}

export function getThemePreference() {
  return localStorage.getItem(STORAGE_KEYS.theme) || "dark";
}

export function storeThemePreference(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

export function isMissingApiKey(apiKey) {
  return !apiKey || apiKey === "YOUR_TMDB_API_KEY";
}

export function buildSearchParams(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  return searchParams;
}

export function safeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

export function normalizeMovie(movie) {
  return {
    id: movie.id,
    title: movie.title || movie.name || "Untitled",
    overview: movie.overview || "",
    poster_path: movie.poster_path || null,
    backdrop_path: movie.backdrop_path || null,
    release_date: movie.release_date || movie.first_air_date || "",
    vote_average: safeNumber(movie.vote_average, 0),
    genre_ids: movie.genre_ids || [],
    genres: movie.genres || [],
    original_language: movie.original_language || "",
    status: movie.status || "",
    runtime: movie.runtime || 0,
    budget: movie.budget || 0,
    revenue: movie.revenue || 0,
    tagline: movie.tagline || "",
    production_companies: movie.production_companies || [],
  };
}

export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const fallbackInput = document.createElement("textarea");
  fallbackInput.value = text;
  fallbackInput.setAttribute("readonly", "true");
  fallbackInput.style.position = "absolute";
  fallbackInput.style.left = "-9999px";
  document.body.appendChild(fallbackInput);
  fallbackInput.select();
  document.execCommand("copy");
  document.body.removeChild(fallbackInput);
  return Promise.resolve();
}

export function getMovieLink(movieId) {
  return `${window.location.origin}${window.location.pathname.replace(/index\.html?$/, "") || ""}movie.html?id=${movieId}`;
}
