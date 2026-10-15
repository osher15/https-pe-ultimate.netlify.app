# Claude handoff — G1/G2b pre-merge review (2026-10-15)

**Owner request:** Please review this branch **before any merge or deploy**. Do not merge, deploy, change Main, edit Notion or application code without explicit owner approval. If committing review notes, use `[skip netlify]`.

Repository: `osher15/https-pe-ultimate.netlify.app`
Review branch: `codex/g1-notion-export-pilot-20261014`

## Read first
1. `AGENTS.md` and relevant collaboration instructions.
2. `docs/handoffs/2026-10-14-g1-en-complete.md` (early handoff; its original pending items have subsequent completion notes).
3. `docs/handoffs/2026-10-15-g1-g2b-900-source-fidelity-milestone.md` (latest consolidated coverage).
4. `docs/handoffs/2026-10-15-g1-g2b-run13-verification.md` and subsequent G1/G2b handoffs.
5. `store-content/manifest/README.md`, validators, generated manifests, `store-content/diagrams/placements.csv` and BB-05 scene files.

## Reported completed work — independently verify before approval
- 300 lesson Markdown exports, 600 activity Markdown exports (DR-001..080, GM-001..024, AC-001..016 across he/en/ar/ru/es), including formerly blocked DR-024 and DR-028 onward.
- Three manifests: `store-content/manifest/lessons.json`, `activities.json`, `manifest.csv`; 900 total rows, body SHA-256. Verify reproducibility and no unexpected source changes.
- Consolidated run16 milestone reports 900/900 distinct Notion source full-body/timestamp comparisons across multiple runs. Check coverage ledger/provenance as appropriate; avoid conflating source fidelity with professional correctness.
- Diagram suite: 30 basketball scenes, 70 unit tests passing, validator 0 errors / 0 warnings, 150 renders across five languages (as reported in prior handoffs). Review the actual diagrams visually.
- Earlier Spanish BB-10 source mix-up was corrected in commit `62ae29ce60d14398ebd495e9fbe08c3182a7c8b6`.

## Critical open professional question: BB-05
The lesson's Main A says three students form a triangle and use three cones, but also says a player fills an **empty cone**. Do not silently add a fourth cone or rewrite Notion source. BB-05-D1 and D2 are **drafts for the unambiguous warm-up and Main B**, not approval of Main A. Please recommend an exact pedagogical resolution, and mark whether owner approval/source correction is needed.

## Required review checklist
1. Compare branch vs Main with complete diff/tree rather than relying on GitHub's 300-path truncated comparison; identify any application code, config, workflow or unexpected modifications.
2. Inspect provenance, language coverage, metadata, unique Notion IDs, source/body hashes and index alignment; run the official lesson/activity validators and manifest tests.
3. Run diagram unit tests and validator; inspect scene positions, arrows, ball movement, labels, consistency with EN source; visually sample basketball diagrams including BB-05.
4. Review a meaningful multilingual sample for PE terminology, clarity, feasibility, safety and translation quality. Raw Notion match is **not** a language/teaching-quality audit.
5. Confirm Netlify deployment triggers before merge; `[skip netlify]` in individual commits does not guarantee a merge will skip deploy.
6. Give a clear **APPROVE / APPROVE WITH CONDITIONS / BLOCK** recommendation with blockers, exact file references and suggested fixes. Do not perform the merge.

## Expected output
Save a dated review report under `docs/handoffs/` on a separate review branch or this task branch only if coordination allows, with `[skip netlify]`; communicate go/no-go to owner. Avoid editing source exports or approving unresolved BB-05 Main A implicitly.
