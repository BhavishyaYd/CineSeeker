import { searchMovies } from "./api.js";
import { renderEmptyState, renderLoader, renderMovieGrid, renderSkeletonCards } from "./components.js";
import { debounce } from "./utils.js";

const dom = {
  input: document.querySelector("[data-search-page-input]"),
  results: document.querySelector("[data-search-page-results]"),
  status: document.querySelector("[data-search-page-status]"),
  clear: document.querySelector("[data-search-page-clear]"),
  prev: document.querySelector("[data-pagination-prev]"),
  next: document.querySelector("[data-pagination-next]"),
};

const state = {
  page: 1,
  totalPages: 0,
  query: "",
};

async function performSearch(query, page = 1) {
  if (!dom.results || !dom.status) return;

  const trimmedQuery = query.trim();
  state.query = trimmedQuery;
  state.page = page;

  if (!trimmedQuery) {
    dom.status.textContent = "Start typing a movie title to search.";
    dom.results.innerHTML = renderEmptyState("Search for a movie to begin.");
    updatePagination();
    return;
  }

  dom.results.innerHTML = renderSkeletonCards(6);
  dom.status.textContent = `Searching for ${trimmedQuery}...`;

  try {
    const response = await searchMovies(trimmedQuery, page);
    state.totalPages = response.totalPages || 0;
    dom.status.textContent = response.results.length ? `${response.totalResults || response.results.length} results for ${trimmedQuery}` : `No results found for ${trimmedQuery}`;
    dom.results.innerHTML = response.results.length ? renderMovieGrid(response.results) : renderEmptyState("No matching movies found.");
    updatePagination();
  } catch (error) {
    dom.status.textContent = "Search failed.";
    dom.results.innerHTML = renderEmptyState(error.message, "index.html", "Go home");
    updatePagination();
  }
}

function updatePagination() {
  if (dom.prev) dom.prev.disabled = state.page <= 1;
  if (dom.next) dom.next.disabled = state.totalPages <= 0 || state.page >= state.totalPages;
}

function initSearchPage() {
  if (!dom.input) return;

  const runSearch = debounce((value) => performSearch(value), 350);

  dom.input.addEventListener("input", (event) => {
    dom.clear?.classList.toggle("hidden", !event.target.value);
    runSearch(event.target.value);
  });

  dom.clear?.addEventListener("click", () => {
    dom.input.value = "";
    dom.clear.classList.add("hidden");
    performSearch("");
    dom.input.focus();
  });

  dom.prev?.addEventListener("click", () => {
    if (state.page > 1) performSearch(state.query, state.page - 1);
  });

  dom.next?.addEventListener("click", () => {
    if (state.totalPages > 0 && state.page < state.totalPages) performSearch(state.query, state.page + 1);
  });

  performSearch(dom.input.value);
}

window.addEventListener("DOMContentLoaded", initSearchPage);
