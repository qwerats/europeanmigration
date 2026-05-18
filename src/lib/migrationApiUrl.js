/**
 * URL агента мониторинга (Vite dev, Vercel или внешний API для GitHub Pages).
 */
export function resolveMigrationAgentApiUrl() {
  const fromEnv = import.meta.env.VITE_MIGRATION_API_URL?.trim();
  if (fromEnv) {
    const base = fromEnv.replace(/\/$/, '');
    return base.endsWith('/api/migration-agent') ? base : `${base}/api/migration-agent`;
  }

  if (import.meta.env.DEV) {
    return '/api/migration-agent';
  }

  const basePath = import.meta.env.BASE_URL || '/';
  const onGithubPages = import.meta.env.PROD && basePath !== '/';

  if (onGithubPages) {
    return null;
  }

  return '/api/migration-agent';
}
