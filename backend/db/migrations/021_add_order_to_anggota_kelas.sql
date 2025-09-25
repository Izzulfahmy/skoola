-- file: backend/db/migrations/021_add_order_to_anggota_kelas.sql

-- 1. Menambahkan kolom 'urutan' ke tabel anggota_kelas untuk menyimpan nomor absen.
--    Diberi nilai default 0 untuk data yang sudah ada.
ALTER TABLE "anggota_kelas"
ADD COLUMN "urutan" INTEGER DEFAULT 0;

-- 2. Menambahkan indeks pada kolom 'urutan' untuk mempercepat proses pengurutan.
CREATE INDEX IF NOT EXISTS "idx_anggota_kelas_urutan" ON "anggota_kelas"("urutan");