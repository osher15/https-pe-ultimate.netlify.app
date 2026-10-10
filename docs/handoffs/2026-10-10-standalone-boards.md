# Two standalone boards for Claude — 2026-10-10

Owner instruction: upload scoreboard and coach board code to the PE Ultimate GitHub repository, with what Claude needs to run/review them later; **do not connect them to the application now**.

Branch: `codex/standalone-boards-2026-10-10`. Base: main `348c1ab2d4f069aea7f4640328b7e4f8f30611c3`. Reservation: issue #18 comment 6097370013, limited to `prototypes/pe-boards/**` and this handoff. No overlap with Claude's lesson-builder, packaging or shared app source reservations.

## Delivered

- `prototypes/pe-boards/PE_Ultimate_Scoreboard.html`: exact current standalone scoreboard, 52,027 bytes.
- `prototypes/pe-boards/PE_Coach_Board.html`: exact current standalone coach board, 57,133 bytes.
- `prototypes/pe-boards/index.html`: local launcher links opening each board in its own tab.
- `prototypes/pe-boards/serve.cjs`: optional Node-only loopback launcher, no dependencies.
- `prototypes/pe-boards/checks/verify-boards.cjs`: repeatable standalone verification.
- `prototypes/pe-boards/README.md`: run steps, features, storage/API/language boundaries and integration checklist.

The current authoritative artifacts were retrieved before upload; both HTML files were copied without edits. No original file was replaced. This is a staging branch with runnable standalone tools, **not completed application integration or a release**. No PR, merge or deployment is part of this delivery.

## Checks completed

| Command / check | Result |
|---|---|
| `node --test prototypes/pe-boards/checks/verify-boards.cjs` | 35/35 passed, no skipped tests |
| Complete embedded script syntax compilation | Passed for both files |
| `npm test` on this base plus standalone files | 700/700 passed |
| `node build-standalone.js` twice | Both succeeded; root `index.html`, `Hamegrash.html`, `sw.js` unchanged |
| Board bytes against retrieved artifacts | Exact equality required before publication |

The 35 checks are engine/application-handler simulations and coach data/route checks. They are not a physical-device or browser-layout pass. Earlier coach browser-QA claims inside the retained HTML header belong to that artifact's earlier work, not this upload verification. Fullscreen, touch, sound, actual download/file picker and native behavior remain to be tested. No existing student data or live app session was touched.

## Claude's next bounded task

1. Read AGENTS.md, COLLABORATION.md, current action plan and the README. Run each standalone tool first, with synthetic data.
2. Review storage and imported-scenario validation before wiring into a trusted host. Coach import/restore has its own validation and local storage; scoreboard has its own versioned result format. Do not treat either as already covered by host backup or host identity handling.
3. Reserve exact host navigation, tab lifecycle, bridge/adapter, translations, offline-cache/build and focused test paths. Do not pull this whole branch blindly into an unrelated pending branch.
4. Propose separate lazy tabs, preserving existing current/upcoming lesson UX and small startup. Prefer iframe isolation for the first pilot, or scope all CSS/listeners explicitly if converting to mounted modules.
5. Add coach AR/RU/ES translations and host-language synchronization. It currently supports EN/HE only; the scoreboard already has five dictionaries. English remains the new-install default.
6. Add reviewed storage/backup integration, atomic restore preservation, cid/group-ID snapshots only when needed, and lifecycle cleanup. Decide explicitly what happens when leaving a running scoreboard or coach animation. No pupil identity by label and no automatic grade changes.
7. Add files to actual offline precache and native web-asset packaging only in the later authorized integration. Test first open offline, reload, cache update, backup roundtrip, and class isolation. A standalone file working offline does not prove hosted first-open caching.
8. Adapt JSON/PNG export to the current native share/file flow and verify on Android, iPhone and iPad. Test 320 px, landscape, RTL, notch/keyboard, projector, sound and time in background. A running loopback server is not a preview on a separate phone.
9. Rebuild generated application outputs from sources, run relevant integrated tests and obtain owner merge/deploy approval. Do not modify generated files by pasting these independent documents.

Reliability/storage and teacher field efficiency remain higher priority than expanding competition features. Existing optional tournament issue #52 is a separate pilot; these files do not implement a league table, match scheduling, cloud transport or teacher-grade integration.
