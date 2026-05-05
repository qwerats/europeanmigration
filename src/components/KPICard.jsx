export default function KPICard({ title, value, subtitle, delay = 0 }) {
  return (
    <article
      className="glass-panel group relative animate-fade-up overflow-hidden p-5 opacity-0 transition-transform duration-300 [animation-fill-mode:forwards] hover:scale-[1.02] hover:border-sky-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-300/25 blur-2xl transition-opacity group-hover:opacity-100" />
      <h3 className="text-xs font-medium uppercase tracking-wider text-gray-600">{title}</h3>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">{value}</p>
      {subtitle && <p className="mt-2 text-sm leading-relaxed text-gray-600">{subtitle}</p>}
    </article>
  );
}
