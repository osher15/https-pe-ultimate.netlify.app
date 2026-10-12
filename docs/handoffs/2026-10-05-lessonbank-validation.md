# Lesson-bank validation and current task map

Date: 2026-10-05. Codex review of Claude candidate `16e5623e59178517cc12989baf66ee0a10e19337`.
Observed main: `e61a414`. Reservation: issue #18, comment 5996995029.
Branch: `codex/lessonbank-validation-2026-10-05`.

## Delivered scope

Added only `tests/unit/lessonbank.test.js` and this handoff. No product, content, native, translation, build or runner changes. Implements step 2 of `docs/LESSON_BANK_INTEGRATION_PLAN.md` using Node's built-in VM and test runner, with no dependencies. The existing unit-test glob discovers the new file automatically.

The validator loads the bank header and every sport file. For each populated sport it requires all five languages, exactly ten records numbered 1–10, all required text/list fields and six sections. It checks positive numeric duration strings, Hebrew-letter contamination in other languages, and explicit section budgets against lesson duration with zero tolerance. Budgets are read from leading headings/labels only; ambiguous/range/unrecognized budgets are reported, not inferred from drill instructions. Additional checks cover missing fields, invalid review statuses, multilingual headings, decimal minutes and ranges.

## Owner clarification: original authorship

The owner clarified that these are original project-authored plans developed from research, ideas and insights, not imported copies of external lesson plans. Codex's earlier requirement for an external source or individual Notion page/revision for each plan was incorrect and has been removed. It is not an acceptance blocker. This supersedes the earlier issue comments' per-record source requirement and the source gate proposed in the integration plan.

Research references may be documented separately when actually known; no references or authorship evidence are fabricated here. Notion is a working-content location, not evidence that a plan was copied from an outside source. This correction does not certify pedagogical quality or native-language review.

The optional editorial metadata check now requires only a nonempty contentVersion and a reviewStatus of draft, imported, teacher-reviewed or native-reviewed. An original plan may honestly remain draft until human review. If no record has either field, the metadata test is explicitly skipped; once any record has one, coverage is enforced automatically. LESSONBANK_REQUIRE_REVIEW_METADATA=1 is an opt-in editorial readiness check, not a mandatory external-source check.

The results below are from the initial validator revision. The source requirement was subsequently corrected; the execution server disconnected during correction, so the changed tests could not be rerun in this turn. Product code remains unchanged.

## Verified results

| Check | Result on candidate plus tests |
|---|---|
| `npm test` | 666 total: 665 passed, 0 failed, 1 explicit provenance skip |
| `node --test tests/unit/lessonbank.test.js` | 16 total: 15 passed, 1 provenance skip |
| Historical strict source command (removed) | Historical exit 1; no longer an external-source acceptance blocker |
| Existing lesson-bank browser suite | 5/5 passed |
| Existing manual-builder #19 browser suite | 7/7 passed |
| `node build-standalone.js` twice | Successful; no diff in Hamegrash.html, index.html or sw.js |

Browser command:

```sh
NODE_PATH=/workspace/scratch/984567fc70c2/pe-ultimate/node_modules node -e 'require("./tests/e2e/harness.js").run([require("./tests/e2e/lessonbank.e2e.js"),require("./tests/e2e/builder19.e2e.js")]).then(n=>process.exitCode=n)'
```

The NODE_PATH points to the existing local Playwright installation; it is not a new project dependency. This is headless Chromium evidence, not physical iPad/Xcode evidence.

Data coverage: basketball and football, 20 lesson families, 100 language records. All 100 explicit section totals matched their declared lesson durations. All 80 non-Hebrew records passed the Hebrew-letter check. The other four declared sports have no data in this candidate and remain pending; the validator will cover them when imported. No professional, pedagogical, source-license or native-language approval is implied by these structural tests.

## Remaining Claude-owned work / review findings

1. Editorial tracking enhancement: add content version and honest review status per record when useful. No individual external source link or Notion page/revision is required for these original plans. The global draft banner already communicates that human review remains pending.
2. Load the remaining four sports through the deterministic import process described in the integration plan. No records were reconstructed or translated in this review.
3. Implement the later planner acceptance flow if approved: the current bank UI only opens and prints records. It has no bank-to-editable-copy, assignment or live-lesson action. Existing archive/manual flows must stay intact.
4. Review loading cost before full expansion. Current sport sources total 1,024,103 bytes; the generated standalone file is 5,369,861 bytes. Both sport scripts are included in build and service-worker resources; lazy sport loading is not implemented. Service-worker resource presence was inspected, but a fresh-cache disconnected bank acceptance test was not run.
5. Existing timing defect R1 remains: on this candidate, an isolated `HMDATA.variantFit({d:['work'],t:[10]},10.5)` child process timed out after 2 seconds, with no exception/output. Fix fractional-target handling in the Claude-owned timing helper; see the earlier review branch for the regression test.
6. Existing safety finding R2 remains in source: `.gm-card .sf` still has a three-line clamp and hidden overflow. The prior browser reproduction is in the earlier review handoff; it was not rerun in this turn.
7. Physical-device screen clipping still needs owner verification across affected screens/orientations after the latest native/layout changes. The supplied home-screen photos were reported corrected, but they do not establish whole-app acceptance. No native file was changed here.

## PR / issue reconciliation

The heads of still-open PRs #26, #27, #28, #29, #30, #31, #32, #33 and #35 were verified as ancestors of observed `origin/main`. Their code is **incorporated**, although those PR records remain open. Do not merge their code again. The owner can close/retarget stale records after checking the integrated behavior; Codex did not merge, close or deploy anything.

The historical October 3 plan still describes these deliveries as pending. That wording is superseded by the ancestry evidence above and should be reconciled in the next coordination update. The lesson-bank candidate `16e5623` remains separately reviewed, not assumed merged. Human field review and physical native acceptance remain pending even where code is integrated.

The fractional timing and safety review remains available at `codex/claude-review-2026-10-05`, in `docs/handoffs/2026-10-05-codex-review.md`. Both review branches preserve product code ownership; use only their scoped test/document commits when integrating. No merge or production deployment was performed.
