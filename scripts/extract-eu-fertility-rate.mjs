import XLSX from 'xlsx';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultXls = resolve(
  process.env.HOME || process.env.USERPROFILE || '',
  'Downloads/API_SP.DYN.TFRT.IN_DS2_en_excel_v2_667.xls'
);
const xlsPath = process.argv[2] || defaultXls;
const outPath = resolve(__dirname, '../src/data/euFertilityRateByCountry.json');

const EU27_CODES = [
  'AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC',
  'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK',
  'SVN', 'ESP', 'SWE',
];

const NAME_RU = {
  Austria: 'Австрия',
  Belgium: 'Бельгия',
  Bulgaria: 'Болгария',
  Croatia: 'Хорватия',
  Cyprus: 'Кипр',
  Czechia: 'Чехия',
  Denmark: 'Дания',
  Estonia: 'Эстония',
  Finland: 'Финляндия',
  France: 'Франция',
  Germany: 'Германия',
  Greece: 'Греция',
  Hungary: 'Венгрия',
  Ireland: 'Ирландия',
  Italy: 'Италия',
  Latvia: 'Латвия',
  Lithuania: 'Литва',
  Luxembourg: 'Люксембург',
  Malta: 'Мальта',
  Netherlands: 'Нидерланды',
  Poland: 'Польша',
  Portugal: 'Португалия',
  Romania: 'Румыния',
  'Slovak Republic': 'Словакия',
  Slovenia: 'Словения',
  Spain: 'Испания',
  Sweden: 'Швеция',
  'European Union': 'Европейский союз',
};

const COLORS = [
  '#1e3a5f', '#ea580c', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#0891b2', '#ca8a04',
  '#db2777', '#4f46e5', '#0d9488', '#b45309', '#be123c', '#4338ca', '#15803d', '#c2410c',
  '#1d4ed8', '#a21caf', '#047857', '#b91c1c', '#6366f1', '#0f766e', '#d97706', '#7e22ce',
  '#059669', '#e11d48', '#334155',
];

const wb = XLSX.readFile(xlsPath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets.Data, { header: 1, defval: '' });
const header = rows[3];
const yearIndices = [];
for (let c = 4; c < header.length; c++) {
  const year = Number(header[c]);
  if (Number.isFinite(year) && year >= 1960 && year <= 2024) yearIndices.push({ year, col: c });
}

const countryRows = rows.slice(4).filter((r) => EU27_CODES.includes(String(r[1])) || r[1] === 'EUU');
const series = [];
const byCode = {};

for (const row of countryRows) {
  const code = row[1] === 'EUU' ? 'EUU' : row[1];
  const nameEn = row[0];
  const name = NAME_RU[nameEn] || nameEn;
  const points = {};
  for (const { year, col } of yearIndices) {
    const raw = row[col];
    if (raw === '' || raw == null) continue;
    const v = Number(raw);
    if (!Number.isFinite(v)) continue;
    points[year] = Math.round(v * 1000) / 1000;
  }
  byCode[code] = { nameEn, name, points };
}

const orderedCodes = [...EU27_CODES, ...(byCode.EUU ? ['EUU'] : [])];
let colorIdx = 0;
for (const code of orderedCodes) {
  if (!byCode[code]) continue;
  const { name, nameEn, points } = byCode[code];
  series.push({
    dataKey: code,
    name,
    nameEn,
    color: code === 'EUU' ? '#dc2626' : COLORS[colorIdx++ % COLORS.length],
    strokeWidth: code === 'EUU' ? 3 : 1.5,
    strokeDasharray: code === 'EUU' ? undefined : undefined,
  });
}

const years = yearIndices.map((y) => y.year);
const data = years.map((year) => {
  const row = { year: String(year) };
  for (const s of series) {
    const v = byCode[s.dataKey]?.points?.[year];
    if (v != null) row[s.dataKey] = v;
  }
  return row;
});

const payload = {
  meta: {
    title: 'Рождаемость (рождений на женщину)',
    yAxisLabel: 'Количество детей на женщину',
    xAxisLabel: 'Год',
    sourceLabel:
      'Источник: World Bank, World Development Indicators — SP.DYN.TFRT.IN (Fertility rate, total). 27 государств-членов ЕС.',
  },
  series,
  data,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log('Wrote', outPath, '—', series.length, 'series,', data.length, 'years');
