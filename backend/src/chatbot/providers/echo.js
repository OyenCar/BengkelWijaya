/**
 * "echo" provider — a rule-based assistant that needs NO API key.
 * It uses the business context (profile + catalog) to answer the most
 * common customer questions. This is the default so the chatbot works
 * out-of-the-box in preview. Swap to a real LLM by setting
 * CHATBOT_PROVIDER + the matching API key in the backend .env.
 */
export const meta = { name: 'echo', needsKey: false };

export async function generate({ system, messages, context }) {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  const q = (last?.content || '').toLowerCase();
  const { settings = {}, categories = [] } = context || {};

  const has = (...words) => words.some((w) => q.includes(w));

  if (!q.trim()) {
    return `Halo! Saya asisten ${settings.business_name || 'Bengkel Wijaya'}. Ada yang bisa saya bantu? Anda bisa tanya soal layanan, lokasi, atau cara minta penawaran.`;
  }

  if (has('halo', 'hai', 'pagi', 'siang', 'sore', 'malam', 'assalam')) {
    return `Halo! 👋 Selamat datang di ${settings.business_name || 'Bengkel Wijaya'}. Kami melayani pagar, kanopi, railing, konstruksi baja, teralis, hingga perabot besi custom. Ada yang ingin Anda tanyakan?`;
  }

  if (has('lokasi', 'alamat', 'dimana', 'di mana', 'maps', 'lokasinya')) {
    return `Workshop kami berada di: ${settings.address || 'Kudus, Jawa Tengah'}. Jam buka ${settings.hours || 'Senin–Sabtu 08:00–17:00'}. Mau saya kirim link Google Maps-nya?`;
  }

  if (has('jam', 'buka', 'tutup', 'operasional')) {
    return `Jam operasional kami: ${settings.hours || 'Senin–Sabtu, 08:00–17:00'}. Di luar jam tersebut Anda tetap bisa kirim pesan, akan kami balas secepatnya.`;
  }

  if (has('harga', 'biaya', 'tarif', 'berapa', 'estimasi')) {
    return `Sebagian besar pekerjaan kami bersifat custom, jadi harga pasti ditentukan setelah survei/diskusi detail. Beberapa item ada estimasi kisaran di katalog. Cara tercepat: tekan tombol "Minta Penawaran" dan isi detail kebutuhan Anda — tim kami akan menghitungkan estimasinya.`;
  }

  if (has('order', 'pesan', 'cara', 'proses', 'penawaran', 'quote', 'mulai')) {
    return `Alur pemesanan: 1) Isi form "Minta Penawaran" di website (atau chat WhatsApp), sebutkan jenis pekerjaan + ukuran/model. 2) Kami berikan estimasi & jadwal survei bila perlu. 3) Setelah deal, pengerjaan dimulai. Mau saya arahkan ke form penawaran?`;
  }

  if (has('layanan', 'jasa', 'bisa apa', 'melayani', 'produk', 'katalog')) {
    const list = categories.map((c) => c.name).join(', ');
    return `Kami melayani: ${list || 'pagar, kanopi, railing, konstruksi baja, teralis, dan perabot besi custom'}. Anda tertarik yang mana? Saya bisa bantu jelaskan lebih lanjut atau arahkan ke katalog.`;
  }

  if (has('pagar', 'gerbang')) {
    return `Untuk pagar & gerbang, kami buat dari besi hollow galvanis anti karat dengan desain minimalis maupun klasik/tempa, termasuk gerbang sliding otomatis. Untuk estimasi, silakan "Minta Penawaran" dengan menyebutkan panjang dan tinggi pagar.`;
  }
  if (has('kanopi', 'atap', 'alderon', 'polycarbonate')) {
    return `Kanopi tersedia dengan atap Alderon, Polycarbonate, atau Spandek, rangka baja ringan/hollow. Sebutkan ukuran (panjang x lebar) area Anda di form penawaran untuk estimasi.`;
  }
  if (has('baja', 'gudang', 'wf', 'konstruksi', 'pabrik')) {
    return `Untuk konstruksi baja berat (gudang, pabrik, mezzanine, rangka WF/H-beam) kami menghitung per proyek. Silakan kirim detail/gambar lewat "Minta Penawaran" agar kami bisa survei dan menghitung.`;
  }

  return `Terima kasih atas pertanyaannya. Untuk hal teknis dan estimasi harga, cara terbaik adalah menekan tombol "Minta Penawaran" atau chat WhatsApp kami di ${settings.whatsapp || ''}. Ada lagi yang bisa saya bantu seputar layanan atau lokasi?`;
}
