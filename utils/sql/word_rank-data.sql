--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

--
-- Data for Name: word_rank; Type: TABLE DATA; Schema: public; Owner: associations_dbuser
--

COPY word_rank (name, description, from_rank, to_rank) FROM stdin;
boring	words like car, water, book, food and paper	0	1000
common	words like animal, clothes, sick, clean and bird	1001	2500
normal	words like flower, dirt, loud, god and math	2501	5000
interesting	words like snake, needle, gross, boring and pig	5001	10000
rare	words like snob, embarrass, sew, spaghetti and ice-cream	10001	30000
epic	words like sneeze, seatbelt, extrovert, subtraction and cuddle	30001	60000
legendary	words like tattle, cream-cheese, saltine, aardvark and dendrite	60001	999999999
\.


--
-- PostgreSQL database dump complete
--

