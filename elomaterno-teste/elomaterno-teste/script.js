// =========================================================
// 1. DIRETIVA GLOBAL: ANIMAÇÃO DE SCROLL (FADE-IN)
// Futuro Angular: Isso vai se transformar em uma Custom Directive (ex: @Directive({selector: '[appFadeIn]'}))
// Função: Observa quando o elemento entra na tela e adiciona a classe 'visible'
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Dispara a animação quando 15% do elemento estiver visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe que engatilha o CSS transition
                entry.target.classList.add('visible');
                // Interrompe a observação após a primeira animação (opcional)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Aplica o observer em cada elemento
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
});


// =========================================================
// 2. LÓGICA DE COMPONENTE: SEÇÃO "COMO FUNCIONA" (STICKY SCROLL)
// Futuro Angular: Isso vai para o arquivo TypeScript do componente (ex: how-it-works.component.ts)
// Função: Controla a troca das imagens do celular/computador de acordo com o texto lido
// =========================================================
const steps = document.querySelectorAll('.step-card');
const img1 = document.getElementById('mockup-img-1');
const img2 = document.getElementById('mockup-img-2');

if (steps.length > 0 && img1 && img2) {
    let currentImgSrc = img1.src; // Armazena o estado da imagem atual

    const stepObserverOptions = {
        root: null,
        // A imagem só muda quando o card cruzar a linha dos 40% a 60% da tela (o meio)
        rootMargin: '-40% 0px -40% 0px', 
        threshold: 0
    };

    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 1. Atualiza os estilos do texto (destaca o card focado)
                steps.forEach(step => step.classList.remove('is-active'));
                entry.target.classList.add('is-active');

                // 2. Obtém a nova imagem que precisa ser carregada
                const newImageSrc = entry.target.getAttribute('data-image');

                // 3. Executa o Cross-fade apenas se a imagem for diferente da atual
                if (newImageSrc !== currentImgSrc) {
                    
                    // Descobre qual tag <img> está aparecendo e qual está escondida
                    const activeImg = img1.classList.contains('active') ? img1 : img2;
                    const hiddenImg = img1.classList.contains('active') ? img2 : img1;

                    // Carrega a nova imagem na tag escondida
                    hiddenImg.src = newImageSrc;

                    // Aguarda a imagem fazer o download completo para não piscar
                    hiddenImg.onload = () => {
                        // Inverte as classes para disparar a transição CSS de opacidade
                        activeImg.classList.remove('active');
                        hiddenImg.classList.add('active');
                        
                        // Atualiza a referência da imagem atual
                        currentImgSrc = newImageSrc;
                    };
                }
            }
        });
    }, stepObserverOptions);

    // Inicializa a observação para cada card de passo
    steps.forEach(step => stepObserver.observe(step));
}


