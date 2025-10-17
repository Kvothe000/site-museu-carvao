// Espera que todo o conteúdo da página (DOM) seja carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // Só executa o código da API se o container do acervo existir na página atual.
    const acervoContainer = document.getElementById('acervo-container');
    if (acervoContainer) {
        // --- CONFIGURAÇÃO DA API ---
        const apiUrl = 'https://URL_REAL_DO_ATOM_DO_MUSEU/api/information-objects'; // Substitua pela URL correta
        const apiKey = 'SUA_CHAVE_DE_API_SECRETA_VAI_AQUI'; // Substitua pela sua chave

        // --- FUNÇÃO PARA BUSCAR E EXIBIR OS DADOS ---
        async function carregarAcervo() {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: { 'REST-API-Key': apiKey }
                });

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
            } catch (error) {
                console.error('Falha ao carregar o acervo:', error);
                acervoContainer.innerHTML = '<p>Ocorreu um erro ao carregar os documentos.</p>';
            }
        }
        carregarAcervo();
    }


    // --- FUNCIONALIDADE DO MENU DROPDOWN (VERSÃO SIMPLES E ROBUSTA) ---

// Seleciona os links que acionam os menus
const dropdownLinks = document.querySelectorAll('.main-nav .has-dropdown > a');

// Para cada um, adiciona o "ouvinte" de clique
dropdownLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Impede a navegação
        
        const parentLi = this.parentElement;

        // Fecha outros menus que possam estar abertos
        dropdownLinks.forEach(otherLink => {
            if (otherLink !== this) {
                otherLink.parentElement.classList.remove('show-dropdown');
            }
        });

        // Alterna (abre/fecha) o menu que foi clicado
        parentLi.classList.toggle('show-dropdown');
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

// Ativa o carrossel da home se ele existir na página
const homeCarousel = document.getElementById('home-carousel');
if (homeCarousel) {
    new Splide('#home-carousel', {
        type       : 'loop',     // Faz o carrossel ser infinito
        perPage    : 3,          // 3 slides visíveis em telas grandes
        perMove    : 1,
        gap        : '2rem',     // Espaço entre os slides
        autoplay   : true,       // Inicia automaticamente
        interval   : 4000,       // Muda a cada 4 segundos
        pauseOnHover: true,
        breakpoints: {
            992: {
                perPage: 2, // 2 slides em tablets
            },
            768: {
                perPage: 1, // 1 slide em celulares
            },
        },
    }).mount();
}

// No seu js/script.js, dentro do DOMContentLoaded

// Carrega e exibe a notícia mais recente
async function carregarNoticia() {
   const container = document.querySelector('.latest-news-container');
   if (!container) return; // Só roda se o container existir

   try {
       const response = await fetch('noticias.json?v=' + new Date().getTime()); // O '?v=' evita cache
       const noticia = await response.json();

       container.innerHTML = `
           <img src="${noticia.imagem_url}" alt="Imagem da notícia: ${noticia.titulo}" class="news-image">
           <div class="news-content">
               <h2>${noticia.titulo}</h2>
               <p>${noticia.resumo}</p>
               <a href="${noticia.link}" target="_blank" class="cta-button">Leia a Matéria Completa</a>
           </div>
       `;
   } catch (error) {
       console.error('Erro ao carregar a notícia:', error);
       container.style.display = 'none'; // Esconde a seção se houver erro
   }
}
carregarNoticia();

});