--
-- PostgreSQL database dump
--

-- Dumped from database version 14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: applications; Type: TABLE; Schema: public; Owner: haus
--

CREATE TABLE public.applications (
    username character varying(25) NOT NULL,
    job_id integer NOT NULL
);


ALTER TABLE public.applications OWNER TO haus;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: haus
--

CREATE TABLE public.companies (
    handle character varying(25) NOT NULL,
    name text NOT NULL,
    num_employees integer,
    description text NOT NULL,
    logo_url text,
    CONSTRAINT companies_handle_check CHECK (((handle)::text = lower((handle)::text))),
    CONSTRAINT companies_num_employees_check CHECK ((num_employees >= 0))
);


ALTER TABLE public.companies OWNER TO haus;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: haus
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title text NOT NULL,
    salary integer,
    equity numeric,
    company_handle character varying(25) NOT NULL,
    CONSTRAINT jobs_equity_check CHECK ((equity <= 1.0)),
    CONSTRAINT jobs_salary_check CHECK ((salary >= 0))
);


ALTER TABLE public.jobs OWNER TO haus;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: haus
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO haus;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: haus
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: haus
--

CREATE TABLE public.users (
    username character varying(25) NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_check CHECK ((POSITION(('@'::text) IN (email)) > 1))
);


ALTER TABLE public.users OWNER TO haus;

--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: haus
--

COPY public.applications (username, job_id) FROM stdin;
Charliebear5000	7
Charliebear5000	18
Charliebear5000	62
Charliebear5000	97
Charliebear5000	200
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: haus
--

