# Claude review #3 — ChatGPT G2a pilot R3 — 2026-10-14

Input: `PE_Tools_G2a_Pilot_R3_2026-10-14.zip` (sha256 adc16ff5f0547b45247271f5769e6f4dde387391b587b8af2609d51cf6c58e46).
It contains 12 scenes, `placements.csv` and a handoff note. Reviewed in scratch, **not committed**.

## Verdict: accepted on condition. Fix 7 mechanical warnings (below); no new visual review is needed for them.

Checks run (C2 engine on branch `ccr-f0f0c4fd-ymvjjb`):
- **Validator:** `node store-content/diagrams/validate.js <scenes> --placements <csv>` gives **0 errors, 7 warnings**.
- **Quotes:** 12/12 match the app EN bank verbatim, each in its declared section.
- **Handball goal area:** no attacker position and no run/catch endpoint is inside the 6 m goal area (arcs of
  radius 28.5 around the posts plus the straight part at x 66.5). The shots end at the goal mouth, which is
  correct.
- **Language:** each scene now has its own alt text and title in all five languages (no `alt-dup` or
  `title-dup`). Native PE review is still required.
- **Visual:** all 12 scenes rendered in Chromium and inspected. Every point from review #2 is fixed:
  - BB/FB: the defender commits and the pass goes away from the defender.
  - HB: runs stay outside 6 m; the shot, the retriever behind the goal and W on the sideline are drawn.
  - AT: the return runs along the outer band, and both T zones are inside lane 1.
  - VB: the toss is noted in the alt text.
  - FIT: the arrow is shortened.

## Fix before G2b (mechanical, the validator must show 0 warnings)
| Scene | Warning | Fix |
|---|---|---|
| BB-09-D2 | `path-orphan` paths[1] | A `move` from (63,77) to (83,77) starts where there is no player (left over from R2). Delete it. |
| FB-07-D2 | `path-orphan` paths[1] | A `move` from (54,16) to (82,24) is left over and draws a second arrow out of A2. Delete it. |
| BB-09-D1, BB-09-D2, FB-07-D1, FB-07-D2, HB-07-D2 | `ball-overlap` | The ball is still about 2 units from A1 and hides the number. Use carrier (x,y) → ball (x+3, y+3). |

Both checks are new in the validator (`path-orphan` was added today, after R3 arrived). They run automatically.

## Notes for G2b (no action needed on the pilot)
- FB-07-D2 reuses the BB-09-D2 coordinates for A2, B1 and the pass. It is plausible on `fb-half`, but in G2b
  every scene must come from its own lesson text. Repeated geometry between families will be checked.
- VB-05-D1: the A2 triangle covers the `T` label of the zone. Move the zone 2–3 units so the letter is visible.
- HE "הכנה" for *set*: the HE lesson pages use "מסירה עילית"/"הגבהה". Use the terms of the lesson page in each
  language (this is for the native review).

## G2b — how to proceed
1. **G1 first:** the full-body EN lesson export (`store-content/export/lessons/en/*.md`). Quotes must be checked
   against Notion with `--en-export`, not only against the app bank. Without the export, the validator warns
   "export missing" for every scene.
2. Then work **one sport per batch** (10 families, 20–30 scenes). Before sending each batch:
   - run `node store-content/diagrams/validate.js store-content/diagrams/scenes --placements store-content/diagrams/placements.csv --en-export store-content/export/lessons/en` with **0 errors and 0 warnings**;
   - run `node store-content/diagrams/gallery.js store-content/diagrams/scenes --out /tmp/batch.html`, open it, and look at every diagram.
3. Claude reviews each batch visually before the next one starts.

The engine is attached as `PE_Tools_diagram_engine_2026-10-14.zip` (the full `store-content/diagrams/` without
scenes). Unzip it at the repo root and run the commands above with Node 18+. It has no dependencies.
