# G1 export validation workflow

Scope: store-content/export only. Do not edit the app, deploy, or merge.

1. Inventory expected lesson IDs: BB, FB, HB, VB, AT, FIT; 01–10 in each of en, he, ar, ru, es (300 editions).
2. Inventory activities separately: 80 drills, 24 games, 16 activities across five languages (600 editions); confirm real source IDs before naming files.
3. Each export must contain source Notion page ID, source URL, last-edited timestamp, language, family, and the complete unmodified body.
4. First QA: compare complete body to Notion, including all numbered headings, safety guidance, timing, and adaptation notes. Flag any missing, duplicated, or unexpectedly short sections.
5. Second QA: independent sport-terminology, age suitability, instruction clarity, safety and local-language review. Do not silently rewrite the original.
6. Final QA: reconcile conflicting findings and sign off only after both checks pass.
7. Validate G2a quotes against exported English lessons; do not start G2b until G1 source-fidelity checks and pilot acceptance.

Language lanes: en, he, ar, ru, es. Proposed cheaper-model workers and two QA agents are NOT running. This is an allocation plan only.

Known verified English exports as of 2026-10-14: 20 previously read back, with FB-03, HB-03 and FIT-03 subsequently written. Recount from GitHub before reporting totals. Some attempts to write other lesson files were blocked; do not assume they exist.

Local offline checker is delivered separately in PE_Tools_G1_Audit_Utility_2026-10-14.zip. Its presence in GitHub has not been verified.
