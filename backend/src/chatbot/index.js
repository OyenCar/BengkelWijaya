/**
 * Provider-agnostic chatbot.
 *
 * The active provider is chosen via CHATBOT_PROVIDER (echo | openai | anthropic | gemini).
 * The API key lives ONLY in the server environment (CHATBOT_API_KEY) and is never
 * sent to the browser. To swap providers you only change .env — no code changes.
 */
import * as echo from './providers/echo.js';
import * as openai from './providers/openai.js';
import * as anthropic from './providers/anthropic.js';
import * as gemini from './providers/gemini.js';

const PROVIDERS = { echo, openai, anthropic, gemini };

export function activeProviderName() {
  return (process.env.CHATBOT_PROVIDER || 'echo').toLowerCase();
}

function getProvider() {
  const name = activeProviderName();
  return PROVIDERS[name] || echo;
}

/** Build a system prompt from live business data so answers stay relevant. */
export function buildSystemPrompt(context) {
  const { settings = {}, categories = [], products = [] } = context || {};
  const catList = categories.map((c) => `- ${c.name}`).join('\n');
  const prodList = products
    .slice(0, 30)
    .map((p) => `- ${p.name} (${p.price_label})`)
    .join('\n');
  return `Anda adalah asisten virtual untuk "${settings.business_name || 'Bengkel Las Wijaya Konstruksi'}", sebuah bengkel las di Kudus, Jawa Tengah.
Gaya bicara: ramah, profesional, ringkas, berbahasa Indonesia.
Tugas: menjawab pertanyaan calon pelanggan tentang layanan, produk, lokasi, jam buka, dan alur "Minta Penawaran".

ATURAN HARGA: jangan pernah menyebut harga pasti/final. Sebagian besar pekerjaan custom. Gunakan kisaran/estimasi yang ada di katalog, lalu arahkan pelanggan menekan tombol "Minta Penawaran" atau menghubungi WhatsApp.

INFO BISNIS:
- Alamat: ${settings.address || '-'}
- Jam buka: ${settings.hours || '-'}
- WhatsApp: ${settings.whatsapp || '-'}

KATEGORI LAYANAN/PRODUK:
${catList || '-'}

CONTOH PRODUK DI KATALOG:
${prodList || '-'}

Jika tidak tahu jawaban pastinya, arahkan pelanggan untuk "Minta Penawaran" atau chat WhatsApp.`;
}

export async function chat({ messages, context }) {
  const provider = getProvider();
  const system = buildSystemPrompt(context);
  try {
    const reply = await provider.generate({ system, messages, context });
    return { reply, provider: provider.meta.name };
  } catch (err) {
    // Graceful fallback to the rule-based provider if the real LLM fails.
    console.error('[chatbot] provider error, falling back to echo:', err.message);
    const reply = await echo.generate({ system, messages, context });
    return { reply, provider: 'echo (fallback)', warning: err.message };
  }
}
