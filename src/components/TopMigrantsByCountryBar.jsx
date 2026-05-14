import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Подписи оси значений (млн), снизу слева направо. */
const X_AXIS_TICKS = [0, 50, 100, 150, 200, 205];
const X_AXIS_MAX = 205;

/** Eurostat MIGR_POP3CTB, 2010–2025, млн. Порядок в data = порядок на экране сверху вниз (Recharts: первая строка — сверху). */
const ROWS_DESC = [
  { country: 'Германия', value: 204.9 },
  { country: 'Франция', value: 131.6 },
  { country: 'Испания', value: 109.8 },
  { country: 'Италия', value: 92.4 },
  { country: 'Бельгия', value: 30.9 },
];

function formatValue(v) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '';
  return v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export default function TopMigrantsByCountryBar() {
  const chartData = useMemo(() => [...ROWS_DESC], []);

  return (
    <article
      className="relative overflow-visible glass-panel chart-glow flex h-full min-h-[360px] flex-col p-5 sm:min-h-[400px]"
    >
      <h3 className="text-center text-base font-bold leading-snug text-black sm:text-lg">
        Страны с наибольшим количеством мигрантов
      </h3>
      <p className="mt-1 text-center text-xs text-slate-500">Eurostat, MIGR_POP3CTB</p>
      <div className="mt-4 h-[300px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 4, right: 44, left: 0, bottom: 28 }}
            barCategoryGap={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.45)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, X_AXIS_MAX]}
              ticks={X_AXIS_TICKS}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(v) => v.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
            />
            <YAxis
              type="category"
              dataKey="country"
              width={92}
              tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15, 118, 110, 0.06)' }}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid rgba(15, 118, 110, 0.25)',
                fontSize: 12,
              }}
              formatter={(v) => [`${formatValue(v)} млн`, '']}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="value"
              fill="#0f766e"
              radius={[0, 3, 3, 0]}
              maxBarSize={28}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="value"
                position="right"
                fill="#0f172a"
                fontSize={12}
                fontWeight={600}
                formatter={formatValue}
                offset={6}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
