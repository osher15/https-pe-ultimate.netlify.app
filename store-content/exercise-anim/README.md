# Exercise animations (pilot, task C10)

Animated demonstrations of a drawn cartoon person for the FIT exercise library (PE Ultimate app,
`hm-app.js`) and the PE Tools store. Owner decision 2026-10-14: every library exercise gets a
looping 2–3 s animation of a drawn, gender-neutral cartoon figure doing the exercise correctly.
These animations replace the static rig GIFs and the 5 Wikimedia photos.

**This is the pilot:** the engine plus 8 exercises (squat, push-up, lunge, jumping jack, plank,
glute bridge, Russian twist, burpee). Nothing in `exercise-gifs/`, the app or the store tools is
replaced yet.

Rights: everything is drawn by our own code (`src/`). No photo, model, font, or third-party
asset is used, so no credit or licence line is needed.

## Files

| Path | What |
|---|---|
| `src/skeleton.cjs` | Skeleton, forward kinematics, two-bone IK, root anchoring, keyframe interpolation |
| `src/svg.cjs` | Camera projection, cartoon drawing, animated SVG emitter (SMIL) |
| `src/exercises.json` | One keyframe spec per exercise (the only per-exercise data) |
| `src/build.cjs` | Builds SVGs, GIFs, contact sheet, manifest |
| `src/preview.cjs` | Dev helper: prints solved joints/angles for chosen frames |
| `library.json` | All 47 library exercises: app `fig`, animation file key, status (pilot/pending) |
| `out/svg/<id>.svg` | Animated SVG (loops, self-contained, ~8–38 KB) |
| `out/still/<id>.svg` | Still key pose (for `prefers-reduced-motion`) |
| `out/gif/<id>.gif` | Animated GIF, 260×260, 20 fps, loops forever (16–142 KB) |
| `out/manifest.json` | Generated: frames, sizes, SHA-256 of every output |
| `contact-sheet.png` | 6 frames per exercise, for review |
| `checks/` | `node:test` checks + a headless Chromium pass |

## Regenerate

```sh
# SVGs only (pure Node)
node store-content/exercise-anim/src/build.cjs
# SVGs + GIFs + contact sheet (headless Chromium + ffmpeg + ImageMagick montage)
NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node store-content/exercise-anim/src/build.cjs --gif --sheet
# options: --only squat,push   --strip <dir>  (PNG strip of ~12 frames per exercise)
```

GIF frames are screenshots of the animated SVG itself (SMIL clock paused and seeked), so the
SVG is the single source of truth. Frames are assembled with ffmpeg
`palettegen` (24 colours) / `paletteuse` (no dithering, rectangle diff).

## Checks

```sh
node --test store-content/exercise-anim/checks/*.test.cjs
NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node store-content/exercise-anim/checks/browser.cjs
```

- `motion.test.cjs` (per exercise): loop 2–3 s and keys cover one cycle; seamless loop (end pose =
  start pose, and the wrap step is no bigger than any other step); no teleport (every joint moves
  < 25 cm per 1/25 s; the burpee jump declares 35); joint angles within anatomical ranges
  (`checks/_lib.cjs` `LIMITS`); bone lengths constant; planted hands/feet do not slide
  (< 0.6 units on screen over each declared contact window) and nothing goes below the floor.
- `output.test.cjs`: SVG deterministic (two renders byte-identical) and the committed
  `out/svg` / `out/still` / manifest are fresh; SVG self-contained (no text, image, script or
  external URL), loops, has the reduced-motion fallback, every SMIL value list closes the loop;
  GIF 260×260, NETSCAPE loop, frame count and constant 5 cs delays match the spec, hash matches
  the manifest, < 150 KB.
- `library.test.cjs`: `library.json` = the 47 exercises of `hm-app.js` (ids, groups, figs, order);
  every exercise needs a spec. The 39 not in the pilot are reported as TODO, not failures.
