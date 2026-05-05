import { useMemo, useState } from 'react';
import mockData from '../data/mockData.json';
import EuropeMapInteractive from './EuropeMapInteractive';

export default function Geography() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const destinationsForYear = useMemo(() => {
    const yearData = mockData.byYear[String(selectedYear)]?.destinations ?? [];
    const valueById = Object.fromEntries(yearData.map((d) => [d.id, d.value]));
    return mockData.destinations
      .map((d) => ({ ...d, value: valueById[d.id] ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [selectedYear]);

  return (
    <div className="animate-fade-up space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
          Geographic analysis
        </p>
        <h2 className="text-3xl font-bold text-gray-900">Географический анализ</h2>
        <p className="max-w-3xl text-gray-600">
          Карта Европы по данным Eurostat
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EuropeMapInteractive
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            showFlows
            showLegend
          />
        </div>
        <aside className="space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-sm font-semibold text-sky-800">Подсветка стран</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {destinationsForYear.map((d) => (
                <li key={d.id} className="flex justify-between gap-2 border-b border-sky-100 py-2 last:border-0">
                  <span className="text-gray-900">{d.nameEn}</span>
                  <span className="font-mono text-sky-600">{d.value.toLocaleString('ru-RU')}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-panel p-5 text-sm text-gray-600">
            <h3 className="text-sm font-semibold text-sky-800">Легенда потоков</h3>
            <p className="mt-2 leading-relaxed">
              Линии показывают условные коридоры; толщина отражает относительный объём в демо-наборе.
              Узлы с яркой обводкой — приоритетные юрисдикции согласно заданию.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
