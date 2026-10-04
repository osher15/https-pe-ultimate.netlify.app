# Backup restore rollback review — 2026-10-04

Base: draft #33, exact remote head 8d667b35c5ee8c1f17f9bd79290bda8126a005af. Main remains 3ce07ed. Dedicated branch codex/backup-restore-review-2026-10-04. Reservation recorded in Issue #23. No merge, deployment or store upload.

## Result and provenance

This is the focused Gate 0/1 review of Claude's rollback proposal in ccr-4ae97033-rci9j0 at 4815606. Claude authored the capture/rollback idea. Codex reviewed that hunk and implements a stronger bounded integration; none of its timing, equipment, privacy or native changes are copied. The new helper supersedes that branch's bkApply rollback hunk; do not subsequently apply the old hunk over this implementation.

The old restore cleared current keys while ignoring delete failures, then continued after write failures and imported media. Claude's proposal captured previous values but swallowed read/delete errors and counted only rollback write exceptions, potentially reporting restoration while extra incoming keys remained. Its preview closed before the retry branch.

The integration validates the backup and existing assessment envelope before mutation; captures every eligible raw value with strict enumeration/read checks; writes changed values before deleting obsolete keys; verifies each operation and the full replacement. Failure attempts all affected-key reversals and verifies the complete previous namespace. Only verified rollback is reported as complete. Device-only bk.last/up.seen and unrelated keys are preserved. Unchanged values are not rewritten. A first-write quota failure leaves previous data intact.

Failed local-data replacement does not import media or run migration. The preview remains open, retry is enabled and no reload is scheduled. Both complete and incomplete rollback offer an offline recovery download from the original in-memory snapshot, explicitly without videos. Incomplete rollback is visibly identified. New controls/messages have English, Hebrew, Arabic, Russian and Spanish text.

## Validation

- npm test: 633/633 passed, including 11 new replacement/read/delete/write/silent-backend/quota/permanent-rollback/unusual-key cases.
- node build-standalone.js; repeat-build SHA-256 comparison and git diff --check passed.
- Focused browser validation: 47/47 passed (7 new rollback + 10 existing backup/encryption/legacy/media + 7 storage + 14 assessment editor + 9 final override). Actual recovery download was parsed and compared to the pre-restore raw snapshot; the failed preview stayed open without reload, and retry succeeded.
- Simulated iOS mirror rollback is included; physical Apple testing remains Issue #13. Owner previously reported installed Android works.
- GitHub branch-generated outputs matched the complete local tree. Temporary branch build helper removed before PR; full exact-head CI pending PR creation. #33 Tests 167 and Native 18 both completed successfully.

## Limits and handoff

localStorage offers no cross-window transaction or crash recovery. The rollback protects observed synchronous failures; it cannot guarantee atomicity across another window's writes, a process crash or a permanently unusable backend. In-memory recovery is lost if the page closes before download. Replacement writes before deletion may require more available space than clear-first restore, intentionally preserving current data on quota failure.

IndexedDB media retains its existing insert/update semantics after local-data success and is not part of one cross-store transaction. Existing legacy migration runs afterwards. Those paths are covered by existing regressions; this PR does not claim transactional media or migration. Recovery copy uses the existing unencrypted JSON export and includes the teacher's previous data; no external sending is performed.

Review/merge sequentially after #25–#33; retarget after dependencies land. A fresh Claude review is unavailable in this session. Claude continues builder/native work; content-bank imports remain held. Owner handles integration and physical iOS acceptance.
