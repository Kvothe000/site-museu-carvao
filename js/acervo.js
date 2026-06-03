import { fundosHistoricos } from './dados-fundos.js';

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('fundo-list-container');
    const detailArea = document.getElementById('detail-area');

    if (!listContainer || !detailArea) {
        console.warn('Elements for Master-Detail UI not found on this page.');
        return;
    }

    // Render Master Sidebar Items
    function renderSidebar() {
        listContainer.innerHTML = '';
        fundosHistoricos.forEach((fundo, index) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'fundo-item-btn';
            button.setAttribute('data-id', fundo.id);
            button.setAttribute('aria-selected', 'false');

            // Set icon and truncated title
            button.innerHTML = `<i class="fa-regular fa-folder" aria-hidden="true"></i> <span>${fundo.titulo}</span>`;
            
            button.addEventListener('click', () => {
                // Remove active classes
                document.querySelectorAll('.fundo-item-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                // Set current active
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');

                // Load Details
                loadDetail(fundo);
                
                // On mobile, scroll to detail section
                if (window.innerWidth <= 768) {
                    detailArea.scrollIntoView({ behavior: 'smooth' });
                }
            });

            li.appendChild(button);
            listContainer.appendChild(li);
        });
    }

    // Load Detail Area
    function loadDetail(fundo) {
        // Build the action buttons HTML dynamically based on existence
        let actionButtonsHtml = '';

        if (fundo.pdfDescricao) {
            actionButtonsHtml += `
                <a href="${fundo.pdfDescricao}" target="_blank" class="btn-action btn-pdf-desc" rel="noopener noreferrer">
                    <i class="fa-solid fa-file-pdf" aria-hidden="true"></i> Descrição Completa (PDF)
                </a>
            `;
        }

        if (fundo.pdfQuadro) {
            actionButtonsHtml += `
                <a href="${fundo.pdfQuadro}" target="_blank" class="btn-action btn-pdf-quadro" rel="noopener noreferrer">
                    <i class="fa-solid fa-sitemap" aria-hidden="true"></i> Quadro de Arranjo (PDF)
                </a>
            `;
        }

        if (fundo.linkAtom) {
            actionButtonsHtml += `
                <a href="${fundo.linkAtom}" target="_blank" class="btn-action btn-atom-link" rel="noopener noreferrer">
                    <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Acessar no AtoM
                </a>
            `;
        }

        detailArea.innerHTML = `
            <div class="detail-header">
                <p class="detail-subtitle">Detalhes do Fundo Documental</p>
                <h2 class="detail-title">${fundo.titulo}</h2>
            </div>
            
            <div class="sintese-wrapper">
                <div class="sintese-text" id="sintese-text-element">${fundo.sintese}</div>
                <div class="sintese-fade-overlay" id="sintese-fade-overlay-element"></div>
            </div>

            <button class="btn-toggle-sintese" id="btn-toggle-sintese-element">
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i> <span>Ler Mais</span>
            </button>

            ${actionButtonsHtml ? `<div class="actions-area">${actionButtonsHtml}</div>` : ''}
        `;

        // Collapsible synthesis logic
        const sinteseText = document.getElementById('sintese-text-element');
        const btnToggle = document.getElementById('btn-toggle-sintese-element');
        const fadeOverlay = document.getElementById('sintese-fade-overlay-element');

        if (sinteseText && btnToggle) {
            // Check if height of content is small enough to not need expansion
            setTimeout(() => {
                if (sinteseText.scrollHeight <= 280) {
                    btnToggle.style.display = 'none';
                    if (fadeOverlay) fadeOverlay.style.display = 'none';
                }
            }, 50);

            btnToggle.addEventListener('click', () => {
                const isExpanded = sinteseText.classList.contains('expanded');
                if (isExpanded) {
                    // Set current height as starting point for collapse animation
                    sinteseText.style.maxHeight = sinteseText.scrollHeight + 'px';
                    sinteseText.classList.remove('expanded');
                    
                    // Force a reflow to make the transition work
                    sinteseText.offsetHeight; 
                    
                    // Collapse back to baseline after a tiny delay
                    setTimeout(() => {
                        sinteseText.style.maxHeight = '280px';
                    }, 10);

                    btnToggle.querySelector('span').textContent = 'Ler Mais';
                    btnToggle.querySelector('i').className = 'fa-solid fa-chevron-down';
                    
                    // Smooth scroll back to the top of the detail container to avoid losing reading position
                    detailArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    const alturaReal = sinteseText.scrollHeight + 'px';
                    sinteseText.style.maxHeight = alturaReal;
                    sinteseText.classList.add('expanded');

                    btnToggle.querySelector('span').textContent = 'Ler Menos';
                    btnToggle.querySelector('i').className = 'fa-solid fa-chevron-up';

                    // Once transition finishes, set height to none to prevent clipping on window resize/orientation change
                    sinteseText.addEventListener('transitionend', () => {
                        if (sinteseText.classList.contains('expanded')) {
                            sinteseText.style.maxHeight = 'none';
                        }
                    }, { once: true });
                }
            });
        }
    }

    // Initialize Master-Detail
    renderSidebar();
});
