# ChatGPT — round 5 — 2026-10-16

Thank you for round 4. Claude reviewed it: the checks pass (300/300 lessons, 600/600 activities, manifest deterministic,
3/3 manifest tests), the BB-05 rows and scenes are in, and the delete-all strings, launch checklists, emails, macros,
download READMEs and licence files are accepted as drafts.

What changed since you wrote the sales copy: **Claude wrote the final English sales and support copy** on branch
`ccr-f0f0c4fd-ymvjjb` (`store-content/copy/products.en.md`, `faq.en.md`, `support-kb.en.md`, `product-pages.he.md`) and
the 47 exercise alt texts (`store-content/exercise-anim/alt-texts.json`). Your earlier versions of those files
(products/FAQ/support-kb in en, and their translations, plus `listing-descriptions.json`, `alt-texts.json`) are
**superseded** and must be redone from Claude's files. Do not edit Claude's files.

## Rules (unchanged)
- Branch `codex/g1-notion-export-pilot-20261014`. Every commit starts with `[skip netlify]`. No merge, no deploy, no app
  files, no changes to `main`. Notion is read-only. Lesson/activity bodies are never rewritten.
- Read Claude's files from branch `ccr-f0f0c4fd-ymvjjb` with the GitHub connector. Read each file back after writing it.
- Never claim a check was executed unless you ran it. You cannot run Node. Claude runs checks.
- **Never write** FITNESSGRAM, PACER, Healthy Fitness Zone, Cooper, "certified", "Ministry-approved", "100% legal",
  "no refunds". No norm tables, testimonials, invented reviews, countdowns or urgency tricks. Keep every
  `{{PLACEHOLDER}}` exactly as written. Header on every translated file: "Translations were produced with AI; draft".
- All content is a recommendation only. The teacher decides and adapts.

## Tasks, in priority order (commit each separately; report which ones are done)

### R1 — T2: activity metadata (highest value, still missing)
`store-content/data/activities.meta.json` (120 records) per `store-content/data/README.md`. Extract from the EN pages, compare with
the other four languages, list number differences in `lang_mismatches`. Unknown is `null`; never infer. Then run
`check-meta.cjs` only if you can; otherwise say it was not run.

### R2 — Translate Claude's final copy (replaces your earlier translations)
Write to `store-content/copy/translations/` (new folder, so nothing of Claude's is overwritten):
- `faq.{he,ar,ru,es}.md` from `faq.en.md` (28 Q&A).
- `support-kb.{he,ar,ru,es}.md` from `support-kb.en.md` (22 articles).
- `product-pages.{ar,ru,es}.md` from `products.en.md` (Hebrew already exists: `product-pages.he.md`).
Translate faithfully. Keep numbers, prices, counts, article/clause references, the refund text and the owner's two wording blocks
(translations notice, responsibility line) **exactly as in the English source, translated sentence by sentence**.

### R3 — Lesson pack indexes with real titles (fixes B7)
`store-content/copy/packs/<sport>.en.md` for basketball, football, handball, volleyball, athletics, fitness. Your first version had blank
titles. The title is in the line `**Name/code:**` of each EN lesson. Table: lesson id, title, sport/subtopic, age band, duration, equipment
line (verbatim), each taken from the EN export only; use `null` where the text does not say. 10 lessons per pack. Recount from the tree.

### R4 — Activity pack catalogue (B8, after R1)
`store-content/copy/packs/activities.en.md`: counts per kind and per sport, and a compact table (id, title, age, duration, players, equipment).
Use only `activities.meta.json`.

### R5 — Glossary and terminology report (B12, B13)
`store-content/copy/glossary.json`: about 80 recurring PE terms with the translation used in the existing exports for each language; list variants
when two exports use different words. Then `store-content/reports/terminology-consistency.md`: terms that differ inside the same language.
List only; do not change source files.

### R6 — Source-text contradiction scan (like BB-05 and FB-02 Main B)
`store-content/reports/source-contradictions.md`: scan the EN lessons (all 60) for internal contradictions a teacher would trip over, for example
an equipment count that does not match the organisation line, a setup that cannot work as written (the FB-02 Main B "empty corner" case),
a duration that does not add up, an age band that conflicts with the activity, or a safety step missing for a risky drill. For each: file,
quote (verbatim, English), why it is a problem, and a suggested one-line correction **for the owner to apply in Notion**. Do not edit sources.
Mark certainty: confident / possible. Skip style issues.

### R7 — Football alt text review (B16)
Read the 20 football scenes on branch `ccr-f0f0c4fd-ymvjjb` (`store-content/diagrams/scenes/FB-*`). Write
`store-content/reports/football-alt-text-review.md`: wording problems you are confident about per language (grammar, football terms, gender,
mixed direction). Do not edit the scene files.

### R8 — Free sample candidates
`store-content/reports/sample-lesson-candidates.md`: for each of the six sports, recommend one lesson that works best as a free sample on a
product page (clear, self-contained, no safety ambiguity, a diagram exists for it if possible; list which scene files exist on the
branch `ccr-f0f0c4fd-ymvjjb`). Give the reason in two lines each. Recommendation only.

### R9 — Count consistency check on Claude's copy
`store-content/reports/copy-count-check.md`: check every number in `products.en.md`, `faq.en.md`, `support-kb.en.md` (lesson counts, activity
counts, per-kind counts, number of exercises, sizes, languages) against the manifests and the tool READMEs. Table: claim, source, match / mismatch.
List only mismatches that are really in the repository files; do not guess.

### R10 — Legal draft translations (last, low priority)
Only if time remains: `store-content/legal-translations/<doc>.{ar,ru,es}.md` from `store-content/legal/*.en.md` (v0.2 on `ccr-f0f0c4fd-ymvjjb`).
Keep numbers, article references and placeholders unchanged. Header: "AI translation of a draft. Not legal advice. Pending lawyer review."
Do not paraphrase a clause; if unclear, leave the sentence in English and mark `[unclear]`.

## Report back (one message)
1. Table: task, status (done / partial / not started), commit SHAs, files.
2. Separate **executed** checks (you ran them) from checks you only **wrote**.
3. List any file you could not read back from GitHub.
4. List new open questions with file name and a short English quote.
