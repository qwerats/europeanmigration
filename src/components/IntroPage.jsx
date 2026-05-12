import { Link, useNavigate } from 'react-router-dom';
import { SHOW_SITE_HEADER } from '../config/showSiteHeader';
import { publicUrl } from '../utils/publicUrl';

const INTRO_LINKS = [
  { label: 'Home', scrollToId: 'intro' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Resources', to: '/resources' },
];

const linkClass =
  'transition hover:text-[#103772] hover:underline hover:decoration-sky-400 hover:underline-offset-4';

/** Высота плашки (синяя + белая) — отступ для контента под fixed-баром */
const INTRO_BAR_PT = SHOW_SITE_HEADER ? 'pt-[13.5rem]' : 'pt-40';

export default function IntroPage() {
  const navigate = useNavigate();
  const sectionMinH = SHOW_SITE_HEADER ? 'min-h-[calc(100vh-6.5rem)]' : 'min-h-screen';

  const goToSection = (id) => {
    if (id === 'intro') {
      navigate({ pathname: '/', hash: '' });
    } else {
      navigate({ pathname: '/', hash: id });
    }
    const run = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    run();
    window.setTimeout(run, 80);
    window.setTimeout(run, 280);
  };

  return (
    <section className={`relative ${sectionMinH} w-full overflow-x-hidden bg-[#eef1f5] text-slate-900`}>
      <div
        className={`fixed left-0 right-0 shadow-[0_4px_20px_rgba(0,0,0,0.12)] ${
          SHOW_SITE_HEADER ? 'top-24 z-40' : 'top-0 z-[55]'
        }`}
      >
        <div className="border-b border-slate-300 bg-[#103772] py-3">
          <div className="mx-auto flex max-w-6xl justify-center">
            <img
              src={publicUrl('branding/migration-logo.svg')}
              alt="Логотип проекта"
              className="h-14 w-14 rounded-xl bg-white p-1 shadow-md"
            />
          </div>
        </div>

        <nav className="border-b border-slate-300 bg-white" aria-label="Навигация вступления">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#1c3767]">
            {INTRO_LINKS.map((item) =>
              item.scrollToId ? (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goToSection(item.scrollToId)}
                  className={`cursor-pointer bg-transparent font-semibold uppercase tracking-wide text-[#1c3767] ${linkClass}`}
                >
                  {item.label}
                </button>
              ) : (
                <Link key={item.label} to={item.to} className={linkClass}>
                  {item.label}
                </Link>
              )
            )}
          </div>
        </nav>
      </div>

      <div
        className={`relative flex items-end justify-center overflow-hidden ${INTRO_BAR_PT} ${
          SHOW_SITE_HEADER ? 'min-h-[calc(100vh-13.5rem)]' : 'min-h-[calc(100vh-8rem)]'
        }`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f3f4f6_0%,#e8ebef_48%,#c9d6e8_100%)]" />

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.42] sm:opacity-[0.48]"
          aria-hidden
        >
          <img
            src={publicUrl('branding/eu-map-bg.svg')}
            alt=""
            className="max-h-[min(72vh,520px)] w-full max-w-5xl object-contain object-center select-none"
            draggable={false}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,rgba(9,34,80,0.05)_0%,rgba(10,42,97,0.88)_55%,#0a2a61_100%)]" />

        <div className="relative z-20 mb-16 flex max-w-5xl flex-col items-center px-4 text-center text-white">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Анализ миграционных потоков в Европейском союзе
          </h2>
          <button
            type="button"
            onClick={() => goToSection('home')}
            className="mt-6 inline-flex cursor-pointer rounded-md border border-sky-200 bg-[#1c4fa8] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#215ec5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Узнать больше
          </button>
        </div>
      </div>
    </section>
  );
}
