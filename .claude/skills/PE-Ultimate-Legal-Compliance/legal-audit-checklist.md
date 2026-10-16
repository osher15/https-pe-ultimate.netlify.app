# Legal audit checklist

Use before every release build, every store submission, and after any change listed in `SKILL.md`. For each line record: status (OK / open / n/a), the evidence (file and line, test name, CI run, device check) and who verified it. Code reading, CI, emulator and physical device are different kinds of evidence; say which.

## A. Data and outbound requests

- [ ] Searched all packaged code for `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `CapacitorHttp`, `<form`, `<script src=`, external URLs. Every hit appears in the data map (`privacy-and-student-data.md` §2).
- [ ] No pupil data in the contact form payload (`hm-new.js` lead form).
- [ ] Records sync accepts and sends only `https://` URLs (`hm-app.js` `syncUrlOk`).
- [ ] Drive backup is encrypted before upload; the password is not stored.
- [ ] No analytics, ads, tracking, crash reporting or third-party SDKs added (check `package.json`, `native/package.json`, Gradle dependencies, Podfile).
- [ ] Fonts and assets load locally (no Google Fonts or CDN requests).

## B. Disclosures

- [ ] `privacy.html` matches the data map in all five languages; `tests/unit/privacypage.test.js` passes.
- [ ] Privacy page date changed only if content changed.
- [ ] `terms.html` matches the app. Open (2026-10-16): §3 says data "is stored only on the device"; with the native app, optional Drive backup, records sync and Android Auto Backup this should read "stored on the device" plus the optional copies. Terms date is 29 September 2026.
- [ ] Store listing text describes only shipped features; no medical, certified-timing or compliance claims; no third-party trademarks.
- [ ] In-app links to privacy and terms work offline in the packaged app (`native/build-web.js` copies them).

## C. Permissions and native

- [ ] Android permissions match the privacy page. Open: `MODIFY_AUDIO_SETTINGS` has no code use found; remove only after a device check of beep test and start audio.
- [ ] Android Auto Backup: in-app setting defaults to off; `PEBackupAgent` copies nothing while off. Open: physical-device backup/uninstall/restore check not yet done.
- [ ] iOS `Info.plist` usage strings accurate. Open: strings mix English and Hebrew; localize.
- [ ] iOS `PrivacyInfo.xcprivacy` matches required-reason APIs and tracking = false.
- [ ] No signing keys, keystores, tokens or secrets in the repository.

## D. Deletion and retention

- [ ] Per-item delete, delete-all-records and Settings → Backup → "Delete all data" work, and the latter also removes the native internal copy (`pe-ultimate-data.json`).
- [ ] Deletion request path works in browser and native (`#delete-contact`).
- [ ] Owner has performed the promised six-monthly review and kept the deletion log (`docs/OWNER_DATA_AND_DELETION_2026-10-13.md` §3). Agents cannot verify this; ask the owner.
- [ ] Netlify processor terms (DPA) accepted by the owner. Owner-only.

## E. Payments, refunds, accounts

- [ ] No purchase, subscription, licence, donation or premium code or wording (hold in `AGENTS.md`).
- [ ] No account or login system.
- [ ] If the hold is ever lifted: every item in `payments-and-subscriptions.md` "Before the hold can be lifted" answered and approved by the owner.

## F. Audience and pupils

- [ ] Audience remains adults; no child-directed features, no pupil sign-up, no pupil contact collection.
- [ ] Student mode shows only what it is meant to show (records board, record submission for teacher approval) and does not expose other pupils' grades or the roster beyond the board.
- [ ] Fitness and VO₂max figures are labeled educational.

## G. Store declarations (owner fills, agent drafts)

- [ ] Play Data safety draft updated for this build.
- [ ] Play Health apps declaration: activity and fitness.
- [ ] Play target audience 18+, content rating questionnaire answered from real content, ads = no.
- [ ] Apple App Privacy draft updated for this build (when iOS is submitted).
- [ ] Current official policy pages checked on the date of submission; date recorded.

## H. Release evidence

- [ ] `npm test` passed (record totals).
- [ ] `node build-standalone.js` run twice; second run leaves no diff.
- [ ] Relevant browser suites passed.
- [ ] Release AAB built by CI from the commit being submitted; version recorded.
- [ ] Handoff written in `docs/handoffs/` with unverified items listed.
