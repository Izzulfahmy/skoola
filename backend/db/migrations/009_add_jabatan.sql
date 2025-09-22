-- file: backend/db/migrations/009_add_jabatan.sql

-- 1. Membuat tabel untuk menyimpan data Jabatan
CREATE TABLE IF NOT EXISTS "jabatan" (
    "id" SERIAL PRIMARY KEY,
    "nama_jabatan" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan index untuk pencarian yang lebih cepat
CREATE INDEX IF NOT EXISTS "idx_jabatan_nama" ON "jabatan"("nama_jabatan");

-- 3. (Opsional) Isi dengan beberapa data awal jika diperlukan
INSERT INTO "jabatan" ("nama_jabatan") VALUES
('Kepala Sekolah'),
('Wakil Kepala Sekolah'),
('Guru Kelas'),
('Guru Mata Pelajaran'),
('Staf Tata Usaha')
ON CONFLICT DO NOTHING;