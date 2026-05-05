import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import mockData from '../data/mockData.json';
import emigrationData from '../data/data.json';
import { linearPredictor } from '../lib/linearRegression';

const FACT_YEARS = [2021, 2022, 2023, 2024];
const FORECAST_YEARS = [2025, 2026, 2027];
const COLORS = {
  immFact: '#0ea5e9',
  emiFact: '#9333ea',
  immForecast: '#7dd3fc',
  emiForecast: '#c084fc',
};

const chartTooltip = {
  contentStyle: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    borderRadius: '12px',
    fontSize: '13px',
    color: '#0f172a',
  },
  labelStyle: { color: '#0f172a' },
};

export default function Forecast() {
  const { chartData, forecastTable } = useMemo(() => {
    const immigration = FACT_YEARS.map((y) => mockData.byYear[String(y)].totalEu);
    const emiByYear = Object.fromEntries(
      (emigrationData.series ?? []).map((row) => [row.year, row.outsideEU ?? 0])
    );
    const emigration = FACT_YEARS.map((y) => emiByYear[y] ?? 0);

    const predictImm = linearPredictor(FACT_YEARS, immigration);
    const predictEmi = linearPredictor(FACT_YEARS, emigration);

    const allYears = [...FACT_YEARS, ...FORECAST_YEARS];
    const chartData = allYears.map((year) => {
      const isFact = FACT_YEARS.includes(year);
      const immF = predictImm(year);
      const emiF = predictEmi(year);
      return {
        year: String(year),
        immigrationFact: isFact ? immigration[FACT_YEARS.indexOf(year)] : null,
        emigrationFact: isFact ? emigration[FACT_YEARS.indexOf(year)] : null,
        immigrationForecast: immF,
        emigrationForecast: emiF,
      };
    });

    const forecastTable = FORECAST_YEARS.map((y) => ({
      year: y,
      immigration: predictImm(y),
      emigration: predictEmi(y),
    }));

    return { chartData, forecastTable };
  }, []);

  const formatInt = (v) =>
    typeof v === 'number' && Number.isFinite(v) ? Number(v).toLocaleString('ru-RU') : '—';

  return (
    <div className="animate-fade-up space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
          Экстраполяция · EU-27
        </p>
        <h2 className="text-3xl font-bold text-gray-900">
          Прогноз внешней миграции ЕС (на базе 2021–2024)
        </h2>
        <p className="max-w-3xl text-gray-600">
          Иммиграция — суммарный приток в ЕС ; эмиграция — отток в страны вне ЕС. Прогноз 2025–2027 —
          линейная регрессия по четырём годам факта (простая экстраполяция в Colab).
        </p>
      </header>

      <section className="glass-panel chart-glow p-5">
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 24, left: 4, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.2)" />
              <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
                label={{ value: 'Количество человек', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(value, name) => {
                  const labels = {
                    immigrationFact: 'Иммиграция (факт)',
                    emigrationFact: 'Эмиграция (факт)',
                    immigrationForecast: 'Иммиграция (прогноз)',
                    emigrationForecast: 'Эмиграция (прогноз)',
                  };
                  return [formatInt(value), labels[name] ?? name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: 12 }} />
              <ReferenceLine
                x="2024"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{ value: 'Текущий год', fill: '#64748b', fontSize: 11, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="immigrationFact"
                name="Иммиграция (факт)"
                stroke={COLORS.immFact}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS.immFact }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="emigrationFact"
                name="Эмиграция (факт)"
                stroke={COLORS.emiFact}
                strokeWidth={2.5}
                dot={{ r: 4, fill: COLORS.emiFact }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="immigrationForecast"
                name="Иммиграция (прогноз)"
                stroke={COLORS.immForecast}
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="emigrationForecast"
                name="Эмиграция (прогноз)"
                stroke={COLORS.emiForecast}
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-800">
          Прогнозные значения (линейная модель)
        </h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Иммиграция</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-800">
              {forecastTable.map((row) => (
                <li key={`im-${row.year}`}>
                  <span className="font-semibold">{row.year}:</span>{' '}
                  {formatInt(row.immigration)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Эмиграция (вне ЕС)</p>
            <ul className="mt-2 space-y-1 text-sm text-gray-800">
              {forecastTable.map((row) => (
                <li key={`em-${row.year}`}>
                  <span className="font-semibold">{row.year}:</span>{' '}
                  {formatInt(row.emigration)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-gray-500">
          Прогноз носит иллюстративный характер.
        </p>
      </section>
    </div>
  );
}
