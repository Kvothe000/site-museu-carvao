// Espera que todo o conteúdo da página (DOM) seja carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // Só executa o código da API se o container do acervo existir na página atual.
    const acervoContainer = document.getElementById('acervo-container');
    if (acervoContainer) {
        // --- CONFIGURAÇÃO DA API ---
        const apiUrl = 'https://URL_REAL_DO_ATOM_DO_MUSEU/api/information-objects'; // Substitua
        const apiKey = 'SUA_CHAVE_DE_API_SECRETA_VAI_AQUI'; // Substitua

        // --- FUNÇÃO PARA BUSCAR E EXIBIR OS DADOS ---
        async function carregarAcervo() {
            try {
                const response = await fetch(apiUrl, { method: 'GET', headers: { 'REST-API-Key': apiKey }});
                if (!response.ok) { throw new Error(`Erro na rede: ${response.statusText}`); }
                const documentos = await response.json();
                acervoContainer.innerHTML = '';
                acervoContainer.classList.remove('loading');
                documentos.forEach(doc => {
                    const card = document.createElement('a');
                    card.className = 'fundo-card';
                    card.href = `https://URL_REAL_DO_ATOM_DO_MUSEU/${doc.slug}`;
                    card.target = '_blank';
                    const imageUrl = doc.thumbnail_url || 'https://via.placeholder.com/300x200.png?text=Documento';
                    card.innerHTML = `<figure><img src="${imageUrl}" alt="${doc.title}"><figcaption>${doc.title}</figcaption></figure>`;
                    acervoContainer.appendChild(card);
                });
            } catch (error) { console.error('Falha ao carregar o acervo:', error); acervoContainer.innerHTML = '<p>Ocorreu um erro ao carregar os documentos.</p>';}
        }
        carregarAcervo();
    }

    // Ativa o carrossel da home se ele existir na página
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel) {
        new Splide('#home-carousel', {
            type: 'loop', perPage: 3, perMove: 1, gap : '2rem', autoplay: true, interval: 4000, pauseOnHover: true,
            breakpoints: { 992: { perPage: 2 }, 768: { perPage: 1 } }
        }).mount();
    }

    // Carrega e exibe a notícia mais recente
    async function carregarNoticia() {
        const container = document.querySelector('.latest-news-container');
        if (!container) return; 
        try {
            const response = await fetch('noticias.json?v=' + new Date().getTime()); 
            const noticia = await response.json();
            container.innerHTML = `<img src="${noticia.imagem_url}" alt="Imagem da notícia: ${noticia.titulo}" class="news-image"><div class="news-content"><h2>${noticia.titulo}</h2><p>${noticia.resumo || ''}</p><a href="${noticia.link}" target="_blank" class="cta-button">Leia a Matéria Completa</a></div>`;
        } catch (error) { console.error('Erro ao carregar a notícia:', error); container.style.display = 'none'; }
    }
    if (document.querySelector('.latest-news-wrapper')) { carregarNoticia(); }


    // --- FUNCIONALIDADE DO CABEÇALHO FIXO (STICKY HEADER) ---
    const header = document.querySelector('header');
    if (header) { 
        const headerHeight = header.offsetHeight;
        const body = document.body;
        function handleScroll() {
            if (window.scrollY > headerHeight) { header.classList.add('sticky-header'); body.classList.add('body-padding-for-sticky'); } 
            else { header.classList.remove('sticky-header'); body.classList.remove('body-padding-for-sticky'); }
        }
        window.addEventListener('scroll', handleScroll);
    } else { console.error("Elemento <header> não encontrado na página."); }


    // --- FUNCIONALIDADE DO MENU DROPDOWN (VERSÃO FINAL: CLIQUE APENAS ABRE/FECHA) ---
    const dropdownLinks = document.querySelectorAll('.main-nav .has-dropdown > a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // 1. Impede a navegação do link principal!
            event.preventDefault(); 
            
            const parentLi = this.parentElement;

            // Fecha outros menus abertos
            dropdownLinks.forEach(otherLink => {
                if (otherLink !== this) {
                    otherLink.parentElement.classList.remove('show-dropdown');
                }
            });

            // Alterna (abre/fecha) APENAS o menu clicado
            parentLi.classList.toggle('show-dropdown');

            // NENHUMA navegação acontece aqui. Apenas controle do menu.
        });
    });

    // Fecha todos os menus se o usuário clicar fora
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.has-dropdown')) {
            document.querySelectorAll('.main-nav .has-dropdown').forEach(item => {
                item.classList.remove('show-dropdown');
            });
        }
    });

    // No seu js/script.js, dentro do DOMContentLoaded

    // --- INTERATIVIDADE DA SIDEBAR (SCROLLSPY + SMOOTH SCROLL) ---
    // Só executa se estivermos em uma página com a sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]'); 
    const contentSections = document.querySelectorAll('.history-content article[id]');

    if (sidebarLinks.length > 0 && contentSections.length > 0) {
        
        // 1. SMOOTH SCROLL ao clicar nos links da sidebar
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Impede o pulo instantâneo
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Calcula a posição do elemento de destino, descontando a altura do header fixo (se existir)
                    let headerOffset = 0;
                    const stickyHeader = document.querySelector('.sticky-header');
                    if (stickyHeader) {
                        headerOffset = stickyHeader.offsetHeight + 20; // +20px de margem
                    }
                    
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                    // Anima a rolagem suavemente
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Opcional: Atualiza a classe ativa imediatamente no clique
                    sidebarLinks.forEach(lnk => lnk.classList.remove('active-sidebar-link'));
                    this.classList.add('active-sidebar-link');
                }
            });
        });

        // 2. SCROLLSPY - Destaca o link ativo na sidebar conforme rola
        function activateSidebarLink() {
            let currentSectionId = '';
            let headerHeightOffset = document.querySelector('.sticky-header')?.offsetHeight || document.querySelector('header')?.offsetHeight || 0;
            headerHeightOffset += 40; // Adiciona uma margem extra

            contentSections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeightOffset; 
                // Verifica se a seção está visível na parte superior da janela
                if (window.scrollY >= sectionTop) { 
                    currentSectionId = '#' + section.getAttribute('id');
                }
            });

            // Remove a classe ativa de todos e adiciona ao link correspondente
            sidebarLinks.forEach(link => {
                link.classList.remove('active-sidebar-link');
                if (link.getAttribute('href') === currentSectionId) {
                    link.classList.add('active-sidebar-link');
                }
            });
        }

        // Adiciona o "ouvinte" de rolagem para ativar o Scrollspy
        window.addEventListener('scroll', activateSidebarLink);
        // Chama a função uma vez no carregamento para destacar o link inicial (se houver)
        activateSidebarLink(); 
    }

    // --- (Seu código do dropdown vem aqui embaixo) ---

}); // Fim do DOMContentLoaded
