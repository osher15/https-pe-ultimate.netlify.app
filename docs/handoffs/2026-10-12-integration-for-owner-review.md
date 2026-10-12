# Task handoff
Date: 2026-10-12
Owner: Claude
Base commit: main 348c1ab (PR #46)
Branch / PR: ccr-19865a92-bxv2bs / no PR opened (owner merges)
Task / priority / status: Integrate every pending, reviewed branch (Claude and Codex) into one reviewable branch, finish Claude's unfinished leftovers, verify. Status: integrated and verified (see results); awaiting owner review.
Reserved files/sections: none beyond the integration itself; no new product features were written. GitHub write access was not used for an Issue reservation; this file is the record.

## What the branch contains (in order)
1. `codex/full-suite-2026-10-11` (fast-forward): the ordered integration that Codex built and tested: collections + personal copies (Claude, 2026-10-07), timing step ranges and block count (Claude), PR #47 reviewed he/en lesson-bank text, A1 collection repaint fix, packaging-only split of PR #44 (new icons, package ID `io.github.osher15.peultimate`, store-listing pack), offline-lazy registration, `hm-collections.js` added to the SW precache (fixes the offline defect Codex found), Codex's full-suite evidence under `docs/reviews/full-suite-2026-10-11/`.
2. Codex R-T1 source patch (`docs/patches/2026-10-11-timing-rt1.patch`): `HMDATA.automaticBlockCount` chooses 1-3 automatic main blocks from the available variant pool. Reviewed by reading the diff: only automatic splitting changes, explicit sub-topics unchanged, empty pool returns 1.
3. Claude leftovers cherry-picked from branches that never reached main: backup-preview label for `gm.mine` (claude/game-tasks-variations), meta description + favicon + long-cache headers (#45, branch ccr-a2b04eee). `index.html` is a shared source file, so the two `<head>` lines were re-added by hand; generated outputs were rebuilt, never copied.
4. `netlify.toml`: removed the `[context.deploy-preview]` / `[context.branch-deploy]` "ignore = exit 0" blocks that were there to save Netlify credits. The owner bought credits, so branch and PR previews can build again. Re-add the blocks if credit use becomes a problem.
5. Volleyball Hebrew: "מסירה עילית" -> "מסירה עליונה", "מגע עילי" -> "מגע עליון" (owner terminology decision from 2026-10-08, applied mechanically; Hebrew arrays only).
6. Docs/prototypes only from Codex branches: standalone scoreboard + coach board (`prototypes/pe-boards/`, not connected to the app), storage/participation specs, activity-bank audits and evidence, A1-A4 self-review and owner merge order, candidate-integration notes, report action plan, safe review.

## NOT integrated (needs an owner decision)
- `ccr-2c03659c-pv87t4` (lesson-bank objectives with a "The student can..." lead-in in all 5 languages, plus Hebrew catch terminology: תפיסה / קבלת מסירה / השתלטות על הכדור, "תפיסה רכה" instead of "ידיים רכות"). It was written on main before PR #47 and edits the same objective lines that #47 rewrote: a trial merge gives 76 conflicting hunks in the six bank files. Resolving them by hand would silently choose between two owner-reviewed texts, so nothing was merged. Options: (a) keep #47 wording; (b) redo the lead-in on top of #47 text, sport by sport, with owner review; (c) apply only the term decisions. In the integrated text "קליטה" (66) and "ידיים רכות" (7) are still present.
- Lesson mode, class-lookup speed-up and demo-follows-language from draft PR #44 (`ccr-d9e82175-eul5wi`): the owner approved splitting only the packaging; these UI changes need their own branch from current main and regression run. Not started.
- `codex/pr44-triage`, `codex/audits*`, `codex/continuation-2026-10-06`, `codex/lessonbank-validation`: older review branches, behind main by 5-20 commits; their useful content is already covered by the full-suite branch. Not merged.
- Old Claude branches from September (`claude/zero-phase-program`, `ccr-a28d3aba`, `claude/handoff-review-guidance`, ...): 100+ commits behind main, superseded.

## Validation commands and results
- `npm test`: 718 / 718 pass, 0 fail.
- `node build-standalone.js` twice: `index.html`, `Hamegrash.html`, `sw.js` hashes identical.
- Browser: see "Browser results" below.

## Browser results
`node tests/review/run-chunked.cjs` in 3 shards (one fresh browser per suite, Chromium via Playwright, localhost, synthetic data): 67 entries (65 registered suites, the historical claude-review suite, and the offline/lazy probe): 651 checks passed, 0 failed, 0 not run. Not a CI run and not a phone test.

## CI / emulation / physical-device evidence
Local desktop Chromium only (Playwright, localhost, synthetic data). No GitHub Actions run on this head yet, no native compile, no phone/tablet check.

## Unresolved issues and dependencies
- Owner decisions above (lesson-bank wording route; lesson mode from #44).
- Teacher review of draft timings, game adaptation wording and medal thresholds (see `docs/OWNER_NEXT_STEPS_2026-10-07.md`).
- Package-ID change creates a separate app identity on devices; use encrypted backup -> restore (see `docs/NATIVE_RELEASE_CHECKLIST.md`).
- Open PRs #26-#33 and #35 are ancestral records of code already in main: close, do not merge. #47 and #44 are superseded by this branch for their integrated parts.

## Publication status
Pushed to the task branch only. No PR, merge, deploy or store upload.

## Next owner / next action
Owner: open the branch preview (or run locally), check the app, decide the items under "NOT integrated". Claude: act on those decisions; open a PR only if asked.
