# Apple and Google store policies

Store policies and console forms change often. Everything here is a project-specific starting point; confirm each item against the live console and current official policy pages before the owner submits. Agents never submit, sign or upload.

## Shared facts for both stores

- App name: **PE Ultimate App**. Android package: `io.github.osher15.peultimate`.
- Audience: adults (18+), teachers and coaches. Not designed for children; no child-directed features.
- Free, no in-app purchases, no ads, no tracking, no accounts.
- Privacy policy URL: `https://pe-ultimate.netlify.app/privacy.html` (must be live and match the app build being submitted).
- Fitness measurements are educational aids, not medical devices. Do not claim certified timing, medical accuracy or diagnosis.
- Do not use third-party trademarks in listings (e.g. the FITNESSGRAM name was removed on 2026-10-12; the in-app About screen keeps attribution and non-affiliation).
- Listing text must describe only what exists in the shipped build (`docs/store-listing/STORE_LISTING_2026-10-05.md`). Screenshots come from the real app.

## Google Play

| Item | Project answer (draft; verify in console) |
|---|---|
| Data safety: collects data? | **Yes**: optional contact form (name, email, phone, message). Not shared, not sold, optional, purpose "developer communications / support". Encrypted in transit (HTTPS). Deletion can be requested |
| Data safety: student data, photos, video, audio | Not collected by the developer (stays on device). User-directed transfers to the user's own Google Drive/Sheet and Android Auto Backup (off by default) must be evaluated against Google's current definitions, not assumed |
| Health apps declaration | Choose the activity and fitness category; do not answer "no health features". No Health Connect permissions are used |
| Target audience and content | 18+. Do not select child age groups; selecting them brings the Families policy into scope |
| Content rating | Answer the questionnaire from the real content (no violence, sexual content, gambling, drugs, user-to-user communication) |
| Ads | No |
| Account deletion requirement | Not applicable while the app has no accounts. Becomes mandatory (in-app and web deletion path) if accounts are ever added |
| Permissions | CAMERA, RECORD_AUDIO (runtime, explained in privacy page), INTERNET, MODIFY_AUDIO_SETTINGS (needed by WebView microphone capture; do not remove) |
| Target API level | `targetSdkVersion = 36` in `native/android/variables.gradle`; check Play's current minimum target level at submission time |
| Backup | `allowBackup="true"`, custom `PEBackupAgent`, `fullBackupOnly="true"`; app data copied only when the teacher enables the in-app setting. Device-test before stating behavior |
| Signing | Play App Signing with an owner-held upload key. Never commit keys or keystores |
| New personal developer accounts | Have been required to run a closed test with a minimum number of testers for a minimum period before production; check the current requirement |
| Payments | None. If ever added: Play Billing for digital goods (see `payments-and-subscriptions.md`) |

Detailed owner guide: `docs/PLAY_LAUNCH_SECURITY_CHECKLIST_2026-10-13.md`.

## Apple App Store

| Item | Project answer (draft; verify in App Store Connect) |
|---|---|
| App Privacy ("nutrition label") | Contact info (name, email, phone) and user content (message) collected only via the optional form, linked to the user, not used for tracking. Student data not collected by the developer |
| Privacy manifest | `native/ios/App/App/PrivacyInfo.xcprivacy`: tracking false, no tracking domains, required-reason APIs declared. Update when any SDK or required-reason API changes |
| Usage descriptions | Camera, microphone, photo-library-add: English in `Info.plist`, localized in `{en,he,ar,ru,es}.lproj/InfoPlist.strings` (since 2026-10-16) |
| Guideline 4.2 (minimum functionality) | The app is a Capacitor wrapper of a web app. Make sure native value is visible (offline use, camera photo-finish, file sharing, native backup) and the review notes explain it |
| Guideline 5.1.1 (data collection and storage) | Privacy policy link in the app and listing; only data needed for the feature; account deletion only relevant if accounts are added |
| Guideline 5.1.2 / student data | State in review notes that pupil data is entered by the teacher, stays on the device and is not sent to the developer |
| Kids Category | Do not use. The app is for adults |
| Guideline 3.1.1 | Not applicable while free; any digital unlock would require In-App Purchase |
| Health claims | No medical claims; fitness estimates labeled as educational |
| Status | iOS submission waits for the owner's Mac and Apple developer account; nothing has been submitted |

## When a change affects the stores

Any change to outbound data, permissions, SDKs, audience, purchases or accounts requires the owner to update Play Data safety and/or Apple App Privacy **before** the build that contains it is released. Put the exact declaration changes in the handoff.
