-- file: backend/db/migrations/027_add_presensi.sql

-- 1. Buat tipe ENUM untuk status presensi jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_presensi_enum') THEN
        CREATE TYPE status_presensi_enum AS ENUM ('H', 'S', 'I', 'A');
    END IF;
END$$;

-- 2. Buat tabel presensi
CREATE TABLE IF NOT EXISTS "presensi" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "anggota_kelas_id" UUID NOT NULL REFERENCES "anggota_kelas"(id) ON DELETE CASCADE,
    "tanggal" DATE NOT NULL,
    "status" status_presensi_enum NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "presensi_anggota_tanggal_unique" UNIQUE ("anggota_kelas_id", "tanggal")
);

-- 3. Index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_presensi_anggota_kelas_id" ON "presensi"("anggota_kelas_id");
CREATE INDEX IF NOT EXISTS "idx_presensi_tanggal" ON "presensi"("tanggal");