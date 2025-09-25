-- file: backend/db/migrations/017_add_parent_to_mapel.sql

-- 1. Tambahkan kolom parent_id ke tabel mata_pelajaran
ALTER TABLE "mata_pelajaran"
ADD COLUMN "parent_id" UUID REFERENCES "mata_pelajaran"(id) ON DELETE SET NULL;

-- 2. Tambahkan index pada kolom parent_id untuk optimasi query
CREATE INDEX IF NOT EXISTS "idx_mata_pelajaran_parent_id" ON "mata_pelajaran"("parent_id");