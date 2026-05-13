import { useState } from 'react';

const STARTER_PROMPTS = [
  'Сделай еженедельный мониторинг новых публикаций Eurostat и IOM.',
  'Проверь новые данные по asylum applications в Германии и Франции.',
  'Сравни изменения residence permits за последний доступный период по Италии и Испании.',
];

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Я Migration Monitor EU. Могу искать свежие данные в интернете, сверять метрики и выдавать рекомендации по обновлению дашборда.',
  },
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const needsApiKeySetup = error.includes('OPENAI_API_KEY');
  const needsOllamaSetup = error.toLowerCase().includes('ollama');

  const sendPrompt = async (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isLoading) return;

    const nextMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/migration-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fallback =
          response.status === 404
            ? 'Локальный API не найден. Перезапустите dev-сервер после обновления конфигурации.'
            : 'Не удалось получить ответ от AI-агента.';
        throw new Error(payload?.error || fallback);
      }

      const assistantText = payload?.reply?.trim();
      if (!assistantText) {
        throw new Error('AI-агент вернул пустой ответ.');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (err) {
      setError(err?.message || 'Ошибка запроса к AI-агенту.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendPrompt(input);
  };

  return (
    <div className="animate-fade-up space-y-6 opacity-0 [animation-fill-mode:forwards]">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">ИИ-ассистент</p>
        <h2 className="text-3xl font-bold text-gray-900">MigrationMonitor EU · Web Intelligence Agent</h2>
        <p className="max-w-4xl text-gray-600">
          Агент работает как чат: ищет обновления в официальных источниках, выделяет метрики и формирует
          рекомендации по обновлению аналитики. По умолчанию используется локальный Ollama (без оплаты):
          сначала выполните <code>ollama pull llama3.1:8b</code>, затем запустите <code>ollama serve</code>.
        </p>
      </header>

      <section className="glass-panel chart-glow space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendPrompt(prompt)}
              disabled={isLoading}
              className="rounded-full border border-sky-200 bg-white px-3 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="h-[min(60vh,560px)] space-y-3 overflow-y-auto rounded-xl border border-sky-100 bg-white p-3 sm:p-4">
          {messages.map((message, idx) => {
            const isUser = message.role === 'user';
            return (
              <article
                key={`${message.role}-${idx}`}
                className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'ml-auto border border-sky-300 bg-sky-600 text-white'
                    : 'mr-auto border border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <p className="mb-1 text-[11px] font-semibold uppercase opacity-80">
                  {isUser ? 'Вы' : 'Migration Monitor EU'}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </article>
            );
          })}
          {isLoading ? (
            <div className="mr-auto max-w-[95%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-sm">
              Анализирую источники и формирую ответ...
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor="agentPrompt" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Вопрос агенту
          </label>
          <div className="flex gap-2">
            <input
              id="agentPrompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Например: проверь новые публикации Eurostat за последнюю неделю..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Отправить
            </button>
          </div>
        </form>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{error}</p>
            {needsOllamaSetup ? (
              <p className="mt-1 text-xs text-red-800/90">
                Установите Ollama и запустите: <code>ollama pull llama3.1:8b</code>,{' '}
                <code>ollama serve</code>, затем перезапустите <code>npm run dev</code>.
              </p>
            ) : null}
            {needsApiKeySetup ? (
              <p className="mt-1 text-xs text-red-800/90">
                Для локального запуска добавьте ключ в <code>.env.local</code> и перезапустите dev-сервер.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
