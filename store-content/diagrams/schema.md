# Lesson diagram scenes: `pe-diagram/1`

Status: draft engine for the PE Tools Store (task C2, Issue #57). It is not wired into the PE Ultimate app.
All courts are **schematic, not regulation-accurate**. Content drawn with them is draft material pending
PE-teacher and native-speaker review.

This document describes the schema exactly as `render.js` and `validate.js` implement it. The schema is the
one defined in `docs/handoffs/2026-10-14-chatgpt-store-content-prompt.md` (section G2). No field was added,
renamed or given a new meaning.

## 1. Files

| Path | What it is |
|---|---|
| `render.js` | `renderScene(scene, opts)` -> standalone SVG string; also `renderLegend(lang)`, `renderTemplate(id)`, `mapPoint(template, x, y)`, `escapeXml`. Node (`module.exports`) and browser (`window.PEDiagram`). |
| `templates/index.js` | The 14 templates (viewBox, playing area, landmarks, markings). Browser global `window.PEDiagramTemplates`; load it **before** `render.js`. |
| `validate.js` | `validateScene`, `validatePlacements`, `validateDir` and the CLI. Node only. |
| `gallery.js` | Builds the static review page `gallery.html` (and rewrites `legend.svg`). Node only. |
| `legend.svg` | English legend, generated from `renderLegend('en')`. |
| `lib/xml-check.js` | Small XML well-formedness checker used by the validator and tests. |
| `examples/` | Synthetic **test fixtures** (not lesson diagrams), their `placements.csv` and a synthetic EN export used to test the quote check. |
| `tools/make-fixtures.js` | Regenerates `examples/`. |
| `tools/schema-table.js` | Prints the template table in section 4 (a test checks it is in sync). |
| `test/*.test.js` | `node --test store-content/diagrams/test/` |

Scenes authored for real lessons live in `store-content/diagrams/scenes/<FAMILY>/<FAMILY>-D<n>.json`, with
`store-content/diagrams/placements.csv` next to the `scenes/` folder.

## 2. Scene schema

One JSON file per diagram, at `scenes/<FAMILY>/<FAMILY>-D<n>.json`.

```json
{
  "schema": "pe-diagram/1",
  "id": "BB-09-D1",
  "family": "BB-09",
  "sport": "basketball",
  "template": "bb-half",
  "anchor": { "section": "mainA", "step": 1, "quote_en": "<exact EN sentence(s) of the step>" },
  "group_shown": "representative",
  "title": { "he": "", "en": "", "ar": "", "ru": "", "es": "" },
  "alt":   { "he": "", "en": "", "ar": "", "ru": "", "es": "" },
  "objects": [
    { "type": "player", "team": "A", "n": 1, "x": 40, "y": 35 },
    { "type": "player", "team": "B", "n": 1, "x": 70, "y": 50 },
    { "type": "ball", "x": 42, "y": 37 },
    { "type": "cone", "x": 20, "y": 10 },
    { "type": "zone", "x": 5, "y": 80, "w": 30, "h": 15, "label": "W" },
    { "type": "station", "n": 3, "x": 60, "y": 20 },
    { "type": "teacher", "x": 50, "y": 95 }
  ],
  "paths": [
    { "kind": "dribble", "from": [40, 35], "to": [65, 30], "order": 1 },
    { "kind": "pass",    "from": [65, 30], "to": [80, 60], "order": 2 },
    { "kind": "move",    "from": [55, 70], "to": [80, 60], "via": [[70, 72]], "order": 2 }
  ],
  "safety": "<one line: spacing / return path / waiting zone / clear area shown>",
  "notes": "<why this diagram helps, max 2 lines>",
  "status": "draft"
}
```

### Field rules (what the validator enforces)

| Field | Rule | Level |
|---|---|---|
| `schema` | exactly `"pe-diagram/1"` | error |
| `family` | `BB`, `FB`, `HB`, `VB`, `AT` or `FIT`, then `-01` ... `-10` (`AT`, not `ATH`). Must equal the folder name. | error |
| `id` | `<family>-D<n>`, n = 1, 2, 3 ... (no leading zero). File name must be `<id>.json`. Ids are unique. | error |
| `sport` | follows the family prefix: BB basketball, FB football, HB handball, VB volleyball, AT athletics, FIT fitness | error |
| `template` | one of the 14 IDs in section 4, allowed for the sport (`open-area` for every sport; `fit-stations` for fitness and athletics; the others for their own sport) | error |
| `anchor.section` | `warmup`, `mainA`, `mainB` or `appliedGame` | error |
| `anchor.step` | positive integer: the 1-based step inside that section's text | error |
| `anchor.quote_en` | non-empty. With `--en-export <dir>`: must appear verbatim in `<dir>/<FAMILY>.md` (front matter removed) after whitespace normalisation (Unicode NFC, every run of whitespace -> one space, trimmed). Punctuation is **not** folded: curly and straight quotes differ. | error; a missing export file is a **warning** ("export missing") |
| `group_shown` | `whole-class` or `representative` | error |
| `title.{he,en,ar,ru,es}` | non-empty, at most 60 characters (Unicode code points) | error |
| `alt.{he,en,ar,ru,es}` | non-empty, at most 400 characters | error; more than 300 is a warning (the brief asks for about 300) |
| `status` | non-empty string (for example `draft`) | error |
| `safety` | one line | warning if missing or empty |
| `notes` | string | warning if not a string |
| `objects[]` | array; `type` is `player`, `ball`, `cone`, `zone`, `station` or `teacher`; `x`, `y` finite numbers within 0-100 | error |
| player | `team` `A` or `B`; `n` positive integer; no duplicate (`team`, `n`). Numbers start at 1 for each team, so A1 and B1 can coexist. | error |
| station | `n` positive integer, unique within the scene | error |
| zone | `w`, `h` > 0 and the zone lies fully inside 0-100 (`x + w <= 100`, `y + h <= 100`); `label` is one capital letter A-Z | error; a zone without `label` is a warning |
| `paths[]` | array (missing = warning, treated as empty); `kind` `move`, `pass` or `dribble`; `from`, `to` are `[x, y]` within 0-100; optional `via` is an array of `[x, y]` points within 0-100; optional `order` is a positive integer | error |
| unknown fields | anywhere in the scene, anchor, objects or paths | warning (the renderer ignores them) |
| rendering | every scene is rendered in all five languages; the SVG must be well-formed and contain no drawn text other than numbers and single letters | error |

### Test fixtures (reserved `-00` families)

Fixtures in `examples/` use the reserved family number **`-00`** (`BB-00`, `FB-00`, `HB-00`, `VB-00`, `AT-00`,
`FIT-00`) and `"status": "fixture"`. This keeps the sport/template rules active on fixtures.

- Without `--fixtures`, the validator rejects any `-00` family and any `status: "fixture"`.
- With `--fixtures`, the family number **must** be `-00` and the status **must** be `fixture`.

So a fixture cannot pass as a lesson diagram, and a lesson diagram cannot slip into the fixture set.

### `placements.csv`

Columns, exactly: `family,diagram_id,section,step,template,group_shown,reason,open_question` (RFC 4180 quoting).

- One row per diagram. `family`, `section`, `step`, `template` and `group_shown` must equal the scene. Every
  scene must be listed. Rows without a scene file and duplicate rows are errors.
- Exception rows (a lesson with 0-1 diagrams) have an empty `diagram_id` and **must** give a `reason`.
- A family with fewer than 2 diagrams and no `reason` in any of its rows is a warning.
- The validator looks for `placements.csv` inside the scenes directory, then (only when the directory is named
  `scenes`) next to it. `--placements <file>` overrides this. When no file is found, the check is skipped.

### Cross-scene checks (whole directory)

- **Error `alt-dup`:** the same alt text (after whitespace normalisation) is used by two scenes in one language.
  Every alt must describe its own diagram in every language. Copying one generic paragraph is not allowed.
- **Error `title-dup`:** the same title is used by two scenes of one family in one language.
- **Warning `ball-overlap`:** a ball within 2.5 units of a player's centre hides the player's number. Put the ball
  about 3 units from the carrier, for example (x+3, y+3).

## 3. Coordinates and conventions

- Coordinates are **0-100 on both axes inside the template's playing area**. The origin is the top-left
  corner of the playing area; x increases to the right, y increases downward. The two axes are scaled
  separately, so `(50, 50)` is always the centre.
- **Attack goes left to right.** Half-court templates have the basket or goal on the **right**.
- **Diagrams are never mirrored for RTL languages.** The SVG is identical for all five languages except
  `<title>`, `<desc>`, `lang` and element ids.
- The playing area of a court template is the court **plus a run-off band**, so waiting players, servers and
  ball collectors behind a line still fit inside 0-100 (for example: behind the goal in `fb-half` is
  x 95-100). Section 4 gives the exact scene coordinates of every line.
- Paths: if `from` or `to` sits on a player, station, teacher or ball (within about 1% of the diagram width),
  the line is shortened so it starts or ends at the marker's edge and the arrowhead stays visible.
  `via` points are joined with a smooth curve (Catmull-Rom). A straight pass with `via` is drawn dashed
  along that curve.
- `order`: when the paths use more than one distinct `order` value, a small black circle with the order
  number is drawn beside the start of each path (one badge per start point and order). With zero or one
  distinct value, no badges are drawn.

## 4. Templates

<!-- template-table:start -->
| Template | Allowed sports | Intended use | Orientation / coordinates | viewBox | Playing area (viewBox units) |
|---|---|---|---|---|---|
| `bb-full` | basketball | Full-court transition, lanes across the whole court, two-basket games. | Attack left to right. Baskets at both ends; centre line at x=50. | 1000 x 595 | x 40, y 40, w 920, h 515.3 |
| `bb-half` | basketball | Half-court attack, 1v1 to 3v3, finishing and rebounding. | Half-way line at x=0 (left edge); basket and end line on the RIGHT. Attack left to right. Band x 95-100 is behind the end line. | 1000 x 1144 | x 40, y 40, w 920, h 1064.1 |
| `fb-full` | football | Whole-pitch games, transition, team shape. | Attack left to right. Goals at both ends (drawn in the bands behind the goal lines); halfway line at x=50. | 1000 x 696 | x 40, y 40, w 920, h 615.6 |
| `fb-half` | football | Attacking half: finishing, 2v1/3v2 to goal, small-sided games to one goal. Use this template whenever a goal matters. | Halfway line at x=0 (left edge); goal line and goal on the RIGHT. Attack left to right. Band x 95-100 is behind the goal (goal net drawn there; ball collectors fit at x 98-100). | 1000 x 1168 | x 40, y 40, w 920, h 1087.6 |
| `fb-grid` | football | Rondos, possession squares, dribbling grids, small-sided games without goals. No goals are drawn: use fb-half when a goal matters. | Square grid; cones at the corners and side midpoints. Band of 8 around the grid for waiting players. | 1000 x 1000 | x 40, y 40, w 920, h 920 |
| `hb-full` | handball | Fast break / transition, whole-court games. | Attack left to right. Goals with 6 m and 9 m lines at both ends; centre line at x=50. | 1000 x 561 | x 40, y 40, w 920, h 480.9 |
| `hb-half` | handball | Attack against the 6 m zone, shooting, 2v1/3v2 to goal. | Centre line at x=0 (left edge); goal, 6 m and 9 m lines on the RIGHT. Attack left to right. Band x 95-100 is behind the goal. | 1000 x 1073 | x 40, y 40, w 920, h 993.2 |
| `vb-full` | volleyball | Rallies over the net, serve and receive, rotation. | Net vertical at x=50. Attack lines 3 m either side of the net. Bands behind the end lines (x<8, x>92) are the serving areas. | 1000 x 540 | x 40, y 40, w 920, h 460 |
| `vb-half` | volleyball | Receive-set-send patterns, positions on one side, serving. | One side of the court with the NET on the RIGHT edge (x=100); end line at x=10, band x 0-10 is the serving area behind the end line. Play goes left to right toward the net. | 1000 x 1021 | x 40, y 40, w 920, h 940.9 |
| `at-lanes` | athletics | Sprints, relays and baton exchanges, running drills in lanes. | 4 horizontal lanes, running left to right. Start line at x=10, finish line at x=90. Bands y 0-10 and y 90-100 are outside the lanes (return paths); x 0-10 is behind the start (waiting), x 90-100 is the run-out. | 1000 x 680 | x 40, y 40, w 920, h 600 |
| `at-jump` | athletics | Long jump / standing and running jumps: approach, take-off board, landing pit. | Approach left to right along the runway (x 0-70, y 42-58). Take-off board at x 62-64.5; landing pit x 70-97, y 25-75. Grass around (y<42, y>58) for waiting and the return path. | 1000 x 540 | x 40, y 40, w 920, h 460 |
| `at-throw` | athletics | Throws (ball, shot, vortex, javelin-type): throwing circle/line, sector, clear landing area. | Throw left to right. Throwing circle centred at (12, 50). The sector (lighter wedge) opens to the right between (12,50)-(100,4) and (12,50)-(100,96) and must stay clear. Waiting area behind the thrower at x 0-8. | 1000 x 655 | x 40, y 40, w 920, h 575 |
| `fit-stations` | fitness, athletics | Circuits and station work in a hall or yard; place numbered station objects. | Open hall, walls drawn around the edge. No court lines. Suggested station spots: 4 stations (25,30) (75,30) (75,70) (25,70); 6 stations (20,28) (50,28) (80,28) (80,72) (50,72) (20,72); 8 stations (14,28) (38,28) (62,28) (86,28) (86,72) (62,72) (38,72) (14,72). Keep the middle band (y 40-60) for circulation and the teacher. | 1000 x 693 | x 40, y 40, w 920, h 613.3 |
| `open-area` | basketball, football, handball, volleyball, athletics, fitness | Anything that does not need court lines: tag games, circles, cone routes, formations. Allowed for every sport. | Plain rectangle, aspect 3:2. No markings. | 1000 x 693 | x 40, y 40, w 920, h 613.3 |

Landmarks in scene coordinates (0-100, origin top-left of the playing area):

- `bb-full`: end line (left) = 4; centre line = 50; end line (right) = 96; sideline (top) = 6; sideline (bottom) = 94; basket (left) x = 9.2; basket (right) x = 90.8; baskets y = 50
- `bb-half`: half-way line = 0; end line = 95; sideline (top) = 6; sideline (bottom) = 94; basket x = 84.3; basket y = 50; free-throw line x = 55.6; three-point arc top x = 38.5
- `fb-full`: goal line (left) = 4; halfway line = 50; goal line (right) = 96; touchline (top) = 6; touchline (bottom) = 94; goals y = 50; penalty area edge (left) x = 19.2; penalty area edge (right) x = 80.8
- `fb-half`: halfway line = 0; goal line = 95; touchline (top) = 5; touchline (bottom) = 95; goal y = 50; goal posts y = 44.1 / 55.9; penalty area edge x = 63.7; goal area edge x = 84.6; penalty spot x = 74.1
- `fb-grid`: grid left = 8; grid right = 92; grid top = 8; grid bottom = 92; centre = 50
- `hb-full`: goal line (left) = 4; centre line = 50; goal line (right) = 96; sideline (top) = 6; sideline (bottom) = 94; goals y = 50; 6 m line (left) x = 17.8; 9 m line (left) x = 24.7; 9 m line (right) x = 75.3; 6 m line (right) x = 82.2
- `hb-half`: centre line = 0; goal line = 95; sideline (top) = 6; sideline (bottom) = 94; goal y = 50; goal posts y = 43.4 / 56.6; 6 m line x (straight part) = 66.5; 9 m line x (straight part) = 52.3; 7 m mark x = 61.7
- `vb-full`: end line (left) = 8; attack line (left) = 36; net = 50; attack line (right) = 64; end line (right) = 92; sideline (top) = 8; sideline (bottom) = 92
- `vb-half`: serving band = 0-10; end line = 10; attack line = 70; net = 100; sideline (top) = 6; sideline (bottom) = 94
- `at-lanes`: start line = 10; finish line = 90; lane edges y = 10, 30, 50, 70, 90; lane centres y = 20, 40, 60, 80; return bands y = 0-10 and 90-100
- `at-jump`: runway y = 42-58; runway x = 0-70; take-off board x = 62-64.5; landing pit x = 70-97; landing pit y = 25-75
- `at-throw`: throwing circle centre = 12, 50; sector edges = (12,50)-(100,4) and (12,50)-(100,96); waiting band x = 0-8
- `fit-stations`: walls = 0 and 100 on both axes; circulation band y = 40-60
- `open-area`: edges = 0 and 100 on both axes
<!-- template-table:end -->

## 5. Authoring notes (for scene authors)

These notes turn the table above into placement rules. All numbers are scene coordinates.

**Half courts / half pitches (`bb-half`, `fb-half`, `hb-half`).** x = 0 is the halfway (centre) line, the
end/goal line is at **x = 95**, and the basket or goal is on the right. The band x 95-100 is behind the
end line: put ball collectors, rebound queues or "behind the goal" waiting players there (for example
x = 98). Sidelines are at y = 6 and y = 94 (`fb-half`: y = 5 and 95); the bands outside them are for
waiting lines and the teacher. `hb-half` draws the 6 m line (straight part at x = 66.5, goal area shaded)
and the dashed 9 m line (straight part at x = 52.3) around the goal at x = 95, y = 50.

**Full courts (`bb-full`, `fb-full`, `hb-full`).** Attack left to right; the centre line is at x = 50;
end lines are at x = 4 and x = 96; sidelines at y = 6 and y = 94.

**Volleyball.** `vb-full`: the net is vertical at x = 50; end lines at x = 8 and 92 (serving areas
behind them); attack lines at x = 36 and 64. `vb-half` shows **one side of the court with the net on the
right edge at x = 100**; the end line is at x = 10 and x 0-10 is the serving area; the attack line is at
x = 70. Receive-set-send patterns on one side belong in `vb-half`; a pass drawn across x = 50 in `vb-full`
goes over the net.

**`fb-grid`.** A plain cone-marked square (grid from 8 to 92 on both axes), **no goals**. Goals cannot be
added as objects (there is no goal object type in `pe-diagram/1`), so use `fb-half` whenever a goal
matters. Use the band outside the grid (0-8, 92-100) for waiting players.

**`at-lanes`.** Four horizontal lanes, running left to right. Lane centres are at **y = 20, 40, 60, 80**
(lane edges at 10, 30, 50, 70, 90). The start line is at x = 10 (wait behind it, x < 10), the finish line at
x = 90 (run-out x > 90). The strips y 0-10 and y 90-100 lie outside the lanes: draw return paths there,
never inside a lane. A relay exchange zone is a `zone` object inside one lane (for example
`x 45, y 31, w 18, h 18, label "T"`).

**`at-jump`.** Runway x 0-70 at y 42-58, take-off board x 62-64.5, landing pit x 70-97 / y 25-75. Wait on
the grass beside the start of the runway and return outside the runway (y < 42 or y > 58).

**`at-throw`.** The thrower stands at the circle (12, 50) and throws to the right. The lighter wedge
between (12,50)-(100,4) and (12,50)-(100,96) is the landing sector and must stay clear: nobody inside it
while throws are on. Waiting throwers stand behind the circle (x 0-8) or outside the sector; ball
collection happens only after a stop signal, which belongs in `safety` and `alt`.

**`fit-stations`.** An open hall with walls at the edges and no court lines. Suggested station spots:
4 stations (25,30) (75,30) (75,70) (25,70); 6 stations (20,28) (50,28) (80,28) (80,72) (50,72) (20,72);
8 stations (14,28) (38,28) (62,28) (86,28) (86,72) (62,72) (38,72) (14,72). Keep y 40-60 free for
circulation and the teacher. Show the rotation with `move` paths between stations.

**General.**
- Keep players at least about 6 units apart: a marker is about 6.5% of the diagram width, so closer
  markers overlap.
- Put the ball 3-5 units from the player who has it, not on the same point.
- Paths that start or end on a marker are shortened to the marker's edge automatically. Point a pass at
  the receiver's position.
- Use `order` only when the sequence matters, and use more than one value (with a single value no badge
  is drawn).
- Every letter used as a zone label must be explained in all five `alt` texts (W = waiting, R = return
  path, S = safety/clear area, T = target).
- Draw what the step text says: group sizes, equipment counts and rotation direction. When the text
  shows six parallel lanes, draw one or two, set `group_shown: "representative"` and say so in `alt`.

## 6. Notation (legend)

The notation follows the starter legend on branch `docs/lesson-diagram-library` (commit `7459759`). Shape
is always the primary cue, so the diagrams stay readable in greyscale print and for colour-blind readers.

| Element | Drawing | Colour (secondary cue) |
|---|---|---|
| Team A (attackers / working group) | **triangle** with a white number | dark blue `#1d4ed8` |
| Team B (defenders / second group) | **square** with a white number | red `#c62828` |
| Ball | small circle | amber `#f59e0b`, dark outline |
| Cone | small triangle **on a base plate**, no number (the base plate tells it apart from team A) | orange `#f97316` |
| Movement | **solid** line with arrowhead | near-black |
| Pass | **dashed straight** line with arrowhead | near-black |
| Dribble / carry | **wavy** line with arrowhead | near-black |
| Zone | translucent rectangle with a **dashed** outline and a one-letter badge | light amber |
| Station | white circle with a thick outline, inner dashed ring and a dark number | white |
| Teacher | dark green circle with a white **person** pictogram | green `#166534` |
| Order | small **black** circle with a white number beside a path start | black |

Markers have a white halo so they stay visible on top of court lines. Court surfaces are light tints with
mid-dark lines, so markers and paths have the strongest contrast.

`renderLegend(lang)` produces the legend in `he`, `en`, `ar`, `ru` or `es`. Hebrew and Arabic legends set
`direction="rtl"` on the root and on every `<text>` (with `text-anchor="start"`). Icons sit to the right of
their labels, and the reading-start column is on the right. The legend labels are drafts pending
native-speaker review.

## 7. Accessibility

- Every SVG has `role="img"`, `aria-labelledby="<prefix>-title <prefix>-desc"`, a `<title>` from
  `title[lang]` and a `<desc>` from `alt[lang]` (falling back to English when a language is missing), and
  `lang="<lang>"`.
- Ids are prefixed with the scene id and language (`ped-BB-09-D1-he-title`), or with `opts.idPrefix`, so
  several diagrams can be inlined in one HTML page. The renderer uses no other ids (no `<defs>`, markers
  or patterns).
- **No words are drawn inside the field.** The only drawn text is player numbers, station numbers, order
  numbers and single-letter zone labels. One SVG serves all five languages, and the meaning lives in `alt`.
- All text from the scene is XML-escaped, and characters that are not allowed in XML 1.0 are removed.
- Rendering is deterministic: no randomness, no dates, and numbers rounded to 0.1. The same input gives
  byte-identical output.

## 8. Commands

```sh
# Unit tests (renderer, templates, legend, validator rules, gallery, docs sync)
node --test store-content/diagrams/test/

# Validate the fixtures (fixture mode, quote check against the synthetic export)
node store-content/diagrams/validate.js store-content/diagrams/examples --fixtures \
     --en-export store-content/diagrams/examples/export-en

# Validate real scenes (placements.csv next to scenes/ is found automatically)
node store-content/diagrams/validate.js store-content/diagrams/scenes --en-export store-content/export/lessons/en
#   options: --placements <file>, --json ; exit code 1 when any error is found

# Rebuild gallery.html and legend.svg from the fixtures (deterministic; run twice, expect no diff)
node store-content/diagrams/gallery.js

# Review page for any scenes directory (writes only --out)
node store-content/diagrams/gallery.js store-content/diagrams/scenes --out /tmp/scenes-gallery.html \
     --en-export store-content/export/lessons/en

# Regenerate the fixtures / the template table in this file
node store-content/diagrams/tools/make-fixtures.js
node store-content/diagrams/tools/schema-table.js
```

In a browser:

```html
<script src="templates/index.js"></script>
<script src="render.js"></script>
<script>
  document.getElementById('fig').innerHTML = PEDiagram.renderScene(scene, { lang: 'he' });
</script>
```

The gallery prints one diagram per half A4 page (English only). Tick "Include all five languages when
printing" to add the five titles and alt texts. The page uses no scripts and no external assets.

## 9. Known limitations

- The quote check matches `quote_en` against the whole EN export body. It does not check that the quote sits
  in the named `section` and `step`, because the export's section headings are not fixed yet.
- Markdown escaping in the export (for example `\*`) is not undone. A quote copied from rendered text may
  then need the raw Markdown form.
- Courts are schematic. Line positions are plausible, not regulation dimensions. School pitches and halls
  vary.
- The overlap of markers placed too close together is not detected. Review the rendered SVG.
- Order badges avoid markers and zone labels, but they can still touch a path line in dense scenes.
