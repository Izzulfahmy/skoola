-- file: backend/db/migrations/026_alter_penilaian_sumatif_for_ujian.sql

-- 1. Jadikan kolom tujuan_pembelajaran_id bisa NULL
ALTER TABLE "penilaian_sumatif" ALTER COLUMN "tujuan_pembelajaran_id" DROP NOT NULL;

-- 2. Tambahkan kolom baru untuk foreign key ke tabel ujian
ALTER TABLE "penilaian_sumatif"
ADD COLUMN "ujian_id" INTEGER REFERENCES "ujian"(id) ON DELETE CASCADE;

-- 3. Tambahkan index pada kolom ujian_id
CREATE INDEX IF NOT EXISTS "idx_penilaian_sumatif_ujian_id" ON "penilaian_sumatif"("ujian_id");

-- 4. Tambahkan constraint untuk memastikan salah satu dari (tujuan_pembelajaran_id atau ujian_id) harus diisi
ALTER TABLE "penilaian_sumatif"
ADD CONSTRAINT "check_penilaian_parent"
CHECK (
    (tujuan_pembelajaran_id IS NOT NULL AND ujian_id IS NULL) OR
    (tujuan_pembelajaran_id IS NULL AND ujian_id IS NOT NULL)
);