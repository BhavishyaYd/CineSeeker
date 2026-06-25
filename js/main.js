import { APP_NAME, GENRE_FILTERS, SORT_OPTIONS } from "./config.js";
import { getAppSourceLabel, getPopularMovies, getTopRatedMovies, getTrendingMovies, getUpcomingMovies, searchMovies } from "./api.js";
import { createHeroMarkup, createSectionTitle, renderEmptyState, renderLoader, renderMovieGrid, renderRecentlyViewedStrip, renderSkeletonCards, renderToast } from "./components.js";
import { addRecentlyViewed, clearFavorites, copyToClipboard, getRecentlyViewed, getThemePreference, getMovieLink, removeFavorite, saveFavorites, toggleFavorite } from "./utils.js";
import { initializeTheme, updateThemeButton } from "./theme.js";

const state = {
  activeFeed: "trending",
  currentPage: 1,
  searchQuery: "",
  genre: "",
  sortBy: "popularity.desc",
  feedMovies: [],
  searchResults: [],
  heroMovies: [],
};

function getHeaderMarkup() {
  return `
    <div class="site-header__inner">
      <a class="brand" href="index.html" aria-label="${APP_NAME} home">
        <span class="brand__mark">MV</span>
        <span class="brand__name"><span>${APP_NAME}</span><small>Movie Discovery</small></span>
      </a>
      <div class="nav-shell">
        <button class="nav-toggle" type="button" aria-controls="site-navigation" aria-expanded="false" data-nav-toggle>☰</button>
        <nav class="nav-links" id="site-navigation" aria-label="Primary navigation">
          <a class="nav-link" href="index.html">Home</a>
          <a class="nav-link" href="favorites.html">Favorites</a>
          <a class="nav-link" href="about.html">About</a>
          <a class="nav-link" href="#discover">Search</a>
        </nav>
        <div class="nav-actions">
          <button class="button button--secondary" type="button" data-theme-toggle aria-pressed="false">Dark Mode</button>
          <a class="button button--secondary" href="favorites.html">Favorites</a>
        </div>
      </div>
    </div>
  `;
}

function injectHeader() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  header.innerHTML = getHeaderMarkup();

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("#site-navigation");
  navToggle?.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks?.classList.toggle("is-open");
    document.body.classList.toggle("is-menu-open");
  });

  navLinks?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle?.setAttribute("aria-expanded", "false");
      navLinks.classList.remove("is-open");
      document.body.classList.remove("is-menu-open");
    });
  });
}

function bindScrollTopButton() {
  const button = document.querySelector("[data-scroll-top]");
  if (!button) return;

  const updateVisibility = () => {
    button.classList.toggle("is-visible", window.scrollY > 500);
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  updateVisibility();
}

function bindThemeButtons() {
  initializeTheme();
}

function renderHomeFilters() {
  const genreSelect = document.querySelector("[data-genre-filter]");
  const sortSelect = document.querySelector("[data-sort-filter]");
  const genreChipContainer = document.querySelector("[data-genre-chips]");

  if (genreSelect) {
    genreSelect.innerHTML = GENRE_FILTERS.map((genre) => `<option value="${genre.id}">${genre.label}</option>`).join("");
  }

  if (sortSelect) {
    sortSelect.innerHTML = SORT_OPTIONS.map((sortOption) => `<option value="${sortOption.id}">${sortOption.label}</option>`).join("");
  }

  if (genreChipContainer) {
    genreChipContainer.innerHTML = GENRE_FILTERS.filter((genre) => genre.id).map((genre) => `<button class="genre-chip" type="button" data-genre-chip="${genre.id}">${genre.label}</button>`).join("");
  }
}

async function loadHeroSection() {
  const heroSection = document.querySelector("#hero");
  if (!heroSection) return;

  heroSection.innerHTML = renderLoader("Loading hero movie...");
  const trendingMovies = await getTrendingMovies(10);
  state.heroMovies = trendingMovies;
  const featuredMovie = trendingMovies[0] || trendingMovies[1];
  heroSection.innerHTML = createHeroMarkup(featuredMovie);

  const randomButton = document.querySelector("[data-random-movie]");
  randomButton?.addEventListener("click", () => {
    const movie = state.heroMovies[Math.floor(Math.random() * state.heroMovies.length)];
    if (movie) {
      window.location.href = `movie.html?id=${movie.id}`;
    }
  });

  setInterval(() => {
    if (!state.heroMovies.length) return;
    const nextMovie = state.heroMovies[Math.floor(Math.random() * state.heroMovies.length)];
    heroSection.innerHTML = createHeroMarkup(nextMovie);
  }, 7000);
}

function updateHomeTabs() {
  document.querySelectorAll("[data-home-feed]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.homeFeed === state.activeFeed);
  });
}

