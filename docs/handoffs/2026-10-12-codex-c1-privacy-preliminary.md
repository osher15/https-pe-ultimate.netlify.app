# C1 preliminary privacy/store evidence audit — 2026-10-12

**Status: PARTIAL, NOT store-approved.** Dedicated docs-only branch; no product edits, no submission. This report is for Claude to verify and finish. GitHub file reads only; no app runtime or network tracing.

| Claim / question | Code evidence | Status and action |
|---|---|---|
| "All student data stays only on device" | `native/android/app/src/main/AndroidManifest.xml`: `android:allowBackup="true"`; privacy.html says local-only | **Potentially misleading.** Android Auto Backup may copy eligible app data to the user's Google account, depending on actual backup rules, app target and device. Inspect `dataExtractionRules`, `fullBackupContent`, native storage locations and exclusions before making absolute local-only claims. Distinguish operator collection from OS-managed backup. |
| "Only contact form sends information" | `privacy.html` itself documents opt-in Google Sheet record sync and Google Drive backup | **Wrong if stated unconditionally.** Declare optional user-directed outbound transfers separately; audit `hm-*.js` request call sites. |
| Native packaged app files | `native/build-web.js` includes `privacy.html`, `terms.html`, `contact-received.html`, all `hm-*.js`, local fonts | **OK for file inventory**; network inventory still requires reading every JS call site. |
| Native HTTP | `native/capacitor.config.json` has `CapacitorHttp.enabled=false`; readiness doc says contact POST via native HTTP | **Needs runtime inspection.** Config flag does not alone prove absence of native plugin HTTP calls. |
| Android camera/microphone | `native/android/app/src/main/AndroidManifest.xml`: CAMERA, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS; optional hardware features | **Declared.** Camera for photo finish/record video, microphone for start detection per privacy text. Verify runtime permission-denial behavior and whether MODIFY_AUDIO_SETTINGS is essential. |
| Android INTERNET | Android manifest | **Declared.** Contact form, optional external links and user-directed sync/backup may require network. |
| iOS permission descriptions | `native/ios/App/App/Info.plist`: NSCameraUsageDescription, NSMicrophoneUsageDescription, NSPhotoLibraryAddUsageDescription | **Present.** English and Hebrew text mixed in each prompt despite English-first UI; review localization and exact feature usage. |
| Privacy HTML validity | `privacy.html` Hebrew section has `<<h2>מחיקת נתונים במכשיר</h2>` | **Bug.** Extra `<` creates malformed markup. Fix in product/privacy file only with owner/Claude coordination. |
| No tracking/ads | `privacy.html` asserts none | **Unknown** until complete JS/native dependencies and outbound requests audit. |
| Netlify contact retention | `privacy.html` promises manual 18-month review and max 24 months | **Operational claim, unverified.** Owner must actually enforce the policy or amend it. |
| 18+ intended audience | `privacy.html` and launch plan | **Declared**; console target audience/content rating still must be completed truthfully. |
| Health apps declaration | Fitness tests, performance data, measurements in privacy/readiness | **Requires console policy classification**; do not answer categorically until current Play question and app scope verified. |

## Provisional Play Console guidance (NOT final answers)
- **Data safety:** do not select "no data leaves device" until contact submission, opt-in Google Sheet sync, Drive exports, server logs, and Android Auto Backup behavior are individually evaluated under Google's definitions. User-directed transfers and service-provider handling can have different treatment; verify definitions in current Console.
- **Content rating:** adult teacher/coaching utility; answer actual questionnaire, no fabricated rating.
- **Health apps:** explain educational fitness measurements, not medical diagnosis or treatment; check actual current declaration prompts rather than guessing yes/no.

## Required next evidence for Claude/Codex
1. Search all packaged `hm-*.js`, `index.html`, `privacy.html` for `fetch(`, `XMLHttpRequest`, `CapacitorHttp`, `sendBeacon`, WebSocket, external resources, form POSTs, Google Sheets and Drive. Record file and line, trigger, destination, data fields, default/optional, and whether app or browser initiates it.
2. Inspect native backup XML configuration and file locations; test backup/restore behavior on a real Android device where possible.
3. Inspect actual `hm-native.js` storage bridge and IndexedDB; distinguish encrypted export from OS backup.
4. Verify actual store declarations against the current official Play Console policy and get owner confirmation before submitting.

## Coordination
C3 device sheet completed separately on `codex/launch-device-sheet-2026-10-12` (not executed on device). C5 guard created on `codex/prelaunch-guard-2026-10-12`, with macOS portability fix commit `cd826de`; execution still pending. C2 artifact and C4 Playwright evidence pending. No merge/deploy/main changes.
