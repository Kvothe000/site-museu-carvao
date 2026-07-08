import { updatePageLanguage, scrollToDetail } from './acervo-common.js';

export function renderSidebar(options) {
    const { listContainer, detailArea, dataList, onSelect, i18nPrefix = 'fund_name_' } = options;

    listContainer.innerHTML = '';
    
    dataList.forEach((item) => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.className = `fundo-item-btn fundo-color-${item.id}`;
        button.setAttribute('data-id', item.id);
        button.setAttribute('aria-selected', 'false');

        button.innerHTML = `<i class="fa-regular fa-folder" aria-hidden="true"></i> <span data-i18n="${i18nPrefix}${item.id}">${item.titulo}</span>`;
        
        button.addEventListener('click', () => {
            // Remove active classes
            document.querySelectorAll('.fundo-item-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Ativa o atual
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');

            // Carrega detalhes/galeria (callback customizado)
            if (typeof onSelect === 'function') {
                onSelect(item);
            }
            
            // Scroll para detalhes em mobile
            scrollToDetail(detailArea);
        });

        li.appendChild(button);
        listContainer.appendChild(li);
    });

    // Atualiza idioma após criar o DOM dinâmico
    updatePageLanguage();
}