COPY public.companies (handle, name, num_employees, description, logo_url) FROM stdin;
bauer-gallagher	Bauer-Gallagher	862	Difficult ready trip question produce produce someone.	\N
edwards-lee-reese	Edwards, Lee and Reese	744	To much recent it reality coach decision Mr. Dog language evidence minute either deep situation pattern. Other cold bad loss surface real show.	/logos/logo2.png
hall-davis	Hall-Davis	749	Adult go economic off into. Suddenly happy according only common. Father plant wrong free traditional.	/logos/logo2.png
watson-davis	Watson-Davis	819	Year join loss.	/logos/logo3.png
baker-santos	Baker-Santos	225	Compare certain use. Writer time lay word garden. Resource task interesting voice.	/logos/logo3.png
erickson-inc	Erickson Inc	267	Interesting environment owner beautiful school politics. General friend hair player dinner last administration teacher.	/logos/logo4.png
norman-harvey	Norman-Harvey	\N	Drop along test material education. Opportunity forget campaign federal certainly total hair.	/logos/logo4.png
boyd-evans	Boyd-Evans	698	Build respond generation tree. No five keep. Happy medical back fine focus suffer modern.	/logos/logo4.png
mitchell-brown	Mitchell-Brown	288	Republican truth church generation voice price issue.	/logos/logo1.png
russo-gillespie-conrad	Russo, Gillespie and Conrad	398	South sound knowledge guy. Up I size anyone issue drop. Agent light significant mouth while.	/logos/logo2.png
ingram-ferguson-rubio	Ingram, Ferguson and Rubio	753	Human summer field mean impact could exactly. Business read north project will. Left dream use Democrat.	/logos/logo3.png
anderson-arias-morrow	Anderson, Arias and Morrow	245	Somebody program how I. Face give away discussion view act inside. Your official relationship administration here.	/logos/logo3.png
jackson-sons	Jackson and Sons	649	President couple political sit create.	/logos/logo4.png
miller-woods-hernandez	Miller, Woods and Hernandez	444	Including theory protect reveal energy himself probably. Test leave mother area however.	/logos/logo4.png
arnold-berger-townsend	Arnold, Berger and Townsend	795	Kind crime at perhaps beat. Enjoy deal purpose serve begin or thought. Congress everything miss tend.	\N
davis-davis	Davis-Davis	23	Career participant difficult. Decide claim particular century society. Question growth two staff.	\N
smith-llc	Smith LLC	908	Statement use per mission method. Order truth method.	\N
morgan-sullivan	Morgan-Sullivan	409	Own once artist part put authority wait. Focus free even. Why friend civil visit.	\N
taylor-yu-lee	Taylor, Yu and Lee	226	Down bag serve. Officer season company.	/logos/logo2.png
scott-smith	Scott-Smith	993	Room newspaper foot. Student daughter their themselves top almost near. Wait time recently it street follow medical nothing.	/logos/logo2.png
garcia-ray	Garcia-Ray	217	Laugh low follow fear. Politics main size fine.	/logos/logo2.png
logan-miller	Logan-Miller	429	Pattern hand where never. Social across ability which structure.	\N
hudson-inc	Hudson Inc	627	End now meet staff. Long government force why bar. Provide bring hope staff almost many be a.	\N
rivas-llc	Rivas LLC	552	Would road lot research wide mouth. Resource along office drug.	\N
garner-michael	Garner-Michael	940	Necessary thousand parent since discuss director. Visit machine skill five the.	\N
owen-newton	Owen-Newton	953	Red compare try way. Bed standard again number wrong force. Stop exactly agent product economy someone. North describe site manager employee customer.	\N
foster-rice	Foster-Rice	901	Either relate himself. Source TV data one general. Actually than seat eight.	\N
moore-plc	Moore PLC	100	Magazine thing eight shake window might they organization. Environmental it bag green.	\N
ayala-buchanan	Ayala-Buchanan	309	Make radio physical southern. His white on attention kitchen market upon. Represent west open seven. Particularly subject billion much score thank bag somebody.	\N
willis-henson-miller	Willis, Henson and Miller	821	About dream practice. Father significant senior health within four.	\N
stone-stewart	Stone-Stewart	459	Require successful family but. Traditional article late eight lose common send budget. Better opportunity law country various represent strong probably.	\N
wiggins-frederick-boyer	Wiggins, Frederick and Boyer	298	Institution structure say argue bit. Each option high executive easy pattern. Majority white hour there reach drive produce.	/logos/logo2.png
reynolds-greene	Reynolds-Greene	343	Effect win area officer office economy. Congress travel would resource difficult. Nice president mind dinner.	/logos/logo2.png
perez-miller	Perez-Miller	298	Space one approach wife son. Themselves give necessary follow employee return feel. Step animal doctor sign water early.	/logos/logo4.png
burton-ltd	Burton Ltd	610	Cover couple speech bar cell measure movement finally. Nation pull inside.	/logos/logo4.png
gillespie-smith	Gillespie-Smith	302	Candidate ability democratic make drug. Player themselves like front. Over through style loss win very when.	/logos/logo1.png
martinez-daniels	Martinez-Daniels	12	Five source market nation. Drop foreign raise pass.	/logos/logo4.png
jackson-davila-conley	Jackson, Davila and Conley	813	Consider with build either.	/logos/logo4.png
salas-group	Salas Group	624	Central whom mouth partner bring newspaper special city. Show second cost newspaper can early play.	/logos/logo4.png
thomas-sons	Thomas and Sons	51	Book detail scene continue. Art strategy because list two.	/logos/logo1.png
mejia-scott-ryan	Mejia, Scott and Ryan	\N	General traditional late situation discussion dog. Before best up strategy about direction.	/logos/logo4.png
mueller-moore	Mueller-Moore	932	Edge may report though least pressure likely. Cost short appear program hair seven.	/logos/logo2.png
pugh-ltd	Pugh Ltd	87	Believe reflect perform TV son.	/logos/logo2.png
carr-wells-jones	Carr, Wells and Jones	27	Human medical throw book pick possible. Maybe yeah word beat treatment impact campaign.	/logos/logo3.png
hall-mills	Hall-Mills	266	Change stage tell note hundred. Worry where program wait.	/logos/logo3.png
robbins-marsh-martin	Robbins, Marsh and Martin	709	Now never worry usually another ability concern hair. Fly lot six protect participant. Teach through head.	/logos/logo3.png
sellers-bryant	Sellers-Bryant	369	Language discussion mission soon wait according executive. Financial say husband anyone money politics. Dinner action purpose mouth environment I white.	/logos/logo3.png
humphrey-llc	Humphrey LLC	678	Agent actually able paper nor. Tell then court full agree without assume.	/logos/logo4.png
graham-herring-lane	Graham, Herring and Lane	188	Enough attack return. Fall gas someone her another point those. Star public painting show concern.	/logos/logo4.png
weber-hernandez	Weber-Hernandez	681	Contain product south picture scientist.	/logos/logo4.png
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: haus
--

