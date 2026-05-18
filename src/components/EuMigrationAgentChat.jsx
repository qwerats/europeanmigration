import { ZAPIER_AGENT_CHAT_URL } from '../config/zapierAssistant';
import ZapierInterfacesEmbed from './ZapierInterfacesEmbed';
import './EuMigrationAgentChat.css';

export default function EuMigrationAgentChat() {
  return (
    <div className="migration-chat-wrapper">
      <ZapierInterfacesEmbed minHeight={800} className="migration-chat-embed" />

      <p className="migration-chat-fallback-hint">
        Если окно пустое,{' '}
        <a href={ZAPIER_AGENT_CHAT_URL} target="_blank" rel="noopener noreferrer">
          откройте чат агента в новой вкладке
        </a>
        .
      </p>
    </div>
  );
}
