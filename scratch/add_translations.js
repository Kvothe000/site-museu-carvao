const fs = require('fs');

const ptKeys = `        "projects_school_modal_title": "Projeto Escola no Museu",
        "projects_school_modal_p1": "O Projeto Escola no Museu desenvolve ações educativas integradas com escolas da região do Baixo Jacuí, promovendo a apropriação do patrimônio cultural e histórico pelos estudantes.",
        "projects_school_modal_p2": "<strong>Visitas Mediadas e Oficinas:</strong> As turmas participam de roteiros especiais pelas ruínas da antiga usina termoelétrica, pelo Poço 1 e pelas salas de exposição, acompanhadas por mediadores qualificados que adaptam o conteúdo a cada faixa etária.",
        "projects_school_modal_p3": "<strong>Educação e Preservação:</strong> O projeto busca conectar a história industrial da mineração de carvão com debates contemporâneos sobre meio ambiente, sustentabilidade e transição energética.",
        "projects_school_modal_info": "<strong>ONDE/QUANDO:</strong> Realizado continuamente no complexo do Museu Estadual do Carvão (Arroio dos Ratos/RS), com agendamento prévio disponível para instituições públicas e privadas de ensino.",
        "projects_restoration_modal_title": "Restauração do Acervo CADEM",
        "projects_restoration_modal_p1": "O projeto de Restauração do Acervo CADEM visa a salvaguarda de mais de um milhão de documentos históricos do Consórcio Administrador de Empresas de Mineração, acumulados desde o século XIX.",
        "projects_restoration_modal_p2": "<strong>Conservação e Restauro:</strong> A iniciativa engloba processos rigorosos de higienização, desacidificação, reparos de rasgos, planificação e acondicionamento adequado de mapas, plantas industriais e livros de registro afetados pelo tempo.",
        "projects_restoration_modal_p3": "<strong>Resgate Pós-Enchente:</strong> Com a inundação do arquivo em maio de 2024, as atividades foram intensificadas no laboratório de restauro, aplicando técnicas de descongelamento e secagem controlada para salvar os documentos encharcados.",
        "projects_restoration_modal_info": "<strong>ONDE/QUANDO:</strong> Atividades realizadas no Laboratório de Conservação e Restauro do Arquivo Histórico da Mineração, sob coordenação técnica e apoio institucional de órgãos de preservação do patrimônio.",`;

const enKeys = `        "projects_school_modal_title": "School in the Museum Project",
        "projects_school_modal_p1": "The School in the Museum Project develops integrated educational actions with schools in the Baixo Jacuí region, promoting the appropriation of cultural and historical heritage by students.",
        "projects_school_modal_p2": "<strong>Guided Tours and Workshops:</strong> Classes participate in special itineraries through the ruins of the former thermoelectric plant, Pit 1, and the exhibition rooms, accompanied by qualified mediators who adapt the content to each age group.",
        "projects_school_modal_p3": "<strong>Education and Preservation:</strong> The project aims to connect the industrial history of coal mining with contemporary debates on environment, sustainability, and energy transition.",
        "projects_school_modal_info": "<strong>WHERE/WHEN:</strong> Conducted continuously at the Museu Estadual do Carvão complex (Arroio dos Ratos/RS), with prior booking available for public and private educational institutions.",
        "projects_restoration_modal_title": "Restoration of the CADEM Collection",
        "projects_restoration_modal_p1": "The CADEM Collection Restoration project aims to safeguard over one million historical documents from the Consórcio Administrator de Empresas de Mineração, accumulated since the 19th century.",
        "projects_restoration_modal_p2": "<strong>Conservation and Restoration:</strong> The initiative includes rigorous cleaning, deacidification, tear repairs, flattening, and proper housing of maps, industrial blueprints, and logbooks affected by time.",
        "projects_restoration_modal_p3": "<strong>Post-Flood Rescue:</strong> Following the flooding of the archive in May 2024, activities were intensified at the restoration laboratory, applying thawing and controlled drying techniques to save waterlogged documents.",
        "projects_restoration_modal_info": "<strong>WHERE/WHEN:</strong> Activities conducted at the Conservation and Restoration Laboratory of the Arquivo Histórico da Mineração, under technical coordination and support from heritage preservation bodies.",`;

const esKeys = `        "projects_school_modal_title": "Proyecto Escuela en el Museo",
        "projects_school_modal_p1": "El Proyecto Escuela en el Museo desarrolla acciones educativas integradas con escuelas de la región del Bajo Jacuí, promoviendo la apropiación del patrimonio cultural e histórico por parte de los estudiantes.",
        "projects_school_modal_p2": "<strong>Visitas Guided y Talleres:</strong> Las clases participan en itinerarios especiales por las ruinas de la antigua planta termoeléctrica, el Pozo 1 y las salas de exhibición, acompañados por mediadores calificados que adaptan el contenido a cada grupo de edad.",
        "projects_school_modal_p3": "<strong>Educación y Preservación:</strong> El proyecto busca conectar la historia industrial de la minería del carbón con debates contemporáneos sobre el medio ambiente, la sostenibilidad y la transición energética.",
        "projects_school_modal_info": "<strong>DÓNDE/CUÁNDO:</strong> Se realiza de forma continua en el complejo del Museu Estadual del Carbón (Arroio dos Ratos/RS), con reserva previa disponible para instituciones educativas públicas y privadas.",
        "projects_restoration_modal_title": "Restauración del Acervo CADEM",
        "projects_restoration_modal_p1": "El proyecto de Restauración del Acervo CADEM tiene como objetivo la salvaguarda de más de un millón de documentos históricos del Consorcio Administrador de Empresas de Minería, acumulados desde el siglo XIX.",
        "projects_restoration_modal_p2": "<strong>Conservación y Restauración:</strong> La iniciativa engloba procesos rigurosos de limpieza, desacidificación, reparación de desgarros, aplanado y almacenamiento adecuado de mapas, planos industriales y libros de registro afectados por el tiempo.",
        "projects_restoration_modal_p3": "<strong>Rescate Post-Inundación:</strong> Tras la inundación del archivo en mayo de 2024, se intensificaron las actividades en el laboratorio de restauración, aplicando técnicas de descongelación y secado controlado para salvar los documentos empapados.",
        "projects_restoration_modal_info": "<strong>DÓNDE/CUÁNDO:</strong> Actividades realizadas en el Laboratorio de Conservación y Restauración del Archivo Histórico de la Minería, bajo coordinación técnica y apoyo institucional de organismos de preservación del patrimonio.",`;

let fileContent = fs.readFileSync('js/translations.js', 'utf8');

// Insere ptKeys antes do fechamento do bloco pt (antes de "hist_modal_title_linha-tempo": "Galeria: Linha do Tempo" e do fechamento "},")
const ptAnchor = '"hist_modal_title_linha-tempo": "Galeria: Linha do Tempo"';
fileContent = fileContent.replace(ptAnchor, ptAnchor + ',\n' + ptKeys);

// Insere enKeys antes do fechamento do bloco en
const enAnchor = '"hist_modal_title_linha-tempo": "Gallery: Timeline"';
fileContent = fileContent.replace(enAnchor, enAnchor + ',\n' + enKeys);

// Insere esKeys antes do fechamento do bloco es
const esAnchor = '"hist_modal_title_linha-tempo": "Galería: Línea del Tiempo"';
fileContent = fileContent.replace(esAnchor, esAnchor + ',\n' + esKeys);

fs.writeFileSync('js/translations.js', fileContent, 'utf8');
console.log('Translations successfully updated!');
