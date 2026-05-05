import mockData from '../data/mockData.json';

export default function Methodology() {
  const { sources, stack, ai } = mockData.methodology;

  return (
    <div className="animate-fade-up space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
          Methodology &amp; provenance
        </p>
        <h2 className="text-3xl font-bold text-gray-900">Методология и AI-контент</h2>
        <p className="max-w-3xl text-gray-600">
          Прозрачность источников и стека, как в публичных порталах EC и OECD. Ниже — ориентиры для
          реального проекта; текущие цифры на сайте агрегированы для демонстрации интерфейса.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-800">Источники</h3>
          <ul className="mt-4 space-y-4">
            {sources.map((s) => (
              <li key={s.name} className="border-b border-sky-100 pb-4 last:border-0 last:pb-0">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base font-medium text-sky-700 transition hover:text-sky-900"
                >
                  {s.name}
                </a>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-800">
            Используемые технологии
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {stack.map((t) => (
              <li
                key={t}
                className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm text-gray-900"
              >
                {t}
              </li>
            ))}
          </ul>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-sky-800">
            AI-инструменты в контуре продукта
          </h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-600">
            {ai.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="glass-panel p-6 text-sm text-gray-600">
        <p className="leading-relaxed">
          Интерфейс использует светлую тему с чёрной типографикой Inter, голубые акценты на графиках и
          карте и спокойные панели для чтения показателей.
        </p>
      </section>
    </div>
  );
}
