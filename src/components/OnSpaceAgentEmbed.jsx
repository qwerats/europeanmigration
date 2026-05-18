import { ONSPACE_AGENT_URL } from '../config/onSpaceAgent';

export default function OnSpaceAgentEmbed({
  className = '',
  minHeight = 800,
  fill = false,
  title = 'ИИ-ассистент по миграции в ЕС',
}) {
  const sizeStyle = fill ? undefined : { minHeight: `${minHeight}px` };

  return (
    <section
      className={[
        'onspace-agent-embed',
        fill ? 'onspace-agent-embed--fill' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={sizeStyle}
      aria-label={title}
    >
      <iframe
        src={ONSPACE_AGENT_URL}
        title={title}
        className="onspace-agent-embed__iframe"
        style={sizeStyle}
        frameBorder="0"
        allow="microphone; camera; clipboard-write; fullscreen"
        allowFullScreen
      />
    </section>
  );
}
