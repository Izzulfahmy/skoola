-- backend/db/migrations/031_refactor_ujian_schema.sql

-- 1. Membuat tabel master untuk "Paket Ujian"
CREATE TABLE "ujian_master" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "tahun_ajaran_id" uuid NOT NULL,
    "nama_paket_ujian" character varying(255) NOT NULL,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    CONSTRAINT "ujian_master_tahun_ajaran_id_fkey" FOREIGN KEY (tahun_ajaran_id) REFERENCES tahun_ajaran(id) ON DELETE CASCADE
);

-- 2. Memodifikasi tabel "ujian" yang sudah ada
-- Hapus kolom nama_ujian
ALTER TABLE "ujian" DROP COLUMN "nama_ujian";

-- Tambahkan kolom ujian_master_id
ALTER TABLE "ujian" ADD COLUMN "ujian_master_id" uuid NOT NULL;

-- Jadikan ujian_master_id sebagai foreign key
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_ujian_master_id_fkey" FOREIGN KEY ("ujian_master_id") REFERENCES "ujian_master"("id") ON DELETE CASCADE;

-- (Opsional) Tambahkan index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_ujian_master_id" ON "ujian"("ujian_master_id");