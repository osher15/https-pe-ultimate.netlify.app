# Task handoff
Date: 2026-10-13
Owner: Claude (written for Codex / GPT to continue; owner does the device-only items)
Base commit: main fa9f29e (verified: fa9f29e is the head of origin/main)
Branch / PR: new task branch per AGENTS.md; no PR unless the owner asks
Task / priority / status: Finish everything that can be done without a physical phone. Status: open.
Reserved files/sections: none reserved yet. Before editing, reserve exact files in an Issue (or record the blocker here if GitHub write access is unavailable).
Changes and user behavior: none in this file; it is a work list.
Validation commands and results: see "Required validation" below.
CI / emulation / physical-device evidence: see "Evidence from the two APK recordings".
Unresolved issues and dependencies: see sections below.
Publication status: not merged, not deployed. The owner is the merge/deploy coordinator.
Next owner / next action: Codex takes Part A; the owner takes Part B.

## Read first
- `AGENTS.md`, `COLLABORATION.md`, `docs/ACTION_PLAN_2026-10-03.md`
- `docs/handoffs/2026-10-13-apk-field-review-before-upload.md`
- `docs/handoffs/2026-10-13-apk-field-review-response.md`
- `docs/handoffs/2026-10-13-delete-all-and-retention.md`
- `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md`

Constraints from `AGENTS.md` apply: vanilla JS only, no new services/keys/accounts, English for new docs and comments, five-language strings for any new UI text, preserve stable sid/cid and user data, no forced feedback, do not auto-merge or deploy. Generated files (`Hamegrash.html`, `index.html`, `sw.js`) are rebuilt with `node build-standalone.js`, never copied from stale branches.

## Evidence from the two APK recordings (owner's phone, claimed build "main fa9f29e")
These are visual reviews of screen recordings. They are not CI, not emulation and not code inspection.

Demonstrated and working:
- Photo finish: typed custom distance (75), load whole class (20 of 20), Next heat (20 -> 11 -> 2 remaining), two recorded runner times, preset distance chips (60, 100, 2000) selectable.

Not demonstrated in either recording:
1. "Delete all data from this device" (Settings > Backup). The recording showed the separate "Clean old data" modal instead.
2. Add a class, leave the screen, come back.
3. Photo-finish results surviving a real force-close and reopen (only the Android recent-apps screen was opened).
4. Photo-finish timing accuracy against an independent reference clock.

Note: `fa9f29e` is the head of origin/main (verified 2026-10-13), so the delete-all feature is in that commit. Still confirm the APK's commit from the CI run.

## Part A: work Codex can do without a phone

### A1. Verify what the owner's APK contained
- Find the CI run / commit that produced the APK and compare it to `fa9f29e`. Record the answer here. Do not assume.

### A2. Persistence tests for the gaps above (browser, Playwright)
Write tests for the real failure modes, not only fixture state:
- Add class, navigate away, return: class and its students remain. Also after a full page reload.
- Photo finish: record results, reload the page (simulating relaunch), results are still present with the same times. If results are only in memory today, report that as a finding with the exact code path; do not silently change data semantics.
- Delete all data: after the wipe and reload, nothing returns from localStorage, sessionStorage, IndexedDB, and the simulated native mirror file `pe-ultimate-data.json`. Also test: backup step cancelled or failing stops the flow and deletes nothing; wrong confirmation word deletes nothing.
- Existing suites to extend rather than duplicate: `tests/e2e/wipeall.e2e.js`, `tests/e2e/pfracing.e2e.js`, `tests/e2e/capshim.js`. Register new suites in `tests/e2e/run.js`.

### A3. Android Google Backup exclusion (optional, small)
`native/android/app/src/main/AndroidManifest.xml` has `android:allowBackup="true"` with no exclusion rules. Android may copy pupil data to the user's Google account backup. Options: (a) add `dataExtractionRules` and `fullBackupContent` XML that exclude the app's data, or (b) set `allowBackup="false"`. Check how this interacts with the app's own backup/restore and with updates over an existing install (same package ID, data must remain). Update the privacy page text in all five languages to match whichever option is chosen, and keep `tests/unit/privacypage.test.js` passing. This changes native packaging, so confirm with the owner before choosing (a) or (b).

