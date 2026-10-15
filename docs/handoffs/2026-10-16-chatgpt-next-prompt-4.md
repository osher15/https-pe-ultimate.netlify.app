# ChatGPT — big batch of simple tasks (round 4) — 2026-10-16

Your Plus subscription ends tomorrow, so work through as many of these as you can, **in the order listed**. Every task is
small and independent. Finish and commit one task before starting the next. If you run out of time, the order
tells us where you stopped. **Always report which task numbers are done.**

## Rules (unchanged)
- Branch `codex/g1-notion-export-pilot-20261014`. Every commit message starts with `[skip netlify]`. No merge, no
  deploy, no app files, no changes to `main`. Notion is read-only. Source lesson bodies are never rewritten.
- Read files from your own branch (`store-content/export/lessons/...`, `store-content/legal/` is on branch
  `ccr-f0f0c4fd-ymvjjb`; read it from there).
- Commit in batches (one commit per task or per language batch). Read each file back from GitHub before you say it was
  written.
- **Never claim a check was executed unless you ran it.** You cannot run Node or browser checks. Claude runs them.
- **Never write** FITNESSGRAM, PACER, Healthy Fitness Zone or Cooper. **No** norm tables, testimonials, invented
  reviews, countdowns or urgency tricks. **Never write** "certified", "Ministry-approved", "100% legal" or "no refunds".
  Do not claim physical-device testing or official status.
- Anything that depends on an owner decision is a `{{PLACEHOLDER}}`. Never invent prices, dates or legal facts.
- English first. Then he, ar, ru, es. Natural wording, not word-for-word. Mention in each translated file's header
  that translations were produced with AI.
- All content is a recommendation only. The teacher decides and adapts, including for fitness tests.

---

## A. Already assigned (keep doing these first)
- **T2** activity metadata: `store-content/data/activities.meta.json` (120 records) and run the checker if you can.
- **T3** sales and support copy under `store-content/copy/` (`products.en.md`, `faq.en.md`, `support-kb.en.md`,
  `product-pages.he.md`). Read `store-content/reports/product-readiness.md` §7, §11, §12 and `store-content/legal/` v0.2
  first.
- **Skip T1 (football diagrams).** Claude already did them.

## B. New simple tasks

### B1 — Product pages in ar, ru, es
After T3 `products.en.md` exists: translate into `store-content/copy/product-pages.{ar,ru,es}.md`. Keep every
`{{PLACEHOLDER}}` untouched.

### B2 — FAQ and support KB in he, ar, ru, es
Translate `faq.en.md` and `support-kb.en.md` into `faq.{he,ar,ru,es}.md` and `support-kb.{he,ar,ru,es}.md`.

### B3 — Delivery email and receipt wording (EN + he first)
`store-content/copy/emails.en.md` and `emails.he.md`, short and plain:
1. Order confirmation / download email. It must include the **durable-medium confirmation** of the customer's consent
   to immediate digital delivery. Use the exact wording from `store-content/legal/checkout-copy.*` and
   `refund-policy.*`. Do not invent new legal wording.
2. Licence email: which licence (Single-Teacher or School), what it allows, link to the licence summary.
3. Refund request received.
4. Refund approved, refund declined (with the reason and the next step).
5. Fix/replace notice for a faulty file.
6. Licence upgrade offer (single to school).
Use `{{PLACEHOLDER}}` for names, order numbers, links and amounts.

### B4 — Support macros (EN + he)
`store-content/copy/support-macros.en.md` and `.he.md`: 15 short ready replies. Cover: how to open on phone, PC and
iPad; the file does not open; language switch; lost data after clearing the browser (explain the backup feature);
how to back up and delete data; how to share with a colleague (licence rules); a wrong-licence purchase; a duplicate
purchase; a refund request; an accessibility problem; and a content error report.

### B5 — "How to use" README that ships inside each download (EN + he)
One short `README-download.en.md` and `.he.md` per product type (tools, lesson pack, activity pack): what is inside,
how to open it offline, how to print, where the data is stored, how to back up, who to contact, and the licence
summary in three lines. Put them in `store-content/copy/download-readme/`.

