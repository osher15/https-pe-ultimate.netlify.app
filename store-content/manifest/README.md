# G1 export metadata

All exports are read-only snapshots of Notion pages. Do not rewrite source text or deploy these files.

- `family`: lesson identifier, e.g. `BB-10`.
- `lang`: one of `he`, `en`, `ar`, `ru`, `es`.
- `source`: canonical Notion URL (`notion_url` in the original brief).
- `source_page_id`: UUID (`notion_page_id` in the original brief).
- `source_last_edited_at`: timestamp (`notion_last_edited` in the original brief).
- `status`: review state, not a publication approval.
- `kind`: activity exports only (`drill`, `game`, `activity`).

Lesson exports belong in `export/lessons/<lang>/<family>.md`. Activity exports belong in `export/activities/<lang>/<ID>.md`. The Markdown body starts after the closing front-matter delimiter and its blank line. Manifest SHA-256 hashes use that body, UTF-8 encoded with LF newlines. Set `repo_compare` to `null` pending Claude review.
