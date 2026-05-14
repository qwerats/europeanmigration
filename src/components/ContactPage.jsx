import IntroNavPage from './IntroNavPage';

const linkClass =
  'text-[#103772] underline decoration-sky-300/80 underline-offset-4 transition hover:text-[#0a2544] hover:decoration-sky-500';

const creators = [
  {
    name: 'Ахметова Томирис Мейрамбекқызы',
    phoneDisplay: '+7 776 880 2006',
    tel: '+77768802006',
    email: 'tomiris.akhmetova@narxoz.kz',
  },
  {
    name: 'Егембердиев Адиет Мадиярович',
    phoneDisplay: '+7 701 995 4941',
    tel: '+77019954941',
    email: 'adiet.egemberdiyev@narxoz.kz',
  },
];

export default function ContactPage() {
  return (
    <IntroNavPage title="Contact">
      <div className="mt-10 space-y-8">
        <p className="text-xl font-semibold tracking-tight text-[#103772] md:text-2xl">
          Создатели сайта
        </p>

        <ul className="space-y-8">
          {creators.map((person) => (
            <li
              key={person.email}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/90 px-6 py-7 shadow-sm md:px-8 md:py-8"
            >
              <p className="text-2xl font-semibold leading-snug tracking-tight text-[#103772] md:text-3xl">
                {person.name}
              </p>
              <p className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-[#103772] md:text-3xl">
                <a href={`tel:${person.tel}`} className={linkClass}>
                  {person.phoneDisplay}
                </a>
              </p>
              <p className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-[#103772] md:text-3xl">
                <a href={`mailto:${person.email}`} className={linkClass}>
                  {person.email}
                </a>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </IntroNavPage>
  );
}
