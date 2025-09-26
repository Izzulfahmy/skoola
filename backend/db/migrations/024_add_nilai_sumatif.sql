-- file: backend/db/migrations/024_add_nilai_sumatif.sql

-- 1. Membuat tabel untuk menyimpan nilai sumatif siswa
CREATE TABLE IF NOT EXISTS "nilai_sumatif_siswa" (
    "id" SERIAL PRIMARY KEY,
    "penilaian_sumatif_id" UUID NOT NULL REFERENCES "penilaian_sumatif"(id) ON DELETE CASCADE,
    "anggota_kelas_id" UUID NOT NULL REFERENCES "anggota_kelas"(id) ON DELETE CASCADE,
    "nilai" NUMERIC(5, 2),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint untuk memastikan satu siswa hanya punya satu nilai untuk satu item penilaian sumatif
    CONSTRAINT "nilai_sumatif_siswa_unique" UNIQUE ("penilaian_sumatif_id", "anggota_kelas_id")
);

-- 2. Tambahkan Index untuk mempercepat query
CREATE INDEX IF NOT EXISTS "idx_nilai_sumatif_penilaian_id" ON "nilai_sumatif_siswa"("penilaian_sumatif_id");
CREATE INDEX IF NOT EXISTS "idx_nilai_sumatif_anggota_kelas_id" ON "nilai_sumatif_siswa"("anggota_kelas_id");