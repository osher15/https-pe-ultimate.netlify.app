# GitHub task reconciliation — 2026-10-03

Publication: GitHub access restored on 2026-10-03. Existing Issues #13–#18 were rewritten; new timing/missing/libraryux/transfer/tracker/contenthold tasks are #19/#20/#21/#22/#23/#24 respectively. This document preserves the specifications; use live Issues for current status.

## Replace existing #13
Title: [Claude][P1] Native release packaging and physical-device checklist

Owner: Claude
Status: Backlog; owner Android works, Apple devices pending

Replace the former internal store-pages/React task: this means Google Play and Apple App Store distribution of the existing Capacitor application. Files native/, .github/workflows/native.yml, store-readiness docs. No src/pages/stores, routing rewrite, database, Store API or payment infrastructure.

Acceptance: commit/version-labelled APK and release AAB preparation; fixed package ID/production-signing decision by owner; upgrade without uninstall preserves data (physical test); distinguish simulator compile from signed iOS/device validation; owner Mac/Xcode instructions; original 1024 icon/store screenshots/listing/declarations. Recheck official account-specific requirements at submission time. Do not resubmit contact/email tests without a reason. Owner merges/deploys/submits; no automatic upload.

## Replace existing #14
Title: [Deferred] Payment planning — no implementation or scaffolding

Owner: Claude later
Status: Deferred; not a release dependency

No payment processor, keys, env variables, webhooks, interfaces/scaffolding or internal marketplace in the current plan. Revisit only after a separate owner decision. This replaces the old React payment types task. Keep core usable offline and without a required account. Historical monetization proposals are not implementation authorization.

## Replace existing #15
Title: [Codex][P0] Review pending October 1 reliability and generator branch

Owner: Codex
Status: Targeted review completed; focused PR and broader review pending

Review ccr-4ae97033-rci9j0 at 4815606 against main 3ce07ed. Focus on backup rollback, equipment matching, partial timing and language changes. Actual stack: Vanilla JS, hm-data.js, Node tests, Playwright, Capacitor.

Acceptance: source/build synchronization; reproduce restore failure before fix and verify rollback after; inspect equipment false positives/alternatives; preserve stable identities/manual grades/language; check relevant/full suites with the repaired fixture harness; record actual tested base. 30/108 variant timing and pedagogical draft minutes do not count as completed timing work. Do not copy stale generated files or merge a historical branch wholesale. Handoff states findings and remaining tasks.

## Replace existing #16
Title: [Codex][P1] Field workflow verification and pilot script

Owner: Codex writes/runs browser script; owner tests physical devices and lessons
Status: Pilot script prepared locally; field/device checks pending

Validate class/start/attendance/result/finish, Today/full schedule, preparation and pupil missing view. Check English first and all five languages, compact phone/desktop, back/keyboard/touch, and explicit saved/error state. Measure actions/time in actual use, not an invented UX score.

Acceptance: three core flows without repeated class selection or lost data; phone camera/audio/share/upgrade checks recorded separately from browser emulation. Q50 requires short core checks then real teaching. Publish actionable pilot checklist and evidence. No store listing/filtering task or Cypress introduced.

## Replace existing #17
Title: [Codex][P0] Correct persistence-test fixtures and validate data flows

Owner: Codex
Status: Implemented and validated; draft PR publication/review pending
Reserved: tests/e2e/harness.js; new persistenceharness.e2e.js; run.js registration.

Confirmed defect: initialization re-injects fixtures on every reload, replacing saved app state. Seed once per test context/tab without writing a marker in the app namespace; preserve edits/deletions/cleared app state on reload. Add regression tests failing against old harness. Audit reload tests for false proofs. Then check backup/reopen/grade/combined-class/native integration using actual JS app, not fictional Store API/auth/database flows.

Acceptance: changed and deleted data survive multiple reloads; app clear does not restore fixtures; separate tests still isolated; new-install language tests/native snapshot checks continue passing. Test failure paths with synthetic data. No production-server submissions.

## Replace existing #18
Title: PE Ultimate execution coordination — October 3 action plan

Owner: Codex maintains plan/verification; Claude implements reserved tasks; owner coordinates merge/deploy
Status: Plan and code prepared locally; GitHub Issues published; code review pending

Authoritative plan: docs/ACTION_PLAN_2026-10-03.md. Actual workflow: AGENTS.md, COLLABORATION.md, docs/handoffs/.

The old Issue templates mistook app-store packaging for an internal marketplace and claimed nonexistent React/Cypress infrastructure. Use corrected #13–#17 scopes plus new task specs in docs/GITHUB_TASKS_2026-10-03.md.

Start with pending-branch review + harness fix + student missing-summary. Next Claude completes both lesson builders; Codex phases student tracking/export; content UX and device transfer follow. International imports/expansion remain PAUSED; Apple physical testing awaits owner; payments deferred. Each task requires owner/priority/status/dependencies/files/acceptance. No work in other repos. Neither assistant automatically merges/deploys. Check active branches/PRs before editing shared helpers/translations/generated files.

## New task: timing
Title: [Claude][P1] Complete practical timing and equipment in both lesson builders

Owner: Claude
Status: Ready after review of pending branch ccr-4ae97033-rci9j0

Complete the remaining 78/108 variant timing entries, verify all equipment requirements, and bring hm-build.js into agreement with hm-lesson.js. Preserve the manual builder, manual overrides and non-blocking save/start. Distinguish recommended time, allocated time and actual lesson time; account for explanations, transitions and rest. Recalculate after manual edits. Suggest another drill or a shorter alternative when requested; do not silently modify the teacher's lesson.