### B6 — Licence file text (EN + he)
`store-content/copy/licence-files/LICENCE-single-teacher.{en,he}.txt` and `LICENCE-school.{en,he}.txt`: a one-page
plain version taken **only** from `store-content/legal/licence-summary.*` and `terms-of-sale.*`. Do not add new
terms. Header: "Draft pending lawyer review".

### B7 — Table of contents per lesson pack (from the manifest)
For each of the six sports, write `store-content/copy/packs/<sport>.en.md`: the title, the number of lessons, and a
table of lesson id, title, age band if stated, duration if stated. Extract from `store-content/export/lessons/en` and the
manifest. Unknown means `null` or empty. Never infer. Recount from the Git tree.

### B8 — Activity pack catalogue (from T2)
`store-content/copy/packs/activities.en.md`: counts per kind (drill, game, activity) and per sport, and a compact table
(id, title, age, duration, players, equipment). Use T2 data only.

### B9 — Short product descriptions for store listings (all 5 languages)
`store-content/copy/listing-descriptions.json`: for each of the 7 products and each language: `title` (max 60
characters), `short` (max 160), `long` (max 600). Same rules as T3.

### B10 — SEO titles and meta descriptions for every page in `store-content/site/sitemap.md`
`store-content/site/seo.json`: per page and per language (en, he, ar, ru, es): `title` (max 60), `description` (max 155).
No claims that are not in the readiness report.

### B11 — Alt texts for the 47 exercise animations (5 languages)
`store-content/exercise-anim/alt-texts.json` on your branch: read the ids and English names from
`store-content/exercise-anim/library.json` (branch `ccr-f0f0c4fd-ymvjjb`). For each id write one short alt text
(max 120 characters) that describes the movement as a cartoon figure doing it, in en, he, ar, ru and es.
Describe only; do not give training advice.

### B12 — PE glossary (5 languages)
`store-content/copy/glossary.json`: about 80 terms that occur in the lesson exports (for example cone, gate, warm-up,
dribble, pass, shield the ball, sole stop, half court, rotation, station). For each term give the translation used
in the **existing exports** per language. Do not invent a new term. If two exports use different words for the same
thing, list both under `variants`. Do not fix them.

### B13 — Terminology consistency report
Use B12 to write `store-content/reports/terminology-consistency.md`: terms that differ between lessons in the same
language. List only. Do not change any source file.

### B14 — Accessibility check of the copy (text only)
`store-content/reports/copy-accessibility-review.md`: review your own T3 and B-copy for plain language, link text that
means something, no all-caps blocks, and heading order. List fixes and apply them only to files you wrote.

### B15 — Launch-readiness checklist for the owner (EN + he)
`store-content/reports/launch-checklist.{en,he}.md`: one tickable list of what the owner still has to do before the
first sale. Use `store-content/legal/open-questions.md` and `store-content/reports/product-readiness.md`. Group by:
accounts, legal review, accountant, products to re-verify, content review by native speakers, store set-up. Put a
file or link next to each item. **Do not add legal facts that are not in those files.**

### B16 — Hebrew and Arabic proofreading notes (flag only)
Read the 20 football scene titles and alt texts (branch `ccr-f0f0c4fd-ymvjjb`, `store-content/diagrams/scenes/FB-*`).
Write `store-content/reports/football-alt-text-review.md`: for each language, list wording problems you are confident
about (grammar, a wrong football term, gender, mixed direction). **Do not edit the scene files.** Claude applies
fixes.

### B17 — Legal drafts: translate the Hebrew/English drafts into ar, ru, es (low priority, last)
Only if time remains. Files in `store-content/legal/` v0.2 (on `ccr-f0f0c4fd-ymvjjb`). Write
`store-content/legal-translations/<doc>.{ar,ru,es}.md`. Keep every number, article reference and
`{{PLACEHOLDER}}` unchanged. Header: "AI translation of a draft. Not legal advice. Pending lawyer review." Do not
paraphrase a legal clause; if a clause is unclear, leave it in English and mark `[unclear]`.

---

## Report back (one message, at the end of each run)
1. A table: task id, status (done / partial / not started), commit SHA(s), files.
2. Separate **executed** checks (you ran them) from checks you only **wrote**.
3. List any file you could not read back from GitHub.
4. List the open questions you found, each with the file name and a short English quote.
