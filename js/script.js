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
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    
    // Verifica preferência de contraste salva JÁ NO INÍCIO para evitar "piscar"
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }

    loadComponent('main-header', 'header.html');
    loadComponent('main-footer', 'footer.html');

    // ==========================================================
    // LÓGICA ESPECÍFICA DAS PÁGINAS (Não depende do Header)
    // ==========================================================

    // --- API DO ACERVO (Para arquivo-digital.html) ---
    const acervoContainer = document.getElementById('acervo-container');
    if (acervoContainer) {
        const apiUrl = 'https://URL_REAL_DO_ATOM_DO_MUSEU/api/information-objects'; 
        const apiKey = 'SUA_CHAVE_DE_API_SECRETA_VAI_AQUI'; 

        async function carregarAcervo() {
            try {
                // ATENÇÃO: Para testar sem API real, use o arquivo mock:
                // const response = await fetch('mock-api.json'); 
                const response = await fetch(apiUrl, { method: 'GET', headers: { 'REST-API-Key': apiKey }});
                
                if (!response.ok) { throw new Error(`Erro na rede: ${response.statusText}`); }
                const documentos = await response.json();
                
                // Limpa loading
                const spinner = acervoContainer.querySelector('.spinner');
                const loadingText = acervoContainer.querySelector('p');
                if(spinner) spinner.remove();
                if(loadingText) loadingText.remove();
                acervoContainer.classList.remove('loading');
                acervoContainer.style.display = 'grid'; 

                // Adaptação para estrutura da API (se for { results: [...] })
                const listaDocs = documentos.results ? documentos.results : documentos;

                listaDocs.forEach(doc => {
                    const card = document.createElement('a');
                    card.className = 'fundo-card';
                    card.href = doc.slug ? `https://URL_REAL_DO_ATOM_DO_MUSEU/${doc.slug}` : '#'; 
                    card.target = '_blank';
                    const imageUrl = doc.thumbnail_url || 'https://via.placeholder.com/300x200.png?text=Documento';
                    card.innerHTML = `<figure><img src="${imageUrl}" alt="${doc.title}"><figcaption>${doc.title}</figcaption></figure>`;
                    acervoContainer.appendChild(card);
                });
            } catch (error) { 
                console.error('Falha ao carregar o acervo:', error); 
                acervoContainer.innerHTML = '<p>Ocorreu um erro ao carregar os documentos do acervo.</p>';
                acervoContainer.classList.remove('loading');
                acervoContainer.style.display = 'block';
            }
        }
        carregarAcervo();
    }

    // --- CARROSSEL DA HOME ---
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel && typeof Splide !== 'undefined') {
        new Splide('#home-carousel', {
            type: 'loop', perPage: 1, perMove: 1, gap: '0', autoplay: true, interval: 4000, pauseOnHover: true
        }).mount();
    }

    // --- NOTÍCIAS (home) ---
    if (document.querySelector('.latest-news-wrapper')) { 
        async function carregarNoticia() {
            const container = document.querySelector('.latest-news-container');
            if (!container) return; 
            try {
                const response = await fetch('noticias.json?v=' + Date.now()); 
                const noticia = await response.json();
                if (noticia && noticia.titulo) {
                    container.innerHTML = `<img src="${noticia.imagem_url || 'img/projeto-enchente.jpg'}" alt="${noticia.titulo}" class="news-image"><div class="news-content"><h2>${noticia.titulo}</h2><p>${noticia.resumo || ''}</p><a href="${noticia.link}" target="_blank" class="cta-button">Leia a Matéria Completa</a></div>`;
                    document.querySelector('.latest-news-wrapper').style.display = 'block'; 
                } else {
                    document.querySelector('.latest-news-wrapper').style.display = 'none'; 
                }
            } catch (error) { 
                console.error('Erro notícia:', error); 
                document.querySelector('.latest-news-wrapper').style.display = 'none'; 
            }
        }
        carregarNoticia(); 
    }

    // --- SIDEBAR E SMOOTH SCROLL (Links internos) ---
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])'); 
    internalLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            try {
                 const targetElement = document.querySelector(targetId);
                 if (targetElement) {
                     event.preventDefault(); 
                     // Recalcula o offset do header (fixo ou não)
                     let headerOffset = 0;
                     const stickyHeader = document.querySelector('.sticky-header');
                     if (stickyHeader) headerOffset = stickyHeader.offsetHeight + 20; 
                     else {
                         const mainHeader = document.querySelector('header');
                         if(mainHeader) headerOffset = mainHeader.offsetHeight + 20;
                     }
                     
                     const elementPosition = targetElement.getBoundingClientRect().top;
                     const targetScrollPosition = window.scrollY + elementPosition - headerOffset; 
                     
                     // Animação de scroll manual
                     const startPosition = window.scrollY;
                     const distance = targetScrollPosition - startPosition;
                     const duration = 800;
                     let startTime = null;
             
                     function animationStep(currentTime) {
                         if (startTime === null) startTime = currentTime;
                         const timeElapsed = currentTime - startTime;
                         const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                         const run = ease(Math.min(1, timeElapsed / duration));
                         window.scrollTo(0, startPosition + distance * run);
                         if (timeElapsed < duration) requestAnimationFrame(animationStep);
                     }
                     requestAnimationFrame(animationStep);

                     // Atualiza sidebar
                     if (this.closest('.sidebar-nav')) {
                          document.querySelectorAll('.sidebar-nav a').forEach(lnk => lnk.classList.remove('active-sidebar-link'));
                          this.classList.add('active-sidebar-link');
                     }
                 }
            } catch (e) {}
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

    // --- SISTEMA DE TRADUÇÃO ---

// Carrega o arquivo de traduções (se não estiver importado no HTML)
// O ideal é adicionar <script src="js/translations.js"></script> no HTML antes do script.js

let currentLang = localStorage.getItem('language') || 'pt';

function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang); // Salva a preferência

    // Seleciona todos os elementos com data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        // Verifica se a tradução existe
        if (translations[lang] && translations[lang][key]) {
            // Se for um input (como a busca), muda o placeholder
            if (element.tagName === 'INPUT') {
                element.placeholder = translations[lang][key];
            } else {
                // Se tiver ícone (como no menu), preserva o ícone e muda só o texto
                if (element.children.length > 0) {
                     // Lógica mais complexa para não apagar ícones, 
                     // ou simplificamos colocando o texto em um <span>
                     // Por enquanto, vamos assumir substituição direta de texto simples
                     // Para menus com ícones, o ideal é envolver o texto em <span data-i18n="...">Texto</span>
                     element.innerHTML = translations[lang][key]; 
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        }
    });

    // Atualiza o visual dos botões de idioma
    updateLanguageButtons();
}

function initLanguageSelector() {
    const langButtons = document.querySelectorAll('.language-selector a');
    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = e.target.dataset.lang; // Precisa adicionar data-lang="en" no HTML
            updateLanguage(selectedLang);
        });
    });
    
    // Aplica a linguagem salva ao carregar
    updateLanguage(currentLang);
}

});