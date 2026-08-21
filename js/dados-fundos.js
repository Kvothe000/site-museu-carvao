import { ACERVO_DATA } from './acervoData.js';

// Mapeamento de ID numérico em acervoData para ID de texto/slug em dados-fundos
const idToSlug = {
  "01": "cefmsj",
  "02": "cmcj",
  "03": "ccr",
  "04": "efj",
  "05": "cadem",
  "06": "compequi",
  "07": "ccmb",
  "08": "sindicatos",
  "09": "copelmi",
  "10": "minas-do-recreio",
  "11": "termoeletrica-charqueadas"
};

export const fundosHistoricos = ACERVO_DATA.fundos.map(f => ({
  id: idToSlug[f.id] || f.id,
  titulo: f.title || f.name,
  sintese: f.sintesePrimeiro + (f.sinteseRestante || ''),
  pdfDescricao: f.pdfDescricao,
  pdfQuadro: f.pdfQuadro,
  linkAtom: f.linkAtom
}));
