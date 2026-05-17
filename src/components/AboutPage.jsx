import { useNavigate } from 'react-router-dom';

const FEATURES = [
  'Анализировать миграционные тенденции по странам и периодам;',
  'Сравнивать ключевые демографические показатели;',
  'Получать структурированную информацию в удобном визуальном формате;',
  'Отслеживать актуальность статистических данных.',
];

export default function AboutPage() {
  const navigate = useNavigate();

  const goIntro = () => {
    navigate({ pathname: '/', hash: '' });
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl flex-col px-4 py-10 text-gray-900 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">Проект</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">О сайте</h1>
      </header>

      <div className="flex-1 space-y-6 text-base leading-relaxed text-gray-700">
        <p>
          Проект объединяет инструменты визуализации данных и аналитические методы для упрощения
          восприятия статистической информации. Все представленные материалы основаны на открытых и
          проверяемых источниках, включая Eurostat, United Nations, национальные статистические службы
          и международные исследовательские публикации.
        </p>

        <div>
          <p className="text-gray-800">
            Особенностью проекта является использование интерактивных дашбордов и элементов
            искусственного интеллекта, которые позволяют:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            {FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-center pb-10 pt-8">
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
