import { useLayoutEffect, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import euBigFiveByYear from '../data/euBigFiveByYear.json';
import { playChartClickSound } from '../utils/chartClickSound.js';

const compactTooltip = {
  contentStyle: {
    background: 'rgba(255, 255, 255, 0.98)',
    border: '1px solid rgba(14, 165, 233, 0.35)',
    borderRadius: '10px',
    fontSize: '12px',
    color: '#0f172a',
  },
  labelStyle: { color: '#0f172a' },
};

const X_TICKS_MINI = [2010, 2013, 2016, 2019, 2022, 2025];
const X_TICKS_LOUPE = euBigFiveByYear.map((d) => d.year);

const Y_TICKS_MINI = [4, 8, 12, 16, 20, 24];
const Y_TICKS_LOUPE = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

/** Компактный режим. Развёрнутый: высота от ширины (не плоский «ландшафт»). */
const MINI_H = 430;
const LOUPE_H_MIN = 625;
const LOUPE_H_MAX = 940;
/** Отношение высоты к ширине в loupe — чем больше, тем «выше» график. */
const LOUPE_H_RATIO = 0.68;

const MARGIN_MINI = { top: 6, right: 10, left: 16, bottom: 52 };
const MARGIN_LOUPE = { top: 16, right: 28, left: 28, bottom: 82 };

function toggleLoupeKey(e, setLoupe) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    playChartClickSound();
    setLoupe((v) => !v);
  }
}

function BigFiveLineChart({
  width,
  height,
  expanded,
  margin,
  xTicks,
  yTicks,
  yDomain,
  yWidth,
  tickFs,
  strokeW,
  dotR,
  legendFs,
  legendIcon,
}) {
  if (!width || !height) return null;
  return (
    <LineChart width={width} height={height} data={euBigFiveByYear} margin={margin}>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="rgba(148, 163, 184, 0.45)"
        vertical={expanded}
      />
      <ReferenceLine x={2015} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
      <ReferenceLine x={2020} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
      <ReferenceLine x={2022} stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 4" />
      <XAxis
        type="number"
        dataKey="year"
        domain={[2010, 2025]}
        ticks={xTicks}
        tick={{ fill: '#475569', fontSize: tickFs }}
        angle={expanded ? -45 : 0}
        textAnchor={expanded ? 'end' : 'middle'}
        height={expanded ? 56 : undefined}
        axisLine={expanded ? { stroke: '#cbd5e1' } : false}
        tickLine={expanded ? { stroke: '#cbd5e1' } : false}
        label={{
          value: 'Год',
          position: 'insideBottom',
          offset: expanded ? -6 : -2,
          fill: '#64748b',
          fontSize: expanded ? 12 : 11,
        }}
      />
      <YAxis
        domain={yDomain}
        ticks={yTicks}
        width={yWidth}
        tick={{ fill: '#475569', fontSize: tickFs }}
        axisLine={expanded ? { stroke: '#cbd5e1' } : false}
        tickLine={expanded ? { stroke: '#cbd5e1' } : false}
        tickFormatter={(v) =>
          expanded ? Number(v).toFixed(1) : Number(v).toLocaleString('ru-RU', { maximumFractionDigits: 0 })
        }
        label={{
          value: 'Количество мигрантов, млн',
          angle: -90,
          position: 'left',
          fill: '#64748b',
          fontSize: expanded ? 12 : 10,
          offset: expanded ? 18 : 14,
          style: { textAnchor: 'middle' },
        }}
      />
      <Tooltip
        {...compactTooltip}
        formatter={(val, name) => [`${Number(val).toFixed(1)} млн`, name]}
        labelFormatter={(l) => `Год ${l}`}
      />
      <Legend
        verticalAlign="bottom"
        align="center"
        wrapperStyle={{
          fontSize: `${legendFs}px`,
          color: '#475569',
          paddingTop: expanded ? 14 : 6,
          lineHeight: '1.45',
        }}
        iconSize={legendIcon}
      />
      <Line
        type="monotone"
        dataKey="other"
        name="Другие страны"
        stroke="#f97316"
        strokeWidth={strokeW}
        dot={{ r: dotR, fill: '#f97316', stroke: '#fff', strokeWidth: 1 }}
        activeDot={{ r: dotR + 2 }}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="germany"
        name="Германия"
        stroke="#1e3a8f"
        strokeWidth={strokeW}
        dot={{ r: dotR, fill: '#1e3a8f', stroke: '#fff', strokeWidth: 1 }}
        activeDot={{ r: dotR + 2 }}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="france"
        name="Франция"
        stroke="#0f766e"
        strokeWidth={strokeW}
        dot={{ r: dotR, fill: '#0f766e', stroke: '#fff', strokeWidth: 1 }}
        activeDot={{ r: dotR + 2 }}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="spain"
        name="Испания"
        stroke="#e11d48"
        strokeWidth={strokeW}
        dot={{ r: dotR, fill: '#e11d48', stroke: '#fff', strokeWidth: 1 }}
        activeDot={{ r: dotR + 2 }}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="italy"
        name="Италия"
        stroke="#78716c"
        strokeWidth={strokeW}
        dot={{ r: dotR, fill: '#78716c', stroke: '#fff', strokeWidth: 1 }}
        activeDot={{ r: dotR + 2 }}
        isAnimationActive={false}
      />
    </LineChart>
  );
}

