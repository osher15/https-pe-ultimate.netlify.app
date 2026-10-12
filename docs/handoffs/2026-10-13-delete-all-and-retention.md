# Task handoff
Date: 2026-10-13
Owner: Claude
Base commit: main a79ebfe
Branch / PR: ccr-19865a92-bxv2bs / no PR (owner merges; pre-approved for this body of work)
Task / status: "Delete all my data" button (backup offered first) and 18-month retention reminder. Status: implemented and verified locally.
Reserved files/sections: hm-app.js (settings backup card handlers), hm-native.js (wipe), index.html (settings backup card), hm-i18n.js (wipe.* keys), tests/e2e/capshim.js, tests/e2e/wipeall.e2e.js. GitHub write access was not used for an Issue reservation; this file is the record.

## What changed
- Settings > Backup: a "Delete all data from this device" button. Flow: dialog 1 offers a backup file (ticked by default) -> if ticked, the normal backup export runs and the flow stops if it fails or is cancelled -> dialog 2 requires typing the confirmation word -> local data (all keys under the app namespace), session data, the records IndexedDB and, in the native app, the internal mirror file `pe-ultimate-data.json` are removed, then the app reloads empty.
- The button does not touch backup files the teacher saved elsewhere, nor contact-form messages stored at Netlify (the hint says so).
- Explanation of Android Google Backup added in the same card (native app only).
- Bug found by the new test and fixed before commit: the first draft removed short key names instead of prefixed keys, so nothing was deleted.

## Retention reminder
- privacy.html promises a review at least every six months and deletion of submissions older than 18 months (none kept beyond 24 months). The owner has a recurring Google Calendar event (every 6 months from 2027-04-12, 10 occurrences) with the steps. A log table was added to `docs/OWNER_DATA_AND_DELETION_2026-10-13.md`.
- Limitation: the calendar event is a reminder only; deletion at Netlify/the mailbox stays manual. 10 occurrences cover 5 years; extend later.

## Validation
- `npm test`: 806 / 806 pass.
- `node tests/e2e/some.js wipeall`: 3 / 3 pass (button + default-on backup + cancel keeps data; typed-word gate then empty after reload; simulated native: mirror holds no pupil/class data after reload and data is not restored).
- `node build-standalone.js` twice: identical hashes for index.html, Hamegrash.html, sw.js.
- Full sharded browser run: see the final result in the commit message / owner report.
- Evidence level: local Chromium with a simulated Capacitor shim. Not a phone test: the owner should try the button on the Android APK (backup, wipe, reopen).

## Open
- Optional: Android BackupAgent that excludes pupil data from Google Backup (not done; user can switch Google Backup off in Android settings).
