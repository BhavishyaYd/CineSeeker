import { createSectionTitle, renderEmptyState, renderMovieGrid, renderRecentlyViewedStrip, renderToast } from "./components.js";
import { getFavorites, clearFavorites as clearStoredFavorites, removeFavorite } from "./utils.js";
import { initializeTheme, updateThemeButton } from "./theme.js";

function getHeaderMarkup() {
  return `
    <div class="site-header__inner">
      <a class="brand" href="index.html" aria-label="CineSeeker home">
        <span class="brand__mark">MV</span>
        <span class="brand__name"><span>CineSeeker</span><small>Movie Discovery</small></span>
      </a>
      <div class="nav-shell">
        <button class="nav-toggle" type="button" aria-controls="site-navigation" aria-expanded="false" data-nav-toggle>☰</button>
        <nav class="nav-links" id="site-navigation" aria-label="Primary navigation">
          <a class="nav-link" href="index.html">Home</a>
          <a class="nav-link" href="favorites.html">Favorites</a>
          <a class="nav-link" href="about.html">About</a>
          <a class="nav-link" href="index.html#discover">Search</a>
        </nav>
        <div class="nav-actions">
          <button class="button button--secondary" type="button" data-theme-toggle aria-pressed="false">Dark Mode</button>
          <a class="button button--secondary" href="index.html">Home</a>
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
}

function bindScrollTopButton() {
  const button = document.querySelector("[data-scroll-top]");
  if (!button) return;

  window.addEventListener("scroll", () => button.classList.toggle("is-visible", window.scrollY > 400), { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function renderFavorites() {
  const favorites = getFavorites();
  const favoritesGrid = document.querySelector("#favorites-grid");
  const status = document.querySelector("#favorites-status");
  const recentlyViewed = document.querySelector("#recently-viewed");

  if (favoritesGrid) {
    favoritesGrid.innerHTML = favorites.length
      ? renderMovieGrid(favorites)
      : renderEmptyState("No favorites yet. Save movies from any card or details page.", "index.html", "Browse movies");
  }

  if (status) {
    status.innerHTML = favorites.length ? `<p class="muted-text">${favorites.length} saved movie${favorites.length > 1 ? "s" : ""} in your collection.</p>` : "";
  }

  if (recentlyViewed) {
    recentlyViewed.innerHTML = renderRecentlyViewedStrip(JSON.parse(localStorage.getItem("cineseeker-recently-viewed") || "[]")) || renderEmptyState("Watch a few movies to populate recently viewed.", "index.html", "Discover now");
  }

  document.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFavorite(button.dataset.movieId);
      renderFavorites();
      window.dispatchEvent(new CustomEvent("cineseeker:favorites-changed"));
      renderToast("Removed from favorites", "info");
    });
  });
}

function bindFavoriteActions() {
  document.querySelector("[data-clear-favorites]")?.addEventListener("click", () => {
    clearStoredFavorites();
    renderFavorites();
    window.dispatchEvent(new CustomEvent("cineseeker:favorites-changed"));
    renderToast("Favorites cleared", "info");
  });
}

function initFavoritesPage() {
  injectHeader();
  initializeTheme();
  bindScrollTopButton();
  bindFavoriteActions();
  renderFavorites();
  document.querySelectorAll("[data-theme-toggle]").forEach(updateThemeButton);
}

initFavoritesPage();
