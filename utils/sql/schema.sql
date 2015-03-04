--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: colors; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE colors (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    name text,
    hex text,
    css_class text,
    is_default boolean DEFAULT false
);


ALTER TABLE colors OWNER TO associations_dbuser;

--
-- Name: games; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games (
    id uuid DEFAULT uuid_generate_v4() NOT NULL
);


ALTER TABLE games OWNER TO associations_dbuser;

--
-- Name: usf_norms; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE usf_norms (
    "from" text NOT NULL,
    "to" text NOT NULL,
    "group" integer DEFAULT 0 NOT NULL,
    pick integer DEFAULT 0 NOT NULL
);


ALTER TABLE usf_norms OWNER TO associations_dbuser;

--
-- Name: graph_nodes; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW graph_nodes AS
 SELECT DISTINCT usf_norms."from" AS node
   FROM usf_norms
UNION
 SELECT DISTINCT usf_norms."to" AS node
   FROM usf_norms;


ALTER TABLE graph_nodes OWNER TO associations_dbuser;

--
-- Name: graph_rels; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW graph_rels AS
 SELECT usf_norms."from",
    usf_norms."to",
    ((usf_norms.pick)::double precision / (usf_norms."group")::double precision) AS score
   FROM usf_norms;


ALTER TABLE graph_rels OWNER TO associations_dbuser;

--
-- Name: picks; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE picks (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "from" text NOT NULL,
    "to" text NOT NULL,
    user_id uuid NOT NULL,
    game_id uuid NOT NULL
);


ALTER TABLE picks OWNER TO associations_dbuser;

--
-- Name: session; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE session OWNER TO associations_dbuser;

--
-- Name: users; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE users (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    alias text,
    email text,
    password text,
    oauth_id text,
    oauth_provider text,
    color_id uuid
);


ALTER TABLE users OWNER TO associations_dbuser;

--
-- Name: words; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE words (
    text text NOT NULL
);


ALTER TABLE words OWNER TO associations_dbuser;

--
-- Name: colors_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY colors
    ADD CONSTRAINT colors_pkey PRIMARY KEY (id);


--
-- Name: games_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: picks_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_pkey PRIMARY KEY (id);


--
-- Name: session_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: usf_norms_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY usf_norms
    ADD CONSTRAINT usf_norms_pkey PRIMARY KEY ("from", "to");


--
-- Name: words_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY words
    ADD CONSTRAINT words_pkey PRIMARY KEY (text);


--
-- Name: cov; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX cov ON picks USING btree ("from");


--
-- Name: cov2; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX cov2 ON picks USING btree ("to");


--
-- Name: cov3; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX cov3 ON usf_norms USING btree ("to");


--
-- Name: picks_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_from_fkey FOREIGN KEY ("from") REFERENCES words(text);


--
-- Name: picks_gameId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT "picks_gameId_fkey" FOREIGN KEY (game_id) REFERENCES games(id);


--
-- Name: picks_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_to_fkey FOREIGN KEY ("to") REFERENCES words(text);


--
-- Name: picks_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT "picks_userId_fkey" FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: users_color_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_color_fkey FOREIGN KEY (color_id) REFERENCES colors(id);


--
-- Name: usf_norms_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY usf_norms
    ADD CONSTRAINT usf_norms_from_fkey FOREIGN KEY ("from") REFERENCES words(text);


--
-- Name: usf_norms_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY usf_norms
    ADD CONSTRAINT usf_norms_to_fkey FOREIGN KEY ("to") REFERENCES words(text);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO associations_dbuser;


--
-- PostgreSQL database dump complete
--

