import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import routes from '../data/mediterraneanRoutesIrregular.json';

const { meta, series: seriesConfig, data: chartData } = routes;

const Y_TICKS = [0, 200000, 400000, 600000, 800000, 1000000];

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

function formatInt(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '';
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

export default function MediterraneanRoutesStackedBar() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
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
      <div className="relative px-2 pb-3 pt-5 sm:px-4 sm:pb-4 sm:pt-6">
        <p className="mx-auto mb-1 max-w-4xl px-1 text-left text-base font-semibold text-black sm:px-2 sm:text-lg">
          {meta.title}
        </p>
        <p className="mx-auto mb-3 max-w-4xl px-1 text-left text-xs text-slate-600 sm:px-2 sm:text-sm">
          {meta.note}
        </p>
        <div className="mx-auto h-[400px] w-full max-w-4xl sm:h-[440px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={360}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: 32, bottom: 52 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[0, 1000000]}
                ticks={Y_TICKS}
                width={62}
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) => formatInt(v)}
                label={{
                  value: meta.yAxisLabel,
                  angle: -90,
                  position: 'left',
                  fill: '#64748b',
                  fontSize: 10,
                  dx: -20,
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip
                {...chartTooltip}
                formatter={(val, name) => [formatInt(val), name]}
                labelFormatter={(l) => `Год ${l}`}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: 8 }}
              />
              {seriesConfig.map(({ dataKey, name, color }) => (
                <Bar
                  key={dataKey}
                  dataKey={dataKey}
                  name={name}
                  stackId="routes"
                  fill={color}
                  maxBarSize={56}
                  isAnimationActive={inView}
                  animationDuration={1400}
                  animationEasing="ease-out"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-6">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">{meta.sourceLabel}</p>
      </div>
    </article>
  );
}
