# PE Activity Bank — editorial checkpoint, 2026-10-10

**Status: substantive fixes saved; the requested five-language exhaustive audit is NOT complete.**

The bank contains 80 exercises, 24 games and 16 activities: 120 distinct items in HE/EN/AR/RU/ES, or 600 language pages. Root recovered all 600 full visible page bodies after the agents were interrupted. None of these source snapshots is counted as a full review merely because it was retrieved.

Five GPT-6-Luna agents were assigned one language each. All five subsequently hit the model usage limit. Hebrew delivered a first-pass report and 120 individual coverage entries; the four other complete language reports were not delivered. Root continued the cross-language mechanics fixes and preserved the work so continuation does not require starting again.

## Verified outcome

- 40 exact text replacements applied to 33 existing Notion cards: HE 10 replacements/9 pages; EN 7/6; AR 8/6; RU 7/6; ES 8/6.
- All 33 complete resulting page bodies read back and matched exactly. Page identity, titles, draft/source notices and unrelated content retained.
- Six common issues addressed in all five languages: GM-007 wrong possession after an overtime hold; GM-003 missing possession-limit consequence and floor-strip separation; GM-011 signal times; GM-014 additional passes to include all four receivers; GM-018 restart after an invalid direct goal; GM-019 continuation after an assisted sequence.
- Arabic and Spanish GM-007 now explicitly give the post-score restart to the player who conceded the point. Three additional Hebrew wording edits clarify an action or return protection.
- Three optional Hebrew title substitutions and a redundant GM-010 rewrite were rejected. Valid synonyms are not automatically errors; a forearm pass need not be renamed as a reception.

## Coverage and honesty

- Hebrew: completed AI first pass, with limited official-source access and no teacher/native-human sign-off.
- English, Arabic, Russian and Spanish: source corpus complete; six-card shared-mechanics pass performed by root; full language and terminology audit remains unfinished.
- Root also directly read all 24 Hebrew games, all 16 Hebrew activities and 13 selected Hebrew drills. This is not a complete independent second pass over all exercises.
- A literal-number comparison produced flags recorded in validation.json. Numbers written as words differ across languages. Those flags are NOT a semantic parity certificate and require individual adjudication in the next pass.
- The Hebrew agent's normalized export omitted some provenance/status footers. The pre-write full-body comparison blocked the write; root restored the complete bodies from the raw snapshot before proceeding. No footer was removed from Notion.
- Initial retrieval attempts included rate-limit responses. They were excluded and missing pages were recovered sequentially. An update attempted with a URL where a UUID was required failed validation without changing content; it was retried with the correct page identifier.

## Sources and rights

Official curricula and professional references support terminology or teaching concepts only; they do not prove the safety or validity of every original activity. The Hebrew first-pass report lists Ministry of Education references and identifies pages accessible only through search extracts or blocked on open. Root independently encountered 403 responses on both referenced ball-game portal pages. No broad corroboration claim is made for the four unfinished language reviews.

Root consulted FIBA Official Basketball Rules 2024, Article 25, and IHF Indoor Handball Rules dated 1 July 2025, Rule 7, when checking the distinction between generic coordination tasks and actual sport rules. These were checks of concepts, not imported lesson text:

- https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-v10a.pdf
- https://www.ihf.info/sites/default/files/2025-06/09A%20-%20Rules%20of%20the%20Game_Indoor%20Handball_E_with%20highlighted%20changes.pdf

No guarantee of zero errors, legal clearance, teacher acceptance, native-language editing or field safety is claimed. Original draft labels remain.

## Next execution steps

1. Resume the EN/AR/RU/ES language reviews from the preserved 120-card snapshots, with card-specific observations and exact term-to-source evidence. Do not label all 120 as passed based on six corrected games.
2. Review the Hebrew report and the four completed language reports against each other, including every numerical flag, timing and role sequence. Root must adjudicate all additional changes before editing.
3. Obtain teacher/native-editor and practical pilot evidence for the final drafts; none is fabricated here.

