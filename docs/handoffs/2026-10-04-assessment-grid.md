# Codex handoff — dated measurement grid
2026-10-04. Issue #23. Branch codex/assessment-grid-2026-10-04.
Prerequisite: draft PR #30 head 78f823d; series #25 -> #26 -> #27 -> #28 -> #29 -> #30. Owner reviews/merges/deploys.

## Delivered gap
Existing component-grade desktop inputs already work. Existing fitness save/ingest flows are today-oriented and can reconcile by name; the new period grid explicitly uses stable IDs and a selected measurement date.
- Class or single-pupil period report opens a blank new-attempt grid. Required test units and current period best provide context. Select a date within the saved period and save filled cells together. Blank/exempt cells add no records.
- Pure append validation and one ft.results write retain all history and every manual component/final grade. Existing record shape, class/pupil IDs, measurement date, creation timestamp and current norm version are retained. sessionId is null: a backdated entry is not assigned to an unrelated live lesson. No new store/schema, automatic grading, imported rows or old-attempt replacement.
- Reject stale students/results/policies/classes/norms, moved or globally ambiguous identities, damaged outer data, duplicate IDs/cells, invalid dates, negative values, zero times, fractional repetitions and overprecision. Real zero repetitions are accepted. Exempt cells are disabled with the actual reason. Failed storage retains draft; dirty Escape, browser Back and Close ask before discarding.
- Reports and existing offline Excel/CSV use the new history immediately. Five languages, contained table scrolling and phone/desktop layouts.

## Validation
608/608 unit tests, including 7 new append-validation cases. New grid browser suite 9/9 and existing report/Excel suite 8/8 (17 total). Covers reload, zero/bounds, atomic invalid batches, actual localStorage quota failure and retry, external changes/moved/duplicate IDs, exemptions, dirty navigation, single-pupil isolation, corrupt data, full backup restore and simulated Android mirror, five languages and 390px/1280px.
Initial Back test called goBack on the home screen without navigation history; replaced with the actual popstate event used by browser/device Back. Product confirmation handler needed no change.
Independently opened actual downloaded XLSX with openpyxl and zipfile, plus CSV: Assessment retains a's previous best 35 and counts both attempts; b's zero is numeric with suggestion 60; time 9.25 and dates/IDs are correct; History contains all four attempts. Missing scores remain blank. Screenshots inspected at phone/desktop widths. Native mirror simulation is not physical device acceptance.
Build and generated-output synchronization evidence recorded below; exact-head full GitHub CI is reported in the PR/Issue. Prior #30 Tests 155 and Native 15 passed.

## Ownership and next work
Owner retargets/reviews the sequential PR series; no merge, deployment or store upload performed. Claude keeps native packaging/lesson builder/general restore rollback. Existing Android was owner-reported working; Apple physical acceptance remains #13. Content imports stay paused. Excel import/paste and reviewed assessment-to-component mapping remain separate work, with explicit mapping and preservation of manual grades required.
