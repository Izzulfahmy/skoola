-- file: backend/db/migrations/006_enhance_students_table.sql

-- 1. Blok DO untuk membuat ENUM dihapus dari sini

-- 2. Hapus tabel students yang lama agar bisa dibuat ulang dengan struktur yang benar.
DROP TABLE IF EXISTS students;

-- 3. Buat ulang tabel 'students' dengan struktur yang lengkap dan profesional.
CREATE TABLE "students" (
    -- Kolom Identitas & Waktu
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ DEFAULT NOW(),

    -- Kolom Akademik & Status
    "nis" VARCHAR(30) UNIQUE,
    "nisn" VARCHAR(20) UNIQUE,
    "status_siswa" status_siswa_enum NOT NULL DEFAULT 'Aktif',

    -- Kolom Biodata Pribadi
    "nama_lengkap" VARCHAR(255) NOT NULL,
    "nama_panggilan" VARCHAR(100),
    "jenis_kelamin" jenis_kelamin_enum,
    "tempat_lahir" VARCHAR(100),
    "tanggal_lahir" DATE,
    "agama" agama_enum,
    "kewarganegaraan" VARCHAR(50) DEFAULT 'Indonesia',

    -- Kolom Alamat Lengkap
    "alamat_lengkap" TEXT,
    "desa_kelurahan" VARCHAR(100),
    "kecamatan" VARCHAR(100),
    "kota_kabupaten" VARCHAR(100),
    "provinsi" VARCHAR(100),
    "kode_pos" VARCHAR(10),

    -- Kolom Data Orang Tua / Wali
    "nama_ayah" VARCHAR(255),
    "nama_ibu" VARCHAR(255),
    "nama_wali" VARCHAR(255),
    "nomor_kontak_wali" VARCHAR(20)
);

-- 4. Tambahkan index untuk kolom yang sering dicari agar query lebih cepat
CREATE INDEX "idx_students_nama_lengkap" ON "students"("nama_lengkap");
CREATE INDEX "idx_students_status_siswa" ON "students"("status_siswa");