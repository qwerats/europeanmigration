import { publicUrl } from '../utils/publicUrl';

export default function MigrationRoutesMapFigure() {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-sky-200/90 bg-white shadow-[0_8px_30px_rgba(14,165,233,0.12)]">
      <div className="border-b border-slate-100 px-5 py-4 text-center sm:px-6 sm:py-5">
        <figcaption className="text-lg font-bold tracking-tight text-[#30618a] sm:text-xl">
          Основные миграционные маршруты в Европу и страны происхождения
        </figcaption>
      </div>
      <div className="px-3 py-4 sm:px-5 sm:py-5">
        <img
          src={publicUrl('images/migration-routes-map.png')}
          alt="Карта: западный (синий), центральный (оранжевый) и восточный (зелёный) средиземноморские маршруты миграции в ЕС; страны происхождения и транзита; стрелки к Испании, Италии и Греции"
          className="mx-auto w-full max-w-5xl rounded-lg"
          loading="lazy"
          decoding="async"
        />
        <p className="mx-auto mt-3 max-w-4xl text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
          Источники: UNHCR; UN/ECFR, European Council on Foreign Relations, 2017. Изображение было
          сгенерировано с помощью Gemini
        </p>
      </div>
    </figure>
  );
}
