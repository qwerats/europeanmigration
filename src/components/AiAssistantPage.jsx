import MigrationAgentChat from './MigrationAgentChat';

export default function AiAssistantPage() {
  return (
    <div className="mx-auto max-w-7xl animate-fade-up space-y-6 px-4 py-12 opacity-0 [animation-fill-mode:forwards] sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">Агент мониторинга</p>
        <h2 className="text-3xl font-bold text-gray-900">Migration Monitor EU</h2>
        <p className="max-w-4xl text-gray-600">
          Агент сверяет JSON дашборда с baseline (<code>data/metrics-history.json</code>), отмечает новые
          периоды и отклонения &gt;5% и предлагает, какие блоки обновить. Ответ обычно за несколько секунд.
          В чате или в ответе на письмо можно отправить:{' '}
          <code className="text-xs">UNSUBSCRIBE</code>, <code className="text-xs">PAUSE</code>,{' '}
          <code className="text-xs">RESUME</code>,{' '}
          <code className="text-xs">FILTER:DE,FR:Asylum,ResidencePermits</code>.
        </p>
      </header>

      <section className="glass-panel chart-glow space-y-4 p-4 sm:p-5">
        <MigrationAgentChat />
      </section>
    </div>
  );
}
