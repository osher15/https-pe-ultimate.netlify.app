# Student assessment requirements — phased implementation
Date: 2026-10-03. Issue: #23. Owner: Codex. Claude reviews integration.
Phase 1 branch: codex/assessment-foundation-2026-10-03, stacked on PR #25 head 0bc2c85.
This branch depends on draft PR #25. Review/merge #25 first, then retarget this PR to main; its focused diff contains only four assessment files. No PR is auto-merged.

## Existing behavior audited
| Area | Current path | Consequence |
|---|---|---|
| Pupil/class identity | HMDATA.studentKey, cidOfStudent, rowInClass | Reuse stable IDs; names are labels |
| Measurements and best/history | ft.results; HMDATA.progress/measurementsOf | Preserve original records; validity depends on direction |
| Required tests today | ft.idxTests; missingTests/classCoverage | Global index selection and tests already measured are not teacher requirements per period |
| Assessment periods | grades.periods; grades.periodRanges in hm-new.js | Existing labels/date ranges need reuse, not another period picker model |
| Manual grades | stu.list[].grades; gradeResult, attendance fill | Never overwrite as a side effect of viewing or calculating |
| Existing exports | Fitness and grading CSV, student reports | Extend existing exports after screen/report semantics agree |
| Combined classes | HMDATA group/student scope helpers | Select each pupil's real-class policy, not a group-wide replacement |

## Phase 1 — calculation foundation (PR #26)
Phase 1 files were assessment-data.js and tests/unit/assessmentrequirements.test.js. Phase 2 renames/registers the module as hm-assessment-data.js and adds hm-assessment.js. The module depends on existing HMDATA. It does not access DOM, storage, a server or native APIs. It was outside the app boot/build list in PR #26; the editor PR registers it for configuration. Period-aware reports are the next phase. A standalone module avoids editing shared hm-data.js while Claude's pending branch remains unmerged.

Input is an in-memory policy: cid, period, from, to, tests, optional exemptions. Phase 2 persists policies in assessment.policies as {version:1, policies:[...]}; no global schema migration.

```js
const policy = {
  cid: "c:ט:3", period: "Q1", from: "2026-09-01", to: "2026-12-31",
  tests: [{ id: "push", rule: {
    target: 40, step: 5, points: 5,
    rounding: "ceil", min: 0, max: 100
  }}],
  exemptions: []
};
```

Public API: validDate(date), validatePolicy(policy, catalog, optionalReadStore), score(value, direction, rule), studentAssessment(rows, student, policy, catalog, optionalReadStore). The read store is the existing `{get(key, fallback)}` adapter, not a plain class map. Browser loading, when activated, must occur after hm-data.js.

- Period dates are real ISO calendar dates with inclusive boundaries. Missing/invalid dates cannot complete a dated requirement; invalidDateRows exposes their count for the pupil.
- Required tests come only from the chosen policy, not tests another pupil happened to take.
- Results must belong to this real class and this stable pupil ID. Name-only legacy rows remain untouched and produce an unidentifiedRows warning count for the selected class/period; they are not automatically attributed. Resolve legacy identity through the existing reviewed reconciliation flow before assessment.
- Best and latest are separate; full in-period raw history is retained, including invalid results. Validity/scoring reuse existing HMDATA progress functions.
- Zero repetitions are measured. Zero run time is invalid. Missing is a status/reason, never a manufactured zero score.
- Optional rules produce suggestions only. At/above a high-direction target, or at/below a low-direction target, max is earned. A shortfall costs points per step. `ceil` charges each begun block, `floor` only complete blocks, `linear` fractional blocks. The teacher must choose; no rounding default. Clamp to explicit min/max; normally round to two decimals without crossing bounds.
- Example: 40 push-ups → 100, 35 → 95, 30 → 90, 0 → 60. With `ceil`, 39 → 95; with `floor`, 39 → 100; with `linear`, 39 → 99. This difference must be visible in the future editor.
- An exemption requires stable sid, test and a reason, applies to the whole selected policy period, retains history and produces no score. A single absent/exempt attendance day is not a whole-period exemption.
- A policy without rules still tracks completeness. Complete means required tests measured or explicitly exempt; it does not mean a final grade is ready. No aggregate/final grade is generated.
- Combined views call this API per pupil with that pupil's own class policy. Group IDs cannot own a replacement requirement policy.
- Invalid policy returns errors without a misleading partial/complete result.

