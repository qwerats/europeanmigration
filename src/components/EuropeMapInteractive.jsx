import { useEffect, useMemo, useState } from 'react';
import countriesMap from '../data/europeCountriesMap.json';
import immigrationData from '../data/immigrationData.json';

const YEARS = [2021, 2022, 2023, 2024];

function formatNum(value) {
  return Number(value || 0).toLocaleString('ru-RU');
}

function heatColor(value, maxValue) {
  if (!value || !maxValue) {
    return '#dce5f0';
  }
  const ratio = value / maxValue;
  const r = Math.round(255 - ratio * 45);
  const g = Math.round(245 - ratio * 205);
  const b = Math.round(235 - ratio * 225);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function EuropeMapInteractive({
  compact = false,
  showLegend = true,
  selectedYear: controlledYear,
  onYearChange,
}) {
  const [internalYear, setInternalYear] = useState(2024);
  const [hoverCountryId, setHoverCountryId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { viewBox, features } = countriesMap;

  const countries = useMemo(() => {
    const map = new Map();
    for (const row of immigrationData) {
      const id = row.id;
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: row.name,
          values: {},
        });
      }
      map.get(id).values[row.year] = row.value;
    }
    return [...map.values()];
  }, []);
  const countryById = useMemo(() => Object.fromEntries(countries.map((c) => [c.id, c])), [countries]);

  const maxVal = useMemo(() => {
    const values = immigrationData.map((d) => Number(d.value) || 0);
    return values.length ? Math.max(...values) : 0;
  }, []);

  const activeHover = hoverCountryId ? countries.find((c) => c.id === hoverCountryId) ?? null : null;
  const selectedYear = controlledYear ?? internalYear;
  const yearIndex = YEARS.indexOf(selectedYear);
  /** Год переключается снаружи (например, в шапке Statistics) — не дублируем кнопки и слайдер года. */
  const hideInlineYearControls = controlledYear != null && typeof onYearChange === 'function';
  const setSelectedYear = (nextYear) => {
    if (controlledYear == null) {
      setInternalYear(nextYear);
    }
    onYearChange?.(nextYear);
  };

  const handlePointerDown = (e) => {
    if (zoom <= 1) {
      return;
    }
    const target = e.currentTarget;
    target.setPointerCapture?.(e.pointerId);
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging || zoom <= 1) {
      return;
    }
    const nx = e.clientX - dragStart.x;
    const ny = e.clientY - dragStart.y;
    const maxOffset = (zoom - 1) * 260;
    setPan({
      x: Math.max(-maxOffset, Math.min(maxOffset, nx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, ny)),
    });
  };

  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      const idx = YEARS.indexOf(selectedYear);
      const next = YEARS[(idx + 1) % YEARS.length];
      setSelectedYear(next);
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying, selectedYear]);

  useEffect(() => {
    if (zoom <= 1.01) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {!hideInlineYearControls ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {YEARS.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={[
                'rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200',
                selectedYear === year
                  ? 'border-sky-500 bg-sky-500 text-white shadow-[0_0_14px_rgba(14,165,233,0.25)]'
                  : 'border-sky-200 bg-white text-gray-700 hover:bg-sky-50',
              ].join(' ')}
            >
              {year}
            </button>
          ))}
        </div>
      ) : null}

      <div className="glass-panel map-glow relative overflow-hidden p-2 sm:p-4">
        <div className="mb-2 text-sm font-semibold text-slate-700">Тепловая карта иммиграции в ЕС (2021-2024)</div>
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className={`mx-auto w-full max-w-[760px] touch-manipulation [aspect-ratio:1/1] ${zoom > 1 ? 'cursor-grab' : ''} ${isDragging ? '!cursor-grabbing' : ''}`}
          role="img"
          aria-label={`Тепловая карта иммиграции в Европу, ${selectedYear}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <g transform={`translate(500 500) translate(${pan.x.toFixed(1)} ${pan.y.toFixed(1)}) scale(${zoom}) translate(-500 -500)`}>
            {features.map((feature) => {
              const country = countryById[feature.id];
              const value = country?.values?.[selectedYear] ?? 0;
              const isActive = hoverCountryId === feature.id;
              return (
                <g
                  key={feature.id}
                  onMouseEnter={() => setHoverCountryId(feature.id)}
                  onMouseLeave={() => setHoverCountryId(null)}
                  onFocus={() => setHoverCountryId(feature.id)}
                  onBlur={() => setHoverCountryId(null)}
                  tabIndex={country ? 0 : -1}
                  className={country ? 'cursor-pointer outline-none' : ''}
                >
                  {feature.paths.map((d, idx) => (
                    <path
                      key={`${feature.id}-${idx}`}
                      d={d}
                      fill={heatColor(value, maxVal)}
                    stroke={isActive ? '#6d28d9' : '#8297b2'}
                    strokeWidth={isActive ? 1.7 : 1.1}
                      className="transition-all duration-200"
                    />
                  ))}
                </g>
              );
            })}
          </g>
        </svg>

        {activeHover && (
          <div className="absolute right-3 top-3 rounded-xl border border-sky-200 bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">{selectedYear}</p>
            <p className="font-semibold text-gray-900">{activeHover.name}</p>
            <p className="mt-1 font-mono text-base text-gray-900">
              {formatNum(activeHover.values[selectedYear])} <span className="text-xs text-gray-500">чел.</span>
            </p>
          </div>
        )}

        {showLegend && (
          <div className="pointer-events-none absolute bottom-3 left-3">
            <div className="rounded-lg border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur-sm">
              <p className="mb-1 text-xs font-semibold text-slate-700">Кол-во прибывших</p>
              <div className="flex gap-2">
                <div className="h-40 w-5 rounded bg-gradient-to-t from-slate-100 via-orange-400 to-red-700" />
                <div className="flex h-40 flex-col justify-between text-[11px] text-slate-600">
                  <span>{(maxVal / 1e6).toFixed(1)}M</span>
                  <span>{(maxVal * 0.8 / 1e6).toFixed(1)}M</span>
                  <span>{(maxVal * 0.6 / 1e6).toFixed(1)}M</span>
                  <span>{(maxVal * 0.4 / 1e6).toFixed(1)}M</span>
                  <span>{(maxVal * 0.2 / 1e6).toFixed(1)}M</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="glass-panel p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((v) => !v)}
            className="rounded-md border border-sky-300 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50"
          >
            {isPlaying ? 'Пауза' : 'Запуск таймлайна'}
          </button>
          <span className="text-xs text-slate-600">Год: {selectedYear}</span>
        </div>
        <input
          type="range"
          min={0}
          max={YEARS.length - 1}
          step={1}
          value={Math.max(0, yearIndex)}
          onChange={(e) => {
            const idx = Number(e.target.value);
            setSelectedYear(YEARS[idx]);
            setIsPlaying(false);
          }}
          className="w-full accent-sky-500"
        />
      </div>

      <div className="glass-panel p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
          <span>Масштаб карты</span>
          <span>{zoom.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={1}
          max={2.2}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-sky-500"
        />
      </div>
    </div>
  );
}