// =========================================================
// 3. SERVIÇO GLOBAL: ACESSIBILIDADE
// Futuro Angular: Isso será isolado em um Service injetável (ex: AccessibilityService)
// Função: Gerencia daltonismo, fontes, alto contraste e salva preferências no LocalStorage
// =========================================================
function initAccessibility() {
    const toggles = document.querySelectorAll("#accessibility-toggle, #accessibility-toggle-mobile");
    const menus = document.querySelectorAll("#accessibility-menu, #accessibility-menu-mobile");
  
    if (!toggles.length || !menus.length) return;
  
    toggles.forEach((toggle, idx) => {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menus[idx].classList.toggle("hidden");
      });
    });
  
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".accessibility-selector")) {
        menus.forEach(menu => menu.classList.add("hidden"));
      }
    });
  
    const selectAll = (action) => document.querySelectorAll(`#${action}, [data-action="${action}"]`);
  
    // --- Tamanho da Fonte ---
    const increaseBtns = selectAll("increase-font");
    const decreaseBtns = selectAll("decrease-font");
    const defaultFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    let currentFontSize = parseFloat(localStorage.getItem("fontSize")) || defaultFontSize;
  
    function applyFontSize(delta) {
      document.querySelectorAll("p, span, a, li, h1, h2, h3, h4, h5, h6, button, label, input, textarea").forEach((el) => {
          const baseSize = parseFloat(getComputedStyle(el).getPropertyValue("font-size"));
          el.style.fontSize = baseSize + delta + "px";
      });
    }
  
    function changeFontSize(delta) {
      currentFontSize += delta;
      applyFontSize(delta);
    }
  
    if (currentFontSize !== defaultFontSize) {
      applyFontSize(currentFontSize - defaultFontSize);
    }
  
    increaseBtns.forEach((btn) => btn.addEventListener("click", () => { changeFontSize(2); localStorage.setItem("fontSize", currentFontSize); }));
    decreaseBtns.forEach((btn) => btn.addEventListener("click", () => { changeFontSize(-2); localStorage.setItem("fontSize", currentFontSize); }));
  
    // --- Filtros Daltonismo ---
    const modes = [
      { name: "Filtros Daltonismo", className: "" },
      { name: "Protanopia", className: "colorblind-protanopia" },
      { name: "Deuteranopia", className: "colorblind-deuteranopia" },
      { name: "Tritanopia", className: "colorblind-tritanopia" },
      { name: "Acromatopsia", className: "colorblind-Acromatopsia" },
    ];
    let savedMode = localStorage.getItem("colorblindMode") || "Filtros Daltonismo";
    let currentModeIndex = modes.findIndex((m) => m.name === savedMode);
    if (currentModeIndex === -1) currentModeIndex = 0;
  
    function applyColorblindMode(index) {
      const classesToRemove = modes.map((m) => m.className).filter(Boolean);
      if (classesToRemove.length) document.body.classList.remove(...classesToRemove);
      const mode = modes[index];
      if (mode.className) document.body.classList.add(mode.className);
      localStorage.setItem("colorblindMode", mode.name);
  
      const desktopBtn = document.querySelector("#colorblind-filter");
      if (desktopBtn) desktopBtn.innerHTML = `<i class="fa fa-low-vision"></i> ${mode.name}`;
    }
  
    applyColorblindMode(currentModeIndex);
  
    selectAll("colorblind-filter").forEach((btn) =>
      btn.addEventListener("click", () => {
        currentModeIndex = (currentModeIndex + 1) % modes.length;
        applyColorblindMode(currentModeIndex);
      })
    );
  
    // --- Leitura em Voz ---
    let speechEnabled = localStorage.getItem("screenReader") === "true";
    let navigationMode = "mouse";
    let lastSpokenElement = null;
  
    function enableSpeech() {
      document.body.addEventListener("mouseover", handleSpeechMouse);
      document.body.addEventListener("focusin", handleSpeechTab);
    }
    function disableSpeech() {
      document.body.removeEventListener("mouseover", handleSpeechMouse);
      document.body.removeEventListener("focusin", handleSpeechTab);
      window.speechSynthesis.cancel();
    }
    function handleSpeechMouse(e) {
      if (!speechEnabled || navigationMode !== "mouse") return;
      if (e.target === lastSpokenElement) return;
      lastSpokenElement = e.target;
      speakTextFromElement(e.target);
    }
    function handleSpeechTab(e) {
      if (!speechEnabled || navigationMode !== "tab") return;
      if (e.target === lastSpokenElement) return;
      lastSpokenElement = e.target;
      speakTextFromElement(e.target);
    }
    function speakTextFromElement(el) {
      const ariaLabel = el.getAttribute?.("aria-label");
      const text = (ariaLabel || el.alt || el.title || el.value || el.innerText || "").trim();
      if (!text) return;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  
    if (speechEnabled) enableSpeech();
  
    selectAll("screen-reader").forEach((btn) =>
      btn.addEventListener("click", () => {
        speechEnabled = !speechEnabled;
        if (speechEnabled) enableSpeech();
        else disableSpeech();
        localStorage.setItem("screenReader", speechEnabled);
      })
    );
  
    window.addEventListener("keydown", (e) => { if (e.key === "Tab") navigationMode = "tab"; });
    window.addEventListener("mousemove", () => { navigationMode = "mouse"; });
  
    // --- Máscara de Leitura, Alto Contraste, Negrito, Espaçamento ---
    const readingMaskOverlay = document.getElementById("reading-mask-overlay");
    let savedAccessibility = JSON.parse(localStorage.getItem("accessibilitySettings")) || {
        readingMask: false, boldText: false, highContrast: false, lineSpacing: "normal"
    };
  
    function saveAccessibility() { localStorage.setItem("accessibilitySettings", JSON.stringify(savedAccessibility)); }
  
    if (savedAccessibility.readingMask && readingMaskOverlay) {
      readingMaskOverlay.style.display = "block";
      document.body.classList.add("reading-mask-active");
    }
    if (savedAccessibility.boldText) document.body.classList.add("bold-text-active");
    if (savedAccessibility.highContrast) document.body.classList.add("high-contrast-active");
    if (savedAccessibility.lineSpacing) {
      document.body.classList.add(
        savedAccessibility.lineSpacing === "small" ? "line-spacing-sm" : savedAccessibility.lineSpacing === "large" ? "line-spacing-lg" : "line-spacing-normal"
      );
    }
  
    selectAll("reading-mask").forEach((btn) =>
      btn.addEventListener("click", () => {
        const active = readingMaskOverlay.style.display === "block";
        readingMaskOverlay.style.display = active ? "none" : "block";
        document.body.classList.toggle("reading-mask-active", !active);
        savedAccessibility.readingMask = !active;
        saveAccessibility();
      })
    );
  
    // Faz a máscara acompanhar o mouse
    document.addEventListener("mousemove", (e) => {
      if (document.body.classList.contains("reading-mask-active") && readingMaskOverlay) {
          const windowElem = readingMaskOverlay.querySelector('.highlight-window');
          if(windowElem) windowElem.style.top = e.clientY + 'px';
      }
    });
  
    selectAll("bold-text").forEach((btn) =>
      btn.addEventListener("click", () => {
        const active = document.body.classList.toggle("bold-text-active");
        savedAccessibility.boldText = active;
        saveAccessibility();
      })
    );
  
    selectAll("high-contrast").forEach((btn) =>
        btn.addEventListener("click", () => {
            const active = document.body.classList.toggle("high-contrast-active");
            savedAccessibility.highContrast = active;
            saveAccessibility();
        })
    );  
  
    function applyLineSpacing(state) {
      document.body.classList.remove("line-spacing-sm", "line-spacing-normal", "line-spacing-lg");
      if (state === "small") document.body.classList.add("line-spacing-sm");
      else if (state === "normal") document.body.classList.add("line-spacing-normal");
      else if (state === "large") document.body.classList.add("line-spacing-lg");
      savedAccessibility.lineSpacing = state;
      saveAccessibility();
    }
    selectAll("increase-line").forEach((btn) => btn.addEventListener("click", () => {
        if (savedAccessibility.lineSpacing === "small") applyLineSpacing("normal");
        else if (savedAccessibility.lineSpacing === "normal") applyLineSpacing("large");
    }));
    selectAll("decrease-line").forEach((btn) => btn.addEventListener("click", () => {
        if (savedAccessibility.lineSpacing === "large") applyLineSpacing("normal");
        else if (savedAccessibility.lineSpacing === "normal") applyLineSpacing("small");
    }));
  
    // --- Resetar ---
    selectAll("reset-accessibility").forEach((btn) =>
      btn.addEventListener("click", () => {
        const removeClasses = [
          "reading-mask-active", "bold-text-active", "high-contrast-active",
          "line-spacing-lg", "line-spacing-sm", "line-spacing-normal",
          "colorblind-protanopia", "colorblind-deuteranopia", "colorblind-tritanopia", "colorblind-Acromatopsia"
        ];
        document.body.classList.remove(...removeClasses);
        if (readingMaskOverlay) readingMaskOverlay.style.display = "none";
  
        document.querySelectorAll("p, span, a, li, h1, h2, h3, h4, h5, h6, button, label, input, textarea").forEach((el) => (el.style.fontSize = ""));
  
        savedAccessibility = { readingMask: false, boldText: false, highContrast: false, lineSpacing: "normal" };
        saveAccessibility();
        localStorage.removeItem("fontSize");
        localStorage.removeItem("colorblindMode");
        localStorage.removeItem("screenReader");
        applyColorblindMode(0); 
  
        if (speechEnabled) {
          disableSpeech();
          speechEnabled = false;
        }
      })
    );
}
// Inicializa o serviço
initAccessibility();


