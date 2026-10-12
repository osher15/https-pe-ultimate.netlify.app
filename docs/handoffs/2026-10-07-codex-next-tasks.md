# Task handoff — Codex next tasks (2026-10-07)
Date: 2026-10-07
Owner: Claude writes the handoff; Codex executes.
Base commit: main 070c47e (PR #43 merged).
Branch / PR: work on a new dedicated branch `codex/audits-2026-10-07`, based on main. No PR for review-only output; no merge, no deploy.
Task / priority / status: two new audit tasks (A, B) + wrap-up of items already on `codex/continuation-2026-10-06` (C). Status: not started.

Read first: AGENTS.md, COLLABORATION.md, docs/ACTION_PLAN_2026-10-03.md, docs/handoffs/2026-10-05-codex-next-tasks.md, docs/handoffs/2026-10-06-codex-continuation.md (your own).

## Rules for this batch

- Docs, new tools and new tests only. Do **not** edit `hm-build.js`, `hm-lesson.js`, `hm-know.js`, `hm-lessonbank*.js`, `hm-texts.js`, `hm-data.js`, timing tables, or any generated file (`index.html`, `Hamegrash.html`, `sw.js`). Those are being edited by two other sessions (see "Parallel sessions").
- Reserve the exact new files in Issue #18 (or, without write access, in your handoff) before creating them. Do not claim a board change you did not make.
- One batched commit and push. No WIP pushes (Netlify credits).
- Findings are reports. The owner decides what is a problem; do not change data to "fix" a finding.
- Record exact commands and results. Keep CI, emulation and physical-device evidence separate. Never write a pass you did not observe.
- English for all new documentation and comments.

## Parallel sessions (do not collide)

1. **Games review (78 games).** The owner is approving, fixing and adding games. Branch `origin/claude/game-tasks-variations-jgi3dt` (2026-10-07) already adds easier/base/harder levels, tasks and medals, teacher variations, golden-cone dodgeball and hybrid strike-ball; it touches `hm-texts.js`, `hm-know.js`, `index.html`, `sw.js`, `tests/unit/gamesadapt.test.js`. It is not merged. Games data is `GAMES` in `hm-know.js`.
2. **Timing / exercise duration and overrun.** Entry points in `hm-data.js`: `wholeMinutes`, `spreadMinutes`, `variantFit`, `mainWindow`, `fitSteps`, `stepRanges`, `timeOpts`, `TIME_PACE`, `TIME_TRANS`; topics in `hm-lesson.js` (`TOPICS`). Review notes: `docs/TIMING_DRAFT_REVIEW.md`. All timing numbers stay draft until the owner reviews them.
3. Also open: Issue #45 (meta description, favicon, cache headers; branch `ccr-a2b04eee-q1dh9y`) and draft PR #44 (icons, package ID).

## Task A — timing overrun audit (new tool, read-only)

New file: `tools/timing-audit.js` (plus optional `tests/unit/timingaudit.test.js` that only checks the tool runs and its output shape). Load the app modules the way existing unit tests do (see `tests/unit/` for how `HMDATA`/topics are loaded); do not copy the data.

For every lesson variant (the 78/108 variants referenced in Issue #19) and for plan lengths 30, 45 and 60 minutes, and for the equipment/weather options that `timeOpts` exposes, report:
- recommended time vs allocated time vs fitted per-step minutes (distinguish the three; actual field duration is unknown, say so);
- whether the fitted total exceeds, equals or is below the allocated window; by how many minutes;
- whether the overrun is explained by explanations, transitions or rest (`TIME_TRANS`), or is unexplained;
- steps pinned at their minimum or maximum range, and variants whose minimum possible total already exceeds the window ("cannot fit");
- fractional, NaN, zero or negative inputs: confirm termination (R1 regression; use a child process with a timeout as in the existing test).

Output: a Markdown table `docs/TIMING_OVERRUN_AUDIT_2026-10-07.md` (variant, plan length, allocated, fitted, status exceed/ok/under/cannot-fit, explained?, note) and a summary count. Same style as `docs/TIMING_DRAFT_REVIEW.md`. State plainly that this is arithmetic on draft numbers, not pedagogical validation.

Acceptance: the tool is deterministic (run twice, identical output); no product file changed; the table covers every variant and every plan length, with a count that matches the number of variants in the data.

## Task B — games integrity audit (new tool, read-only)

New file: `tools/games-audit.js`. Read `GAMES` from `hm-know.js` without modifying it. Run it against **main** now, and rerun after the games branch is merged (record both counts if both are available; do not merge that branch yourself).

Report per game (id, name, category):
- missing or empty fields: duration, pupil count, equipment, safety note, goal, instructions, watch link;
- missing text in any of the five languages (he, en, ar, ru, es), using the app's existing language fallback rules as the definition of "missing";
- equipment names that do not map to the equipment catalog (`EQUIP_CHOICES`) or that conflict with `docs/GAMES_EQUIPMENT_REVIEW_2026-09-30.md`;
- duplicate or near-duplicate ids/names;
- `parseGameMeta` results that are empty or inconsistent with the visible text (the filters depend on it);
- the total count (the owner expects 78; report the real number and any difference).

Output: `docs/GAMES_AUDIT_2026-10-07.md`, a table of exceptions only (not 78 rows of OK) plus a summary. Group by what the owner will do: approve / fix / add. Do not rewrite game text.

Acceptance: deterministic output; exception count reproducible; no data edited; counts stated against the real total.

## Task C — wrap up the existing Codex branch

On `codex/continuation-2026-10-06` (commits a3736a9, 01628cc; not on main, no PR):
1. Run `node tests/review/offline-lazy.e2e.js` with Playwright/Chromium. If green on three repeated runs, register it in `tests/e2e/run.js`; if it fails, report a reproduction and do not edit `hm-lessonbank.js`/`hm-lesson.js`. Say plainly if it could not run.
2. Re-check your finding on PR #44: the store-listing draft says icons are future work while #44 replaces them. Report to the owner; do not push to #44.
3. Keep the three proposal documents (`TIMING_TEXT_PROPOSAL`, `DEVICE_ACCEPTANCE_SHEET`, `ISSUE_23_REMAINING_DESIGN`) marked "proposal, not approved / blank". Do not merge them into main; the owner decides.
4. `hm-plans.js` privacy edit (01628cc): it touches a Claude-visible data file. Confirm in one line that nothing but author/presenter header fields changed, then leave it for the owner to merge.

## Deliverables

- `tools/timing-audit.js`, `docs/TIMING_OVERRUN_AUDIT_2026-10-07.md`
- `tools/games-audit.js`, `docs/GAMES_AUDIT_2026-10-07.md`
- Result of Task C steps in a handoff: `docs/handoffs/2026-10-07-codex-audits.md` (use `docs/handoffs/TEMPLATE.md`).
- Run `npm test` and `node build-standalone.js` twice; confirm no diff in generated files (they must not change in this batch).

## Not yours

`hm-build.js`, `hm-lesson.js`, `hm-know.js`, `hm-lessonbank*.js`, `tools/notion-lessons-import.js`, native packaging, #21 remaining items, timing tables, adaptations. Component-bank import and payments stay on hold.

Unresolved issues and dependencies: Task B final numbers depend on whether the games branch is merged; the full local `run.js` browser flake (dies at the first `stage2` test) is still unexplained.
Publication status: handoff only; nothing merged, deployed or uploaded.
Next owner / next action: Codex executes A, B, C in that order; the owner reads the two audit tables and decides.
