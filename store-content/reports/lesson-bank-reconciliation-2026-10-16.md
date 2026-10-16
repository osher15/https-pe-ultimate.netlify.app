# Lesson bank reconciliation: exported lessons vs the app's lesson bank (task C14)

Date: 2026-10-16. Branch `c14-reconcile`, based on `ccr-f0f0c4fd-ymvjjb` (519b70c). Read-only analysis: nothing was imported, no `hm-*.js`, test, generated file or export was changed. The international plans / component-bank import hold in `AGENTS.md` is respected: this document only compares.

Export under review: `origin/codex/g1-notion-export-pilot-20261014` at 6bfccef (`store-content/export/lessons/<lang>/<ID>.md`, 300 files, and `store-content/manifest/lessons.json`, 300 rows).
Machine-readable result: `store-content/reports/lesson-bank-reconciliation-2026-10-16.json`. Regenerate: see "Reproduction" at the end.

## 1. Headline

- **The app already contains all 60 lesson families in all 5 languages (300 lessons).** The "app lesson bank" (`hm-lessonbank.js` + six `hm-lessonbank-<sport>.js`) was imported from the same Notion series (see `hm-lessonbank.js` lines 41-58, `tools/notion-lessons-import.js`, `docs/LESSON_BANK_INTEGRATION_PLAN.md`). So there is **no genuinely new lesson content in the export**: 0 export-only families, 0 app-only bank lessons, 300/300 export files matched to an app lesson.
- **Exact duplicates: 0 of 300.** Every pair differs in the `objectives` field (the app deliberately prefixes each objective with a student lead-in, "The student can ..." / "התלמיד יצליח ...", enforced by `tests/unit/lessonbankobjectives.test.js`). Beyond that:
  - 278 of 300 rows (41 of 60 families) differ **only** in the objective wording.
  - 22 rows (19 families) also have text edits in other fields: 18 Hebrew, 1 Russian, 3 Spanish; English and Arabic have none.
- **Hebrew: the app is ahead of the export.** The 18 Hebrew rows with edits are the app's reviewed terminology (2026-10-08, `docs/handoffs/2026-10-08-lessonbank-he-en-review.md`): the app says "תפיסה"/"קבלת מסירה" where the export still says "קליטה", and "מסירה עליונה" where the export says "מסירה עילית". Importing the export's Hebrew over the app would **revert the reviewed edition**.
- **No conflicts in age band, duration or equipment** between any matched pair (0 of 300 each). Titles: 5 genuine wording differences (4 Hebrew terminology, 1 Russian).
- Both sides are internally consistent, with one weakness shared by both: three Hebrew lessons (FIT-03, VB-05, VB-10) write section minutes in a compact form the app's minute parser cannot read (section 8).
- Manifest: all 300 `body_sha256` values match the files; `repo_compare` is `null` for all 300 (this report is what would fill it); every row `status: raw-notion-export-unreviewed`.

## 2. Method

1. Export read from the fetched branch (`git archive` into a scratch directory outside the repo; nothing committed from it).
2. Export page parsed with the same helpers that built the app bank (`tools/notion-lessons-import.js`: `textOf`, `listOf`, 20 numbered sections, six `##` flow sub-sections), so both sides are compared after identical normalisation (markdown bold removed, whitespace collapsed).
3. App bank loaded in a Node `vm` from `hm-lessonbank*.js` (no browser).
4. Per lesson/language, 25 fields compared (identity, purpose, objectives, priorKnowledge, pathwayPosition, unitContribution, equipment, safety, six flow sections, commonErrors, teachingPoints, adaptations, assessment, reflection, continuity, bankLink, systemData, teacherSummary, pedagogicalValue, selfQualityCheck). Similarity = character-bigram Dice coefficient, weighted by field length.
5. Matching key is the shared id (`BB-01` = `basketball:1`), then verified independently by title (sport prefix and number removed), age band and overall similarity. Confidence:
   - **high**: title, age equal; overall similarity >= 0.95; at most 3 fields with text edits.
   - **medium**: a title wording difference, or more than 3 edited fields, or similarity < 0.95.
   - **low**: similarity < 0.6 (none).
