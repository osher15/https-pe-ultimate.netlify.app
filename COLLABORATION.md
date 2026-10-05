# Claude and Codex execution ownership
Current source of priorities: docs/ACTION_PLAN_2026-10-03.md.
Owner coordinates merges and deployments. Both assistants may implement scoped tasks.

## Current reservations
| Task | Owner | Files/sections |
|---|---|---|
| Plan, real workflow, board replacement bodies | Codex | AGENTS.md, COLLABORATION.md, docs/ACTION_PLAN_2026-10-03.md, docs/GITHUB_TASKS_2026-10-03.md, docs/handoffs/ |
| Fixture persistence and regressions | Codex | tests/e2e/harness.js, persistenceharness.e2e.js, week.e2e.js/groups.e2e.js school-day fixtures, run.js (registration only) |
| Pupil missing-summary | Codex | hm-new.js student profile, studentmissing.e2e.js, hm-i18n.js stu.missing*, stu.fitTitle, stu.fitBest and stu.beepTitle keys only |
| Assessment requirements editor | Codex | hm-assessment-data.js/hm-assessment.js; hm-tests.js coverage button; hm-new.js period-delete guard; hm-app.js restore entry validation only; as.* translations; build/script registration and assessment tests |
| Assessment period reports + Excel | Codex | hm-assessment-report.js/hm-xlsx.js; pupil/class entry buttons only; ar.* translations; report/export tests and build/script registration |
| Assessment period exemptions | Codex | hm-assessment.js exemption draft/UI/save validation; hm-assessment-report.js edit entry only; as.ex* / ar.editRequirements translations; exemption tests and generated outputs |
| Final grade override | Codex | hm-data.js gradeResult; hm-new.js grading final cell/modal/Excel/CSV only; gr.ov* keys; focused tests and generated outputs |
| Personal progress print | Codex | hm-assessment-student-report.js; report entry only; sp.* translations; focused tests/registration/outputs |
| Excel template and paste preview | Codex | hm-assessment-paste.js; grid paste/template controls only; ap.* keys; focused tests/registration/outputs |
| Dated assessment grid | Codex | hm-assessment-grid.js; report entry only; ag.* translations; registration, focused tests and outputs |
| Field-to-PC acceptance | Codex | tests/e2e/fieldjourney.e2e.js and runner; current delivery map and field pilot docs. No product/native/builder changes. |
| Backup rollback review | Codex reviewing Claude proposal | hm-backup-restore.js; hm-app.js restore/preview only; br.* translations; focused tests and outputs. Supersedes pending bkApply rollback hunk only; builder/native/privacy hunks remain Claude-owned. |
| Pending October 1 improvements | Claude authored, Codex review | ccr-4ae97033-rci9j0; do not duplicate or overwrite |
| Timing/equipment completion | Claude next | hm-lesson.js, hm-build.js, hm-know.js; reserve shared helper/translation sections first |
| Flexible timing, weather warm-up, short lessons (#19) | Claude | hm-data.js timing helpers; hm-lesson.js generator/plan editing; hm-live.js free-play line; TOPICS t/r data; index.html timing panel; ls.* keys. Handoff: docs/handoffs/2026-10-05-timing-transfer-library.md |
| Manual builder timing/equipment agreement (#19) | Claude | hm-build.js; hm-data.js EQUIP_CHOICES/mainWindow/recommendWarm; hm-lesson.js ls.eqAvail sharing; bw.* keys; builder19 tests |
| Backup verification code + transfer design (#22) | Claude | hm-app.js bkSave/bkFingerprint/bkPreview; bk.* keys; docs/DEVICE_TRANSFER_DESIGN.md |
| Games library favorites, compact view, manual filters (#21) | Claude | hm-know.js games view; hm-data.js parseGameMeta/gameMatches; index.html games filter panel; hm-styles.css .gm-*; gm.* keys; library21 tests |
| Native packaging | Claude | native/, native workflow/docs; check current reservations first |

No blanket ownership of hm-data.js or all translation files: reserve bounded sections, rebase against accepted changes and rebuild outputs.
When a file overlaps, serialize edits or agree distinct sections in the task record. A branch is not an automatic lock.

## Task lifecycle
Backlog → reserved/in progress → tested/review → owner merge → done.
Each task states owner, priority, status, dependencies, files and acceptance criteria.
A GitHub permissions error is a blocker to publication, not permission to fabricate an Issue/PR.
Existing board bodies #13–#18 are historical incorrect templates; replacements are prepared in docs/GITHUB_TASKS_2026-10-03.md.

## Review
Use the actual JS/Node/Playwright/Capacitor stack. Check offline behavior, identities/data preservation, five languages and field usability. Inspect existing behavior before building.
Claude reviews Codex changes when available; Codex reviews Claude changes. Unavailable reviewer is stated.
Record known limitations and the next step. Physical phone/Mac checks belong to the owner/teacher.
