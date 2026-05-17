import { useEffect, useRef, useState } from 'react';
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
import dataset from '../data/residencePermitsByReason.json';

const { meta, series: seriesConfig, data: chartData } = dataset;

const Y_TICKS = [200, 400, 600, 800, 1000, 1200, 1400, 1500];

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

function formatThousands(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '';
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

function PermitsByReasonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const items = [...payload].sort((a, b) => Number(b.value) - Number(a.value));

  return (
    <div
      className="rounded-[10px] border border-sky-200/90 bg-white/98 px-3 py-2 text-xs text-slate-900 shadow-sm"
      style={chartTooltip.contentStyle}
    >
      <p className="mb-1.5 font-medium text-slate-900">{`Год ${label}`}</p>
      <ul className="space-y-0.5">
        {items.map((entry) => (
          <li key={entry.dataKey} style={{ color: entry.color }}>
            {`${entry.name} : ${formatThousands(Number(entry.value))} тыс.`}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResidencePermitsByReasonCard() {
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
    <article ref={rootRef} className="glass-panel chart-glow overflow-hidden p-5 sm:p-6">
      <p className="text-center text-sm font-semibold text-gray-900 sm:text-base">{meta.title}</p>
      <div className="mx-auto mt-4 h-[320px] w-full max-w-4xl sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 48 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.45)" />
            <XAxis
              dataKey="year"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              label={{
                value: 'Год',
                position: 'insideBottom',
                offset: -4,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              domain={[200, 1500]}
              ticks={Y_TICKS}
              width={48}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(v) => formatThousands(v)}
              label={{
                value: meta.yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 4,
                fill: '#64748b',
                fontSize: 10,
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip content={<PermitsByReasonTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: 12 }}
            />
            {seriesConfig.map((s) => (
              <Line
                key={s.dataKey}
                type="linear"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                strokeWidth={3}
                strokeLinecap="square"
                strokeLinejoin="miter"
                dot={{ r: 4, fill: s.color, stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                isAnimationActive={inView}
                animationDuration={900}
                animationEasing="ease-out"
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-600 sm:text-xs">
        {meta.sourceLabel}
      </p>
    </article>
  );
}
