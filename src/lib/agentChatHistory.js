const STORAGE_KEY = 'migration-monitor-chat-v1';
const MAX_MESSAGES = 100;

export function loadChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: null, lastUpdatedAt: null };
    const data = JSON.parse(raw);
    if (!Array.isArray(data.messages) || !data.messages.length) {
      return { messages: null, lastUpdatedAt: data.lastUpdatedAt || null };
    }
    return {
      messages: data.messages.filter(
        (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
      ),
      lastUpdatedAt: data.lastUpdatedAt || null,
    };
  } catch {
    return { messages: null, lastUpdatedAt: null };
  }
}

export function saveChatHistory(messages, lastUpdatedAt) {
  try {
    const trimmed = messages
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_MESSAGES);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages: trimmed,
        lastUpdatedAt: lastUpdatedAt || null,
        savedAt: new Date().toISOString(),
      })
    );
  } catch {
    /* quota / private mode */
  }
}

export function clearChatHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
