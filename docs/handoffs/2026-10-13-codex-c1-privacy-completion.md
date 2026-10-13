# C1 privacy / store declaration completion — 2026-10-13

Owner: Codex / GPT
Base: current `main` (fa9f29e when this pass started)
Branch: `codex/c1-privacy-completion-2026-10-13`
Scope: docs-only review. No product-code edit, merge, deploy, signing, upload, or Play Console submission.
Issue: #55

## Result

C1 is now materially complete from repository evidence. This is still **not a store submission** and does not replace the owner's final Play Console check.

## Network / off-device inventory

| Trigger | Code path | Destination / data | Default? | Finding |
|---|---|---|---|---|
| Contact / deletion request submitted in packaged app | `hm-native.js` `postForm()` -> `CapacitorHttp.request` | `https://pe-ultimate.netlify.app/`, form fields supplied by the user | No, explicit user action | Off-device collection. Privacy/Data-safety must cover contact form fields and support/deletion messages. |
| Record sync configured by teacher | `hm-app.js` `syncPush()` / `syncPull()` | `SET.syncUrl`; POST JSON includes sync code plus record payload (`id`, sport, name, class, value, status, timestamps, video-presence flag); GET includes sync code | No, only if teacher configures URL + code | Off-device transfer. Destination is user-configured; do not claim all record data always stays on device. |
| Student upload form / teacher Drive folder | `hm-app.js` `driveForm`, `driveFolder`, `window.open()` / normal external link | User-configured HTTPS form/folder (typically Google Forms/Drive); whatever user uploads there | No, only if teacher configures it and user opens/uploads | User-directed transfer. Privacy text should describe it as optional transfer to the teacher's chosen account/service. |
| Backup/share file | `hm-native.js` Filesystem + Share | File is handed to OS share sheet; user chooses destination such as Files/Drive/email/WhatsApp | No, explicit user action | User-directed export. App does not itself pick the external recipient. |
| Android system backup | Android OS because manifest has `android:allowBackup="true"` and no exclusion rules observed | Eligible app data may be copied to the user's Google backup account | OS/user setting | Not developer collection, but the privacy policy must not say pupil data can never leave the device. |
| Normal website/PWA use | Browser navigation/static asset loading; Netlify may receive ordinary web request logs | Netlify hosting | Website only | Distinguish website logs from packaged-app local operation. |

### What was not found in the reviewed packaged code

- No advertising SDK.
- No analytics/tracking SDK found in the reviewed native bridge or app logic.
- No WebSocket/sendBeacon telemetry path identified.
- Camera/microphone processing is described in native permission text as on-device; no code path reviewed here uploads raw camera frames or microphone audio by default.

Limitation: GitHub code-search returned no useful index results for generic strings, so the inventory was completed by direct inspection of the current packaged-app bridge and main app logic. This is a repository review, not a packet capture.

## Storage / backup

- Primary app state: browser/WebView local storage under the PE Ultimate namespace.
- Record videos: IndexedDB.
- Native safety mirror: `pe-ultimate-data.json` in the app's internal filesystem, written by `hm-native.js`.
- User backup files: exported to a location chosen through the OS share sheet; encrypted `.hmg` remains an explicit user export.
- Android: `android:allowBackup="true"`; no `fullBackupContent` / `dataExtractionRules` exclusion is present in the reviewed manifest. Therefore eligible app data can be included in Android/Google backup depending on OS behavior and the user's settings.
- The new in-app “Delete all data” flow removes PE Ultimate local keys, session data, records IndexedDB, and the native mirror, but it does not delete copies the user already exported, external Drive/Form content, Netlify form submissions, or an already-existing Google system backup.

## Permissions inventory

### Android

From `native/android/app/src/main/AndroidManifest.xml`:

- `INTERNET` — contact submission, optional sync, external/user-directed online flows.
- `CAMERA` — Photo Finish / record-video capture.
- `RECORD_AUDIO` — live start-signal detection.
- `MODIFY_AUDIO_SETTINGS` — audio behavior required by the start/audio workflow; should remain documented as an Android implementation permission rather than a separate user-data collection claim.
- Camera and microphone hardware features are marked optional (`required=false`).

### iOS

From `native/ios/App/App/Info.plist`:

- `NSCameraUsageDescription` — Photo Finish and record videos; states images are processed on device.
- `NSMicrophoneUsageDescription` — live shot/clap detection; states audio is not recorded or sent.
- `NSPhotoLibraryAddUsageDescription` — save an image/video selected by the user.

Open iOS polish item: permission strings currently contain English and Hebrew together instead of proper per-locale strings.

## Claim cross-check

