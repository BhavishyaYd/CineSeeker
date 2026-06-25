import { getThemePreference, storeThemePreference } from "./utils.js";

const THEME_ATTRIBUTE = "data-theme";

export function applyTheme(theme) {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  storeThemePreference(theme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE) || getThemePreference();
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  return nextTheme;
}

export function initializeTheme() {
  applyTheme(getThemePreference());

  const themeButtons = document.querySelectorAll("[data-theme-toggle]");
  themeButtons.forEach((button) => {
    updateThemeButton(button);
    button.addEventListener("click", () => {
      const nextTheme = toggleTheme();
      themeButtons.forEach(updateThemeButton);
      document.dispatchEvent(new CustomEvent("cineseeker:theme-changed", { detail: { theme: nextTheme } }));
    });
  });
}

export function updateThemeButton(button) {
  const theme = document.documentElement.getAttribute(THEME_ATTRIBUTE) || getThemePreference();
  const isDark = theme === "dark";
  button.setAttribute("aria-pressed", String(isDark));
  button.textContent = isDark ? "Light Mode" : "Dark Mode";
}
