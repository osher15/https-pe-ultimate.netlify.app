# Android physical acceptance — PE Ultimate (C3, 2026-10-12)
**Real phone only.** Tester/date: ____  Phone/Android: ____  App version/build: ____  Package ID: ____  Previous build: ____  Install source: ____
Use a **synthetic** class/student only. Keep existing installations and their data. Record PASS / FAIL / BLOCKED, and evidence (screenshot, filename or observation). No row is pre-approved.

| # | Exact taps / actions | Expected | Result | Evidence |
|---|---|---|---|---|
| 1 | Open closed-test opt-in link → Join → Google Play → Install → Open | Correct package opens; no account required | ☐ Pass ☐ Fail ☐ Blocked | |
| 2 | On fresh installed build, enable Airplane mode → launch app → open Home, Classes and one previously downloaded lesson | Core works offline; note any content that requires prior caching | ☐ Pass ☐ Fail ☐ Blocked | |
| 3 | With test class and one recorded result, install **newer build with same package ID and signing** over existing app; do not uninstall → reopen | Class, sid/cid, grade, language and history unchanged | ☐ Pass ☐ Fail ☐ Blocked | |
| 4 | Open Backup → export to Files → verify file in Downloads/selected folder | Real backup file exists and can be opened/selected | ☐ Pass ☐ Fail ☐ Blocked | |
| 5 | Backup → encrypted .hmg → save → try restore with wrong password, then correct password on an isolated test dataset | Wrong password changes nothing; correct restore recovers data | ☐ Pass ☐ Fail ☐ Blocked | |
| 6 | Export CSV/report or race image → Share → cancel once → Share again → select target | Share sheet opens; cancel preserves data; second attempt works | ☐ Pass ☐ Fail ☐ Blocked | |
| 7 | Open Photo Finish → deny camera, retry and grant in system settings; repeat for microphone if requested | Clear failure/retry; granting restores operation; no crash | ☐ Pass ☐ Fail ☐ Blocked | |
| 8 | Open an edit/backup modal → press Android Back → reopen modal | Predictable close/cancel; no silent save or loss | ☐ Pass ☐ Fail ☐ Blocked | |
| 9 | Home → choose class → Start lesson → record action → exit/reopen → Resume | Correct class and active lesson preserved | ☐ Pass ☐ Fail ☐ Blocked | |
| 10 | Start timer → lock screen for 30 seconds → unlock → return | Record timer continuity, audio and wake behavior; do not assume background accuracy | ☐ Pass ☐ Fail ☐ Blocked | |
| 11 | Rotate portrait ↔ landscape on Home, class, Photo Finish | All primary controls remain reachable | ☐ Pass ☐ Fail ☐ Blocked | |
| 12 | Android Settings → Accessibility → Font size 200% (or maximum available) → reopen app and key screens | Text/buttons readable, scrollable, not clipped | ☐ Pass ☐ Fail ☐ Blocked | |

## Photo-finish field reality check — NOT an accuracy certification
On the same **20 m** course, use a separate stopwatch and consistent start/finish protocol. Record phone model, tripod position, lighting, microphone/camera permissions and app settings. Do not use pupils' identifiable media in shared evidence.

| Run | App time (s) | Separate stopwatch (s) | Difference: app − stopwatch (s) | Notes |
|---|---:|---:|---:|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

Photo-finish result: ☐ Pass ☐ Fail ☐ Blocked. Report missed triggers, retries, false triggers and workflow friction; three runs do **not** validate measurement accuracy.

**Migration is different from upgrade:** old package `app.netlify.peultimate` → new `io.github.osher15.peultimate` requires backup in old app and restore in new app; retain both until verified. Never uninstall to perform row 3.

**Failure note:** row/build/device ____; exact taps ____; expected ____; actual ____; screenshot/file ____; did data change? ____; retest build/result ____.
