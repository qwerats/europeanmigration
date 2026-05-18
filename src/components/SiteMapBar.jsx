import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SITE_NAV_LINKS } from '../data/siteNavLinks';

function scrollToSection(id) {
  const run = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  run();
  window.setTimeout(run, 80);
  window.setTimeout(run, 280);
}

export default function SiteMapBar({ linkClass = '' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const goToSection = (id) => {
    setOpen(false);
    if (id === 'intro') {
      navigate({ pathname: '/', hash: '' });
    } else {
      navigate({ pathname: '/', hash: id });
    }
    scrollToSection(id);
  };

  const openAi = () => {
    goToSection('ai-assistant');
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-map-menu"
        className={`flex cursor-pointer items-center gap-1 bg-transparent font-semibold uppercase tracking-wide text-[#1c3767] ${linkClass}`}
      >
        <span>Карта сайта</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id="site-map-menu"
          className="absolute left-1/2 top-full z-[70] mt-2 max-h-[min(70vh,22rem)] min-w-[13.5rem] -translate-x-1/2 overflow-y-auto rounded-lg border border-slate-300 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {SITE_NAV_LINKS.map((link) => (
            <li key={link.type === 'section' ? link.id : link.type === 'ai' ? 'ai' : link.path}>
              {link.type === 'ai' ? (
                <button
                  type="button"
                  onClick={openAi}
                  className="block w-full px-4 py-2 text-left text-sm font-normal normal-case tracking-normal text-gray-700 transition hover:bg-sky-50 hover:text-sky-900"
                >
                  {link.label}
                </button>
              ) : link.type === 'section' ? (
                <button
                  type="button"
                  onClick={() => goToSection(link.id)}
                  className="block w-full px-4 py-2 text-left text-sm font-normal normal-case tracking-normal text-gray-700 transition hover:bg-sky-50 hover:text-sky-900"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 text-sm font-normal normal-case tracking-normal text-gray-700 transition hover:bg-sky-50 hover:text-sky-900"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