function setFeedStatus(messageMarkup) {
  const status = document.querySelector("#home-feed-status");
  if (status) {
    status.innerHTML = messageMarkup;
  }
}

function setFeedPagination(page = 1, totalPages = 1) {
  const pagination = document.querySelector("#home-feed-pagination");
  if (!pagination) return;

  pagination.innerHTML = `
    <button class="button button--secondary" type="button" data-feed-prev ${page <= 1 ? "disabled" : ""}>Previous</button>
    <span class="muted-text">Page ${page} of ${totalPages}</span>
    <button class="button button--secondary" type="button" data-feed-next ${page >= totalPages ? "disabled" : ""}>Next</button>
  `;

  pagination.querySelector("[data-feed-prev]")?.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage -= 1;
      loadFeed();
    }
  });

  pagination.querySelector("[data-feed-next]")?.addEventListener("click", () => {
    if (state.currentPage < totalPages) {
      state.currentPage += 1;
      loadFeed();
    }
  });
}

async function loadFeed() {
  const feed = document.querySelector("#home-feed");
  if (!feed) return;

  feed.innerHTML = renderSkeletonCards(8);
  setFeedStatus(renderLoader(`Loading ${state.activeFeed.replace("_", " ")} movies...`));

  const loaders = {
    trending: getTrendingMovies,
    popular: getPopularMovies,
    top_rated: getTopRatedMovies,
    upcoming: getUpcomingMovies,
  };

  const movies = state.searchQuery.trim()
    ? (await searchMovies(state.searchQuery, state.currentPage)).results
    : await loaders[state.activeFeed](20);

  state.feedMovies = movies;
  feed.innerHTML = movies.length ? renderMovieGrid(movies) : renderEmptyState("No movies matched your current filters.", "#discover", "Adjust filters");
  setFeedStatus(movies.length ? `<p class="muted-text">Showing ${movies.length} titles from ${getAppSourceLabel()}.</p>` : "");
  setFeedPagination(1, 1);
  bindFavoriteButtons();
}

function bindFavoriteButtons() {
  document.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const movieId = Number(button.dataset.movieId);
      const movie = state.feedMovies.find((item) => Number(item.id) === movieId) || state.heroMovies.find((item) => Number(item.id) === movieId);
      if (!movie) return;

      const favorites = toggleFavorite(movie);
      button.classList.toggle("is-active", favorites.some((item) => Number(item.id) === movieId));
      button.setAttribute("aria-pressed", String(favorites.some((item) => Number(item.id) === movieId)));
      button.setAttribute("aria-label", `${favorites.some((item) => Number(item.id) === movieId) ? "Remove from favorites" : "Add to favorites"} for ${movie.title}`);
      window.dispatchEvent(new CustomEvent("cineseeker:favorites-changed"));
      renderToast(favorites.some((item) => Number(item.id) === movieId) ? "Added to favorites" : "Removed from favorites", favorites.some((item) => Number(item.id) === movieId) ? "success" : "info");
    });
  });
}

