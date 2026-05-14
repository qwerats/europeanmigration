import { useMemo, useState } from 'react';
import { playChartClickSound } from '../utils/chartClickSound.js';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
  Customized,
  ReferenceLine,
} from 'recharts';
import mockData from '../data/mockData.json';
import emigrationData from '../data/data.json';
import EuropeMapInteractive from './EuropeMapInteractive';
import euForeignBornByYear from '../data/euForeignBornByYear.json';
import euBigFiveByYear from '../data/euBigFiveByYear.json';

const years = ['2021', '2022', '2023', '2024'];

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

const RADIAN = Math.PI / 180;
const REASON_COLORS = {
  family: '#2563eb',
  education: '#f59e0b',
  work: '#06b6d4',
  other: '#ef4444',
};

const EU_FOREIGN_BORN_LABEL_YEARS = new Set(['2010', '2024', '2025']);

function renderForeignBornValueLabel(props) {
  const { x, y, value, payload } = props;
  if (x == null || y == null || value == null || !payload?.year) return null;
  if (!EU_FOREIGN_BORN_LABEL_YEARS.has(String(payload.year))) return null;
  return (
    <text x={x} y={y - 10} fill="#5b21b6" fontSize={11} fontWeight={600} textAnchor="middle">
      {Number(value).toFixed(1)}
    </text>
  );
}

/**
 * Как на образце 2: пунктирные вертикали по 2015 / 2020 / 2022 задаёт ReferenceLine;
 * подписи — строго горизонтально, чуть правее вертикали года, сразу под маркером на кривой.
 */
function EuForeignBornEventOverlays(chartProps) {
  const { formattedGraphicalItems, offset } = chartProps;
  if (!offset || !Array.isArray(formattedGraphicalItems)) return null;

  const lineEntry = formattedGraphicalItems.find(
    (g) => Array.isArray(g?.props?.points) && g.props.points.length > 0
  );
  const pts = lineEntry?.props?.points;
  if (!pts?.length) return null;

  const byYear = {};
  pts.forEach((p) => {
    const y = p?.payload?.year != null ? String(p.payload.year) : '';
    if (y) byYear[y] = p;
  });

  const plotBottom = offset.top + offset.height;
  const padAboveAxis = 32;

  const events = [
    { key: 'syrian', year: '2015', label: 'Сирийский миграционный кризис', dy: 12 },
    { key: 'covid', year: '2020', label: 'COVID-19', dy: 22 },
    { key: 'ukraine', year: '2022', label: 'Война в Украине', dy: 13 },
  ];

  return (
    <g className="eu-foreign-born-events pointer-events-none" aria-hidden>
      {events.map((e) => {
        const p = byYear[e.year];
        if (!p || p.x == null || p.y == null) return null;
        const { x, y: yTop } = p;
        const textX = x + 5;
        const textY = Math.min(yTop + e.dy, plotBottom - padAboveAxis);

        return (
          <text
            key={e.key}
            x={textX}
            y={textY}
            textAnchor="start"
            dominantBaseline="hanging"
            fill="#94a3b8"
            fontSize={9.5}
            fontStyle="italic"
            fontWeight={400}
          >
            {e.label}
          </text>
        );
      })}
    </g>
  );
}

function renderPieLabel({ cx, cy, midAngle, outerRadius, percent, payload }) {
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const value = Number(percent || 0) * 100;
  return (
    <text
      x={x}
      y={y}
      fill={payload?.color ?? '#0f172a'}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 800 }}
    >
      {`${value.toFixed(2)}%`}
    </text>
  );
}

