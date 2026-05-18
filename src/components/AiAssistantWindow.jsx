import { useEffect } from 'react';
import { useAiAssistant } from '../context/AiAssistantContext';
import OnSpaceAgentEmbed from './OnSpaceAgentEmbed';

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
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      className="fixed inset-0 z-[80] flex flex-col bg-gradient-to-b from-sky-50/90 via-white to-white"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-600">ИИ-ассистент</p>
          <h2 id="ai-assistant-title" className="text-lg font-bold text-gray-900 sm:text-xl">
            Migration Monitor EU
          </h2>
          <p className="text-xs text-gray-600 sm:text-sm">Задайте вопрос по миграции и данным дашборда</p>
        </div>
        <button
          type="button"
          onClick={closeAssistant}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          aria-label="Закрыть"
        >
          Закрыть
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4">
        <OnSpaceAgentEmbed fill className="min-h-0 flex-1" />
      </div>
    </aside>
  );
}
