# Task handoff
Date: 2026-10-16
Owner: Claude
Base: ccr-f0f0c4fd-ymvjjb (includes C18)
Branch / PR: c24-scoreboard-autosave / no PR (nothing pushed; owner merges)
Task / status: C24 scoreboard reload-autosave defect. Reproduced, fixed, tested in headless Chromium and Node. Not verified on a physical device.
Reserved files: prototypes/pe-boards/PE_Ultimate_Scoreboard.html, prototypes/pe-boards/checks/{verify-boards,browser-boards}.cjs, store-content/reports/patches/. No shared PE Ultimate file was touched. GitHub write access was not used; no Issue reservation was changed by this task.

## Defect
On a same-tab reload the old document's unconditional `store()` in `pagehide` and `visibilitychange` bumped the storage revision. The reloaded document received `storage` events, set `conflict=true`, showed "Not saved - another tab has changed the board" and stopped saving for the rest of the session (the display kept counting, localStorage did not). Also, the startup "Match restored" toast was shown even on first start (`revision` is set by the startup `store()`).

## Fix (hand re-implementation of the intent of store-content/reports/patches/scoreboard-reload-autosave.diff; the diff was not applied)
- `savedSig`/`sig()`: signature of the last successful write (state and records, without the clock's `remaining` and undo `history`; a running clock is stored as `deadline`).
- `pagehide` and hidden `visibilitychange` write only if `sig()!==savedSig`. Changes that were not written (for example after a failed write) are still saved there.
- `hadSaved` is captured before the startup `store()`, so the "restored" toast shows only when saved data existed.
- Unchanged: the C18 `frozen` guard in `store()` (delete-all and restore), storage keys, language key, revision/conflict logic, dialogs, translations.
- The coach board has no pagehide/visibilitychange/beforeunload handler, so the pattern does not exist there. It was not changed.

## Tests (new)
Node, `verify-boards.cjs` (3 new): old document's late pagehide/visibilitychange does not rewrite storage and the new document still saves; dirty state is written on pagehide while a clock-only change is not; no false restore toast on first start.
Browser, `browser-boards.cjs` (3 new): (1) set team names, 7-minute period, scores, run and pause the clock, immediate `page.reload()`: everything is restored, status stays "Saved" (also after 400 ms), a later change persists; (2) running clock plus synthetic pagehide / hidden visibilitychange before the 5 s interval: running state and deadline stored, reload restores it paused with elapsed time kept; (3) after confirmed delete-all the late pagehide/visibilitychange (and a racing score click) fire in the same task as the confirm click: the match key and the language key stay absent, an unrelated key stays, and after the reload only a default English match exists.

## Commands and results
Environment: `export NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, Node 22.
- Before the fix (new tests on the old scoreboard file): `node --test prototypes/pe-boards/checks/verify-boards.cjs` 43 pass / 3 fail; `node prototypes/pe-boards/checks/browser-boards.cjs` pass 47 / fail 2 (tests 1 and 2 fail with the false "another tab" status).
- After the fix: verify-boards 46/46; browser-boards pass 49, fail 0; `npm test` 819/819; `node build-standalone.js` OK and `git status` shows no generated-file diff.
Baselines before: 43/43, 46/46, 819/819.

## Limitations
- Headless Chromium and Node only. Not Safari/iOS, not an Android WebView or the Capacitor shell, not a physical device. The real browser unload ordering was reproduced with `page.reload()`; closing and reopening a tab was not exercised.
- Delete-all test (3): the old document is also protected by the revision check (after removal the stored revision no longer matches), so removing the `frozen` guard alone did not fail the test; `frozen` is defense in depth. The test asserts the outcome (nothing comes back), not which guard blocked it.
- The pagehide/visibilitychange events in the browser tests are dispatched synthetically (plus the real ones from `page.reload()`).
- The stale patch file was removed; store-content/reports/product-readiness.md still describes it as "proposed, not applied" and should be updated at the next readiness refresh.
