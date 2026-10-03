# Codex handoff — assessment calculation foundation
Date: 2026-10-03. Issue #23. Branch codex/assessment-foundation-2026-10-03.
Base: PR #25 head 0bc2c85422d3126742e3c613b76ec48e37f04cde; main remains 3ce07ed.

Implemented: pure class/period requirement validation, stable-ID assessment, inclusive dates, best/latest/history, explicit exemptions, target scoring with chosen rounding/bounds. New assessment-data.js reuses HMDATA; no additional shared source/native/builder edits, no boot registration or storage writes. UI is not active.

Read docs/STUDENT_TRACKING_PHASES_2026-10-03.md for the actual existing paths, API contract, grading examples and bounded next steps. Phase 2 must review period rename/delete and backup/native snapshot coverage before selecting a configuration key. Do not bypass unresolved legacy identity by matching duplicate names.

Validation: node --test tests/unit/assessmentrequirements.test.js (32/32); npm test (587/587); node build-standalone.js with no generated diff; git diff --check. Browser export contract checked in Node VM, not presented as an end-to-end UI test. Final GitHub CI status belongs to the PR/Issue.

PR #25 remains unmerged and is the prerequisite; its complete 555 unit/512 browser tests and Android/iOS simulator builds passed previously. Owner now reports installed Android working; Apple physical-device testing remains pending. Reported Android version/commit and upgrade test unspecified.

Reserved work: Codex assessment module/tests/docs. Claude continues builders/native packaging under the existing action plan; coordinate future shared data/translation/test-runner edits. Owner remains merge/deploy coordinator. No production changes or import hold lifted.
