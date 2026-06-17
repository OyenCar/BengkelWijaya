// Google Gemini provider. API key read from server env only.
export const meta = { name: 'gemini', needsKey: true };

export async function generate({ system, messages }) {
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!apiKey) throw new Error('CHATBOT_API_KEY belum di-set untuk provider gemini');
  const model = process.env.CHATBOT_MODEL || 'gemini-1.5-flash';

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() || '';
}
