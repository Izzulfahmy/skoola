-- file: backend/db/migrations/029_add_extracurricular_sessions.sql

-- Tabel ini menyimpan sesi ekstrakurikuler untuk setiap tahun ajaran.
CREATE TABLE IF NOT EXISTS "ekstrakurikuler_sesi" (
    "id" SERIAL PRIMARY KEY,
    "ekstrakurikuler_id" INT NOT NULL,
    "tahun_ajaran_id" UUID NOT NULL, -- FIX: Diubah dari INT menjadi UUID
    "pembina_id" UUID,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT "fk_ekstrakurikuler" FOREIGN KEY("ekstrakurikuler_id") REFERENCES "ekstrakurikuler"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_tahun_ajaran" FOREIGN KEY("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE, -- Sekarang tipe datanya cocok
    CONSTRAINT "fk_pembina" FOREIGN KEY("pembina_id") REFERENCES "teachers"("id") ON DELETE SET NULL,

    -- Constraint unik
    CONSTRAINT "unique_ekskul_tahun_ajaran" UNIQUE ("ekstrakurikuler_id", "tahun_ajaran_id")
);

-- Tabel ini menyimpan daftar siswa yang menjadi anggota dari sebuah sesi ekstrakurikuler.
CREATE TABLE IF NOT EXISTS "ekstrakurikuler_anggota" (
    "id" SERIAL PRIMARY KEY,
    "sesi_id" INT NOT NULL,
    "student_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT "fk_sesi" FOREIGN KEY("sesi_id") REFERENCES "ekstrakurikuler_sesi"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_student" FOREIGN KEY("student_id") REFERENCES "students"("id") ON DELETE CASCADE,

    -- Constraint unik
    CONSTRAINT "unique_sesi_student" UNIQUE ("sesi_id", "student_id")
);

-- Index untuk mempercepat query
CREATE INDEX IF NOT EXISTS "idx_ekstrakurikuler_sesi_tahun_ajaran" ON "ekstrakurikuler_sesi"("tahun_ajaran_id");
CREATE INDEX IF NOT EXISTS "idx_ekstrakurikuler_anggota_sesi" ON "ekstrakurikuler_anggota"("sesi_id");