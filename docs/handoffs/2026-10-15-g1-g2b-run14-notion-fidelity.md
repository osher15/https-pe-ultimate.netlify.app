# G1/G2b run 14 — direct Notion fidelity and inventory regression (2026-10-15)

Scope: `osher15/https-pe-ultimate.netlify.app`, branch `codex/g1-notion-export-pilot-20261014`. No merge, deploy, Main, Notion writes, or application code changes.

## Verified remotely
- Read `docs/handoffs/2026-10-14-g1-en-complete.md` and run-13 verification before new work.
- `store-content/manifest/manifest.csv` exists remotely with 900 data rows; `lessons.json` and `activities.json` were previously verified. No duplicate export or manifest writes.
- EN `DR-024.md` and `DR-028.md` exist remotely with correct front matter; previously blocked exports are no longer pending.

## New direct Notion checks
Read each Notion page and the corresponding GitHub export, comparing the **complete Markdown body** (trailing whitespace ignored) and the exact `source_last_edited_at` value to Notion's `page_last_edited_at`.

- `GM-001` through `GM-015`, each of `he/en/ar/ru/es`: **75/75 bodies matched; 75/75 timestamps matched**.
- None of the 75 Notion responses reported `truncated=true`.
- These are **new** checks distinct from earlier reported DR and other targeted comparisons.
- This proves only these 75 sources; it is not a full 900-page source audit.

## Regression test
- Locally ran `node --test store-content/manifest/test/export-inventory.test.cjs` from the prepared QA patch against the full user-supplied branch ZIP with the generated published manifests: **2/2 tests passed**.
- Test covers 900 expected files, metadata, unique source IDs, full body SHA-256 in manifests and CSV row count. It does **not** compare bodies to Notion.
- Attempt to create `store-content/manifest/test/export-inventory.test.cjs` in GitHub was blocked. File is retained in `PE_Ultimate_G1_G2b_run13_QA_patch.zip`; no commit claimed for the test.

## Still pending
- Remaining Notion source-body comparisons across the 900 exports.
- BB-05 Main A three-cone/empty-cone source contradiction; BB-05 scenes are drafts for unambiguous warm-up and Main B.
- Claude professional approval is deferred per user.
- Earlier full-checkout results (300/300 lessons, 600/600 activities, 30 scenes with zero warnings) remain documented in run 13; not falsely counted as newly executed here.

## Continuation in the same run: all games verified
- Directly fetched and compared `GM-016` through `GM-024` in all five languages: **45/45 exact full-body matches and timestamps**.
- Together with the 75 checks above, **all 120 game cards** (`GM-001`–`GM-024` × `he/en/ar/ru/es`) were compared against live Notion pages in this run: **120/120 matched bodies and last-edited timestamps**, no reported truncation.
- This completes the **games subset** source-fidelity check, not the full 600 activities or 300 lessons. No Notion edits were made.
