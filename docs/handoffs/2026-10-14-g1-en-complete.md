# G1 export handoff — updated 2026-10-15

## Scope and source of counts
Claude's 2026-10-14 review reports 300 lesson files (60 per language, he/en/ar/ru/es), 600 indexed activity pages, and 29 exported EN activities. These counts are from Claude's review, **not independently recounted against the full branch in this session**.

## Confirmed in this session
- The Spanish lesson `export/lessons/es/BB-10.md` is incorrectly sourced from football FB-10. The correct Notion page was fetched read-only: `3e0128d0-e217-8112-8b8e-f1f256820aa8`. An attempted replacement was blocked; the original file remains unchanged.
- `store-content/manifest/README.md` documents the existing front-matter keys and their correspondence with the brief.
- `store-content/manifest/check-lessons.cjs` added for all five languages; `check-activities.cjs` added for index comparisons; `build-manifest.cjs` added to generate JSON and CSV manifests from available source files.
- Scripts were committed to the task branch, but **have not been executed against a complete checkout**. Do not claim zero issues or complete manifests.

## Remaining, in priority order
1. Replace Spanish BB-10 from the correct Notion page; rerun lesson checker and resolve any findings.
2. Retrieve C2 diagrams from Claude's branch; apply R4 mechanical corrections and run validator with EN exports (zero errors and warnings required).
3. Finish 571 remaining activity exports from Notion, preserving full bodies and unique page IDs. Existing 29 EN exports lack the required `kind` metadata and may lack a body ID; reconcile the source format before declaring the activity checker passing.
4. Run manifest generator on a complete checkout and verify 300 lessons / 600 activities, body SHA-256 values and schema against the original G1 brief.
5. Basketball G2b only after T1 and T2 pass; wait for Claude review before football.
6. G3/G4 later, respecting trademark and fitness terminology restrictions.

## Constraints
No merge, deploy, app files or Notion edits. Include `[skip netlify]` on every new commit. Preserve raw source fidelity and distinguish checks executed from checks merely authored.

## Follow-up 2026-10-15
- Spanish BB-10 corrected from Notion, commit `62ae29ce60d14398ebd495e9fbe08c3182a7c8b6`.
- Activity checker Notion UUID normalization corrected, commit `fb21cf0a8fc3c7788b64aefecfb2c63935d1e6e8`.
- EN DR-021, DR-022, DR-023, DR-025, DR-026, DR-027 exported from their full Notion bodies in six separate branch commits. DR-024 was fetched but GitHub write blocked; retry later.
- These six new files have `kind: drill` and correct source metadata. Existing EN files may lack `kind` and explicit body IDs. Do not rewrite source bodies to satisfy metadata validation.
- No complete local checkout available (GitHub network DNS unavailable in container); full 300/600 validation and generated manifest remain unexecuted.
