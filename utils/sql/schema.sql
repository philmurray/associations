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

--
-- Name: notify_trigger(); Type: FUNCTION; Schema: public; Owner: associations_dbuser
--

CREATE FUNCTION notify_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    gameuser RECORD;
BEGIN
	FOR gameuser IN SELECT user_id FROM games_users WHERE game_id = NEW.game_id LOOP
		PERFORM pg_notify(gameuser.user_id::text, TG_TABLE_NAME );
	END LOOP;
	
	RETURN new;

END;
$$;


ALTER FUNCTION public.notify_trigger() OWNER TO associations_dbuser;

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
-- Name: chats; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE chats (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    game_id uuid NOT NULL,
    user_id uuid,
    text text NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE chats OWNER TO associations_dbuser;

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
 WITH all_picks AS (
         SELECT usf_norms."from",
            usf_norms."to",
            usf_norms.pick
           FROM usf_norms
        UNION
         SELECT picks."from",
            picks."to",
            1 AS pick
           FROM picks
          WHERE (picks."to" IS NOT NULL)
        ), to_count AS (
         SELECT all_picks."from",
            all_picks."to",
            sum(all_picks.pick) AS picks
           FROM all_picks
          GROUP BY all_picks."from", all_picks."to"
        ), from_count AS (
         SELECT all_picks."from",
            sum(all_picks.pick) AS picks
           FROM all_picks
          GROUP BY all_picks."from"
        )
 SELECT t."from",
    t."to",
    ((t.picks)::double precision / (f.picks)::double precision) AS score,
    t.picks,
    f.picks AS "group"
   FROM (to_count t
     JOIN from_count f ON ((t."from" = f."from")))
  WHERE ((f.picks > 10) AND (t.picks > 1))
  WITH NO DATA;


ALTER TABLE graph_rels OWNER TO associations_dbuser;

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
            g.rank
           FROM (( SELECT DISTINCT picks."from",
                    picks.game_id
                   FROM picks
                  WHERE (picks."to" IS NOT NULL)) p
             JOIN ( SELECT graph_rels."from",
                    graph_rels."to",
                    graph_rels.score,
                    row_number() OVER (PARTITION BY graph_rels."from" ORDER BY graph_rels.score DESC) AS rank
                   FROM graph_rels) g ON ((p."from" = g."from")))) t
  WHERE (t.rank <= 5);


ALTER TABLE game_top_words OWNER TO associations_dbuser;

