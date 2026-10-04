# Codex handoff — period reports and offline Excel
Date: 2026-10-04. Issue #23. Base/prerequisite: PR #27 head 15c570f, following #25 and #26. Branch: codex/assessment-reports-excel-2026-10-04.

## Delivered
- Read-only period report from a real-class fitness coverage view or My Students profile. Reuse saved assessment.policies and existing grading periods; choose class and period. No new storage key, schema, grade fill, server or required account.
- Show configured date boundaries, each required test, best/date/unit, valid/invalid counts, measured/missing/exempt reason, optional suggested score and explicit scoring rule. Default summary and five-column quick table; full report details and measurement history are optional. A complete requirement set is not a final grade.
- Stable pupil/class IDs keep duplicate names separate. A pupil report filters both assessment rows and history to that pupil. This is a teacher report and downloaded file, not a student login, public roster link or access-control system.
- Missing and exempt best/score cells stay blank; legitimate zero repetitions stay numeric. Invalid values/dates and unidentified records cannot complete requirements and show a warning. Existing all-history fitness/missing views remain explicitly separate from this configured-period report.
- Both Excel (.xlsx) and CSV are generated from the same displayed snapshot. Excel has Assessment and History sheets, numeric cells, literal Unicode text, bold headers, frozen header row and filters. Both contain stable IDs and period/date basis; CSV also has a separate history download. No remote library/CDN dependency. No Excel import or editable grade-grid persistence in this slice.
- XLSX is a minimal ZIP/SpreadsheetML writer; text uses inlineStr, never formulas. CSV protects formula-like text while preserving numeric cells. The old unrelated CSV writer is unchanged. Format reference: https://learn.microsoft.com/en-us/office/open-xml/spreadsheet/structure-of-a-spreadsheetml-document
- Unsupported configuration prevents export; no-policy periods show configuration entry instead of invented completeness. Writer failure is visible and does not write data. All five UI languages and phone-width controls supported.
- Combined groups use individual real-class reports; no group-wide policy/report aggregation is invented. Existing manual/final grades and measurement history remain intact. Claude's builder/native/rollback files are outside this diff.

## Validation
- npm test: 597/597 (seven new report/XLSX/CSV tests).
- New registered report browser suite: 8/8, including actual offline downloads, pupil isolation, period switch, corruption, writer failure, invalid/unidentified records, existing entry points and five languages at 390px.
- Existing editor + pupil missing + class coverage suites: 28/28 on this source. Separate visual capture check: 1/1; desktop and Hebrew 390px screenshots inspected.
- Independent Python openpyxl 3.1.5 and zipfile opened actual browser-downloaded class/pupil workbooks without ZIP errors. Six class rows / three pupil rows; three class / two pupil history rows. Pupil IDs isolated. Class CSV rows equal XLSX rows, with blanks preserved. Independent sample confirmed Unicode, formula-like literal text, numeric zero, blank missing cells, RTL, frozen header and both sheet relationships. This is automated file-format evidence, not a physical Microsoft Excel/device acceptance claim.
- node build-standalone.js twice: SHA-256 hashes of Hamegrash.html, index.html and sw.js identical. git diff --check passed.
- Generated outputs built on GitHub matched the local source/build tree byte for byte. The temporary branch-scoped build workflow was removed after synchronization. Full exact-head GitHub CI is recorded in PR/Issue after publication. PR #27 prior exact-head test and native runs completed successfully; those results do not prove this new PR's native/device behavior.

## Integration / next
Review/merge #25 -> #26 -> #27 -> report PR, retargeting each stacked PR after its prerequisite lands. Owner controls merge/deploy; none performed here. Content imports remain paused.
Next bounded gaps: teacher editing of period exemptions, explicit final-grade/override workflow, actual editable desktop grid and separately reviewed pupil-file sharing/access flow. The generated pupil export is already isolated; it does not establish online access or authorization.
Owner reported installed Android works; Apple physical testing remains under Claude/owner #13. Browser mocks/simulator compilation remain distinct from device testing.
