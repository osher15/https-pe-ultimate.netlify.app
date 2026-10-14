# Claude review — ChatGPT G2a diagram pilot (partial) — 2026-10-14

Input: `PE_Tools_G2a_Partial_Pilot_2026-10-14.zip` (sha256 cbccad8b65c489d4bb441654ee0372b5f19d58e664891feaadff933061f35b50). It contains 6 scenes (`*-D1.json`), `placements.csv` and
`docs/handoffs/2026-10-14-chatgpt-diagram-pilot.md`. Reviewed in a scratch directory and **not committed**: the
scenes belong on ChatGPT's branch `codex/store-content-2026-10-14`.

## Verdict: not accepted. Revise and resubmit the pilot. Do not start the other 54 families.

The files parse, IDs are unique, all five alt texts exist and coordinates are within 0–100. ChatGPT's report about
its own work is accurate. The content does not meet the brief.

### What was checked
`quote_en` was compared with the EN text of the app bank (`hm-lessonbank-*.js`, `sections.*`), after whitespace
normalisation. Notion is the source, but the G1 export does not exist yet.

| Scene | Quote found | In the declared section |
|---|---|---|
| BB-09-D1 | yes | **no**. The quote is in `mainA`; the scene declares `mainB` |
| FB-07-D1 | yes | yes |
| HB-07-D1 | yes (prefix only, truncated) | yes |
| VB-05-D1 | yes | yes |
| AT-04-D1 | yes | yes |
| FIT-04-D1 | yes | yes |

## Defects that apply to every scene
1. **Placeholder geometry was copied between sports.** BB-09, FB-07, HB-07 and VB-05 share the same coordinates
   (`24,25` / `24,48` / `24,71`) and the same pass `24,25 → 55,48`. Every scene must be built from its own step text.
2. **Passes go to empty points.** A `pass` must end at a receiver: a player's position, or the end of the
   receiver's `move` path when the pass leads the runner. Put a `ball` at the passer at the start of order 1.
3. **`safety` is a placeholder** ("Check waiting space…"). Name the specific arrangement from the text, for
   example "walking return outside the lanes; exchange only inside the marked zone".
4. **One diagram per lesson.** The pilot needs 2–3 per family (see the targets below).
5. **The alt text describes things the drawing does not show** (AT-04: return path; FIT-04: pairs; BB-09: waiting
   players). Draw them, or remove them from the alt text.
6. `placements.csv`: `reason` is the same for every row, and `open_question` holds a generic note. Write the real
   reason, and record specific ambiguities only (example below).

## Template coordinate conventions (binding; Claude's renderer implements them)
- Half templates `bb-half`, `fb-half`, `hb-half`: **x=0 is the halfway/centre line**, basket/goal at x=100 on the
  right. `hb-half` shows the 6 m and 9 m lines around the goal on the right.
- `vb-full`: net vertical at x=50. `vb-half`: one side of the court, net on the right edge (x=100), end line at x=0.
- Full `bb-full`/`fb-full`/`hb-full`: attack left→right, centre line x=50.
- `fb-grid`: a plain cone square with **no goals**. If the text needs a goal, use `fb-half`.
- `at-lanes`: 4 horizontal lanes, running left→right, start near x=0. Lane centres are y = 12.5 / 37.5 / 62.5 / 87.5.
- The exact numbers for each template follow in `store-content/diagrams/schema.md` (Claude C2). Use them once
  they are published.

## Per-scene fixes and pilot targets

**BB-09 — `bb-half`**
- D1 → `mainA` step 1 (fix the section). There is **no defender** in `mainA`: a cone or observer closes one side.
  Draw A1 with the ball, dribbling in one wide lane, and A2 running wide in the other lane. Put a cone that closes
  one side, a pass into A2's path, and a waiting zone `W` behind the start (x≈0–8). Rotation is after four
  sequences; say so in the alt text.
- D2 → `mainB` step 1: defender B1 central at 60%, attackers reach the end within eight seconds. Show the carrier
  committing, the partner holding width, and a pass when B1 commits.
- D3 (optional) → `appliedGame`: 2v1 to a gate, return against a new defender.

**FB-07 — use `fb-half`, not `fb-grid`** (the text says "reach goal")
- D1 → `mainB` step 1: central defender B1 at 60%, no tackle. A1 carries at B1, A2 holds width, pass as B1 moves to
  the ball, finish to goal within 10 s.
- D2 → the `mainA` organisation (unopposed or cone version), by the same method.

**HB-07 — `hb-half`**
- D1: replace the truncated quote with the full sentence ("…each player staying in their own lane the whole
  way."). The trio starts at x≈2 (the halfway line) in three lanes (y≈20/50/80). Show at least two passes
  **across into the runner's path** and a finish at the goal. The next trio waits in `W` at the left and starts only
  after the previous trio has cleared. The retriever stands behind the goal (use the margin band in schema.md).
- D2: the 3v2 from `mainB`.

**VB-05 — `vb-full`**
- D1: the current scene puts three players in a vertical line at x=24, which does not show a sequence. Show the
  setter zone (`zone` label `T`) near the net, the receiver in the back court, the sender, and the low rope at the
  net. Paths: toss (feeder→receiver), forearm pass (receiver→setter), set (setter→sender), send (sender→open floor
  across the net). Use `move` for the player runs and `pass` for the ball flights.
- **Open question for `placements.csv`:** "in triads a feeder tosses": is the feeder one of the three, or a fourth
  person? Draw the minimal reading and record the question.
- D2: role rotation, or the `mainB` progression.

**AT-04 — `at-lanes`**
- D1: the zone label `S` means safety/clear area. Use `T` for the exchange zone and explain it in the alt text.
  The text says: four lanes, one pair active per lane, exchange zone at both ends, walking return outside the
  lanes. Show one lane (representative), or two lanes. The incoming runner's path should end inside the zone,
  beside the outgoing runner, not through them. Add the return path (`move`, order 2) outside the lanes, and the
  second exchange zone.
- D2: the jogging/speed progression or the `mainB` step.

**FIT-04 — `fit-stations`**
- D1: the scene has no people. The text says three to four pairs per station and a marked rotation route. At each
  station, show one representative pair: team A = performer, team B = observer. Explain this in the alt text.
  Draw the rotation route as `move` paths 1→2→3→4. Level cards may be noted in the alt text.
- D2: the faster circuit in `mainB`, if its organisation differs.

## Before resubmitting
- Complete **G1 first**, or at least the six EN lesson exports, so `quote_en` can be checked against Notion.
- Run Claude's validator once it is published:
  `node store-content/diagrams/validate.js store-content/diagrams/scenes --en-export store-content/export/lessons/en`.
- Report: the number of scenes per family, the validator output, and the open questions.
