import { APP_NAME, SAMPLE_MOVIES, TMDB_API_KEY, TMDB_BASE_URL } from "./config.js";
import { buildSearchParams, isMissingApiKey, normalizeMovie } from "./utils.js";

const CACHE_PREFIX = "cineseeker-api-";
const CACHE_TTL = 1000 * 60 * 60 * 6;

function getCacheKey(path, params) {
  return `${CACHE_PREFIX}${path}?${buildSearchParams(params).toString()}`;
}

function readCache(cacheKey) {
  const rawValue = sessionStorage.getItem(cacheKey);
  if (!rawValue) return null;

  try {
    const payload = JSON.parse(rawValue);
    if (Date.now() - payload.savedAt > CACHE_TTL) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return payload.data;
  } catch {
    sessionStorage.removeItem(cacheKey);
    return null;
  }
}

function writeCache(cacheKey, data) {
  sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data }));
}

function fallbackMovies() {
  return SAMPLE_MOVIES.map((movie) => normalizeMovie(movie));
}

function fallbackDetails(movieId) {
  const sampleMovie = fallbackMovies().find((movie) => Number(movie.id) === Number(movieId)) || fallbackMovies()[0];
  return {
    ...sampleMovie,
    runtime: 124,
    status: "Released",
    budget: 85000000,
    revenue: 242000000,
    tagline: "A cinematic fallback powered by CineSeeker sample data.",
    production_companies: [{ name: "CineSeeker Studios" }],
    genres: [
      { id: 28, name: "Action" },
      { id: 12, name: "Adventure" },
    ],
  };
}

async function fetchJson(path, params = {}, fallbackValue = null) {
  if (isMissingApiKey(TMDB_API_KEY)) {
    return typeof fallbackValue === "function" ? fallbackValue() : fallbackValue;
  }

  const cacheKey = getCacheKey(path, params);
  const cachedValue = readCache(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}`);
  }

  const data = await response.json();
  writeCache(cacheKey, data);
  return data;
}

function limitMovies(results = [], limit = 20) {
  return results.slice(0, limit).map((movie) => normalizeMovie(movie));
}

export async function getTrendingMovies(limit = 20) {
  try {
    const data = await fetchJson("/trending/movie/day", {}, { results: fallbackMovies() });
    return limitMovies(data.results, limit);
  } catch {
    return fallbackMovies().slice(0, limit);
  }
}

export async function getPopularMovies(limit = 20) {
  try {
    const data = await fetchJson("/movie/popular", {}, { results: fallbackMovies() });
    return limitMovies(data.results, limit);
  } catch {
    return fallbackMovies().slice(0, limit);
  }
}

export async function getTopRatedMovies(limit = 20) {
  try {
    const data = await fetchJson("/movie/top_rated", {}, { results: fallbackMovies() });
    return limitMovies(data.results, limit);
  } catch {
    return fallbackMovies().slice(0, limit);
  }
}

export async function getUpcomingMovies(limit = 20) {
  try {
    const data = await fetchJson("/movie/upcoming", {}, { results: fallbackMovies() });
    return limitMovies(data.results, limit);
  } catch {
    return fallbackMovies().slice(0, limit);
  }
}

export async function discoverMovies({ genre = "", sortBy = "popularity.desc", page = 1 } = {}) {
  try {
    const params = {
      sort_by: sortBy,
      page,
      "vote_count.gte": 10,
    };

    if (genre) {
      params.with_genres = genre;
    }

    const data = await fetchJson("/discover/movie", params, { results: fallbackMovies(), total_pages: 1 });
    return {
      results: limitMovies(data.results, 20),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || data.results?.length || 0,
    };
  } catch {
    const results = fallbackMovies();
    return {
      results,
      page: 1,
      totalPages: 1,
      totalResults: results.length,
    };
  }
}

export async function searchMovies(query, page = 1) {
  const cleanedQuery = query.trim();
  if (!cleanedQuery) {
    return {
      results: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
    };
  }

  try {
    const data = await fetchJson("/search/movie", { query: cleanedQuery, page, include_adult: false }, { results: fallbackMovies() });
    return {
      results: limitMovies(data.results, 20),
      page: data.page || 1,
      totalPages: Math.min(data.total_pages || 1, 500),
      totalResults: data.total_results || data.results?.length || 0,
    };
  } catch {
    const fallback = fallbackMovies().filter((movie) => movie.title.toLowerCase().includes(cleanedQuery.toLowerCase()));
    return {
      results: fallback,
      page: 1,
      totalPages: 1,
      totalResults: fallback.length,
    };
  }
}

export async function getMovieDetails(movieId) {
  try {
    const data = await fetchJson(`/movie/${movieId}`, { append_to_response: "videos,credits,recommendations" }, () => fallbackDetails(movieId));
    return normalizeMovie(data);
  } catch {
    return fallbackDetails(movieId);
  }
}

export async function getMovieCredits(movieId) {
  try {
    const data = await fetchJson(`/movie/${movieId}/credits`, {}, { cast: [] });
    return data;
  } catch {
    return {
      cast: [],
      crew: [],
    };
  }
}

export async function getMovieVideos(movieId) {
  try {
    const data = await fetchJson(`/movie/${movieId}/videos`, {}, { results: [] });
    return data.results || [];
  } catch {
    return [];
  }
}

export async function getMovieRecommendations(movieId) {
  try {
    const data = await fetchJson(`/movie/${movieId}/recommendations`, {}, { results: fallbackMovies() });
    return limitMovies(data.results, 12);
  } catch {
    return fallbackMovies().slice(0, 12);
  }
}

export function getOfficialTrailer(videos = []) {
  return videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) || videos.find((video) => video.site === "YouTube" && video.type === "Trailer") || null;
}

export function getAppSourceLabel() {
  return isMissingApiKey(TMDB_API_KEY) ? `${APP_NAME} demo mode` : `${APP_NAME} live TMDB data`;
}
