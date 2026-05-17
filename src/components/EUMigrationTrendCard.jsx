import { useState } from 'react';
import {
  CartesianGrid,
  Customized,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { playChartClickSound } from '../utils/chartClickSound.js';
import {
  EU_MIGRANTS_META,
  X_AXIS_TICKS_LOUPE,
  X_AXIS_TICKS_MINI,
  Y_AXIS_DOMAIN_LOUPE,
  Y_AXIS_DOMAIN_MINI,
  Y_AXIS_TICKS_LOUPE,
  Y_AXIS_TICKS_MINI,
  euMigrantsAnnotations,
  euMigrantsEventMarkers,
  euMigrantsTimeline,
} from '../data/euMigrantsTimeline';

function formatMln(n) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatYTickLoupe(v) {
  return v.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function MigrantsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{label}</p>
      <p className="text-violet-700">{formatMln(v)} млн</p>
    </div>
  );
}

/** Увеличенный вид: подписи у вертикалей 2015 / 2020 / 2022, чуть выше линий сетки 42,5 / 52,5 / 55 (как на эталоне). */
const MINI_H = 260;
const LOUPE_CHART_H = 380;

const MARGIN_MINI = { top: 10, right: 10, left: 4, bottom: 26 };
const MARGIN_LOUPE = { top: 8, right: 14, left: 14, bottom: 52 };

/** Как на 2-й картинке: сразу справа от пунктира, светло-серый курсив, по вертикали чуть выше указанной горизонтали сетки. */
const LOUPE_EVENT_LABEL_SPECS = [
  { year: 2015, yAt: 43.25, text: 'Сирийский миграционный кризис' },
  { year: 2020, yAt: 53.25, text: 'COVID-19' },
  { year: 2022, yAt: 55.1, text: 'Война в Украине' },
];

function pickAxis(map) {
  if (!map) return null;
  const k = Object.keys(map)[0];
  return map[k] ?? Object.values(map)[0];
}

function LoupeEventLabelsInPlot({ xAxisMap, yAxisMap, enabled }) {
  if (!enabled) return null;
  const xAxis = pickAxis(xAxisMap);
  const yAxis = pickAxis(yAxisMap);
  const sx = xAxis?.scale;
  const sy = yAxis?.scale;
  if (!sx || !sy) return null;
  return (
    <g className="pointer-events-none" aria-hidden>
      {LOUPE_EVENT_LABEL_SPECS.map(({ year, yAt, text }) => (
        <text
          key={year}
          x={sx(year) + 5}
          y={sy(yAt)}
          textAnchor="start"
          fill="#94a3b8"
          fontSize={10}
          fontStyle="italic"
          fontFamily="system-ui, sans-serif"
          dominantBaseline="middle"
        >
          {text}
        </text>
      ))}
    </g>
  );
}

function toggleLoupeKey(e, setLoupe) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    playChartClickSound();
    setLoupe((v) => !v);
  }
}

