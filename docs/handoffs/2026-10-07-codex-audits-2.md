# Codex audits — batch 2
Date: 2026-10-07
Owner: Codex
Delivery branch: codex/audits-2-2026-10-07
Delivery parent: published batch 1 af6e41ed381183dc2547f2de2b38e81f19730ad2 (product equals main 070c47e)
Instruction source: docs/handoffs/2026-10-07-codex-next-tasks-2.md, including its update at 0158ddb
Reservation: Issue #18 comment 6045631851
Status: five read-only tasks completed to the extent possible without Chromium. No product, workflow, native, generated-file or data changes published. No PR, merge, deploy or CI dispatch.

## Changes for Claude to review

| New file | Purpose |
|---|---|
| tools/timing-audit-v2.js | Explicit source worktree, source blob hashes, automatic block thresholds read from code, 45/50/60/90-minute slot allocation, all candidates/options, topic/grade coverage |
| tools/transition-evidence.js | All 443 source steps; lexical setup/rest/transition/instruction classification, explicit numeric-unit durations and recurring-schedule distinction |
| tests/unit/timingaudit-v2.test.js | Source-model guard, budget conservation, candidate/length coverage, deterministic output, complete step coverage, unit conversion and recurring rotation evidence |
| docs/TIMING_OVERRUN_AUDIT_2026-10-07-v2.md | Requested historical and latest timing snapshots kept separate |
| docs/TIMING_TRANSITION_EVIDENCE_2026-10-07.md | All 108 variants/443 steps, conditional evidence, no invented field timings |
| This handoff | Integration findings, PR #46 review and PR #44 fixture diagnosis/test-only patch |

No edits to any existing product file. The new tools import actual source data from the chosen tree; they do not store a copy of the lesson bank. Earlier batch-1 reports remain historical and are not overwritten.

## Task 1 — timing audit

Reviewed both immutable snapshots, because the handoff changed while this batch began:
- Requested historical snapshot: a8b4b23cb2988adb1749ee79f8986f720447409e, thresholds 33/62, absolute transition overhead.
- Latest at audit start: 0158ddb97f44eb8204af68c2ee4adc00625ba7a3, thresholds 31/54, normal transitions already included in t.

108 variants in 42 topic/grade pools. Candidate/slot cases: 75,672 historical; 85,608 latest. Every time option, outdoor weather, optional-game choice and actual block slot is checked. These are hypothetical candidate coverage counts, not selected-plan frequencies or real teaching durations. Game availability, equipment-driven eligibility and random feedback selection are not simulated.

| Length | Historical exact share | Latest exact share | Latest cannot-fit variants in any option/slot | Latest free-play mean / maximum per candidate slot |
|---|---:|---:|---:|---:|
| 45 | 72.10% | 56.96% | 71/108 | 0.74 / 19 min |
| 50 | 77.13% | 62.96% | 71/108 | 0.62 / 19 min |
| 60 | 78.50% | 66.24% | 71/108 | 0.63 / 20 min |
| 90 | 75.02% | 71.24% | 11/108 | 1.38 / 42 min |

The updated quick check is reproduced: allocations 19–27 minutes yield 39,41,42,42,40,38,38,38,38 fitting pools out of 42 (at least one exact variant in each counted pool). At 16 minutes only 18/42 pools fit; at 29 minutes 28/42. This distinguishes pool coverage from individual-variant coverage.

**R-T1, high priority recommendation:** automatic block-count thresholds need a feasibility check by the available topic/grade pool. Example on 0158ddb: 45 min, normal outdoor weather, no optional game → warm-up 8, cool-down 5, main 32. Pools with >=2 candidates get two 16-minute blocks. In the actual candidate/slot-1 audit for this standard configuration, 71/108 candidates exceed the slot minimum, 35 fit exactly, 2 are under; only 20/42 pools have an exact candidate (some one-variant pools retain one 32-minute block). Consider scoring block counts 1/2/3 using actual available candidates and their rounded minimum/maximum, then applying feedback/rotation among feasible choices. Preserve teacher manual choices and live plans. This is a proposal, not an implemented change or a claim that every generated plan fails.

