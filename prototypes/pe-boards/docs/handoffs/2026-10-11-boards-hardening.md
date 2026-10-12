# Standalone boards hardening — 2026-10-11

Branch: codex/boards-hardening-2026-10-11, based on standalone boards3a3fa2c.
Main freshly fetched348c1ab; reservation Issue18 comment6108687739.
All changed files are inside prototypes/pe-boards/. This nested handoff preserves
that explicit boundary. No app integration, generated app change or new dependency.

Files: PE_Coach_Board.html, PE_Ultimate_Scoreboard.html, README.md,
checks/verify-boards.cjs, checks/browser-boards.cjs, this handoff.

Changes: coach five-language UI/help/new demo cues and same-origin language hook;
actual save-status text; invalid restore preservation; import validation for empty,
duplicate or colliding IDs, nonboolean portrait and total point budget. Scoreboard
validation rejects empty identity, malformed/null periods, inconsistent final totals,
missing period history, impossible running/deadline state, invalid envelope/revision
and duplicate archived match IDs. No health/injury/exemption integration exists.
Existing public scoreboard contains team scores only, not named health information.

Tournament findings already implemented in the owned scoreboard were reverified:
persistent match ID, idempotent finalization/one archive entry, Undo, deadline clock,
real persistence result. Do not rebuild these features or connect #52.

Confirmed browser finding: coach sidebar grid's intrinsic minimum widths overflowed
320px (420px EN,610px RU) and390px. Fixed with a single narrow-screen settings column,
wrapping header/controls and bounded children. No overflow hiding used as a substitute.

Commands:
- node --test prototypes/pe-boards/checks/verify-boards.cjs:38/38 pass.
- NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -r /workspace/scratch/56dee9fc55c5/browser-preload.cjs prototypes/pe-boards/checks/browser-boards.cjs:
  first12 pass/10 fail(all coach layout cases); after fix22/22 pass, no page errors.
- npm test: baseline700/700; node build-standalone.js twice; hash comparison and
  git diff --exit-code -- index.html Hamegrash.html sw.js:exit0.

Evidence: Chromium153 synthetic localhost browser cases and dependency-free VM checks.
320/390px and Arabic/Hebrew direction are browser evidence, not physical devices.
Not run: CI-pinned browser, native/OS compilation, real download/audio/fullscreen/touch,
physical320px phone or low-storage device, native-speaker/teacher review. AI translations
remain draft. No claims about classroom suitability or store readiness.

Owner next: review this isolated prototype diff, native-language wording and physical
controls later. No main merge/deploy/preview/upload; keep [skip netlify] and the hold
through2026-10-22. An iframe example is a future proposal, not an installed integration.
