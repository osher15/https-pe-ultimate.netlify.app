# PE Tools Store — work split (Claude / ChatGPT / owner) — 2026-10-14

Source: Notion "PE Tools Store — Claude Master Handoff, Content + Diagrams — 2026-10-14"
(https://app.notion.com/p/3f9128d0e21781eca610fc5d74a7e148), read in full on 2026-10-14 together with the
lesson series page, the activity bank page and the 2026-10-11 five-language audit.
Branch: `ccr-f0f0c4fd-ymvjjb` (docs only). No app source, generated output, merge or deploy.

## 1. What is already true (verified in the repo, 2026-10-14)

| Asset | Where | State |
|---|---|---|
| 60 lessons × 5 languages | `hm-lessonbank-{basketball,football,handball,volleyball,athletics,fitness}.js` on `main` | In the app. EN `contentVersion` V2.1 `draft`; HE `teacher-reviewed` (#47). Sections: `opening, warmup, mainA, mainB, appliedGame, closing`. Lesson codes `BB/FB/HB/VB/AT/FIT-NN-<LANG>`. The `identity` code line is missing or malformed in some EN records (BB-06…10, most FB) — fix in reconciliation, not by hand. |
| Activity bank 80 DR + 24 GM + 16 AC × 5 languages | Notion only | **Not in the repo.** Audited 2026-10-11 (15 + 40 corrections applied). Draft, with no teacher or native review. |
| Diagram plan + legend + multisport starter sheet | branch `origin/docs/lesson-diagram-library` @ `7459759` (`assets/lesson-diagrams/*.svg`, `docs/design/lesson-diagram-library-plan.md`) | Not merged. The legend matches the Notion notation (triangle/square, dashed pass, wavy dribble). Reuse it, do not redraw. |
| Scoreboard + coach board | `prototypes/pe-boards/` on `main` (`PE_Ultimate_Scoreboard.html`, `PE_Coach_Board.html`) | Standalone, both in 5 languages. 2026-10-14 (C5): 38/38 Node checks + 22/22 browser checks pass; the new readiness suite is 55/57 (2 real scoreboard bugs, patch proposed in `store-content/reports/patches/`). No device acceptance. See `store-content/reports/product-readiness.md`. |
| Beep test, fitness tools | inside the app (`hm-tests.js` etc.) | Not standalone. Extraction needed before they can be sold separately. |

Owner instruction 2026-10-14 (this session): integrate the drill/game/activity bank. Claude reads this as lifting
the AGENTS.md import hold **for preparation on branches and for the store**. Wiring the bank into the live app
remains a separate owner merge decision.

## 2. Split

### ChatGPT — content, Notion, copy (brief: `docs/handoffs/2026-10-14-chatgpt-store-content-prompt.md`)
| ID | Task | Depends on | Output (branch `codex/store-content-2026-10-14`) |
|---|---|---|---|
| G1 | Full-body export + manifest for the 300 lesson pages and 600 activity pages | — | `store-content/export/**`, `store-content/manifest/*` |
| G2a | Diagram scene pilot: BB-09, FB-07, HB-07, VB-05, AT-04, FIT-04 | schema in brief | `store-content/diagrams/scenes/**`, `placements.csv` |
| G2b | Remaining 54 families (120–180 diagrams total) | Claude accepts G2a | same |
| G3 | Activity structured metadata (extracted, not rewritten) | G1 | `store-content/data/activities.meta.json` |
| G4 | Product pages, FAQ, support KB, legal checklist (EN) | G1 counts | `store-content/copy/*` |

### Claude — architecture, code, integration, acceptance (each row = one sub-agent, run in its own worktree)
| ID | Agent | Task | Depends on | Output |
|---|---|---|---|---|
| C1 | lead (me) | Inventory, reservations, scene schema `pe-diagram/1` owner, review of every ChatGPT delivery, final acceptance | — | this file; review notes |
| C2 | diagram-engine | Vanilla JS pure renderer `scene → SVG`; 14 templates (IDs in brief); legend reused from `docs/lesson-diagram-library`; validator (schema, 0–100 bounds, template IDs, 5 alt texts, `quote_en` matches EN export); node:test; print/greyscale-safe palette; HTML gallery for review | — (starts now) | `store-content/diagrams/{render.js,templates/,legend.svg,validate.js,gallery.html}`, tests |
| C3 | lesson-reconcile | Compare the G1 lesson export with `hm-lessonbank-*.js` field by field; fill `repo_compare`; classify each difference as repo-newer (#47 edits) / Notion-newer / conflict. **Never overwrite repo edits.** Repair `identity` code lines as a proposal | G1 | `store-content/reports/lesson-reconcile.{json,md}` |
| C4 | activity-import | Converter Notion export → `store-content/data/activities.<lang>.json` (stable IDs, kinds separate); proposal patch for an in-app activity library (separate branch, not merged) | G1, G3 | data files + `docs/patches/…activitybank.patch` |
| C5 | tools-readiness | Boards: re-run the checks, Playwright browser layout at phone width, print, offline, and coach board language coverage. Beep test and fitness tool: plan the standalone extraction. Produce a readiness table per product | — (starts now) | `store-content/reports/product-readiness.md` |
| C6 | pack-builder | Static print-ready HTML (→ PDF via Chromium) per sport pack with diagrams placed at their anchors, and a drill/game/activity pack; deterministic build, run twice with no diff | C2, C3, C4, G2b | `store-content/build/` script + outputs |
| C7 | storefront | Static English-first prelaunch site: catalog, product pages, demo, bundle, FAQ, privacy, terms, support. **Checkout disabled.** | C5, C6, G4; owner repo | separate repo |

### Owner (Osher)
1. Create a **private** repo, for example `osher15/pe-tools-store`, and add it to the Claude session. Until it exists, `store-content/` lives on non-main branches of this repo with `[skip netlify]`.
2. Send ChatGPT the brief file above.
3. Decide later whether lesson diagrams should also appear inside the PE Ultimate app (a separate, reserved app task).
4. Arrange the PE-teacher and native-speaker review, and a small field pilot, before anything is marked ready.
5. Settle the seller entity, payment, receipts, terms and licence (the G4 checklist) before checkout opens. Budget: up to 500 NIS, starting at zero.

## 3. Order of work
1. **Now:** G1 + G2a (ChatGPT) ‖ C2 + C5 (Claude).
2. Claude renders and reviews the pilot (G2a). Then G2b + G3 + G4 ‖ C3 + C4.
3. C6 packs, then teacher/native review, then C7 storefront in the new repo.
4. Checkout opens only after the legal, payment and rights gates. Merges and deploys are by the owner only.

## 4. Acceptance gates (Claude runs these on every delivery)
- Manifest: 300 + 600 rows, IDs × languages complete, zero truncation, hashes reproduce from the export files.
- Scenes: schema valid, coordinates 0–100, template IDs known, `quote_en` found verbatim in the EN export, five non-empty alt texts, rendered SVG reviewed at print size and at phone width.
- Packs: deterministic rebuild (second build identical); RTL pages for HE/AR; every diagram placed beside its anchor step.
- No change to `main`, app sources or generated outputs on any store branch.

## 5. Limitations
Planning document only. No content has been exported yet and no diagram has been drawn. No ChatGPT agent is running yet. No Issue was opened: per AGENTS.md, the C2/C5 reservations are recorded here and should be mirrored in an Issue once code work starts.


## 6. Status update — 2026-10-15 (afternoon)

**Done and merged on `ccr-f0f0c4fd-ymvjjb`:** C2 diagram engine; C5 product readiness; C8 shuttle run (20 m / adapted 15 m);
C9 interval trainer; C10 animated cartoon demonstrations for all 47 exercises; C11 owner-decision updates;
C12 legal drafts v0.2 (HE/EN, for lawyer review); Issue #58 (FITNESSGRAM/HFZ removal) merged on this branch only.

**ChatGPT (branch `codex/g1-notion-export-pilot-20261014`), verified by Claude on 2026-10-15:**
G1 exports 300 + 600 (checkers 0 issues), deterministic 900-row manifest, G2a pilot accepted,
G2b basketball (20 scenes) accepted. ChatGPT cannot compare all 900 pages to Notion; that moved to Claude.

**Claude's open tasks**
| ID | Task | Status |
|---|---|---|
| C13 | Notion fidelity sample (120 files) | running |
| C14 | Reconcile lesson exports vs app lesson bank (`repo_compare`) | next, after C13 |
| C15 | Pack builder: print-ready sport packs with diagrams at their anchors (basketball first) | next, after C14 |
| C16 | Activity import converter (data files) for a future app library | after the owner lifts the hold |
| C17 | Integrate animations into app + interval trainer (INTEGRATION.md) | needs owner approval |
| C18 | Delete-data button for scoreboard, coach board, interval trainer | small, proposed |
| C19 | Storefront (static, checkout disabled) in a separate repo | needs the repo + owner decisions |

**ChatGPT's open tasks:** G2b football → handball → volleyball → athletics → fitness (Claude reviews each sport),
G3 activity metadata, G4 copy, sitemap.

**Owner:** private store repo; platform sign-up (Lemon Squeezy supported countries lists Israel under bank payouts; confirm
individual Osek Patur approval, fees); lawyer + accountant review (`store-content/legal/open-questions.md`);
numbers {{EXTRA_LICENCE_DISCOUNT}} and {{FIX_DAYS}}; merge decisions.