6. Age band, duration and equipment were read from the labelled identity lines (label sets per language, because 11 pages per language use merged labels such as "Age/experience") and compared to the app's `ageRange`, `duration` and `equipment` fields.

## 3. App lesson bank inventory

Structure: `window.LESSONBANK = { meta, sports:{ <sport>:{ he|en|ar|ru|es:[10 lessons] } } }`. Per lesson: `n`, `title`, `identity` (free-text block), `purpose`, `objectives[]`, `priorKnowledge`, `pathwayPosition`, `unitContribution`, `equipment`, `safety[]`, `sections{opening,warmup,mainA,mainB,appliedGame,closing}`, `commonErrors[]`, `teachingPoints[]`, `adaptations`, `assessment`, `reflection`, `continuity`, `bankLink`, `systemData`, `teacherSummary`, `pedagogicalValue`, `selfQualityCheck`, derived `ageRange`, `duration`, and `contentVersion`/`reviewStatus` (`draft` for all). Provenance is global (`LESSONBANK.meta.provenance`, `reviewStatus: "draft"`). Hebrew only is the fallback language (`bankLessons`, `hm-lesson.js` 1005-1008).

Counts: 6 sports x 5 languages x 10 lessons = **300 lessons**; every language has the same ten lessons per sport, all 45 minutes. Age bands are identical in all five languages:

| Sport | Lessons per language | Age bands (lessons per band) |
|---|---|---|
| Athletics | 10 | 10-12: 3, 10-13: 2, 11-14: 3, 12-15: 1, 13-16: 1 |
| Basketball | 10 | 9-11: 4, 10-12: 2, 11-13: 1, 11-14: 1, 12-14: 1, 12-15: 1 |
| Football | 10 | 9-11: 2, 10-12: 1, 10-13: 1, 11-14: 2, 12-15: 2, 13-16: 2 |
| Fitness | 10 | 10-13: 1, 11-15: 1, 12-16: 8 |
| Handball | 10 | 10-12: 3, 10-13: 1, 12-14: 3, 13-16: 3 |
| Volleyball | 10 | 9-11: 2, 10-12: 1, 10-13: 1, 11-13: 1, 12-14: 3, 13-16: 2 |

By age band across all sports (per language): 9-11: 8, 10-12: 10, 10-13: 6, 11-13: 2, 11-14: 6, 11-15: 1, 12-14: 7, 12-15: 4, 12-16: 8, 13-16: 8. The export has the same distribution (0 age differences).

Other lesson-like content in the app that is **not** part of the bank and has no export counterpart:
- `hm-plans.js` `LESSONDOCS`: 11 Hebrew archive documents (Google Drive lessons: `doc-volley-serve`, `doc-circuit-time`, `doc-special-3yr`, `doc-dribbling`, `doc-circuit3`, `doc-fartlek`, `doc-recess-basket`, `doc-abs-toning`, `doc-sprint-prep`, `doc-long-distance`, `doc-scavenger`). Single language, free text, different authorship. They overlap topically with some families (for example `doc-dribbling` with BB-01/BB-02, `doc-volley-serve` with VB-03) but are different documents, not duplicates.
- `hm-lesson.js` `TOPICS` (line 56): 21 topic templates for the generated planner (Hebrew), not lessons.

## 4. The 60 families: equivalence, duplicates, new content

Result for every family: **an equivalent app lesson exists** (app id `<sport>:<n>`). Classification: 0 exact duplicates, 60 near-duplicates (41 "frame only", 19 "with text edits"), 0 genuinely new. Confidence: 52 high, 8 medium (BB-03, BB-04, BB-05, BB-06, FB-10, HB-01, HB-05, VB-02), 0 low. The independent title check agrees with the id in 298 of 300 rows; the two exceptions (BB-03 he, BB-05 ru) are renamed titles (see section 7) and the id is still the right match.

An important structural fact: topic titles repeat across sports (for example "Off-Ball Movement and Passing Lanes" is BB-05 and HB-03; "No-Contact Defence and Lane Control" is BB-08 and HB-06; "Final Applied Game and Pathway Assessment" is FB-10, HB-08, VB-10). Title alone is therefore not a safe join key; the id plus sport is.

