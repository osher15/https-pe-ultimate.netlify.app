# G1/G2b continuation — 2026-10-15

## Verified by execution in this continuation
- GitHub recursive tree contained **600** `store-content/export/activities/<lang>/<id>.md` files, with the source index covering 120 IDs per language (EN/HE/AR/RU/ES); no missing indexed paths. **This is a path-existence check, not a content or metadata validation.**
- The latest activity-export commit before G2b was `088219bd3c6e904efc5765cb92d23429b918408a`.
- The Node 22 runtime is present locally, but `git ls-remote` to GitHub failed with `Could not resolve host: github.com`; a full checkout and `check-activities.cjs` / `build-manifest.cjs` / diagram validator / gallery were **not executed** in this run.
- G2b draft BB-01-D1 and BB-01-D2 plus placements were committed as `083bc3388ac3fc52e8b1259c2013ca8f01ee6e62`. Both scenes are anchored to exact English BB-01 source passages and contain five-language titles and alt text. They still need CLI validation and visual inspection; no acceptance is claimed.

## Checks executed earlier by Claude (reported in supplied 2026-10-15 task note, not rerun here)
- Lessons: 300/300, 0 issues.
- At that older checkpoint, activities: 124/600 found, 503 issues (476 missing, 20 kind mismatches, 7 wrong-source files).
- Pilot G2a R4: 12 scenes, 0 errors, 0 warnings; accepted.

## Next tasks, in order
1. Run `node store-content/manifest/check-activities.cjs` on a full checkout of this branch; save exact JSON including first ten issues. Fix remaining `kind`/ID/source mismatches **front matter only** when appropriate; preserve body bytes.
2. Run `node store-content/manifest/check-lessons.cjs`, `node store-content/manifest/build-manifest.cjs` twice; verify deterministic bytes, commit `lessons.json`, `activities.json`, `manifest.csv` with `[skip netlify]`.
3. Run `node store-content/diagrams/validate.js store-content/diagrams/scenes --placements store-content/diagrams/placements.csv --en-export store-content/export/lessons/en`; inspect BB-01 render via gallery and fix issues before claiming a pass.
4. Continue BB-02..BB-10 (BB-09 already accepted), 2–3 scenes per family or documented exception. Stop after basketball for Claude review.

## Boundaries
No merge, deploy, Main edits, Notion edits, or app-code changes. Every commit includes `[skip netlify]`. Do not conflate authored checkers with executed tests.
