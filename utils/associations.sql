--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.5
-- Dumped by pg_dump version 9.3.5
-- Started on 2015-01-29 06:29:54 EST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 2040 (class 1262 OID 16385)
-- Name: associations; Type: DATABASE; Schema: -; Owner: associations_dbuser
--

CREATE DATABASE associations WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';


ALTER DATABASE associations OWNER TO associations_dbuser;

\connect associations

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 178 (class 3079 OID 11787)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2043 (class 0 OID 0)
-- Dependencies: 178
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 179 (class 3079 OID 16387)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 2044 (class 0 OID 0)
-- Dependencies: 179
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 173 (class 1259 OID 16425)
-- Name: games; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games (
    id uuid DEFAULT uuid_generate_v4() NOT NULL
);


ALTER TABLE public.games OWNER TO associations_dbuser;

--
-- TOC entry 172 (class 1259 OID 16415)
-- Name: usf_norms; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE usf_norms (
    "from" text NOT NULL,
    "to" text NOT NULL,
    "group" integer DEFAULT 0 NOT NULL,
    pick integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.usf_norms OWNER TO associations_dbuser;

--
-- TOC entry 175 (class 1259 OID 16451)
-- Name: graph_nodes; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW graph_nodes AS
 SELECT DISTINCT usf_norms."from" AS node
   FROM usf_norms
UNION
 SELECT DISTINCT usf_norms."to" AS node
   FROM usf_norms;


ALTER TABLE public.graph_nodes OWNER TO associations_dbuser;

--
-- TOC entry 176 (class 1259 OID 16464)
-- Name: graph_rels; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW graph_rels AS
 SELECT usf_norms."from",
    usf_norms."to",
    ((usf_norms.pick)::double precision / (usf_norms."group")::double precision) AS score
   FROM usf_norms;


ALTER TABLE public.graph_rels OWNER TO associations_dbuser;

--
-- TOC entry 174 (class 1259 OID 16431)
-- Name: picks; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE picks (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "from" text NOT NULL,
    "to" text NOT NULL,
    "userId" uuid NOT NULL,
    "gameId" uuid NOT NULL
);


ALTER TABLE public.picks OWNER TO associations_dbuser;

--
-- TOC entry 171 (class 1259 OID 16407)
-- Name: session; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO associations_dbuser;

--
-- TOC entry 170 (class 1259 OID 16398)
-- Name: users; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE users (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    alias text,
    email text,
    password text
);


ALTER TABLE public.users OWNER TO associations_dbuser;

--
-- TOC entry 177 (class 1259 OID 16468)
-- Name: words; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE words (
    text text NOT NULL
);


ALTER TABLE public.words OWNER TO associations_dbuser;

--
-- TOC entry 1914 (class 2606 OID 16430)
-- Name: games_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- TOC entry 1918 (class 2606 OID 16439)
-- Name: picks_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_pkey PRIMARY KEY (id);


--
-- TOC entry 1909 (class 2606 OID 16414)
-- Name: session_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 1907 (class 2606 OID 16406)
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 1912 (class 2606 OID 16424)
-- Name: usf_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY usf_norms
    ADD CONSTRAINT usf_norms_pkey PRIMARY KEY ("from", "to");


--
-- TOC entry 1920 (class 2606 OID 16475)
-- Name: words_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY words
    ADD CONSTRAINT words_pkey PRIMARY KEY (text);


--
-- TOC entry 1915 (class 1259 OID 16481)
-- Name: cov; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX cov ON picks USING btree ("from");


--
-- TOC entry 1916 (class 1259 OID 16487)
-- Name: cov2; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX cov2 ON picks USING btree ("to");


--
-- TOC entry 1910 (class 1259 OID 16503)
-- Name: cov3; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX cov3 ON usf_norms USING btree ("to");


--
-- TOC entry 1925 (class 2606 OID 16476)
-- Name: picks_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_from_fkey FOREIGN KEY ("from") REFERENCES words(text);


--
-- TOC entry 1923 (class 2606 OID 16440)
-- Name: picks_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT "picks_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES games(id);


--
-- TOC entry 1926 (class 2606 OID 16482)
-- Name: picks_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_to_fkey FOREIGN KEY ("to") REFERENCES words(text);


--
-- TOC entry 1924 (class 2606 OID 16445)
-- Name: picks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT "picks_userId_fkey" FOREIGN KEY ("userId") REFERENCES users(id);


--
-- TOC entry 1921 (class 2606 OID 16488)
-- Name: usf_norms_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY usf_norms
    ADD CONSTRAINT usf_norms_from_fkey FOREIGN KEY ("from") REFERENCES words(text);


--
-- TOC entry 1922 (class 2606 OID 16498)
-- Name: usf_norms_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY usf_norms
    ADD CONSTRAINT usf_norms_to_fkey FOREIGN KEY ("to") REFERENCES words(text);


--
-- TOC entry 2042 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO associations_dbuser;


-- Completed on 2015-01-29 06:29:54 EST

--
-- PostgreSQL database dump complete
--

