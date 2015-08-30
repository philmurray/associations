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
-- Data for Name: pos; Type: TABLE DATA; Schema: public; Owner: associations_dbuser
--

COPY pos (abbreviation, description, category) FROM stdin;
at1	Singular article (e.g. a, an, every)	article
csa	As as conjunction	conjunction
vbdr	were	verb
at	Article, neutral for number (e.g. the, no) [N.B. no is included among articles, which are defiined here as determiner words which typically begin a noun phrase, but which cannot occur as the head of a noun phrase. A word which is neutral for number is one that can cooccur with either singular or plural forms: e.g. the house, the houses; no brother, no brothers.]	article
bcs	"Before-conjunction" (e.g. in order preceding that, even preceding if)	before
bto	"Before-infinitive-marker" (e.g. in order or so as preceding to)	before
cc	Coordinating conjunction, general (e.g. and, or)	conjunction
ccb	Coordinating conjunction but	conjunction
cs	Subordinating conjunction, general (e.g. if, when, while, because)	conjunction
csn	Than as conjunction	conjunction
cst	That as conjunction [N.B. that is tagged CST when it introduces not only a nominal clause, but also a relative clause, as 'the day that follows Christmas'.]	conjunction
csw	The conjunction whether, or if when it is equivalent in function to whether.	conjunction
da	"After-determiner" (or postdeterminer), neutral for number, e.g. such, former, same. [Where determiners occur in a sequence, postdeterminers tend to occur after other determiners or articles: e.g. 'all such friends', 'this same problem'. N.B.a determiner in this tagset, like the Basic Tagset, is defined as a word which typically occurs either as the first word of a noun phrase, or as the head of a noun phrase. E.g same is tagged DA in both the following contexts: 'This is the same tune'; 'This tune is the same.]	determiner
da1	Singular "after-determiner" (or postdeterminer), e.g. little, much	determiner
da2	Plural "after-determiner" (or postdeterminer), e.g. few, many, several	determiner
da2r	Plural "after-determiner", comparative form (e.g. fewer)	determiner
da2t	Plural "after-determiner", superlative form (e.g. fewest)	determiner
dar	Comparative "after-determiner", neutral for number (e.g. more, less)	determiner
dat	Superlative "after-determiner", neutral for number (e.g. most, least)	determiner
db	"Before-determiner" (or predeterminer), neutral for number (e.g. all, half) [N.B. where there is a sequence of determiners, predeterminers occur before other determiners or articles (e.g. 'all those years').]	determiner
db2	Plural "before-determiner" (or predeterminer), e.g. both	determiner
dd	Central determiner, neutral for number (e.g. some, any, enough) [N.B. central determiners are the most unmarked category, which in a sequence precedes predeterminers or follows postdeterminers.]	determiner
dd1	Singular central determiner (e.g. this, that, another)	determiner
dd2	Plural central determiner (e.g. these, those)	determiner
ddq	Wh-determiner (e.g. which, what)	determiner
ddqge	Wh-determiner, possessive (e.g. whose)	determiner
ddqv	Wh-ever determiner (e.g. whichever, whatever)	determiner
ex	Existential there	existential
if	For as a preposition	preposition
ii	Preposition (general class: e.g. at, by, in, to, instead of)	preposition
io	Of as a preposition	preposition
iw	With and without as prepositions	preposition
jj	Adjective (general or positive) (e.g. good, old, beautiful)	adjective
jjr	General comparative adjective (e.g. better, older)	adjective
jjt	General superlative adjectives (e.g. best, oldest)	adjective
jk	Catenative adjective (with a quasi-auxiliary function, e.g. able in 'be able to'; willing in 'be willing to')	adjective
le	"Leading coordinator": a word introducing correlative coordination (e.g. both in both ... and, either in either ... or)	coordinator
mc	Cardinal number, neutral for number (e.g. two, three, four, 98, 1066) [Although numbers like two and three may be considered basically plural, the fact that they have singular agreement in uses such as 'Two's company, three's a crowd' assigns them to this number-neutral category.]	number
mc-mc	Two numbers linked by a hyphen or dash (e.g. 40-50, 1770-1827)	number
mc1	Singular cardinal number (e.g. one, 1)	number
mc2	Plural cardinal number (e.g. tens, twenties, 1900s)	number
md	Ordinal number (e.g. first, sixth, 77th, last) [N.B. The MD tag is used whether these words are used in a nominal or in an adverbial role. Next and last, as "general ordinals", are also assigned to this category.]	number
mf	Fractional number, neutral for number (e.g. quarter, three-fourths, two-thirds) [Again, these are treated as number-neutral because their ability to agree with singulars and with plurals: 'A quarter was/were eaten'.]	number
nd1	Singular noun of direction (e.g. north, east, southwest, NNW)	noun
nn	Common noun, neutral for number (e.g. sheep, cod, group, people). [N.B. Singular collective nouns, such as team, are tagged NN, on the grounds that they are capable of taking singular or plural agreement e.g. 'Our team has/have lost'.]	noun
nn1	Singular common noun (e.g. bath, powder, disgrace, sister)	noun
nn2	Plural common noun (e.g. baths, powders, sisters)	noun
nnj	Human organization noun (e.g. council, orchestra, corporation, Company) [N.B. these are typically collective nouns (see NN above), and therefore are left unspecified for number. They often occur, with an initial capital, in names of private or public organizations, as in 'the Ford Motor Company'.]	noun
nnj2	Plural human organization noun (e.g. councils, orchestras, corporations)	noun
nnl	Locative noun, neutral for number (e.g. Is. as an abbreviation for Island(s))	noun
nnl1	Singular locative noun (e.g. island, street). [They are often abbreviated as part of the names of places, as in Mt. Aconcagua, Wall St, Belsize Pk.]	noun
nnl2	Plural locative noun (e.g. islands, streets) [Again, they can occur with an initial capital as part of a complex place name: e.g. 'the Grampian Mountains'.]	noun
nno	Numeral noun, neutral for number (cf. MC above): e.g. hundred, thousand, dozen	noun
nno2	Plural numeral noun (e.g. hundreds, thousands, dozens)	noun
nnsa	Noun of style or title, following a name (e.g. PhD, J.P., Bart when following a person's name)	noun
nnsb	Noun of style or title, preceding a name (e.g. Sir, Queen, Ms, Mr when occurring as the first part of a person's name) [These are often in the form of abbreviations.]	noun
nnt1	Singular temporal noun (e.g. day, week, year, Easter)	noun
nnt2	Plural temporal nouns (e.g. days, weeks, years)	noun
nnu	Unit-of-measurement noun, neutral for number (e.g. the abbreviations in., ft, cc)	noun
nnu1	Singular unit-of-measurement noun (e.g. inch, litre, hectare)	noun
nnu2	Plural unit-of-measurement noun (e.g. inches, litres, hectares)	noun
np	Proper noun, neutral for number (e.g. acronymic names of companies and organizations, such as IBM, NATO, BBC). [This tag also occurs widely in the pre-final parts of complex names, such as 'the Pacific Ocean', 'Cambridge University', 'North Germany'.]	noun
np1	Singular proper noun (e.g. Vivian, Clinton, Mexico)	noun
np2	Plural proper noun (e.g. Kennedys, Pyrenees, Cyclades)	noun
npd1	Singular weekday noun (e.g. Saturday, Wednesday)	noun
npd2	Plural weekday noun (e.g. Sundays, Fridays)	noun
npm1	Singular month noun (e.g. April, October)	noun
npm2	Plural month noun (e.g. Junes, Januaries)	noun
pn	Indefinite pronoun, neutral for number (e.g. noun) [N.B. pronoun tags always apply to words which function as [heads of] noun phrases. Words like some and any, which can also occur in the position of an article/determiner, are treated as determiners (see DA above) in both the following contexts: 'Did you get any beans?' 'No, I couldn't find any.']	pronoun
pn1	Singular indefinite pronoun (e.g. one [as pronoun, not numeral], somebody, no one, everything)	pronoun
pnqo	Wh-pronoun, objective case (whom)	pronoun
pnqs	Wh-pronoun, subjective case (who)	pronoun
pnqvs	Wh-ever pronoun, subjective case (whoever)	pronoun
pnx1	Reflexive indefinite pronoun, singular (oneself)	pronoun
pph1	Singular personal pronoun, third person (it)	pronoun
ppho1	Singular personal pronoun, third person, objective case (him, her)	pronoun
ppho2	Plural personal pronoun, third person, objective case (them)	pronoun
pphs1	Singular personal pronoun, third person, subjective case (he, she)	pronoun
pphs2	Plural personal pronoun, third person, subjective case (they)	pronoun
ppio1	Singular personal pronoun, first person, objective case (me)	pronoun
ppio2	Plural personal pronoun, first person, objective case (us)	pronoun
ppis1	Singular personal pronoun, first person, subjective case (I)	pronoun
ppis2	Plural personal pronoun, first person, subjective case (we)	pronoun
ppx1	Singular reflexive pronoun (e.g. myself, yourself, herself)	pronoun
ppx2	Plural reflexive pronoun (ourselves, yourselves, themselves)	pronoun
ppy	Second person personal pronoun (you)	pronoun
ra	Adverb, after nominal head (e.g. else, galore)	adverb
rex	Adverb introducing appositional constructions (e.g. i.e., e.g., viz)	adverb
rg	Positive degree adverb (e.g. very, so, too)	adverb
rga	Post-modifying positive degree adverb (e.g. enough, indeed)	adverb
rgq	Wh- degree adverb (e.g. how when modifying a gradable adjective, adverb, etc.)	adverb
rgqv	Wh-ever degree adverb (however when modifying a gradable adjective, adverb etc.)	adverb
rgr	Comparative degree adverb (e.g. more, less)	adverb
rgt	Superlative degree adverb (e.g. most, least)	adverb
rl	Locative adverb (e.g. forward, alongside, there)	adverb
rp	Adverbial particle (e.g. about, in, out, up)	adverb
rpk	Catenative adverbial particle (about in be about to) [Compare JK above.]	adverb
rr	General positive adverb (e.g. often, well, long, easily)	adverb
rrq	Wh- general adverb (e.g. how, when, where, why)	adverb
rrqv	Wh-ever general adverb (e.g. however, whenever, wherever)	adverb
rrr	Comparative general adverb (e.g. more, oftener, longer, further)	adverb
rrt	Superlative general adverb (e.g. most, oftenest, longest, furthest)	adverb
rt	Nominal adverb of time (e.g. now, tomorrow, yesterday)	adverb
to	The infinitive marker to	to
uh	Interjection, or other isolate (e.g. oh, yes, wow)	interjection
vb0	be as a finite form (in declarative and imperative clauses)	verb
vbdz	was	verb
vbg	being	verb
vbi	be as an infinitive form	verb
vbm	am, 'm	verb
vbn	been	verb
vbr	are, 're	verb
vbz	is, 's	verb
vd0	do as a finite form (in declarative and imperative clauses)	verb
vdd	did	verb
vdg	doing	verb
vdi	do as an infinitive form	verb
vdn	done	verb
vdz	does, 's	verb
vh0	have, 've as a finite form (in declarative and imperative clauses)	verb
vhd	had, 'd as a past tense form	verb
vhg	doing	verb
vhi	have as an infinitive form	verb
vhn	had as a past participle	verb
vhz	has, 's	verb
vm	Modal auxiliary verb (e.g. can, could, will, would, must)	verb
vmk	Catenative modal auxiliary (i.e. ought and used when followed by the infinitive marker to)	verb
vv0	The base form of the lexical verb as a finite form (in declarative and imperative clauses) (e.g. give, find, look, receive)	verb
vvd	The past tense form of the lexical verb (e.g. gave, found, looked, received)	verb
vvg	The -ing form of the lexical verb (e.g. giving, finding, looking, receiving)	verb
vvgk	The -ing form as a catenative verb (e.g. going in be going to)	verb
vvi	The base form of the lexical verb as an infinitive (e.g. give, find, look, receive)	verb
vvn	The past participle form of the lexical verb (e.g. given, found, looked, received)	verb
vvnk	The past participle as a catenative verb (e.g. bound in be bound to)	verb
vvz	The -s form of the lexical verb (e.g. gives, finds, looks, receives)	verb
xx	not, -n't	negative
zz1	Singular letter of the alphabet (a, b, S, etc.)	letter
zz2	Plural letter of the alphabet (a's, b's, Ss etc.)	letter
appge	Possessive determiner, pre-nominal (e.g. my, your, her, his, their)	possessive
pp	Nominal possessive pronoun (e.g. mine, yours, his, ours)	pronoun
\.


--
-- PostgreSQL database dump complete
--

