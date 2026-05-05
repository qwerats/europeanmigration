import { useMemo, useState } from 'react';
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
} from 'recharts';
import mockData from '../data/mockData.json';
import emigrationData from '../data/data.json';

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

  return (
    <div className="animate-fade-up space-y-8 opacity-0 [animation-fill-mode:forwards]">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
            Statistical explorer
          </p>
          <h2 className="text-3xl font-bold text-gray-900">Статистический эксплорер</h2>
          <p className="max-w-2xl text-gray-600">
            Фильтр по годам и визуализация структура причин и динамика
            совокупного притока.
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

      <div className="grid gap-6 lg:grid-cols-1"> 
        {/* Изменил lg:grid-cols-2 на 1, чтобы круговая диаграмма была крупнее, 
            либо оставьте 2, если хотите, чтобы она занимала пол-экрана */}
        
        <section className="glass-panel chart-glow p-5">
          <h3 className="text-sm font-semibold text-sky-800">Причины миграции</h3>
          <p className="mt-1 text-xs text-gray-500"> </p>
          <div className="mt-4 h-[300px] w-full">
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
                  isAnimationActive
                  animationDuration={900}
                  animationEasing="ease-out"
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
        <div className="mt-4 h-[320px] w-full">
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
        <div className="mt-4 h-[340px] w-full">
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
              />
              <Line
                type="monotone"
                dataKey="outflow"
                name="outflow"
                stroke="#ca8a04"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ca8a04' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
