import XLSX from 'xlsx';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, '../src/data/euPopulationProjection.json');

const EU_LABEL = 'European Union - 27 countries (from 2020)';

function parseEurostatSheet(ws) {
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  let timeRow = null;
  let dataRow = null;
  for (const row of rows) {
    if (!row?.length) continue;
    const first = String(row[0] ?? '').trim();
    if (first === 'TIME') timeRow = row;
    if (first === EU_LABEL) dataRow = row;
  }
  if (!timeRow || !dataRow) return null;

  const points = [];
  for (let c = 1; c < timeRow.length; c++) {
    const yearRaw = timeRow[c];
    if (yearRaw == null || yearRaw === '') continue;
    const year = Number(yearRaw);
    if (!Number.isFinite(year)) continue;
    let val = dataRow[c];
    if (val === '' || val == null) {
      if (c + 1 < dataRow.length && typeof dataRow[c + 1] === 'number') {
        val = dataRow[c + 1];
        c += 1;
      } else continue;
    }
    const mln = Number(val) / 1_000_000;
    if (!Number.isFinite(mln)) continue;
    points.push({ year, populationMln: Math.round(mln * 10) / 10 });
  }
  return points;
}

function loadScenario(path, sheetName) {
  const wb = XLSX.readFile(path, { cellDates: true });
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    console.warn('Missing sheet', sheetName, 'in', path);
    return null;
  }
  return parseEurostatSheet(ws);
}

const scenariosPath = 'c:\\Users\\egemb\\Downloads\\Прогноз по населению.xlsx';
const baselinePath = 'c:\\Users\\egemb\\Downloads\\прогноз по населению. Базовые данные.xlsx';

const wb1 = XLSX.readFile(scenariosPath);
console.log('Sheets in scenarios:', wb1.SheetNames);

const higher = parseEurostatSheet(wb1.Sheets['Sheet 1']);
const lower = parseEurostatSheet(wb1.Sheets['Sheet 4']);
const none = parseEurostatSheet(wb1.Sheets['Sheet 7']);

const wb2 = XLSX.readFile(baselinePath);
const baseline = parseEurostatSheet(wb2.Sheets['Data']);

console.log('baseline years', baseline?.length, baseline?.[0], baseline?.at(-1));
console.log('higher years', higher?.length, higher?.at(-1));
console.log('lower years', lower?.length, lower?.at(-1));
console.log('none years', none?.length, none?.at(-1));

function mergeByYear(scenarios) {
  const yearSet = new Set();
  for (const s of Object.values(scenarios)) {
    for (const p of s ?? []) yearSet.add(p.year);
  }
  const years = [...yearSet].sort((a, b) => a - b);
  return years.map((year) => {
    const row = { year };
    for (const [key, pts] of Object.entries(scenarios)) {
      const hit = pts?.find((p) => p.year === year);
      if (hit) row[key] = hit.populationMln;
    }
    return row;
  });
}

const chartData = mergeByYear({
  baseline,
  higherMigration: higher,
  lowerMigration: lower,
  noMigration: none,
});

const payload = {
  meta: {
    title: 'Прогноз численности населения ЕС',
    sourceLabel:
      'Источник: Eurostat, proj_23np / proj_25np (baseline). Сценарии: базовый, повышенная, пониженная миграция, отсутствие миграции.',
    yAxisLabel: 'Население, млн',
    xAxisLabel: 'Год',
  },
  series: [
    { dataKey: 'higherMigration', name: 'Повышенная миграция', color: '#1e3a5f', strokeWidth: 2.5 },
    { dataKey: 'baseline', name: 'Базовый сценарий', color: '#ea580c', strokeWidth: 2.5 },
    { dataKey: 'lowerMigration', name: 'Пониженная миграция', color: '#2563eb', strokeWidth: 2.5 },
    { dataKey: 'noMigration', name: 'Отсутствие миграции', color: '#78716c', strokeWidth: 2.5 },
  ],
  data: chartData,
};

writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
console.log('Wrote', outPath, 'rows', chartData.length);
