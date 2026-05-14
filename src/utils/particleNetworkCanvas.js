/**
 * Анимированная сеть частиц на canvas (hero).
 * Возвращает функцию отписки для useEffect.
 */
export function attachParticleNetwork(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let raf = 0;
  let particles = [];
  let w = 0;
  let h = 0;
  let dpr = 1;

  const COUNT = () => Math.min(140, Math.max(52, Math.floor((w * h) / 10000)));
  const MAX_DIST = () => Math.min(210, Math.max(125, w * 0.2));
  const SPEED = 0.35;

  function resize() {
    const root = canvas.parentElement;
    if (!root) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = root.clientWidth;
    h = root.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuild();
  }

  function rebuild() {
    const n = COUNT();
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
    }));
  }

  function step() {
    const maxD = MAX_DIST();
    const maxD2 = maxD * maxD;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      p.x = Math.max(0, Math.min(w, p.x));
      p.y = Math.max(0, Math.min(h, p.y));
    }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxD2 || d2 < 1) continue;
        const d = Math.sqrt(d2);
        const t = 1 - d / maxD;
        ctx.strokeStyle = `rgba(186, 230, 253, ${0.12 + t * 0.38})`;
        ctx.lineWidth = 0.75 + t * 1.1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  const ro = new ResizeObserver(() => resize());
  const root = canvas.parentElement;
  if (root) ro.observe(root);
  resize();
  raf = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
  };
}
