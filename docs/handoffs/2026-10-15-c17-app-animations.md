# Task handoff
Date: 2026-10-15
Owner: Claude
Base commit: e995a3d on ccr-f0f0c4fd-ymvjjb
Branch / PR: c17-app-anim (local only); no push, no PR, nothing merged or deployed.
Task / priority / status: C17 (Issue #59 reservation) swap the FIT exercise photos/GIFs for the 47 cartoon SVG animations, following store-content/exercise-anim/INTEGRATION.md. Implemented and tested; owner review and device check pending.
GitHub board: write access was not used. The Issue #59 reservation was given in the task brief; the board was not changed by this work.

## Reserved files/sections
hm-app.js FIT module only (the drawing helpers just above `const EX=[` and the four call sites), native/build-web.js (DIRS), new exercise-anim/, tests/unit/exerciseanim.test.js, tests/e2e/fitanim59.e2e.js, one registration line in tests/e2e/run.js. Generated outputs (Hamegrash.html, index.html, sw.js) are in a separate commit so it can be dropped and rebuilt after integration.

## Changes and user behavior
- exercise-anim/svg/<id>.svg (animated, 47 files) and exercise-anim/still/<id>.svg (single frame, 47 files) copied verbatim from store-content/exercise-anim/out/{svg,still} (1.7 MB on disk).
- hm-app.js: `PHOTO_EX`, `rigGif`, `heroGif`, `gifImg` removed. New helpers `animSrc`, `stillSrc`, `imgStyle`, `thumbImg(e,px)`, `heroImg(e,px)`. Files are keyed by the exercise id, not by `fig`.
  - Circuit station list, library grid and gym-day list: `thumbImg` (still SVG, lazy).
  - Exercise detail window: `heroImg` = `<picture>` with a `prefers-reduced-motion: reduce` source pointing at the still, and the animated SVG as the `<img>`.
  - The `fig` field on each EX entry is left in place (data unchanged; it is simply no longer read).
  - The INTEGRATION table lists a "run screen" at line 5719; in this tree that line is the gym-day list, and no run-screen image exists, so only a still is used there.
- Light background (#eef3f8) on the dark theme: the drawings are kept as rounded light cards (`background:#eef3f8`, border-radius 10px in lists and 14px in the detail). Checked in a phone-width Chromium screenshot (library grid and squat detail); no regeneration with a dark background was done.
- native/build-web.js: `DIRS` is now `["exercise-gifs","exercise-anim","fonts"]`. `node native/build-web.js` produced native/www with 47+47 files in exercise-anim (native/www is git-ignored).
- exercise-gifs/ is NOT deleted (as instructed: only after the device check). It is no longer referenced by hm-app.js, but still copied by the build and still listed in the credits file.
- Service worker: sw.js is not hand-edited. exercise-anim files are not in the precache list (same as exercise-gifs before). They are served by the existing runtime cache-first asset handler after the first online view, so offline behaviour for core screens is unchanged; thumbnails of exercises never viewed online are not available offline. Precaching the 181 KB of stills is a possible follow-up (needs a reservation for sw.js SHELL).
- Preserved: sid/cid, EX data and ids, language, manual grades, offline core (no data code touched).

## Validation (local, Linux, headless Chromium via Playwright; CI/emulation/device are distinct)
- `npm test` (node --test tests/unit/*.test.js): 819 tests, 819 pass, 0 fail (includes 5 new tests in tests/unit/exerciseanim.test.js: every EX id has svg+still; no orphan files; no exercise-gifs/PHOTO_EX/rigGif/heroGif/gifImg/.gif in the FIT module; picture source + reduced-motion present; native DIRS has exercise-anim).
- `node build-standalone.js` run twice: second run produced no change (md5 of Hamegrash.html, index.html, sw.js identical after both runs: 1b61dae7..., 152f7fc1..., 7cae7590...). Build stamp 62ce706a.
- New browser suite (Chromium, headless, 430x900): `node -e 'require("./tests/e2e/harness.js").run([require("./tests/e2e/fitanim59.e2e.js")])'` 4/4 pass: 47 grid thumbnails are loaded still SVGs and no exercise-gifs/.gif request is made; detail is a `<picture>` whose default currentSrc is the animated SVG; with `emulateMedia({reducedMotion:"reduce"})` currentSrc is the still; gym-day thumbnails are stills.
- Focused existing suites that touch FIT/exercise/shell/native screens, one process: fitanim59, fitref58, field17, shell16, stage2, today, menu, i18n15, nav, native: 115 passed, 0 failed.
- Full `npm run test:e2e` (tests/e2e/run.js, 74 suites): INCOMPLETE. The run is very slow in this environment (about 1 test per 1-3 minutes late in the run). Tests #1-#406 all passed (406 ok, 0 failures, including suites for pupil identity/rename, lessons, grading, backup, lessonend, etc.). I then stopped the run manually with `pkill` to finish the task; that closed the shared browser, so the log's trailing "273 failed" (#407 onward, all `Target page, context or browser has been closed`) is an artifact of the kill, not a product failure. Tests #407 to the end were not run. Run `npm run test:e2e` in CI or locally to complete it.

## Limitations
- No physical-device evidence (iOS/Android WebView). SVG animation in `<img>` and the `<picture>` reduced-motion swap were checked in desktop Chromium with media emulation only; real OS-level reduced-motion on a device is unverified.
- Battery/CPU of the detail animation on low-end phones is unmeasured. Only one animation runs at a time (detail window); lists use stills.
- Offline: see the service worker note above.
- The five-language `alt` text is the existing `e.name`, as before.
- exercise-gifs/ and its CREDITS.md remain until after the device check; deleting them (about 6.3 MB) is a later task.

## Next step
Owner reviews and runs the device check; then a separate reserved task removes exercise-gifs/ and the Wikimedia credits, and optionally precaches the stills. After merging, rebuild outputs (`node build-standalone.js`) instead of cherry-picking the generated-output commit.

## Commits
1. Source (hm-app.js, native/build-web.js, exercise-anim/, tests, this handoff).
2. Regenerated outputs (Hamegrash.html, index.html, sw.js) only; droppable.
