export function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }

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

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function isServerlessRuntime() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/**
 * POST /api/migration-agent — Vite dev middleware и Vercel serverless.
 */
export async function handleMigrationAgentHttp(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const serverless = isServerlessRuntime();
    const { runMigrationAgent } = await import('./migration-agent.js');
    const { reply, report } = await runMigrationAgent(payload?.messages, {
      writeFiles: serverless ? false : payload?.writeFiles,
      saveChatHistory: serverless ? false : payload?.saveChatHistory,
    });
    sendJson(res, 200, { reply, report });
  } catch (error) {
    sendJson(res, error?.status || 500, {
      error: error?.message || 'Внутренняя ошибка сервера.',
    });
  }
}

export function isMigrationAgentPath(url) {
  const pathname = String(url || '').split('?')[0];
  return pathname === '/api/migration-agent' || pathname === '/api/migration-monitor';
}
