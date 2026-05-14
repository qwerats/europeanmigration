/**
 * Временной ряд: мигранты в ЕС, млн (по годам).
 * Замените массив значениями из Excel (год, млн).
 */
export const EU_MIGRANTS_META = {
  sourceLabel: 'Источник: Eurostat, MIGR_POP3CTB. 2026',
};

/** @type {{ year: number; migrantsMln: number }[]} */
export const euMigrantsTimeline = [
  { year: 2010, migrantsMln: 40.5 },
  { year: 2011, migrantsMln: 40.0 },
  { year: 2012, migrantsMln: 41.3 },
  { year: 2013, migrantsMln: 42.5 },
  { year: 2014, migrantsMln: 43.5 },
  { year: 2015, migrantsMln: 44.3 },
  { year: 2016, migrantsMln: 45.9 },
  { year: 2017, migrantsMln: 48.1 },
  { year: 2018, migrantsMln: 50.7 },
  { year: 2019, migrantsMln: 53.2 },
  { year: 2020, migrantsMln: 54.9 },
  { year: 2021, migrantsMln: 55.6 },
  { year: 2022, migrantsMln: 56.0 },
  { year: 2023, migrantsMln: 60.1 },
  { year: 2024, migrantsMln: 62.6 },
  { year: 2025, migrantsMln: 64.7 },
];

export const euMigrantsAnnotations = [
  { x1: 2015, x2: 2018, label: 'Сирийский миграционный кризис' },
  { x1: 2020, x2: 2021, label: 'COVID-19' },
  { x1: 2022, x2: 2023, label: 'Война в Украине' },
];

/** Все годы по оси X в режиме увеличения (2010–2025). */
export const X_AXIS_TICKS_LOUPE = Array.from({ length: 16 }, (_, i) => 2010 + i);

/** Вертикали событий в увеличенном виде (как на эталоне): год + подпись справа. */
export const euMigrantsEventMarkers = [
  { year: 2015, label: 'Сирийский миграционный кризис' },
  { year: 2020, label: 'COVID-19' },
  { year: 2022, label: 'Война в Украине' },
];

export const X_AXIS_TICKS_MINI = [2010, 2013, 2016, 2019, 2022, 2025];

/** Ось Y в автономном режиме (десятки, млн). */
export const Y_AXIS_DOMAIN_MINI = [40, 65];
export const Y_AXIS_TICKS_MINI = [40, 50, 60, 65];

/** Ось Y при увеличении (лупа): 40…65 млн, шаг 2,5. */
export const Y_AXIS_DOMAIN_LOUPE = [40, 65];
export const Y_AXIS_TICKS_LOUPE = [40, 42.5, 45, 47.5, 50, 52.5, 55, 57.5, 60, 62.5, 65];
