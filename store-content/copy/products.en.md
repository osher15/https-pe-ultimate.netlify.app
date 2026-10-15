> **Draft for owner and lawyer review.** Version 0.1 · 2026-10-16 · Task C22 (G4/T3). Not approved for publication.
> Every `{{PLACEHOLDER}}` is an owner decision or a value that is not known yet. Prices marked "tentative" come from
> `docs/handoffs/2026-10-14-chatgpt-store-content-prompt.md` and `store-content/reports/product-readiness.md` and are
> not final. Counts were recounted from the manifest on `origin/codex/g1-notion-export-pilot-20261014`
> (see `docs/handoffs/2026-10-16-c22-store-copy.md`).

# {{STORE_NAME}} — product pages (English)

## Notes for whoever builds the pages (do not publish this block)

- Show on every product page, under the buy box: the price line and licence choice from
  `store-content/legal/checkout-copy.en.md`, the translation statement (block T below) and the safety line
  (block S below).
- Licences: **Single-Teacher** and **School**. The tentative prices below are the single-teacher level unless a
  School price is given: `{{PRICE_SCHOOL_*}}`. Final prices: `{{PRICE_*}}`.
- Do not add reviews, user counts, urgency timers, "limited offer" or "only N left" claims. None of that exists.
- Do not describe any product as tested on a phone or tablet. Device status lives only in the support articles.
- Branding of the tool screens (the boards still carry an older product name in their title bar) is an owner
  decision: `{{TOOL_BRANDING_DECISION}}`.

