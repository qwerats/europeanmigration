import { useEffect, useRef } from 'react';
import {
  getZapierInterfacesIframeUrl,
  ZAPIER_EMBED_TEST_ID,
  ZAPIER_INTERFACES_SCRIPT,
  ZAPIER_PAGE_ID,
} from '../config/zapierAssistant';

function mountIframeFallback(host, minHeight) {
  const iframe = document.createElement('iframe');
  iframe.src = getZapierInterfacesIframeUrl();
  iframe.title = 'EU Migration Monitoring Agent';
  iframe.setAttribute('frameborder', '0');
  iframe.allow = 'clipboard-write';
  iframe.style.width = '100%';
  iframe.style.height = `${minHeight}px`;
  iframe.style.border = 'none';
  host.appendChild(iframe);
}

let scriptLoadPromise = null;

function loadZapierInterfacesScript() {
  if (customElements.get('zapier-interfaces-page-embed')) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${ZAPIER_INTERFACES_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Zapier script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = ZAPIER_INTERFACES_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Не удалось загрузить Zapier Interfaces.'));
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Встраивание Zapier Interfaces (замена локального Migration Monitor в чате).
 */
export default function ZapierInterfacesEmbed({ className = '', minHeight = 700 }) {
  const hostRef = useRef(null);
  const embedRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let cancelled = false;

    const mount = async () => {
      try {
        await loadZapierInterfacesScript();
        if (cancelled || !hostRef.current) return;

        const embed = document.createElement('zapier-interfaces-page-embed');
        embed.setAttribute('page-id', ZAPIER_PAGE_ID);
        embed.setAttribute('test-id', ZAPIER_EMBED_TEST_ID);
        embed.setAttribute('no-background', 'false');
        embed.setAttribute('allow-query-params', 'true');
        embed.setAttribute('query-params', '');
        embed.style.maxWidth = '900px';
        embed.style.width = '100%';
        embed.style.height = '100%';
        embed.style.minHeight = `${minHeight}px`;
        embed.style.height = `${minHeight}px`;
        embed.style.margin = '0 auto';
        embed.style.display = 'block';

        host.appendChild(embed);
        embedRef.current = embed;
      } catch {
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = '';
          mountIframeFallback(hostRef.current, minHeight);
        }
      }
    };

    mount();

    return () => {
      cancelled = true;
      embedRef.current?.remove();
      embedRef.current = null;
    };
  }, [minHeight]);

  return (
    <div
      ref={hostRef}
      className={['flex min-h-0 w-full flex-1 flex-col items-center justify-stretch', className].join(
        ' '
      )}
    />
  );
}
