# State of the project at the end of Claude's 2026-10-05 session

Read this first in a new conversation, then AGENTS.md, COLLABORATION.md, `docs/ACTION_PLAN_2026-10-03.md`. Never mark anything done from this file alone: check main, open PRs and Issues.

## On main (merged by the owner's standing instruction "merge when tests pass")
#35 field journeys fix, #36-#38 flexible timing and weather warm-up, backup verification code, games library, iOS input-zoom CSS guard, #39 manual-builder timing/equipment and Netlify preview skipping, #40 lesson bank (basketball, football), #41 four more sports + lazy loading + converter, #42 unsigned release-AAB job and release checklist.

## Open
- **PR #43** (branch ccr-3cbe9a9d-h2mvca, head after this commit): #21 item 7 (previous rating/note near Start), Codex R1 and R2 fixes, per-record editorial metadata, uniform regeneration of all six lesson-bank sports, Codex validator and review branches merged. Merge when CI is green; the CI unit job was cancelled by the runner twice on an earlier head, a new `Tests` run was dispatched on the branch.
- **PR #44** (another Claude session, draft): icons, package ID io.github.osher15.peultimate, store listing pack. Owner decision: the package ID is permanent after the first upload. A build with the new ID installs as a new app; migration is backup file then restore.
- Issues #13, #21, #22, #24 etc. carry the specs; their status text may lag this file.

## Waiting on the owner
Teacher review of `docs/TIMING_DRAFT_REVIEW.md` and `docs/ADAPTATIONS_DRAFT_REVIEW.md` (both stay "בטיפול", not closed); fixed-protocol decisions (Tabata, distance pyramid); target audience and age-rating answers for the stores; Apple/Google accounts after device tests; physical-device checks (see `docs/NATIVE_RELEASE_CHECKLIST.md` §5), including upgrade without uninstall and the iOS zoom guard; lesson-bank review by teachers and native speakers (all records are `reviewStatus: "draft"`).

## Claude's remaining work
#21: personal collections, personal edited copies, plan export/import without student records (each needs a short design note first), authored adaptations (after approval), nothing automatic. #13: store texts after the audience decision, screenshots after the device pass. #22: pairing transport only if the owner wants it (see `docs/DEVICE_TRANSFER_DESIGN.md` §4). #24: bank-to-editable-copy and class/date assignment through the existing planner flow; AT-05 timing decision. Per-step builder times are not modeled.

## Working notes
- Tests: `npm test` (689 unit), `node build-standalone.js` twice (no diff), `node tests/e2e/some.js <suites>`; a full local `run.js` dies in the browser at `stage2` test 1 (passes alone and in CI, cause unknown). Do not rebuild while a full run is using Hamegrash.html.
- Lesson-bank regeneration needs the owner's Notion export (not in the repo): `node tools/notion-lessons-import.js <export-dir> --write <sport>...`; `--stamp <sport>...` adds editorial metadata without the export.
- Netlify credits: previews are skipped by `netlify.toml`; each merge to main is one production deploy, so batch merges.
- Codex tasks: `docs/handoffs/2026-10-05-codex-next-tasks.md`.
