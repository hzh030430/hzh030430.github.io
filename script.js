(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("#site-nav");
  const menuButton = document.querySelector(".menu-button");
  const themeButton = document.querySelector(".theme-button");
  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const smallScreen = window.matchMedia("(max-width: 640px)");

  function renderIcon(element, name) {
    const nodes = window.homepageIcons?.[name];
    if (!element || !nodes) return;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    for (const [key, value] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.75", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" })) {
      svg.setAttribute(key, value);
    }
    for (const [tag, attributes] of nodes) {
      const child = document.createElementNS("http://www.w3.org/2000/svg", tag);
      for (const [key, value] of Object.entries(attributes)) child.setAttribute(key, value);
      svg.append(child);
    }
    element.replaceChildren(svg);
  }

  for (const element of document.querySelectorAll("[data-icon]")) renderIcon(element, element.dataset.icon);

  function currentTheme() {
    return root.dataset.theme || (colorScheme.matches ? "dark" : "light");
  }

  function updateThemeButton() {
    const dark = currentTheme() === "dark";
    const label = "Switch to " + (dark ? "light" : "dark") + " theme";
    themeButton.setAttribute("aria-label", label);
    themeButton.dataset.tooltip = label;
    renderIcon(themeButton.querySelector("[data-icon]"), dark ? "Sun" : "Moon");
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      meta.content = dark ? "#191a1d" : "#ffffff";
    }
  }

  themeButton.addEventListener("click", () => {
    const theme = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch (error) {}
    updateThemeButton();
  });
  colorScheme.addEventListener("change", updateThemeButton);
  window.addEventListener("storage", (event) => {
    if (event.key !== "theme" && event.key !== null) return;
    if (event.newValue === "light" || event.newValue === "dark") root.dataset.theme = event.newValue;
    else delete root.dataset.theme;
    updateThemeButton();
  });

  function setMenu(open) {
    header.dataset.open = String(open);
    menuButton.setAttribute("aria-expanded", String(open));
    const label = open ? "Close navigation" : "Open navigation";
    menuButton.setAttribute("aria-label", label);
    menuButton.dataset.tooltip = label;
    renderIcon(menuButton.querySelector("[data-icon]"), open ? "X" : "Menu");
  }

  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const wasOpen = header.dataset.open === "true";
    setMenu(false);
    if (!wasOpen || !link.hash) return;
    const target = document.querySelector(link.hash);
    if (target) {
      // Move keyboard focus out of the now-collapsed navigation.
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.dataset.open === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener("click", (event) => {
    // The toggle replaces its SVG, so use the original event path for containment.
    if (header.dataset.open === "true" && !event.composedPath().includes(header)) setMenu(false);
  });
  header.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (header.dataset.open === "true" && !header.contains(document.activeElement)) setMenu(false);
    });
  });
  smallScreen.addEventListener("change", () => setMenu(false));

  setMenu(false);
  updateThemeButton();
  themeButton.hidden = false;
  menuButton.hidden = false;
  root.classList.add("js-ready");
})();
