import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dataset from '../data/euFertilityRateByCountry.json';

const { meta, series: allSeries, data: chartData } = dataset;

const EU27_SERIES = allSeries.filter((s) => s.dataKey !== 'EUU');
const X_TICKS = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
const Y_DOMAIN = [1, 3];
const Y_TICKS = [1, 1.5, 2, 2.5, 3];
const DEFAULT_YEAR = chartData[chartData.length - 1]?.year ?? '2020';

function formatRate(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function itemsForYear(year) {
  const row = chartData.find((d) => d.year === String(year));
  if (!row) return [];
  return EU27_SERIES.map((s) => ({
    dataKey: s.dataKey,
    name: s.name,
    color: s.color,
    value: row[s.dataKey],
  }))
    .filter((e) => e.value != null && Number.isFinite(Number(e.value)))
    .sort((a, b) => Number(b.value) - Number(a.value));
}

function YearValuesPanel({ year, pinned, onUnpin }) {
  const items = useMemo(() => itemsForYear(year), [year]);

  return (
    <aside className="flex min-h-[280px] flex-col rounded-xl border border-sky-200/90 bg-white shadow-sm sm:min-h-0 sm:max-h-[480px] lg:max-h-none lg:h-[480px]">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-sky-100 px-3 py-2.5">
        <p className="text-sm font-semibold text-slate-900">{`Год ${year}`}</p>
        {pinned ? (
          <button
            type="button"
            onClick={onUnpin}
            className="shrink-0 rounded-md border border-sky-200 px-2 py-0.5 text-[11px] font-medium text-sky-800 transition hover:bg-sky-50"
          >
            Открепить
          </button>
        ) : null}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 text-xs">
        {items.map((entry) => (
          <li
            key={entry.dataKey}
            className="border-b border-slate-50 py-1.5 last:border-0"
            style={{ color: entry.color }}
          >
            <span className="text-slate-800">{entry.name}</span>
            <span className="font-mono font-semibold">: {formatRate(Number(entry.value))}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function EuFertilityRateCard() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [hoverYear, setHoverYear] = useState(null);
  const [pinnedYear, setPinnedYear] = useState(null);

  const displayYear = pinnedYear ?? hoverYear ?? DEFAULT_YEAR;
  const lines = useMemo(() => EU27_SERIES, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleChartInteraction = (state) => {
    const label = state?.activeLabel;
    if (label != null && label !== '') setHoverYear(String(label));
  };

  const handleChartClick = (state) => {
    const label = state?.activeLabel;
    if (label == null || label === '') return;
    const y = String(label);
    setPinnedYear((prev) => (prev === y ? null : y));
    setHoverYear(y);
  };

  const handleChartLeave = () => {
    if (!pinnedYear) setHoverYear(null);
  };

  return (
    <article
      ref={rootRef}
      className="relative overflow-visible rounded-2xl border border-sky-200/90 bg-white shadow-[0_8px_30px_rgba(14,165,233,0.12)]"
    >
      <div className="relative px-4 pb-3 pt-5 sm:px-8 sm:pb-4 sm:pt-6 lg:px-12">
        <p className="mb-1 w-full text-left text-base font-semibold text-black sm:text-lg">{meta.title}</p>
        <p className="mb-4 text-left text-xs text-slate-600 sm:text-sm">
          Суммарный коэффициент рождаемости, 27 государств-членов ЕС (1960–2025)
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_min(100%,280px)] lg:gap-5">
          <div className="h-[380px] w-full sm:h-[440px] lg:h-[480px]">
            <ResponsiveContainer width="100%" height="100%" minHeight={360}>
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 16, left: 12, bottom: 28 }}
                onMouseMove={handleChartInteraction}
                onClick={handleChartClick}
                onMouseLeave={handleChartLeave}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" vertical={false} />
                <XAxis
                  type="number"
                  dataKey="year"
                  domain={[1960, 2025]}
                  ticks={X_TICKS}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={{
                    value: meta.xAxisLabel,
                    position: 'insideBottom',
                    offset: -6,
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  domain={Y_DOMAIN}
                  ticks={Y_TICKS}
                  width={44}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(v) => Number(v).toFixed(1)}
                  label={{
                    value: meta.yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 10,
                    offset: 4,
                    style: { textAnchor: 'middle' },
                  }}
                />
                <ReferenceLine
                  y={2.1}
                  stroke="#94a3b8"
                  strokeDasharray="6 4"
                  label={{
                    value: 'Необходимый уровень рождаемости (2,1)',
                    position: 'insideTopRight',
                    fill: '#64748b',
                    fontSize: 10,
                  }}
                />
                <Tooltip
                  cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={() => null}
                  isAnimationActive={false}
                />
                {lines.map(({ dataKey, name, color, strokeWidth }) => (
                  <Line
                    key={dataKey}
                    type="monotone"
                    dataKey={dataKey}
                    name={name}
                    stroke={color}
                    strokeWidth={strokeWidth ?? 1.5}
                    strokeOpacity={0.85}
                    dot={false}
                    activeDot={{ r: 3, strokeWidth: 1 }}
                    connectNulls
                    isAnimationActive={inView}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <YearValuesPanel
            year={displayYear}
            pinned={Boolean(pinnedYear)}
            onUnpin={() => setPinnedYear(null)}
          />
        </div>

        <p className="mt-2 text-center text-[11px] text-slate-500">
          Наведите на график — год обновится в списке справа; клик — закрепить год. Список можно
          прокручивать колёсиком.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-8 lg:px-12">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">{meta.sourceLabel}</p>
      </div>
    </article>
  );
}
