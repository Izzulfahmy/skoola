-- file: backend/db/migrations/030_add_achievements.sql

-- 1. Membuat ENUM untuk tingkatan kejuaraan
DO $$
DECLARE
    current_schema text;
BEGIN
    SELECT current_schema() INTO current_schema;

    IF NOT EXISTS (SELECT 1 FROM pg_type t
                  JOIN pg_namespace n ON t.typnamespace = n.oid
                  WHERE t.typname = 'tingkat_kejuaraan_enum'
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.tingkat_kejuaraan_enum AS ENUM (''Sekolah'', ''Desa/Kelurahan'', ''Kecamatan'', ''Kabupaten/Kota'', ''Provinsi'', ''Nasional'', ''Internasional'')', current_schema);
    END IF;
END$$;

-- 2. Membuat ENUM untuk peringkat
DO $$
DECLARE
    current_schema text;
BEGIN
    SELECT current_schema() INTO current_schema;

    IF NOT EXISTS (SELECT 1 FROM pg_type t
                  JOIN pg_namespace n ON t.typnamespace = n.oid
                  WHERE t.typname = 'peringkat_kejuaraan_enum'
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.peringkat_kejuaraan_enum AS ENUM (''Juara 1'', ''Juara 2'', ''Juara 3'', ''Harapan 1'', ''Harapan 2'', ''Harapan 3'')', current_schema);
    END IF;
END$$;

-- 3. Membuat tabel prestasi
CREATE TABLE IF NOT EXISTS "prestasi_siswa" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tahun_ajaran_id" UUID NOT NULL REFERENCES "tahun_ajaran"(id) ON DELETE CASCADE,
    "anggota_kelas_id" UUID NOT NULL REFERENCES "anggota_kelas"(id) ON DELETE CASCADE,
    "nama_prestasi" VARCHAR(255) NOT NULL,
    "tingkat" tingkat_kejuaraan_enum NOT NULL,
    "peringkat" peringkat_kejuaraan_enum NOT NULL,
    "tanggal" DATE NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Menambahkan index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_prestasi_siswa_tahun_ajaran_id" ON "prestasi_siswa"("tahun_ajaran_id");
CREATE INDEX IF NOT EXISTS "idx_prestasi_siswa_anggota_kelas_id" ON "prestasi_siswa"("anggota_kelas_id");