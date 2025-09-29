-- Create enums in public schema
SET search_path TO public;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_presensi_enum') THEN
        CREATE TYPE status_presensi_enum AS ENUM ('H', 'S', 'I', 'A');
    END IF;
END $$;