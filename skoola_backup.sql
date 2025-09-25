--
-- PostgreSQL database dump
--

\restrict IhSwb9A5J6I8AcVwpAsLHgycUGb21agX7fYI3oWuX6x70PIflqnAdhSJCdsxwrh

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
    created_at timestamp with time zone DEFAULT now()
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
    updated_at timestamp with time zone DEFAULT now()
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
    nomor_ujian_sekolah character varying(50),
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
    nomor_kontak_wali character varying(20)
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
-- Name: jenjang_pendidikan id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".jenjang_pendidikan ALTER COLUMN id SET DEFAULT nextval('"20554021".jenjang_pendidikan_id_seq'::regclass);


--
-- Name: kurikulum id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".kurikulum ALTER COLUMN id SET DEFAULT nextval('"20554021".kurikulum_id_seq'::regclass);


--
-- Name: materi_pembelajaran id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".materi_pembelajaran ALTER COLUMN id SET DEFAULT nextval('"20554021".materi_pembelajaran_id_seq'::regclass);


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
-- Data for Name: anggota_kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".anggota_kelas (id, kelas_id, student_id, created_at) FROM stdin;
87cde373-f259-4524-bbe8-390275603d80	8bafbf27-aa3c-4d7f-a278-a43a00ab4bcb	9907c66b-69a1-46d7-bd2b-05a5d405112d	2025-09-24 17:00:37.183184+07
4c10172a-44fc-4eb3-8895-46f5dfbc7308	8bafbf27-aa3c-4d7f-a278-a43a00ab4bcb	34128ab2-d972-460c-85c5-6cef84f9150f	2025-09-24 17:03:13.525179+07
\.


--
-- Data for Name: fase; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".fase (id, nama_fase, deskripsi) FROM stdin;
1	Fase A	
\.


--
-- Data for Name: jabatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jabatan (id, nama_jabatan, created_at, updated_at) FROM stdin;
1	Kepala Sekolah	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
2	Wakil Kepala Sekolah	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
3	Guru Kelas	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
4	Guru Mata Pelajaran	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
5	Staf Tata Usaha	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
\.


--
-- Data for Name: jenjang_pendidikan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jenjang_pendidikan (id, nama_jenjang, created_at, updated_at) FROM stdin;
1	SD/MI	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
2	SMP/MTs	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
3	SMA/MA	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
4	SMK	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
\.


--
-- Data for Name: kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kelas (id, nama_kelas, tahun_ajaran_id, tingkatan_id, wali_kelas_id, created_at, updated_at) FROM stdin;
8bafbf27-aa3c-4d7f-a278-a43a00ab4bcb	Kelas 1A	55fbaaf4-0859-448f-8825-7d1853f8780a	1	1a72b1ca-76ca-4a5b-aced-e51c9319a990	2025-09-24 17:00:30.807222+07	2025-09-24 17:00:30.807222+07
\.


--
-- Data for Name: kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".kurikulum (id, nama_kurikulum, deskripsi) FROM stdin;
1	Kurikulum Merdeka	
\.


--
-- Data for Name: mata_pelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".mata_pelajaran (id, kode_mapel, nama_mapel, created_at, updated_at) FROM stdin;
fe9de975-97d3-4205-8bda-9005a97b91c7	MTK	Matematika	2025-09-24 17:00:06.881817+07	2025-09-24 17:00:06.881817+07
\.


--
-- Data for Name: materi_pembelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".materi_pembelajaran (id, pengajar_kelas_id, nama_materi, deskripsi, urutan, created_at, updated_at) FROM stdin;
10	552bbd75-fba9-41f4-8922-dc3e1876732b	Bangun ruang	\N	1	2025-09-25 01:07:03.316538+07	2025-09-25 01:07:12.463768+07
11	552bbd75-fba9-41f4-8922-dc3e1876732b	Bangun datar	\N	2	2025-09-25 01:07:14.787758+07	2025-09-25 01:07:23.202572+07
\.


--
-- Data for Name: pemetaan_kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".pemetaan_kurikulum (tahun_ajaran_id, kurikulum_id, tingkatan_id, fase_id) FROM stdin;
55fbaaf4-0859-448f-8825-7d1853f8780a	1	1	1
\.


--
-- Data for Name: pengajar_kelas; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".pengajar_kelas (id, kelas_id, teacher_id, mata_pelajaran_id, created_at) FROM stdin;
552bbd75-fba9-41f4-8922-dc3e1876732b	8bafbf27-aa3c-4d7f-a278-a43a00ab4bcb	1a72b1ca-76ca-4a5b-aced-e51c9319a990	fe9de975-97d3-4205-8bda-9005a97b91c7	2025-09-24 17:00:43.512666+07
\.