## Phase 2 — configuration and safe persistence (implemented in the editor PR)
See docs/handoffs/2026-10-03-assessment-editor.md for evidence and file reservations.
1. Reuse class/grade-period labels. Dates are explicit snapshots seeded from grades.periodRanges; changes do not affect attendance calculations. Period deletion is blocked until requirements are removed. Existing UI has no rename command.
2. Choose required tests and optional target/step/points/rounding/min/max. Preview concrete values before save; global ft.idxTests is not silently treated as saved requirements.
3. Versioned assessment.policies is saved with one validated atomic LS.set. Failed writes keep the draft open; a stale editor cannot overwrite an external change. Measurements and manual grades stay untouched.
4. Existing full backup/native mirror cover every namespaced key. Imported assessment configuration is validated at bkApply entry before any writes; corrupt/unsupported local envelopes are not overwritten. Older backups remain supported. Claude's pending general restore rollback work remains separate.
5. Five languages and narrow-phone/PC layouts. English new-install default and existing preferences are preserved. Closing or switching context asks before discarding unsaved changes through the existing in-app modal.

## Phase 3 — report and Excel/CSV export (implemented in the report PR)
Show chosen period/date basis, required tests, best/date/history, missing reason and explicit exemptions in pupil and class views. Default quick view; details optional. Show unresolved/invalid-data warnings without identifying records by display name.
The read-only report opens from class coverage or the pupil profile. Separate real-class policies remain explicit; combined groups do not acquire an invented shared policy. Export both actual offline Excel (.xlsx, Assessment and History sheets) and CSV from the exact visible snapshot. The new assessment CSV protects formula-like text; existing unrelated CSV exports are unchanged. Include basis, raw best/unit/date, measured/missing/exempt status and suggested score separately. Missing/exempt values are blank, not zero. Preserve stable identities and escape spreadsheet formula-like text. Choose each member's real class for combined-class reporting. Automatic grade fill is separate and always preserves manual overrides unless explicitly changed by the teacher.

## Phase 4 — teacher period exemptions (implemented in the exemption PR)
Reuse the existing requirements editor and assessment.policies exemptions with stable pupil/test IDs and a required reason. Pupil report editing carries the class/period/pupil context; a nearby save action avoids scrolling through the entire catalogue. Whole-period exemptions are explicit and distinct from attendance-day exemptions. Multi-pupil drafts, discard/stale-window/quota protection and current class-membership validation preserve data. Saved unavailable-pupil entries remain until explicit removal; removing their required test first is blocked. Reports and Excel/CSV show the reason with blank scores and retained raw history. See docs/handoffs/2026-10-04-assessment-exemptions.md.

## Phase 5 — explicit teacher final grade (implemented in the override PR)
Existing weighted component grades remain editable and unchanged. The missing gap was an explicit final decision: store only {value,note} under the pupil's existing grades[period].finalOverride. A teacher selects a pupil and supplies a grade from 0 to 100; the note is optional. Calculated value, provisional status and missing components remain visible in optional details; setting a decision never completes tests or fills components. Reset explicitly removes the decision and restores current calculation.
The class hub counts an explicit teacher decision as a final grade, including zero. Invalid restored decisions are visibly ignored and can be explicitly corrected/removed. Save checks stable identity, fresh roster, class/period, grade weights and columns, and preserves the open draft on storage failure or stale context. Grades Excel and CSV use the same rows, with separate decision/calculation/status/missing/note/ID/period columns. Full backup and the existing native mirror retain the nested decision. See docs/handoffs/2026-10-04-final-grade-override.md.
No aggregate fitness-test suggestion is invented or automatically copied into weighted grading. A separate, reviewed teacher action would need explicit mapping/averaging rules. Editable component-grade desktop inputs already exist; phases 6–7 add new measurement entry and Excel paste. File import remains separate work.

