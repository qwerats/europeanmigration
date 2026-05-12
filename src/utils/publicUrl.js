/**
 * URL for files in `public/` (respects Vite `import.meta.env.BASE_URL`, e.g. GitHub Pages).
 */
export function publicUrl(relativePath) {
  const trimmed = String(relativePath).replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${trimmed}`;
}

/** Hash link to a one-pager section, e.g. `home` → `/repo/#home` on GitHub Pages. */
export function onePagerHashHref(sectionId) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/#${sectionId}`;
}
