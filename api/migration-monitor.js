import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterRecordsBySubscriber, parseFilterSpec } from './migration-email-commands.js';
import {
  enrichMonitorSource,
  formatReportDateRu,
  metricSourceFields,
  probeOfficialSources,
} from './migration-official-sources.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(__dirname, '..');

const MONITOR_SOURCES_RAW = [
  {
    key: 'asylum',
    name: 'Убежище 2014–2025',
    file: 'asylumApplicationsEu.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/asylumApplicationsEu.json',
  },
  {
    key: 'permits',
    name: 'ВНЖ по причинам',
    file: 'residencePermitsByReason.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/residencePermitsByReason.json',
  },
  {
    key: 'bigFive',
    name: 'Тренд мигрантов EU Big Five',
    file: 'euBigFiveByYear.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/euBigFiveByYear.json',
  },
  {
    key: 'fertility',
    name: 'Рождаемость ЕС',
    file: 'euFertilityRateByCountry.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/euFertilityRateByCountry.json',
  },
  {
    key: 'population',
    name: 'Прогноз населения ЕС',
    file: 'euPopulationProjection.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/euPopulationProjection.json',
  },
  {
    key: 'ageing',
    name: 'Старение / расходы',
    file: 'euAgeingCostsBaseline.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/euAgeingCostsBaseline.json',
  },
  {
    key: 'routes',
    name: 'Пересечение границ ЕС',
    file: 'mediterraneanRoutesIrregular.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/mediterraneanRoutesIrregular.json',
  },
  {
    key: 'foreignBorn',
    name: 'Динамика численности мигрантов',
    file: 'euForeignBornByYear.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/euForeignBornByYear.json',
  },
  {
    key: 'immigration',
    name: 'Страны с наибольшим количеством мигрантов',
    file: 'immigrationData.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/immigrationData.json',
  },
  {
    key: 'aggregateFlows',
    name: 'Дополнительный агрегат потоков',
    file: 'data.json',
    url: 'https://raw.githubusercontent.com/qwerats/europeanmigration/main/src/data/data.json',
  },
];

export const MONITOR_SOURCES = MONITOR_SOURCES_RAW.map((s) => enrichMonitorSource(s));

const PRIORITY_ORDER = ['Germany', 'France', 'Italy', 'Spain', 'Германия', 'Франция', 'Италия', 'Испания'];