- `browser.cjs`: the SVG loads in `<img>` and animates; `<picture>` with a reduced-motion
  `<source>` picks the still file; the animated SVG opened directly hides its animation under
  reduced motion; the frame just before the loop end matches frame 0 in pixels.

## How it works

- **Figure.** Flat cartoon: round head with short hair and dot eyes, capsule torso (shirt),
  shorts, capsule limbs, ball hands, white shoes, dark outline. Far-side limbs are a shade
  darker. Proportions are fixed in `BODY` (units ≈ cm; standing height ≈ 165).
- **Kinematics.** Pelvis root (position + pitch/yaw/roll) → lumbar → thoracic (+twist) → neck/head;
  shoulders and hips hang off the spine; each limb has flexion, abduction and knee/elbow bend.
  Angle conventions are documented at the top of `skeleton.cjs`.
- **Ground contact.** A planted hand/foot is an IK target (`"ik": [x,y,z]` for wrists,
  `"foot": {"toe"|"heel": [x,z], "pitch": deg}` for feet; the foot keeps its world orientation).
  Because a planted target is identical in consecutive keys, it cannot slide. `rootFrom` places
  the pelvis so a chosen point (e.g. the toes in a plank) stays fixed while the body pivots.
  `rel` targets are relative to the pelvis (hands on hips). Weights blend between IK and FK when a
  hand leaves the floor.
- **Keys.** Each key inherits the previous key; `"same": n` copies key n. `ease` per segment
  (`inOut`, `sine`, `in`, `out`, `quadIn`/`quadOut` for flight). `cycles: 2` repeats the cycle
  inside the loop (jumping jack); its GIF stores one cycle.
- **Camera.** Side view by default; `camera.yaw` / `camera.elev` give front or ¾ views (jack:
  front-¾; Russian twist: elevated ¾). The view box is fitted to the whole motion.
- **Reduced motion.** The animated SVG contains a second, static copy of the key pose (`still`
  time in the spec), shown by its own `@media (prefers-reduced-motion: reduce)` rule. For use
  in `<img>`, also ship `out/still/<id>.svg` and use
  `<picture><source media="(prefers-reduced-motion: reduce)" srcset="still/<id>.svg"><img src="svg/<id>.svg"></picture>`
  — Playwright's emulation does not reach an SVG inside `<img>`, so the `<picture>` markup is the
  verified path. Real OS-setting behaviour inside `<img>` was not tested on devices.

## Correct-form checklists (used to define each motion)

The cues come from the app's own cue/mistake lists plus standard coaching cues. They are stored with
each spec (`form`, `doubts`) and this block is regenerated by the build.

<!-- form:start (generated by src/build.cjs from the specs; edit the specs, not this block) -->

**Squat (`squat`, side view, 2.8 s).**
- Feet about hip/shoulder width, whole foot planted — heels never lift
- Hips move back and down first; at the bottom the hip crease is at knee height (thigh about parallel)
- Knees travel forward over the toes, in line with the feet
- Chest up: trunk leans about 40° with a neutral spine; arms reach forward for balance, eyes forward
- Short pause at the bottom, drive up through the heels to full standing
- *Doubt / limitation:* Side view cannot show knees caving in (valgus).

**Push-up (`push`, side view, 2.4 s; mat).**
- Hands slightly wider than the shoulders, under the shoulders at the top
- Body one straight line from head to heels — it pivots rigidly on the toes, no sagging or piking hips
- Lower until the chest is close to the floor, elbows travelling back at about 45°
- Push back to straight arms, neck neutral

**Incline push-up (`pushincline`, side view, 2.4 s; box).**
- Hands on the box edge, slightly wider than the shoulders, under the shoulders at the top
- Body one straight line from head to heels: it pivots on the toes, no sagging or piking hips
- Lower the chest to the box edge, elbows travelling back at about 45°
- Push back to straight arms; the higher the box, the easier

