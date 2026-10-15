# G1/G2b verification checkpoint — 2026-10-15 [read-only checks]

Scope: task branch only. No merge, deployment, Notion writes, or application-code changes.

## Direct GitHub reads performed
- Read AGENTS.md, G1 completion handoff, run-8 and run-9 handoffs, and the manifest builder.
- Directly fetched 13 lesson exports across five languages and all six sport families: all 13 parsed with front matter, source_page_id and substantive body.
- Directly fetched five EN activity exports (DR-024, DR-028, DR-080, GM-024, AC-016): all five parsed, had source_page_id, substantive body and the expected kind.
- These 18 successful checks are a targeted sample, NOT full source fidelity against Notion or a 900-file validation.
- The 2026-10-15 run-9 handoff reports 300 lessons, 600 activities and 28 scenes, with no final manifests. Those counts were not independently recounted in this checkpoint.

## BB-05 source ambiguity confirmed
The current EN lesson explicitly states **three students and three cones** for Main A, while its process says the passer should fill an **empty cone**. Its general equipment/setup elsewhere describes four cones per square, and warm-up explicitly uses one empty cone. The local BB-05-D1 draft uses a fourth cone, but that is not consistent with Main A organisation. Do not silently alter the lesson or publish the draft as source-faithful. Main B 3 attackers + 1 shadow defender is unambiguous, but the two-scene family remains on review hold.

## Technical blockers
- Container Git DNS still fails: Could not resolve host github.com.
- No full 900-file checkout in the container; therefore official check-lessons, check-activities, manifest build twice, official diagram validator and SVG gallery were NOT executed. Do not claim those gates passed.
- Manifest builder currently requires all 900 files locally. It is not correct to commit synthetic outputs as production manifests.

## Remaining tasks (user authorised 1–4; Claude review deferred)
1. Obtain full checkout; run official lesson/activity checkers, fix verified metadata issues without touching source bodies.
2. Run deterministic manifest builder twice and compare output hashes, commit 3 real generated outputs.
3. Run official scene validator + renderer/gallery; address verified warnings and complete BB-05 after resolving the source contradiction.
4. Source fidelity comparison of all 900 bodies to Notion remains unproven; distinguish inventory and structure from source fidelity.
