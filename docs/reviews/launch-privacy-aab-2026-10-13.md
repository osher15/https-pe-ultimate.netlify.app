# Google Play privacy + AAB evidence review — 2026-10-13

Status: evidence review only. No product code, native config, signing, upload, Play Console submission, merge or deploy.

## Scope and evidence level

- Current source reviewed at `main` `fa9f29e0d87ae493cd569955aeb24b39e16500fb` for privacy wording and native manifests/config.
- Actual unsigned AAB inspected from GitHub Actions run `38270990317`, commit `54c8afcedde2301525b98e9313fdf75776cd5005`, artifact `pe-ultimate-android-release-unsigned` (11,874,708 bytes, expires 2026-10-26).
- The AAB predates current main. Its packaged network call sites were inspected because it is the concrete release artifact available; current-main privacy/manifest changes were reviewed separately. No claim is made that this artifact equals `fa9f29e` byte-for-byte.
- No physical-device traffic capture or Play Console submission was performed.

## C1 — network and data-flow inventory

The inspected packaged app contained these outbound-capable paths.

| Trigger | Destination | Data / purpose | Default? | Evidence / assessment |
|---|---|---|---|---|
| Contact or deletion form, explicit Send | `https://pe-ultimate.netlify.app/` through native `CapacitorHttp.request` | contact/delete kind; first/last name for contact; email; phone; optional message; UI language; build | Optional, user initiated | `hm-new.js` builds the payload; `hm-native.js` posts it. This is developer collection and belongs in Data safety. |
| Google Drive backup, explicit teacher setup + action | Google Identity Services + `googleapis.com/drive` / upload API | encrypted backup file; OAuth token; app-created folder/file metadata | Optional, user initiated | `hm-app.js` loads GIS, requests `drive.file`, creates/fetches the app folder and uploads only when encrypted backup is enabled. |
| Records sync, only after teacher configures URL/code | teacher-provided `SET.syncUrl`, typically Google Apps Script / Sheet | sync code plus record `id`, sport, pupil name, class, value/result, status, source/timestamps, video-present boolean; video itself is not synced | Optional; writes occur after record changes and manual sync paths | `hm-app.js` `stripForSync`, `syncPush`, `syncPull`. Student data can leave the device when the teacher enables this feature. |
| Version check | relative `version.json` | no pupil/contact data | Automatic in web build; relative/internal | `hm-app.js`. In a packaged build this is an app-relative resource, not evidence of developer collection. |
| Save a generated download in native app | blob/data URL fetched locally, then native save/share | generated local file/blob | User initiated, local | `hm-native.js`; this is not an internet transfer. |
| External resource/source links | browser/open-web destinations such as YouTube or cited sources | normal browser navigation | Only on tap | Open-web navigation is separate from app-controlled collection; privacy text correctly says links open on user action. |

Search of the packaged web files found no `XMLHttpRequest`, `sendBeacon` or WebSocket call sites and no analytics/ads endpoints. Local fonts are packaged with the app.

### Commands used against the downloaded artifact

```text
unzip pe-ultimate-android-release-unsigned.zip
unzip pe-ultimate-release-UNSIGNED-7af8b4b3-54c8afc.aab
jarsigner -verify -verbose -certs pe-ultimate-release-UNSIGNED-7af8b4b3-54c8afc.aab
grep -RInE 'fetch\(|XMLHttpRequest|CapacitorHttp|sendBeacon|WebSocket|accounts.google.com|googleapis.com|syncUrl|LEAD_ENDPOINT' base/assets/public --include='*.js' --include='*.html'
find base -name '*.so' -print
strings base/manifest/AndroidManifest.xml
```

`jarsigner` result ended with `jar is unsigned.`. No `.so` files were present.

## Permissions / platform declarations

### Android current main

`native/android/app/src/main/AndroidManifest.xml` declares:

- `INTERNET` — needed for the optional contact/deletion form, optional records sync and optional Google Drive flow.
- `CAMERA` — photo-finish and record-video features. Camera hardware is `required=false`.
- `RECORD_AUDIO` — live start-signal detection. Microphone hardware is `required=false`.
- `MODIFY_AUDIO_SETTINGS` — declared, but no direct JavaScript call site proving a PE Ultimate-specific use was found in this review. Treat as **needs native/WebView dependency justification**, not as proven unused.
- No location, contacts, notifications or broad external-storage permission was found in the app manifest.

The application has `android:allowBackup="true"`. There are **no** `dataExtractionRules` / `fullBackupContent` rules in `res/xml` on current main; the only XML resource there is `file_paths.xml`.

