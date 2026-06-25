export const APP_NAME = "CineSeeker";
export const APP_TAGLINE = "Discover films, build a watchlist, and explore what to watch next.";

export const TMDB_API_KEY = "YOUR_TMDB_API_KEY";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
export const TMDB_IMAGE_SIZES = {
  poster: "w500",
  backdrop: "w1280",
  cast: "w185",
  thumb: "w342",
};

export const FALLBACK_POSTER = "./assets/images/poster-fallback.svg";
export const FALLBACK_BACKDROP = "./assets/images/poster-fallback.svg";

export const GENRE_FILTERS = [
  { id: "", label: "All Genres" },
  { id: 28, label: "Action" },
  { id: 35, label: "Comedy" },
  { id: 18, label: "Drama" },
  { id: 878, label: "Sci-Fi" },
  { id: 10749, label: "Romance" },
  { id: 14, label: "Fantasy" },
  { id: 16, label: "Animation" },
  { id: 80, label: "Crime" },
  { id: 12, label: "Adventure" },
  { id: 53, label: "Thriller" },
  { id: 27, label: "Horror" },
  { id: 10751, label: "Family" },
  { id: 99, label: "Documentary" },
];

export const SORT_OPTIONS = [
  { id: "popularity.desc", label: "Trending" },
  { id: "primary_release_date.desc", label: "Newest" },
  { id: "primary_release_date.asc", label: "Oldest" },
  { id: "vote_average.desc", label: "Highest Rated" },
  { id: "vote_average.asc", label: "Lowest Rated" },
  { id: "original_title.asc", label: "Alphabetical" },
];

export const SAMPLE_MOVIES = [
  {
    id: 101,
    title: "Starlight Run",
    release_date: "2025-05-18",
    poster_path: "./assets/images/sample-poster-1.svg",
    backdrop_path: "./assets/images/sample-poster-1.svg",
    vote_average: 8.7,
    genre_ids: [28, 12],
    overview: "An elite courier crosses a collapsing megacity to deliver a data core that can stop a citywide blackout.",
  },
  {
    id: 102,
    title: "Echoes of Tomorrow",
    release_date: "2024-11-02",
    poster_path: "./assets/images/sample-poster-2.svg",
    backdrop_path: "./assets/images/sample-poster-2.svg",
    vote_average: 8.2,
    genre_ids: [878, 18],
    overview: "A scientist discovers her future self has been leaving warnings hidden inside old broadcast recordings.",
  },
  {
    id: 103,
    title: "Neon Harbor",
    release_date: "2025-01-12",
    poster_path: "./assets/images/sample-poster-3.svg",
    backdrop_path: "./assets/images/sample-poster-3.svg",
    vote_average: 7.9,
    genre_ids: [80, 53],
    overview: "A detective tracks a smuggling ring through the luminous docks of a rain-soaked port city.",
  },
  {
    id: 104,
    title: "Golden Hour",
    release_date: "2024-08-24",
    poster_path: "./assets/images/sample-poster-4.svg",
    backdrop_path: "./assets/images/sample-poster-4.svg",
    vote_average: 8.0,
    genre_ids: [18, 10749],
    overview: "Two former friends reconnect while restoring a cinema that once defined their hometown.",
  },
  {
    id: 105,
    title: "Fable Engine",
    release_date: "2025-03-09",
    poster_path: "./assets/images/sample-poster-5.svg",
    backdrop_path: "./assets/images/sample-poster-5.svg",
    vote_average: 8.4,
    genre_ids: [14, 12],
    overview: "A reluctant archivist enters a mythic realm where stories become living machines.",
  },
  {
    id: 106,
    title: "Laugh Track",
    release_date: "2024-05-10",
    poster_path: "./assets/images/sample-poster-6.svg",
    backdrop_path: "./assets/images/sample-poster-6.svg",
    vote_average: 7.4,
    genre_ids: [35],
    overview: "A failing stand-up comic invents a fake tour and accidentally becomes a viral sensation.",
  },
];
