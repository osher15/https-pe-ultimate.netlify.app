# Codex handoff — explicit teacher final grade
Date: 2026-10-04. Issue #23. Branch codex/final-grade-override-2026-10-04.
Base/prerequisite: draft PR #29 head 4af11a7, following #25 -> #26 -> #27 -> #28. Owner coordinates review/merge/deploy.

## Existing behavior and delivered gap
Weighted component-grade inputs and period selection already exist. gradeResult supplies calculated/provisional/final status to the grading table, CSV and class hub. There was no explicit teacher final-decision field; no aggregate assessment-target-to-component mapping exists.
- Add an explicit per-pupil final-grade editor from the existing final cell. Teacher enters 0–100 and an optional note (max 500). Store {value,note} in the existing pupil.grades[period].finalOverride; no new store or schema migration. Stable IDs distinguish duplicate names; period is shown before saving.
- gradeResult keeps current calculated value/status/completeness, component average and missing list while exposing the valid teacher decision as final. Zero is valid. Optional details show the calculated/provisional basis; the class hub counts a teacher final decision, without completing required fitness tests or filling components.
- Explicit reset removes only finalOverride and returns to the current weighted calculation. Component/attendance changes preserve the decision until the teacher changes/removes it. Other pupils/periods, raw measurements and component grades remain.
- Reject stale roster/class/period/weights/columns and ambiguous identities at save time. One fresh-roster atomic write plus read-back verification. Storage failure keeps the editable draft; dirty Cancel/Escape/Back use the existing confirmation. Invalid restored decisions are ignored visibly and can be explicitly removed; damaged grading containers are not replaced by this editor.
- Grading Excel (.xlsx, Grades sheet) and existing CSV use the same rows: final decision/status, calculated value/status, missing components, optional note, stable ID and period. Existing CSV grade formatting is preserved. Excel grades are numeric, empty grades blank, formula-like notes literal; CSV free text is formula-protected. The existing assessment workbook remains a separate read-only measurement/suggestion report.
- Existing full backup and native mirror carry nested grade decisions. Five languages and narrow-phone layout; reuse existing field styles and XLSX writer. No native/builder/restore-rollback implementation changed.

## Validation
- npm test: 601/601 including four new gradeResult tests (provisional basis/immutability, legitimate zero/reset, malformed restored decisions, changed component basis).
- Registered new browser suite: 9/9. Covers save/reload, component/history/other-pupil/period preservation, hub consistency, reset, invalid/empty values, dirty Escape/Back cancellation, actual localStorage quota failure, stale grade/class/ID/period/weights, corrupt restored state, actual Excel/CSV downloads, full backup restore and simulated iOS native mirror, five languages/390px.
- Existing attendance-grade suite 7/7, audit29 12/12 and period-report/Excel suite 8/8 passed in related runs. CSV regression initially found an incompatible number-vs-formatted-string change; restored the original CSV format while keeping XLSX cells numeric, then reran audit29 (12/12) and new suite (9/9) successfully.
- Final styling checks: 3 selected new cases plus a screenshot check 4/4. Additional desktop/phone Back-cancellation visual check 1/1; screenshots inspected. Desktop/phone simulation is not device acceptance.
- Independently opened actual /tmp/pe-final-grade.xlsx and CSV with openpyxl/zipfile/csv: numeric final 86 and calculated 62; missing pupil blank; '=Teacher note' literal string in XLSX and protected in CSV; stable ID/period and real-class export isolation; ZIP valid.
- node build-standalone.js repeated: Hamegrash.html/index.html/sw.js hashes identical; git diff --check passed. Exact-head full GitHub CI recorded in PR/Issue. Prior #29 Tests run 149 and Native builds run 13 passed; these are prior-feature evidence.

## Next / limits
Review/merge #25 -> #26 -> #27 -> #28 -> #29 -> this focused PR; retarget after each prerequisite. No merge, live deployment, store submission or communications to Claude performed. Claude review pending.
An assessment-target score is not automatically a weighted final grade. A future explicit suggestion-import action needs reviewed exam-column mapping and aggregation/exemption rules; do not invent an average or overwrite a manual component. Assessment measurement-grid editing and Excel import remain separate gaps; existing component-grade desktop inputs already work.
Claude retains lesson-builder/native packaging/restore rollback. Android was reported working by owner; new artifact upgrade and physical Apple acceptance remain owner/Claude work (#13). Content imports remain paused.