export default function EUMigrationTrendCard() {
  const [loupe, setLoupe] = useState(false);

  return (
    <article className="relative overflow-visible rounded-2xl border border-sky-200/90 bg-white shadow-[0_8px_30px_rgba(14,165,233,0.12)]">
      <div className="border-b border-slate-100 px-5 py-5 text-center sm:px-6 sm:py-6">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          <span className="inline-block border-b-[3px] border-[#f9c262] pb-1.5 text-[#30618a]">
            Тренды
          </span>
        </h2>
      </div>

      <div className="relative px-2 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
        <p className="mx-auto mb-4 max-w-4xl px-1 text-left text-sm leading-relaxed text-gray-700 sm:px-2 sm:text-base">
          Миграционный кризис 2015 г., а затем резкое увеличение числа мигрантов в 2022 г. стала причиной
          «кризиса солидарности». Фактически это означает, разногласия и неспособность выработки общей
          миграционной политики среди государств Европы; а также невозможность донесения содержания мер до
          общественности.
        </p>
        <p className="mx-auto mb-4 max-w-4xl px-1 text-left text-sm leading-relaxed text-gray-700 sm:px-2 sm:text-base">
          Основными тенденциями миграции в ЕС являются: приоритет рестриктивной политики над превентивным
          подходом; зависимость миграции от появления «чёрных лебедей» (гражданская война в Сирии с 2011 г.,
          арабская война, Украинский кризис и COVID-19).
        </p>
        <p className="mx-auto mb-2 max-w-4xl px-1 text-left text-base font-semibold text-black sm:mb-3 sm:px-2 sm:text-lg">
          Общее количество мигрантов в ЕС
        </p>
        <div
          role="button"
          tabIndex={0}
          aria-expanded={loupe}
          aria-label={
            loupe
              ? 'Увеличенный график мигрантов в ЕС. Нажмите, чтобы свернуть.'
              : 'Компактный график. Нажмите, чтобы развернуть с осями и подписями событий.'
          }
          onClick={() => {
            playChartClickSound();
            setLoupe((v) => !v);
          }}
          onKeyDown={(e) => toggleLoupeKey(e, setLoupe)}
          className={[
            'relative mx-auto max-w-4xl cursor-pointer rounded-xl border border-sky-200/80 bg-white px-1 outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 sm:px-2',
            loupe
              ? 'z-20 scale-[1.02] shadow-[0_0_0_10px_rgba(255,255,255,0.95),0_0_0_12px_rgba(56,189,248,0.35),0_28px_55px_-12px_rgba(15,23,42,0.35)] ring-1 ring-sky-300/60'
              : 'shadow-inner',
          ].join(' ')}
        >
          <div
            className="transition-[height] duration-500 ease-out"
            style={{ height: loupe ? LOUPE_CHART_H : MINI_H }}
          >
            <ResponsiveContainer width="100%" height="100%" minHeight={loupe ? LOUPE_CHART_H : MINI_H}>
              <LineChart data={euMigrantsTimeline} margin={loupe ? MARGIN_LOUPE : MARGIN_MINI}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={loupe} />
                <XAxis
                  dataKey="year"
                  type="number"
                  domain={[2010, 2025]}
                  ticks={loupe ? X_AXIS_TICKS_LOUPE : X_AXIS_TICKS_MINI}
                  tick={{ fontSize: loupe ? 9 : 10, fill: '#64748b' }}
                  angle={loupe ? -45 : 0}
                  textAnchor={loupe ? 'end' : 'middle'}
                  height={loupe ? 48 : undefined}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                  label={
                    loupe
                      ? {
                          value: 'Год',
                          position: 'insideBottom',
                          offset: -2,
                          fill: '#64748b',
                          fontSize: 11,
                        }
                      : undefined
                  }
                />
                <YAxis
                  domain={loupe ? Y_AXIS_DOMAIN_LOUPE : Y_AXIS_DOMAIN_MINI}
                  ticks={loupe ? Y_AXIS_TICKS_LOUPE : Y_AXIS_TICKS_MINI}
                  width={loupe ? 62 : 40}
                  tick={{ fontSize: loupe ? 10 : 10, fill: '#64748b' }}
                  tickFormatter={loupe ? formatYTickLoupe : (v) => `${v}`}
                  label={
                    loupe
                      ? {
                          value: 'Количество мигрантов, млн',
                          angle: -90,
                          position: 'insideLeft',
                          fill: '#64748b',
                          fontSize: 10,
                          dx: -6,
                          style: { textAnchor: 'middle' },
                        }
                      : undefined
                  }
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip content={<MigrantsTooltip />} />
                {!loupe
                  ? euMigrantsAnnotations.map((a) => (
                      <ReferenceArea
                        key={a.label}
                        x1={a.x1}
                        x2={a.x2}
                        fill="#94a3b8"
                        fillOpacity={0.12}
                        stroke="none"
                      />
                    ))
                  : null}
                {loupe
                  ? euMigrantsEventMarkers.map((m) => (
                      <ReferenceLine
                        key={m.year}
                        x={m.year}
                        stroke="#64748b"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        strokeOpacity={0.95}
                      />
                    ))
                  : null}
                <Line
                  type="monotone"
                  dataKey="migrantsMln"
                  name="Млн"
                  stroke="#6d28d9"
                  strokeWidth={1.8}
                  dot={{ r: 3, fill: '#fff', stroke: '#6d28d9', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
                <Customized
                  component={(chartProps) => (
                    <LoupeEventLabelsInPlot {...chartProps} enabled={loupe} />
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400 sm:text-[11px]">
          Нажмите на график — увеличить или свернуть
        </p>
        <p className="mx-auto mt-4 max-w-4xl px-1 text-left text-xs leading-relaxed text-slate-600 sm:px-2 sm:text-sm">
          <span className="font-semibold text-slate-700">Примечание.</span> Если на графике общего количества
          мигрантов влияние Сирийского миграционного кризиса не так очевидно, то впоследствии графики
          пересечения внешних границ и аналитика роста по странам докажут обратное.
        </p>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-[11px] leading-relaxed text-slate-600 sm:text-xs">{EU_MIGRANTS_META.sourceLabel}</p>
      </div>
    </article>
  );
}
