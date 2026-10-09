# PE Ultimate — external report review and Claude action plan

Date: 2026-10-09  
Requested by: Osher  
Owner of this review: Codex  
Coordination: [Issue #48](https://github.com/osher15/https-pe-ultimate.netlify.app/issues/48)  
Documentation branch: `codex/report-action-plan-2026-10-09`  
Observed main: `348c1ab2d4f069aea7f4640328b7e4f8f30611c3` (#46)

## Decision

Use the report as a source of product ideas, not as a verified description of the app or an implementation specification. Its strongest idea is a practical class tournament. Its most useful immediate refinements are session participation adaptations, media-storage visibility and clearer first-use/home hierarchy. Much of its claimed missing functionality is already implemented.

Keep the established product direction: prepare on a computer, operate quickly on a phone, offline core, English first, five languages, stable pupil/class identity and teacher control. Improve the current workflows before adding another layer of navigation or measurement technology.

This is a review and a proposed implementation sequence. No product code, language arrays, generated files, native configuration or Notion content changed. No merge/deploy or external live-data test. Claude implementation issues are planned, not completed or broad product-file reservations. No review-only PR was opened. The owner's sketches have not arrived; visual decisions are provisional.

## Source and evidence

Input: uploaded `PE_x5f_Ultimate_x5f_Doh_x5f_Tahkir_x5f_Claude.md`, internally dated 2026-10-08. Read in full from the provided attachment. The source is unchanged.

Read current-main `AGENTS.md`, `COLLABORATION.md`, `docs/ACTION_PLAN_2026-10-03.md` and relevant October 5 handoffs. Compared actual source in `hm-app.js`, `hm-live.js`, `hm-tools.js`, `hm-data.js`, `hm-new.js`, `hm-build.js`, `hm-know.js`, assessment/report modules and home browser tests. The October 3 plan contains historical descriptions; current code takes precedence over stale task text.

Open work inspected: #13, #16, #19, #21, #22, #23, #24, #45 and open PR records. #26–#33/#35 are historical open records for previously incorporated work; an open record alone does not mean its functionality is missing. Do not re-merge those stacks. #44 remains open/unmerged (store/icon/package changes); do not assume its package changes are main. #47 remains open/unmerged at `1d72cb9`; its lesson-bank text review is separate.

Earlier Codex evidence on PR #47: 700 unit tests, 635 browser tests and six additional lesson-card checks passed; 41 remaining Notion pages matched. This report does not relabel that as a fresh full regression of main or a physical-device pass.

New targeted evidence on main for this review: the existing `today.e2e.js` suite passed **19/19**, process exit 0. It verifies current home hierarchy, full day, scheduled start, active-session reuse, class rename and schedule persistence. It does not establish sunlight, touch, first-user usability or a complete new UX audit.

```sh
git fetch origin main
git log -5 --oneline FETCH_HEAD
git show FETCH_HEAD:AGENTS.md
git show FETCH_HEAD:COLLABORATION.md
git worktree add -b codex/report-action-plan-2026-10-09 /workspace/scratch/b7ba7938223e/pe-review-plan FETCH_HEAD
# In the main-based documentation worktree:
NODE_OPTIONS=--require=/workspace/scratch/b7ba7938223e/browser-preload.cjs node -e 'const h=require("./tests/e2e/harness.js");h.run([require("./tests/e2e/today.e2e.js")]).then(f=>process.exit(f?1:0)).catch(e=>{console.error(e);process.exit(1)})'
git diff --check
```

Browser environment reused the temporary alternate Chromium 153 described in the October 9 lesson-bank review. The preload only changes the launch executable and adds `--no-zygote` / `--disable-gpu`. No test assertions, fixture behaviour or product files changed. No full npm/build/native regression rerun for this documentation-only change.

## Correct the report's factual baseline

| Report claim | Current evidence | Consequence for Claude |
|---|---|---|
| React components, Props and Tailwind | Vanilla JS/HTML/CSS; Node tests, Playwright, generated standalone app and Capacitor (`AGENTS.md`, package/build files) | Discard the React/Tailwind prompts. Extend existing modules with bounded hooks. |
| All data is IndexedDB and encrypted | `hm-app.js` LS wrapper stores most teacher state in localStorage. REC uses IndexedDB `rec` for records/video. Backup encryption uses PBKDF2/AES-GCM; ordinary local stores are not shown encrypted at rest. | Say “local-first with encrypted backup”, not “everything encrypted”. No storage migration just to follow this report. |
| Everything works offline | Core paths are local; optional OAuth/Drive/Sheet, online demonstrations and submissions need connectivity/configuration. | Preserve offline core; state optional online limitations explicitly. |
| Drive is available with the existing Client ID | `gdGetToken`/`gdBackupNow` require a teacher-entered configured Client ID; empty configuration is handled explicitly. | Do not assume a working configured account, require OAuth, add keys or make Drive part of ordinary teaching. |
| No daily attendance or exemption marking | `hm-tools.js` attendance and `HMDATA.splitByAttendance` already use p/h/a/e; `hm-live.js` opens the active-class tools. | Refine this path; do not build a second attendance store. |
| Injured/exempt pupils need automatic removal from groups/grades | Present-only team mode already filters a/e and includes p/h. All-class mode remains an explicit teacher option. Period/test exemptions exist in `hm-assessment.js`/`hm-assessment-data.js`. | Session adaptations, attendance and assessment exemption must remain distinct. Never globally remove grades or pupils. |
| There is no station/circuit builder | FITNESS in `hm-app.js` contains `cGen`, `cRenderList`, `cStart`/`cLoop`, interval presets, exercise demonstrations; manual/automatic lesson builders already exist. | Improve station-to-saved-plan integration if needed; do not add a duplicate StationBuilder. |
| Home has 12 equally prominent sections | `paintToday`/`focusCard`/`dayFoot` prioritise current/next lesson, compact upcoming rows and full day. `today.e2e.js` checks Today -> quick tools -> collapsed secondary content. | The report's exact count/overload description is unverified. Measure real friction before replacing navigation. |
| Add a demonstration-video field to every record sport | Existing sport editor has `yt`, `#rec-spYt` and `howtoHtml`; fitness has demonstration links too. | Reuse the field. A curated link is not an offline video or a licence to embed/rehost it. |
| Record video proof is always mandatory | `sendSub` accepts `file || null`; `saveManual` supports approved teacher records without video. | Do not introduce mandatory video in normal assessment or exaggerate current enforcement. |
| Fifteen videos will crash the browser | No evidence for a universal file-count threshold. Code caps a submission file at 120 MB and has per-sport duration rules; storage depends on bytes/device/browser. | Measure sizes and storage failures; do not treat “15” as an acceptance criterion. |
| Full backups do not already address video | `bkSnapshotFull` calls REC `exportAll`, includes IndexedDB data and records omitted items/errors; existing rollback/recovery is substantial. | Extend coverage/visibility and media transaction handling, preserve existing restore protection. |
| Photo-finish and all protocols merit certified 10/10 precision | Camera/frame-dependent features exist, but no certification or controlled accuracy study was supplied. Beep code defaults to 20 m / 8.0; a code default is not validation against every protocol/norm. | Do not make certified timing or universal protocol claims. Keep protocol-specific evidence separate from UI existence. |
| VO2/zone/trend provides a health-risk judgement | Formula/zone and trend display exist in `hm-data.js`/`hm-new.js`; no clinical validation is supplied by this report. | Keep estimates educational and separate from diagnosis, restriction or automatic grades. |
| Reported Ministry/FITNESSGRAM percentages/norms are universally correct | Grading weights/period rules are teacher configurable. The uploaded report supplies no official edition/country/source validation. | Do not hard-code the report's percentages internationally or certify regulatory compliance. A policy audit needs the applicable official source. |
| No competitor offers this combination; 8.7/10 and $30 comparison | Unsupported competitive/price/quality assertions in the attachment; this task did not conduct a new competitor market study. | Useful positioning hypothesis, not factual store/marketing copy or release readiness score. |

### What is worth preserving

The practical strengths are integration and continuity: class context follows the lesson into tools; identities survive rename/import; measurements retain history; best results and teacher decisions stay separate; backup failures have explicit recovery; preparation and live teaching remain separate; game adaptations/favourites and the lesson bank already broaden daily use.

Records and motivation can support teaching, but should not take priority over the active lesson, preparation, attendance or teacher observation. A teacher should not need to keep looking at the screen to administer sport.

## Idea-by-idea verdict

| Idea | Verdict | Fit to PE Ultimate |
|---|---|---|
| Clear home hierarchy | Adopt as refinement | Existing hierarchy is the starting point. Primary Start/Resume, upcoming lessons, full-day access and easy preparation remain. Await sketches before approving visual layout. |
| Exactly three static home buttons: lesson / measurement / new record | Modify | New Record is secondary. Preserve Prepare and today's upcoming schedule; don't hide essential lesson tools in a new Drawer. |
| Lesson participation/role choices | Adopt with a corrected model | Per-session functional adaptations and optional roles; ordinary marking stays quick. Do not create a global diagnosis/grade-exclusion flag. |
| Auto wheelchair symbol and “no equipment” alternative | Reject as proposed | A disability icon is not a functional need, and no-equipment content is not automatically suitable. Neutral teacher-chosen options are more useful. |
| Four-team class tournament | Adopt as a later small pilot | Real gap in inspected app modules. Reuse team generation; final-score entry by default, timer and fixtures; keep teacher phone use low. |
| Continuous scoring and every foul | Defer/optional | Useful for a scoreboard operator, burdensome for a teacher managing 25–30 pupils. Basketball scoring needs +1/+2/+3 and correction, not only +1. |
| Automatically update weekly challenge after every match | Reject in first slice | Separate concepts and stores. Tournament result should not create a personal challenge record or grade. |
| Tactical board | Defer | Useful desktop preparation/large-display aid after a tournament pilot. Small-phone drawing is not a first field-use priority. Saving a drawing into a plan must be explicit. |
| StationBuilder | Reuse and extend later | Existing circuits and builders need a saved-plan connection, practical equipment/group checks and transition time if a real pilot shows a gap. |
| Storage estimate and media overview | Adopt | Low-noise byte/count information and graceful failure; origin estimate is approximate. No blanket “80% guarantees safety” claim. |
| Forced Drive backup, 480p WebM conversion, delete local after upload | Reject as the default | Requires online setup, creates conversion/memory/codec and recovery questions, and may damage proof quality. Prefer existing local encrypted backup/native sharing and explicit retention decisions. |
| Personal achievement certificate | Reuse later | Existing single-pupil print/HTML path already isolates pupil data. Achievement layout could extend it; no new portal/public pupil URL. |
| QR linking to a pupil's results | Defer pending access design | Current record guest/kiosk QR is a submission route, not authenticated per-pupil progress access. A URL/QR alone does not establish who may view a child’s data. |
| Bluetooth heart-rate watch | Defer | Device/protocol/browser/native compatibility investigation required; no baseline classroom need established. |
| AI push-up/pose scoring | Defer | Needs teacher-labelled validation across angles, bodies and movements. No automatic grading or promise of accuracy based on a demo. |
| Separate pupil app | Defer | Reuse private teacher-reviewed exports now. Authentication, pupil isolation and transport are a separate owner decision. |
| New three-screen mandatory onboarding | Modify | Reuse existing onboarding; allow skip/return and manual lesson start. Import -> build -> beep is not every teacher's path. |

## Bounded execution order for Claude

This order supersedes only the uploaded report's proposed sequence. It does not replace existing native, transfer, content or assessment reservations. Do not start all tasks at once. Estimate implementation duration only after the bounded slice is designed; the report's two-week/month deadlines are not verified estimates.

### Gate 0 — baseline and real classroom pilot

Owner/Claude review #47 separately; its merge remains the owner's action. Confirm current main again before coding. Preserve #44/native review and #13 physical testing, #22 recovery/transfer and #24 field acceptance. A backup verification code is still not transport.

Use existing #16 pilot: start/resume scheduled or unscheduled lesson -> mark ordinary attendance -> record a result -> reopen -> finish without forced feedback -> prepare next lesson. Test one actual class, phone outdoors, PC preparation and the owner's Apple/Android workflows. Record observed actions, time and failure, not a readiness score.

### Gate 1 — storage/recovery refinement: [#49](https://github.com/osher15/https-pe-ultimate.netlify.app/issues/49)

Suggested owner: Claude; Codex reviews failure/data-preservation evidence.

Inspect existing REC, LS failure warnings, backup/export and native sharing. Add an optional media/storage overview: total local video bytes/count, origin estimate when supported, clear omitted-backup information and a recoverable media-save error. Preserve source file/form when a save fails. Investigate IndexedDB transaction completion before announcing a successful save; existing `dbPut` resolves on request success, which merits a failure-path check rather than an unproven “crash” diagnosis.

80% may be a product warning heuristic, not a guaranteed boundary; no recurring field alert. An origin estimate is not the native filesystem's available capacity or localStorage-specific headroom. No automatic deletion, new keys/account requirement or transcoding in this slice.

Done when: unsupported/failed estimates, full storage, aborted transactions, save retry, media omitted from backup, restore/reload and no duplicate records are tested with synthetic data; prior data remains; actual low-storage/native behaviour is labelled separately.

### Gate 2 — participation adaptations: [#50](https://github.com/osher15/https-pe-ultimate.netlify.app/issues/50)

Suggested owner: Claude after reviewing the short data model with the teacher; coordinate assessment boundaries under #23.

Keep four distinct dimensions: attendance, activity participation, optional lesson role, assessment-period exemption. Ordinary attendance remains one tap. Session-scoped teacher-entered restrictions and role choices are optional details. Adaptation does not mean absence; present-but-not-playing does not mean zero grade. Default restriction expires with the lesson; any longer period requires explicit dates/teacher choice.

Group preview shows players and non-playing roles. Reuse p/h/a/e and current explicit filters. Preserve roster, measurements, period policies and final/manual grades. Do not automatically use a disability symbol or choose a supposedly safe activity from equipment alone.

Done when: duplicate names, rename/combined class, active-session reload, next-lesson reset, expired restriction, explicit role and save-failure draft preservation are demonstrated. Any new key has a version/restore validation and backup/native coverage. Private notes do not appear in public boards/pupil documents.

### Gate 3 — home refinement: [#51](https://github.com/osher15/https-pe-ultimate.netlify.app/issues/51)

Suggested owner: Claude after sketch assessment; Codex checks workflow regressions. Dependency: owner sends sketches.

Compare each sketch against the current home instead of rebuilding it: active lesson, current/next scheduled lesson, no timetable, no class yet, free day and completed day. Keep active-class context, today/upcoming/full day, visible preparation and manual paths. Secondary settings/import/records may stay collapsed; a new drawer is not a requirement.

Proposed acceptance targets, not measured facts: resume in one action, start the shown scheduled class within two, all-day access within one from Home. Ordinary teaching should remain possible without importing pupils or completing a tutorial. Evaluate 390px phone, tablet both orientations and desktop; English, RTL and all five languages; large text, keyboard and actual touch.

Done when: approved sketch-to-state mapping and real pilot show less friction; no duplicated/replaced live session or lost language/data; existing Today/Live/Prepare tests still pass. No visual implementation approval is inferred from this review.

### Gate 4 — tournament pilot: [#52](https://github.com/osher15/https-pe-ultimate.netlify.app/issues/52)

Suggested owner: Claude, with teacher approving the small scope before source changes. Optional feature, not a release blocker.

First version: four teams from the current generator, six pairings in three rounds, court count and time chosen by teacher, timer/next match, end-of-match score entry, standings and explicit corrections. Use existing localStorage wrapper and backup/native mirror; a new IndexedDB matches database is unnecessary by default. Proposed isolated pure model/UI modules can keep shared-file hooks small.

Two courts let four teams play simultaneously across three rounds. One court requires six sequential matches and explicit active/rotation tasks for waiting groups; do not market all pupils as active automatically. Minutes include instruction, warm-up, games, between-game transitions and finish. Never force five-minute games or turn simplified school rules into official competition rules.

Team identity and roster snapshot survive rename; editing current groups must not silently rewrite an active tournament. Default final-score entry reduces teacher phone use. Continuous score/fouls are a separate optional operator mode. No automatic challenge updates, personal grades or permanent winner/loser labels.

Done when: pairing uniqueness/no self-match, draw/unfinished-game rules, points/tie criteria, correction/Undo, idempotent End, quota failure, restore validation and reload are tested. One real class confirms activity/rotation and manageable teacher phone use.

### Later reuse work — do not open duplicate implementation streams

- Under #19/#21, if pilot identifies a gap, connect an existing circuit to a saved personal lesson; let the teacher adjust stations/timing and choose a suitable reviewed adaptation. No separate content-bank expansion or new StationBuilder.
- Reuse `hm-assessment-student-report.js` for an optional teacher-reviewed achievement layout after #23 sharing decisions. No public QR or new account service.
- Desktop tactical-board prototype only after tournament feedback. Preserve personal lesson/source distinction, Undo and explicit insert/export.
- Defer heart-rate hardware, AI scoring, cloud pupil portal, payments and additional component-bank imports. No newly approved payment/key/server scope.

## Corrected instruction to Claude

> Read AGENTS.md, COLLABORATION.md, the current execution map, this handoff and issues #48–#52. Treat the uploaded report as ideas only; several baseline claims are false or unsupported. Use Vanilla JS and current stores/modules. Do not introduce React/Tailwind, another attendance/assessment/station store, or a global injured flag that changes grades. Check the current base and existing reservations; reserve exact shared sections before a product edit. Start with the bounded storage/recovery slice and a short teacher-reviewed participation model. Home appearance waits for the owner's sketches. Tournament is a later four-team prototype with final-score entry, optional live scoreboard, preserved sid/cid/session identity, offline persistence and recoverable saves. Keep source and teacher versions distinct; don't silently change a live lesson. Run npm test, build twice with no second diff, and relevant browser/failure tests on each product slice. Record synthetic/emulated/native/physical evidence separately. One focused PR/handoff per implementation slice. No merge, deployment, external submissions, payments, required accounts, new API keys or forced Drive.

## Sketch review checklist — waiting for owner

For each incoming screen record: which current state it replaces; its primary action; where upcoming/all-day/prepare/backup live; action counts for a teacher mid-lesson; touch/keyboard/large-text/RTL behaviour; existing features that disappear; data/privacy implications. Mark “reuse / modify / reject” and explain the classroom trade-off. Do not judge a static mockup as proof of functional reliability or device readiness.

## Technical reference checks

Checked official developer documentation on 2026-10-09:

- [MDN StorageManager.estimate](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate): usage/quota are estimates; feature-detect and handle rejection/absent values.
- [MDN storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria): quotas/eviction are browser/origin dependent; keep save-failure and backup handling.
- [MDN Web Bluetooth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API): limited browser availability and secure-context restrictions; a separate compatibility investigation precedes any watch feature.

No fresh market, official Israeli grading-policy, norm-licence or clinical-validity review was performed. The report's claims in those categories are not certified here.

## Publication and handoff

Reservation posted in #48 before edits. Only this documentation file is reserved/changed in the review branch. #49–#52 each contain dependencies, bounded scope, acceptance and preservation requirements; they remain planned. No product implementation, main change, PR merge, deployment or upload occurred. Owner supplies sketches; Claude implements only a separately scoped slice and leaves a tested handoff for review.
