-- backend/db/migrations/004_add_employment_history.sql

-- 1. Hapus kolom 'status_guru' yang lama dari tabel teachers.
--    Tipe ENUM yang terhubung akan dihapus jika tidak digunakan lagi.
ALTER TABLE "teachers" DROP COLUMN IF EXISTS "status_guru";

-- 2. Tipe ENUM sudah dibuat di file migrasi 001.

-- 3. Buat tabel baru untuk mencatat riwayat kepegawaian.
CREATE TABLE "riwayat_kepegawaian" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "teacher_id" UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    "status" status_kepegawaian_enum NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE, -- Boleh NULL jika ini adalah status yang masih aktif
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buat index pada teacher_id untuk mempercepat pencarian riwayat
CREATE INDEX "idx_riwayat_kepegawaian_teacher_id" ON "riwayat_kepegawaian"("teacher_id");