import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Главная', icon: '◆' },
  { to: '/geography', label: 'География', icon: '◆' },
  { to: '/statistics', label: 'Статистика', icon: '◆' },
  { to: '/forecast', label: 'Прогноз', icon: '◆' },
  { to: '/methodology', label: 'ИИ-ассистент', icon: '◆' },
];

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-gradient-slow opacity-100"
        style={{
          background:
            'linear-gradient(125deg, #ffffff 0%, #f0f9ff 22%, #e0f2fe 45%, #f0f9ff 72%, #ffffff 100%)',
          backgroundSize: '400% 400%',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 animate-sky-pulse"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(14,165,233,0.14) 0%, transparent 42%), radial-gradient(circle at 85% 75%, rgba(56,189,248,0.12) 0%, transparent 38%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.22) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <header className="sticky top-0 z-50 border-b border-sky-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300 bg-sky-50 text-lg font-semibold text-sky-600 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
              EU
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 sm:text-lg">
                Европейская аналитика миграции
              </h1>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Основная навигация">
            {nav.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sky-100 text-sky-800 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.45)]'
                      : 'text-gray-700 hover:scale-[1.02] hover:bg-sky-50 hover:text-gray-900',
                  ].join(' ')
                }
                end={to === '/'}
              >
                <span className="text-sky-500 transition-transform group-hover:scale-110">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>

      <footer className="mt-12 border-t border-sky-100 py-6 text-center text-xs text-gray-600">
      
      </footer>
    </div>
  );
}
