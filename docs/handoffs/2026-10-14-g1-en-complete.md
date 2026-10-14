# G1 English export handoff — 2026-10-14

## Delivered
- Branch: `codex/g1-notion-export-pilot-20261014`.
- All 60 English lessons exported from Notion as `store-content/export/lessons/en/{BB,FB,HB,VB,AT,FIT}-01..10.md`.
- Every exported file contains family, language, Notion URL/page ID, last-edited timestamp and the complete source body returned by Notion, without editorial rewriting.
- GitHub compare main..branch showed exactly 60 added EN lesson files (10 per sport), plus handoff documents.
- Read-only structural validator: `node store-content/manifest/check-en.cjs` (not executed against a local full repository in this session).

## Outstanding verification
1. Run the validator in a checkout; inspect all failures rather than automatically editing Notion-derived text.
2. Perform source-fidelity QA against current Notion content, including source revision timestamps.
3. Independently check sport terminology, pedagogy, safety, and translation quality.
4. Cross-check G2a English scene quotes against EN export and run official C2 scene validator; R4 still needs formal approval.
5. Export HE, AR, RU, ES lessons (240 editions), then 600 activity editions. Never fabricate or translate missing Notion source.
6. Do not merge or deploy without user authorization.

## Agent architecture
Five independent language lanes, QA1 source/structure, QA2 sport/language/safety, final reviewer. These are roles, not actual launched subagents. No paid API usage.

## GitHub boundaries
Only branch files added; no Main changes, merges or deployments.
