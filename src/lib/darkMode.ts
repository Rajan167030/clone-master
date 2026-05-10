// Dark mode utility functions

const DARK_MODE_KEY = "fc-dark-mode";

export const getDarkMode = (): boolean => {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  if (stored !== null) {
    return stored === "true";
  }
  // Check system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const setDarkMode = (isDark: boolean): void => {
  localStorage.setItem(DARK_MODE_KEY, isDark ? "true" : "false");
  applyDarkMode(isDark);
};

export const toggleDarkMode = (): void => {
  const isDark = getDarkMode();
  setDarkMode(!isDark);
};

export const applyDarkMode = (isDark: boolean): void => {
  const htmlElement = document.documentElement;
  if (isDark) {
    htmlElement.classList.add("dark");
  } else {
    htmlElement.classList.remove("dark");
  }
};

export const initDarkMode = (): void => {
  applyDarkMode(getDarkMode());
};
