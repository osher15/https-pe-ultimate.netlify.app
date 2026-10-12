# Device acceptance sheet — 2026-10-09

Use with `NATIVE_RELEASE_CHECKLIST.md` and the device script in `PE_ULTIMATE_PLAY_READINESS_2026-09-29.md` §9. This sheet records evidence; it does not certify a release. Prior owner reports of good Android/iOS behavior are not a completed per-step record. All results below are **NOT RUN** until recorded on the actual device.

Use an isolated test class with synthetic students and grades. Before any update or migration involving existing data, export a backup and confirm the file exists. Do not uninstall a data-bearing app to test an ordinary update.

## Build and device record

| Field | Fill in |
|---|---|
| Tester / date | |
| Device model / OS version | |
| Platform | Android / iPhone / iPad / browser PWA |
| App build ID / commit | |
| Installation source | CI APK / Xcode / PWA |
| Package or bundle ID | |
| Prior build ID, if updating | |
| Synthetic class / student IDs | |
| Backup filename and verified location | |

## Essential pilot checks

Record PASS, FAIL, or NOT RUN, plus a short observation. A simulated browser/native bridge test does not fill a physical-device cell.

| Check | Expected evidence | Result / notes |
|---|---|---|
| Launch offline | Installed native app opens in airplane mode; PWA test requires prior installation/cache | NOT RUN |
| Teaching flow | Choose class, record attendance and a grade; reopen and verify the same student/class and values | NOT RUN |
| Offline reopen | Close and reopen while offline; verify the synthetic data | NOT RUN |
| Backup → restore | Export, inspect the file, restore into an isolated target; compare classes, students, grades and record media | NOT RUN |
| Encrypted backup | Restore a test `.hmg`; wrong password does not replace existing data | NOT RUN |
| Update in place | Install a newer compatible build over the old build; verify data and build ID | NOT RUN |
| Share / cancellation | Export CSV, backup and race PNG; save and open; cancel once and verify accurate status | NOT RUN |
| Timer / beep | Silent switch, background music, spoken cues and screen wake behavior recorded | NOT RUN |
| Camera / microphone | Permission flow and photo-finish clap detection work | NOT RUN |
| Screen / language | Portrait, landscape, Hebrew RTL, English and other supported languages; no covered controls | NOT RUN |
| iPad layout | Both orientations, Split View / Stage Manager if available | NOT RUN / N/A |
| Android Back | Dialog closes predictably; home behavior recorded | NOT RUN / N/A |
| Print / external links | Save/open printable report; external link opens and returns correctly | NOT RUN |
| Theme | Day/night status bar and controls remain readable | NOT RUN |

Ordinary upgrade and migration are separate tests. For Android, use compatible package ID/signing and a newer version code for an in-place update; for iOS, Run over the same installed bundle. A debug-to-store or changed-ID/signing transition must not be recorded as an ordinary update: verify export/restore as a separate migration. Do not change identifiers for this review.

## Candidate-specific checks (only when that candidate is installed)

| Check | Expected evidence | Result / notes |
|---|---|---|
| Personal lesson copy | Edit/save a copy; original remains intact; update and undo restore the previous plan | NOT RUN |
| Collections | Add game/personal/bank references; restart; open references | NOT RUN |
| Candidate backup | Restore collections, current/previous personal plan and game variations | NOT RUN |
| Language while collection open | Switch English→Spanish; visible type label changes Game→Juego without reopening | Known browser failure at dba3cbe; device NOT RUN |

Browser coverage on 2026-10-09 verified the candidate's backup/apply/reload round trip with synthetic data. Actual file pickers, share sheets, native persistence, device audio and updates still require this sheet.

## Failure record

For each failure: build + device, starting state, exact actions, expected/actual behavior, screenshot if useful, whether restart changes it, and whether data changed. Retest after a fix using the same steps and record the new build. Do not send a real contact-form submission as part of this sheet; the earlier one-time authorized test was already used.
