--
-- PostgreSQL database dump
--

\restrict UOqSBfZHnTHeNWKvFKOWTZ8NJU4jNgd0K5i9U3aVgxtMdW5Z4MFTfzvochzTWs7

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: 20554021; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "20554021";


ALTER SCHEMA "20554021" OWNER TO postgres;

--
-- Name: 20554022; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA "20554022";


ALTER SCHEMA "20554022" OWNER TO postgres;

--
-- Name: agama_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".agama_enum AS ENUM (
    'Islam',
    'Kristen Protestan',
    'Kristen Katolik',
    'Hindu',
    'Buddha',
    'Khonghucu',
    'Lainnya'
);


ALTER TYPE "20554021".agama_enum OWNER TO postgres;

--
-- Name: jenis_kelamin_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".jenis_kelamin_enum AS ENUM (
    'Laki-laki',
    'Perempuan'
);


ALTER TYPE "20554021".jenis_kelamin_enum OWNER TO postgres;

--
-- Name: metode_absensi_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".metode_absensi_enum AS ENUM (
    'HARIAN',
    'PER_JAM_PELAJARAN'
);


ALTER TYPE "20554021".metode_absensi_enum OWNER TO postgres;

--
-- Name: peringkat_kejuaraan_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".peringkat_kejuaraan_enum AS ENUM (
    'Juara 1',
    'Juara 2',
    'Juara 3',
    'Harapan 1',
    'Harapan 2',
    'Harapan 3'
);


ALTER TYPE "20554021".peringkat_kejuaraan_enum OWNER TO postgres;

--
-- Name: semester_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".semester_enum AS ENUM (
    'Ganjil',
    'Genap'
);


ALTER TYPE "20554021".semester_enum OWNER TO postgres;

--
-- Name: status_ajaran_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".status_ajaran_enum AS ENUM (
    'Aktif',
    'Tidak Aktif'
);


ALTER TYPE "20554021".status_ajaran_enum OWNER TO postgres;

--
-- Name: status_kepegawaian_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".status_kepegawaian_enum AS ENUM (
    'Aktif',
    'Cuti',
    'Pindah',
    'Berhenti',
    'Pensiun'
);


ALTER TYPE "20554021".status_kepegawaian_enum OWNER TO postgres;

--
-- Name: status_presensi_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".status_presensi_enum AS ENUM (
    'H',
    'S',
    'I',
    'A'
);


ALTER TYPE "20554021".status_presensi_enum OWNER TO postgres;

--
-- Name: status_siswa_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".status_siswa_enum AS ENUM (
    'Aktif',
    'Lulus',
    'Pindah',
    'Keluar'
);


ALTER TYPE "20554021".status_siswa_enum OWNER TO postgres;

--
-- Name: tingkat_kejuaraan_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".tingkat_kejuaraan_enum AS ENUM (
    'Sekolah',
    'Desa/Kelurahan',
    'Kecamatan',
    'Kabupaten/Kota',
    'Provinsi',
    'Nasional',
    'Internasional'
);


ALTER TYPE "20554021".tingkat_kejuaraan_enum OWNER TO postgres;

--
-- Name: agama_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".agama_enum AS ENUM (
    'Islam',
    'Kristen Protestan',
    'Kristen Katolik',
    'Hindu',
    'Buddha',
    'Khonghucu',
    'Lainnya'
);


ALTER TYPE "20554022".agama_enum OWNER TO postgres;

--
-- Name: jenis_kelamin_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".jenis_kelamin_enum AS ENUM (
    'Laki-laki',
    'Perempuan'
);


ALTER TYPE "20554022".jenis_kelamin_enum OWNER TO postgres;

--
-- Name: metode_absensi_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".metode_absensi_enum AS ENUM (
    'HARIAN',
    'PER_JAM_PELAJARAN'
);


ALTER TYPE "20554022".metode_absensi_enum OWNER TO postgres;

--
-- Name: peringkat_kejuaraan_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".peringkat_kejuaraan_enum AS ENUM (
    'Juara 1',
    'Juara 2',
    'Juara 3',
    'Harapan 1',
    'Harapan 2',
    'Harapan 3'
);


ALTER TYPE "20554022".peringkat_kejuaraan_enum OWNER TO postgres;

--
-- Name: semester_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".semester_enum AS ENUM (
    'Ganjil',
    'Genap'
);


ALTER TYPE "20554022".semester_enum OWNER TO postgres;

--
-- Name: status_ajaran_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".status_ajaran_enum AS ENUM (
    'Aktif',
    'Tidak Aktif'
);


ALTER TYPE "20554022".status_ajaran_enum OWNER TO postgres;

--
-- Name: status_kepegawaian_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".status_kepegawaian_enum AS ENUM (
    'Aktif',
    'Cuti',
    'Pindah',
    'Berhenti',
    'Pensiun'
);


ALTER TYPE "20554022".status_kepegawaian_enum OWNER TO postgres;

--
-- Name: status_presensi_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".status_presensi_enum AS ENUM (
    'H',
    'S',
    'I',
    'A'
);


ALTER TYPE "20554022".status_presensi_enum OWNER TO postgres;

--
-- Name: status_siswa_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".status_siswa_enum AS ENUM (
    'Aktif',
    'Lulus',
    'Pindah',
    'Keluar'
);


ALTER TYPE "20554022".status_siswa_enum OWNER TO postgres;

--
-- Name: tingkat_kejuaraan_enum; Type: TYPE; Schema: 20554022; Owner: postgres
--

CREATE TYPE "20554022".tingkat_kejuaraan_enum AS ENUM (
    'Sekolah',
    'Desa/Kelurahan',
    'Kecamatan',
    'Kabupaten/Kota',
    'Provinsi',
    'Nasional',
    'Internasional'
);


ALTER TYPE "20554022".tingkat_kejuaraan_enum OWNER TO postgres;

--
-- Name: status_presensi_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_presensi_enum AS ENUM (
    'H',
    'S',
    'I',
    'A'
);


ALTER TYPE public.status_presensi_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: anggota_kelas; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".anggota_kelas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kelas_id uuid NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    urutan integer DEFAULT 0
);


ALTER TABLE "20554021".anggota_kelas OWNER TO postgres;

--
-- Name: ekstrakurikuler; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".ekstrakurikuler (
    id integer NOT NULL,
    nama_kegiatan character varying(255) NOT NULL,
    deskripsi text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".ekstrakurikuler OWNER TO postgres;

--
-- Name: ekstrakurikuler_anggota; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".ekstrakurikuler_anggota (
    id integer NOT NULL,
    sesi_id integer NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".ekstrakurikuler_anggota OWNER TO postgres;

--
-- Name: ekstrakurikuler_anggota_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".ekstrakurikuler_anggota_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".ekstrakurikuler_anggota_id_seq OWNER TO postgres;

--
-- Name: ekstrakurikuler_anggota_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".ekstrakurikuler_anggota_id_seq OWNED BY "20554021".ekstrakurikuler_anggota.id;


--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".ekstrakurikuler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".ekstrakurikuler_id_seq OWNER TO postgres;

--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".ekstrakurikuler_id_seq OWNED BY "20554021".ekstrakurikuler.id;


--
-- Name: ekstrakurikuler_sesi; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".ekstrakurikuler_sesi (
    id integer NOT NULL,
    ekstrakurikuler_id integer NOT NULL,
    tahun_ajaran_id uuid NOT NULL,
    pembina_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".ekstrakurikuler_sesi OWNER TO postgres;

--
-- Name: ekstrakurikuler_sesi_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".ekstrakurikuler_sesi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".ekstrakurikuler_sesi_id_seq OWNER TO postgres;

--
-- Name: ekstrakurikuler_sesi_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".ekstrakurikuler_sesi_id_seq OWNED BY "20554021".ekstrakurikuler_sesi.id;


--
-- Name: fase; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".fase (
    id integer NOT NULL,
    nama_fase character varying(100) NOT NULL,
    deskripsi text
);


ALTER TABLE "20554021".fase OWNER TO postgres;

--
-- Name: fase_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".fase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".fase_id_seq OWNER TO postgres;

--
-- Name: fase_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".fase_id_seq OWNED BY "20554021".fase.id;


--
-- Name: jabatan; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".jabatan (
    id integer NOT NULL,
    nama_jabatan character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".jabatan OWNER TO postgres;

--
-- Name: jabatan_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".jabatan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".jabatan_id_seq OWNER TO postgres;

--
-- Name: jabatan_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".jabatan_id_seq OWNED BY "20554021".jabatan.id;


--
-- Name: jenis_ujian; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".jenis_ujian (
    id integer NOT NULL,
    kode_ujian character varying(20) NOT NULL,
    nama_ujian character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".jenis_ujian OWNER TO postgres;

--
-- Name: jenis_ujian_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".jenis_ujian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".jenis_ujian_id_seq OWNER TO postgres;

--
-- Name: jenis_ujian_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".jenis_ujian_id_seq OWNED BY "20554021".jenis_ujian.id;


--
-- Name: jenjang_pendidikan; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".jenjang_pendidikan (
    id integer NOT NULL,
    nama_jenjang character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".jenjang_pendidikan OWNER TO postgres;

--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".jenjang_pendidikan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".jenjang_pendidikan_id_seq OWNER TO postgres;

--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".jenjang_pendidikan_id_seq OWNED BY "20554021".jenjang_pendidikan.id;


--
-- Name: kelas; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".kelas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_kelas character varying(100) NOT NULL,
    tahun_ajaran_id uuid NOT NULL,
    tingkatan_id integer NOT NULL,
    wali_kelas_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".kelas OWNER TO postgres;

--
-- Name: kelompok_mata_pelajaran; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".kelompok_mata_pelajaran (
    id integer NOT NULL,
    nama_kelompok character varying(100) NOT NULL,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".kelompok_mata_pelajaran OWNER TO postgres;

--
-- Name: kelompok_mata_pelajaran_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".kelompok_mata_pelajaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".kelompok_mata_pelajaran_id_seq OWNER TO postgres;

--
-- Name: kelompok_mata_pelajaran_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".kelompok_mata_pelajaran_id_seq OWNED BY "20554021".kelompok_mata_pelajaran.id;


--
-- Name: kurikulum; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".kurikulum (
    id integer NOT NULL,
    nama_kurikulum character varying(100) NOT NULL,
    deskripsi text
);


ALTER TABLE "20554021".kurikulum OWNER TO postgres;

--
-- Name: kurikulum_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".kurikulum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".kurikulum_id_seq OWNER TO postgres;

--
-- Name: kurikulum_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".kurikulum_id_seq OWNED BY "20554021".kurikulum.id;


--
-- Name: mata_pelajaran; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".mata_pelajaran (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kode_mapel character varying(20) NOT NULL,
    nama_mapel character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    parent_id uuid,
    urutan integer DEFAULT 0,
    kelompok_id integer
);


ALTER TABLE "20554021".mata_pelajaran OWNER TO postgres;

--
-- Name: materi_pembelajaran; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".materi_pembelajaran (
    id integer NOT NULL,
    pengajar_kelas_id uuid NOT NULL,
    nama_materi character varying(255) NOT NULL,
    deskripsi text,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".materi_pembelajaran OWNER TO postgres;

--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".materi_pembelajaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".materi_pembelajaran_id_seq OWNER TO postgres;

--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".materi_pembelajaran_id_seq OWNED BY "20554021".materi_pembelajaran.id;


--
-- Name: nilai_sumatif_siswa; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".nilai_sumatif_siswa (
    id integer NOT NULL,
    penilaian_sumatif_id uuid NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    nilai numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".nilai_sumatif_siswa OWNER TO postgres;

--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".nilai_sumatif_siswa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".nilai_sumatif_siswa_id_seq OWNER TO postgres;

--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".nilai_sumatif_siswa_id_seq OWNED BY "20554021".nilai_sumatif_siswa.id;


--
-- Name: pemetaan_kurikulum; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".pemetaan_kurikulum (
    tahun_ajaran_id uuid NOT NULL,
    kurikulum_id integer NOT NULL,
    tingkatan_id integer NOT NULL,
    fase_id integer NOT NULL
);


ALTER TABLE "20554021".pemetaan_kurikulum OWNER TO postgres;

--
-- Name: pengajar_kelas; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".pengajar_kelas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kelas_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    mata_pelajaran_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".pengajar_kelas OWNER TO postgres;

--
-- Name: penilaian; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".penilaian (
    id integer NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    tujuan_pembelajaran_id integer NOT NULL,
    nilai numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".penilaian OWNER TO postgres;

--
-- Name: penilaian_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".penilaian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".penilaian_id_seq OWNER TO postgres;

