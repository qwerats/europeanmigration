import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dataset from '../data/euAgeingCostsBaseline.json';

const { meta, series: seriesConfig, totalSeries, data: chartData } = dataset;

const Y_DOMAIN = [-4, 12];
const Y_TICKS = [-4, -2, 0, 2, 4, 6, 8, 10, 12];

const chartTooltip = {
  contentStyle: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#0f172a',
  },
};

function formatPp(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} п.п.`;
}

function AgeingCostsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = chartData.find((d) => d.code === label);
  const title = row ? `${row.name} (${row.code})` : label;

  return (
    <div
      className="rounded-[10px] border border-sky-200/90 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm"
      style={chartTooltip.contentStyle}
    >
      <p className="mb-1.5 font-medium text-slate-900">{title}</p>
      <ul className="space-y-0.5">
        {payload
          .filter((e) => e.dataKey !== totalSeries.dataKey)
          .map((entry) => (
            <li key={entry.dataKey} style={{ color: entry.color }}>
              {`${entry.name}: ${formatPp(Number(entry.value))}`}
            </li>
          ))}
        {payload.find((e) => e.dataKey === totalSeries.dataKey) ? (
          <li className="font-semibold text-slate-900">
            {`${totalSeries.name}: ${formatPp(Number(payload.find((e) => e.dataKey === totalSeries.dataKey).value))}`}
          </li>
        ) : null}
      </ul>
    </div>
  );
}

export default function EuAgeingCostsBaselineChart() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);

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
      <div className="relative px-2 pb-3 pt-5 sm:px-4 sm:pb-4 sm:pt-6 lg:px-8">
        <p className="mx-auto mb-1 max-w-5xl px-1 text-left text-base font-semibold text-black sm:px-2 sm:text-lg">
          {meta.title}
        </p>
        {meta.subtitle ? (
          <p className="mx-auto mb-3 max-w-5xl px-1 text-left text-xs text-slate-600 sm:px-2 sm:text-sm">
            {meta.subtitle}
          </p>
        ) : null}

        <div className="mx-auto h-[420px] w-full max-w-6xl sm:h-[480px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={380}>
            <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: 8, bottom: 56 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" vertical={false} />
              <XAxis
                dataKey="code"
                interval={0}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                angle={-55}
                textAnchor="end"
                height={56}
              />
              <YAxis
                domain={Y_DOMAIN}
                ticks={Y_TICKS}
                width={40}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) => Number(v).toFixed(0)}
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
              <Tooltip content={<AgeingCostsTooltip />} />
              <Legend
                verticalAlign="top"
                align="left"
                wrapperStyle={{ fontSize: '11px', color: '#475569', paddingBottom: 8 }}
              />
              {seriesConfig.map(({ dataKey, name, color }) => (
                <Bar
                  key={dataKey}
                  dataKey={dataKey}
                  name={name}
                  stackId="ageing"
                  fill={color}
                  maxBarSize={28}
                  isAnimationActive={inView}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              ))}
              <Line
                type="monotone"
                dataKey={totalSeries.dataKey}
                name={totalSeries.name}
                stroke={totalSeries.color}
                strokeWidth={2}
                dot={{ r: 3, fill: totalSeries.color, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                isAnimationActive={inView}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-8">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">{meta.sourceLabel}</p>
      </div>
    </article>
  );
}
