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

const chartTooltip = {
  contentStyle: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#0f172a',
  },
};

function formatRate(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function FertilityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const items = [...payload]
    .filter((e) => e.value != null && Number.isFinite(Number(e.value)))
    .sort((a, b) => Number(b.value) - Number(a.value));

  return (
    <div
      className="max-h-64 overflow-y-auto rounded-[10px] border border-sky-200/90 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm"
      style={chartTooltip.contentStyle}
    >
      <p className="mb-1.5 sticky top-0 bg-white font-medium text-slate-900">{`Год ${label}`}</p>
      <ul className="space-y-0.5 pr-1">
        {items.map((entry) => (
          <li key={entry.dataKey} style={{ color: entry.color }}>
            {`${entry.name}: ${formatRate(Number(entry.value))}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function EuFertilityRateCard() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);

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
        <div className="h-[420px] w-full sm:h-[480px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={380}>
            <LineChart data={chartData} margin={{ top: 12, right: 24, left: 12, bottom: 28 }}>
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
                  value: 'Уровень замещения (2,1)',
                  position: 'insideTopRight',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <Tooltip content={<FertilityTooltip />} />
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
        <p className="mt-2 text-center text-[11px] text-slate-500">
          Наведите на график — значения по всем 27 странам за выбранный год
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-8 lg:px-12">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">
          {meta.sourceLabel}
        </p>
      </div>
    </article>
  );
}
