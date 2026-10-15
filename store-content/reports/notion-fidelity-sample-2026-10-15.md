# Notion export fidelity sample - 2026-10-15 (task C13)

Independent source-fidelity check of the Notion exports in `store-content/export` (branch `codex/g1-notion-export-pilot-20261014`) against the live Notion pages. **This is a stratified sample of 121 of the exported pages, not a full verification.**

## Summary

| Measure | Count |
|---|---|
| Pages sampled | 121 (60 lessons, 61 activities) |
| OK (body identical, timestamp unchanged, title consistent) | 121 |
| DIFF (body differs from live Notion) | 0 |
| TITLE-MISMATCH | 0 |
| TIMESTAMP-CHANGED (Notion edited after export) | 0 |
| Truncated pages / unknown blocks reported by Notion | 0 / 0 |
| Previously-wrong EN items re-checked (10 of 10) | 10 OK |

**No export defect was found in the sample.** See "Limitations" for one comparison caveat (trailing hard-break spaces).

## Method

1. Sample drawn with a fixed seed (mulberry32, seed 13) by a script that shuffles the exported IDs per language and sport and takes the first eligible ones.
2. Lessons: 2 per sport (AT, BB, FB, FIT, HB, VB) per language = 12 per language, 60 total. Excluded IDs: BB-09, FB-07, FIT-04, HB-07, VB-05, AT-04 and the already-checked HE AT-03/VB-07/BB-06, AR HB-09/FB-06/AT-08, RU FB-08/BB-04/FIT-07, ES BB-10/VB-02/HB-04.
3. Activities: 6 drills (DR), 3 games (GM), 3 activities (AC) per language = 12 per language. EN additionally contains all 10 previously-wrong items (DR-012, DR-013, DR-014, DR-018, DR-024, DR-032, DR-062, GM-003, GM-005, AC-004); because 7 of them are drills, EN has 13 activities (7 DR, 3 GM, 3 AC) instead of 12. Total activities: 61.
4. Each page was fetched live from Notion with `notion-fetch` using the `source` URL of the export front matter. The enhanced-Markdown `<content>` was compared with the export body (everything after the front matter and the one blank line following it).
5. Normalization (only): CRLF to LF and trailing whitespace/newlines at the end of the document. Otherwise exact comparison. A second, lenient pass additionally strips trailing spaces/tabs on each line (see Limitations).
6. Front-matter `source_last_edited_at` compared with Notion `page_last_edited_at`; Notion page title checked against the lang and ID; front-matter `family`/`id`, `lang` and `source_page_id` checked against the source URL; Notion truncation metadata checked.

## Checks and results

- **Body (lenient):** 121 of 121 identical; 0 differences in wording, punctuation, numbers, headings, list structure, emoji or order.
- **Body (strict, only trailing whitespace/newlines normalized):** 74 of 121 identical. The other 47 are lessons whose export contains trailing double-space hard breaks ("  " at line end); see Limitations. All 61 of 61 activities are strictly identical.
- **Timestamps:** all 121 export `source_last_edited_at` values equal the live `page_last_edited_at`; nothing was edited in Notion after the export in this sample.
- **Titles:** every Notion title carries the expected language suffix (| English / | Español / | עברית / | العربية / | Русский) and the sport name and number matching the lesson ID; every activity title starts with its ID. 0 mismatches. Front-matter ID, lang and page id match the source URL for all 121 (the only cosmetic difference is a `?pvs=204` query suffix on some `source` URLs, e.g. lessons/en/AT-02).
- **Truncation:** the Notion responses contained no `truncated` or `unknown_block_count` markers for any sampled page; no truncation marker text appears in the exports.

## Defects

None found. There is therefore no before/after to report. All 10 previously-wrong EN items (GM-003, GM-005, DR-012, DR-013, DR-014, DR-018, AC-004, DR-024, DR-032, DR-062) now match live Notion exactly and have unchanged timestamps.

## Sample list

