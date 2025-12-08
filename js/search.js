
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const resultsContainer = document.querySelector('.search-results-content');

    // Helper para obter tradução
    const getLanguage = () => localStorage.getItem('language') || 'pt';
    const getTranslation = (key) => {
        const lang = getLanguage();
        // Fallback to 'pt' if key or lang missing
        if (translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }
        if (translations['pt'] && translations['pt'][key]) {
            return translations['pt'][key];
        }
        return key; // Retorna a chave se não encontrar
    };

    if (!query) {
        resultsContainer.innerHTML = `<p>${getTranslation('search_empty_query')}</p>`;
        return;
    }

    // Mostra indicador de carregamento
    resultsContainer.innerHTML = `
        <div class="search-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> ${getTranslation('search_searching')} "<strong>${decodeURIComponent(query)}</strong>"...
        </div>
    `;

    const searchTerm = query.toLowerCase();
    const results = [];

    // --- 1. Definição das Páginas Estáticas do Site ---
    // Mapeamento de URL para chave de tradução do título
    const pagesToCrawl = [
        { url: 'index.html', titleKey: 'nav_home', typeKey: 'search_type_page' },
        { url: 'nossa-historia.html', titleKey: 'nav_history', typeKey: 'search_type_page' },
        { url: 'nossos-fundos.html', titleKey: 'nav_collection', typeKey: 'search_type_page' },
        { url: 'arquivo-digital.html', titleKey: 'nav_digital_archive', typeKey: 'search_type_page' },
        { url: 'projetos.html', titleKey: 'nav_projects', typeKey: 'search_type_page' },
        { url: 'publicacoes.html', titleKey: 'nav_publications', typeKey: 'search_type_page' },
        { url: 'servicos.html', titleKey: 'nav_services', typeKey: 'search_type_page' },
        { url: 'localizacao-contato.html', titleKey: 'nav_contact', typeKey: 'search_type_page' }
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
                        title: getTranslation(page.titleKey),
                        url: page.url,
                        snippet: `...${snippet}...`,
                        type: getTranslation(page.typeKey)
                    };
                }
            } catch (e) {
                console.warn(`Erro ao ler ${page.url}`, e);
            }
            return null;
        });

        // --- 3. Busca em Notícias (JSON) ---
        // Notícias usam títulos fixos do JSON (que podem estar em PT), idealmente o JSON teria campos multilíngues, 
        // mas por enquanto manteremos o original.
        const newsPromise = fetch('noticias.json').then(res => res.json()).then(news => {
            if (news && news.titulo && news.titulo.toLowerCase().includes(searchTerm)) {
                return {
                    title: news.titulo,
                    url: news.link,
                    snippet: news.resumo || 'Notícia recente do museu.',
                    type: getTranslation('search_type_news')
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
                        type: getTranslation('search_type_collection')
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
            const summaryText = getTranslation('search_summary').replace('{0}', results.length); // Simples replace

            resultsContainer.innerHTML = `
                <div class="search-summary">
                    ${summaryText} "<em>${decodeURIComponent(query)}</em>".
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
                    <p>${getTranslation('search_no_results')} "<strong>${decodeURIComponent(query)}</strong>".</p>
                    <p>${getTranslation('search_try_terms')}</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro fatal na busca:', error);
        resultsContainer.innerHTML = `<p>${getTranslation('search_error')}</p>`;
    }
});
