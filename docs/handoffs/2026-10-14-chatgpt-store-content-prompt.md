# ChatGPT task brief — PE Tools Store content + lesson diagrams — 2026-10-14

You are ChatGPT, working in parallel with Claude on **PE Ultimate / PE Tools Store**.
Claude coordinates architecture, code, and acceptance. The owner (Osher) does all merges and deployments.
This brief gives you four bounded tasks (G1–G4). Do them in order. G1 and G2-pilot can start at once.

Master plan (read first): Notion page "PE Tools Store — Claude Master Handoff, Content + Diagrams — 2026-10-14"
https://app.notion.com/p/3f9128d0e21781eca610fc5d74a7e148
Claude's split of the work: `docs/handoffs/2026-10-14-store-content-plan.md` on branch `ccr-f0f0c4fd-ymvjjb` of
https://github.com/osher15/https-pe-ultimate.netlify.app

---

## 0. Hard rules (apply to every task)

1. **No merge, no deploy, no store upload, no checkout.** Only the owner merges or deploys.
2. **Do not touch PE Ultimate app source or generated files** (`hm-*.js`, `index.html`, `Hamegrash.html`, `sw.js`, `native/`, `tests/`, `build-standalone.js`). Your files go only under `store-content/` and `docs/handoffs/`.
3. **Notion is read-only for you**, except one new status/report page per task under the master handoff page. No mass edits. If you find a defect in a Notion body, record it in your report with exact before/after text. Do not apply it.
4. **Do not invent content.** No new lessons, drills, games or activities. Do not resume the GM-025 / AC-017 expansion. Keep drills (DR), games (GM) and activities (AC) separate. Do not attach activity cards to lessons. The owner set this rule on 2026-09-22.
5. **Export full bodies, not search snippets.** After every fetch, check the `truncated`, `unknown_block_count` and `unknown_block_ids` fields. A truncated page counts as **not exported** until you fetch it completely.
6. **No external text or media.** No copied text, diagrams, photos, logos or brand names from FIFA, IHF, federations, ministries, etc. Everything is our own wording and drawing.
7. **Be honest about status.** All content is a *draft pending PE-teacher and native-speaker review*. Never write "teacher-approved", "certified", "curriculum-aligned", "legally cleared" or "zero risk". Do not write fake reviews or testimonials.
8. **English** for all new documentation, file names, keys and comments. Content in five languages: `he`, `en`, `ar`, `ru`, `es`.
9. If you cannot push to GitHub, deliver the same tree as a zip, plus a Notion report page that lists every file with its SHA-256. Never say a branch or Issue exists if you did not create it.
10. End each task with a handoff file `docs/handoffs/2026-10-14-chatgpt-<task>.md`. Include the exact counts, the checks you ran with their results, known limitations, and what Claude must verify.

**Delivery branch:** `codex/store-content-2026-10-14`, based on current `main`. Put `[skip netlify]` in every commit message.
**Root folder for all deliverables:** `store-content/`. It will later move to a separate commercial repo, so do not reference app internals from it.

---

## G1 — Source manifest + full-body export (Priority A)

### Inputs
- **Lesson series (60 families × 5 languages = 300 pages).** Parent page:
  https://app.notion.com/p/3df128d0e2178140b549dd1a82642096
  Exclude the child pages that are reports, standards, QA or handoffs. Count only the language pages of lessons 01–10 for each of the six sports.
- **Activity bank (80 DR + 24 GM + 16 AC = 120 items × 5 languages = 600 pages).** Five language indexes:
  - HE https://app.notion.com/p/3e3128d0e2178167878deeb0fdea770a
  - EN https://app.notion.com/p/3e3128d0e21781308946f4c761040b20
  - RU https://app.notion.com/p/3e3128d0e21781619c53c731e8ae8f45
  - AR https://app.notion.com/p/3e3128d0e21781aaac33eb6dfdef5ec0
  - ES https://app.notion.com/p/3e3128d0e217811baad6d1dccff44258
- **Latest audit (corrections already applied, do not re-apply):** https://app.notion.com/p/3f6128d0e21781819bbfdeac9d09ffc1
- **Old component cards** (BB-001, FB-001, HB-001, FIT-001, ATH-001, VB-001, COOP-001, RHY-001, LP-*). List them in the manifest with `kind:"legacy-component"` and `target_package:"none"`. Do not export their bodies.