--
-- Name: penilaian_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".penilaian_id_seq OWNED BY "20554021".penilaian.id;


--
-- Name: penilaian_sumatif; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".penilaian_sumatif (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tujuan_pembelajaran_id integer,
    jenis_ujian_id integer NOT NULL,
    nama_penilaian character varying(255) NOT NULL,
    tanggal_pelaksanaan date,
    keterangan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ujian_id integer,
    CONSTRAINT check_penilaian_parent CHECK ((((tujuan_pembelajaran_id IS NOT NULL) AND (ujian_id IS NULL)) OR ((tujuan_pembelajaran_id IS NULL) AND (ujian_id IS NOT NULL))))
);


ALTER TABLE "20554021".penilaian_sumatif OWNER TO postgres;

--
-- Name: presensi; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".presensi (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    tanggal date NOT NULL,
    status public.status_presensi_enum NOT NULL,
    catatan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".presensi OWNER TO postgres;

--
-- Name: prestasi_siswa; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".prestasi_siswa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tahun_ajaran_id uuid NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    nama_prestasi character varying(255) NOT NULL,
    tingkat "20554021".tingkat_kejuaraan_enum NOT NULL,
    peringkat "20554021".peringkat_kejuaraan_enum NOT NULL,
    tanggal date NOT NULL,
    deskripsi text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".prestasi_siswa OWNER TO postgres;

--
-- Name: profil_sekolah; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".profil_sekolah (
    id integer DEFAULT 1 NOT NULL,
    npsn character varying(10),
    nama_sekolah character varying(255) NOT NULL,
    naungan character varying(255),
    alamat text,
    kelurahan character varying(100),
    kecamatan character varying(100),
    kota_kabupaten character varying(100),
    provinsi character varying(100),
    kode_pos character varying(5),
    telepon character varying(20),
    email character varying(255),
    website character varying(255),
    kepala_sekolah character varying(255),
    jenjang_id integer
);


ALTER TABLE "20554021".profil_sekolah OWNER TO postgres;

--
-- Name: riwayat_akademik; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".riwayat_akademik (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    status "20554021".status_siswa_enum NOT NULL,
    tanggal_kejadian date DEFAULT CURRENT_DATE NOT NULL,
    kelas_tingkat character varying(50),
    keterangan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".riwayat_akademik OWNER TO postgres;

--
-- Name: riwayat_kepegawaian; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".riwayat_kepegawaian (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    status "20554021".status_kepegawaian_enum NOT NULL,
    tanggal_mulai date NOT NULL,
    tanggal_selesai date,
    keterangan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".riwayat_kepegawaian OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    nis character varying(30),
    nisn character varying(20),
    nama_lengkap character varying(255) NOT NULL,
    nama_panggilan character varying(100),
    jenis_kelamin "20554021".jenis_kelamin_enum,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    agama "20554021".agama_enum,
    kewarganegaraan character varying(50) DEFAULT 'Indonesia'::character varying,
    alamat_lengkap text,
    desa_kelurahan character varying(100),
    kecamatan character varying(100),
    kota_kabupaten character varying(100),
    provinsi character varying(100),
    kode_pos character varying(10),
    nama_ayah character varying(255),
    nama_ibu character varying(255),
    nama_wali character varying(255),
    nomor_kontak_wali character varying(20),
    pekerjaan_ayah character varying(100),
    alamat_ayah text,
    pekerjaan_ibu character varying(100),
    alamat_ibu text,
    pekerjaan_wali character varying(100),
    alamat_wali text
);


ALTER TABLE "20554021".students OWNER TO postgres;

--
-- Name: tahun_ajaran; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".tahun_ajaran (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_tahun_ajaran character varying(50) NOT NULL,
    semester "20554021".semester_enum NOT NULL,
    status "20554021".status_ajaran_enum DEFAULT 'Tidak Aktif'::"20554021".status_ajaran_enum NOT NULL,
    metode_absensi "20554021".metode_absensi_enum DEFAULT 'HARIAN'::"20554021".metode_absensi_enum NOT NULL,
    kepala_sekolah_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".tahun_ajaran OWNER TO postgres;

--
-- Name: tahun_ajaran_kurikulum; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".tahun_ajaran_kurikulum (
    tahun_ajaran_id uuid NOT NULL,
    kurikulum_id integer NOT NULL
);


ALTER TABLE "20554021".tahun_ajaran_kurikulum OWNER TO postgres;

--
-- Name: teachers; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".teachers (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    nama_lengkap character varying(255) NOT NULL,
    nip_nuptk character varying(30),
    alamat_lengkap text,
    no_hp character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    nama_panggilan character varying(100),
    gelar_akademik character varying(100),
    jenis_kelamin "20554021".jenis_kelamin_enum,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    agama character varying(50),
    kewarganegaraan character varying(50),
    provinsi character varying(100),
    kota_kabupaten character varying(100),
    kecamatan character varying(100),
    desa_kelurahan character varying(100),
    kode_pos character varying(10)
);


ALTER TABLE "20554021".teachers OWNER TO postgres;

--
-- Name: tingkatan; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".tingkatan (
    id integer NOT NULL,
    nama_tingkatan character varying(100) NOT NULL,
    urutan integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".tingkatan OWNER TO postgres;

--
-- Name: tingkatan_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".tingkatan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".tingkatan_id_seq OWNER TO postgres;

--
-- Name: tingkatan_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".tingkatan_id_seq OWNED BY "20554021".tingkatan.id;


--
-- Name: tujuan_pembelajaran; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".tujuan_pembelajaran (
    id integer NOT NULL,
    materi_pembelajaran_id integer NOT NULL,
    deskripsi_tujuan text NOT NULL,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".tujuan_pembelajaran OWNER TO postgres;

--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".tujuan_pembelajaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".tujuan_pembelajaran_id_seq OWNER TO postgres;

--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".tujuan_pembelajaran_id_seq OWNED BY "20554021".tujuan_pembelajaran.id;


--
-- Name: ujian; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".ujian (
    id integer NOT NULL,
    pengajar_kelas_id uuid NOT NULL,
    nama_ujian character varying(255) NOT NULL,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".ujian OWNER TO postgres;

--
-- Name: ujian_id_seq; Type: SEQUENCE; Schema: 20554021; Owner: postgres
--

CREATE SEQUENCE "20554021".ujian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554021".ujian_id_seq OWNER TO postgres;

--
-- Name: ujian_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554021; Owner: postgres
--

ALTER SEQUENCE "20554021".ujian_id_seq OWNED BY "20554021".ujian.id;


--
-- Name: users; Type: TABLE; Schema: 20554021; Owner: postgres
--

CREATE TABLE "20554021".users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".users OWNER TO postgres;

--
-- Name: anggota_kelas; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".anggota_kelas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kelas_id uuid NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    urutan integer DEFAULT 0
);


ALTER TABLE "20554022".anggota_kelas OWNER TO postgres;

--
-- Name: ekstrakurikuler; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".ekstrakurikuler (
    id integer NOT NULL,
    nama_kegiatan character varying(255) NOT NULL,
    deskripsi text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".ekstrakurikuler OWNER TO postgres;

--
-- Name: ekstrakurikuler_anggota; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".ekstrakurikuler_anggota (
    id integer NOT NULL,
    sesi_id integer NOT NULL,
    student_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".ekstrakurikuler_anggota OWNER TO postgres;

--
-- Name: ekstrakurikuler_anggota_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".ekstrakurikuler_anggota_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".ekstrakurikuler_anggota_id_seq OWNER TO postgres;

--
-- Name: ekstrakurikuler_anggota_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".ekstrakurikuler_anggota_id_seq OWNED BY "20554022".ekstrakurikuler_anggota.id;


--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".ekstrakurikuler_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".ekstrakurikuler_id_seq OWNER TO postgres;

--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".ekstrakurikuler_id_seq OWNED BY "20554022".ekstrakurikuler.id;


--
-- Name: ekstrakurikuler_sesi; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".ekstrakurikuler_sesi (
    id integer NOT NULL,
    ekstrakurikuler_id integer NOT NULL,
    tahun_ajaran_id uuid NOT NULL,
    pembina_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".ekstrakurikuler_sesi OWNER TO postgres;

--
-- Name: ekstrakurikuler_sesi_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".ekstrakurikuler_sesi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".ekstrakurikuler_sesi_id_seq OWNER TO postgres;

--
-- Name: ekstrakurikuler_sesi_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".ekstrakurikuler_sesi_id_seq OWNED BY "20554022".ekstrakurikuler_sesi.id;


--
-- Name: fase; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".fase (
    id integer NOT NULL,
    nama_fase character varying(100) NOT NULL,
    deskripsi text
);


ALTER TABLE "20554022".fase OWNER TO postgres;

--
-- Name: fase_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".fase_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".fase_id_seq OWNER TO postgres;

--
-- Name: fase_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".fase_id_seq OWNED BY "20554022".fase.id;


--
-- Name: jabatan; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".jabatan (
    id integer NOT NULL,
    nama_jabatan character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".jabatan OWNER TO postgres;

--
-- Name: jabatan_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".jabatan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".jabatan_id_seq OWNER TO postgres;

--
-- Name: jabatan_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".jabatan_id_seq OWNED BY "20554022".jabatan.id;


--
-- Name: jenis_ujian; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".jenis_ujian (
    id integer NOT NULL,
    kode_ujian character varying(20) NOT NULL,
    nama_ujian character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".jenis_ujian OWNER TO postgres;

--
-- Name: jenis_ujian_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".jenis_ujian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".jenis_ujian_id_seq OWNER TO postgres;

--
-- Name: jenis_ujian_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".jenis_ujian_id_seq OWNED BY "20554022".jenis_ujian.id;


--
-- Name: jenjang_pendidikan; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".jenjang_pendidikan (
    id integer NOT NULL,
    nama_jenjang character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".jenjang_pendidikan OWNER TO postgres;

--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".jenjang_pendidikan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".jenjang_pendidikan_id_seq OWNER TO postgres;

--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".jenjang_pendidikan_id_seq OWNED BY "20554022".jenjang_pendidikan.id;


--
-- Name: kelas; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".kelas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_kelas character varying(100) NOT NULL,
    tahun_ajaran_id uuid NOT NULL,
    tingkatan_id integer NOT NULL,
    wali_kelas_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".kelas OWNER TO postgres;

--
-- Name: kelompok_mata_pelajaran; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".kelompok_mata_pelajaran (
    id integer NOT NULL,
    nama_kelompok character varying(100) NOT NULL,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".kelompok_mata_pelajaran OWNER TO postgres;

--
-- Name: kelompok_mata_pelajaran_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".kelompok_mata_pelajaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".kelompok_mata_pelajaran_id_seq OWNER TO postgres;

--
-- Name: kelompok_mata_pelajaran_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".kelompok_mata_pelajaran_id_seq OWNED BY "20554022".kelompok_mata_pelajaran.id;


--
-- Name: kurikulum; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".kurikulum (
    id integer NOT NULL,
    nama_kurikulum character varying(100) NOT NULL,
    deskripsi text
);


ALTER TABLE "20554022".kurikulum OWNER TO postgres;

--
-- Name: kurikulum_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".kurikulum_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".kurikulum_id_seq OWNER TO postgres;

--
-- Name: kurikulum_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".kurikulum_id_seq OWNED BY "20554022".kurikulum.id;


--
-- Name: mata_pelajaran; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".mata_pelajaran (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kode_mapel character varying(20) NOT NULL,
    nama_mapel character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    parent_id uuid,
    urutan integer DEFAULT 0,
    kelompok_id integer
);


ALTER TABLE "20554022".mata_pelajaran OWNER TO postgres;

--
-- Name: materi_pembelajaran; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".materi_pembelajaran (
    id integer NOT NULL,
    pengajar_kelas_id uuid NOT NULL,
    nama_materi character varying(255) NOT NULL,
    deskripsi text,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".materi_pembelajaran OWNER TO postgres;

--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".materi_pembelajaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".materi_pembelajaran_id_seq OWNER TO postgres;

--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".materi_pembelajaran_id_seq OWNED BY "20554022".materi_pembelajaran.id;


--
-- Name: nilai_sumatif_siswa; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".nilai_sumatif_siswa (
    id integer NOT NULL,
    penilaian_sumatif_id uuid NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    nilai numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".nilai_sumatif_siswa OWNER TO postgres;

--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".nilai_sumatif_siswa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".nilai_sumatif_siswa_id_seq OWNER TO postgres;

--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".nilai_sumatif_siswa_id_seq OWNED BY "20554022".nilai_sumatif_siswa.id;


