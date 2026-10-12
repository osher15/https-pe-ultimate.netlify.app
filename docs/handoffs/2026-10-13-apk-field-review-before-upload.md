# PE Ultimate — Android APK field-use review before upload

Date: 2026-10-13  
Reviewer: ChatGPT / Codex review pass  
Evidence type: owner-provided physical Android APK screen recording (~5:05) + current GitHub state review  
Scope: review only. No merge, deploy, store upload, or `main` changes are authorized by this document.

## Executive summary

The Android APK appears stable and usable in the owner’s real-device recording. Core navigation, lesson flow, class/student areas, assessment screens, language switching, and Photo Finish all opened and responded without an observed crash or hard blocker. The product now feels substantially closer to a real field app than a web prototype.

The remaining work before upload is mostly **field-friction reduction**, not foundational reconstruction. The most important usability concern is still **Photo Finish**, where too many controls and concepts compete on one phone screen. Several other screens also carry many chips, actions, cards, and persistent navigation elements at once. The app is functional, but some workflows still ask the teacher to visually parse more than is ideal during a lesson.

The standalone **Coach Board** and **Scoreboard** are not missing because of an APK bug. They are still staged on separate Codex branches for review and have not been integrated into the main product navigation. Do not add them as two more permanent bottom-navigation items. If integrated, they should enter through one compact **Tools / Coaching Tools** area.

## Evidence reviewed

### Physical Android APK recording

The supplied recording is approximately 5 minutes long and shows real interaction with the installed Android APK. Observed areas include:

- Home / today flow and lesson cards.
- Lesson preparation and content browsing.
- Live lesson / session controls.
- Photo Finish.
- Class / student areas.
- Assessment / score entry.
- Attendance / participation-related screens.
- Language / entry screen behavior.

This is useful **physical-device evidence**, but it is not a complete release certification. The recording does not prove every edge case, persistence path, camera condition, denied permission path, offline first-open state, APK upgrade preservation, or every supported language.

## What worked well in the recording

### 1. General APK stability — GOOD

No visible crash, forced reload, broken route, white screen, or unrecoverable state was observed during the recorded flow. Transitions between major areas were responsive enough for normal field use.

**Keep:**
- Current native packaging approach.
- Current bottom navigation structure unless a strong reason requires change.
- English-first product direction for new installs while preserving five-language support.

### 2. Home / Today experience — GOOD, with density caveat

The app gives a teacher a clear path into the current work. Lesson information and the large central start affordance are recognizable and practical.

**Strength:** the teacher can understand what to do next without navigating through a desktop-style menu tree.

**Caveat:** secondary chips and controls above content can become visually busy, especially when several filters/actions are present simultaneously.

### 3. Lesson preparation — GOOD

The preparation screens show useful structure and appear operational on the phone. Content cards, lesson information, and action controls are readable.

**Keep:** manual teacher control and the ability to continue without forcing an automatic recommendation.

### 4. Class and student management — GOOD

The class/student workflow is already useful enough for pilot use. The recording shows working navigation and practical teacher-facing controls rather than a demo-only shell.

### 5. Assessment / score entry — GOOD, but can be faster

The assessment entry screen is functional and the plus/minus controls are understandable.

**Opportunity:** repeated score entry should be optimized around one-handed, rapid use. The teacher should not need to repeatedly re-read labels or move attention between distant controls.

### 6. Language switching / multilingual shell — GOOD

The recording confirms that language-related UI exists in the native APK and that the app can present a localized interface. Continue checking long strings and RTL/LTR transitions on narrow devices.

## Main UX problems still visible

## P1 — Photo Finish is still too dense for live field use

Photo Finish remains the clearest area where functionality is ahead of usability.

In the recording, one phone screen can expose several concepts at once:

- Large race time.
- Simulation / camera mode.
- Start gun.
- Reset.
- Manual-stop status.
- Lane / competitor setup.
- Paste list.
- Edit names.
- Strong numbers / numbering action.
- Lane count.
- Slider / finish-position interaction.
- Per-lane result cards.
- Instructional text.
- Persistent app bottom navigation.