// =========================================================
// 4. LÓGICA DE COMPONENTE/SERVIÇO: MENU DE IDIOMAS (I18N)
// Futuro Angular: O clique do botão vai para header.component.ts. 
// A tradução real dos textos vai usar a biblioteca ngx-translate ou um i18n.service.ts
// =========================================================
const langToggle = document.getElementById('language-toggle');
const langMenu = document.getElementById('language-menu');
const currentFlag = document.getElementById('current-flag');

if (langToggle && langMenu) {
    // Abre/fecha o menu ao clicar na bandeira
    langToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('hidden');
        
        // Se abrir idiomas, garante que o menu de acessibilidade feche para não sobrepor
        const accMenu = document.getElementById('accessibility-menu');
        if (accMenu) accMenu.classList.add('hidden');
    });

    // Ação ao clicar em um idioma da lista
    langMenu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.getAttribute('data-lang');
            const flagCode = item.getAttribute('data-flag');
            
            // Troca a bandeira do botão lá em cima
            currentFlag.src = `https://flagcdn.com/w20/${flagCode}.png`;
            
            // Fecha o menu após a escolha
            langMenu.classList.add('hidden');
            
            // NOTA PARA EQUIPE: Aqui entrará a injeção do Serviço de Tradução no Angular
            console.log(`Idioma selecionado: ${lang}`); 
        });
    });

    // Fecha o menu de idiomas se clicar em qualquer outro lugar da tela
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.language-selector')) {
            langMenu.classList.add('hidden');
        }
    });
}

