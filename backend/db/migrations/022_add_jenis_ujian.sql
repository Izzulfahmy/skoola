-- file: backend/db/migrations/022_add_jenis_ujian.sql

-- 1. Membuat tabel untuk menyimpan data Jenis Ujian
CREATE TABLE IF NOT EXISTS "jenis_ujian" (
    "id" SERIAL PRIMARY KEY,
    "kode_ujian" VARCHAR(20) NOT NULL,
    "nama_ujian" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "jenis_ujian_kode_ujian_unique" UNIQUE ("kode_ujian")
);

-- 2. Tambahkan index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS "idx_jenis_ujian_kode" ON "jenis_ujian"("kode_ujian");
CREATE INDEX IF NOT EXISTS "idx_jenis_ujian_nama" ON "jenis_ujian"("nama_ujian");

-- 3. (Opsional) Isi dengan beberapa data awal untuk tenant baru
INSERT INTO "jenis_ujian" ("kode_ujian", "nama_ujian") VALUES
('UH', 'Ulangan Harian'),
('PR', 'Pekerjaan Rumah'),
('TGS', 'Tugas'),
('PRA', 'Praktik'),
('STS', 'Sumatif Tengah Semester'),
('SAS', 'Sumatif Akhir Semester')
ON CONFLICT (kode_ujian) DO NOTHING;