## Task 2 — transition evidence

The owner has already decided normal transitions are included in t. Latest code implements zero default extra transition overhead; no renewed approval gate is introduced.

All 443 steps were processed. The conservative lexical screen found no explicit large-equipment-setup match. That does not establish that preparation takes zero time. One literal rotation token exceeds typical t: basket/high/2 step 1 has t=3 and describes rotation every 5 minutes. This describes the later tournament schedule during its explanation, not a performed 5-minute transition inside the explanation; it is not a confirmed overrun. Compound round protocols and the earlier pyramid ambiguity cannot be resolved by token matching. No confirmed performed-rest overrun or insufficient major-setup budget was established.

**R-T2, owner/Claude review:** quick-transition negative deltas are combined with water and clamped to zero, so a selected water break may be invisible in net overhead. This is an accounting/UX interpretation question, not proof that the lesson omits drinking. Consider keeping water separately visible while showing the net transition adjustment; document the meaning of typical t consistently. Do not change timing data without teacher review.

## Task 3 — uncommitted integration dry runs

Commands in isolated detached scratch worktrees:
```
git -c user.name=Codex -c user.email=codex@openai.com merge --no-commit --no-ff origin/claude/game-tasks-variations-jgi3dt
git status --short
git diff --name-only --diff-filter=U
git merge --abort
```
PR #46 reviewed at 867ffb8 (abbreviated; source worktree is pinned by git rev-parse HEAD). No merge commit or push was made. Both simulations were aborted; all source trees are clean.

| Timing base | Conflicting files | Disposition recommendation |
|---|---|---|
| a8b4b23 (historical) | hm-know.js, index.html, sw.js, Hamegrash.html | Prefer PR #46's three-level modal, task/menu and personal-variation UI. Remove historical inline adapt fields and old .gm-lv CSS/translation rows rather than retaining two implementations. |
| 0158ddb (latest) | index.html, sw.js, Hamegrash.html | No product-source conflict. COLLABORATION.md auto-merges. Generated version/hash/cache/inline-source conflicts remain. |

Historical hm-know.js has one conflict at the modal difficulty block (scratch lines 1165–1186): old two-level <ul class="gm-lv"> versus PR #46's easier/base/harder cards, tasks/menu and gm.mine controls. Inline adapt fields auto-merge with GAME_ADAPT and would be overwritten at runtime, while old CSS/terms can remain silently; a textually clean merge alone is not sufficient. 0158ddb removes that implementation and the associated CSS/translation blocks, so use the latest timing side instead of manually reintroducing obsolete rows.

For generated files, retain the latest timing index structure (duration choices and timing controls) and rebuild from combined approved sources; do not choose stale Hamegrash.html/SW hashes from either branch. No simulated merged tree was tested, because unresolved generated conflicts were not edited under this read-only task. Tests/builds below ran on the original heads after abort, not on a resolved integration candidate.

## Task 4 — PR #46 review (867ffb8)

