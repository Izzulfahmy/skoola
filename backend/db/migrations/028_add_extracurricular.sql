-- file: backend/db/migrations/028_add_extracurricular.sql

-- 1. Membuat tabel untuk menyimpan data master Ekstrakurikuler
CREATE TABLE IF NOT EXISTS "ekstrakurikuler" (
    "id" SERIAL PRIMARY KEY,
    "nama_kegiatan" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "ekstrakurikuler_nama_kegiatan_unique" UNIQUE ("nama_kegiatan")
);

-- 2. Tambahkan index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS "idx_ekstrakurikuler_nama" ON "ekstrakurikuler"("nama_kegiatan");