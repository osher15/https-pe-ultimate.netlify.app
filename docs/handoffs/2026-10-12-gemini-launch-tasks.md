# Tasks for Gemini — store listing language and marketing text
Date: 2026-10-12. Author: Claude. Read first: `docs/LAUNCH_PLAN_2026-10-12.md`, `docs/store-listing/STORE_LISTING_2026-10-05.md`, `README.md`, `AGENTS.md`.
You write and review text. You do **not** edit app code, build files, or native config. Deliver your work as new Markdown files under `docs/marketing/` on a dedicated branch (the owner or Claude merges). New documentation and comments are in English; the deliverable texts are in the language named in each task.

Facts you may use: the app is free, works offline, needs no account, keeps pupil data on the device, is for physical-education teachers, supports Hebrew, English, Arabic, Russian and Spanish, and has: timetable and lesson planner, live lesson timer, attendance, fitness tests with norms, beep test, photo-finish, class and pupil tracking, grades with manual override, Excel/CSV export, encrypted backup and restore, games library. Lesson-bank plans are drafts: **never call them validated, certified, official or AI-generated**. No medical claims, no grade predictions, no "AI". No invented numbers, ratings, testimonials or user counts. If a fact is not in the repo or in this file, ask the owner instead of guessing.

## G1 — Native-style review of the listing in 5 languages (blocker B9, P2)
Input: the five texts in `docs/store-listing/STORE_LISTING_2026-10-05.md`. For each language: fix grammar, tone and terminology for PE teachers in that country, keep the character limits (name 30, short 80, full 4000; measure them), keep the facts unchanged. Output `docs/marketing/listing-review.md`: per language the corrected text, then a list of every change with the reason. Mark anything you are unsure of as "needs a human native speaker".

## G2 — Positioning and landing copy (M1, M2)
One sentence + three benefits (offline in the gym, fast during the lesson, you keep your data) in all five languages, plus a short "get the app" section text and a FAQ of 6 questions (Is it free? Do I need internet? Where is my data? Can I move to a new phone? Which devices? How do I contact you?). Answers must match `privacy.html` and the readiness doc §3 and §6; quote the file you used for each answer.

## G3 — Screenshot captions and feature graphic text (B10)
Eight short captions (max 6 words) per language, one per planned screenshot: Today/timetable, live lesson, attendance, fitness tests, beep test, photo-finish, pupil progress, backup. Output a table.

## G4 — Demo video script (M3)
A 30-45 second script for a screen recording: shot list with exact taps, on-screen text in Hebrew and English, no voice-over required. Use only features that exist. Source clips of a previous marketing attempt are on branch `marketing-assets`: you may reuse ideas but nothing there is evidence about the app.

## G5 — Outreach messages (M4)
Short messages (under 600 characters) for: a PE-teachers WhatsApp/Facebook group, a mentor/inspector, a teacher-training college, a colleague asking to test. Hebrew first, then English. Honest wording: "free tool I built, looking for feedback", with the closed-test join instructions placeholder `[LINK]`. No pressure language, no fake urgency.

## G6 — Keywords and store-listing optimisation (M6)
For each language, 10 search phrases a PE teacher would type, grouped by intent, and where each should appear (title is fixed as "PE Ultimate App"; short description; first 250 characters of the full description). Do not invent search volumes; say "unknown" unless you can cite a source with its date.

When finished, write `docs/handoffs/2026-10-12-gemini-launch-result.md`: what you produced, what is uncertain, what needs a human native speaker.
