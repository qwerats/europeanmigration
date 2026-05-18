export function scrollToAiAssistant() {
  const el = document.getElementById('ai-assistant');
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}