"near (frame only)" = differs only in the objective lead-in/verb frame. "(n)" = number of fields beyond objectives that differ.

| Family | App id | Title (en, app) | Age | Verdict | Conf. | Langs with text edits |
|---|---|---|---|---|---|---|
| AT-01 | athletics:1 | Athletics 01 — Standing Start and Short Acceleration | 10–13 | near (frame only) | high | - |
| AT-02 | athletics:2 | Athletics 02 — Running Posture, Arm Action, and Acceleration | 10–12 | near (frame only) | high | - |
| AT-03 | athletics:3 | Athletics 03 — Reaction and Start to Changing Signals | 10–12 | near (frame only) | high | - |
| AT-04 | athletics:4 | Athletics 04 — Safe Relay Baton Exchange | 10–13 | near (frame only) | high | - |
| AT-05 | athletics:5 | Athletics 05 — Personal Endurance Pacing | 11–14 | near (frame only) | high | - |
| AT-06 | athletics:6 | Athletics 06 — Standing Long Jump and Landing | 10–12 | near (frame only) | high | - |
| AT-07 | athletics:7 | Athletics 07 — Approach Run and Jump to a Zone | 11–14 | near (frame only) | high | - |
| AT-08 | athletics:8 | Athletics 08 — Soft-Ball Throw for Distance | 11–14 | near (frame only) | high | - |
| AT-09 | athletics:9 | Athletics 09 — Running, Jumping, and Throwing Circuit | 12–15 | near (frame only) | high | - |
| AT-10 | athletics:10 | Athletics 10 — Final Multi-Event Assessment | 13–16 | near (frame only) | high | - |
| BB-01 | basketball:1 | Basketball 01 — Controlled Dribbling on the Move | 9–11 | near (frame only) | high | - |
| BB-02 | basketball:2 | Basketball 02 — Controlled Stop and Change of Direction | 9–11 | near (frame only) | high | - |
| BB-03 | basketball:3 | Basketball 03 — Pass, Receive, and Move to Support | 9–11 | near (edited) | medium | he(6) |
| BB-04 | basketball:4 | Basketball 04 — Close-Range Shooting and Safe Rebounding | 9–11 | near (edited) | medium | he(4) |
| BB-05 | basketball:5 | Basketball 05 — Off-Ball Movement and Passing Lanes | 10–12 | near (edited) | medium | he(7) |
| BB-06 | basketball:6 | Basketball 06 — Receive on the Move: Pass or Dribble | 10–12 | near (edited) | medium | he(12) ru(1) es(1) |
| BB-07 | basketball:7 | Basketball 07 — Lay-Up from an Open Lane | 11–13 | near (edited) | high | he(2) |
| BB-08 | basketball:8 | Basketball 08 — No-Contact Defence and Lane Control | 11–14 | near (frame only) | high | - |
| BB-09 | basketball:9 | Basketball 09 — 2v1 Numerical Advantage | 12–14 | near (edited) | high | he(1) es(1) |
| BB-10 | basketball:10 | Basketball 10 — 3v3 Small-Sided Decision Game | 12–15 | near (edited) | high | he(1) |
| FB-01 | football:1 | Football 01 — Ball Control and Dribbling into Space | 9–11 | near (frame only) | high | - |
| FB-02 | football:2 | Football 02 — Pass, Receive, and Move to Support | 9–11 | near (edited) | high | he(1) |
| FB-03 | football:3 | Football 03 — Turn and Protect the Ball | 10–12 | near (frame only) | high | - |
| FB-04 | football:4 | Football 04 — Drive Through and Finish Accurately | 10–13 | near (frame only) | high | - |
| FB-05 | football:5 | Football 05 — Off-Ball Movement to Receive | 11–14 | near (frame only) | high | - |
| FB-06 | football:6 | Football 06 — No-Contact Defence and Closing a Passing Lane | 11–14 | near (frame only) | high | - |
| FB-07 | football:7 | Football 07 — Attacking 2v1 Advantage | 12–15 | near (edited) | high | es(1) |
| FB-08 | football:8 | Football 08 — Attack-to-Defence Transition After Loss | 12–15 | near (frame only) | high | - |
| FB-09 | football:9 | Football 09 — 4v4 Small-Sided Transition Game | 13–16 | near (frame only) | high | - |
| FB-10 | football:10 | Football 10 — Final Applied Game and Pathway Assessment | 13–16 | near (frame only) | medium | - |
| FIT-01 | fitness:1 | Fitness 01 — Self-Regulated Strength and Endurance Circuit | 12–16 | near (frame only) | high | - |
| FIT-02 | fitness:2 | Fitness 02 — Movement Quality: Squat, Hinge, Push, and Brace | 10–13 | near (frame only) | high | - |
| FIT-03 | fitness:3 | Fitness 03 — Aerobic Intervals at a Personal Pace | 11–15 | near (frame only) | high | - |
| FIT-04 | fitness:4 | Fitness 04 — Self-Regulated Partner Circuit | 12–16 | near (frame only) | high | - |
| FIT-05 | fitness:5 | Fitness 05 — Designing a Balanced Personal Circuit | 12–16 | near (frame only) | high | - |
| FIT-06 | fitness:6 | Fitness 06 — Pacing and Recovery Management | 12–16 | near (frame only) | high | - |
| FIT-07 | fitness:7 | Fitness 07 — Muscular Endurance with Quality | 12–16 | near (frame only) | high | - |
| FIT-08 | fitness:8 | Fitness 08 — Cardiorespiratory Endurance and the Talk Test | 12–16 | near (frame only) | high | - |
| FIT-09 | fitness:9 | Fitness 09 — Personal Improvement Plan and Peer Coaching | 12–16 | near (frame only) | high | - |
| FIT-10 | fitness:10 | Fitness 10 — Integrated Fitness Challenge and Final Assessment | 12–16 | near (frame only) | high | - |
| HB-01 | handball:1 | Handball 01 — Passing and Receiving on the Move | 10–13 | near (edited) | medium | he(10) |
| HB-02 | handball:2 | Handball 02 — Dribbling, Stop, and Change of Direction | 10–12 | near (edited) | high | he(2) |
| HB-03 | handball:3 | Handball 03 — Off-Ball Movement and Passing Lanes | 10–12 | near (edited) | high | he(2) |
| HB-04 | handball:4 | Handball 04 — Accurate Overarm Throw to Target | 10–12 | near (frame only) | high | - |
| HB-05 | handball:5 | Handball 05 — Three-Step Rhythm and Controlled Finish | 12–14 | near (edited) | medium | he(9) |
| HB-06 | handball:6 | Handball 06 — No-Contact Defence and Lane Control | 12–14 | near (frame only) | high | - |
| HB-07 | handball:7 | Handball 07 — Fast Transition and 3v2 Advantage | 12–14 | near (frame only) | high | - |
| HB-08 | handball:8 | Handball 08 — Final Applied Game and Pathway Assessment | 13–16 | near (frame only) | high | - |
| HB-09 | handball:9 | Handball 09 — Width, Depth, and Line Support in 4v4 Handball | 13–16 | near (frame only) | high | - |
| HB-10 | handball:10 | Handball 10 — Tactical Game Management and Extended Final Assessment | 13–16 | near (frame only) | high | - |
| VB-01 | volleyball:1 | Volleyball 01 — Ready Position and Forearm Pass | 10–13 | near (edited) | high | he(3) |
| VB-02 | volleyball:2 | Volleyball 02 — Overhead Set and Support Movement | 9–11 | near (edited) | medium | he(7) |
| VB-03 | volleyball:3 | Volleyball 03 — Underhand Serve to a Target Zone | 9–11 | near (edited) | high | he(2) |
| VB-04 | volleyball:4 | Volleyball 04 — Forearm Serve Reception | 10–12 | near (frame only) | high | - |
| VB-05 | volleyball:5 | Volleyball 05 — Receive, Set, and Send Sequence | 11–13 | near (edited) | high | he(1) |
| VB-06 | volleyball:6 | Volleyball 06 — Movement and Coverage after Contact | 12–14 | near (frame only) | high | - |
| VB-07 | volleyball:7 | Volleyball 07 — Controlled Standing Attack | 12–14 | near (frame only) | high | - |
| VB-08 | volleyball:8 | Volleyball 08 — Net Defence and Backcourt Coverage | 12–14 | near (frame only) | high | - |
| VB-09 | volleyball:9 | Volleyball 09 — 3v3 Play and Role Transition | 13–16 | near (edited) | high | he(1) |
| VB-10 | volleyball:10 | Volleyball 10 — Final Applied Game and Pathway Assessment | 13–16 | near (edited) | high | he(1) |

