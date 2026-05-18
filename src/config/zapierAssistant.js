/** Zapier Agent — публичный чат. */
export const ZAPIER_AGENT_ID = '0ac278f2-439d-4d08-850f-638ccc739711';

export const ZAPIER_AGENT_CHAT_URL =
  import.meta.env.VITE_ZAPIER_AGENT_URL?.trim() ||
  `https://agents.zapier.com/agent/${ZAPIER_AGENT_ID}`;

/** Zapier Bot — legacy id (настройки бота в Zapier). */
export const ZAPIER_BOT_ID = 'cee808d2-6bfb-41ff-bce1-fd9147ce5b5f';

export const ZAPIER_INTERFACES_SCRIPT =
  'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';

export const ZAPIER_PAGE_ID = 'cmpabwv2y000powr5zva2u7bl';

/** Публичная страница Interfaces (чат + заголовок из редактора Zapier). */
export const ZAPIER_AGENT_IFRAME_URL =
  import.meta.env.VITE_ZAPIER_IFRAME_URL?.trim() ||
  `https://interfaces.zapier.com/page/${ZAPIER_PAGE_ID}`;

export function getZapierAgentEmbedScriptUrl() {
  return `https://agents.zapier.com/api/agent/${ZAPIER_AGENT_ID}/embed.js`;
}

export const ZAPIER_EMBED_TEST_ID = `${ZAPIER_PAGE_ID}-zapier-interfaces-page-embed-iframe`;

export function getZapierInterfacesIframeUrl() {
  const custom = import.meta.env.VITE_ZAPIER_IFRAME_URL?.trim();
  if (custom) return custom;
  return `https://interfaces.zapier.com/page/${ZAPIER_PAGE_ID}`;
}