### Stable IDs (use exactly these)
- Lesson families: `BB-01`…`BB-10`, `FB-01`…`FB-10`, `HB-01`…`HB-10`, `VB-01`…`VB-10`, `AT-01`…`AT-10`, `FIT-01`…`FIT-10`.
  These match the app bank (`hm-lessonbank-*.js`, lesson code `BB-01-EN` etc.). Athletics is `AT`, not `ATH`.
- Activity items: `DR-001`…`DR-080`, `GM-001`…`GM-024`, `AC-001`…`AC-016`.

### Output files
```
store-content/export/lessons/<lang>/<FAMILY>.md        # 300 files, verbatim Notion body as enhanced Markdown
store-content/export/activities/<lang>/<ITEM>.md       # 600 files, verbatim
store-content/manifest/lessons.json                    # 300 rows
store-content/manifest/activities.json                 # 600 rows (+ legacy-component rows)
store-content/manifest/manifest.csv                    # all rows, same columns
store-content/manifest/README.md                       # field definitions, method, counts
```
Each export file starts with a front-matter block, followed by the body exactly as Notion returned it:
```
---
id: BB-01            # or DR-001
kind: lesson         # lesson | drill | game | activity
lang: en
title: "Basketball 01 — Controlled Dribbling on the Move"
notion_url: https://app.notion.com/p/...
notion_page_id: 3df128d0-e217-8136-94ef-f318326978f1
notion_last_edited: 2026-09-22T19:11:28.094Z
fetched_at: <ISO time>
---
```

### Manifest row schema (JSON array of objects)
```json
{
  "id": "BB-01",
  "kind": "lesson",
  "sport": "basketball",
  "lang": "en",
  "title": "…",
  "notion_url": "…",
  "notion_page_id": "…",
  "notion_last_edited": "…",
  "body_sha256": "<sha256 of the body bytes after the front matter, UTF-8, LF line endings>",
  "body_chars": 12345,
  "truncated": false,
  "status": "draft-pending-teacher-and-native-review",
  "rights": "independent-original-draft; no blanket clearance",
  "audit_refs": ["https://app.notion.com/p/3f6128d0e21781819bbfdeac9d09ffc1"],
  "target_package": "lesson-pack-basketball",
  "repo_compare": null,
  "notes": ""
}
```
- `sport` for activities: use the sport the card itself names. Use `multi` or `general` if the card does not name one. Do not guess.
- `target_package` values: `lesson-pack-<sport>`, `drill-pack`, `game-pack`, `activity-pack`, or `none`.
- Leave `repo_compare` as `null`. Claude fills it by comparing your export with the app bank.

### Acceptance checks (report every result)
- Exactly 300 lesson rows: 60 IDs × 5 languages, no gaps and no duplicates.
- Exactly 600 activity rows: 120 IDs × 5 languages, no gaps and no duplicates.
- Zero rows with `truncated: true`. Zero unknown blocks.
- Titles match the language: Hebrew page in Hebrew, and so on.
- For each ID, list any differences between languages in numbers, durations, counts, field sizes or equipment quantities. Report them only. Do not fix them.
- Where Notion has more than one page for the same ID and language (older versions or duplicates), list all of them and mark which one is current.

---

## G2 — Lesson diagram scenes (Priority B)

Claude builds the renderer, the court/field templates, the legend and the validator. **You write the scene data**: which steps get a diagram, where the players, balls and cones go, and what the paths and alt texts are.

### Pilot first (6 lessons, one per sport). Stop for Claude's review before continuing.
`BB-09` (2v1), `FB-07` (2v1), `HB-07` (fast transition 3v2), `VB-05` (receive–set–send), `AT-04` (relay baton exchange), `FIT-04` (partner circuit).
Then complete all 60 families. Normally each lesson gets 2–3 diagrams, for 120–180 diagrams in total.

### What deserves a diagram
1. The starting organization of the main part: lanes, groups, waiting zones, collection paths.
2. The key movement, passing or rotation pattern.
3. The applied game, if its shape differs from the earlier steps.
Do not draw a diagram for the opening talk, the closing reflection, or anything the text already makes obvious.
A lesson may get 0–1 diagrams only if it is truly non-spatial. Give the reason in `placements.csv`.