Per-language detail (differing field names, per-field similarity, excerpts of the first difference) is in the JSON under `families[].perLang`. Objective similarity after removing the lead-in: mean 0.93 (he), 0.98 (en), 0.95 (ar), 0.93 (ru), 0.96 (es); identical after removal in 16 rows. The rest differ by verb inflection ("Dribbles the full lane ..." in the export against "The student can dribble the full lane ..." in the app).

Nature of the 22 edited rows:
- **he (18 rows)**: reviewed terminology in the app. Example (`export/lessons/he/BB-06.md`, section 2 against `hm-lessonbank-basketball.js` he[5].purpose): export "לאחר הקליטה", app "לאחר התפיסה". Example (`he/VB-10.md` Main A): export "מסירה עילית", app "מסירה עליונה". Fields hit: purpose, priorKnowledge, pathwayPosition, unitContribution, flow sections, commonErrors, teachingPoints, assessment, reflection, continuity, bankLink, pedagogicalValue, identity (title and sub-topic).
- **ru BB-06, es BB-06 / BB-09 / FB-07 (4 rows)**: only the closing section, and only emphasis-marker spacing around a fill-in blank: export `«Я выбрал *, потому что *»`, app `«Я выбрал *, потому что* »`; export `«elegí * porque *»`, app `«elegí *porque* »`. This is a markdown-escape artefact of the old import, not a content difference. The export is arguably the cleaner text.
- **en, ar**: no edits beyond the objective frame.

