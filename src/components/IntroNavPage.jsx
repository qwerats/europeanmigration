import { useNavigate } from 'react-router-dom';

export default function IntroNavPage({ title }) {
  const navigate = useNavigate();

  const goIntro = () => {
    navigate({ pathname: '/', hash: '' });
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-2xl flex-col px-4 py-12 text-gray-900">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
      </div>

      <div className="flex justify-center pb-10 pt-6">
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
