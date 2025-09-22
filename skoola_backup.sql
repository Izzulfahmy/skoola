--
-- PostgreSQL database dump
--

\restrict Zz7BjtAKxpzuwIRgnHDWhPOjTh98dZJShJA360mkM3VfiPAqnF8Itydw3EEpH1Z

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Data for Name: foundations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.foundations (id, nama_yayasan, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, nama_sekolah, schema_name, created_at, updated_at, foundation_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, created_at, updated_at) FROM stdin;
dad01df5-1937-48cf-829a-7c0446f4f760	superadmin@skoola.com	$2a$10$zyDKgGO5pqFHaDLiEjVuReurOF5G7r.CFeXCvii7VE2JT3Egs8/GW	superadmin	2025-09-18 16:23:58.296655+07	2025-09-18 16:23:58.296655+07
\.


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
-- Name: idx_tenants_foundation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_foundation_id ON public.tenants USING btree (foundation_id);


--
-- Name: tenants tenants_foundation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_foundation_id_fkey FOREIGN KEY (foundation_id) REFERENCES public.foundations(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Zz7BjtAKxpzuwIRgnHDWhPOjTh98dZJShJA360mkM3VfiPAqnF8Itydw3EEpH1Z

