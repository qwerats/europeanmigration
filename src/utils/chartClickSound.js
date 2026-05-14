const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const CLICK_SRC = `${base}sounds/chart-click.mp3`;

/** Короткий щелчок при взаимодействии с графиком (файл в public/sounds/chart-click.mp3). */
export function playChartClickSound() {
  try {
    const audio = new Audio(CLICK_SRC);
    audio.volume = 0.45;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
