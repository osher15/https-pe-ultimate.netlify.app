# Exercise animations (task C10)

Animated demonstrations of a drawn cartoon person for all 47 exercises of the FIT exercise library
(PE Ultimate app, `hm-app.js`) and the PE Tools store. Owner decision 2026-10-14: every library
exercise gets a looping 2–3 s animation of a drawn, gender-neutral cartoon figure doing the exercise
correctly. These animations are meant to replace the static rig GIFs and the 5 Wikimedia photos.
Nothing in `exercise-gifs/`, the app or the store tools is replaced yet; see `INTEGRATION.md`.

Rights: everything is drawn by our own code (`src/`). No photo, model, font, or third-party
asset is used, so no credit or licence line is needed.

## Files

| Path | What |
|---|---|
| `src/skeleton.cjs` | Skeleton, forward kinematics, two-bone IK, root anchoring, travel, keyframe interpolation |
| `src/svg.cjs` | Camera projection, cartoon drawing, scene and held props, animated SVG emitter (SMIL) |
| `src/exercises.cjs` | Collects the specs in library order |
| `src/specs/*.cjs` | Keyframe specs by category (pilot, strength, cardio, core, mobility, equipment); `_h.cjs` helpers |
| `src/form.cjs` | Generates the checklist block of this README from the specs |
| `src/build.cjs` | Builds SVGs, still SVGs, GIFs, contact sheet, manifest, README block |
| `src/preview.cjs` | Dev helper: prints solved joints/angles for chosen frames |
| `library.json` | All 47 library exercises: app `fig`, animation file key (`anim` = id), status |
| `out/svg/<id>.svg` | Animated SVG (loops, self-contained), 8–43 KB, 1.31 MB for all 47 (169 KB gzipped) |
| `out/still/<id>.svg` | Still key pose (for `prefers-reduced-motion`), 181 KB for all 47 |
| `out/gif/<id>.gif` | Animated GIF, 260×260, 20 fps, loops forever, 16–148 KB, 2.54 MB for all 47 |
| `out/manifest.json` | Generated: frames, sizes, SHA-256 of every output |
| `contact-sheet.png` | 6 frames per exercise, for review |
| `INTEGRATION.md` | Proposal: swapping the app's exercise media and the interval trainer's single-file build |
| `checks/` | `node:test` checks + a headless Chromium pass |

## Regenerate

```sh
# SVGs (+ still SVGs, README block) only — pure Node
node store-content/exercise-anim/src/build.cjs
# + GIFs + contact sheet (headless Chromium + ffmpeg + ImageMagick montage)
NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node store-content/exercise-anim/src/build.cjs --gif --sheet
# options: --only squat,push   --strip <dir>  (PNG strip of ~12 frames per exercise)
```

GIF frames are screenshots of the animated SVG itself (SMIL clock paused and seeked; single-thread
software raster so the bytes repeat), assembled with ffmpeg `palettegen` (24 colours) /
`paletteuse` (no dithering, rectangle diff). A loop that holds identical repetitions
(`cycles > 1`) is stored as one repetition in the GIF.

## Checks

```sh
node --test store-content/exercise-anim/checks/*.test.cjs          # 534 tests, 0 todo (475 + 59 alt-text checks)
NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers \
  node store-content/exercise-anim/checks/browser.cjs              # 376 browser checks
```

