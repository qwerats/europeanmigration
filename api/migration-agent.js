export const AGENT_SYSTEM_PROMPT = `
РОЛЬ И ЛИЧНОСТЬ
Ты — автономный агент мониторинга миграционных данных по Европейскому Союзу.
Твоя задача — регулярно сканировать официальные источники, выявлять новые публикации и отчёты,
сравнивать их с базовыми значениями и формировать рекомендации по обновлению аналитики.

ГЛАВНАЯ ЦЕЛЬ
Обеспечить актуальность аналитических выводов по миграционным потокам в Европе.

ПРИОРИТЕТНЫЕ ИСТОЧНИКИ (в указанном порядке)
1) Eurostat — Migration and asylum statistics: https://ec.europa.eu/eurostat/web/migration-asylum/overview
2) IOM (International Organization for Migration): https://www.iom.int/data-and-research
3) Национальные статагентства: Destatis (DE), INSEE (FR), ISTAT (IT), INE (ES)

ОБЯЗАТЕЛЬНО ФИКСИРУЙ
- Дату публикации
- Тип документа
- Охватываемый период
- Страну/регион

МЕТРИКИ ДЛЯ ИЗВЛЕЧЕНИЯ
- Net migration
- Asylum applications
- Residence permits
- Общее количество мигрантов по странам

ЛОГИКА СРАВНЕНИЯ
- Если пользователь не дал базовую таблицу/старые значения, явно укажи, что точное сравнение невозможно, и запроси базу.
- Расхождение > 5% => "ТРЕБУЕТ ОБНОВЛЕНИЯ"
- Новый период => "НОВЫЙ ПЕРИОД"
- Методологические изменения => "РЕВИЗИЯ МЕТОДОЛОГИИ"

ФОРМАТ УВЕДОМЛЕНИЯ
---
СТАТУС: [...]
ИСТОЧНИК: [...]
ДАТА ПУБЛИКАЦИИ: [...]
ОХВАТЫВАЕМЫЙ ПЕРИОД: [...]
ЗАТРОНУТЫЕ СТРАНЫ: [...]

ОБНАРУЖЕННЫЕ ИЗМЕНЕНИЯ:
* [Показатель]: было [...] -> стало [...] ([дельта %])

РЕКОМЕНДАЦИЯ:
[конкретное действие]

ССЫЛКА НА ИСТОЧНИК: [прямая URL]
---

ФОРМАТ СВОДНОГО ОТЧЁТА
1) ДАЙДЖЕСТ
2) ТАБЛИЦА ИЗМЕНЕНИЙ
3) ПРИОРИТИЗАЦИЯ (высокий/средний/низкий)
4) СЛЕДУЮЩИЙ ШАГ

ПРАВИЛА
- Всегда давай прямые ссылки на документы (не только на общую главную страницу), если такие ссылки доступны.
- Если источник недоступен, говори об этом явно.
- Не выдумывай числа, которых нет в источниках.
- Приоритет стран: Германия, Франция, Италия, Испания.
- Язык ответа: русский (и английский только если пользователь попросил).
`;

/** Короткий системный промпт для Ollama — меньше токенов, быстрее inference. */
export const OLLAMA_AGENT_SYSTEM_PROMPT = `Ты Migration Monitor EU: мониторинг миграционной статистики ЕС.
Источники: Eurostat migration-asylum, IOM, Destatis, INSEE, ISTAT, INE.
Фиксируй дату публикации, период, страну. Не выдумывай цифры.
Статусы: ТРЕБУЕТ ОБНОВЛЕНИЯ (>5%), НОВЫЙ ПЕРИОД, РЕВИЗИЯ МЕТОДОЛОГИИ.
Ответ кратко, по-русски, со ссылками URL.`;

const FAST_PRIORITY_SOURCES = [
  'https://ec.europa.eu/eurostat/web/migration-asylum/overview',
  'https://www.iom.int/data-and-research',
];

const LIVE_SOURCES_RE =
  /eurostat|iom|destatis|insee|istat|ine\.es|обнов|монитор|провер|asylum|убежищ|мигран|residence|публикац|источник|новые данн|сканир/i;

const OLLAMA_SOURCES_DIGEST_MAX = 2200;
const OLLAMA_FETCH_TIMEOUT_MS = 3500;
const OLLAMA_SNAPSHOT_TEXT_MAX = 380;

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-14)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
}

/** Короче контекст для локальной Ollama — меньше токенов и быстрее ответ. */
export function sanitizeMessagesForOllama(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-4)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
}

export function needsLiveSources(userPrompt) {
  return LIVE_SOURCES_RE.test(String(userPrompt || ''));
}

function getOllamaModel(options) {
  return options.ollamaModel || process.env.OLLAMA_MODEL || 'llama3.2:3b';
}