--
-- Name: games; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE games (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    completed boolean DEFAULT false NOT NULL
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
    current_word integer DEFAULT 0 NOT NULL,
    chat_viewed_time timestamp with time zone DEFAULT now() NOT NULL,
    declined boolean DEFAULT false NOT NULL,
    won boolean DEFAULT false NOT NULL
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
    normal double precision,
    unread_chats bigint
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
-- Name: global_to_count; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW global_to_count AS
 SELECT graph_rels."to",
    sum(graph_rels.picks) AS count
   FROM graph_rels
  GROUP BY graph_rels."to"
  ORDER BY sum(graph_rels.picks) DESC;


ALTER TABLE global_to_count OWNER TO associations_dbuser;

--
-- Name: word_rank; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE word_rank (
    name text NOT NULL,
    description text,
    from_rank integer DEFAULT 0 NOT NULL,
    to_rank integer DEFAULT 0 NOT NULL
);


ALTER TABLE word_rank OWNER TO associations_dbuser;

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
-- Name: global_common_count; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW global_common_count AS
 SELECT w.category,
    sum(c.count) AS count,
    w.description
   FROM (global_to_count c
     JOIN ( SELECT w_1.text,
            r.name AS category,
            r.description
           FROM (words w_1
             JOIN word_rank r ON (((w_1.rank > r.from_rank) AND (w_1.rank < r.to_rank))))) w ON ((c."to" = w.text)))
  GROUP BY w.category, w.description
  ORDER BY sum(c.count) DESC;


ALTER TABLE global_common_count OWNER TO associations_dbuser;

--
-- Name: pos; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE pos (
    abbreviation text NOT NULL,
    description text,
    category text
);


ALTER TABLE pos OWNER TO associations_dbuser;

--
-- Name: global_pos_count; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW global_pos_count AS
 SELECT p.category,
    sum(c.count) AS count
   FROM ((global_to_count c
     JOIN words w ON ((c."to" = w.text)))
     JOIN pos p ON ((w.pos = p.abbreviation)))
  GROUP BY p.category
  ORDER BY sum(c.count) DESC;


ALTER TABLE global_pos_count OWNER TO associations_dbuser;

--
-- Name: graph_nodes; Type: MATERIALIZED VIEW; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE MATERIALIZED VIEW graph_nodes AS
 SELECT nodes.node
   FROM ( SELECT DISTINCT usf_norms."from" AS node
           FROM usf_norms
        UNION
         SELECT DISTINCT usf_norms."to" AS node
           FROM usf_norms
        UNION
         SELECT DISTINCT picks."from" AS node
           FROM picks
        UNION
         SELECT DISTINCT picks."to" AS node
           FROM picks) nodes
  WITH NO DATA;


ALTER TABLE graph_nodes OWNER TO associations_dbuser;

--
-- Name: levels; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE levels (
    level integer NOT NULL,
    requirement integer NOT NULL
);


ALTER TABLE levels OWNER TO associations_dbuser;

--
-- Name: locks; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE locks (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    level integer NOT NULL,
    data text NOT NULL
);


ALTER TABLE locks OWNER TO associations_dbuser;

--
-- Name: locks_users; Type: TABLE; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE TABLE locks_users (
    user_id uuid NOT NULL,
    lock_id uuid NOT NULL,
    seen boolean DEFAULT false NOT NULL
);


ALTER TABLE locks_users OWNER TO associations_dbuser;

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
            ELSE 1
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
-- Name: user_game_stats; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW user_game_stats AS
 SELECT g.user_id,
    count(
        CASE
            WHEN (c.count = 1) THEN 1
            ELSE NULL::integer
        END) AS singlegames,
    count(
        CASE
            WHEN (c.count > 1) THEN 1
            ELSE NULL::integer
        END) AS multigames,
    count(
        CASE
            WHEN (g.won = true) THEN 1
            ELSE NULL::integer
        END) AS wongames,
    count(*) AS allgames
   FROM (games_users g
     JOIN ( SELECT games_users.game_id,
            count(games_users.user_id) AS count
           FROM games_users
          GROUP BY games_users.game_id) c ON ((g.game_id = c.game_id)))
  WHERE (g.completed = true)
  GROUP BY g.user_id;


ALTER TABLE user_game_stats OWNER TO associations_dbuser;

--
-- Name: user_stats_normal; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW user_stats_normal AS
 SELECT picks_scored.user_id,
    avg(picks_scored.normal) AS normal
   FROM picks_scored
  GROUP BY picks_scored.user_id;


ALTER TABLE user_stats_normal OWNER TO associations_dbuser;

--
-- Name: user_stats_rank; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW user_stats_rank AS
 SELECT p.user_id,
    ((p.rank - avg(p.rank) OVER ()) / stddev(p.rank) OVER ()) AS rank
   FROM ( SELECT p_1.user_id,
            avg(w.rank) AS rank
           FROM (picks p_1
             JOIN words w ON ((p_1."to" = w.text)))
          GROUP BY p_1.user_id) p;


ALTER TABLE user_stats_rank OWNER TO associations_dbuser;

--
-- Name: user_stats_time; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW user_stats_time AS
 SELECT p.user_id,
    ((p.time_taken - avg(p.time_taken) OVER ()) / stddev(p.time_taken) OVER ()) AS time_taken
   FROM ( SELECT picks.user_id,
            avg(picks.time_taken) AS time_taken
           FROM picks
          GROUP BY picks.user_id) p;


ALTER TABLE user_stats_time OWNER TO associations_dbuser;

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
    create_time timestamp with time zone DEFAULT now() NOT NULL,
    seen_instructions boolean DEFAULT false NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    level_progress double precision DEFAULT 0 NOT NULL,
    oauth_displayname text
);


ALTER TABLE users OWNER TO associations_dbuser;

--
-- Name: user_stats; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW user_stats AS
 SELECT u.id,
    u.level,
    t.time_taken,
    r.rank,
    n.normal
   FROM (((users u
     JOIN user_stats_time t ON ((t.user_id = u.id)))
     JOIN user_stats_rank r ON ((r.user_id = u.id)))
     JOIN user_stats_normal n ON ((n.user_id = u.id)));


ALTER TABLE user_stats OWNER TO associations_dbuser;

