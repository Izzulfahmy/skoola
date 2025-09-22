-- file: backend/db/migrations/005_add_foundations.sql

-- 1. Buat tabel baru untuk menyimpan data naungan di skema public.
CREATE TABLE IF NOT EXISTS public.naungan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_naungan VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tambahkan kolom foreign key ke tabel tenants untuk menghubungkan sekolah dengan naungan.
--    Kolom ini boleh NULL, artinya sekolah tidak wajib memiliki naungan.
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS naungan_id UUID REFERENCES public.naungan(id) ON DELETE SET NULL;

-- 3. Buat index pada kolom naungan_id untuk mempercepat query.
CREATE INDEX IF NOT EXISTS idx_tenants_naungan_id ON public.tenants(naungan_id);