### iOS current main

`Info.plist` has:

- `NSCameraUsageDescription` — photo-finish / record video.
- `NSMicrophoneUsageDescription` — start-signal detection; text says audio is not recorded or sent.
- `NSPhotoLibraryAddUsageDescription` — saving an image/video chosen from the share flow.

The strings are bilingual English/Hebrew in one prompt even though English is the base UI. This is not a blocker for the Android launch but should eventually be localized with normal iOS localization files rather than mixed text.

## Storage and Android backup

Core app state is local: namespaced `localStorage`, IndexedDB for records/media, and the native mirror `pe-ultimate-data.json` under the Capacitor Library area. Current main also has an in-app wipe flow that removes namespaced local/session data, records IndexedDB and the native mirror.

Because Android currently has `allowBackup=true` and no explicit exclusion rules, eligible private app/WebView data **may be copied by Android Auto Backup to the user's Google account and later restored**. A source review alone cannot prove exactly which WebView/IndexedDB files each Android/WebView version includes, so this remains a physical-device / platform-backup verification point. The current privacy policy now states this possibility explicitly and correctly distinguishes it from operator access.

Do not use an absolute store claim such as "student data never leaves the device." A safer exact claim is: **"Core student data is stored locally and is not sent to the app operator. Teacher-enabled sync/Drive features and Android system backup can transfer data off-device."**

## Claim → evidence → status

| Claim | Evidence | Status |
|---|---|---|
| No account / no own pupil-data server | No account system found; core records are local; operator receives only the optional contact/deletion form | **OK with qualifier**: optional teacher-controlled Google transfers and Android Auto Backup still exist. |
| Student lists/results/grades are stored locally | localStorage + IndexedDB + native mirror | **OK** for primary storage. |
| Student data is not sent to the operator | Contact payload contains no pupil fields; sync/Drive destinations belong to teacher-configured Google services | **OK based on inspected paths.** |
| "Your data stays with you" / "stored locally" in store listing | Core storage is local, but optional sync sends pupil name/class/result and Android backup can upload eligible app data | **Wording needs qualification** if interpreted as "never leaves device". Current privacy page has the needed qualification; listing should avoid absolutes. |
| Only contact/delete form sends data to operator | Native form POST is the identified operator endpoint | **OK based on inspected packaged code.** |
| Optional Google Sheet sync sends structured record data | `stripForSync` + `syncPush` / `syncPull` | **OK** and must be reflected in Data safety analysis. |
| Optional Drive backup is encrypted | `gdBackupNow` refuses Drive backup unless encrypted option is on | **OK for inspected artifact flow**; a cryptographic implementation review was not repeated here. |
| No analytics / ads / trackers | No analytics/ad endpoints and no beacon/XHR/WebSocket paths found; privacy says none | **OK for inspected packaged build**, not a packet-capture proof. |
| Camera used for photo-finish/video | manifest + product feature | **OK.** |
| Microphone used for live start detection; audio not recorded/sent | manifest + app wording; no outbound audio path found | **OK based on source review**, not a microphone packet capture. |
| No location / contacts / notifications | permissions absent from Android manifest | **OK.** |
| Android may back up pupil data to user's Google account | `allowBackup=true`, no exclusion rules | **Correctly disclosed on current privacy page.** |
| Deleting app removes device copy | Android normally removes app sandbox, but Auto Backup can later restore eligible data | **Needs the existing backup qualifier**; current privacy page includes it. |

## Proposed Google Play Data safety answer set

This is a draft for the owner to enter/review in Play Console, not a submission.

1. **Does the app collect or share required user data types? — Yes.** The optional contact/deletion form transmits personal information off device. Google defines collection as off-device transmission, including SDK/library transmission.
2. **Personal info collected by the developer:**
   - Name — optional (contact form only; not required for deletion request).
   - Email address — optional / one accepted identifier for contact or deletion.
   - Phone number — optional / one accepted identifier for contact or deletion.
   - Other info — optional message text if the current Play taxonomy requires it to be mapped there.
   - Purpose: app functionality / developer communications (support, contact, deletion handling). Not advertising, not sale.
