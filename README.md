# Ruang Aman

Safe Haven for Students — Layanan konseling mahasiswa anonim, rahasia, dan tanpa nama.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS 4 + Motion
- **Backend:** Express.js (monolith, Vercel serverless-ready)
- **Database:** PostgreSQL (local) / Neon.tech (production)

## Fitur

- **Chat konseling anonim** — Siswa kirim pesan, konselor BK bales real-time
- **Antrean sesi konseling** — Konselor lihat & kelola sesi aktif
- **Jurnal emosi harian** — Catat trigger & perasaan, dapat wellness tips otomatis
- **Login konselor BK** — Autentikasi via database (NIP + password hashed)
- **Self-help tools** — Teknik grounding 5-4-3-2-1, hotline darurat Indonesia
- **Feedback modal** — Semua notifikasi pakai animasi smooth (bukan native alert)
- **Dark mode & mode hening** — Toggle di pengaturan

## Cara Jalankan Lokal

1. **Prerequisites:** Node.js 18+, PostgreSQL running di `localhost:5432`
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set environment variable:**
   ```bash
   # .env — lihat .env.example
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ruang_aman"
   ```
4. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000`

## Login Konselor BK (Local)

| NIP | Password | Nama |
|-----|----------|------|
| `198804052015042001` | `sarah123` | Bu Sarah, M.Pd. |

## Deploy ke Production

- **Vercel** — Hosting frontend + serverless function (`api/index.ts`)
- **Neon.tech** — PostgreSQL cloud
- Set `DATABASE_URL` di Vercel Environment Variables
- Tabel & seed data terbuat otomatis saat cold start (`IF NOT EXISTS`)

## Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Jalankan dev server (Vite + Express) |
| `npm run build` | Build frontend ke `dist/` |
| `npm run lint` | Type-check (`tsc --noEmit`) |
