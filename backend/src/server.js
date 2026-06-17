import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { getDb } from './db/index.js';
import { migrate } from './db/migrate.js';
import { seed } from './db/seed.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const db = await getDb();

  // Auto-migrate, and auto-seed on first run (when products table is empty).
  await migrate();
  if (process.env.AUTO_SEED !== 'false') {
    const count = await db.query('SELECT COUNT(*)::int AS n FROM products');
    if (count.rows[0].n === 0) {
      console.log('[server] empty database detected -> seeding...');
      await seed();
    }
  }

  const app = express();
  app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
  app.use(express.json({ limit: '1mb' }));

  // Serve uploaded images
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  app.get('/', (req, res) => res.json({ name: 'Bengkel Las Wijaya Konstruksi API', status: 'ok' }));
  app.use('/api', publicRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));

  app.listen(PORT, () => {
    console.log(`[server] API listening on http://localhost:${PORT}  (db: ${db.driver})`);
  });
}

bootstrap().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
