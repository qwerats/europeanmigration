import { SHOW_SITE_HEADER } from '../config/showSiteHeader';
import IntroPage from './IntroPage';
import Dashboard from './Dashboard';
import Geography from './Geography';
import Statistics from './Statistics';
import Forecast from './Forecast';
import AiAssistantPage from './AiAssistantPage';

const SECTIONS = [
  { id: 'intro', tone: 'dark', Component: IntroPage },
  { id: 'home', tone: 'light', Component: Dashboard },
  { id: 'geography', tone: 'light', Component: Geography },
  { id: 'statistics', tone: 'light', Component: Statistics },
  { id: 'forecast', tone: 'light', Component: Forecast },
  { id: 'methodology', tone: 'light', Component: AiAssistantPage },
];

export default function OnePager() {
  const scrollMt = SHOW_SITE_HEADER ? 'scroll-mt-32' : 'scroll-mt-4';

  return (
    <div className="w-full">
      {SECTIONS.map(({ id, tone, Component }) => {
        const isIntro = id === 'intro';
        return (
          <section
            key={id}
            id={id}
            data-section={id}
            className={
              isIntro
                ? scrollMt
                : `${scrollMt} border-t border-sky-100 bg-white px-4 py-12 sm:px-6 lg:px-8`
            }
          >
            {isIntro ? (
              <Component />
            ) : (
              <div className="mx-auto max-w-7xl">
                <Component />
              </div>
            )}
            {tone === 'light' && id !== 'methodology' ? null : null}
          </section>
        );
      })}
    </div>
  );
}
