# Codex handoff — assessment configuration editor
Date: 2026-10-03. Issue #23. Branch codex/assessment-editor-2026-10-03.
Base/prerequisite: PR #26 head 0f1e6f5; PR #25 precedes it. No production merge.

## Implemented
- Open from grading or the real-class fitness coverage view. Combined groups select individual real-class requirements through grading; no group policy is invented.
- Reuse existing grade-period labels, seed dates from grades.periodRanges and save an explicit snapshot. Changing attendance dates does not silently change requirements.
- Choose required tests and optional target/step/points/rounding/min/max. Preview uses the same pure calculation as later reports. No grade writes.
- One versioned assessment.policies envelope, with complete validation before atomic LS.set. Preserve other class/period policies. Failures keep the editable draft; stale windows cannot overwrite a changed envelope.
- Period deletion is blocked while requirements exist. Remove requirements first through the editor; this removal leaves measurements and manual grades unchanged. Existing UI has no period-rename command; labels are reused rather than adding a second period model.
- Full backup and native data mirror already include every namespaced key. New bkApply entry validation rejects malformed/unsupported assessment configuration and missing period references before any existing restore writes. Claude's pending rollback implementation remains separate; this guard must be carried into its future integration.
- Unsupported/corrupt saved envelopes cannot be silently replaced. Older backups without requirements remain supported. No new global data-schema migration.
- Five languages; English new-install default retained; narrow-phone layout. Browser asks use the existing in-app modal, including discard protection on Back/Escape/selector changes.
- Register renamed hm-assessment-data.js and new hm-assessment.js in page/build/SW. All generated files rebuilt. This activates configuration only; missing summaries/CSV still use their previous basis until the next focused report phase.

## Verification
- npm test: 590/590.
- New editor/backup import/quota/native mirror suite: 13/13; existing storage suite: 7/7 (20/20 together on final source), plus actual grading/coverage entry-button test 1/1. Final registered editor suite contains 14 cases.
- Earlier relevant suites: backup/profile/native 31/31 combined; editor/attendance-grade/round3 28/28 before final import guard. Do not combine these into a claim of one full run.
- Visual inspection at 390px found and corrected blank period labels: I18N.term returns null for already-English custom labels, so preserve the source label as fallback and explicit option value.
- Full GitHub CI remains a publication check; exact results belong in the PR/Issue.

## Next
Review/merge #25, then #26, then this focused editor PR in order. Next Codex slice connects the chosen requirements/period to pupil/class reports and CSV; missing/exempt values stay blank, and suggestions stay distinct from manual/final grades. Exemption editor and personal pupil export still need their own reviewed flows.
Owner reports installed Android working; Apple physical testing remains under Claude/owner task #13. No physical-device claim from browser native mocks. Content imports remain paused.
