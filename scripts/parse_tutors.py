#!/usr/bin/env python3
import json
import re

# Data extracted from OCR of pages 1 to 42

# TABLE 1: ID, Name, Country, Location, Rating (Pages 1-7)
table1_lines = """
1 Dr. Mason Martin USA USA 4.88
2 Dr. Lucas Anderson USA USA 4.95
3 Sam Thompson, Ph.D. USA USA 4.91
4 Ethan Moore, Ph.D. USA USA 4.9
5 Dr. Mia Rodriguez USA USA 4.74
6 Dr. Amelia Jones USA USA 4.97
7 Dr. Logan Smith USA USA 4.77
8 Liam Young, Ph.D. USA USA 4.85
9 Olivia White, Ph.D. USA USA 4.75
10 Prof. Amelia Smith USA USA 4.79
11 Elena Robinson, Ph.D. USA USA 4.9
12 Dr. Olivia Allen USA USA 4.74
13 Chris Brown, Ph.D. USA USA 4.82
14 Sophia Harris, Ph.D. USA USA 4.76
15 Dr. Logan Thompson USA USA 4.84
16 Logan Young, Ph.D. USA USA 4.91
17 Dr. Lucas Smith USA USA 4.82
18 Prof. Logan Martin USA USA 4.79
19 Pat Martinez, Ph.D. USA USA 4.94
20 Dr. Cameron Brown USA USA 4.89
21 Pat Martinez, Ph.D. USA USA 4.76
22 Mia Ramirez, Ph.D. USA USA 4.71
23 Olivia Moore, Ph.D. USA USA 4.71
24 Dr. Ava Taylor USA USA 4.9
25 Olivia Harris, Ph.D. USA USA 4.74
26 Mia Jackson, Ph.D. USA USA 4.96
27 Chris Miller, Ph.D. USA USA 4.97
28 Dr. Liam Thomas USA USA 4.8
29 Chris Thompson, Ph.D. USA USA 4.7
30 Pat Anderson, Ph.D. USA USA 4.99
31 Morgan Lee, Ph.D. USA USA 4.97
32 Dr. Lucas Rodriguez USA USA 4.73
33 Dr. Sam White USA USA 4.78
34 Reine Young, Ph.D. USA USA 4.82
35 Benjamin Davis, Ph.D. USA USA 4.92
36 Dr. Sam Anderson USA USA 4.95
37 Prof. Harper Walker USA USA 4.7
38 Dr. Morgan Thomas USA USA 4.87
39 Dakota Martin, Ph.D. USA USA 4.72
40 Prof. Alex Clark USA USA 4.93
41 Prof. Olivia Smith USA USA 4.83
42 Sophia Thomas, Ph.D. USA USA 4.86
43 Prof. Sam Williams USA USA 4.85
44 Chris Miller, Ph.D. USA USA 4.82
45 Sam Rodriguez, Ph.D. USA USA 4.85
46 Prof. Jesse Brown USA USA 4.75
47 Taylor Ramirez, Ph.D. USA USA 4.99
48 Prof. Sam Walker USA USA 4.74
49 Prof. Amelia Ramirez USA USA 4.96
50 Chris Wilson, Ph.D. USA USA 4.88
51 Prof. Noah Walker USA USA 4.87
52 Dr. Mia Rodriguez USA USA 4.88
53 Dr. Morgan Allen USA USA 4.81
54 Prof. Taylor Allen USA USA 4.71
55 Logan Jones, Ph.D. USA USA 4.83
56 Dr. Cameron White USA USA 4.78
57 Pat White, Ph.D. USA USA 4.72
58 Sam Walker, Ph.D. USA USA 4.8
59 Evelyn Walker, Ph.D. USA USA 4.83
60 Ethan Williams, Ph.D. USA USA 4.92
61 Pat Miller, Ph.D. USA USA 4.94
62 Noah Davis, Ph.D. USA USA 5
63 Morgan Garcia, Ph.D. USA USA 4.86
64 Elena Lewis, Ph.D. USA USA 4.8
65 Mason Johnson, Ph.D. USA USA 4.94
66 Mia Anderson, Ph.D. USA USA 4.97
67 Dr. Noah Anderson USA USA 4.94
68 Elena Rodriguez, Ph.D. USA USA 4.75
69 Dr. Elena Young USA USA 4.85
70 Prof. Cameron Thompson USA USA 4.96
71 Prof. Amelia Moore USA USA 4.72
72 Chris Taylor, Ph.D. USA USA 4.74
73 Benjamin Williams, Ph.D. USA USA 4.98
74 Prof. Casey Anderson USA USA 4.96
75 Dr. Evelyn Garcia USA USA 4.9
76 Dakota Williams, Ph.D. USA USA 4.71
77 Prof. Morgan Perez USA USA 4.82
78 Prof. Ethan Clark USA USA 4.87
79 Olivia Rodriguez, Ph.D. USA USA 4.89
80 Sam Walker, Ph.D. USA USA 4.87
81 Prof. Evelyn White USA USA 4.89
82 Noah Thompson, Ph.D. USA USA 4.98
83 Pat Young, Ph.D. USA USA 4.91
84 Dr. Casey Harris USA USA 4.88
85 Avery Young, Ph.D. USA USA 4.88
86 Dakota Brown, Ph.D. USA USA 4.87
87 Dr. Mason Smith USA USA 4.89
88 Prof. Olivia Perez USA USA 4.72
89 Avery Davis, Ph.D. USA USA 4.9
90 Prof. Avery Smith USA USA 4.8
91 Mia Wilson, Ph.D. USA USA 4.79
92 Dr. Pat Lee USA USA 4.87
93 Riley Davis, Ph.D. USA USA 4.83
94 Ethan White, Ph.D. USA USA 4.93
95 Ethan Lee, Ph.D. USA USA 4.88
96 Evelyn Robinson, Ph.D. USA USA 4.84
97 Prof. Harper Lee USA USA 4.85
98 Dr. Evelyn Brown USA USA 4.77
99 Dr. Noah Jackson USA USA 4.86
100 Cameron Robinson, Ph.D. USA USA 4.75
101 Mason Lee, Ph.D. Canada Canada 4.89
102 Dr. Sophia Rodriguez Canada Canada 4.94
103 Prof. Evelyn Harris Canada Canada 4.85
104 Ethan Garcia, Ph.D. Canada Canada 4.85
105 Prof. Alex Williams Canada Canada 4.76
106 Prof. Sam Walker Canada Canada 4.8
107 Lucas Young, Ph.D. Canada Canada 4.76
108 Pat Thomas, Ph.D. Canada Canada 4.95
109 Prof. Riley Harris Canada Canada 4.77
110 Dr. Dakota Davis Canada Canada 4.96
111 Sophia Anderson, Ph.D. Canada Canada 4.8
112 Sophia Sanchez, Ph.D. Canada Canada 4.71
113 Morgan Wilson, Ph.D. Canada Canada 4.92
114 Dr. Dakota Young Canada Canada 4.71
115 Prof. Logan Allen Canada Canada 4.79
116 Casey Jones, Ph.D. Ireland Ireland 4.92
117 Olivia Anderson, Ph.D. Ireland Ireland 4.79
118 Dr. Jordan Anderson Ireland Ireland 4.83
119 Dr. Sophia Robinson Ireland Ireland 4.94
120 Dr. Benjamin Perez Ireland Ireland 4.81
121 Dr. Jesse Allen Ireland Ireland 4.99
122 Dr. Ava Martin Ireland Ireland 4.76
123 Reine Taylor, Ph.D. Ireland Ireland 4.97
124 Dr. Sophia Garcia Ireland Ireland 4.97
125 Dr. Reine Thompson Ireland Ireland 4.94
126 Prof. Alex Perez Ireland Ireland 4.9
127 Reine Lee, Ph.D. Ireland Ireland 4.96
128 Dr. Morgan Jackson Australia Australia 4.8
129 Taylor Brown, Ph.D. Australia Australia 4.74
130 Dr. Reine Walker Australia Australia 4.97
131 Prof. Logan Moore Australia Australia 4.71
132 Prof. Noah Jackson Australia Australia 4.71
133 Morgan Lewis, Ph.D. Australia Australia 4.83
134 Sophia Perez, Ph.D. Australia Australia 4.83
135 Harper Johnson, Ph.D. Australia Australia 4.99
136 Dr. Dakota Young Australia Australia 4.71
137 Dr. Mia Martin Australia Australia 4.86
138 Prof. Chris Clark Australia Australia 4.71
139 Olivia Allen, Ph.D. Australia Australia 4.85
140 Sam Robinson, Ph.D. Australia Australia 4.75
141 Ethan Garcia, Ph.D. Australia Australia 4.97
142 Prof. Mason Perez Australia Australia 4.91
143 Prof. Ava Thompson Australia Australia 4.74
144 Prof. Liam Jackson Australia Australia 4.84
145 Ethan Jones, Ph.D. Australia Australia 4.76
146 Evelyn Wilson, Ph.D. UK UK 4.9
147 Dr. Avery Wilson UK UK 4.77
148 Pat Martin, Ph.D. UK UK 4.96
149 Prof. Casey Harris UK UK 4.71
150 Morgan Johnson, Ph.D. UK UK 4.83
151 Prof. Benjamin Wilson UK UK 4.7
152 Sophia Young, Ph.D. UK UK 4.96
153 Liam Sanchez, Ph.D. UK UK 4.75
154 Elena Martin, Ph.D. UK UK 4.81
155 Mason Sanchez, Ph.D. UK UK 4.95
156 Dr. Taylor Thomas UK UK 4.72
157 Prof. Lucas Williams UK UK 4.82
158 Dr. Jordan Garcia UK UK 4.78
159 Prof. Amelia Moore UK UK 4.72
160 Dr. Noah Davis UK UK 4.71
161 Dr. Alex Lewis UK UK 4.93
162 Prof. Harper Garcia UK UK 4.79
163 Morgan Thompson, Ph.D. UK UK 4.97
164 Mason Smith, Ph.D. UK UK 4.75
165 Cameron Johnson, Ph.D. UK UK 4.96
166 Benjamin Martin, Ph.D. New Zealand New Zealand 4.76
167 Prof. Jesse Wilson New Zealand New Zealand 4.73
168 Lucas Ramirez, Ph.D. New Zealand New Zealand 4.92
169 Dr. Avery Walker New Zealand New Zealand 4.85
170 Riley White, Ph.D. New Zealand New Zealand 4.77
171 Lucas Harris, Ph.D. New Zealand New Zealand 4.92
172 Ava Lewis, Ph.D. New Zealand New Zealand 4.96
173 Dr. Alex Davis New Zealand New Zealand 4.97
174 Sam Martin, Ph.D. New Zealand New Zealand 4.84
175 Dr. Morgan Harris New Zealand New Zealand 4.95
176 Dr. Liam Allen Singapore Singapore 4.83
177 Prof. Mason Miller Singapore Singapore 4.92
178 Prof. Logan Taylor Singapore Singapore 4.97
179 Chris Wilson, Ph.D. Singapore Singapore 4.76
180 Ava White, Ph.D. Singapore Singapore 4.87
181 Prof. Sophia Perez Singapore Singapore 4.81
182 Prof. Cameron Miller Singapore Singapore 4.72
183 Pat Garcia, Ph.D. Singapore Singapore 4.71
184 Dr. Ava Lee Singapore Singapore 4.76
185 Dakota White, Ph.D. Singapore Singapore 4.73
186 Noah Taylor, Ph.D. Singapore Singapore 4.83
187 Dr. Harper Thompson Singapore Singapore 4.95
188 Jordan Robinson, Ph.D. Singapore Singapore 4.93
189 Cameron Allen, Ph.D. Singapore Singapore 4.99
190 Dr. Alex Thompson Singapore Singapore 5
191 Dr. Sam Robinson UAE UAE 4.99
192 Dr. Ava Smith UAE UAE 4.72
193 Benjamin Perez, Ph.D. UAE UAE 4.95
194 Olivia Young, Ph.D. UAE UAE 4.91
195 Prof. Chris Williams UAE UAE 4.78
196 Ava White, Ph.D. UAE UAE 4.94
197 Dr. Benjamin Taylor UAE UAE 4.75
198 Jesse Williams, Ph.D. UAE UAE 4.91
199 Dr. Taylor Allen UAE UAE 4.78
200 Alex Allen, Ph.D. UAE UAE 4.84
""".strip().splitlines()

