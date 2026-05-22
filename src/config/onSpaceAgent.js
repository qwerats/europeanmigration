export const ONSPACE_AGENT_URL =
  import.meta.env.VITE_ONSPACE_AGENT_URL?.trim() || 'https://react-9bhebz.onspace.build';

/** Bump after republishing OnSpace to bust iframe/CDN cache (or set VITE_ONSPACE_AGENT_CACHE_BUST). */
export const ONSPACE_AGENT_CACHE_BUST =
  import.meta.env.VITE_ONSPACE_AGENT_CACHE_BUST?.trim() || '20260522';

export const AI_AGENT_TITLE = 'EU Migration Monitoring Agent';

export function buildOnSpaceAgentEmbedSrc(baseUrl = ONSPACE_AGENT_URL) {
  const url = new URL(baseUrl);
  url.searchParams.set('embed', ONSPACE_AGENT_CACHE_BUST);
  return url.toString();
}
