-- file: backend/db/migrations/019_add_mapel_groups.sql

-- 1. Membuat tabel untuk kelompok mata pelajaran
CREATE TABLE IF NOT EXISTS "kelompok_mata_pelajaran" (
    "id" SERIAL PRIMARY KEY,
    "nama_kelompok" VARCHAR(100) NOT NULL,
    "urutan" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menambahkan kolom foreign key `kelompok_id` ke tabel mata_pelajaran
ALTER TABLE "mata_pelajaran"
ADD COLUMN "kelompok_id" INTEGER REFERENCES "kelompok_mata_pelajaran"(id) ON DELETE SET NULL;

-- 3. Membuat index pada kolom `kelompok_id` untuk performa query
CREATE INDEX IF NOT EXISTS "idx_mata_pelajaran_kelompok_id" ON "mata_pelajaran"("kelompok_id");

-- 4. (Opsional) Menambahkan data kelompok awal untuk sekolah yang baru dibuat
INSERT INTO "kelompok_mata_pelajaran" ("nama_kelompok", "urutan") VALUES
('Mata Pelajaran Umum', 1),
('Mata Pelajaran Muatan Lokal', 2)
ON CONFLICT DO NOTHING;