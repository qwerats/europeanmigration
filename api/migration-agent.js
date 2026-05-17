import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyEmailCommands,
  buildFilterPromptFromSubscriber,
  EMAIL_COMMAND_HELP,
  getEffectiveFilter,
  isEmailCommandOnly,
  shouldSkipMonitorForSubscriber,
  WEB_CHAT_SUBSCRIBER,
} from './migration-email-commands.js';
import { formatMonitorReplyForChat, runMigrationMonitor } from './migration-monitor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(__dirname, '..');

export function sanitizeMessages(messages, limit = 50) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-limit)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
}

async function persistChatHistory(root, messages) {
  if (!Array.isArray(messages) || !messages.length) return;
  const clean = sanitizeMessages(messages, 100);
  const dir = path.join(root, 'data');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, 'agent-chat-history.json'),
    `${JSON.stringify({ messages: clean, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8'
  );
}

function latestUserPrompt(messages) {
  return (
    [...messages].reverse().find((m) => m?.role === 'user' && typeof m.content === 'string')?.content || ''
  );
}

/**
 * Агент мониторинга: сравнение JSON дашборда с baseline (без Ollama / LLM).
 * @returns {Promise<{ reply: string, report: object }>}
 */
export async function runMigrationAgent(messages, options = {}) {
  const cleanMessages = sanitizeMessages(messages);
  if (!cleanMessages.length) {
    const err = new Error('Пустой диалог. Передайте messages[].');
    err.status = 400;
    throw err;
  }

  const root = options.monitorRoot;
  const userPrompt = latestUserPrompt(cleanMessages);
  const subscriberEmail = options.subscriberEmail || WEB_CHAT_SUBSCRIBER;

  const commandResult = await applyEmailCommands({ text: userPrompt, email: subscriberEmail, root });
  if (commandResult.handled && isEmailCommandOnly(userPrompt)) {
    return {
      reply: `${commandResult.message}\n\n${EMAIL_COMMAND_HELP}`,
      report: { command: commandResult.subscriber },
    };
  }

  const skip = await shouldSkipMonitorForSubscriber(root, subscriberEmail);
  if (skip.skip) {
    return {
      reply: `${skip.reason}\n\n${EMAIL_COMMAND_HELP}`,
      report: { skipped: true, reason: skip.reason },
    };
  }

  const savedFilter = await getEffectiveFilter(root, subscriberEmail);
  const filterPrompt = [userPrompt, buildFilterPromptFromSubscriber(savedFilter)].filter(Boolean).join(' ');

  const report = await runMigrationMonitor({
    userPrompt: filterPrompt,
    subscriberFilter: savedFilter,
    fetchImpl: options.fetchImpl || fetch,
    writeFiles: options.writeFiles !== false,
    root,
  });

  const result = {
    reply: formatMonitorReplyForChat(report, filterPrompt, savedFilter),
    report,
  };

  if (options.saveChatHistory !== false) {
    const historyRoot = root || DEFAULT_ROOT;
    if (options.writeFiles !== false) {
      await persistChatHistory(historyRoot, messages);
    }
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { reply, report } = await runMigrationAgent(req.body?.messages, {
      writeFiles: req.body?.writeFiles,
      saveChatHistory: req.body?.saveChatHistory,
    });
    return res.status(200).json({ reply, report });
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: error?.message || 'Внутренняя ошибка сервера.',
    });
  }
}
