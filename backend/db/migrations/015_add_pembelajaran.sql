-- file: backend/db/migrations/015_add_pembelajaran.sql

-- 1. Tabel untuk Materi Pembelajaran (Topik/Bab)
CREATE TABLE IF NOT EXISTS "materi_pembelajaran" (
    "id" SERIAL PRIMARY KEY,
    "pengajar_kelas_id" UUID NOT NULL REFERENCES "pengajar_kelas"(id) ON DELETE CASCADE,
    "nama_materi" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT,
    "urutan" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel untuk Tujuan Pembelajaran (TP)
CREATE TABLE IF NOT EXISTS "tujuan_pembelajaran" (
    "id" SERIAL PRIMARY KEY,
    "materi_pembelajaran_id" INTEGER NOT NULL REFERENCES "materi_pembelajaran"(id) ON DELETE CASCADE,
    "deskripsi_tujuan" TEXT NOT NULL,
    "urutan" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tambahkan Index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_materi_pembelajaran_pengajar_kelas_id" ON "materi_pembelajaran"("pengajar_kelas_id");
CREATE INDEX IF NOT EXISTS "idx_tujuan_pembelajaran_materi_id" ON "tujuan_pembelajaran"("materi_pembelajaran_id");