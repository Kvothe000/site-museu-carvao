// Controlador Principal Data-Driven para Nossos Fundos e Arquivo Digital

document.addEventListener("DOMContentLoaded", () => {
    // 1. Identificar em qual página estamos
    const isDocumental = document.getElementById('documental-container') !== null;
    const isDigital = document.getElementById('digital-container') !== null;
    
    if (!ACERVO_DATA || !ACERVO_DATA.fundos) {
        console.error("Banco de Dados ACERVO_DATA não carregado.");
        return;
    }

    if (isDocumental) {
        renderDocumentalSidebar();
    } else if (isDigital) {
        renderDigitalSidebar();
    }

    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
});

// ==========================================
// FUNÇÕES PARA NOSSO ACERVO DOCUMENTAL
// ==========================================
function renderDocumentalSidebar() {
    const sidebar = document.getElementById('doc-sidebar-tree');
    if (!sidebar) return;
    
    let html = '';
    ACERVO_DATA.fundos.forEach(fundo => {
        html += `
        <div class="nf-fundo-toggle" onclick="loadDocumentalFundo('${fundo.id}', this)" style="cursor:pointer; padding:0.8rem; margin-bottom:0.5rem; background:var(--cor-fundo-claro); border-radius:4px; transition:background 0.2s;">
            <i class="fa-regular fa-folder"></i> <span data-i18n="fund_name_${fundo.id}">${fundo.name}</span>
        </div>
        `;
    });
    sidebar.innerHTML = html;

    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}

