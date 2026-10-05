# PE Ultimate — field pilot and integration acceptance

Use the reviewed integrated candidate after owner merge/retarget decisions. The current features are draft PRs, not a deployed release. This extends the October 3 checklist with the implemented assessment/Excel/teacher-grade/backup flows. Browser automation does not complete this sheet.

## Short technical check before teaching

Use two synthetic pupils with the same name and different IDs, plus a pupil in another class. Keep real records backed up separately. Record candidate commit, device/OS, browser or native build, language and date. Do not uninstall an existing real-data app as part of an upgrade check.

| Step | Action | Expected result | Evidence |
|---|---|---|---|
| 1 | Select class, start lesson, mark attendance | Same class context; independent pupil IDs | Actions/time; class and IDs |
| 2 | Record one result, reload/reopen | Active lesson and exact raw measurement remain | Value/date/pupil/session ID |
| 3 | Finish without rating or note | Lesson completes; measurement remains | Session/history; no forced feedback |
| 4 | Set class/period requirements and one period exemption | Explicit dates; exemption reason required; other periods unchanged | Saved policy/date/status |
| 5 | Download Excel template; copy result cells back into paste preview | Stable IDs; decimal comma supported; review before Apply/Save | Preview and explicit save |
| 6 | Include a zero repetition count and a lower second attempt | Zero stays measured; best stays best; all attempts remain | Exact best/history; blank/exempt distinct |
| 7 | Try an exempt cell or wrong pupil ID | Whole invalid paste rejected; no saved changes | Error and unchanged records |
| 8 | Reload, open class report, download Excel and CSV | Same rows, dates, best/status/history; other-class pupil excluded | Open actual files in spreadsheet app |
| 9 | Set final grade with optional note, change a component | Teacher decision persists; calculation basis still visible | Grade, source, note, other period unchanged |
| 10 | Download Grades Excel/CSV | Final/manual decision and calculated basis match screen | Open files; correct IDs/period |
| 11 | Preview one pupil's personal document | Selected pupil only; no teacher notes or exemption reason | Print/PDF and downloaded HTML |
| 12 | Export backup and restore to a separate test context | Pupils, history, policies, grades, attendance and lesson history agree | Exact records and actual file |
| 13 | Wrong password/file, insufficient space or restore error | Explicit failure; no false success/reload; verified rollback or incomplete warning + recovery copy | Error, recovery file and retained data |

The zero-count check applies to repetitions, not zero-duration running tests. Assessment exemptions belong to a class/period, not an attendance day. Suggestions from target rules are not automatically final grades. The printed pupil output is teacher-mediated, without accounts/public links. A recovery copy is unencrypted JSON without videos; keep it with the teacher's backups. Media restore is a subsequent IndexedDB operation, not a cross-store transaction.

## Actual devices — record separately

| Check | Owner evidence to record |
|---|---|
| Android upgrade | Owner reported installed Android works; record candidate/build and upgrade-without-uninstall result before claiming this candidate passes |
| iPhone/iPad | Model/iOS/build/signing; keyboard/Back/background/reopen; IDs, grade and backup preserved |
| Export/share | Open XLSX/CSV/HTML/PDF in actual target app; confirm or cancel native share |
| Camera/audio | Permission denial and recovery; silent switch; usable feedback outdoors |
| Offline | Airplane mode after opening candidate; core records/report/export/reopen remain usable |
| Field | Sunlight, touch targets, gloves if applicable; actual task time and repeated class choices |

Unsigned iOS simulator build and simulated native persistence bridge are automated evidence only. Physical Apple acceptance remains Issue #13, owned by the teacher with Claude packaging support.

## Two or three real lessons

After short checks pass, teach normally rather than completing a long feedback form. Record each repeated blocker with: action, expected/actual result, candidate/device, affected synthetic or anonymized ID, whether reopening helps, and whether data was retained. Optional note; no compulsory reflection or invented readiness score. Teacher determines whether proposed timing/equipment works for the class.

| Lesson | Candidate/device | Class | Action/time | Blocker or outcome | Data retained? | Follow-up owner |
|---|---|---|---|---|---|---|
| 1 | | | | | | |
| 2 | | | | | | |
| 3 | | | | | | |

## Work split and next gate

Codex maintains cross-module regressions and reviews evidence/failure paths. Claude completes both lesson builders in Issue #19 and native packaging in #13; transfer design in #22 follows the reviewed rollback implementation. Owner merges/retargets the stack and performs real-device/lesson checks. Content import stays on hold (#24). No payment/account/server work is implied.
