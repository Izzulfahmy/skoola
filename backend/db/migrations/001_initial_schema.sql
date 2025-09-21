-- file: backend/db/migrations/001_initial_schema.sql

-- Membuat tabel users untuk menyimpan data login
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membuat tabel teachers yang terhubung dengan users
CREATE TABLE teachers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nama_lengkap VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    alamat TEXT,
    nomor_telepon VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HAPUS BAGIAN "CREATE TABLE students" DARI FILE INI