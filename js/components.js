import { FALLBACK_POSTER } from "./config.js";
import { formatReleaseDate, formatVote, getMovieLink, getPosterUrl, isFavorite, truncateText } from "./utils.js";

export function renderMovieCard(movie, { actionLabel = "Open movie", compact = false } = {}) {
  const genres = movie.genres?.length ? movie.genres.map((genre) => genre.name).slice(0, 2).join(" • ") : "";
  const favoriteButtonLabel = isFavorite(movie.id) ? "Remove from favorites" : "Add to favorites";

  return `
    <article class="movie-card ${compact ? "movie-card--compact" : ""}" data-movie-id="${movie.id}" tabindex="0" aria-label="${movie.title}">
      <a class="movie-card__poster-link" href="movie.html?id=${movie.id}" aria-label="${actionLabel} for ${movie.title}">
        <img class="movie-card__poster" src="${getPosterUrl(movie.poster_path)}" alt="${movie.title} poster" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_POSTER}'" />
        <span class="movie-card__rating"><i>★</i> ${formatVote(movie.vote_average)}</span>
      </a>
      <div class="movie-card__body">
        <div class="movie-card__headline">
          <div>
            <h3 class="movie-card__title"><a href="movie.html?id=${movie.id}">${movie.title}</a></h3>
            <p class="movie-card__meta">${formatReleaseDate(movie.release_date)}${genres ? ` • ${genres}` : ""}</p>
          </div>
          <button
            class="icon-button movie-card__favorite ${isFavorite(movie.id) ? "is-active" : ""}"
            data-favorite-toggle
            data-movie-id="${movie.id}"
            data-movie-title="${movie.title}"
            aria-label="${favoriteButtonLabel}"
            aria-pressed="${isFavorite(movie.id) ? "true" : "false"}"
            type="button"
          >
            ♥
          </button>
        </div>
        <p class="movie-card__overview">${truncateText(movie.overview, 110)}</p>
        <a class="movie-card__cta" href="movie.html?id=${movie.id}">${actionLabel}</a>
      </div>
    </article>
  `;
}

export function renderMovieGrid(movies = [], options = {}) {
  if (!movies.length) {
    return "";
  }

  return movies.map((movie) => renderMovieCard(movie, options)).join("");
}

export function renderSkeletonCards(count = 6) {
  return Array.from({ length: count })
    .map(
      () => `
        <article class="movie-card movie-card--skeleton" aria-hidden="true">
          <div class="skeleton skeleton--poster"></div>
          <div class="movie-card__body">
            <div class="skeleton skeleton--line"></div>
            <div class="skeleton skeleton--line skeleton--short"></div>
            <div class="skeleton skeleton--line skeleton--tall"></div>
          </div>
        </article>
      `,
    )
    .join("");
}

export function renderEmptyState(message, actionLink = "index.html", actionText = "Explore movies") {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">♪</div>
      <h3>${message}</h3>
      <a class="button button--primary" href="${actionLink}">${actionText}</a>
    </div>
  `;
}

export function renderLoader(message = "Loading movies...") {
  return `
    <div class="loading-state" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p>${message}</p>
    </div>
  `;
}

export function renderToast(message, tone = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${tone}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.classList.add("is-visible"), 20);
  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 250);
  }, 2600);
  return toast;
}

export function renderRecentlyViewedStrip(movies = []) {
  if (!movies.length) return "";

  return `
    <section class="panel panel--recent" aria-labelledby="recently-viewed-heading">
      <div class="section-heading">
        <div>
          <p class="eyebrow">History</p>
          <h2 id="recently-viewed-heading">Recently Viewed</h2>
        </div>
      </div>
      <div class="movie-row movie-row--compact">
        ${renderMovieGrid(movies.slice(0, 6), { compact: true })}
      </div>
    </section>
  `;
}

export function createHeroMarkup(movie) {
  return `
    <div class="hero__backdrop" style="background-image: linear-gradient(90deg, rgba(15, 23, 42, 0.96) 24%, rgba(15, 23, 42, 0.52) 58%, rgba(15, 23, 42, 0.15) 100%), url('${getPosterUrl(movie.backdrop_path || movie.poster_path, "w1280")}');"></div>
    <div class="hero__content reveal is-visible">
      <p class="eyebrow">Featured</p>
      <h1>${movie.title}</h1>
      <p class="hero__overview">${truncateText(movie.overview, 230)}</p>
      <div class="hero__actions">
        <a class="button button--primary" href="movie.html?id=${movie.id}">Watch Trailer</a>
        <a class="button button--ghost" href="#discover">Explore Movies</a>
        <button class="button button--secondary" type="button" data-random-movie>Random Movie</button>
      </div>
    </div>
    <div class="hero__badge">
      <span>IMDb</span>
      <strong>${formatVote(movie.vote_average)}</strong>
    </div>
  `;
}

export function createSectionTitle(title, subtitle) {
  return `
    <div class="section-heading">
      <div>
        <p class="eyebrow">Collection</p>
        <h2>${title}</h2>
        ${subtitle ? `<p class="section-heading__subtitle">${subtitle}</p>` : ""}
      </div>
    </div>
  `;
}
