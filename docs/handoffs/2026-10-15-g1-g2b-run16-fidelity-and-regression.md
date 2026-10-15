# G1/G2b run 16 — source-fidelity continuation and published regression test

Date: 2026-10-15. Repository: `osher15/https-pe-ultimate.netlify.app`. Branch: `codex/g1-notion-export-pilot-20261014`.

## Baseline and scope
Read `docs/handoffs/2026-10-14-g1-en-complete.md`, run-13 verification, run-14 fidelity and run-15 lesson handoff. Existing remote manifests, 300 lesson exports, 600 activity exports and 30 diagram scenes were not recreated or overwritten. No Main, merge, deploy, Notion or app-code changes.

## Newly verified live Notion sources — 55/55 exact matches
For every item, fetched the current Notion page read-only and the exact GitHub export on the task branch; compared the complete `<content>` body to the Markdown body after trimming boundary whitespace, and compared `page_last_edited_at` to `source_last_edited_at`. No fetch errors or truncation flags in these 55 comparisons.

- Basketball lessons **BB-03 through BB-09** × **he/en/ar/ru/es**: **35/35** bodies and timestamps matched.
- Football lessons **FB-03 through FB-06** × **he/en/ar/ru/es**: **20/20** bodies and timestamps matched.

These are distinct from run-15 lesson sample (BB-02, FB-02, HB-02, VB-02, AT-02, FIT-02 in all five languages, plus ES BB-10). Full 900-page direct Notion fidelity is **not yet established**.

## Newly published regression guard
- Created `store-content/manifest/test/export-inventory.test.cjs` on this branch, commit **ac4504db98fb7901afe7740fb8c52d68931f9308**, message includes `[skip netlify]`.
- The test checks the exact 900 expected paths and metadata, 900 unique source IDs, section structure, 900 source body SHA-256 values against the published JSON manifests, and 901 CSV lines.
- Read the new file back from GitHub to verify publication. This test validates the local exports and manifests; it does **not** fetch Notion.

## Executed local checks
Using the user-provided full task-branch ZIP with the previously prepared and validated G2b/manifest patch overlaid:
- Official lesson checker: **300/300**, 0 issues.
- Official activity checker: **600/600**, 0 issues.
- Manifest test suite including the new regression: **6/6** passed (existing test plus previously prepared supplementary local tests; only the 2-case `export-inventory.test.cjs` is now published).
- Diagram unit suite: **70/70** passed.
- Official diagram validator: **30** scenes, **0** errors, **0** warnings.
- Manifest builder run twice: byte-identical results across `lessons.json`, `activities.json`, `manifest.csv`.
- Generated SHA256 values: lessons `482820ca32c8ad35c9be1e324eecd94b312da4a6e86fd91d2dd669f1ca34396b`; activities `25c030e4240bb332202d03bc71ac851c91eaa911fd30fd4d206ec95ed24f0d1e`; CSV `4d174bb0fb3675fb6ec0053ed1b395a3f223c5d8843dff8ed8d62f0562a215de`.

## Open
1. Direct Notion full-body checks for remaining, not-yet-compared lesson and activity pages. Prior 900/900 local inventory checks are not a substitute.
2. BB-05 Main A source ambiguity: three players and three cones, yet an empty cone is referenced. Draft diagrams cover unambiguous warm-up/Main B only; do not silently edit the source.
3. Claude's professional approval remains deferred by user.

No changes to Notion, application code, Main, merges or deployment.
