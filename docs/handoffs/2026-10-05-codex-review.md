# Codex review of Claude's merged timing, transfer and library work

Date: 2026-10-05
Owner: Codex (review); Claude (product fixes and import integration)
Reviewed base: `b057616e6b57bc90d9da22c49f770ed2cd3398ad`, main after merged #38.
Review branch: `codex/claude-review-2026-10-05`.
Status: review completed; two reproduced defects remain for Claude. This branch contains only this document and isolated regression probes. No product edits, timing-table edits, import, merge or deployment.

## Instructions read and reconciled

Read AGENTS.md, COLLABORATION.md, docs/ACTION_PLAN_2026-10-03.md, the full 2026-10-05 timing/transfer/library handoff, TIMING_DRAFT_REVIEW.md, ADAPTATIONS_DRAFT_REVIEW.md, DEVICE_TRANSFER_DESIGN.md, and current comments on #13/#18/#19/#21/#22/#24.

The latest comments supersede older document statuses:

- #25–#38 are merged; main is b057616, not the old 3ce07ed baseline.
- The owner lifted the #24 import hold in the Claude session, recorded in #24 comment 5996159587 and #18 comment 5996160491. Claude implements the 60-plan integration; Codex reviews. This is not authorization for Codex to duplicate that integration or import the component bank separately.
- Claude reserves hm-build.js; the new EQUIP_CHOICES/mainWindow/recommendWarm/eqAvailList helpers in hm-data.js; shared equipment changes in hm-lesson.js; .pill.warn/.bw-* styles; relevant index.html sections; bw.* strings; builder tests. None edited here.
- Draft timing values and adaptations still require teacher review. No numbers changed here, including the owner-accepted 36-minute pyramid typical time.
- Netlify credit conservation: no WIP PR and no repeated branch pushes. One batched review commit, no PR creation or main update.

Reservation evidence: #18 comments 5996414359 and 5996503287.

## Findings for Claude

### R1 — P1: fractional allocation can block the synchronous fitter indefinitely

Location: hm-data.js `fitSteps`/`spreadMinutes` (around lines 640–665); hm-lesson.js `readOpts` (around 359).

Reproduction on reviewed main:

```js
HMDATA.variantFit({d: ['work'], t: [10]}, 10.5)
```

The call never returns. `spreadMinutes` sets a fractional diff and adds/subtracts one minute per iteration. With a residual half-minute, the loop alternates between two states instead of reaching zero. A separate Node process was killed after a 2-second timeout; an independent earlier 1.2-second probe reproduced the same behavior.

The generator's lesson-duration input is a number input with step=5, but `readOpts` passes its raw numeric value through without rounding or rejecting an invalid step. HTML stepping does not itself validate the custom Generate button. Thus a typed value such as 30.5 can enter the model. The pure synchronous hang is confirmed; a physical-device/UI hang was not deliberately induced. Phase editing already rounds minutes; do not assume all callers do.

Recommended bounded fix in Claude's reserved code: define an integer-minute contract (or implement fractional arithmetic explicitly), reject nonfinite values and normalize/validate allocations and ranges before iteration. Ensure every loop has a provable terminating residual. Do not merely add a UI step attribute. Validate generator inputs and imported/saved plan metadata as appropriate.

Regression: `node --test tests/review/timing-library-review.test.js` deliberately fails the fractional-allocation case on this base. It runs the fitter in a timed child process so the test runner cannot hang. Move/adapt the assertion into the production unit suite when the fix is implemented.

### R2 — P2: compact game cards truncate safety instructions

Location: hm-styles.css `.gm-card .sf` (around line 789), generated from hm-know.js `GAMES.render`.

The card safety note has `-webkit-line-clamp:3` and `overflow:hidden`. At the existing harness viewport (430×900), the English compact card for g-tug has clientHeight **52px** and scrollHeight **174px**. The note is clipped. The omitted portion includes material/rope-selection instructions near the end. The full safety note remains accessible after opening the detail dialog, so this is card truncation, not removal from the stored content.

Recommended fix: allow the safety note to wrap fully in compact cards, or show an explicit, accessible disclosure that makes the truncation clear and exposes the complete note. Do not claim the complete safety guidance is always visible while clamping it. Keep the safety section outside optional detail folds. Verify narrow phones, both directions and all five languages. `.gm-*` changes remain Claude-owned; Codex did not patch the style.

