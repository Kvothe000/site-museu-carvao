
// --- FUNÇÕES AUXILIARES DE CARREGAMENTO (MODULARIZAÇÃO) ---

async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
        const response = await fetch(filePath);
        if (response.ok) {
            element.innerHTML = await response.text();
            if (elementId === 'main-header') {
                initHeaderScripts();
                highlightActiveLink();
            }
        }
    } catch (error) { console.error(`Erro ao carregar ${filePath}:`, error); }
}

function highlightActiveLink() {
    const page = window.location.pathname.split("/").pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        if (link.getAttribute('href') === page) link.classList.add('active');
        else link.classList.remove('active');
    });
}

// --- WIDGET FLUTUANTE DE ACESSIBILIDADE ---
function injectFloatingAccessibility() {
    const toggleBtn = document.getElementById('btn-ac-toggle');
    const panel = document.getElementById('ac-panel-menu');
    
    if (!toggleBtn || !panel) return;

    toggleBtn.onclick = () => {
        panel.classList.toggle('active');
    };
    
    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#ac-widget-container')) panel.classList.remove('active');
    });
}

// --- FUNÇÃO CENTRAL DE ACESSIBILIDADE ---
function initAccessibility() {
    injectFloatingAccessibility();

    const body = document.body;
    const btnContrast = document.getElementById('btn-contrast');
    const btnIncrease = document.getElementById('btn-increase');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnOriginal = document.getElementById('btn-original');
    const btnTheme = document.getElementById('btn-theme');

    // 0. Tema Escuro (Local Storage persist)
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (btnTheme) btnTheme.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
    }

    if (btnTheme) {
        btnTheme.onclick = () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            if (isDark) {
                localStorage.setItem('theme', 'dark');
                btnTheme.innerHTML = '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
                btnTheme.setAttribute('aria-label', 'Modo Claro');
                btnTheme.setAttribute('title', 'Modo Claro');
            } else {
                localStorage.setItem('theme', 'light');
                btnTheme.innerHTML = '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
                btnTheme.setAttribute('aria-label', 'Modo Escuro');
                btnTheme.setAttribute('title', 'Modo Escuro');
            }
        };
    }

    // 1. Alto Contraste (Botão) - Usando onclick para evitar duplicidade
    if (btnContrast) {
        btnContrast.onclick = () => {
            body.classList.toggle('high-contrast');
            if (body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'true');
            } else {
                localStorage.removeItem('highContrast');
            }
        };
    }

    // 2. Tamanho da Fonte
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 100;

    // Aplica o tamanho salvo imediatamente
    document.documentElement.style.fontSize = currentFontSize + '%';

    function updateFontSize(size) {
        document.documentElement.style.fontSize = size + '%';
        localStorage.setItem('fontSize', size);
    }

    if (btnIncrease) {
        btnIncrease.onclick = () => {
            if (currentFontSize < 150) {
                currentFontSize += 10;
                updateFontSize(currentFontSize);
            }
        };
    }
    if (btnDecrease) {
        btnDecrease.onclick = () => {
            if (currentFontSize > 70) {
                currentFontSize -= 10;
                updateFontSize(currentFontSize);
            }
        };
    }
    if (btnOriginal) {
        btnOriginal.onclick = () => {
            currentFontSize = 100;
            updateFontSize(currentFontSize);
            localStorage.removeItem('fontSize');
        };
    }
}

let currentLang = localStorage.getItem('language') || 'pt';

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);

    // Atualiza textos com data-i18n
    // Atualiza textos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        // Verifica se a chave existe na tradução
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[lang][key];
            } else {
                // Preserva ícones se existirem (ex: no menu dropdown)
                const icon = element.querySelector('i');
                if (icon) {
                    const iconHTML = icon.outerHTML;
                    // Insere texto + ícone
                    element.innerHTML = translations[lang][key] + ' ' + iconHTML;
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        }
    });

    // Atualiza atributos aria-label e title com data-i18n-aria
    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            element.setAttribute('aria-label', translations[lang][key]);
            element.setAttribute('title', translations[lang][key]);
        }
    });

    // Atualiza o estilo visual dos botões de idioma
    const langButtons = document.querySelectorAll('.language-selector a');
    if (langButtons) {
        langButtons.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.language-selector a');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = e.target.dataset.lang;
            updateLanguage(selectedLang);
        });
    });
    // Aplica o idioma salvo assim que iniciar
    updateLanguage(currentLang);
}

