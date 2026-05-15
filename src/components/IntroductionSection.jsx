export default function IntroductionSection() {
  return (
    <article className="animate-fade-up-soft space-y-8 [animation-fill-mode:forwards]">
      <header className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Вступление</h2>
      </header>

      <div className="glass-panel space-y-5 rounded-2xl border border-sky-200/90 border-l-4 border-l-sky-500 px-6 py-6 text-left sm:px-8 sm:py-7">
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          В 2020-х годах Европейский союз, во второй раз, столкнулся с миграционными вызовами. Эта
          трансформация, катализируемая геополитической нестабильностью, вывела миграцию на позицию
          основной оси дебатов о европейском суверенитете.
        </p>
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          В мае 2024 года институциональным ответом на эти вызовы стало принятие Нового пакета о
          миграции и убежище — вступающего в полную силу в июне 2026 года.
        </p>
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          Данный веб-проект посвящён анализу миграционных процессов в Европейском союзе. На сайте
          представлены интерактивные визуализации, статистические срезы, основанные на открытых данных
          Eurostat, материалах ООН и других авторитетных источников. Структура сайта выстроена от
          общего обзора к деталям: после вступления доступны дашборд с ключевыми показателями, раздел
          статистики с картой и рейтингами стран и ИИ-ассистент для уточняющих вопросов по данным.
          Дополнительно размещены страницы «О сайте», «Контакты» и библиография источников.
        </p>
      </div>
    </article>
  );
}
