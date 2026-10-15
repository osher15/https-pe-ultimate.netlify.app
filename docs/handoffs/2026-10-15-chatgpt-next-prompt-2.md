# ChatGPT — new tasks (round 3) — 2026-10-15

Claude ran your checks on branch `codex/g1-notion-export-pilot-20261014` (head `79a8ce7`), with Node 22 on a full
checkout:

| Check | Result |
|---|---|
| `check-lessons.cjs` | 300/300, 0 issues ✅ |
| `check-activities.cjs` | **600/600, 0 issues** ✅ |
| `build-manifest.cjs` | 900 entries, deterministic ✅ |
| Manifest test | 1/1 ✅ |
| `validate.js` (all scenes, with `--en-export`) | **30 scenes, 0 errors, 0 warnings** ✅ |
| Basketball diagrams (20 scenes) | rendered and reviewed by Claude: **accepted** ✅ |

Well done. Your own reports matched what Claude measured.

## Changes to your role (no new verification work for you)
You told us you cannot compare all 900 pages against Notion. **Claude now owns that.** It is checking a
stratified sample of 120 files (60 lessons + 60 activities) against live Notion pages, including every file
that was ever wrong. **Do not spend more runs on source-fidelity.** Keep committing with `[skip netlify]`, and
never state a check as executed unless you ran it.

Remaining known issue (yours, small): **BB-05 Main A** has a contradictory three-cone/empty-cone description in
the source text. Draw nothing for Main A. In `placements.csv` give the BB-05 row an `open_question` that quotes the
contradiction in English. Do not guess.

## Tasks, in order

### T1 — G2b football (FB-01 to FB-10)
Same rules as for basketball:
- Use `fb-half`, `fb-full` or `fb-grid`. `fb-grid` has no goals, so use `fb-half` whenever the text mentions a goal.
- 2–3 scenes per family, or an exception row with a reason.
- Every scene comes from its own lesson text. **Do not reuse geometry** between scenes, sports or families.
- Native, specific alt text and title in all 5 languages.
- Run the validator with `--en-export`: it must show **0 errors and 0 warnings**.
- Also look at every diagram in the gallery before sending.

Stop after football, and wait for Claude's review.

### T2 — G3: activity metadata (all 600 pages → `store-content/data/activities.meta.json`)
Extract fields from the **EN** pages (120 items), and compare them with the other 4 languages.
```json
{ "id": "GM-013", "kind": "game", "sport": "football|basketball|handball|volleyball|athletics|fitness|multi|general",
  "age_min": 9, "age_max": 12, "duration_min": 8, "players_min": 8, "players_max": 30,
  "space": "14 x 14 m", "equipment": ["8 cones", "4 balls"], "skills": ["passing"],
  "contact": "none|limited", "inclusive_option": true,
  "needs_diagram": true, "diagram_reason": "non-trivial layout: two gates and a waiting zone",
  "lang_mismatches": [], "open_questions": [] }
```
- Extract only what the text states. Unknown means `null`. Never infer.
- Put every number that differs between languages in `lang_mismatches`, with the item, language and both values.
  Do not fix it.
- Write `store-content/data/README.md` with the field definitions.
- Write a small checker (`store-content/data/check-meta.cjs`) that confirms: 120 items, valid JSON, and unique ids.
  Run it and report its output.

### T3 — G4: sales and support copy (English first)
Read first: `store-content/reports/product-readiness.md` §7, §11 and §12, and `store-content/legal/` (v0.2, with refund,
licence and responsibility rules).
Produce these files under `store-content/copy/`:
- `products.en.md`: one section per product, with one value line, what is included (exact counts from the
  manifest), who it is for, languages, format and system requirements. Use the tentative ILS prices from the
  brief. The products are:
  - tactics/coach board;
  - scoreboard;
  - **20 m Shuttle Run (Beep Test)** (Léger 1988, with the adapted 15 m course for younger pupils or pupils
    with disabilities);
  - **interval trainer** with 47 animated cartoon exercise demonstrations;
  - six single-sport lesson packs, **with diagrams**;
  - drill/game/activity pack;
  - the bundle (marked "after approval").
- `faq.en.md`: about 25 Q&A. Cover offline use, the languages, devices, the two licences, updates, refunds exactly
  as in the refund policy, the AI-translation statement (owner's wording), the safety line "recommendations only,
  the teacher decides and adapts", privacy (nothing is sent, local storage), and accessibility.
- `support-kb.en.md`: 15–25 short troubleshooting articles.
- `product-pages.he.md`: Hebrew versions of the product pages.

Rules:
- **Never write** FITNESSGRAM, PACER, Healthy Fitness Zone or Cooper.
- **No norm tables**, no testimonials or invented reviews, no countdown or urgency tricks.
- **Never write** "certified", "Ministry-approved", "100% legal" or "no refunds".
- Do not claim device testing, official status, or features that are not in the readiness report.
- Mark anything that depends on an owner decision with `{{PLACEHOLDER}}`.

### T4 — Store site structure (planning only)
Write `store-content/site/sitemap.md`: pages (home, catalog, 7 product pages, bundle, FAQ, support, licences,
legal pages, contact), the navigation, the call-to-action per page, which legal documents are linked from the
checkout, and which pages need a demo. Add a short wireframe for the home page and a product page, in plain text.
Do not write code.

## Report back
For each task: commit SHA(s), a short note, and the exact output of every check you ran. Separate checks you
**executed** from checks you only **wrote**. Recount counts from the Git tree.
