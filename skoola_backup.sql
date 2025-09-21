--
-- PostgreSQL database dump
--

\restrict e5HRRwBfzcQm2DwE88iC452H4rz48DB5uCcPCgZmrU1Q1OWibwXblFjEWOPA8Kr

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
-- Name: jenis_kelamin_enum; Type: TYPE; Schema: 20554021; Owner: postgres
--

CREATE TYPE "20554021".jenis_kelamin_enum AS ENUM (
    'Laki-laki',
    'Perempuan'
);


ALTER TYPE "20554021".jenis_kelamin_enum OWNER TO postgres;

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
    id uuid NOT NULL,
    nama_lengkap character varying(255) NOT NULL,
    nis character varying(50),
    nisn character varying(50),
    alamat text,
    nama_wali character varying(255),
    nomor_telepon_wali character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE "20554021".students OWNER TO postgres;

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
-- Name: foundations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foundations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_yayasan character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.foundations OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nama_sekolah character varying(255) NOT NULL,
    schema_name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    foundation_id uuid
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
-- Data for Name: profil_sekolah; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".profil_sekolah (id, npsn, nama_sekolah, naungan, alamat, kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, telepon, email, website, kepala_sekolah, jenjang_id) FROM stdin;
1	\N	SD NU 03 NURUL HUDA	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: riwayat_kepegawaian; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".riwayat_kepegawaian (id, teacher_id, status, tanggal_mulai, tanggal_selesai, keterangan, created_at, updated_at) FROM stdin;
6c9c4d77-701a-4f47-8a4d-4d246e985964	ecc4844c-0c05-4e8a-a128-316aa87b6915	Aktif	2025-09-21	\N	\N	2025-09-21 08:02:52.376391+07	2025-09-21 08:02:52.376391+07
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".students (id, nama_lengkap, nis, nisn, alamat, nama_wali, nomor_telepon_wali, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".teachers (id, user_id, nama_lengkap, nip_nuptk, alamat_lengkap, no_hp, created_at, updated_at, nama_panggilan, gelar_akademik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, provinsi, kota_kabupaten, kecamatan, desa_kelurahan, kode_pos) FROM stdin;
ecc4844c-0c05-4e8a-a128-316aa87b6915	abce154b-07f8-4dd2-acfe-b053b94a0285	Admin Nurul Huda	\N	\N	\N	2025-09-21 08:02:52.376391+07	2025-09-21 08:02:52.376391+07	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: 20554021; Owner: postgres
--

COPY "20554021".users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
abce154b-07f8-4dd2-acfe-b053b94a0285	admin.sdnu03@gmail.com	$2a$10$EqYqKXuOHChlMfixrzxiDezyhzRqED/FeEPV5fRI.1iE8XSHpSnp.	admin	2025-09-21 08:02:52.376391+07	2025-09-21 08:02:52.376391+07
\.


--
-- Data for Name: foundations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foundations (id, nama_yayasan, created_at, updated_at) FROM stdin;
94eed33a-73ac-4086-bce6-103f4e129b5b	Yayasan Pondok Pesantren Bintang Sembilan	2025-09-21 07:48:06.58815+07	2025-09-21 07:48:06.58815+07
8638594c-c331-460b-8442-88b2c02b7933	Yayasan Ceria Bakti	2025-09-21 08:16:07.724738+07	2025-09-21 08:16:07.724738+07
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, nama_sekolah, schema_name, created_at, updated_at, foundation_id) FROM stdin;
b08f4e2d-773a-4922-837f-467dd2a4c727	SD NU 03 NURUL HUDA	20554021	2025-09-21 08:02:52.376391+07	2025-09-21 08:02:52.376391+07	94eed33a-73ac-4086-bce6-103f4e129b5b
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
dad01df5-1937-48cf-829a-7c0446f4f760	superadmin@skoola.com	$2a$10$zyDKgGO5pqFHaDLiEjVuReurOF5G7r.CFeXCvii7VE2JT3Egs8/GW	superadmin	2025-09-18 16:23:58.296655+07	2025-09-18 16:23:58.296655+07
\.


--
-- Name: profil_sekolah profil_sekolah_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".profil_sekolah
    ADD CONSTRAINT profil_sekolah_pkey PRIMARY KEY (id);


--
-- Name: riwayat_kepegawaian riwayat_kepegawaian_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".riwayat_kepegawaian
    ADD CONSTRAINT riwayat_kepegawaian_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


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
-- Name: foundations foundations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foundations
    ADD CONSTRAINT foundations_pkey PRIMARY KEY (id);


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
-- Name: idx_riwayat_kepegawaian_teacher_id; Type: INDEX; Schema: 20554021; Owner: postgres
--

CREATE INDEX idx_riwayat_kepegawaian_teacher_id ON "20554021".riwayat_kepegawaian USING btree (teacher_id);


--
-- Name: idx_tenants_foundation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_foundation_id ON public.tenants USING btree (foundation_id);


--
-- Name: riwayat_kepegawaian riwayat_kepegawaian_teacher_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".riwayat_kepegawaian
    ADD CONSTRAINT riwayat_kepegawaian_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES "20554021".teachers(id) ON DELETE CASCADE;


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: 20554021; Owner: postgres
--

ALTER TABLE ONLY "20554021".teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES "20554021".users(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_foundation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_foundation_id_fkey FOREIGN KEY (foundation_id) REFERENCES public.foundations(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict e5HRRwBfzcQm2DwE88iC452H4rz48DB5uCcPCgZmrU1Q1OWibwXblFjEWOPA8Kr

