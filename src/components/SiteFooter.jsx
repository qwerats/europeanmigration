import { SITE_FOOTER } from '../data/siteFooter';

const ROWS = [
  { label: 'Авторы', value: SITE_FOOTER.authors.join(', ') },
  { label: 'Дисциплина', value: SITE_FOOTER.discipline },
  { label: 'Учебное заведение', value: SITE_FOOTER.institution },
  { label: 'Образовательная программа', value: SITE_FOOTER.program },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-sky-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass-panel w-full rounded-2xl border border-sky-200/90 border-l-4 border-l-sky-500 px-6 py-6 shadow-[0_8px_30px_rgba(14,165,233,0.12)] sm:px-8 sm:py-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Учебная работа</p>

          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
            {ROWS.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-sky-700">{label}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-gray-700 sm:text-base">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 sm:text-sm">© {SITE_FOOTER.year}</p>
      </div>
    </footer>
  );
}
