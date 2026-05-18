import { AI_AGENT_TITLE, ONSPACE_AGENT_URL } from '../config/onSpaceAgent';
import OnSpaceAgentEmbed from './OnSpaceAgentEmbed';
import './EuMigrationAgentChat.css';

export default function EuMigrationAgentChat() {
  return (
    <div className="migration-chat-wrapper">
      <div className="migration-chat-header">
        <h1>{AI_AGENT_TITLE}</h1>
      </div>

      <OnSpaceAgentEmbed minHeight={800} className="migration-chat-embed" />

      <p className="migration-chat-fallback-hint">
        Если окно пустое,{' '}
        <a href={ONSPACE_AGENT_URL} target="_blank" rel="noopener noreferrer">
          откройте агента в новой вкладке
        </a>
        . Убедитесь, что проект опубликован в OnSpace.
      </p>
    </div>
  );
}
