# Integration proposal: exercise animations (C10)

Status: proposal only. No app file, `exercise-gifs/` or store tool was changed. Line numbers
refer to `hm-app.js` at the lead branch `origin/ccr-f0f0c4fd-ymvjjb` (merge `42676b7`). Check
them again before editing.

## 1. What ships

| Asset | Per exercise | All 47 | Use |
|---|---|---|---|
| `out/svg/<id>.svg` | 8–43 KB | 1,314,437 B (169 KB gzipped) | animated demonstration (detail view, run screen) |
| `out/still/<id>.svg` | 3.5–5.6 KB | 180,707 B | thumbnails, lists and `prefers-reduced-motion` |
| `out/gif/<id>.gif` | 16–148 KB | 2,535,288 B | fallback only (e-mail, documents, very old viewers) |

Today the app ships `exercise-gifs/rig/` (37 files, 5,235,836 B) and `exercise-gifs/photo/`
(5 files, 1,086,766 B), about 6.3 MB. SVG + still is about 1.5 MB, which saves about 4.8 MB.
The files are keyed by the **exercise `id`**, not the shared figure name (`fig`). Today 13 ids reuse
another exercise's figure (`library.json` → `appFig`). Every id now has its own animation.

## 2. App: proposed file layout

```
exercise-anim/svg/<id>.svg     # copy of store-content/exercise-anim/out/svg
exercise-anim/still/<id>.svg   # copy of store-content/exercise-anim/out/still
```

Generated outputs must be copied in by the build step, not by hand. Add `exercise-anim` to `DIRS`
in `native/build-web.js` (line 25, today `["exercise-gifs","fonts"]`). `sw.js` does not reference
exercise media today, so offline behaviour is unchanged. If offline thumbnails are wanted, the still
files (181 KB) are small enough to precache.

## 3. App: code changes in `hm-app.js` (FIT module)

| Lines | Today | Change |
|---|---|---|
| 5468–5470 | comment about rig GIFs and Wikimedia photos | describe `exercise-anim/` (own drawings, no credits) |
| 5471 | `const PHOTO_EX={lunge:1,pike:1,burpee:1,jack:1,knees:1};` | delete (no photos any more) |
| 5472 | `const rigGif=fig=>\`exercise-gifs/rig/${fig}.gif\`;` | replace with `animSrc`/`stillSrc` by id (below) |
| 5473 | `const heroGif=e=>PHOTO_EX[e.id]?…:rigGif(e.fig);` | `heroImg(e,px)`: animated `<picture>` |
| 5474 | `const gifImg=(fig,name,px)=>\`<img src="${rigGif(fig)}"…>\`` | `thumbImg(e,px)`: still SVG |
| 5611 | `gifImg(e.fig,e.name,46)` (circuit list) | `thumbImg(e,46)` |
| 5651 | `<img src="${heroGif(e)}" … 130px>` (exercise detail) | `heroImg(e,130)` |
| 5667 | `gifImg(e.fig,e.name,74)` (library grid) | `thumbImg(e,74)` |
| 5719 | `gifImg(e.fig,e.name,42)` (run screen / dice) | `heroImg(e,42)` on the run screen, else `thumbImg` |

Suggested helpers. Keep the existing inline style and `esc()` conventions of the file.

```js
const animSrc  = id => `exercise-anim/svg/${id}.svg`;
const stillSrc = id => `exercise-anim/still/${id}.svg`;
const imgStyle = px => `width:${px}px;height:${px}px;object-fit:contain;border-radius:10px`;
// still picture: lists and grids (47 running animations at once would cost CPU and battery)
const thumbImg = (e, px) => `<img src="${stillSrc(e.id)}" alt="${e.name}" loading="lazy" width="${px}" height="${px}" style="${imgStyle(px)}">`;
// animated picture; the browser swaps in the still file when the user asks for reduced motion
const heroImg = (e, px) => `<picture><source media="(prefers-reduced-motion: reduce)" srcset="${stillSrc(e.id)}">` +
  `<img src="${animSrc(e.id)}" alt="${e.name}" loading="lazy" width="${px}" height="${px}" style="${imgStyle(px)}"></picture>`;
```

Notes:

- The animated SVG also hides its own animation under `prefers-reduced-motion` when it is opened
  directly. Inside `<img>` that was **not verifiable** with Playwright emulation, so the
  `<picture>` pattern is the verified path (`checks/browser.cjs`).
- SVG is drawn on a light background (`#eef3f8`). If the FIT screen stays dark, either keep the
  rounded corners as a "card" or regenerate with a dark `PAL.bg`.
- Display sizes in the app are 42–130 px. The SVGs are vector, so they stay sharp on retina screens.
  The GIFs are 260 px (2× the largest size).
- Tests to add on the app side: every `EX` id has `exercise-anim/svg/<id>.svg` and
  `exercise-anim/still/<id>.svg`, and no reference to `exercise-gifs/photo` is left.
- `exercise-gifs/CREDITS.md`: once the photos are no longer referenced, drop the Wikimedia table
  (CC BY-SA attribution is then not needed) or keep it until the files are deleted. Delete
  `exercise-gifs/` only after the swap is merged and checked on a device.
- Keep the five-language names: the `alt` text uses `e.name`, as today.

## 4. Interval trainer (store tool) as a single file

Today `store-content/tools/interval-trainer/interval-trainer.html` (144,868 B) loads
`media/<fig>.gif` (line 453; 37 rig GIFs, 5,227,644 B). A single-file build was rejected because
base64 GIFs would add about 7 MB.

With the SVGs:

- Embed a map `{id: "<svg…>"}` in a `<script type="application/json">` block, or as JS string
  literals. Raw size is 1,314,437 B for the animated set, plus 180,707 B if the still set is kept for
  reduced motion.
- At start-up, turn each entry into `URL.createObjectURL(new Blob([svg], {type: "image/svg+xml"}))`,
  or into a `data:image/svg+xml;charset=utf-8,` URI (URI-encoding grows the set to 1.90 MB, so prefer
  blobs). The CSP already allows `img-src data:`. For blobs add `blob:` to `img-src`.
- Look up by `e.id` instead of `e.fig` (line 453). Exercises without media disappear. The two
  "shipped without media" exercises (`gluteb`, `rtwist`) and the four "approximate" ones (`wall`,
  `skip`, `hollow`, `inchworm`) now have accurate animations.
- **Estimated single file:** about 145 KB (app) + 1.31 MB (animated SVGs) + 0.18 MB (stills) ≈
  **1.64 MB**, or about **1.46 MB** without the still set (reduced motion would then use the
  in-SVG fallback only). That is well under the ~4 MB target. gzip over the network brings the SVG
  part down to about 0.18 MB.
- Checks to update there: `media-coupling.test.cjs` (hashes of `media/` against `exercise-gifs/rig`)
  becomes "every exercise id has an embedded SVG whose SHA-256 matches
  `store-content/exercise-anim/out/manifest.json`". The browser pass should screenshot one
  embedded animation.

## 5. Order of work (suggested)

1. Owner review of the contact sheet and the per-exercise doubts (README checklist block).
2. Interval trainer single-file build (store-only, no app risk).
3. App swap behind the existing FIT screens (sections 2–3), with the app tests above, then
   `npm test`, `node build-standalone.js`, a repeat build with no diff, and a device check.
4. Remove `exercise-gifs/` and the photo credits after the app swap is merged.