### A4. Data safety inventory (Codex C1 remainder)
Produce the full inventory of every network call and every place data can leave the device: fetches, forms, Sheets sync, Drive backup, fonts/CDNs, analytics (if any), contact form at Netlify, Capacitor plugins. For each: what data, when, whether optional, whether the user can turn it off. Output a document under `docs/` that the owner can use to answer the Play Console Data safety form. Do not claim "no data leaves the device" unless the inventory proves it.

### A5. Remaining Codex review items
- C2: AAB binary inspection (issue #55): permissions, package ID, version, debuggable flag, backup flags, signing config. Static inspection only.
- C4: accessibility screenshots (issue #55): 360 px width, contrast, tap target sizes, RTL, large font scale if feasible in Chromium.
- iOS permission strings mix Hebrew and English: fix with the iOS pass, one language per locale.

### A6. Photo-finish back-gesture behavior (design note only)
During a running heat the bottom bar is hidden, so Android back is the only way out, and the heat keeps running in the background until stopped. Check how `hm-native.js` / `hm-app.js` handle the hardware back button during `body.pf-racing`. Propose (do not silently implement) the safest behavior, for example: back asks "Stop heat?" non-intrusively, or is ignored while racing. No forced dialogs, no silent loss of results. Write the proposal and a test plan; implement only after the owner picks.

### A7. Optional device-test script
Add a short checklist to `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md` (or a new dated sheet) containing the single-take recording script in Part B, so the owner can follow it and attach the video.

## Part B: owner-only (needs the phone)
Record one continuous screen recording, if possible with taps visible:
1. Confirm the APK version / commit (Settings or CI artifact name) and say it aloud or show it.
2. Add a class named `TEST-A` with one student. Go to Home. Reopen Classes. `TEST-A` is still there.
3. Photo finish: load the class, start a heat, stop it, tap Next heat, counter changes (for example 1/N to 2/N). Type `75` in custom distance, start a heat, confirm 75 is applied.
4. Record a result, then force-close the app (swipe away from recent apps), reopen, unlock, open Photo finish. The same times are still there.
5. Settings > Backup > Delete all data. Keep the backup tick on and save the file. Type the confirmation word. Wait for the reload. Force-close and reopen. Classes are empty and `TEST-A` does not return.
6. Optional: restore from the backup file. `TEST-A` returns.
7. Android back gesture during a running heat: note what happens.
8. Timing accuracy: tripod, a visible stopwatch or a second phone video with a timestamp, compare the recorded times.
9. Rest of `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md`: camera permission denied, and offline cold start.

Other owner actions:
- Play Console: answer the Data safety form only after A4 is done.
- Netlify contact-form submissions: actually delete submissions older than 18 months (privacy.html promises review every 6 months; the calendar event is only a reminder).
- Decide A3 (Android backup option) and A6 (back-gesture behavior).
- Merge order and deploy are yours. Nothing here has been merged or deployed.

## Required validation before any handoff of Part A
Run and record exact commands and results:
- `npm test`
- `node build-standalone.js` twice; confirm no diff between runs (identical hashes for `index.html`, `Hamegrash.html`, `sw.js`)
- Relevant browser suites, for example `node tests/e2e/some.js wipeall pfracing timing field17 field20 shell16 native i18n15 lang30 lead` plus any new suites
- `bash tools/prelaunch-check.sh`
- State clearly which evidence is CI, which is desktop Chromium, which is simulated native, and which is a real device. Do not mark anything done from a branch name or a historical report.

## Do not
- Do not touch imports/expansion of international plans or the component bank (on hold).
- Do not add payments, API keys, paid services, or a required account system.
- Do not add React, TypeScript, a server, or a database.
- Do not merge, deploy, or claim the GitHub board changed unless it did.
- Do not write a new handoff over this one; add a new dated file when you finish.