| Area | Evidence / finding | Recommendation |
|---|---|---|
| Teacher text and IDs | hm-know.js paintMine uses esc(e.t), esc(e.id); HM.esc escapes &, <, >, double/single quotes. Node VM probes of the actual functions confirm an <img onerror> payload stays escaped, including an attribute-breakout-shaped stored ID. | Retain these escaping calls. This is source/VM evidence, not a browser exploit test. |
| Exports | No gm.mine-specific HTML/CSV/print export path exists in this PR. It is included as raw JSON-string data in the general encrypted/plain backup. LESSON.addGame consumes the base game's rules, not teacher gm.mine entries. | Treat personal-variation export/plan inclusion as a later owner decision; do not claim it currently exists. |
| Failed writes / quota | addMine calls LS.set before clearing the input or showing success. VM probe returns false from LS.set: input retained, one attempted write, zero success toasts. LS.set uses safeSet and reports storageTrouble. Delete repaint also waits for a successful write. | Add a browser quota/failure regression when Chromium is available. Node source/VM evidence is not a persistent-device test. |
| Limits | MINE_MAX=300, MINE_PER_GAME=30, input maxlength=300. Helpers normalize whitespace, truncate, reject duplicate/empty entries and cap reads to 30. PR unit limit/corrupt-data tests pass. | Limits count JavaScript UTF-16 code units, not grapheme clusters; emoji may consume two units. No defect is asserted. |
| Backup/restore | bkKeys includes namespaced gm.mine; BK_SKIP only skips bk.last/up.seen. Actual bkSnapshot + HMBackupRestore.replace probe preserves the exact gm.mine JSON. | Keep round-trip coverage. Backup preview currently displays raw gm.mine (missing BK_LABELS label) and object count counts games, not total variations. Add a five-language friendly label if approved. |
| Numbers across languages | tests/unit/gamesadapt.test.js compares ordered digit sequences in chal and adapt strings across en/ar/ru/es; 700/700 unit tests on PR head passed. | The exact numerals test does not cover TASK_MENU or every new game's how/vars line. Extend coverage to those strings; current suite does not prove numerals across all new prose. |
| Arabic/RTL | Logical border-inline-start is used; personal input has min-width:0 and list lines overflow-wrap:anywhere. Difficulty cards have a fixed-minimum label alongside spans. | Physical/narrow Arabic review remains needed; if long strings overflow, test span min-width:0 and wrapping. No layout failure is claimed without a browser. |
| Leading-quote translation | splitTerm treats leading Hebrew ״ as removable prefix. term() first looks up the stripped core; the dictionary row exists only under the original full leading-quote string. Actual Russian VM probe before 867ffb8 returns the Hebrew unchanged despite a dictionary row; after rewording it returns Russian. | The reword fixes this instance. Propose an exact full-string lookup before stripping punctuation, with a regression for quoted source strings and language round-trip; no engine edit was made. |

Chromium is unavailable. No gameadapt/i18n15 browser pass is claimed. Native-speaker review and physical-device layout are not completed by these checks. A COMMENT review, not approval, is requested by the handoff and posted when connector write succeeds; publication details recorded below.

## Task 5 — PR #44 check #222 diagnosis

Source: tests/e2e/rename9.e2e.js lines 215–230, PR #44 head f51da88d9454bb2d943c71eb32a628250290ee19. This is a deterministic fixture mismatch with the new active-lesson filter, not evidence of a race and not evidence that the product lost the pupil.

Exact fixture loading through the suite's real seed function and HMDATA.migrate reproduces:
- Seed overrides stu.list with only pupil d (cid:null), but inherits ft.roster with a/b in X and ls.sessions with an active lesson in X.
- Migration runs the single-roster migration even at schema 5 when legacy ft.roster exists; it adds a/b. Stored IDs become [d,a,b].
- Actual hm-new.js applyLessonFilter sets clsF=X because a/b belong to the active class. The inF filter produces visible IDs [a,b], so querying row d returns null before click.
- With only ls.sessions changed to [], the same migration and filter code produces [d,a,b], making d eligible to appear. Waiting longer cannot undo the intentional class filter.

This reproduction uses real source functions in Node/VM; there was no Chromium DOM run. The save handler's cid/cidAmbig direction logic is unchanged and the browser rerun is still required.

Minimal **proposed test-only patch**, not applied to #44 or delivered as an existing-file edit:
```diff
--- a/tests/e2e/rename9.e2e.js
+++ b/tests/e2e/rename9.e2e.js
@@
   check("כרטיס תלמיד: הסימון «אין כיתה» מסכים עם cid בשני הכיוונים",seed({
+    "ls.sessions":[], // This profile identity check has no active-lesson scope.
     "stu.list":[{id:"d",name:"אורח",cls:"",cid:null,cidAmbig:"no-class",sex:"boys",age:13,tests:[]}]
   }),async page=>{
     await go(page,"stu");
-    await page.evaluate(()=>document.querySelector('#stu-list .stu-row[data-id="d"]').click()); await page.waitForTimeout(400);
+    await page.locator('#stu-list .stu-row[data-id="d"]').click(); await page.waitForTimeout(400);
@@
-    let s=await page.evaluate(()=>window.HM.LS.get("stu.list",[])[0]);
+    let s=await page.evaluate(()=>window.HM.LS.get("stu.list",[]).find(s=>s.id==="d"));
@@
-    s=await page.evaluate(()=>window.HM.LS.get("stu.list",[])[0]);
+    s=await page.evaluate(()=>window.HM.LS.get("stu.list",[]).find(s=>s.id==="d"));
```
Keep a separate active-lesson filtering regression (the product behavior belongs to that scope). Do not replace the identity assertion with a fixture snapshot or force the pupil into storage on reload.