export default function Statistics() {
  const [year, setYear] = useState('2024');

  // Данные для круговой диаграммы
  const pieData = useMemo(() => {
    const yearReasons = mockData.reasonsByYear?.[year] ?? mockData.reasons;
    return yearReasons.map((r) => ({
      key: r.key,
      name: r.label,
      value: r.percent,
      color: REASON_COLORS[r.key] ?? r.color,
    }));
  }, [year]);

  // Данные для линейного графика
  const lineData = useMemo(
    () =>
      years.map((y) => ({
        year: y,
        total: mockData.byYear[y].totalEu,
      })),
    []
  );

  const inflowOutflowData = useMemo(() => {
    const outflowByYear = Object.fromEntries(
      (emigrationData.series ?? []).map((item) => [String(item.year), item.outsideEU ?? 0])
    );

    return years.map((y) => ({
      year: y,
      inflow: mockData.byYear?.[y]?.totalEu ?? 0,
      outflow: outflowByYear[y] ?? 0,
    }));
  }, []);

  const mapDestinationsForYear = useMemo(() => {
    const yearData = mockData.byYear[year]?.destinations ?? [];
    const valueById = Object.fromEntries(yearData.map((d) => [d.id, d.value]));
    return mockData.destinations
      .map((d) => ({ ...d, value: valueById[d.id] ?? 0 }))
      .sort((a, b) => b.value - a.value);
  }, [year]);

  return (
    <div className="animate-fade-up space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
            Statistical explorer
          </p>
          <h2 className="text-3xl font-bold text-gray-900">Статистический эксплорер</h2>
          <p className="max-w-2xl text-gray-600">
            Фильтр по годам и визуализация структуры причин и динамики притока/оттока.
          </p>
        </div>
        <div className="glass-panel flex items-center gap-2 p-1">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={[
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                year === y
                  ? 'bg-sky-100 text-sky-900 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.45)]'
                  : 'text-gray-600 hover:bg-sky-50 hover:text-gray-900',
              ].join(' ')}
            >
              {y}
            </button>
          ))}
        </div>
      </header>

      <section>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EuropeMapInteractive
              selectedYear={Number(year)}
              onYearChange={(y) => setYear(String(y))}
              showFlows
              showLegend
            />
          </div>
          <aside className="space-y-4">
            <div className="glass-panel p-5">
              <h3 className="text-sm font-semibold text-sky-800">Подсветка стран</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                {mapDestinationsForYear.map((d) => (
                  <li
                    key={d.id}
                    className="flex justify-between gap-2 border-b border-sky-100 py-2 last:border-0"
                  >
                    <span className="text-gray-900">{d.nameEn}</span>
                    <span className="font-mono text-sky-600">{d.value.toLocaleString('ru-RU')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="glass-panel chart-glow overflow-visible p-5">
        <h3 className="relative z-10 mb-1 text-center text-base font-semibold leading-snug text-gray-900">
          Количество мигрантов в ЕС
        </h3>
        <div className="relative z-0 mt-4 h-[420px] w-full min-h-0" onClick={() => playChartClickSound()} role="presentation">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={euForeignBornByYear} margin={{ top: 16, right: 20, left: 16, bottom: 36 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.45)" />
              <ReferenceLine
                x="2015"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <ReferenceLine
                x="2020"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <ReferenceLine
                x="2022"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="year"
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                label={{ value: 'Год', position: 'insideBottom', offset: -12, fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                domain={[40, 65]}
                ticks={[40, 42.5, 45, 47.5, 50, 52.5, 55, 57.5, 60, 62.5, 65]}
                allowDataOverflow={false}
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) => Number(v).toFixed(1)}
                label={{
                  value: 'Количество мигрантов, млн',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 4,
                  fill: '#64748b',
                  fontSize: 12,
                }}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(val) => [`${Number(val).toFixed(1)} млн`, 'Численность']}
                labelFormatter={(l) => `Год ${l}`}
              />
              <Line
                type="monotone"
                dataKey="millions"
                name="Иностранное население"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              >
                <LabelList dataKey="millions" content={renderForeignBornValueLabel} />
              </Line>
              <Customized component={EuForeignBornEventOverlays} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <h3 className="relative z-10 mt-10 text-center text-base font-semibold leading-snug text-gray-900">
          Динамика численности мигрантов относительно общего роста
        </h3>
        <div className="relative z-0 mt-4 h-[440px] w-full min-h-0" onClick={() => playChartClickSound()} role="presentation">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={euBigFiveByYear} margin={{ top: 16, right: 20, left: 16, bottom: 52 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.45)" />
              <ReferenceLine
                x={2015}
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <ReferenceLine
                x={2020}
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <ReferenceLine
                x={2022}
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <XAxis
                type="number"
                dataKey="year"
                domain={[2010, 2025]}
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                label={{ value: 'Год', position: 'insideBottom', offset: -8, fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                domain={[4, 22]}
                ticks={[4, 6, 8, 10, 12, 14, 16, 18, 20, 22]}
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) => Number(v).toFixed(1)}
                label={{
                  value: 'Количество мигрантов, млн',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 4,
                  fill: '#64748b',
                  fontSize: 12,
                }}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(val, name) => [`${Number(val).toFixed(1)} млн`, name]}
                labelFormatter={(l) => `Год ${l}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="other"
                name="Другие страны"
                stroke="#f97316"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#f97316', stroke: '#fff', strokeWidth: 1.2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="germany"
                name="Германия"
                stroke="#1e3a8f"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#1e3a8f', stroke: '#fff', strokeWidth: 1.2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="france"
                name="Франция"
                stroke="#0f766e"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#0f766e', stroke: '#fff', strokeWidth: 1.2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="spain"
                name="Испания"
                stroke="#e11d48"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#e11d48', stroke: '#fff', strokeWidth: 1.2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="italy"
                name="Италия"
                stroke="#78716c"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#78716c', stroke: '#fff', strokeWidth: 1.2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-1"> 
        {/* Изменил lg:grid-cols-2 на 1, чтобы круговая диаграмма была крупнее, 
            либо оставьте 2, если хотите, чтобы она занимала пол-экрана */}
        
        <section className="glass-panel chart-glow p-5">
          <h3 className="text-sm font-semibold text-sky-800">Причины миграции</h3>
          <p className="mt-1 text-xs text-gray-500"> </p>
          <div className="mt-4 h-[300px] w-full" onClick={() => playChartClickSound()} role="presentation">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  key={`reasons-${year}`}
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={96}
                  paddingAngle={2}
                  isAnimationActive={false}
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltip} formatter={(value) => [`${value}%`, 'Доля']} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="glass-panel chart-glow p-5">
        <h3 className="text-sm font-semibold text-sky-800">Динамика роста совокупного притока</h3>
        <p className="mt-1 text-xs text-gray-500"> </p>
        <div className="mt-4 h-[320px] w-full" onClick={() => playChartClickSound()} role="presentation">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(14,165,233,0.2)" />
              <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#475569', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(value) => [Number(value).toLocaleString('ru-RU'), 'Всего']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="total"
                name="Иммиграция (всего)"
                stroke="#0ea5e9"
                strokeWidth={3}
                dot={{ r: 5, fill: '#ffffff', stroke: '#0ea5e9', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-panel chart-glow p-5">
        <h3 className="text-sm font-semibold text-sky-800">Динамика притока и оттока</h3>
        <p className="mt-1 text-xs text-gray-500">
          Синяя линия - приток в ЕС, желтая линия - отток в страны вне ЕС
        </p>
        <div className="mt-4 h-[340px] w-full" onClick={() => playChartClickSound()} role="presentation">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={inflowOutflowData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(71,85,105,0.35)" />
              <XAxis dataKey="year" tick={{ fill: '#334155', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#334155', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(value, name) => [
                  Number(value).toLocaleString('ru-RU'),
                  name === 'inflow' ? 'Приток' : 'Отток',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => (value === 'inflow' ? 'Иммиграция в ЕС' : 'Эмиграция вне ЕС')}
              />
              <Line
                type="monotone"
                dataKey="inflow"
                name="inflow"
                stroke="#1d4ed8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#1d4ed8' }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="outflow"
                name="outflow"
                stroke="#ca8a04"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ca8a04' }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
