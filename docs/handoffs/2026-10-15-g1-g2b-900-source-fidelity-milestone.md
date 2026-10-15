# G1/G2b source-fidelity milestone — 2026-10-15

Scope: `osher15/https-pe-ultimate.netlify.app`, task branch `codex/g1-notion-export-pilot-20261014`. No Main, merge, deploy, Notion writes or app changes.

## Source comparison coverage across recorded runs 11–16
**900/900 distinct exported source pages** have a recorded successful direct live Notion full-Markdown-body comparison and exact last-edited timestamp comparison:
- **300/300 lessons**: six families BB/FB/HB/VB/AT/FIT × 10 IDs × five languages. Run16 compared `*-01` and `*-03..10` except BB-10 (265 comparisons); run15 verified `*-02` in all five languages (30); run13 verified BB-10 in all five languages (5).
- **400/400 drills**: DR-001..040 from run15 plus DR-024/028 from run12; DR-041..079 HE/EN from run11, AR/RU/ES DR-041..050 from run15 and DR-051..079 from run16; DR-080 from run12.
- **120/120 games**: GM-001..024 × five languages, run14.
- **80/80 activities**: AC-001..015 × five languages run14; AC-016 × five languages run12.

Run16 alone executed **352/352** successful direct Notion-to-GitHub comparisons (265 lessons, 87 drills), no truncation, mismatches or timestamp differences. Some comparisons overlap prior samples. The 900/900 statement is deduplicated aggregate evidence from multiple runs, **not 900 new reads this run**.

## Mechanical verification
- Owner-uploaded full checkout with reviewed G2b patch: lesson checker 300/300, activity checker 600/600, 900 unique source IDs.
- New 2-case inventory regression test published in commit `ac4504db98fb7901afe7740fb8c52d68931f9308`, read back from GitHub.
- Manifest test suite (with local supplementary tests) 6/6; diagrams 70/70; 30 scenes, 0 errors and 0 warnings; manifests generated twice with byte-identical hashes.
- The deduplicated 900-entry coverage ledger was generated locally and matched against all 900 published manifest keys (no missing/extra IDs). Local report: `PE_Ultimate_G1_G2b_run16_2026-10-15.md`.

## Remaining
- **BB-05 Main A source contradiction**: three players/three cones but refers to an empty cone. Existing two scenes are drafts for unambiguous warm-up and Main B. No source editing without approval.
- **Claude professional review** deferred by owner. Source fidelity and structural tests do not constitute professional approval.

A previous attempt to publish a run16 addendum was blocked by GitHub safety checks; this milestone records the subsequent results. No merge, deploy, Main, Notion or application changes.