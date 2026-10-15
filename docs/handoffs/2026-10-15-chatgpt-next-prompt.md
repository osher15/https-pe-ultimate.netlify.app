# ChatGPT — next tasks after Claude's run of your checkers — 2026-10-15

Claude ran your scripts on a full checkout of `codex/g1-notion-export-pilot-20261014` (head `479320d` and later),
using Node 22. The rules of the original brief still apply: `[skip netlify]` on every commit, no merge, no
deploy, no app files, Notion read-only, source bodies never rewritten.

## 1. Results (executed by Claude, not authored-only)

| Check | Command | Result |
|---|---|---|
| Lessons | `node store-content/manifest/check-lessons.cjs` | **300/300 found, 0 issues** ✅ (ES BB-10 fix confirmed) |
| Activities | `node store-content/manifest/check-activities.cjs` | **124/600 found, 503 issues**: 476 missing, 20 `kind mismatch`, 7 `source ID differs from index` |
| Manifest | `node store-content/manifest/build-manifest.cjs` | 300 lessons + 124 activities; **deterministic** (second run byte-identical) ✅ |
| Pilot R4 | `node store-content/diagrams/validate.js store-content/diagrams/scenes --placements store-content/diagrams/placements.csv --en-export store-content/export/lessons/en` | **12 scenes, 0 errors, 0 warnings** ✅ |
| Engine copy | diff against `ccr-f0f0c4fd-ymvjjb` | identical ✅ |

**The G2a pilot is accepted.** G2b may start (see T4).

The seven wrong-source EN activity files:
`en/GM-003`, `en/GM-005`, `en/DR-012`, `en/DR-013`, `en/DR-014`, `en/DR-018`, `en/AC-004`.

## 2. Tasks, in order

### T1 — Fix the 7 wrong-source activity files
Re-export each one from the page listed for that ID and language in `activity-source-index.csv`. Fetch the
full body and check the `truncated` and unknown-block fields. Overwrite the file **only** with the correct
page's body and front matter. Use one commit for all seven.

### T2 — Add the missing `kind` (front matter only)
For the 20 files with `kind mismatch`, add `kind: drill|game|activity` (from the ID prefix DR/GM/AC) and
`id: <ID>` to the **front matter only**. Do not change a single character of the body. Use one commit.
Afterwards `check-activities.cjs` must show 0 `kind mismatch` and 0 `source ID differs`.

### T3 — Export the remaining 476 activity pages
1. Order: **EN first** (including DR-024, DR-032 and DR-062), then he, ar, ru, es.
2. Use one commit per language batch, or per 20 files if the GitHub tool limits size. Do not use one commit per
   file.
3. Every file follows the same front-matter format (`id`, `kind`, `lang`, `source`, `source_page_id`,
   `source_last_edited_at`, `status`) and contains the full body.
4. If a write is blocked, retry it in a later run. Never report a file as exported unless you have read it
   back from GitHub.
5. After each language:
   - run `check-activities.cjs` and report `found` and `issue_count`;
   - run `build-manifest.cjs` and commit the regenerated `lessons.json`, `activities.json` and `manifest.csv`.

**Done means:** 600/600 found, 0 issues, and the manifest is committed.

### T4 — G2b basketball diagrams (can run in parallel with T3)
1. Families BB-01 to BB-10. BB-09 already exists and is accepted.
2. Write 2–3 scenes per family, or an exception row with a reason.
3. Binding rules:
   - the brief (G2);
   - `store-content/diagrams/schema.md` §3–§5;
   - reviews #2 and #3 (`docs/handoffs/2026-10-14-claude-review-g2a-pilot-r2.md`, `-r3.md` on `ccr-f0f0c4fd-ymvjjb`).
4. Base every scene on its own lesson text. **Do not copy geometry between families.** Each scene needs a native,
   specific alt text and title in all 5 languages.
5. Before sending, run the validator with `--en-export`: it must show **0 errors and 0 warnings**. Also build
   the gallery (`node store-content/diagrams/gallery.js store-content/diagrams/scenes --out /tmp/bb.html`) and look
   at every diagram.
6. **Stop after basketball** and wait for Claude's review before football.

### T5 — Later (after T3)
- **G3:** activity metadata, extracted from the bodies and not rewritten. Unknown values are `null`.
- **G4:** product and sales copy. Follow the updated brief and `store-content/reports/product-readiness.md` §7, §11 and §12, plus the drafts in `store-content/legal/`:
  - the fitness tool is the **interval trainer**;
  - the beep test is the **"20 m Shuttle Run (Beep Test)"**, Léger 1988, with the adapted 15 m course;
  - never mention FITNESSGRAM, PACER, Healthy Fitness Zone or Cooper;
  - include no norm tables;
  - use the owner's AI-translation statement;
  - the refund and licence terms are those in `store-content/legal/` v0.2.

## 3. Report back
For each task give:
- the commit SHA(s);
- the exact JSON output of `check-activities.cjs` (counts and the first 10 issues);
- the validator summary line for G2b;
- an updated `docs/handoffs/` note that separates **executed** checks from checks that were only **written**.

Recount from the actual Git tree before you report totals. GitHub compare views cap at 300 paths and give wrong totals.
