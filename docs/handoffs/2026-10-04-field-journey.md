# Field-to-PC integration acceptance — 2026-10-04

Base: draft #34 at 449320c96847935b90a46ca62b90a47d4ddf2ada. Branch codex/field-journey-pilot-2026-10-04. Issue #16 file reservation precedes edits. Main remains 3ce07ed; Claude pending branch remains 4815606. No merge/deploy/store upload.

## Result

Two cross-module journeys use the real built app, one browser and one with the simulated iOS Capacitor bridge. They start a class lesson, mark independent attendance for same-name pupils, save a raw measurement with session/pupil/class IDs, reload the same active lesson and finish without feedback. Then they save a period exemption, preview/apply spreadsheet values and explicitly save new attempts; reload and check best=40, score suggestion=100, zero=measured and exempt=blank using stable pupil/test identities. The out-of-period 999 result is preserved in storage but excluded from period report/history.

Next, the journeys download actual assessment/history and Grades CSV/XLSX, explicitly set final grade 86 with an optional note, preserve the other period/pupil and old measurements, download isolated pupil HTML without private notes/reasons/other-class records, perform full backup/restore and reload all saved data. Native mode reads the actual base64 bytes passed to the Filesystem CACHE export route rather than waiting for an ordinary browser download; the native sharing sheet itself is not exercised. The mirror check waits for the asynchronous saved teacher decision without treating the preceding mirror as corrupted data.

The fixture clock is fixed to October 4, 2026. Seeds run once per context; no test copies fixtures back into storage on reload. Backup restore intentionally uses the app's existing test entry point. UI navigation and save actions use the live controls. After applying the paste, Save is focused and submitted with Enter, exercising the supported desktop keyboard submit. Pointer attempts in the long integration sequence were intermittently unstable as the modal layout changed; this slice does not claim that touch behavior was verified or fixed. The field pilot explicitly retains keyboard/touch checks. No forced click or storage-fixture reset is used.

## Checks

- npm test: 633/633 passed; no new unit/product behavior in this slice.
- Cross-module journeys: 2/2 passed in the final run, browser and simulated iOS; all state assertions checked after real reloads.
- Actual exported workbooks independently opened with openpyxl; Assessment/History/Grades values compared to actual CSV, retaining literal leading-zero IDs. CSV final-grade decimal formatting is normalized numerically (86.0 vs Excel numeric 86). Best=40, suggested score=100, measured zero, blank exemption, four in-period history entries and teacher final=86/calculated=56 verified for web and simulated native exports.
- node build-standalone.js: generated product outputs unchanged from #34. git diff --check passed.
- #34 exact-head Tests 171 (37192259851) and Native 19 (37192259881) completed successfully. New PR exact-head full CI pending publication.

## Coordination and pilot

Current delivery map in ACTION_PLAN_2026-10-03.md replaces stale next-task assumptions with draft #25–#34 status and review order. FIELD_PILOT_2026-10-04.md adds concrete short checks for period policy, paste/zero/exemption, actual Excel/CSV, teacher decisions, pupil isolation and recovery; a blank lesson evidence table and separate physical device checks remain for the owner.

Codex owns cross-module checks/evidence review. Claude owns builder timing/equipment #19, native packaging #13, content preparation #21 and transfer design #22. Claude must not reapply the old rollback hunk over #34. Owner retargets/reviews/merges sequentially and performs physical Apple/real lessons. Content import #24 remains held; no new feature expansion, account/server/payment work. A new Claude review is unavailable in this session.
