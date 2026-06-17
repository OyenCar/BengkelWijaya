# Bengkel Las Wijaya Konstruksi — Website Platform

Platform website modern & data-driven untuk **Bengkel Las Wijaya Konstruksi (Oyen)**.
Monorepo berisi **frontend** (React + Vite) dan **backend** (Node + Express + PostgreSQL).

## Tech Stack & Alasannya

**Frontend** (`/frontend`)
- **React 18 + Vite** — SPA cepat, HMR, build teroptimasi (sudah ada sebelumnya, dipertahankan).
- **Tailwind CSS** — styling utility, konsisten & rapi (palet gelap + aksen emas/amber = kesan premium).
- **GSAP + ScrollTrigger** — animasi halus: reveal text, transisi section saat scroll.
- **Three.js** — elemen 3D interaktif (showcase logam metalik berputar di hero).
  *Di-lazy-load (dynamic import) + fallback otomatis untuk mobile / no-WebGL / reduced-motion → loading tetap cepat.*
- **react-router-dom** — routing `/` (website) dan `/admin` (dashboard).

**Backend** (`/backend`)
- **Node.js + Express** — REST API ringan & populer.
- **PostgreSQL** — database relasional. Dua driver di balik satu adapter:
  - `pg` (node-postgres) → **untuk produksi**, konek ke server PostgreSQL via `DATABASE_URL`.
  - **PGlite** (PostgreSQL versi WASM, in-process) → **default untuk dev/lokal**, tidak butuh
    instalasi server DB. SQL-nya tetap PostgreSQL asli, jadi mudah pindah ke `pg` kapan saja.
- **JWT + bcryptjs** — autentikasi admin (password di-hash, token Bearer).
- **multer** — upload foto portfolio/produk.
- **Chatbot provider-agnostic** — satu interface, provider dipilih lewat `.env`
  (`echo` rule-based tanpa API key = default, atau `openai`/`anthropic`/`gemini`).
  **API key disimpan di server (env), tidak pernah diekspos ke frontend.**

## Struktur Folder

```
bengkel-las/
├── backend/
│   ├── src/
│   │   ├── server.js            # entry Express (auto migrate + seed saat DB kosong)
│   │   ├── db/
│   │   │   ├── index.js         # adapter DB (pglite | pg)
│   │   │   ├── schema.sql       # skema tabel
│   │   │   ├── migrate.js       # buat tabel
│   │   │   └── seed.js          # isi data contoh + akun admin
│   │   ├── middleware/auth.js   # JWT
│   │   ├── routes/
│   │   │   ├── public.js        # katalog, layanan, portfolio, inquiry, chat
│   │   │   └── admin.js         # login + CRUD + inquiries + upload + settings
│   │   └── chatbot/
│   │       ├── index.js         # pemilih provider + system prompt dari data bisnis
│   │       └── providers/       # echo, openai, anthropic, gemini
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # router
│   │   ├── lib/api.js           # client API
│   │   ├── site/                # SitePage, Hero3D (Three.js), Chatbot
│   │   └── admin/AdminApp.jsx   # login + dashboard (CRUD + inquiries + settings)
│   ├── .env.example
│   └── package.json
└── README.md
```

## Struktur Data (tabel utama)

- **categories** (id, name, slug, sort_order)
- **products** (id, name, slug, category_id, description, image_url, price_label, is_visible, sort_order)
- **services** (id, title, description, icon, is_visible, sort_order)
- **portfolio** (id, title, category, description, image_url, is_visible, sort_order)
- **testimonials** (id, name, role, text, rating, is_visible, sort_order)
- **inquiries** (id, name, phone, need, detail, status, created_at) — "Minta Penawaran" → mini-CRM
- **admins** (id, username, password_hash)
- **settings** (key, value) — info bisnis (alamat, WA, jam buka, maps)

> Harga: tidak ada harga pasti. `price_label` berisi estimasi/kisaran atau "Minta Penawaran".

## Cara Menjalankan (Lokal)

Butuh **Node.js 18+**. Buka **dua terminal**.

**1) Backend**
```bash
cd backend
cp .env.example .env        # default sudah pakai PGlite, tanpa setup DB
npm install
npm start                   # http://localhost:4000  (otomatis migrate + seed saat pertama)
```
Untuk pakai PostgreSQL asli: set `DB_DRIVER=pg` dan `DATABASE_URL=...` di `backend/.env`,
lalu `npm run migrate && npm run seed`.

**2) Frontend**
```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:5173
```

## Akses

- **Website utama:** http://localhost:5173
- **Dashboard admin:** http://localhost:5173/admin
- **Login admin default:** `admin` / `admin123` (ubah via `ADMIN_USERNAME`/`ADMIN_PASSWORD` di `backend/.env` lalu seed ulang)
- **API:** http://localhost:4000/api

## Mengganti Provider Chatbot

Di `backend/.env`:
```
CHATBOT_PROVIDER=openai        # atau anthropic | gemini | echo
CHATBOT_API_KEY=sk-...         # kunci Anda; hanya di server
CHATBOT_MODEL=gpt-4o-mini      # opsional
```
Default `echo` = asisten berbasis aturan yang sudah tahu konteks bisnis & katalog (tanpa API key).
