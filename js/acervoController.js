// Controlador Principal Data-Driven para Nossos Fundos e Arquivo Digital
// Refatorado: removidas funções globais e onclick inline.
// Padrão de Event Delegation aplicado em todos os containers.
// acervoData.js carregado sob demanda via import() dinâmico (não bloqueia o parser).
import { updatePageLanguage, scrollToDetail } from './modules/acervo-common.js';

let ACERVO_DATA = null;

document.addEventListener('DOMContentLoaded', async () => {
    const isDocumental = document.getElementById('documental-container') !== null;
    const isDigital = document.getElementById('digital-container') !== null;

    if (!isDocumental && !isDigital) return;

    // Import dinâmico: o arquivo de 770KB só é baixado quando necessário
    try {
        const module = await import('./acervoData.js');
        ACERVO_DATA = module.ACERVO_DATA || module.default;
    } catch (e) {
        console.error('Erro ao carregar acervoData.js:', e);
        return;
    }

    if (!ACERVO_DATA || !ACERVO_DATA.fundos) {
        console.error('Banco de Dados ACERVO_DATA não carregado corretamente.');
        return;
    }

    if (isDocumental) {
        initDocumentalPage();
    } else if (isDigital) {
        initDigitalPage();
    }

    updatePageLanguage();
});

// ==========================================
// PÁGINA NOSSOS FUNDOS (DOCUMENTAL)
// ==========================================

function initDocumentalPage() {
    renderDocumentalSidebar();

    const sidebar = document.getElementById('doc-sidebar-tree');
    const modal = document.getElementById('global-modal');
    const modalCloseBtn = document.querySelector('[data-action="close-modal"]');

    // Event Delegation na sidebar — captura cliques em .nf-fundo-toggle
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const toggle = e.target.closest('.nf-fundo-toggle');
            if (!toggle) return;
            const fundoId = toggle.dataset.fundoId;
            if (fundoId) {
                loadDocumentalFundo(fundoId, toggle);
                scrollToDetail(document.getElementById('documental-content-area'));
            }
        });
    }

    // Event Delegation no container de conteúdo — captura clique no botão de modal e toggleSintese
    const contentArea = document.getElementById('documental-content-area');
    if (contentArea) {
        contentArea.addEventListener('click', (e) => {
            const modalBtn = e.target.closest('[data-action="open-modal"]');
            if (modalBtn) {
                const fundoId = modalBtn.dataset.fundoId;
                if (fundoId) openDocumentalModal(fundoId);
                return;
            }

            const sinteseBtn = e.target.closest('[data-action="toggle-sintese"]');
            if (sinteseBtn) {
                toggleSintese(sinteseBtn);
            }
        });
    }

    // Fechar modal — Event Delegation no próprio modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('[data-action="close-modal"]')) {
                modal.classList.remove('active');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }
}

function renderDocumentalSidebar() {
    const sidebar = document.getElementById('doc-sidebar-tree');
    if (!sidebar) return;

    // Construção segura via DOM — sem onclick inline, sem HTML string
    sidebar.innerHTML = '';
    ACERVO_DATA.fundos.forEach(fundo => {
        const div = document.createElement('div');
        div.className = `nf-fundo-toggle fundo-color-${fundo.id}`;
        // data-fundo-id usado pelo event delegation (sem onclick)
        div.dataset.fundoId = fundo.id;

        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-folder';
        icon.setAttribute('aria-hidden', 'true');

        const span = document.createElement('span');
        span.dataset.i18n = `fund_name_${fundo.id}`;
        span.textContent = fundo.name;

        div.appendChild(icon);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(span);
        sidebar.appendChild(div);
    });

    updatePageLanguage();
}