Regression: `tests/review/claude-review.e2e.js` measures visible versus needed height on the real generated app. One case fails on main; the other two pass. Do not substitute checking for the warning icon or presence in DOM for checking visibility.

## Timing evidence review — arithmetic versus executable instructions

All 108 current variants were enumerated from the actual TOPICS data. Across allocations 1/8/14/18/20/25/32/40/60/90, three class paces and three transition settings, **9,720** integer cases conserved their status-specific ledger and stayed within step bounds:

- exact: fitted steps + overhead = allocated minutes;
- short: fitted steps + overhead + free-play gap = allocated minutes;
- over: minimum fitted steps + overhead − shortage = allocated minutes. This is a soft overrun warning, not proof the work fits.

This proves integer arithmetic on this dataset, not that the exercise text can be executed in the fitted time. The multiplicative ranges and the t values are heuristic drafts, with no field timing evidence in the reviewed handoff. They should not be presented as validated PE timings.

Concrete content/model discrepancies for teacher and Claude review (no data edited):

| Item | Current instruction and result | Required decision |
| --- | --- | --- |
| Aerobic Tabata, middle school | Eight 20/10 rounds; two groups of four are 2 minutes each. For a 25-minute main block the fitter assigns **7 and 6 minutes** to those groups, while the text still says four rounds each. | Keep the fixed round counts/time, or explicitly specify additional sets and rests. A stretched label alone does not create additional work. |
| Running Tabata, high school | Same fixed four-round groups and the same fitted 7/6-minute mismatch at allocation 25. | Same explicit protocol decision; teacher reviews exertion/rest separately. |
| Distance pyramid 1-2-3-4-3-2-1 | Stage 2 describes ascent including 4 minutes; stage 3 describes a separate 4-minute peak; stage 1 says equal walking rest after each interval. The typical t remains owner-accepted 36. At allocation 25, fitted steps are 1/8/6/8/1 plus 1 overhead. | Clarify where the peak and equal rests occur. Do not silently change the accepted t=36; correct the executable description through teacher review. |
| Fixed-minute descriptions | **28 variants** contain at least one explicit `number + דק` instruction, while the fitted side labels can change. This mechanical count excludes second-only protocols and some other spellings. | Review these descriptions first; parameterize repeat/set counts or retain explicit fixed-time constraints. |
| Short-lesson documentation | TIMING_DRAFT_REVIEW says the closing game is removed and the main stays at least 18 minutes. Current gen and the newer handoff preserve the game, shorten warm-up, and can have a **14-minute main** for a 30-minute lesson with a 6-minute game and 5+5 warm/cool. | Align the draft review document with current teacher decisions/code. Do not tell the teacher that all short main blocks are >=18. |

Already known text/timing issues are not new claims of failed arithmetic. Teacher approval is still required for protocol changes and practical workload. The new manual-builder/import work should share this model rather than add a second inconsistent ledger.

## Transfer/library/iOS review

- The SHA-256 verification code hashes exact UTF-8 file content, including the encrypted envelope when exported encrypted. Independent tests compared it against Node's SHA-256 result for Unicode, whitespace changes and an encrypted-envelope-shaped value. If Web Crypto is unavailable it returns an empty code gracefully. It is a short file identifier, not a pairing code, password, signature or authentication mechanism.
- Existing transfer22 browser tests passed: exported/imported fingerprint equality, changed-file distinction, language/stable-ID preservation. This is automated local evidence, not physical file-sharing evidence.
- New review test passed: favorite, compact preference and manual filter survive actual backup/apply/reload. Empty filter state translated into EN/AR/RU/ES in the generated app; an initial untranslated-state suspicion was disproved and is not a finding.
- All 42 game records currently have usable grade and pupil ranges. Open-ended times stay unknown; max-duration filtering uses the minimum advertised time and admits open-ended games. This is the implemented policy, not a strict promise that the maximum advertised duration fits. Per-court pupil ranges are not automatically a whole-class grouping plan.
- The iOS CSS guard is already merged: input/select/textarea at 16px under the WebKit-touch supports rule, plus text-size adjustment. No duplicate zoom fix added. Current topbar/shell regressions passed. Chromium layout tests cannot prove iOS focus-zoom recovery. Confirm on the owner tablet/iPhone after rebuilding the native app; preserve accessible pinch zoom.

