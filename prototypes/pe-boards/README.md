# Standalone PE Ultimate boards

Prepared 2026-10-10 at the owner's request. Two complete, self-contained HTML tools, with no runtime libraries, package installation, network assets, account or service. **These are not connected to PE Ultimate.** No root app source, navigation, build registration, generated HTML, service worker or native packaging was modified.

## Run

Open `index.html` from this folder in a modern browser and choose a board. Keep both sibling HTML files next to it. Each file can also be opened directly.

For a stable local browser origin, from the repository root with Node 20+:

```sh
node prototypes/pe-boards/serve.cjs
```

Open `http://127.0.0.1:5179/`. Stop with Ctrl+C. Optional `PE_BOARDS_PORT` changes the port; browser-local saved data belongs to that origin, so use the same port to reopen it. This launcher serves only these three HTML files on loopback. It does not start the real application or deploy anything. Actual fullscreen/audio/download availability depends on the browser and device; give the page user interaction first.

## Files and present behavior

| File | Features | Language / storage |
|---|---|---|
| `PE_Ultimate_Scoreboard.html` | Score entry and correction, team fouls, configurable halves/quarters, deadline-based clock, timeouts, overtime, undo, final-score correction, last 20 completed results, JSON export, presentation mode | English first; HE/EN/AR/RU/ES. Keys `pe-scoreboard.v1`, `pe-scoreboard.lang.v1` |
| `PE_Coach_Board.html` | Football/basketball/volleyball/handball, full/half court, portrait, editable player counts/numbers/roles, balls, movement/pass/dribble routes, phase playback, undo/redo, 12 demonstrations, JSON import/export and PNG export | English first; English/Hebrew only. Key `pe-ultimate-coach-board-v1` |

The two board files are byte-identical to their current supplied artifacts; their original comments were preserved. Combined size: 109,160 bytes (about 107 KiB). They use separate storage keys and do not read pupils, classes, grades or the main application's keys. Saved data is local to a browser/origin, not synchronized between devices. Export before changing origins, clearing storage, or moving devices. The scoreboard JSON export has no import UI yet; coach JSON supports validated import.

School timing presets are configurable examples, not official competition rules. Coach animation follows planned routes; it does not decide opponent behavior. Court geometry is schematic. Scoreboard fouls are team-period counts, with no automatic penalties or player-foul rules. Reload pauses the scoreboard and clears its undo session; an interrupted timeout is dismissed. Coach undo/redo is also session-only.

## Verification

```sh
node --test prototypes/pe-boards/checks/verify-boards.cjs
```

Current run: **35/35 passed**. This dependency-free check evaluates the exact shipped scoreboard engine/application handlers with a simulated DOM/storage, and the exact coach pure-function declarations. It covers elapsed time, pause/reload, timeouts, finalization/correction without duplicates, quota-like failure, stale-tab writes, bounded history/archive, translation-key coverage, 12 demonstration round trips/phase continuity, player limits, invalid scenarios and movement endpoints. IDs and external runtime asset references are checked statically; the complete inline scripts compile.

These are not browser layout, touch, real download, audio or native acceptance tests. The coach's retained file header refers to an earlier browser QA session; this upload did not rerun it or certify it. Real-device tests and host integration remain pending. Floating-point movement endpoints use a small tolerance, not exact equality.

## Claude integration handoff

Read `docs/handoffs/2026-10-10-standalone-boards.md` before integrating. The owner requested staging only: do not connect these tools, merge, deploy, or register them in the existing app in this delivery. First review and reserve the integration files in coordination issue #18.

Recommended first integration is a lazily loaded same-origin iframe in **separate Scoreboard and Coach Board tabs**. An iframe isolates their global styles and DOM IDs; do not paste their entire HTML into the host document. Example for a future mount (not installed here):

```js
const frame=document.createElement('iframe');
frame.src='prototypes/pe-boards/PE_Ultimate_Scoreboard.html';
frame.title='Scoreboard';
frame.allow='fullscreen';
frame.style.cssText='width:100%;height:80dvh;border:0;';
// Append to the reserved host tab, then validate height/scrolling on real phones.
// Remove the iframe on unmount; decide explicitly whether a live timer can leave.
```

Before release: reviewed host storage/backup adapter and schemas, lazy first-open offline cache/native packaging, five-language coach support, host language synchronization, explicit cid/group snapshots if needed, lifecycle/timer/animation cleanup, native exports and device checks. Do not infer sid/cid from team labels or assign grades automatically. Prototype storage is not included in the existing application's backup today.

Scoreboard exposes `window.PEScoreboard.getState()`, `setLanguage(code)` and `exportResult()`. Its own document dispatches `pe-scoreboard:change`; this does not automatically cross the iframe boundary. On a same-origin frame, attach a host listener to `frame.contentDocument` after load. Coach has no public host bridge yet; add bounded state/language/lifecycle methods before host binding rather than relying on its internal variables or CSS selectors. No parent-message listener, authentication or cloud sync is implemented.
