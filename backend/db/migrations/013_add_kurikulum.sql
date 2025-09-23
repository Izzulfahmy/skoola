-- file: backend/db/migrations/013_add_kurikulum.sql

-- 1. Membuat tabel master untuk kurikulum
CREATE TABLE IF NOT EXISTS "kurikulum" (
    "id" SERIAL PRIMARY KEY,
    "nama_kurikulum" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT
);

-- 2. Membuat tabel master untuk fase
CREATE TABLE IF NOT EXISTS "fase" (
    "id" SERIAL PRIMARY KEY,
    "nama_fase" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT
);

-- 3. MEMBUAT TABEL ASOSIASI BARU ANTARA TAHUN AJARAN DAN KURIKULUM
CREATE TABLE IF NOT EXISTS "tahun_ajaran_kurikulum" (
    "tahun_ajaran_id" UUID NOT NULL REFERENCES "tahun_ajaran"(id) ON DELETE CASCADE,
    "kurikulum_id" INTEGER NOT NULL REFERENCES "kurikulum"(id) ON DELETE CASCADE,
    CONSTRAINT "tahun_ajaran_kurikulum_pkey" PRIMARY KEY ("tahun_ajaran_id", "kurikulum_id")
);

-- 4. Membuat tabel pemetaan yang menghubungkan semuanya (tidak berubah)
CREATE TABLE IF NOT EXISTS "pemetaan_kurikulum" (
    "tahun_ajaran_id" UUID NOT NULL,
    "kurikulum_id" INTEGER NOT NULL,
    "tingkatan_id" INTEGER NOT NULL REFERENCES "tingkatan"(id) ON DELETE CASCADE,
    "fase_id" INTEGER NOT NULL REFERENCES "fase"(id) ON DELETE CASCADE,
    CONSTRAINT "pemetaan_kurikulum_pkey" PRIMARY KEY ("tahun_ajaran_id", "kurikulum_id", "tingkatan_id"),
    -- Menambahkan foreign key ke tabel asosiasi yang baru
    CONSTRAINT "pemetaan_kurikulum_fkey" FOREIGN KEY ("tahun_ajaran_id", "kurikulum_id") REFERENCES "tahun_ajaran_kurikulum"("tahun_ajaran_id", "kurikulum_id") ON DELETE CASCADE
);

-- 5. Menambahkan index untuk performa query
CREATE INDEX IF NOT EXISTS "idx_pemetaan_kurikulum_tahun_ajaran" ON "pemetaan_kurikulum"("tahun_ajaran_id");
CREATE INDEX IF NOT EXISTS "idx_pemetaan_kurikulum_kurikulum" ON "pemetaan_kurikulum"("kurikulum_id");
CREATE INDEX IF NOT EXISTS "idx_tahun_ajaran_kurikulum_keys" ON "tahun_ajaran_kurikulum"("tahun_ajaran_id", "kurikulum_id");