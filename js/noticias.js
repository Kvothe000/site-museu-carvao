// RASCUNHO: O conteúdo completo das notícias carregado via JSON é um rascunho sob revisão técnica pela equipe do museu.

document.addEventListener('DOMContentLoaded', () => {
    let noticiasData = [];
    let lastActiveElement = null;

    // Elementos do Modal Acessível criados programaticamente no DOM
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'news-modal';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'news-modal-title');
    modalOverlay.style.display = 'none';

    modalOverlay.innerHTML = `
        <div class="modal-container" role="document">
            <div class="modal-header">
                <h3 class="modal-title" id="news-modal-title"></h3>
                <button class="modal-close-btn" id="news-modal-close" aria-label="Fechar modal">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>
            <div class="modal-body">
                <picture id="news-modal-picture"></picture>
                <div class="modal-meta" style="margin-top: 1rem; display: flex; gap: 1rem; align-items: center;">
                    <span class="news-tag" id="news-modal-tag"></span>
                    <span class="news-date" id="news-modal-date"></span>
                </div>
                <div id="news-modal-content" style="margin-top: 1.5rem;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const modalTitle = document.getElementById('news-modal-title');
    const modalCloseBtn = document.getElementById('news-modal-close');
    const modalPicture = document.getElementById('news-modal-picture');
    const modalTag = document.getElementById('news-modal-tag');
    const modalDate = document.getElementById('news-modal-date');
    const modalContent = document.getElementById('news-modal-content');

    const localeMap = {
        'pt': 'pt-BR',
        'en': 'en-US',
        'es': 'es-ES'
    };

    const tagTranslations = {
        'pt': {
            'educacao': 'Educação',
            'acervo': 'Acervo',
            'comunidade': 'Comunidade',
            'pesquisa': 'Pesquisa'
        },
        'en': {
            'educacao': 'Education',
            'acervo': 'Collection',
            'comunidade': 'Community',
            'pesquisa': 'Research'
        },
        'es': {
            'educacao': 'Educación',
            'acervo': 'Colección',
            'comunidade': 'Comunidad',
            'pesquisa': 'Investigación'
        }
    };

    function getActiveLanguage() {
        return localStorage.getItem('language') || 'pt';
    }

    function formatNewsDate(dateStr, lang) {
        try {
            const date = new Date(dateStr + 'T00:00:00');
            const locale = localeMap[lang] || 'pt-BR';
            return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
        } catch (e) {
            return dateStr;
        }
    }

    function getTagTranslation(tag, lang) {
        // Tenta buscar do translations.js global caso esteja preenchido
        const globalKey = `news_tag_${tag}`;
        if (window.translations && window.translations[lang] && window.translations[lang][globalKey]) {
            return window.translations[lang][globalKey];
        }
        // Fallback local
        return (tagTranslations[lang] && tagTranslations[lang][tag]) || (tagTranslations['pt'][tag] || tag);
    }

    function renderNewsCards() {
        const carousel = document.getElementById('news-carousel');
        if (!carousel) return;

        const lang = getActiveLanguage();
        carousel.innerHTML = '';

        noticiasData.forEach(item => {
            const tagText = getTagTranslation(item.tag, lang);
            const dateText = formatNewsDate(item.data, lang);
            const title = item.titulo[lang] || item.titulo['pt'] || '';
            const summary = item.resumo[lang] || item.resumo['pt'] || '';
            const altText = item.alt[lang] || item.alt['pt'] || '';

            const card = document.createElement('a');
            card.href = '#';
            card.className = 'news-card';
            card.setAttribute('role', 'button');
            card.setAttribute('aria-haspopup', 'dialog');
            card.setAttribute('data-id', item.id);
            card.setAttribute('aria-label', `${title} - ${tagText} - ${dateText}`);

            card.innerHTML = `
                <div class="news-img-wrapper">
                    <picture>
                        <source srcset="${item.imagemWebp}" type="image/webp">
                        <img src="${item.imagem}" loading="lazy" alt="${altText}">
                    </picture>
                    <span class="news-tag ${item.tag}">${tagText}</span>
                </div>
                <div class="news-content">
                    <span class="news-date">${dateText}</span>
                    <h3>${title}</h3>
                    <p>${summary}</p>
                </div>
            `;

            card.addEventListener('click', (e) => {
                e.preventDefault();
                openNewsModal(item, card);
            });

            carousel.appendChild(card);
        });
    }

    function openNewsModal(item, triggerElement) {
        lastActiveElement = triggerElement;
        const lang = getActiveLanguage();

        modalTitle.textContent = item.titulo[lang] || item.titulo['pt'] || '';
        modalTag.className = `news-tag ${item.tag}`;
        modalTag.textContent = getTagTranslation(item.tag, lang);
        modalDate.textContent = formatNewsDate(item.data, lang);

        // Imagem grande na modal
        const altText = item.alt[lang] || item.alt['pt'] || '';
        modalPicture.innerHTML = `
            <source srcset="${item.imagemWebp}" type="image/webp">
            <img src="${item.imagem}" class="modal-featured-img" alt="${altText}" style="width: 100%; height: auto; max-height: 350px; object-fit: cover; border-radius: 8px;">
        `;

        // Parágrafos do conteúdo completo
        const paragraphs = item.conteudo[lang] || item.conteudo['pt'] || [];
        modalContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');

        // Exibe a modal
        modalOverlay.style.display = 'flex';
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede scroll ao fundo

        // Foco acessível no botão fechar da modal
        setTimeout(() => {
            modalCloseBtn.focus();
        }, 50);
    }

    function closeNewsModal() {
        modalOverlay.classList.remove('active');
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';

        // Restaura o foco para o elemento disparador
        if (lastActiveElement) {
            lastActiveElement.focus();
        }
    }

    // Eventos de fechamento da modal
    modalCloseBtn.addEventListener('click', closeNewsModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeNewsModal();
        }
    });

    // Fechar com a tecla Esc e gerenciar foco ciclado
    document.addEventListener('keydown', (e) => {
        if (modalOverlay.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeNewsModal();
            }
            // Trap Focus básico
            if (e.key === 'Tab') {
                const focusables = modalOverlay.querySelectorAll('button, [tabindex="0"]');
                const first = focusables[0];
                const last = focusables[focusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });

    // Buscar notícias do JSON
    fetch('data/noticias.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.noticias) {
                // Ordenar por data decrescente
                noticiasData = data.noticias.sort((a, b) => new Date(b.data) - new Date(a.data));
                renderNewsCards();
            }
        })
        .catch(err => {
            console.error('Erro ao carregar noticias.json:', err);
        });

    // Escuta evento customizado de mudança de idioma do translations.js / main.js
    document.addEventListener('languagechange', () => {
        renderNewsCards();
        // Se a modal estiver ativa, atualiza o idioma dela em tempo real
        if (modalOverlay.classList.contains('active')) {
            const activeId = lastActiveElement ? lastActiveElement.getAttribute('data-id') : null;
            if (activeId) {
                const item = noticiasData.find(n => n.id === activeId);
                if (item) {
                    openNewsModal(item, lastActiveElement);
                }
            }
        }
    });
});
