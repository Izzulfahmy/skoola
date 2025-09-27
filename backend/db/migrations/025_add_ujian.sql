-- file: backend/db/migrations/025_add_ujian.sql

-- 1. Membuat tabel untuk Ujian
CREATE TABLE IF NOT EXISTS "ujian" (
    "id" SERIAL PRIMARY KEY,
    "pengajar_kelas_id" UUID NOT NULL REFERENCES "pengajar_kelas"(id) ON DELETE CASCADE,
    "nama_ujian" VARCHAR(255) NOT NULL,
    "urutan" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan Index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_ujian_pengajar_kelas_id" ON "ujian"("pengajar_kelas_id");