--
-- Name: pemetaan_kurikulum; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".pemetaan_kurikulum (
    tahun_ajaran_id uuid NOT NULL,
    kurikulum_id integer NOT NULL,
    tingkatan_id integer NOT NULL,
    fase_id integer NOT NULL
);


ALTER TABLE "20554022".pemetaan_kurikulum OWNER TO postgres;

--
-- Name: pengajar_kelas; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".pengajar_kelas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    kelas_id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    mata_pelajaran_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".pengajar_kelas OWNER TO postgres;

--
-- Name: penilaian; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".penilaian (
    id integer NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    tujuan_pembelajaran_id integer NOT NULL,
    nilai numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".penilaian OWNER TO postgres;

--
-- Name: penilaian_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".penilaian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".penilaian_id_seq OWNER TO postgres;

--
-- Name: penilaian_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".penilaian_id_seq OWNED BY "20554022".penilaian.id;


--
-- Name: penilaian_sumatif; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".penilaian_sumatif (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tujuan_pembelajaran_id integer,
    jenis_ujian_id integer NOT NULL,
    nama_penilaian character varying(255) NOT NULL,
    tanggal_pelaksanaan date,
    keterangan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ujian_id integer,
    CONSTRAINT check_penilaian_parent CHECK ((((tujuan_pembelajaran_id IS NOT NULL) AND (ujian_id IS NULL)) OR ((tujuan_pembelajaran_id IS NULL) AND (ujian_id IS NOT NULL))))
);


ALTER TABLE "20554022".penilaian_sumatif OWNER TO postgres;

--
-- Name: presensi; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".presensi (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    tanggal date NOT NULL,
    status public.status_presensi_enum NOT NULL,
    catatan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".presensi OWNER TO postgres;

--
-- Name: prestasi_siswa; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".prestasi_siswa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tahun_ajaran_id uuid NOT NULL,
    anggota_kelas_id uuid NOT NULL,
    nama_prestasi character varying(255) NOT NULL,
    tingkat "20554022".tingkat_kejuaraan_enum NOT NULL,
    peringkat "20554022".peringkat_kejuaraan_enum NOT NULL,
    tanggal date NOT NULL,
    deskripsi text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".prestasi_siswa OWNER TO postgres;

--
-- Name: profil_sekolah; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".profil_sekolah (
    id integer DEFAULT 1 NOT NULL,
    npsn character varying(10),
    nama_sekolah character varying(255) NOT NULL,
    naungan character varying(255),
    alamat text,
    kelurahan character varying(100),
    kecamatan character varying(100),
    kota_kabupaten character varying(100),
    provinsi character varying(100),
    kode_pos character varying(5),
    telepon character varying(20),
    email character varying(255),
    website character varying(255),
    kepala_sekolah character varying(255),
    jenjang_id integer
);


ALTER TABLE "20554022".profil_sekolah OWNER TO postgres;

--
-- Name: riwayat_akademik; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".riwayat_akademik (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    status "20554022".status_siswa_enum NOT NULL,
    tanggal_kejadian date DEFAULT CURRENT_DATE NOT NULL,
    kelas_tingkat character varying(50),
    keterangan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".riwayat_akademik OWNER TO postgres;

--
-- Name: riwayat_kepegawaian; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".riwayat_kepegawaian (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    status "20554022".status_kepegawaian_enum NOT NULL,
    tanggal_mulai date NOT NULL,
    tanggal_selesai date,
    keterangan text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".riwayat_kepegawaian OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    nis character varying(30),
    nisn character varying(20),
    nama_lengkap character varying(255) NOT NULL,
    nama_panggilan character varying(100),
    jenis_kelamin "20554022".jenis_kelamin_enum,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    agama "20554022".agama_enum,
    kewarganegaraan character varying(50) DEFAULT 'Indonesia'::character varying,
    alamat_lengkap text,
    desa_kelurahan character varying(100),
    kecamatan character varying(100),
    kota_kabupaten character varying(100),
    provinsi character varying(100),
    kode_pos character varying(10),
    nama_ayah character varying(255),
    nama_ibu character varying(255),
    nama_wali character varying(255),
    nomor_kontak_wali character varying(20),
    pekerjaan_ayah character varying(100),
    alamat_ayah text,
    pekerjaan_ibu character varying(100),
    alamat_ibu text,
    pekerjaan_wali character varying(100),
    alamat_wali text
);


ALTER TABLE "20554022".students OWNER TO postgres;

--
-- Name: tahun_ajaran; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".tahun_ajaran (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_tahun_ajaran character varying(50) NOT NULL,
    semester "20554022".semester_enum NOT NULL,
    status "20554022".status_ajaran_enum DEFAULT 'Tidak Aktif'::"20554022".status_ajaran_enum NOT NULL,
    metode_absensi "20554022".metode_absensi_enum DEFAULT 'HARIAN'::"20554022".metode_absensi_enum NOT NULL,
    kepala_sekolah_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".tahun_ajaran OWNER TO postgres;

--
-- Name: tahun_ajaran_kurikulum; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".tahun_ajaran_kurikulum (
    tahun_ajaran_id uuid NOT NULL,
    kurikulum_id integer NOT NULL
);


ALTER TABLE "20554022".tahun_ajaran_kurikulum OWNER TO postgres;

--
-- Name: teachers; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".teachers (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    nama_lengkap character varying(255) NOT NULL,
    nip_nuptk character varying(30),
    alamat_lengkap text,
    no_hp character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    nama_panggilan character varying(100),
    gelar_akademik character varying(100),
    jenis_kelamin "20554022".jenis_kelamin_enum,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    agama character varying(50),
    kewarganegaraan character varying(50),
    provinsi character varying(100),
    kota_kabupaten character varying(100),
    kecamatan character varying(100),
    desa_kelurahan character varying(100),
    kode_pos character varying(10)
);


ALTER TABLE "20554022".teachers OWNER TO postgres;

--
-- Name: tingkatan; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".tingkatan (
    id integer NOT NULL,
    nama_tingkatan character varying(100) NOT NULL,
    urutan integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".tingkatan OWNER TO postgres;

--
-- Name: tingkatan_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".tingkatan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".tingkatan_id_seq OWNER TO postgres;

--
-- Name: tingkatan_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".tingkatan_id_seq OWNED BY "20554022".tingkatan.id;


--
-- Name: tujuan_pembelajaran; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".tujuan_pembelajaran (
    id integer NOT NULL,
    materi_pembelajaran_id integer NOT NULL,
    deskripsi_tujuan text NOT NULL,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".tujuan_pembelajaran OWNER TO postgres;

--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".tujuan_pembelajaran_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".tujuan_pembelajaran_id_seq OWNER TO postgres;

--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".tujuan_pembelajaran_id_seq OWNED BY "20554022".tujuan_pembelajaran.id;


--
-- Name: ujian; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".ujian (
    id integer NOT NULL,
    pengajar_kelas_id uuid NOT NULL,
    nama_ujian character varying(255) NOT NULL,
    urutan integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".ujian OWNER TO postgres;

--
-- Name: ujian_id_seq; Type: SEQUENCE; Schema: 20554022; Owner: postgres
--

CREATE SEQUENCE "20554022".ujian_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "20554022".ujian_id_seq OWNER TO postgres;

--
-- Name: ujian_id_seq; Type: SEQUENCE OWNED BY; Schema: 20554022; Owner: postgres
--

ALTER SEQUENCE "20554022".ujian_id_seq OWNED BY "20554022".ujian.id;


--
-- Name: users; Type: TABLE; Schema: 20554022; Owner: postgres
--

CREATE TABLE "20554022".users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554022".users OWNER TO postgres;

