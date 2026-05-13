import { SHOW_SITE_HEADER } from '../config/showSiteHeader';
import IntroPage from './IntroPage';
import Dashboard from './Dashboard';
import Statistics from './Statistics';
import Forecast from './Forecast';
import AiAssistantPage from './AiAssistantPage';

const SECTIONS = [
  { id: 'intro', Component: IntroPage },
  { id: 'home', Component: Dashboard },
  { id: 'statistics', Component: Statistics },
  { id: 'forecast', Component: Forecast },
  { id: 'methodology', Component: AiAssistantPage },
];

export default function OnePager() {
  const scrollMt = SHOW_SITE_HEADER ? 'scroll-mt-32' : 'scroll-mt-4';

  return (
    <div className="w-full">
      {SECTIONS.map(({ id, Component }) => {
        const isIntro = id === 'intro';
        const isFirstLight = id === 'home';
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
              <div className="mx-auto max-w-7xl">
                <Component />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