## Separate provenance audit — 11 built-in archive documents

Scope: hm-plans.js and its repository history, separate from the 60-plan international import. No archive content changed or removed. This is an evidence inventory, not a legal determination of infringement or permission.

All 11 records lack structured source-file identifiers, revision/hash metadata and a recorded distribution/translation permission or license identifier. This inventory does not establish infringement or permission. The detailed attribution content is omitted from this publication; inspect each source record privately before making a rights decision.

Repository history: edb9182 made three archive records built-in; 6c40d93 expanded three to eleven and consolidated duplicates. Despite the latter commit title saying “11 more”, the final total is eleven. This records acquisition history, not document-specific permission evidence.

| Stable record ID | Metadata review result |
| --- | --- |
| doc-volley-serve | Source-file/revision and permission evidence unresolved |
| doc-circuit-time | Source-file/revision and permission evidence unresolved |
| doc-special-3yr | Source-file/revision and permission evidence unresolved |
| doc-dribbling | Source-file/revision and permission evidence unresolved |
| doc-circuit3 | Source-file/revision and permission evidence unresolved |
| doc-fartlek | Source-file/revision and permission evidence unresolved |
| doc-recess-basket | Source-file/revision and permission evidence unresolved |
| doc-abs-toning | Source-file/revision and permission evidence unresolved |
| doc-sprint-prep | Source-file/revision and permission evidence unresolved |
| doc-long-distance | Source-file/revision and permission evidence unresolved |
| doc-scavenger | Source-file/revision and permission evidence unresolved |

Suggested metadata checklist for later integration: stable content ID; original file/page identifier; revision/date; acquisition route; original versus adapted versus quoted sections; permission/license evidence with scope (distribution, translation and modifications); attribution; per-language content/review version; teacher review; explicit unresolved status. No document is marked cleared by this audit, and an international source's license should not be applied to these separate records without evidence.

## Validation actually run

| Command / check | Result |
| --- | --- |
| `npm test` | **648/648 passed** on unchanged main product sources |
| `node build-standalone.js` twice, with `git diff --stat` after each | No source/generated output differences; existing generated outputs reproducible |
| Existing suites: stage2, library21, transfer22, topbar, shell22 through the unchanged harness | **29/29 passed**, Chromium 141 / Playwright 1.56.1 |
| `node --test tests/review/timing-library-review.test.js` | **4 passed / 1 failed**; intentional red regression for R1. Contains the 9,720-case integer sweep. |
| Isolated new browser review suite | **2 passed / 1 failed**; intentional red visibility regression for R2 |
| `git diff --check` | Passed |

Review probes are not registered in the production runner/glob and are not a claim of green acceptance. Their failures are the delivered evidence for fixes. No full 609-case browser rerun or native rebuild was performed by Codex here: product code is unchanged, relevant existing suites passed, and the new defects are independently reproduced. Claude's earlier full-suite numbers remain Claude's evidence.

Environment note: the runtime's newer Chromium download was truncated. Installing the repository's CI-pinned Playwright 1.56.1 obtained its headless shell, which ran the existing harness successfully. No harness workaround or product dependency was committed; package.json unchanged. Some installer output included failed ffmpeg downloads; tests do not require ffmpeg. Temporary npm/browser files are not part of the review commit.

## Next actions / ownership

1. Claude fixes R1 while integrating the reserved timing/manual-builder work, and R2 in the library styles. Adopt the new regressions into the normal suites after the fixes, then run relevant suites plus required full checks on the actual integrated head.
2. Teacher/Claude resolve fixed-protocol text against fitted labels and update the stale short-lesson draft description. Do not modify draft numbers without the teacher decision.
3. Claude continues the owner-authorized #24 integration using current main, rights/provenance/per-language version metadata, offline precache and a small prepare/edit/assign/live/feedback pilot. Codex reviews the actual resulting diff; no import candidate was available in this reviewed main.
4. The 11 archive records retain unresolved provenance status until source/permission evidence is supplied. This does not stop the unrelated current code review or establish a general restriction on original content.
5. Owner verifies the zoom guard on physical Apple devices and native sharing/update persistence separately. Owner remains merge/deploy coordinator.
