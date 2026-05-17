import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(__dirname, '..');
const WEB_CHAT_SUBSCRIBER = 'web-chat@local';

export const EMAIL_COMMAND_HELP = `Gmail/IMAP команды (в теме или теле письма, отдельной строкой):
UNSUBSCRIBE — отписаться от дайджестов
PAUSE — приостановить уведомления
RESUME — возобновить уведомления
FILTER:DE,FR:Asylum,ResidencePermits — только Германия/Франция, темы убежище и ВНЖ

Коды стран: DE, FR, IT, ES (или Germany, France…).
Темы: Asylum, ResidencePermits, Fertility, Population, Ageing, Routes, Permits, BigFive, Immigration.`;

const COUNTRY_CODE_MAP = {
  DE: ['Germany', 'Германия'],
  FR: ['France', 'Франция'],
  IT: ['Italy', 'Италия'],
  ES: ['Spain', 'Испания'],
};

const TOPIC_MAP = {
  ASYLUM: { sourceKeys: ['asylum'], metricNeedles: ['asylum', 'убежищ'] },
  RESIDENCEPERMITS: { sourceKeys: ['permits'], metricNeedles: ['residence', 'внж', 'permits'] },
  PERMITS: { sourceKeys: ['permits'], metricNeedles: ['residence', 'внж', 'permits'] },
  FERTILITY: { sourceKeys: ['fertility'], metricNeedles: ['fertility', 'рождаем'] },
  POPULATION: { sourceKeys: ['population'], metricNeedles: ['population', 'населен'] },
  AGEING: { sourceKeys: ['ageing'], metricNeedles: ['ageing', 'старен'] },
  ROUTES: { sourceKeys: ['routes'], metricNeedles: ['border', 'маршрут', 'frontex'] },
  BIGFIVE: { sourceKeys: ['bigFive'], metricNeedles: ['big five', 'мигрант'] },
  IMMIGRATION: { sourceKeys: ['immigration', 'foreignBorn', 'aggregateFlows'], metricNeedles: [] },
};

function normalizeEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  return e.includes('@') ? e : WEB_CHAT_SUBSCRIBER;
}

function subscribersPath(root) {
  return path.join(root, 'data', 'email-subscribers.json');
}

async function readState(root) {
  try {
    const raw = await fs.readFile(subscribersPath(root), 'utf8');
    const data = JSON.parse(raw);
    if (!data.subscribers || typeof data.subscribers !== 'object') {
      return { subscribers: {} };
    }
    return data;
  } catch {
    return { subscribers: {} };
  }
}

