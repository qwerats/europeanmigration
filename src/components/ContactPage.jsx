import { useNavigate } from 'react-router-dom';

const CONTACTS = [
  {
    name: 'Ахметова Томирис',
    phone: '87768802006',
    email: 'tomiris.akhmetova@narxoz.kz',
  },
  {
    name: 'Егембердиев Адиет',
    phone: '87019954941',
    email: 'adiet.egemberdiyev@narxoz.kz',
  },
];

function phoneHref(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('8') && digits.length === 11) {
    return `tel:+7${digits.slice(1)}`;
  }
  return `tel:+${digits}`;
}

export default function ContactPage() {
  const navigate = useNavigate();

  const goIntro = () => {
    navigate({ pathname: '/', hash: '' });
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-3xl flex-col px-4 py-10 text-gray-900 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">Связь</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Контакты</h1>
      </header>

      <ul className="flex-1 space-y-6">
        {CONTACTS.map((person) => (
          <li
            key={person.email}
            className="rounded-2xl border border-sky-100 bg-sky-50/40 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900">{person.name}</h2>
            <dl className="mt-4 space-y-3 text-base text-gray-700">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Телефон
                </dt>
                <dd className="mt-1">
                  <a
                    href={phoneHref(person.phone)}
                    className="font-medium text-sky-700 underline-offset-2 hover:underline"
                  >
                    {person.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                  Email
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${person.email}`}
                    className="break-all font-medium text-sky-700 underline-offset-2 hover:underline"
                  >
                    {person.email}
                  </a>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

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
