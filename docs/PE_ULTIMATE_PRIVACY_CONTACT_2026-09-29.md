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
- Proposed retention (pending operator approval, stated in the draft policy): up to
  24 months from receipt, reviewed at least every six months. **This is a manual
  process** — nothing deletes automatically.

## Privacy policy and terms

`privacy.html` and `terms.html` are drafts in he/en/ar/ru/es, written from a code
inventory (storage, outbound requests, device permissions, deletion). They contain no
placeholder brackets; each carries a visible draft notice until the operator confirms:

1. The operator identity to publish (name or business name).
2. The retention period (24 months proposed) and the six-monthly review.

Contact and deletion requests go through the in-app form, so no private email
address needs to be published.

## Evidence

- Unit: `tests/unit/lead.test.js` (validation, statuses, confirmation, payload ↔ static form).
- E2E: `tests/e2e/lead.e2e.js` (partial forms blocked, international numbers, confirmed
  success, network failure, unconfirmed server reply, skip = no request, 7-day timing
  across reopen, reminder non-blocking, not during an active lesson, migration, RTL/LTR).
- Live: one synthetic submission marked TEST after deploy, confirmed in Netlify and
  deleted (see the PR / release notes for the result).
