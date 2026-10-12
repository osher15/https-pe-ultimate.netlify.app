# Task handoff
Date: 2026-10-13
Owner: Claude
Base commit: main f71e6ec
Branch / PR: ccr-19865a92-bxv2bs / no PR (owner merges)
Task / priority / status: Response to `docs/handoffs/2026-10-13-apk-field-review-before-upload.md` (Codex review of the owner's ~5 min Android APK recording). P1 photo-finish patch done; Codex C1/C3/C5 branches integrated; privacy page defect fixed. Not merged to main, not deployed (as the review asked).
Reserved files/sections: index.html (photo-finish race card: three `pf-setup-only` classes), hm-app.js (PF `launch`/`stopRace`: one class toggle each), hm-styles.css (appended `body.pf-racing` block), privacy.html (store-app section, 5 languages), tests/e2e/pfracing.e2e.js + run.js registration, tests/unit/privacypage.test.js, tools/prelaunch-check.sh (syntax fix).

## Answers to the review's requests
1. **No automatic merge/deploy.** Work is on the task branch only.
2. **Was photo-finish simplified after the recorded APK?** No. The recorded APK was built from main 402b1e1 (CI run 38278120173); no photo-finish change existed after it.
3. **Smallest safe P1 patch (done):** a focused race mode. When a heat starts, `body.pf-racing` hides the setup row (load class / paste list / edit names / bib numbers), the paste box, the lane-count slider and its hint, the sim/camera mode switch, the photo-finish tool tabs, and the app's bottom bar (only on the photo-finish screen). Visible during the race: clock, Stop heat, Reset heat, the manual-mode fallback, lane tap targets, the live strip and the camera stage. Stop or reset restores everything. No new strings, no data or timing logic touched (only a CSS class toggled in `launch()` and `stopRace()`).
   Not done (bigger, needs owner choice): the full 3-stage Setup/Race/Results restructure, a "run again with same lanes" action, a pre-race camera check, and hiding explanatory text in setup.
4. **Coach Board and Scoreboard:** recommend **after the first store release**, not in it. They are standalone prototypes (`prototypes/pe-boards/`, served on the website, not in the app), with their own storage and no tests in the app suite; adding them now means new navigation, new strings in 5 languages and new regression surface during the closed test. When integrated: one "Tools / Coaching tools" entry, focused full-screen modes, Quick Score vs Match mode as the review describes.
5. **Constraints kept:** offline-first, 5 languages, stable data, manual teacher control, native packaging unchanged.
6. **Privacy (from Codex C1 preliminary):** the store-app section I reported as added on 2026-10-12 had **not** been inserted (a script bug inserted only a stray `<`, producing `<<h2>` in all five languages; Codex found it). Fixed now and extended: it states that if Android backup is on, Android may copy app data, including pupil data, to the user's own Google account backup (the manifest has `android:allowBackup="true"` with no exclusion rules), and that optional Sheets sync / Drive backup go to the teacher's own account. A unit test now guards the markup and the section in all five languages.

## Validation (automated, desktop Chromium; not device evidence)
- `npm test`: 806 / 806 pass.
- `bash tools/prelaunch-check.sh`: exit 0 (tests, two identical builds, native web copy, no old package ID). The script as delivered had a literal `\n` in the hash-tool line (bash syntax error); fixed.
- Browser: `node tests/e2e/some.js pfracing timing field17 field20 shell16 native i18n15 lang30 lead` = 123 / 123 pass. New `pfracing` suite (2 checks) is registered in `tests/e2e/run.js`.
- Screenshot check at 360 px: during a heat only the clock, Stop/Reset, manual mode, lanes and strip are on screen.

## Owner-only acceptance steps
1. Install the next CI APK (after merge) over the current one: data must remain (same package ID now).
2. Photo-finish on a tripod: start a heat, confirm the setup buttons and bottom bar disappear, tap lanes or let the camera mark crossings, stop, confirm everything comes back and results are kept.
3. Android back gesture during a running heat: note what happens (the bottom bar is hidden, so back is the only way out; the heat keeps running in the background until stopped).
4. The rest of `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md` (Codex C3), including camera denied and offline cold start.

## Remaining / not done
- Data safety answers still need the rest of Codex C1 (full network call inventory) and the owner's console check; do not answer "no data leaves the device" without it.
- Netlify contact-form retention (18/24 months) in privacy.html is an operational promise the owner must actually keep.
- iOS permission strings mix Hebrew and English (Codex C1); fix with the iOS pass.
- C2 (AAB binary inspection) and C4 (accessibility screenshots) are still open on issue #55.
