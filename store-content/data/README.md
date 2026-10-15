# Activity metadata

Status: schema and checker prepared; `activities.meta.json` requires extraction from all 120 English activity pages and cross-language comparison before it can be published.

The file is a JSON array of exactly 120 objects with unique `id` values. Never infer an unstated value: use JSON `null` for unknowns. Cross-language differences must be recorded, not silently corrected.

| Field | Meaning |
| --- | --- |
| id | Stable activity identifier |
| kind | Activity type, e.g. game, drill or activity, only when stated |
| sport | Stated sport: football, basketball, handball, volleyball, athletics, fitness, multi, general |
| age_min, age_max | Explicit age range in years, otherwise null |
| duration_min | Explicit duration in minutes, otherwise null |
| players_min, players_max | Explicit participant range, otherwise null |
| space | Verbatim space requirement, otherwise null |
| equipment | Stated equipment items, otherwise null |
| skills | Stated skills, otherwise null |
| contact | none or limited only when text explicitly establishes it, otherwise null |
| inclusive_option | Whether an inclusive option is explicitly provided; null when unknown |
| needs_diagram | Editorial decision based on documented layout complexity, with explanation |
| diagram_reason | Reason for diagram decision, or null |
| lang_mismatches | Array of objects specifying field, language, English value and translated value for differing numeric details |
| open_questions | Unresolved extraction ambiguities; do not invent answers |

Run `node store-content/data/check-meta.cjs` after producing the JSON. The checker verifies JSON parsing, an array of 120 items and unique nonempty IDs. It does not verify source fidelity; that requires comparing the exported pages.

Do not generate placeholder metadata records to satisfy the checker.
