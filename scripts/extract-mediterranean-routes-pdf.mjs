import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFParse } from 'pdf-parse';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../src/data/mediterraneanRoutesIrregular.json');

const files = [
  {
    key: 'western',
    path: 'c:\\Users\\egemb\\Downloads\\ANNEX_Western-Mediterranean_up-to-2024.pdf',
    label: 'Западный маршрут',
  },
  {
    key: 'eastern',
    path: 'c:\\Users\\egemb\\Downloads\\ANNEX_Eastern-Mediterranean_up-to-2024.pdf',
    label: 'Восточный маршрут',
  },
  {
    key: 'central',
    path: 'c:\\Users\\egemb\\Downloads\\ANNEX_Central-Mediterranean_up-to-2024.pdf',
    label: 'Центральный маршрут',
  },
];

function parseYearTotals(text) {
  const rows = [];
  // Frontex annex tables: year + monthly columns + total
  const yearLineRe = /\b(20\d{2})\b/g;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const years = [...line.matchAll(/\b(20\d{2})\b/g)].map((m) => Number(m[1]));
    if (years.length !== 1) continue;
    const year = years[0];
    if (year < 2014 || year > 2026) continue;

    const nums = [...line.matchAll(/\b(\d{1,3}(?:[,\s]\d{3})*)\b/g)]
      .map((m) => Number(m[1].replace(/[\s,]/g, '')))
      .filter((n) => Number.isFinite(n) && n > 0);

    if (nums.length < 2) continue;
    // Last number is often annual total; if 13+ numbers, last is total
    const total = nums.length >= 13 ? nums[nums.length - 1] : nums[nums.length - 1];
    if (total > 2_000_000) continue;
    rows.push({ year, total });
  }

  // Deduplicate by year (keep max total per year — table rows may repeat)
  const byYear = new Map();
  for (const r of rows) {
    const prev = byYear.get(r.year);
    if (!prev || r.total > prev) byYear.set(r.year, r.total);
  }
  return [...byYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, total]) => ({ year, total }));
}

async function extractText(path) {
  const buf = readFileSync(path);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();
  return result.text ?? '';
}

async function main() {
  const routeData = {};
  for (const f of files) {
    const text = await extractText(f.path);
    const totals = parseYearTotals(text);
    console.log('\n', f.key, 'chars', text.length, 'years', totals.length);
    console.log(totals);
    console.log('--- sample text ---\n', text.slice(0, 3000));
    routeData[f.key] = totals;
  }

  const years = new Set();
  for (const arr of Object.values(routeData)) {
    for (const { year } of arr) years.add(year);
  }
  const sortedYears = [...years].sort((a, b) => a - b);

  const data = sortedYears.map((year) => {
    const row = { year: String(year) };
    for (const key of ['western', 'eastern', 'central']) {
      const hit = routeData[key]?.find((r) => r.year === year);
      row[key] = hit?.total ?? null;
    }
    return row;
  });

  writeFileSync(
    outPath,
    JSON.stringify(
      {
        meta: {
          title: 'Нерегулярные пересечения границы по маршрутам',
          note: 'Данные до 2024 г. Западный маршрут — Западное Средиземноморье и Западная Африка.',
          sourceLabel: 'Источник: Frontex, Министерство внутренних дел Испании.',
          yAxisLabel: 'Число пересечений',
        },
        series: [
          { dataKey: 'western', name: 'Западный маршрут', color: '#f5e6a8', labelColor: '#1e293b' },
          { dataKey: 'eastern', name: 'Восточный маршрут', color: '#c4b5fd', labelColor: '#ffffff' },
          { dataKey: 'central', name: 'Центральный маршрут', color: '#5eead4', labelColor: '#ffffff' },
        ],
        data,
        raw: routeData,
      },
      null,
      2
    ),
    'utf8'
  );
  console.log('\nWrote', outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
