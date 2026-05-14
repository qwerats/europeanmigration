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
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 3500) }));
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

async function fetchSourceSnapshot(url, fetchImpl, textMaxLen = 1200) {
  try {
    const response = await fetchImpl(url, {
      headers: {
        'User-Agent': 'MigrationMonitor-EU-Agent/1.0',
      },
    });
    if (!response.ok) {
      return `Источник: ${url}\nСтатус: недоступен (${response.status})`;
    }
    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1], 180) : 'Без заголовка';
    const text = stripHtml(html, textMaxLen);
    return `Источник: ${url}\nЗаголовок: ${title}\nФрагмент: ${text}`;
  } catch (err) {
    return `Источник: ${url}\nОшибка: ${err?.message || 'не удалось получить данные'}`;
  }
}

async function collectPrioritySources(fetchImpl) {
  const sources = [
    'https://ec.europa.eu/eurostat/web/migration-asylum/overview',
    'https://www.iom.int/data-and-research',
    'https://www.destatis.de/EN/Themes/Society-Environment/Population/Migration/_node.html',
    'https://www.insee.fr/en/statistiques',
    'https://www.istat.it/en/population-and-households',
    'https://www.ine.es/en/index.htm',
  ];
  const snapshots = await Promise.all(sources.map((url) => fetchSourceSnapshot(url, fetchImpl)));
  return snapshots.join('\n\n');
}

/** Кэш HTML-снапшотов между запросами (не дергать 6 сайтов на каждый вопрос). */
let sourcesCache = { digest: '', expiresAt: 0 };

function getSourcesCacheTtlMs() {
  const raw = process.env.MIGRATION_SOURCES_CACHE_MS;
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n >= 30_000) return n;
  return 15 * 60 * 1000;
}

async function getCachedPrioritySources(fetchImpl) {
  const now = Date.now();
  if (sourcesCache.digest && now < sourcesCache.expiresAt) {
    return sourcesCache.digest;
  }
  const digest = await collectPrioritySources(fetchImpl);
  sourcesCache = { digest, expiresAt: now + getSourcesCacheTtlMs() };
  return digest;
}

const OLLAMA_SOURCES_DIGEST_MAX = 7000;

function buildOllamaUserPrompt(cleanMessages, sourcesDigest, today) {
  const latestUserPrompt = cleanMessages.filter((m) => m.role === 'user').at(-1)?.content || '';
  let digest = sourcesDigest;
  if (digest.length > OLLAMA_SOURCES_DIGEST_MAX) {
    digest = `${digest.slice(0, OLLAMA_SOURCES_DIGEST_MAX)}\n\n[…снапшоты источников сокращены для скорости]`;
  }
  return [
    `Текущая дата: ${today}.`,
    AGENT_SYSTEM_PROMPT,
    'Ниже снапшоты приоритетных источников (могут быть кэшированы несколько минут; если недоступны — отмечено в тексте):',
    digest,
    'История диалога:',
    ...cleanMessages.map((m) => `${m.role === 'assistant' ? 'assistant' : 'user'}: ${m.content}`),
    `Текущий запрос пользователя: ${latestUserPrompt}`,
  ].join('\n\n');
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
  const ollamaBaseUrl = options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || 'llama3.1:8b';
  const sourcesDigest = await getCachedPrioritySources(fetchImpl);
  const today = new Date().toISOString().slice(0, 10);
  const finalPrompt = buildOllamaUserPrompt(cleanMessages, sourcesDigest, today);

  let response;
  try {
    response = await fetchImpl(`${ollamaBaseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 4096,
        },
      }),
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
        'Ollama недоступен. Запустите `ollama serve` и загрузите модель `ollama pull llama3.1:8b`.'
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
  const ollamaBaseUrl = options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
  const ollamaModel = options.ollamaModel || process.env.OLLAMA_MODEL || 'llama3.1:8b';
  const sourcesDigest = await getCachedPrioritySources(fetchImpl);
  const today = new Date().toISOString().slice(0, 10);
  const finalPrompt = buildOllamaUserPrompt(cleanMessages, sourcesDigest, today);

  let response;
  try {
    response = await fetchImpl(`${ollamaBaseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: [
          {
            role: 'user',
            content: finalPrompt,
          },
        ],
        stream: true,
        options: {
          temperature: 0.2,
          num_predict: 4096,
        },
      }),
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