--
-- Name: naungan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.naungan (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_naungan character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.naungan OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_sekolah character varying(255) NOT NULL,
    schema_name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    naungan_id uuid
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: ekstrakurikuler id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler ALTER COLUMN id SET DEFAULT nextval('"20554021".ekstrakurikuler_id_seq'::regclass);


--
-- Name: ekstrakurikuler_anggota id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_anggota ALTER COLUMN id SET DEFAULT nextval('"20554021".ekstrakurikuler_anggota_id_seq'::regclass);


--
-- Name: ekstrakurikuler_sesi id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_sesi ALTER COLUMN id SET DEFAULT nextval('"20554021".ekstrakurikuler_sesi_id_seq'::regclass);


--
-- Name: fase id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".fase ALTER COLUMN id SET DEFAULT nextval('"20554021".fase_id_seq'::regclass);


--
-- Name: jabatan id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jabatan ALTER COLUMN id SET DEFAULT nextval('"20554021".jabatan_id_seq'::regclass);


--
-- Name: jenis_ujian id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jenis_ujian ALTER COLUMN id SET DEFAULT nextval('"20554021".jenis_ujian_id_seq'::regclass);


--
-- Name: jenjang_pendidikan id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jenjang_pendidikan ALTER COLUMN id SET DEFAULT nextval('"20554021".jenjang_pendidikan_id_seq'::regclass);


--
-- Name: kelompok_mata_pelajaran id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelompok_mata_pelajaran ALTER COLUMN id SET DEFAULT nextval('"20554021".kelompok_mata_pelajaran_id_seq'::regclass);


--
-- Name: kurikulum id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kurikulum ALTER COLUMN id SET DEFAULT nextval('"20554021".kurikulum_id_seq'::regclass);


--
-- Name: materi_pembelajaran id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".materi_pembelajaran ALTER COLUMN id SET DEFAULT nextval('"20554021".materi_pembelajaran_id_seq'::regclass);


--
-- Name: nilai_sumatif_siswa id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".nilai_sumatif_siswa ALTER COLUMN id SET DEFAULT nextval('"20554021".nilai_sumatif_siswa_id_seq'::regclass);


--
-- Name: penilaian id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian ALTER COLUMN id SET DEFAULT nextval('"20554021".penilaian_id_seq'::regclass);


--
-- Name: tingkatan id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tingkatan ALTER COLUMN id SET DEFAULT nextval('"20554021".tingkatan_id_seq'::regclass);


--
-- Name: tujuan_pembelajaran id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tujuan_pembelajaran ALTER COLUMN id SET DEFAULT nextval('"20554021".tujuan_pembelajaran_id_seq'::regclass);


--
-- Name: ujian id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ujian ALTER COLUMN id SET DEFAULT nextval('"20554021".ujian_id_seq'::regclass);


--
-- Name: ekstrakurikuler id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler ALTER COLUMN id SET DEFAULT nextval('"20554022".ekstrakurikuler_id_seq'::regclass);


--
-- Name: ekstrakurikuler_anggota id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_anggota ALTER COLUMN id SET DEFAULT nextval('"20554022".ekstrakurikuler_anggota_id_seq'::regclass);


--
-- Name: ekstrakurikuler_sesi id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_sesi ALTER COLUMN id SET DEFAULT nextval('"20554022".ekstrakurikuler_sesi_id_seq'::regclass);


--
-- Name: fase id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".fase ALTER COLUMN id SET DEFAULT nextval('"20554022".fase_id_seq'::regclass);


--
-- Name: jabatan id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jabatan ALTER COLUMN id SET DEFAULT nextval('"20554022".jabatan_id_seq'::regclass);


--
-- Name: jenis_ujian id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jenis_ujian ALTER COLUMN id SET DEFAULT nextval('"20554022".jenis_ujian_id_seq'::regclass);


--
-- Name: jenjang_pendidikan id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jenjang_pendidikan ALTER COLUMN id SET DEFAULT nextval('"20554022".jenjang_pendidikan_id_seq'::regclass);


--
-- Name: kelompok_mata_pelajaran id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelompok_mata_pelajaran ALTER COLUMN id SET DEFAULT nextval('"20554022".kelompok_mata_pelajaran_id_seq'::regclass);


--
-- Name: kurikulum id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kurikulum ALTER COLUMN id SET DEFAULT nextval('"20554022".kurikulum_id_seq'::regclass);


--
-- Name: materi_pembelajaran id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".materi_pembelajaran ALTER COLUMN id SET DEFAULT nextval('"20554022".materi_pembelajaran_id_seq'::regclass);


--
-- Name: nilai_sumatif_siswa id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".nilai_sumatif_siswa ALTER COLUMN id SET DEFAULT nextval('"20554022".nilai_sumatif_siswa_id_seq'::regclass);


--
-- Name: penilaian id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian ALTER COLUMN id SET DEFAULT nextval('"20554022".penilaian_id_seq'::regclass);


--
-- Name: tingkatan id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tingkatan ALTER COLUMN id SET DEFAULT nextval('"20554022".tingkatan_id_seq'::regclass);


--
-- Name: tujuan_pembelajaran id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tujuan_pembelajaran ALTER COLUMN id SET DEFAULT nextval('"20554022".tujuan_pembelajaran_id_seq'::regclass);


--
-- Name: ujian id; Type: DEFAULT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ujian ALTER COLUMN id SET DEFAULT nextval('"20554022".ujian_id_seq'::regclass);


--
-- Data for Name: anggota_kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".anggota_kelas (id, kelas_id, student_id, created_at, urutan) FROM stdin;
a56e3583-0e31-4cd8-99aa-6cd15e1833f5	c880314c-7462-49fd-937f-475ffdea87dc	ce226536-21e9-4b36-8cd1-e346b2f04791	2025-09-30 17:52:39.270099+07	1
\.


--
-- Data for Name: ekstrakurikuler; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".ekstrakurikuler (id, nama_kegiatan, deskripsi, created_at, updated_at) FROM stdin;
4	Pramuka		2025-10-02 10:57:58.322312+07	2025-10-02 10:57:58.322312+07
5	Drumband		2025-10-02 16:24:41.459022+07	2025-10-02 16:24:41.459022+07
\.


--
-- Data for Name: ekstrakurikuler_anggota; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".ekstrakurikuler_anggota (id, sesi_id, student_id, created_at) FROM stdin;
3	4	ce226536-21e9-4b36-8cd1-e346b2f04791	2025-10-02 10:58:51.813709+07
\.


--
-- Data for Name: ekstrakurikuler_sesi; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".ekstrakurikuler_sesi (id, ekstrakurikuler_id, tahun_ajaran_id, pembina_id, created_at, updated_at) FROM stdin;
4	4	00ca13bc-a572-40c2-8ca7-0569c2fe09d6	7edf93aa-8e44-452e-be17-08e2132dc3dc	2025-10-02 10:58:19.33124+07	2025-10-02 10:58:57.018202+07
5	5	00ca13bc-a572-40c2-8ca7-0569c2fe09d6	7edf93aa-8e44-452e-be17-08e2132dc3dc	2025-10-02 16:24:43.331726+07	2025-10-02 16:24:48.219194+07
\.


--
-- Data for Name: fase; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".fase (id, nama_fase, deskripsi) FROM stdin;
\.


--
-- Data for Name: jabatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jabatan (id, nama_jabatan, created_at, updated_at) FROM stdin;
1	Kepala Sekolah	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
2	Wakil Kepala Sekolah	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
3	Guru Kelas	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
4	Guru Mata Pelajaran	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
5	Staf Tata Usaha	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
\.


--
-- Data for Name: jenis_ujian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jenis_ujian (id, kode_ujian, nama_ujian, created_at, updated_at) FROM stdin;
1	UH	Ulangan Harian	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
2	PR	Pekerjaan Rumah	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
3	TGS	Tugas	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
4	PRA	Praktik	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
5	STS	Sumatif Tengah Semester	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
6	SAS	Sumatif Akhir Semester	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
\.


--
-- Data for Name: jenjang_pendidikan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jenjang_pendidikan (id, nama_jenjang, created_at, updated_at) FROM stdin;
1	SD/MI	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
2	SMP/MTs	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
3	SMA/MA	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
4	SMK	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
\.


--
-- Data for Name: kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kelas (id, nama_kelas, tahun_ajaran_id, tingkatan_id, wali_kelas_id, created_at, updated_at) FROM stdin;
c880314c-7462-49fd-937f-475ffdea87dc	Kelas 1A	00ca13bc-a572-40c2-8ca7-0569c2fe09d6	1	7edf93aa-8e44-452e-be17-08e2132dc3dc	2025-09-30 17:52:33.294642+07	2025-09-30 17:52:33.294642+07
\.


--
-- Data for Name: kelompok_mata_pelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kelompok_mata_pelajaran (id, nama_kelompok, urutan, created_at, updated_at) FROM stdin;
1	Mata Pelajaran Umum	1	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
2	Mata Pelajaran Muatan Lokal	2	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
\.


--
-- Data for Name: kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kurikulum (id, nama_kurikulum, deskripsi) FROM stdin;
\.


--
-- Data for Name: mata_pelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".mata_pelajaran (id, kode_mapel, nama_mapel, created_at, updated_at, parent_id, urutan, kelompok_id) FROM stdin;
9c05eed7-33d0-455e-b4c4-26a4c6c6dd74	MTK	Matematika	2025-10-02 16:27:31.627617+07	2025-10-02 16:27:31.627617+07	\N	1	1
\.


--
-- Data for Name: materi_pembelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".materi_pembelajaran (id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at) FROM stdin;
1	93710d83-97f9-4a4e-8802-6dad91ceca99	Materi Baru	\N	1	2025-10-02 19:32:01.018616+07	2025-10-02 19:32:10.792168+07
\.


--
-- Data for Name: nilai_sumatif_siswa; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".nilai_sumatif_siswa (id, penilaian_sumatif_id, anggota_kelas_id, nilai, created_at, updated_at) FROM stdin;
1	c0c063e8-b312-4db8-a276-ad9a9758a299	a56e3583-0e31-4cd8-99aa-6cd15e1833f5	80.00	2025-10-02 19:33:00.643631+07	2025-10-02 19:33:00.643631+07
2	b3bf07de-264a-4a99-b1e6-43e9756d9680	a56e3583-0e31-4cd8-99aa-6cd15e1833f5	90.00	2025-10-02 19:33:00.643631+07	2025-10-02 19:33:00.643631+07
\.


--
-- Data for Name: pemetaan_kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".pemetaan_kurikulum (tahun_ajaran_id, kurikulum_id, tingkatan_id, fase_id) FROM stdin;
\.


--
-- Data for Name: pengajar_kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".pengajar_kelas (id, kelas_id, teacher_id, mata_pelajaran_id, created_at) FROM stdin;
93710d83-97f9-4a4e-8802-6dad91ceca99	c880314c-7462-49fd-937f-475ffdea87dc	7edf93aa-8e44-452e-be17-08e2132dc3dc	9c05eed7-33d0-455e-b4c4-26a4c6c6dd74	2025-10-02 16:27:43.294658+07
\.


--
-- Data for Name: penilaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".penilaian (id, anggota_kelas_id, tujuan_pembelajaran_id, nilai, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: penilaian_sumatif; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".penilaian_sumatif (id, tujuan_pembelajaran_id, jenis_ujian_id, nama_penilaian, tanggal_pelaksanaan, keterangan, created_at, updated_at, ujian_id) FROM stdin;
c0c063e8-b312-4db8-a276-ad9a9758a299	1	2	Buku Tulis	2025-10-02	\N	2025-10-02 19:32:24.155514+07	2025-10-02 19:32:24.155514+07	\N
b3bf07de-264a-4a99-b1e6-43e9756d9680	\N	5	Menggambar	2025-10-02	\N	2025-10-02 19:32:44.414728+07	2025-10-02 19:32:44.414728+07	4
\.


--
-- Data for Name: presensi; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".presensi (id, anggota_kelas_id, tanggal, status, catatan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prestasi_siswa; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".prestasi_siswa (id, tahun_ajaran_id, anggota_kelas_id, nama_prestasi, tingkat, peringkat, tanggal, deskripsi, created_at, updated_at) FROM stdin;
38dbbb55-4011-4629-b64b-6232ef4cdf2d	00ca13bc-a572-40c2-8ca7-0569c2fe09d6	a56e3583-0e31-4cd8-99aa-6cd15e1833f5	Lomba Kaligrafi	Kabupaten/Kota	Juara 1	2025-09-30		2025-09-30 17:53:15.516886+07	2025-09-30 17:53:15.516886+07
\.


--
-- Data for Name: profil_sekolah; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".profil_sekolah (id, npsn, nama_sekolah, naungan, alamat, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, jenjang_id) FROM stdin;
1	\N	SD NU 03 NURUL HUDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: riwayat_akademik; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_akademik (id, student_id, status, tanggal_kejadian, kelas_tingkat, keterangan, created_at, updated_at) FROM stdin;
7a573ca5-9a62-4659-af0a-317c4d064c16	ce226536-21e9-4b36-8cd1-e346b2f04791	Aktif	2025-09-30	\N	Siswa baru	2025-09-30 17:52:24.191015+07	2025-09-30 17:52:24.191015+07
\.


--
-- Data for Name: riwayat_kepegawaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at) FROM stdin;
6a4fbfc1-5b7e-47a2-84cc-584f0b0398e9	d60a4bc8-07d4-4a1e-af00-463848ac270b	Aktif	2025-09-30	\N	\N	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
ebc9db23-5777-4958-87d6-8331747395ec	7edf93aa-8e44-452e-be17-08e2132dc3dc	Aktif	2025-09-30	\N	\N	2025-09-30 17:52:13.616478+07	2025-09-30 17:52:13.616478+07
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".students (id, created_at, updated_at, nis, nisn, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali, pekerjaan_ayah, alamat_ayah, pekerjaan_ibu, alamat_ibu, pekerjaan_wali, alamat_wali) FROM stdin;
ce226536-21e9-4b36-8cd1-e346b2f04791	2025-09-30 17:52:24.191015+07	2025-09-30 17:52:24.191015+07	\N	\N	Jokowi	\N	Laki-laki	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tahun_ajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tahun_ajaran (id, nama_tahun_ajaran, semester, status, metode_absensi, kepala_sekolah_id, created_at, updated_at) FROM stdin;
00ca13bc-a572-40c2-8ca7-0569c2fe09d6	2025/2026	Ganjil	Aktif	HARIAN	\N	2025-09-30 17:49:45.428633+07	2025-09-30 17:49:45.428633+07
\.


--
-- Data for Name: tahun_ajaran_kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tahun_ajaran_kurikulum (tahun_ajaran_id, kurikulum_id) FROM stdin;
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".teachers (id, user_id, nama_lengkap, nip_nuptk, alamat_lengkap, no_hp, created_at, updated_at, nama_panggilan, gelar_akademik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, kode_pos) FROM stdin;
d60a4bc8-07d4-4a1e-af00-463848ac270b	81ecd58a-824a-4b85-be00-8917af8daf8b	Admin Nurul Huda	\N	\N	\N	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7edf93aa-8e44-452e-be17-08e2132dc3dc	4f87f98e-e380-4d99-b4bf-6dc014ab7954	Fahmi	\N	\N	\N	2025-09-30 17:52:13.616478+07	2025-09-30 17:52:13.616478+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tingkatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tingkatan (id, nama_tingkatan, urutan, created_at, updated_at) FROM stdin;
1	Kelas 1	1	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
2	Kelas 2	2	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
3	Kelas 3	3	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
4	Kelas 4	4	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
5	Kelas 5	5	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
6	Kelas 6	6	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
\.


--
-- Data for Name: tujuan_pembelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tujuan_pembelajaran (id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at) FROM stdin;
1	1	Tujuan pembelajaran baru.	1	2025-10-02 19:32:14.172117+07	2025-10-02 19:32:14.172117+07
\.


--
-- Data for Name: ujian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".ujian (id, pengajar_kelas_id, nama_ujian, urutan, created_at, updated_at) FROM stdin;
4	93710d83-97f9-4a4e-8802-6dad91ceca99	UTS	2	2025-10-02 19:27:34.530076+07	2025-10-02 19:32:10.792168+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
81ecd58a-824a-4b85-be00-8917af8daf8b	admin.sdnu03@gmail.com	$2a$10$29RtLLKxIZpKJL3.uvGKsOzofgerQ5/4MzHUB9CuXKQ9rIq.kuCky	admin	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07
4f87f98e-e380-4d99-b4bf-6dc014ab7954	fahmi.andi@email.com	$2a$10$XGx2OGSSwlEzEUcz4yRUh./EEETJ69T4MQnQPJ/hTs2Km4VIx95MC	teacher	2025-09-30 17:52:13.616478+07	2025-09-30 17:52:13.616478+07
\.


--
-- Data for Name: anggota_kelas; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".anggota_kelas (id, kelas_id, student_id, created_at, urutan) FROM stdin;
\.


--
-- Data for Name: ekstrakurikuler; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".ekstrakurikuler (id, nama_kegiatan, deskripsi, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ekstrakurikuler_anggota; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".ekstrakurikuler_anggota (id, sesi_id, student_id, created_at) FROM stdin;
\.


--
-- Data for Name: ekstrakurikuler_sesi; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".ekstrakurikuler_sesi (id, ekstrakurikuler_id, tahun_ajaran_id, pembina_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fase; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".fase (id, nama_fase, deskripsi) FROM stdin;
\.


