-- file: backend/db/migrations/023_add_penilaian_sumatif.sql

-- 1. Membuat tabel untuk menyimpan data perencanaan penilaian (sumatif/formatif terjadwal)
CREATE TABLE IF NOT EXISTS "penilaian_sumatif" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tujuan_pembelajaran_id" INTEGER NOT NULL REFERENCES "tujuan_pembelajaran"(id) ON DELETE CASCADE,
    "jenis_ujian_id" INTEGER NOT NULL REFERENCES "jenis_ujian"(id) ON DELETE RESTRICT,
    "nama_penilaian" VARCHAR(255) NOT NULL,
    "tanggal_pelaksanaan" DATE,
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan index untuk optimasi query
CREATE INDEX IF NOT EXISTS "idx_penilaian_sumatif_tp_id" ON "penilaian_sumatif"("tujuan_pembelajaran_id");