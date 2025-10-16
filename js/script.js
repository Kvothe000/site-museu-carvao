// Espera que todo o conteúdo da página (DOM) seja carregado antes de executar o script.
// Isso é uma boa prática para evitar erros.
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÃO ---
    // Substitua estes valores pelos dados fornecidos pelo seu supervisor.
    const apiUrl = 'https://URL_REAL_DO_ATOM_DO_MUSEU/api/information-objects'; // Exemplo de URL. Peça a correta!
    const apiKey = 'SUA_CHAVE_DE_API_SECRETA_VAI_AQUI';

    // Pega a referência do container no HTML onde os documentos serão exibidos.
    const acervoContainer = document.getElementById('acervo-container');

    // --- FUNÇÃO PARA BUSCAR E EXIBIR OS DADOS ---
    async function carregarAcervo() {
        try {
            // A função 'fetch' faz a chamada para a API.
            // Usamos 'await' para esperar a resposta da chamada de rede.
            const response = await fetch(apiUrl, {
                method: 'GET', // Método para buscar dados.
                headers: {
                    // O cabeçalho 'REST-API-Key' é como o AtoM autentica sua requisição.
                    'REST-API-Key': apiKey
                }
            });

            // Verifica se a resposta da rede foi bem-sucedida (status 200-299).
            if (!response.ok) {
                // Se não foi, lança um erro para ser pego pelo bloco 'catch'.
                throw new Error(`Erro na rede: ${response.statusText}`);
            }

            // Converte a resposta (que vem em formato de texto) para um objeto JavaScript (JSON).
            const documentos = await response.json();

            // Limpa a mensagem "Carregando documentos..." do container.
            acervoContainer.innerHTML = '';
            acervoContainer.classList.remove('loading');

            // Itera (passa por cada um) sobre a lista de documentos recebidos.
            documentos.forEach(doc => {
                // Para cada documento, cria um elemento <div> no HTML.
                const card = document.createElement('div');
                card.className = 'documento-card'; // Adiciona a classe CSS para estilização.

                // Preenche o conteúdo do card com os dados do documento.
                // IMPORTANTE: 'doc.title', 'doc.creation_date' e 'doc.slug' são exemplos.
                // Você precisa ver no console.log como os dados realmente vêm da API para usar os nomes corretos.
                card.innerHTML = `
                    <h3>${doc.title}</h3>
                    <p><strong>Data de Criação:</strong> ${doc.creation_date || 'Não informada'}</p>
                    <p><strong>Referência:</strong> ${doc.reference_code || 'N/A'}</p>
                    <a href="https://URL_REAL_DO_ATOM_DO_MUSEU/${doc.slug}" target="_blank">Ver detalhes no acervo</a>
                `;

                // Adiciona o card recém-criado dentro do 'acervo-container'.
                acervoContainer.appendChild(card);
            });

        } catch (error) {
            // Se qualquer erro ocorrer no bloco 'try', ele será capturado aqui.
            console.error('Falha ao carregar o acervo:', error);
            // Exibe uma mensagem de erro amigável para o usuário.
            acervoContainer.innerHTML = '<p>Ocorreu um erro ao carregar os documentos. Por favor, tente novamente mais tarde.</p>';
            acervoContainer.classList.remove('loading');
        }
    }

    // Finalmente, chama a função para iniciar todo o processo.
    carregarAcervo();
});