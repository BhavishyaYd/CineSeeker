import { createSectionTitle, renderEmptyState, renderLoader, renderMovieGrid, renderToast } from "./components.js";
import { getMovieCredits, getMovieDetails, getMovieRecommendations, getMovieVideos, getOfficialTrailer } from "./api.js";
import { addRecentlyViewed, copyToClipboard, formatCurrency, formatReleaseDate, formatRuntime, formatVote, getMovieLink, getBackdropUrl, getPosterUrl, isFavorite, toggleFavorite } from "./utils.js";
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
  window.addEventListener("scroll", () => button.classList.toggle("is-visible", window.scrollY > 400), { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function createDetailMarkup(movie, credits, trailer) {
  const director = credits.crew?.find((person) => person.job === "Director");
  const companyNames = movie.production_companies?.map((company) => company.name).slice(0, 4).join(", ") || "Unknown";
  const genres = movie.genres?.length ? movie.genres.map((genre) => `<span class="genre-chip">${genre.name}</span>`).join("") : '<span class="genre-chip">Genre unavailable</span>';
  const castMarkup = (credits.cast || [])
    .slice(0, 8)
    .map((person) => `<article class="detail-chip"><strong>${person.name}</strong><br /><span class="muted-text">${person.character || "Cast"}</span></article>`)
    .join("");

  return `
    <div class="movie-details">
      <div class="movie-details__poster">
        <img src="${getPosterUrl(movie.poster_path)}" alt="${movie.title} poster" loading="lazy" />
      </div>
      <div class="movie-details__panel">
        <div class="movie-details__backdrop">
          <img src="${getBackdropUrl(movie.backdrop_path || movie.poster_path)}" alt="${movie.title} backdrop" loading="lazy" />
        </div>
        <div class="inline-actions">
          <span class="badge">★ ${formatVote(movie.vote_average)}</span>
          <span class="badge">${formatReleaseDate(movie.release_date)}</span>
          <span class="badge">${formatRuntime(movie.runtime)}</span>
          <button class="button button--secondary" type="button" data-favorite-movie>
            ${isFavorite(movie.id) ? "Remove Favorite" : "Add Favorite"}
          </button>
          <button class="button button--ghost" type="button" data-copy-link>Copy Movie URL</button>
        </div>
        <div>
          <div class="genre-filter-row">${genres}</div>
          <p class="muted-text">${movie.overview || "No overview available."}</p>
        </div>
        <div class="detail-grid">
          <div class="detail-chip"><strong>Director</strong><br />${director?.name || "Not available"}</div>
          <div class="detail-chip"><strong>Language</strong><br />${movie.original_language || "Unknown"}</div>
          <div class="detail-chip"><strong>Status</strong><br />${movie.status || "Unknown"}</div>
          <div class="detail-chip"><strong>Budget</strong><br />${formatCurrency(movie.budget)}</div>
          <div class="detail-chip"><strong>Revenue</strong><br />${formatCurrency(movie.revenue)}</div>
          <div class="detail-chip"><strong>Companies</strong><br />${companyNames}</div>
        </div>
        <div>
          <h3>Cast</h3>
          <div class="movie-grid">${castMarkup || renderEmptyState("Cast information is unavailable.")}</div>
        </div>
        <div>
          <h3>Trailer</h3>
          ${trailer ? `<button class="button button--primary" type="button" data-open-trailer>Watch Official Trailer</button>` : `<p class="muted-text">No official trailer was found for this title.</p>`}
        </div>
      </div>
    </div>
  `;
}

function bindModal(trailer) {
  if (!trailer) return;

  document.querySelector("[data-open-trailer]")?.addEventListener("click", () => {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal__content" role="dialog" aria-modal="true" aria-label="Trailer modal">
        <div class="modal__header">
          <strong>Official Trailer</strong>
          <button class="button button--ghost" type="button" data-close-modal>Close</button>
        </div>
        <div class="modal__body">
          <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector("[data-close-modal]")?.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  });
}

function bindMovieButtons(movie) {
  document.querySelector("[data-favorite-movie]")?.addEventListener("click", () => {
    toggleFavorite(movie);
    renderToast(isFavorite(movie.id) ? "Removed from favorites" : "Added to favorites", isFavorite(movie.id) ? "info" : "success");
    window.location.reload();
  });

  document.querySelector("[data-copy-link]")?.addEventListener("click", async () => {
    await copyToClipboard(getMovieLink(movie.id));
    renderToast("Movie link copied", "success");
  });
}

async function initMoviePage() {
  injectHeader();
  initializeTheme();
  bindScrollTopButton();

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");
  const titleElement = document.querySelector("#movie-title");
  const taglineElement = document.querySelector("#movie-tagline");
  const detailsElement = document.querySelector("#movie-details");
  const recommendationsElement = document.querySelector("#recommendations");

  if (!movieId) {
    if (titleElement) titleElement.textContent = "Movie not found";
    if (detailsElement) detailsElement.innerHTML = renderEmptyState("No movie ID was supplied in the URL.", "index.html", "Back to home");
    return;
  }

  if (detailsElement) detailsElement.innerHTML = renderLoader("Loading movie details...");
  if (recommendationsElement) recommendationsElement.innerHTML = renderLoader("Loading recommendations...");

  const movie = await getMovieDetails(movieId);
  const credits = await getMovieCredits(movieId);
  const videos = await getMovieVideos(movieId);
  const recommendations = await getMovieRecommendations(movieId);
  const trailer = getOfficialTrailer(videos);

  if (titleElement) titleElement.textContent = movie.title;
  if (taglineElement) taglineElement.textContent = movie.tagline || movie.overview || "";
  if (detailsElement) detailsElement.innerHTML = createDetailMarkup(movie, credits, trailer);
  if (recommendationsElement) {
    recommendationsElement.innerHTML = `${createSectionTitle("Recommendations", "Similar movies you may want to watch next.")}<div class="movie-grid">${recommendations.length ? renderMovieGrid(recommendations) : renderEmptyState("No recommendations found.")}</div>`;
  }

  addRecentlyViewed(movie);
  bindMovieButtons(movie);
  bindModal(trailer);
  document.querySelectorAll("[data-theme-toggle]").forEach(updateThemeButton);
}

initMoviePage();
