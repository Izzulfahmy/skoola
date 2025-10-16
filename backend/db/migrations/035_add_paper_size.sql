-- file: backend/db/migrations/035_add_paper_size.sql

-- 1. Membuat tabel untuk menyimpan data ukuran kertas
CREATE TABLE IF NOT EXISTS "paper_size" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nama_kertas" VARCHAR(100) NOT NULL,
    "satuan" VARCHAR(10) NOT NULL, -- Contoh: 'mm', 'cm', 'in'
    "panjang" NUMERIC(10, 2) NOT NULL, -- Contoh: 297.00
    "lebar" NUMERIC(10, 2) NOT NULL,   -- Contoh: 210.00
    -- 4 Margin dengan default 10.0
    "margin_atas" NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    "margin_bawah" NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    "margin_kiri" NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    "margin_kanan" NUMERIC(5, 2) NOT NULL DEFAULT 10.0,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "paper_size_nama_kertas_unique" UNIQUE ("nama_kertas")
);

-- 2. Tambahkan data standar
INSERT INTO "paper_size" ("nama_kertas", "satuan", "panjang", "lebar", "margin_atas", "margin_bawah", "margin_kiri", "margin_kanan") VALUES
('A4', 'mm', 297.00, 210.00, 20.00, 20.00, 20.00, 20.00),
('F4', 'mm', 330.00, 215.00, 20.00, 20.00, 20.00, 20.00),
('Letter', 'in', 11.00, 8.50, 0.75, 0.75, 0.75, 0.75)
ON CONFLICT DO NOTHING;