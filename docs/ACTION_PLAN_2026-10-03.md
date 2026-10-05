# PE Ultimate — execution plan
Date: 2026-10-03
Status (2026-10-04): draft PRs #25–#34 delivered; exact-head checks through #34 passed. Owner integration/merge/deploy and physical Apple testing remain pending. Current acceptance script: docs/FIELD_PILOT_2026-10-04.md.

## Current delivery and integration map

| Slice | Draft PR | Current disposition |
|---|---|---|
| Harness persistence, pupil missing summary and workflow rules | #25 | Reviewed candidate; owner merge pending |
| Requirements calculation/editor | #26–#27 | Configurable class/period policy with strict identity/date guards |
| Report/actual Excel/CSV and period exemptions | #28–#29 | Offline exports and exemption editor |
| Teacher final grades and Grades Excel/CSV | #30 | Explicit override with optional note; no automatic scoring fill |
| Measurement grid and Excel-template paste | #31–#32 | Append-only dated measurements; reviewed draft then Save |
| Isolated pupil print/HTML | #33 | Teacher-mediated single-pupil output |
| Focused Claude rollback review | #34 | Verified replacement/rollback, retry/recovery; supersedes old rollback hunk only |

All are pending integration, not production features. Review sequentially #25 → #34, retarget each dependent PR after its prerequisite merges and rerun checks on the integrated head. #34 exact-head Tests 171 and Native 19 passed. These simulator/build results do not complete physical Apple acceptance.

