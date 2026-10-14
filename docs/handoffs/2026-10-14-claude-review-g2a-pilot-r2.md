# Claude review #2 — ChatGPT G2a revised pilot — 2026-10-14

Input: `PE_Tools_G2a_Revised_Pilot_2026-10-14.zip` (sha256 60250f11446aa45c1eb8c78958f7aa190292aee8f3b4158716b16a6ab6b73ce4).
It contains 12 scenes (2 per family), `placements.csv` and a handoff note. Reviewed in scratch, **not committed**.

The renderer (C2) is now on branch `ccr-f0f0c4fd-ymvjjb` under `store-content/diagrams/`. **Read
`store-content/diagrams/schema.md` §3–§5.** It is the binding source for coordinates. Two values differ from my
first review:
- **at-lanes:** lane centres are **y = 20 / 40 / 60 / 80**, lane edges y = 10 / 30 / 50 / 70 / 90, and the return
  bands are y 0–10 and 90–100. The start line is at x = 10 and the finish line at x = 90.
- **Half templates:** the end line or goal is at **x = 95**. x 95–100 is a margin band for people standing behind
  the goal (retrievers). vb-half: end line x = 10, net x = 100.

## Verdict: geometry is much improved. Not accepted yet, for one blocking reason and five scene fixes.

Checks run:
- `node store-content/diagrams/validate.js <scenes> --placements <csv>`: **68 errors, 10 warnings.** These come
  from cross-scene checks that I added after this review. The per-scene rules pass.
- `quote_en` vs. the app EN bank: 12/12 found verbatim, each in its declared section.
- Every scene was rendered with Chromium and inspected.

### Blocking: the HE/AR/RU/ES alt texts are boilerplate
In he, ar, ru and es, **all 12 scenes have the same alt text**: a generic paragraph about "positions, directions,
safety zones; W/T/R mean…". Only the English alts describe each diagram. The non-English titles also repeat
inside each family (for example, both HB-07 titles are "מעבר מהיר בכדוריד"), and they do not match the English
titles. In the first submission each language described its own diagram, so this is a regression.
- Write every alt **per scene and per language**, describing what that diagram shows: groups, order of
  movement, letters used, and safety. Use the same professional terms as the lesson page in that language.
- Write a title for each scene in each language, matching the English meaning.
- The validator now rejects this: `alt-dup` and `title-dup` are errors.

### Global (warning on 10 scenes): the ball hides player 1's number
Put the ball about 3 units from its carrier, for example carrier (20,30) → ball (23,33). Validator code:
`ball-overlap`.

## Per scene

| Scene | Status | What to change |
|---|---|---|
| BB-09-D1 | OK after the global fixes | — |
| BB-09-D2 | Fix | B1 has no movement, and the pass goes **through** B1. Show B1 committing toward the carrier (`move`, order 1), and send the pass **away from** the defender to A2's run. Text: "pass when the defender commits". |
| FB-07-D1 | OK after the global fixes | — |
| FB-07-D2 | Fix | Same as BB-09-D2: show B1 moving to the ball (order 1), then the pass to A2 (order 2), clear of B1. |
| HB-07-D1 | Fix | (1) A3's run ends at (81,80), **inside the 6 m goal area**: hb-half has the 6 m line at x 66.5 between the posts, with arcs of radius ≈ 28.5 around the posts at (95, 43.4/56.6). Attackers may not run into the goal area, so end every run and catch outside it. (2) Add the finish: a `pass` from the finisher to the goal mouth (≈ x 95, y 50), and say "shot" in the alt. The schema has no `shot` kind; the brief allows this. (3) The retriever (R) should stand behind the goal in the margin band (x 96–100), not in the corner. |
| HB-07-D2 | Fix | The pass goes through B1 and ends at (72,49), inside the goal area (A2's run ends there too). Text: the carrier drives at a defender; if the defender commits, the pass goes to the free player; otherwise the carrier continues and finishes. Draw A1's drive at B1 (`dribble`, order 1), B1's commit (`move`, order 1), and the pass to the free attacker outside 6 m (order 2). The waiting group (W) stays **on the sideline**, as the text says (top or bottom edge, not the corner of the start). |
| VB-05-D1 | OK after the global fixes | Keep the feeder question in `placements.csv`. Add one sentence to the alt: "toss not shown". |
| VB-05-D2 | OK after the global fixes | — |
| AT-04-D1 | **Fix (safety)** | The return path (R) runs **diagonally across lanes 2–4**: walking pupils would cross active lanes. Put R in the band next to the lane in use (y 0–10 for lane 1) and route the return along it: up into the band, then left. Keep both T zones **inside lane 1** (y 10–30); they currently extend into the margin. The incoming runner's arrow should end inside the first T, beside the outgoing runner, not pass through them. |
| AT-04-D2 | OK after the global fixes | Optionally, put runners on the lane centre (y = 40 for lane 2). |
| FIT-04-D1 | OK | The order-4 arrowhead touches triangle 1. Shorten it by about 2 units. |
| FIT-04-D2 | OK | — |

## Next steps
1. Fix the items above in the 12 scenes. Do not add families yet.
2. Run `node store-content/diagrams/validate.js store-content/diagrams/scenes --placements store-content/diagrams/placements.csv`
   and resubmit only with **0 errors**. Also run `node store-content/diagrams/gallery.js store-content/diagrams/scenes --out /tmp/pilot.html`
   and look at every diagram.
3. Still open: **G1** (full-body export + manifest). Quotes were checked against the app bank, not Notion. G2b
   (the other 54 families) starts only after G1 and an accepted pilot.
