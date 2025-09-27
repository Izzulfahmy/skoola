--
-- PostgreSQL database dump
--

\restrict 3yKVQJXPzbfdeQa3nRTQ9wxYwhPw7f5zYhNCOOA6gR9kfgNkIjWWgsYkp7kAtwg

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
-- Name: status_siswa_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".status_siswa_enum AS ENUM (
    'Aktif',
    'Lulus',
    'Pindah',
    'Keluar'
);


ALTER TYPE "20554021".status_siswa_enum OWNER TO postgres;

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
-- Data for Name: anggota_kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".anggota_kelas (id, kelas_id, student_id, created_at, urutan) FROM stdin;
ff365a12-6999-4c82-9156-1db85298693e	2fd766d6-a0da-4b25-add4-ffbe5c8a7dea	c9953b7d-6b83-4d44-a22b-f7209e25996c	2025-09-27 17:35:13.574122+07	1
bbb5aef8-50d7-47c1-9a63-2e9060c16fcf	2fd766d6-a0da-4b25-add4-ffbe5c8a7dea	b37a0306-df35-4bd7-9983-aca2cb34e804	2025-09-27 14:27:06.070066+07	2
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
1	Kepala Sekolah	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
2	Wakil Kepala Sekolah	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
3	Guru Kelas	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
4	Guru Mata Pelajaran	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
5	Staf Tata Usaha	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
\.


--
-- Data for Name: jenis_ujian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jenis_ujian (id, kode_ujian, nama_ujian, created_at, updated_at) FROM stdin;
1	UH	Ulangan Harian	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
2	PR	Pekerjaan Rumah	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
3	TGS	Tugas	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
4	PRA	Praktik	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
5	STS	Sumatif Tengah Semester	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
6	SAS	Sumatif Akhir Semester	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
7	RMD	Remidial	2025-09-27 14:46:33.502762+07	2025-09-27 14:46:33.502762+07
\.


--
-- Data for Name: jenjang_pendidikan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jenjang_pendidikan (id, nama_jenjang, created_at, updated_at) FROM stdin;
1	SD/MI	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
2	SMP/MTs	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
3	SMA/MA	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
4	SMK	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
\.


--
-- Data for Name: kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kelas (id, nama_kelas, tahun_ajaran_id, tingkatan_id, wali_kelas_id, created_at, updated_at) FROM stdin;
2fd766d6-a0da-4b25-add4-ffbe5c8a7dea	Kelas 1A	d06032e3-345c-4b35-a7b5-37b282fbb10f	1	c97f5565-a6e3-42c8-9729-c9dade9375b9	2025-09-27 14:26:59.738795+07	2025-09-27 14:26:59.738795+07
\.


--
-- Data for Name: kelompok_mata_pelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kelompok_mata_pelajaran (id, nama_kelompok, urutan, created_at, updated_at) FROM stdin;
1	Mata Pelajaran Umum	1	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
2	Mata Pelajaran Muatan Lokal	2	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
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
acbf9233-6567-429c-97c5-0cc8ae3e4b87	MTK	Matematika	2025-09-27 14:26:34.862668+07	2025-09-27 14:26:34.862668+07	\N	1	1
\.


--
-- Data for Name: materi_pembelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".materi_pembelajaran (id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at) FROM stdin;
3	1922577a-3ca5-4d4e-81f9-eb8ccbecb207	Pytagoras	\N	2	2025-09-27 17:32:17.79403+07	2025-09-27 17:32:26.011462+07
1	1922577a-3ca5-4d4e-81f9-eb8ccbecb207	Bangun Ruang	\N	1	2025-09-27 14:27:18.50156+07	2025-09-28 00:08:17.299225+07
\.


