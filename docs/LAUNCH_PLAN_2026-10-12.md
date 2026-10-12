# PE Ultimate — Google Play launch and marketing plan
Date: 2026-10-12. Owner: the project owner (decides, pays, signs, merges). Scope: Android first; iOS afterwards.
Nothing here uploads, signs, pays or publishes anything. Store requirements change: **re-check each console at the time you do the step.**

## 1. The critical path (read this first)

The slowest item is not code. A new personal Google Play developer account must run a **closed test with at least 12 testers for 14 consecutive days** before it can ask for production access (rule as recorded in `docs/NATIVE_RELEASE_CHECKLIST.md` §4; verify the current wording in the console). So:

| Day | What happens | Who |
|---|---|---|
| 0 | Create the Play Console account (25 USD once), finish identity verification | Owner |
| 0-2 | Create the upload key, sign the AAB from CI, upload to Internal testing, then to Closed testing | Owner (Claude walks through it) |
| 2 | Invite 15-20 testers (`docs/CLOSED_TEST_TESTER_GUIDE.md`) | Owner |
| 2-16 | 14 days with 12+ testers opted in. Fix bugs, upload new builds to the same track | Everyone |
| 16 | Apply for production access, fill the questionnaire | Owner |
| 17+ | Google review, then public | Google |

Every day the account and first signed build are delayed delays the public launch one for one. Marketing, translations and polish run in parallel during the 14 days.

## 2. Blockers before the FIRST upload (closed test)