## Phase 6 — dated desktop measurement grid (implemented in the grid PR)
Open a class or pupil period report and choose the measurement grid. Select a date within the saved period; enter only new attempts in blank cells. One validated append preserves every old attempt and all component/final grades. Stable pupil IDs distinguish duplicate names; whole-period exempt cells are disabled. Zero repetitions are valid, zero times and fractional counts are rejected. Stale context, damaged outer data or failed storage retain the draft without replacing history. Reports and both Excel/CSV immediately use the updated history. No import, old-attempt replacement, grade mapping or new data store is introduced. See docs/handoffs/2026-10-04-assessment-grid.md.

## Phase 7 — Excel template and paste preview (implemented in the paste PR)
Download an offline .xlsx template for the selected class/pupil and required tests. Measurements contains exact text sid, reference names and blank new-result cells; Context, Tests and Exemptions sheets explain the selected policy, units and exceptions. Copy the Measurements cells including the header from Excel and paste into the grid. This is tab-separated cell paste, not an arbitrary .xlsx/CSV file reader.
Validate the whole table by exact stable pupil IDs and selected test IDs. Reordered columns/rows and decimal comma are supported; duplicate/unknown IDs, formulae, thousands grouping, excess precision, invalid measurements and exempt cells are rejected before draft changes. Preview shows current/new values and explicit class/period/date. Apply only fills the draft; blank cells preserve existing draft values and replacing a draft value asks first. Final Save uses the grid's existing append/freshness/quota checks. Unapplied paste cannot be silently discarded by Save. No component/final grade mapping or persistent new store. See docs/handoffs/2026-10-04-assessment-excel-paste.md.

## Phase 8 — teacher-reviewed personal progress report (implemented in the print PR)
From the class period report, explicitly select a pupil; from a pupil report, retain that pupil only. Review an isolated preview before print/save-as-PDF or offline HTML download. Include required tests, period/date basis, best values and missing/exempt statuses. History is optional. Missing/exempt values remain blank; zero repetitions stay measured. The output omits all other pupils, grades, teacher notes and exemption reasons.
A stale snapshot or globally ambiguous stable pupil ID blocks output. No storage writes, public link, login or external sending is introduced. The teacher hands over the selected local document; this is not a student account or access-control system. HTML is escaped and script-free with a restrictive CSP; the preview is sandboxed. Print availability on physical/native devices is separate from browser validation. See docs/handoffs/2026-10-04-pupil-progress-print.md.

## Phase 9 — field/Apple validation
Owner reported existing installed Android working on 2026-10-03. This report does not identify the APK commit or prove an upgrade test/new feature build. Apple/iOS physical testing remains open under #13 (Claude packaging, owner Mac/devices). A successful unsigned simulator build is recorded separately.
Use the existing short pilot checklist: start, attendance, measurement, reload, pupil missing view, grade/export, recovery. Day attendance exemptions and any future pupil login/public sharing need their own reviewed semantics/access flow; no account/authentication is assumed.

## Phase 1 evidence and limits
32 assessment-specific tests passed; complete stacked-branch unit suite 587/587 passed. Browser export contract checked in Node VM with the real HMDATA dependency. Build repeated and generated Hamegrash.html/index.html/sw.js remain byte-identical to PR #25. No app UI or native code changed, so prior UI/device tests are not claimed as testing an activated assessment feature.
Content imports remain held. No merge, production deployment, store upload or communications to Claude performed.
