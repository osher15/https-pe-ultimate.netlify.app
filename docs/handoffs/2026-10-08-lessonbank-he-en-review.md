# Task handoff
Date: 2026-10-08
Owner: Claude
Base commit: 348c1ab (main)
Branch / PR: ccr-e149e84d-s1sw05 (PR for owner merge; not merged or deployed by Claude)
Task / priority / status: #24 lesson bank — replace the Hebrew and English text of all 60 lessons with the reviewed edition / owner request 2026-10-08 / tested, in review
Reserved files/sections: hm-lessonbank-*.js (he and en arrays only), hm-lessonbank.js (meta.provenance only), generated index.html / sw.js / Hamegrash.html, this handoff. No GitHub Issue reservation was posted from this session (no Issue write was attempted); the reservation is recorded here.

## Changes and user behavior
- The owner reviewed the Hebrew pedagogy and approved a detail-level language/terminology pass (Hebrew and English), plus eight content decisions:
  1. FIT-03 uniform timing (partner gives one brief comment during each recovery); 2. FIT-05 uniform 30 s / 30 s organisation; 3. FIT-10 scoring: up to 5 points per round, one per component; 4. VB-03: the serve is the one contact nobody can interfere with (no block), not a "free point"; 5. "all five measures" in assessment wording; 6. BB-07: two steps after the gather are taught, with a rules note that FIBA allows a zero step; 7. FB-08: the defender recovers to the central gate; 8. BB-04 Main B: rebound-specific teaching points and errors.
- Sport-specific terms were unified (e.g. football קבלה instead of קליטה, אפודות for bibs, סיבולת, מסירת אמות / משטח האמות, שמירה על הכדור; English British spelling and "N%").
- All 120 he/en lesson objects in `hm-lessonbank-<sport>.js` were rewritten from the reviewed text. Kept unchanged: `n`, `ageRange`, `duration`, `bankLink` (16), `systemData` (17), `selfQualityCheck` (20), and every ar/ru/es array (checked: 18/18 language arrays byte-identical in JSON).
- Per-lesson metadata: he and en `contentVersion: "V2.1"`; he `reviewStatus: "teacher-reviewed"` (the owner, a PE teacher, reviewed and approved the Hebrew), en stays `draft` (no native-speaker review). `meta.provenance.reviewStatus` stays `draft`, so the app's draft banner is unchanged.
- Conversion was done by a one-off script outside the repo (the reviewed text lives in Markdown files, not in a Notion export): it keeps the app's line layout (a line break wherever the previous text started a line), the importer's `; `-list splitting and typographic quotes. No markdown artefacts remain (checked for `*`, `#`, `\`, double spaces, blank lines).

## Validation commands and results
- Round trip: rewriting the committed data with no changes gives no diff.
- `npm test`: 700 pass, 0 fail.
- `node build-standalone.js` twice: Hamegrash.html, index.html and sw.js identical on the second run.
- `node tests/e2e/run.js` (full suite): see the PR description. Focused rerun of lessonbank, lang30 and i18n15: 32/32 pass.

## CI / emulation / physical-device evidence
Local headless Chromium only. No physical device check.

## Unresolved issues and dependencies
- English is not native-reviewed; reviewStatus stays draft.
- Some English sections now carry line breaks per label where the old data had one long line; this is the reviewed layout.
- The Notion pages were updated with the same text in a separate step (see the PR description for the result); ar/ru/es pages were not touched.

## Publication status
Branch pushed; PR open for the owner. Not merged, not deployed.

## Next owner / next action
Owner: review and merge. Codex: optional review of the data diff (he/en only).
