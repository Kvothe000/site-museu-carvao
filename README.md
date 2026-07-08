# Site do Museu Estadual do Carvão

Site institucional do Museu Estadual do Carvão (Arroio dos Ratos/RS), desenvolvido como parte do estágio em desenvolvimento web.

## 🏛️ Sobre o Projeto

Site multi-página estático estruturado para a preservação e a divulgação do valioso patrimônio histórico da mineração de carvão no Rio Grande do Sul. O projeto provê aos visitantes uma experiência digital premium com acesso a fundos documentais, exposições fotográficas, acervo tridimensional, arquivos digitais e informações sobre os serviços educacionais do museu.

## 🚀 Tecnologias

- [Vite](https://vitejs.dev/) — Ferramenta de build rápida e servidor de desenvolvimento moderno
- HTML5 semântico com marcações de acessibilidade ARIA
- CSS3 vanilla com variáveis estruturadas, layouts flexíveis (Grid e Flexbox) e suporte a responsividade
- JavaScript modular (ES Modules) para comportamentos assíncronos e reativos
- [vite-plugin-html-inject](https://github.com/anonrig/vite-plugin-html-inject) — Injeção de componentes HTML reutilizáveis (header e footer)

## 📦 Setup

Para rodar o projeto localmente, siga as instruções abaixo:

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento local
npm run dev

# 3. Gerar a build de produção otimizada
npm run build

# 4. Visualizar a build gerada localmente
npm run preview
```

## 📁 Estrutura de Diretórios

O projeto segue a seguinte estrutura de arquivos:

```text
├── css/                  # Estilos globais e locais
│   ├── style.css         # Variáveis e estilos estruturais globais
│   ├── premium.css       # Ajustes visuais avançados e paleta de cores premium
│   └── pages.css         # Estilos centralizados específicos de cada página
├── js/                   # Scripts modulares da aplicação
│   ├── main.js           # Inicialização global e escuta de eventos
│   ├── translations.js   # Dicionário de internacionalização e reatividade
│   ├── acervo.js         # Lógica master-detail para arquivos históricos
│   └── acervoData.js     # Base de dados de catalogação do acervo
├── img/                  # Imagens e arquivos de mídia
│   └── historia/         # Fotografias históricas reais da mineração
├── public/               # Arquivos estáticos servidos diretamente na raiz
│   ├── sitemap.xml       # Mapa do site para indexação em buscadores
│   └── robots.txt        # Instruções para robôs de busca (SEO)
├── header.html           # Componente parcial do cabeçalho
├── footer.html           # Componente parcial do rodapé
├── vite.config.js        # Configuração do Vite e mapeamento de entradas HTML
└── package.json          # Manifesto do npm com dependências e scripts
```

## 📄 Páginas do Site

O site institucional é composto pelas seguintes páginas:

- **Página Inicial (`index.html`)**: Apresentação principal, novidades e links rápidos de acesso.
- **Nossa História (`nossa-historia.html`)**: Narrativa histórica em duas colunas, com índice reativo lateral (ScrollSpy) e carrossel de fotos históricas reais.
- **Serviços (`servicos.html`)**: Serviços educacionais, visitas guiadas e FAQ com accordion interativo.
- **Projetos (`projetos.html`)**: Ações culturais do museu exibidas em formato de grid com janelas modais detalhadas.
- **Nossos Fundos (`nossos-fundos.html`)**: Introdução sobre a catalogação do acervo documental da mineração.
- **Arquivos Históricos (`arquivos-historicos.html`)**: Painel dinâmico master-detail detalhando os 11 fundos documentais.
- **Arquivos Fotográficos (`arquivos-fotograficos.html`)**, **Tridimensionais (`arquivos-tridimensionais.html`)** e **Digitais (`arquivos-digitais.html`)**: Portais dedicados de catalogação visual do patrimônio físico e digitalizado.
- **Contato (`contato.html` / `localizacao-contato.html`)**: Informações de localização, horário de funcionamento e formulário de fale conosco.
- **Busca (`busca.html`)**: Sistema de busca integrada do acervo documental.
- **Mapa do Site (`mapa-do-site.html`)**: Relação estruturada de todas as páginas da plataforma.

## ♿ Acessibilidade

O projeto prioriza a inclusão digital e a facilidade de navegação por meio das seguintes boas práticas:
- **HTML Semântico:** Uso correto de tags como `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>` e `<footer>`.
- **Acessibilidade do Teclado:** Links e botões interativos estilizados com `:focus-visible` para indicar claramente a navegação por tabulação.
- **skip-link:** Atalho nativo oculto para permitir que leitores de tela pulem a navegação repetitiva e acessem o conteúdo principal.
- **Leitores de Tela:** Inclusão de atributos `aria-label`, `aria-live`, `aria-hidden` e textos alternativos descritivos (`alt`) traduzidos em todas as mídias.
- **VLibras:** Integração do widget governamental de tradução para a Língua Brasileira de Sinais (LIBRAS).
- **Evitando Sobreposições:** Posicionamento estratégico do botão "Voltar ao topo" no canto inferior esquerdo para não cobrir o widget do VLibras.

## 🌐 Internacionalização (i18n)

O site possui suporte multilíngue dinâmico em 3 idiomas: **Português**, **Inglês** e **Espanhol**.
- **Motor Reativo:** O arquivo `js/translations.js` gerencia um mapa com todas as strings traduzidas da interface.
- **Carregamento Automático:** Elementos com atributos `data-i18n` (conteúdo de texto), `data-i18n-alt` (textos alternativos) e `data-i18n-aria` (rótulos de leitores de tela) são traduzidos em tempo de execução ao mudar o idioma selecionado.
- **Persistência de Preferência:** O idioma escolhido pelo visitante é armazenado no `localStorage`, garantindo que a preferência seja mantida nas visitas subsequentes.