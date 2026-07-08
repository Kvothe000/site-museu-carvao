/**
 * Funções utilitárias comuns para as páginas de acervos e fundos documentais.
 */

/**
 * Atualiza dinamicamente o idioma da página se o script de traduções estiver ativo.
 */
export function updatePageLanguage() {
    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}

/**
 * Rola suavemente até a área de detalhes em dispositivos móveis.
 * @param {HTMLElement} detailArea 
 */
export function scrollToDetail(detailArea) {
    if (window.innerWidth <= 768 && detailArea) {
        detailArea.scrollIntoView({ behavior: 'smooth' });
    }
}
