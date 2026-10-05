# Native release checklist (#13) — Google Play and App Store

Scope: the existing Capacitor app (`native/`). Nothing here uploads, signs or submits anything; the owner does those steps.
Background and requirement research: `docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md` (checked against official pages on 2026-09-29). **Re-check the account-specific requirements in each console at submission time.**

## 1. Evidence levels (never mix them)

| Level | What it proves | Today |
|---|---|---|
| Unit / browser tests | Web logic, simulated native bridge | Pass in CI on every PR |
| CI build | The project compiles (Android debug APK; iOS simulator, unsigned) | Pass in CI. Release AAB job added in this change |
| Emulator / simulator | Runs, not a device | Not recorded |
| Physical device | Real behavior | Owner reports: iOS tablet worked (minor zoom issue, CSS guard added, not re-checked), Android APK "excellent". No written per-step result yet |
| Signed store build | Store-ready | None. No signing key exists in the repo or CI |

## 2. What CI now produces

- **Android debug APK** (every PR/main push): `pe-ultimate-debug-<build>-<sha>.apk`, signed with the fixed debug key so a newer APK installs over an older one and keeps data. Version name `1.0-<build>`, version code = CI run number.
- **Android release AAB, unsigned** (manual run or push to main only): artifact `pe-ultimate-android-release-unsigned`, file `pe-ultimate-release-UNSIGNED-<build>-<sha>.aab`. The job fails if the file turns out to contain a signature. It cannot be uploaded as is.
- **iOS**: unsigned simulator compile only. A real device or TestFlight build needs the owner's Mac and signing (section 4).

Not verified here: the new release job has not run yet (the sandbox has no Android SDK). Its first run is on the PR/main; check the log before relying on it.

## 3. Owner decisions needed before any submission

1. **Package / bundle ID** (`app.netlify.peultimate` was temporary and is now `io.github.osher15.peultimate` and permanent after first upload; changing it later means a new app).
2. **Target audience** (staff only, or mixed with Families requirements, because student mode exists).
3. **Age rating answers**, including the fitness/health question.
4. **Export compliance answers** (AES-GCM backup encryption).
5. **Data safety / App Privacy wording** (drafts in the readiness doc §6).
6. **1024 px original icon** (current one is an upscale of the 512 px).
7. **Store-specific privacy sentence** ("deleting the app deletes its data; back up first").
8. **Accounts**: Apple Developer Program (99 USD/year), Google Play Console (25 USD once). Only after the device tests below.

## 4. Signing and upload (owner only)

Android:
1. Create an upload key once (Android Studio: Build → Generate Signed App Bundle, or `keytool -genkeypair -v -keystore upload.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`). Keep the file and passwords outside the repo, with a backup.
2. Download the unsigned AAB from the CI artifact, sign it with `jarsigner -keystore upload.jks <file>.aab upload`, or rebuild locally in Android Studio.
3. Upload to an internal test track first. Enrol in Play App Signing.
4. New personal accounts: closed test with 12 testers for 14 days before production (verify in the console).

iOS (Mac with Xcode 26):
1. `cd native && npm ci && node build-web.js && npx cap sync ios && npx cap open ios`.
2. Target App → Signing & Capabilities → your team. Set Version and Build (currently 1.0 / 1; **raise Build on every upload**).
3. Product → Archive → Distribute App → TestFlight / App Store Connect.
4. In App Store Connect: privacy policy URL `https://pe-ultimate.netlify.app/privacy.html`, App Privacy, age rating, export compliance, iPhone and iPad screenshots, review notes (readiness doc §6).

## 5. Physical-device pass (owner; about 30 minutes per device)

The step list is `docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md` §9 "Device test script". Record per device: model, OS version, build id (Settings), pass/fail per step. Required before the first store upload:

- **Upgrade without uninstall (Android):** install the APK from build N, create a class with students and a grade, then install a newer CI APK over it without removing the app. Data must remain. Expected to pass because of the fixed debug key and rising version code; **not yet recorded as tested**.
- **Upgrade (iPhone/iPad):** Run again from Xcode over the existing install; data must remain.
- **Debug to store build:** keys differ, so this is an uninstall. Back up to a file first and restore (readiness doc §3).
- Offline first launch; backup to file, restore, encrypted `.hmg`; print/PDF; camera and microphone; silent switch; back button; **iOS input zoom** (the 16 px CSS guard, `tests/unit/iosinputzoom.test.js`, still needs a device check); the new lesson bank (open one sport, then airplane mode, then open another).

## 6. Store assets inventory

| Asset | State |
|---|---|
| App icon 1024 px (iOS, no alpha) | Needs the original (see decision 6) |
| Android adaptive icon, splash | In `native/assets` and the Android resources |
| Screenshots (iPhone, iPad, Android phone/tablet) | None captured from the real app. Take them on the device or simulator after the device pass. `docs/shots6` are web UI review shots, not store assets |
| Listing text (5 languages), short description | Not written. Proposal needs the owner's wording and the audience decision first |
| Privacy policy | Live; needs the store sentence (decision 7) |

## 7. Not done on purpose

No signing key, secrets, store upload, account creation, payment, or release automation. Merging and deployment stay with the owner.
