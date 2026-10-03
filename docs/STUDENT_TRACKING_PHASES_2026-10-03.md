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

## Phase 1 — implemented, pure and not activated
Files: assessment-data.js and tests/unit/assessmentrequirements.test.js. The module depends on existing HMDATA. It does not access DOM, storage, a server or native APIs. It is deliberately outside the app boot/build list until the UI and persistence flow are reviewed. A standalone module avoids editing shared hm-data.js while Claude's pending branch remains unmerged.

Input is an in-memory policy: cid, period, from, to, tests, optional exemptions. This is an API contract, not an installed storage key or migration.

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

## Phase 2 — configuration and safe persistence (next Codex slice)
Reserve bounded sections in hm-tests.js/hm-new.js plus translation keys and build registration. Reconcile PR #25 and Claude's pending branch before integrating shared files.
1. Reuse current class and period selectors, plus grades.periodRanges. Decide whether dates remain a live shared reference or a snapshot; changes must be explicit. Rename/delete period must update requirements transactionally or stop with a recoverable error.
2. Editor chooses required tests and optional targets/step/points/rounding/bounds. Preview concrete examples before save. Do not silently treat ft.idxTests as saved teacher requirements.
3. Store reviewed versioned configuration keyed by stable cid + existing period, with validated import and rollback on failed writes. Choose the actual key only in this phase after checking backup/native snapshot allowlists. Never rename or mutate measurements/manual grades to save configuration.
4. Handle missing policy, class/period rename/delete, backup/restore, quota/blocked storage, cleared data and older backups. Preserve draft edits on failure; tell the teacher whether saving succeeded.
5. All five languages; English new-install default; existing language preserved; narrow phone and PC layout.

## Phase 3 — report and export (next focused Codex slice)
Show chosen period/date basis, required tests, best/date/history, missing reason and explicit exemptions in pupil and class views. Default quick view; details optional. Show unresolved/invalid-data warnings without identifying records by display name.
Extend existing CSV using the same calculation output as the screen. Include basis, raw best/unit/date, measured/missing/exempt status and suggested score separately. Missing/exempt values are blank, not zero. Preserve stable identities and escape spreadsheet formula-like text. Combined classes retain each member's policy. Automatic grade fill is separate and always preserves manual overrides unless explicitly changed by the teacher.

## Phase 4 — field/Apple validation
Owner reported existing installed Android working on 2026-10-03. This report does not identify the APK commit or prove an upgrade test/new feature build. Apple/iOS physical testing remains open under #13 (Claude packaging, owner Mac/devices). A successful unsigned simulator build is recorded separately.
Use the existing short pilot checklist: start, attendance, measurement, reload, pupil missing view, grade/export, recovery. Day attendance exemptions and personal pupil export need their own reviewed semantics/access flow; no account/authentication is assumed.

## Phase 1 evidence and limits
32 assessment-specific tests passed; complete stacked-branch unit suite 587/587 passed. Browser export contract checked in Node VM with the real HMDATA dependency. Build repeated and generated Hamegrash.html/index.html/sw.js remain byte-identical to PR #25. No app UI or native code changed, so prior UI/device tests are not claimed as testing an activated assessment feature.
Content imports remain held. No merge, production deployment, store upload or communications to Claude performed.