### Templates (use only these IDs)
| Template | Use |
|---|---|
| `bb-full`, `bb-half` | basketball court, basket on the right in half court |
| `fb-full`, `fb-half`, `fb-grid` | football pitch; `fb-grid` = cone-marked square/rectangle |
| `hb-full`, `hb-half` | handball court with 6 m and 9 m lines, goal on the right |
| `vb-full`, `vb-half` | volleyball court; net vertical in the centre for `vb-full` |
| `at-lanes`, `at-jump`, `at-throw` | straight lanes; approach + landing zone; throwing sector |
| `fit-stations` | open hall with numbered station spots |
| `open-area` | neutral rectangle for anything else |

### Scene schema `pe-diagram/1` — one JSON file per diagram
Path: `store-content/diagrams/scenes/<FAMILY>/<FAMILY>-D<n>.json`
```json
{
  "schema": "pe-diagram/1",
  "id": "BB-09-D1",
  "family": "BB-09",
  "sport": "basketball",
  "template": "bb-half",
  "anchor": {
    "section": "mainA",
    "step": 1,
    "quote_en": "<the exact EN sentence(s) from the lesson step this diagram illustrates>"
  },
  "group_shown": "representative",
  "title": { "he": "", "en": "", "ar": "", "ru": "", "es": "" },
  "alt":   { "he": "", "en": "", "ar": "", "ru": "", "es": "" },
  "objects": [
    { "type": "player", "team": "A", "n": 1, "x": 40, "y": 35 },
    { "type": "player", "team": "B", "n": 1, "x": 70, "y": 50 },
    { "type": "ball", "x": 42, "y": 37 },
    { "type": "cone", "x": 20, "y": 10 },
    { "type": "zone", "x": 5, "y": 80, "w": 30, "h": 15, "label": "W" },
    { "type": "station", "n": 3, "x": 60, "y": 20 },
    { "type": "teacher", "x": 50, "y": 95 }
  ],
  "paths": [
    { "kind": "dribble", "from": [40, 35], "to": [65, 30], "order": 1 },
    { "kind": "pass",    "from": [65, 30], "to": [80, 60], "order": 2 },
    { "kind": "move",    "from": [55, 70], "to": [80, 60], "via": [[70, 72]], "order": 2 }
  ],
  "safety": "<one line: the spacing / return path / waiting zone / clear area shown>",
  "notes": "<why this diagram helps, max 2 lines>",
  "status": "draft"
}
```
Rules:
- **Coordinates are 0–100 on both axes** inside the template's playing area. The origin is top-left and x increases to the right. **Attack goes left → right.** Diagrams are never mirrored for RTL languages.
- `section` must be one of `warmup`, `mainA`, `mainB`, `appliedGame`. `step` is the 1-based order of the step inside that section's text.
- `quote_en` must be copied exactly from the EN lesson body (`store-content/export/lessons/en/<FAMILY>.md`). Claude's validator string-matches it.
- `team`: `A` is drawn as a triangle (attackers or the working group) and `B` as a square (defenders or the second group). Player numbers start at 1 for each team.
- `path.kind`: `move` (solid arrow), `pass` (dashed straight arrow), `dribble` (wavy arrow). Optional `via` holds curve points. `order` groups the paths into phases.
- `zone.label`: one letter only (W = waiting, R = return path, S = safety/clear area, T = target). Explain the letter in `alt`. **No words inside the drawing**, so one SVG serves all five languages.
- `group_shown`: `whole-class` or `representative`. If the step runs 6 parallel lanes, draw one or two lanes, set `representative`, and say so in `alt`.
- **Positions must match the text**: numbers of players per group, distances (scale them to the template), equipment counts, rotation direction. If the text is ambiguous, keep the diagram minimal and record the question in `placements.csv`. Do not invent a rule.
- **Safety must be visible**: separation between lanes, waiting behind the start line, return outside the lane, clear throwing sector (AT-08 and similar), no throwers facing other groups.
- `alt` (max ~300 characters per language) describes what the reader must understand: the groups, the movement order and the safety arrangement. Write each language natively, not word-for-word. Use the professional terms of that language, for example the RU/AR/ES lesson pages of the same family.
- `title` is short (≤ 60 characters), for example "2v1 to the basket — starting positions".

