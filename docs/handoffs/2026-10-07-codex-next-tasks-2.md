# Task handoff — Codex next tasks, batch 2
Date: 2026-10-07
Owner: Claude writes; Codex executes.
Base: main 070c47e. Product state to audit: Claude timing branch `ccr-e68b66c8-44gzz9` at a8b4b23 (not merged), games PR #46 head 867ffb8 (not merged).
Task / priority / status: five read-only tasks after the first audit batch (`codex/audits-2026-10-07`, reviewed by Claude on 2026-10-07). Status: not started.

## What the first batch established (reviewed)
- Reported and accepted: Chromium missing (offline probe not run, no pass claimed); direct `git push` has no credential (publish through the connected GitHub API, one batch); PR #44 store-listing text (icons "future") contradicts the PR; PR #44 CI blocker is browser check #222 ("no class" mark vs cid, `click` on null), not product code of the audit branch.
- Open question for the owner: `v.t` comments say transitions are included, while the fitter adds transition/rest/water separately. Not asserted as double counting.
- Games: main has 42; PR #46 has 44; the owner mentioned 78. Nothing to add until the owner says which games are missing.

## Rules
Same as batch 1: docs, new tools, new tests only. Do not edit `hm-data.js`, `hm-lesson.js`, `hm-know.js`, `hm-build.js`, `hm-texts.js`, `hm-i18n.js`, generated files, timing tables, or any file on PR #44/#46 branches. One batched commit, no WIP pushes. Reserve exact files in Issue #18 (or in the handoff). Record exact commands/results; keep CI, emulation and physical-device evidence separate. English for new docs.

## Tasks (in order)
1. **Rerun the timing audit on the new model.** Use a git worktree of `ccr-e68b66c8-44gzz9` (a8b4b23). Changes to model: step ranges are 25% of t rounded to 0.5 min, max ±2 min each way (min band 1 for t<=3); round-based variants (name matches `REST_RX`) have an 8-min total floor unless their typical total is shorter; lesson lengths are 45/50/60/90 (no 30); the generator picks 1 main block when the main window is <=33 min, 2 when <=62, else 3, and splits the window evenly; warm-up <=12, cool-down <=8, game <=15. Extend `tools/timing-audit.js` (or a copy) so lengths are 45/50/60/90 and the block split is modelled; report per length: variants that cannot fit, share that fits exactly, free-play minutes. Claude's own quick check (not authoritative): per-block fit is best at 18-31 min (about 90/108 variants) and falls sharply at >=33 and <=16. Say whether you reproduce that.
2. **Transition semantics evidence.** Read-only: for all 108 variants list steps whose text itself mentions moving/rotating/rest/setup, versus steps that are pure activity, and show where `t` plus the separate overhead would double count if `t` already included transitions. Report as a table for the owner; do not change data.
3. **Dry-run integration of PR #46 with the timing branch.** In a scratch worktree, merge `origin/claude/game-tasks-variations-jgi3dt` into `ccr-e68b66c8-44gzz9` without committing. Known overlap: the timing branch also contains a duplicate game `adapt:{easy,hard}` implementation (hm-know.js, hm-texts.js, hm-terms.js, `.gm-lv`) that PR #46 supersedes. Report conflicting files and hunks, and which side to keep. Do not push the merge.
4. **Review PR #46 (read only).** `gm.mine` handling: HTML escaping of teacher text in the modal and in any export, quota/write-failure behavior, backup/restore inclusion and the preview label, 300/30 limits; the numerals-identical-across-languages test; Arabic/RTL layout risk; the quotation-mark DOM-translation root cause that forced a reword (found by i18n15 #480): explain why a string starting with ״ keeps Hebrew visible, as a finding only. Post findings as a PR review comment only if write access works; otherwise in the handoff.
5. **PR #44 blocker #222 diagnosis.** Reproduce or explain why `click` is called on null in the check "כרטיס תלמיד: הסימון «אין כיתה» מסכים עם cid בשני הכיוונים". Say whether it is a test race, a fixture issue or product behaviour. Propose a minimal test-only fix as a patch in a handoff; do not push to the #44 branch. Also list the exact lines in `docs/store-listing/STORE_LISTING_2026-10-05.md` that should change.

## Cannot do here
Browser runs while Chromium is missing: say so and do not claim a pass. If a workflow_dispatch CI run is the only way to get Chromium, record the request for the owner instead of editing workflows.

## Deliverables
`docs/TIMING_OVERRUN_AUDIT_2026-10-07-v2.md` (tool output), `docs/TIMING_TRANSITION_EVIDENCE_2026-10-07.md`, a handoff `docs/handoffs/2026-10-07-codex-audits-2.md` containing tasks 3-5. `npm test` and two builds with no generated diff, on each tree you touch.

Publication status: handoff only; nothing merged, deployed or uploaded.
