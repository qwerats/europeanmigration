import XLSX from 'xlsx';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCES = [
  { key: 'family', path: 'c:/Users/egemb/Downloads/migr_resfirst__custom_173590_page_spreadsheet.xlsx' },
  { key: 'education', path: 'c:/Users/egemb/Downloads/migr_resfirst__custom_173590_page_spreadsheet (1).xlsx' },
  { key: 'other', path: 'c:/Users/egemb/Downloads/migr_resfirst__custom_173590_page_spreadsheet (2).xlsx' },
  { key: 'total', path: 'c:/Users/egemb/Downloads/migr_resfirst__custom_173590_page_spreadsheet (3).xlsx' },
];

/** 2020–2024: дополнение по Eurostat chart (файлы Excel обрываются на 2019). */
const SUPPLEMENT_2020_2024 = {
  2020: { family: 620, education: 280, other: 490, employment: 940 },
  2021: { family: 720, education: 360, other: 520, employment: 1360 },
  2022: { family: 870, education: 470, other: 750, employment: 1250 },
  2023: { family: 1020, education: 550, other: 990, employment: 1180 },
  2024: { family: 950, education: 550, other: 890, employment: 1120 },
};

function parseSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  let timeRow = null;
  let dataRow = null;

  for (const row of rows) {
    if (!row?.length) continue;
    const first = String(row[0] ?? '').trim();
    if (first === 'TIME') timeRow = row;
    if (first.startsWith('European Union')) dataRow = row;
  }

  const byYear = {};
  if (!timeRow || !dataRow) return byYear;

  for (let c = 1; c < timeRow.length; c++) {
    const yearRaw = timeRow[c];
    if (yearRaw == null || yearRaw === '') continue;
    const year = Number(yearRaw);
    if (!Number.isFinite(year)) continue;

    let val = dataRow[c];
    if (val === ':' || val === '' || val == null) {
      const next = dataRow[c + 1];
      if (typeof next === 'number') {
        val = next;
        c += 1;
      } else continue;
    }
    if (typeof val === 'number') byYear[year] = Math.round(val / 1000);
  }

  return byYear;
}

const series = {};
for (const { key, path } of SOURCES) {
  const wb = XLSX.readFile(path);
  series[key] = parseSheet(wb.Sheets['Sheet 1']);
}

const years = [];
for (let y = 2015; y <= 2024; y += 1) years.push(y);

const data = years.map((year) => {
  const sup = SUPPLEMENT_2020_2024[year];
  const family = series.family[year] ?? sup?.family ?? null;
  const education = series.education[year] ?? sup?.education ?? null;
  const other = series.other[year] ?? sup?.other ?? null;
  let employment = null;
  if (year <= 2019) {
    const total = series.total[year];
    if (total != null && family != null && education != null && other != null) {
      employment = Math.max(0, total - family - education - other);
    }
  } else {
    employment = sup?.employment ?? null;
  }
  return {
    year: String(year),
    family,
    education,
    other,
    employment,
  };
});

const out = {
  meta: {
    title: 'Причины подачи на ВНЖ (2015-2024)',
    yAxisLabel: 'Тысяч выданных разрешений',
    sourceLabel:
      'Источник: Eurostat, migr_resfirst (First permits by reason).',
  },
  series: [
    { dataKey: 'family', name: 'Семейные', color: '#2563eb' },
    { dataKey: 'education', name: 'Образование', color: '#ca8a04' },
    { dataKey: 'employment', name: 'Трудовые', color: '#ef4444' },
    { dataKey: 'other', name: 'Прочие', color: '#14b8a6' },
  ],
  data,
};

writeFileSync(resolve(__dirname, '../src/data/residencePermitsByReason.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log('OK', data);
