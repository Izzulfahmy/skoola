-- file: backend/db/migrations/012_add_mata_pelajaran.sql

-- 1. Membuat tabel untuk menyimpan data mata pelajaran
CREATE TABLE IF NOT EXISTS "mata_pelajaran" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "kode_mapel" VARCHAR(20) NOT NULL,
    "nama_mapel" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "mata_pelajaran_kode_mapel_unique" UNIQUE ("kode_mapel")
);

-- 2. Tambahkan index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS "idx_mata_pelajaran_nama_mapel" ON "mata_pelajaran"("nama_mapel");