## 5. Where the export has structure the app lacks

Section-level content is the same: all 300 export pages have the 20 numbered sections and the 6 flow sub-sections, and the app stores every one of them. The sub-labels inside the flow sections ("Duration", "Purpose", "Procedure", "Organisation", "Teaching points", "Common errors", "Teacher says", "Structure", "Instructions", "Transitions", "Variations", "Rules", "Scoring", "Key message", "Summary", "Feedback", "Orderly exit") are present identically on both sides (170 language-qualified label kinds, 0 count differences; see `sectionSubLabels` in the JSON). So nothing structural is *lost* in the bank.

What the export has that the app lacks:

| Export element | In the app bank? | Note |
|---|---|---|
| Front matter `family`, `lang` | implicit (`sports.<sport>.<lang>[n-1]`) | same information |
| `source` (Notion URL), `source_page_id`, `source_last_edited_at` | no (only global `meta.provenance.sourcePageId`) | needed for per-lesson traceability and staleness checks |
| `status: raw-notion-export-unreviewed` | partly (`reviewStatus: "draft"` per lesson and globally) | different vocabulary |
| Manifest `body_sha256`, `repo_compare` | no | needed to detect drift; `repo_compare` is null for all 300 |
| Lesson code `BB-01-EN` | inside the free-text `identity` block only | not a field |

What neither side has as machine-readable data (both keep these as inline text, which limits any future import into the planner):
- Identity attributes (sport, subtopic, age, experience, duration, group size, equipment, space, complexity): one free-text block in `identity`; the app derives only `ageRange` and `duration` from it.
- Per-section minutes: only inline text ("Duration: 10 minutes"); the planner reads them with `HMDATA.bankSectionMinutes`.
- Teaching points, common errors, safety checks, differentiation and assessment per activity: inline inside each flow section; the lesson-level `teachingPoints[]`, `commonErrors[]`, `safety[]` are lists, `adaptations` and `assessment` are single strings (the Foundation / Intermediate / Advanced / Large group / Small group / Limited space / Partial equipment / Different needs tiers are plain text lines in `adaptations`, with no tier keys).
- Equipment: one string, not a list of items matchable against the app's shared equipment list.

## 6. App lessons with no export counterpart

