import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SHOW_SITE_HEADER } from '../config/showSiteHeader';
import { onePagerHashHref, publicUrl } from '../utils/publicUrl';
import SiteFooter from './SiteFooter';

const SECTION_IDS = ['intro', 'introduction', 'home', 'statistics', 'forecast', 'methodology'];

const nav = [
  { id: 'home', label: 'Главная' },
  { id: 'statistics', label: 'Статистика' },
  { id: 'forecast', label: 'Прогноз' },
  { id: 'methodology', label: 'ИИ-ассистент' },
];

function scrollSectionIntoView(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Layout({ children }) {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('intro');

  const isOnePager = pathname === '/';

  useEffect(() => {
    if (!isOnePager || hash !== '#geography') return undefined;
    navigate({ pathname: '/', hash: 'statistics' }, { replace: true });
    return undefined;
  }, [isOnePager, hash, navigate]);

  useEffect(() => {
    if (!isOnePager || !hash) return undefined;
    const target = hash.replace(/^#/, '');
    if (!target) return undefined;
    const timerId = window.setTimeout(() => scrollSectionIntoView(target), 50);
    return () => window.clearTimeout(timerId);
  }, [isOnePager, hash]);

  useEffect(() => {
    if (!SHOW_SITE_HEADER || !isOnePager) return undefined;

    const sectionEls = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (sectionEls.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isOnePager, SHOW_SITE_HEADER]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (isOnePager) {
      if (id === 'intro') {
        navigate({ pathname: '/', hash: '' }, { replace: true });
        window.setTimeout(() => scrollSectionIntoView('intro'), 0);
      } else {
        navigate({ pathname: '/', hash: id });
      }
    } else {
      navigate(id === 'intro' ? '/' : { pathname: '/', hash: id });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-gray-900">
      {SHOW_SITE_HEADER ? (
        <header className="sticky top-0 z-50 border-b border-sky-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <a
              href={import.meta.env.BASE_URL}
              onClick={(e) => handleNavClick(e, 'intro')}
              className="flex min-w-0 items-center gap-3 sm:gap-4 rounded-lg outline-none ring-offset-2 ring-offset-white focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <img
                src={publicUrl('branding/migration-logo.svg')}
                alt="Логотип: миграционные потоки ЕС"
                className="h-16 w-16 shrink-0 rounded-xl border border-sky-200/90 bg-white p-1.5 shadow-md sm:h-20 sm:w-20"
                width={80}
                height={80}
              />
              <h1 className="min-w-0 text-base font-semibold leading-snug tracking-tight text-gray-900 sm:text-lg md:text-xl">
                Миграционные потоки Европейского союза
              </h1>
            </a>

            <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Основная навигация">
              {nav.map(({ id, label }) => {
                const isActive = isOnePager && activeId === id;
                return (
                  <a
                    key={id}
                    href={onePagerHashHref(id)}
                    onClick={(e) => handleNavClick(e, id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={[
                      'group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-sky-100 text-sky-800 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.45)]'
                        : 'text-gray-700 hover:scale-[1.02] hover:bg-sky-50 hover:text-gray-900',
                    ].join(' ')}
                  >
                    <span className="text-sky-500 transition-transform group-hover:scale-110">◆</span>
                    {label}
                  </a>
                );
              })}
            </nav>
          </div>
        </header>
      ) : null}

      <main className="w-full max-w-none px-0 py-0">{children}</main>

      <button
        type="button"
        onClick={() => navigate('/methodology')}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white/95 px-4 py-2 text-sm font-semibold text-sky-800 shadow-lg backdrop-blur transition hover:scale-[1.02] hover:bg-sky-50"
        aria-label="Открыть ИИ-агента мониторинга"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white">
          AI
        </span>
        AI-агент
      </button>

      <SiteFooter />
    </div>
  );
}
