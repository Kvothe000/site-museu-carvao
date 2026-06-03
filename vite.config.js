import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    injectHTML(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        '404': resolve(__dirname, '404.html'),
        'arquivos-digitais': resolve(__dirname, 'arquivos-digitais.html'),
        'busca': resolve(__dirname, 'busca.html'),
        'localizacao-contato': resolve(__dirname, 'localizacao-contato.html'),
        'mapa-do-site': resolve(__dirname, 'mapa-do-site.html'),
        'nossa-historia': resolve(__dirname, 'nossa-historia.html'),
        'nossos-fundos': resolve(__dirname, 'nossos-fundos.html'),
        'projetos': resolve(__dirname, 'projetos.html'),
        'publicacoes': resolve(__dirname, 'publicacoes.html'),
        'servicos': resolve(__dirname, 'servicos.html'),
        'arquivos-historicos': resolve(__dirname, 'arquivos-historicos.html'),
        'arquivos-fotograficos': resolve(__dirname, 'arquivos-fotograficos.html'),
        'arquivos-tridimensionais': resolve(__dirname, 'arquivos-tridimensionais.html')
      }
    }
  }
});
