-- First ensure we're in the right schema context
DO $$
DECLARE
    current_schema text;
BEGIN
    -- Get current schema name
    SELECT current_schema() INTO current_schema;
    
    -- Try to create the enum type if it doesn't exist
    BEGIN
        CREATE TYPE public.status_presensi_enum AS ENUM ('H', 'S', 'I', 'A');
    EXCEPTION 
        WHEN duplicate_object THEN null;
    END;

    -- Create the table
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I.presensi (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            anggota_kelas_id UUID NOT NULL REFERENCES anggota_kelas(id) ON DELETE CASCADE,
            tanggal DATE NOT NULL,
            status public.status_presensi_enum NOT NULL,
            catatan TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT presensi_anggota_tanggal_unique UNIQUE (anggota_kelas_id, tanggal)
        )', current_schema);

    -- Create indexes
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_presensi_anggota_kelas_id ON %I.presensi(anggota_kelas_id)', current_schema);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_presensi_tanggal ON %I.presensi(tanggal)', current_schema);
END $$;