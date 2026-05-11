/**
 * script.js
 * Funcionalidades: Header, Menu, Ano, Foco, Tradução via JSON (com Persistência), Voltar Topo, Vídeo Hover, WhatsApp Form.
 */

document.addEventListener("DOMContentLoaded", () => {
  // OBTÉM O CABEÇALHO PRINCIPAL (só existe no index.html)
  const mainHeader = document.querySelector(".main-header");
  const scrollThreshold = 50;

  // 1. HEADER ENCOLHÍVEL (SÓ EXECUTA SE mainHeader EXISTIR)
  if (mainHeader) {
    const checkScroll = () => {
      mainHeader.classList.toggle("scrolled", window.scrollY > scrollThreshold);
    };
    window.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll();
  }

  // 2. MENU RESPONSIVO
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");
  // Seleciona links dentro do main-nav e do simple-header (links de voltar)
  const navLinks = document.querySelectorAll(".main-nav a, .simple-header a");

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

  // 3. ANO AUTOMÁTICO NO RODAPÉ
  const currentYearEl = document.getElementById("current-year");
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // 4. CORREÇÃO DE FOCO INICIAL (Opcional)
  const shiftInitialFocus = () => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  };
  shiftInitialFocus();

  // 5. LÓGICA DE TRADUÇÃO (CARREGANDO JSON E PERSISTÊNCIA)
  const languageLinks = document.querySelectorAll(".lang-link");
  const translatableElements = document.querySelectorAll(
    "[data-translate-key], [data-translate-href]"
  );
  let currentTranslations = {};

  // Função assíncrona para buscar o arquivo JSON de tradução
  async function fetchTranslations(lang) {
    if (currentTranslations[lang]) return currentTranslations[lang];

    try {
      const response = await fetch(`locales/${lang}.json`);
      if (!response.ok) {
        console.error(
          `Não foi possível carregar o arquivo de tradução para o idioma: ${lang}. Status: ${response.status}`
        );
        return null;
      }
      const translations = await response.json();
      currentTranslations[lang] = translations;
      return translations;
    } catch (error) {
      console.error(
        `Erro ao buscar ou processar o arquivo de tradução para ${lang}:`,
        error
      );
      return null;
    }
  }

  // Função assíncrona para aplicar as traduções na página
  async function setLanguage(lang) {
    const translations = await fetchTranslations(lang);

    if (!translations) {
      if (lang !== "pt-br") {
        console.warn(
          `Fallback para pt-br porque ${lang}.json não foi encontrado ou é inválido.`
        );
        await setLanguage("pt-br");
      }
      return;
    }

    document.documentElement.lang = lang.replace("_", "-");

    translatableElements.forEach((el) => {
      const key = el.dataset.translateKey;
      const hrefKey = el.dataset.translateHref;

      if (key) {
        const translation = translations[key];
        if (translation !== undefined) {
          if (key === "heroTitle") {
            el.innerHTML = translation;
          } else if (el.tagName === "META") {
            if (
              el.getAttribute("name") === "description" ||
              el.getAttribute("name") === "keywords"
            ) {
              el.setAttribute("content", translation);
            } else if (
              el.getAttribute("property") &&
              el.getAttribute("property").startsWith("og:")
            ) {
              el.setAttribute("content", translation);
            }
          } else if (el.tagName === "TITLE") {
            document.title = translation;
          } else if (el.hasAttribute("placeholder")) {
            // Tradução para placeholder
            el.setAttribute("placeholder", translation);
          } else if (el.hasAttribute("alt")) {
            // Tradução para alt
            el.setAttribute("alt", translation);
          } else if (el.hasAttribute("aria-label")) {
            // Tradução para aria-label
            el.setAttribute("aria-label", translation);
          } else {
            // Tradução de texto padrão
            el.textContent = translation;
          }
        }
      }

      if (hrefKey) {
        const linkTranslation = translations[hrefKey];
        if (linkTranslation !== undefined && el.tagName === "A") {
          el.setAttribute("href", linkTranslation);
        }
      }
    });

    languageLinks.forEach((link) => {
      link.classList.toggle("lang-active", link.dataset.lang === lang);
    });
  }

  // Adiciona o evento de clique para cada botão de idioma
  languageLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const selectedLang = link.dataset.lang;
      // Salva o idioma selecionado no localStorage para persistência
      localStorage.setItem("dronyimagem_lang", selectedLang);
      setLanguage(selectedLang);
    });
  });

  // Carrega o idioma armazenado no localStorage ou usa 'pt-br' como padrão
  const storedLang = localStorage.getItem("dronyimagem_lang") || "pt-br";
  setLanguage(storedLang);

  // 6. BOTÃO VOLTAR AO TOPO
  const backToTopButton = document.querySelector(".back-to-top-btn");
  const showButtonThreshold = 300;

  if (backToTopButton) {
    const checkScrollForTopButton = () => {
      backToTopButton.classList.toggle(
        "visible",
        window.scrollY > showButtonThreshold
      );
    };
    window.addEventListener("scroll", checkScrollForTopButton);
    checkScrollForTopButton();

    backToTopButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 7. VÍDEOS EM AUTOPLAY IMEDIATO (REMOVIDA A LÓGICA DE HOVER/MOUSE)
  const videoItems = document.querySelectorAll(".solucao-item");

  if (videoItems.length > 0) {
    videoItems.forEach((item) => {
      const video = item.querySelector(".solucao-video");
      if (video) {
        // Configura o tempo de início do vídeo (para vídeos com #t=)
        video.addEventListener(
          "loadedmetadata",
          () => {
            const srcTimeOnLoad = video.currentSrc.split("#t=")[1];
            if (srcTimeOnLoad) {
              video.currentTime = parseFloat(srcTimeOnLoad);
            }
            // Tenta iniciar a reprodução imediatamente após carregar metadados
            video.play().catch((error) => {
              // Ignora erros de autoplay
            });
          },
          { once: true }
        );

        // Tenta Autoplay imediato, caso o loadedmetadata não seja rápido o suficiente
        video.play().catch((error) => {
          // Ignora erros de autoplay
        });
      }
    });
  }

  // 8. CARROSSEL INFINITO DE CLIENTES (sem espaço vazio)
  const clientesTrack = document.querySelector("[data-clientes-track]");
  if (clientesTrack) {
    const fillClientesTrack = () => {
      const originals = Array.from(clientesTrack.children).filter(
        (el) => !el.dataset.cloned
      );
      // Remove clones antigos (caso seja resize)
      Array.from(clientesTrack.children)
        .filter((el) => el.dataset.cloned)
        .forEach((el) => el.remove());

      const targetWidth = Math.max(window.innerWidth * 1.2, 1200);
      // Clona em sequência até passar do alvo (uma "metade" do track)
      let safety = 0;
      while (clientesTrack.scrollWidth < targetWidth && safety < 50) {
        originals.forEach((node) => {
          const clone = node.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          clone.dataset.cloned = "true";
          clientesTrack.appendChild(clone);
        });
        safety++;
      }
      // Duplica todo o conjunto atual (incluindo originais + clones) para
      // criar a segunda metade idêntica que o keyframe translateX(-50%) precisa
      Array.from(clientesTrack.children).forEach((node) => {
        const clone = node.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.cloned = "true";
        clientesTrack.appendChild(clone);
      });
    };

    fillClientesTrack();
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fillClientesTrack, 200);
    });
  }

  // 9. SLIDERS DO PORTFÓLIO (FOTOS E VÍDEOS)
  const portfolioSliders = document.querySelectorAll(".portfolio-slider");

  if (portfolioSliders.length > 0) {
    const buildVideoSlide = (item) => {
      const id = item.youtube_id;
      const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      return `
        <div class="portfolio-slide">
          <a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener noreferrer">
            <div class="portfolio-slide-media" style="background-image: url('${thumb}');">
              <span class="play-icon" aria-hidden="true"></span>
            </div>
            <div class="portfolio-slide-caption">${item.titulo}</div>
          </a>
        </div>
      `;
    };

    const buildPhotoSlide = (item) => `
      <div class="portfolio-slide">
        <a href="galeria-fotos.html">
          <div class="portfolio-slide-media" style="background-image: url('${item.imagem_url}');"></div>
          <div class="portfolio-slide-caption">${item.titulo}</div>
        </a>
      </div>
    `;

    const fetchJson = async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    };

    const wireScrollButtons = (slider) => {
      const track = slider.querySelector("[data-slider-track]");
      const prev = slider.querySelector(".portfolio-slider-prev");
      const next = slider.querySelector(".portfolio-slider-next");
      if (!track || !prev || !next) return;

      const scrollByAmount = () => {
        const first = track.querySelector(".portfolio-slide");
        if (!first) return 320;
        return first.getBoundingClientRect().width + 20;
      };

      const updateButtons = () => {
        prev.disabled = track.scrollLeft <= 5;
        next.disabled =
          track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      };

      prev.addEventListener("click", () => {
        track.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
      });
      next.addEventListener("click", () => {
        track.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
      });
      track.addEventListener("scroll", updateButtons, { passive: true });
      updateButtons();
    };

    portfolioSliders.forEach(async (slider) => {
      const track = slider.querySelector("[data-slider-track]");
      if (!track) return;
      const type = slider.dataset.portfolioType;

      if (type === "videos") {
        const data = await fetchJson("data/videos.json");
        if (data && Array.isArray(data.lista_videos)) {
          track.innerHTML = data.lista_videos.map(buildVideoSlide).join("");
        }
      } else if (type === "fotos") {
        const data = await fetchJson("data/fotos.json");
        if (data && Array.isArray(data.lista_fotos)) {
          track.innerHTML = data.lista_fotos.map(buildPhotoSlide).join("");
        }
      }
      wireScrollButtons(slider);
    });
  }

  // 10. WHATSAPP FORM HANDLER (ATUALIZADO PARA GOOGLE ANALYTICS GA4)
  const whatsappForm = document.getElementById("whatsapp-form");
  if (whatsappForm) {
    whatsappForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const whatsappNumber = "5565999396490";

      const nome = document.getElementById("nome").value;
      const cidade = document.getElementById("cidade").value;
      const finalidade = document.getElementById("finalidade").value;
      const dataServico = document.getElementById("data-servico").value;
      const precisaEdicao = document.getElementById("edicao").checked;

      let dataFormatada = "Ainda não sei / A combinar";
      if (dataServico) {
        const [ano, mes, dia] = dataServico.split("-");
        dataFormatada = `${dia}/${mes}/${ano}`;
      }

      const edicaoTexto = precisaEdicao ? "Sim" : "Não";

      const textoMensagem =
        `Olá, DronyImagem! Gostaria de um orçamento.\n\n` +
        `*Nome:* ${nome}\n` +
        `*Cidade:* ${cidade}\n` +
        `*Finalidade:* ${finalidade}\n` +
        `*Para quando precisa?* ${dataFormatada}\n` +
        `*Precisa de edição?* ${edicaoTexto}\n\n` +
        `------------------\n` +
        `*(Se possível, por favor, anexe aqui qualquer imagem ou referência do projeto que você tenha.)*`;

      if (typeof gtag === "function") {
        gtag("event", "clique_whatsapp", {
          event_category: "formulario_contato",
          event_label: finalidade,
          cidade: cidade,
        });
      }

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        textoMensagem
      )}`;
      window.open(whatsappUrl, "_blank");
    });
  }
}); // Fim do DOMContentLoaded
