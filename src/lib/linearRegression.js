/**
 * Простая линейная регрессия y ≈ a + b·x по точкам (years[], values[]).
 * Возвращает функцию predict(year) → округлённое значение.
 */
export function linearPredictor(years, values) {
  const n = years.length;
  if (n < 2) throw new Error('linearPredictor: нужно минимум 2 точки');
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i += 1) {
    const x = years[i];
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-9) throw new Error('linearPredictor: вырожденная система');
  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;
  return (year) => Math.round(a + b * year);
}