// Função que inicializa tudo que depende do Header
function initHeaderScripts() {
    // 1. Inicializa a Acessibilidade e Idioma
    initAccessibility();
    initLanguageSelector();

    // 2. Sticky Header
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        const body = document.body;
        window.addEventListener('scroll', () => {
            if (window.scrollY > headerHeight) {
                if (!header.classList.contains('sticky-header')) {
                    header.classList.add('sticky-header');
                    body.classList.add('body-padding-for-sticky');
                }
            } else {
                if (header.classList.contains('sticky-header')) {
                    header.classList.remove('sticky-header');
                    body.classList.remove('body-padding-for-sticky');
                }
            }
        }, { passive: true });
    }

    // 3. Dropdown Simples (Mouse + Teclado)
    const dropdownLinks = document.querySelectorAll('.main-nav .has-dropdown > a');

    dropdownLinks.forEach(link => {
        // Inicializa ARIA
        link.setAttribute('aria-expanded', 'false');
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');

        function toggleDropdown(e) {
            e.preventDefault();
            const parentLi = link.parentElement;
            const isOpen = parentLi.classList.contains('show-dropdown');

            // Fecha outros dropdowns abertos
            dropdownLinks.forEach(otherLink => {
                if (otherLink !== link) {
                    otherLink.parentElement.classList.remove('show-dropdown');
                    otherLink.setAttribute('aria-expanded', 'false');
                }
            });

            // Alterna o atual
            if (isOpen) {
                parentLi.classList.remove('show-dropdown');
                link.setAttribute('aria-expanded', 'false');
            } else {
                parentLi.classList.add('show-dropdown');
                link.setAttribute('aria-expanded', 'true');
            }
        }

        // Evento de Clique (Mouse)
        link.addEventListener('click', toggleDropdown);

        // Evento de Teclado (Enter ou Espaço)
        link.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                toggleDropdown(event);
            }
        });
    });

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-dropdown')) {
            dropdownLinks.forEach(link => {
                link.parentElement.classList.remove('show-dropdown');
                link.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // 4. Busca
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');
    if (searchButton && searchInput) {
        const performSearch = () => {
            if (searchInput.value.trim()) window.location.href = `busca.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        };
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); } });
    }

    // --- D. MENU MOBILE (HAMBÚRGUER) ---
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    const navElement = document.querySelector('.main-nav');

    if (mobileBtn && navElement) {
        mobileBtn.addEventListener('click', function () {
            // Alterna a classe 'mobile-active' na navegação
            navElement.classList.toggle('mobile-active');

            // Troca o ícone de Barras para X (opcional, visual)
            const icon = this.querySelector('i');
            if (navElement.classList.contains('mobile-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// --- INICIALIZAÇÃO ---
// ==========================================================
// 5. INICIALIZAÇÃO PRINCIPAL (DOM READY)
// ==========================================================
document.addEventListener('DOMContentLoaded', async () => {

    // 1. Verifica preferência de contraste (sem piscar)
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }

    // 2. Carrega Header e Footer e ESPERA terminarem (Promise.all)
    await Promise.all([
        loadComponent('main-header', 'header.html'),
        loadComponent('main-footer', 'footer.html')
    ]);

    // 3. Agora que tudo carregou, mostra a página suavemente
    document.body.classList.add('page-loaded');

    // API ACERVO
    const acervoContainer = document.getElementById('acervo-container');
    if (acervoContainer) {
        async function carregarAcervo() {
            try {
                const response = await fetch('mock-api.json');
                const data = await response.json();
                const documentos = data.results || data;
                acervoContainer.classList.remove('loading');
                acervoContainer.innerHTML = '';
                acervoContainer.style.display = 'grid';
                documentos.forEach(doc => {
                    const card = document.createElement('a');
                    card.className = 'fundo-card';
                    card.href = doc.slug || '#';
                    card.target = '_blank';
                    const img = doc.thumbnail_url || 'https://via.placeholder.com/300x200.png?text=Documento';
                    card.innerHTML = `<figure><img src="${img}" alt="${doc.title}"><figcaption>${doc.title}</figcaption></figure>`;
                    acervoContainer.appendChild(card);
                });
            } catch (error) {
                console.error('Erro acervo:', error);
                acervoContainer.innerHTML = '<p>Erro ao carregar acervo.</p>';
            }
        }
        carregarAcervo();
    }

    // --- CARROSSEL DA HOME ---
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel && typeof Splide !== 'undefined') {
        new Splide('#home-carousel', {
            type: 'loop',
            perPage: 1,        // Força 1 imagem por vez
            perMove: 1,
            gap: '0',          // Sem espaço entre elas
            autoplay: true,
            interval: 4000,
            pauseOnHover: true,
            arrows: true,      // Garante setas de navegação
            pagination: true,  // Garante bolinhas de navegação
            width: '100%',     // Força a largura do container
            fixedWidth: null,  // Remove qualquer largura fixa herdada
            breakpoints: {     // Garante que em telas menores continue sendo 1
                992: { perPage: 1 },
                768: { perPage: 1 }
            }
        }).mount();
    }



    // SIDEBAR SMOOTH SCROLL
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    internalLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            const targetId = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault();
                    const headerOffset = document.querySelector('.sticky-header') ? 80 : 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    if (this.closest('.has-dropdown')) this.closest('.has-dropdown').classList.remove('show-dropdown');
                }
            } catch (e) { }
        });
    });

    // Scrollspy para Sidebar
    const sidebarScrollLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');
    const scrollSpySections = document.querySelectorAll('.main-content article[id]');
    if (sidebarScrollLinks.length > 0 && scrollSpySections.length > 0) {
        function activateSidebarLink() {
            let currentSectionId = '';
            let headerHeightOffset = document.querySelector('.sticky-header')?.offsetHeight || document.querySelector('header')?.offsetHeight || 0;
            headerHeightOffset += 40;
            scrollSpySections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeightOffset;
                if (window.scrollY >= sectionTop) currentSectionId = '#' + section.getAttribute('id');
            });
            sidebarScrollLinks.forEach(link => {
                link.classList.remove('active-sidebar-link');
                if (currentSectionId && link.getAttribute('href') === currentSectionId) link.classList.add('active-sidebar-link');
            });
        }
        window.addEventListener('scroll', activateSidebarLink, { passive: true });
        activateSidebarLink();
    }

    // --- OBSERVER PARA ANIMAÇÕES DE SCROLL (FADE IN UP) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
    });
});