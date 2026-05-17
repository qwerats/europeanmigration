import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { runMigrationAgent } from './api/migration-agent.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function readJsonBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) return resolveBody({});
      try {
        resolveBody(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleMigrationApi(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const { reply, report } = await runMigrationAgent(payload?.messages, {
      writeFiles: payload?.writeFiles,
      saveChatHistory: payload?.saveChatHistory,
    });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ reply, report }));
  } catch (error) {
    res.statusCode = error?.status || 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: error?.message || 'Внутренняя ошибка сервера.',
      })
    );
  }
}

export default defineConfig(() => ({
  plugins: [
    react(),
    {
      name: 'local-migration-monitor-api',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/migration-agent' || req.url === '/api/migration-monitor') {
            await handleMigrationApi(req, res);
            return;
          }
          next();
        });
      },
    },
    {
      name: 'github-pages-spa-fallback',
      closeBundle() {
        if (process.env.GITHUB_PAGES !== 'true') return;
        copyFileSync(resolve(__dirname, 'dist/index.html'), resolve(__dirname, 'dist/404.html'));
      },
    },
  ],
}));