--
-- Name: user_stats_rank_word; Type: VIEW; Schema: public; Owner: associations_dbuser
--

CREATE VIEW user_stats_rank_word AS
 SELECT p.user_id,
    p."from",
    p."to",
    p.game_id
   FROM ( SELECT p_1.user_id,
            row_number() OVER (PARTITION BY p_1.user_id ORDER BY w.rank DESC) AS rank,
            p_1."from",
            p_1."to",
            p_1.game_id
           FROM (picks p_1
             JOIN words w ON ((p_1."to" = w.text)))) p
  WHERE (p.rank < 4);


ALTER TABLE user_stats_rank_word OWNER TO associations_dbuser;

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
-- Name: chat_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY chats
    ADD CONSTRAINT chat_pkey PRIMARY KEY (id);


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
-- Name: levels_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (level);


--
-- Name: locks_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY locks
    ADD CONSTRAINT locks_pkey PRIMARY KEY (id);


--
-- Name: locks_users_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY locks_users
    ADD CONSTRAINT locks_users_pkey PRIMARY KEY (user_id, lock_id);


--
-- Name: picks_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_pkey PRIMARY KEY (id);


--
-- Name: picks_user_id_game_id_from_key; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY picks
    ADD CONSTRAINT picks_user_id_game_id_from_key UNIQUE (user_id, game_id, "from");


--
-- Name: pos_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY pos
    ADD CONSTRAINT pos_pkey PRIMARY KEY (abbreviation);


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
-- Name: users_email; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email UNIQUE (email);


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
-- Name: word_rank_pkey; Type: CONSTRAINT; Schema: public; Owner: associations_dbuser; Tablespace: 
--

ALTER TABLE ONLY word_rank
    ADD CONSTRAINT word_rank_pkey PRIMARY KEY (name);


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
-- Name: fki_chat_user_id_fkey; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX fki_chat_user_id_fkey ON chats USING btree (user_id);


--
-- Name: graph_rels_index; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE UNIQUE INDEX graph_rels_index ON graph_rels USING btree ("from", "to");


--
-- Name: graph_rels_score_idx; Type: INDEX; Schema: public; Owner: associations_dbuser; Tablespace: 
--

CREATE INDEX graph_rels_score_idx ON graph_rels USING btree ("from", score DESC);


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
    gus.normal,
    ( SELECT count(*) AS count
           FROM chats ch
          WHERE (((ch.game_id = gus.game_id) AND ((ch.user_id <> gus.user_id) OR (ch.user_id IS NULL))) AND (ch.create_time > gus.chat_viewed_time))) AS unread_chats
   FROM (( SELECT gu.game_id,
            gu.user_id,
            gu.completed,
            gu.start_time,
            gu.current_word,
            gu.chat_viewed_time,
            COALESCE(sum(ps.score), (0)::bigint) AS score,
            avg(ps.normal) AS normal
           FROM (games_users gu
             LEFT JOIN picks_scored ps ON (((gu.game_id = ps.game_id) AND (gu.user_id = ps.user_id))))
          WHERE (gu.declined = false)
          GROUP BY gu.game_id, gu.user_id) gus
     LEFT JOIN games_words gw ON (((gus.current_word = gw."order") AND (gus.game_id = gw.game_id))));


--
-- Name: chat_trigger; Type: TRIGGER; Schema: public; Owner: associations_dbuser
--

CREATE TRIGGER chat_trigger AFTER INSERT ON chats FOR EACH ROW EXECUTE PROCEDURE notify_trigger();


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
-- Name: chat_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY chats
    ADD CONSTRAINT chat_game_id_fkey FOREIGN KEY (game_id) REFERENCES games(id);


--
-- Name: chat_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY chats
    ADD CONSTRAINT chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


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
-- Name: locks_users_lock_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY locks_users
    ADD CONSTRAINT locks_users_lock_id_fkey FOREIGN KEY (lock_id) REFERENCES locks(id);


--
-- Name: locks_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY locks_users
    ADD CONSTRAINT locks_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


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
-- Name: words_pos_fkey; Type: FK CONSTRAINT; Schema: public; Owner: associations_dbuser
--

ALTER TABLE ONLY words
    ADD CONSTRAINT words_pos_fkey FOREIGN KEY (pos) REFERENCES pos(abbreviation);


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

