import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DROP_SQL = `
  DROP TABLE IF EXISTS inquiries CASCADE;
  DROP TABLE IF EXISTS products CASCADE;
  DROP TABLE IF EXISTS services CASCADE;
  DROP TABLE IF EXISTS portfolio CASCADE;
  DROP TABLE IF EXISTS testimonials CASCADE;
  DROP TABLE IF EXISTS categories CASCADE;
  DROP TABLE IF EXISTS admins CASCADE;
  DROP TABLE IF EXISTS settings CASCADE;
`;

export async function migrate({ reset = false } = {}) {
  const db = await getDb();
  if (reset) {
    console.log('[migrate] resetting (dropping) tables...');
    await db.exec(DROP_SQL);
  }
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await db.exec(schema);
  console.log(`[migrate] schema applied (driver: ${db.driver}).`);
  return db;
}

// Run directly: `node src/db/migrate.js [--reset]`
if (import.meta.url === `file://${process.argv[1]}`) {
  const reset = process.argv.includes('--reset');
  migrate({ reset })
    .then(async (db) => {
      await db.end?.();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[migrate] failed:', err);
      process.exit(1);
    });
}