export default function EuBigFiveMigrantsLineCompact() {
  const [loupe, setLoupe] = useState(false);
  const measureRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(520);

  const chartHeight = loupe
    ? Math.min(LOUPE_H_MAX, Math.max(LOUPE_H_MIN, Math.round(chartWidth * LOUPE_H_RATIO)))
    : MINI_H;

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const next = Math.floor(w);
      if (next >= 64) setChartWidth(next);
    };
    measure();
    const id = requestAnimationFrame(() => measure());
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [loupe]);

  const miniProps = {
    expanded: false,
    margin: MARGIN_MINI,
    xTicks: X_TICKS_MINI,
    yTicks: Y_TICKS_MINI,
    yDomain: [4, 24],
    yWidth: 46,
    tickFs: 11,
    strokeW: 2.05,
    dotR: 2.85,
    legendFs: 12,
    legendIcon: 10,
  };

  const loupeProps = {
    expanded: true,
    margin: MARGIN_LOUPE,
    xTicks: X_TICKS_LOUPE,
    yTicks: Y_TICKS_LOUPE,
    yDomain: [4, 22],
    yWidth: 58,
    tickFs: 12,
    strokeW: 2.4,
    dotR: 3.5,
    legendFs: 13,
    legendIcon: 11,
  };

  return (
    <article
      className={[
        'relative overflow-visible glass-panel chart-glow flex flex-col p-5',
        loupe ? 'z-30 min-h-[min(96vh,1140px)]' : 'min-h-[420px] sm:min-h-[460px]',
      ].join(' ')}
    >
      <h3 className="text-center text-base font-bold leading-snug text-black sm:text-lg">
        Динамика численности мигрантов относительно общего роста
      </h3>
      <div className="mt-2 w-full flex-shrink-0 sm:mt-3">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={loupe}
          aria-label={
            loupe
              ? 'Увеличенный график. Нажмите, чтобы свернуть.'
              : 'Компактный график. Нажмите, чтобы развернуть на всю ширину блока.'
          }
          onClick={() => {
            playChartClickSound();
            setLoupe((v) => !v);
          }}
          onKeyDown={(e) => toggleLoupeKey(e, setLoupe)}
          className={[
            'relative w-full cursor-pointer rounded-xl border border-transparent bg-transparent p-0 outline-none transition-[width,margin,height] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2',
            loupe
              ? 'sm:ml-[calc(-100%-1rem)] sm:w-[calc(200%+1rem)] sm:border-sky-200/80 sm:bg-white sm:px-1 sm:shadow-[0_0_0_10px_rgba(255,255,255,0.95),0_0_0_12px_rgba(56,189,248,0.28),0_28px_55px_-12px_rgba(15,23,42,0.28)] sm:ring-1 sm:ring-sky-300/50'
              : '',
          ].join(' ')}
        >
          <div
            ref={measureRef}
            className="w-full min-w-0 transition-[height] duration-500 ease-out"
            style={{ height: chartHeight }}
          >
            <BigFiveLineChart
              key={loupe ? 'big-five-loupe' : 'big-five-mini'}
              width={chartWidth}
              height={chartHeight}
              {...(loupe ? loupeProps : miniProps)}
            />
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400 sm:text-[11px]">
          Нажмите на график — увеличить или свернуть
        </p>
      </div>
    </article>
  );
}
