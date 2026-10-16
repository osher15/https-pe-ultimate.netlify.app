# Task handoff
Date: 2026-10-16
Owner: Claude
Base commit: `531b778` (main, after PR #56)
Branch / PR: `ccr-c2efb123-418zzv`; no PR opened (owner decides)
Task / priority / status: Legal/compliance agent skill. Documentation only. Tested/review.
Reserved files/sections: Issue #60. `.claude/skills/PE-Ultimate-Legal-Compliance/` (new), this handoff; follow-up: `terms.html` §3 and dates, `native/ios/App/App/Info.plist` usage strings, new `*.lproj/InfoPlist.strings`, `project.pbxproj` localization entries, `docs/PLAY_LAUNCH_SECURITY_CHECKLIST_2026-10-13.md` §3 items 11 and 13.

Changes and user behavior:
- First commit: documentation only. Follow-up commit: terms text and iOS permission prompt texts (see below). No JS, privacy page, Android, build, SW or test changes.
- `.claude/skills/PE-Ultimate-Legal-Compliance/SKILL.md`: main operating instructions. Hard rules (no payments, no accounts/server for pupil data, privacy page updated in five languages with every outbound change, no invented compliance claims, adults only, owner submits), workflow, writing rules.
- `privacy-and-student-data.md`: data map, permissions, invariants, retention promises and change protocol, checked against code at `531b778`.
- `apple-google-store-policies.md`: draft Play and App Store answers for this app, and what changes them.
- `payments-and-subscriptions.md`: current state (free, hold reconfirmed by owner 2026-10-16) and the questions that must be answered before the hold can be lifted. No payment work authorized.
- `refunds-and-cancellations.md`: current state (nothing to refund) and planning notes for later.
- `international-compliance.md`: Israel, EU/UK, US and the other language markets, related to the current design.
- `legal-audit-checklist.md`: release/submission checklist with current open items.

Follow-up fixes (owner asked on 2026-10-16 to fix what was found; added to the #60 reservation):
1. `terms.html` §3 in he/en/ar/ru/es: data is kept on the device, not with the operator; deleting the app or clearing browser data deletes it unless a backup file, Drive backup or Android automatic backup exists. Android automatic backup added to the list of sharing the teacher sets up. Date 16 October 2026 in all five languages. Translations are drafts, not reviewed by native speakers.
2. iOS permission prompts: `Info.plist` now English only; translations in new `native/ios/App/App/{en,he,ar,ru,es}.lproj/InfoPlist.strings`, registered in `project.pbxproj` (variant group, Resources phase, knownRegions he/ar/ru/es). Hebrew prompts keep the previous Hebrew wording.
3. Correction of my own finding: `MODIFY_AUDIO_SETTINGS` is needed. Android WebView requires it for microphone capture via `getUserMedia({audio:true})` (`hm-app.js` start detection). Kept; skill docs and `docs/PLAY_LAUNCH_SECURITY_CHECKLIST_2026-10-13.md` §11 corrected.

Still open (not fixable here):
- Android automatic backup on/off behavior not device-tested.
- Owner only: Netlify DPA acceptance; six-monthly contact-submission review and deletion log.
- iOS localized prompts need an Xcode build (CI simulator job) and a device check; no Mac here.

Validation commands and results:
- `npm test` (after the follow-up fixes): 810 tests, 810 passed, 0 failed.
- `node build-standalone.js` twice: both exit 0; no generated diff (terms.html is copied as-is into the native web bundle, not inlined).
- `Info.plist` parses (Python plistlib). `project.pbxproj` and `.strings` not validated by Xcode here; native workflow triggered on this branch (see Issue #60).
- Browser suites not run: no product change.

CI / emulation / physical-device evidence: none needed for docs; none claimed. Facts in the skill come from code reading only, not network capture.

Unresolved issues and dependencies: Law and store-policy references are orientation, not legal advice, and must be checked against current official text before any submission. `AGENTS.md` (Codex-reserved) does not yet point to the skill; Claude Code finds it automatically under `.claude/skills/`.

Publication status: committed and pushed to `ccr-c2efb123-418zzv`. Issue #60 created as the reservation. Nothing merged or deployed.

Next owner / next action: Check the iOS CI job result. Owner reviews and merges, then checks the permission prompts on the iPad in Hebrew. Optionally Codex adds one line to `AGENTS.md` pointing to `.claude/skills/PE-Ultimate-Legal-Compliance/SKILL.md`.
