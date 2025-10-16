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
});