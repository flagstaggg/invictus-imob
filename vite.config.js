import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/api': 'http://localhost:3333',
      '/uploads': 'http://localhost:3333',
    },
  },
});
