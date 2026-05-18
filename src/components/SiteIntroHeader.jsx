import { Link, useLocation, useNavigate } from 'react-router-dom';
import { publicUrl } from '../utils/publicUrl';
import SiteMapBar from './SiteMapBar';

const NAV_LINKS = [
  { label: 'Домой', type: 'home' },
  { label: 'О сайте', type: 'path', to: '/about' },
  { label: 'Контакты', type: 'path', to: '/contact' },
  { label: 'Источники', type: 'path', to: '/resources' },
];

const linkClass =
  'transition hover:text-[#103772] hover:underline hover:decoration-sky-400 hover:underline-offset-4';

function scrollToIntro() {
  const run = () => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  run();
  window.setTimeout(run, 80);
  window.setTimeout(run, 280);
}

export default function SiteIntroHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goHome = (e) => {
    e?.preventDefault?.();
    if (pathname === '/') {
      navigate({ pathname: '/', hash: '' });
      scrollToIntro();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-[55] shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
      <div className="border-b border-slate-300 bg-[#103772] py-3">
        <div className="mx-auto flex max-w-6xl justify-center">
          <Link
            to="/"
            onClick={goHome}
            className="rounded-xl outline-none ring-offset-2 ring-offset-[#103772] focus-visible:ring-2 focus-visible:ring-sky-300"
            aria-label="На главную"
          >
            <img
              src={publicUrl('branding/migration-logo.svg')}
              alt="Логотип проекта"
              className="h-14 w-14 rounded-xl bg-white p-1 shadow-md"
            />
          </Link>
        </div>
      </div>

      <nav className="border-b border-slate-300 bg-white" aria-label="Основная навигация сайта">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#1c3767]">
          {NAV_LINKS.map((item) => {
            if (item.type === 'home') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={goHome}
                  className={`cursor-pointer bg-transparent font-semibold uppercase tracking-wide text-[#1c3767] ${linkClass}`}
                >
                  {item.label}
                </button>
              );
            }
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  linkClass,
                  'font-semibold uppercase tracking-wide',
                  isActive ? 'text-[#103772] underline decoration-sky-400 underline-offset-4' : 'text-[#1c3767]',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
          <SiteMapBar linkClass={linkClass} />
        </div>
      </nav>
    </header>
  );
}
