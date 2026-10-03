# Codex handoff — questionnaire execution plan and first implementation
Date: 2026-10-03
Owner: Codex
Baseline: main 3ce07edcff2c64292b95e3060b363b3e1ca0174d
Branch: codex/questionnaire-action-plan-2026-10-03 (published in draft PR #25)
Status: GitHub access restored; Issues #13–#24 published; draft PR #25 published; final CI/review pending.

## Changes
- Unified old work plan, actual pending Claude work and Q39–Q50 decisions in docs/ACTION_PLAN_2026-10-03.md.
- Added actual-stack AGENTS.md/COLLABORATION.md, exact replacement Issue #13–#18 bodies and six new task specifications, plus a short field-pilot checklist.
- Added a read-only missing-fitness section to My Students using FT.progress.missing with the pupil's stable cid, explicit basis/no-class/unavailable states, duplicate-name isolation and existing best/history intact.
- Corrected existing profile fitness-best/beep headings in all four translated languages. Apply the existing scoped DOM/term translation APIs when opening the profile; switching an open profile back to Hebrew preserves source labels.
- Test fixtures now seed once per tab/context rather than overwriting real saved state on reload. App-data clearing cannot cause fixture reinjection. Clear finished-test timeout timers.
- Fixed week/group fixtures to use the same deterministic school day in Node and browser; Saturday had selected a cell outside the Sunday-Friday timetable.

## File ownership
Codex touched hm-new.js pupil profile, hm-i18n.js eight profile keys per translated language, harness/new e2e suites, week/groups fixture dates, run.js registrations and generated output.
No edits to Claude's pending production source changes. Content imports remain paused.
Claude should continue practical timing/equipment in hm-lesson.js/hm-build.js after the pending-branch review, then packaging and the phased content/transfer work in the action plan.
Owner remains merge/deploy coordinator.

## Validation already completed
- npm test: 555/555 on the Codex candidate.
- New persistence + pupil-profile browser tests: 8/8 before the final profile label refinement.
- Against original harness: persistence regressions failed 2/3 (changed/cleared settings overwritten by seed); isolated new context still passed.
- Against original main application: the first pupil-profile regression failed because the missing list did not exist.
- After final label refinement: studentmissing + round3 + lang30: 25/25, including live language switching, narrow phone fit, zero, same-name pupils, class rename, no-class, grades, exports and native-language snapshot behavior.
- After weekday fixture correction: week + groups: 30/30. Three original broad-run failures were nonexistent Saturday cells, not a product timetable regression.
- Build regenerated; second build produces no changes. git diff --check passed.
- Visual inspection at 390px found the old mixed-language headings and led to the targeted fixes.
- Broad combined run: 509 passed, 3 failed out of 512. It began before the final profile-label refinement and loaded the original Saturday-dependent week/group fixtures. All three failures were those fixtures. The final profile suites passed 25/25 and corrected week/group suites passed 30/30. No Chromium crash was observed in this environment. A fresh full run on the final published commit remains a CI requirement before merge; a single uninterrupted 512/512 final-commit run is not claimed.
- Portable patch checked on a clean copy of baseline main; its staged tree exactly reproduced the candidate. Current remote main was refreshed and remained 3ce07ed.

## Pending Claude branch review — separate evidence
Inspected ccr-4ae97033-rci9j0 at 48156066644f229c1b7304507f30aff140530a8f.
- Its unmodified unit tests: 565/565.
- Its stage1 + stage2 + backup browser suites: 21/21 using the repaired harness in a temporary review worktree and removing stage1's snapshot-reinjection workaround. This explicitly tests actual app persistence.
- Review overlays were restored after testing. They are not part of the delivered patch.
- Review scope: rollback on a mid-restore write failure/successful restore, lesson/attendance/measurement/reload flow, equipment matching and allocation checks. Not a full pedagogical/content/native-device sign-off.
- Remaining timing coverage is 30/108 and minutes are draft; do not label the generator complete.
- Follow up: restore UI currently calls a rolled-back failure 'not enough space' even when storage is blocked for another reason; map the actual cause for a clearer message. No change was made in the overlapping pending source.
- No merge/deploy/store upload. A focused PR and broader pending-branch acceptance remain required.

## Limits
The new missing view shares the existing fitness API, historical-record policy and global fitness-index test selection. It is not a configurable per-class/per-period report-card completeness system; that is Gate 3.
Physical-device tests, APK upgrade preservation, Apple owner testing, native-speaker review and teacher validation of draft activity times remain open.
No pupil data was sent to a production service; all automated fixtures are synthetic.

## Publication update
The earlier GitHub 403 blocker was resolved on 2026-10-03 after the owner installed/configured repository access. The dedicated remote branch was created, existing Issues #13–#18 rewritten and #19–#24 created. CLI git push lacks credentials. The connector published source/docs; a temporary branch-scoped GitHub workflow generated outputs. Remote outputs were compared against the locally validated candidate and match exactly. The temporary workflow is removed from the final candidate.
Main remains 3ce07ed; no merge/deploy/store upload. Full CI remains required before owner merge.

## Next action
Draft PR: https://github.com/osher15/https-pe-ultimate.netlify.app/pull/25. Verify final CI, then owner reviews/merges. Claude reads the corrected plan and live Issues before taking reserved follow-up tasks.
Do not merge the old coordination branch's generic React/store templates.
