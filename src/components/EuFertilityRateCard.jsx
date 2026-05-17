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

const { meta } = dataset;

const EU_SERIES = {
  dataKey: 'rate',
  name: 'Средний по ЕС',
  color: '#dc2626',
  strokeWidth: 3,
};

const LAST_YEAR = 2024;
const X_TICKS = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
const Y_DOMAIN = [1, 2.8];
const Y_TICKS = [1, 1.5, 2, 2.5];
const REPLACEMENT_LEVEL = 2.1;

function formatRate(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—';
  return v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function EuFertilityRateCard() {
  const rootRef = useRef(null);
  const [inView, setInView] = useState(false);

  const chartData = useMemo(
    () =>
      dataset.data
        .filter((row) => Number(row.year) <= LAST_YEAR && row.EUU != null)
        .map((row) => ({
          year: row.year,
          rate: Number(row.EUU),
        })),
    []
  );

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
        <p className="mb-4 w-full text-left text-base font-semibold text-black sm:text-lg">{meta.title}</p>

        <div className="h-[380px] w-full sm:h-[440px] lg:h-[480px]">
          <ResponsiveContainer width="100%" height="100%" minHeight={360}>
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: 12, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" vertical={false} />
              <XAxis
                type="number"
                dataKey="year"
                domain={[1960, LAST_YEAR]}
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
                y={REPLACEMENT_LEVEL}
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
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const v = Number(payload[0]?.value);
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-semibold text-slate-800">{`Год ${label}`}</p>
                      <p className="text-red-700">{`${EU_SERIES.name}: ${formatRate(v)}`}</p>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey={EU_SERIES.dataKey}
                name={EU_SERIES.name}
                stroke={EU_SERIES.color}
                strokeWidth={EU_SERIES.strokeWidth}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: EU_SERIES.color }}
                connectNulls
                isAnimationActive={inView}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-8 lg:px-12">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">
          {meta.sourceLabel}
        </p>
      </div>
    </article>
  );
}
