# Safe review handoff — 2026-10-09

User requested all useful work possible without harming code while Claude credits are unavailable. Completed read-only review, isolated synthetic-data tests and three documentation files. No product edits, merges, deployment, live student data access or original-upload edits. Reservation: coordination issue #18, comment 6083325083. Publication scope: one docs batch on `codex/safe-review-2026-10-09`, no PR.

## Tested references and results

| Reference | Evidence from this review |
|---|---|
| main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3` | 700/700 unit tests; two standalone builds; generated files unchanged |
| `ccr-e68b66c8-44gzz9` at `dba3cbe6f97205a87922ad84212838113476b484` | 715/715 units; two builds with no generated diff; 66/66 selected browser checks |
| Same candidate, four extra synthetic probes | 3 passed; 1 confirmed language repaint failure described below |
| PR #47 at `1d72cb92b0f482f1ac301635e6c84c64840d5516` | GitHub exact-head Tests run 37892730945 and Native Builds run 37892730926 completed successfully |
| PR #44 at `f51da88d9454bb2d943c71eb32a628250290ee19` | Draft; merge conflict evidence below. Workflow query returned no runs; that is not proof of CI failure or absence |

Candidate browser selection: collections, personalcopy, gameadapt, library21, lessonbank, i18n15, backuprestore, builder19 and stage2. This is a targeted run, not a new full browser suite. Chromium used the alternative scratch runtime with a temporary launch preload; pinned-runtime parity and physical devices were not established.

Extra probes verified actual backup snapshot → clear test values → apply → reload, preserving `col.list` game/personal/bank references, `ls.lib` current and previous plans, and `gm.mine` variations. This exercises restore beyond the earlier prefix-only backup assertion. Two injected `HM.LS.set` failures for collection creation/rename retained the draft and did not change persisted values. These are isolated tests, not claims about real-device quota or file-picker behavior.

## Confirmed candidate defect: collection language repaint

At dba3cbe: select English; open the lesson library; create an expanded collection containing a game reference. Its type pill reads `Game`. Call the normal language switch `I18N.set('es')` without reopening the collection. `HM.t('col.kindG')` becomes `Juego`, but `#ls-colList .col-items .pill` remains `Game`. The extra probe fails this assertion; the standard selected suite still passes.

`hm-i18n.js` dispatches `i18n:change`; `hm-collections.js` has no listener for it. Claude should add repaint handling in that module, preserving expanded state and unsaved rename/create drafts. Do not blindly rebuild all HTML while an input contains a draft. Check picker and manager, repeat English→Spanish and Hebrew RTL, and add a meaningful browser regression for an already-open collection. Rebuild generated files after the source fix. No fix was made in this review.

## Merge dry runs — no merge performed

`git merge-tree --write-tree` checks used the exact references above; these do not prove the runtime behavior of a combined result.

| Pair | Conflicts | Next action |
|---|---|---|
| Candidate dba3cbe + PR47 1d72cb9 | `Hamegrash.html`, `index.html`, `sw.js` | Source paths merge at these refs; regenerate standalone outputs from combined sources, then test |
| main 348c1ab + PR44 f51da88 | `Hamegrash.html`, `hm-i18n.js`, `hm-styles.css`, `index.html`, `sw.js` | Owner must reconcile source conflicts before regeneration; do not take one whole generated side |

PR44 includes older UX/i18n/style changes beyond packaging/icons. It is not ready for a blind packaging merge. Old open PRs already represented on main were not closed or merged by this review. Recheck branch heads and owner reservations before changing any code.

## Uploaded proposals

See `docs/MOCKUP_INTEGRATION_REVIEW_2026-10-09.md` for measured home/tournament behavior, confirmed duplicate tournament finalization, lost state on refresh, 320 px overflow and a bounded integration plan. Keep the earlier action-plan priorities and existing issues #49–#52; no duplicate issue was created.

See `docs/DEVICE_ACCEPTANCE_SHEET_2026-10-09.md` for a fill-in device record. Actual Android/iPhone/iPad results remain pending. Native CI success is build evidence, not device acceptance.

Today's prior lesson-bank review is already documented on `ccr-e149e84d-s1sw05` in `docs/handoffs/2026-10-09-codex-lessonbank-review-result.md`: do not repeat that full audit or edit protected ar/ru/es content. Likewise, the earlier Claude report action plan lives on `codex/report-action-plan-2026-10-09`.

## Next work for Claude

1. Read coordination and reserve source files before editing. Start with the collection language defect; preserve drafts and references, keep five languages and English defaults.
2. Reconcile candidate/lesson-bank generated outputs from sources and run the necessary combined checks. Keep `sid`/`cid`, grades, originals, backup and offline behavior intact.
3. Use the device sheet on a specifically identified build before release claims. Treat source conflicts in PR44 as owner work, not an invitation to overwrite.
4. Follow existing reliability/storage issues before home polish and the optional tournament pilot. Prototype “saved”, “live” and “sun readable” text must not become unsupported product claims.

Only these three documents are part of this branch. Scratch test harnesses, logs, mockups and browser screenshots are not product changes or required repository dependencies.
