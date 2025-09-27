-- file: backend/db/migrations/001_initial_schema.sql

-- 1. Buat semua tipe ENUM kustom yang dibutuhkan di awal
DO $$
DECLARE
    current_schema text;
BEGIN
    SELECT current_schema INTO current_schema;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'jenis_kelamin_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.jenis_kelamin_enum AS ENUM (''Laki-laki'', ''Perempuan'')', current_schema);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'agama_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.agama_enum AS ENUM (''Islam'', ''Kristen Protestan'', ''Kristen Katolik'', ''Hindu'', ''Buddha'', ''Khonghucu'', ''Lainnya'')', current_schema);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'status_siswa_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.status_siswa_enum AS ENUM (''Aktif'', ''Lulus'', ''Pindah'', ''Keluar'')', current_schema);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'status_kepegawaian_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.status_kepegawaian_enum AS ENUM (''Aktif'', ''Cuti'', ''Pindah'', ''Berhenti'', ''Pensiun'')', current_schema);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'semester_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.semester_enum AS ENUM (''Ganjil'', ''Genap'')', current_schema);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'status_ajaran_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.status_ajaran_enum AS ENUM (''Aktif'', ''Tidak Aktif'')', current_schema);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t 
                  JOIN pg_namespace n ON t.typnamespace = n.oid 
                  WHERE t.typname = 'metode_absensi_enum' 
                  AND n.nspname = current_schema) THEN
        EXECUTE format('CREATE TYPE %I.metode_absensi_enum AS ENUM (''HARIAN'', ''PER_JAM_PELAJARAN'')', current_schema);
    END IF;
END$$;


-- 2. Membuat tabel users untuk menyimpan data login
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Membuat tabel teachers yang terhubung dengan users
CREATE TABLE teachers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    alamat TEXT,
    nomor_telepon VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);