- Bank: none. All 300 app bank lessons have an export file (0 app-only).
- Outside the bank: the 11 `LESSONDOCS` archive documents and the 21 generator `TOPICS` (section 3). They are not export candidates and are not covered by the export at all.
- Reverse direction: the export contains no activities-as-lessons; its 600 activity pages (drills/games) are separate and out of scope here.

## 7. Id and naming scheme mapping

| Concept | Export | App |
|---|---|---|
| Family id | `<PREFIX>-<NN>`: AT, BB, FB, FIT, HB, VB; NN = 01..10 | `<sport>` + `n` = 1..10 |
| Prefix to sport | AT = athletics, BB = basketball, FB = football, FIT = fitness, HB = handball, VB = volleyball | `athletics`, `basketball`, `football`, `fitness`, `handball`, `volleyball` |
| Language | folder `export/lessons/<lang>/` and front matter `lang` | array key `he|en|ar|ru|es` |
| File / record | `export/lessons/en/BB-01.md` | `LESSONBANK.sports.basketball.en[0]` |
| Lesson code (in text) | `BB-01-EN` | same string inside `identity` |
| Persistent key used by the app | none | `"basketball:1"` (no language): personal-copy `src.id` (`bankToPlan`, `hm-data.js` 878), collection items of kind `b` (`hm-lesson.js` ~1233), `data-bopen` / `data-bankopen` |
| Notion page | `source_page_id` per file | global `sourcePageId` only |

Mapping rule: `BB-01` -> `basketball:1` for every language; the app key never contains the language, so one app key maps to five export files.

## 8. Conflicts between matched pairs

Age band: **0 conflicts**. Duration: **0** (every lesson is 45 minutes on both sides). Equipment (identity line and section 7): **0**. The age band also agrees across the five languages inside each side (0 families with a different band in any language).

Title wording (5 of 300), from `titleConflicts` in the JSON:

| Family / lang | Export (file, section 1 "Full title") | App (`hm-lessonbank-<sport>.js`, `.title`) |
|---|---|---|
| BB-03 he | `export/lessons/he/BB-03.md`: "כדורסל 03 — מסירה, קליטה ותנועה לתמיכה" | basketball he[2]: "כדורסל 03 — מסירה, תפיסה ותנועה לתמיכה" |
| HB-01 he | `he/HB-01.md`: "כדוריד 01 — מסירה וקליטה בתנועה" | handball he[0]: "כדוריד 01 — מסירה ותפיסה בתנועה" |
| VB-02 he | `he/VB-02.md`: "כדורעף 02 — מסירה עילית ותנועה לתמיכה" | volleyball he[1]: "כדורעף 02 — מסירה עליונה ותנועה לתמיכה" |
| FB-10 ru | `ru/FB-10.md`: "Футбол 10 — итоговая прикладная игра и оценка пути обучения" | football ru[9]: "Футбол 10 — Итоговая прикладная игра и оценка траектории" |
| BB-05 ru | `ru/BB-05.md`: "Движение без мяча и создание линии передачи" (no sport/number prefix) | basketball ru[4]: "Баскетбол 05 — Движение без мяча и линия передачи" |

Format-only title differences: 63 rows. In the export the first identity line is sometimes a bare title or "Title; BB-09-EN" (the 11-per-language merged-label layout) while the app title always has the "<Sport> NN — " prefix. Harmless, but an importer must not take the export's first identity line as the title.

Timing: the section minutes the planner can read sum to the declared 45 in 297 of 300 rows on both sides. The three exceptions are the same in export and app (so not a conflict, but a hazard for a future import into editable plans):

| File | Quote (section) | Effect in `bankSectionMinutes` |
|---|---|---|
| `export/lessons/he/FIT-03.md` lines 52-60 | "7: תנועה דינמית ..." / "10: 20 שניות תנועה ..." (bare number, no "דקות") | 5 of 6 sections unparsed: sum 3 instead of 45; plan gets `timeGuess` and 3-minute defaults |
| `he/VB-05.md` lines 52-60 | "7: תנועה דינמית — מגע עצמי ..." / "10: בשלישיות ..." | same, 5 of 6 unparsed |
| `he/VB-10.md` line 66 (Main B) | "10: סבבי 3 נגד 3 עם תצפית ..." (the other five sections use "**משך:** N דקות") | 1 section unparsed, sum 35 |