// =========================================================
// 5. ANIMAÇÃO DE CONTADOR (ESTATÍSTICAS)
// =========================================================
const counters = document.querySelectorAll('.counter');
const speed = 150; // Quanto menor o número, mais rápida é a animação

// Cria o observador para identificar quando a seção aparece na tela
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // Se a seção entrou na tela
        if (entry.isIntersecting) {
            const counter = entry.target;
            
            // Função que faz a contagem
            const updateCount = () => {
                // Pega o número final alvo (data-target do HTML)
                const target = +counter.getAttribute('data-target');
                // Pega o número atual na tela (começa em 0)
                const count = +counter.innerText;

                // Calcula o incremento (passos da animação)
                const inc = target / speed;

                // Se o número atual for menor que o alvo, continua somando
                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 15); // Chama a função novamente a cada 15ms
                } else {
                    // Garante que o número final seja exato ao chegar no fim
                    counter.innerText = target;
                }
            };

            updateCount();
            // Para de observar depois que animou uma vez, para não repetir se a usuária rolar para cima e para baixo
            observer.unobserve(counter);
        }
    });
}, { 
    threshold: 0.5 // Só dispara a animação quando pelo menos 50% da seção estiver visível
});

// Aplica o observador em cada número que tem a classe .counter
counters.forEach(counter => {
    counterObserver.observe(counter);
});