#!/usr/bin/env node
/**
 * Обработка Gmail/IMAP-команд:
 *   npm run email:cmd -- "FILTER:DE,FR:Asylum,ResidencePermits" user@example.com
 *   npm run email:imap   (опрос ящика, нужен imapflow)
 */
import { applyEmailCommands, EMAIL_COMMAND_HELP } from '../api/migration-email-commands.js';

const [, , argText, argEmail] = process.argv;

if (argText && !argText.startsWith('--')) {
  const result = await applyEmailCommands({
    text: argText,
    email: argEmail || process.env.IMAP_USER,
  });
  console.log(result.message || 'Команды не распознаны.');
  if (!result.handled) console.log(EMAIL_COMMAND_HELP);
  process.exit(result.handled ? 0 : 1);
}

const host = process.env.IMAP_HOST || 'imap.gmail.com';
const port = Number(process.env.IMAP_PORT || 993);
const user = process.env.IMAP_USER;
const pass = process.env.IMAP_PASS || process.env.IMAP_PASSWORD;
const mailbox = process.env.IMAP_MAILBOX || 'INBOX';
const searchSinceDays = Number(process.env.IMAP_SEARCH_DAYS || 7);

if (!user || !pass) {
  console.error('Задайте IMAP_USER и IMAP_PASS (пароль приложения Gmail) в .env.local');
  console.error('\nПример одной команды без IMAP:');
  console.error('  npm run email:cmd -- "FILTER:DE,FR:Asylum,ResidencePermits" you@gmail.com');
  process.exit(1);
}

let ImapFlow;
try {
  ({ ImapFlow } = await import('imapflow'));
} catch {
  console.error('Установите IMAP-клиент: npm install imapflow --save-dev');
  process.exit(1);
}

const client = new ImapFlow({
  host,
  port,
  secure: true,
  auth: { user, pass },
});

const since = new Date();
since.setDate(since.getDate() - searchSinceDays);

await client.connect();
const lock = await client.getMailboxLock(mailbox);
try {
  const uids = await client.search({ since, seen: false });
  let processed = 0;

  for (const uid of uids) {
    const msg = await client.fetchOne(uid, { source: true, envelope: true });
    const from = msg.envelope?.from?.[0]?.address || user;
    const raw = msg.source?.toString('utf8') || '';
    const subject = msg.envelope?.subject || '';
    const bodyMatch = raw.match(/\r?\n\r?\n([\s\S]*)$/);
    const body = bodyMatch ? bodyMatch[1] : raw;
    const text = `${subject}\n${body}`.slice(0, 12000);

    const result = await applyEmailCommands({ text, email: from });
    if (result.handled) {
      processed += 1;
      console.log(`[${from}] ${result.message}`);
      await client.messageFlagsAdd(uid, ['\\Seen']);
    }
  }

  console.log(`\nГотово: обработано писем с командами — ${processed}.`);
  console.log(EMAIL_COMMAND_HELP);
} finally {
  lock.release();
  await client.logout();
}
