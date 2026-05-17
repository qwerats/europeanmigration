import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import projection from '../data/euPopulationProjection.json';

const { meta, series: seriesConfig, data: chartData } = projection;

const X_TICKS = [2020, 2040, 2060, 2080, 2100];
const Y_DOMAIN = [280, 480];
const Y_TICKS = [300, 350, 400, 450];

const chartTooltip = {
  contentStyle: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#0f172a',
  },
  labelStyle: { color: '#0f172a' },
};

function formatMln(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return 'тАФ';
  return v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function EuPopulationProjectionCard() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);

  const lines = useMemo(() => seriesConfig, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={rootRef}
      className="relative overflow-visible rounded-2xl border border-sky-200/90 bg-white shadow-[0_8px_30px_rgba(14,165,233,0.12)]"
    >
      <div className="relative px-2 pb-3 pt-5 sm:px-4 sm:pb-4 sm:pt-6">
        <p className="mx-auto mb-3 max-w-4xl px-1 text-left text-base font-semibold text-black sm:px-2 sm:text-lg">
          {meta.title}
        </p>
        <div className="mx-auto h-[380px] w-full max-w-4xl sm:h-[420px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={360}>
            <LineChart data={chartData} margin={{ top: 12, right: 20, left: 8, bottom: 56 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" vertical={false} />
              <XAxis
                type="number"
                dataKey="year"
                domain={[2020, 2100]}
                ticks={X_TICKS}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                label={{
                  value: meta.xAxisLabel,
                  position: 'insideBottom',
                  offset: -8,
                  fill: '#64748b',
                  fontSize: 11,
                }}
              />
              <YAxis
                domain={Y_DOMAIN}
                ticks={Y_TICKS}
                width={48}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) => String(v)}
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
              <Tooltip
                {...chartTooltip}
                formatter={(val, name) => [`${formatMln(val)} ╨╝╨╗╨╜`, name]}
                labelFormatter={(l) => `╨У╨╛╨┤ ${l}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: 12 }}
                iconType="line"
              />
              {lines.map(({ dataKey, name, color, strokeWidth }) => (
                <Line
                  key={dataKey}
                  type="monotone"
                  dataKey={dataKey}
                  name={name}
                  stroke={color}
                  strokeWidth={strokeWidth ?? 2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                  connectNulls
                  isAnimationActive={inView}
                  animationDuration={1800}
                  animationEasing="ease-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-6">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">{meta.sourceLabel}</p>
      </div>
    </article>
  );
}
