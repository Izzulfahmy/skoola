-- file: backend/db/migrations/018_add_order_to_mapel.sql

-- 1. Tambahkan kolom 'urutan' ke tabel mata_pelajaran untuk menyimpan urutan custom.
--    Kita beri nilai default 0.
ALTER TABLE "mata_pelajaran"
ADD COLUMN "urutan" INTEGER DEFAULT 0;

-- 2. Tambahkan index pada kolom urutan untuk mempercepat proses sorting.
CREATE INDEX IF NOT EXISTS "idx_mata_pelajaran_urutan" ON "mata_pelajaran"("urutan");