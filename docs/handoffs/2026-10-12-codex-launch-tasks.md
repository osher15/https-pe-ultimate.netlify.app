# Tasks for Codex / GPT — Google Play launch support
Date: 2026-10-12. Author: Claude. Read first: `AGENTS.md`, `COLLABORATION.md`, `docs/LAUNCH_PLAN_2026-10-12.md`, `docs/NATIVE_RELEASE_CHECKLIST.md`, `docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md`.
Base: current `main` (fetch it; do not work from an old branch). One dedicated branch per task, reserve files in an Issue (or record the blocker here), do not merge or deploy: the owner merges.
Rules that apply to every task: do not change product code unless the task says so; no new dependency, API key, paid service or account system; state exactly which commands you ran and what they returned; keep CI, emulator and physical-device evidence separate; write `docs/handoffs/YYYY-MM-DD-task.md`.

## C1 — Privacy and store-declaration cross-check (blocker B6, B7)
Goal: prove or correct every statement in the drafts (readiness doc §6-7, `privacy.html`, `docs/store-listing/`) against the real code.
- List every network request the packaged app can make (search `fetch`, `XMLHttpRequest`, `CapacitorHttp`, form posts, external links, fonts, analytics). Expected: only the optional contact/deletion form. Report anything else with file and line.
- List every permission in `native/android/app/src/main/AndroidManifest.xml` and the iOS usage strings; match each to a feature that uses it. Flag unused ones.
- Check what is stored where (localStorage, IndexedDB, the native copy `Library/pe-ultimate-data.json`, Android auto-backup rules) and whether Auto Backup may upload pupil data to the user's Google account; say what the Data safety answer must be.
- Output: a table "claim -> evidence -> OK / wrong / unknown" and a final proposed answer set for Google Data safety, content rating and Health apps declaration. Do not submit anything.

## C2 — Release build review (blocker B4, production P4)
Status from Claude: the unsigned release AAB job succeeded on `main` (run 38270990317, commit 54c8afc; artifact `pe-ultimate-android-release-unsigned`, 11.9 MB, expires 2026-10-26). Claude could not download or inspect it (no authenticated artifact access here). Your job: download it, unzip, and report package ID, versionName/versionCode, targetSdk, minSdk and that it is unsigned (`jarsigner -verify`), with the commands and outputs.
- Read `.github/workflows/native.yml` and `native/android/app/build.gradle`. Check the release AAB job: version name/code, `targetSdk`, `minSdk`, no debug signing, unsigned-guard step works, artifact name.
- Check whether the AAB is compatible with the current Play requirements for target API level and 16 KB memory page size (native libraries in `native/`); cite the official page you used and its date. If something fails, write the exact fix as a patch for Claude; do not edit `native/` yourself.
- If a CI run on `main` exists for the release job, read its log and report success/failure with the run URL.

## C3 — Device acceptance sheet for the owner (blocker B11)
- Update `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md` into one sheet for a first Android phone: install from the closed-test link; upgrade over an older build without uninstall; offline first launch; backup to file, restore, encrypted `.hmg`; share sheet; camera/microphone granted and denied; back button inside modals; lesson start and resume; screen locked during a timer; rotation; font scale 200%.
- Add a photo-finish reality check with no accuracy claim: three runs over the same 20 m, record the app time and a separate stopwatch time, note the difference and the phone model. This is evidence for the owner, not a certification.
- Each step: exact taps, expected result, pass/fail/blocked box, "evidence" column. Keep it under two pages; Hebrew first with English headings is fine (owner reads Hebrew).

## C4 — Accessibility and small-screen spot check (P6)
- With Playwright at 360x640 and 390x844, font scale 200% (CSS zoom is not enough: emulate with root font-size), check the 8 main screens for clipped or unreachable buttons. Save screenshots under `docs/reviews/launch-a11y-2026-10-12/` and list findings as Issues-ready bullets (screen, element, what is wrong). Do not fix.

## C5 — Regression guard before each upload
- Write a single script `tools/prelaunch-check.sh` (no new dependency) that runs: `npm test`, `node build-standalone.js` twice with hash compare, `node native/build-web.js`, and greps that the old package ID `app.netlify.peultimate` is not in native config files. Exit non-zero on any failure. Document it in the checklist.

Not for Codex: signing, store consoles, payments, merges, changing `hm-*.js`.
