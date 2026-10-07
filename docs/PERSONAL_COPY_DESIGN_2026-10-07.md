# Personal editable copy of a lesson — design note (#21 item 5, #24 bank-to-copy)

Status: implemented on branch `ccr-e68b66c8-44gzz9`; owner review pending. No new store, no server, no account.

## What the teacher gets
1. **Save as a new personal copy** (existing "Save" button) — never overwrites anything.
2. **Update my copy** — appears only when the plan on screen was loaded from, or saved to, the personal library. It replaces that library entry only after an explicit click; the previous version is kept once (`prev`) and can be restored with "↩ previous version" on the library row.
3. **Duplicate (⧉)** keeps working; the duplicate now remembers what it came from.
4. **Lesson bank → "Create my editable copy"**: the bank lesson stays untouched (read-only, draft/review status visible); a timed plan is built from its sections and loaded into the planner. Each phase's minutes are read from the "Duration: N minutes" line in the section text; a phase without a stated duration gets 3 minutes and the plan says the times are an estimate. The teacher edits with the existing "Edit steps" mode.
5. The plan shows **"Based on: …"** (source title, kind, bank content version and review status) and, for bank copies, a button to open the original.

## Data
Personal copy = an `ls.lib` entry (`{id, plan, prev?, updated?}`); `plan.src = {kind:"generated"|"copy"|"bank", id, title, v?, status?, lang?, timeGuess?, at}`. Old entries without `src` keep working. Library export/import already carries whole entries, so `src` and `prev` travel with them; no pupil data is in a plan.

## Rules
- Built-in documents and bank records are never modified.
- A running lesson and an assignment keep their own snapshot of the plan (`assign.set(cid, iso, plan)`, `LIVE.attachPlan`); updating a library entry does not change them.
- Library limit stays 60. A save that would exceed it is **refused with a message** instead of silently dropping the oldest plan (previous behaviour).
- A failed storage write keeps the plan on screen and shows an error; nothing reports "saved" unless the write succeeded.
- English default, five languages for all new labels (`pc.*` keys). Works offline.

## Not in this change
Personal collections, plan export as a readable/importable file with provenance beyond what the library export already has, per-step times for bank copies, automatic suggestions of any kind.
