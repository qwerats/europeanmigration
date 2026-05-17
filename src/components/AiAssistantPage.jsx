import MigrationAgentChat from './MigrationAgentChat';

export default function AiAssistantPage() {
  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6 px-4 py-12 opacity-0 [animation-fill-mode:forwards] sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">ИИ-ассистент</p>
        <h2 className="text-3xl font-bold text-gray-900">MigrationMonitor EU · Web Intelligence Agent</h2>
        <p className="max-w-4xl text-gray-600">
          Агент работает как чат: при локальном Ollama ответ идёт{' '}
          <span className="font-medium text-sky-800">потоком</span>, снапшоты сайтов Eurostat/IOM и др.{' '}
          <span className="font-medium text-sky-800">кэшируются на 15 минут</span>.
        </p>
      </header>

      <section className="glass-panel chart-glow space-y-4 p-4 sm:p-5">
        <MigrationAgentChat />
      </section>
    </div>
  );
}
