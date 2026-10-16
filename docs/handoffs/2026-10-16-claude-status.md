# Claude status — PE Tools Store and app work (2026-10-16)

Branch: `ccr-f0f0c4fd-ymvjjb` (pushed; nothing merged to `main`, nothing deployed). Issue #59 holds the file reservation.
All evidence is Node and headless Chromium. **No physical-device evidence exists for anything below.**

## Merged on the branch
| Item | Result |
|---|---|
| C17 app: 47 cartoon exercise animations (stills in lists, animated in detail, reduced-motion fallback) | npm test 819/819; build twice, no diff; full Playwright e2e not completed (406 passed, run stopped) |
| C18 "Delete all data" with backup first and restore, 4 tools | 43/43, 46/46, 22/22, 49/49, 32/32, 46/46 at merge time |
| C20 interval trainer single file (1.83 MB, 47 animations, offline, deterministic) | 36/36 node, 50/50 browser |
| C21 football scenes FB-01..FB-10 (20) | validator 20 scenes 0/0; engine tests 70/70 |
| C23 BB-05 Main A scenes D3/D4 | validator 0/0 on BB set |
| C22 English store copy (products, FAQ 28, support KB 22, Hebrew product pages) | forbidden-word grep clean |
| C24 scoreboard reload-autosave fix | 46/46, 49/49, npm test 819/819 (bug reproduced before fix) |
| C25 alt texts for 47 animations in 5 languages | 534/534 |
| C13 Notion fidelity sample (121 pages, 0 defects) | sample only, not full verification |

## ChatGPT branch (`codex/g1-notion-export-pilot-20261014`, not merged here)
Verified by Claude: lessons 300/300, activities 600/600, manifest deterministic, manifest tests 3/3, BB-05 scenes in place.
Weak and superseded: its sales copy, listing descriptions, alt texts and lesson-pack indexes. Round 5 prompt: `2026-10-16-chatgpt-next-prompt-5.md`.

## Blockers and owner decisions
1. **Netlify publishes the whole repo (`publish = "."`).** Merging `store-content/` to `main` would expose lesson packs, legal drafts and tools at `/store-content/`. Use a private store repo, or add a 404 redirect for `/store-content/*`.
2. Store name (`{{STORE_NAME}}`) and tool branding ("PE Ultimate" vs "PE Tools").
3. Prices, School licence price, updates policy, supported browsers and phone/tablet opening steps (physical-device pass needed).
4. Diagrams exist for 24 of 60 lesson families. Decide whether to sell packs with partial diagrams or draw the rest.
5. Native-speaker review of he/ar/ru/es copy, alt texts, scene titles and delete-all strings; lawyer and accountant review of `store-content/legal/`.
6. Platform choice (Lemon Squeezy preferred, Gumroad fallback) and Osek Patur approval.
7. Whether to add a clarifying sentence to BB-05 Main A in Notion (all five languages). FB-02 Main B has an open question in `placements.csv`.
8. Whether to remove `exercise-gifs/` from the app after a device check.
9. Interval trainer `about.media` wording ("original cartoon-style drawings"): approved by the owner on 2026-10-16.

## Not done
- C14 reconcile lesson exports with the app lesson bank; C15 print-ready packs; C16 activity import converter (on hold); C19 storefront (needs a separate repo).
- Full Playwright e2e run for the app (rest of the suite after test 406).
- Lesson-pack indexes with titles, activity metadata, glossary and the translations of the final copy: assigned to ChatGPT (round 5).
