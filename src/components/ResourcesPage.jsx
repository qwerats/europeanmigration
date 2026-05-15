import { useNavigate } from 'react-router-dom';
import { resourcesApa7 } from '../data/resourcesApa7';
function CitationText({ parts, url }) {
  const showUrlInText = parts.some((p) => p.text.includes(url));
  return (
    <p className="text-sm leading-relaxed text-gray-800">
      {parts.map((part, i) =>
        part.italic ? (
          <em key={i} className="text-gray-900">
            {part.text}
          </em>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
      {!showUrlInText ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sky-700 underline decoration-sky-300 underline-offset-2 hover:text-sky-900"
        >
          {url}
        </a>
      ) : null}
    </p>
  );
}

export default function ResourcesPage() {
  const navigate = useNavigate();

  const goIntro = () => {
    navigate({ pathname: '/', hash: '' });
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl flex-col px-4 py-10 text-gray-900 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Источники</h1>
      </header>

      <section className="glass-panel flex-1 p-6 sm:p-8">
        <ol className="list-none space-y-8">
          {resourcesApa7.map((item, index) => (
            <li key={item.id} className="border-b border-sky-100 pb-8 last:border-0 last:pb-0">
              <span className="mb-2 block text-xs font-semibold text-sky-700">{index + 1}.</span>
              <div className="pl-0 sm:pl-1">
                <CitationText parts={item.parts} url={item.url} />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:border-sky-300 hover:bg-sky-100"
                >
                  Открыть в браузере
                  <span aria-hidden className="text-sm leading-none">
                    ↗
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex justify-center pb-6 pt-8">
        <button
          type="button"
          onClick={goIntro}
          className="rounded-xl bg-sky-600 px-10 py-3 text-base font-semibold text-white shadow-md transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          Домой
        </button>
      </div>
    </div>
  );
}
