# PE Ultimate — contact form, privacy and terms (round 2, 2026-09-29)

## What changed and why

The contact screen used to post silently into the **Hamegrash PRO** Google Form
(«המגרש פרו משתמשים») through a hidden iframe. Two defects followed:

1. PE Ultimate and Hamegrash PRO leads were mixed in one form.
2. That form marks all four fields required, while the app sent phone *or* email.
   Google rejects such submissions, and the iframe hid the rejection — the teacher saw
   «תודה!» while nothing was recorded. The app had no way to know.

The Hamegrash PRO form and its responses were **not changed**.

## New design

| Aspect | Behaviour |
|---|---|
| Destination | Dedicated Netlify Form `pe-ultimate-contact` on the PE Ultimate site (operator's Netlify account). Detected from the hidden static `<form data-netlify>` in `index.html`. |
| Fields | `first`, `last`, `email`, `phone` — all required in the app **and** in the static form; plus `lang`, `app_version`, honeypot `bot-field`. Nothing from the device's student data. |
| Validation | `hm-data.js: validateLead` — email shape; phone 7–15 digits with optional `+`, spaces, `-`, `.`, `()`, `/`. No country-specific format. |
| Confirmation | The app POSTs to `/` and counts it as received **only** if the reply is 2xx and is `contact-received.html` (contains `peu-contact-received-v1`). Anything else → error; the typed details stay in the form. |
| Skip | Sends nothing. Stores `hx.leadSnoozeUntil = now + 7 days` on the device. Reload/reopen before then shows nothing. |
| Reminder | After 7 days: a non-blocking bar under the header («Leave details» / «Remind me in 7 days»). Not shown over the lock screen, in student mode, or during an active lesson. Never blocks students, backup or restore. |
| After success | `hx.leadDone = true`, `hx.leadSentAt` set; no reminders. Form stays available at Settings → About. |
| Older installs | «Skipped» on the previous version → 7-day snooze from first launch of this version. «Sent» on an older version → no reminders (About says it was unconfirmed and offers to resend). |
| Offline file (`Hamegrash.html`) | Cannot confirm delivery → shows that sending works only in the online app. |
| Marketing | No marketing consent is collected; the form is contact + feedback survey only. |

## Operating the form (operator)

- Submissions: Netlify → project `pe-ultimate` → Forms → `pe-ultimate-contact`.
  Check the **Spam** tab too (Netlify filters automatically).
- Email notifications (optional): Forms → Form notifications → add your address there.
  This is not set by the code.
- Deleting a submission: open it → Delete. This is also how deletion requests are fulfilled.
- Retention (approved by the operator on 2026-09-29, stated in the policy): up to
  24 months from receipt, reviewed at least every six months. **This is a manual
  process** — nothing deletes automatically.

## Privacy policy and terms

`privacy.html` and `terms.html` are in he/en/ar/ru/es, written from a code inventory
(storage, outbound requests, device permissions, deletion). On 2026-09-29 the operator
supplied the identity to publish (**Osher Shalev**) and approved the retention period
(24 months, six-monthly review); the draft notices were removed. The pages describe how the
app works and make no claim of compliance with any particular law.

Contact and deletion requests go through the in-app form, so no private email
address needs to be published.

## Status (updated 2026-09-29, after deploy)

Vocabulary: **deployed** = serving on https://pe-ultimate.netlify.app; **verified** = checked
with evidence named below; **pending** = not yet verified — not a success.

### Deployed and verified

| Item | Evidence |
|---|---|
| Code merged to `main` | PR #6 → merge commit `c6060d0` |
| Production deploy | Netlify deploy `6abbbdd8bdef9c0008417617`, state *ready*, `commit_ref c6060d0`, published 2026-09-29 13:32 UTC |
| Live page is this build | Live fetch of the home page (no cache): `<meta name="hm-build" content="0a42ca0a">`, `hm-app.js?v=eab87ca5`, `#lead-form`, `#leadRemind` and the static form `pe-ultimate-contact` present |
| Netlify detected the form | Form `pe-ultimate-contact` (id `6abbbde047344f0007c18423`) listed with fields `bot-field`, `first`, `last`, `email`, `phone`, `lang`, `app_version`; honeypot on (Netlify API, read after the deploy) |
| Hamegrash PRO form | Not changed |

Note: Settings → About shows the version from the `hm-app.js` stamp, which stays `eab87ca5`
because that file did not change in this round. The build meta tag (`0a42ca0a`) is the one
that changed.

### Verified by automated tests (not on the live site)

- Unit 540/540 and e2e 465/465 on `6bb7c82` (the tested head merged as `c6060d0`); CI green.
- Unit: `tests/unit/lead.test.js` (validation, statuses, confirmation, payload ↔ static form).
- E2E: `tests/e2e/lead.e2e.js` (partial forms blocked, international numbers, confirmed
  success, network failure, unconfirmed server reply, skip = no request, 7-day timing
  across reopen, reminder non-blocking, not during an active lesson, migration, RTL/LTR).
  Server replies and the clock are simulated in these tests.

### Live TEST submission

| Step | Status |
|---|---|
| One synthetic submission sent through the live UI (first `TEST`, last `Synthetic-Claude`, email `test.peu@example.com`, phone `+44 20 7946 0958`) | **Sent once**, 2026-09-29. The app showed «✓ הפרטים נשלחו ונקלטו», which it shows only when the server returns the confirmation page |
| Submission received in Netlify, fields correct | **VERIFIED** by the operator in the Netlify dashboard (Forms → `pe-ultimate-contact` → *Verified submissions*, not spam), 2026-09-29: exactly one entry, `first` TEST, `last` Synthetic-Claude, `email` test.peu@example.com, `phone` +44 20 7946 0958, `lang` he, `app_version` eab87ca5. The Netlify forms API itself returned *Internal server error* on four reads, so this check was done in the dashboard |
| TEST submission deleted | **VERIFIED** — deleted by the operator in the dashboard (that entry only; the form itself kept). A later Netlify API read of the form's submissions returned an empty list |

The live check is complete; no further TEST submission is needed.

### Not tested

- Real devices (Android Chrome, iOS Safari), including the on-screen keyboard over the form.
- The 7-day reminder in real elapsed time (tested with a simulated clock only).
- Netlify spam filtering of genuine submissions, and delivery of the notification email
  (configured by the operator; no submission has arrived since).
- Native-speaker review of the new ar/ru/es/en texts in the form, `privacy.html` and `terms.html`.

### Operator decisions (2026-09-29)

1. Operator identity: **Osher Shalev** — published in `privacy.html` and `terms.html`, all five languages.
2. Retention: up to 24 months, manual review every six months — **approved**; draft notices removed.
3. Netlify form email notifications: **configured by the operator in the Netlify dashboard**
(2026-09-29, as reported by the operator). The Netlify tools available here can neither
create nor read form notifications, so this was not independently verified; the next real
submission is the first live check that the email arrives. Where to find it: Netlify →
project `pe-ultimate` → Project configuration → Notifications → Emails and webhooks → Form
submission notifications.
