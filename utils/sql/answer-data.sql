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
-- Data for Name: answers; Type: TABLE DATA; Schema: public; Owner: associations_dbuser
--

COPY answers (id, question_id, text) FROM stdin;
81872b98-7bba-4c07-b502-07b9939aeea4	1edf158b-cf60-4805-9390-ae2ca95d167c	evil
c7107baa-d214-4c57-a354-091d585d4fa1	1edf158b-cf60-4805-9390-ae2ca95d167c	good
f8f4acd0-fc30-4514-9713-3fd8f8fae448	ac2a3be3-1bcf-4353-8d2c-3fbff3012264	girl
836f8b83-4bfd-43ca-9934-d500edb45110	ac2a3be3-1bcf-4353-8d2c-3fbff3012264	boy
227250ef-bbf4-4bfb-8fdb-3feb7e19e908	c3e1eafa-9b42-4e76-9d62-6380ac1ee9a1	poor
8b8c7ea3-81c1-4909-a652-cce7b78e2252	c3e1eafa-9b42-4e76-9d62-6380ac1ee9a1	rich
17afaec5-b2cc-42ce-aad2-41fe0b9c1cfd	5f7a22a0-b186-4a5c-9dab-065e1688c414	ham
53e4da79-c7c6-4d1d-b7fa-72eb57363b52	5f7a22a0-b186-4a5c-9dab-065e1688c414	green eggs
50a6651f-6efb-4547-b580-00f44eaad118	1cbe82c8-4418-4b3f-9e10-c7200d286624	jock
03699c81-5ad2-4903-b884-7b2192559d10	1cbe82c8-4418-4b3f-9e10-c7200d286624	nerd
a2d943a7-c2e5-48cd-84ff-edcfa4e4b36a	9e26903f-7f39-4c5c-addc-432b666e8a48	young
22a388dd-bb85-4b44-8eca-5f6fd1c8ca3d	9e26903f-7f39-4c5c-addc-432b666e8a48	old
2982da91-7443-4a1c-814a-ee530d4f8325	4d097069-f5f1-4bb7-941c-004fd16395df	dogs
b0bf2137-2e8c-487d-b9f4-70cc4e9cb3ef	4d097069-f5f1-4bb7-941c-004fd16395df	cats
\.


--
-- PostgreSQL database dump complete
--

