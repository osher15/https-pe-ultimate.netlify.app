# Home and tournament mockup review — 2026-10-09

Scope: review the supplied `pe_ultimate.html` and `tournamentliveboard (1).html` as design proposals. No product changes, integration, deployment, or edits to the supplied originals. Both are standalone React examples; the real application uses vanilla JavaScript. Keep the real application's storage, identity, offline support, five languages, and teacher grades.

This supplements `docs/handoffs/2026-10-09-report-review-claude-action-plan.md` on `codex/report-action-plan-2026-10-09`. Do not repeat its report review or create duplicate tasks: home is #51; the optional tournament pilot is #52. Reliability and storage work remain ahead of either redesign.

## Observed behavior

Local Chromium inspection used fresh browser contexts, blocked external requests, and synthetic prototype data. Screenshots were inspected at 390 px; layout widths were measured at 320, 390, 820, and 1180 px. These are browser observations, not physical-device acceptance.

| Proposal | Confirmed behavior | Integration implication |
|---|---|---|
| Home | Three large action cards with strong visual hierarchy | Borrow hierarchy and large controls; connect to real application actions |
| Home | Hardcoded teacher, school, class, student count, lessons, and records | Derive from existing context; no demo facts in production |
| Home | Clicking the lesson produces an animation; settings includes a coming-soon response | Replace with existing navigation and useful feedback |
| Home | No measured horizontal overflow at tested widths | Does not prove no clipping: overflow is hidden; inspect translated text and real data |
| Both | Developer instructions are visible in the page | Remove from the teacher-facing flow |
| Tournament | 320 px viewport has 381 px document width | Fix 61 px horizontal overflow before a narrow-phone pilot |
| Tournament | Score starts 12–9; teams/classes and standings are hardcoded | Use explicit selected class and stable group snapshots |
| Tournament | End → Continue → End → Continue counts the same match twice | Require a persistent match ID and idempotent finalization |
| Tournament | Tigers standings progress games 2→3→4, points 4→6→8, difference 15→18→21 | Confirmed duplicate result, not just a visual concern |
| Tournament | Refresh resets standings to games 2 / points 4 / difference 15 | No persistence; the success message says “saved” despite that |
| Tournament | Table changes at finalization, not each scoring action | Align labels with behavior; do not promise live differential updates |
| Tournament | Fixed 5-minute timer decrements once per interval tick | Define background/resume behavior; use a deadline if elapsed time is intended |
| Tournament | +1 scoring, capped team fouls, no score undo | Define sport/scoring rules explicitly; add corrections before claiming a usable pilot |
| Tournament | Public panel displays named injury/exemption details and assigns referees automatically | Keep teacher notes private; make roles explicit and editable |

## Home integration boundary (#51)

Keep the existing current/next-lesson calculation and `focusCard` rendering in `hm-app.js`. Preserve preparation, the rest of today's schedule, and navigation. Use the existing `data-go` / `HM.go` paths to lesson, games, records, measurement and tools; check the actual destination names before wiring. The prototype's explanation of IndexedDB is not an implementation or a storage specification.

Do not import the compiled React/Tailwind bundle, create parallel navigation state, introduce a second storage layer, or overwrite `sid`/`cid`. Any welcome text must handle a missing name and all five languages. Keep English defaults. Validate long names, empty timetable, no current lesson, portrait/landscape, keyboard focus and touch targets. Outdoor contrast needs a real device check; the mockup's “100% sun readable” footer is not evidence.

## Tournament pilot boundary (#52)

Default to entering final scores after a match so the teacher can teach. Live scorekeeping may be an optional mode operated by another person. Start with four teams only after the reliability pilot, using existing group selection and a frozen group snapshot for each match.

Before implementation, specify: match identity; class identity; team IDs; schedule/pairings; scoring and draw rules; finalization; correction/undo; persistence and backup; restart recovery; deliberate reset. A duplicate finalization must not add another result. Correcting a completed score must replace its standings contribution. On reload, the saved state must be restored or the UI must accurately say it is unsaved. Do not infer player identity from a displayed name or move grades automatically.

Acceptance examples: finalize 12–9 twice and get one result; correct to 9–12 and recalculate once; refresh offline and retain the completed match; cancel an unfinished match without standings changes; switch class without contaminating results; restore a backup without duplicates. No injury diagnosis or teacher-only participation notes on the public scoreboard.

These are implementation requirements for the existing issue, not implemented features. No new cloud service, package key, or store submission is required for this review.
