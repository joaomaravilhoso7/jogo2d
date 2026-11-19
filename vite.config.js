import { defineConfig } from 'vite';

export default defineConfig({
  base: './',

  build: {
    rolldownOptions: {
      input: {
        menu: 'index.html',
        nivel1: 'nivel1.html',
        creditos: 'creditos.html',
        derrota: 'derrota.html',
      },
    },
  },
});