function loadDocumentalFundo(id, element) {
    const fundo = ACERVO_DATA.fundos.find(f => f.id === id);
    if (!fundo) return;

    // Estado ativo na sidebar
    document.querySelectorAll('.nf-fundo-toggle').forEach(el => {
        el.classList.remove('active');
    });
    element.classList.add('active');

    const placeholder = document.getElementById('nf-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const container = document.getElementById('documental-content-area');
    if (!container) return;

    // Limpa o container e constrói via DOM (previne XSS de HTML do ACERVO_DATA)
    container.innerHTML = '';

    const detailDiv = document.createElement('div');
    detailDiv.className = 'nf-fundo-detail fade-in-up is-visible';

    const h2 = document.createElement('h2');
    const h2Icon = document.createElement('i');
    h2Icon.className = 'fa-solid fa-folder-open';
    h2Icon.setAttribute('aria-hidden', 'true');
    const h2Span = document.createElement('span');
    h2Span.dataset.i18n = `fund_name_${fundo.id}`;
    h2Span.textContent = fundo.title || fundo.name;
    h2.appendChild(h2Icon);
    h2.appendChild(document.createTextNode(' '));
    h2.appendChild(h2Span);

    const h3 = document.createElement('h3');
    h3.dataset.i18n = 'nf_history_title';
    h3.textContent = 'Histórico e Resumo do Fundo';

    detailDiv.appendChild(h2);
    detailDiv.appendChild(h3);

    // Síntese
    if (fundo.sintesePrimeiro) {
        const sinteseContainer = document.createElement('div');
        sinteseContainer.className = 'sintese-container';

        const sinteseSpan = document.createElement('span');
        sinteseSpan.dataset.i18n = `fund_sintese_1_${fundo.id}`;
        // Conteúdo da síntese é texto do banco de dados interno — exibido via textContent por segurança
        sinteseSpan.textContent = fundo.sintesePrimeiro;

        sinteseContainer.appendChild(sinteseSpan);

        if (fundo.sinteseRestante) {
            const moreDiv = document.createElement('div');
            moreDiv.id = 'dynamic-sin-more';
            moreDiv.style.display = 'none';
            const moreSpan = document.createElement('span');
            moreSpan.dataset.i18n = `fund_sintese_2_${fundo.id}`;
            moreSpan.textContent = fundo.sinteseRestante;
            moreDiv.appendChild(moreSpan);
            sinteseContainer.appendChild(moreDiv);

            // Botão "Ler Mais" com data-action (sem onclick inline)
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'btn-toggle-sintese-nf';
            toggleBtn.dataset.action = 'toggle-sintese';
            toggleBtn.dataset.i18n = 'nf_read_more';
            toggleBtn.textContent = 'Ler Mais Síntese';
            sinteseContainer.appendChild(toggleBtn);
        }

        detailDiv.appendChild(sinteseContainer);
    } else {
        const noSintese = document.createElement('p');
        noSintese.dataset.i18n = 'nf_no_summary';
        noSintese.textContent = 'Síntese não cadastrada.';
        detailDiv.appendChild(noSintese);
    }

    // Inserção da observação padrão sobre o PDF
    const obsPara = document.createElement('p');
    obsPara.className = 'sintese-obs';
    obsPara.dataset.i18n = 'fund_sintese_obs';
    obsPara.textContent = 'Obs. Para acessar o conteúdo completo do Fundo, Séries, Subséries e/ou dossiês clique em "Descrição completa (PDF)"';
    detailDiv.appendChild(obsPara);

    // Botão Relatório com data-action (sem onclick inline)
    if (fundo.relatorioCompletoHtml) {
        const br = document.createElement('br');
        detailDiv.appendChild(br);

        const reportBtn = document.createElement('button');
        reportBtn.className = 'btn-open-report';
        reportBtn.dataset.action = 'open-modal';
        reportBtn.dataset.fundoId = fundo.id;

        const reportIcon = document.createElement('i');
        reportIcon.className = 'fa-solid fa-book-open';
        reportIcon.setAttribute('aria-hidden', 'true');
        const reportSpan = document.createElement('span');
        reportSpan.dataset.i18n = 'nf_read_report';
        reportSpan.textContent = 'Ler Relatório Completo';

        reportBtn.appendChild(reportIcon);
        reportBtn.appendChild(document.createTextNode(' '));
        reportBtn.appendChild(reportSpan);
        detailDiv.appendChild(reportBtn);
    }

    container.appendChild(detailDiv);

    updatePageLanguage();
}

function toggleSintese(btn) {
    const el = document.getElementById('dynamic-sin-more');
    if (!el) return;
    if (el.style.display === 'none') {
        el.style.display = 'block';
        btn.dataset.i18n = 'nf_read_less';
    } else {
        el.style.display = 'none';
        btn.dataset.i18n = 'nf_read_more';
    }
    updatePageLanguage();
}

function openDocumentalModal(id) {
    const fundo = ACERVO_DATA.fundos.find(f => f.id === id);
    if (!fundo) return;

    const modalTitle = document.getElementById('global-modal-title');
    const modalBody = document.getElementById('global-modal-body');
    const modal = document.getElementById('global-modal');

    if (modalTitle) {
        // Construção segura do título do modal via DOM
        modalTitle.innerHTML = '';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-folder-open';
        icon.setAttribute('aria-hidden', 'true');
        const titleSpan = document.createElement('span');
        titleSpan.dataset.i18n = 'nf_report_title';
        titleSpan.textContent = 'Relatório Completo';
        const sep = document.createTextNode(' - ');
        const nameSpan = document.createElement('span');
        nameSpan.dataset.i18n = `fund_name_${fundo.id}`;
        nameSpan.textContent = fundo.name;
        modalTitle.appendChild(icon);
        modalTitle.appendChild(document.createTextNode(' '));
        modalTitle.appendChild(titleSpan);
        modalTitle.appendChild(sep);
        modalTitle.appendChild(nameSpan);
    }

    if (modalBody) {
        // O relatorioCompletoHtml é HTML rico interno (não vem de input do usuário)
        // Mantido como innerHTML pois é conteúdo editorial controlado do ACERVO_DATA
        const wrapper = document.createElement('div');
        wrapper.dataset.i18n = `fund_report_${fundo.id}`;
        wrapper.innerHTML = fundo.relatorioCompletoHtml;
        modalBody.innerHTML = '';
        modalBody.appendChild(wrapper);
    }

    if (modal) {
        modal.classList.add('active');
        updatePageLanguage();
    }
}


// ==========================================
// PÁGINA ARQUIVO DIGITAL (TAXONOMIA)
// ==========================================

function initDigitalPage() {
    renderDigitalSidebar();

    const sidebar = document.getElementById('ad-sidebar-tree');

    // Event Delegation na sidebar digital — captura cliques em summary dos details
    if (sidebar) {
        sidebar.addEventListener('click', (e) => {
            const summary = e.target.closest('summary[data-fundo-id]');
            if (summary) {
                const fundoId = summary.dataset.fundoId;
                if (fundoId) {
                    loadDigitalFundo(fundoId);
                    scrollToDetail(document.getElementById('detail-area'));
                }
            }
        });
    }
}

function renderDigitalSidebar() {
    const sidebar = document.getElementById('ad-sidebar-tree');
    if (!sidebar) return;

    sidebar.innerHTML = '';

    ACERVO_DATA.fundos.forEach((fundo, fIndex) => {
        const details = document.createElement('details');
        details.className = 'ad-tree-toggle';
        details.dataset.target = fundo.id;

        const summary = document.createElement('summary');
        // data-fundo-id usado pelo event delegation (sem onclick inline)
        summary.dataset.fundoId = fundo.id;

        const summaryIcon = document.createElement('i');
        summaryIcon.className = 'fa-solid fa-folder-open';
        summaryIcon.setAttribute('aria-hidden', 'true');
        const summarySpan = document.createElement('span');
        summarySpan.dataset.i18n = `fund_name_${fundo.id}`;
        summarySpan.textContent = fundo.name;
        summary.appendChild(summaryIcon);
        summary.appendChild(document.createTextNode(' '));
        summary.appendChild(summarySpan);

        const treeDiv = document.createElement('div');
        treeDiv.className = 'tree-content';

        if (fundo.taxonomia && fundo.taxonomia.length > 0) {
            fundo.taxonomia.forEach((serie, sIndex) => {
                const serieDetails = document.createElement('details');
                const serieSummary = document.createElement('summary');
                serieSummary.textContent = `${serie.code || ''} ${serie.name.substring(0, 35)}`;

                const subLinksDiv = document.createElement('div');
                subLinksDiv.className = 'sub-links';

                if (serie.subseries && serie.subseries.length > 0) {
                    serie.subseries.forEach(sub => {
                        const sId = `ad-s-${fundo.id}-${sIndex}`;
                        const subDiv = document.createElement('div');
                        subDiv.className = 'sub-link-item';
                        const subLink = document.createElement('a');
                        subLink.href = `#${sId}`;
                        const subIcon = document.createElement('i');
                        subIcon.className = 'fa-solid fa-file-lines';
                        subIcon.setAttribute('aria-hidden', 'true');
                        const label = document.createTextNode(
                            ` ${sub.code} ${sub.name.substring(0, 25)}${sub.name.length > 25 ? '...' : ''}`
                        );
                        subLink.appendChild(subIcon);
                        subLink.appendChild(label);
                        subDiv.appendChild(subLink);
                        subLinksDiv.appendChild(subDiv);
                    });
                } else {
                    const noSub = document.createElement('p');
                    noSub.dataset.i18n = 'nf_no_subseries';
                    noSub.textContent = 'Sem subséries indexadas';
                    subLinksDiv.appendChild(noSub);
                }

                serieDetails.appendChild(serieSummary);
                serieDetails.appendChild(subLinksDiv);
                treeDiv.appendChild(serieDetails);
            });
        } else {
            const noTaxonomy = document.createElement('p');
            noTaxonomy.dataset.i18n = 'nf_cataloging';
            noTaxonomy.textContent = 'Taxonomia em Catalogação';
            treeDiv.appendChild(noTaxonomy);
        }

        details.appendChild(summary);
        details.appendChild(treeDiv);
        sidebar.appendChild(details);
    });

    updatePageLanguage();
}

function loadDigitalFundo(id) {
    const fundo = ACERVO_DATA.fundos.find(f => f.id === id);
    if (!fundo) return;

    // Fecha outros details abertos na sidebar
    document.querySelectorAll('.ad-tree-toggle').forEach(el => {
        if (el.getAttribute('data-target') !== id) el.open = false;
    });

    const placeholder = document.getElementById('ad-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const container = document.getElementById('digital-content-area');
    if (!container) return;

    container.innerHTML = '';

    const detailDiv = document.createElement('div');
    detailDiv.className = 'ad-fundo-detail fade-in-up is-visible';

    const h2 = document.createElement('h2');
    const h2Icon = document.createElement('i');
    h2Icon.className = 'fa-solid fa-folder-open';
    h2Icon.setAttribute('aria-hidden', 'true');
    const h2Span = document.createElement('span');
    h2Span.dataset.i18n = `fund_name_${fundo.id}`;
    h2Span.textContent = fundo.title || fundo.name;
    h2.appendChild(h2Icon);
    h2.appendChild(document.createTextNode(' '));
    h2.appendChild(h2Span);

    const h3 = document.createElement('h3');
    h3.dataset.i18n = 'nf_taxonomy_index';
    h3.textContent = 'Índice Descritivo de Taxonomia';

    const descP = document.createElement('p');
    descP.dataset.i18n = 'nf_taxonomy_desc';
    descP.textContent = 'Hierarquia técnica do fundo. Links apontam para diretórios do AtoM.';

    detailDiv.appendChild(h2);
    detailDiv.appendChild(h3);
    detailDiv.appendChild(descP);

    const taxonomyWrapper = document.createElement('div');
    taxonomyWrapper.className = 'taxonomy-wrapper';

    if (!fundo.taxonomia || fundo.taxonomia.length === 0) {
        const noTax = document.createElement('p');
        noTax.dataset.i18n = 'nf_taxonomy_structuring';
        noTax.textContent = 'Taxonomia em estruturação.';
        taxonomyWrapper.appendChild(noTax);
    } else {
        fundo.taxonomia.forEach((serie, sIndex) => {
            const sId = `ad-s-${fundo.id}-${sIndex}`;

            const h4 = document.createElement('h4');
            h4.id = sId;
            h4.className = 'taxonomy-serie-title';
            const serieIcon = document.createElement('i');
            serieIcon.className = 'fa-solid fa-folder';
            serieIcon.setAttribute('aria-hidden', 'true');
            h4.appendChild(serieIcon);
            h4.appendChild(document.createTextNode(` ${serie.code || ''} ${serie.name} `));
            const dateSpan = document.createElement('span');
            dateSpan.className = 'serie-date';
            dateSpan.textContent = serie.date ? `(${serie.date})` : '';
            h4.appendChild(dateSpan);

            const ul = document.createElement('ul');
            ul.className = 'archive-list-table';

            if (serie.subseries && serie.subseries.length > 0) {
                serie.subseries.forEach(sub => {
                    const li = document.createElement('li');
                    li.className = 'archive-list-item';
                    const strong = document.createElement('strong');
                    strong.textContent = `${sub.code} ${sub.name}`;
                    const badgeDate = document.createElement('span');
                    badgeDate.className = 'badge-info';
                    badgeDate.textContent = sub.date || '';
                    const badgeCx = document.createElement('span');
                    badgeCx.className = 'badge-info';
                    badgeCx.dataset.i18n = 'nf_badge_caixa';
                    badgeCx.textContent = 'Cx';
                    const badgeCxNum = document.createElement('span');
                    badgeCxNum.className = 'badge-info';
                    badgeCxNum.textContent = `\u00a0${sub.caixa || ''}`;
                    li.appendChild(strong);
                    li.appendChild(badgeDate);
                    li.appendChild(badgeCx);
                    li.appendChild(badgeCxNum);
                    ul.appendChild(li);
                });
            }

            taxonomyWrapper.appendChild(h4);
            taxonomyWrapper.appendChild(ul);
        });
    }

    detailDiv.appendChild(taxonomyWrapper);
    container.appendChild(detailDiv);

    updatePageLanguage();
}
