# Tasks for Codex — after Claude's 2026-10-05 session

Supersedes the task list in `docs/handoffs/2026-10-05-codex-instructions.md` (that list is done or moved). Read AGENTS.md and COLLABORATION.md first. Reserve exact files in an Issue (#18) before editing. Netlify credits: no WIP pushes, one batched commit, no PR for review-only work. Never merge or deploy; the owner coordinates.

## What changed since your last review (do not redo)

- Merged to main: #41 (four more lesson-bank sports, lazy loading), #42 (unsigned release-AAB CI job, version label, `docs/NATIVE_RELEASE_CHECKLIST.md`).
- Open PR #43 (Claude): previous rating/note near Start (#21 item 7), **plus** on the same branch: R1 fixed (`hm-data.js` `wholeMinutes`; fitter terminates on fractional/NaN/Infinity), R2 fixed (`.gm-card .sf` no longer clamped), per-record `contentVersion`/`reviewStatus` ("V2"/"draft") in all six bank files, all six sports regenerated uniformly from the owner's Notion export (`tools/notion-lessons-import.js`; no stray `**`), your validator adopted verbatim (`tests/unit/lessonbank.test.js`, now 0 skipped), your two review branches merged in. Your R1 and R2 probes pass on this head (timing probe 5/5, library probe 3/3). Unit tests 689/689.
- Open draft PR #44 (another Claude session): new icons, package ID `io.github.osher15.peultimate`, store listing pack. Not reviewed by you yet.
- Known local flake: in a full local `run.js` the browser process dies at the first `stage2` test (`browser.newContext ... closed`); the same suite passes alone and in CI. Cause unknown. If you can explain it (memory, per-context cost of the 5.8 MB `Hamegrash.html`), report it.

## Tasks (in priority order)

1. **Review PR #43 and #44 diffs** (read-only; write findings, do not push to their branches).
   - #43: check R1/R2 fixes against your probes, the `i18n:change` home repaint, the regenerated bank data (`git diff` is large because of regeneration; compare content with `node tools/notion-lessons-import.js <export> --verify` is not possible without the export, so check structure with your validator and sample 10 records per language for leftover markdown, broken bullets or truncated sections).
   - #44: package ID consistent in Android (`build.gradle`, `MainActivity` package dir, `strings.xml`), Capacitor, iOS; no leftover old ID outside docs; CI jobs (APK, iOS compile, new release-AAB job via manual dispatch); icon files square/no alpha for iOS 1024; listing texts do not claim features that are not in the app (device transfer "by code", cloud sync, accounts, adaptations, store ratings).
2. **Offline/lazy-loading browser probe** (your attempt that could not run): service worker + cache, reload offline, open two sports from cache; remove one cache entry and confirm explicit failure and retry after reconnect; eight concurrent loader calls make one script tag; 820x1180 and 1180x820 core views in five languages. If green and stable, register it in `tests/e2e/run.js` (you own the test file); if it exposes a defect, report it with a reproduction, do not edit `hm-lessonbank.js`/`hm-lesson.js` (Claude-reserved).
3. **Device test sheet** (docs only): a fill-in table version of the device script in `docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md` §9 and `docs/NATIVE_RELEASE_CHECKLIST.md` §5: device, OS, build id, one row per step, pass/fail/notes, plus the upgrade-without-uninstall test (including the new package ID consequence: backup file then restore), the iOS input-zoom check, and the lesson-bank offline check. No invented pass results.
4. **Timing text proposal** (docs only, no data edits): for the 28 variants with a fixed `number + דק` instruction (your review table) list the variant, the fixed text, the fitted range, and a proposed wording or parameterization for the teacher to approve; separately propose how to state the Tabata fixed-round protocol and the distance pyramid. Mark everything "proposal, not approved". Claude applies only what the owner approves.
5. **#23 follow-ups as design notes only** (no code until the owner decides): reviewed score-to-grade mapping, pupil sharing/access, attendance-day exemptions. One page each: decision needed, options, risks, acceptance checks.
6. **Archive provenance** (hm-plans.js, 11 built-in documents): unchanged. Wait for the owner's source/permission evidence; do not mark anything cleared.

## Not yours (Claude-reserved)

`hm-build.js`, `hm-lesson.js`, `hm-know.js` games view, `hm-lessonbank*.js` and `tools/notion-lessons-import.js`, native packaging, #21 remaining items (personal collections, personal copies, plan export/import, authored adaptations), timing tables. Draft timing numbers and adaptations stay "in progress" until the owner reviews them. Component-bank import and payments remain on hold.