# TABLE 2: Reviews Count, Hourly Rate ($/hr), Education (Pages 8-14)
table2_lines = """
224 $72 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
370 $116 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
140 $114 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
250 $110 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
185 $109 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
144 $103 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
231 $109 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
212 $86 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
163 $102 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
237 $61 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
161 $90 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
89 $69 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
231 $78 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
354 $64 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
108 $53 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
105 $113 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
313 $73 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
155 $50 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
356 $107 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
169 $110 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
88 $93 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
93 $108 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
243 $68 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
289 $104 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
268 $65 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
365 $55 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
301 $94 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
151 $100 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
91 $117 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
259 $60 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
165 $82 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
62 $57 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
285 $74 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
126 $114 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
213 $59 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
209 $98 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
369 $66 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
79 $71 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
188 $105 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
127 $63 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
122 $88 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
269 $109 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
280 $76 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
53 $110 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
331 $116 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
202 $107 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
342 $109 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
227 $108 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
258 $51 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
46 $67 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
255 $74 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
236 $120 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
159 $94 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
277 $54 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
264 $52 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
164 $60 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
197 $56 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
201 $114 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
334 $88 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
169 $109 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
299 $113 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
380 $89 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
218 $118 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
193 $65 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
161 $87 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
65 $63 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
265 $86 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
362 $79 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
330 $80 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
197 $108 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
335 $79 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
235 $118 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
264 $84 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
162 $67 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
360 $99 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
248 $113 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
75 $120 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
272 $63 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
296 $75 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
181 $117 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
333 $73 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
197 $91 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
127 $110 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
178 $62 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
318 $59 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
356 $98 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
186 $66 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
375 $87 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
265 $119 Caltech - Ph.D./M.S. in Computer Science & Advanced Tech
323 $85 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
365 $90 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
234 $101 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
346 $83 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech
98 $120 Carnegie Mellon University - Ph.D./M.S. in Computer Science & Advanced Tech
213 $55 Columbia University - Ph.D./M.S. in Computer Science & Advanced Tech
126 $115 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
166 $94 Stanford University - Ph.D./M.S. in Computer Science & Advanced Tech
265 $65 MIT - Ph.D./M.S. in Computer Science & Advanced Tech
277 $91 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
371 $57 Harvard University - Ph.D./M.S. in Computer Science & Advanced Tech
364 $63 University of Waterloo - Ph.D./M.S. in Computer Science & Advanced Tech
186 $62 McGill University - Ph.D./M.S. in Computer Science & Advanced Tech
196 $119 University of British Columbia - Ph.D./M.S. in Computer Science & Advanced Tech
340 $94 University of Waterloo - Ph.D./M.S. in Computer Science & Advanced Tech
314 $51 University of British Columbia - Ph.D./M.S. in Computer Science & Advanced Tech
272 $95 McGill University - Ph.D./M.S. in Computer Science & Advanced Tech
200 $100 University of Toronto - Ph.D./M.S. in Computer Science & Advanced Tech
302 $67 University of British Columbia - Ph.D./M.S. in Computer Science & Advanced Tech
283 $112 University of Waterloo - Ph.D./M.S. in Computer Science & Advanced Tech
182 $61 McGill University - Ph.D./M.S. in Computer Science & Advanced Tech
342 $66 University of Waterloo - Ph.D./M.S. in Computer Science & Advanced Tech
254 $89 University of British Columbia - Ph.D./M.S. in Computer Science & Advanced Tech
193 $115 University of Waterloo - Ph.D./M.S. in Computer Science & Advanced Tech
330 $101 University of British Columbia - Ph.D./M.S. in Computer Science & Advanced Tech
282 $68 University of Waterloo - Ph.D./M.S. in Computer Science & Advanced Tech
306 $93 University College Cork - Ph.D./M.S. in Computer Science & Advanced Tech
59 $110 Trinity College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
116 $76 University College Cork - Ph.D./M.S. in Computer Science & Advanced Tech
297 $74 University College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
214 $99 University College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
47 $95 Trinity College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
158 $87 University College Cork - Ph.D./M.S. in Computer Science & Advanced Tech
280 $113 Trinity College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
162 $51 University College Cork - Ph.D./M.S. in Computer Science & Advanced Tech
150 $85 University College Cork - Ph.D./M.S. in Computer Science & Advanced Tech
151 $90 University College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
176 $83 Trinity College Dublin - Ph.D./M.S. in Computer Science & Advanced Tech
176 $62 University of Queensland - Ph.D./M.S. in Computer Science & Advanced Tech
353 $75 University of Sydney - Ph.D./M.S. in Computer Science & Advanced Tech
56 $51 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
199 $76 University of Queensland - Ph.D./M.S. in Computer Science & Advanced Tech
80 $70 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
331 $114 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
154 $111 University of Melbourne - Ph.D./M.S. in Computer Science & Advanced Tech
334 $79 University of Sydney - Ph.D./M.S. in Computer Science & Advanced Tech
325 $61 University of Sydney - Ph.D./M.S. in Computer Science & Advanced Tech
319 $99 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
224 $72 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
317 $109 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
50 $57 University of Melbourne - Ph.D./M.S. in Computer Science & Advanced Tech
203 $115 University of Sydney - Ph.D./M.S. in Computer Science & Advanced Tech
281 $70 University of Queensland - Ph.D./M.S. in Computer Science & Advanced Tech
161 $120 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
82 $87 University of Queensland - Ph.D./M.S. in Computer Science & Advanced Tech
275 $62 Australian National University - Ph.D./M.S. in Computer Science & Advanced Tech
64 $80 UCL - Ph.D./M.S. in Computer Science & Advanced Tech
328 $55 Imperial College London - Ph.D./M.S. in Computer Science & Advanced Tech
347 $111 University of Oxford - Ph.D./M.S. in Computer Science & Advanced Tech
301 $67 University of Oxford - Ph.D./M.S. in Computer Science & Advanced Tech
338 $81 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
254 $120 University of Oxford - Ph.D./M.S. in Computer Science & Advanced Tech
76 $77 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
69 $59 University of Edinburgh - Ph.D./M.S. in Computer Science & Advanced Tech
325 $69 UCL - Ph.D./M.S. in Computer Science & Advanced Tech
333 $112 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
371 $66 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
327 $64 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
249 $99 Imperial College London - Ph.D./M.S. in Computer Science & Advanced Tech
191 $98 University of Edinburgh - Ph.D./M.S. in Computer Science & Advanced Tech
314 $86 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
124 $84 Imperial College London - Ph.D./M.S. in Computer Science & Advanced Tech
55 $85 University of Oxford - Ph.D./M.S. in Computer Science & Advanced Tech
350 $110 Imperial College London - Ph.D./M.S. in Computer Science & Advanced Tech
291 $76 UCL - Ph.D./M.S. in Computer Science & Advanced Tech
166 $115 University of Cambridge - Ph.D./M.S. in Computer Science & Advanced Tech
95 $69 University of Auckland - Ph.D./M.S. in Computer Science & Advanced Tech
115 $52 University of Canterbury - Ph.D./M.S. in Computer Science & Advanced Tech
161 $77 University of Otago - Ph.D./M.S. in Computer Science & Advanced Tech
340 $76 University of Auckland - Ph.D./M.S. in Computer Science & Advanced Tech
362 $91 University of Otago - Ph.D./M.S. in Computer Science & Advanced Tech
180 $104 University of Otago - Ph.D./M.S. in Computer Science & Advanced Tech
358 $59 University of Canterbury - Ph.D./M.S. in Computer Science & Advanced Tech
322 $105 University of Otago - Ph.D./M.S. in Computer Science & Advanced Tech
177 $105 University of Otago - Ph.D./M.S. in Computer Science & Advanced Tech
372 $61 University of Otago - Ph.D./M.S. in Computer Science & Advanced Tech
74 $83 National University of Singapore (NUS) - Ph.D./M.S. in Computer Science & Advanced Tech
113 $109 National University of Singapore (NUS) - Ph.D./M.S. in Computer Science & Advanced Tech
121 $66 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
155 $65 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
185 $116 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
336 $111 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
202 $87 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
50 $110 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
334 $79 National University of Singapore (NUS) - Ph.D./M.S. in Computer Science & Advanced Tech
86 $77 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
51 $78 National University of Singapore (NUS) - Ph.D./M.S. in Computer Science & Advanced Tech
265 $118 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
322 $80 Nanyang Technological University (NTU) - Ph.D./M.S. in Computer Science & Advanced Tech
244 $52 National University of Singapore (NUS) - Ph.D./M.S. in Computer Science & Advanced Tech
132 $105 National University of Singapore (NUS) - Ph.D./M.S. in Computer Science & Advanced Tech
316 $52 American University of Sharjah - Ph.D./M.S. in Computer Science & Advanced Tech
61 $57 American University of Sharjah - Ph.D./M.S. in Computer Science & Advanced Tech
262 $92 United Arab Emirates University - Ph.D./M.S. in Computer Science & Advanced Tech
353 $79 Khalifa University - Ph.D./M.S. in Computer Science & Advanced Tech
109 $58 United Arab Emirates University - Ph.D./M.S. in Computer Science & Advanced Tech
82 $75 United Arab Emirates University - Ph.D./M.S. in Computer Science & Advanced Tech
357 $109 Khalifa University - Ph.D./M.S. in Computer Science & Advanced Tech
187 $80 United Arab Emirates University - Ph.D./M.S. in Computer Science & Advanced Tech
102 $91 Khalifa University - Ph.D./M.S. in Computer Science & Advanced Tech
79 $59 United Arab Emirates University - Ph.D./M.S. in Computer Science & Advanced Tech
""".strip().splitlines()

