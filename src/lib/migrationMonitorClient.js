import { resolveMigrationAgentApiUrl } from './migrationApiUrl';

const AUTO_MONITOR_PROMPT =
  'Запусти плановый мониторинг всех датасетов дашборда и перечисли изменения.';

const STORAGE_KEY_LAST_AUTO = 'migration-monitor-last-auto-date';

export function getTodayDateKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getLastAutoRunDate() {
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_AUTO) || '';
  } catch {
    return '';
  }
}

export function markAutoRunToday() {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_AUTO, getTodayDateKey());
  } catch {
    /* ignore */
  }
}

export function shouldRunDailyAuto() {
  return getLastAutoRunDate() !== getTodayDateKey();
}

export function msUntilNextLocalMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(1000, next.getTime() - now.getTime());
}

export async function fetchMigrationMonitor(messages) {
  const apiUrl = resolveMigrationAgentApiUrl();
  if (!apiUrl) {
    throw new Error(
      'Агент недоступен на GitHub Pages. Запустите npm run dev локально или задайте VITE_MIGRATION_API_URL на деплой Vercel (например https://your-app.vercel.app).'
    );
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, saveChatHistory: true }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const fallback =
      response.status === 404
        ? 'API агента не найден. Запустите npm run dev или проверьте VITE_MIGRATION_API_URL.'
        : 'Не удалось получить ответ агента мониторинга.';
    throw new Error(payload?.error || fallback);
  }

  const reply = payload?.reply?.trim();
  if (!reply) throw new Error('Агент вернул пустой ответ.');
  return { reply, report: payload?.report };
}

export function buildMonitorMessages(existingMessages, source = 'manual') {
  const label =
    source === 'midnight'
      ? 'автообновление в 00:00'
      : source === 'auto'
        ? 'автообновление за сегодня'
        : 'обновление по запросу';

  return [
    ...existingMessages.filter((m) => m.role === 'user' || m.role === 'assistant'),
    { role: 'user', content: `${AUTO_MONITOR_PROMPT}\n[${label}]` },
  ];
}

export function formatUpdatedLabel(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
