-- file: backend/db/migrations/020_alter_students_parents_details.sql

-- 1. Hapus kolom 'nomor_ujian_sekolah' yang tidak lagi digunakan.
ALTER TABLE "students" DROP COLUMN IF EXISTS "nomor_ujian_sekolah";

-- 2. Tambahkan kolom baru untuk detail alamat dan pekerjaan orang tua/wali.
ALTER TABLE "students"
    ADD COLUMN "pekerjaan_ayah" VARCHAR(100),
    ADD COLUMN "alamat_ayah" TEXT,
    ADD COLUMN "pekerjaan_ibu" VARCHAR(100),
    ADD COLUMN "alamat_ibu" TEXT,
    ADD COLUMN "pekerjaan_wali" VARCHAR(100),
    ADD COLUMN "alamat_wali" TEXT;