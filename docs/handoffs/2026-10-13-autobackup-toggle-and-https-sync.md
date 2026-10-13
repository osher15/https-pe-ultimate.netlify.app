# Task handoff
Date: 2026-10-13
Owner: Claude
Base commit: main fa9f29e
Branch / PR: claude/new-session-rjxqxl / no PR (owner merges)
Task / priority / status: Teacher-controlled Android Auto Backup (default OFF) and https-only records sync. Implemented and verified locally; not built by Android CI, not tested on a device.
Reserved files/sections: native/android (manifest, PEBackupAgent, PEBackupPlugin, MainActivity), hm-native.js (autoBackup bridge), hm-app.js (settings backup card toggle, syncPush/syncPull/save https guard), index.html (toggle row replaces the old Google Backup hint), hm-i18n.js (autobk.*, sync.https; removed the now-unused wipe.googleBackup), privacy.html (5 languages), tests/e2e/autobackup.e2e.js + capshim.js + run.js, tests/unit/autobackup.test.js, privacypage.test.js. GitHub write access was not used for an Issue reservation; this file is the record.

## Changes and user behavior
- Android only (Settings > Backup): checkbox "Android automatic backup (Google)", OFF by default. Not shown on web or iOS.
- Native: `PEBackupAgent` (BackupAgent, `fullBackupOnly`) skips the whole full backup unless the flag in SharedPreferences `pe_backup_settings/auto_backup` is true. `PEBackupPlugin` ("PEBackup": getAutoBackup / setAutoBackup) reads and writes the flag and asks the system to schedule a backup. `MainActivity` registers the plugin before `super.onCreate`.
- Effect when OFF: Android copies nothing, so no pupil data goes to Google account backup or to device-to-device transfer. Turning it OFF stops future copies; an existing earlier copy is removed by the user in Android Settings > Google > Backup (stated in the UI hint).
- Records sync: only `https://` addresses. An `http://` address is rejected on save (field cleared, message), and `syncPush` / `syncPull` do nothing for a stored non-https address.
- Privacy page updated in all five languages (setting is off by default, only if the teacher turns it on).

## Validation commands and results
- `npm test`: 810 / 810 pass (4 new: autobackup contract tests and the privacy default-off check; the dead-key test forced removal of the unused `wipe.googleBackup`).
- `node tests/e2e/some.js autobackup`: 6 / 6 pass (visible and off by default on Android, plugin call and read-back after reload, hidden on iOS and web, http rejected, https kept, stored http never fetches).
- `node build-standalone.js` twice: identical hashes for index.html, Hamegrash.html, sw.js.
- `bash tools/prelaunch-check.sh`: PASS.
- Java compiled with `javac` against hand-written stubs of the Android and Capacitor classes (syntax and signature check only, not the real SDK).

## CI / emulation / physical-device evidence
- Real Android compile: not done here (no Android SDK). The Android CI job is the first real build; if it fails, the likely spots are `PEBackupPlugin` imports or `registerPlugin` usage in Capacitor 8.5.2.
- Device: not done. Needs the owner to confirm the row appears, defaults to off, persists across a force-close, and (optional) `adb shell bmgr backupnow io.github.osher15.peultimate`.
- Not proven: that Android skips everything when the flag is off on every Android version; that returning from `onFullBackup` without writing leaves any earlier cloud copy untouched (it is not guaranteed to be deleted).

## Unresolved issues and dependencies
- `MODIFY_AUDIO_SETTINGS` still unjustified.
- Existing installs have no flag, so they behave as OFF after the update (data is no longer included in new Auto Backups; earlier copies remain in the user's Google account).
- Fresh release AAB must be built from main after merge; see `docs/OWNER_PLAY_SIGNING_AND_BUILD_2026-10-13.md`.

## Publication status
Pushed to the task branch only. No PR, no merge, no deploy.

## Next owner / next action
Owner: merge, let the Android CI build, install on a phone and run the five checks in the owner guide.
