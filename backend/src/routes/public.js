import { Router } from 'express';
import { getDb } from '../db/index.js';
import { chat } from '../chatbot/index.js';

const router = Router();

const asyncH = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error('[api]', e);
  res.status(500).json({ error: 'Terjadi kesalahan di server' });
});

// Helper to fetch settings as an object
async function getSettings(db) {
  const r = await db.query('SELECT key, value FROM settings');
  return Object.fromEntries(r.rows.map((row) => [row.key, row.value]));
}

router.get('/health', asyncH(async (req, res) => {
  const db = await getDb();
  await db.query('SELECT 1');
  res.json({ ok: true, driver: db.driver, time: new Date().toISOString() });
}));

router.get('/categories', asyncH(async (req, res) => {
  const db = await getDb();
  const r = await db.query('SELECT id, name, slug FROM categories ORDER BY sort_order, id');
  res.json(r.rows);
}));

router.get('/products', asyncH(async (req, res) => {
  const db = await getDb();
  const { category, q } = req.query;
  const where = ['p.is_visible = TRUE'];
  const params = [];
  if (category) { params.push(category); where.push(`c.slug = $${params.length}`); }
  if (q) { params.push(`%${q}%`); where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`); }
  const sql = `
    SELECT p.id, p.name, p.slug, p.description, p.image_url, p.price_label,
           p.category_id, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${where.join(' AND ')}
    ORDER BY p.sort_order, p.id`;
  const r = await db.query(sql, params);
  res.json(r.rows);
}));

router.get('/services', asyncH(async (req, res) => {
  const db = await getDb();
  const r = await db.query('SELECT id, title, description, icon FROM services WHERE is_visible = TRUE ORDER BY sort_order, id');
  res.json(r.rows);
}));

router.get('/portfolio', asyncH(async (req, res) => {
  const db = await getDb();
  const r = await db.query('SELECT id, title, category, description, image_url FROM portfolio WHERE is_visible = TRUE ORDER BY sort_order, id');
  res.json(r.rows);
}));

router.get('/testimonials', asyncH(async (req, res) => {
  const db = await getDb();
  const r = await db.query('SELECT id, name, role, text, rating FROM testimonials WHERE is_visible = TRUE ORDER BY sort_order, id');
  res.json(r.rows);
}));

router.get('/settings', asyncH(async (req, res) => {
  const db = await getDb();
  res.json(await getSettings(db));
}));

// Customer "Minta Penawaran" submission -> stored as inquiry (mini-CRM)
router.post('/inquiries', asyncH(async (req, res) => {
  const db = await getDb();
  const { name, phone, need = '', detail = '' } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: 'Nama dan nomor WhatsApp wajib diisi' });
  const r = await db.query(
    'INSERT INTO inquiries (name, phone, need, detail) VALUES ($1,$2,$3,$4) RETURNING id, created_at',
    [String(name).slice(0, 120), String(phone).slice(0, 40), String(need).slice(0, 120), String(detail).slice(0, 2000)]
  );
  res.status(201).json({ ok: true, id: r.rows[0].id, created_at: r.rows[0].created_at });
}));

// Chatbot endpoint (provider-agnostic; key stays server-side)
router.post('/chat', asyncH(async (req, res) => {
  const db = await getDb();
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!messages.length) return res.status(400).json({ error: 'messages kosong' });
  const settings = await getSettings(db);
  const categories = (await db.query('SELECT name, slug FROM categories ORDER BY sort_order')).rows;
  const products = (await db.query('SELECT name, price_label FROM products WHERE is_visible = TRUE ORDER BY sort_order')).rows;
  const result = await chat({ messages, context: { settings, categories, products } });
  res.json(result);
}));

export default router;
