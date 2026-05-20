import { useState } from 'react';
import { AI_AGENT_TITLE, ONSPACE_AGENT_URL } from '../config/onSpaceAgent';
import OnSpaceAgentEmbed from './OnSpaceAgentEmbed';
import './OnSpaceAgentFloating.css';

export default function OnSpaceAgentFloating() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="onspace-agent-floating" aria-live="polite">
      {isOpen ? (
        <div className="onspace-agent-floating__panel" role="dialog" aria-label={AI_AGENT_TITLE}>
          <div className="onspace-agent-floating__panel-header">
            <span className="onspace-agent-floating__panel-title">{AI_AGENT_TITLE}</span>
            <button
              type="button"
              className="onspace-agent-floating__close"
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть панель агента"
            >
              ×
            </button>
          </div>
          <div className="onspace-agent-floating__body">
            <OnSpaceAgentEmbed fill className="onspace-agent-floating__embed" />
          </div>
          <p className="onspace-agent-floating__hint">
            Если окно пустое,{' '}
            <a href={ONSPACE_AGENT_URL} target="_blank" rel="noopener noreferrer">
              откройте в новой вкладке
            </a>
            .
          </p>
        </div>
      ) : null}

      <button
        type="button"
        className={[
          'onspace-agent-floating__fab',
          isOpen ? 'onspace-agent-floating__fab--active' : '',
        ].join(' ')}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Закрыть ИИ-агента' : 'Открыть ИИ-агента'}
        title={isOpen ? 'Закрыть' : 'ИИ-агент'}
      >
        <span className="onspace-agent-floating__fab-icon" aria-hidden>
          {isOpen ? '×' : '◆'}
        </span>
        <span className="onspace-agent-floating__fab-label">{isOpen ? 'Закрыть' : 'ИИ-агент'}</span>
      </button>
    </div>
  );
}