function getOllamaBaseUrl(options) {
  return (options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(
    /\/$/,
    ''
  );
}

function getOllamaRuntimeOptions() {
  const numPredict = Number(process.env.OLLAMA_NUM_PREDICT);
  const numCtx = Number(process.env.OLLAMA_NUM_CTX);
  return {
    temperature: 0.2,
    num_predict: Number.isFinite(numPredict) && numPredict > 64 ? numPredict : 900,
    num_ctx: Number.isFinite(numCtx) && numCtx >= 2048 ? numCtx : 3072,
    top_k: 20,
    top_p: 0.9,
  };
}

export function extractOutputText(responseJson) {
  if (typeof responseJson?.output_text === 'string' && responseJson.output_text.trim()) {
    return responseJson.output_text.trim();
  }

  const chunks = [];
  const output = Array.isArray(responseJson?.output) ? responseJson.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === 'output_text' && typeof part?.text === 'string') {
        chunks.push(part.text);
      }
    }
  }
  return chunks.join('\n').trim();
}

function stripHtml(rawHtml, maxLen = 3200) {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

async function fetchSourceSnapshot(url, fetchImpl, textMaxLen = OLLAMA_SNAPSHOT_TEXT_MAX) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_FETCH_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      headers: { 'User-Agent': 'MigrationMonitor-EU-Agent/1.0' },
      signal: controller.signal,
    });
    if (!response.ok) {
      return `Источник: ${url}\nСтатус: недоступен (${response.status})`;
    }
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1], 120) : 'Без заголовка';
    const text = stripHtml(html, textMaxLen);
    return `Источник: ${url}\nЗаголовок: ${title}\nФрагмент: ${text}`;
  } catch (err) {
    const msg =
      err?.name === 'AbortError' ? 'таймаут загрузки' : err?.message || 'не удалось получить данные';
    return `Источник: ${url}\nОшибка: ${msg}`;
  } finally {
    clearTimeout(timer);
  }
}

async function collectFastPrioritySources(fetchImpl) {
  const snapshots = await Promise.all(
    FAST_PRIORITY_SOURCES.map((url) => fetchSourceSnapshot(url, fetchImpl))
  );
  return snapshots.join('\n\n');
}

const STATIC_SOURCES_HINT =
  'Приоритетные URL (без загрузки страниц): Eurostat migration-asylum overview; IOM data-and-research. Для полного скана напишите «проверь Eurostat» или «мониторинг IOM».';

/** Кэш HTML-снапшотов; stale-while-revalidate — не ждать сеть, если есть старый кэш. */
let sourcesCache = { digest: '', expiresAt: 0, refreshing: null };

function getSourcesCacheTtlMs() {
  const raw = process.env.MIGRATION_SOURCES_CACHE_MS;
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 30_000) return n;
  return 30 * 60 * 1000;
}

function refreshSourcesInBackground(fetchImpl) {
  if (sourcesCache.refreshing) return;
  sourcesCache.refreshing = collectFastPrioritySources(fetchImpl)
    .then((digest) => {
      sourcesCache = {
        digest,
        expiresAt: Date.now() + getSourcesCacheTtlMs(),
        refreshing: null,
      };
    })
    .catch(() => {
      sourcesCache.refreshing = null;
    });
}

async function getSourcesForOllama(fetchImpl, userPrompt) {
  if (!needsLiveSources(userPrompt)) {
    return STATIC_SOURCES_HINT;
  }

  const now = Date.now();
  const ttl = getSourcesCacheTtlMs();

  if (sourcesCache.digest && now < sourcesCache.expiresAt) {
    return sourcesCache.digest;
  }

  if (sourcesCache.digest) {
    refreshSourcesInBackground(fetchImpl);
    return sourcesCache.digest;
  }

  const digest = await collectFastPrioritySources(fetchImpl);
  sourcesCache = { digest, expiresAt: now + ttl, refreshing: null };
  return digest;
}

function buildOllamaChatMessages(cleanMessages, sourcesDigest, today) {
  let digest = sourcesDigest;
  if (digest.length > OLLAMA_SOURCES_DIGEST_MAX) {
    digest = `${digest.slice(0, OLLAMA_SOURCES_DIGEST_MAX)}\n[…сокращено]`;
  }

  return [
    {
      role: 'system',
      content: `${OLLAMA_AGENT_SYSTEM_PROMPT}\nДата: ${today}.\n\nСнапшоты:\n${digest}`,
    },
    ...cleanMessages,
  ];
}

function buildOllamaRequestBody(model, messages, stream) {
  return {
    model,
    messages,
    stream,
    keep_alive: process.env.OLLAMA_KEEP_ALIVE || '30m',
    options: getOllamaRuntimeOptions(),
  };
}

/** Прогрев: держит модель в RAM и заполняет кэш источников при старте dev-сервера. */
export async function warmOllamaMigrationAgent(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const base = getOllamaBaseUrl(options);
  const model = getOllamaModel(options);

  await Promise.allSettled([
    fetchImpl(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'ok' }],
        stream: false,
        keep_alive: process.env.OLLAMA_KEEP_ALIVE || '30m',
        options: { num_predict: 8, num_ctx: 512 },
      }),
    }),
    collectFastPrioritySources(fetchImpl).then((digest) => {
      sourcesCache = {
        digest,
        expiresAt: Date.now() + getSourcesCacheTtlMs(),
        refreshing: null,
      };
    }),
  ]);
}

