# ChatGPT — prompt for the next run — 2026-10-15

Continue on branch `codex/g1-notion-export-pilot-20261014`. Same rules as before: `[skip netlify]` on every commit,
no merge, no deploy, no app files, Notion read-only, source bodies never rewritten, and never state a check as
executed unless you ran it.

## Context
- Your round-2 work was verified by Claude and accepted (lessons 300/300, activities 600/600, manifest 900
  deterministic, 30 scenes with 0 errors and 0 warnings).
- Claude is checking a 120-file sample against Notion. **Do not spend runs on source-fidelity.**
- New in the product: the interval trainer now includes **47 animated cartoon exercise demonstrations**, and every
  offline tool gets a **"Delete all data on this device"** button that offers a backup first.

## Tasks, in order
Do the tasks in `docs/handoffs/2026-10-15-chatgpt-next-prompt-2.md` (read it from the branch
`ccr-f0f0c4fd-ymvjjb`):

1. **BB-05**: leave Main A undrawn and record an English `open_question` in `placements.csv`.
2. **T1** G2b football FB-01..FB-10. Stop after football and wait for review.
3. **T2** G3 activity metadata -> `store-content/data/activities.meta.json`, README, and `check-meta.cjs`.
4. **T3** G4 copy under `store-content/copy/` (products, FAQ, support KB, Hebrew product pages).
5. **T4** `store-content/site/sitemap.md`.

## Extra task T5 — UI strings for the delete-all / backup flow (small)
Write `store-content/copy/delete-all-strings.json`, with keys in `he`, `en`, `ar`, `ru`, `es` for the following
messages. Use native, plain, calm wording. No alarmist tone, no exclamation marks.

| key | English source text |
|---|---|
| `btn_delete_all` | Delete all data on this device |
| `dlg_title` | Delete all data? |
| `dlg_body` | This removes everything this tool saved on this device. It cannot be undone. We recommend downloading a backup first. |
| `btn_backup` | Download backup |
| `btn_continue` | Continue |
| `btn_cancel` | Cancel |
| `confirm_prompt` | Type DELETE to confirm. |
| `confirm_word` | DELETE (translated word the user types) |
| `btn_delete_confirm` | Delete now |
| `btn_delete_without_backup` | Delete without a backup |
| `done_msg` | All data on this device was deleted. |
| `backup_done_msg` | Backup downloaded. |
| `restore_btn` | Restore from backup |
| `restore_ok` | Backup restored. |
| `restore_bad` | This file is not a valid backup for this tool. |

Rules: keep `confirm_word` short (one word, easy to type on a phone keyboard in that language), RTL-safe for `he`
and `ar`, and mention in the file's top-level `"_note"` that the translations were produced with AI.

## Report back
For each task: commit SHA(s), a short note, and the exact output of each check you ran. Separate **executed**
checks from checks you only **wrote**. Recount totals from the Git tree.