Objective frame, 300 of 300 rows: export `en/BB-01.md` section 3 "Dribbles the full lane with the ball kept below waist height ..." against app basketball en[0].objectives[0] "The student can dribble the full lane with the ball kept below waist height ...".

## 9. How hard would a future import be?

Easy as data, risky as an overwrite. The bank already exists, so "import" would really mean either (a) refreshing bank text from a newer Notion state or (b) adding provenance. The text is not a gap; the decisions are about not regressing reviewed text.

### 9.1 Field mapping, export -> app bank schema

| Export | App bank field | Difficulty / action |
|---|---|---|
| front matter `family` + `lang` | position `sports.<sport>.<lang>[n-1]`, `n` | trivial via prefix map |
| section 1 identity block | `identity` (verbatim), `title` (first line + "Sport NN — " prefix), `ageRange`, `duration` | medium: 3 identity layouts per language (separate lines; "A/B" merged labels; "Name; CODE"); reuse `tools/notion-lessons-import.js` |
| sections 2, 4-8, 10-20 | `purpose`, `priorKnowledge`, `pathwayPosition`, `unitContribution`, `equipment`, `safety[]`, `commonErrors[]`, `teachingPoints[]`, `adaptations`, `assessment`, `reflection`, `continuity`, `bankLink`, `systemData`, `teacherSummary`, `pedagogicalValue`, `selfQualityCheck` | trivial, same parser |
| section 3 objectives | `objectives[]` | **needs a rule**: app requires the student lead-in (unit test); export lacks it. Do not overwrite objectives. |
| section 9 `## ` sub-sections | `sections.{opening,warmup,mainA,mainB,appliedGame,closing}` | trivial positionally |
| `source`, `source_page_id`, `source_last_edited_at` | none (new per-lesson provenance fields) | schema addition, not hold-free |
| `status` | `reviewStatus` | keep `draft` unless a person reviews |
| manifest `body_sha256` | none | optional, enables drift check |

### 9.2 Field mapping, bank -> personal plan (what an "open as plan" actually uses; `bankToPlan`, `hm-data.js` 864-879)

| Bank field | Plan field | Loss / issue |
|---|---|---|
| `sections.*` | `phases[]` `{n,min,d,k}` | minutes parsed from the first 120 chars; unparsed -> 3 min + `src.timeGuess` (the three Hebrew lessons above) |
| `title` | `title` | none |
| `objectives[]` | `goals[]` | none |
| `equipment` (one string) | `eq:[string]` | not itemised; `eqAvail`, `eqNo`, `eqWarn` empty, so no equipment-sharing check |
| `assessment` | `assess:[string]` | one item |
| `adaptations` | `diff.low` | tiers collapse into one string; `diff.high` and `diff.ex` empty |
| `safety[]` | `safe` (joined with " · ") | list flattened |
| `continuity` | `hw` | semantic mismatch (continuity is not homework) |
| `ageRange` | `grade` = "high" if first number >= 15, else "mid" | every bank lesson becomes "mid" (first numbers are 9-13); the app's grade model is ז-יב, the bank is age 9-16 |
| purpose, priorKnowledge, pathwayPosition, unitContribution, commonErrors, teachingPoints, reflection, systemData, teacherSummary, pedagogicalValue, selfQualityCheck, bankLink | none (dropped) | stay readable in the bank view only |
| `std`, `cur` | `[]`, `""` | standards and curriculum links not filled |

### 9.3 Risks