function bindSearchControls() {
  const searchInput = document.querySelector("[data-search-input]");
  const clearButton = document.querySelector("[data-clear-search]");
  const genreSelect = document.querySelector("[data-genre-filter]");
  const sortSelect = document.querySelector("[data-sort-filter]");
  const genreChips = document.querySelectorAll("[data-genre-chip]");
  const homeTabs = document.querySelectorAll("[data-home-feed]");

  const runSearch = async () => {
    state.currentPage = 1;
    const feed = document.querySelector("#home-feed");
    if (!feed) return;

    if (state.searchQuery.trim()) {
      setFeedStatus(renderLoader(`Searching for "${state.searchQuery}"...`));
      const result = await searchMovies(state.searchQuery, 1);
      state.feedMovies = result.results;
      feed.innerHTML = result.results.length ? renderMovieGrid(result.results) : renderEmptyState(`No results found for "${state.searchQuery}".`, "#discover", "Clear search");
      setFeedPagination(result.page, result.totalPages || 1);
    } else {
      loadFeed();
    }

    bindFavoriteButtons();
  };

  searchInput?.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    clearButton.disabled = !state.searchQuery.trim();
    runSearch();
  });

  clearButton?.addEventListener("click", () => {
    state.searchQuery = "";
    if (searchInput) searchInput.value = "";
    clearButton.disabled = true;
    loadFeed();
  });

  genreSelect?.addEventListener("change", (event) => {
    state.genre = event.target.value;
    renderToast(`Genre filter set to ${event.target.selectedOptions[0].textContent}`, "info");
    loadDiscoverSection();
  });

  sortSelect?.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    renderToast(`Sorting by ${event.target.selectedOptions[0].textContent}`, "info");
    loadDiscoverSection();
  });

  genreChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      state.genre = chip.dataset.genreChip || "";
      genreSelect.value = state.genre;
      loadDiscoverSection();
    });
  });

  homeTabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFeed = button.dataset.homeFeed;
      state.searchQuery = "";
      if (searchInput) searchInput.value = "";
      clearButton.disabled = true;
      updateHomeTabs();
      loadFeed();
    });
  });

  document.querySelector("[data-copy-home-url]")?.addEventListener("click", async () => {
    await copyToClipboard(getMovieLink(state.heroMovies[0]?.id || 1));
    renderToast("Movie URL copied", "success");
  });

  document.querySelector("[data-share-home]")?.addEventListener("click", async () => {
    const link = getMovieLink(state.heroMovies[0]?.id || 1);
    if (navigator.share) {
      await navigator.share({ title: APP_NAME, text: "Check out CineSeeker", url: link });
      return;
    }
    await copyToClipboard(link);
    renderToast("Share link copied", "success");
  });
}

async function loadDiscoverSection() {
  const feed = document.querySelector("#home-feed");
  if (!feed || state.searchQuery.trim()) return;

  feed.innerHTML = renderSkeletonCards(8);
  const { discoverMovies } = await import("./api.js");
  const result = await discoverMovies({ genre: state.genre, sortBy: state.sortBy, page: state.currentPage });
  state.feedMovies = result.results;
  feed.innerHTML = result.results.length ? renderMovieGrid(result.results) : renderEmptyState("No movies matched your current filters.");
  setFeedStatus(result.results.length ? `<p class="muted-text">Filtered by selected genre and sorting options.</p>` : "");
  setFeedPagination(result.page, result.totalPages);
  bindFavoriteButtons();
}

function renderHomeExtras() {
  const movieDay = document.querySelector("#movie-of-the-day");
  const recentlyViewed = document.querySelector("#recently-viewed");
  if (movieDay) {
    const featuredMovie = state.heroMovies[0];
    movieDay.innerHTML = featuredMovie
      ? `${createSectionTitle("Movie of the Day", "A standout pick from today’s trending selection.")}<div class="movie-grid">${renderMovieGrid([featuredMovie], { actionLabel: "Open featured movie" })}</div>`
      : renderLoader();
  }

  if (recentlyViewed) {
    recentlyViewed.innerHTML = renderRecentlyViewedStrip(getRecentlyViewed()) || renderEmptyState("Start viewing movies to build your recent list.", "index.html", "Browse now");
  }
}

function setupSharedInteractions() {
  document.addEventListener("cineseeker:theme-changed", (event) => {
    document.querySelectorAll("[data-theme-toggle]").forEach(updateThemeButton);
    if (event.detail?.theme) {
      renderToast(`Theme switched to ${event.detail.theme} mode`, "info");
    }
  });

  window.addEventListener("cineseeker:favorites-changed", () => {
    renderHomeExtras();
  });
}

async function initHome() {
  injectHeader();
  bindThemeButtons();
  bindScrollTopButton();
  renderHomeFilters();
  setupSharedInteractions();
  await loadHeroSection();
  updateHomeTabs();
  bindSearchControls();
  await loadFeed();
  renderHomeExtras();
}

async function initAbout() {
  injectHeader();
  bindThemeButtons();
  bindScrollTopButton();
  setupSharedInteractions();
}

function boot() {
  const page = document.body.dataset.page;
  if (page === "home") {
    initHome();
  } else if (page === "about") {
    initAbout();
  }
}

boot();
