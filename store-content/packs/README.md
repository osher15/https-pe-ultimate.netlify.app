# Lesson pack generator (`build-pack.cjs`)

Task C15. Builds ONE self-contained, print-ready HTML file per language for one sport: cover page, table of
contents, then every lesson rendered from its exported Markdown with its diagrams inlined as SVG after the
section they are anchored to. Print it to PDF from any Chromium-based browser.

Dependencies: Node built-ins and `store-content/diagrams/render.js`. No network, no packages.

## Run

```sh
node store-content/packs/build-pack.cjs \
  --sport basketball --lang all \
  --export-dir  <dir containing en/ he/ ar/ ru/ es/ with BB-NN.md> \
  --scenes-dir  <dir containing <FAMILY>/<id>.json, for example BB-05/BB-05-D3.json> \
  --placements  <placements.csv> \
  --out         <output dir>
```

- `--lang` is `he`, `en`, `ar`, `ru`, `es`, `all`, or a comma list such as `he,en`.
- Output: `<out>/<sport>-lesson-pack.<lang>.html`.
- Optional `--legal-dir <dir>` (default `store-content/legal`): the translation notice and the responsibility line are
  read from `content-and-translation-notice.{en,he}.md` there (blocks 1 and 1a), so the wording has one source.
- Optional `--skip-sections 16,17,20`: omit top-level sections of every lesson by their 1-based position (for
  example the internal "database connection / system data / self-quality check" sections). Default: print everything.
- Exit code 0 = ok, 1 = input error (missing language folder, scene file, unknown sport), 2 = bad arguments.
  Warnings (anchor not found, scene without placement row, URL text in a lesson) go to stderr.

The real inputs (G1 export, G2 scenes) live on the ChatGPT branch and are not committed here. Generated packs are
build outputs: do not commit them.

## Print to PDF

Open the HTML in Chromium or Chrome (version 131 or newer for the footer text) and print with "Paper size A4",
"Margins: Default", "Background graphics" on, "Headers and footers" off. The page size and margins come from the
file (`@page`), so Playwright's `page.pdf({ preferCSSPageSize: true, printBackground: true })` gives the same
result.

## What the file contains

| Part | Details |
|---|---|
| Cover | `{{STORE_NAME}}`, pack title, sport, lesson count, language, `{{LICENCE_LINE}}`, the owner's AI-translation notice (all languages except Hebrew, the source language) and the responsibility line. Placeholders are left for the owner to fill. |
| Contents | One row per lesson: id, title, age, duration. Values come only from the lesson's identity block; if absent the cell is blank. |
| Lessons | `page-break-before` per lesson. Markdown headings `#`, `##` become `h3`, `h4`. Bold, italic, code, lists (nested), tables, block quotes, rules. Single line breaks are kept. HTML in the text is escaped. |
| Diagrams | `<figure>` with the engine SVG (`role="img"`, `<title>`, `<desc>` in the pack language) and the scene title as caption, after the last block of the anchored section. Several diagrams in one section: by `step`, then id. |
| Footer | Lesson id and page number via named `@page` rules (needs margin-box support: Chromium 131+). Older engines print no footer. |
| Security | `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">`, no scripts, no links except in-page anchors, system font stack only. |

Source front matter (`status`, `source`, ...) is removed and never printed.

Right-to-left: `he` and `ar` set `<html lang dir="rtl">`. The English notices on the Arabic cover are marked
`lang="en" dir="ltr"`. Diagrams are never mirrored (the engine draws one SVG for every language).

## Anchors

`placements.csv` gives `family,diagram_id,section,step`. The section keys map to the H2 headings of the lesson
sequence by position: `opening`, `warmup`, `mainA`, `mainB`, `appliedGame`, `closing` are the 1st to 6th H2 under
the first top-level heading that has at least five H2 headings. This works for all five languages because the
heading text is not used. If a lesson has no such sequence the figure is appended at the end and a warning is printed.

## Tests

```sh
node --test "store-content/packs/test/*.test.cjs"
```

Fixtures in `store-content/packs/test/fixtures/` are small synthetic lessons and scenes (no real lesson text).
They cover escaping, the RTL attribute, the table of contents, diagram order, determinism (two runs byte-identical),
no external URLs, no front-matter leakage, the cover wording and the CLI errors.

## Add a sport

1. Add an entry to `SPORTS` in `build-pack.cjs`: the family prefix (`FB`, `HB`, `VB`, `AT`, `FIT`) and the name and
   pack title in five languages.
2. Have the export folders contain `<PREFIX>-NN.md` and the scenes folder `<PREFIX>-NN/<id>.json`.
3. Run the generator, check the console for warnings, then print and look at a cover, a contents page and a lesson
   with a diagram in `en`, `he` and `ar`.
4. Add a test using fixtures if the sport needs different handling.

## Known limits

- Fonts depend on the system. Hebrew and Arabic need an installed font with those scripts (the stack lists Segoe UI,
  Arial, Noto Sans Hebrew/Arabic, DejaVu Sans). Without one the glyphs fall back or show as boxes. No font is
  embedded (no external requests, small files).
- The interface strings on the cover and in the contents table (pack title, "Lessons", column names) are drafts and
  need native-speaker review. The owner's translation notice and responsibility line exist only in English and
  Hebrew: Arabic, Russian and Spanish packs show the English wording (marked `lang="en"`).
- Hebrew is treated as the source language (no translation notice). Change `SOURCE_LANG` if that changes.
- Link targets in Markdown are dropped (the link text stays), so the output never contains a clickable URL. A bare
  URL typed in a lesson would be printed as text and reported as a warning.
- The contents table has no page numbers (CSS `target-counter` is not available in Chromium); entries link to the lesson.
- Lesson titles, age and duration are read from labelled identity lines. A combined line such as `Age/experience`
  is split only when the values can be split the same way (`;` or `؛`); otherwise the cell stays blank.
- The Markdown subset is deliberately small: no images, no HTML passthrough, no footnotes, no task lists.
- Page count depends on the browser, fonts and printer driver. Nothing was checked on paper or in other browsers.
- Diagrams keep the engine's schematic status: courts are not regulation-accurate.
