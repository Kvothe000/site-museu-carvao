
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const resultsContainer = document.querySelector('.search-results-content');

    if (!query) {
        resultsContainer.innerHTML = '<p>Por favor, digite um termo para buscar.</p>';
        return;
    }

    // Mostra indicador de carregamento
    resultsContainer.innerHTML = `
        <div class="search-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Buscando por "<strong>${decodeURIComponent(query)}</strong>"...
        </div>
    `;

    const searchTerm = query.toLowerCase();
    const results = [];

    // --- 1. Definição das Páginas Estáticas do Site ---
    const pagesToCrawl = [
        { url: 'index.html', title: 'Página Inicial', type: 'Página' },
        { url: 'nossa-historia.html', title: 'Nossa História', type: 'Página' },
        { url: 'nossos-fundos.html', title: 'Nosso Acervo', type: 'Página' },
        { url: 'arquivo-digital.html', title: 'Arquivo Digital', type: 'Página' },
        { url: 'projetos.html', title: 'Projetos', type: 'Página' },
        { url: 'publicacoes.html', title: 'Publicações', type: 'Página' },
        { url: 'servicos.html', title: 'Serviços', type: 'Página' },
        { url: 'localizacao-contato.html', title: 'Contato e Localização', type: 'Página' }
    ];

    try {
        // --- 2. Busca em Arquivos HTML ---
        const pagePromises = pagesToCrawl.map(async (page) => {
            try {
                const response = await fetch(page.url);
                if (!response.ok) return null;
                const text = await response.text();

                // Parser para transformar texto em HTML navegável
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');

                // Remove scripts e estilos para não poluir a busca
                doc.querySelectorAll('script, style, header, footer, nav').forEach(el => el.remove());

                const bodyText = doc.body.textContent || "";

                if (bodyText.toLowerCase().includes(searchTerm)) {
                    // Tenta extrair um trecho relevante (snippet)
                    const index = bodyText.toLowerCase().indexOf(searchTerm);
                    const start = Math.max(0, index - 50);
                    const end = Math.min(bodyText.length, index + 150);
                    let snippet = bodyText.substring(start, end).replace(/\s+/g, ' ').trim();

                    return {
                        title: page.title,
                        url: page.url,
                        snippet: `...${snippet}...`,
                        type: page.type
                    };
                }
            } catch (e) {
                console.warn(`Erro ao ler ${page.url}`, e);
            }
            return null;
        });

        // --- 3. Busca em Notícias (JSON) ---
        const newsPromise = fetch('noticias.json').then(res => res.json()).then(news => {
            if (news && news.titulo && news.titulo.toLowerCase().includes(searchTerm)) {
                return {
                    title: news.titulo,
                    url: news.link,
                    snippet: news.resumo || 'Notícia recente do museu.',
                    type: 'Notícia'
                };
            }
            return null;
        }).catch(() => null);

        // --- 4. Busca no Acervo (Mock API JSON) ---
        const collectionPromise = fetch('mock-api.json').then(res => res.json()).then(data => {
            const items = data.results || data;
            const matches = [];
            items.forEach(item => {
                if ((item.title && item.title.toLowerCase().includes(searchTerm)) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm))) {
                    matches.push({
                        title: item.title,
                        url: item.slug || '#', // Idealmente linkaria para a página do item
                        snippet: item.description || 'Item do acervo histórico.',
                        type: 'Acervo'
                    });
                }
            });
            return matches;
        }).catch(() => []);


        // Executa todas as buscas em paralelo
        const [pageResults, newsResult, collectionResults] = await Promise.all([
            Promise.all(pagePromises),
            newsPromise,
            collectionPromise
        ]);

        // Compila resultados
        if (newsResult) results.push(newsResult);
        results.push(...collectionResults);
        results.push(...pageResults.filter(r => r !== null));

        // --- 5. Renderiza Resultados ---
        if (results.length > 0) {
            resultsContainer.innerHTML = `
                <div class="search-summary">
                    Encontramos <strong>${results.length}</strong> resultado(s) para "<em>${decodeURIComponent(query)}</em>".
                </div>
                <ul class="search-results-list">
                    ${results.map(item => `
                        <li>
                            <a href="${item.url}" class="result-card">
                                <span class="result-type tag-${item.type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}">${item.type}</span>
                                <h3>${item.title}</h3>
                                <p>${item.snippet}</p>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
        } else {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fa-regular fa-face-sad-tear"></i>
                    <p>Nenhum resultado encontrado para "<strong>${decodeURIComponent(query)}</strong>".</p>
                    <p>Tente buscar por "história", "minas", "fotos" ou "visitocão".</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro fatal na busca:', error);
        resultsContainer.innerHTML = '<p>Ocorreu um erro ao processar sua busca. Tente novamente.</p>';
    }
});
