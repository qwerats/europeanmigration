const AI_AGENT_URL = 'https://react-9bhebz.onspace.build';

export default function AiAssistantPage() {
  return (
    <div className="animate-fade-up space-y-6 opacity-0 [animation-fill-mode:forwards]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">ИИ-ассистент</p>
        <h2 className="text-3xl font-bold text-gray-900">MigrationMonitor EU · полный функционал</h2>
        <p className="max-w-3xl text-gray-600">
          Здесь открывается ваша среда onSpace с агентом. Если встроенный просмотр недоступен из-за
          политики сайта, воспользуйтесь ссылкой ниже.
        </p>
        <p className="text-sm">
          <a
            href={AI_AGENT_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-2 transition hover:text-sky-900"
          >
            Открыть агента в новой вкладке
          </a>
        </p>
      </header>

      <section className="glass-panel chart-glow overflow-hidden p-0 shadow-glass">
        <iframe
          title="ИИ-ассистент MigrationMonitor EU"
          src={AI_AGENT_URL}
          className="h-[min(78vh,820px)] w-full border-0 bg-white"
          allow="clipboard-read; clipboard-write; microphone"
        />
      </section>
    </div>
  );
}