Store-listing lines to reconcile on this exact #44 head:
- docs/store-listing/STORE_LISTING_2026-10-05.md line 211: replace the whole "Future only, not applied" paragraph. Proposed wording: "PR #44 applies the new icons to PWA assets, Android launcher/adaptive layers and the iOS app-icon asset. The branch is not yet a production release; real-device visual review remains pending." Both native/assets/icon-foreground.png and icon-background.png are already included in #44, so "that split was not done here" is stale.
- Line 217: "Package ID and audience decision" conflates an implemented branch ID with remaining owner approval. Proposed: "Confirm the io.github.osher15.peultimate package ID and intended audience before store submission." Do not state owner approval or release signing has occurred.
- Related historical handoff docs/handoffs/2026-10-05-store-listing.md lines 16/18 also say icon application is future; mark superseded by the icons/package-ID handoff instead of silently rewriting historical evidence.

## Validation commands and exact results

```
node tools/timing-audit-v2.js --root ../timing-a8 --compare ../timing-latest
node tools/transition-evidence.js --root ../timing-a8 --compare ../timing-latest
# Each report was generated twice; cmp returned exit 0 for both.
PE_TIMING_AUDIT_ROOT=/workspace/scratch/5455da73870b/timing-a8 node --test tests/unit/timingaudit-v2.test.js
PE_TIMING_AUDIT_ROOT=/workspace/scratch/5455da73870b/timing-latest node --test tests/unit/timingaudit-v2.test.js
# 3/3 pass on each actual timing source.
```

Each touched source tree ran npm test and node build-standalone.js twice, sequentially within its own tree:

| Tree / checked head | Unit results | Build twice / generated diff |
|---|---:|---|
| timing-a8 / a8b4b23 | 692/692 | identical; unchanged from HEAD |
| timing-latest / 0158ddb | 692/692 | identical; unchanged from HEAD |
| games-review / 867ffb8 | 700/700 | identical; unchanged from HEAD |
| store-review / f51da88 | 661/661 | identical; unchanged from HEAD |
| integration-a8 after merge abort / a8b4b23 | 692/692 | identical; unchanged from HEAD |
| integration-review after merge abort / 0158ddb | 692/692 | identical; unchanged from HEAD |
| delivery / af6e41e plus new tests | 694/694 | identical; no generated changes |

All counts: 0 failed, 0 skipped. git diff --check passes for delivery. File hashes before the first build and after both builds matched for index.html/Hamegrash.html/sw.js in all seven trees. Source conflict dry runs were not resolved or committed.

Browser attempt: NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node -e "require('playwright').chromium.launch({args:['--no-sandbox']}).then(b=>b.close())" cannot launch because /root/.cache/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell is missing. No installation, browser pass, CI dispatch, native build or physical-device pass claimed. Owner/Claude should run rename9, gameadapt, i18n15, library21 and stage2 against the approved integrated candidate in a Chromium environment before merge.

## Publication and next owner

Publish one batch through connected GitHub APIs to codex/audits-2-2026-10-07 (direct git push lacks a username credential). No merge/deploy. PR #46 receives a COMMENT review anchored to 867ffb8 only; this does not approve the PR. Owner/Claude: review R-T1/R-T2, apply any approved test/doc fixes on the respective owned branches, rebuild the integrated source and rerun browser/physical checks.
