-- file: backend/db/migrations/014_add_rombel.sql

-- 1. Membuat tabel utama untuk Rombongan Belajar (Kelas)
CREATE TABLE IF NOT EXISTS "kelas" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nama_kelas" VARCHAR(100) NOT NULL,
    "tahun_ajaran_id" UUID NOT NULL REFERENCES "tahun_ajaran"(id) ON DELETE CASCADE,
    "tingkatan_id" INTEGER NOT NULL REFERENCES "tingkatan"(id) ON DELETE RESTRICT,
    "wali_kelas_id" UUID REFERENCES "teachers"(id) ON DELETE SET NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "kelas_nama_tahun_ajaran_unique" UNIQUE ("nama_kelas", "tahun_ajaran_id")
);

-- 2. Membuat tabel untuk anggota kelas (Siswa)
CREATE TABLE IF NOT EXISTS "anggota_kelas" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "kelas_id" UUID NOT NULL REFERENCES "kelas"(id) ON DELETE CASCADE,
    "student_id" UUID NOT NULL REFERENCES "students"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "anggota_kelas_kelas_student_unique" UNIQUE ("kelas_id", "student_id")
);

-- 3. Membuat tabel untuk guru pengajar di setiap kelas
CREATE TABLE IF NOT EXISTS "pengajar_kelas" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "kelas_id" UUID NOT NULL REFERENCES "kelas"(id) ON DELETE CASCADE,
    "teacher_id" UUID NOT NULL REFERENCES "teachers"(id) ON DELETE CASCADE,
    "mata_pelajaran_id" UUID NOT NULL REFERENCES "mata_pelajaran"(id) ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "pengajar_kelas_unique" UNIQUE ("kelas_id", "teacher_id", "mata_pelajaran_id")
);

-- 4. Menambahkan index untuk optimasi query
CREATE INDEX IF NOT EXISTS "idx_kelas_tahun_ajaran_id" ON "kelas"("tahun_ajaran_id");
CREATE INDEX IF NOT EXISTS "idx_anggota_kelas_kelas_id" ON "anggota_kelas"("kelas_id");
CREATE INDEX IF NOT EXISTS "idx_pengajar_kelas_kelas_id" ON "pengajar_kelas"("kelas_id");