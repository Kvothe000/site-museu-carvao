import { initAccessibility } from './modules/a11y.js';
import { initCarousel } from './modules/carousel.js';

// A lógica de loadComponent foi removida pois o Vite cuidará da injeção no Build-time.

function highlightActiveLink() {
    const page = window.location.pathname.split("/").pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        if (link.getAttribute('href') === page) link.classList.add('active');
        else link.classList.remove('active');
    });
}

// Determinar idioma padrão: prioriza localStorage, depois navegador (apenas se for en ou es, senão pt)
let currentLang = localStorage.getItem('language');
if (!currentLang) {
    const browserLang = navigator.language || navigator.userLanguage || 'pt';
    const shortLang = browserLang.substring(0, 2).toLowerCase();
    currentLang = ['pt', 'en', 'es'].includes(shortLang) ? shortLang : 'pt';
    localStorage.setItem('language', currentLang);
}

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);

    // Tradução dinâmica de Metadados (Título e Meta Description)
    const rawPage = window.location.pathname.split("/").pop().replace(".html", "") || 'index';
    // Mapeia páginas sem sufixo ou diretórios para index
    const pageName = ['index', '404', 'arquivos-digitais', 'arquivos-fotograficos', 'arquivos-historicos', 'arquivos-tridimensionais', 'busca', 'localizacao-contato', 'mapa-do-site', 'nossa-historia', 'nossos-fundos', 'projetos', 'publicacoes', 'servicos'].includes(rawPage) ? rawPage : 'index';
    const titleKey = `meta_title_${pageName}`;
    const descKey = `meta_desc_${pageName}`;

    if (typeof translations !== 'undefined' && translations[lang]) {
        if (translations[lang][titleKey]) {
            document.title = translations[lang][titleKey];
        }
        if (translations[lang][descKey]) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', translations[lang][descKey]);
            }
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[lang][key];
            } else {
                const icon = element.querySelector('i');
                if (icon) {
                    const iconHTML = icon.outerHTML;
                    element.innerHTML = translations[lang][key] + ' ' + iconHTML;
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            element.alt = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(element => {
        const key = element.getAttribute('data-i18n-aria');
        if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
            element.setAttribute('aria-label', translations[lang][key]);
            element.setAttribute('title', translations[lang][key]);
        }
    });

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

// Expor função globalmente para chamadas dinâmicas pós-injeção de DOM
window.updateLanguage = updateLanguage;

function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.language-selector a');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = e.target.dataset.lang;
            updateLanguage(selectedLang);
        });
    });
    updateLanguage(currentLang);
}

function initHeaderScripts() {
    initAccessibility();
    initLanguageSelector();

    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        window.addEventListener('scroll', () => {
            if (window.scrollY > headerHeight) {
                if (!header.classList.contains('sticky-header')) {
                    header.classList.add('sticky-header');
                }
            } else {
                if (header.classList.contains('sticky-header')) {
                    header.classList.remove('sticky-header');
                }
            }
        }, { passive: true });
    }

    const dropdownLinks = document.querySelectorAll('.main-nav .has-dropdown > a');
    dropdownLinks.forEach(link => {
        link.setAttribute('aria-expanded', 'false');
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');

        function toggleDropdown(e) {
            e.preventDefault();
            const parentLi = link.parentElement;
            const isOpen = parentLi.classList.contains('show-dropdown');

            dropdownLinks.forEach(otherLink => {
                if (otherLink !== link) {
                    otherLink.parentElement.classList.remove('show-dropdown');
                    otherLink.setAttribute('aria-expanded', 'false');
                }
            });

            if (isOpen) {
                parentLi.classList.remove('show-dropdown');
                link.setAttribute('aria-expanded', 'false');
            } else {
                parentLi.classList.add('show-dropdown');
                link.setAttribute('aria-expanded', 'true');
            }
        }

        link.addEventListener('click', toggleDropdown);
        link.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') toggleDropdown(event);
        });

        // Fecha o dropdown quando o foco do teclado sai de dentro do container
        parentLi.addEventListener('focusout', function () {
            setTimeout(() => {
                if (!parentLi.contains(document.activeElement)) {
                    parentLi.classList.remove('show-dropdown');
                    link.setAttribute('aria-expanded', 'false');
                }
            }, 50);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.has-dropdown')) {
            dropdownLinks.forEach(link => {
                link.parentElement.classList.remove('show-dropdown');
                link.setAttribute('aria-expanded', 'false');
            });
        }
    });

    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');
    if (searchButton && searchInput) {
        const performSearch = () => {
            if (searchInput.value.trim()) window.location.href = `busca.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        };
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); } });
    }

    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    const navElement = document.querySelector('.main-nav');
    if (mobileBtn && navElement) {
        mobileBtn.addEventListener('click', function () {
            navElement.classList.toggle('mobile-active');
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

// ==========================================================
// INICIALIZAÇÃO PRINCIPAL (DOM READY)
// ==========================================================
document.addEventListener('DOMContentLoaded', async () => {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
            .then(reg => console.log('Service Worker Registrado com escopo:', reg.scope))
            .catch(err => console.error('Erro no registro do Service Worker:', err));
    }

    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }

    // Inicializa scripts do header diretamente (já injetado pelo Vite)
    initHeaderScripts();
    highlightActiveLink();

    document.body.classList.add('page-loaded');

    initCarousel();

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

    // Barra de progresso de leitura
    function initReadingProgressBar() {
        const progressBar = document.getElementById('reading-progress-bar');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                progressBar.style.width = `${progress}%`;
            }
        }, { passive: true });
    }

    // Scroll reveal com IntersectionObserver
    function initScrollReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (reveals.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        reveals.forEach(el => revealObserver.observe(el));
    }

    initReadingProgressBar();
    initScrollReveal();
});
