import EUMigrationTrendCard from './EUMigrationTrendCard';
import MigrationRoutesMapFigure from './MigrationRoutesMapFigure';
import MediterraneanRoutesStackedBar from './MediterraneanRoutesStackedBar';
import EuBigFiveMigrantsLineCompact from './EuBigFiveMigrantsLineCompact';
import TopMigrantsByCountryBar from './TopMigrantsByCountryBar';
import ResidencePermitsByReasonCard from './ResidencePermitsByReasonCard';
import AsylumApplicationsChart from './AsylumApplicationsChart';

export default function Dashboard() {
  return (
    <div className="animate-fade-up-soft space-y-10 [animation-fill-mode:forwards]">
      <section className="w-full space-y-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Миграционный дэшборд
        </h2>
        <div className="glass-panel w-full rounded-2xl border border-sky-200/90 border-l-4 border-l-sky-500 px-6 py-8 text-left shadow-[0_8px_30px_rgba(14,165,233,0.12)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 sm:text-sm">Определение</p>
          <p className="mt-4 w-full text-base font-medium leading-relaxed text-gray-800 sm:text-lg sm:leading-loose lg:text-xl lg:leading-relaxed">
            <span className="font-semibold text-gray-900">Мигрант</span> — любое лицо, которое перемещается
            через международную границу или внутри государства и покинуло место своего обычного жительства,
            независимо от юридического статуса лица; характера перемещения (добровольно / недобровольно);
            продолжительности пребывания.
          </p>
          <p className="mt-3 text-xs text-slate-500 sm:text-sm">Источник: ООН</p>
        </div>
      </section>

      <section className="space-y-6">
        <EUMigrationTrendCard />
        <MigrationRoutesMapFigure />
        <MediterraneanRoutesStackedBar />
        <p className="mx-auto max-w-4xl px-4 py-6 text-left text-xl font-bold leading-relaxed text-gray-900 sm:px-6 sm:py-8 sm:text-2xl sm:leading-snug">
          Германия остаётся лидером по привлечению мигрантов на протяжении 15 лет (с 2010 по 2025).
        </p>
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <TopMigrantsByCountryBar />
          </div>
          <div className="min-w-0">
            <EuBigFiveMigrantsLineCompact />
          </div>
        </div>

        <ResidencePermitsByReasonCard />
        <AsylumApplicationsChart />
      </section>
    </div>
  );
}