--
-- Data for Name: nilai_sumatif_siswa; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".nilai_sumatif_siswa (id, penilaian_sumatif_id, anggota_kelas_id, nilai, created_at, updated_at) FROM stdin;
1	252c7dc6-dd09-48fc-a98a-5b988979e957	bbb5aef8-50d7-47c1-9a63-2e9060c16fcf	80.00	2025-09-27 14:51:11.925372+07	2025-09-27 14:51:11.925372+07
2	2fef4b1e-6754-43e8-9e67-f9ec937e191e	bbb5aef8-50d7-47c1-9a63-2e9060c16fcf	90.00	2025-09-27 14:51:11.925372+07	2025-09-27 14:51:11.925372+07
4	0520a6f7-15de-4d15-9270-65151e96088c	ff365a12-6999-4c82-9156-1db85298693e	70.00	2025-09-28 00:47:42.525899+07	2025-09-28 00:47:42.525899+07
3	0520a6f7-15de-4d15-9270-65151e96088c	bbb5aef8-50d7-47c1-9a63-2e9060c16fcf	89.00	2025-09-27 15:55:23.794192+07	2025-09-28 00:47:49.725881+07
6	252c7dc6-dd09-48fc-a98a-5b988979e957	ff365a12-6999-4c82-9156-1db85298693e	78.00	2025-09-28 00:47:59.880021+07	2025-09-28 00:47:59.880021+07
7	2fef4b1e-6754-43e8-9e67-f9ec937e191e	ff365a12-6999-4c82-9156-1db85298693e	56.00	2025-09-28 00:47:59.880021+07	2025-09-28 00:47:59.880021+07
8	c1aff93d-5e72-420f-836f-a1af0a0b511e	ff365a12-6999-4c82-9156-1db85298693e	56.00	2025-09-28 00:48:46.422414+07	2025-09-28 00:48:46.422414+07
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
1922577a-3ca5-4d4e-81f9-eb8ccbecb207	2fd766d6-a0da-4b25-add4-ffbe5c8a7dea	c97f5565-a6e3-42c8-9729-c9dade9375b9	acbf9233-6567-429c-97c5-0cc8ae3e4b87	2025-09-27 14:27:12.810297+07
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
0520a6f7-15de-4d15-9270-65151e96088c	1	2	Buku Tulis	2025-09-24	\N	2025-09-27 14:36:16.206388+07	2025-09-27 14:36:16.206388+07	\N
252c7dc6-dd09-48fc-a98a-5b988979e957	\N	5	Penilaian Ujian Sekolah	2025-09-29	\N	2025-09-27 14:28:00.634927+07	2025-09-27 14:42:18.323146+07	1
2fef4b1e-6754-43e8-9e67-f9ec937e191e	\N	7	Buku Tulis	2025-10-07	\N	2025-09-27 14:46:52.841866+07	2025-09-27 14:46:52.841866+07	1
a5edcda6-c5dd-414b-a567-ac250d26fbe7	3	3	Buku Tulis	2025-10-01	\N	2025-09-27 17:32:47.573817+07	2025-09-27 17:32:47.573817+07	\N
c1aff93d-5e72-420f-836f-a1af0a0b511e	1	4	Menggambar	2025-10-01	\N	2025-09-28 00:48:35.158128+07	2025-09-28 00:48:35.158128+07	\N
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
d9aae507-5d96-4b78-a960-63391714e719	b37a0306-df35-4bd7-9983-aca2cb34e804	Aktif	2025-09-27	\N	Siswa baru	2025-09-27 14:26:52.195338+07	2025-09-27 14:26:52.195338+07
b8a5ae3a-6c8e-42c4-9b89-4773ad44e722	c9953b7d-6b83-4d44-a22b-f7209e25996c	Aktif	2025-09-27	\N	Siswa baru	2025-09-27 17:35:05.681862+07	2025-09-27 17:35:05.681862+07
\.


--
-- Data for Name: riwayat_kepegawaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at) FROM stdin;
3a1da74d-2313-44e7-8b8e-22f4e5d92b2b	4a51c0ef-12f0-42f2-8d09-41f69a73b6ec	Aktif	2025-09-27	\N	\N	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
8944293c-c0c2-453a-90bb-79f508518189	c97f5565-a6e3-42c8-9729-c9dade9375b9	Aktif	2025-09-27	\N	\N	2025-09-27 14:26:45.125114+07	2025-09-27 14:26:45.125114+07
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".students (id, created_at, updated_at, nis, nisn, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali, pekerjaan_ayah, alamat_ayah, pekerjaan_ibu, alamat_ibu, pekerjaan_wali, alamat_wali) FROM stdin;
b37a0306-df35-4bd7-9983-aca2cb34e804	2025-09-27 14:26:52.195338+07	2025-09-27 14:26:52.195338+07	\N	\N	Jokowi	\N	Laki-laki	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c9953b7d-6b83-4d44-a22b-f7209e25996c	2025-09-27 17:35:05.681862+07	2025-09-27 17:35:05.681862+07	\N	\N	Prabowo	\N	Laki-laki	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tahun_ajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tahun_ajaran (id, nama_tahun_ajaran, semester, status, metode_absensi, kepala_sekolah_id, created_at, updated_at) FROM stdin;
d06032e3-345c-4b35-a7b5-37b282fbb10f	2024/2025	Ganjil	Aktif	HARIAN	\N	2025-09-27 14:26:25.842896+07	2025-09-27 14:26:25.842896+07
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
4a51c0ef-12f0-42f2-8d09-41f69a73b6ec	1fc6bf7b-c0bc-438a-92d7-933d91a8bcc8	Admin Nurul Huda	\N	\N	\N	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c97f5565-a6e3-42c8-9729-c9dade9375b9	f149a578-8a30-4b22-a738-cd6afe5d09cb	Fahmi	\N	\N	\N	2025-09-27 14:26:45.125114+07	2025-09-27 14:26:45.125114+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tingkatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tingkatan (id, nama_tingkatan, urutan, created_at, updated_at) FROM stdin;
1	Kelas 1	1	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
2	Kelas 2	2	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
3	Kelas 3	3	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
4	Kelas 4	4	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
5	Kelas 5	5	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
6	Kelas 6	6	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
\.