**Lunge (`lunge`, side view, 2.8 s).**
- Hands on hips, trunk upright
- Big step forward, heel first, then the whole foot
- Lower straight down until both knees are about 90°: front shin near vertical, back knee just above the floor, back heel up
- Push through the front foot back to standing
- *Doubt / limitation:* Forward lunge on one side only (right leg) per loop.

**Wall sit (`wall`, side view, 3 s; hold, stopwatch; wall).**
- Back flat against the wall from hips to head
- Thighs parallel to the floor, knees at about 90° above the ankles
- Feet flat, hip width, shins vertical
- Arms relaxed at the sides — not resting on the knees
- Hold and keep breathing
- *Doubt / limitation:* Static hold: the stopwatch hand signals the hold; breathing is a slight chest rise.

**Glute bridge (`gluteb`, side view, 2.8 s; mat).**
- Lying on the back, knees bent, feet flat about hip width, arms on the floor beside the body
- Push through the heels and lift the hips until shoulders, hips and knees form a straight line (knee about 90°)
- No extra arch in the lower back — the lift comes from the hips
- Short squeeze at the top, lower with control; upper back, head, hands and feet stay down

**Step-up (`stepup`, side view, 3 s; box).**
- Whole foot on the box (heel too)
- Drive up through the leading leg — don't push off with the bottom foot
- Stand tall on the box, hips and knees fully extended
- Step down with control, the same leg leads up next time
- *Doubt / limitation:* The same (right) leg leads every repetition; teachers usually alternate legs.

**Bench dip (`dip`, side view, 2.6 s; bench).**
- Hands on the bench edge, close to the body, fingers forward
- Feet flat, knees bent (easier) — further away is harder
- Lower straight down until the elbows reach about 90°
- Elbows point back, not out to the sides; shoulders stay away from the ears
- Push back up to straight arms
- *Doubt / limitation:* At the bottom the upper arm is about 73° behind the trunk: normal for bench dips (the shoulder blade tilts), but at the edge of the model, which has no shoulder blade.
- *Doubt / limitation:* Bent-knee (easier) version.

**Pike push-up (`pike`, side view, 2.6 s; mat).**
- Hips high — the body makes an upside-down V
- Hands shoulder width, feet hip width, legs as straight as possible
- Bend the elbows and lower the top of the head toward the floor between the hands
- Push back up; the hips stay high (it is not a push-up)
- *Doubt / limitation:* Heels are up; with tight hamstrings the knees may bend a little in real life.

**Calf raise (`calf`, side view, 2.8 s).**
- Stand tall, feet hip width, weight over the balls of the feet
- Rise slowly as high as possible onto the toes
- Hold one second at the top
- Lower with control — no bouncing or jumping

**Bear crawl (`bearcrawl`, side view, 2.4 s; travels forward, camera follows; 2 repetitions per loop).**
- Hands under the shoulders, knees under the hips, knees hovering just off the floor
- Back flat like a table, head in line
- Opposite hand and foot move together (right hand with left foot)
- Small steps, hips stay low and level
- *Doubt / limitation:* Travels forward: the camera follows and floor marks scroll; the GIF repeats seamlessly.

**Single-leg deadlift (`singleleg`, side view, 3 s).**
- Stand on one leg, its knee slightly bent
- Hinge at the hip: the chest and the free leg move together like a see-saw plank
- Back flat, hips square to the floor, arms reach toward the floor
- Go until the body is about horizontal, then return to standing
- *Doubt / limitation:* Right leg lifts only; arms hang toward the floor (one common variant).

**Inchworm (`inchworm`, side view, 3 s; travels forward, camera follows).**
- From standing, hinge and walk the hands to the floor (knees may bend a little)
- Walk the hands out to a straight-arm plank, body in one line
- Walk the feet in toward the hands with small steps, legs as straight as possible
- Roll up to standing and repeat — the body travels forward
- *Doubt / limitation:* A real inchworm is slower than 3 s; here it is compressed (4 hand steps, 4 foot steps).
- *Doubt / limitation:* Knees bend a little in the fold so the hands reach the floor.

