# PE activity bank — five-language audit, 11 October 2026

## Result

The model-led full-body editorial review now covers all 120 existing items in each of five languages: 80 drills, 24 games and 16 activities, or 600 language versions. Five GPT-6-Luna language agents reviewed saved complete bodies in batches; root adjudicated shared mechanics, rejected unsupported findings and verified every source edit. This completes this automated review pass, not teacher approval or a guarantee of near-zero errors.

| Language | Reviewed bodies | New replacements | Full-body readbacks |
|---|---:|---:|---:|
| Hebrew | 120 | 3 | 3 |
| English | 120 | 3 | 3 |
| Arabic | 120 | 2 | 2 |
| Russian | 120 | 2 | 2 |
| Spanish | 120 | 5 | 5 |
| Total | 600 | 15 | 15 |

All 15 changed pages were refreshed before writing and matched the saved baseline. Exact post-write bodies matched all 15 expected results. Stable page IDs, titles, unrelated instructions and draft/provenance footers were preserved. Alongside the previous checkpoint's 40 replacements on 33 different pages, the two audit passes have applied 55 replacements to 48 distinct pages.

## Changes

- DR-022, all five languages: explicitly cycle performer, observer and waiting pupil after four attempts. Keep two attempts per side, walking return and waiting behind the start.
- DR-072, all five languages: replace automatic throwing-area expansion with teacher-controlled checking and adjustment. Do not resume throwing without a clear, safe area.
- HE AC-001: restore a missing preposition in the pairs-of-groups presentation instruction.
- EN AC-002: make clear that the comparison is the number of successful passes, without weakening the feedback, adjustment and retest requirements.
- ES GM-001 and GM-002: clarify the ball as the scoring-condition subject and the restart location.
- ES GM-023: clarify silent leader selection, the observer returning to watch and the leader changing movement.

The language reports contain exact before/after text, source links, evidence sections and limitations. The CSV contains 600 individual observations. JSON ledgers preserve review snapshots, exact proposals, decisions, current bodies and readback evidence.

## Root quality control

Rejected apparent defects included Russian AC-013 (Cyrillic А–Е already contains six letters), Russian AC-004 (route tester and performer are the same role), and Arabic DR-047 (ليديه means toward the receiver's hands, not with both hands). Optional DR-049 badminton terminology and DR-052 table-tennis block terminology remain teacher-review questions; competitive definitions alone do not prove a gentle-feed teaching adaptation is mislabeled. HE GM-016's existing each-attacker instruction is sufficiently explained by its full context; no new rule was added.

A proposal contained a mistyped Russian page URL. The pre-write guard blocked it before any write; canonical corpus metadata supplied the correct ID. Coverage-note errors in HE DR-001 and ES DR-001 were also corrected. These checks are part of the audit evidence, not grounds to claim infallibility.

All 49 literal-number flags were adjudicated: 13 by root and 36 Arabic comparisons by the Arabic agent with exact phrase mappings. They reflect word forms, Arabic dual forms or repeated numeric explanations, rather than changed quantities. This result concerns those specific flags; identical digits do not prove semantic equivalence of every sentence.

## Evidence and remaining limits

Ministry curricula and primary federation/coaching material support mapped terminology, learning context and specific principles. A generic curriculum or rulebook does not validate each bespoke exercise. Source access varies; blocked pages, search-only snippets, old editions and English sources used for technique context are labeled. Multiple independent proofs for every sentence were not obtained.

Root additionally checked Queensland Department of Education's javelin guideline (reviewed 24 September 2025), supervision and facilities sections: https://education.qld.gov.au/curriculum/stages-of-schooling/CARA/activity-guidelines/javelin . It supports adult control and clear areas, not the draft's 8×20 m specification. The Spanish report includes Chilean ministry and World Athletics evidence with age/edition limits. Arabic source coverage was supplemented with the Palestinian ministry's Grade 5 teacher guide linked from https://elearn.edu.ps/c5_guides/ ; its 2017 edition is not treated as current universal regulation.

No external instructional passages or media were inserted into the bank. Public access does not itself confer copying permission. The cards remain independently worded drafts, with no blanket rights clearance.

Before classroom use, the owner should arrange native-language PE-teacher review and a small field pilot, checking age suitability, exact techniques, workload/rest, space, equipment and accessible participation. Resolve the DR-049/DR-052 terminology questions in that review. No student data or device acceptance results were entered.

## Repository and evidence

Branch: `codex/activity-bank-audit-2026-10-11`, based on current main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`. Repository change is only `docs/handoffs/2026-10-11-activity-bank-audit.md`; no application source or generated output change.

Commands run:

- `python activity-audit/finalize_followup.py`: 600 unique reviewed language/ID pairs; 15 exact verified replacements; zero validation errors.
- `npm test`: 700 passed, 0 failed.
- `node build-standalone.js`: run twice successfully.
- `git diff --exit-code -- index.html Hamegrash.html sw.js`: exit 0 after the second build.

The Node/build results are local code-baseline evidence. Playwright was not run for this editorial-only task. No new CI, simulated-native, emulation, physical-device, classroom pilot or native-human validation was performed. Device acceptance sheets remain untouched.

No merge, deployment, store upload, bank expansion or app import occurred. Netlify's owner-reported credit hold until 22 October 2026 remains documented; that date does not authorize deployment. Claude/owner should review this handoff and the Notion reports without reapplying already verified fixes or lifting the integration hold.


## Published coordination

Notion report: https://app.notion.com/p/3f6128d0e21781819bbfdeac9d09ffc1

Issue18 reservations: https://github.com/osher15/https-pe-ultimate.netlify.app/issues/18#issuecomment-6104031411 ; bounded source clauses: https://github.com/osher15/https-pe-ultimate.netlify.app/issues/18#issuecomment-6104062990 ; report/index extension: https://github.com/osher15/https-pe-ultimate.netlify.app/issues/18#issuecomment-6104103064 .

Exact next owner step: read the consolidated report and per-language before/after records; arrange native-language PE-teacher review and a short field pilot. Do not reapply fixes, import the bank or deploy. Claude may review the docs-only branch when available; owner decides any later merge.
