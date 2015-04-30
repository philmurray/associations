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
-- Name: answers; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE answers (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    question_id uuid NOT NULL,
    text text
);


ALTER TABLE answers OWNER TO associations_dbuser;

--
-- Name: answers_users; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE answers_users (
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_id uuid NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE answers_users OWNER TO associations_dbuser;

--
-- Name: colors; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE colors (
    name text,
    hex text,
    css_class text,
    id integer NOT NULL
);


ALTER TABLE colors OWNER TO associations_dbuser;

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
-- Name: graph_rels; Type: MATERIALIZED VIEW; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE MATERIALIZED VIEW graph_rels AS
 SELECT usf_norms."from",
    usf_norms."to",
    ((usf_norms.pick)::double precision / (usf_norms."group")::double precision) AS score
   FROM usf_norms
  WITH NO DATA;


ALTER TABLE graph_rels OWNER TO associations_dbuser;

--
-- Name: picks; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE picks (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "from" text NOT NULL,
    "to" text,
    user_id uuid NOT NULL,
    game_id uuid NOT NULL,
    time_taken integer,
    create_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE picks OWNER TO associations_dbuser;

--
-- Name: game_top_words; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW game_top_words AS
 SELECT t.game_id,
    t."from",
    t."to",
    t.score,
    t.rank
   FROM ( SELECT p.game_id,
            g."from",
            g."to",
            g.score,
            rank() OVER (PARTITION BY g."from" ORDER BY g.score DESC) AS rank
           FROM (( SELECT DISTINCT picks."from",
                    picks.game_id
                   FROM picks
                  WHERE (picks."to" IS NOT NULL)) p
             JOIN graph_rels g ON ((p."from" = g."from")))) t
  WHERE (t.rank <= 5);


ALTER TABLE game_top_words OWNER TO associations_dbuser;

--
-- Name: games; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE games OWNER TO associations_dbuser;

--
-- Name: games_users; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games_users (
    game_id uuid NOT NULL,
    user_id uuid NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    start_time timestamp with time zone,
    current_word integer DEFAULT 0 NOT NULL
);


ALTER TABLE games_users OWNER TO associations_dbuser;

--
-- Name: games_users_scored; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games_users_scored (
    game_id uuid,
    user_id uuid,
    completed boolean,
    start_time timestamp with time zone,
    word text,
    score bigint,
    normal double precision
);


ALTER TABLE games_users_scored OWNER TO associations_dbuser;

--
-- Name: games_words; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games_words (
    game_id uuid NOT NULL,
    word text NOT NULL,
    "order" integer NOT NULL
);


ALTER TABLE games_words OWNER TO associations_dbuser;

--
-- Name: graph_nodes; Type: MATERIALIZED VIEW; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE MATERIALIZED VIEW graph_nodes AS
 SELECT DISTINCT usf_norms."from" AS node
   FROM usf_norms
UNION
 SELECT DISTINCT usf_norms."to" AS node
   FROM usf_norms
  WITH NO DATA;


ALTER TABLE graph_nodes OWNER TO associations_dbuser;

--
-- Name: picks_scored; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW picks_scored AS
 SELECT p.id,
    p."from",
    p."to",
    p.user_id,
    p.game_id,
    p.time_taken,
        CASE
            WHEN (p."to" IS NULL) THEN 0
            WHEN (p."to" IN ( SELECT rs."to"
               FROM graph_rels rs
              WHERE (rs."from" = p."from")
              ORDER BY rs.score DESC
             LIMIT 1)) THEN 200
            WHEN (( SELECT count(*) AS count
               FROM graph_rels rs1
              WHERE (rs1."from" = p."from")) = 0) THEN 100
            WHEN (r.score IS NOT NULL) THEN 100
            ELSE 0
        END AS score,
        CASE
            WHEN (p."to" IS NULL) THEN NULL::double precision
            WHEN (( SELECT count(*) AS count
               FROM graph_rels rs1
              WHERE (rs1."from" = p."from")) = 0) THEN NULL::double precision
            WHEN (r.score IS NOT NULL) THEN r.score
            ELSE (0)::double precision
        END AS normal,
    p.create_time
   FROM (picks p
     LEFT JOIN graph_rels r ON (((p."from" = r."from") AND (p."to" = r."to"))));


ALTER TABLE picks_scored OWNER TO associations_dbuser;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE questions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    text text
);


ALTER TABLE questions OWNER TO associations_dbuser;

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
    color_id integer DEFAULT 0 NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE users OWNER TO associations_dbuser;

--
-- Name: words; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE words (
    text text NOT NULL,
    rank integer NOT NULL,
    lemma text NOT NULL,
    pos text NOT NULL,
    play_order integer
);


ALTER TABLE words OWNER TO associations_dbuser;

--
-- Name: answers_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT answers_pkey PRIMARY KEY (id);


--
-- Name: answers_users_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY answers_users
    ADD CONSTRAINT answers_users_pkey PRIMARY KEY (user_id, question_id);


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
-- Name: games_users_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY games_users
    ADD CONSTRAINT games_users_pkey PRIMARY KEY (game_id, user_id);


--
-- Name: games_words_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY games_words
    ADD CONSTRAINT games_words_pkey PRIMARY KEY (game_id, word);


--
-- Name: picks_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_pkey PRIMARY KEY (id);


--
-- Name: questions_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


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
-- Name: graph_rels_index; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE UNIQUE INDEX graph_rels_index ON graph_rels USING btree ("from", "to");


--
-- Name: _RETURN; Type: RULE; Schema: public; Owner: associations_dbuser
--

CREATE RULE "_RETURN" AS
    ON SELECT TO games_users_scored DO INSTEAD  SELECT gus.game_id,
    gus.user_id,
    gus.completed,
    gus.start_time,
    gw.word,
    gus.score,
    gus.normal
   FROM (( SELECT gu.game_id,
            gu.user_id,
            gu.completed,
            gu.start_time,
            gu.current_word,
            COALESCE(sum(ps.score), (0)::bigint) AS score,
            avg(ps.normal) AS normal
           FROM (games_users gu
             LEFT JOIN picks_scored ps ON (((gu.game_id = ps.game_id) AND (gu.user_id = ps.user_id))))
          GROUP BY gu.game_id, gu.user_id) gus
     LEFT JOIN games_words gw ON (((gus.current_word = gw."order") AND (gus.game_id = gw.game_id))));


--
-- Name: answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY answers
    ADD CONSTRAINT answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id);


--
-- Name: answers_users_answer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY answers_users
    ADD CONSTRAINT answers_users_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES answers(id);


--
-- Name: answers_users_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY answers_users
    ADD CONSTRAINT answers_users_question_id_fkey FOREIGN KEY (question_id) REFERENCES questions(id);


--
-- Name: answers_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY answers_users
    ADD CONSTRAINT answers_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: games_users_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY games_users
    ADD CONSTRAINT games_users_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id);


--
-- Name: games_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY games_users
    ADD CONSTRAINT games_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: games_words_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY games_words
    ADD CONSTRAINT games_words_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id);


--
-- Name: games_words_word_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY games_words
    ADD CONSTRAINT games_words_word_fkey FOREIGN KEY (word) REFERENCES words(text);


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
-- Name: users_color_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_color_id_fkey FOREIGN KEY (color_id) REFERENCES colors(id);


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

