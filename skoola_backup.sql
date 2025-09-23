--
-- PostgreSQL database dump
--

\restrict tNA7cVeI2EgBXQUhZhNAhjDINAlg1KnFhEPyWZhUz1ddQo1vBVoU4rl4lXbOLYY

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
-- Name: tingkatan id; Type: DEFAULT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".tingkatan ALTER COLUMN id SET DEFAULT nextval('"20554021".tingkatan_id_seq'::regclass);


--
-- Data for Name: fase; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".fase (id, nama_fase, deskripsi) FROM stdin;
\.


--
-- Data for Name: jabatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jabatan (id, nama_jabatan, created_at, updated_at) FROM stdin;
1	Kepala Sekolah	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
2	Wakil Kepala Sekolah	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
3	Guru Kelas	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
4	Guru Mata Pelajaran	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
5	Staf Tata Usaha	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
\.


--
-- Data for Name: jenjang_pendidikan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".jenjang_pendidikan (id, nama_jenjang, created_at, updated_at) FROM stdin;
1	SD/MI	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
2	SMP/MTs	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
3	SMA/MA	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
4	SMK	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
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
\.


--
-- Data for Name: pemetaan_kurikulum; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".pemetaan_kurikulum (tahun_ajaran_id, kurikulum_id, tingkatan_id, fase_id) FROM stdin;
\.


--
-- Data for Name: profil_sekolah; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".profil_sekolah (id, npsn, nama_sekolah, naungan, alamat, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, jenjang_id) FROM stdin;
1	\N	SMAN JEMBER 1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: riwayat_akademik; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_akademik (id, student_id, status, tanggal_kejadian, kelas_tingkat, keterangan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: riwayat_kepegawaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at) FROM stdin;
f4e3362f-4fd0-40a4-b209-bb0856c15633	6d2e8665-0650-4fbe-9a37-1eb041bf855d	Aktif	2025-09-23	\N	\N	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".students (id, created_at, updated_at, nis, nisn, nomor_ujian_sekolah, nama_lengkap, nama_panggilan, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, alamat_lengkap, desa_kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, nama_ayah, nama_ibu, nama_wali, nomor_kontak_wali) FROM stdin;
\.


--
-- Data for Name: tahun_ajaran; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tahun_ajaran (id, nama_tahun_ajaran, semester, status, metode_absensi, kepala_sekolah_id, created_at, updated_at) FROM stdin;
605ded6e-e573-425d-9927-507ec6cbf593	2024/2025	Genap	Tidak Aktif	HARIAN	\N	2025-09-23 09:13:16.395911+07	2025-09-23 09:13:20.232857+07
acf43b78-8aa8-4fd8-80b2-ae3369688da9	2024/2025	Ganjil	Aktif	HARIAN	\N	2025-09-23 09:13:04.580081+07	2025-09-23 09:13:21.209469+07
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".teachers (id, user_id, nama_lengkap, nip_nuptk, alamat_lengkap, no_hp, created_at, updated_at, nama_panggilan, gelar_akademik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, kode_pos) FROM stdin;
6d2e8665-0650-4fbe-9a37-1eb041bf855d	ce693380-abb8-4694-a8ff-936e40fb20a9	adminsmanegeri1	\N	\N	\N	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tingkatan; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".tingkatan (id, nama_tingkatan, urutan, created_at, updated_at) FROM stdin;
1	Kelas 1	1	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
2	Kelas 2	2	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
3	Kelas 3	3	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
4	Kelas 4	4	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
5	Kelas 5	5	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
6	Kelas 6	6	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
ce693380-abb8-4694-a8ff-936e40fb20a9	adminsmanegeri1@gmail.com	$2a$10$kUV4Xj1i7aiGMmQb7CcmFen.6.ACwzsnjT7WHVlnsR1u2dQxr06DO	admin	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:40.061988+07
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
d6372db8-1959-414b-bd3b-a2558857b1f6	SMAN JEMBER 1	20554021	2025-09-23 09:05:30.179703+07	2025-09-23 09:05:30.179703+07	912ac329-05cd-401f-ad1e-4bf92e7877de
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
-- Name: jenjang_pendidikan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".jenjang_pendidikan_id_seq', 4, true);


--
-- Name: kurikulum_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".kurikulum_id_seq', 3, true);


--
-- Name: tingkatan_id_seq; Type: SEQUENCE SET; Schema: 20554021; Owner: postgres
--

SELECT pg_catalog.setval('"20554021".tingkatan_id_seq', 6, true);


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
-- Name: pemetaan_kurikulum pemetaan_kurikulum_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_pkey PRIMARY KEY (tahun_ajaran_id, kurikulum_id, tingkatan_id);


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
-- Name: idx_jabatan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jabatan_nama ON "20554021".jabatan USING btree (nama_jabatan);


--
-- Name: idx_jenjang_pendidikan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_jenjang_pendidikan_nama ON "20554021".jenjang_pendidikan USING btree (nama_jenjang);


--
-- Name: idx_mata_pelajaran_nama_mapel; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_mata_pelajaran_nama_mapel ON "20554021".mata_pelajaran USING btree (nama_mapel);


--
-- Name: idx_pemetaan_kurikulum_kurikulum; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_pemetaan_kurikulum_kurikulum ON "20554021".pemetaan_kurikulum USING btree (kurikulum_id);


--
-- Name: idx_pemetaan_kurikulum_tahun_ajaran; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_pemetaan_kurikulum_tahun_ajaran ON "20554021".pemetaan_kurikulum USING btree (tahun_ajaran_id);


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
-- Name: idx_tingkatan_nama; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_tingkatan_nama ON "20554021".tingkatan USING btree (nama_tingkatan);


--
-- Name: idx_tenants_naungan_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_naungan_id ON public.tenants USING btree (naungan_id);


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_fase_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_fase_id_fkey FOREIGN KEY (fase_id) REFERENCES "20554021".fase(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_kurikulum_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_kurikulum_id_fkey FOREIGN KEY (kurikulum_id) REFERENCES "20554021".kurikulum(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_tahun_ajaran_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_tahun_ajaran_id_fkey FOREIGN KEY (tahun_ajaran_id) REFERENCES "20554021".tahun_ajaran(id) ON DELETE CASCADE;


--
-- Name: pemetaan_kurikulum pemetaan_kurikulum_tingkatan_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".pemetaan_kurikulum
    ADD CONSTRAINT pemetaan_kurikulum_tingkatan_id_fkey FOREIGN KEY (tingkatan_id) REFERENCES "20554021".tingkatan(id) ON DELETE CASCADE;


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
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES "20554021".users(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_naungan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_naungan_id_fkey FOREIGN KEY (naungan_id) REFERENCES public.naungan(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict tNA7cVeI2EgBXQUhZhNAhjDINAlg1KnFhEPyWZhUz1ddQo1vBVoU4rl4lXbOLYY

