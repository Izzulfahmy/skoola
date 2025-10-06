-- file: backend/db/migrations/034_add_exam_rooms.sql

-- 1. Tabel Master Ruangan Fisik
CREATE TABLE "ruangan_ujian" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nama_ruangan" VARCHAR(100) NOT NULL,
    "kapasitas" INTEGER NOT NULL DEFAULT 0,
    -- Layout disimpan sebagai JSONB untuk fleksibilitas (mendukung Visual Seat Layout)
    "layout_metadata" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "ruangan_ujian_nama_unique" UNIQUE ("nama_ruangan")
);

-- 2. Tabel Alokasi Ruangan Ujian
-- Menghubungkan Paket Ujian (ujian_master) dengan Ruangan Fisik (ruangan_ujian)
CREATE TABLE "alokasi_ruangan_ujian" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ujian_master_id" UUID NOT NULL REFERENCES "ujian_master"(id) ON DELETE CASCADE,
    "ruangan_id" UUID NOT NULL REFERENCES "ruangan_ujian"(id) ON DELETE RESTRICT,
    "kode_ruangan" VARCHAR(20) NOT NULL, -- Kode unik yang digunakan di kartu ujian (misal: R1, R2)
    "jumlah_kursi_terpakai" INTEGER DEFAULT 0, -- Akan diisi saat alokasi kursi
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "alokasi_ruangan_ujian_unique" UNIQUE ("ujian_master_id", "ruangan_id"),
    -- Memastikan kode ruangan unik dalam satu paket ujian
    CONSTRAINT "alokasi_ruangan_kode_unique" UNIQUE ("ujian_master_id", "kode_ruangan")
);

-- 3. Mengubah tabel peserta_ujian untuk menyimpan hasil alokasi kursi
-- Ini penting untuk Fase 1 (Visual Layout) dan Fase 3 (Smart Distribution)
ALTER TABLE "peserta_ujian"
    ADD COLUMN "alokasi_ruangan_id" UUID REFERENCES "alokasi_ruangan_ujian"(id) ON DELETE SET NULL,
    ADD COLUMN "nomor_kursi" VARCHAR(10); -- Format Nomor Kursi (misal: A1, 01)

-- 4. Index
CREATE INDEX "idx_peserta_ujian_ruangan_kursi" ON "peserta_ujian" ("alokasi_ruangan_id", "nomor_kursi");
CREATE INDEX "idx_alokasi_ruangan_ujian_master" ON "alokasi_ruangan_ujian" ("ujian_master_id");