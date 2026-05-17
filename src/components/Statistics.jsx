import EuPopulationProjectionCard from './EuPopulationProjectionCard';

export default function Statistics() {
  return (
    <div className="animate-fade-up space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">
          Проблемы социально-экономического развития
        </h2>
      </header>

      <div className="glass-panel max-w-4xl rounded-2xl border border-sky-200/90 border-l-4 border-l-sky-500 px-6 py-6 text-left sm:px-8 sm:py-7">
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          Несмотря на постоянный рост миграционных потоков, Европейский Союз сталкивается с
          демографическим кризисом, который характеризуется нулевой рождаемостью и старением населения.
        </p>
      </div>

      <EuPopulationProjectionCard />
    </div>
  );
}
