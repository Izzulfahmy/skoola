-- file: backend/db/migrations/002_add_school_profile.sql

CREATE TABLE IF NOT EXISTS profil_sekolah (
    id INT NOT NULL DEFAULT 1,
    npsn VARCHAR(10),
    nama_sekolah VARCHAR(255) NOT NULL,
    naungan VARCHAR(255),
    alamat TEXT,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(5),
    telepon VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    kepala_sekolah VARCHAR(255),
    jenjang_id INT,
    CONSTRAINT "profil_sekolah_pkey" PRIMARY KEY ("id")
);

-- Menambahkan satu baris data awal saat tabel ini pertama kali dibuat.
INSERT INTO profil_sekolah (id, nama_sekolah) 
VALUES (1, 'Nama Sekolah Anda')
ON CONFLICT (id) DO NOTHING;