### Also deliver
- `store-content/diagrams/placements.csv` with the columns `family,diagram_id,section,step,template,group_shown,reason,open_question`. Include one row per diagram. For an exception lesson, add one row with an empty `diagram_id` and the reason.
- After the pilot: `docs/handoffs/2026-10-14-chatgpt-diagram-pilot.md`, then **stop and wait** for Claude's review of the six pilot lessons. Claude will render them and check positions, legend and print readability before you do the other 54.

---

## G3 — Activity bank: structured fields for filtering (after G1)

For each of the 120 items, extract (do not rewrite) the following fields from the **EN** body into `store-content/data/activities.meta.json`:
```json
{ "id": "GM-013", "kind": "game", "sport": "football|basketball|…|general",
  "age_min": 9, "age_max": 12, "duration_min": 8, "players_min": 8, "players_max": 30,
  "space": "14 x 14 m", "equipment": ["8 cones", "4 balls"], "skills": ["passing"],
  "contact": "none|limited", "inclusive_option": true, "open_questions": [] }
```
- If a field is not stated in the body, use `null`. Do not infer ages or durations.
- Check that the other four languages state the same numbers. List any mismatches. Do not fix them.
- Note which items need a diagram (games and activities with a non-trivial layout). Do not author those yet. That is a later batch, using the same `pe-diagram/1` schema.

---

## G4 — Product, sales and support copy (English first; after G1)

Files under `store-content/copy/`:
- `products.en.md`: one section for each product below, each with a one-line value proposition, what is included (exact counts from your manifest), who it is for, languages, format (print/HTML/standalone), system requirements, current status (draft pending review), and a **tentative** price in ILS.
  | Product | Tentative ILS |
  |---|---|
  | Tactics / coach board (standalone) | 39 |
  | Scoreboard (standalone) | 29 |
  | 20 m Shuttle Run (beep test), standalone; Léger 1988 protocol | 19 |
  | Single-sport lesson pack (10 lessons, 5 languages, diagrams) | 49 each |
  | Lesson generator | 69 |
  | Drill / game / activity pack | 39 |
  | Interval trainer (timers, circuits, exercise library) | 59 |
  | Complete bundle (only after approval) | 149 |
  Mark the boards, beep test, generator and fitness tool as "readiness to be verified by Claude". Do not describe features you have not seen.
  - **Beep test naming (owner decision 2026-10-14):** never write "FITNESSGRAM", "PACER", "Healthy Fitness Zone"/"HFZ" or "Cooper", and never say "compatible", "official" or "approved". Call it "20 m Shuttle Run (Beep Test)", cite Léger et al. (1988), and say "VO₂max estimate, not a medical test". **No norm tables.**
  - "Fitness tool" means the **interval trainer**, not the fitness tests, and has **no student data**.
  - Before writing copy, read `store-content/reports/product-readiness.md` (§7 "Do not claim" and §11).
- `faq.en.md`: about 20 Q&As. Cover offline use, languages, devices, what is in each pack, licence for one teacher/school (a draft for the owner's decision), updates, and refunds. For refunds, say that the statutory rights of the buyer's country apply. **Do not promise "no refunds" or "zero refunds".** Say that there is no subscription (one-time purchase), no student data in the tools, and no account required.
- `support-kb.en.md`: 15–25 short troubleshooting articles (install/open, print, language/RTL, lost local data and export, browser support).
- `legal-checklist.en.md`: a checklist of the questions the owner must settle before selling. Cover the seller entity and receipts/VAT, payment provider, terms, privacy, licence text, consumer refund law (Israel + EU if selling there), and rights status of content. **This is not legal advice. Say so.**
- No testimonials, no review counts, no "used by N teachers", no urgency tricks, no automated outreach.

---

## Reporting back

For each task, post (a) the branch/commit or zip, (b) the handoff file, and (c) a short summary on a new Notion child page under the master handoff page. Claude will verify by script:
- manifest counts and uniqueness, export hashes, `quote_en` matching, scene schema, coordinates in range, template IDs, five non-empty alt texts, and the rendered SVGs.

When in doubt, stop and ask. Do not guess.