| # | Item | State today | Owner of the work |
|---|---|---|---|
| B1 | Play Console account + identity verification | Not done | Owner |
| B2 | Package ID `io.github.osher15.peultimate` confirmed as permanent | In `main`; the owner must confirm, it can never change after upload | Owner |
| B3 | Upload key (`upload.jks`) created and backed up outside the repo, Play App Signing on | Not done | Owner, Claude gives exact steps |
| B4 | Signed release AAB built from the unsigned CI artifact | Unsigned release AAB job **succeeded on main** (run 38270990317, 54c8afc; 11.9 MB; artifact expires 2026-10-26). Contents not inspected yet (Codex C2) | Claude (verify run, signing steps), Owner (signs) |
| B5 | Target audience | **Decided 2026-10-12 by the owner: adults only (18+) — PE teachers, fitness trainers, club/sport coaches and anyone professionally involved in sport. Not Kids, not Families.** Student mode (pupils view the records board on the teacher's device) is declared in the review notes; the app is not directed at children | Owner enters it in the console |
| B6 | Age-rating questionnaire answers (including the fitness/health question) | Draft in readiness doc §6-7 | Owner confirms; Codex cross-checks against the code |
| B7 | Data safety form + privacy policy store sentence ("deleting the app deletes its data; back up first"; no page-load logging inside the app) | Drafted in readiness doc §6; store/app section and adults-only audience now on `privacy.html` (5 languages, 2026-10-12); Codex C1 still to cross-check | Claude (privacy page), Codex (code cross-check), Owner submits |
| B8 | Health-apps / fitness declaration wording (fitness figures framed as education) | Drafted | Owner |
| B9 | Store listing text in 5 languages, short + full description | Draft in `docs/store-listing/` | Gemini (language polish), Owner approves |
| B10 | Store graphics: 512 icon, feature graphic 1024x500, phone screenshots (min 2, recommended 4-8), tablet screenshots (7"/10") | Icon + feature graphic drafted; English phone + 10" tablet draft set in `docs/store-listing/screenshots/` (emulated, 5 screens each; photo-finish missing; other languages not generated). Owner replaces/confirms from a real phone | Claude (done as draft), Gemini (captions) |
| B11 | Physical-device pass on at least one real Android phone: upgrade without uninstall, offline first launch, backup/restore, camera/mic permission, back button | Owner reports it "worked"; nothing written | Owner (Codex prepares the sheet), `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md` |
| B12 | Package-ID migration for the owner's own existing data (old ID -> new ID) via encrypted backup/restore | Documented, never tested | Owner |
| B13 | App access instructions for reviewers ("no account; choose any 4-digit code; Demo mode opens a sample class") | Drafted | Owner pastes |

## 3. Needed before PRODUCTION (can be done during the 14 days)

| # | Item | Who |
|---|---|---|
| P1 | Teacher review of draft timings, game adaptations, medal thresholds (`docs/TIMING_DRAFT_REVIEW.md`, `docs/ADAPTATIONS_DRAFT_REVIEW.md`). Lesson plans are marked draft in the app on purpose: do not market them as validated | Owner / a teacher |
| P2 | Native-speaker pass on ar/ru/es (app text and listing) | Gemini first pass, a human native speaker second |
| P3 | Fix every bug found by the 12 testers; keep short notes (needed for the production-access questionnaire) | Claude |
| P4 | Crash/ANR check in Play Console pre-launch report; target API level and 16 KB page-size compliance in the AAB | Codex (reads the report/build), Claude fixes |
| P5 | Support contact working (contact form acknowledgement was tested only with a simulated reply: do one authorised live test) | Owner |
| P6 | Accessibility spot check (font scale 200%, TalkBack on the main flow, contrast of the main screens) | Codex |

## 4. Marketing — minimum viable launch

Constraints from `AGENTS.md`: no payments, no paid services, no required accounts, no invented claims. The app is free; nothing in marketing may promise validated lesson plans, grades prediction or "AI".

| # | Item | Who |
|---|---|---|
| M1 | One-sentence positioning + 3 benefits (offline, fast on the field, you keep your data) in 5 languages, aimed at PE teachers, fitness trainers and sports coaches | Gemini draft, Owner approves |
| M2 | Landing page on the existing site (`index.html` meta already added in #45): add store badge/link slot and a "get the app" section, screenshots | Claude (page), Gemini (copy) |
| M3 | 30-45 s demo video from the real app (screen recording of: start lesson, attendance, beep test, photo-finish). Source clips exist on branch `marketing-assets` | Owner records; Gemini writes script/captions |
| M4 | Outreach list: PE teacher groups (Hebrew first), fitness-trainer and sports-club coach groups, club managers, Facebook/WhatsApp groups, PE teacher training colleges, mentors; one short message per channel | Gemini draft, Owner sends |
| M5 | Simple feedback loop: in-app contact form is optional and non-intrusive; add a link to a short public form only if the owner wants one | Owner decides |
| M6 | ASO: title/short description keyword check, 5 languages | Gemini |
| M7 | Post-launch: first-week checklist (reply to reviews, watch crashes, fix top 3 issues) | Everyone |

## 5. Work split

- **Owner**: B1, B2, B3 (signing), B8, B11, B12, B13, P1, P5, M3 recording, merges. Nothing else blocks on others once B1-B3 are done.
- **Claude** (repo work): B4, B7 privacy page, B10 screenshots, P3 bug fixes, M2 landing page, Issue #53 (Excel pupil import) stays queued behind launch blockers.
- **Codex / GPT** (review and evidence): `docs/handoffs/2026-10-12-codex-launch-tasks.md`.
- **Gemini** (language and marketing text): `docs/handoffs/2026-10-12-gemini-launch-tasks.md`.

Both task files are self-contained: another model can start from them without this conversation. They forbid touching product code unless a task says so, and require facts to be checked against the repo.

## 6. What is deliberately NOT in the launch

Payments, accounts, server sync, the component bank and international lesson-bank expansion (all on hold in `AGENTS.md`), iOS (waits for the owner's Mac and an Apple account), and the Excel pupil import (#53) unless the owner raises its priority.

## 7. Status words

Unit tests, browser tests, CI build, emulator, physical device and signed store build are different evidence levels (`docs/NATIVE_RELEASE_CHECKLIST.md` §1). A box in this plan is only ticked with evidence of the right level.