All of these can be individually valid, but together they create excessive cognitive load for a PE teacher standing next to a tripod and trying to run a race.

### Recommended Photo Finish restructuring

Use a **3-stage task flow** rather than one long control surface:

1. **Setup**
   - Select class / competitors.
   - Number of lanes.
   - Names / lane assignments.
   - Camera readiness and permission state.
   - One clear `Ready` action.

2. **Race**
   - Large timer.
   - One dominant `Start` action before the race.
   - After start, replace it with the minimum necessary race-state controls.
   - Avoid showing editing/setup tools while timing is active.
   - Make manual fallback obvious but secondary.

3. **Results**
   - Freeze finish result.
   - Show lane order and times.
   - Allow quick correction / reassignment.
   - `Save to class` or `Finish` as the dominant next step.

### Additional Photo Finish recommendations

- Hide or collapse explanatory text during the active race.
- Do not show both setup editing and race operation controls at full prominence simultaneously.
- Use one strong visual state indicator: `SETUP`, `READY`, `RUNNING`, `RESULTS`.
- Make tripod usage the design baseline, not an edge case.
- Add a short pre-race camera check: framing, finish-line position, camera permission, orientation.
- Ensure accidental scrolling cannot move critical controls away during a running race.
- Consider temporarily hiding the global bottom navigation while the race is active.
- Do not rely on precise manual slider interaction as the primary field workflow.
- After a race, provide a simple `Run again with same lanes` action.
- Preserve a fast manual mode, but clearly label it as fallback/manual timing rather than mixing it with camera workflow.

### Photo Finish acceptance target before store upload

A teacher with the phone on a tripod should be able to:

`Choose class → assign lanes → ready camera → start race → confirm finish → save results → repeat`

without scrolling through unrelated controls during the actual race and without needing to understand every advanced option.

## P1 — Navigation and top-control density

Several screens use multiple chips, segmented controls, utility buttons, and persistent top/bottom navigation simultaneously. Nothing appears broken, but visual priority is not always obvious.

### Recommendation

For each major screen, define exactly:

- **One primary action**.
- Up to **two immediately visible secondary actions**.
- Everything else under `More`, an expandable section, or the next task stage.

Do not solve density by simply shrinking fonts or buttons. Field use benefits from fewer visible choices, not smaller choices.

## P1 — Coach Board and Scoreboard are prepared but not integrated

Current GitHub state shows the boards on dedicated standalone branches rather than in `main`:

- `codex/standalone-boards-2026-10-10`
- `codex/boards-hardening-2026-10-11`

The first staged the standalone Scoreboard and Coach Board for Claude review. The hardening branch later added five-language and narrow-layout work and intentionally used `[skip netlify]`.

Therefore, their absence from the APK is expected and is **not** a packaging defect.

### Integration recommendation

Do **not** add two new permanent bottom-navigation tabs.

Preferred structure:

**Tools / Coaching Tools**
- Coach Board
- Scoreboard
- Photo Finish
- Future timer / interval tools if approved later

The Tools entry can be a compact card or one navigation destination. Each tool should then run in a focused near-full-screen mode.

### Coach Board integration notes

- Open in focused/full-screen mode by default on phones.
- Preserve sport selection, full/half court, player count, drawing, movement arrows, and five-language support.
- Avoid loading all editor panels at once on a narrow phone.
- Tablet/desktop can expose more controls because that is a realistic coaching-board use case.

### Scoreboard integration notes

Separate two use cases:

**Quick Score**
- Team A / Team B.
- Large +/- score controls.
- Reset / undo.
- Optional simple clock.

**Match Mode**
- Period / half / quarter logic.
- Match clock.
- Sport-specific settings.
- More detailed controls.

A PE teacher running a short class game should not have to configure a full professional match interface.

## P2 — Assessment entry can be optimized for repeated use

The score-entry controls work, but rapid assessment should minimize attention switching.

Recommended improvements:

- Keep the current pupil clearly highlighted.
- Make next/previous pupil movement extremely obvious.
- Support fast numeric entry without opening unnecessary dialogs.
- Keep quick mode as the default; detailed assessment remains optional.
- After saving a value, move predictably to the next pupil only when the teacher explicitly enables that behavior.

