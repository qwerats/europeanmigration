import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Customized,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dataset from '../data/asylumApplicationsEu.json';

const { meta, data: rawData } = dataset;

const CHART_COLOR = '#0d9488';
const FIRST_YEAR = 2014;
const LAST_YEAR = 2025;
const X_TICKS = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
const Y_TICKS = Array.from({ length: 14 }, (_, i) => i * 100000);
const Y_DOMAIN = [0, 1300000];

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

function formatCount(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '';
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

function pickAxis(map) {
  if (!map) return null;
  const k = Object.keys(map)[0];
  return map[k] ?? Object.values(map)[0];
}

function LastPointLabel({ xAxisMap, yAxisMap, lastPoint }) {
  if (!lastPoint?.applications) return null;
  const xAxis = pickAxis(xAxisMap);
  const yAxis = pickAxis(yAxisMap);
  const sx = xAxis?.scale;
  const sy = yAxis?.scale;
  if (!sx || !sy) return null;

  const x = sx(lastPoint.year);
  const y = sy(lastPoint.applications);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  return (
    <text
      x={x + 6}
      y={y - 8}
      textAnchor="start"
      fill="#0f766e"
      fontSize={11}
      fontWeight={600}
      fontFamily="system-ui, sans-serif"
    >
      {formatCount(lastPoint.applications)}
    </text>
  );
}

function AsylumTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  if (value == null) return null;

  return (
    <div
      className="rounded-[10px] border border-sky-200/90 bg-white/98 px-3 py-2 text-xs text-slate-900 shadow-sm"
      style={chartTooltip.contentStyle}
    >
      <p className="font-medium text-slate-900">{`Год ${label}`}</p>
      <p className="mt-0.5 text-teal-700">{formatCount(Number(value))}</p>
    </div>
  );
}

export default function AsylumApplicationsChart() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);

  const chartData = useMemo(
    () =>
      rawData
        .filter((row) => row.year >= FIRST_YEAR && row.applications != null)
        .map((row) => ({
          year: row.year,
          applications: row.applications,
        })),
    []
  );

  const lastPoint = useMemo(() => {
    for (let i = chartData.length - 1; i >= 0; i -= 1) {
      if (chartData[i].applications != null) return chartData[i];
    }
    return null;
  }, [chartData]);

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
      <div className="mx-auto mt-4 h-[320px] w-full max-w-4xl sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <AreaChart data={chartData} margin={{ top: 16, right: 72, left: 8, bottom: 36 }}>
            <defs>
              <linearGradient id="asylumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(203, 213, 225, 0.9)" vertical />
            <XAxis
              type="number"
              dataKey="year"
              domain={[FIRST_YEAR, LAST_YEAR]}
              ticks={X_TICKS}
              interval={0}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              angle={-45}
              textAnchor="end"
              height={48}
              label={{
                value: 'Год',
                position: 'insideBottom',
                offset: -4,
                fill: '#64748b',
                fontSize: 11,
              }}
            />
            <YAxis
              domain={Y_DOMAIN}
              ticks={Y_TICKS}
              width={56}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCount(v)}
            />
            <Tooltip content={<AsylumTooltip />} />
            <Legend
              verticalAlign="top"
              align="left"
              iconType="plainline"
              wrapperStyle={{ fontSize: '12px', color: '#334155', paddingBottom: 8 }}
              formatter={() => meta.legendLabel}
            />
            <Area
              type="monotone"
              dataKey="applications"
              name={meta.legendLabel}
              stroke={CHART_COLOR}
              strokeWidth={2.5}
              fill="url(#asylumFill)"
              dot={false}
              activeDot={{ r: 5, fill: CHART_COLOR, stroke: '#fff', strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={inView}
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Customized
              component={({ xAxisMap, yAxisMap }) => (
                <LastPointLabel xAxisMap={xAxisMap} yAxisMap={yAxisMap} lastPoint={lastPoint} />
              )}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-600 sm:text-xs">
        {meta.sourceLabel}
      </p>
    </article>
  );
}