1. **Regression of reviewed Hebrew/English text** (high). The app's he/en is the 2026-10-08 reviewed edition (`contentVersion` "V2.1"); the export he is still the pre-review terminology in 18 rows. Any wholesale replace from the export reverts "תפיסה"/"מסירה עליונה". Rule: never overwrite; diff-only, with a person approving each change.
2. **Objective lead-in** (high). A naive import would fail `tests/unit/lessonbankobjectives.test.js` (30 sport/language cases) because the export objectives have no lead-in (not run here; follows from the test's regex).
3. **Stable ids / sid / cid** (medium). The persistent key is `"<sport>:<n>"`. Personal copies (`src.id`), collections (kind `b`) and the `data-bankopen` buttons depend on it, and `ls.lib` / class-date assignments hold copies. Renumbering, reordering or splitting families, or switching to the export ids as keys, would orphan saved copies. The bank carries no student data: `sid` and `cid` are not touched by the bank itself, but plans assigned to a class date (`cid`) reference the plan, so the plan id and `src.id` must not change. Keep `sport:n`, add the export id as an alias field, never as the key.
4. **Manual lesson building and live lessons** (medium). Import must stay a read-only archive and an explicit "make a copy" action (today's `bankCopy`); no silent replacement of a copy the teacher already edited or is running live, and no required feedback or alerts.
5. **Language preference** (medium). The bank resolves language at runtime from `I18N.lang()` and falls back to Hebrew with a visible notice; an import must keep five independent per-language arrays (not translate from one source) and keep new installs English by default. The `ru/es` emphasis-spacing difference shows the languages can drift independently.
6. **Offline core and size** (medium). Each sport file is 0.47-0.69 MB (about 3.6 MB for the six, all inlined in the standalone build); sport files are lazily loaded and listed in the service worker shell. Per-lesson provenance and hashes are small, but do not add the full export bodies as a second copy. Generated `Hamegrash.html`, `index.html` and `sw.js` must be rebuilt after integration, never copied.
7. **Timing parse** (low-medium). Three Hebrew lessons need either a source fix in Notion or a stricter parser before they can be used as editable plans; do not invent a second time model (`docs/LESSON_BANK_INTEGRATION_PLAN.md`, gap 6).
8. **Age model mismatch** (low-medium). Bank age bands (9-16) do not map onto the planner's grade model (ז-יב); `bankToPlan` guesses "mid".
9. **Review status** (policy). All content stays `draft`; the export itself is `raw-notion-export-unreviewed`. Nothing here is a publication approval, and the 2026-10-05 notes about the other product's name in section 16 ("HaMigrash PRO database connection") still apply: the app relabels it "Tags and keywords".
10. **Pause** (policy). Imports and expansion of international plans and the component bank are paused until the user lifts the hold. This report does not lift it.

Overall: low technical difficulty if limited to (a) filling `repo_compare` from this mapping and (b) adding optional provenance fields; medium if the goal is to ingest later Notion edits (needs a diff-and-approve workflow with a person, per language); high only if someone proposes replacing the bank or changing the key scheme.

### 9.4 Suggested next steps (no changes made here)

1. Record this mapping as the `repo_compare` value for each manifest row (a single owner decision; the JSON provides `verdict`, `confidence`, `appId`).
2. Ask the user whether the Hebrew export should be corrected in Notion to the reviewed terminology (so future exports do not regress), instead of changing the app.
3. Decide whether the three Hebrew compact-minute lessons are fixed in Notion or parsed.
4. Keep the objective lead-in as an app-side normalisation rule, documented next to the parser.

## 10. Limitations

- Similarity is a character-bigram measure plus exact field comparison; it flags differences but does not judge meaning. Excerpts for every differing field are in the JSON.
- Only the 300 lesson pages were compared; the 600 activity pages and the diagrams are out of scope.
- The export branch can move: this analysis used 6bfccef. The Notion fidelity sample (C13, 121 pages) found the export identical to live Notion, so differences here reflect the app bank, not export defects.
- No browser or device check was needed or done; all evidence is Node.

## 11. Reproduction

```
git fetch origin codex/g1-notion-export-pilot-20261014
mkdir <scratch>/export && git archive origin/codex/g1-notion-export-pilot-20261014 store-content/export/lessons store-content/manifest | tar -x -C <scratch>/export
node store-content/reports/tools/reconcile-lessons.cjs --export-dir <scratch>/export/store-content --out store-content/reports/lesson-bank-reconciliation-2026-10-16.json
```

Run twice, the output was byte-identical (sha256 9826157dd15b1e39c67edc8cad4c92504e20655e142dbad4a1b948883cb007e9). The script only reads the app bank (`hm-lessonbank*.js`, `hm-plans.js`, `tools/notion-lessons-import.js`) and the export directory; it writes only to `--out` or stdout and uses no timestamps or absolute paths.
