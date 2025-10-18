// Espera que todo o conteúdo da página (DOM) seja carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // CARREGAMENTO DA API DO ACERVO (Ex: arquivo-digital.html)
    // ==========================================================
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
                
                // Limpa o estado de loading (spinner e texto)
                const spinner = acervoContainer.querySelector('.spinner');
                const loadingText = acervoContainer.querySelector('p');
                if(spinner) spinner.remove();
                if(loadingText) loadingText.remove();
                acervoContainer.classList.remove('loading');

                // Garante que o container use o grid correto após carregar
                acervoContainer.style.display = 'grid'; 

                documentos.forEach(doc => {
                    const card = document.createElement('a');
                    card.className = 'fundo-card'; // Usa a classe do CSS para cards de imagem
                    card.href = `https://URL_REAL_DO_ATOM_DO_MUSEU/${doc.slug}`;
                    card.target = '_blank';
                    const imageUrl = doc.thumbnail_url || 'https://via.placeholder.com/300x200.png?text=Documento';
                    card.innerHTML = `<figure><img src="${imageUrl}" alt="${doc.title}"><figcaption>${doc.title}</figcaption></figure>`;
                    acervoContainer.appendChild(card);
                });
            } catch (error) { 
                console.error('Falha ao carregar o acervo:', error); 
                acervoContainer.innerHTML = '<p>Ocorreu um erro ao carregar os documentos do acervo.</p>';
                acervoContainer.classList.remove('loading');
                acervoContainer.style.display = 'block'; // Garante que a mensagem de erro seja visível
            }
        }
        carregarAcervo();
    }

    // ==========================================================
    // CARROSSEL DA HOMEPAGE (index.html)
    // ==========================================================
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel && typeof Splide !== 'undefined') { // Verifica se Splide está carregado
        new Splide('#home-carousel', {
            type       : 'loop', 
            perPage    : 3, 
            perMove    : 1, 
            gap        : '2rem', 
            autoplay   : true, 
            interval   : 4000, 
            pauseOnHover: true,
            breakpoints: { 
                992: { perPage: 2 }, 
                768: { perPage: 1 } 
            }
        }).mount();
    }

    // ==========================================================
    // CARREGAMENTO DE NOTÍCIAS (index.html)
    // ==========================================================
    async function carregarNoticia() {
        const container = document.querySelector('.latest-news-container');
        if (!container) return; 
        try {
            // Adiciona um parâmetro anti-cache para garantir que o JSON mais recente seja lido
            const response = await fetch('noticias.json?v=' + Date.now()); 
            const noticia = await response.json();
            
            // Só exibe a seção se houver um título válido
            if (noticia && noticia.titulo && noticia.titulo !== "Nenhuma notícia recente encontrada") {
                container.innerHTML = `
                    <img src="${noticia.imagem_url || 'img/projeto-enchente.jpg'}" alt="Imagem da notícia: ${noticia.titulo}" class="news-image">
                    <div class="news-content">
                        <h2>${noticia.titulo}</h2>
                        ${noticia.resumo ? `<p>${noticia.resumo}</p>` : ''} 
                        <a href="${noticia.link}" target="_blank" class="cta-button">Leia a Matéria Completa</a>
                    </div>
                `;
                // Garante que o wrapper da seção esteja visível
                const wrapper = document.querySelector('.latest-news-wrapper');
                if(wrapper) wrapper.style.display = 'block'; 
            } else {
                 // Esconde a seção inteira se não houver notícia válida
                 const wrapper = document.querySelector('.latest-news-wrapper');
                 if(wrapper) wrapper.style.display = 'none'; 
            }
        } catch (error) { 
            console.error('Erro ao carregar ou processar a notícia:', error); 
            // Esconde a seção inteira se houver erro
            const wrapper = document.querySelector('.latest-news-wrapper');
            if(wrapper) wrapper.style.display = 'none'; 
        }
    }
    // Verifica se o wrapper da seção existe antes de chamar a função
    if (document.querySelector('.latest-news-wrapper')) { 
        carregarNoticia(); 
    }

    // ==========================================================
    // FUNCIONALIDADE DO CABEÇALHO FIXO (STICKY HEADER)
    // ==========================================================
    const header = document.querySelector('header');
    if (header) { 
        const headerHeight = header.offsetHeight;
        const body = document.body;
        function handleScroll() {
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
        }
        window.addEventListener('scroll', handleScroll, { passive: true }); // Otimização de performance
        handleScroll(); // Verifica no carregamento inicial
    } else { 
        console.error("Elemento <header> não encontrado na página."); 
    }

    // ==========================================================
    // SMOOTH SCROLL PARA LINKS INTERNOS E INTERATIVIDADE DA SIDEBAR
    // ==========================================================
    
    // Função de Animação de Rolagem Suave Personalizada
    function customSmoothScroll(targetPosition, duration) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animationStep(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const run = easeInOutQuad(Math.min(1, timeElapsed / duration));
            const nextScrollPosition = startPosition + distance * run;
            window.scrollTo(0, nextScrollPosition);
            if (timeElapsed < duration) { requestAnimationFrame(animationStep); }
        }
        requestAnimationFrame(animationStep);
    }

    // Seleciona TODOS os links que apontam para âncoras internas (#) na página
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])'); 
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            try {
                 const targetElement = document.querySelector(targetId);
                 
                 // Verifica se o elemento de destino REALMENTE existe na página atual
                 if (targetElement) {
                     event.preventDefault(); // Impede o pulo instantâneo SOMENTE se for um link interno válido

                     let headerOffset = 0;
                     const stickyHeader = document.querySelector('.sticky-header');
                     if (stickyHeader) {
                         headerOffset = stickyHeader.offsetHeight + 20; 
                     } else {
                         const mainHeader = document.querySelector('header');
                         if(mainHeader) headerOffset = mainHeader.offsetHeight + 20;
                     }
                     
                     const elementPosition = targetElement.getBoundingClientRect().top;
                     const targetScrollPosition = window.scrollY + elementPosition - headerOffset; 
                 
                     const scrollDuration = 800; // Duração da animação
                     customSmoothScroll(targetScrollPosition, scrollDuration);

                     // FECHA O DROPDOWN após clicar em um item interno
                     const parentDropdown = this.closest('.has-dropdown');
                     if (parentDropdown) {
                         setTimeout(() => {
                             parentDropdown.classList.remove('show-dropdown');
                             const mainLink = parentDropdown.querySelector('a');
                             // Futuramente, reativar ARIA aqui
                             // if (mainLink) mainLink.setAttribute('aria-expanded', 'false');
                         }, 100); 
                     }

                     // ATUALIZA O FOCO NA SIDEBAR
                     if (this.closest('.sidebar-nav')) {
                          const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
                          sidebarLinks.forEach(lnk => lnk.classList.remove('active-sidebar-link'));
                          this.classList.add('active-sidebar-link');
                     }
                 }
            } catch (e) {
                console.warn(`Erro ao tentar rolar para ${targetId}: ${e}`);
                // Permite que o link funcione normalmente se o seletor for inválido
            }
        });
    });

    // --- SCROLLSPY (APENAS PARA A SIDEBAR) ---
    const sidebarScrollLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]'); 
    const scrollSpySections = document.querySelectorAll('.main-content article[id]'); 

    if (sidebarScrollLinks.length > 0 && scrollSpySections.length > 0) {
        function activateSidebarLink() {
            let currentSectionId = '';
            let headerHeightOffset = document.querySelector('.sticky-header')?.offsetHeight || document.querySelector('header')?.offsetHeight || 0;
            headerHeightOffset += 40; 

            scrollSpySections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeightOffset; 
                if (window.scrollY >= sectionTop) { 
                    currentSectionId = '#' + section.getAttribute('id');
                }
            });

            sidebarScrollLinks.forEach(link => {
                link.classList.remove('active-sidebar-link');
                if (currentSectionId && link.getAttribute('href') === currentSectionId) {
                    link.classList.add('active-sidebar-link');
                }
            });
             if (window.scrollY < scrollSpySections[0].offsetTop - headerHeightOffset) {
                 sidebarScrollLinks.forEach(link => link.classList.remove('active-sidebar-link'));
             }
        }
        window.addEventListener('scroll', activateSidebarLink, { passive: true }); // Otimização
        activateSidebarLink(); 
    }

    // ==========================================================
    // FUNCIONALIDADE DO MENU DROPDOWN (VERSÃO FINAL: CLIQUE APENAS ABRE/FECHA)
    // ==========================================================
    const dropdownLinks = document.querySelectorAll('.main-nav .has-dropdown > a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Impede a navegação do link principal!
            event.preventDefault(); 
            
            const parentLi = this.parentElement;

            // Fecha outros menus abertos
            dropdownLinks.forEach(otherLink => {
                if (otherLink !== this) {
                    otherLink.parentElement.classList.remove('show-dropdown');
                    // Futuramente, reativar ARIA aqui
                    // otherLink.setAttribute('aria-expanded', 'false');
                }
            });

            // Alterna (abre/fecha) APENAS o menu clicado
            parentLi.classList.toggle('show-dropdown');
            
            // Futuramente, reativar ARIA aqui
            // const isOpened = parentLi.classList.contains('show-dropdown');
            // this.setAttribute('aria-expanded', isOpened);

        });
    });

    // Fecha todos os menus se o usuário clicar fora
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.has-dropdown')) {
            document.querySelectorAll('.main-nav .has-dropdown').forEach(item => {
                item.classList.remove('show-dropdown');
                // Futuramente, reativar ARIA aqui
                // item.querySelector('a').setAttribute('aria-expanded', 'false');
            });
        }
    });

}); // --- FIM DO DOMContentLoaded ---