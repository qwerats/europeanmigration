import IntroPage from './IntroPage';
import IntroductionSection from './IntroductionSection';
import Dashboard from './Dashboard';
import Statistics from './Statistics';
import EuMigrationAgentChat from './EuMigrationAgentChat';

const SECTIONS = [
  { id: 'intro', Component: IntroPage },
  { id: 'introduction', Component: IntroductionSection },
  { id: 'home', Component: Dashboard },
  { id: 'statistics', Component: Statistics },
  { id: 'ai-assistant', Component: EuMigrationAgentChat },
];

export default function OnePager() {
  const scrollMt = 'scroll-mt-[var(--intro-site-header-h)]';

  return (
    <div className="w-full">
      {SECTIONS.map(({ id, Component }) => {
        const isIntro = id === 'intro';
        const isFirstLight = id === 'introduction';
        const isFullWidth = id === 'statistics';
        return (
          <section
            key={id}
            id={id}
            data-section={id}
            className={
              isIntro
                ? `${scrollMt} w-full min-w-0 overflow-x-hidden`
                : `${scrollMt} ${isFirstLight ? '' : 'border-t border-sky-100'} bg-white px-4 py-12 sm:px-6 lg:px-8`
            }
          >
            {isIntro ? (
              <Component />
            ) : (
              <div className={isFullWidth ? 'w-full min-w-0' : 'mx-auto max-w-7xl'}>
                <Component />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
