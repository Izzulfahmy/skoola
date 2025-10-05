-- +migrate Up
CREATE TABLE peserta_ujian (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ujian_master_id UUID NOT NULL REFERENCES ujian_master(id) ON DELETE CASCADE,
    anggota_kelas_id UUID NOT NULL REFERENCES anggota_kelas(id) ON DELETE CASCADE,
    urutan INTEGER NOT NULL,
    nomor_ujian VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_peserta_ujian UNIQUE (ujian_master_id, anggota_kelas_id)
);

