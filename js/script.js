// Espera que todo o conteúdo da página (DOM) seja carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO ---
    const apiUrl = 'https://URL_REAL_DO_ATOM_DO_MUSEU/api/information-objects'; // Substitua pela URL correta
    const apiKey = 'SUA_CHAVE_DE_API_SECRETA_VAI_AQUI'; // Substitua pela sua chave

    const acervoContainer = document.getElementById('acervo-container');

    // --- FUNÇÃO PARA BUSCAR E EXIBIR OS DADOS ---
    async function carregarAcervo() {
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'REST-API-Key': apiKey }
            });

            if (!response.ok) {
                throw new Error(`Erro na rede: ${response.statusText}`);
            }

            const documentos = await response.json();

            acervoContainer.innerHTML = ''; // Limpa o spinner
            acervoContainer.classList.remove('loading');

            documentos.forEach(doc => {
                // --- PONTO DA MODIFICAÇÃO ---
                // Agora, em vez de um simples <div>, criamos a estrutura completa do card.
                
                const card = document.createElement('a');
                card.className = 'fundo-card';
                card.href = `https://URL_REAL_DO_ATOM_DO_MUSEU/${doc.slug}`; // Link para a página do documento
                card.target = '_blank'; // Abre em nova aba

                // AVISO: A API do AtoM pode não fornecer uma URL de imagem thumbnail diretamente.
                // Você talvez precise adaptar isso. Por enquanto, usamos um placeholder.
                const imageUrl = doc.thumbnail_url || 'https://via.placeholder.com/300x200.png?text=Documento';

                card.innerHTML = `
                    <figure>
                        <img src="${imageUrl}" alt="${doc.title}">
                        <figcaption>${doc.title}</figcaption>
                    </figure>
                `;

                acervoContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Falha ao carregar o acervo:', error);
            acervoContainer.innerHTML = '<p>Ocorreu um erro ao carregar os documentos.</p>';
            acervoContainer.classList.remove('loading');
        }
    }

    // Chama a função para iniciar o processo
    carregarAcervo();
    
// ... (seu código 'async function carregarAcervo()' e a chamada dele continuam aqui em cima)


    // --- FUNCIONALIDADE DO MENU DROPDOWN ---
    // Seleciona todos os itens de menu que têm um submenu.
    const dropdownItems = document.querySelectorAll('.main-nav .has-dropdown');

    // Adiciona um ouvinte de evento de clique para cada um.
    dropdownItems.forEach(item => {
        const link = item.querySelector('a');
        link.addEventListener('click', function(event) {
            // Previne o link de navegar para outra página (comportamento padrão do '#').
            event.preventDefault();
            
            // Pega o item pai (o <li>) que foi clicado.
            const clickedParent = this.parentElement;

            // Fecha todos os outros dropdowns que possam estar abertos.
            dropdownItems.forEach(otherItem => {
                if (otherItem !== clickedParent) {
                    otherItem.classList.remove('show-dropdown');
                }
            });

            // Adiciona ou remove a classe 'show-dropdown' no item clicado.
            // Isso faz o CSS mostrar ou esconder o menu.
            clickedParent.classList.toggle('show-dropdown');
        });
    });

    // Fecha o dropdown se o usuário clicar em qualquer outro lugar da página.
    window.addEventListener('click', function(event) {
        // Verifica se o clique NÃO foi dentro de um item de menu com dropdown.
        if (!event.target.closest('.has-dropdown')) {
            // Se não foi, remove a classe 'show-dropdown' de todos os itens.
            dropdownItems.forEach(item => {
                item.classList.remove('show-dropdown');
            });
        }
    });

}); // Esta é a chave de fechamento do 'DOMContentLoaded'. Certifique-se de que o código acima esteja dentro dela.