function round(num, digits = 2) {
  if (num === null || num === undefined || Number.isNaN(num)) return null;
  return Number(num.toFixed(digits));
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function calcDelta(newValue, oldValue) {
  if (newValue === null || oldValue === null) return null;
  return newValue - oldValue;
}

function calcDeltaPct(newValue, oldValue) {
  if (newValue === null || oldValue === null) return null;
  if (oldValue === 0) return null;
  return ((newValue - oldValue) / oldValue) * 100;
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function historyKey(metric, country, period) {
  return `${metric}__${country}__${period}`;
}

function samePeriod(a, b) {
  return String(a) === String(b);
}

function classifyChange({ oldRecord, metricRecord }) {
  if (metricRecord.methodologyChanged) return 'Ревизия методологии';
  if (!oldRecord) return 'Новый период';
  if (!samePeriod(oldRecord.period, metricRecord.period)) return 'Новый период';

  const oldValue = toNumber(oldRecord.value);
  const newValue = toNumber(metricRecord.value);
  if (oldValue === null || newValue === null) return 'Без изменений';

  const deltaPct = calcDeltaPct(newValue, oldValue);
  if (deltaPct === null) return 'Без изменений';
  if (Math.abs(deltaPct) > 5) return 'Требует обновления';
  return 'Без изменений';
}

function prioritize(record) {
  const deltaPct = Math.abs(record.deltaPct ?? 0);
  const isPriorityCountry = PRIORITY_ORDER.some(
    (c) => record.country === c || String(record.country).includes(c)
  );
  if (record.status === 'Ревизия методологии') return 'HIGH';
  if (deltaPct > 10) return 'HIGH';
  if (deltaPct > 5) return 'MEDIUM';
  if (isPriorityCountry && deltaPct > 0) return 'MEDIUM';
  return 'LOW';
}

function sortRecords(records) {
  return [...records].sort((a, b) => {
    const pa = PRIORITY_ORDER.indexOf(a.country);
    const pb = PRIORITY_ORDER.indexOf(b.country);
    const wa = pa === -1 ? 999 : pa;
    const wb = pb === -1 ? 999 : pb;
    if (wa !== wb) return wa - wb;

    const prioOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (prioOrder[a.priority] !== prioOrder[b.priority]) {
      return prioOrder[a.priority] - prioOrder[b.priority];
    }
    return Math.abs(b.deltaPct ?? 0) - Math.abs(a.deltaPct ?? 0);
  });
}

function extractAsylum(json, source) {
  const data = ensureArray(json.data);
  if (data.length < 1) return [];
  const sorted = [...data].filter((r) => r.applications != null).sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  return [
    {
      ...metricSourceFields(source),
      metric: 'Asylum applications',
      country: 'EU',
      period: String(latest.year),
      value: toNumber(latest.applications),
      previousPeriod: previous ? String(previous.year) : null,
      previousValue: previous ? toNumber(previous.applications) : null,
    },
  ];
}

function extractPermits(json, source) {
  const data = ensureArray(json.data);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const categories = [
    ['family', 'Residence permits - family'],
    ['education', 'Residence permits - education'],
    ['employment', 'Residence permits - employment'],
    ['other', 'Residence permits - other'],
  ];
  return categories.map(([key, metric]) => ({
    ...metricSourceFields(source),
    metric,
    country: 'EU',
    period: String(latest.year),
    value: toNumber(latest[key]),
    previousPeriod: previous ? String(previous.year) : null,
    previousValue: previous ? toNumber(previous[key]) : null,
  }));
}

function extractBigFive(json, source) {
  const data = ensureArray(json);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const map = {
    germany: 'Germany',
    france: 'France',
    italy: 'Italy',
    spain: 'Spain',
    other: 'Other EU',
  };
  return Object.entries(map).map(([k, country]) => ({
    ...metricSourceFields(source),
    metric: 'EU Big Five migrant trend',
    country,
    period: String(latest.year),
    value: toNumber(latest[k]),
    previousPeriod: previous ? String(previous.year) : null,
    previousValue: previous ? toNumber(previous[k]) : null,
  }));
}

function extractFertility(json, source) {
  const data = ensureArray(json.data);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const euVal = toNumber(latest.EUU);
  if (euVal !== null) {
    return [
      {
        ...metricSourceFields(source),
        metric: 'Fertility rate',
        country: 'EU',
        period: String(latest.year),
        value: euVal,
        previousPeriod: previous ? String(previous.year) : null,
        previousValue: previous ? toNumber(previous.EUU) : null,
      },
    ];
  }
  return [];
}

function extractPopulation(json, source) {
  const data = ensureArray(json.data);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const scenarios = [
    ['baseline', 'EU population projection - baseline'],
    ['higherMigration', 'EU population projection - higher migration'],
    ['lowerMigration', 'EU population projection - lower migration'],
    ['noMigration', 'EU population projection - no migration'],
  ];
  const records = [];
  for (const [key, metric] of scenarios) {
    const filtered = sorted.filter((row) => toNumber(row[key]) !== null);
    if (filtered.length < 1) continue;
    const latest = filtered[filtered.length - 1];
    const previous = filtered[filtered.length - 2];
    records.push({
      ...metricSourceFields(source),
      metric,
      country: 'EU',
      period: String(latest.year),
      value: toNumber(latest[key]),
      previousPeriod: previous ? String(previous.year) : null,
      previousValue: previous ? toNumber(previous[key]) : null,
      unit: 'millions',
    });
  }
  return records;
}

function extractAgeing(json, source) {
  const data = ensureArray(json.data);
  if (!data.length) return [];
  return data.map((row) => ({
    ...metricSourceFields(source),
    metric: 'Ageing costs total',
    country: row.name || row.code,
    period: '2022-2070',
    value: toNumber(row.total),
    previousPeriod: null,
    previousValue: null,
    methodologyChanged: true,
  }));
}

function extractRoutes(json, source) {
  const data = ensureArray(json.data);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const routes = [
    ['western', 'Irregular border crossings - Western route'],
    ['eastern', 'Irregular border crossings - Eastern route'],
    ['central', 'Irregular border crossings - Central route'],
  ];
  return routes.map(([key, metric]) => ({
    ...metricSourceFields(source),
    metric,
    country: 'EU route',
    period: String(latest.year),
    value: toNumber(latest[key]),
    previousPeriod: previous ? String(previous.year) : null,
    previousValue: previous ? toNumber(previous[key]) : null,
  }));
}

function extractForeignBorn(json, source) {
  const data = ensureArray(json);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  return [
    {
      ...metricSourceFields(source),
      metric: 'Foreign-born population',
      country: 'EU',
      period: String(latest.year),
      value: toNumber(latest.millions),
      previousPeriod: previous ? String(previous.year) : null,
      previousValue: previous ? toNumber(previous.millions) : null,
      unit: 'millions',
    },
  ];
}

function extractImmigration(json, source) {
  const data = ensureArray(json);
  if (!data.length) return [];
  const grouped = new Map();
  for (const row of data) {
    const country = row.name;
    if (!grouped.has(country)) grouped.set(country, []);
    grouped.get(country).push(row);
  }
  const records = [];
  for (const [country, rows] of grouped.entries()) {
    const sorted = [...rows].sort((a, b) => Number(a.year) - Number(b.year));
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    records.push({
      ...metricSourceFields(source),
      metric: 'Immigration inflow',
      country,
      period: String(latest.year),
      value: toNumber(latest.value),
      previousPeriod: previous ? String(previous.year) : null,
      previousValue: previous ? toNumber(previous.value) : null,
    });
  }
  return records;
}

function extractAggregateFlows(json, source) {
  const data = ensureArray(json.series);
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => Number(a.year) - Number(b.year));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  return [
    {
      ...metricSourceFields(source),
      metric: 'EU immigration total',
      country: 'EU',
      period: String(latest.year),
      value: toNumber(latest.total),
      previousPeriod: previous ? String(previous.year) : null,
      previousValue: previous ? toNumber(previous.total) : null,
    },
  ];
}

function extractMetrics(source, json) {
  switch (source.key) {
    case 'asylum':
      return extractAsylum(json, source);
    case 'permits':
      return extractPermits(json, source);
    case 'bigFive':
      return extractBigFive(json, source);
    case 'fertility':
      return extractFertility(json, source);
    case 'population':
      return extractPopulation(json, source);
    case 'ageing':
      return extractAgeing(json, source);
    case 'routes':
      return extractRoutes(json, source);
    case 'foreignBorn':
      return extractForeignBorn(json, source);
    case 'immigration':
      return extractImmigration(json, source);
    case 'aggregateFlows':
      return extractAggregateFlows(json, source);
    default:
      return [];
  }
}

function buildRecommendation(record) {
  const { oldValue, value, deltaPct, status, metric, country } = record;
  if (status === 'Ревизия методологии') {
    return `Проверить методологию и при необходимости пересчитать блок «${metric}» (${country}).`;
  }
  if (status === 'Новый период') {
    return `Добавить период ${record.period} для «${metric}» (${country}).`;
  }
  if (status === 'Требует обновления') {
    return `Обновить «${metric}» (${country}): было ${oldValue} → стало ${value} (${round(deltaPct)}%).`;
  }
  return `Существенных действий не требуется; «${metric}» (${country}) стабильно.`;
}

function makeDigest(records) {
  const important = sortRecords(records.filter((r) => r.status !== 'Без изменений')).slice(0, 5);
  if (!important.length) {
    return 'Существенных изменений не обнаружено. Показатели стабильны или зафиксирован только новый период.';
  }
  const lines = important.map(
    (r) =>
      `${r.metric} / ${r.country}: ${r.oldValue ?? 'n/a'} → ${r.value ?? 'n/a'} (${r.deltaPct === null ? 'n/a' : `${round(r.deltaPct)}%`})`
  );
  return [
    'Обнаружены новые периоды и/или заметные изменения в миграционных рядах ЕС.',
    `Сигналы: ${lines.join('; ')}.`,
    'Приоритет: Германия → Франция → Италия → Испания → остальные страны ЕС.',
  ].join(' ');
}

export function toMarkdown(report) {
  const rows = report.changeTable
    .map(
      (r) =>
        `| ${r.metric} | ${r.country} | ${r.oldValue ?? ''} | ${r.newValue ?? ''} | ${r.deltaPct ?? ''} | ${r.recommendation} |`
    )
    .join('\n');
  return `# Итоговый отчёт мониторинга миграции

**Дата:** ${formatReportDateRu(report.runMeta.parsedAtUtc)}

## ДАЙДЖЕСТ
${report.digest}

## ТАБЛИЦА ИЗМЕНЕНИЙ
| Метрика | Страна | Старое | Новое | Дельта % | Рекомендация |
|---|---|---:|---:|---:|---|
${rows}

## ПРИОРИТИЗАЦИЯ
### ВЫСОКИЙ
${report.prioritization.high.map((x) => `- ${x}`).join('\n') || '- Нет'}

### СРЕДНИЙ
${report.prioritization.medium.map((x) => `- ${x}`).join('\n') || '- Нет'}

### НИЗКИЙ
${report.prioritization.low.map((x) => `- ${x}`).join('\n') || '- Нет'}

## СЛЕДУЮЩИЙ ШАГ
${report.nextStep}
`;
}

function filterRecordsByPrompt(records, userPrompt) {
  const p = String(userPrompt || '').trim();
  const filterCmd = p.match(/^FILTER:\s*([^:\n]+)(?::\s*(.+))?$/i);
  if (filterCmd) {
    return filterRecordsBySubscriber(records, parseFilterSpec(filterCmd[1], filterCmd[2]));
  }

  const lower = p.toLowerCase();
  if (!lower.trim()) return records;
  const keys = [
    ['герман', 'Germany'],
    ['франц', 'France'],
    ['итал', 'Italy'],
    ['испан', 'Spain'],
    ['убежищ', 'asylum'],
    ['asylum', 'asylum'],
    ['внж', 'permits'],
    ['residence', 'permits'],
    ['рождаем', 'fertility'],
    ['населен', 'population'],
    ['старен', 'ageing'],
    ['frontex', 'routes'],
    ['маршрут', 'routes'],
  ];
  const matched = new Set();
  for (const [needle, tag] of keys) {
    if (lower.includes(needle)) matched.add(tag);
  }
  if (!matched.size) return records;
  return records.filter((r) => {
    if (matched.has(r.sourceKey)) return true;
    if (matched.has('asylum') && r.metric.toLowerCase().includes('asylum')) return true;
    if (matched.has('permits') && r.metric.toLowerCase().includes('residence')) return true;
    if (matched.has('fertility') && r.metric.toLowerCase().includes('fertility')) return true;
    if (matched.has('population') && r.metric.toLowerCase().includes('population')) return true;
    if (matched.has('ageing') && r.metric.toLowerCase().includes('ageing')) return true;
    if (matched.has('routes') && r.metric.toLowerCase().includes('border')) return true;
    return ['Germany', 'France', 'Italy', 'Spain', 'Германия', 'Франция', 'Италия', 'Испания'].some(
      (c) => r.country === c && (matched.has('Germany') || matched.has('France') || matched.has('Italy') || matched.has('Spain'))
    );
  });
}

function applyReportFilters(report, userPrompt = '', subscriberFilter = null) {
  let table = report.changeTable;
  if (subscriberFilter) {
    table = filterRecordsBySubscriber(table, subscriberFilter);
  }
  table = filterRecordsByPrompt(table, userPrompt);
  const digest = makeDigest(sortRecords(table));
  return { ...report, changeTable: sortRecords(table), digest };
}

export function formatMonitorReplyForChat(report, userPrompt = '', subscriberFilter = null) {
  const scoped = applyReportFilters(report, userPrompt, subscriberFilter);
  const top = scoped.changeTable.filter((r) => r.status !== 'Без изменений').slice(0, 8);
  const lines = [
    `Дата проверки: ${formatReportDateRu(scoped.runMeta.parsedAtUtc)}`,
    '',
    scoped.digest,
  ];

  const onlineSources = ensureArray(scoped.runMeta.officialSourceChecks).filter((s) => s.online);
  if (onlineSources.length) {
    lines.push('', 'Проверенные официальные источники:');
    for (const s of onlineSources.slice(0, 6)) {
      lines.push(`• ${s.publisher}: ${s.url}`);
    }
  }

  if (!top.length) {
    lines.push('', 'Существенных отклонений не найдено.');
  } else {
    lines.push('', 'Изменения:');
    for (const r of top) {
      const publisher = r.sourcePublisher || r.sourceName;
      lines.push('');
      lines.push(`• [${r.status}] ${r.metric} — ${r.country}, ${r.period}`);
      lines.push(
        `  ${r.oldValue ?? '—'} → ${r.value ?? '—'}${r.deltaPct != null ? ` (${round(r.deltaPct)}%)` : ''}`
      );
      lines.push(`  ${r.recommendation}`);
      lines.push(`  Источник (${publisher}): ${r.sourceUrl}`);
    }
  }

  lines.push('', `Далее: ${scoped.nextStep}`);
  return lines.join('\n');
}

async function ensureDirs(root) {
  await fs.mkdir(path.join(root, 'data'), { recursive: true });
  await fs.mkdir(path.join(root, 'reports'), { recursive: true });
}

async function readJsonSafe(filePath, fallback) {
  try {
    const txt = await fs.readFile(filePath, 'utf8');
    return JSON.parse(txt);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url, {
    headers: { 'User-Agent': 'MigrationMonitor-EU/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function loadSourceJson(source, root, fetchImpl) {
  const localPath = path.join(root, 'src', 'data', source.file);
  try {
    const local = await fs.readFile(localPath, 'utf8');
    return JSON.parse(local);
  } catch {
    return fetchJson(source.dataUrl, fetchImpl);
  }
}

/**
 * @param {{ root?: string, fetchImpl?: typeof fetch, userPrompt?: string, writeFiles?: boolean, subscriberFilter?: { countries?: string[], topics?: string[] } | null }} options
 */
export async function runMigrationMonitor(options = {}) {
  const root = options.root || DEFAULT_ROOT;
  const fetchImpl = options.fetchImpl || fetch;
  const writeFiles = options.writeFiles !== false;
  const userPrompt = options.userPrompt || '';
  const subscriberFilter = options.subscriberFilter || null;

  if (writeFiles) await ensureDirs(root);

  const historyPath = path.join(root, 'data', 'metrics-history.json');
  const history = await readJsonSafe(historyPath, { records: {} });

  const allMetricRecords = [];
  const sourceErrors = [];
  const officialSourceChecks = await probeOfficialSources(MONITOR_SOURCES, fetchImpl);

  await Promise.all(
    MONITOR_SOURCES.map(async (source) => {
      try {
        const json = await loadSourceJson(source, root, fetchImpl);
        allMetricRecords.push(...extractMetrics(source, json));
      } catch (err) {
        sourceErrors.push({ source: source.key, error: err?.message || String(err) });
      }
    })
  );

  const changeTable = [];
  for (const metricRecord of allMetricRecords) {
    const key = historyKey(metricRecord.metric, metricRecord.country, metricRecord.period);
    const oldRecord = history.records[key] || null;
    const status = classifyChange({ oldRecord, metricRecord });
    const oldValue = oldRecord ? toNumber(oldRecord.value) : toNumber(metricRecord.previousValue);
    const newValue = toNumber(metricRecord.value);
    const delta = calcDelta(newValue, oldValue);
    const deltaPct = calcDeltaPct(newValue, oldValue);

    const row = {
      sourceKey: metricRecord.sourceKey,
      sourceName: metricRecord.sourceName,
      sourceUrl: metricRecord.sourceUrl,
      sourcePublisher: metricRecord.sourcePublisher,
      metric: metricRecord.metric,
      country: metricRecord.country,
      period: metricRecord.period,
      status,
      oldValue,
      newValue,
      value: newValue,
      delta,
      deltaPct: deltaPct === null ? null : round(deltaPct),
      recommendation: '',
      priority: 'LOW',
    };
    row.recommendation = buildRecommendation({ ...row, oldValue, value: newValue });
    row.priority = prioritize(row);
    changeTable.push(row);

    history.records[key] = {
      metric: metricRecord.metric,
      country: metricRecord.country,
      period: metricRecord.period,
      value: newValue,
      updatedAt: new Date().toISOString(),
      sourceUrl: metricRecord.sourceUrl,
    };
  }

  const sortedTable = sortRecords(changeTable);
  const digest = makeDigest(sortedTable);
  const prioritization = {
    high: sortedTable.filter((r) => r.priority === 'HIGH').map((r) => `${r.metric} / ${r.country}`),
    medium: sortedTable.filter((r) => r.priority === 'MEDIUM').map((r) => `${r.metric} / ${r.country}`),
    low: sortedTable.filter((r) => r.priority === 'LOW').slice(0, 12).map((r) => `${r.metric} / ${r.country}`),
  };
  const nextStep =
    prioritization.high.length > 0
      ? 'Обновить показатели с приоритетом HIGH на дашборде и зафиксировать новый baseline в metrics-history.json.'
      : 'Продолжить плановый мониторинг; критических обновлений не требуется.';

  const report = {
    runMeta: {
      parsedAtUtc: new Date().toISOString(),
      status: sourceErrors.length ? 'partial' : 'ok',
      sourceErrors,
      sourcesChecked: MONITOR_SOURCES.length - sourceErrors.length,
      officialSourceChecks,
    },
    digest,
    changeTable: sortedTable,
    prioritization,
    nextStep,
  };

  const scopedReport = applyReportFilters(report, userPrompt, subscriberFilter);
  scopedReport.markdown = toMarkdown(scopedReport);

  if (writeFiles) {
    await writeJson(historyPath, history);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await writeJson(path.join(root, 'reports', `report-${stamp}.json`), scopedReport);
    await fs.writeFile(path.join(root, 'reports', `report-${stamp}.md`), scopedReport.markdown, 'utf8');
  }

  return scopedReport;
}