--
-- Data for Name: penilaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".penilaian (id, anggota_kelas_id, tujuan_pembelajaran_id, nilai, created_at, updated_at) FROM stdin;
43	87cde373-f259-4524-bbe8-390275603d80	19	100.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
44	87cde373-f259-4524-bbe8-390275603d80	20	70.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
61	87cde373-f259-4524-bbe8-390275603d80	23	\N	2025-09-25 01:13:44.038791+07	2025-09-25 05:45:45.330323+07
45	87cde373-f259-4524-bbe8-390275603d80	21	90.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
46	87cde373-f259-4524-bbe8-390275603d80	22	89.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
64	87cde373-f259-4524-bbe8-390275603d80	24	\N	2025-09-25 01:13:44.038791+07	2025-09-25 05:45:45.330323+07
47	4c10172a-44fc-4eb3-8895-46f5dfbc7308	19	80.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
48	4c10172a-44fc-4eb3-8895-46f5dfbc7308	20	86.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
67	4c10172a-44fc-4eb3-8895-46f5dfbc7308	23	\N	2025-09-25 01:13:44.038791+07	2025-09-25 05:45:45.330323+07
49	4c10172a-44fc-4eb3-8895-46f5dfbc7308	21	99.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
50	4c10172a-44fc-4eb3-8895-46f5dfbc7308	22	88.00	2025-09-25 01:09:01.313208+07	2025-09-25 05:45:45.330323+07
70	4c10172a-44fc-4eb3-8895-46f5dfbc7308	24	\N	2025-09-25 01:13:44.038791+07	2025-09-25 05:45:45.330323+07
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
fec85ba2-ab37-476e-b51d-1ccc1fdc2192	9907c66b-69a1-46d7-bd2b-05a5d405112d	Aktif	2025-09-24	\N	Siswa baru	2025-09-24 17:00:22.586004+07	2025-09-24 17:00:22.586004+07
9c539902-788a-4a67-8cea-81cdc6e0a15c	34128ab2-d972-460c-85c5-6cef84f9150f	Aktif	2025-09-24	\N	Siswa baru	2025-09-24 17:03:05.918712+07	2025-09-24 17:03:05.918712+07
\.


--
-- Data for Name: riwayat_kepegawaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at) FROM stdin;
7f3d0db0-1caa-463c-9a19-f16e83b3e714	95557f99-9c78-4f46-a325-5867a7f1f279	Aktif	2025-09-24	\N	\N	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
225e4a1d-1f2b-4cf8-8474-21089d240672	1a72b1ca-76ca-4a5b-aced-e51c9319a990	Aktif	2025-09-24	\N	\N	2025-09-24 17:00:15.381295+07	2025-09-24 17:00:15.381295+07
a14b3b71-43a2-4451-8798-ab82417f72d6	5eba38a2-6e10-4adb-830e-08ebd8b9a818	Aktif	2025-09-25	\N	\N	2025-09-25 03:24:50.12668+07	2025-09-25 03:24:50.12668+07
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".students (id, created_at, updated_at, nis, nisn, nomor_ujian_sekolah, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali) FROM stdin;
9907c66b-69a1-46d7-bd2b-05a5d405112d	2025-09-24 17:00:22.586004+07	2025-09-24 17:00:22.586004+07	\N	\N	\N	Budi Susanto	\N	Laki-laki	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
34128ab2-d972-460c-85c5-6cef84f9150f	2025-09-24 17:03:05.918712+07	2025-09-25 03:36:54.30846+07	\N	\N	\N	Jokowi	\N	Laki-laki	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tahun_ajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tahun_ajaran (id, nama_tahun_ajaran, semester, status, metode_absensi, kepala_sekolah_id, created_at, updated_at) FROM stdin;
55fbaaf4-0859-448f-8825-7d1853f8780a	2024/2025	Ganjil	Aktif	HARIAN	\N	2025-09-24 16:59:47.471588+07	2025-09-24 16:59:47.471588+07
\.


--
-- Data for Name: tahun_ajaran_kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tahun_ajaran_kurikulum (tahun_ajaran_id, kurikulum_id) FROM stdin;
55fbaaf4-0859-448f-8825-7d1853f8780a	1
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".teachers (id, user_id, nama_lengkap, nip_nuptk, alamat_lengkap, no_hp, created_at, updated_at, nama_panggilan, gelar_akademik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, kode_pos) FROM stdin;
95557f99-9c78-4f46-a325-5867a7f1f279	4f04bf11-0196-4697-b27a-c5b040842cc3	Admin Nurul Huda	\N	\N	\N	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1a72b1ca-76ca-4a5b-aced-e51c9319a990	be393932-2d79-42eb-8b28-743e9620cb14	Fahmi	\N	\N	\N	2025-09-24 17:00:15.381295+07	2025-09-25 01:27:33.275986+07	\N	S.Pd	Laki-laki	\N	\N	\N	\N	\N	\N	\N	\N	\N
5eba38a2-6e10-4adb-830e-08ebd8b9a818	9cbf7fe8-64a6-4501-bd2d-9a8fb641cfc7	Patek Bleyer	\N	\N	\N	2025-09-25 03:24:50.12668+07	2025-09-25 03:25:12.804066+07	\N	P.Df	Perempuan	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tingkatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tingkatan (id, nama_tingkatan, urutan, created_at, updated_at) FROM stdin;
1	Kelas 1	1	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
2	Kelas 2	2	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
3	Kelas 3	3	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
4	Kelas 4	4	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
5	Kelas 5	5	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
6	Kelas 6	6	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
\.


