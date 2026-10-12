# Task handoff — Codex audits
Date: 2026-10-07
Owner: Codex
Base commit: main 070c47ed7bde9c68904b4f1175cb53b6acab6c23
Branch: codex/audits-2026-10-07
Task / priority / status: A and B completed on main; C reviewed with browser execution blocked. No product changes, PR, merge or deploy. Direct git push lacks a username credential; use the connected GitHub API for the one batched publication.

## Instructions and reservation
Read AGENTS.md, COLLABORATION.md, ACTION_PLAN_2026-10-03, October 5/6 handoffs and the latest October 7 handoff at b14cbc1 on ccr-59f9e3d6-wvrg3u. Exact tools/reports/test/handoff reservation posted to Issue #18, comment 6045204685. One batched commit/push; read-only data review. Other sessions retain all product/timing/games files.

## Changes and findings
- Added read-only tools/audit-source.js, tools/timing-audit.js and tools/games-audit.js, two acceptance tests and both requested Markdown reports. Data is loaded from current app files, not copied fixtures.
- Timing: 108 actual variants; 34,992 combinations, covering 30/45/60 minutes, 3 paces, 3 transition choices, water on/off, 3 weather choices and optional game on/off. The readable table groups the 108 configurations per variant/length (324 rows); recommended/allocated/fitted range and standard steps/overhead/pinned ranges remain separate columns. --json exposes all 34,992 individual rows. 27,159 fit, 4,806 cannot-fit, 3,027 under (generator fills with free play). 84 variants cannot fit in at least one 30-minute configuration; 1 in at least one 45-minute configuration; none at 60 minutes. These are draft arithmetic findings, not observed field overruns or pedagogical approval.
- Equipment: 19 catalog availability profiles per variant, 2,052 checks. Eligibility is separate from timing; timeOpts does not expose equipment. Outdoor one-main-block path reproduces generator allocation; indoor equals normal weather, multiblock/random paths are not included.
- Main has 42 games, not 78 (shortfall 36). 25 approval exceptions across 21 games: noncatalog alternatives and similar names. No empty required fields, untranslated Hebrew residues in the four translated languages, duplicate IDs/exact normalized names or invalid parsed metadata found by this audit. This is not native-speaker validation. yt stores search queries, not verified watch URLs.
- Potential timing-model ambiguity: the v.t comment says transitions are included, while the fitter adds overhead separately. Do not assert real double-counting; owner should decide the meaning of base times.
- Pending PR #46 reports 44 games, not integrated into main. Final game counts must be rerun after owner merge. Recent pending timing commit 6662097 changes half-minute ranges and long-lesson handling; rerun timing audit after its integration before treating these figures as final.

## Task C
1. Attempted the exact offline probe from codex/continuation-2026-10-06 using NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node tests/review/offline-lazy.e2e.js. Playwright resolves, but Chromium executable is absent at /root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell. No browser launched, no offline/device pass claimed, no three-pass repetition and no runner registration. Temporary copy removed. Original probe remains on continuation branch. No browser installation or product edit.
2. Rechecked PR #44 at f51da88: docs/store-listing/STORE_LISTING_2026-10-05.md line 211 says icons are future/not wired, while the PR changes PWA, adaptive Android and iOS icons. Documentation needs reconciliation; no push to its branch. Earlier continuation handoff's field17 layout finding remains unverified in this environment, not cleared.
3. Original proposal/blank files remain only on continuation branch: TIMING_TEXT_PROPOSAL_2026-10-06, DEVICE_ACCEPTANCE_SHEET_2026-10-06 and ISSUE_23_REMAINING_DESIGN_2026-10-06. Their proposal/blank markers remain; no integration or invented acceptance results.
4. Compared all 11 archive documents on main and continuation: only author/presenter portions of header text changed (8 document text fields); IDs, titles, metadata and teaching body unchanged. No new hm-plans.js edit; owner merges.

## Exact validation
- npm test: 691 tests, 691 passed, 0 failed, 0 skipped (689 existing + 2 tool acceptance tests).
- node tools/timing-audit.js and node tools/games-audit.js: both run twice; cmp reports identical output per tool on the same source head.
- Regression child processes, 2-second timeout: fractional 10.5, NaN, Infinity, zero and negative inputs all returned. Invalid nonpositive/nonfinite allocations return unknown through product API.
- node build-standalone.js twice: identical SHA-256 for index.html, Hamegrash.html and sw.js; no tracked generated changes against main.
- git diff --check: passed.
- Browser/CI/native/physical devices: no new evidence. Chromium unavailable; no claim of a full browser suite or readiness grade.

## Next action
Owner/Claude: review exceptions, decide duration/overhead semantics, reconcile #44 listing status, then integrate approved branches and rerun both audits. Owner/CI with Chromium: run the continuation offline probe three times and register only after stable green; current probe's viewport section checks nav presence only, so it must not be called comprehensive layout acceptance. It also lacks cache-removal failure/reconnect recovery coverage requested in the October 5 handoff; add that before calling offline acceptance complete.