--
-- Data for Name: jabatan; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".jabatan (id, nama_jabatan, created_at, updated_at) FROM stdin;
1	Kepala Sekolah	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
2	Wakil Kepala Sekolah	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
3	Guru Kelas	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
4	Guru Mata Pelajaran	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
5	Staf Tata Usaha	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: jenis_ujian; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".jenis_ujian (id, kode_ujian, nama_ujian, created_at, updated_at) FROM stdin;
1	UH	Ulangan Harian	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
2	PR	Pekerjaan Rumah	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
3	TGS	Tugas	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
4	PRA	Praktik	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
5	STS	Sumatif Tengah Semester	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
6	SAS	Sumatif Akhir Semester	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: jenjang_pendidikan; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".jenjang_pendidikan (id, nama_jenjang, created_at, updated_at) FROM stdin;
1	SD/MI	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
2	SMP/MTs	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
3	SMA/MA	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
4	SMK	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: kelas; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".kelas (id, nama_kelas, tahun_ajaran_id, tingkatan_id, wali_kelas_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: kelompok_mata_pelajaran; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".kelompok_mata_pelajaran (id, nama_kelompok, urutan, created_at, updated_at) FROM stdin;
1	Mata Pelajaran Umum	1	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
2	Mata Pelajaran Muatan Lokal	2	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: kurikulum; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".kurikulum (id, nama_kurikulum, deskripsi) FROM stdin;
\.


--
-- Data for Name: mata_pelajaran; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".mata_pelajaran (id, kode_mapel, nama_mapel, created_at, updated_at, parent_id, urutan, kelompok_id) FROM stdin;
\.


