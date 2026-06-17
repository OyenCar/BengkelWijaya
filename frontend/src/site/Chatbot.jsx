import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { api } from '../lib/api';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! 👋 Saya asisten Bengkel Wijaya. Tanya saja soal layanan, produk, lokasi, atau cara minta penawaran.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { reply } = await api.chat(next.filter((m) => m.role !== 'system'));
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Maaf, koneksi ke asisten sedang bermasalah. Silakan hubungi WhatsApp kami.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-6 md:right-8 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl border border-amber-500/40 hover:scale-110 transition-transform"
        aria-label="Buka chat asisten"
      >
        {open ? <X size={24} /> : <MessageSquare size={24} className="text-amber-400" />}
      </button>

      {open && (
        <div className="fixed bottom-44 right-6 md:right-8 z-50 w-[88vw] max-w-sm h-[28rem] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
            <Bot size={20} className="text-amber-400" />
            <div>
              <p className="font-bold text-sm leading-none">Asisten Wijaya</p>
              <p className="text-[11px] text-slate-400 mt-1">Biasanya membalas dalam beberapa detik</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 pl-1">Asisten sedang mengetik…</div>}
          </div>

          <form onSubmit={send} className="p-2 border-t border-slate-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan…"
              className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <button type="submit" disabled={loading} className="bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
