import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDb } from './index.js';
import { migrate } from './migrate.js';

const categories = [
  { name: 'Pagar & Gerbang', slug: 'pagar-gerbang', sort_order: 1 },
  { name: 'Kanopi & Atap', slug: 'kanopi-atap', sort_order: 2 },
  { name: 'Railing & Tangga', slug: 'railing-tangga', sort_order: 3 },
  { name: 'Konstruksi Baja', slug: 'konstruksi-baja', sort_order: 4 },
  { name: 'Teralis', slug: 'teralis', sort_order: 5 },
  { name: 'Perabot Besi Custom', slug: 'perabot-besi', sort_order: 6 },
];

const services = [
  { title: 'Pagar Minimalis & Tempa', description: 'Desain pagar modern atau klasik dengan bahan besi hollow galvanis anti karat.', icon: 'ShieldCheck', sort_order: 1 },
  { title: 'Kanopi & Atap', description: 'Pemasangan kanopi Alderon, Polycarbonate, atau Spandek Pasir yang rapi dan kokoh.', icon: 'Hammer', sort_order: 2 },
  { title: 'Railing Tangga & Balkon', description: 'Keamanan maksimal dengan estetika tinggi untuk interior maupun eksterior rumah Anda.', icon: 'ChevronsUp', sort_order: 3 },
  { title: 'Konstruksi Baja Berat', description: 'Layanan konstruksi untuk gudang, pabrik, atau struktur bangunan bertingkat.', icon: 'Factory', sort_order: 4 },
  { title: 'Teralis Pengaman', description: 'Teralis jendela & pintu dengan motif minimalis hingga klasik, presisi dan rapi.', icon: 'Grid3x3', sort_order: 5 },
  { title: 'Perabot Besi Custom', description: 'Rak, meja, dudukan, dan produk rumah tangga berbahan besi sesuai pesanan Anda.', icon: 'Wrench', sort_order: 6 },
];