## P2 — Persistent bottom navigation during focused tasks

The bottom navigation is useful for normal app movement, but in focused operational tools it can consume space and increase accidental exits.

Consider hiding or reducing it during:

- Active Photo Finish race.
- Coach Board full-screen mode.
- Scoreboard match mode.

Always provide a clear `Exit` / back action rather than trapping the user.

## P2 — Mobile information hierarchy

The app has many useful features now. The risk is no longer “not enough functionality”; it is **feature visibility competing with task speed**.

For phone layouts, prioritize:

1. What the teacher must do **now**.
2. Current class / current lesson context.
3. One next action.
4. Advanced configuration only when requested.

This aligns with the project’s existing field-use principle: minimal phone friction during the lesson.

## What I would NOT change before upload

Unless a real blocker appears, avoid a broad redesign before the release candidate.

Do not:

- Replace the current architecture.
- Rebuild navigation from scratch.
- Add an account requirement.
- Add server/cloud dependencies.
- Add more permanent bottom tabs for every tool.
- Rework stable class/student identity.
- Replace teacher-entered data automatically.
- Turn optional guidance into mandatory steps.

The APK is already functional enough that large pre-release structural changes would create more regression risk than value.

## Suggested pre-upload priority order

### P0 — Release blockers only

- Any crash, data loss, failed save/restore, broken APK upgrade, camera permission dead end, or offline core failure discovered in testing.
- Any severe clipping that makes a required action unreachable.

No P0 blocker was visible in the supplied recording, but this recording alone cannot certify those paths.

### P1 — Strongly recommended before public upload

1. Simplify Photo Finish into clear operational stages.
2. Reduce visible controls during an active race.
3. Verify tripod workflow on the owner’s actual device.
4. Review top-chip/control density on the busiest phone screens.
5. Decide whether Tools integration is part of this release or the immediate next release.
6. If boards are integrated now, do it through one Tools entry, not two new bottom tabs.

### P2 — Can follow immediately after the release candidate if risk is high

- Further assessment-entry speed refinements.
- More compact secondary controls.
- Tablet-specific Coach Board improvements.
- Advanced Scoreboard match presets.

## Required physical checks before upload

Use the actual Android device; do not substitute browser emulation for these checks.

- Open app from a cold start.
- Start with internet unavailable and confirm offline core.
- Create/edit real class data, close app, reopen, verify persistence.
- Install an updated APK **over** the current APK without uninstalling; verify data remains.
- Camera allowed path.
- Camera denied path and recovery.
- Rotate portrait/landscape on Photo Finish and other critical screens.
- Run Photo Finish on tripod with real runners crossing the line.
- Use back gesture/button during a focused workflow and confirm no accidental data loss.
- Export / backup / restore one real test dataset.
- Check Hebrew and Arabic RTL plus English default after a genuinely fresh install state.
- Check one narrow phone and, if available, one tablet.

## Claude action request

Claude should review this report against current `main` and the two standalone board branches.

Requested next step:

1. Do **not** merge or deploy automatically.
2. Confirm whether any Photo Finish simplification is already implemented after the APK build shown in the recording.
3. Propose the smallest safe P1 patch for Photo Finish field friction.
4. Review whether Coach Board + Scoreboard should enter this release or be queued immediately after the release candidate.
5. If integration is recommended, use one `Tools / Coaching Tools` entry and focused full-screen tool modes.
6. Preserve offline-first behavior, five languages, stable data, manual teacher control, and current native packaging.
7. Run relevant automated checks and keep physical-device evidence explicitly separate from automated evidence.
8. Write a new handoff with exact files changed, tests run, remaining limitations, and owner-only acceptance steps.

## Release assessment from this recording

**Current state:** suitable for continued real-device pilot and close to a release candidate.  
**Main remaining UX risk:** Photo Finish operational complexity on a phone.  
**Main product-structure decision:** how and when to integrate Coach Board + Scoreboard without making navigation heavier.  
**Observed blocker in recording:** none.  
**Store readiness certification:** not claimed from this recording alone.
