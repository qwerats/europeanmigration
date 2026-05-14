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
        body: JSON.stringify({ messages: nextMessages, stream: true }),
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('ndjson')) {
        if (!response.ok) {
          throw new Error('Не удалось открыть поток ответа агента.');
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Браузер не поддерживает потоковое чтение ответа.');
        }
        const dec = new TextDecoder();
        let buf = '';
        let gotToken = false;
        let streamEnded = false;

        while (!streamEnded) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          for (;;) {
            const nl = buf.indexOf('\n');
            if (nl < 0) break;
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            let row;
            try {
              row = JSON.parse(line);
            } catch {
              continue;
            }
            if (row.type === 'error') {
              throw new Error(row.message || 'Ошибка потока агента.');
            }
            if (row.type === 'done') {
              streamEnded = true;
              break;
            }
            if (row.type === 'token' && typeof row.text === 'string' && row.text.length) {
              gotToken = true;
              const chunk = row.text;
              setMessages((prev) => {
                const out = [...prev];
                const i = out.length - 1;
                if (out[i]?.role === 'assistant') {
                  out[i] = { ...out[i], content: out[i].content + chunk };
                }
                return out;
              });
            }
          }
        }

        if (!gotToken) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && !last.content.trim()) return prev.slice(0, -1);
            return prev;
          });
          throw new Error('AI-агент вернул пустой ответ.');
        }
      } else {
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
      }
    } catch (err) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.content.trim()) return prev.slice(0, -1);
        return prev;
      });
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
          Агент работает как чат: при локальном Ollama ответ идёт{' '}
          <span className="font-medium text-sky-800">потоком</span>, снапшоты сайтов Eurostat/IOM и др.{' '}
          <span className="font-medium text-sky-800">кэшируются на 15 минут</span> (переменная{' '}
          <code className="rounded bg-slate-100 px-1">MIGRATION_SOURCES_CACHE_MS</code>). По умолчанию — Ollama:{' '}
          <code className="rounded bg-slate-100 px-1">ollama pull llama3.1:8b</code>, затем{' '}
          <code className="rounded bg-slate-100 px-1">ollama serve</code>.
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
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' ? (
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