| Claim | Status | Correct wording / action |
|---|---|---|
| “All pupil/student data stays only on this device.” | **Wrong as an absolute statement** | Say local by default, but Android system backup may copy eligible app data to the user's Google backup account; teacher-configured sync/export can also transfer selected data. |
| “Only the contact form sends data.” | **Wrong** | Contact form is developer/operator collection; optional sync, Drive/Form upload and user exports are separate user-directed transfers. |
| “No ads / no analytics tracking.” | **Supported by reviewed code** | Keep, but phrase as current app behavior, not an immutable promise. |
| “Camera images and microphone audio are not uploaded by default.” | **Supported by reviewed code and permission text** | Keep. Do not make an accuracy/certification claim about timing. |
| “Users can delete app data.” | **OK after fa9f29e** | In-app wipe exists; explain exclusions: exported copies, Google backup, Netlify submissions and external Drive/Form content need separate deletion. |
| “18+ intended audience.” | **OK as product decision** | Keep adults 18+ (PE teachers, coaches, trainers); not Kids/Families. |
| “No health features.” | **Do not use** | PE Ultimate records physical activity / fitness-performance information, so complete the Health Apps declaration truthfully under Health and fitness / Activity and Fitness as applicable. |

## Proposed Google Play answers (draft — owner must confirm in current console)

### Data safety

Recommended approach:

1. **Does the app collect or share user data?**
   - **Yes**, because the optional contact/deletion form sends personal/contact information and message content to the developer's Netlify form endpoint.

2. **Developer-collected data types for that flow**
   - Personal info: name, email, phone if entered.
   - Messages/other user content: support/deletion request text.
   - Collection is optional and user-initiated.
   - Purpose: app functionality/support/account-independent customer communication.
   - In transit: HTTPS.
   - Deletion request mechanism exists.

3. **Pupil/class/fitness records**
   - Stored locally by default and not uploaded to the developer by default.
   - Do not describe them as “never leaving the device” because Android system backup and teacher-configured sync/export may move them to the user's chosen account/service.
   - For Play's Data safety form, distinguish developer collection from user-initiated transfers and OS backup using the exact current console definitions before submitting.

4. **Sharing**
   - Netlify acts as the service provider for the contact form; teacher-selected Drive/Form/email/WhatsApp destinations are user-directed exports rather than silent third-party sharing by the developer.

Google's current Data safety guidance says on-device-only access generally is not “collected,” and also documents exceptions for some user-directed/service-provider transfers. Final answers must follow the exact wording shown in the owner's current Play Console.

### Health Apps declaration

Google currently requires all Play apps to complete the Health Apps declaration, including closed testing. The official declaration specifically lists **Health and fitness -> Activity and Fitness** for apps that monitor/record physical activities, exercise routines or workouts. PE Ultimate contains fitness tests/performance measurements and PE activity workflows, so the safe draft is:

- Do **not** certify “My app doesn't provide any health features.”
- Declare the applicable **Activity and Fitness** functionality.
- State clearly that PE Ultimate is an educational/coaching utility and is not a medical device, diagnosis, treatment, or clinical-research app.
- Do not claim validated medical or measurement accuracy.

Official reference checked 2026-10-13: Google Play Console Help, “Provide information for the Health apps declaration form” and “Health Content and Services.”

### Content rating / target audience

- Target audience: adults 18+ — PE teachers, sports coaches, fitness trainers.
- Not designed for children / not a Kids or Families app.
- Complete the current IARC/content-rating questionnaire based on actual content; do not manufacture a rating in advance.

## Privacy page consequences

Current privacy text should preserve these distinctions:

1. Local-by-default pupil/class/assessment data.
2. Android Google Backup can copy eligible app data when enabled.
3. Optional teacher-configured record sync may send record fields to a URL selected/configured by the teacher.
4. Optional Drive/Form upload and backup sharing are user-directed transfers.
5. Contact/deletion forms are the developer-operated collection path.
6. In-app wipe does not erase external/exported/server/system-backup copies.

Claude already fixed the malformed privacy heading and added Android backup text; do not reintroduce the old absolute “device only” wording.

## Remaining outside C1

- **C2 AAB binary inspection:** still requires the actual release artifact/binary tools. Not claimed complete here.
- **C4 200% font / small-screen screenshot audit:** still requires running Playwright against the app and saving evidence. Not claimed complete here.
- Physical-device behavior is not proven by this repository review.

## Commands / evidence used in this pass

- GitHub current-main file inspection: `AGENTS.md`, `hm-native.js`, `hm-app.js`, Android manifest, iOS Info.plist, existing C1 preliminary handoff, current owner data/deletion document, issue #55.
- Official Google Play policy/help pages checked on 2026-10-13 for Data safety, Health Apps declaration and content rating requirements.
- No local test suite was run in this pass because the connected environment exposes repository reads/writes but not a checked-out runnable repository. No test result is claimed.
