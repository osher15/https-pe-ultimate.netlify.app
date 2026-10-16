# Task handoff
Date: 2026-10-16
Owner: Claude
Base commit: `531b778` (main, after PR #56)
Branch / PR: `ccr-c2efb123-418zzv`; no PR opened (owner decides)
Task / priority / status: Legal/compliance agent skill. Documentation only. Tested/review.
Reserved files/sections: Issue #60. New files only: `.claude/skills/legal-compliance/` (SKILL.md and six reference files) and this handoff. No shared files touched.

Changes and user behavior:
- No app behavior changes. No product, privacy page, terms, native, build, SW or test files changed.
- `.claude/skills/legal-compliance/SKILL.md`: main operating instructions. Hard rules (no payments, no accounts/server for pupil data, privacy page updated in five languages with every outbound change, no invented compliance claims, adults only, owner submits), workflow, writing rules.
- `privacy-and-student-data.md`: data map, permissions, invariants, retention promises and change protocol, checked against code at `531b778`.
- `apple-google-store-policies.md`: draft Play and App Store answers for this app, and what changes them.
- `payments-and-subscriptions.md`: current state (free, hold reconfirmed by owner 2026-10-16) and the questions that must be answered before the hold can be lifted. No payment work authorized.
- `refunds-and-cancellations.md`: current state (nothing to refund) and planning notes for later.
- `international-compliance.md`: Israel, EU/UK, US and the other language markets, related to the current design.
- `legal-audit-checklist.md`: release/submission checklist with current open items.

Open items found while writing (not fixed; outside this docs-only scope):
1. `terms.html` §3 says data "is stored only on the device"; it does not reflect optional Drive backup, records sync and Android Auto Backup in the native app. Terms dated 29 September 2026.
2. `MODIFY_AUDIO_SETTINGS` in the Android manifest has no code use found (already listed in the Play checklist).
3. iOS usage-description strings mix English and Hebrew.
4. Android Auto Backup on/off behavior is not yet device-tested.
5. Owner-only: Netlify DPA acceptance and the six-monthly contact-submission review/deletion log.

Validation commands and results:
- `npm test`: 810 tests, 810 passed, 0 failed.
- `node build-standalone.js` twice: both exit 0; no generated diff (only the new `.claude/` folder is untracked before commit).
- Browser suites not run: no product change.

CI / emulation / physical-device evidence: none needed for docs; none claimed. Facts in the skill come from code reading only, not network capture.

Unresolved issues and dependencies: Law and store-policy references are orientation, not legal advice, and must be checked against current official text before any submission. `AGENTS.md` (Codex-reserved) does not yet point to the skill; Claude Code finds it automatically under `.claude/skills/`.

Publication status: committed and pushed to `ccr-c2efb123-418zzv`. Issue #60 created as the reservation. Nothing merged or deployed.

Next owner / next action: Owner reviews and merges. Optionally Codex adds one line to `AGENTS.md` pointing to `.claude/skills/legal-compliance/SKILL.md`. Fix open item 1 in a separate reserved task (`terms.html`, five languages).
