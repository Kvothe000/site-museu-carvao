import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';

export default defineConfig({
  base: '/site-museu-carvao/',
  plugins: [
    injectHTML(),
  ]
});