--
-- Data for Name: materi_pembelajaran; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".materi_pembelajaran (id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nilai_sumatif_siswa; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".nilai_sumatif_siswa (id, penilaian_sumatif_id, anggota_kelas_id, nilai, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pemetaan_kurikulum; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".pemetaan_kurikulum (tahun_ajaran_id, kurikulum_id, tingkatan_id, fase_id) FROM stdin;
\.


--
-- Data for Name: pengajar_kelas; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".pengajar_kelas (id, kelas_id, teacher_id, mata_pelajaran_id, created_at) FROM stdin;
\.


--
-- Data for Name: penilaian; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".penilaian (id, anggota_kelas_id, tujuan_pembelajaran_id, nilai, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: penilaian_sumatif; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".penilaian_sumatif (id, tujuan_pembelajaran_id, jenis_ujian_id, nama_penilaian, tanggal_pelaksanaan, keterangan, created_at, updated_at, ujian_id) FROM stdin;
\.


--
-- Data for Name: presensi; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".presensi (id, anggota_kelas_id, tanggal, status, catatan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prestasi_siswa; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".prestasi_siswa (id, tahun_ajaran_id, anggota_kelas_id, nama_prestasi, tingkat, peringkat, tanggal, deskripsi, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: profil_sekolah; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".profil_sekolah (id, npsn, nama_sekolah, naungan, alamat, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, jenjang_id) FROM stdin;
1	\N	SMAN JEMBER 1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: riwayat_akademik; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".riwayat_akademik (id, student_id, status, tanggal_kejadian, kelas_tingkat, keterangan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: riwayat_kepegawaian; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at) FROM stdin;
e9ab87ae-de30-4e0e-a712-68cb73c04f59	fb506586-fa1e-4175-bd24-6fe4ac16cd7c	Aktif	2025-10-02	\N	\N	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".students (id, created_at, updated_at, nis, nisn, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali, pekerjaan_ayah, alamat_ayah, pekerjaan_ibu, alamat_ibu, pekerjaan_wali, alamat_wali) FROM stdin;
\.


--
-- Data for Name: tahun_ajaran; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".tahun_ajaran (id, nama_tahun_ajaran, semester, status, metode_absensi, kepala_sekolah_id, created_at, updated_at) FROM stdin;
5393a9d0-080d-4a14-ac9f-0c4bcefbf6a1	2025/2026	Ganjil	Aktif	HARIAN	\N	2025-10-02 07:48:05.471565+07	2025-10-02 07:48:05.471565+07
\.


--
-- Data for Name: tahun_ajaran_kurikulum; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".tahun_ajaran_kurikulum (tahun_ajaran_id, kurikulum_id) FROM stdin;
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".teachers (id, user_id, nama_lengkap, nip_nuptk, alamat_lengkap, no_hp, created_at, updated_at, nama_panggilan, gelar_akademik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, kode_pos) FROM stdin;
fb506586-fa1e-4175-bd24-6fe4ac16cd7c	9aee8c06-a3a6-4123-8789-f4ef75c28005	adminsmanegeri1	\N	\N	\N	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tingkatan; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".tingkatan (id, nama_tingkatan, urutan, created_at, updated_at) FROM stdin;
1	Kelas 1	1	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
2	Kelas 2	2	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
3	Kelas 3	3	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
4	Kelas 4	4	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
5	Kelas 5	5	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
6	Kelas 6	6	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: tujuan_pembelajaran; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".tujuan_pembelajaran (id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ujian; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".ujian (id, pengajar_kelas_id, nama_ujian, urutan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: 20554022; Owner: postgres
--

COPY "20554022".users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
9aee8c06-a3a6-4123-8789-f4ef75c28005	adminsmanegeri1@gmail.com	$2a$10$k2vfJBQN2O1oGkS81z95te2TAXen3r8/ZaFpbv/bjf9VctJaj6m5q	admin	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07
\.


--
-- Data for Name: naungan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.naungan (id, nama_naungan, created_at, updated_at) FROM stdin;
085daf81-e38c-4cf4-96c1-47c6218a85f2	Yayasan Pondok Pesantren Islam Bintang Sembilan	2025-09-28 06:17:14.170797+07	2025-09-28 06:17:14.170797+07
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, nama_sekolah, schema_name, created_at, updated_at, naungan_id) FROM stdin;
832895ad-4ef1-4722-9a49-aab8d98ab31c	SD NU 03 NURUL HUDA	20554021	2025-09-30 17:44:00.93493+07	2025-09-30 17:44:00.93493+07	085daf81-e38c-4cf4-96c1-47c6218a85f2
7f7b245c-1d85-4ab8-9d09-b62aade72ec6	SMAN JEMBER 1	20554022	2025-10-02 07:44:59.787408+07	2025-10-02 07:44:59.787408+07	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
dad01df5-1937-48cf-829a-7c0446f4f760	superadmin@skoola.com	$2a$10$zyDKgGO5pqFHaDLiEjVuReurOF5G7r.CFeXCvii7VE2JT3Egs8/GW	superadmin	2025-09-18 16:23:58.296655+07	2025-09-18 16:23:58.296655+07
\.


--
-- Name: ekstrakurikuler_anggota_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".ekstrakurikuler_anggota_id_seq', 3, true);


--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".ekstrakurikuler_id_seq', 5, true);


--
-- Name: ekstrakurikuler_sesi_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".ekstrakurikuler_sesi_id_seq', 5, true);


--
-- Name: fase_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".fase_id_seq', 1, false);


--
-- Name: jabatan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".jabatan_id_seq', 5, true);


--
-- Name: jenis_ujian_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".jenis_ujian_id_seq', 6, true);


--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".jenjang_pendidikan_id_seq', 4, true);


--
-- Name: kelompok_mata_pelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".kelompok_mata_pelajaran_id_seq', 2, true);


--
-- Name: kurikulum_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".kurikulum_id_seq', 1, false);


--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".materi_pembelajaran_id_seq', 1, true);


--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".nilai_sumatif_siswa_id_seq', 2, true);


--
-- Name: penilaian_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".penilaian_id_seq', 1, false);


--
-- Name: tingkatan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".tingkatan_id_seq', 6, true);


--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".tujuan_pembelajaran_id_seq', 1, true);


--
-- Name: ujian_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".ujian_id_seq', 4, true);


--
-- Name: ekstrakurikuler_anggota_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".ekstrakurikuler_anggota_id_seq', 1, false);


--
-- Name: ekstrakurikuler_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".ekstrakurikuler_id_seq', 1, false);


--
-- Name: ekstrakurikuler_sesi_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".ekstrakurikuler_sesi_id_seq', 1, false);


--
-- Name: fase_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".fase_id_seq', 1, false);


--
-- Name: jabatan_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".jabatan_id_seq', 5, true);


--
-- Name: jenis_ujian_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".jenis_ujian_id_seq', 6, true);


--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".jenjang_pendidikan_id_seq', 4, true);


--
-- Name: kelompok_mata_pelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".kelompok_mata_pelajaran_id_seq', 2, true);


--
-- Name: kurikulum_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".kurikulum_id_seq', 1, false);


--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".materi_pembelajaran_id_seq', 1, false);


--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".nilai_sumatif_siswa_id_seq', 1, false);


--
-- Name: penilaian_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".penilaian_id_seq', 1, false);


--
-- Name: tingkatan_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".tingkatan_id_seq', 6, true);


--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".tujuan_pembelajaran_id_seq', 1, false);


--
-- Name: ujian_id_seq; Type: SEQUENCE SET; Schema: 20554022; Owner: postgres
--

SELECT pg_catalog.setval('"20554022".ujian_id_seq', 1, false);


--
-- Name: anggota_kelas anggota_kelas_kelas_student_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".anggota_kelas
    ADD CONSTRAINT anggota_kelas_kelas_student_unique UNIQUE (kelas_id, student_id);


--
-- Name: anggota_kelas anggota_kelas_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".anggota_kelas
    ADD CONSTRAINT anggota_kelas_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler_anggota ekstrakurikuler_anggota_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_anggota
    ADD CONSTRAINT ekstrakurikuler_anggota_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler ekstrakurikuler_nama_kegiatan_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler
    ADD CONSTRAINT ekstrakurikuler_nama_kegiatan_unique UNIQUE (nama_kegiatan);


--
-- Name: ekstrakurikuler ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler
    ADD CONSTRAINT ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler_sesi ekstrakurikuler_sesi_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_sesi
    ADD CONSTRAINT ekstrakurikuler_sesi_pkey PRIMARY KEY (id);


--
-- Name: fase fase_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".fase
    ADD CONSTRAINT fase_pkey PRIMARY KEY (id);


--
-- Name: jabatan jabatan_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jabatan
    ADD CONSTRAINT jabatan_pkey PRIMARY KEY (id);


--
-- Name: jenis_ujian jenis_ujian_kode_ujian_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jenis_ujian
    ADD CONSTRAINT jenis_ujian_kode_ujian_unique UNIQUE (kode_ujian);


--
-- Name: jenis_ujian jenis_ujian_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jenis_ujian
    ADD CONSTRAINT jenis_ujian_pkey PRIMARY KEY (id);


--
-- Name: jenjang_pendidikan jenjang_pendidikan_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jenjang_pendidikan
    ADD CONSTRAINT jenjang_pendidikan_pkey PRIMARY KEY (id);


--
-- Name: kelas kelas_nama_tahun_ajaran_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelas
    ADD CONSTRAINT kelas_nama_tahun_ajaran_unique UNIQUE (nama_kelas, tahun_ajaran_id);


--
-- Name: kelas kelas_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelas
    ADD CONSTRAINT kelas_pkey PRIMARY KEY (id);


--
-- Name: kelompok_mata_pelajaran kelompok_mata_pelajaran_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelompok_mata_pelajaran
    ADD CONSTRAINT kelompok_mata_pelajaran_pkey PRIMARY KEY (id);


--
-- Name: kurikulum kurikulum_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kurikulum
    ADD CONSTRAINT kurikulum_pkey PRIMARY KEY (id);


--
-- Name: mata_pelajaran mata_pelajaran_kode_mapel_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_kode_mapel_unique UNIQUE (kode_mapel);


--
-- Name: mata_pelajaran mata_pelajaran_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_pkey PRIMARY KEY (id);


--
-- Name: materi_pembelajaran materi_pembelajaran_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".materi_pembelajaran
    ADD CONSTRAINT materi_pembelajaran_pkey PRIMARY KEY (id);


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_pkey PRIMARY KEY (id);


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_unique UNIQUE (penilaian_sumatif_id, anggota_kelas_id);


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_pkey PRIMARY KEY (tahun_ajaran_id, kurikulum_id, tingkatan_id);


--
-- Name: pengajar_kelas pengajar_kelas_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_pkey PRIMARY KEY (id);


--
-- Name: pengajar_kelas pengajar_kelas_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_unique UNIQUE (kelas_id, teacher_id, mata_pelajaran_id);


--
-- Name: penilaian penilaian_anggota_tp_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian
    ADD CONSTRAINT penilaian_anggota_tp_unique UNIQUE (anggota_kelas_id, tujuan_pembelajaran_id);


--
-- Name: penilaian penilaian_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian
    ADD CONSTRAINT penilaian_pkey PRIMARY KEY (id);


--
-- Name: penilaian_sumatif penilaian_sumatif_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_pkey PRIMARY KEY (id);


--
-- Name: presensi presensi_anggota_tanggal_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".presensi
    ADD CONSTRAINT presensi_anggota_tanggal_unique UNIQUE (anggota_kelas_id, tanggal);


--
-- Name: presensi presensi_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".presensi
    ADD CONSTRAINT presensi_pkey PRIMARY KEY (id);


--
-- Name: prestasi_siswa prestasi_siswa_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".prestasi_siswa
    ADD CONSTRAINT prestasi_siswa_pkey PRIMARY KEY (id);


--
-- Name: profil_sekolah profil_sekolah_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".profil_sekolah
    ADD CONSTRAINT profil_sekolah_pkey PRIMARY KEY (id);


--
-- Name: riwayat_akademik riwayat_akademik_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".riwayat_akademik
    ADD CONSTRAINT riwayat_akademik_pkey PRIMARY KEY (id);


--
-- Name: riwayat_kepegawaian riwayat_kepegawaian_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".riwayat_kepegawaian
    ADD CONSTRAINT riwayat_kepegawaian_pkey PRIMARY KEY (id);


--
-- Name: students students_nis_key; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".students
    ADD CONSTRAINT students_nis_key UNIQUE (nis);


--
-- Name: students students_nisn_key; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".students
    ADD CONSTRAINT students_nisn_key UNIQUE (nisn);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: tahun_ajaran_kurikulum tahun_ajaran_kurikulum_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tahun_ajaran_kurikulum
    ADD CONSTRAINT tahun_ajaran_kurikulum_pkey PRIMARY KEY (tahun_ajaran_id, kurikulum_id);


--
-- Name: tahun_ajaran tahun_ajaran_nama_semester_unique; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_nama_semester_unique UNIQUE (nama_tahun_ajaran, semester);


--
-- Name: tahun_ajaran tahun_ajaran_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: tingkatan tingkatan_nama_tingkatan_key; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tingkatan
    ADD CONSTRAINT tingkatan_nama_tingkatan_key UNIQUE (nama_tingkatan);


--
-- Name: tingkatan tingkatan_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tingkatan
    ADD CONSTRAINT tingkatan_pkey PRIMARY KEY (id);


--
-- Name: tujuan_pembelajaran tujuan_pembelajaran_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tujuan_pembelajaran
    ADD CONSTRAINT tujuan_pembelajaran_pkey PRIMARY KEY (id);


--
-- Name: ujian ujian_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ujian
    ADD CONSTRAINT ujian_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler_sesi unique_ekskul_tahun_ajaran; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_sesi
    ADD CONSTRAINT unique_ekskul_tahun_ajaran UNIQUE (ekstrakurikuler_id, tahun_ajaran_id);


--
-- Name: ekstrakurikuler_anggota unique_sesi_student; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_anggota
    ADD CONSTRAINT unique_sesi_student UNIQUE (sesi_id, student_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: anggota_kelas anggota_kelas_kelas_student_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".anggota_kelas
    ADD CONSTRAINT anggota_kelas_kelas_student_unique UNIQUE (kelas_id, student_id);


--
-- Name: anggota_kelas anggota_kelas_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".anggota_kelas
    ADD CONSTRAINT anggota_kelas_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler_anggota ekstrakurikuler_anggota_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_anggota
    ADD CONSTRAINT ekstrakurikuler_anggota_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler ekstrakurikuler_nama_kegiatan_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler
    ADD CONSTRAINT ekstrakurikuler_nama_kegiatan_unique UNIQUE (nama_kegiatan);


--
-- Name: ekstrakurikuler ekstrakurikuler_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler
    ADD CONSTRAINT ekstrakurikuler_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler_sesi ekstrakurikuler_sesi_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_sesi
    ADD CONSTRAINT ekstrakurikuler_sesi_pkey PRIMARY KEY (id);


--
-- Name: fase fase_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".fase
    ADD CONSTRAINT fase_pkey PRIMARY KEY (id);


--
-- Name: jabatan jabatan_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jabatan
    ADD CONSTRAINT jabatan_pkey PRIMARY KEY (id);


--
-- Name: jenis_ujian jenis_ujian_kode_ujian_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jenis_ujian
    ADD CONSTRAINT jenis_ujian_kode_ujian_unique UNIQUE (kode_ujian);


--
-- Name: jenis_ujian jenis_ujian_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jenis_ujian
    ADD CONSTRAINT jenis_ujian_pkey PRIMARY KEY (id);


--
-- Name: jenjang_pendidikan jenjang_pendidikan_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".jenjang_pendidikan
    ADD CONSTRAINT jenjang_pendidikan_pkey PRIMARY KEY (id);


--
-- Name: kelas kelas_nama_tahun_ajaran_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelas
    ADD CONSTRAINT kelas_nama_tahun_ajaran_unique UNIQUE (nama_kelas, tahun_ajaran_id);


--
-- Name: kelas kelas_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelas
    ADD CONSTRAINT kelas_pkey PRIMARY KEY (id);


--
-- Name: kelompok_mata_pelajaran kelompok_mata_pelajaran_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelompok_mata_pelajaran
    ADD CONSTRAINT kelompok_mata_pelajaran_pkey PRIMARY KEY (id);


--
-- Name: kurikulum kurikulum_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kurikulum
    ADD CONSTRAINT kurikulum_pkey PRIMARY KEY (id);


--
-- Name: mata_pelajaran mata_pelajaran_kode_mapel_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_kode_mapel_unique UNIQUE (kode_mapel);


--
-- Name: mata_pelajaran mata_pelajaran_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_pkey PRIMARY KEY (id);


--
-- Name: materi_pembelajaran materi_pembelajaran_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".materi_pembelajaran
    ADD CONSTRAINT materi_pembelajaran_pkey PRIMARY KEY (id);


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_pkey PRIMARY KEY (id);


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_unique UNIQUE (penilaian_sumatif_id, anggota_kelas_id);


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_pkey PRIMARY KEY (tahun_ajaran_id, kurikulum_id, tingkatan_id);


--
-- Name: pengajar_kelas pengajar_kelas_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_pkey PRIMARY KEY (id);


--
-- Name: pengajar_kelas pengajar_kelas_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_unique UNIQUE (kelas_id, teacher_id, mata_pelajaran_id);


--
-- Name: penilaian penilaian_anggota_tp_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian
    ADD CONSTRAINT penilaian_anggota_tp_unique UNIQUE (anggota_kelas_id, tujuan_pembelajaran_id);


--
-- Name: penilaian penilaian_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian
    ADD CONSTRAINT penilaian_pkey PRIMARY KEY (id);


--
-- Name: penilaian_sumatif penilaian_sumatif_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_pkey PRIMARY KEY (id);


--
-- Name: presensi presensi_anggota_tanggal_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".presensi
    ADD CONSTRAINT presensi_anggota_tanggal_unique UNIQUE (anggota_kelas_id, tanggal);


--
-- Name: presensi presensi_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".presensi
    ADD CONSTRAINT presensi_pkey PRIMARY KEY (id);


--
-- Name: prestasi_siswa prestasi_siswa_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".prestasi_siswa
    ADD CONSTRAINT prestasi_siswa_pkey PRIMARY KEY (id);


--
-- Name: profil_sekolah profil_sekolah_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".profil_sekolah
    ADD CONSTRAINT profil_sekolah_pkey PRIMARY KEY (id);


--
-- Name: riwayat_akademik riwayat_akademik_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".riwayat_akademik
    ADD CONSTRAINT riwayat_akademik_pkey PRIMARY KEY (id);


--
-- Name: riwayat_kepegawaian riwayat_kepegawaian_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".riwayat_kepegawaian
    ADD CONSTRAINT riwayat_kepegawaian_pkey PRIMARY KEY (id);


--
-- Name: students students_nis_key; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".students
    ADD CONSTRAINT students_nis_key UNIQUE (nis);


--
-- Name: students students_nisn_key; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".students
    ADD CONSTRAINT students_nisn_key UNIQUE (nisn);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: tahun_ajaran_kurikulum tahun_ajaran_kurikulum_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tahun_ajaran_kurikulum
    ADD CONSTRAINT tahun_ajaran_kurikulum_pkey PRIMARY KEY (tahun_ajaran_id, kurikulum_id);


--
-- Name: tahun_ajaran tahun_ajaran_nama_semester_unique; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_nama_semester_unique UNIQUE (nama_tahun_ajaran, semester);


--
-- Name: tahun_ajaran tahun_ajaran_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: tingkatan tingkatan_nama_tingkatan_key; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tingkatan
    ADD CONSTRAINT tingkatan_nama_tingkatan_key UNIQUE (nama_tingkatan);


--
-- Name: tingkatan tingkatan_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tingkatan
    ADD CONSTRAINT tingkatan_pkey PRIMARY KEY (id);


--
-- Name: tujuan_pembelajaran tujuan_pembelajaran_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tujuan_pembelajaran
    ADD CONSTRAINT tujuan_pembelajaran_pkey PRIMARY KEY (id);


--
-- Name: ujian ujian_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ujian
    ADD CONSTRAINT ujian_pkey PRIMARY KEY (id);


--
-- Name: ekstrakurikuler_sesi unique_ekskul_tahun_ajaran; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_sesi
    ADD CONSTRAINT unique_ekskul_tahun_ajaran UNIQUE (ekstrakurikuler_id, tahun_ajaran_id);


--
-- Name: ekstrakurikuler_anggota unique_sesi_student; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_anggota
    ADD CONSTRAINT unique_sesi_student UNIQUE (sesi_id, student_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: naungan naungan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.naungan
    ADD CONSTRAINT naungan_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_schema_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_schema_name_key UNIQUE (schema_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_anggota_kelas_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_anggota_kelas_kelas_id ON "20554021".anggota_kelas USING btree (kelas_id);


--
-- Name: idx_anggota_kelas_urutan; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_anggota_kelas_urutan ON "20554021".anggota_kelas USING btree (urutan);


--
-- Name: idx_ekstrakurikuler_anggota_sesi; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_ekstrakurikuler_anggota_sesi ON "20554021".ekstrakurikuler_anggota USING btree (sesi_id);


--
-- Name: idx_ekstrakurikuler_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_ekstrakurikuler_nama ON "20554021".ekstrakurikuler USING btree (nama_kegiatan);


--
-- Name: idx_ekstrakurikuler_sesi_tahun_ajaran; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_ekstrakurikuler_sesi_tahun_ajaran ON "20554021".ekstrakurikuler_sesi USING btree (tahun_ajaran_id);


--
-- Name: idx_jabatan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jabatan_nama ON "20554021".jabatan USING btree (nama_jabatan);


--
-- Name: idx_jenis_ujian_kode; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jenis_ujian_kode ON "20554021".jenis_ujian USING btree (kode_ujian);


--
-- Name: idx_jenis_ujian_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jenis_ujian_nama ON "20554021".jenis_ujian USING btree (nama_ujian);


--
-- Name: idx_jenjang_pendidikan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jenjang_pendidikan_nama ON "20554021".jenjang_pendidikan USING btree (nama_jenjang);


--
-- Name: idx_kelas_tahun_ajaran_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_kelas_tahun_ajaran_id ON "20554021".kelas USING btree (tahun_ajaran_id);


--
-- Name: idx_mata_pelajaran_kelompok_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_kelompok_id ON "20554021".mata_pelajaran USING btree (kelompok_id);


--
-- Name: idx_mata_pelajaran_nama_mapel; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_nama_mapel ON "20554021".mata_pelajaran USING btree (nama_mapel);


--
-- Name: idx_mata_pelajaran_parent_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_parent_id ON "20554021".mata_pelajaran USING btree (parent_id);


--
-- Name: idx_mata_pelajaran_urutan; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_urutan ON "20554021".mata_pelajaran USING btree (urutan);


--
-- Name: idx_materi_pembelajaran_pengajar_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_materi_pembelajaran_pengajar_kelas_id ON "20554021".materi_pembelajaran USING btree (pengajar_kelas_id);


--
-- Name: idx_nilai_sumatif_anggota_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_nilai_sumatif_anggota_kelas_id ON "20554021".nilai_sumatif_siswa USING btree (anggota_kelas_id);


--
-- Name: idx_nilai_sumatif_penilaian_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_nilai_sumatif_penilaian_id ON "20554021".nilai_sumatif_siswa USING btree (penilaian_sumatif_id);


--
-- Name: idx_pemetaan_kurikulum_kurikulum; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_pemetaan_kurikulum_kurikulum ON "20554021".pemetaan_kurikulum USING btree (kurikulum_id);


--
-- Name: idx_pemetaan_kurikulum_tahun_ajaran; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_pemetaan_kurikulum_tahun_ajaran ON "20554021".pemetaan_kurikulum USING btree (tahun_ajaran_id);


--
-- Name: idx_pengajar_kelas_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_pengajar_kelas_kelas_id ON "20554021".pengajar_kelas USING btree (kelas_id);


--
-- Name: idx_penilaian_anggota_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_penilaian_anggota_kelas_id ON "20554021".penilaian USING btree (anggota_kelas_id);


--
-- Name: idx_penilaian_sumatif_tp_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_penilaian_sumatif_tp_id ON "20554021".penilaian_sumatif USING btree (tujuan_pembelajaran_id);


--
-- Name: idx_penilaian_sumatif_ujian_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_penilaian_sumatif_ujian_id ON "20554021".penilaian_sumatif USING btree (ujian_id);


--
-- Name: idx_penilaian_tp_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_penilaian_tp_id ON "20554021".penilaian USING btree (tujuan_pembelajaran_id);


--
-- Name: idx_presensi_anggota_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_presensi_anggota_kelas_id ON "20554021".presensi USING btree (anggota_kelas_id);


--
-- Name: idx_presensi_tanggal; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_presensi_tanggal ON "20554021".presensi USING btree (tanggal);


--
-- Name: idx_prestasi_siswa_anggota_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_prestasi_siswa_anggota_kelas_id ON "20554021".prestasi_siswa USING btree (anggota_kelas_id);


--
-- Name: idx_prestasi_siswa_tahun_ajaran_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_prestasi_siswa_tahun_ajaran_id ON "20554021".prestasi_siswa USING btree (tahun_ajaran_id);


--
-- Name: idx_riwayat_akademik_student_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_riwayat_akademik_student_id ON "20554021".riwayat_akademik USING btree (student_id);


--
-- Name: idx_riwayat_kepegawaian_teacher_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_riwayat_kepegawaian_teacher_id ON "20554021".riwayat_kepegawaian USING btree (teacher_id);


--
-- Name: idx_students_nama_lengkap; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_students_nama_lengkap ON "20554021".students USING btree (nama_lengkap);


--
-- Name: idx_tahun_ajaran_kepala_sekolah_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_tahun_ajaran_kepala_sekolah_id ON "20554021".tahun_ajaran USING btree (kepala_sekolah_id);


--
-- Name: idx_tahun_ajaran_kurikulum_keys; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_tahun_ajaran_kurikulum_keys ON "20554021".tahun_ajaran_kurikulum USING btree (tahun_ajaran_id, kurikulum_id);


--
-- Name: idx_tingkatan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_tingkatan_nama ON "20554021".tingkatan USING btree (nama_tingkatan);


--
-- Name: idx_tujuan_pembelajaran_materi_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_tujuan_pembelajaran_materi_id ON "20554021".tujuan_pembelajaran USING btree (materi_pembelajaran_id);


--
-- Name: idx_ujian_pengajar_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_ujian_pengajar_kelas_id ON "20554021".ujian USING btree (pengajar_kelas_id);


--
-- Name: idx_anggota_kelas_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_anggota_kelas_kelas_id ON "20554022".anggota_kelas USING btree (kelas_id);


--
-- Name: idx_anggota_kelas_urutan; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_anggota_kelas_urutan ON "20554022".anggota_kelas USING btree (urutan);


--
-- Name: idx_ekstrakurikuler_anggota_sesi; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_ekstrakurikuler_anggota_sesi ON "20554022".ekstrakurikuler_anggota USING btree (sesi_id);


--
-- Name: idx_ekstrakurikuler_nama; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_ekstrakurikuler_nama ON "20554022".ekstrakurikuler USING btree (nama_kegiatan);


--
-- Name: idx_ekstrakurikuler_sesi_tahun_ajaran; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_ekstrakurikuler_sesi_tahun_ajaran ON "20554022".ekstrakurikuler_sesi USING btree (tahun_ajaran_id);


--
-- Name: idx_jabatan_nama; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_jabatan_nama ON "20554022".jabatan USING btree (nama_jabatan);


--
-- Name: idx_jenis_ujian_kode; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_jenis_ujian_kode ON "20554022".jenis_ujian USING btree (kode_ujian);


--
-- Name: idx_jenis_ujian_nama; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_jenis_ujian_nama ON "20554022".jenis_ujian USING btree (nama_ujian);


--
-- Name: idx_jenjang_pendidikan_nama; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_jenjang_pendidikan_nama ON "20554022".jenjang_pendidikan USING btree (nama_jenjang);


--
-- Name: idx_kelas_tahun_ajaran_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_kelas_tahun_ajaran_id ON "20554022".kelas USING btree (tahun_ajaran_id);


--
-- Name: idx_mata_pelajaran_kelompok_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_kelompok_id ON "20554022".mata_pelajaran USING btree (kelompok_id);


--
-- Name: idx_mata_pelajaran_nama_mapel; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_nama_mapel ON "20554022".mata_pelajaran USING btree (nama_mapel);


--
-- Name: idx_mata_pelajaran_parent_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_parent_id ON "20554022".mata_pelajaran USING btree (parent_id);


--
-- Name: idx_mata_pelajaran_urutan; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_urutan ON "20554022".mata_pelajaran USING btree (urutan);


--
-- Name: idx_materi_pembelajaran_pengajar_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_materi_pembelajaran_pengajar_kelas_id ON "20554022".materi_pembelajaran USING btree (pengajar_kelas_id);


--
-- Name: idx_nilai_sumatif_anggota_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_nilai_sumatif_anggota_kelas_id ON "20554022".nilai_sumatif_siswa USING btree (anggota_kelas_id);


--
-- Name: idx_nilai_sumatif_penilaian_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_nilai_sumatif_penilaian_id ON "20554022".nilai_sumatif_siswa USING btree (penilaian_sumatif_id);


--
-- Name: idx_pemetaan_kurikulum_kurikulum; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_pemetaan_kurikulum_kurikulum ON "20554022".pemetaan_kurikulum USING btree (kurikulum_id);


--
-- Name: idx_pemetaan_kurikulum_tahun_ajaran; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_pemetaan_kurikulum_tahun_ajaran ON "20554022".pemetaan_kurikulum USING btree (tahun_ajaran_id);


--
-- Name: idx_pengajar_kelas_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_pengajar_kelas_kelas_id ON "20554022".pengajar_kelas USING btree (kelas_id);


--
-- Name: idx_penilaian_anggota_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_penilaian_anggota_kelas_id ON "20554022".penilaian USING btree (anggota_kelas_id);


--
-- Name: idx_penilaian_sumatif_tp_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_penilaian_sumatif_tp_id ON "20554022".penilaian_sumatif USING btree (tujuan_pembelajaran_id);


--
-- Name: idx_penilaian_sumatif_ujian_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_penilaian_sumatif_ujian_id ON "20554022".penilaian_sumatif USING btree (ujian_id);


--
-- Name: idx_penilaian_tp_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_penilaian_tp_id ON "20554022".penilaian USING btree (tujuan_pembelajaran_id);


--
-- Name: idx_presensi_anggota_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_presensi_anggota_kelas_id ON "20554022".presensi USING btree (anggota_kelas_id);


--
-- Name: idx_presensi_tanggal; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_presensi_tanggal ON "20554022".presensi USING btree (tanggal);


--
-- Name: idx_prestasi_siswa_anggota_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_prestasi_siswa_anggota_kelas_id ON "20554022".prestasi_siswa USING btree (anggota_kelas_id);


--
-- Name: idx_prestasi_siswa_tahun_ajaran_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_prestasi_siswa_tahun_ajaran_id ON "20554022".prestasi_siswa USING btree (tahun_ajaran_id);


--
-- Name: idx_riwayat_akademik_student_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_riwayat_akademik_student_id ON "20554022".riwayat_akademik USING btree (student_id);


--
-- Name: idx_riwayat_kepegawaian_teacher_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_riwayat_kepegawaian_teacher_id ON "20554022".riwayat_kepegawaian USING btree (teacher_id);


--
-- Name: idx_students_nama_lengkap; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_students_nama_lengkap ON "20554022".students USING btree (nama_lengkap);


--
-- Name: idx_tahun_ajaran_kepala_sekolah_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_tahun_ajaran_kepala_sekolah_id ON "20554022".tahun_ajaran USING btree (kepala_sekolah_id);


--
-- Name: idx_tahun_ajaran_kurikulum_keys; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_tahun_ajaran_kurikulum_keys ON "20554022".tahun_ajaran_kurikulum USING btree (tahun_ajaran_id, kurikulum_id);


--
-- Name: idx_tingkatan_nama; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_tingkatan_nama ON "20554022".tingkatan USING btree (nama_tingkatan);


--
-- Name: idx_tujuan_pembelajaran_materi_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_tujuan_pembelajaran_materi_id ON "20554022".tujuan_pembelajaran USING btree (materi_pembelajaran_id);


--
-- Name: idx_ujian_pengajar_kelas_id; Type: INDEX; Schema: 20554022; Owner: postgres
--

CREATE INDEX idx_ujian_pengajar_kelas_id ON "20554022".ujian USING btree (pengajar_kelas_id);


--
-- Name: idx_tenants_naungan_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_naungan_id ON public.tenants USING btree (naungan_id);


--
-- Name: anggota_kelas anggota_kelas_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".anggota_kelas
    ADD CONSTRAINT anggota_kelas_kelas_id_fkey FOREIGN KEY (kelas_id) REFERENCES "20554021".kelas(id) ON DELETE CASCADE;


--
-- Name: anggota_kelas anggota_kelas_student_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".anggota_kelas
    ADD CONSTRAINT anggota_kelas_student_id_fkey FOREIGN KEY (student_id) REFERENCES "20554021".students(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_sesi fk_ekstrakurikuler; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_sesi
    ADD CONSTRAINT fk_ekstrakurikuler FOREIGN KEY (ekstrakurikuler_id) REFERENCES "20554021".ekstrakurikuler(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_sesi fk_pembina; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_sesi
    ADD CONSTRAINT fk_pembina FOREIGN KEY (pembina_id) REFERENCES "20554021".teachers(id) ON DELETE SET NULL;


--
-- Name: ekstrakurikuler_anggota fk_sesi; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_anggota
    ADD CONSTRAINT fk_sesi FOREIGN KEY (sesi_id) REFERENCES "20554021".ekstrakurikuler_sesi(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_anggota fk_student; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_anggota
    ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES "20554021".students(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_sesi fk_tahun_ajaran; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ekstrakurikuler_sesi
    ADD CONSTRAINT fk_tahun_ajaran FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554021".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: kelas kelas_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelas
    ADD CONSTRAINT kelas_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554021".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: kelas kelas_tingkatan_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelas
    ADD CONSTRAINT kelas_tingkatan_id_fkey FOREIGN KEY (tingkatan_id) REFERENCES "20554021".tingkatan(id) ON DELETE RESTRICT;


--
-- Name: kelas kelas_wali_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kelas
    ADD CONSTRAINT kelas_wali_kelas_id_fkey FOREIGN KEY (wali_kelas_id) REFERENCES "20554021".teachers(id) ON DELETE SET NULL;


--
-- Name: mata_pelajaran mata_pelajaran_kelompok_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_kelompok_id_fkey FOREIGN KEY (kelompok_id) REFERENCES "20554021".kelompok_mata_pelajaran(id) ON DELETE SET NULL;


--
-- Name: mata_pelajaran mata_pelajaran_parent_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES "20554021".mata_pelajaran(id) ON DELETE SET NULL;


--
-- Name: materi_pembelajaran materi_pembelajaran_pengajar_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".materi_pembelajaran
    ADD CONSTRAINT materi_pembelajaran_pengajar_kelas_id_fkey FOREIGN KEY (pengajar_kelas_id) REFERENCES "20554021".pengajar_kelas(id) ON DELETE CASCADE;


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554021".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_penilaian_sumatif_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_penilaian_sumatif_id_fkey FOREIGN KEY (penilaian_sumatif_id) REFERENCES "20554021".penilaian_sumatif(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_fase_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_fase_id_fkey FOREIGN KEY (fase_id) REFERENCES "20554021".fase(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_fkey FOREIGN KEY (tahun_ajaran_id, kurikulum_id) REFERENCES "20554021".tahun_ajaran_kurikulum(tahun_ajaran_id, kurikulum_id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_tingkatan_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_tingkatan_id_fkey FOREIGN KEY (tingkatan_id) REFERENCES "20554021".tingkatan(id) ON DELETE CASCADE;


--
-- Name: pengajar_kelas pengajar_kelas_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_kelas_id_fkey FOREIGN KEY (kelas_id) REFERENCES "20554021".kelas(id) ON DELETE CASCADE;


--
-- Name: pengajar_kelas pengajar_kelas_mata_pelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_mata_pelajaran_id_fkey FOREIGN KEY (mata_pelajaran_id) REFERENCES "20554021".mata_pelajaran(id) ON DELETE CASCADE;


--
-- Name: pengajar_kelas pengajar_kelas_teacher_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES "20554021".teachers(id) ON DELETE CASCADE;


--
-- Name: penilaian penilaian_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian
    ADD CONSTRAINT penilaian_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554021".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: penilaian_sumatif penilaian_sumatif_jenis_ujian_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_jenis_ujian_id_fkey FOREIGN KEY (jenis_ujian_id) REFERENCES "20554021".jenis_ujian(id) ON DELETE RESTRICT;


--
-- Name: penilaian_sumatif penilaian_sumatif_tujuan_pembelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_tujuan_pembelajaran_id_fkey FOREIGN KEY (tujuan_pembelajaran_id) REFERENCES "20554021".tujuan_pembelajaran(id) ON DELETE CASCADE;


--
-- Name: penilaian_sumatif penilaian_sumatif_ujian_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_ujian_id_fkey FOREIGN KEY (ujian_id) REFERENCES "20554021".ujian(id) ON DELETE CASCADE;


--
-- Name: penilaian penilaian_tujuan_pembelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".penilaian
    ADD CONSTRAINT penilaian_tujuan_pembelajaran_id_fkey FOREIGN KEY (tujuan_pembelajaran_id) REFERENCES "20554021".tujuan_pembelajaran(id) ON DELETE CASCADE;


--
-- Name: presensi presensi_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".presensi
    ADD CONSTRAINT presensi_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554021".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: prestasi_siswa prestasi_siswa_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".prestasi_siswa
    ADD CONSTRAINT prestasi_siswa_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554021".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: prestasi_siswa prestasi_siswa_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".prestasi_siswa
    ADD CONSTRAINT prestasi_siswa_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554021".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: riwayat_akademik riwayat_akademik_student_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".riwayat_akademik
    ADD CONSTRAINT riwayat_akademik_student_id_fkey FOREIGN KEY (student_id) REFERENCES "20554021".students(id) ON DELETE CASCADE;


--
-- Name: riwayat_kepegawaian riwayat_kepegawaian_teacher_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".riwayat_kepegawaian
    ADD CONSTRAINT riwayat_kepegawaian_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES "20554021".teachers(id) ON DELETE CASCADE;


--
-- Name: tahun_ajaran tahun_ajaran_kepala_sekolah_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_kepala_sekolah_id_fkey FOREIGN KEY (kepala_sekolah_id) REFERENCES "20554021".teachers(id) ON DELETE SET NULL;


--
-- Name: tahun_ajaran_kurikulum tahun_ajaran_kurikulum_kurikulum_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tahun_ajaran_kurikulum
    ADD CONSTRAINT tahun_ajaran_kurikulum_kurikulum_id_fkey FOREIGN KEY (kurikulum_id) REFERENCES "20554021".kurikulum(id) ON DELETE CASCADE;


--
-- Name: tahun_ajaran_kurikulum tahun_ajaran_kurikulum_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tahun_ajaran_kurikulum
    ADD CONSTRAINT tahun_ajaran_kurikulum_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554021".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES "20554021".users(id) ON DELETE CASCADE;


--
-- Name: tujuan_pembelajaran tujuan_pembelajaran_materi_pembelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tujuan_pembelajaran
    ADD CONSTRAINT tujuan_pembelajaran_materi_pembelajaran_id_fkey FOREIGN KEY (materi_pembelajaran_id) REFERENCES "20554021".materi_pembelajaran(id) ON DELETE CASCADE;


--
-- Name: ujian ujian_pengajar_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".ujian
    ADD CONSTRAINT ujian_pengajar_kelas_id_fkey FOREIGN KEY (pengajar_kelas_id) REFERENCES "20554021".pengajar_kelas(id) ON DELETE CASCADE;


--
-- Name: anggota_kelas anggota_kelas_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".anggota_kelas
    ADD CONSTRAINT anggota_kelas_kelas_id_fkey FOREIGN KEY (kelas_id) REFERENCES "20554022".kelas(id) ON DELETE CASCADE;


--
-- Name: anggota_kelas anggota_kelas_student_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".anggota_kelas
    ADD CONSTRAINT anggota_kelas_student_id_fkey FOREIGN KEY (student_id) REFERENCES "20554022".students(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_sesi fk_ekstrakurikuler; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_sesi
    ADD CONSTRAINT fk_ekstrakurikuler FOREIGN KEY (ekstrakurikuler_id) REFERENCES "20554022".ekstrakurikuler(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_sesi fk_pembina; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_sesi
    ADD CONSTRAINT fk_pembina FOREIGN KEY (pembina_id) REFERENCES "20554022".teachers(id) ON DELETE SET NULL;


--
-- Name: ekstrakurikuler_anggota fk_sesi; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_anggota
    ADD CONSTRAINT fk_sesi FOREIGN KEY (sesi_id) REFERENCES "20554022".ekstrakurikuler_sesi(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_anggota fk_student; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_anggota
    ADD CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES "20554022".students(id) ON DELETE CASCADE;


--
-- Name: ekstrakurikuler_sesi fk_tahun_ajaran; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ekstrakurikuler_sesi
    ADD CONSTRAINT fk_tahun_ajaran FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554022".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: kelas kelas_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelas
    ADD CONSTRAINT kelas_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554022".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: kelas kelas_tingkatan_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelas
    ADD CONSTRAINT kelas_tingkatan_id_fkey FOREIGN KEY (tingkatan_id) REFERENCES "20554022".tingkatan(id) ON DELETE RESTRICT;


--
-- Name: kelas kelas_wali_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".kelas
    ADD CONSTRAINT kelas_wali_kelas_id_fkey FOREIGN KEY (wali_kelas_id) REFERENCES "20554022".teachers(id) ON DELETE SET NULL;


--
-- Name: mata_pelajaran mata_pelajaran_kelompok_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_kelompok_id_fkey FOREIGN KEY (kelompok_id) REFERENCES "20554022".kelompok_mata_pelajaran(id) ON DELETE SET NULL;


--
-- Name: mata_pelajaran mata_pelajaran_parent_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".mata_pelajaran
    ADD CONSTRAINT mata_pelajaran_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES "20554022".mata_pelajaran(id) ON DELETE SET NULL;


--
-- Name: materi_pembelajaran materi_pembelajaran_pengajar_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".materi_pembelajaran
    ADD CONSTRAINT materi_pembelajaran_pengajar_kelas_id_fkey FOREIGN KEY (pengajar_kelas_id) REFERENCES "20554022".pengajar_kelas(id) ON DELETE CASCADE;


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554022".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: nilai_sumatif_siswa nilai_sumatif_siswa_penilaian_sumatif_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".nilai_sumatif_siswa
    ADD CONSTRAINT nilai_sumatif_siswa_penilaian_sumatif_id_fkey FOREIGN KEY (penilaian_sumatif_id) REFERENCES "20554022".penilaian_sumatif(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_fase_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_fase_id_fkey FOREIGN KEY (fase_id) REFERENCES "20554022".fase(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_fkey FOREIGN KEY (tahun_ajaran_id, kurikulum_id) REFERENCES "20554022".tahun_ajaran_kurikulum(tahun_ajaran_id, kurikulum_id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_tingkatan_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_tingkatan_id_fkey FOREIGN KEY (tingkatan_id) REFERENCES "20554022".tingkatan(id) ON DELETE CASCADE;


--
-- Name: pengajar_kelas pengajar_kelas_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_kelas_id_fkey FOREIGN KEY (kelas_id) REFERENCES "20554022".kelas(id) ON DELETE CASCADE;


--
-- Name: pengajar_kelas pengajar_kelas_mata_pelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_mata_pelajaran_id_fkey FOREIGN KEY (mata_pelajaran_id) REFERENCES "20554022".mata_pelajaran(id) ON DELETE CASCADE;


--
-- Name: pengajar_kelas pengajar_kelas_teacher_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".pengajar_kelas
    ADD CONSTRAINT pengajar_kelas_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES "20554022".teachers(id) ON DELETE CASCADE;


--
-- Name: penilaian penilaian_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian
    ADD CONSTRAINT penilaian_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554022".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: penilaian_sumatif penilaian_sumatif_jenis_ujian_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_jenis_ujian_id_fkey FOREIGN KEY (jenis_ujian_id) REFERENCES "20554022".jenis_ujian(id) ON DELETE RESTRICT;


--
-- Name: penilaian_sumatif penilaian_sumatif_tujuan_pembelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_tujuan_pembelajaran_id_fkey FOREIGN KEY (tujuan_pembelajaran_id) REFERENCES "20554022".tujuan_pembelajaran(id) ON DELETE CASCADE;


--
-- Name: penilaian_sumatif penilaian_sumatif_ujian_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian_sumatif
    ADD CONSTRAINT penilaian_sumatif_ujian_id_fkey FOREIGN KEY (ujian_id) REFERENCES "20554022".ujian(id) ON DELETE CASCADE;


--
-- Name: penilaian penilaian_tujuan_pembelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".penilaian
    ADD CONSTRAINT penilaian_tujuan_pembelajaran_id_fkey FOREIGN KEY (tujuan_pembelajaran_id) REFERENCES "20554022".tujuan_pembelajaran(id) ON DELETE CASCADE;


--
-- Name: presensi presensi_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".presensi
    ADD CONSTRAINT presensi_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554022".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: prestasi_siswa prestasi_siswa_anggota_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".prestasi_siswa
    ADD CONSTRAINT prestasi_siswa_anggota_kelas_id_fkey FOREIGN KEY (anggota_kelas_id) REFERENCES "20554022".anggota_kelas(id) ON DELETE CASCADE;


--
-- Name: prestasi_siswa prestasi_siswa_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".prestasi_siswa
    ADD CONSTRAINT prestasi_siswa_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554022".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: riwayat_akademik riwayat_akademik_student_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".riwayat_akademik
    ADD CONSTRAINT riwayat_akademik_student_id_fkey FOREIGN KEY (student_id) REFERENCES "20554022".students(id) ON DELETE CASCADE;


--
-- Name: riwayat_kepegawaian riwayat_kepegawaian_teacher_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".riwayat_kepegawaian
    ADD CONSTRAINT riwayat_kepegawaian_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES "20554022".teachers(id) ON DELETE CASCADE;


--
-- Name: tahun_ajaran tahun_ajaran_kepala_sekolah_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tahun_ajaran
    ADD CONSTRAINT tahun_ajaran_kepala_sekolah_id_fkey FOREIGN KEY (kepala_sekolah_id) REFERENCES "20554022".teachers(id) ON DELETE SET NULL;


--
-- Name: tahun_ajaran_kurikulum tahun_ajaran_kurikulum_kurikulum_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tahun_ajaran_kurikulum
    ADD CONSTRAINT tahun_ajaran_kurikulum_kurikulum_id_fkey FOREIGN KEY (kurikulum_id) REFERENCES "20554022".kurikulum(id) ON DELETE CASCADE;


--
-- Name: tahun_ajaran_kurikulum tahun_ajaran_kurikulum_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tahun_ajaran_kurikulum
    ADD CONSTRAINT tahun_ajaran_kurikulum_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554022".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES "20554022".users(id) ON DELETE CASCADE;


--
-- Name: tujuan_pembelajaran tujuan_pembelajaran_materi_pembelajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".tujuan_pembelajaran
    ADD CONSTRAINT tujuan_pembelajaran_materi_pembelajaran_id_fkey FOREIGN KEY (materi_pembelajaran_id) REFERENCES "20554022".materi_pembelajaran(id) ON DELETE CASCADE;


--
-- Name: ujian ujian_pengajar_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554022; Owner: postgres
--

ALTER TABLE ONLY "20554022".ujian
    ADD CONSTRAINT ujian_pengajar_kelas_id_fkey FOREIGN KEY (pengajar_kelas_id) REFERENCES "20554022".pengajar_kelas(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_naungan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_naungan_id_fkey FOREIGN KEY (naungan_id) REFERENCES public.naungan(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict UOqSBfZHnTHeNWKvFKOWTZ8NJU4jNgd0K5i9U3aVgxtMdW5Z4MFTfzvochzTWs7

