/* Script para landing pages /lp/N. Header, menu, ano, traduções. */

document.addEventListener("DOMContentLoaded", () => {
  const mainHeader = document.querySelector(".main-header");
  const scrollThreshold = 50;

  if (mainHeader) {
    const checkScroll = () => {
      mainHeader.classList.toggle("scrolled", window.scrollY > scrollThreshold);
    };
    window.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll();
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  const navLinks = document.querySelectorAll(".main-nav a");

  if (menuToggle && mainNav) {
    const updateMenuToggleIcon = (isExpanded) => {
      menuToggle.setAttribute("aria-expanded", isExpanded);
      menuToggle.innerHTML = isExpanded ? "&#10005;" : "&#9776;";
    };

    menuToggle.addEventListener("click", () => {
      mainNav.classList.toggle("open");
      updateMenuToggleIcon(mainNav.classList.contains("open"));
    });

    navLinks.forEach((link) => {
      if (!link.target || link.target !== "_blank") {
        link.addEventListener("click", () => {
          if (mainNav.classList.contains("open")) {
            mainNav.classList.remove("open");
            updateMenuToggleIcon(false);
          }
        });
      }
    });
  }

  const currentYearEl = document.getElementById("current-year");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  const backToTopButton = document.querySelector(".back-to-top-btn");
  const showButtonThreshold = 300;

  if (backToTopButton) {
    const checkScrollForTopButton = () => {
      backToTopButton.classList.toggle("visible", window.scrollY > showButtonThreshold);
    };
    window.addEventListener("scroll", checkScrollForTopButton);
    checkScrollForTopButton();

    backToTopButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============================================================
   * Traduções — busca o locale base + locale específico das LPs
   * e aplica em elementos com data-translate-key.
   * ============================================================ */
  const languageLinks = document.querySelectorAll(".lang-link");
  const cache = {};

  async function fetchLocale(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const [baseRes, lpRes] = await Promise.all([
        fetch(`../../locales/${lang}.json`),
        fetch(`../../locales/lp-${lang}.json`),
      ]);
      const base = baseRes.ok ? await baseRes.json() : {};
      const lp = lpRes.ok ? await lpRes.json() : {};
      cache[lang] = Object.assign({}, base, lp);
      return cache[lang];
    } catch (err) {
      console.error("Falha ao carregar locale:", lang, err);
      return {};
    }
  }

  function applyTranslations(translations) {
    document.documentElement.lang = translations.__lang || document.documentElement.lang;
    const els = document.querySelectorAll("[data-translate-key], [data-translate-href]");
    els.forEach((el) => {
      const key = el.dataset.translateKey;
      const hrefKey = el.dataset.translateHref;
      if (key && translations[key] !== undefined) {
        const v = translations[key];
        if (el.tagName === "META") {
          if (el.getAttribute("name") === "description" || el.getAttribute("name") === "keywords") {
            el.setAttribute("content", v);
          } else if ((el.getAttribute("property") || "").startsWith("og:")) {
            el.setAttribute("content", v);
          }
        } else if (el.tagName === "TITLE") {
          document.title = v;
        } else if (el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", v);
        } else if (el.hasAttribute("alt")) {
          el.setAttribute("alt", v);
        } else if (el.hasAttribute("aria-label")) {
          el.setAttribute("aria-label", v);
        } else {
          el.textContent = v;
        }
      }
      if (hrefKey && translations[hrefKey] !== undefined && el.tagName === "A") {
        el.setAttribute("href", translations[hrefKey]);
      }
    });
  }

  async function setLanguage(lang) {
    const translations = await fetchLocale(lang);
    applyTranslations(translations);
    languageLinks.forEach((link) => {
      link.classList.toggle("lang-active", link.dataset.lang === lang);
    });
    const htmlLangMap = { "pt-br": "pt-BR", en: "en", es: "es" };
    document.documentElement.lang = htmlLangMap[lang] || lang;
  }

  languageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const selectedLang = link.dataset.lang;
      localStorage.setItem("dronyimagem_lang", selectedLang);
      setLanguage(selectedLang);
    });
  });

  const storedLang = localStorage.getItem("dronyimagem_lang") || "pt-br";
  setLanguage(storedLang);
});
