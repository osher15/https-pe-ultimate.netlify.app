# PE Ultimate — Google Play and App Store readiness (2026-09-29)

Preparation only. Nothing was uploaded or submitted to either store, no store agreement
was accepted and nothing was bought. Requirements were checked against official Apple,
Google and Capacitor pages on 2026-09-29 (links inline). Items not re-read there say
**verify in the console**.

Status words used below — kept apart on purpose:

- **Code prepared**: in the repo; checked by automated tests (unit tests, and Chromium with a
  simulated Capacitor — `tests/e2e/native.e2e.js`). Not the real shell, not a device.
- **Build**: compiled by CI (`.github/workflows/native.yml`). See the latest run for the result.
- **Device**: run on a real phone or tablet by a person. **Nothing has passed on a device yet.**
  A simulator or emulator run does not count as a device run.

## 1. Choice of shell: Capacitor for both stores

The same web code (`index.html`, `hm-*.js`, `hm-styles.css`) ships in both apps. Capacitor
bundles those files into a native app and adds one small bridge file, `hm-native.js`. The bridge
does nothing in a normal browser.

| | Capacitor (Android + iOS) | TWA on Android + a separate iOS solution |
|---|---|---|
| Shared code | One shell and one bridge file for both stores | TWA covers Android only. iOS needs a WebView shell anyway (in practice Capacitor), so there would be two shells to maintain |
| Offline | Files are inside the app: the first launch works with no network | The first launch needs the network. After that, offline depends on the service worker cache in Chrome |
| Teacher data | App container, plus a native copy (see §3). Uninstalling deletes it (Android Auto Backup may restore it) | Chrome's storage for the site: clearing Chrome's data or site data wipes it |
| Device features | Supported plugins: file save and share, keep-awake, speech on Android, status bar. On iOS, beeps mix with music and play when the ringer is silent (native audio session) | Only what Chrome offers the site. No control over the iOS audio session |
| Updates | Each change is a store release (review time). No live-update service added | Instant on Android (web deploy). iOS still needs store releases |
| Google Drive direct backup | Not available (Google blocks sign-in inside WebViews — [disallowed_useragent](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)). Replaced by "backup file → share sheet → Drive" | Works on Android (Chrome) |

**Recommendation: Capacitor for both.** It needs no rewrite, gives one maintenance path and full
offline use, keeps the data inside the app, and gives iOS a real advantage for timers and beeps.
The costs: a store release for every change, and an Xcode and Gradle upgrade roughly once a year.

