import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        if (process.env.GITHUB_PAGES !== 'true') return;
        copyFileSync(resolve(__dirname, 'dist/index.html'), resolve(__dirname, 'dist/404.html'));
      },
    },
  ],
});