async function* parseOllamaChatStream(response) {
  if (!response.ok) {
    let msg = await response.text();
    try {
      const j = JSON.parse(msg);
      msg = j?.error || msg;
    } catch {
      /* keep text */
    }
    const err = new Error(msg || 'Ollama error');
    err.status = response.status;
    throw err;
  }
  const reader = response.body?.getReader?.();
  if (!reader) {
    throw new Error('Потоковое тело ответа Ollama недоступно.');
  }
  const dec = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      let json;
      try {
        json = JSON.parse(line);
      } catch {
        continue;
      }
      if (json.error) {
        const msg = typeof json.error === 'string' ? json.error : json.error?.message || 'Ошибка Ollama';
        const err = new Error(msg);
        err.status = response.status;
        throw err;
      }
      if (json.done) return;
      const c = json.message?.content;
      if (typeof c === 'string' && c.length) yield c;
    }
  }
}

async function runWithOllama(messages, options = {}) {
  const cleanMessages = sanitizeMessagesForOllama(messages);
  if (!cleanMessages.length) {
    const err = new Error('Пустой диалог. Передайте messages[].');
    err.status = 400;
    throw err;
  }

  const fetchImpl = options.fetchImpl || fetch;
  const ollamaBaseUrl = getOllamaBaseUrl(options);
  const ollamaModel = getOllamaModel(options);
  const latestUserPrompt = cleanMessages.filter((m) => m.role === 'user').at(-1)?.content || '';
  const sourcesDigest = await getSourcesForOllama(fetchImpl, latestUserPrompt);
  const today = new Date().toISOString().slice(0, 10);
  const chatMessages = buildOllamaChatMessages(cleanMessages, sourcesDigest, today);

  let response;
  try {
    response = await fetchImpl(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildOllamaRequestBody(ollamaModel, chatMessages, false)),
    });
  } catch {
    const err = new Error(
      `Не удалось подключиться к Ollama (${ollamaBaseUrl}). Установите Ollama, выполните "ollama pull ${ollamaModel}" и запустите "ollama serve".`
    );
    err.status = 500;
    throw err;
  }

  const json = await response.json();
  if (!response.ok) {
    const err = new Error(
      json?.error ||
        `Ollama недоступен. Запустите \`ollama serve\` и загрузите модель \`ollama pull ${ollamaModel}\`.`
    );
    err.status = response.status;
    throw err;
  }

  const reply = json?.message?.content?.trim();
  if (!reply) {
    const err = new Error('Модель не вернула текстовый ответ.');
    err.status = 502;
    throw err;
  }

  return reply;
}

/** Поток токенов для NDJSON-ответа dev-сервера (только Ollama). */
export async function* streamOllamaMigrationAgent(messages, options = {}) {
  const cleanMessages = sanitizeMessagesForOllama(messages);
  if (!cleanMessages.length) {
    const err = new Error('Пустой диалог. Передайте messages[].');
    err.status = 400;
    throw err;
  }

  const fetchImpl = options.fetchImpl || fetch;
  const ollamaBaseUrl = getOllamaBaseUrl(options);
  const ollamaModel = getOllamaModel(options);
  const latestUserPrompt = cleanMessages.filter((m) => m.role === 'user').at(-1)?.content || '';
  const sourcesDigest = await getSourcesForOllama(fetchImpl, latestUserPrompt);
  const today = new Date().toISOString().slice(0, 10);
  const chatMessages = buildOllamaChatMessages(cleanMessages, sourcesDigest, today);

  let response;
  try {
    response = await fetchImpl(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildOllamaRequestBody(ollamaModel, chatMessages, true)),
    });
  } catch {
    const err = new Error(
      `Не удалось подключиться к Ollama (${ollamaBaseUrl}). Установите Ollama, выполните "ollama pull ${ollamaModel}" и запустите "ollama serve".`
    );
    err.status = 500;
    throw err;
  }

  yield* parseOllamaChatStream(response);
}

async function runWithOpenAI(messages, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error('OPENAI_API_KEY не задан.');
    err.status = 500;
    throw err;
  }

  const cleanMessages = sanitizeMessages(messages);
  if (!cleanMessages.length) {
    const err = new Error('Пустой диалог. Передайте messages[].');
    err.status = 400;
    throw err;
  }

  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: [{ role: 'system', content: AGENT_SYSTEM_PROMPT }, ...cleanMessages],
      tools: [{ type: 'web_search_preview' }],
      tool_choice: 'auto',
      temperature: 0.2,
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    const err = new Error(json?.error?.message || 'OpenAI API error');
    err.status = response.status;
    throw err;
  }

  const reply = extractOutputText(json);
  if (!reply) {
    const err = new Error('Модель не вернула текстовый ответ.');
    err.status = 502;
    throw err;
  }

  return reply;
}

export async function runMigrationAgent(messages, options = {}) {
  const provider = (options.provider || process.env.AI_PROVIDER || 'ollama').toLowerCase();
  if (provider === 'openai') {
    return runWithOpenAI(messages, options);
  }
  return runWithOllama(messages, options);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const reply = await runMigrationAgent(req.body?.messages);
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: error?.message || 'Внутренняя ошибка сервера.',
    });
  }
}