**he** lessons: AT-02, AT-09, BB-08, BB-07, FB-05, FB-04, FIT-08, FIT-09, HB-05, HB-10, VB-08, VB-06  
**he** activities: DR-007, DR-034, DR-035, DR-075, DR-080, DR-026, GM-006, GM-014, GM-009, AC-010, AC-006, AC-011

**en** lessons: AT-02, AT-06, BB-08, BB-02, FB-09, FB-03, FIT-03, FIT-05, HB-06, HB-08, VB-01, VB-09  
**en** activities: DR-012*, DR-013*, DR-014*, DR-018*, DR-024*, DR-032*, DR-062*, GM-003*, GM-005*, GM-023, AC-004*, AC-011, AC-015

**ar** lessons: AT-01, AT-07, BB-03, BB-08, FB-10, FB-02, FIT-10, FIT-05, HB-10, HB-03, VB-03, VB-06  
**ar** activities: DR-026, DR-006, DR-046, DR-009, DR-025, DR-066, GM-001, GM-022, GM-009, AC-013, AC-008, AC-009

**ru** lessons: AT-01, AT-09, BB-05, BB-02, FB-02, FB-03, FIT-08, FIT-10, HB-05, HB-02, VB-04, VB-03  
**ru** activities: DR-055, DR-009, DR-017, DR-048, DR-044, DR-013, GM-024, GM-003, GM-004, AC-001, AC-013, AC-007

**es** lessons: AT-06, AT-02, BB-01, BB-03, FB-04, FB-02, FIT-05, FIT-10, HB-03, HB-10, VB-04, VB-01  
**es** activities: DR-076, DR-039, DR-075, DR-013, DR-028, DR-001, GM-014, GM-021, GM-010, AC-004, AC-014, AC-016

`*` = previously-wrong EN item, included by instruction.

## Results table

Legend: OK = body identical (lenient), timestamp unchanged, title consistent. "Hard-break lines" = number of export lines ending in two spaces.

