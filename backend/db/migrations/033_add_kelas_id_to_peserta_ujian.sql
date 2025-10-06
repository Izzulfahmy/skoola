-- Anggap ini adalah migrasi 033_add_kelas_id_to_peserta_ujian.sql
ALTER TABLE peserta_ujian ADD COLUMN kelas_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
-- Hapus DEFAULT setelah semua data lama diisi (jika ada)
ALTER TABLE peserta_ujian ALTER COLUMN kelas_id DROP DEFAULT;

-- Tambahkan foreign key untuk integritas data
ALTER TABLE peserta_ujian
ADD CONSTRAINT peserta_ujian_kelas_id_fkey
FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE NOT DEFERRABLE;