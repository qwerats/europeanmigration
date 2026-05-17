import { useEffect, useState } from 'react';
import { publicUrl } from '../utils/publicUrl';
import EUMigrationTrendCard from './EUMigrationTrendCard';
import MigrationRoutesMapFigure from './MigrationRoutesMapFigure';
import MediterraneanRoutesStackedBar from './MediterraneanRoutesStackedBar';
import EuBigFiveMigrantsLineCompact from './EuBigFiveMigrantsLineCompact';
import TopMigrantsByCountryBar from './TopMigrantsByCountryBar';
import ResidencePermitsByReasonCard from './ResidencePermitsByReasonCard';

export default function Dashboard() {
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowAvatarPrompt(true), 450);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="animate-fade-up-soft space-y-10 [animation-fill-mode:forwards]">
      <section className="w-full space-y-5 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Миграционный дэшборд
        </h2>
        <div className="glass-panel w-full rounded-2xl border border-sky-200/90 border-l-4 border-l-sky-500 px-6 py-6 text-left shadow-[0_8px_30px_rgba(14,165,233,0.12)] sm:px-8 sm:py-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Определение</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-700 sm:text-base">
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
          Германия остаётся лидером по привлечению мигрантов на протяжении 10 лет (с 2010 по 2025).
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
      </section>

      {showAvatarPrompt ? (
        <div className="fixed right-4 top-4 z-40 w-[250px] animate-fade-up rounded-xl border border-sky-200 bg-white/95 p-3 opacity-0 shadow-card [animation-fill-mode:forwards]">
          <p className="text-xs leading-relaxed text-gray-700">
            Нужна короткая справка по проекту? Открой ИИ-аватара.
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAvatarOpen(true);
                setShowAvatarPrompt(false);
              }}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              Открыть
            </button>
            <button
              type="button"
              onClick={() => setShowAvatarPrompt(false)}
              className="rounded-md border border-sky-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-sky-50"
            >
              Скрыть
            </button>
          </div>
        </div>
      ) : null}

      {!isAvatarOpen && !showAvatarPrompt ? (
        <button
          type="button"
          onClick={() => setIsAvatarOpen(true)}
          className="fixed right-4 top-4 z-40 rounded-full border border-sky-300 bg-white/95 px-3 py-2 text-xs font-semibold text-sky-800 shadow-card transition hover:bg-sky-50"
        >
          ИИ-аватар
        </button>
      ) : null}

      {isAvatarOpen ? (
        <div className="fixed right-4 top-20 z-40 w-[230px] sm:w-[260px] animate-fade-up opacity-0 [animation-fill-mode:forwards]">
          <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-sky-50 shadow-glass">
            <button
              type="button"
              onClick={() => setIsAvatarOpen(false)}
              className="absolute right-2 top-2 z-10 rounded-full bg-white/95 px-2 py-1 text-[11px] font-semibold text-gray-700 shadow"
            >
              X
            </button>
            <video
              className="h-[300px] w-full object-cover"
              src={publicUrl('avatar/heygen-avatar.mp4')}
              autoPlay
              playsInline
              controls
              onEnded={() => setIsAvatarOpen(false)}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-sky-100/80 to-transparent" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