| Lang | Type | ID | Notion title | Export edit = Notion edit | Strict | Hard-break lines | Status |
|---|---|---|---|---|---|---|---|
| he | lesson | AT-02 | אתלטיקה 02 — יציבת ריצה, פעולת ידיים והאצה \| עברית | yes | no | 33 | OK |
| he | lesson | AT-09 | אתלטיקה 09 — תחנות ריצה, קפיצה וזריקה \| עברית | yes | no | 41 | OK |
| he | lesson | BB-08 | כדורסל 08 — הגנה ללא מגע וסגירת נתיב \| עברית | yes | no | 26 | OK |
| he | lesson | BB-07 | כדורסל 07 — צעד וחצי מנתיב פתוח \| עברית | yes | no | 43 | OK |
| he | lesson | FB-05 | כדורגל 05 — תנועה ללא כדור ויצירת אפשרות מסירה \| עברית | yes | no | 1 | OK |
| he | lesson | FB-04 | כדורגל 04 — חדירה לשער וסיום מדויק \| עברית | yes | no | 1 | OK |
| he | lesson | FIT-08 | כושר 08 — סיבולת לב־ריאה ומבחן הדיבור \| עברית | yes | no | 61 | OK |
| he | lesson | FIT-09 | כושר 09 — תוכנית שיפור אישית ואימון עמיתים \| עברית | yes | no | 61 | OK |
| he | lesson | HB-05 | כדוריד 05 — קצב שלושה צעדים וסיום מבוקר \| עברית | yes | no | 33 | OK |
| he | lesson | HB-10 | כדוריד 10 — ניהול משחק טקטי והערכה מסכמת מורחבת \| עברית | yes | no | 61 | OK |
| he | lesson | VB-08 | כדורעף 08 — הגנת רשת וכיסוי אחורי \| עברית | yes | no | 33 | OK |
| he | lesson | VB-06 | כדורעף 06 — תנועה וכיסוי שטח לאחר מגע \| עברית | yes | no | 33 | OK |
| en | lesson | AT-02 | Athletics 02 — Running Posture, Arm Action, and Acceleration \| English | yes | no | 46 | OK |
| en | lesson | AT-06 | Athletics 06 — Standing Long Jump and Landing \| English | yes | no | 46 | OK |
| en | lesson | BB-08 | Basketball 08 — No-Contact Defence and Lane Control \| English | yes | no | 33 | OK |
| en | lesson | BB-02 | Basketball 02 — Controlled Stop and Change of Direction \| English | yes | no | 61 | OK |
| en | lesson | FB-09 | Football 09 — 4v4 Small-Sided Transition Game \| English | yes | no | 8 | OK |
| en | lesson | FB-03 | Football 03 — Turn and Protect the Ball \| English | yes | no | 8 | OK |
| en | lesson | FIT-03 | Fitness 03 — Aerobic Intervals at a Personal Pace \| English | yes | no | 46 | OK |
| en | lesson | FIT-05 | Fitness 05 — Designing a Balanced Personal Circuit \| English | yes | no | 61 | OK |
| en | lesson | HB-06 | Handball 06 — No-Contact Defence and Lane Control \| English | yes | no | 41 | OK |
| en | lesson | HB-08 | Handball 08 — Final Applied Game and Pathway Assessment \| English | yes | no | 41 | OK |
| en | lesson | VB-01 | Volleyball 01 — Ready Position and Forearm Pass \| English | yes | no | 61 | OK |
| en | lesson | VB-09 | Volleyball 09 — 3v3 Play and Role Transition \| English | yes | no | 46 | OK |
| ar | lesson | AT-01 | ألعاب القوى 01 — البدء من الوقوف والتسارع القصير \| العربية | yes | no | 61 | OK |
| ar | lesson | AT-07 | ألعاب القوى 07 — جري الاقتراب والوثب إلى منطقة \| العربية | yes | no | 31 | OK |
| ar | lesson | BB-03 | كرة السلة 03 — التمرير والاستلام والتحرك للمساندة \| العربية | yes | no | 61 | OK |
| ar | lesson | BB-08 | كرة السلة 08 — دفاع بلا احتكاك وإغلاق المسار \| العربية | yes | no | 2 | OK |
| ar | lesson | FB-10 | كرة القدم 10 — لعبة تطبيقية ختامية وتقويم المسار \| العربية | yes | yes | 0 | OK |
| ar | lesson | FB-02 | كرة القدم 02 — التمرير والاستلام والتحرك للمساندة \| العربية | yes | no | 2 | OK |
| ar | lesson | FIT-10 | اللياقة 10 — تحدي لياقة متكامل وتقويم ختامي \| العربية | yes | no | 61 | OK |
| ar | lesson | FIT-05 | اللياقة 05 — تصميم دائرة شخصية متوازنة \| العربية | yes | no | 61 | OK |
| ar | lesson | HB-10 | كرة اليد 10 — إدارة اللعب الخططي وتقويم ختامي موسع \| العربية | yes | no | 61 | OK |
| ar | lesson | HB-03 | كرة اليد 03 — الحركة دون كرة وصناعة خط تمرير \| العربية | yes | no | 27 | OK |
| ar | lesson | VB-03 | الكرة الطائرة 03 — إرسال سفلي إلى منطقة هدف \| العربية | yes | no | 31 | OK |
| ar | lesson | VB-06 | الكرة الطائرة 06 — الحركة وتغطية الملعب بعد اللمس \| العربية | yes | no | 31 | OK |
| ru | lesson | AT-01 | Лёгкая атлетика 01 — Старт с места и короткое ускорение \| Русский | yes | no | 64 | OK |
| ru | lesson | AT-09 | Лёгкая атлетика 09 — Круг бега, прыжка и броска \| Русский | yes | no | 9 | OK |
| ru | lesson | BB-05 | Баскетбол 05 — Движение без мяча и линия передачи \| Русский | yes | no | 9 | OK |
| ru | lesson | BB-02 | Баскетбол 02 — Контролируемая остановка и смена направления \| Русский | yes | no | 61 | OK |
| ru | lesson | FB-02 | Футбол 02 — Передача, приём и выход для поддержки \| Русский | yes | yes | 0 | OK |
| ru | lesson | FB-03 | Футбол 03 — Поворот и укрывание мяча \| Русский | yes | yes | 0 | OK |
| ru | lesson | FIT-08 | Фитнес 08 — Кардиореспираторная выносливость и разговорный тест \| Русский | yes | no | 64 | OK |
| ru | lesson | FIT-10 | Фитнес 10 — Комплексное испытание и итоговая оценка \| Русский | yes | no | 64 | OK |
| ru | lesson | HB-05 | Гандбол 05 — Ритм трёх шагов и контролируемый бросок \| Русский | yes | no | 9 | OK |
| ru | lesson | HB-02 | Гандбол 02 — Ведение, остановка и смена направления \| Русский | yes | yes | 0 | OK |
| ru | lesson | VB-04 | Волейбол 04 — Приём подачи снизу \| Русский | yes | no | 9 | OK |
| ru | lesson | VB-03 | Волейбол 03 — Нижняя подача в целевую зону \| Русский | yes | no | 9 | OK |
| es | lesson | AT-06 | Atletismo 06 — Salto de longitud desde parado y caída \| Español | yes | yes | 0 | OK |
| es | lesson | AT-02 | Atletismo 02 — Postura de carrera, brazos y aceleración \| Español | yes | yes | 0 | OK |
| es | lesson | BB-01 | Baloncesto 01 — Bote controlado en movimiento \| Español | yes | yes | 0 | OK |
| es | lesson | BB-03 | Baloncesto 03 — Pase, recepción y movimiento de apoyo \| Español | yes | yes | 0 | OK |
| es | lesson | FB-04 | Fútbol 04 — Conducción y finalización precisa \| Español | yes | yes | 0 | OK |
| es | lesson | FB-02 | Fútbol 02 — Pase, recepción y movimiento de apoyo \| Español | yes | yes | 0 | OK |
| es | lesson | FIT-05 | Condición física 05 — Diseño de un circuito personal equilibrado \| Español | yes | no | 61 | OK |
| es | lesson | FIT-10 | Condición física 10 — Reto integrado y evaluación final de condición física \| Español | yes | no | 61 | OK |
| es | lesson | HB-03 | Balonmano 03 — Movimiento sin balón y líneas de pase \| Español | yes | yes | 0 | OK |
| es | lesson | HB-10 | Balonmano 10 — Gestión táctica del juego y evaluación final ampliada \| Español | yes | no | 61 | OK |
| es | lesson | VB-04 | Voleibol 04 — Recepción del saque con antebrazos \| Español | yes | yes | 0 | OK |
| es | lesson | VB-01 | Voleibol 01 — Posición de preparación y toque de antebrazos \| Español | yes | yes | 0 | OK |
| he | activity | DR-007 | DR-007 — העברת משקל והושטת רגל לסימון | yes | yes | 0 | OK |
| he | activity | DR-034 | DR-034 — בעיטת גב כף הרגל לשער ללא שוער | yes | yes | 0 | OK |
| he | activity | DR-035 | DR-035 — הגשה עילית מעמידה אל שטח פנוי | yes | yes | 0 | OK |
| he | activity | DR-075 | DR-075 — ריצה קלה בקצב צעדים אחיד בין סימונים | yes | yes | 0 | OK |
| he | activity | DR-080 | DR-080 — הטלה תחתית בקשת של שקית בד למטרה | yes | yes | 0 | OK |
| he | activity | DR-026 | DR-026 — שמירת כדור באמצעות מיקום הגוף ללא מגע | yes | yes | 0 | OK |
| he | activity | GM-006 | GM-006 — שליחים שיתופיים לחלוקת שקיות | yes | yes | 0 | OK |
| he | activity | GM-014 | GM-014 — איסוף שערים במסירות רגל משותפות | yes | yes | 0 | OK |
| he | activity | GM-009 | GM-009 — שלישייה על לוח בתנועה ובהחלטה קבוצתית | yes | yes | 0 | OK |
| he | activity | AC-010 | AC-010 — מעבדת קצב אישי בהליכה | yes | yes | 0 | OK |
| he | activity | AC-006 | AC-006 — ניווט בהליכה לפי מפה וסמלים | yes | yes | 0 | OK |
| he | activity | AC-011 | AC-011 — מעבדת ציוד — השוואת שני כדורים במסירה | yes | yes | 0 | OK |
| en | activity | DR-012* | DR-012 — Heel-to-toe line walking | yes | yes | 0 | OK |
| en | activity | DR-013* | DR-013 — Forward hand slide from all fours | yes | yes | 0 | OK |
| en | activity | DR-014* | DR-014 — Controlled two-foot heel raise | yes | yes | 0 | OK |
| en | activity | DR-018* | DR-018 — Turn a skipping rope and step over | yes | yes | 0 | OK |
| en | activity | DR-024* | DR-024 — Supine heel slide with pelvic control | yes | yes | 0 | OK |
| en | activity | DR-032* | DR-032 — Stop a rolling ball with a soft play stick | yes | yes | 0 | OK |
| en | activity | DR-062* | DR-062 — Defensive approach and stop facing a ball holder | yes | yes | 0 | OK |
| en | activity | GM-003* | GM-003 — Cooperative catches over a low net | yes | yes | 0 | OK |
| en | activity | GM-005* | GM-005 — Walking tag with role swaps | yes | yes | 0 | OK |
| en | activity | GM-023 | GM-023 — Who leads the movement | yes | yes | 0 | OK |
| en | activity | AC-004* | AC-004 — Design and test an accessible movement route | yes | yes | 0 | OK |
| en | activity | AC-011 | AC-011 — Equipment lab — comparing two passing balls | yes | yes | 0 | OK |
| en | activity | AC-015 | AC-015 — Timing lab — one journey, two measurements | yes | yes | 0 | OK |
| ar | activity | DR-026 | DR-026 — حماية الكرة بوضع الجسم دون احتكاك | yes | yes | 0 | OK |
| ar | activity | DR-006 | DR-006 — ثني المرفقين والدفع أمام الجدار | yes | yes | 0 | OK |
| ar | activity | DR-046 | DR-046 — تمريرة حائط في كرة القدم واستلام الإعادة | yes | yes | 0 | OK |
| ar | activity | DR-009 | DR-009 — تمرير علوي ذاتي ثم التقاط | yes | yes | 0 | OK |
| ar | activity | DR-025 | DR-025 — تمريرة صدرية مباشرة باليدين | yes | yes | 0 | OK |
| ar | activity | DR-066 | DR-066 — ضرب الكرة الطائرة من الثبات نحو الأرض | yes | yes | 0 | OK |
| ar | activity | GM-001 | GM-001 — دحرجة الكرة إلى مناطق النقاط | yes | yes | 0 | OK |
| ar | activity | GM-022 | GM-022 — لعبة عصي لينة بالمشي — تمرير نحو الهدف | yes | yes | 0 | OK |
| ar | activity | GM-009 | GM-009 — ثلاثة في صف مع الحركة والقرار الجماعي | yes | yes | 0 | OK |
| ar | activity | AC-013 | AC-013 — خريطة المشاركة — من تصله الكرة | yes | yes | 0 | OK |
| ar | activity | AC-008 | AC-008 — إعداد محطة تمرير وفحص جاهزيتها | yes | yes | 0 | OK |
| ar | activity | AC-009 | AC-009 — ورشة إشارات متفق عليها للتمرير الآمن | yes | yes | 0 | OK |
| ru | activity | DR-055 | DR-055 — Передвижение на четвереньках по мягкой дорожке | yes | yes | 0 | OK |
| ru | activity | DR-009 | DR-009 — Передача сверху над собой и ловля | yes | yes | 0 | OK |
| ru | activity | DR-017 | DR-017 — Бросок в стену и ловля отскока | yes | yes | 0 | OK |
| ru | activity | DR-048 | DR-048 — Ловля, три шага и передача | yes | yes | 0 | OK |
| ru | activity | DR-044 | DR-044 — Подготовка к броску снизу после одного шага | yes | yes | 0 | OK |
| ru | activity | DR-013 | DR-013 — Скольжение рукой вперёд на четвереньках | yes | yes | 0 | OK |
| ru | activity | GM-024 | GM-024 — Путь мяча по желобам — соединяем и движемся | yes | yes | 0 | OK |
| ru | activity | GM-003 | GM-003 — Совместная серия ловли через низкую сетку | yes | yes | 0 | OK |
| ru | activity | GM-004 | GM-004 — Трое передающих против перехватчика | yes | yes | 0 | OK |
| ru | activity | AC-001 | AC-001 — Создаём последовательность на восемь счётов | yes | yes | 0 | OK |
| ru | activity | AC-013 | AC-013 — Карта участия — кто получает мяч | yes | yes | 0 | OK |
| ru | activity | AC-007 | AC-007 — Оценка расстояния шагами и измерением | yes | yes | 0 | OK |
| es | activity | DR-076 | DR-076 — Flexión de rodillas en posición escalonada con apoyo | yes | yes | 0 | OK |
| es | activity | DR-039 | DR-039 — Caminar sobre obstáculos bajos y blandos | yes | yes | 0 | OK |
| es | activity | DR-075 | DR-075 — Carrera suave con ritmo uniforme entre marcas | yes | yes | 0 | OK |
| es | activity | DR-013 | DR-013 — Deslizar una mano desde cuadrupedia | yes | yes | 0 | OK |
| es | activity | DR-028 | DR-028 — Derecha de tenis de mesa con bote propio | yes | yes | 0 | OK |
| es | activity | DR-001 | DR-001 — Pie de pivote y línea de pase | yes | yes | 0 | OK |
| es | activity | GM-014 | GM-014 — Recoger puertas mediante pases cooperativos con el pie | yes | yes | 0 | OK |
| es | activity | GM-021 | GM-021 — Tiro y elección de riesgo — puntuación colectiva | yes | yes | 0 | OK |
| es | activity | GM-010 | GM-010 — Círculo de balón ligero — una secuencia con todos | yes | yes | 0 | OK |
| es | activity | AC-004 | AC-004 — Diseñar y probar un recorrido de movimiento accesible | yes | yes | 0 | OK |
| es | activity | AC-014 | AC-014 — Planificar un torneo breve con tiempo de juego igual | yes | yes | 0 | OK |
| es | activity | AC-016 | AC-016 — Dirigir un minuto de movimiento — instrucciones claras | yes | yes | 0 | OK |

