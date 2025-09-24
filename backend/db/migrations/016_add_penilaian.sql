-- file: backend/db/migrations/016_add_penilaian.sql

-- 1. Membuat tabel untuk menyimpan nilai formatif per siswa per tujuan pembelajaran.
CREATE TABLE IF NOT EXISTS "penilaian" (
    "id" SERIAL PRIMARY KEY,
    "anggota_kelas_id" UUID NOT NULL REFERENCES "anggota_kelas"(id) ON DELETE CASCADE,
    "tujuan_pembelajaran_id" INTEGER NOT NULL REFERENCES "tujuan_pembelajaran"(id) ON DELETE CASCADE,
    "nilai" NUMERIC(5, 2), -- Memungkinkan nilai desimal, misal: 85.50
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    -- Constraint untuk memastikan satu siswa hanya punya satu nilai untuk satu TP
    CONSTRAINT "penilaian_anggota_tp_unique" UNIQUE ("anggota_kelas_id", "tujuan_pembelajaran_id")
);

-- 2. Tambahkan Index untuk mempercepat query pencarian nilai
CREATE INDEX IF NOT EXISTS "idx_penilaian_anggota_kelas_id" ON "penilaian"("anggota_kelas_id");
CREATE INDEX IF NOT EXISTS "idx_penilaian_tp_id" ON "penilaian"("tujuan_pembelajaran_id");