Acceptance: 30/45/60-minute examples explain the entire allocation; automatic picks respect equipment; manual picks show useful alternatives; modifying minutes updates the summary; 30-minute plans are usable without a wall of warnings. Resolve the aerobic distance-pyramid ambiguity before assigning time. Pedagogical timing is draft until teacher field validation. Existing content imports remain paused.

Files: hm-lesson.js, hm-build.js, hm-know.js as needed. Shared hm-data.js/i18n/build outputs require explicit coordination. Codex reviews/tests. Publish a focused PR and handoff, not an unreviewed whole-branch merge.

## New task: missing
Title: [Codex][P1] Show missing fitness tests directly in the student profile

Owner: Codex
Status: Implemented and validated; draft PR publication/review pending

The fitness card already exposes missing tests; the general My Students profile does not. Add a concise missing-tests section to that profile using the existing FT.progress.missing API and the student's own stable cid. Explain that it reflects the class's recorded tests and the fitness-index selection, not a final grade or all report-card requirements. Keep personal-best/history views and current grading unchanged. Distinguish a student with no class and unavailable context from a completed selection. Read only; no new storage schema.

Acceptance: duplicate names remain separate; selecting another class in Fitness does not leak its missing tests into this profile; renaming a class preserves results; zero results remain valid; English/HE/AR/RU/ES labels; no writes to measurements/attendance/grades; narrow phone layout.

Reserved files: hm-new.js (student profile only), new tests/e2e/studentmissing.e2e.js; a small isolated translation addition in hm-i18n.js. Generated files rebuilt at integration. No edits to Claude's pending source files.

## New task: libraryux
Title: [Claude][P2] Teacher content workflow from questionnaire Q41–Q49

Owner: Claude
Status: Backlog; after timing and core reliability

Implement in small PRs, reusing existing prepare/live/library paths:
1. Easier/challenging adaptations visible beside each drill.
2. Compact/full view toggle with saved preference (keep safety visible).
3. One-tap favorites plus optional personal collections.
4. Manual search/filter by sport, age, duration, equipment and pupil count. Do not make automatic class suggestions the default.
5. Edits saved as a personal reusable copy; preserve source identity/version.
6. Export readable/printable plan and importable editable file; share lesson content without student records.
7. Quick feedback rating with optional note; show previous rating/note for the same class near Start.

Inspect existing saved plans and reflection features before adding anything. Feedback scope uses planId/cid/sessionId; never duplicate an existing reflection store without a migration plan. Adaptations must be authored/reviewed, not claimed available for every item. Keep the international content import paused. Each PR needs offline, language, safe import and data-preservation acceptance checks. Coordinate shared files with Codex.

## New task: transfer
Title: [Claude][P2] Simple secure device transfer with backup-file fallback

Owner: Claude
Status: Design then implementation after reliability gate

User chose both simple code/QR transfer and a backup file, without a required account. Heavy preparation on PC, field work on phone. First release must work with explicit export/import and the existing encrypted backup, with automatic synchronization deferred.

First document a concrete transport choice and its online/offline needs. A short code or QR is a pairing mechanism, not storage for an entire student database. No new paid service, account system, server or API keys are authorized by this task. Implement the available encrypted file/native sharing path first; make any direct pairing dependency explicit before claiming it works.

Acceptance: clear source/destination and preview; wrong password/file rejected before writes; failed restore preserves prior data; successful restore keeps stable ids and saved language; update APK without uninstall verified by owner on device. Include recovery steps. Coordinate hm-app.js, hm-native.js, hm-data.js changes. Reuse pending restore rollback fix.

## New task: tracker
Title: [Codex][P1] Specify and phase student tracking, periods and spreadsheet exports

Owner: Codex (definition, targeted data/UI implementation and validation)
Status: Backlog after missing-profile PR; Claude integration only by explicit file reservation

Build on existing profile, class missing view, grading period ranges, attendance assist and exports. First map actual existing behavior; implement only gaps.

User decisions: configurable assessment periods and teacher requirements/targets; mandatory tests vary by class; quick check default and detailed check optional; best result with full history; per-student and per-class missing summary; spreadsheet-like PC view/export; teacher override for final grades; no double marking if avoidable. Preserve non-destructive attendance fill. Missing is not zero and partial grades are not final. Student view may reveal only that student's data; no public roster link or assumed login system.

Acceptance examples: 40 push-ups -> 100, each five fewer -> five points fewer under the teacher's configured rule; period boundaries; legitimate zero; exempt day; combined classes; duplicate names; manual override preserved. Explain the result basis. Deliver phased plan then focused PRs; do not create a new storage model until existing paths have been reviewed.

## New task: contenthold
Title: [P2][On hold] Content import, provenance and archive rights gate

Owner: Claude for later integration; Codex for review; teacher for practical validation
Status: On hold by user decision

Do not continue importing the 60 international plans, the component bank, or feat/international-lesson-bank. Keep drills/games/activities separate from lesson sequences. Resume only when the user lifts the hold.

At resumption: refresh branch against current main without replacing current source with stale copies; source page/revision/content version/review status per sport/item/language; SW precache and offline opening; explicit unavailable-language notice; translation equivalence, practicable duration and equipment; assess loading cost; connect selection/edit/assignment/live/reflection in a small pilot. Resolve AT-05 timing contradictions. Audit rights for 11 old archive documents in hm-plans.js separately; no assumptions that free access means reusable content. Native-language and field validation remain separate from automated tests.