- `motion.test.cjs` (per exercise): loop 2–3 s, whole 1/25 s frames, whole GIF frames per cycle;
  seamless loop (end pose = start pose, shifted by the travel for walking/crawling) and no velocity
  kink at the wrap; no teleport (every joint moves < 25 cm per 1/25 s; a few fast exercises declare
  `maxStepCm`, listed in their doubts); joint angles within anatomical ranges (`checks/_lib.cjs`
  `LIMITS`; per-exercise `limits` overrides are explained in that exercise's doubts); bone lengths
  constant; planted hands/feet/knees do not slide (< 0.6 units on screen over each declared contact
  window); nothing goes more than 1 cm below the floor.
- `output.test.cjs`: SVG deterministic and committed `out/svg`, `out/still`, manifest and README
  checklist are fresh; SVG self-contained (no text, image, script or external URL), loops, has the
  reduced-motion fallback, every SMIL value list closes the loop; GIF 260×260, NETSCAPE loop, frame
  count and constant 5 cs delays match the spec, hash matches the manifest, < 150,000 B.
- `library.test.cjs`: `library.json` = the 47 exercises of `hm-app.js` (ids, groups, figs, order);
  every exercise has a spec.
- `alttext.test.cjs`: `alt-texts.json` (task C25, not wired into any page yet): the 47 ids equal `library.json`, 5 languages each, <= 120 chars, no identical text across exercises per language, localized names from the interval-trainer data, no Latin letters in he/ar/ru, no brand words.
- `browser.cjs`: each SVG loads in `<img>` and animates; `<picture>` with a reduced-motion `<source>`
  picks the still file; the animated SVG opened directly hides its animation under reduced motion;
  the frame just before the loop end matches frame 0.

## How it works

- **Figure.** Flat cartoon: round head with short hair and dot eyes, capsule torso (shirt),
  shorts, capsule limbs, ball hands, white shoes, dark outline. Far-side limbs are a shade
  darker. Proportions are fixed in `BODY` (units ≈ cm; standing height ≈ 165). One scale for the
  whole library: the view box is 250 units unless a motion needs more (pull-up).
- **Kinematics.** Pelvis root (position + pitch/yaw/roll) → lumbar → thoracic (+twist) → neck/head;
  shoulders and hips hang off the spine; each limb has flexion, abduction, rotation and knee/elbow
  bend. Angle conventions are documented at the top of `skeleton.cjs`.
- **Ground contact.** A planted hand/foot is an IK target (`ik: [x,y,z]` for wrists,
  `foot: {toe|heel: [x,z], pitch}` for feet; a planted foot keeps its world orientation). Because a
  planted target is identical in consecutive keys, it cannot slide. `rootFrom` places the pelvis so a
  chosen point (toes in a plank, elbow in a side plank, knee in half-kneeling) stays fixed while the
  body pivots. `rel` targets are relative to the pelvis (hands on hips). A hand or foot that lifts
  off blends from the IK target to the free (FK) pose in position space, so it never dips through
  the floor. `exact: true` uses the exact IK plane (supports under a twisting trunk).
- **Keys.** Each key inherits the previous key; `same: n` copies key n. `ease` per segment
  (`inOut`, `sine`, `in`, `out`, `linear`, `quadIn`/`quadOut` for flight). `cycles` repeats the
  cycle inside the loop. `travel` moves the body forward each cycle; the camera follows and floor
  marks scroll (bear crawl, inchworm, farmer's carry).
- **Props.** Scene props in world space: mat, box, bench, wall, pull-up bar. Held props follow the
  hands: dumbbells, goblet dumbbell, kettlebell, band (to the hands or the knees), jump rope (drawn
  dashed when imaginary). `hold: true` adds the stopwatch.
- **Camera.** Side view by default; `camera.yaw` / `camera.elev` give front or ¾ views.
- **Reduced motion.** The animated SVG contains a static copy of the key pose (`still` time in the
  spec), shown by its own `@media (prefers-reduced-motion: reduce)` rule. For use in `<img>`, also
  ship `out/still/<id>.svg` and use `<picture>` (see `INTEGRATION.md`) — Playwright's emulation does
  not reach an SVG inside `<img>`, so `<picture>` is the verified path. Real OS-setting behaviour
  inside `<img>` was not tested on devices.

## Correct-form checklists (used to define each motion)

The cues come from the app's own cue/mistake lists plus standard coaching cues. They are stored with
each spec (`form`, `doubts`) and this block is regenerated by the build. Per-exercise doubts are
listed with each exercise.

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

**Mountain climber (`climber`, side view, 2 s; 2 repetitions per loop; mat).**
- Straight-arm plank, hands planted under the shoulders
- Drive one knee toward the chest, then switch legs in a quick, even rhythm
- Hips stay low and level — the bottom does not rise
- Back flat, head in line
- *Doubt / limitation:* Running (switch) version: the driving foot hovers instead of tapping the floor.

**High knees (`knees`, side view, 2.4 s; 3 repetitions per loop).**
- Run in place on the balls of the feet
- Drive each knee up to hip height (thigh about horizontal)
- Trunk tall — do not lean back
- Arms pump with the legs (opposite arm forward)
- *Doubt / limitation:* Fast exercise: 2 steps per 0.8 s cycle; the GIF stores one cycle (2 steps).

**Burpee (`burpee`, side view, 3 s).**
- Squat and place the hands on the floor in front of the feet
- Jump the feet back (hips briefly high) to a straight-arm plank with a straight body
- Jump the feet back in to the squat
- Stand up and jump with the arms overhead, land softly with bent knees
- *Doubt / limitation:* No push-up in this version.
- *Doubt / limitation:* The jump arm swing is the fastest motion in the library (~8 m/s at the hand).

**Jump rope (imaginary) (`skip`, side view, 2 s; 4 repetitions per loop; imaginary rope).**
- Small, quick jumps on the balls of the feet — just high enough for the rope
- Elbows close to the ribs, the wrists turn the (imaginary) rope
- Quiet, soft landings with slightly bent knees
- Body tall, eyes forward
- *Doubt / limitation:* The rope is imaginary in this exercise; it is drawn as a faint dashed line to show the wrist rhythm.

**Butt kicks (`buttkick`, side view, 2.4 s; 2 repetitions per loop).**
- Run in place on the balls of the feet
- Kick the heel up to the buttock; the thigh stays pointing down
- Trunk upright, quick rhythm
- Arms relaxed and swinging lightly
- *Doubt / limitation:* The GIF stores one cycle (2 steps).
- *Doubt / limitation:* The heel flick is the fastest leg motion in the library (shown at a slower jog: one step every 0.6 s).

**Skater jumps (`skater`, elevated front view, 2.8 s; 2 repetitions per loop).**
- Bound sideways from one leg and land on the other
- Land softly on one foot with the knee bent over the toes, hips back, chest forward
- The free leg sweeps behind the landing leg for balance
- Arms swing across like a speed skater
- *Doubt / limitation:* Front view; the forward lean of the trunk is foreshortened.

**Plank (`plank`, side view, 3 s; hold, stopwatch; mat).**
- Forearm plank: elbows directly under the shoulders, forearms forward on the floor, toes tucked
- Body one straight line, pelvis neither high nor low, eyes to the floor
- Hold and keep breathing (slight chest rise); the stopwatch means "hold"

**Side plank (`splank`, elevated front view, 3 s; hold, stopwatch; mat).**
- Lying on one side, elbow directly under the shoulder, forearm on the floor
- Lift the hips so the body is one straight line from head to feet
- Hips do not sag and do not push back
- Feet stacked, top hand on the hip; hold and breathe
- *Doubt / limitation:* Front view: the body is seen face-on, lying across the picture.

**Sit-up (`situp`, side view, 2.8 s; mat).**
- Lying on the back, knees bent, feet flat on the floor
- Arms crossed on the chest — no pulling on the head or neck
- Curl up with control: head and shoulders first, then the trunk, up to sitting
- Lower back down slowly, without throwing the body
- *Doubt / limitation:* Full sit-up to upright; feet are not held, so a teacher may prefer the shorter crunch.

**Bicycle crunch (`bicycle`, elevated ¾ view, 2.4 s; 2 repetitions per loop; mat).**
- Lying on the back, hands lightly behind the head, shoulders off the floor
- Bring one knee in while the opposite elbow turns toward it
- The other leg straightens out low above the floor; then switch, like pedalling
- Lower back stays on the floor; slow and controlled, no pulling on the neck
- *Doubt / limitation:* Elevated ¾ view so the trunk rotation is visible.

**Superman (`superman`, side view, 2.8 s; mat).**
- Lying face down, arms stretched forward, legs straight
- Lift the arms, chest and legs together a few centimetres off the floor
- Hold for a moment at the top
- Neck long — eyes to the floor, no cranking the head up; lower slowly

**Dead bug (`deadbug`, elevated ¾ view, 2.8 s; mat).**
- Lying on the back, arms pointing to the ceiling, hips and knees at 90° (table-top)
- Lower back stays pressed to the floor the whole time
- Slowly lower one arm overhead and the opposite leg toward the floor together, then return
- Switch sides; breathe out as the limbs lower

**Bird dog (`birddog`, side view, 2.8 s; mat).**
- On hands and knees: hands under the shoulders, knees under the hips, back flat
- Reach one arm forward and the opposite leg back at the same time, to body height
- Hips and back stay level and still — no twisting or arching
- Hold briefly, return, then the other side

**Russian twist (`rtwist`, elevated front view, 2.8 s; mat).**
- Seated on a mat, knees bent, heels on the floor (beginner version), trunk leaned back about 40°, back long and straight
- Hands together in front of the chest
- Rotate from the chest (the shoulders turn, the head follows), not only the arms
- Light touch on the floor beside the hip, through the centre to the other side
- *Doubt / limitation:* Seen from the front and above (60°) so the shoulders visibly swing over the hips; the backward lean is foreshortened in this view.
- *Doubt / limitation:* Feet-up variant not shown.

**Hollow hold (`hollow`, side view, 3 s; hold, stopwatch; mat).**
- Lower back pressed into the floor (pelvis tucked)
- Shoulders and legs lifted a little off the floor, arms reaching past the head
- Legs straight and together, toes pointed — the body makes a shallow banana
- Hold and keep breathing quietly
- *Doubt / limitation:* Arms-overhead (harder) version; beginners bend the knees or keep the arms by the sides.

**Cat-cow (`catcow`, side view, 3 s; mat).**
- On hands and knees, hands under the shoulders, knees under the hips
- Cow: breathe in, let the belly sink, chest forward, look slightly up
- Cat: breathe out, round the whole back toward the ceiling, chin toward the chest
- Slow and continuous, the movement starts from the pelvis

**90/90 hip switch (`hip90`, elevated front view, 3 s; mat).**
- Sit tall with both legs bent at 90°: one leg in front, the other out to the side behind
- Lift the knees and rotate both legs to the other side (like windscreen wipers)
- Keep the trunk upright and do not lean on the hands
- Slow and controlled, from the hips
- *Doubt / limitation:* The model's hip rotation is approximate (thighs on the floor use an abduction/flexion combination); the shins lie close to, not exactly on, the floor.

**World's greatest stretch (`worldgreat`, elevated ¾ view, 3 s; mat).**
- Long lunge: front foot flat, back leg long with the heel up
- The hand on the back-leg side is on the floor inside the front foot
- Rotate the chest open and reach the other arm to the ceiling; eyes follow the hand
- Return the hand toward the front instep and repeat slowly
- *Doubt / limitation:* Shown on one side; back knee is off the floor (long version).
- *Doubt / limitation:* Hip flexion here includes the pelvic tilt (the model has one pelvis segment), so its limit is raised to 168° for this deep lunge.

**Thoracic rotation (`thoracic`, elevated ¾ view, 3 s; mat).**
- On hands and knees, one hand lightly behind the head
- Rotate from the upper back: elbow down toward the supporting wrist
- Then open up, elbow toward the ceiling, eyes follow the elbow
- Hips stay still and square; slow and controlled

**Deep squat hold (`deepsquathold`, side view, 3 s; hold, stopwatch).**
- Feet a little wider than the hips, heels stay on the floor
- Sit as low as comfortable between the heels
- Back long (not fully rounded), chest up
- Hands together in front; the elbows push the knees gently outward; breathe and hold
- *Doubt / limitation:* Side view hides the elbows pressing the knees outward.

**Ankle rocks (`anklerock`, side view, 3 s; mat).**
- Half-kneeling: back knee on the floor, front foot flat
- Slowly move the front knee forward over the toes
- The front heel stays down the whole time
- Return and repeat; trunk upright

**Shoulder CARs (`shouldercar`, elevated ¾ view, 3 s).**
- Stand tall, trunk and hips still (a fist clenched helps)
- Draw the biggest slow circle possible with the straight arm: forward, up, out, back and down
- Only the shoulder moves — no leaning or twisting
- Even speed, then repeat (and the other arm)
- *Doubt / limitation:* The model has no shoulder blade; the back part of the circle is approximate.
- *Doubt / limitation:* One arm shown; the other arm rests.

**Goblet squat (`gsquat`, side view, 2.8 s; dumbbell).**
- Hold one dumbbell vertically against the chest
- Feet shoulder width, heels down; sit down between the heels
- Chest up and back straight the whole time — the weight helps you stay upright
- At the bottom the elbows sit inside the knees; drive up to standing
- *Doubt / limitation:* Side view hides the elbows-inside-knees cue.

**Dumbbell row (`dbrow`, side view, 2.4 s; dumbbells).**
- Hinge forward about 45°, knees slightly bent, back flat
- Dumbbells hang under the shoulders
- Pull the elbows back close to the body and squeeze the shoulder blades
- Lower with control; the trunk does not swing
- *Doubt / limitation:* Two-dumbbell bent-over version (no bench support).

**Dumbbell shoulder press (`dbpress`, ¾ view, 2.4 s; dumbbells).**
- Stand tall, core tight, no extra arch in the lower back
- Start with the dumbbells at shoulder height, elbows under the wrists
- Press straight up until the arms are straight overhead
- Lower with control back to shoulder height

**Dumbbell Romanian deadlift (`rdl`, side view, 2.8 s; dumbbells).**
- Knees slightly bent and soft, not locked
- Push the hips back; the back stays flat and the dumbbells slide close along the legs
- Lower to about mid-shin (or until the back would round)
- Drive the hips forward to stand tall

**Lat pull-down (band) (`latpull`, elevated ¾ view, 2.6 s; bar, mat, band).**
- Kneel tall under the anchor, band in both hands, arms up
- Start the pull from the shoulder blades (down and back)
- Bring the elbows down toward the ribs, hands to about chin height
- Trunk upright, no leaning back; return slowly
- *Doubt / limitation:* Kneeling band version under a bar; the machine version is the same movement seated.

**Pull-up (band-assisted) (`pullup`, elevated ¾ view, 2.8 s; bar, band).**
- Hands on the bar about shoulder width, start from straight arms
- Pull the chest toward the bar until the chin is over it
- No swinging or kicking; the band under the knees helps
- Lower with control all the way to straight arms
- *Doubt / limitation:* Band-assisted version; the band is looped from the bar to the knees.
- *Doubt / limitation:* Front ¾ view so the bar reads as a horizontal bar on two uprights.

**Biceps curl (`curl`, side view, 2.4 s; dumbbells).**
- Stand tall, elbows pinned to the sides of the body
- Curl the dumbbells up without swinging the body
- Squeeze at the top
- Lower slowly to straight arms

**Band triceps push-down (`tripush`, side view, 2.4 s; bar, band).**
- Stand facing the anchor, slight forward lean, elbows pinned to the ribs
- Push the hands down until the arms are fully straight
- Only the forearms move — the elbows stay still
- Return with control without letting the band snap back

**Kettlebell swing (`kbswing`, side view, 2.4 s; 2 repetitions per loop; kettlebell).**
- Hinge at the hips (not a squat): hips back, back flat, the bell swings between the thighs
- Snap the hips forward explosively and stand tall
- Arms stay long; the bell floats to about chest height from the hip drive, not from the arms
- Core tight; let the bell fall back into the next hinge

**Farmer's carry (`carry`, side view, 2.4 s; travels forward, camera follows; 2 repetitions per loop; dumbbells).**
- Heavy dumbbell in each hand at the sides, arms long
- Stand tall: shoulders back and down, chest up, no leaning to a side
- Short, steady steps; brace the core
- Walk for distance or time
- *Doubt / limitation:* Walking cycle is simplified (heel strike → flat → toe-off); arms do not swing because of the load.

**Dumbbell bench press (`bench`, elevated ¾ view, 2.4 s; bench, dumbbells).**
- Lie on the bench, feet flat on the floor, shoulder blades pulled together
- Start with the dumbbells above the chest, arms straight
- Lower with control to chest level, elbows about 45–60° from the body
- Press straight back up over the chest; no bouncing

<!-- form:end -->

## Known limitations (all exercises)

- **2D/side views hide some cues:** knee alignment (valgus), hand and foot width are visible only in
  front views.
- **Model simplifications:** one pelvis segment (no separate pelvic tilt), no shoulder blade, hip
  and shoulder rotation approximate; arm IK may drop a small out-of-plane residual (depth only).
- **Variants:** one common variant is shown per exercise (listed in its doubts); teachers may want
  others (alternating legs, knee-down versions, feet-up twist, push-up in the burpee).
- **Speed:** some exercises are compressed into the 2–3 s loop (inchworm) or slowed down (butt kicks).
- **GIF:** 20 fps (exact 5 cs delay). Light background `#eef3f8`; the current app GIFs are dark navy —
  one colour token in `svg.cjs` (`PAL.bg`) if the owner prefers dark.
- GIF bytes depend on Chromium's rasteriser; they repeat on this machine (repeat build, no diff) but
  may differ by a few bytes elsewhere. The SVGs are byte-deterministic everywhere.