# TABLE 3: Experience Summary and Subject Expertise (Pages 15-21)
# Note: Experience is identical across records:
# "Specializing in cutting-edge technology, scalable software architectures, and advanced research. Guiding undergraduate and graduate students through thesis papers, coding assignments, and industry pipelines."
# Subject Expertise follows on the same line.
table3_lines = """
Biomedical Engineering, Generative AI, Deep Learning, Artificial Intelligence
Natural Language Processing (NLP), Artificial Intelligence, Data Science & Analytics, Python & PyTorch, Large Language Models (LLM)
Deep Learning, Quantitative Finance & Algorithmic Trading, Neural Networks, Full-Stack Software Engineering
Deep Learning, Python & PyTorch, Full-Stack Software Engineering, Generative AI, Biomedical Engineering
Data Science & Analytics, Quantitative Finance & Algorithmic Trading, Natural Language Processing (NLP), Python & PyTorch, Neural Networks
Large Language Models (LLM), Data Science & Analytics, Biomedical Engineering, Neural Networks, Artificial Intelligence
Deep Learning, Quantitative Finance & Algorithmic Trading, Neural Networks, Large Language Models (LLM)
Cloud Computing & DevOps, Biomedical Engineering, Generative AI, Cybersecurity & Ethical Hacking, Artificial Intelligence
Cloud Computing & DevOps, Generative AI, Biomedical Engineering, Cybersecurity & Ethical Hacking, Natural Language Processing (NLP)
Large Language Models (LLM), Cybersecurity & Ethical Hacking, Reinforcement Learning, Quantitative Finance & Algorithmic Trading, Neural Networks
Natural Language Processing (NLP), Reinforcement Learning, Cybersecurity & Ethical Hacking
Python & PyTorch, Biomedical Engineering, Cybersecurity & Ethical Hacking, Reinforcement Learning
Cloud Computing & DevOps, Natural Language Processing (NLP), Full-Stack Software Engineering, Quantitative Finance & Algorithmic Trading, Deep Learning
Full-Stack Software Engineering, Data Science & Analytics, Python & PyTorch, Neural Networks, Generative AI
Large Language Models (LLM), Reinforcement Learning, Generative AI, Python & PyTorch
Data Science & Analytics, Quantitative Finance & Algorithmic Trading, Neural Networks
Large Language Models (LLM), Quantitative Finance & Algorithmic Trading, Natural Language Processing (NLP), Python & PyTorch, Reinforcement Learning
Large Language Models (LLM), Artificial Intelligence, Generative AI, Python & PyTorch
Data Science & Analytics, Neural Networks, Deep Learning, Natural Language Processing (NLP)
Biomedical Engineering, Deep Learning, Cybersecurity & Ethical Hacking, Cloud Computing & DevOps
Natural Language Processing (NLP), Artificial Intelligence, Full-Stack Software Engineering, Quantitative Finance & Algorithmic Trading
Reinforcement Learning, Quantitative Finance & Algorithmic Trading, Natural Language Processing (NLP), Data Science & Analytics, Generative AI
Full-Stack Software Engineering, Python & PyTorch, Data Science & Analytics
Python & PyTorch, Deep Learning, Artificial Intelligence
Data Science & Analytics, Biomedical Engineering, Python & PyTorch
Reinforcement Learning, Natural Language Processing (NLP), Cybersecurity & Ethical Hacking, Quantitative Finance & Algorithmic Trading
Cybersecurity & Ethical Hacking, Natural Language Processing (NLP), Cloud Computing & DevOps, Reinforcement Learning
Natural Language Processing (NLP), Full-Stack Software Engineering, Cloud Computing & DevOps, Data Science & Analytics
Quantitative Finance & Algorithmic Trading, Biomedical Engineering, Reinforcement Learning, Data Science & Analytics, Natural Language Processing (NLP)
Biomedical Engineering, Deep Learning, Quantitative Finance & Algorithmic Trading
Neural Networks, Cybersecurity & Ethical Hacking, Python & PyTorch
Artificial Intelligence, Quantitative Finance & Algorithmic Trading, Deep Learning, Biomedical Engineering
Cybersecurity & Ethical Hacking, Quantitative Finance & Algorithmic Trading, Natural Language Processing (NLP), Full-Stack Software Engineering
Reinforcement Learning, Neural Networks, Natural Language Processing (NLP), Large Language Models (LLM), Full-Stack Software Engineering
Python & PyTorch, Cloud Computing & DevOps, Reinforcement Learning, Cybersecurity & Ethical Hacking
Artificial Intelligence, Deep Learning, Data Science & Analytics
Biomedical Engineering, Data Science & Analytics, Generative AI
Quantitative Finance & Algorithmic Trading, Large Language Models (LLM), Python & PyTorch, Reinforcement Learning
Python & PyTorch, Generative AI, Deep Learning
Large Language Models (LLM), Python & PyTorch, Cybersecurity & Ethical Hacking, Neural Networks
Cybersecurity & Ethical Hacking, Cloud Computing & DevOps, Quantitative Finance & Algorithmic Trading, Biomedical Engineering, Python & PyTorch
Artificial Intelligence, Cybersecurity & Ethical Hacking, Python & PyTorch
Python & PyTorch, Natural Language Processing (NLP), Large Language Models (LLM)
Biomedical Engineering, Quantitative Finance & Algorithmic Trading, Python & PyTorch
Quantitative Finance & Algorithmic Trading, Reinforcement Learning, Artificial Intelligence, Generative AI, Cybersecurity & Ethical Hacking
Reinforcement Learning, Large Language Models (LLM), Cloud Computing & DevOps, Data Science & Analytics
Full-Stack Software Engineering, Deep Learning, Biomedical Engineering, Cloud Computing & DevOps, Data Science & Analytics
Deep Learning, Data Science & Analytics, Reinforcement Learning, Artificial Intelligence
Generative AI, Data Science & Analytics, Cybersecurity & Ethical Hacking
Cloud Computing & DevOps, Cybersecurity & Ethical Hacking, Python & PyTorch
Natural Language Processing (NLP), Artificial Intelligence, Quantitative Finance & Algorithmic Trading
Cloud Computing & DevOps, Data Science & Analytics, Large Language Models (LLM)
Python & PyTorch, Neural Networks, Data Science & Analytics, Quantitative Finance & Algorithmic Trading
Cloud Computing & DevOps, Neural Networks, Python & PyTorch, Artificial Intelligence
Full-Stack Software Engineering, Cybersecurity & Ethical Hacking, Reinforcement Learning, Quantitative Finance & Algorithmic Trading
Deep Learning, Neural Networks, Large Language Models (LLM), Artificial Intelligence
Generative AI, Neural Networks, Reinforcement Learning, Data Science & Analytics
Python & PyTorch, Neural Networks, Natural Language Processing (NLP), Cloud Computing & DevOps, Reinforcement Learning
Full-Stack Software Engineering, Cloud Computing & DevOps, Reinforcement Learning, Natural Language Processing (NLP), Biomedical Engineering
Full-Stack Software Engineering, Reinforcement Learning, Artificial Intelligence
Python & PyTorch, Biomedical Engineering, Reinforcement Learning
Cloud Computing & DevOps, Quantitative Finance & Algorithmic Trading, Natural Language Processing (NLP), Python & PyTorch, Full-Stack Software Engineering
Artificial Intelligence, Quantitative Finance & Algorithmic Trading, Data Science & Analytics, Large Language Models (LLM)
Biomedical Engineering, Reinforcement Learning, Neural Networks, Cybersecurity & Ethical Hacking
Neural Networks, Python & PyTorch, Artificial Intelligence
Generative AI, Cloud Computing & DevOps, Large Language Models (LLM), Artificial Intelligence
Deep Learning, Large Language Models (LLM), Full-Stack Software Engineering, Biomedical Engineering
Natural Language Processing (NLP), Quantitative Finance & Algorithmic Trading, Biomedical Engineering, Deep Learning
Full-Stack Software Engineering, Cybersecurity & Ethical Hacking, Biomedical Engineering, Natural Language Processing (NLP), Quantitative Finance & Algorithmic Trading
Reinforcement Learning, Data Science & Analytics, Large Language Models (LLM), Full-Stack Software Engineering, Biomedical Engineering
Large Language Models (LLM), Deep Learning, Biomedical Engineering, Cybersecurity & Ethical Hacking, Reinforcement Learning
Python & PyTorch, Data Science & Analytics, Cybersecurity & Ethical Hacking
Biomedical Engineering, Generative AI, Natural Language Processing (NLP), Python & PyTorch
Biomedical Engineering, Reinforcement Learning, Generative AI, Quantitative Finance & Algorithmic Trading, Artificial Intelligence
Large Language Models (LLM), Cybersecurity & Ethical Hacking, Cloud Computing & DevOps, Python & PyTorch, Data Science & Analytics
Deep Learning, Quantitative Finance & Algorithmic Trading, Reinforcement Learning, Cloud Computing & DevOps
Python & PyTorch, Cloud Computing & DevOps, Natural Language Processing (NLP)
Artificial Intelligence, Cloud Computing & DevOps, Data Science & Analytics, Python & PyTorch
Natural Language Processing (NLP), Artificial Intelligence, Quantitative Finance & Algorithmic Trading, Neural Networks
Cybersecurity & Ethical Hacking, Generative AI, Natural Language Processing (NLP), Reinforcement Learning
Natural Language Processing (NLP), Generative AI, Biomedical Engineering, Reinforcement Learning, Quantitative Finance & Algorithmic Trading
Cybersecurity & Ethical Hacking, Large Language Models (LLM), Generative AI, Natural Language Processing (NLP)
Quantitative Finance & Algorithmic Trading, Python & PyTorch, Cloud Computing & DevOps, Reinforcement Learning
Biomedical Engineering, Generative AI, Quantitative Finance & Algorithmic Trading, Cloud Computing & DevOps, Cybersecurity & Ethical Hacking
Cybersecurity & Ethical Hacking, Artificial Intelligence, Generative AI
Python & PyTorch, Neural Networks, Cloud Computing & DevOps, Cybersecurity & Ethical Hacking, Data Science & Analytics
Artificial Intelligence, Generative AI, Neural Networks
Cloud Computing & DevOps, Natural Language Processing (NLP), Python & PyTorch, Data Science & Analytics
Deep Learning, Generative AI, Natural Language Processing (NLP), Python & PyTorch
Cybersecurity & Ethical Hacking, Deep Learning, Artificial Intelligence
Reinforcement Learning, Deep Learning, Artificial Intelligence, Natural Language Processing (NLP), Python & PyTorch
Cybersecurity & Ethical Hacking, Reinforcement Learning, Neural Networks, Biomedical Engineering, Artificial Intelligence
Large Language Models (LLM), Quantitative Finance & Algorithmic Trading, Python & PyTorch, Data Science & Analytics, Deep Learning
Cloud Computing & DevOps, Reinforcement Learning, Full-Stack Software Engineering, Neural Networks, Natural Language Processing (NLP)
Biomedical Engineering, Cybersecurity & Ethical Hacking, Quantitative Finance & Algorithmic Trading, Deep Learning
Full-Stack Software Engineering, Natural Language Processing (NLP), Cybersecurity & Ethical Hacking
Artificial Intelligence, Cloud Computing & DevOps, Full-Stack Software Engineering, Data Science & Analytics, Deep Learning
Large Language Models (LLM), Generative AI, Cybersecurity & Ethical Hacking, Data Science & Analytics
Neural Networks, Large Language Models (LLM), Cloud Computing & DevOps
Large Language Models (LLM), Cybersecurity & Ethical Hacking, Quantitative Finance & Algorithmic Trading, Full-Stack Software Engineering
Cybersecurity & Ethical Hacking, Generative AI, Data Science & Analytics, Quantitative Finance & Algorithmic Trading
Generative AI, Python & PyTorch, Full-Stack Software Engineering
Cybersecurity & Ethical Hacking, Neural Networks, Full-Stack Software Engineering, Data Science & Analytics, Python & PyTorch
Full-Stack Software Engineering, Artificial Intelligence, Large Language Models (LLM), Data Science & Analytics, Python & PyTorch
Full-Stack Software Engineering, Data Science & Analytics, Quantitative Finance & Algorithmic Trading
Quantitative Finance & Algorithmic Trading, Biomedical Engineering, Large Language Models (LLM), Reinforcement Learning, Python & PyTorch
Reinforcement Learning, Biomedical Engineering, Deep Learning
Python & PyTorch, Reinforcement Learning, Large Language Models (LLM), Data Science & Analytics
Neural Networks, Cloud Computing & DevOps, Artificial Intelligence, Large Language Models (LLM)
Full-Stack Software Engineering, Generative AI, Natural Language Processing (NLP), Data Science & Analytics
Data Science & Analytics, Reinforcement Learning, Neural Networks, Cloud Computing & DevOps, Quantitative Finance & Algorithmic Trading
Large Language Models (LLM), Cybersecurity & Ethical Hacking, Generative AI, Neural Networks
Cybersecurity & Ethical Hacking, Quantitative Finance & Algorithmic Trading, Full-Stack Software Engineering, Reinforcement Learning
Python & PyTorch, Cloud Computing & DevOps, Full-Stack Software Engineering, Quantitative Finance & Algorithmic Trading
Cloud Computing & DevOps, Generative AI, Biomedical Engineering, Artificial Intelligence, Large Language Models (LLM)
Python & PyTorch, Cloud Computing & DevOps, Full-Stack Software Engineering
Data Science & Analytics, Neural Networks, Cloud Computing & DevOps, Quantitative Finance & Algorithmic Trading, Deep Learning
Full-Stack Software Engineering, Generative AI, Artificial Intelligence, Deep Learning
Large Language Models (LLM), Neural Networks, Reinforcement Learning, Data Science & Analytics, Artificial Intelligence
Full-Stack Software Engineering, Neural Networks, Large Language Models (LLM), Cybersecurity & Ethical Hacking, Biomedical Engineering
Biomedical Engineering, Quantitative Finance & Algorithmic Trading, Generative AI
Deep Learning, Biomedical Engineering, Natural Language Processing (NLP)
Large Language Models (LLM), Natural Language Processing (NLP), Reinforcement Learning, Data Science & Analytics
Natural Language Processing (NLP), Full-Stack Software Engineering, Python & PyTorch, Artificial Intelligence
Reinforcement Learning, Neural Networks, Natural Language Processing (NLP), Data Science & Analytics, Cloud Computing & DevOps
Artificial Intelligence, Deep Learning, Reinforcement Learning
Quantitative Finance & Algorithmic Trading, Large Language Models (LLM), Neural Networks, Data Science & Analytics, Cybersecurity & Ethical Hacking
Large Language Models (LLM), Generative AI, Neural Networks
Data Science & Analytics, Cloud Computing & DevOps, Neural Networks, Generative AI
Large Language Models (LLM), Cybersecurity & Ethical Hacking, Biomedical Engineering, Natural Language Processing (NLP)
Neural Networks, Generative AI, Python & PyTorch
Large Language Models (LLM), Deep Learning, Full-Stack Software Engineering, Quantitative Finance & Algorithmic Trading
Artificial Intelligence, Generative AI, Large Language Models (LLM), Reinforcement Learning
Artificial Intelligence, Neural Networks, Cloud Computing & DevOps
Cloud Computing & DevOps, Data Science & Analytics, Full-Stack Software Engineering, Python & PyTorch
Large Language Models (LLM), Cloud Computing & DevOps, Natural Language Processing (NLP)
Quantitative Finance & Algorithmic Trading, Full-Stack Software Engineering, Artificial Intelligence, Cybersecurity & Ethical Hacking
Cloud Computing & DevOps, Quantitative Finance & Algorithmic Trading, Data Science & Analytics, Generative AI, Full-Stack Software Engineering
Natural Language Processing (NLP), Generative AI, Full-Stack Software Engineering, Neural Networks, Deep Learning
Generative AI, Large Language Models (LLM), Neural Networks, Deep Learning, Cloud Computing & DevOps
Natural Language Processing (NLP), Full-Stack Software Engineering, Neural Networks, Python & PyTorch, Artificial Intelligence
Artificial Intelligence, Reinforcement Learning, Deep Learning, Cloud Computing & DevOps
Data Science & Analytics, Large Language Models (LLM), Quantitative Finance & Algorithmic Trading, Cybersecurity & Ethical Hacking, Cloud Computing & DevOps
Large Language Models (LLM), Python & PyTorch, Data Science & Analytics
Natural Language Processing (NLP), Deep Learning, Cloud Computing & DevOps
Cloud Computing & DevOps, Reinforcement Learning, Generative AI
Deep Learning, Reinforcement Learning, Cybersecurity & Ethical Hacking, Biomedical Engineering, Generative AI
Deep Learning, Cloud Computing & DevOps, Natural Language Processing (NLP), Large Language Models (LLM)
Cybersecurity & Ethical Hacking, Artificial Intelligence, Quantitative Finance & Algorithmic Trading, Cloud Computing & DevOps
Generative AI, Data Science & Analytics, Natural Language Processing (NLP), Cloud Computing & DevOps, Python & PyTorch
Python & PyTorch, Cloud Computing & DevOps, Biomedical Engineering, Full-Stack Software Engineering
Cybersecurity & Ethical Hacking, Cloud Computing & DevOps, Generative AI, Biomedical Engineering
Data Science & Analytics, Biomedical Engineering, Artificial Intelligence, Generative AI, Large Language Models (LLM)
Large Language Models (LLM), Data Science & Analytics, Cybersecurity & Ethical Hacking
Deep Learning, Large Language Models (LLM), Reinforcement Learning, Cloud Computing & DevOps, Natural Language Processing (NLP)
Cloud Computing & DevOps, Neural Networks, Quantitative Finance & Algorithmic Trading
Data Science & Analytics, Python & PyTorch, Cloud Computing & DevOps, Generative AI, Full-Stack Software Engineering
Neural Networks, Biomedical Engineering, Quantitative Finance & Algorithmic Trading, Python & PyTorch, Large Language Models (LLM)
Natural Language Processing (NLP), Biomedical Engineering, Neural Networks, Deep Learning, Large Language Models (LLM)
Reinforcement Learning, Quantitative Finance & Algorithmic Trading, Cybersecurity & Ethical Hacking, Neural Networks, Cloud Computing & DevOps
Neural Networks, Deep Learning, Python & PyTorch, Cloud Computing & DevOps, Natural Language Processing (NLP)
Full-Stack Software Engineering, Artificial Intelligence, Natural Language Processing (NLP)
Natural Language Processing (NLP), Cybersecurity & Ethical Hacking, Artificial Intelligence
Cybersecurity & Ethical Hacking, Python & PyTorch, Neural Networks
Cybersecurity & Ethical Hacking, Large Language Models (LLM), Natural Language Processing (NLP), Artificial Intelligence
Python & PyTorch, Reinforcement Learning, Cybersecurity & Ethical Hacking, Full-Stack Software Engineering
Neural Networks, Natural Language Processing (NLP), Quantitative Finance & Algorithmic Trading, Artificial Intelligence
Generative AI, Quantitative Finance & Algorithmic Trading, Deep Learning
Python & PyTorch, Data Science & Analytics, Large Language Models (LLM), Cloud Computing & DevOps
Cybersecurity & Ethical Hacking, Artificial Intelligence, Neural Networks, Natural Language Processing (NLP), Deep Learning
Deep Learning, Large Language Models (LLM), Cloud Computing & DevOps
Cybersecurity & Ethical Hacking, Python & PyTorch, Large Language Models (LLM), Neural Networks, Data Science & Analytics
Quantitative Finance & Algorithmic Trading, Cybersecurity & Ethical Hacking, Deep Learning, Biomedical Engineering
Artificial Intelligence, Cybersecurity & Ethical Hacking, Biomedical Engineering, Neural Networks
Deep Learning, Reinforcement Learning, Full-Stack Software Engineering, Biomedical Engineering, Artificial Intelligence
Cybersecurity & Ethical Hacking, Large Language Models (LLM), Data Science & Analytics, Biomedical Engineering
Natural Language Processing (NLP), Reinforcement Learning, Large Language Models (LLM), Python & PyTorch, Data Science & Analytics
Cybersecurity & Ethical Hacking, Cloud Computing & DevOps, Generative AI
Large Language Models (LLM), Cloud Computing & DevOps, Full-Stack Software Engineering, Biomedical Engineering, Deep Learning
Data Science & Analytics, Generative AI, Natural Language Processing (NLP)
Quantitative Finance & Algorithmic Trading, Cybersecurity & Ethical Hacking, Full-Stack Software Engineering, Biomedical Engineering
Data Science & Analytics, Neural Networks, Cybersecurity & Ethical Hacking, Deep Learning
Quantitative Finance & Algorithmic Trading, Cloud Computing & DevOps, Artificial Intelligence, Python & PyTorch, Reinforcement Learning
Deep Learning, Cloud Computing & DevOps, Data Science & Analytics
Neural Networks, Biomedical Engineering, Large Language Models (LLM), Artificial Intelligence
Deep Learning, Biomedical Engineering, Generative AI, Large Language Models (LLM)
Python & PyTorch, Large Language Models (LLM), Data Science & Analytics, Artificial Intelligence
Neural Networks, Python & PyTorch, Natural Language Processing (NLP), Biomedical Engineering, Cybersecurity & Ethical Hacking
Large Language Models (LLM), Neural Networks, Artificial Intelligence, Reinforcement Learning
Cloud Computing & DevOps, Artificial Intelligence, Data Science & Analytics, Reinforcement Learning, Large Language Models (LLM)
Full-Stack Software Engineering, Neural Networks, Artificial Intelligence, Data Science & Analytics
Biomedical Engineering, Natural Language Processing (NLP), Artificial Intelligence, Data Science & Analytics
Reinforcement Learning, Large Language Models (LLM), Data Science & Analytics, Quantitative Finance & Algorithmic Trading
Quantitative Finance & Algorithmic Trading, Reinforcement Learning, Large Language Models (LLM), Cybersecurity & Ethical Hacking
Cloud Computing & DevOps, Quantitative Finance & Algorithmic Trading, Reinforcement Learning, Natural Language Processing (NLP)
Full-Stack Software Engineering, Quantitative Finance & Algorithmic Trading, Neural Networks, Reinforcement Learning, Biomedical Engineering
Deep Learning, Natural Language Processing (NLP), Full-Stack Software Engineering
Neural Networks, Data Science & Analytics, Generative AI, Reinforcement Learning
Reinforcement Learning, Quantitative Finance & Algorithmic Trading, Large Language Models (LLM)
Full-Stack Software Engineering, Natural Language Processing (NLP), Reinforcement Learning, Python & PyTorch, Cloud Computing & DevOps
""".strip().splitlines()

