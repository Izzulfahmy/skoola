-- file: backend/db/migrations/005_add_foundations.sql

-- 1. Buat tabel baru untuk menyimpan data yayasan di skema public.
CREATE TABLE IF NOT EXISTS public.foundations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_yayasan VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan kolom foreign key ke tabel tenants untuk menghubungkan sekolah dengan yayasan.
--    Kolom ini boleh NULL, artinya sekolah tidak wajib memiliki yayasan.
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS foundation_id UUID REFERENCES public.foundations(id) ON DELETE SET NULL;

-- 3. Buat index pada kolom foundation_id untuk mempercepat query.
CREATE INDEX IF NOT EXISTS idx_tenants_foundation_id ON public.tenants(foundation_id);