# Physical-device acceptance sheet

Status: blank evidence sheet. **No pass is pre-filled.** Complete separately on every physical device/build.

## Device record

| Field | Value |
|---|---|
| Device model | |
| OS / version | |
| Platform | Android / iPhone / iPad |
| Build ID shown in Settings | |
| Package / bundle ID | `io.github.osher15.peultimate` (verify on installed build) |
| Test date | |
| Tester | |

Use **PASS / FAIL / NOT TESTED / N/A** only when observed.

| # | Check | Result | Notes / evidence |
|---:|---|---|---|
| 1 | Install and first launch offline; sign-in screen and transfer hint are usable | | |
| 2 | Restore normal backup from PWA; classes, pupils, grades and records match | | |
| 3 | Restore encrypted `.hmg` backup | | |
| 4 | Export/share pupils CSV, full backup and race PNG; saved files open | | |
| 5 | Cancel share once; app reports that the file was not saved | | |
| 6 | Print/PDF flow: class report, lesson plan and teams; Close returns to app | | |
| 7 | Upgrade **without uninstalling** from build N to newer build; data remains | | |
| 8 | Package-ID transition consequence: before replacing an old-ID install, make a backup; after installing `io.github.osher15.peultimate`, restore and verify data | | |
| 9 | Camera permission + photo-finish camera | | |
| 10 | Microphone/start-signal detection with clap | | |
| 11 | Beep/timers audible as expected; background music behavior checked | | |
| 12 | Screen remains awake during timed activity | | |
| 13 | Voice cues work | | |
| 14 | Portrait: notch/home indicator do not cover controls | | |
| 15 | Landscape: controls remain reachable; no whole-app clipping | | |
| 16 | iPad Split View / Stage Manager (iPad only) | | |
| 17 | Hebrew RTL then English LTR; rotate in both languages | | |
| 18 | **iOS input zoom:** focus student/settings inputs, type, blur/dismiss keyboard; page returns to normal scale and Save/navigation remain reachable | | |
| 19 | Day theme changes status-bar readability; switching back works | | |
| 20 | Android back: closes an open dialog first; home behavior correct | | |
| 21 | Privacy/YouTube links open system browser and return to app | | |
| 22 | Lesson bank online: open one sport successfully | | |
| 23 | Lesson bank offline: after cache is established, airplane mode/reload and open at least two sports | | |
| 24 | Lesson-bank failure/retry: only when using a controlled test build/probe; missing cached sport gives explicit error and succeeds after reconnect/retry | | |
| 25 | Existing data survives normal app close/reopen and device rotation | | |
| 26 | Contact form: leave NOT TESTED unless owner explicitly authorises a real submission | | |

## Release gate

A CI compile is not a device pass. Store upload remains blocked until the owner records the required physical-device results and resolves every FAIL that affects core use, data preservation, offline use, or required store behavior.