# TABLE 4: Availability and Can Meet (Pages 22-28)
# Extracted pattern: Availability + Can Meet
table4_lines = """
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 20 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 global
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays & Weekends with Flexible Video Whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekends only, 1-on-1 video whiteboard | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 10 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 & Up to 20 miles locally
Flexible hours, custom virtual sessions | Virtual Online 1-on-1 global
Weekdays Evenings & Saturday mornings | Virtual Online 1-on-1 & Up to 10 miles locally
""".strip().splitlines()

# TABLE 5: Hobbies / Interests (Pages 29-35)
table5_lines = """
Research publications, algorithmic puzzles, and academic coaching.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Competitive programming, open-source AI projects, and mentoring.
Competitive programming, open-source AI projects, and mentoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Quantitative modeling, hackathons, and reading research papers.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Data visualization, Kaggle competitions, and tutoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Data visualization, Kaggle competitions, and tutoring.
Robotics prototyping, chess strategy, and technical blogging.
Data visualization, Kaggle competitions, and tutoring.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Data visualization, Kaggle competitions, and tutoring.
Robotics prototyping, chess strategy, and technical blogging.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Competitive programming, open-source AI projects, and mentoring.
Data visualization, Kaggle competitions, and tutoring.
Quantitative modeling, hackathons, and reading research papers.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Robotics prototyping, chess strategy, and technical blogging.
Research publications, algorithmic puzzles, and academic coaching.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Robotics prototyping, chess strategy, and technical blogging.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Data visualization, Kaggle competitions, and tutoring.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Robotics prototyping, chess strategy, and technical blogging.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Research publications, algorithmic puzzles, and academic coaching.
Quantitative modeling, hackathons, and reading research papers.
Quantitative modeling, hackathons, and reading research papers.
Data visualization, Kaggle competitions, and tutoring.
Robotics prototyping, chess strategy, and technical blogging.
Competitive programming, open-source AI projects, and mentoring.
Quantitative modeling, hackathons, and reading research papers.
Competitive programming, open-source AI projects, and mentoring.
Data visualization, Kaggle competitions, and tutoring.
Research publications, algorithmic puzzles, and academic coaching.
Research publications, algorithmic puzzles, and academic coaching.
""".strip().splitlines()

