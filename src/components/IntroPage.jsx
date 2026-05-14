import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SHOW_SITE_HEADER } from '../config/showSiteHeader';
import { publicUrl } from '../utils/publicUrl';
import { attachParticleNetwork } from '../utils/particleNetworkCanvas.js';

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
  const particleCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return undefined;
    return attachParticleNetwork(canvas);
  }, []);
  const sectionMinH = SHOW_SITE_HEADER ? 'min-h-[calc(100vh-6.5rem)]' : 'min-h-screen';
  const heroMinH = SHOW_SITE_HEADER ? 'min-h-[calc(100vh-6.5rem)]' : 'min-h-screen';
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
    <section
      className={`relative ${sectionMinH} w-full min-w-0 max-w-none overflow-x-hidden bg-[#0a1a32] text-slate-900`}
    >
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
        className={`hero flex w-full min-w-0 items-end justify-center ${INTRO_BAR_PT} ${heroMinH}`}
      >
        <canvas
          id="particleCanvas"
          ref={particleCanvasRef}
          className="pointer-events-none"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0c1f3d_0%,#1a3a63_32%,#1e3a5f_68%,#0a1a32_100%)]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.34] sm:opacity-[0.4]">
            <img
              src={publicUrl('branding/eu-map-bg.svg')}
              alt=""
              className="h-full min-h-[55%] w-full object-cover object-[center_58%] select-none"
              draggable={false}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.08)_45%,rgba(5,18,40,0.55)_100%)]"
          aria-hidden
        />

        <div className="relative z-20 mb-24 flex max-w-5xl flex-col items-center px-4 pb-2 text-center text-white sm:mb-28">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight drop-shadow-md sm:text-4xl md:text-5xl">
            Анализ миграционных потоков в Европейском союзе
          </h2>
          <button
            type="button"
            onClick={() => goToSection('home')}
            className="mt-6 inline-flex cursor-pointer rounded-lg bg-[#1c4fa8] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition hover:bg-[#215ec5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            Узнать больше
          </button>
        </div>

        <button
          type="button"
          onClick={() => goToSection('home')}
          className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white animate-pulse drop-shadow-[0_0_14px_rgba(255,255,255,0.55)] transition hover:animate-none hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:bottom-4"
          aria-label="Прокрутить вниз к разделу Главная"
        >
          <svg
            className="h-9 w-9 stroke-[2.5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
          <span className="text-sm font-bold uppercase tracking-[0.28em]">Вниз</span>
        </button>
      </div>
    </section>
  );
}
