# Privacy and student data

Facts checked against `main` at `531b778` on 2026-10-16 by reading code (not by capturing network traffic). Re-check the code before relying on any line here; if the code and this file disagree, the code wins and this file must be updated.

## 1. Who is who

- **Operator:** Osher Shalev (named on `privacy.html` and `terms.html`). Contact and deletion requests go through the in-app contact form.
- **Users:** adults (18+): PE teachers, fitness trainers, coaches, teaching and coaching staff.
- **Data subjects the teacher enters:** pupils, often minors. The teacher or school decides what to enter and is responsible for having permission (`terms.html` §3, `privacy.html` "Students"). The operator never receives this data.

## 2. Data map

| Data | Where it is stored | Who can reach it | Sent to the operator? |
|---|---|---|---|
| Classes, pupils, attendance, grades, measurements, lesson plans, timetable, settings, teacher code | Device: `localStorage`; in the native app also an internal copy `pe-ultimate-data.json` | Whoever holds the device (the teacher code is a casual-use lock, not an account) | No |
| Record videos, photo-finish frames | Device: IndexedDB | Device holder | No |
| Backup file (optionally password-encrypted, AES-GCM) | Wherever the teacher saves it | Whoever has the file | No |
| Google Drive backup (always encrypted) | Teacher's own Drive, `drive.file` scope via `accounts.google.com/gsi/client` and `googleapis.com` | Teacher's Google account | No |
| Records sync (pupil name, class, event, result, status, timestamps; no video) | Teacher's own Apps Script / Sheet URL (`sync-backend/Code.gs`); HTTPS-only since 2026-10-13 | Owner of that sheet | No |
| Android Auto Backup | Teacher's Google account backup, only if the in-app setting "Android automatic backup" is on (default off, `PEBackupAgent`) and device backup is on | Teacher / Google | No |
| Contact form: request type, first and last name, email, phone, message, UI language, app version. Deletion request: email or phone only | Netlify Forms in the operator's account (`LEAD_ENDPOINT="/"`; native app posts to `https://pe-ultimate.netlify.app/` via `HMN.postForm`) | Operator; Netlify as processor | **Yes, only when the user taps Send** |
| Server logs (IP, browser, URL) | Netlify, when the website is loaded in a browser | Netlify | Not collected by the operator directly |
| `version.json` | Same-origin fetch, no personal data | n/a | n/a |

No ads, analytics, tracking, crash reporting or third-party SDKs. Fonts are bundled locally (no Google Fonts request).

## 3. Permissions

| Permission | Platform | Purpose (as disclosed) |
|---|---|---|
| CAMERA | Android, iOS (`NSCameraUsageDescription`) | Photo-finish and record videos; processed on device |
| RECORD_AUDIO | Android, iOS (`NSMicrophoneUsageDescription`) | Live start-signal detection; audio not recorded or sent |
| MODIFY_AUDIO_SETTINGS | Android | No code use found (open item in the audit checklist) |
| INTERNET | Android | Contact form, optional Drive/sync, external links |
| Photo library add | iOS (`NSPhotoLibraryAddUsageDescription`) | Saving a chosen image/video from the share sheet |

No location, contacts, notifications or advertising ID. iOS `PrivacyInfo.xcprivacy` declares `NSPrivacyTracking=false` and no tracking domains.

## 4. Invariants (do not break without an owner decision)

1. Student data is never sent to the operator or to any service the operator controls.
2. Every transfer of student data off the device is optional, started or configured by the teacher, and goes to the teacher's own account or file.
3. New outbound destinations use HTTPS only.
4. The contact form is optional, never blocks app use, and contains no student data.
5. No feature collects contact details from pupils.
6. Encryption claims match the code: file backup encryption is optional; Drive backup is always encrypted; the password is not stored.
7. Deleting data works without contacting the operator: per-item delete, "delete all records", and "Delete all data" in Settings → Backup (also removes the internal native copy).

## 5. Retention and deletion promises (operational)

`privacy.html` promises: contact submissions are kept up to 24 months; the operator reviews at least every six months and deletes submissions older than 18 months; deletion is manual; a deletion request removes the submission and the request itself. These are promises the owner must keep by hand (see `docs/OWNER_DATA_AND_DELETION_2026-10-13.md` §3, including the deletion log). Agents must not change these numbers without the owner, and must not claim automatic deletion.

## 6. Change protocol

When a change touches anything in §2 or §3:

1. Update the data map here and the matching sections of `privacy.html` in he, en, ar, ru, es.
2. Update `terms.html` if user responsibilities change (it currently says data is "stored only on the device"; see the audit checklist).
3. Update `PrivacyInfo.xcprivacy` / `Info.plist` / `AndroidManifest.xml` if a permission or required-reason API changes.
4. Add or update tests (`tests/unit/privacypage.test.js`, and a focused test for the new behavior, including the failure path: offline, rejected URL, permission denied).
5. In the handoff, list the store declarations that must change (Play Data safety, Apple App Privacy) for the owner.

## 7. Wording

Use: "Student data is stored on your device and is not sent to the app's operator. Drive backup, records sync and Android system backup are optional and controlled by the teacher."

Avoid: "Your data never leaves the device", "100% private", "fully compliant", "secure" without saying what is protected and how.
