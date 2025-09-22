-- file: backend/db/migrations/010_add_tingkatan.sql

-- 1. Membuat tabel untuk menyimpan data tingkatan kelas
CREATE TABLE IF NOT EXISTS "tingkatan" (
    "id" SERIAL PRIMARY KEY,
    "nama_tingkatan" VARCHAR(100) NOT NULL,
    "urutan" INTEGER,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS "idx_tingkatan_nama" ON "tingkatan"("nama_tingkatan");

-- 3. Tambahkan constraint UNIQUE untuk mencegah duplikasi nama tingkatan dalam satu sekolah
ALTER TABLE "tingkatan" ADD CONSTRAINT "tingkatan_nama_tingkatan_key" UNIQUE ("nama_tingkatan");

-- 4. (Opsional) Isi dengan beberapa data awal jika diperlukan untuk tenant baru
INSERT INTO "tingkatan" ("nama_tingkatan", "urutan") VALUES
('Kelas 1', 1),
('Kelas 2', 2),
('Kelas 3', 3),
('Kelas 4', 4),
('Kelas 5', 5),
('Kelas 6', 6)
ON CONFLICT (nama_tingkatan) DO NOTHING;