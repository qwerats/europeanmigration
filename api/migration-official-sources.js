/** Официальные веб-источники данных (не raw JSON репозитория). */

export const OFFICIAL_SOURCE_META = {
  asylum: {
    publisher: 'Eurostat',
    officialUrl:
      'https://ec.europa.eu/eurostat/databrowser/view/migr_asyappctza/default/table?lang=en',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/asylum-statistics',
  },
  permits: {
    publisher: 'Eurostat',
    officialUrl:
      'https://ec.europa.eu/eurostat/databrowser/view/migr_resfirst/default/table?lang=en',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/migration-statistics',
  },
  bigFive: {
    publisher: 'Eurostat',
    officialUrl:
      'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Migration_to_and_from_the_EU',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/overview',
  },
  fertility: {
    publisher: 'World Bank Open Data',
    officialUrl:
      'https://data.worldbank.org/indicator/SP.DYN.TFRT.IN?locations=EU',
    overviewUrl: 'https://data.worldbank.org/topic/health',
  },
  population: {
    publisher: 'Eurostat',
    officialUrl:
      'https://ec.europa.eu/eurostat/databrowser/view/proj_25np/default/table?lang=en',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/population-demography/population-projections',
  },
  ageing: {
    publisher: 'European Commission · 2024 Ageing Report (IP 279)',
    officialUrl:
      'https://economy-finance.ec.europa.eu/publications/2024-ageing-report-economic-and-budgetary-projections-eu-member-states-2022-2070_en',
    overviewUrl:
      'https://economy-finance.ec.europa.eu/economic-and-financial-affairs/european-economy/economic-policy-coordination/eu-economic-governance-review/ageing-report_en',
  },
  routes: {
    publisher: 'Frontex',
    officialUrl: 'https://www.frontex.europa.eu/we-know/publications/risk-analysis/',
    overviewUrl: 'https://www.frontex.europa.eu/we-know/migratory-routes/',
  },
  foreignBorn: {
    publisher: 'Eurostat',
    officialUrl:
      'https://ec.europa.eu/eurostat/databrowser/view/migr_pop3ctb/default/table?lang=en',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/migrant-integration-statistics',
  },
  immigration: {
    publisher: 'Eurostat',
    officialUrl:
      'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Migration_to_and_from_the_EU',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/overview',
  },
  aggregateFlows: {
    publisher: 'Eurostat',
    officialUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/overview',
    overviewUrl: 'https://ec.europa.eu/eurostat/web/migration-asylum/overview',
  },
};

export function enrichMonitorSource(source) {
  const meta = OFFICIAL_SOURCE_META[source.key] || {};
  return {
    ...source,
    dataUrl: source.dataUrl || source.url,
    officialUrl: meta.officialUrl || source.officialUrl || source.url,
    overviewUrl: meta.overviewUrl || meta.officialUrl,
    publisher: meta.publisher || source.name,
  };
}

export function metricSourceFields(source) {
  const s = enrichMonitorSource(source);
  return {
    sourceKey: s.key,
    sourceName: s.name,
    sourceUrl: s.officialUrl,
    sourcePublisher: s.publisher,
  };
}

export function formatReportDateRu(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

const PROBE_TIMEOUT_MS = 7000;

/**
 * Проверка доступности официальных страниц (не поиск, а верификация URL).
 */
export async function probeOfficialSources(sources, fetchImpl = fetch) {
  return Promise.all(
    sources.map(async (source) => {
      const s = enrichMonitorSource(source);
      const url = s.officialUrl;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
        const res = await fetchImpl(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'MigrationMonitor-EU/1.0 (dashboard)' },
        });
        clearTimeout(timer);
        return {
          key: s.key,
          publisher: s.publisher,
          url,
          online: res.ok,
          status: res.status,
        };
      } catch (err) {
        return {
          key: s.key,
          publisher: s.publisher,
          url,
          online: false,
          error: err?.message || 'unreachable',
        };
      }
    })
  );
}
