-- file: backend/db/migrations/008_add_jenjang_pendidikan.sql

-- 1. Membuat tabel untuk menyimpan data Jenjang Pendidikan
CREATE TABLE IF NOT EXISTS "jenjang_pendidikan" (
    "id" SERIAL PRIMARY KEY,
    "nama_jenjang" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS "idx_jenjang_pendidikan_nama" ON "jenjang_pendidikan"("nama_jenjang");

-- 3. (Opsional) Isi dengan beberapa data awal jika diperlukan
INSERT INTO "jenjang_pendidikan" ("nama_jenjang") VALUES
('SD/MI'),
('SMP/MTs'),
('SMA/MA'),
('SMK')
ON CONFLICT DO NOTHING;