**Block T — translations (owner's wording, must be shown as written):**
> Translations were produced with AI. The professional content is accurate and was reviewed by several teachers and
> checked against Ministry of Education curricula from all angles; small proofreading, syntax or terminology errors
> are possible.

**Block S — responsibility line (owner's wording):**
> All content, drills, games, lesson plans and fitness tests are recommendations only. The teacher or user decides
> whether and how to use them and must adapt every activity — including fitness tests such as the 20 m shuttle
> run — to the pupils' age, health and ability and to the environment.

---

## At a glance (catalog table)

| Product | Tentative price (ILS) | Status line for the catalog |
|---|---|---|
| Coach Board | 39 — `{{PRICE_COACH_BOARD}}` | `{{AVAILABILITY_COACH_BOARD}}` |
| Scoreboard | 29 — `{{PRICE_SCOREBOARD}}` | `{{AVAILABILITY_SCOREBOARD}}` |
| 20 m Shuttle Run (Beep Test) | 19 — `{{PRICE_SHUTTLE_RUN}}` | `{{AVAILABILITY_SHUTTLE_RUN}}` |
| Interval Trainer | 59 — `{{PRICE_INTERVAL_TRAINER}}` | `{{AVAILABILITY_INTERVAL_TRAINER}}` |
| Lesson Pack, one sport (6 sports) | 49 each — `{{PRICE_LESSON_PACK}}` | `{{AVAILABILITY_LESSON_PACKS}}` |
| Drill, Game & Activity Pack | 39 — `{{PRICE_ACTIVITY_PACK}}` | `{{AVAILABILITY_ACTIVITY_PACK}}` |
| Complete Bundle — **after owner approval** | 149 — `{{PRICE_BUNDLE}}` | `{{AVAILABILITY_BUNDLE}}` |

School licence prices for each product: `{{PRICE_SCHOOL_*}}`.

---

## 1. Coach Board

**Value line:** Plan, draw and play back a tactic on a court in a minute, then show it to the whole group on a screen.

**What is included**
- One HTML file (about 105 KB). Open it in a browser; no installation, no account.
- Four sports: football, basketball, volleyball and handball. Full court or half court, landscape or portrait.
- Editable teams: set the number of players per side (up to 22), edit numbers and roles, add balls.
- Draw movement, pass and dribble routes, build phases, and play the sequence back.
- Undo and redo.
- 12 ready-made demonstrations to start from.
- Save and load your boards as JSON files; export the court as a PNG picture.

**Who it is for:** PE teachers and coaches who explain positions and movement on a board or projector.

**Languages:** Hebrew, English, Arabic, Russian, Spanish (right-to-left layout for Hebrew and Arabic). English is
the default.

**Format:** a single self-contained HTML file. It runs offline once downloaded.

**System requirements:** a current web browser on a computer, tablet or phone (`{{SUPPORTED_BROWSERS}}`). A
projector or large screen is optional.

**Price:** tentative ₪39 (`{{PRICE_COACH_BOARD}}`). School licence: `{{PRICE_SCHOOL_COACH_BOARD}}`.

**Good to know:** the court drawings and demonstrations are schematic examples, not to scale. Adapt them to your
group. Boards are saved in the browser you use; save a JSON copy to keep or move them.

---

## 2. Scoreboard

**Value line:** A clear, big-screen scoreboard for school games: score, fouls, clock and timeouts on one page.

**What is included**
- One HTML file (about 74 KB). Open it in a browser; no installation, no account.
- Basketball, football and handball presets, plus a custom setup. Halves or quarters, with the length you choose.
  The presets are editable examples, not official competition rules.
- Score entry and correction, team fouls, timeouts, overtime and an undo for score changes.
- A presentation mode for a projector or large screen, with an optional sound.
- The last 20 finished results are kept on the device; export a result as a JSON file.

**Who it is for:** PE teachers and referees of school games, tournaments and lessons.

**Languages:** Hebrew, English, Arabic, Russian, Spanish (right-to-left for Hebrew and Arabic). English is the default.

**Format:** a single self-contained HTML file. It runs offline once downloaded.

**System requirements:** a current web browser (`{{SUPPORTED_BROWSERS}}`). A large screen is optional.

**Price:** tentative ₪29 (`{{PRICE_SCOREBOARD}}`). School licence: `{{PRICE_SCHOOL_SCOREBOARD}}`.

**Known limits (current build):**
- Results can be exported as JSON; there is no import and no print layout.
- After you reload the page, automatic saving can stop for that session. Export the result before you close the
  tab. `{{SCOREBOARD_AUTOSAVE_FIX_STATUS}}` (the fix is written and tested but not yet applied to the file; replace
  this line with nothing once it ships, or sell only after it is applied).

---

## 3. 20 m Shuttle Run (Beep Test)

**Value line:** Run a 20 m multistage shuttle-run test with steady synthesized beeps and a live board — and use the
gentler adapted 15 m course for younger pupils or pupils with disabilities.

**What is included**
- One HTML file (about 124 KB). Open it in a browser; no installation, no account, no audio files to download.
- The 20 m multistage protocol described by Léger et al. (1988): level 1 at 8.5 km/h, plus 0.5 km/h at each level,
  levels of about one minute, up to 18.0 km/h. You can change the shuttle length and the starting speed; a badge
  tells you when the protocol is modified.
- The **adapted 15 m course**, so younger pupils or pupils with disabilities can complete the test at a good level
  and have an experience of success. Results are not comparable with the 20 m course and no VO₂max estimate is
  given for 15 m.
- Live display: level, shuttle, time, speed and distance, a progress bar to the next beep, and an optional start
  delay of 0, 3, 5 or 10 seconds.
- Beep cues: a shuttle beep, a triple beep at each new level, a warning pip before the level changes, and a start
  tone. Optional spoken announcements using your device's own voices.
- Runners are optional: type names or bib numbers, or use numbered lanes (2–20), and tap a runner when they stop.
  Edit, sort, undo and export the results as a CSV file.
- A VO₂max **estimate** for the 20 m course from the equation in the paper, labelled "estimate, not a medical test".
- A "gym display" that shows only the big board, for the whole class to see.
- No reference thresholds are built in. If you want some, you can enter up to six of your own.

**Who it is for:** PE teachers who run a shuttle-run (beep) test with a class, and want a clean, offline timer.

**Languages:** English (default), Hebrew, Arabic, Russian, Spanish (right-to-left for Hebrew and Arabic).

**Format:** a single self-contained HTML file. It runs offline once downloaded.

**System requirements:** a current web browser (`{{SUPPORTED_BROWSERS}}`) and a speaker loud enough for your space.
Sound starts after you tap Start, because browsers only allow sound after a tap.

**Price:** tentative ₪19 (`{{PRICE_SHUTTLE_RUN}}`). School licence: `{{PRICE_SCHOOL_SHUTTLE_RUN}}`.

**Method and honesty line:** follows the protocol in Léger LA, Mercier D, Gadoury C, Lambert J. *J Sports Sci*.
1988;6(2):93–101. This is an independent tool. It is not an official or endorsed test product, and the VO₂max value
is an estimate, not a medical test. This is a maximal-effort test: adapt it to your pupils (see the safety line).

---

## 4. Interval Trainer

**Value line:** Interval timers, class circuits and 47 animated cartoon exercise demonstrations in one offline file.

**What is included**
- One HTML file (about 1.8 MB) with everything inside, including all 47 animated demonstrations. No internet, no
  account, no pupil data.
- **Interval timer** with five presets: Tabata 8×20/10 s, Class HIIT 10×30/15 s, EMOM 10 (10×45/15 s),
  Strength (3 sets of 6 rounds, 40 s work / 20 s rest, with 60 s between sets) and Quick 6×15/10 s. Change the values and see the total time.
  Pause, resume and skip.
- **Class stations:** draw 2–12 bodyweight stations by focus (mix, strength, aerobic, core, mobility). The tool
  runs the work and changeover times and shows the current station with its animation.
- **Exercise library:** 47 exercises, each with a looping animated cartoon figure (a drawn figure, not a real
  person), muscles, equipment, form cues, common mistakes, and easy / intermediate / advanced volumes. Filter by
  group.
- **Fitness dice:** a random bodyweight exercise and amount.
- Beeps and a horn; optional voice using your device's voices; the screen is kept awake where the browser allows it;
  a full-screen "gym display" with a very large timer. Devices set to "reduce motion" show still pictures instead
  of the animations.

**Who it is for:** PE teachers who run circuits, warm-ups and conditioning with a class and want timers and clear
exercise demonstrations without apps or accounts.

**Languages:** English (default), Hebrew, Arabic, Russian, Spanish (right-to-left for Hebrew and Arabic).

**Format:** a single self-contained HTML file. It runs offline once downloaded.

**System requirements:** a current web browser (`{{SUPPORTED_BROWSERS}}`). Sound and a large screen are optional.

**Price:** tentative ₪59 (`{{PRICE_INTERVAL_TRAINER}}`). School licence: `{{PRICE_SCHOOL_INTERVAL_TRAINER}}`.

**Good to know:** it is a timing and demonstration tool, not a test and not a training programme. Choose exercises
and levels that suit your pupils (see the safety line).

---

## 5. Lesson Packs — six sports (Basketball, Football, Handball, Volleyball, Athletics, Fitness)

**Value line:** Ten ready-to-teach lessons for one sport, in five languages, with diagrams that show how to set up
and run the key parts. You choose the sport; you adapt every lesson to your group.

**What is included (each pack)**
- **10 lessons** for the sport, in **5 languages** (Hebrew, English, Arabic, Russian, Spanish): 50 lesson documents
  per pack. Across the six packs: 6 sports × 10 lessons × 5 languages = 300 lesson documents.
- Diagrams that show lanes, groups, cones and movement patterns where the set-up is not obvious from the text:
  `{{DIAGRAMS_PER_PACK}}` diagrams in this pack. *(Do not publish a number until the diagram batch for this sport
  is finished and counted.)*
- Each lesson is a full plan that you can use as written or adapt.

**The six packs:** Basketball · Football · Handball · Volleyball · Athletics · Fitness. Sold separately at a
tentative ₪49 each (`{{PRICE_LESSON_PACK}}`); the bundle may include all six (`{{BUNDLE_CONTENTS}}`).

**Who it is for:** PE teachers who want a clear sequence of lessons for a sport, and teachers who teach in more than
one language group.

**Languages:** Hebrew, English, Arabic, Russian, Spanish.

**Format:** `{{LESSON_PACK_FORMAT}}` (planned: print-ready documents with the diagrams placed beside the steps they
illustrate). Lesson packs are documents; they store nothing on your device.

**System requirements:** a PDF or HTML viewer (`{{LESSON_PACK_VIEWER}}`), and a printer if you want paper copies.

**Price:** tentative ₪49 per sport (`{{PRICE_LESSON_PACK}}`). School licence: `{{PRICE_SCHOOL_LESSON_PACK}}`.

**Good to know:** the lessons are recommendations for qualified teachers. You know your pupils, space and equipment:
choose and adapt each activity and supervise it.

*Availability gate (do not publish this line):* the packs cannot go on sale until the pack build, the diagrams and
an English teacher read-through are done — see `store-content/reports/product-readiness.md` §6.

---

## 6. Drill, Game & Activity Pack

**Value line:** 120 drills, games and activities for PE lessons, in five languages — a library to dip into whenever
you need a warm-up, a skill drill or a game.

**What is included**
- **120 items:** 80 drills, 24 games and 16 activities.
- Each item in **5 languages** (Hebrew, English, Arabic, Russian, Spanish): 600 documents in total.
- Items are kept separate by type (drill, game, activity); they are not tied to a particular lesson.

**Who it is for:** PE teachers and class teachers who want ready ideas for warm-ups, skill practice and games, for
any sport.

**Languages:** Hebrew, English, Arabic, Russian, Spanish.

**Format:** `{{ACTIVITY_PACK_FORMAT}}` (documents; they store nothing on your device).

**System requirements:** a PDF or HTML viewer (`{{ACTIVITY_PACK_VIEWER}}`), and a printer for paper copies.

**Price:** tentative ₪39 (`{{PRICE_ACTIVITY_PACK}}`). School licence: `{{PRICE_SCHOOL_ACTIVITY_PACK}}`.

**Good to know:** the pack has no diagrams unless the page says so (`{{ACTIVITY_PACK_DIAGRAMS}}`). Recommendations for
qualified teachers; adapt every activity to your pupils.

*Availability gate (do not publish this line):* the activity bank is not yet built into a pack and has had no
teacher read-through of the English text; see readiness report §6.

---

## 7. Complete Bundle — after owner approval

**Value line:** Everything in one purchase, at a lower price than buying each product separately.

**Status:** **Not for sale until the owner approves it** (`{{AVAILABILITY_BUNDLE}}`). Do not show a buy button before
that.

**What is included:** `{{BUNDLE_CONTENTS}}` — proposed: Coach Board, Scoreboard, 20 m Shuttle Run (Beep Test),
Interval Trainer, the six Lesson Packs and the Drill, Game & Activity Pack.

**Who it is for:** a PE teacher or a school PE department that wants the whole set.

**Languages, format, requirements:** as for each product above.

**Price:** tentative ₪149 (`{{PRICE_BUNDLE}}`), School licence `{{PRICE_SCHOOL_BUNDLE}}`. State the saving only after
the final prices exist: `{{BUNDLE_SAVING}}`.

**Good to know:** a bundle contains only products that are themselves ready. If one product is delayed, either the
bundle waits or its contents change (`{{BUNDLE_POLICY_IF_ITEM_DELAYED}}`). If one file in a bundle is faulty, the
refund policy gives a fix first and then a proportional partial refund for the affected item.

---

## Licences and terms (short, for every product page)

**Single-Teacher licence.** For one named teacher, with your own classes and pupils, on your own devices, wherever
you teach. You may print it or show it on a screen for your pupils, and adapt it for your own lessons. The licence
is personal: colleagues need their own licence (extra licences for colleagues are `{{EXTRA_LICENCE_DISCOUNT}}` off),
and you may not resell the files or upload them to a public site or a shared drive. A substitute covering your
classes may use the materials for those classes only. Updates and corrections to this version are free.

**School licence.** For one school at one campus. All PE staff employed at that campus, including substitutes, may
use this product for the school's pupils and keep it on an internal drive that only they can access. Each further
campus needs its own licence. It may not be shared with other schools, resold, or uploaded to a public site or a
drive that people outside the school can open.

Full terms: `{{TERMS_URL}}` · Refund policy: `{{REFUND_POLICY_URL}}` · Safety: `{{SAFETY_URL}}` · Contact:
`{{CONTACT_EMAIL}}`.
