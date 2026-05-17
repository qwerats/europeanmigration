import { useEffect } from 'react';
import { useAiAssistant } from '../context/AiAssistantContext';
import MigrationAgentChat from './MigrationAgentChat';

export default function AiAssistantWindow() {
  const { isOpen, closeAssistant } = useAiAssistant();

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
  <>
    <button
      type="button"
      aria-label="Закрыть окно ИИ-ассистента"
      className="fixed inset-0 z-[65] bg-slate-900/25 backdrop-blur-[1px] sm:bg-slate-900/15"
      onClick={closeAssistant}
    />
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      className="fixed bottom-20 right-4 z-[70] flex max-h-[min(88vh,720px)] w-[min(calc(100vw-2rem),440px)] flex-col overflow-hidden rounded-2xl border border-sky-200/90 bg-white shadow-[0_20px_60px_rgba(14,165,233,0.22)] sm:right-5"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-600">ИИ-ассистент</p>
          <h2 id="ai-assistant-title" className="mt-0.5 text-base font-bold leading-snug text-gray-900 sm:text-lg">
            Мониторинг миграции + web chat
          </h2>
          <p className="mt-0.5 text-xs text-gray-600">
            <span className="font-medium text-sky-700">MigrationMonitor EU</span>
          </p>
        </div>
        <button
          type="button"
          onClick={closeAssistant}
          className="shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Закрыть"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
        <MigrationAgentChat compact />
      </div>
    </aside>
  </>
  );
}