--
-- Data for Name: tujuan_pembelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tujuan_pembelajaran (id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at) FROM stdin;
1	1	Pengertian	1	2025-09-27 14:28:10.562184+07	2025-09-27 16:43:51.239488+07
3	3	Pengertian	1	2025-09-27 17:32:27.594048+07	2025-09-27 17:32:36.23908+07
4	3	Contoh Permasalahan	2	2025-09-27 17:33:13.515057+07	2025-09-27 17:33:24.589304+07
5	1	Rumus	2	2025-09-28 00:49:04.792695+07	2025-09-28 00:49:16.934139+07
\.


--
-- Data for Name: ujian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".ujian (id, pengajar_kelas_id, nama_ujian, urutan, created_at, updated_at) FROM stdin;
1	1922577a-3ca5-4d4e-81f9-eb8ccbecb207	Ujian	2	2025-09-27 14:27:21.330674+07	2025-09-27 16:48:52.963348+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
1fc6bf7b-c0bc-438a-92d7-933d91a8bcc8	admin.sdnu03@gmail.com	$2a$10$TI4bCj/my0ru7el2QxXjjuqSpT4aQPXPCVRrlW567IwIj4mp1PEzK	admin	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07
f149a578-8a30-4b22-a738-cd6afe5d09cb	fahmi.andi@email.com	$2a$10$tEr00De2hk6EddsjfIL/DOeEtgjKtLtYL82urmbQLtLYqKYiFD.Pq	teacher	2025-09-27 14:26:45.125114+07	2025-09-27 14:26:45.125114+07
\.


--
-- Data for Name: naungan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.naungan (id, nama_naungan, created_at, updated_at) FROM stdin;
912ac329-05cd-401f-ad1e-4bf92e7877de	Yayasan Pondok Pesantren Islam Bintang Sembilan	2025-09-22 11:16:06.114416+07	2025-09-22 20:27:13.278304+07
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, nama_sekolah, schema_name, created_at, updated_at, naungan_id) FROM stdin;
a72120a3-c13b-4d3b-ae47-5782aa8b1acf	SD NU 03 NURUL HUDA	20554021	2025-09-27 14:26:03.065381+07	2025-09-27 14:26:03.065381+07	912ac329-05cd-401f-ad1e-4bf92e7877de
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
dad01df5-1937-48cf-829a-7c0446f4f760	superadmin@skoola.com	$2a$10$zyDKgGO5pqFHaDLiEjVuReurOF5G7r.CFeXCvii7VE2JT3Egs8/GW	superadmin	2025-09-18 16:23:58.296655+07	2025-09-18 16:23:58.296655+07
\.


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

SELECT pg_catalog.setval('"20554021".jenis_ujian_id_seq', 7, true);


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

SELECT pg_catalog.setval('"20554021".materi_pembelajaran_id_seq', 3, true);


--
-- Name: nilai_sumatif_siswa_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".nilai_sumatif_siswa_id_seq', 8, true);


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

SELECT pg_catalog.setval('"20554021".tujuan_pembelajaran_id_seq', 5, true);


--
-- Name: ujian_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".ujian_id_seq', 1, true);


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
-- Name: tenants tenants_naungan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_naungan_id_fkey FOREIGN KEY (naungan_id) REFERENCES public.naungan(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 3yKVQJXPzbfdeQa3nRTQ9wxYwhPw7f5zYhNCOOA6gR9kfgNkIjWWgsYkp7kAtwg

