// Anthropic (Claude) provider. API key read from server env only.
export const meta = { name: 'anthropic', needsKey: true };

export async function generate({ system, messages }) {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new Error('CHATBOT_API_KEY belum di-set untuk provider anthropic');
  const model = process.env.CHATBOT_MODEL || 'claude-3-5-haiku-latest';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.map((c) => c.text).join('').trim() || '';
}