3. **Sharing for that contact data:** propose **No sharing** if Netlify is being used solely as the operator's service provider under Google's service-provider exception. Keep the Netlify processing disclosure in the privacy policy.
4. **Teacher-enabled records sync:** conservative declaration route is to treat the off-device record fields as optional collection/transmission: Name, other personal info (class where applicable), and Health & fitness / fitness information for performance results. The transfer is initiated/configured by the teacher and goes to the teacher's endpoint. Google's user-initiated-transfer exception can remove it from **sharing**, but it does not automatically erase the fact that the app transmits data off device. Confirm the exact current form wording before submission.
5. **Encrypted Drive backup:** the app requires encryption before Drive upload. Google says truly end-to-end encrypted data unreadable by developer/intermediaries can fall outside collection disclosure. Only use that exclusion after confirming the backup encryption/key handling still satisfies that definition in the release build. Otherwise declare conservatively.
6. **Data encrypted in transit — Yes** for identified internet flows when destinations are HTTPS. The configurable sync URL should be constrained/documented as HTTPS before relying on a blanket Console answer; source currently accepts a generic URL field.
7. **Deletion request — Yes:** current app exposes a contact-data deletion request, and current main also has "Delete all data from this device" for local data. There is no user account to delete.
8. **Ads / sale — No** based on current code/policy.

Official reference checked 2026-10-13: https://support.google.com/googleplay/android-developer/answer/10787469

## Health apps declaration

Do **not** choose "My app doesn't provide any health features." PE Ultimate records physical-activity / exercise / fitness test results and estimates fitness figures. Google's current declaration guidance explicitly lists **Activity and Fitness** for apps that monitor/record physical activity, exercise routines/workouts and fitness-related measurements. Proposed category: **Health and fitness → Activity and Fitness**, while clearly stating the app is educational/teaching software, not medical advice, diagnosis or a medical device.

Official reference checked 2026-10-13: https://support.google.com/googleplay/android-developer/answer/14738291

## Content rating draft

Target audience remains adults 18+ (teachers/trainers/coaches). For the content-rating questionnaire, answer from actual app content rather than using the audience decision as a substitute for the questionnaire. Based on the inspected product, no sexual content, gambling, drug promotion, graphic violence or online user-to-user communication feature was identified. Same-device pupil record entry is not an online social network. The owner still needs to complete the live questionnaire; no rating is claimed here.

## C2 — actual unsigned AAB inspection

| Item | Result |
|---|---|
| GitHub run | `38270990317`, run #47, commit `54c8afc`, conclusion `success` |
| Artifact | `pe-ultimate-android-release-unsigned`, 11,874,708 bytes |
| AAB filename | `pe-ultimate-release-UNSIGNED-7af8b4b3-54c8afc.aab` |
| Package ID | `io.github.osher15.peultimate` (binary manifest string + Gradle) |
| versionName | `1.0-7af8b4b3` (binary manifest) |
| versionCode | **47 inferred** from workflow run number 47 and Gradle `versionCode = GITHUB_RUN_NUMBER`; the available binary-string tooling did not decode the integer attribute directly |
| minSdk | 24 (Gradle config; D8 metadata also reports min API 24) |
| targetSdk | 36 (Gradle config) |
| compileSdk | 36 (Gradle config) |
| Signing | **Unsigned** — `jarsigner` says `jar is unsigned`; release build type has no signingConfig; CI also checks for signature entries |
| Native `.so` libraries | **None found** in the AAB |
| AGP metadata | Android Gradle Plugin 8.13.0; D8 metadata 8.13.6 |

### Target API requirement

As of 2026-10-13, Google Play requires new mobile apps and app updates submitted from 2026-08-31 to target Android 16 / API 36 or higher. This AAB's targetSdk 36 meets that requirement.

Official reference: https://support.google.com/googleplay/android-developer/answer/11926878

### 16 KB page-size requirement

Google's current guidance says apps targeting API 35+ must support 16 KB memory page sizes on 64-bit devices, with Play blocking non-compliant updates from 2027-02-01. The inspected AAB contains **no native `.so` libraries**, so there is no app-bundled ELF library whose segment alignment needs rebuilding in this artifact. On that evidence, no 16-KB native-library patch is indicated. Still confirm the Play Console compatibility report/pre-launch result after the signed upload because that is the authoritative distribution-time check.

Official reference: https://developer.android.com/guide/practices/page-sizes

## Remaining release caveats

- This AAB is deliberately unsigned and cannot be uploaded as the final Play artifact until the owner's upload-key / Play App Signing flow is used.
- The artifact is from commit `54c8afc`, not current main `fa9f29e`; build a fresh signed release after owner approval so current wipe/privacy/photo-finish work is included.
- `MODIFY_AUDIO_SETTINGS` still lacks a direct app-level justification in this review.
- The configurable records-sync URL should be explicitly HTTPS-only before relying on a universal "encrypted in transit" declaration.
- Physical Android backup/restore behavior remains device evidence, not source proof.