// Portfolio = "case study" gallery of completed projects
const portfolio = [
  { title: 'Pagar Industrial Modern', category: 'Pagar', description: 'Pagar hollow galvanis finishing duco hitam matte untuk hunian cluster.', image_url: 'https://images.unsplash.com/photo-1599690925058-90e1a0b45279?auto=format&fit=crop&q=80&w=1200', sort_order: 1 },
  { title: 'Kanopi Carport Luas', category: 'Kanopi', description: 'Kanopi rangka baja ringan dengan atap Alderon twinwall, bentang 6 meter.', image_url: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&q=80&w=1200', sort_order: 2 },
  { title: 'Railing Tangga Besi & Kayu', category: 'Interior', description: 'Kombinasi besi tempa dengan handrail kayu solid untuk tangga rumah dua lantai.', image_url: 'https://images.unsplash.com/photo-1517646331032-9e85639523a1?auto=format&fit=crop&q=80&w=1200', sort_order: 3 },
  { title: 'Konstruksi Gudang Baja WF', category: 'Baja Berat', description: 'Struktur baja WF untuk gudang penyimpanan 300m2, lengkap dengan rangka atap.', image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200', sort_order: 4 },
  { title: 'Teralis Jendela Klasik', category: 'Teralis', description: 'Teralis motif klasik dengan ornamen tempa, finishing cat anti karat emas.', image_url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1200', sort_order: 5 },
  { title: 'Pintu Gerbang Lipat Otomatis', category: 'Pagar', description: 'Gerbang sliding besi dengan motor otomatis untuk akses kendaraan.', image_url: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200', sort_order: 6 },
];

// Products = catalog (managed via admin). Prices use ranges / "Minta Penawaran".
const products = [
  { name: 'Pagar Minimalis Hollow', cat: 'pagar-gerbang', description: 'Pagar besi hollow galvanis, desain garis minimalis, finishing cat anti karat.', image_url: 'https://images.unsplash.com/photo-1599690925058-90e1a0b45279?auto=format&fit=crop&q=80&w=1200', price_label: 'Estimasi Rp 650rb–1,2jt / m²' },
  { name: 'Gerbang Sliding Otomatis', cat: 'pagar-gerbang', description: 'Gerbang dorong rangka besi dengan opsi motor otomatis dan remote.', image_url: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran' },
  { name: 'Kanopi Alderon Twinwall', cat: 'kanopi-atap', description: 'Kanopi rangka baja dengan atap Alderon twinwall, kedap suara & panas.', image_url: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&q=80&w=1200', price_label: 'Estimasi Rp 450rb–750rb / m²' },
  { name: 'Kanopi Polycarbonate', cat: 'kanopi-atap', description: 'Kanopi ekonomis rangka hollow dengan atap polycarbonate bening/warna.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200', price_label: 'Estimasi mulai Rp 350rb / m²' },
  { name: 'Railing Balkon Minimalis', cat: 'railing-tangga', description: 'Railing besi minimalis untuk balkon & void, aman dan modern.', image_url: 'https://images.unsplash.com/photo-1517646331032-9e85639523a1?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran' },
  { name: 'Tangga Putar Besi', cat: 'railing-tangga', description: 'Tangga spiral / putar berbahan plat dan pipa besi, hemat ruang.', image_url: 'https://images.unsplash.com/photo-1556955112-28cde3817b0a?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran' },
  { name: 'Rangka Baja WF Gudang', cat: 'konstruksi-baja', description: 'Konstruksi baja WF/H-beam untuk gudang, pabrik, dan bangunan bentang lebar.', image_url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran (per proyek)' },
  { name: 'Mezzanine Baja', cat: 'konstruksi-baja', description: 'Penambahan lantai mezzanine struktur baja untuk ruko & gudang.', image_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran' },
  { name: 'Teralis Jendela Minimalis', cat: 'teralis', description: 'Teralis pengaman jendela desain minimalis, rapi dan kokoh.', image_url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=1200', price_label: 'Estimasi Rp 300rb–600rb / m²' },
  { name: 'Rak Besi Custom', cat: 'perabot-besi', description: 'Rak besi industrial untuk dapur, gudang, atau display toko sesuai ukuran.', image_url: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran' },
  { name: 'Meja Kaki Besi Industrial', cat: 'perabot-besi', description: 'Kaki meja besi finishing powder coating, kombinasi dengan top kayu.', image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=1200', price_label: 'Estimasi mulai Rp 500rb' },
  { name: 'Dudukan Tandon Air', cat: 'perabot-besi', description: 'Menara/dudukan tandon air berbahan besi siku & hollow, kuat menahan beban.', image_url: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=1200', price_label: 'Minta Penawaran' },
];

const testimonials = [
  { name: 'Budi Santoso', role: 'Pemilik Rumah', text: 'Hasil las sangat rapi, pengerjaan cepat, dan harganya masuk akal. Kanopi Alderon saya jadi terlihat mewah.', rating: 5, sort_order: 1 },
  { name: 'Siti Aminah', role: 'Developer Perumahan', text: 'Sudah berlangganan untuk proyek perumahan cluster. Pagar minimalisnya presisi dan catnya awet.', rating: 5, sort_order: 2 },
  { name: 'Hendro Wijaya', role: 'Manajer Gudang', text: 'Konstruksi baja berat untuk gudang kami sangat kokoh. Tim Bengkel Wijaya bekerja sangat profesional.', rating: 5, sort_order: 3 },
];

const settings = [
  { key: 'business_name', value: 'Bengkel Las Wijaya Konstruksi' },
  { key: 'whatsapp', value: process.env.SEED_WHATSAPP || '628122827353' },
  { key: 'address', value: 'Jl. Letkol Tit Sudono No.80, Wergu Kulon, Kec. Kota Kudus, Kabupaten Kudus.' },
  { key: 'hours', value: 'Senin - Sabtu (08:00 - 17:00)' },
  { key: 'maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2355.605924108673!2d110.84246818049397!3d-6.8134276167226036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70c5d3afdf8d2b%3A0x15cbd851befe3108!2sBengkel%20Las%20Wijaya%20Konstruksi!5e0!3m2!1sen!2sid!4v1767910506237!5m2!1sen!2sid' },
  { key: 'maps_link', value: 'https://maps.app.goo.gl/jXhT3NEAfqiPDk5u7' },
];

export async function seed() {
  await migrate(); // ensure tables exist
  const db = await getDb();

  console.log('[seed] clearing existing content...');
  await db.exec(`
    DELETE FROM products;
    DELETE FROM services;
    DELETE FROM portfolio;
    DELETE FROM testimonials;
    DELETE FROM categories;
    DELETE FROM settings;
  `);

  // Categories (keep a slug -> id map)
  const catId = {};
  for (const c of categories) {
    const r = await db.query(
      'INSERT INTO categories (name, slug, sort_order) VALUES ($1,$2,$3) RETURNING id',
      [c.name, c.slug, c.sort_order]
    );
    catId[c.slug] = r.rows[0].id;
  }

  for (const s of services) {
    await db.query(
      'INSERT INTO services (title, description, icon, sort_order) VALUES ($1,$2,$3,$4)',
      [s.title, s.description, s.icon, s.sort_order]
    );
  }

  for (const p of portfolio) {
    await db.query(
      'INSERT INTO portfolio (title, category, description, image_url, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [p.title, p.category, p.description, p.image_url, p.sort_order]
    );
  }

  let order = 0;
  for (const p of products) {
    order += 1;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await db.query(
      `INSERT INTO products (name, slug, category_id, description, image_url, price_label, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [p.name, slug, catId[p.cat] ?? null, p.description, p.image_url, p.price_label, order]
    );
  }

  for (const t of testimonials) {
    await db.query(
      'INSERT INTO testimonials (name, role, text, rating, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [t.name, t.role, t.text, t.rating, t.sort_order]
    );
  }

  for (const s of settings) {
    await db.query('INSERT INTO settings (key, value) VALUES ($1,$2)', [s.key, s.value]);
  }

  // Admin user (upsert)
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO admins (username, password_hash) VALUES ($1,$2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash]
  );

  console.log(`[seed] done: ${categories.length} categories, ${products.length} products, ${services.length} services, ${portfolio.length} portfolio, ${testimonials.length} testimonials.`);
  console.log(`[seed] admin login -> username: "${username}"  password: "${password}"`);
  return db;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(async (db) => {
      await db.end?.();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[seed] failed:', err);
      process.exit(1);
    });
}
