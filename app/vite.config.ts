import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the same build works at the domain root and under a
  // sub-path (GitHub Pages serves at /Matatu-app/).
  base: './',
  plugins: [react()],
  server: { host: true },
  preview: { host: true },
});
