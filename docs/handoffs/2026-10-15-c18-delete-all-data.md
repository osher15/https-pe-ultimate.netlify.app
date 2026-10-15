# Task handoff
Date: 2026-10-15
Owner: Claude
Base commit: 4f760d4 (branch ccr-f0f0c4fd-ymvjjb)
Branch / PR: c18-delete-all / no PR (nothing pushed; owner merges)
Task / priority / status: C18 (Issue #59 reservation) "Delete all data on this device" with backup offered first, plus the same backup-first step in Shuttle Run. Implemented and tested in headless Chromium and Node; not verified on a physical device.
Reserved files/sections: prototypes/pe-boards/PE_Ultimate_Scoreboard.html, prototypes/pe-boards/PE_Coach_Board.html, store-content/tools/interval-trainer/interval-trainer.html, store-content/tools/shuttle-run/shuttle-run.html and the checks folders next to them. No shared PE Ultimate file (hm-*.js, index.html, build script, SW, workflows) was touched. GitHub write access was not used: the Issue #59 reservation is recorded here only; the board was not changed by this task.

## Changes and user behavior
Each of the four tools now has the same flow, in an in-page `<dialog>` (no alert/confirm/prompt):

1. Button "Delete all data on this device" opens a dialog that says what will be erased (tool-specific sentence), that only this tool's data is touched, and how many stored items exist.
2. Primary, focused action: "Download backup (JSON)". "Cancel" sits next to it. "Delete without backup" is a small underlined text link below, after the backup offer, never focused or highlighted.
3. After the backup download (or after choosing "without backup") a second step asks the user to type a word (DELETE / מחק / احذف / УДАЛИТЬ / BORRAR, case-insensitive, Enter works). The red confirm button stays disabled until it matches.
4. Confirm removes only the tool's own keys, then reloads the page to defaults. Cancel, Escape or the backdrop at any step changes nothing and returns focus to the opening button. If removal throws (blocked storage) the dialog says so, nothing reloads and the tool is not left frozen.
5. Optional restore: "Restore from backup file" picks a JSON file, validates it (format, tool name, only this tool's whitelisted keys, per-tool content validation reusing the tool's own validators), shows an in-page confirmation (with an offer to download the current data first), writes the keys with rollback on failure, then reloads. Invalid files are rejected with a message and nothing is written.

Backup file format (identical for all tools): `{"format":"pe-ultimate-tool-backup","version":1,"tool":"<tool>","exportedAt":"<ISO>","keys":{"<key>":"<exact raw stored string>"}}`. File name `<tool>-backup-YYYY-MM-DD.json`. Raw strings are stored, so even an unreadable/corrupt saved value is backed up byte for byte.

| Tool | Keys erased/backed up | Restorable keys |
|---|---|---|
| Scoreboard (`pe-scoreboard`) | `pe-scoreboard.v1*` (prefix) and `pe-scoreboard.lang.v1` | `pe-scoreboard.v1`, `pe-scoreboard.lang.v1` |
| Coach Board (`pe-coach-board`) | `pe-ultimate-coach-board-v1` | same |
| Interval Trainer (`pe-interval-trainer`) | `pe-tools.interval-trainer.v1` | same |
| Shuttle Run (`pe-shuttle`) | `pe-shuttle.v1*` (prefix, includes `.lang` and `.corrupt`) | `pe-shuttle.v1`, `pe-shuttle.v1.lang` |

Per tool notes:
- Scoreboard: `store()` ignores writes while a wipe or restore is in progress, so the pagehide/interval autosave cannot rewrite the data before the reload. The reload-autosave patch was NOT applied. Hook: `PEScoreboard.deviceData`.
- Coach Board: the language is stored inside the same key, so after a delete the board comes back in English (default). `persist()` is frozen during wipe/restore. Hook: `PECoachBoard.deviceData`. Buttons sit in the "My playbook" panel.
- Interval Trainer: the dialog strings live in a separate `DD_L` object in the app script, not in the generated `PE_IT_DATA` block (`tools/extract-app-data.cjs` is unchanged and its provenance test still passes). The storage accessor is now one `getLS` helper shared by the existing store adapter and the dialog, so the existing "storage is accessed only through one adapter" check still holds. Buttons are in the page footer. Hook: `PEIntervalTrainer.deviceData`.
- Shuttle Run: the old tap-twice "armed" delete was replaced by the dialog (the user asked for backup-first on the existing delete). The dialog also pauses a running test when opened. The old behaviour of resetting in place became reload-to-defaults. The existing CSV export stays; it is a results export, not a restore format, so the JSON backup was added for restore. Strings are in the engine dictionary as `dd_*` keys; the existing `clearAllArm` string is now unused (left in place). Hook: `PEShuttle.deviceData`.
- Language preference: it is erased with the rest in Coach Board, Interval Trainer and Shuttle Run (it is one of the tool's own keys, as the old Shuttle "clear all" already did); the Scoreboard erases `pe-scoreboard.lang.v1` too. After a delete every tool starts in English (the default for new installs).
- Translations (he/ar/ru/es) are new AI-written strings and need the same teacher review as the other recent additions.

## Validation commands and results
Environment: Node v22.22.0; Playwright from `/opt/node22/lib/node_modules`; Chromium from `/opt/pw-browsers`.
Baseline before changes (same commands): boards unit 38/38, boards browser 22/22, shuttle unit 20/20, shuttle browser 37/37, interval unit 29/29, interval browser 34/34.

After changes (all run from the repo root, `export NODE_PATH=/opt/node22/lib/node_modules PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`):
- `node --test prototypes/pe-boards/checks/verify-boards.cjs` -> 43 tests, 43 pass (5 new: backup content, removeOwn scope, parseBackup acceptance/rejection, half-failed restore rollback, dialog string coverage for scoreboard and coach).
- `node prototypes/pe-boards/checks/browser-boards.cjs` -> pass 46, fail 0 (24 new: 12 per board).
- `node --test store-content/tools/shuttle-run/checks/` -> 22 tests, 22 pass (2 new).
- `node store-content/tools/shuttle-run/checks/browser-shuttle-run.cjs` -> 49 passed, 0 failed (12 new; the existing "delete-all removes only pe-shuttle keys" check was updated to the new flow and still asserts that the `unrelated` key survives and results are gone).
- `node --test store-content/tools/interval-trainer/checks/` -> 32 tests, 32 pass (3 new in `device-data.test.cjs`).
- `node store-content/tools/interval-trainer/checks/browser.cjs` -> 46/46 passed (12 new).
- `npm test` -> 814 tests, 814 pass, 0 fail.
- `node build-standalone.js` -> builds Hamegrash.html; `git status` shows no change to generated outputs (these four tools are not part of the root build).

The 12 new browser checks per tool (shared helper `checks/device-data.cjs`, identical copy in each checks folder so tools stay self-contained):
1. Backup is downloaded BEFORE deletion: a logging hook records every `removeItem` and every download-anchor click across the reload; the first event must be the download, the downloaded JSON must equal the raw stored values and contain no foreign key, the data must still be present after the download, then the typed word removes exactly the tool's own keys, other keys (`unrelated`, near-miss names like `pe-scoreboard.v2`/`pe-shuttle.v2`, and the other tools' real keys) are unchanged, and the tool is back at defaults.
2. Cancel at every step (button, Escape, after a backup, Escape on step 2) leaves own and other data, state and focus intact, and a cancelled attempt does not keep the typed word.
3. "Delete without backup": secondary, makes no download, still needs the typed word (Enter works).
4. Restore: six invalid files (garbage, other tool, foreign key, broken value, empty keys, wrong format) change nothing; a valid file is only written after in-page confirmation, "download current first" works, other keys untouched, nothing removed.
5. Failures: `removeItem` throwing and `setItem` throwing (quota) show a message in the dialog, do not reload, leave data intact, and the tool still saves afterwards.
6. Blocked storage: dialog opens and says there is nothing to delete, no page errors.
7. Five languages (320 px): translated title/body, typed word accepted in lower case, `dir` correct, no horizontal overflow of dialog or page, buttons inside the viewport.
8. Pure helpers on a fake storage: backup holds only own keys, removeOwn spares foreign keys.
I mutation-checked the suite once (made removal a no-op in the scoreboard): the backup-first, without-backup and pure-helper checks failed as expected. I also looked at screenshots of Hebrew (scoreboard), Arabic (coach), English (shuttle) and Russian (interval) dialogs at 390 px.

## CI / emulation / physical-device evidence
Only headless Chromium (Playwright, desktop engine with 320/390 px viewports) and Node were run. Downloads were saved by Playwright; this is not a physical device, not iOS Safari, not an Android WebView and not the Capacitor shell.

## Unresolved issues and dependencies
- Download behavior inside the Capacitor/Android WebView (blob anchor with `download`) is NOT verified. The tools' existing CSV/JSON exports use the same mechanism, so it is expected to behave the same, but it needs a device check before relying on the backup in the native app. If it does not work there, the dialog still lets the user proceed after a "successful" click, because a browser cannot confirm that the file was saved; the dialog text asks the user to check the file first.
- The scoreboard, coach, shuttle and interval tools are standalone files; none of them is wired into PE Ultimate's own backup, so a PE Ultimate backup does not contain these keys and vice versa.
- Coach Board loses its language preference on delete (it lives inside the data key); not worth a separate key.
- Typed-word strings and the whole dialog text in he/ar/ru/es are AI-written and unreviewed by native-language PE teachers.
- The shared helper is duplicated in three checks folders by design; if the dialog changes, update all copies (`prototypes/pe-boards/checks`, `store-content/tools/shuttle-run/checks`, `store-content/tools/interval-trainer/checks`).
- Issue #59 board status was not updated (no GitHub write used).

## Publication status
Committed locally on branch c18-delete-all. Not pushed, no PR, not merged, not deployed.
Next owner / next action: owner reviews the commit; Codex or owner can run a physical-device check of the backup download and restore in the native shell and a teacher review of the new translations.
