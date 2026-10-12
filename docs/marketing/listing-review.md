# Store listing review (task G1) — Gemini first pass, merged by Claude 2026-10-12

The corrected texts are in `docs/store-listing/STORE_LISTING_2026-10-05.md` (name, short and full description for all five languages). This file records the measured limits and what changed. Gemini sent the five full descriptions and only fragments of its change list, so the change list below is reconstructed from the differences between the old draft and the new text.

## Measured limits (Google Play: name 30, short 80, full 4000)
| Language | Name | Short | Full | Limits |
|---|---|---|---|---|
| English (default) (`en`) | 15 | 78 | 1483 | OK |
| עברית (`he`) | 15 | 61 | 1043 | OK |
| العربية (`ar`) | 15 | 64 | 1182 | OK |
| Русский (`ru`) | 15 | 66 | 1502 | OK |
| Español (`es`) | 15 | 79 | 1521 | OK |

Counts were measured with a script on 2026-10-12 (characters including spaces).

## Changes, all languages
1. **Audience widened** from "PE teachers" to "PE teachers, fitness trainers and sports coaches" (owner decision 2026-10-12: adults 18+). Short descriptions say "teachers and coaches".
2. **Accuracy claim removed** from photo-finish: "down to the millisecond" -> "a practical field tool, not certified timing" (no accuracy study exists).
3. **Test count 30 -> 31** (35 tests in `hm-tests.js`, "35 fitness tests" in the app).
4. **Lesson plans marked as drafts** ("manual step-by-step builder with draft lesson plans").
5. **Features added that exist in the app:** live lesson timer, timetable, attendance, manual grade override, games library.
6. **Hyphen/format fixes:** citation markers `[span_N](start_span)...` that Gemini attached to every sentence were stripped.
7. **Short descriptions** were written by Claude (Gemini did not return them) and fit the 80-character limit.

## Needs a human decision or native speaker
- Arabic, Russian, Spanish: first pass, `[NATIVE REVIEW]` (the Spanish and Arabic change notes Gemini attached mark them).
- **Norms wording (decided 2026-10-12):** kept, but the listing now says "reference norms for guidance, adjustable" and no longer uses the FITNESSGRAM name (registered trademark of The Cooper Institute). The in-app About screen keeps the attribution and states non-affiliation.
- **"cited knowledge base":** every language says it; verify it is true before submission.
- **VO₂max** is described as an estimate for education (kept).
