import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { activeProviderName } from '../chatbot/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

const asyncH = (fn) => (req, res) => fn(req, res).catch((e) => {
  console.error('[admin]', e);
  res.status(500).json({ error: 'Terjadi kesalahan di server' });
});

// ---- Auth ----
router.post('/auth/login', asyncH(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });
  const db = await getDb();
  const r = await db.query('SELECT id, username, password_hash FROM admins WHERE username = $1', [username]);
  const admin = r.rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: 'Username atau password salah' });
  }
  const token = signToken({ id: admin.id, username: admin.username });
  res.json({ token, user: { id: admin.id, username: admin.username } });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: req.admin, chatbotProvider: activeProviderName() }));

// ---- Image upload ----
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File gambar tidak valid' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ---- Generic CRUD factory ----
function crud(table, fields, { defaults = {} } = {}) {
  const r = Router();

  r.get('/', requireAuth, asyncH(async (req, res) => {
    const db = await getDb();
    const out = await db.query(`SELECT * FROM ${table} ORDER BY sort_order, id`);
    res.json(out.rows);
  }));

  r.post('/', requireAuth, asyncH(async (req, res) => {
    const db = await getDb();
    const cols = [], vals = [], params = [];
    for (const f of fields) {
      const v = req.body[f] ?? defaults[f];
      if (v !== undefined) { params.push(v); cols.push(f); vals.push(`$${params.length}`); }
    }
    if (!cols.length) return res.status(400).json({ error: 'Tidak ada data' });
    const out = await db.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${vals.join(',')}) RETURNING *`, params);
    res.status(201).json(out.rows[0]);
  }));

  r.put('/:id', requireAuth, asyncH(async (req, res) => {
    const db = await getDb();
    const sets = [], params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { params.push(req.body[f]); sets.push(`${f} = $${params.length}`); }
    }
    if (!sets.length) return res.status(400).json({ error: 'Tidak ada perubahan' });
    params.push(req.params.id);
    const out = await db.query(`UPDATE ${table} SET ${sets.join(',')} WHERE id = $${params.length} RETURNING *`, params);
    if (!out.rows.length) return res.status(404).json({ error: 'Data tidak ditemukan' });
    res.json(out.rows[0]);
  }));

  r.delete('/:id', requireAuth, asyncH(async (req, res) => {
    const db = await getDb();
    await db.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  }));

  return r;
}

router.use('/products', crud('products', ['name', 'slug', 'category_id', 'description', 'image_url', 'price_label', 'is_visible', 'sort_order'], { defaults: { description: '', image_url: '', price_label: 'Minta Penawaran', is_visible: true, sort_order: 0 } }));
router.use('/services', crud('services', ['title', 'description', 'icon', 'is_visible', 'sort_order'], { defaults: { description: '', icon: 'Hammer', is_visible: true, sort_order: 0 } }));
router.use('/portfolio', crud('portfolio', ['title', 'category', 'description', 'image_url', 'is_visible', 'sort_order'], { defaults: { category: '', description: '', image_url: '', is_visible: true, sort_order: 0 } }));
router.use('/testimonials', crud('testimonials', ['name', 'role', 'text', 'rating', 'is_visible', 'sort_order'], { defaults: { role: '', rating: 5, is_visible: true, sort_order: 0 } }));
router.use('/categories', crud('categories', ['name', 'slug', 'sort_order'], { defaults: { sort_order: 0 } }));

// ---- Inquiries (read + status management) ----
router.get('/inquiries', requireAuth, asyncH(async (req, res) => {
  const db = await getDb();
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) { params.push(status); where = 'WHERE status = $1'; }
  const out = await db.query(`SELECT * FROM inquiries ${where} ORDER BY created_at DESC, id DESC`, params);
  res.json(out.rows);
}));

router.patch('/inquiries/:id', requireAuth, asyncH(async (req, res) => {
  const db = await getDb();
  const { status } = req.body || {};
  const allowed = ['baru', 'diproses', 'penawaran_terkirim', 'selesai', 'batal'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });
  const out = await db.query('UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  if (!out.rows.length) return res.status(404).json({ error: 'Inquiry tidak ditemukan' });
  res.json(out.rows[0]);
}));

router.delete('/inquiries/:id', requireAuth, asyncH(async (req, res) => {
  const db = await getDb();
  await db.query('DELETE FROM inquiries WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

// ---- Settings (key/value) ----
router.put('/settings', requireAuth, asyncH(async (req, res) => {
  const db = await getDb();
  const entries = Object.entries(req.body || {});
  for (const [key, value] of entries) {
    await db.query(
      `INSERT INTO settings (key, value) VALUES ($1,$2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, String(value)]
    );
  }
  res.json({ ok: true });
}));

export default router;
