const fs = require('fs');

// Mapeamento de ID em dados-fundos.js para ID em acervoData.js
const mapping = {
  "cefmsj": "01",
  "cmcj": "02",
  "ccr": "03",
  "efj": "04",
  "cadem": "05",
  "compequi": "06",
  "ccmb": "07",
  "sindicatos": "08",
  "copelmi": "09",
  "minas-do-recreio": "10",
  "termoeletrica-charqueadas": "11"
};

// Dados vindos de dados-fundos.js
const sourceFields = {
  "cefmsj": {
    "pdfDescricao": "pdf/descricoes/descricao-cefmsj.pdf",
    "pdfQuadro": "pdf/quadros/quadro-cefmsj.pdf",
    "linkAtom": "https://arquivos.cultura.rs.gov.br/index.php/companhia-estrada-de-ferro-e-minas-de-sao-jeronymo-cefmsj"
  },
  "cmcj": {
    "pdfDescricao": "pdf/descricoes/descricao-cmcj.pdf",
    "pdfQuadro": "pdf/quadros/quadro-cmcj.pdf",
    "linkAtom": "https://arquivos.cultura.rs.gov.br/index.php/br-rsmc02"
  },
  "ccr": {
    "pdfDescricao": "pdf/descricoes/descricao-ccr.pdf",
    "pdfQuadro": "pdf/quadros/quadro-ccr.pdf",
    "linkAtom": "https://arquivos.cultura.rs.gov.br/index.php/br-rsmc03"
  },
  "efj": {
    "pdfDescricao": "pdf/descricoes/descricao-efj.pdf",
    "pdfQuadro": null,
    "linkAtom": "https://arquivos.cultura.rs.gov.br/index.php/br-rsmc04"
  },
  "cadem": {
    "pdfDescricao": "pdf/descricoes/descricao-cadem.pdf",
    "pdfQuadro": null,
    "linkAtom": "https://arquivos.cultura.rs.gov.br/index.php/a2rm-febn-st82"
  },
  "compequi": {
    "pdfDescricao": "pdf/descricoes/descricao-compequi.pdf",
    "pdfQuadro": "pdf/quadros/quadro-compequi.pdf",
    "linkAtom": null
  },
  "ccmb": {
    "pdfDescricao": "pdf/descricoes/descricao-ccmb.pdf",
    "pdfQuadro": "pdf/quadros/quadro-ccmb.pdf",
    "linkAtom": null
  },
  "sindicatos": {
    "pdfDescricao": "pdf/descricoes/descricao-sindicatos.pdf",
    "pdfQuadro": "pdf/quadros/quadro-sindicatos.pdf",
    "linkAtom": null
  },
  "copelmi": {
    "pdfDescricao": "pdf/descricoes/descricao-copelmi.pdf",
    "pdfQuadro": "pdf/quadros/quadro-copelmi.pdf",
    "linkAtom": null
  },
  "minas-do-recreio": {
    "pdfDescricao": "pdf/descricoes/descricao-minas-do-recreio.pdf",
    "pdfQuadro": "pdf/quadros/quadro-minas-do-recreio.pdf",
    "linkAtom": null
  },
  "termoeletrica-charqueadas": {
    "pdfDescricao": "pdf/descricoes/descricao-termoeletrica-charqueadas.pdf",
    "pdfQuadro": null,
    "linkAtom": null
  }
};

// Ler acervoData.js
let acervoDataContent = fs.readFileSync('js/acervoData.js', 'utf8');

// Vamos extrair a definição do objeto ACERVO_DATA de forma segura
// Já que o arquivo é JS válido, podemos avaliar ou tratar como JSON
// Mas o arquivo é:
// const ACERVO_DATA = { ... }; export { ACERVO_DATA };
// Vamos extrair o objeto JSON limpando a declaração de variável e export
let jsonStr = acervoDataContent
  .replace(/^\/\/.*$/gm, '') // Remove comentários
  .replace('const ACERVO_DATA =', '')
  .replace('export { ACERVO_DATA };', '')
  .trim();

// Certifique-se de remover o ponto e vírgula final se houver
if (jsonStr.endsWith(';')) {
  jsonStr = jsonStr.slice(0, -1).trim();
}

try {
  const acervoData = JSON.parse(jsonStr);
  
  // Mesclar campos
  acervoData.fundos.forEach(fundo => {
    // Achar o slug do fundo a partir do ID numérico
    const slug = Object.keys(mapping).find(key => mapping[key] === fundo.id);
    if (slug && sourceFields[slug]) {
      fundo.pdfDescricao = sourceFields[slug].pdfDescricao;
      fundo.pdfQuadro = sourceFields[slug].pdfQuadro;
      fundo.linkAtom = sourceFields[slug].linkAtom;
    }
  });

  // Gravar de volta em js/acervoData.js
  const newContent = `// Arquivo gerado via Script - Base de dados JSON Front-End
const ACERVO_DATA = ${JSON.stringify(acervoData, null, 2)};

export { ACERVO_DATA };
`;

  fs.writeFileSync('js/acervoData.js', newContent, 'utf8');
  console.log('Mesclagem concluída com sucesso!');
} catch (e) {
  console.error('Erro ao analisar ou gravar JSON:', e);
}