async function writeState(root, state) {
  await fs.mkdir(path.join(root, 'data'), { recursive: true });
  await fs.writeFile(subscribersPath(root), `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function extractCommandLines(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const commands = [];
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (/^(UNSUBSCRIBE|PAUSE|RESUME)$/.test(upper)) {
      commands.push({ type: upper.toLowerCase() });
      continue;
    }
    const filterMatch = line.match(/^FILTER:\s*([^:\n]+)(?::\s*(.+))?$/i);
    if (filterMatch) {
      commands.push({
        type: 'filter',
        countries: filterMatch[1],
        topics: filterMatch[2] || '',
      });
    }
  }
  return commands;
}

export function parseFilterSpec(countriesPart, topicsPart) {
  const countries = String(countriesPart || '')
    .split(/[,;]+/)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const topics = String(topicsPart || '')
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return { countries, topics };
}

export function filterRecordsBySubscriber(records, filter) {
  if (!filter) return records;
  const countryCodes = (filter.countries || []).map((c) => c.toUpperCase());
  const topicKeys = (filter.topics || []).map((t) =>
    String(t)
      .replace(/[\s_-]+/g, '')
      .toUpperCase()
  );

  if (!countryCodes.length && !topicKeys.length) return records;

  const countryNames = new Set();
  for (const code of countryCodes) {
    const names = COUNTRY_CODE_MAP[code];
    if (names) names.forEach((n) => countryNames.add(n));
    if (code === 'GERMANY') ['Germany', 'Германия'].forEach((n) => countryNames.add(n));
    if (code === 'FRANCE') ['France', 'Франция'].forEach((n) => countryNames.add(n));
    if (code === 'ITALY') ['Italy', 'Италия'].forEach((n) => countryNames.add(n));
    if (code === 'SPAIN') ['Spain', 'Испания'].forEach((n) => countryNames.add(n));
  }

  const topicDefs = topicKeys.map((k) => TOPIC_MAP[k]).filter(Boolean);

  return records.filter((row) => {
    const countryOk =
      !countryNames.size ||
      countryNames.has(row.country) ||
      (row.country === 'EU' && topicDefs.length > 0);

    let topicOk = !topicDefs.length;
    if (topicDefs.length) {
      topicOk = topicDefs.some((def) => {
        if (def.sourceKeys.includes(row.sourceKey)) return true;
        const metric = String(row.metric || '').toLowerCase();
        return def.metricNeedles.some((needle) => metric.includes(needle));
      });
    }

    return countryOk && topicOk;
  });
}

export async function getSubscriber(root, email) {
  const state = await readState(root);
  return state.subscribers[normalizeEmail(email)] || null;
}

export async function getEffectiveFilter(root, email) {
  const sub = await getSubscriber(root, email);
  if (!sub || sub.status === 'unsubscribed' || sub.status === 'paused') return null;
  return sub.filter || null;
}

/**
 * @returns {Promise<{ handled: boolean, message: string, subscriber?: object }>}
 */
export async function applyEmailCommands({ text, email, root = DEFAULT_ROOT }) {
  const commands = extractCommandLines(text);
  if (!commands.length) {
    return { handled: false, message: '' };
  }

  const key = normalizeEmail(email);
  const state = await readState(root);
  const now = new Date().toISOString();
  let sub = state.subscribers[key] || {
    status: 'active',
    filter: { countries: [], topics: [] },
    updatedAt: now,
  };

  const replies = [];

  for (const cmd of commands) {
    if (cmd.type === 'unsubscribe') {
      sub.status = 'unsubscribed';
      replies.push('Вы отписаны от дайджестов Migration Monitor EU.');
    } else if (cmd.type === 'pause') {
      sub.status = 'paused';
      replies.push('Уведомления приостановлены. Отправьте RESUME для возобновления.');
    } else if (cmd.type === 'resume') {
      sub.status = 'active';
      replies.push('Уведомления возобновлены.');
    } else if (cmd.type === 'filter') {
      sub.status = sub.status === 'unsubscribed' ? 'active' : sub.status;
      sub.filter = parseFilterSpec(cmd.countries, cmd.topics);
      const c = sub.filter.countries.join(', ') || 'все страны';
      const t = sub.filter.topics.join(', ') || 'все темы';
      replies.push(`Фильтр сохранён: страны [${c}], темы [${t}].`);
    }
  }

  sub.updatedAt = now;
  state.subscribers[key] = sub;
  await writeState(root, state);

  return {
    handled: true,
    message: replies.join('\n'),
    subscriber: sub,
  };
}

export function buildFilterPromptFromSubscriber(filter) {
  if (!filter) return '';
  const parts = [];
  if (filter.countries?.length) parts.push(...filter.countries);
  if (filter.topics?.length) parts.push(...filter.topics);
  return parts.join(' ');
}

export async function shouldSkipMonitorForSubscriber(root, email) {
  const sub = await getSubscriber(root, email);
  if (!sub) return { skip: false, reason: '' };
  if (sub.status === 'unsubscribed') {
    return { skip: true, reason: 'Подписка отменена (UNSUBSCRIBE). Отправьте RESUME, чтобы снова получать отчёты.' };
  }
  if (sub.status === 'paused') {
    return { skip: true, reason: 'Уведомления на паузе (PAUSE). Отправьте RESUME.' };
  }
  return { skip: false, reason: '' };
}

export function isEmailCommandOnly(text) {
  if (!extractCommandLines(text).length) return false;
  const rest = String(text || '')
    .replace(/^(UNSUBSCRIBE|PAUSE|RESUME)\s*$/gim, '')
    .replace(/^FILTER:\s*[^\n]+$/gim, '')
    .trim();
  return !rest;
}

export { WEB_CHAT_SUBSCRIBER, DEFAULT_ROOT };