**Jumping jack (`jack`, ¾ view, 2.4 s; 2 repetitions per loop).**
- From feet together, arms by the sides, jump the feet to about shoulder width while the arms sweep sideways overhead
- Hands almost meet overhead
- Land softly on the balls of the feet with soft knees, heels touch
- Jump back in while the arms come down; even rhythm
- *Doubt / limitation:* The loop holds two identical repetitions; the GIF stores one.

**Burpee (`burpee`, side view, 3 s).**
- Squat and place the hands on the floor in front of the feet
- Jump the feet back (hips briefly high) to a straight-arm plank with a straight body
- Jump the feet back in to the squat
- Stand up and jump with the arms overhead, land softly with bent knees
- *Doubt / limitation:* No push-up in this version.
- *Doubt / limitation:* The jump arm swing is the fastest motion in the library (~8 m/s at the hand).

**Plank (`plank`, side view, 3 s; hold, stopwatch; mat).**
- Forearm plank: elbows directly under the shoulders, forearms forward on the floor, toes tucked
- Body one straight line, pelvis neither high nor low, eyes to the floor
- Hold and keep breathing (slight chest rise); the stopwatch means "hold"

**Russian twist (`rtwist`, elevated front view, 2.8 s; mat).**
- Seated on a mat, knees bent, heels on the floor (beginner version), trunk leaned back about 40°, back long and straight
- Hands together in front of the chest
- Rotate from the chest (the shoulders turn, the head follows), not only the arms
- Light touch on the floor beside the hip, through the centre to the other side
- *Doubt / limitation:* Front elevated view so both side touches are visible; the backward lean is foreshortened in this view.
- *Doubt / limitation:* Feet-up variant not shown.

<!-- form:end -->

## Known limitations and doubts

- **2D/side views hide some cues:** knee alignment (valgus), hand width and foot width are only
  visible in the front-¾ jack view. Russian twist far-side touch is drawn in front of the thighs
  (fixed paint order), so the far-side hands look as if they touch near the knees from this angle.
- **Speeds:** the burpee take-off/arm swing reaches ~8 m/s at the hand between two frames; real
  explosive arm swings are in this range, but it is the fastest motion in the set.
- **Model simplifications:** hip flexion is measured against a single pelvis segment (no separate
  pelvic tilt), so its limit is 155° rather than an anatomical hip-only value; shoulder
  "abduction" of up to −45° in the Russian twist is horizontal adduction across the chest. Arm IK
  drops a small out-of-plane residual when hands reach forward (depth only, invisible in side views).
- **Variants chosen:** forward lunge (one side), forearm plank, heels-down Russian twist,
  burpee without a push-up. Teachers may want other variants (alternating lunge, push-up in the
  burpee, feet-up twist).
- **GIF:** 20 fps (exact 5 cs delay; 25 fps cannot be stored exactly in GIF). Light background
  `#eef3f8`; the current app GIFs have a dark navy background — one colour token in `svg.cjs`
  (`PAL.bg`) if the owner prefers dark.
- GIF bytes depend on Chromium's rasteriser; they are reproducible on this machine (repeat build,
  no diff) but may differ by a few bytes elsewhere. The SVGs are byte-deterministic everywhere.

## Next: full batch

`library.json` lists all 47 exercises with the file key (`anim` = exercise `id`). Several app
exercises share a figure today (`pushincline`→push, `wall`/`gsquat`→squat, `gluteb`→deepsquat,
`rtwist`→bicycle, `hollow`→situp, `skip`→jack, `inchworm`→pike, `singleleg`/`rdl`→hinge,
`latpull`/`pullup`→pulldown, `deepsquathold`→deepsquat); the new set gives each id its own
animation. Equipment props still to draw: bench/box, wall, dumbbells, kettlebell, band, pull-up
bar, jump rope.