--
-- Data for Name: tujuan_pembelajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tujuan_pembelajaran (id, materi_pembelajaran_id, deskripsi_tujuan, urutan, created_at, updated_at) FROM stdin;
19	10	Pengertian Bangun Ruang	1	2025-09-25 01:07:24.967225+07	2025-09-25 01:08:08.383343+07
20	10	Rumus Bangun Ruang	2	2025-09-25 01:07:34.473506+07	2025-09-25 01:08:15.473878+07
23	10	Permasalahan Bangun Ruang	3	2025-09-25 01:12:21.040034+07	2025-09-25 01:12:32.740647+07
21	11	Penertian Bangun Datar	1	2025-09-25 01:07:41.954626+07	2025-09-25 01:07:50.591874+07
22	11	Rumus Bangun Datar	2	2025-09-25 01:07:52.010967+07	2025-09-25 01:07:58.434694+07
24	11	Permasalahan Bangun Datar	3	2025-09-25 01:12:54.777862+07	2025-09-25 01:13:07.211817+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
4f04bf11-0196-4697-b27a-c5b040842cc3	admin.sdnu03@gmail.com	$2a$10$q0ZoXv0cJveAjT8G59ZHYOLyqoUfBFvjV.wPAWjsbLI05UHOGQ51S	admin	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07
be393932-2d79-42eb-8b28-743e9620cb14	fahmi.andi@email.com	$2a$10$dNtefQb.sc3w5bQqC2KzVu9BZySLtHPm.43mAeGx6Vb6rQIBe1LwS	teacher	2025-09-24 17:00:15.381295+07	2025-09-24 17:00:15.381295+07
9cbf7fe8-64a6-4501-bd2d-9a8fb641cfc7	patekblayer@email.com	$2a$10$urmuuYGIO4B.fHeP9EvxK.yFOkZdgIl8M89mxADKpBMXrqSbbKpL2	teacher	2025-09-25 03:24:50.12668+07	2025-09-25 03:24:50.12668+07
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
d1701a15-2bef-4136-833f-3b6e45575909	SD NU 03 NURUL HUDA	20554021	2025-09-24 16:59:07.539044+07	2025-09-24 16:59:07.539044+07	912ac329-05cd-401f-ad1e-4bf92e7877de
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

SELECT pg_catalog.setval('"20554021".fase_id_seq', 1, true);


--
-- Name: jabatan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".jabatan_id_seq', 5, true);


--
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".jenjang_pendidikan_id_seq', 4, true);


--
-- Name: kurikulum_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".kurikulum_id_seq', 1, true);


--
-- Name: materi_pembelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".materi_pembelajaran_id_seq', 11, true);


--
-- Name: penilaian_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".penilaian_id_seq', 130, true);


--
-- Name: tingkatan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".tingkatan_id_seq', 6, true);


--
-- Name: tujuan_pembelajaran_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".tujuan_pembelajaran_id_seq', 24, true);


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
-- Name: idx_jabatan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jabatan_nama ON "20554021".jabatan USING btree (nama_jabatan);


--
-- Name: idx_jenjang_pendidikan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jenjang_pendidikan_nama ON "20554021".jenjang_pendidikan USING btree (nama_jenjang);


--
-- Name: idx_kelas_tahun_ajaran_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_kelas_tahun_ajaran_id ON "20554021".kelas USING btree (tahun_ajaran_id);


--
-- Name: idx_mata_pelajaran_nama_mapel; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_nama_mapel ON "20554021".mata_pelajaran USING btree (nama_mapel);


--
-- Name: idx_materi_pembelajaran_pengajar_kelas_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_materi_pembelajaran_pengajar_kelas_id ON "20554021".materi_pembelajaran USING btree (pengajar_kelas_id);


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
-- Name: materi_pembelajaran materi_pembelajaran_pengajar_kelas_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".materi_pembelajaran
    ADD CONSTRAINT materi_pembelajaran_pengajar_kelas_id_fkey FOREIGN KEY (pengajar_kelas_id) REFERENCES "20554021".pengajar_kelas(id) ON DELETE CASCADE;


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
-- Name: tenants tenants_naungan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_naungan_id_fkey FOREIGN KEY (naungan_id) REFERENCES public.naungan(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict IhSwb9A5J6I8AcVwpAsLHgycUGb21agX7fYI3oWuX6x70PIflqnAdhSJCdsxwrh