The planning gap remains 26 games and 14 activities relative to earlier 50/30 targets. The current pass does not lift the component-bank expansion/import hold. Exercises stay at 80; the cap of 100 is not an instruction to add 20.

## Repository and test evidence

Documentation-only branch: codex/activity-bank-audit-2026-10-10, based on main 348c1ab. Only docs/handoffs/2026-10-10-activity-bank-audit.md is to be published. No product, generated file, protected lesson-bank array, live student data or device sheet is changed.

Commands run on the main-based documentation worktree: npm test (700 passed, 0 failed); node build-standalone.js twice; git diff checks for unchanged generated files. These checks concern unchanged application source and do not validate the Notion pedagogy or language.

No Playwright suite was relevant to an external editorial-only change and none was run for this task. No pinned-CI, simulated-native, OS compilation, physical-device or classroom evidence was produced. No PR, merge, Netlify build/deploy preview, production deployment or store upload. Owner-reported Netlify credit hold remains until 22 October 2026; renewal does not authorize deployment.

## Saved Notion reports

[Consolidated audit checkpoint](https://app.notion.com/p/3f5128d0e217816381fce04ae51ca916?pvs=204)

- [HE report](https://app.notion.com/p/3f5128d0e21781a3a1b2f62a6899db41?pvs=204)
- [EN report](https://app.notion.com/p/3f5128d0e21781b9947ecf3cdfc5df54?pvs=204)
- [AR report](https://app.notion.com/p/3f5128d0e2178177861bdc91bcd91004?pvs=204)
- [RU report](https://app.notion.com/p/3f5128d0e21781408c7de62fdd5d8128?pvs=204)
- [ES report](https://app.notion.com/p/3f5128d0e21781c580d7cf9d52e9e86e?pvs=204)

## Exact commands and outputs

- `python activity-audit/recover_corpus.py` — EN/AR/ES/RU each 120; Hebrew full bodies restored separately from preserved raw source: 600 total.
- `python activity-audit/verify_and_stage.py` — exit 0; 120 unique expected IDs per language, 40 unique/non-overlapping replacements, 33 staged pages, 0 validation errors, 49 literal-number flags left for semantic review.
- `python activity-audit/prepare_reports.py` — exit 0 after asserting all 33 full-body readbacks verified; six checkpoint reports and 600-row CSV generated. Hebrew first-pass report also retained.
- `npm test` in the main-based documentation worktree — 700/700 passed, no failures/skips.
- `node build-standalone.js` — run twice successfully.
- `git diff --exit-code -- index.html Hamegrash.html sw.js` — exit 0 after both builds; outputs unchanged from main.
- Notion `update_content` — 33 page updates containing 40 exact replacements; full pre-write body comparison and post-write full-body equality checks passed.
- Notion report verification — all 40 replacement strings present across five language status reports; parent index status inserted and original body preserved exactly.

## Changed scope

Repository file: `docs/handoffs/2026-10-10-activity-bank-audit.md` only. Notion edits: GM-003/007/011/014/018/019 in all five languages, plus HE DR-007, DR-013, GM-020. Created one audit report and five language-status pages; added a status section to the existing bank index.

Reservations: Issue #18 comments 6101532334, 6101597612 and 6101613920. Release is recorded in the final Issue #18 status comment. No shared app-source section is held.

## Continuation artifacts

Persistent checkpoint bundle: `PE_Activity_Audit_Checkpoint_Bundle_2026-10-10.zip`. It contains original and revised page bodies, per-language corrections, Hebrew first-pass coverage/report, root review decisions, all 33 readback records, numeric flags, verification scripts and RESUME.md. The Notion reports carry the exact applied old/new text and links to the original cards.

Residual risk: four exhaustive language/terminology reviews remain incomplete; source corroboration is limited, and numerical flags need semantic adjudication. Teacher/native-editor/pilot evidence remains absent. Do not label the bank ready or near-zero-error based on these fixes. Owner/Claude next step: resume the queued language reviews with bounded ten-card checkpoints, then root cross-language review. No owner merge or deployment action is requested.
