
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const resultsContainer = document.querySelector('.search-results-content');

    // Helper para obter tradução
    const getLanguage = () => localStorage.getItem('language') || 'pt';
    const getTranslation = (key) => {
        const lang = getLanguage();
        if (translations[lang] && translations[lang][key]) return translations[lang][key];
        if (translations['pt'] && translations['pt'][key]) return translations['pt'][key];
        return key;
    };

    // Helper seguro: cria elemento com textContent (previne XSS)
    function createSafeTextNode(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        el.textContent = text;
        return el;
    }

    if (!query) {
        const p = document.createElement('p');
        p.textContent = getTranslation('search_empty_query');
        resultsContainer.appendChild(p);
        return;
    }

    // --- Mostra indicador de carregamento (sem dados do usuário no innerHTML) ---
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'search-loading';
    const spinner = document.createElement('i');
    spinner.className = 'fa-solid fa-spinner fa-spin';
    spinner.setAttribute('aria-hidden', 'true');
    const loadingText = document.createTextNode(
        ` ${getTranslation('search_searching')} "`
    );
    const boldQuery = document.createElement('strong');
    // textContent garante que o valor da URL não seja interpretado como HTML
    boldQuery.textContent = decodeURIComponent(query);
    const loadingTextEnd = document.createTextNode('"...');
    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(loadingText);
    loadingDiv.appendChild(boldQuery);
    loadingDiv.appendChild(loadingTextEnd);
    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(loadingDiv);

    const searchTerm = query.toLowerCase();
    const results = [];

    // --- 1. Definição das Páginas Estáticas do Site ---
    const pagesToCrawl = [
        { url: 'index.html', titleKey: 'nav_home', typeKey: 'search_type_page' },
        { url: 'nossa-historia.html', titleKey: 'nav_history', typeKey: 'search_type_page' },
        { url: 'nossos-fundos.html', titleKey: 'nav_collection', typeKey: 'search_type_page' },
        { url: 'arquivos-digitais.html', titleKey: 'nav_digital_archive', typeKey: 'search_type_page' },
        { url: 'projetos.html', titleKey: 'nav_projects', typeKey: 'search_type_page' },
        { url: 'publicacoes.html', titleKey: 'nav_publications', typeKey: 'search_type_page' },
        { url: 'servicos.html', titleKey: 'nav_services', typeKey: 'search_type_page' },
        { url: 'contato.html', titleKey: 'contact_scheduling_title', typeKey: 'search_type_page' }
    ];

    try {
        // --- 2. Busca em Arquivos HTML ---
        const pagePromises = pagesToCrawl.map(async (page) => {
            try {
                const response = await fetch(page.url);
                if (!response.ok) return null;
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                doc.querySelectorAll('script, style, header, footer, nav').forEach(el => el.remove());
                const bodyText = doc.body.textContent || '';
                if (bodyText.toLowerCase().includes(searchTerm)) {
                    const index = bodyText.toLowerCase().indexOf(searchTerm);
                    const start = Math.max(0, index - 50);
                    const end = Math.min(bodyText.length, index + 150);
                    const snippet = bodyText.substring(start, end).replace(/\s+/g, ' ').trim();
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
        const newsPromise = fetch('noticias.json')
            .then(res => res.json())
            .then(news => {
                if (news && news.titulo && news.titulo.toLowerCase().includes(searchTerm)) {
                    return {
                        title: news.titulo,
                        url: news.link,
                        snippet: news.resumo || 'Notícia recente do museu.',
                        type: getTranslation('search_type_news')
                    };
                }
                return null;
            })
            .catch(() => null);

        // --- 4. Busca no Acervo (Mock API JSON) ---
        const collectionPromise = fetch('mock-api.json')
            .then(res => res.json())
            .then(data => {
                const items = data.results || data;
                return items
                    .filter(item =>
                        (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                        (item.description && item.description.toLowerCase().includes(searchTerm))
                    )
                    .map(item => ({
                        title: item.title,
                        url: item.slug || '#',
                        snippet: item.description || 'Item do acervo histórico.',
                        type: getTranslation('search_type_collection')
                    }));
            })
            .catch(() => []);

        // Executa todas as buscas em paralelo
        const [pageResults, newsResult, collectionResults] = await Promise.all([
            Promise.all(pagePromises),
            newsPromise,
            collectionPromise
        ]);

        if (newsResult) results.push(newsResult);
        results.push(...collectionResults);
        results.push(...pageResults.filter(r => r !== null));

        // --- 5. Renderiza Resultados com DOM seguro ---
        resultsContainer.innerHTML = '';

        if (results.length > 0) {
            // Sumário — query exibida com textContent
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'search-summary';
            const summaryText = getTranslation('search_summary').replace('{0}', results.length);
            summaryDiv.appendChild(document.createTextNode(`${summaryText} "`));
            const em = document.createElement('em');
            em.textContent = decodeURIComponent(query); // seguro: textContent
            summaryDiv.appendChild(em);
            summaryDiv.appendChild(document.createTextNode('".'));
            resultsContainer.appendChild(summaryDiv);

            // Lista de resultados
            const ul = document.createElement('ul');
            ul.className = 'search-results-list';

            results.forEach(item => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                // Validar URL do resultado — aceita apenas caminhos relativos e URLs seguras
                const safeUrl = /^(https?:\/\/|[a-zA-Z0-9_\-./]+\.html)/.test(item.url)
                    ? item.url
                    : '#';
                a.href = safeUrl;
                a.className = 'result-card';

                const typeSlug = (item.type || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
                const typeSpan = document.createElement('span');
                typeSpan.className = `result-type tag-${typeSlug}`;
                typeSpan.textContent = item.type; // textContent — seguro

                const h3 = document.createElement('h3');
                h3.textContent = item.title; // textContent — seguro

                const p = document.createElement('p');
                p.textContent = item.snippet; // textContent — seguro (snippet vem de textContent das páginas)

                a.appendChild(typeSpan);
                a.appendChild(h3);
                a.appendChild(p);
                li.appendChild(a);
                ul.appendChild(li);
            });

            resultsContainer.appendChild(ul);

        } else {
            // Sem resultados — query exibida com textContent
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';

            const icon = document.createElement('i');
            icon.className = 'fa-regular fa-face-sad-tear';
            icon.setAttribute('aria-hidden', 'true');

            const p1 = document.createElement('p');
            p1.appendChild(document.createTextNode(`${getTranslation('search_no_results')} "`));
            const strong = document.createElement('strong');
            strong.textContent = decodeURIComponent(query); // textContent — seguro
            p1.appendChild(strong);
            p1.appendChild(document.createTextNode('".'));

            const p2 = document.createElement('p');
            p2.textContent = getTranslation('search_try_terms');

            noResultsDiv.appendChild(icon);
            noResultsDiv.appendChild(p1);
            noResultsDiv.appendChild(p2);
            resultsContainer.appendChild(noResultsDiv);
        }

    } catch (error) {
        console.error('Erro fatal na busca:', error);
        resultsContainer.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = getTranslation('search_error');
        resultsContainer.appendChild(p);
    }
});