COPY public.jobs (id, title, salary, equity, company_handle) FROM stdin;
1	Conservator, furniture	110000	0	watson-davis
2	Information officer	200000	0	hall-mills
3	Consulting civil engineer	60000	0	sellers-bryant
4	Early years teacher	55000	0	perez-miller
5	Intelligence analyst	77000	0	garner-michael
6	Surveyor, building	144000	0	russo-gillespie-conrad
7	Technical brewer	157000	0	anderson-arias-morrow
8	Control and instrumentation engineer	171000	0	salas-group
9	Photographer	198000	0	davis-davis
10	Multimedia programmer	192000	0	graham-herring-lane
11	English as a foreign language teacher	111000	0	russo-gillespie-conrad
12	Passenger transport manager	70000	0	rivas-llc
13	Psychologist, clinical	172000	0	hudson-inc
14	Financial planner	115000	0	taylor-yu-lee
15	Scientist, forensic	50000	0	foster-rice
16	Occupational therapist	183000	0	garcia-ray
17	Ophthalmologist	135000	0	hall-mills
18	Embryologist, clinical	138000	0	anderson-arias-morrow
19	Marine scientist	54000	0	scott-smith
20	Tourist information centre manager	88000	0	foster-rice
21	Interior and spatial designer	177000	0	gillespie-smith
22	Surveyor, rural practice	193000	0	weber-hernandez
23	Colour technologist	81000	0	burton-ltd
24	Technical brewer	77000	0	thomas-sons
25	Pharmacist, hospital	194000	0	boyd-evans
26	Medical sales representative	125000	0	jackson-davila-conley
27	Energy engineer	62000	0	norman-harvey
28	Research officer, government	167000	0	mejia-scott-ryan
29	Barrister	130000	0	stone-stewart
30	Loss adjuster, chartered	76000	0	bauer-gallagher
31	Database administrator	79000	0	willis-henson-miller
32	IT consultant	59000	0	gillespie-smith
33	Museum/gallery conservator	82000	0	mejia-scott-ryan
34	Engineering geologist	170000	0	garcia-ray
35	Television production assistant	125000	0	logan-miller
36	Accountant, chartered certified	175000	0	stone-stewart
37	Merchant navy officer	106000	0	mitchell-brown
38	Medical physicist	84000	0	perez-miller
39	Podiatrist	68000	\N	reynolds-greene
40	Nurse, children's	162000	\N	humphrey-llc
41	Teacher, music	127000	\N	ingram-ferguson-rubio
42	Occupational hygienist	79000	\N	reynolds-greene
43	Research officer, political party	134000	\N	garner-michael
44	Therapist, occupational	82000	\N	mejia-scott-ryan
45	Teacher, secondary school	127000	\N	sellers-bryant
46	Scientist, product/process development	106000	\N	scott-smith
47	Astronomer	143000	\N	watson-davis
48	Counsellor	\N	0	owen-newton
49	Financial controller	\N	0	sellers-bryant
50	Advertising account executive	\N	0	thomas-sons
51	Buyer, industrial	\N	\N	reynolds-greene
52	Interpreter	55000	0	hudson-inc
53	Best boy	\N	0	jackson-sons
54	Freight forwarder	183000	0	hudson-inc
55	Designer, jewellery	\N	0	weber-hernandez
56	Tree surgeon	\N	0.001	hall-davis
57	Management consultant	183000	0	edwards-lee-reese
58	Ergonomist	160000	0	bauer-gallagher
59	Psychologist, forensic	176000	0	boyd-evans
60	Architectural technologist	57000	0	owen-newton
61	Patent attorney	143000	0	foster-rice
62	Art gallery manager	\N	0.085	anderson-arias-morrow
63	Engineer, chemical	81000	0	russo-gillespie-conrad
64	Speech and language therapist	159000	0	gillespie-smith
65	Orthoptist	200000	0	perez-miller
66	Camera operator	130000	0	arnold-berger-townsend
67	Field trials officer	137000	0	davis-davis
68	Transport planner	\N	\N	reynolds-greene
69	Bonds trader	\N	\N	mitchell-brown
70	Editor, magazine features	118000	0.002	foster-rice
71	Applications developer	84000	0.091	sellers-bryant
72	Clothing/textile technologist	171000	0.041	smith-llc
73	Secretary/administrator	172000	0.096	jackson-sons
74	Field seismologist	62000	0.064	martinez-daniels
75	Engineer, materials	185000	0.081	garner-michael
76	Race relations officer	97000	0.065	bauer-gallagher
77	Engineering geologist	89000	0.043	ayala-buchanan
78	Aeronautical engineer	135000	0.078	norman-harvey
79	Development worker, community	192000	0.047	weber-hernandez
80	Speech and language therapist	154000	0.014	humphrey-llc
81	Health promotion specialist	72000	0.010	burton-ltd
82	Careers adviser	57000	0.051	carr-wells-jones
83	Surveyor, minerals	98000	0.037	carr-wells-jones
84	Forest/woodland manager	156000	0.030	carr-wells-jones
85	Haematologist	63000	0.062	ayala-buchanan
86	Advertising account executive	130000	0.064	thomas-sons
87	Ship broker	124000	0.045	davis-davis
88	Fisheries officer	67000	0.062	hall-davis
89	Air cabin crew	105000	0.077	ingram-ferguson-rubio
90	Financial trader	153000	0.012	garner-michael
91	Paramedic	122000	0.047	baker-santos
92	Historic buildings inspector/conservation officer	129000	0.052	watson-davis
93	Transport planner	123000	0.091	hudson-inc
94	Public librarian	115000	0.099	norman-harvey
95	Writer	172000	0.091	anderson-arias-morrow
96	Designer, fashion/clothing	81000	0.026	garcia-ray
97	Information systems manager	123000	0.100	arnold-berger-townsend
98	Art gallery manager	73000	0.054	perez-miller
99	Operational researcher	167000	0.020	ayala-buchanan
100	Solicitor	131000	0.034	wiggins-frederick-boyer
101	Intelligence analyst	148000	0	sellers-bryant
102	Naval architect	126000	0	scott-smith
103	Dealer	175000	0	hall-mills
104	Multimedia programmer	154000	\N	owen-newton
105	Psychologist, occupational	190000	\N	robbins-marsh-martin
106	Leisure centre manager	135000	\N	edwards-lee-reese
107	Television production assistant	99000	\N	edwards-lee-reese
108	Historic buildings inspector/conservation officer	135000	\N	rivas-llc
109	Sports development officer	102000	\N	scott-smith
110	Investment banker, corporate	131000	\N	ingram-ferguson-rubio
111	Conservation officer, historic buildings	168000	\N	robbins-marsh-martin
112	Physicist, medical	190000	\N	humphrey-llc
113	Press sub	100000	\N	erickson-inc
114	Engineer, civil (contracting)	\N	0.018	moore-plc
115	Therapist, music	103000	0.087	reynolds-greene
116	Water engineer	\N	0.028	mejia-scott-ryan
117	Engineer, energy	\N	0.048	arnold-berger-townsend
118	Plant breeder/geneticist	\N	0.081	thomas-sons
119	Oceanographer	\N	0.097	anderson-arias-morrow
120	Clinical cytogeneticist	152000	0.027	mitchell-brown
121	Nature conservation officer	82000	0.093	watson-davis
122	Insurance underwriter	\N	0.008	hall-davis
123	Chief of Staff	110000	0.016	scott-smith
124	Surveyor, insurance	\N	0.066	foster-rice
125	Surveyor, building control	\N	\N	reynolds-greene
126	Trade mark attorney	\N	\N	mueller-moore
127	Glass blower/designer	126000	0.099	anderson-arias-morrow
128	Geochemist	130000	0.004	smith-llc
129	Scientist, research (physical sciences)	117000	0.090	ayala-buchanan
130	Historic buildings inspector/conservation officer	65000	0.075	mejia-scott-ryan
131	Surveyor, insurance	130000	0.009	martinez-daniels
132	Contractor	89000	0.065	mueller-moore
133	Hydrologist	50000	0.097	wiggins-frederick-boyer
134	Aeronautical engineer	156000	0.055	perez-miller
135	Freight forwarder	183000	0.093	burton-ltd
136	Engineer, materials	140000	0.057	mitchell-brown
137	Product designer	184000	0.090	gillespie-smith
138	Editor, film/video	199000	0.070	bauer-gallagher
139	Fashion designer	131000	0.080	taylor-yu-lee
140	Legal secretary	155000	0.080	pugh-ltd
141	Financial risk analyst	72000	0.001	scott-smith
142	Regulatory affairs officer	96000	0.061	logan-miller
143	Ranger/warden	86000	0.095	ayala-buchanan
144	Farm manager	138000	0.085	stone-stewart
145	Primary school teacher	142000	0.036	moore-plc
146	Quality manager	138000	0.002	russo-gillespie-conrad
147	Radio producer	99000	0.038	mitchell-brown
148	Music therapist	100000	0.058	taylor-yu-lee
149	Farm manager	68000	0.049	morgan-sullivan
150	Camera operator	51000	0.066	jackson-davila-conley
151	Engineer, technical sales	167000	0.077	ingram-ferguson-rubio
152	Ranger/warden	145000	0.046	jackson-davila-conley
153	Lawyer	162000	0.072	hall-mills
154	Estate manager/land agent	94000	0.008	jackson-davila-conley
155	Orthoptist	129000	0.062	willis-henson-miller
156	Recycling officer	57000	0.098	carr-wells-jones
157	Scientist, research (life sciences)	157000	0.057	ayala-buchanan
158	Armed forces technical officer	136000	0.012	scott-smith
159	Public relations officer	112000	0.087	weber-hernandez
160	Set designer	132000	0.055	russo-gillespie-conrad
161	Accountant, chartered certified	86000	0.070	boyd-evans
162	Special effects artist	101000	0.023	willis-henson-miller
163	Glass blower/designer	60000	0.095	mueller-moore
164	Print production planner	197000	0.095	humphrey-llc
165	Psychologist, counselling	180000	0.008	perez-miller
166	Meteorologist	81000	0.037	sellers-bryant
167	Therapist, drama	200000	0.095	hall-mills
168	Engineer, technical sales	157000	0.083	baker-santos
169	Scientist, audiological	61000	0.095	foster-rice
170	Dietitian	198000	0	ayala-buchanan
171	Electrical engineer	157000	\N	jackson-davila-conley
172	Agricultural consultant	67000	\N	moore-plc
173	Geochemist	104000	\N	hudson-inc
174	Geologist, engineering	116000	\N	jackson-davila-conley
175	Clinical biochemist	92000	\N	norman-harvey
176	Probation officer	128000	\N	foster-rice
177	Chief Executive Officer	83000	\N	miller-woods-hernandez
178	Surveyor, building	144000	0.007	salas-group
179	Engineer, water	165000	0.010	ingram-ferguson-rubio
180	Psychologist, counselling	111000	0.059	taylor-yu-lee
181	Astronomer	55000	0.074	martinez-daniels
182	Medical physicist	110000	0.015	mitchell-brown
183	Chief Technology Officer	64000	0.067	robbins-marsh-martin
184	Arboriculturist	191000	0.062	salas-group
185	Conservation officer, nature	108000	0.006	jackson-davila-conley
186	Psychologist, sport and exercise	172000	0.061	ayala-buchanan
187	Designer, furniture	149000	0.041	mueller-moore
188	Chartered loss adjuster	72000	0.084	davis-davis
189	Producer, radio	168000	0.010	salas-group
190	Operational investment banker	200000	0.022	smith-llc
191	Surveyor, quantity	72000	0.071	mejia-scott-ryan
192	Ship broker	177000	0	hall-davis
193	Bookseller	164000	0	reynolds-greene
194	Medical sales representative	196000	0	hall-mills
195	Copy	103000	0	foster-rice
196	Engineer, broadcasting (operations)	86000	0	baker-santos
197	Fashion designer	137000	0	reynolds-greene
198	Learning disability nurse	66000	\N	ayala-buchanan
199	Research scientist (medical)	175000	\N	norman-harvey
200	Accommodation manager	126000	\N	mejia-scott-ryan
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: haus
--

COPY public.users (username, password, first_name, last_name, email, is_admin) FROM stdin;
testuser	$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q	Test	User	joel@joelburton.com	f
testadmin	$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q	Test	Admin!	joel@joelburton.com	t
Charliebear5000	$2b$12$yNmD643c6pOyPG435UbgoudXLTwc3F.hmPNGfa0yQ1w1rmpkeH8qK	Charles	Bear	cbear@fake.com	f
\.


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: haus
--

SELECT pg_catalog.setval('public.jobs_id_seq', 200, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (username, job_id);


--
-- Name: companies companies_name_key; Type: CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_name_key UNIQUE (name);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (handle);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (username);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: applications applications_username_fkey; Type: FK CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_username_fkey FOREIGN KEY (username) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- Name: jobs jobs_company_handle_fkey; Type: FK CONSTRAINT; Schema: public; Owner: haus
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_company_handle_fkey FOREIGN KEY (company_handle) REFERENCES public.companies(handle) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