## Limitations and confidence

- **This is a sample (121 pages), not full verification.** The export has more pages than were checked; unsampled pages are unverified by this task.
- **Hard-break trailing spaces.** Notion renders some line breaks inside a block as two trailing spaces before a newline. Notion output was transcribed into comparison files by hand-driven tooling, which does not reliably carry trailing spaces, so those spaces could not be compared byte for byte. The lenient pass (trailing spaces/tabs stripped per line) is therefore the primary result. Consistency check on the export side: 47 strictly-differing pages; 0 of them contain no hard-break lines in the export (expected 0), and 0 strictly-identical pages contain hard-break lines (expected 0 for pages where the transcription carried them). Every strict difference is confined to line-ending whitespace; no visible text differs.
- Because of the previous point, a defect consisting only of added or removed trailing double spaces would not be detected by this sample.
- Comparison is against the Notion MCP rendering (enhanced Markdown), as at the fetch time on 2026-10-15; it does not independently validate the Notion content itself (accuracy, pedagogy, translation quality), only that the export reproduces it.
- Images, uploaded files, comments, page properties other than the title and database relations were out of scope.
- Transcription note: one transcription slip of mine (ar/AT-07 "ترتيبًا" vs source "ترتيب") was caught by the diff, confirmed against the fetch output and corrected; it was not an export defect.

**Confidence:** high that the sampled exports are faithful to the live source at the time of the check (121/121 lenient-identical, 121/121 timestamps unchanged, 0 title mismatches, 0 truncation). Moderate for the full export: a random stratified sample across all five languages and six sports with zero findings supports, but does not prove, that the remainder is clean. A full automated byte-level diff using a direct Notion API export would be needed for full verification.

Machine-readable results: `store-content/reports/notion-fidelity-sample-2026-10-15.json`.
