import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { runMigrationAgent, streamOllamaMigrationAgent } from './api/migration-agent.js';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-migration-agent-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url !== '/api/migration-agent') return next();

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
              return;
            }

            try {
              const payload = await readJsonBody(req);
              const provider = (process.env.AI_PROVIDER || env.AI_PROVIDER || 'ollama').toLowerCase();
              const opts = {
                provider,
                ollamaBaseUrl: process.env.OLLAMA_BASE_URL || env.OLLAMA_BASE_URL,
                ollamaModel: process.env.OLLAMA_MODEL || env.OLLAMA_MODEL,
                apiKey: process.env.OPENAI_API_KEY || env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || env.OPENAI_MODEL,
              };

              if (payload?.stream && provider === 'ollama') {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('X-Accel-Buffering', 'no');
                try {
                  for await (const piece of streamOllamaMigrationAgent(payload.messages, opts)) {
                    res.write(`${JSON.stringify({ type: 'token', text: piece })}\n`);
                  }
                  res.write(`${JSON.stringify({ type: 'done' })}\n`);
                } catch (error) {
                  res.write(
                    `${JSON.stringify({
                      type: 'error',
                      message: error?.message || 'Внутренняя ошибка сервера.',
                    })}\n`
                  );
                }
                res.end();
                return;
              }

              const reply = await runMigrationAgent(payload?.messages, opts);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ reply }));
            } catch (error) {
              res.statusCode = error?.status || 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: error?.message || 'Внутренняя ошибка сервера.',
                })
              );
            }
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
  };
});
