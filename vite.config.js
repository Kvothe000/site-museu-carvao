import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  base: '/site-museu-carvao/',
  plugins: [
    injectHTML(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '404': resolve(__dirname, '404.html'),
        'arquivo-digital': resolve(__dirname, 'arquivo-digital.html'),
        'busca': resolve(__dirname, 'busca.html'),
        'localizacao-contato': resolve(__dirname, 'localizacao-contato.html'),
        'mapa-do-site': resolve(__dirname, 'mapa-do-site.html'),
        'nossa-historia': resolve(__dirname, 'nossa-historia.html'),
        'nossos-fundos': resolve(__dirname, 'nossos-fundos.html'),
        'projetos': resolve(__dirname, 'projetos.html'),
        'publicacoes': resolve(__dirname, 'publicacoes.html'),
        'servicos': resolve(__dirname, 'servicos.html')
      }
    }
  }
});
