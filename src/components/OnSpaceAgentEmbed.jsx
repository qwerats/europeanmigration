import { AI_AGENT_TITLE, buildOnSpaceAgentEmbedSrc } from '../config/onSpaceAgent';

export default function OnSpaceAgentEmbed({
  className = '',
  minHeight = 800,
  fill = false,
  title = AI_AGENT_TITLE,
  reloadKey = 0,
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
      <div className="onspace-agent-embed__viewport" style={sizeStyle}>
        <iframe
          key={reloadKey}
          src={buildOnSpaceAgentEmbedSrc()}
          title={title}
          className="onspace-agent-embed__iframe"
          style={sizeStyle}
          frameBorder="0"
          allow="microphone; camera; clipboard-write; fullscreen"
          allowFullScreen
        />
      </div>
    </section>
  );
}
