import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useAiAssistant } from '../context/AiAssistantContext';
import { clearChatHistory, loadChatHistory, saveChatHistory } from '../lib/agentChatHistory';
import {
  buildMonitorMessages,
  fetchMigrationMonitor,
  formatUpdatedLabel,
  markAutoRunToday,
  msUntilNextLocalMidnight,
  shouldRunDailyAuto,
} from '../lib/migrationMonitorClient';

const STARTER_PROMPTS = [
  'Сделай еженедельный мониторинг новых публикаций Eurostat и IOM.',
  'Проверь новые данные по asylum applications в Германии и Франции.',
  'Сравни изменения residence permits за последний доступный период по Италии и Испании.',
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Я Migration Monitor EU. Сверяю JSON дашборда с baseline. Команды: PAUSE, RESUME, UNSUBSCRIBE, FILTER:DE,FR:Asylum,ResidencePermits.\n\nНажмите «Обновить» в шапке или дождитесь автообновления в 00:00.',
  },
];

function readInitialMessages() {
  const saved = loadChatHistory();
  if (saved.messages?.length) return saved.messages;
  return INITIAL_MESSAGES;
}

export default function MigrationAgentChat({ fullscreen = false }) {
  const inputId = useId();
  const { registerMonitorRefresh, setLastUpdatedAt, lastUpdatedAt, isRefreshing } = useAiAssistant();
  const [messages, setMessages] = useState(readInitialMessages);
  const messagesRef = useRef(messages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const needsMonitorHint = error.toLowerCase().includes('metrics-history') || error.includes('HTTP');

  messagesRef.current = messages;

  useEffect(() => {
    const saved = loadChatHistory();
    if (saved.lastUpdatedAt) setLastUpdatedAt(saved.lastUpdatedAt);
  }, [setLastUpdatedAt]);

  useEffect(() => {
    saveChatHistory(messages, lastUpdatedAt);
  }, [messages, lastUpdatedAt]);

  const handleClearHistory = () => {
    if (!window.confirm('Удалить всю историю переписки с агентом?')) return;
    clearChatHistory();
    setMessages(INITIAL_MESSAGES);
    setError('');
  };

  const runMonitorRefresh = useCallback(
    async (source = 'manual') => {
      setError('');
      setIsLoading(true);

      try {
        const requestMessages = buildMonitorMessages(messagesRef.current, source);
        const { reply } = await fetchMigrationMonitor(requestMessages);

        const stamp =
          source === 'midnight' ? '00:00 · авто' : source === 'auto' ? 'авто за сегодня' : 'по запросу';

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Обновление (${stamp}) · ${formatUpdatedLabel(new Date().toISOString())}\n\n${reply}`,
          },
        ]);
        setLastUpdatedAt(new Date().toISOString());
        return true;
      } catch (err) {
        setError(err?.message || 'Ошибка запроса к агенту мониторинга.');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setLastUpdatedAt]
  );

  useEffect(() => {
    registerMonitorRefresh(runMonitorRefresh);
    return () => registerMonitorRefresh(null);
  }, [registerMonitorRefresh, runMonitorRefresh]);

  useEffect(() => {
    if (!fullscreen) return undefined;

    let cancelled = false;
    let midnightTimerId;

    const runDailyIfNeeded = async (source) => {
      if (cancelled || !shouldRunDailyAuto()) return;
      markAutoRunToday();
      await runMonitorRefresh(source);
    };

    const scheduleMidnight = () => {
      midnightTimerId = window.setTimeout(async () => {
        if (cancelled) return;
        markAutoRunToday();
        await runMonitorRefresh('midnight');
        scheduleMidnight();
      }, msUntilNextLocalMidnight());
    };

    scheduleMidnight();
    const catchUpTimerId = window.setTimeout(() => runDailyIfNeeded('auto'), 400);

    return () => {
      cancelled = true;
      window.clearTimeout(midnightTimerId);
      window.clearTimeout(catchUpTimerId);
    };
  }, [fullscreen, runMonitorRefresh]);

  const sendPrompt = async (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isLoading || isRefreshing) return;

    const nextMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const { reply } = await fetchMigrationMonitor(nextMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      setError(err?.message || 'Ошибка запроса к агенту мониторинга.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendPrompt(input);
  };

  const busy = isLoading || isRefreshing;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!fullscreen && lastUpdatedAt ? (
          <p className="text-xs text-slate-500">Последнее обновление: {formatUpdatedLabel(lastUpdatedAt)}</p>
        ) : (
          <span className="text-xs text-slate-500">История сохраняется в браузере</span>
        )}
        <button
          type="button"
          onClick={handleClearHistory}
          disabled={isLoading || isRefreshing}
          className="text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-800 disabled:opacity-50"
        >
          Очистить историю
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendPrompt(prompt)}
            disabled={busy}
            className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fullscreen && prompt.length > 56 ? `${prompt.slice(0, 56)}…` : prompt}
          </button>
        ))}
      </div>

      <div
        className={[
          'min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-sky-100 bg-white p-3 shadow-inner sm:p-5',
          fullscreen ? '' : 'h-[min(60vh,560px)]',
        ].join(' ')}
      >
        {messages.map((message, idx) => {
          const isUser = message.role === 'user';
          return (
            <article
              key={`${message.role}-${idx}`}
              className={`max-w-[min(100%,52rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:text-[15px] ${
                isUser
                  ? 'ml-auto border border-sky-300 bg-sky-600 text-white'
                  : 'mr-auto border border-slate-200 bg-slate-50 text-slate-800'
              }`}
            >
              <p className="mb-1 text-[11px] font-semibold uppercase opacity-80">
                {isUser ? 'Вы' : 'Migration Monitor EU'}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </article>
          );
        })}
        {busy ? (
          <div className="mr-auto max-w-[min(100%,52rem)] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
            Сверяю датасеты дашборда с baseline…
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 space-y-2 border-t border-sky-100 pt-3">
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Вопрос агенту
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Например: проверь новые публикации Eurostat..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="shrink-0 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Отправить
          </button>
        </div>
      </form>

      {error ? (
        <div className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{error}</p>
          {needsMonitorHint ? (
            <p className="mt-1 text-xs text-red-800/90">
              Проверьте интернет или запустите <code>npm run monitor</code> локально.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
