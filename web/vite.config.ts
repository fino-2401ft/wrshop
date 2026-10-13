import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Không xuất .map — F12 khó map về file .tsx gốc
    sourcemap: false,
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['furywr.com', 'www.furywr.com', '100.103.147.75'],
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    allowedHosts: ['furywr.com', 'www.furywr.com', '100.103.147.75'],
    proxy: {
      '/api': 'http://127.0.0.1:3000',
      '/uploads': 'http://127.0.0.1:3000',
    },
  },
});