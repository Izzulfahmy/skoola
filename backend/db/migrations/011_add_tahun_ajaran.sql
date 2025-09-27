-- file: backend/db/migrations/011_add_tahun_ajaran.sql

-- 1. Blok DO untuk membuat ENUM dihapus dari sini

-- 2. Buat tabel 'tahun_ajaran'
CREATE TABLE IF NOT EXISTS "tahun_ajaran" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nama_tahun_ajaran" VARCHAR(50) NOT NULL,
    "semester" semester_enum NOT NULL,
    "status" status_ajaran_enum NOT NULL DEFAULT 'Tidak Aktif',
    "metode_absensi" metode_absensi_enum NOT NULL DEFAULT 'HARIAN',
    "kepala_sekolah_id" UUID REFERENCES teachers(id) ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "tahun_ajaran_nama_semester_unique" UNIQUE ("nama_tahun_ajaran", "semester")
);

-- 3. Tambahkan index untuk foreign key
CREATE INDEX IF NOT EXISTS "idx_tahun_ajaran_kepala_sekolah_id" ON "tahun_ajaran"("kepala_sekolah_id");