function loadDocumentalFundo(id, element) {
    const fundo = ACERVO_DATA.fundos.find(f => f.id === id);
    if (!fundo) return;

    // Estilo ativo na sidebar
    document.querySelectorAll('.nf-fundo-toggle').forEach(el => el.style.background = 'var(--cor-fundo-claro)');
    element.style.background = 'rgba(216, 155, 66, 0.2)'; // Laranja destaque transparente

    const placeholder = document.getElementById('nf-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const container = document.getElementById('documental-content-area');
    
    let btnRelatorioHtml = '';
    if (fundo.relatorioCompletoHtml) {
        btnRelatorioHtml = `<button onclick="openDocumentalModal('${fundo.id}')" style="background:var(--cor-laranja-destaque); margin-top:1rem; color:#121212; border:none; padding:12px 25px; font-weight:bold; cursor:pointer; font-size:1rem; border-radius:4px; box-shadow: 0 4px 10px rgba(216, 155, 66, 0.2); transition: transform 0.2s;"><i class="fa-solid fa-book-open"></i> <span data-i18n="nf_read_report">Ler Relatório Completo</span></button>`;
    }

    let sinteseHtml = '<p data-i18n="nf_no_summary">Síntese não cadastrada.</p>';
    if (fundo.sintesePrimeiro) {
        sinteseHtml = `
           <div class="sintese-container" style="background: var(--cor-fundo-claro); padding: 2rem; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid var(--cor-borda-suave); margin-bottom: 1.5rem;">
               <span data-i18n="fund_sintese_1_${fundo.id}">${fundo.sintesePrimeiro}</span>
               <div id="dynamic-sin-more" style="display:none; transition: all 0.3s; margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--cor-borda-suave);">
                   <span data-i18n="fund_sintese_2_${fundo.id}">${fundo.sinteseRestante}</span>
               </div>
               ${fundo.sinteseRestante ? `<button onclick="toggleSintese(this)" data-i18n="nf_read_more" style="margin-top:1.5rem; background:transparent; color:var(--cor-laranja-destaque); border:1px solid var(--cor-laranja-destaque); padding:5px 15px; border-radius:4px; cursor:pointer; font-weight: 500;">Ler Mais Síntese</button>` : ''}
           </div>
        `;
    }

    container.innerHTML = `
        <div class="nf-fundo-detail fade-in-up is-visible" style="margin-top: 1rem; padding-top: 2rem; border-top: 1px solid var(--cor-borda-suave); animation: fadeInUp 0.5s ease forwards;">
            <h2 style="color: var(--cor-laranja-destaque); font-size: 1.8rem; margin-bottom: 2rem; line-height: 1.3;"><i class="fa-solid fa-folder-open"></i> <span data-i18n="fund_name_${fundo.id}">${fundo.title}</span></h2>
            <h3 style="color:var(--cor-laranja-destaque);" data-i18n="nf_history_title">Histórico e Resumo do Fundo</h3>
            ${sinteseHtml}
            <br>
            ${btnRelatorioHtml}
        </div>
    `;

    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}

// Escopo Abstrato do Botão Ler Mais para evitar o erro const el
function toggleSintese(btn) {
    const el = document.getElementById('dynamic-sin-more');
    if(el.style.display === 'none'){
        el.style.display = 'block'; 
        btn.setAttribute('data-i18n', 'nf_read_less');
    } else {
        el.style.display = 'none'; 
        btn.setAttribute('data-i18n', 'nf_read_more');
    }
    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}

function openDocumentalModal(id) {
    const fundo = ACERVO_DATA.fundos.find(f => f.id === id);
    if (!fundo) return;
    
    document.getElementById('global-modal-title').innerHTML = `<i class="fa-solid fa-folder-open"></i> <span data-i18n="nf_report_title">Relatório Completo</span> - <span data-i18n="fund_name_${fundo.id}">${fundo.name}</span>`;
    document.getElementById('global-modal-body').innerHTML = `<div data-i18n="fund_report_${fundo.id}">${fundo.relatorioCompletoHtml}</div>`;
    document.getElementById('global-modal').classList.add('active');

    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}

function closeDocumentalModal() {
    document.getElementById('global-modal').classList.remove('active');
}


// ==========================================
// FUNÇÕES PARA ARQUIVO DIGITAL (TAXONOMIA)
// ==========================================
function renderDigitalSidebar() {
    const sidebar = document.getElementById('ad-sidebar-tree');
    if (!sidebar) return;
    
    let html = '';
    ACERVO_DATA.fundos.forEach((fundo, fIndex) => {
        let treeContent = '';
        fundo.taxonomia.forEach((serie, sIndex) => {
            let subHtml = '';
            serie.subseries.forEach(sub => {
                let sId = `ad-s-${fundo.id}-${sIndex}`;
                subHtml += `<div style="margin-bottom: 0.3rem;"><a href="#${sId}" style="font-size: 0.85rem; color: var(--cor-texto-escuro); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--cor-texto-claro)'" onmouseout="this.style.color='var(--cor-texto-escuro)'"><i class="fa-solid fa-file-lines" style="margin-right: 5px; opacity:0.6;"></i>${sub.code} ${sub.name.substring(0,25)}${sub.name.length>25?'...':''}</a></div>`;
            });
            treeContent += `
            <details>
                <summary style="font-size: 0.9rem; font-weight: 500; color: var(--cor-texto-claro); padding: 0.4rem 0;"><i class="fa-regular fa-folder"></i> ${serie.code} ${serie.name.substring(0,35)}</summary>
                <div class="sub-links" style="padding-left: 1.5rem; margin-top: 0.3rem;">
                    ${subHtml || '<p style="font-size:0.8rem; color:var(--cor-texto-escuro);" data-i18n="nf_no_subseries">Sem subséries indexadas</p>'}
                </div>
            </details>
            `;
        });
        
        if (!treeContent) treeContent = '<p style="padding:1rem; color:var(--cor-texto-escuro); font-size:0.9rem;" data-i18n="nf_cataloging">Taxonomia em Catalogação</p>';

        html += `
        <details class="ad-tree-toggle" data-target="${fundo.id}">
            <summary style="font-size:1rem; font-weight:600; color:var(--cor-laranja-destaque); padding: 0.5rem;" onclick="loadDigitalFundo('${fundo.id}')"><i class="fa-solid fa-folder-open"></i> <span data-i18n="fund_name_${fundo.id}">${fundo.name}</span></summary>
            <div class="tree-content" style="padding-left: 1.5rem; margin-top: 0.2rem; border-left: 1px dashed var(--cor-borda-suave);">
                ${treeContent}
            </div>
        </details>
        `;
    });
    sidebar.innerHTML = html;

    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}

function loadDigitalFundo(id) {
    const fundo = ACERVO_DATA.fundos.find(f => f.id === id);
    if (!fundo) return;

    // Close other details in sidebar
    document.querySelectorAll('.ad-tree-toggle').forEach(el => {
        if (el.getAttribute('data-target') !== id) el.open = false;
    });

    const placeholder = document.getElementById('ad-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const container = document.getElementById('digital-content-area');

    let taxonomyTablesHtml = `
      <div style="margin-bottom: 2rem; padding: 1.5rem; border: 1px dashed var(--cor-borda-suave); border-radius: 6px; text-align: center; background: var(--cor-fundo-claro);">
         <p style="color:var(--cor-texto-escuro); margin-bottom:1rem;" data-i18n="nf_image_reserved"><i class="fa-regular fa-image"></i> Espaço reservado para Imagem do Fundo.</p>
         <a href="#" class="btn-atom" style="font-size:0.8rem; background:transparent; color:var(--cor-texto-escuro); border:1px solid var(--cor-borda-suave); padding:4px 10px; border-radius:4px;" data-i18n="nf_access_atom"><i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar Fundo no AtoM</a>
      </div>
   `;
   
   fundo.taxonomia.forEach((serie, sIndex) => {
       let sId = `ad-s-${fundo.id}-${sIndex}`;
       let subHtml = '';
       serie.subseries.forEach(sub => {
           subHtml += `
            <li style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--cor-borda-suave); padding-bottom: 1rem;">
                <div style="width:100%; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-bottom: 0.5rem;">
                   <strong style="color:var(--cor-texto-claro);">${sub.code} ${sub.name}</strong> 
                   <div><span class="badge-info">${sub.date}</span> <span class="badge-info" data-i18n="nf_badge_caixa">Cx</span><span class="badge-info">&nbsp;${sub.caixa}</span></div>
                </div>
                <div class="subserie-image-placeholder" style="width: 100%; padding: 1rem; border: 1px dashed var(--cor-borda-suave); border-radius: 4px; text-align: center; margin-top: 0.5rem;">
                   <span style="color:var(--cor-texto-escuro); font-size:0.85rem; display:block; margin-bottom:0.5rem;" data-i18n="nf_subseries_image"><i class="fa-regular fa-image"></i> Imagem da Subsérie Reservada</span>
                   <a href="#" style="font-size:0.75rem; color:var(--cor-laranja-destaque); text-decoration:none;" data-i18n="nf_access_atom_short"><i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar no AtoM</a>
                </div>
            </li>
           `;
       });
       
       taxonomyTablesHtml += `
        <h4 id="${sId}" style="margin-top:2rem; padding:1rem; background:var(--cor-fundo-claro); color: var(--cor-texto-claro); font-size: 1.1rem; border-left:3px solid var(--cor-laranja-destaque);"><i class="fa-solid fa-folder" style="color:var(--cor-laranja-destaque);"></i> ${serie.code||''} ${serie.name} <span style="font-size:0.8rem; font-weight:normal;">(${serie.date||''})</span></h4>
        <div class="serie-image-placeholder" style="width:100%; margin: 1rem 0; padding:1rem; border: 1px dashed var(--cor-borda-suave); border-radius:4px; text-align:center;">
             <span style="color:var(--cor-texto-escuro); font-size:0.85rem; display:block; margin-bottom:0.5rem;" data-i18n="nf_series_image"><i class="fa-regular fa-image"></i> Imagem da Série Reservada</span>
             <a href="#" style="font-size:0.8rem; color:var(--cor-laranja-destaque); text-decoration:none;" data-i18n="nf_access_series_atom"><i class="fa-solid fa-arrow-up-right-from-square"></i> Acessar Série no AtoM</a>
        </div>
        <ul class="archive-list-table" style="padding-left:0; list-style:none;">
            ${subHtml}
        </ul>
       `;
   });

    container.innerHTML = `
        <div class="ad-fundo-detail fade-in-up is-visible" style="margin-top: 1rem; padding-top: 2rem; animation: fadeInUp 0.5s ease forwards;">
            <h2 style="color: var(--cor-laranja-destaque); font-size: 1.8rem; margin-bottom: 2rem; line-height: 1.3;"><i class="fa-solid fa-folder-open"></i> <span data-i18n="fund_name_${fundo.id}">${fundo.title}</span></h2>
            <h3 style="margin-top: 2rem; color:var(--cor-texto-claro);" data-i18n="nf_taxonomy_index">Índice Descritivo de Taxonomia</h3>
            <p style="color: var(--cor-texto-escuro); margin-bottom: 2rem;" data-i18n="nf_taxonomy_desc">Hierarquia técnica do fundo. Links apontam para diretórios do AtoM.</p>
            <div style="background: var(--cor-fundo-claro); border-radius: 4px;">
                ${fundo.taxonomia.length > 0 ? taxonomyTablesHtml : '<p style="padding:1rem;" data-i18n="nf_taxonomy_structuring">Taxonomia em estruturação.</p>'}
            </div>
        </div>
    `;

    if (typeof window.updateLanguage === 'function') {
        window.updateLanguage(localStorage.getItem('language') || 'pt');
    }
}
