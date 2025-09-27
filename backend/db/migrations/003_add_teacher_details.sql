-- file: backend/db/migrations/003_add_teacher_details.sql

-- 1. Buat tipe ENUM kustom yang dibutuhkan jika belum ada.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jenis_kelamin_enum') THEN
        CREATE TYPE "jenis_kelamin_enum" AS ENUM ('Laki-laki', 'Perempuan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_guru_enum') THEN
        CREATE TYPE "status_guru_enum" AS ENUM ('Aktif', 'NonAktif', 'Pindah');
    END IF;
END$$;

-- 2. Ubah tabel 'teachers' yang ada
ALTER TABLE "teachers"
    RENAME COLUMN "nip" TO "nip_nuptk";
ALTER TABLE "teachers"
    RENAME COLUMN "nomor_telepon" TO "no_hp";
ALTER TABLE "teachers"
    RENAME COLUMN "alamat" TO "alamat_lengkap";

-- Tambahkan kolom-kolom baru
ALTER TABLE "teachers"
    ADD COLUMN "nama_panggilan" VARCHAR(100),
    ADD COLUMN "gelar_akademik" VARCHAR(100),
    ADD COLUMN "jenis_kelamin" jenis_kelamin_enum,
    ADD COLUMN "tempat_lahir" VARCHAR(100),
    ADD COLUMN "tanggal_lahir" DATE,
    ADD COLUMN "agama" VARCHAR(50),
    ADD COLUMN "kewarganegaraan" VARCHAR(50),
    ADD COLUMN "provinsi" VARCHAR(100),
    ADD COLUMN "kota_kabupaten" VARCHAR(100),
    ADD COLUMN "kecamatan" VARCHAR(100),
    ADD COLUMN "desa_kelurahan" VARCHAR(100),
    ADD COLUMN "kode_pos" VARCHAR(10),
    ADD COLUMN "status_guru" status_guru_enum DEFAULT 'Aktif';

-- 3. Ubah tipe data beberapa kolom jika diperlukan
ALTER TABLE "teachers"
    ALTER COLUMN "nip_nuptk" TYPE VARCHAR(30),
    ALTER COLUMN "no_hp" TYPE VARCHAR(20);