COUNTRY_CODE_MAP = {
    'USA': 'US',
    'Canada': 'CA',
    'Ireland': 'IE',
    'Australia': 'AU',
    'UK': 'GB',
    'New Zealand': 'NZ',
    'Singapore': 'SG',
    'UAE': 'AE'
}

AVATARS_LIST = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
]

print(f"Table 1 count: {len(table1_lines)}")
print(f"Table 2 count: {len(table2_lines)}")
print(f"Table 3 count: {len(table3_lines)}")
print(f"Table 4 count: {len(table4_lines)}")
print(f"Table 5 count: {len(table5_lines)}")

tutors = []

for i in range(200):
    KNOWN_COUNTRIES = ['New Zealand', 'USA', 'Canada', 'Ireland', 'Australia', 'UK', 'Singapore', 'UAE']
    t1 = table1_lines[i].strip()
    parts = t1.split()
    idx = int(parts[0])
    rating = float(parts[-1])
    rest = ' '.join(parts[1:-1])
    matched = False
    for c in KNOWN_COUNTRIES:
        target = f' {c} {c}'
        if rest.endswith(target):
            name = rest[:-len(target)].strip()
            country = c
            location = c
            matched = True
            break
    if not matched:
        raise ValueError(f'Could not parse line {i}: {t1}')

    # Parse Table 2 line: e.g. "224 $72 UC Berkeley - Ph.D./M.S. in Computer Science & Advanced Tech"
    t2 = table2_lines[i].strip()
    m2 = re.match(r'^(\d+)\s+\$(\d+)\s+(.+)$', t2)
    if m2:
        reviews_count = int(m2.group(1))
        hourly_rate = int(m2.group(2))
        education = m2.group(3).strip()
    else:
        raise ValueError(f"Failed to parse table 2 line {i}: {t2}")

    # Parse Table 3 line: Subject expertise
    subjects_raw = table3_lines[i].strip()
    subjects = [s.strip() for s in subjects_raw.split(',') if s.strip()]

    # Parse Table 4 line: Availability | Can Meet
    t4 = table4_lines[i].strip()
    p4 = t4.split('|')
    availability = p4[0].strip()
    can_meet = p4[1].strip() if len(p4) > 1 else 'Virtual Online 1-on-1'

    # Parse Table 5 line: Hobbies
    hobbies = table5_lines[i].strip()

    country_code = COUNTRY_CODE_MAP.get(country, 'US')
    avatar_url = AVATARS_LIST[i % len(AVATARS_LIST)]
    tutor_id = f"tutor_global_{idx:03d}"
    email_name = re.sub(r'[^a-z0-9]', '.', name.lower().replace('dr.', '').replace('prof.', '').replace('ph.d.', '').strip()).replace('..', '.')
    email = f"{email_name.strip('.')}@university-tutors.com"

    experience = "Specializing in cutting-edge technology, scalable software architectures, and advanced research. Guiding undergraduate and graduate students through thesis papers, coding assignments, and industry pipelines."

    tutor_obj = {
        "id": tutor_id,
        "numericId": idx,
        "name": name,
        "role": "tutor",
        "email": email,
        "country": country_code,
        "countryName": country,
        "location": location,
        "rating": rating,
        "reviewCount": reviews_count,
        "hourlyRate": hourly_rate,
        "education": education,
        "experience": experience,
        "bio": f"{education}. {experience}",
        "subjectExpertise": subjects,
        "subjects": subjects,
        "availability": availability,
        "canMeet": can_meet,
        "hobbies": hobbies,
        "verificationStatus": "Verified Degree & Background",
        "verified": True,
        "isApproved": True,
        "status": "approved",
        "avatarUrl": avatar_url,
        "createdAt": "2026-01-15T08:00:00.000Z"
    }
    tutors.append(tutor_obj)

print(f"Successfully processed {len(tutors)} tutors.")

# Output public/tutors_200.json
with open('public/tutors_200.json', 'w') as f:
    json.dump(tutors, f, indent=2)

# Output src/data/trendingTutors200Data.ts
ts_content = f"""import {{ User, UserRole }} from '../types';

export interface TrendingTutor extends User {{
  numericId: number;
  countryName: string;
  verificationStatus: string;
}}

export const TRENDING_TUTORS_200: TrendingTutor[] = {json.dumps(tutors, indent=2)};
"""

# Replace "role": "tutor" with "role": UserRole.TUTOR if needed or keep string/enum compatible
with open('src/data/trendingTutors200Data.ts', 'w') as f:
    f.write(ts_content)

print("Saved public/tutors_200.json and src/data/trendingTutors200Data.ts")