Versions in use: Capacitor 8.5.2 (latest major, v8). It requires Xcode 26 and supports iOS 15+ and
Android 7.0+ (API 24) ([support policy](https://capacitorjs.com/docs/main/reference/support-policy)).
Android `targetSdk`/`compileSdk` = 36 (`native/android/variables.gradle`).

## 2. Gap list — what behaves differently in the packaged app

| Area | In a WebView shell | What was done | Status |
|---|---|---|---|
| File export (CSV, backup, PNG, record files) | `<a download>` does nothing in a WebView | Bridge writes the file to the app cache and opens the system share sheet (Files, Drive, mail, WhatsApp). Cancelling says "not saved" | Code prepared, tested with the simulated plugins |
| Print / PDF (class report, lesson plan, teams, certificates) | `window.open("")` returns nothing on iOS; on Android it would load into the app's own view | The document opens inside the app, with "Save or share". The shared `.html` file offers printing when opened in a browser | Code prepared. **Printing itself needs a device check**; a native print plugin was not added |
| Backup restore | `<input type=file>` works in both shells | Accept list widened so iOS does not grey out encrypted `.hmg` files | Code prepared. Device check needed |
| Service worker | Not needed; on Android it would serve stale files after an app update | Not registered in the app | Code prepared, tested |
| Data durability | The OS may reclaim WebView storage when space runs low ([Capacitor storage guide](https://capacitorjs.com/docs/guides/storage)) | Every change is also written to `Library/pe-ultimate-data.json` (native). If localStorage is empty at launch, it is restored and the teacher is told | Code prepared, tested (simulated eviction and reopen). Record videos (IndexedDB) are **not** in this copy; they are in the full backup file |
| Contact form | The page is not served from Netlify, and a cross-origin POST is blocked | Posts to `https://pe-ultimate.netlify.app/` through native HTTP (CapacitorHttp). "Received" only after the server's acknowledgment | Code prepared, tested with a simulated reply. **Not sent live** (only one TEST submission was authorised, and it has been used) |
| Google Drive direct backup | Google refuses OAuth in a WebView | Hidden in the app. A hint points to file backup → share → Drive | Code prepared, tested |
| Records sync to the teacher's Google Sheet | Cross-origin POST to Apps Script from `capacitor://localhost` / `https://localhost` | Unchanged | **Device check needed** |
| Keep screen on | Wake Lock in a WebView is not guaranteed | `@capacitor-community/keep-awake` in the app | Code prepared, tested (simulated) |
| Voice cues (21 call sites) | Android WebView has no `speechSynthesis` | `@capacitor-community/text-to-speech` when it is missing | Code prepared, tested (simulated) |
| iPhone silent switch / music | Web Audio is muted by the silent switch | `AVAudioSession` set to `.playback` + `.mixWithOthers` in `AppDelegate.swift` | Code prepared. **Device check needed** (WebKit may change the session) |
| Timers when the screen is locked or the app is in the background | JS is suspended in both shells | Keep-awake prevents auto-lock during timers. No background audio mode was added | Known limitation — document for teachers |
| Notch / home indicator / Android edge-to-edge | Content under the system bars | `viewport-fit=cover`; CSS uses `var(--safe-area-inset-*, env(...))` (Capacitor 8 SystemBars injects these on old Android WebViews); overlays padded | Code prepared. **Device check (portrait and landscape)** |
| Status bar text colour | Must follow the theme ("day" is light) | SystemBars `setStyle` on every theme change | Code prepared, tested (simulated) |
| Camera / microphone | Needs native permission strings | Android: `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`, camera/mic not required to install. iOS: camera, microphone and photo-library-add usage strings (Hebrew + English) | Build config prepared. **Device check** |
| Fonts | Were loaded from Google Fonts. Offline, the system font was used | **Bundled locally** (`hm-fonts.css`, `fonts/`): Heebo, Inter (variable) and Share Tech Mono, as published by Fontsource. SIL OFL 1.1; the licence texts are in `fonts/OFL-*.txt`. Share Tech Mono has a Reserved Font Name, so its file ships unmodified. The single-file version embeds the main subsets. No request to Google Fonts from the site or the app | Code prepared, checked in Chromium (fonts load, 0 external requests) |
| Android back button | Capacitor default: history back, then exit | Unchanged | **Device check** (modals) |
| External links | Open in the system browser (Capacitor default) | Unchanged | Device check |
| Version shown in Settings | `version.json` is not fetched from Netlify | `native/build-web.js` writes it with the commit and build time (`context: "app"`) | Code prepared |
| Uninstall = data gone | App data lives in the app container | First-run hint and backup reminders already in the app | **Store-specific text needed** (§6) |

## 3. Data: keeping it, updating, moving from the PWA

- **App update** (store update of the same app): localStorage and IndexedDB stay in the app
  container. The native copy is also kept. Tested by reopening in the simulation; **device check:
  install build N, add data, install build N+1 over it.**
- **OS eviction**: restored from the native copy (§2).
- **Moving from the PWA/website to the store app — never automatic.** The app has its own storage
  and cannot read Safari's or Chrome's. The path uses the existing full backup:
  1. In the PWA or website: Settings → Backup → "⬇ Back up everything to a file" (optionally
     encrypted). It includes all app data and record videos (within the size budget; the file
     says what was left out).
  2. Move the file (same phone: Files / Downloads; another device: Drive, mail, AirDrop).
  3. In the store app: sign in → Settings → "⬆ Restore from a file". A preview shows what comes in
     and what is replaced; nothing is written until confirmed; old schema versions are migrated.
  4. Keep the PWA until the app shows the same classes and counts.

  A fresh app install with no data shows this hint on the sign-in screen (`#lock-migrate`,
  5 languages). Tested (simulated).

## 4. Apple — requirements checked

| Requirement | Where we are | Source |
|---|---|---|
| Built with **Xcode 26 / iOS 26 SDK** (required for uploads since 28 Apr 2026) | Capacitor 8 requires Xcode 26; CI selects Xcode 26 | [Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/), [news](https://developer.apple.com/news/?id=ueeok6yw) |
| **4.2 Minimum Functionality** ("elevate it beyond a repackaged website") | Files are bundled, not a remote URL. It works fully offline, uses native share, keep-awake, camera, microphone and audio session, and has no browser chrome. The one online dependency (contact form) is optional. Risk: low to moderate — reviewers judge the feel. Review notes must explain teacher code, demo mode and student mode | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) |
| 5.1.1 privacy policy in App Store Connect **and** in the app | Existing page: `https://pe-ultimate.netlify.app/privacy.html` (linked in About) | same |
| 4.8 Sign in with Apple | Not applicable: no accounts or third-party login | same |
| Privacy manifest | `native/ios/App/App/PrivacyInfo.xcprivacy`: no tracking; file-timestamp API reason C617.1 (Filesystem plugin); contact-form data types. Capacitor core ships its own | [Filesystem README](https://capacitorjs.com/docs/apis/filesystem), [privacy manifest guide](https://capacitorjs.com/docs/ios/privacy-manifest) |
| App Privacy ("nutrition label") | Draft in §6 | App Store Connect |
| Age rating (new questionnaire: 4+, 9+, 13+, 16+, 18+) | Owner answers. Relevant items: no social media, no web browsing inside the app, fitness/health information (VO₂max zones, BMI) — answer the "medical or wellness" question accurately | [Age ratings](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/) |
| Export compliance | The app encrypts backup files with AES-GCM (WebCrypto) and uses HTTPS. `ITSAppUsesNonExemptEncryption` was deliberately **not** set: the owner answers the questionnaire on the first upload | App Store Connect |
| iPad | The app supports iPhone and iPad (`TARGETED_DEVICE_FAMILY = 1,2`), all orientations on iPad. iPad screenshots are then required | App Store Connect |
| Icon 1024×1024 | Checked 2026-09-30: RGB, **no alpha** (required); readable down to 40 px. It is the 512 px icon upscaled 2×, so edges are soft at full size. **Replace with a 1024 px original (or vector) before submission.** Android adaptive icon enlarged to fill the circle within the safe zone | — |

## 5. Google Play — requirements checked (updated for Capacitor)

| Item | Status | Source |
|---|---|---|
| Target API 36 (new apps and updates from 31 Aug 2026) | `targetSdkVersion = 36` | [Target API](https://support.google.com/googleplay/android-developer/answer/11926878) |
| Signed **AAB** + Play App Signing | CI builds a **debug APK** for testing only. Release AAB needs the owner's upload key | [Sign your app](https://developer.android.com/studio/publish/app-signing) |
| Digital Asset Links | **No longer needed** (that was for TWA) | — |
| Package ID | `app.netlify.peultimate` in the project — **temporary, owner decision**, permanent after the first upload (Android `applicationId` and iOS bundle ID) | — |
| Data safety | Draft in §6. Do not declare "no data collected" | [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469) |
| Health apps declaration | Required for every app. Fitness and VO₂max estimates are for education, not a medical device | [Health apps](https://support.google.com/googleplay/android-developer/answer/14738291) |
| Target audience | Owner decision — see §7 | [Families](https://support.google.com/googleplay/android-developer/answer/9893335) |
| Closed test for new personal accounts | 12 testers opted in for 14 continuous days before production | [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465) |
| Permissions | Camera, microphone (runtime prompts), internet. No restricted permissions | — |
| Android Auto Backup | `allowBackup="true"` (template default). App data can go to the user's own Google backup — not data collected by the developer | — |

## 6. Store declarations (drafts — the owner confirms in each console)

Data that leaves the device **to the developer**: only the optional contact or deletion form —
name, email, phone, message, request type, app language and version — sent to the operator's
Netlify Forms. Not sold, not shared, not used for tracking.

| Data type | Apple App Privacy | Google Data safety |
|---|---|---|
| Name, email, phone | Contact Info — linked to user, not tracking, purpose "App Functionality" (support/contact). Owner decides whether the feedback survey counts as "Other purposes" | Personal info → collected, optional, purpose "Developer communications", not shared |
| Message text | User Content → Other User Content, same purpose | Messages → other in-app messages (optional) |
| Student names, results, attendance, grades | Not collected (stays on the device; backups and Sheets sync go to the teacher's own accounts, on the teacher's action) | Not collected |
| Photos, video, audio | Not collected (processed on the device) | Not collected |
| Identifiers, analytics, location, ads | None | None |
| Google Fonts | No longer requested (fonts bundled, §2). The privacy page and the in-app About text still list Google Fonts — harmless over-disclosure, remove at the next policy update | Same |
| Encryption in transit | — | Yes (HTTPS) |
| Deletion | In-app: About → "Request deletion of my contact details"; web: `/#delete-contact` | Same |

**Store-specific text still to add before submission (not published yet):** the existing privacy
page talks about the browser ("clear the site's data"). For the store apps it needs one sentence:
*"In the app from the App Store or Google Play, deleting the app deletes its data on the device
(Android may restore it from your own Google backup). Back up to a file first."* It also needs one
sentence that there is no Netlify page-load logging inside the app, only for the contact form.

Suggested review notes (App Store "App Review Information" / Play "App access"): "No account. On
first launch the teacher chooses a 4-digit code (any digits). 'Demo mode' opens a sample class
without a code. Student mode shows only the records board. The contact form is optional."

## 7. Audience — do not declare "adults only" blindly

Teachers are the users, but in **student mode** pupils (often under 13–18) view the records board
and submit a record on the teacher's device. In the store, anyone can download the app. Choose
deliberately: a staff tool (18+ target, not in the Kids category or Families program), or a mixed
audience with the Families requirements. The current data practices are compatible with either:
no ads, no analytics, no contact details from students.

## 8. What needs the owner (accounts, money, hardware)

| Needs | Why | Cost |
|---|---|---|
| **Apple Developer Program** membership | TestFlight and App Store | 99 USD per membership year ([Apple](https://developer.apple.com/programs/enroll/)) |
| Free Apple ID "personal team" in Xcode | **Enough to install on your own iPhones and iPads now.** Up to 3 apps per device; the install expires after 7 days ([Apple](https://developer.apple.com/help/account/basics/about-your-developer-account/)) | Free |
| Mac with **Xcode 26** | iOS builds, signing, simulator screenshots | You have one |
| iPhone and iPad for testing | Real-device checks (§9) | You have 2 iPhones and 2 iPads |
| **Android phone** | Real-device checks. The Android Studio emulator does not count as a device test | Not listed yet |
| **Google Play Console** account | Internal, closed and production tracks | 25 USD one-time ([Google](https://support.google.com/googleplay/android-developer/answer/6112435)) |
| Upload keystore (Android) | Signing the release AAB; keep it safe | Owner's custody |
| Decisions | See §10 | — |

## 9. Getting a first test build onto devices

### Android — from CI (no Mac needed)
1. GitHub → Actions → **Native builds** → latest run → Artifacts → `pe-ultimate-android-debug`.
2. Unzip, copy `pe-ultimate-debug-<build>-<commit>.apk` to the phone, open it, allow "install
   unknown apps" for the file manager. It is a **debug** build, for testing only.
3. Every test APK from this repository is signed with the same debug key
   (`native/android/app/debug.keystore`, standard password `android`, not a secret), and its
   version code is the CI run number. So a newer test APK installs **over** the older one and the
   data stays. The very first APK (commit `f6df3c4`) was signed with a random key: if it is
   installed, uninstall it once before installing a newer one.
4. The Google Play version will be signed with a different key (the owner's upload key /
   Play App Signing). Moving from a test APK to the store version means uninstalling, so **back up
   to a file first**.

### iPhone / iPad — on the Mac (free Apple ID is enough for your own devices)
**First check the Mac:** Apple menu  → **About This Mac**. Note the **Chip** (Apple M… or Intel) and
the **macOS** name and version. Xcode 26.0–26.3 needs macOS Sequoia 15.6 or later; Xcode 26.4 and
later need macOS Tahoe 26.2; Xcode 27 needs Tahoe 26.6
([Apple](https://developer.apple.com/xcode/system-requirements/)). The App Store offers the newest
Xcode your macOS can run; older versions are at developer.apple.com/download (free Apple ID). Also
install Node.js 22 (nodejs.org) and Git (`xcode-select --install`).

```bash
git clone https://github.com/osher15/https-pe-ultimate.netlify.app.git
cd https-pe-ultimate.netlify.app/native
npm ci                 # Node 22+
node build-web.js      # copies the site into native/www and writes version.json
npx cap sync ios
npx cap open ios       # opens Xcode
```
In Xcode:
1. Settings → Accounts → add your Apple ID.
2. Target **App** → Signing & Capabilities → Team = your personal team (or the paid team later).
   If Xcode says the bundle ID is taken, change it (e.g. add a suffix) — this is the package-ID
   decision in §8.
3. Connect the iPhone by cable. On the iPhone: Settings → Privacy & Security → **Developer Mode** →
   on (it restarts). Choose the iPhone as the run destination and press **Run** (▶).
4. First launch: on the iPhone, Settings → General → VPN & Device Management → trust your developer
   profile.
5. Repeat for each iPhone and iPad. Free-team installs expire after 7 days: press Run again.

**TestFlight** (after enrolling in the paid program): in Xcode, Product → Archive → Distribute App →
App Store Connect → Upload. Internal testers (your own Apple IDs) can install through the
TestFlight app without review.

### Device test script (about 30 minutes per device)
Record: device model, OS version, build id from Settings, and pass/fail per step.

1. **Install and first launch offline**: airplane mode on, open the app. The sign-in screen shows
   the hint about moving data from the website.
2. **Move data from the PWA**: in Safari/Chrome (PWA) → Settings → "Back up everything to a file"
   → save to Files. In the app → sign in → Settings → "Restore from a file" → pick the file (also
   try an encrypted `.hmg`). Classes, students, grades and record videos match.
3. **Export and share**: students CSV, full backup, a race PNG → the share sheet opens → save to
   Files → open the file. Cancel once → the app says "not saved".
4. **Print/PDF**: class report, lesson plan, teams → the document opens inside the app → "Save or
   share" → open the file → print or save as PDF from there. "✕ Close" returns to the app.
5. **Update keeps data**: install the next build over this one (Run again from Xcode / new APK).
   All data is still there.
6. **Camera and microphone**: photo-finish opens the camera after the permission prompt; the
   start signal is detected by a clap.
7. **Beep test and timers**: with the silent switch on (iPhone) → beeps are audible; with music
   playing in another app → beeps mix and the music keeps playing; the screen does not auto-lock;
   voice cues speak (Android too).
8. **Screen**: notch and home indicator do not cover buttons in portrait and landscape; iPad in
   both orientations, Split View and Stage Manager; RTL in Hebrew, then switch to English.
9. **Theme**: switch to the "day" theme → the status-bar text turns dark; switch back.
10. **Android back button**: with a dialog open and on the home screen.
11. **Links**: privacy policy and YouTube open in the system browser and return to the app.
12. **Contact form**: only if you decide to send a real submission. It is not sent automatically;
    only one TEST submission was authorised, and it has been used.

## 10. Decisions still open (owner)

1. **Package / bundle ID** — `app.netlify.peultimate` is temporary; permanent after the first upload.
2. **Target audience** — staff-only (18+, no Families) or mixed with the Families requirements (student mode exists).
3. **Age rating answers** (Apple questionnaire, Google IARC) — especially the fitness/health information question.
4. **Export compliance** — the app encrypts backups with AES-GCM; answer Apple's questionnaire on the first upload.
5. **Data safety / App Privacy wording** — confirm the drafts in §6 (contact form only).
6. **1024 px original icon** — the current one is upscaled.
7. **Store-specific privacy sentence** — "deleting the app deletes its data" (and remove the Google Fonts line).
8. **Accounts** — Apple Developer Program (99 USD/year) and Google Play Console (25 USD once), only after the device tests.

