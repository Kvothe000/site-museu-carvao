import { fundosHistoricos } from './dados-fundos.js';

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('fundo-list-container');
    const detailArea = document.getElementById('detail-area');
    
    // Elementos do Lightbox
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxDownload = document.getElementById('lightbox-download');

    if (!listContainer || !detailArea) {
        console.warn('Elements for Master-Detail UI not found on this page.');
        return;
    }

    // Mapeamento das imagens de public/img/historia/ por Fundo Documental
    const imagensPorFundo = {
        "cefmsj": [
            { src: "img/historia/historia-1.jpg", alt: "Companhia Estrada de Ferro e Minas de São Jerônimo - Foto 1", legenda: "Instalações e mina subterrânea pioneira na região carbonífera." },
            { src: "img/historia/historia-2.jpg", alt: "Companhia Estrada de Ferro e Minas de São Jerônimo - Foto 2", legenda: "Operários mineiros de profissão do País de Gales no Herval." },
            { src: "img/historia/historia-3.jpg", alt: "Companhia Estrada de Ferro e Minas de São Jerônimo - Foto 3", legenda: "Boca da mina com os trabalhadores da Imperial Brazilian Company." },
            { src: "img/historia/historia-4.jpg", alt: "Companhia Estrada de Ferro e Minas de São Jerônimo - Foto 4", legenda: "Poço Isabel, em Arroio dos Ratos, inaugurado em 1885." }
        ],
        "cmcj": [
            { src: "img/historia/historia-5.jpg", alt: "Companhia Minas de Carvão do Jacoí - Foto 1", legenda: "Trabalhos de sondagem geológica na região de Leão." },
            { src: "img/historia/historia-6.jpg", alt: "Companhia Minas de Carvão do Jacoí - Foto 2", legenda: "Construção da infraestrutura ferroviária própria da CMCJ." },
            { src: "img/historia/historia-7.jpg", alt: "Companhia Minas de Carvão do Jacoí - Foto 3", legenda: "Trabalhadores na boca de um poço vertical de extração." }
        ],
        "ccr": [
            { src: "img/historia/historia-8.jpg", alt: "Companhia Carbonífera Rio-grandense - Foto 1", legenda: "Primeiras lavras sistemáticas de carvão no município de Butiá." },
            { src: "img/historia/historia-9.jpg", alt: "Companhia Carbonífera Rio-grandense - Foto 2", legenda: "Grupo de mineiros trabalhando nos silos de carvão mineral." },
            { src: "img/historia/historia-10.jpg", alt: "Companhia Carbonífera Rio-grandense - Foto 3", legenda: "Administradores técnicos da CCR em frente ao prédio central." }
        ],
        "efj": [
            { src: "img/historia/historia-11.jpg", alt: "Estrada de Ferro Jacuí - Foto 1", legenda: "Composição ferroviária carregada com carvão nacional pronto para transporte." },
            { src: "img/historia/historia-12.jpg", alt: "Estrada de Ferro Jacuí - Foto 2", legenda: "Operações no ramal ferroviário que conectava as minas aos portos do rio Jacuí." }
        ],
        "cadem": [
            { src: "img/historia/historia-13.jpg", alt: "Consórcio Administrador de Empresas de Mineração - Foto 1", legenda: "Sede central da agência comercial do CADEM no Rio de Janeiro." },
            { src: "img/historia/historia-14.jpg", alt: "Consórcio Administrador de Empresas de Mineração - Foto 2", legenda: "Oficina mecânica integrada para manutenção do cabo aéreo e silos." },
            { src: "img/historia/historia-15.jpg", alt: "Consórcio Administrador de Empresas de Mineração - Foto 3", legenda: "Trabalhadores da superfície organizando o escoamento no Porto de Charqueadas." }
        ],
        "compequi": [
            { src: "img/historia/historia-16.png", alt: "Companhia de Engenharia e Equipamentos - Foto 1", legenda: "Desenhos técnicos e equipamentos de perfuração geológica profunda." },
            { src: "img/historia/historia-1.jpg", alt: "Companhia de Engenharia e Equipamentos - Foto 2", legenda: "Maquinários importados para a modernização das minas de subsolo." }
        ],
        "ccmb": [
            { src: "img/historia/historia-2.jpg", alt: "Companhia Carbonífera Minas do Butiá - Foto 1", legenda: "Locomotiva da empresa CCMB manobrando vagões na entrada do pátio." },
            { src: "img/historia/historia-3.jpg", alt: "Companhia Carbonífera Minas do Butiá - Foto 2", legenda: "Equipes de triagem e lavagem de carvão mineral de Butiá." }
        ],
        "sindicatos": [
            { src: "img/historia/historia-4.jpg", alt: "Sindicatos da Mineração - Foto 1", legenda: "Assembleia dos mineiros organizada pelo Sindicato SITEC nos anos 40." },
            { src: "img/historia/historia-5.jpg", alt: "Sindicatos da Mineração - Foto 2", legenda: "Trabalhadores unidos na campanha por melhores condições de saúde e salários." }
        ],
        "copelmi": [
            { src: "img/historia/historia-6.jpg", alt: "COPELMI - Foto 1", legenda: "Campanhas de sondagem geológica e prospecção em novos poços." },
            { src: "img/historia/historia-7.jpg", alt: "COPELMI - Foto 2", legenda: "Prédios administrativos nas minas integrados após incorporação." }
        ],
        "minas-do-recreio": [
            { src: "img/historia/historia-8.jpg", alt: "Minas do Recreio - Foto 1", legenda: "Fase de lavra familiar e infraestrutura de triagem de carvão." },
            { src: "img/historia/historia-9.jpg", alt: "Minas do Recreio - Foto 2", legenda: "Movimentação de caminhões e escoamento inicial da produção." }
        ],
        "termoeletrica-charqueadas": [
            { src: "img/historia/historia-10.jpg", alt: "Termoelétrica de Charqueadas - Foto 1", legenda: "Construção da Usina Termelétrica com chaminés imponentes." },
            { src: "img/historia/historia-11.jpg", alt: "Termoelétrica de Charqueadas - Foto 2", legenda: "Turbinas e geradores elétricos na casa de força da TERMOCHAR." }
        ]
    };

    // Renderiza a Sidebar lateral
    function renderSidebar() {
        listContainer.innerHTML = '';
        fundosHistoricos.forEach((fundo) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'fundo-item-btn';
            button.setAttribute('data-id', fundo.id);
            button.setAttribute('aria-selected', 'false');

            button.innerHTML = `<i class="fa-regular fa-folder" aria-hidden="true"></i> <span data-i18n="fund_name_${fundo.id}">${fundo.titulo}</span>`;
            
            button.addEventListener('click', () => {
                // Remove active classes
                document.querySelectorAll('.fundo-item-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                // Ativa o botão selecionado
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');

                // Carrega a galeria do Fundo
                loadGallery(fundo);
                
                // Scroll para a área de detalhes em dispositivos móveis
                if (window.innerWidth <= 768) {
                    detailArea.scrollIntoView({ behavior: 'smooth' });
                }
            });

            li.appendChild(button);
            listContainer.appendChild(li);
        });

        if (typeof window.updateLanguage === 'function') {
            window.updateLanguage(localStorage.getItem('language') || 'pt');
        }
    }

    // Exibe o Estado Inicial (Boas-vindas)
    function renderWelcomeState() {
        detailArea.innerHTML = `
            <div class="welcome-container">
                <i class="fa-regular fa-images welcome-icon" aria-hidden="true"></i>
                <h2 data-i18n="ad_welcome_title">Bem-vindo ao nosso Acervo Digital</h2>
                <p data-i18n="ad_welcome_desc">Selecione um Fundo na lateral para explorar os documentos históricos e fotografias digitalizadas que integram a memória da era do carvão.</p>
            </div>
        `;
        if (typeof window.updateLanguage === 'function') {
            window.updateLanguage(localStorage.getItem('language') || 'pt');
        }
    }

    // Carrega e renderiza a galeria de imagens (Masonry Grid)
    function loadGallery(fundo) {
        const imagens = imagensPorFundo[fundo.id] || [];
        
        if (imagens.length === 0) {
            detailArea.innerHTML = `
                <div class="detail-header">
                    <p class="detail-subtitle" data-i18n="ad_subtitle">Acervo Digital</p>
                    <h2 class="detail-title" data-i18n="fund_title_${fundo.id}">${fundo.titulo}</h2>
                </div>
                <div style="padding: 3rem; text-align: center; border: 1px dashed var(--cor-borda-suave); border-radius: 8px; color: var(--cor-texto-escuro);">
                    <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3 data-i18n="ad_no_docs_title">Nenhum documento digitalizado</h3>
                    <p data-i18n="ad_no_docs_desc">Atualmente não há fotografias ou documentos digitalizados para este fundo no acervo online.</p>
                </div>
            `;
            if (typeof window.updateLanguage === 'function') {
                window.updateLanguage(localStorage.getItem('language') || 'pt');
            }
            return;
        }

        // Constrói o HTML da galeria
        let gridItemsHtml = '';
        imagens.forEach((img, idx) => {
            gridItemsHtml += `
                <div class="masonry-item" data-index="${idx}" role="button" tabindex="0"
                    data-i18n-aria="fundo_${fundo.id}_img_${idx}_aria"
                    aria-label="Visualizar imagem: ${img.legenda}">
                    <img src="${img.src}" loading="lazy" data-i18n-alt="fundo_${fundo.id}_img_${idx}_alt" alt="${img.alt}">
                    <div class="masonry-item-caption" data-i18n="fundo_${fundo.id}_img_${idx}_caption">${img.legenda}</div>
                </div>
            `;
        });

        detailArea.innerHTML = `
            <div class="detail-header">
                <p class="detail-subtitle" data-i18n="ad_subtitle">Acervo Digital</p>
                <h2 class="detail-title" data-i18n="fund_title_${fundo.id}">${fundo.titulo}</h2>
            </div>
            
            <div class="masonry-gallery-container">
                <div class="masonry-grid">
                    ${gridItemsHtml}
                </div>
            </div>
        `;

        // Adiciona ouvintes de eventos para as miniaturas
        const galleryItems = detailArea.querySelectorAll('.masonry-item');
        galleryItems.forEach(item => {
            const index = parseInt(item.getAttribute('data-index'), 10);
            const imgData = imagens[index];

            const openHandler = () => openLightbox(fundo.id, index, imgData);

            item.addEventListener('click', openHandler);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openHandler();
                }
            });
        });

        if (typeof window.updateLanguage === 'function') {
            window.updateLanguage(localStorage.getItem('language') || 'pt');
        }
    }

    function openLightbox(fundoId, index, imgData) {
        lightboxImage.src = imgData.src;
        lightboxImage.setAttribute('data-i18n-alt', `fundo_${fundoId}_img_${index}_alt`);
        lightboxCaption.setAttribute('data-i18n', `fundo_${fundoId}_img_${index}_caption`);
        lightboxCaption.textContent = imgData.legenda;

        if (typeof window.updateLanguage === 'function') {
            window.updateLanguage(localStorage.getItem('language') || 'pt');
        }

        if (lightboxDownload) {
            lightboxDownload.href = imgData.src;
            const filename = imgData.src.substring(imgData.src.lastIndexOf('/') + 1);
            lightboxDownload.setAttribute('download', filename);
        }

        lightboxModal.style.display = 'flex';
        // Forçar reflow para ativar a transição CSS
        lightboxModal.offsetHeight;
        lightboxModal.classList.add('active');

        // Impede a rolagem do body quando o modal estiver aberto
        document.body.style.overflow = 'hidden';
        
        // Foca no botão fechar para acessibilidade
        lightboxClose.focus();
        
        // Adiciona evento de teclado para a tecla ESC
        document.addEventListener('keydown', handleEscKey);
    }

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Espera a animação de fadeout terminar para ocultar o display
        setTimeout(() => {
            if (!lightboxModal.classList.contains('active')) {
                lightboxModal.style.display = 'none';
                lightboxImage.src = '';
                lightboxImage.alt = '';
                lightboxCaption.textContent = '';
            }
        }, 300);

        document.removeEventListener('keydown', handleEscKey);
    }

    function handleEscKey(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            closeLightbox();
        }
    }

    // Eventos do Lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    
    // Fechar ao clicar fora da imagem
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            closeLightbox();
        }
    });

    // Inicialização da tela
    renderSidebar();
    renderWelcomeState();
});
