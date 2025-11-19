// --- FUNÇÕES AUXILIARES DE CARREGAMENTO (MODULARIZAÇÃO) ---

// --- FUNÇÕES AUXILIARES ---

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

// --- NOVA FUNÇÃO DE ACESSIBILIDADE ---
function initAccessibility() {
    const body = document.body;
    const btnContrast = document.getElementById('btn-contrast');
    const btnIncrease = document.getElementById('btn-increase');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnOriginal = document.getElementById('btn-original');

    // 1. Alto Contraste (Botão)
    if (btnContrast) {
        btnContrast.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            if (body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'true');
            } else {
                localStorage.removeItem('highContrast');
            }
        });
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
        btnIncrease.addEventListener('click', () => {
            if (currentFontSize < 150) {
                currentFontSize += 10;
                updateFontSize(currentFontSize);
            }
        });
    }
    if (btnDecrease) {
        btnDecrease.addEventListener('click', () => {
            if (currentFontSize > 70) {
                currentFontSize -= 10;
                updateFontSize(currentFontSize);
            }
        });
    }
    if (btnOriginal) {
        btnOriginal.addEventListener('click', () => {
            currentFontSize = 100;
            updateFontSize(currentFontSize);
            localStorage.removeItem('fontSize');
        });
    }
}

let currentLang = localStorage.getItem('language') || 'pt';

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);

    // Atualiza textos com data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[lang][key];
            } else {
                // Preserva ícones se existirem
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

    // Atualiza o estilo visual dos botões de idioma (CORREÇÃO DO ERRO)
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
    // 1. Inicializa a Acessibilidade (NOVO!)
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

    // 3. Dropdown Simples
    const dropdownLinks = document.querySelectorAll('.main-nav .has-dropdown > a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const parentLi = this.parentElement;
            dropdownLinks.forEach(otherLink => {
                if (otherLink !== this) otherLink.parentElement.classList.remove('show-dropdown');
            });
            parentLi.classList.toggle('show-dropdown');
        });
    });

    // 4. Busca
    const searchButton = document.querySelector('.search-bar button');
    const searchInput = document.querySelector('.search-bar input');
    if (searchButton && searchInput) {
        const performSearch = () => {
            if (searchInput.value.trim()) window.location.href = `busca.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        };
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); }});
    }
    // --- D. MENU MOBILE (HAMBÚRGUER) ---
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    const navElement = document.querySelector('.main-nav');

    if (mobileBtn && navElement) {
        mobileBtn.addEventListener('click', function() {
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
document.addEventListener('DOMContentLoaded', async () => { // Note o 'async' aqui
    
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

    // --- Daqui para baixo, o resto do seu código continua igual ---

    // API ACERVO
    const acervoContainer = document.getElementById('acervo-container');
    if (acervoContainer) {
        // ... (mantenha seu código de carregarAcervo aqui) ...
        const apiUrl = 'https://URL_REAL_DO_ATOM_DO_MUSEU/api/information-objects'; 
        const apiKey = 'SUA_CHAVE_DE_API_SECRETA_VAI_AQUI'; 

        async function carregarAcervo() {
            try {
                const response = await fetch('mock-api.json'); // Usando mock por enquanto
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

    // NOTÍCIAS
    if (document.querySelector('.latest-news-wrapper')) {
        fetch('noticias.json?v=' + Date.now())
            .then(res => res.json())
            .then(noticia => {
                const container = document.querySelector('.latest-news-container');
                if (noticia && noticia.titulo) {
                    container.innerHTML = `
                        <img src="${noticia.imagem_url}" alt="${noticia.titulo}" class="news-image">
                        <div class="news-content">
                            <h2>${noticia.titulo}</h2>
                            <p>${noticia.resumo || ''}</p>
                            <a href="${noticia.link}" target="_blank" class="cta-button">Leia a Matéria Completa</a>
                        </div>`;
                    document.querySelector('.latest-news-wrapper').style.display = 'block';
                }
            })
            .catch(err => document.querySelector('.latest-news-wrapper').style.display = 'none');
    }

    // SIDEBAR SMOOTH SCROLL
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])'); 
    internalLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault();
                    const headerOffset = document.querySelector('.sticky-header') ? 80 : 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                    if(this.closest('.has-dropdown')) this.closest('.has-dropdown').classList.remove('show-dropdown');
                }
            } catch(e) {}
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

    // ==========================================================
    // ACESSIBILIDADE (ALTO CONTRASTE E FONTE)
    // ==========================================================
    
    const body = document.body;
    const btnContrast = document.getElementById('btn-contrast');
    const btnIncrease = document.getElementById('btn-increase');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnOriginal = document.getElementById('btn-original');

    // --- 1. ALTO CONTRASTE ---
    
    // Verifica se o usuário já tinha ativado antes (salvo no navegador)
    if (localStorage.getItem('highContrast') === 'true') {
        body.classList.add('high-contrast');
    }

    if (btnContrast) {
        btnContrast.addEventListener('click', () => {
            body.classList.toggle('high-contrast');
            
            // Salva a preferência
            if (body.classList.contains('high-contrast')) {
                localStorage.setItem('highContrast', 'true');
            } else {
                localStorage.removeItem('highContrast');
            }
        });
    }

    // --- 2. TAMANHO DA FONTE ---
    
    let currentFontSize = 100; // Porcentagem inicial

    // Verifica preferência salva
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
        document.documentElement.style.fontSize = currentFontSize + '%';
    }

    function updateFontSize(size) {
        document.documentElement.style.fontSize = size + '%';
        localStorage.setItem('fontSize', size);
    }

    if (btnIncrease) {
        btnIncrease.addEventListener('click', () => {
            if (currentFontSize < 150) { // Limite máximo
                currentFontSize += 10;
                updateFontSize(currentFontSize);
            }
        });
    }

    if (btnDecrease) {
        btnDecrease.addEventListener('click', () => {
            if (currentFontSize > 70) { // Limite mínimo
                currentFontSize -= 10;
                updateFontSize(currentFontSize);
            }
        });
    }

    if (btnOriginal) {
        btnOriginal.addEventListener('click', () => {
            currentFontSize = 100; // Volta ao padrão (100% ou 16px)
            updateFontSize(currentFontSize);
            localStorage.removeItem('fontSize');
        });
    }

   

});