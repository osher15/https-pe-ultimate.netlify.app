# PE Ultimate — Lesson Diagram Library Plan

Status: **Future design system / not wired into the app yet**

## Goal
Create a lightweight visual diagram library for lesson plans so teachers can understand positions, spacing, movement, passing and organization at a glance.

The diagrams should supplement text, not replace it. Most lessons should use only **2–3 diagrams** where a visual explanation adds clear value.

## Visual language
Use one consistent notation system across sports:

- Team A: triangle marker
- Team B / defenders: square marker
- Player number: inside marker
- Ball: small circle
- Pass: dashed straight arrow
- Player movement: solid arrow
- Dribble / carry: wavy arrow
- Cone: small orange triangle
- Goal / basket / net: sport-specific neutral icon
- Optional highlighted zone: light transparent rectangle / arc

Keep diagrams top-down, simple, high contrast and readable on a phone outdoors.

## Core template library

### Basketball — 8 templates
1. Full court — neutral
2. Half court — neutral
3. Half court with numbered 5v5 positions
4. 3v3 half court
5. 4v4 half court
6. Transition / full-court lanes
7. Two-line passing / finishing setup
8. Cone / station drill layout

### Soccer — 8 templates
1. Full pitch — neutral
2. Half pitch — neutral
3. Attacking third
4. Small-sided square / rectangle
5. Two small goals
6. Four-goal game
7. Rondo / possession grid
8. Cone movement / dribbling route

### Handball — 7 templates
1. Full court — neutral
2. Half court — neutral
3. 6 m / 9 m attacking zone
4. Transition setup
5. 3v3 / 4v4 half court
6. Shooting stations
7. Two-line attack against goal

### Volleyball — 8 templates
1. Full court — neutral
2. Half court / one side
3. Full court 6v6 numbered positions
4. 3v3 court
5. Serve receive formation
6. Setting / passing pattern
7. Attack and block formation
8. Passing / serving stations

### Athletics — 6 templates
1. Straight running lanes
2. Oval track overview
3. Sprint start zone
4. Long/high jump approach zone
5. Throwing sector
6. Multi-station circuit

### Fitness / general PE — 7 templates
1. Empty rectangle activity area
2. Empty square activity area
3. Two teams facing each other
4. Circle formation
5. Cone route
6. Four-station circuit
7. Six-station circuit

**Initial target: 44 reusable templates.**

## Court-size variants
Every major team-sport template should support:

- full court / field
- half court / field
- cropped activity area when the drill uses only one zone

Avoid showing unused space when it does not help understanding.

## Implementation direction
Prefer **SVG** or another vector representation rather than pre-rendered screenshots.

Reasons:

- sharp at any screen size
- small file size
- easy to recolor
- can move players programmatically later
- supports player numbers and arrows without creating hundreds of separate images
- suitable for print/PDF export later

Long-term, store each diagram as a reusable field/court template plus a small data description for markers and paths, for example:

```json
{
  "sport": "volleyball",
  "surface": "full-court",
  "players": [
    { "team": "A", "number": 1, "x": 70, "y": 80 },
    { "team": "A", "number": 6, "x": 50, "y": 55 }
  ],
  "ball": { "x": 75, "y": 75 },
  "paths": [
    { "type": "pass", "from": [75,75], "to": [50,55] }
  ]
}
```

This would allow one renderer to generate many lesson-specific diagrams without shipping hundreds of image files.

## Recommended lesson-plan usage
Use diagrams primarily for:

1. starting organization / player positions
2. the main movement or passing pattern
3. a game / progression shape when organization changes materially

Do **not** add a diagram to every paragraph.

## Current repository state
This document is planning only. Nothing here should be connected to production lesson plans yet.

Starter editable SVG assets are stored under:

`assets/lesson-diagrams/`

Future work should expand those assets into the template counts listed above and only then connect diagrams to lesson-plan content.
