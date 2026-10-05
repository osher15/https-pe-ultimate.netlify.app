# International lesson bank (#24): integration plan

Status: hold lifted by the owner on 2026-10-05 ("yes, I meant the import of the 60 plans"). Plan drafted; no import code is on main yet.

## What exists

- Branch `feat/international-lesson-bank` (4dae863 base, 3 commits): `hm-lessonbank.js` (schema header, `window.LESSONBANK.meta`), `hm-lessonbank-basketball.js` and `hm-lessonbank-football.js` (10 lessons x 5 languages each, loaded as-is from Notion), an archive card in `hm-lesson.js` (`renderBank*`, `BANK_LABELS`), `index.html`/`hm-styles.css`/`hm-terms.js`/`sw.js`/`build-standalone.js` wiring and `tests/e2e/lessonbank.e2e.js`.
- Target: 60 lessons = 6 sports (basketball, football, handball, volleyball, athletics, fitness) x 10 lessons x 5 independently written languages. Only basketball and football (20 lessons) are in the branch; the other four sports are in Notion.
- The branch is 23+ commits behind main. Main has changed `hm-lesson.js` (timing, weather, equipment sharing), `hm-data.js`, `hm-i18n.js`, `index.html`, `sw.js`, generated files. Do not overwrite main's sources with the branch's copies; merge three-way and rebuild generated files.

## Findings from the Notion check (2026-10-05, read-only)

- Source index page: "סדרת מערכים לבית הספר — מהדורות נפרדות לפי שפה" (Notion page id `3df128d0e2178140b549dd1a82642096`) lists all 300 lesson pages (60 families x 5 languages). The page headings are fixed: 20 numbered sections (`# 1. Lesson identity` ... `# 20. Self-quality check`); section 9 has six sub-sections in a fixed order.
- A large language-consistency correction pass was done in Notion on 2026-09-28 (football, handball, volleyball, athletics, basketball BB-01/02). The branch data was committed on 2026-09-29, and the spot checks (BB-01 EN assessment, FB-06 EN 60%/65%, FB-10 RU structure) show it already contains the corrected text. Basketball and football in the branch are therefore current; the other four sports must be loaded from the corrected Notion pages, not from older copies.
- Every page ends with "Status: original V2 draft; professional review, language editing, and field pilot are required before publication." The app now shows a draft banner (`LESSONBANK.meta.provenance.reviewStatus = "draft"`); do not change it without a person's review.
- Section 16 in Notion is titled "HaMigrash PRO database connection" (another product). The imported field only holds tags/keywords; the app label was changed to "Tags and keywords" in all five languages. The lesson data contains no mention of the other product (checked on the 100 loaded lessons).
- Cost: 100 lessons loaded = about 1 MB of JavaScript (basketball 565 KB, football 459 KB). Six sports will be about 3 MB. Plan per-sport lazy loading before adding more sports.

## Blocker for loading the remaining four sports

The 200 remaining pages are only reachable through the Notion connector, which returns text into the assistant's context; there is no way to save a page to a file without retyping it. Retyping about 2 MB of lesson text risks silent changes (the data must be "as written"). The safe route is a deterministic converter run on files: the owner exports the Notion subtree as Markdown (Export, include subpages) into `import/notion/`, and Claude writes `tools/notion-lessons-import.js` against the real files, validating it by regenerating the already-imported basketball and football and diffing them against the committed data. A positional parse of the identity block is not reliable (the line order and labels vary by lesson and language), so the Age/Duration labels must be taken from the real files.

## Rules (from the owner and AGENTS.md)

- Content is loaded as written in Notion. No machine re-translation and no editing of lesson text during import. Language is chosen by the active UI language, not by the DICT.
- Drills/games/activities stay separate from lesson sequences (a future `DRILLBANK`; not built now).
- English default for new installs; five languages; offline core; no server/account/payment.
- Netlify credits are limited: batch commits, push when there is something to verify, no work-in-progress PRs.

## Gaps to close before this counts as done (acceptance)

1. **Provenance per lesson and language:** add fields `source` (Notion page id + revision/date), `contentVersion`, `reviewStatus` (`imported` / `teacher-reviewed` / `native-reviewed`) next to each lesson. The UI shows the status; nothing is labelled reviewed unless a person reviewed it.
2. **Missing-language notice:** if a lesson is missing in the active language, show an explicit notice and fall back to Hebrew, never silently.
3. **Brand fork:** the labels and text mention "המגרש PRO" ("PE Court PRO bank link"). PE Ultimate is a separate product; each such mention is reviewed with the owner before release.
4. **Offline and loading cost:** every `hm-lessonbank-*.js` goes into the service-worker shell and the standalone build; measure the size (about 3,100 lines per sport) and decide lazy loading per sport if startup or the offline cache grows too much.
5. **Fit with the planner:** a bank lesson must be usable with selection, edit, assignment to a class date, live lesson and reflection (the same path as generated plans). Pilot with one sport first.
6. **Practicable duration and equipment:** lesson sections carry minutes in free text. Do not invent a second time model; map them onto the existing step timing (`t`/`r`) only after a reviewer confirms the numbers. Equipment text is checked against the shared equipment list and flagged, not blocked.
7. **AT-05 timing contradictions** in the Hebrew series are resolved with the owner before the lessons are published.
8. **Rights:** the archive-document rights audit (11 documents in `hm-plans.js`) is separate and document-only (see the Codex instructions).

## Order of work

| Step | Owner | Output |
|---|---|---|
| 0. Reservations posted on #24 | Claude | file list below |
| 1. Merge the branch's two sports onto main (three-way), rebuild generated files, keep its e2e test | Claude | one PR, one push |
| 2. Schema and provenance validator tests (pure Node) | Codex | `tests/unit/lessonbank.test.js` (spec below) |
| 3. Provenance fields + missing-language notice + brand-fork review list | Claude | same PR or the next |
| 4. Load the other four sports from Notion, as-is | Claude, verified by Codex's validator | one PR per two sports |
| 5. Small pilot with the owner on one sport | owner | notes in the handoff |

**Files reserved for step 1/3 (Claude):** `hm-lessonbank*.js` (new), `hm-lesson.js` (`renderBank*` section only), `index.html` (bank card only), `hm-styles.css` (`.bank-*` only), `sw.js` SHELL (via the build script), `build-standalone.js` SCRIPTS, `tests/e2e/lessonbank.e2e.js`, `bk`/`lb.*` translation keys if needed.

## Validator spec (for Codex, step 2)

Load `hm-lessonbank.js` and each `hm-lessonbank-<sport>.js` in a Node `vm` context with a stub `window`. For every sport listed in `LESSONBANK.meta.sportOrder` that has data, and every language in `meta.langs`:

- exactly 10 lessons, `n` = 1..10 with no duplicates;
- every lesson has all fields listed in the header of `hm-lessonbank.js`, strings non-empty, arrays non-empty, `sections` has opening, warmup, mainA, mainB, appliedGame, closing;
- the same sport has the same lesson numbers in all five languages;
- `duration` is a number of minutes that matches the sum of the section minutes within a stated tolerance (report, do not fail, if the text has no minutes);
- no Hebrew letters in `en`/`ru`/`es`/`ar` fields except the allowed code identifiers (`BB-01-HE`-style codes);
- once step 3 lands: `source`, `contentVersion`, `reviewStatus` are present and `reviewStatus` is one of the three values.
Report counts per sport and language. Do not modify the data.
