---
name: pe-ultimate-legal-compliance
description: Legal, privacy, app-store and store-sales rules for the PE Ultimate app and the PE Tools Store. Use before any change that affects what data the app stores or sends, the privacy or terms pages, store listings or console declarations, Android/iOS permissions or backup, payments, refunds, subscriptions, accounts, age/audience, or new countries and languages. Also use when asked for a legal or compliance review of the app.
---

# Legal and compliance: main operating instructions

PE Ultimate is a free, offline-first field tool for adult PE teachers and coaches. It has no accounts, no payments, no ads, no analytics and no server of its own for student data. Every rule below exists to keep that true, or to make sure that any change to it is deliberate, disclosed and reviewed by the owner.

## Two products, two rule sets

| | PE Ultimate app | PE Tools Store |
|---|---|---|
| What | Free app (web, Android, iOS) | Paid digital products: lesson packs, scoreboard, coach board, interval trainer, shuttle run |
| Where in git | `main` | `store-content/` and `prototypes/pe-boards/` on branch `ccr-f0f0c4fd-ymvjjb` (Issues #57, #59); storefront planned in a separate private repo |
| Payments | **None, on hold** (`AGENTS.md`) | Planned through a merchant of record (Lemon Squeezy preferred, Gumroad fallback). Checkout stays **disabled** until the owner, a lawyer and an accountant clear `store-content/legal/open-questions.md` |
| Legal texts | `privacy.html`, `terms.html` | Drafts v0.2 in `store-content/legal/` (terms of sale, refund policy, privacy, licence, safety, accessibility, checkout copy), lawyer review pending |

Never mix them: no store purchase, price or upsell inside the free app, and store products must not depend on the app's pupil data. Never merge `store-content/` to `main` while `netlify.toml` publishes the whole repository (it would expose paid files).

This skill is not legal advice. It records the project's own decisions and the rules agents must follow. Laws, store policies and console forms change: before anything is submitted, published or declared, verify against the current official text and say that you did (or that you could not).

## Reference files (read the one that matches the task)

| File | Read it when |
|---|---|
| `privacy-and-student-data.md` | Anything touching stored data, outbound requests, permissions, backup, deletion, contact form, privacy.html or terms.html |
| `apple-google-store-policies.md` | Store listing, Data safety, App Privacy, Health apps, content rating, permissions, release builds |
| `payments-and-subscriptions.md` | Any mention of prices, premium, paid features, donations, subscriptions, licences |
| `refunds-and-cancellations.md` | Any purchase, trial, renewal, cancellation or refund question |
| `international-compliance.md` | New country, language, school/district deployment, child or student data questions, data transfer |
| `legal-audit-checklist.md` | Before a release, before a store submission, or when asked to audit |

## Hard rules

1. **No payments in the app.** In-app payments, subscriptions, paid keys and paid services are on hold (`AGENTS.md`, `docs/ACTION_PLAN_2026-10-03.md`). Do not add pricing UI, purchase code, billing libraries, licence checks, donation links or "premium" wording to the app. Store sales happen only through the merchant of record, outside the app, and only after the legal gates (`payments-and-subscriptions.md` §Store). Only the owner can lift the app hold or open checkout, explicitly.
2. **No accounts, no server for student data.** Do not add sign-up, login, cloud sync to an operator server, analytics, crash reporting, ads, tracking or third-party SDKs. Each of these changes the privacy page, the store declarations and possibly the legal basis.
3. **Student data stays on the device** and is never sent to the operator. Optional transfers the teacher sets up (Drive backup, records sync to the teacher's own sheet, Android Auto Backup when the teacher turns it on, file export) go to the teacher's own accounts. Never write "data never leaves the device".
4. **Every outbound change updates the privacy page.** If you add, remove or change anything that leaves the device, or a permission, update `privacy.html` in all five languages (he, en, ar, ru, es) in the same change, keep `tests/unit/privacypage.test.js` passing, and list the change in the handoff so the owner can update the store declarations.
5. **No invented claims.** No "GDPR compliant", "COPPA certified", "FERPA approved", "medically accurate", "certified timing" or similar unless there is real evidence and owner approval. Fitness figures are educational aids, not medical measurements.
6. **Adults only.** The app is for adults (18+). Students use it only in student mode on the teacher's device. Do not add features aimed at children using the app on their own, student sign-up, or student contact collection.
7. **Owner decides and submits.** Agents do not fill or submit Play Console / App Store Connect forms, sign builds, deploy, or publish legal pages. Prepare drafts and evidence; the owner acts.
8. **Distinguish evidence.** Code reading, CI, emulator and physical-device results are different. Say which one supports each claim.

## Workflow

1. Classify the task with the table above and read the matching reference file(s).
2. Check the facts in the current code, not in old docs: `grep` for `fetch(`, `XMLHttpRequest`, `sendBeacon`, `CapacitorHttp`, external URLs, `<form`, new permissions in `native/android/app/src/main/AndroidManifest.xml` and `native/ios/App/App/Info.plist`, and changes to `native/ios/App/App/PrivacyInfo.xcprivacy`.
3. If the change conflicts with a hard rule, stop and tell the user which rule and why, and what the owner would have to decide.
4. Make the change with the disclosures in the same change (privacy.html in five languages, terms.html when user obligations change).
5. Run `npm test`, `node build-standalone.js` (twice; the second run must leave no diff) and the relevant browser suites.
6. Walk through the matching section of `legal-audit-checklist.md` and record the result.
7. Write `docs/handoffs/YYYY-MM-DD-task.md` with: what changed for privacy/store purposes, which declarations the owner must update, what was verified and how, and what is unverified.

## Writing legal-facing text

- Plain language, short sentences, no legal boilerplate copied from elsewhere.
- Describe what the app does, not what the law requires ("the app does not send student data to the operator", not "we comply with X").
- Keep the five language versions equivalent in meaning. Machine-drafted translations are drafts; say so in the handoff.
- Dates on privacy.html and terms.html change only when their content changes.
- New documentation is written in English (owner-facing guides may be in Hebrew, as existing owner guides are).

## Where the facts live

- Privacy page: `privacy.html` (operator, data map, retention, deletion, permissions).
- Terms: `terms.html`.
- Owner data/deletion guide: `docs/OWNER_DATA_AND_DELETION_2026-10-13.md`.
- Play pre-launch security checklist: `docs/PLAY_LAUNCH_SECURITY_CHECKLIST_2026-10-13.md`.
- Store listing drafts: `docs/store-listing/`.
- Native release: `docs/NATIVE_RELEASE_CHECKLIST.md`.
- Earlier privacy evidence audit: `docs/handoffs/2026-10-12-codex-c1-privacy-preliminary.md`.
