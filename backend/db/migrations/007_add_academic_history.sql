-- file: backend/db/migrations/007_add_academic_history.sql

-- 1. Buat tabel baru untuk mencatat riwayat status akademik siswa.
CREATE TABLE "riwayat_akademik" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    "status" status_siswa_enum NOT NULL,
    "tanggal_kejadian" DATE NOT NULL DEFAULT CURRENT_DATE,
    "kelas_tingkat" VARCHAR(50),
    "keterangan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat index pada student_id untuk mempercepat pencarian.
CREATE INDEX "idx_riwayat_akademik_student_id" ON "riwayat_akademik"("student_id");

-- 3. Hapus kolom status_siswa yang lama dari tabel students.
--    Kolom ini tidak lagi diperlukan karena status akan diambil dari tabel riwayat.
ALTER TABLE "students" DROP COLUMN IF EXISTS "status_siswa";