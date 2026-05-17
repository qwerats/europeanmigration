import { useEffect } from 'react';
import { useAiAssistant } from '../context/AiAssistantContext';
import { formatUpdatedLabel } from '../lib/migrationMonitorClient';
import MigrationAgentChat from './MigrationAgentChat';

export default function AiAssistantWindow() {
  const { isOpen, closeAssistant, lastUpdatedAt, isRefreshing, triggerRefresh } = useAiAssistant();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeAssistant();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeAssistant]);

  if (!isOpen) return null;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-b from-sky-50/90 via-white to-white"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-600">Агент мониторинга</p>
          <h2 id="ai-assistant-title" className="text-lg font-bold text-gray-900 sm:text-xl">
            Migration Monitor EU
          </h2>
          <p className="text-xs text-gray-600 sm:text-sm">
            Сверка JSON дашборда с baseline · автообновление каждый день в 00:00
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {lastUpdatedAt ? (
            <p className="hidden text-xs text-slate-500 sm:block">
              Обновлено:{' '}
              <span className="font-medium text-slate-700">{formatUpdatedLabel(lastUpdatedAt)}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => triggerRefresh('manual')}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5" strokeLinecap="round" />
              <path d="M20 4v5h-5M4 20v-5h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isRefreshing ? 'Обновление…' : 'Обновить'}
          </button>
          <button
            type="button"
            onClick={closeAssistant}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            aria-label="Закрыть"
          >
            Закрыть
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4">
        <MigrationAgentChat fullscreen />
      </div>
    </aside>
  );
}
