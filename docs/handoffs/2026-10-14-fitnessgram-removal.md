# Handoff 2026-10-14 — Issue #58: remove third-party fitness standards, add optional school reference thresholds

Owner: Claude. Status: implemented on a worktree branch, committed locally, **not pushed, no PR opened**.
GitHub write access was not used; no Issue/board reservation was recorded from this session. The owner
should record the reservation on Issue #58 (files listed below) when reviewing.

## Why
FITNESSGRAM® is a registered trademark of The Cooper Institute; its Healthy Fitness Zone® standards are
stated as copyrighted and not for redistribution. The 20 m shuttle-run method and VO₂max equation
(Léger, Mercier, Gadoury & Lambert, J Sports Sci 6(2):93–101, 1988, PubMed 3184250) are published
academic work and stay.

## What changed
- `hm-data.js` — removed the built-in threshold table and `healthZone`. New pure helpers:
  `REF_KEY` (`"bt.refs"`), `REF_MIN/REF_MAX` (20/70), `REF_EXC` (6.0), `REF_AGE_MIN/MAX` (10/18),
  `REF_BANDS`, `refPairError`, `normRefs`, `refsEmpty`, `refPairFor`, `refZone`. `vo2max` unchanged.
- `hm-app.js` (beep module only, plus one `BK_LABELS` label) — the beep module no longer has its own
  table; it uses `DATA.vo2max`/`DATA.refZone`. The old norms view is now an editor for school reference
  thresholds (per sex, ages 10–18, lower/upper, validation, save, clear with ↩ undo). A note under the
  board always says VO₂max is an estimate (Léger 1988) and whether a category is shown. CSV: the
  category column stays and is empty when no thresholds apply.
- `hm-new.js` — only the zone code: `zoneOf` reads thresholds via the shared helper and returns null when
  none apply; new beep records get `zone:""` without thresholds. **Stored zone strings are never
  rewritten**: "save details" now only fills a zone for a test that has none (previously it recomputed
  every zone). `zoneColor` and the "below" counter recognise both historical and new labels.
- `index.html` (source markup) — norms fold summary, data-tip, `info.beep.w`, `ab.src` Hebrew defaults,
  VO₂max "(estimate)" header, `#bt-estNote` and `#bt-normFold` ids.
- `hm-i18n.js` — `bt.normTable`, `info.beep.w`, `ab.src` rewritten in en/ar/ru/es; new `bt.refs*` keys
  (Hebrew defaults live at the call sites, as for every other key).
- `hm-texts.js` / `hm-terms.js` — FITNESSGRAM/HFZ entries replaced with the new Hebrew source strings
  and 4 translations; the unused norms-view hint entry removed; new band labels and backup label added.
- `hm-know.js` — knowledge entry replaced by a neutral Léger 1988 entry (PubMed link). Its internal id
  stays `fitgram` so lesson plans saved with `cur:"fitgram"` still resolve. Theory-lesson option text
  neutralised.
- `hm-lesson.js` — beep lesson step texts and the assessment line neutralised.
- `hm-tests.js` — beep hint neutralised; the 12-minute run display name changed from "Cooper test" to
  "12-minute run" (test id `cooper` kept: it is the identity of stored results).
- `README.md` — beep feature line.
- Tests: `tests/unit/scoring.test.js` HFZ tests replaced (boundaries, empty default, invalid input,
  sex/age selection, normRefs sanitising, vo2max unchanged). New `tests/e2e/fitref58.e2e.js` (7 checks),
  registered at the end of `tests/e2e/run.js` (one line — run.js registration is otherwise Codex's).
- Generated: `Hamegrash.html`, `sw.js`, index.html `?v=` stamps via `node build-standalone.js`.

## Decisions to review
- **Band labels** are new and neutral, not the old health words: he «הרבה מעל הייחוס / עומד בייחוס /
  מתחת לייחוס / הרבה מתחת לייחוס», en "Well above / Meets / Below / Well below reference". Reason: with
  teacher-entered numbers the app cannot claim "health risk"/"healthy zone". Records saved earlier keep
  their old labels and colours (historical, displayed as stored; "אזור בריא" still translates to
  "Healthy zone").
- Bands: `v ≤ lower` well below · `lower < v < upper` below · `v ≥ upper` meets · `v ≥ upper + 6.0`
  well above. The +6.0 is an app convention carried over from the previous UI, documented in the editor
  as not a published standard.
- Age is rounded and clamped to 10–18 (age 9 uses the 10 row, as before); missing age = 14, missing
  sex = boys (existing defaults).
- Storage: `peultimate.bt.refs` = `{boys:{age:[lo,hi]},girls:{...}}`; clearing stores `null`. Backup
  covers it automatically (the backup takes every prefixed key); a label was added to `BK_LABELS`.
  Restore needs no special handling: `normRefs` drops anything invalid on read.

## Commands and results (this worktree)
- `npm test` → 814 pass, 0 fail.
- `node build-standalone.js` twice → second run produced no diff (`Hamegrash.html` byte-identical,
  `git status` unchanged; re-checked after commit with `git diff --exit-code`).
- `node tests/e2e/some.js fitref58` → 7/7 pass.
- `node tests/e2e/some.js rostersync i18n15 lang30 demolang studentmissing profile teach field20 clean21
  identity8 info14 stage2 shell16 audit29 round3` → 173 pass, 0 fail.
- `node tests/e2e/some.js fitref58 backup backuprestore` → 24 pass.
  (env: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers NODE_PATH=/opt/node22/lib/node_modules`, Chromium headless)
- `grep -rniE "fitnessgram|cooper|healthy fitness|\bHFZ\b" --include=*.js --include=*.html --include=*.md .`
  (excluding .claude/, store-content/, docs/) → no FITNESSGRAM / Healthy Fitness / HFZ / Cooper Institute.
  Remaining "cooper" substrings are the words cooperation/cooperative/cooperación in lesson texts and
  the internal test id `cooper` (data identity, not shown).
- Headless screenshots at 390 px (he/en; board without and with thresholds; editor; validation error)
  reviewed. Full e2e run (`npm run test:e2e`, ~20 min) not run.

## Limitations / next steps
- Not tested on a physical device or in native packaging.
- "Save details" no longer refreshes a stored zone after an age/sex correction (by design: stored zones
  are historical). A teacher who wants a new category must re-run/re-save the test.
- The "students at health risk" counter label (`stu.below`, Codex area) still reads «בסיכון בריאותי»; it
  now counts the historical label and the new lowest band. Renaming that label is left to the
  My Students owner.
- docs/ and store-content/ history files still mention FITNESSGRAM; intentionally untouched.
