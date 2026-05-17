import EuPopulationProjectionCard from './EuPopulationProjectionCard';

export default function Statistics() {
  return (
    <div className="animate-fade-up w-full space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header className="w-full">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Проблемы социально-экономического развития
        </h2>
      </header>

      <div className="glass-panel w-full rounded-2xl border border-sky-200/90 border-l-4 border-l-sky-500 px-6 py-8 text-left shadow-[0_8px_30px_rgba(14,165,233,0.12)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
        <p className="w-full text-base font-medium leading-relaxed text-gray-800 sm:text-lg sm:leading-loose lg:text-xl lg:leading-relaxed">
          Несмотря на постоянный рост миграционных потоков, Европейский Союз сталкивается с
          демографическим кризисом, который характеризуется нулевой рождаемостью и старением населения.
        </p>
      </div>

      <EuPopulationProjectionCard />
    </div>
  );
}