Codex now runs the cross-module field-to-PC journey and prepares the field pilot (#16). Claude retains builder timing/equipment (#19), native packaging (#13), content preparation (#21) and transfer proposal (#22). Remaining score-to-grade mapping and arbitrary XLSX file import are separate scopes; the reviewed paste flow already exists. Content-bank import (#24) remains held. No additional modules are needed before pilot evidence is reviewed.

The inventory below records the October 3 inspection; its "next" statements are historical where superseded by this current map.

Repository: `osher15/https-pe-ultimate.netlify.app` only.
Baseline: `main` at `3ce07edcff2c64292b95e3060b363b3e1ca0174d`.
Replaces the execution priorities in the 2026-09-30 work plan and the remaining-work list in `ccr-4ae97033-rci9j0:docs/HANDOFF_2026-10-01.md`. Preserve their historical evidence, not their unchecked status as current truth.

## Product direction
The questionnaire refined the existing vision rather than changing the product.
PE Ultimate is a practical PE teacher tool: prepare on a computer, teach quickly on a phone, keep the core usable offline, and retain teacher control.
The immediate order is reliability → fast classroom use → student tracking → reusable preparation tools → wider distribution.
No rewrite to React/TypeScript, internal marketplace, database service, required account or payment system is part of this release.

### Binding teacher decisions
- English first on new installs and English demo; preserve existing language and real data. HE/EN/AR/RU/ES supported.
- Start now with minimal friction; optional lesson-end summary; no intrusive missing-lesson alerts.
- Quick assessment by default; detailed assessment optional. Best result plus full history.
- Class and pupil missing summaries; flexible teacher targets/requirements and assessment periods.
- Attendance assist stays non-destructive; teacher can override final grades.
- Spreadsheet-like PC work and export; pupil view reveals only that pupil's data.
- Offline-first, encrypted backup and simple device transfer, no required account; automatic sync later.
- Import/expansion of international plans and the separate component bank remains PAUSED.
- Android installed and reported working by owner; physical acceptance script and update preservation still to be completed. Apple physical testing awaits owner's Mac/devices.

### Questionnaire Q39–Q50 (confirmed in this conversation)
| Question | Decision | Consequence |
|---|---|---|
| 39 | Practical execution is the first review priority | Clear instructions, real equipment, reasonable time; age/level/safety still required |
| 40 | Manual changes always available; suggestions only on request | Do not silently rebalance or replace a live lesson |
| 41 | Easier and harder adaptations beside the exercise | Show concise adaptations when authored |
| 42 | Compact/full switch, remember preference | Keep safety visible in compact view |
| 43 | Favorites and personal collections | One-tap save; optional organization later |
| 44 | Manual search/filter | Sport, age, time, equipment, pupil count |
| 45 | Save edits as permanent personal version | Preserve original; reusable teacher copy |
| 46 | Readable document and editable import file | Share content without pupil records |
| 47 | Ready-made plan and quick drill assembly | Preserve both entry paths |
| 48 | Quick rating with optional note | No required reflection form |
| 49 | Prior same-class feedback near Start | Use stable plan/class identity |
| 50 | Short core checks then real teaching | Automated checks followed by field pilot |

This records the decisions actually visible or recovered; it does not invent the exact wording or numbering of questions 1–38.

## Evidence and current inventory
- No open PR at the time of inspection. Main has not incorporated the pending October 1 work.
- `ccr-4ae97033-rci9j0` at `48156066644f229c1b7304507f30aff140530a8f`: 8 commits ahead of main. Restore rollback, corrected local-font privacy wording, partial variant timing/equipment, game equipment and separate ball types. Handoff reports 565 unit tests, individual e2e suites passing and a full-run browser crash. These are Claude's results, not a new Codex verification.
- Its remaining gaps include timing for 78/108 variants, draft pedagogical minutes, aerobic pyramid ambiguity, short-lesson behavior, recalculation after manual edits, manual-builder equipment mismatch and free-text equipment persistence.
- `ccr-ca8545f1-o0wys8` contains old AGENTS/COLLABORATION templates, but main has neither. Their React/store/API/Cypress assumptions are wrong for this repository.
- Existing issue #13–#17 scopes must be rewritten; #14 payment planning deferred; #18 becomes the coordination index.
- Existing functionality: timetable/Today, prepare/live, class hub, shared student roster, combined classes, fitness card missing tests, personal-best history, attendance assist, period ranges, CSV/print, backup, native bridge and five languages. Extend these; do not recreate them.
- The My Students profile lacks the missing-fitness summary available in the fitness card. Codex implements that bounded gap.
- Confirmed test-harness defect: fixture initialization runs on every reload and can overwrite the state a persistence test is meant to verify. Codex fixes that before trusting reload tests.
- Font privacy wording is already corrected on Claude's pending branch; do not duplicate that change on main.
- The old architectural/vision documents are historical analyses, not proof that old defects are still open or that store/legal requirements remain current.

## Ownership based on actual project familiarity
Both assistants can implement code. The split uses existing code ownership and task boundaries, not an unsupported claim that one model is universally better.

| Workstream | Implementation owner | Reviewer / evidence |
|---|---|---|
| Execution plan, issue reconciliation, existing-branch audit | Codex | Owner reviews priority and merges |
| Harness persistence and isolated student-profile gap | Codex | Automated checks + Claude review when available |
| Timing/equipment in both lesson builders | Claude (already changed generator) | Codex regression review; teacher checks real timings |
| PC tracking, requirements, exports | Codex in small follow-up tasks | Claude integration review; owner field validation |
| Content preparation/favorites/feedback | Claude after timing work | Codex language/offline/preservation checks |
| Capacitor, Android/AAB, iOS/Xcode packaging | Claude (already built shell) | Codex code/CI review; owner physical devices |
| Transfer workflow | Claude transport proposal and implementation | Codex failure-path/data-preservation review |
| Sources, archive rights, international import | On hold | Claude later integrates, Codex audits, teacher validates |
| Merge/deploy | Owner | Approved PR, green checks, handoff |

Do not start all backlog tasks in parallel. Before each task, reserve exact files and inspect current branches/PRs.

## Ordered delivery

### Gate 0 — make work reviewable (Codex, now)
1. Publish this plan, real workflow rules and replacement Issue bodies.
2. Keep the content hold and owner merge/deploy decision explicit.
3. Inspect Claude's pending diff and open a focused review PR when write access is available.
4. Remove the harness fixture-on-reload defect and add regression tests that fail before the fix.
5. Record which checks ran on main, the Codex branch and the pending Claude branch separately.

Done when: one current execution source, no fictitious store tasks, clear file reservations and a reviewable patch. A permissions blocker must be stated instead of claiming GitHub was updated.

### Gate 1 — reliability and first pupil improvement (Codex now; Claude pending fix review)
- My Students shows a concise missing-fitness list via the existing stable-id API. Its basis is class-recorded tests plus the fitness-index selection; it is not a final-grade or full report-card completeness judgement.
- Keep no-class/unavailable states distinct from no missing tests. Preserve the best/history view and all stored data.
- Review/test Claude restore rollback: correct file, wrong password/file, full storage, partial write, restoration of old values; do not merge the old whole branch untested.
- Exercise class → lesson → attendance → measurement → reload → finish → grade/export. Check duplicate names, rename, combined classes, zero, exemption and period boundaries.
- Audit all reload tests after harness repair. Remove any workaround that copies snapshots into storage on reload; this can hide failed app persistence.
- APK upgrade without uninstall must be verified on an owner device, not inferred from signing code or a simulated native bridge.

Done when: passing targeted/full relevant checks, recorded scope, no loss/misassignment, failure reported, and source/build synchronization.

### Gate 2 — practical lesson builders (Claude, next)
- Finish timing/equipment metadata for all variants in both automatic and manual builders.
- Explain allocated work, rest, instruction and transitions. Recommended time differs from actual elapsed time.
- Recalculate totals after manual edits without blocking save/start.
- At initial automatic generation, use the requested lesson duration to produce a balanced proposal. After teacher edits or lesson start, keep the chosen plan and offer additions/removals only on request.
- Preserve manual build and overrides; alternatives/additional drills are suggestions requested by the teacher.
- Provide workable 30/45/60-minute cases; avoid noisy short-lesson warning walls.
- Resolve the aerobic pyramid ambiguity; do not rubber-stamp draft times.
- Match selected equipment, including ball types; generic other equipment must not silently stand in for a specifically required item.
- Validate quantity/group organization, queues, participation and practical safety with the teacher.

Done when: equipment-constrained generated plans are executable and minute allocation is explained; manual editing remains immediate. Automated timing checks do not prove pedagogical quality.

### Gate 3 — tracking and desktop efficiency (Codex phased; Claude reviews)
First reconcile existing class coverage, profile, FT index tests, norms, grading ranges and attendance-assist behavior. Then implement gaps:
1. Teacher-configured required tests/targets per class and period (not global fitness-index defaults presented as class-specific requirements).
2. Best result with date/history; quick/detail modes.
3. Pupil/class missing summary including the chosen period and reason for missing.
4. Spreadsheet-like desktop table and clean export; grade override and partial/final distinction.
5. Personal pupil view only through an explicitly reviewed access/export flow; do not expose a roster or claim authentication exists.
Example rule: target 40 push-ups = 100, each five fewer reduces five points, with explicit rounding/bounds defined by teacher configuration.

Done when: configurable requirements work across periods/classes, exemptions and legitimate zero; existing manual grades remain; export matches screen and stable identities.

### Gate 4 — reusable content preparation (Claude in separate PRs)
Implement Q41–Q49 decisions in the order: adaptations/view → search/filter → favorites/collections/personal copies → print/import → quick rating/optional note/same-class reminder.
Reuse existing saved plans, prepare assignment and lesson reflection before introducing another store.
Persist only necessary preferences/data under stable identities. Make source/personal versions explicit.
Content exchange excludes student data. Validate import before writes and preserve existing plans on failure.
All changes work offline, in five languages, on narrow phones and desktop. Content import hold remains.

Done when: find → adapt → save personal copy → assign → teach → optional feedback → reuse in same class works without required forms.

### Gate 5 — transfer and release (Claude; owner devices)
- First ship/document existing encrypted backup with file/native-share recovery path.
- Specify code/QR pairing transport and explicit online/offline needs. A short code/QR is not a full database backup.
- No new server, paid service, API keys, required account or automatic sync under this task.
- Review preview/source/destination, wrong-password and failed-restore preservation.
- Android: fixed package id decision, release signing/AAB, version/commit-labelled artifact and upgrade-preservation test.
- Apple: distinguish prepared shell/simulator compilation from signed device build; owner Mac/Xcode/device test remains pending.
- Native original 1024 icon, screenshots/listings/privacy declarations/operator details as applicable; confirm current official requirements when actually preparing submission.
- Review general response headers/CSP only after mapping app dependencies; do not break printing, native bridge or backup flows.

Done when: release artifacts, exact versions, physical-device checks and current account-specific store requirements are recorded. No store submission/deploy happens automatically from this plan.

### Gate 6 — short checks then field pilot (Codex script; owner/teachers use it)
Record task durations and obstacles for:
- Select class/start; attendance; measurement/save; reload/reopen.
- Find/build/edit a lesson; read adaptations; optional feedback/reuse.
- Pupil missing summary; grade/export; backup/recovery.
Physical checks: sunlight/touch/keyboard/back, camera denial, sound/silent switch, native sharing, loss of focus and APK upgrade.
Do not present desktop emulation as phone testing. Prioritize repeated friction and data loss over extra modules.

Done when: owner completes core checks then actual lessons, records concrete blockers, and can independently recover data. No invented readiness score.

## Held / later work
- International lesson-bank/component-bank imports, expansion and old branch integration stay paused.
- Before resumption: current-base integration, precache/offline, provenance/version/review metadata, language completeness, size/load checks, corrected AT-05 timing, a 2–3-plan field pilot.
- Rights for 11 archive documents in hm-plans.js need their own decision; free viewing is not proof of reusable rights.
- Master Knowledge Document v3, wider observations/standards mapping and local statistical insights follow validated core workflow. No invented AI grades, predictions, PLI or validated measurement claims.
- Norm packages/country defaults require source/licence/current evidence; no automatic switch merely because the UI language changes.
- Badges, big-screen competition, multi-teacher cloud/parent portal, payments, remote sync and architecture rewrite are later proposals, not launch blockers or current implementation orders.
- No reopened live contact submissions/email tests without a new reason; respect prior completed fixes.

## Claude's next instruction
Read AGENTS.md, COLLABORATION.md, this plan and docs/GITHUB_TASKS_2026-10-03.md.
Check whether the Codex patch has been applied and whether ccr-4ae97033-rci9j0 has a reviewed PR.
Do not merge a historical branch wholesale, reopen completed fixes, change another repository or lift the content hold.
Start Gate 2 after Gate 1 reliability review; reserve lesson-builder/source sections first.
Use one focused branch/PR per slice, run relevant tests, rebuild generated files, and write a factual handoff with remaining work.
Codex delivered the harness/pupil/assessment stack through #34. Do not duplicate those changes or reapply the old rollback hunk. Review the current map and FIELD_PILOT_2026-10-04.md; reserve timing/equipment/native sections before work.
Owner remains merge/deploy coordinator.

## Sources
- Current main and pending branches inspected directly on 2026-10-03.
- Prior work plan: PE_Ultimate_Work_Plan_2026-09-30.md (current file read).
- Pending Claude handoff: docs/HANDOFF_2026-10-01.md at 4815606.
- Historical docs/ORIGIN_VISION.md and docs/IMPROVEMENT_PLAN.md; historical details superseded by current user decisions/code.
- Questionnaire decisions Q39–Q50 in current conversation; earlier decisions recovered from prior conversation/work plan.
