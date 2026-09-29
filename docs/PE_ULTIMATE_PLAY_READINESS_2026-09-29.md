# PE Ultimate — Google Play readiness and gap list (2026-09-29)

Preparation only. Nothing was built for Android, uploaded, or submitted, and no Play
Console agreement was accepted. Requirements below were checked against official
Google pages on 2026-09-29 (links in the last column); anything not re-read there is
marked **to verify in Play Console**.

## 1. Is a PWA inside a Trusted Web Activity (TWA) a good fit?

**Yes, with two things to confirm on a real phone.**

| App capability | Works in TWA? | Note |
|---|---|---|
| Offline shell (service worker), localStorage, IndexedDB | Yes | TWA runs the site in the user's Chrome; storage is Chrome's storage for the origin. **Uninstalling the TWA app does not clear it** — the privacy text about deletion must say "clear the site's data in Chrome" for the Play build. |
| Camera (`getUserMedia`) for photo-finish and record videos | Yes, via Chrome's site permission | **Confirm on device** (frame rate and permission prompt). |
| Microphone for start-signal detection | Yes, via Chrome's site permission | **Confirm on device.** |
| Web Audio beeps, wake lock, share, clipboard | Yes | Beep timing after screen lock needs a device check (§5). |
| Google Drive backup (Google Identity Services popup) | Usually yes | **Confirm on device** — popups inside TWA open in a Custom Tab. |
| Contact form (Netlify Forms, same origin) | Yes | No change. |

Alternative if camera/audio misbehave in TWA: a WebView wrapper (e.g. Capacitor). It
needs explicit Android permissions and more maintenance. Recommendation: **start with TWA**
(Bubblewrap), fall back only if the device checks fail.

## 2. Gap list

