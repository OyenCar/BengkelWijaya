// OpenAI-compatible provider (works with OpenAI and any OpenAI-compatible API).
// API key is read from the server environment and never exposed to the frontend.
export const meta = { name: 'openai', needsKey: true };

export async function generate({ system, messages }) {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new Error('CHATBOT_API_KEY belum di-set untuk provider openai');
  const baseUrl = process.env.CHATBOT_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.CHATBOT_MODEL || 'gpt-4o-mini';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.4,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
