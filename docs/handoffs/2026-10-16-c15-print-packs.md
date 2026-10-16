# C15 - print-ready lesson pack generator (basketball first) - 2026-10-16

Branch: `c15-print-packs`, started from local `ccr-f0f0c4fd-ymvjjb`. Author: Claude (sub-agent C15).
Reservation (recorded here; no GitHub Issue was changed from this session): new files only,
`store-content/packs/**` and this handoff. No app source, shared file, generated output, workflow or package file
was touched. No push, PR or merge.

## What was built

- `store-content/packs/build-pack.cjs`: deterministic generator (Node built-ins and `store-content/diagrams/render.js`
  only, no network). One self-contained A4 HTML file per language: cover, contents, lessons with inlined SVG diagrams.
- `store-content/packs/test/build-pack.test.cjs` (14 tests) and synthetic fixtures in `store-content/packs/test/fixtures/`
  (no real lesson text).
- `store-content/packs/README.md`: how to run, print, add a sport, limits.

## Inputs (not committed)

Fetched `origin/codex/g1-notion-export-pilot-20261014` and extracted `store-content/export/lessons`,
`store-content/diagrams/scenes` and `store-content/diagrams/placements.csv` into a scratch directory outside the
repo. They contain BB-01 to BB-10 in five languages and 22 basketball scenes (20 from ChatGPT's batch plus BB-05
D3 and D4).

## Commands and results

| # | Command | Result |
|---|---|---|
| 1 | `node --test "store-content/packs/test/*.test.cjs"` | 14/14 pass |
| 2 | `npm test` | 819/819 pass, 0 fail, 0 skipped |
| 3 | `node --test "store-content/diagrams/test/*.test.js"` | 70/70 pass (unchanged) |
| 4 | `node store-content/packs/build-pack.cjs --sport basketball --lang all --export-dir <scratch>/store-content/export/lessons --scenes-dir <scratch>/store-content/diagrams/scenes --placements <scratch>/store-content/diagrams/placements.csv --out <scratch>/out` | 5 files, 10 lessons and 22 diagrams each, no warnings |
| 5 | Same command a second time into another directory | all five files byte-identical (sha256 compared) |
| 6 | Static checks on the five outputs | no `http(s)://`, no `src=`/`url(`/`<link>`/`<script>`/`<img>`, no front-matter text, no leftover `**` or table pipes, 22 inline SVGs each, CSP meta present |
| 7 | Playwright 1.56 (Chromium, print media) loading each file from `file://`, request log | 0 requests other than the file itself, for all five |
| 8 | `page.pdf({ preferCSSPageSize: true, printBackground: true })`, `pdfinfo` | page counts below |

Generated sizes: he 272 KB, en 248 KB, ar 275 KB, ru 301 KB, es 260 KB.

### Page counts (A4, Chromium, system fonts of this machine)

| Language | Pages |
|---|---|
| he | 60 |
| en | 62 |
| ar | 58 |
| ru | 60 |
| es | 63 |

Each pack: 1 cover page, 1 contents page, then about 5 to 6 pages per lesson.

## What the renders showed (and what was fixed)

Looked at: cover (en, ar), contents (en, he, ru, es), BB-05 with diagrams in en, he and ar, BB-04 and BB-09 with
half-court diagrams in en.

- Cover and contents were fine in en and he. The Arabic cover is right-aligned; the English notices are left-aligned
  LTR islands, by design.
- Fixed: Russian contents table broke "BB-01" and "Возраст" across lines. Cause: global `overflow-wrap:anywhere`.
  Now the contents table uses normal wrapping and no-wrap for id, age and duration.
- Fixed: Hebrew lesson heading had no gap between id and title (margin on a `bdi` follows the element's own LTR
  direction). The heading is now a flex row with a gap.
- Fixed: diagrams were up to 112 mm tall and often jumped to the next page, leaving large gaps. Open-area diagrams
  are now capped at 92 mm and half courts at 122 mm. A figure never splits across pages and headings keep with their text.
- RTL: id on the right, Hebrew and Arabic text and bullets on the right, numbers such as "20-30" follow normal
  Hebrew bidi (shown as 30-20 visually, which is how a Hebrew reader expects it). Diagrams are not mirrored.
- Footer "BB-05 . 28" (lesson id and page) appears on lesson pages; the cover has none, the contents page only the number.
- Remaining cosmetics: some pages end with a white gap when the next diagram does not fit (the diagram follows its
  section, as the plan requires); some lessons end with a nearly empty last page.
  Both are inherent to page-per-lesson layout and were not tuned further.

## Observations for the owner

- The exported lessons contain internal sections (16 "database connection", 17 "system data", 20 "self-quality check"
  with "Requires qualified teacher review ... before publication"). The generator prints them because the text is
  never rewritten. For a customer pack use `--skip-sections 16,17,20` (or leave them out of the export); this is an
  owner decision.
- The lesson identity blocks differ by language (bullets in ar/ru, combined labels such as `Name/code`). The parser
  handles all 50 basketball files; ambiguous values stay blank rather than guessed.

## Known limits

- Fonts depend on the system. Hebrew and Arabic rendering depends on an installed font with those scripts; no font
  is embedded. The numbers above are from this machine's fonts; other machines will differ by a few pages.
- Footer text uses CSS margin boxes (Chromium 131 or newer). Not verified in Firefox or Safari.
- Cover and contents interface strings (pack title, column names) are drafts pending native review. The owner's
  translation notice and responsibility line exist only in English and Hebrew, so ar, ru and es show the English text.
- Link targets are dropped; no page numbers in the contents; Markdown subset only.
- Evidence: Node tests, a headless Chromium print to PDF, and looking at pages rasterised with `pdftoppm`. No
  physical printer, no other browser, no native-speaker or teacher review.
- No PDF and no generated pack is committed. Packs are rebuilt from the export when needed.
