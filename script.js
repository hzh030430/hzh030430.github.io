const root = document.documentElement;
const themeButton = document.querySelector(".theme-button");
const themeState = document.querySelector(".theme-state");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function resolvedTheme() {
  return root.dataset.theme || (systemTheme.matches ? "dark" : "light");
}

function updateThemeControl() {
  if (!themeButton || !themeState) return;
  const current = resolvedTheme();
  const next = current === "dark" ? "light" : "dark";
  themeState.textContent = root.dataset.theme ? current[0].toUpperCase() + current.slice(1) : "Auto";
  themeButton.setAttribute("aria-label", `Switch to ${next} theme`);
}

themeButton?.addEventListener("click", () => {
  const next = resolvedTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (error) {}
  updateThemeControl();
});

systemTheme.addEventListener("change", () => {
  if (!root.dataset.theme) updateThemeControl();
});

updateThemeControl();

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");

function closeMenu() {
  if (!header || !menuButton) return;
  header.dataset.open = "false";
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton?.addEventListener("click", () => {
  const open = header?.dataset.open !== "true";
  if (header) header.dataset.open = String(open);
  menuButton.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    menuButton?.focus();
  }
});

window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const revealItems = document.querySelectorAll("[data-reveal]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10%", threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