| Item | Status now | What is needed | Source |
|---|---|---|---|
| Android project | **Missing** | Generate with Bubblewrap from `manifest.webmanifest` | [TWA quick start](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start) |
| Package ID | **Missing — owner decision** | Reverse-domain ID, permanent once published (e.g. `app.netlify.pe_ultimate` or a domain the owner controls) | — |
| Signed **Android App Bundle (AAB)** | **Missing** | Build AAB; sign with an upload key; enrol in **Play App Signing** (required for AAB) | [Sign your app](https://developer.android.com/studio/publish/app-signing) |
| Upload-key custody | **Missing — owner decision** | Where the keystore and passwords live; losing it blocks updates until reset | same |
| **Target API level** | n/a yet | **New apps and updates must target Android 16 (API 36) from 31 Aug 2026** | [Target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878), [developer.android.com](https://developer.android.com/google/play/requirements/target-sdk) |
| Digital Asset Links | **Missing** | `/.well-known/assetlinks.json` on `pe-ultimate.netlify.app` with the **Play App Signing** SHA-256 fingerprint (not only the upload key), else the app shows a browser bar | [TWA quick start](https://developer.chrome.com/docs/android/trusted-web-activity/quick-start), [codelab](https://developers.google.com/codelabs/pwa-in-play) |
| Manifest | Present | `name`, `short_name`, 192/512 icons, 512 maskable, `display: standalone`, `start_url`, `scope`. OK for Bubblewrap | repo |
| Privacy policy URL | **Present** | `https://pe-ultimate.netlify.app/privacy.html` — operator named, retention stated, deletion path. Add the TWA note from §1 (uninstall ≠ data deletion) when the Android build exists | repo |
| **Data safety** form | Not filed | See §3. Do **not** declare "no data collected" | [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469) |
| **Health apps declaration** | Not filed | Required for **every** app (even with no health features). The app shows VO₂max estimates and fitness zones for education: declare accurately; it is not a medical device | [Health apps declaration](https://support.google.com/googleplay/android-developer/answer/14738291) |
| Target audience and content | Not filed | See §4 | [Families policies](https://support.google.com/googleplay/android-developer/answer/9893335) |
| Content rating (IARC questionnaire) | Not filed | No violence, no user-to-user chat, no purchases; photo/video capture stays on device | Play Console → App content — **to verify in Console** |
| Ads declaration | Not filed | "No ads" | Play Console — **to verify in Console** |
| Account deletion requirement | Not applicable | The app has no user accounts; contact-details deletion exists in-app and via the privacy page | [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311) |
| Store listing graphics | **Missing** | App icon 512×512; **feature graphic 1024×500** (JPEG or 24-bit PNG, no alpha); phone screenshots | [Preview assets](https://support.google.com/googleplay/android-developer/answer/9866151) |
| Closed test (new personal accounts) | Not started | Accounts created after **13 Nov 2023**: closed test with **≥ 12 testers opted in for 14 continuous days** before applying for production. Account type/creation date is unknown here | [Testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465) |
| Reviewer access notes | Not written | Explain the first-run teacher code (set on first launch), demo mode (no credentials), and student mode | Play Console → App access |
| Real-device test pass | **Not done** | §5 | — |

## 3. Data safety — draft mapping (owner confirms)

"Collect" = data leaves the device to the developer/operator. Student data never does.

| Data type | Collected? | Details |
|---|---|---|
| Personal info → Name, Email, Phone | **Yes, optional** | Contact form (or deletion request) → operator's Netlify Forms. Purpose: developer communications and feedback survey. Not shared, not sold. User can request deletion. |
| App info → version; language | Yes, with the form | Sent with the contact form only. |
| Student names, results, attendance, grades | **Not collected by the developer** | Stored on device. Optional records sync and Drive backup go to the **teacher's own** Google account on the teacher's action — per Google's definition, a user-initiated transfer the user expects. Confirm the wording in the form. |
| Photos/videos, audio | Not collected | Camera frames and record videos stay on the device (IndexedDB); microphone is analysed live and not recorded. |
| Device IDs, location, app activity, analytics | Not collected | No analytics or ads SDKs in the code. |
| Web server logs (IP, user agent) | **Disclose honestly** | Netlify hosting logs every page load; Google Fonts receives IP/user agent. Decide with the form's guidance how to declare these. |
| Encrypted in transit | Yes | HTTPS. |
| Deletion request mechanism | Yes | In-app (About → "Request deletion of my contact details") and `https://pe-ultimate.netlify.app/#delete-contact`. |

## 4. Target audience — do not declare "adults only" blindly

The app is used by teachers, but **student mode** lets pupils (often under 13–18)
view the records board and submit a record on the teacher's device. The Play build will
be listed and downloadable by anyone, so:

- The primary audience is education staff; students use it under the teacher's
  supervision and do not sign up or give contact details.
- If the target-audience answer includes ages under 13, **Families policies apply**
  (content, ads, data practices). The current data practices (no ads, no analytics, no
  contact collection from students) are compatible, but the declaration must be made
  deliberately.
- Owner decision needed: declare an audience that excludes children (staff tool, 18+),
  or a mixed audience with the Families requirements. Do not choose until the actual
  planned use (who installs the Play app) is settled.

## 5. Real-device test script (for the owner; ~20 minutes)

No physical device was available here. Browser automation (Chromium) is **not** a
substitute for an Android phone.

1. **Install** — Android Chrome → `https://pe-ultimate.netlify.app` → menu → *Install app*.
   Open from the home-screen icon; it should open without a browser bar.
2. **Version** — Settings → the version line shows a build id, and after one online load
   a `commit … · פורסם …` line. Note both.
3. **Offline** — Airplane mode, close the app fully, reopen. Home, students list, a
   fitness test screen and the beep test must open. Turn the network back on; reopen;
   nothing should be lost.
4. **Data** — Demo mode: mark attendance for ט׳3 (full / partial / absent / exempt), then
   grades → *Fill from attendance*: exempt stays empty, absent is 0.
5. **Backup/restore** — Settings → backup to a file; clear the site data in Chrome;
   restore from the file; check the class and grades.
6. **Timers after lock** — Start the beep test, lock the screen for 30 s, unlock: beeps
   and level must continue correctly. Repeat with the stopwatch.
7. **Camera/mic** — Photo-finish: camera opens after the permission prompt. Start-signal
   by clap: detected.
8. **Hebrew/RTL** — Menus and forms right-to-left; email/phone fields left-to-right.
9. **Update** — After a new deploy, the "new version ready" bar appears; tapping it
   reloads without losing data; ignoring it during a lesson does nothing.

Report: phone model, Android and Chrome versions, and which steps failed.
