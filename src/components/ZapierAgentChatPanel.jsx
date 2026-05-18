import { ZAPIER_AGENT_CHAT_URL } from '../config/zapierAssistant';

export default function ZapierAgentChatPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <div className="max-w-md space-y-3">
        <p className="text-sm leading-relaxed text-slate-600">
          Полноценный чат с агентом по миграции в ЕС открывается на платформе Zapier Agents — с
          историей диалога и без одностраничной формы.
        </p>
        <p className="text-xs text-slate-500">
          После нажатия откроется новая вкладка. Если окно заблокировано, разрешите всплывающие окна
          для этого сайта.
        </p>
      </div>

      <a
        href={ZAPIER_AGENT_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <span aria-hidden>🤖</span>
        Chat with EU Migration Agent
      </a>

      <p className="max-w-sm text-[11px] text-slate-400">
        URL:{' '}
        <a
          href={ZAPIER_AGENT_CHAT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sky-600 underline hover:text-sky-800"
        >
          {ZAPIER_AGENT_CHAT_URL}
        </a>
      </p>
    </div>
  );
}
