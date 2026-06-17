import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Database adapter.
 *
 * Supports two drivers behind a single { query, exec } interface:
 *  - "pglite" (default): an in-process WASM build of PostgreSQL. No server,
 *    no native binaries, no sudo. Great for local dev / preview. Data is
 *    persisted to a folder on disk (PGLITE_DIR).
 *  - "pg": the standard node-postgres client, talking to a real PostgreSQL
 *    server via DATABASE_URL. Use this in production.
 *
 * Both drivers accept the same parameterised SQL ($1, $2, ...) and return
 * results as { rows }, so the rest of the app does not care which is used.
 */
const DRIVER = (process.env.DB_DRIVER || 'pglite').toLowerCase();

let _dbPromise = null;

async function create() {
  if (DRIVER === 'pg') {
    const pg = (await import('pg')).default;
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      // Allow self-signed certs on managed PG if SSL requested
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
    return {
      driver: 'pg',
      query: (text, params) => pool.query(text, params),
      exec: (sql) => pool.query(sql),
      end: () => pool.end(),
    };
  }

  // Default: PGlite (embedded PostgreSQL via WASM)
  const { PGlite } = await import('@electric-sql/pglite');
  const dir = process.env.PGLITE_DIR
    ? path.resolve(process.env.PGLITE_DIR)
    : path.join(__dirname, '..', '..', 'pgdata');
  const pglite = new PGlite(dir);
  await pglite.waitReady;
  return {
    driver: 'pglite',
    query: (text, params) => pglite.query(text, params ?? []),
    exec: (sql) => pglite.exec(sql),
    end: () => pglite.close(),
  };
}

export function getDb() {
  if (!_dbPromise) _dbPromise = create();
  return _dbPromise;
}
