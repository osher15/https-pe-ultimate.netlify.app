# ChatGPT — next tasks after Claude's review of G1 — 2026-10-14

Claude reviewed your branch `codex/g1-notion-export-pilot-20261014` (head `f1b97a4`, 334 files, only under
`store-content/` and `docs/handoffs/`). The rules of the original brief still apply:
`docs/handoffs/2026-10-14-chatgpt-store-content-prompt.md` on branch `ccr-f0f0c4fd-ymvjjb`. No merge, no
deploy, no app files, Notion read-only.

## 1. What Claude verified

| Item | Result |
|---|---|
| Lesson exports | **300/300 files** (60 × he/en/ar/ru/es). Front matter is valid, family and language are correct, 20 top-level headings in every file, no truncation markers. |
| `check-en.cjs` | 60 found, 0 issues |
| Source fidelity (spot check) | FB-07 EN matches the live Notion page exactly, including `last_edited` 2026-10-08T17:53:07.839Z |
| Pilot quotes vs. **Notion** export | `validate.js … --en-export store-content/export/lessons/en` gives **0 errors**. All 12 `quote_en` are verbatim in your export. |
| Activity index | `activity-source-index.csv` has 600 rows in 5 languages |
| Activity exports | **29/600** (EN only: DR-001…020, GM-001…005, AC-001…004) |

**Defect (must fix):** `export/lessons/es/BB-10.md` contains **Football 10** (body code `FB-10-ES`,
`source_page_id` 3e0128d0-e217-8169-91a7-ff3282c4a594, the same as `es/FB-10.md`). The correct page is
"Baloncesto 10 — Juego reducido 3 contra 3 y toma de decisiones | Español",
https://app.notion.com/p/3e0128d0e21781128b8ef1f256820aa8. All other 299 files have the right lesson code in
their body.

**Process notes:**
- Commits have no `[skip netlify]`. Add it to every commit from now on.
- Use batch commits: one commit per language or batch, not one per file.
- `docs/handoffs/2026-10-14-g1-en-complete.md` says only EN was exported. Update it: all 5 languages are on the
  branch.
- The front-matter keys (`source`, `source_page_id`, `source_last_edited_at`, `status`) differ from the brief's
  `notion_url`/`notion_page_id`/`notion_last_edited`. **Keep yours** and document them in
  `store-content/manifest/README.md`. Claude's tools will read your keys.

## 2. Next tasks, in this order

### T1 — Fix and harden the lesson export
1. Re-export `es/BB-10.md` from the correct page above.
2. Extend `check-en.cjs` into `store-content/manifest/check-lessons.cjs` covering all 5 languages, and add these
   checks:
   - the first lesson code in the body (`BB-10-ES` etc.; athletics may use `AT`) must equal `family`;
   - every `source_page_id` is unique across all 300 files;
   - `lang` matches the folder.

   Run it. Report: 300 found, 0 issues.

### T2 — Pilot R4 (mechanical only)
Get the engine from branch `ccr-f0f0c4fd-ymvjjb`, folder `store-content/diagrams/` (or from the zip Claude sent).
Fix the 7 warnings:
- delete the leftover `move` paths: BB-09-D2 `paths[1]` (63,77)→(83,77) and FB-07-D2 `paths[1]` (54,16)→(82,24);
- move the ball to (x+3, y+3) of A1 in BB-09-D1, BB-09-D2, FB-07-D1, FB-07-D2 and HB-07-D2.

Commit the 12 scenes and `placements.csv` to your branch under `store-content/diagrams/scenes/` and
`store-content/diagrams/placements.csv`. Run:
`node store-content/diagrams/validate.js store-content/diagrams/scenes --placements store-content/diagrams/placements.csv --en-export store-content/export/lessons/en`
It must show **0 errors, 0 warnings**.

### T3 — Finish the activity export (571 remaining)
- For each language, export every ID in `activity-source-index.csv`: 80 DR + 24 GM + 16 AC. Do EN first, then
  he, ar, ru, es. Commit one batch per language.
- File path: `store-content/export/activities/<lang>/<ID>.md`, with the same front-matter style as the lessons
  plus `kind: drill|game|activity`.
- Fetch every page in full. A truncated fetch counts as not exported.
- Write `store-content/manifest/check-activities.cjs` with these checks:
  - 600 files;
  - every ID × language is present;
  - the ID in each body matches the file name;
  - page IDs are unique and equal to the index;
  - no truncation markers.

  Report: 600 found, 0 issues.

### T4 — Manifest
Produce `store-content/manifest/lessons.json` (300 rows), `activities.json` (600 rows) and `manifest.csv`, using
the row schema in the original brief (G1). Put your front-matter values in the matching fields. `body_sha256` is
the SHA-256 of the UTF-8 body after the front matter, with LF line endings. Leave `repo_compare` as `null`:
Claude fills it.

### T5 — G2b, one sport per batch (only after T1–T2 pass)
1. Start with **basketball**: BB-01…BB-10. BB-09 already exists. Write 2–3 scenes per family, or an exception
   row with a reason. Follow the binding rules:
   - the brief (G2);
   - `store-content/diagrams/schema.md` §3–§5 (template coordinates);
   - review #2 and review #3 on branch `ccr-f0f0c4fd-ymvjjb` (`docs/handoffs/2026-10-14-claude-review-g2a-pilot-r2.md`, `-r3.md`).
2. Every scene comes from its own lesson text. Do not copy geometry between families.
3. Write a native, specific alt text and title for each scene, in each language.
4. Before sending:
   - validator with `--en-export`: **0 errors, 0 warnings**;
   - run `node store-content/diagrams/gallery.js store-content/diagrams/scenes --out /tmp/bb.html` and look at every diagram.
5. **Stop after basketball** and wait for Claude's review before football.

### T6 — Later (after T3)
G3 (activity metadata) and G4 (copy). For G4, read the updated brief section and
`store-content/reports/product-readiness.md` §7 and §11:
- "Fitness tool" = **interval trainer**.
- The beep test is the **"20 m Shuttle Run (Beep Test)"**, Léger 1988.
- **Never** write FITNESSGRAM, PACER, Healthy Fitness Zone or Cooper.
- **No norm tables.**

## 3. Report back
For each task: commit SHA, the exact command output of each check script and of the validator, and an updated
handoff file in `docs/handoffs/`. Say clearly what was **not** done. Do not report counts you did not recount on
GitHub.
