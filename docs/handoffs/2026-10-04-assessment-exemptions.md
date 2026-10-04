# Codex handoff — teacher period exemptions
Date: 2026-10-04. Issue #23. Branch codex/assessment-exemptions-2026-10-04.
Base/prerequisite: PR #28 head 8f6469d; stacked after #25 -> #26 -> #27. Owner coordinates merge/deploy.

## Delivered
- Extend the existing requirements editor with optional period-exemption details. Select a pupil by name plus stable ID, check a required test and provide a nonempty reason (max 500 characters). A nearby submit button saves the same complete requirements/exemptions form without scrolling through the test catalogue.
- Existing pupil report edit entry opens this editor in the same class/period with that pupil selected. The class report also offers requirements/exemption editing. No second storage model, new schema, server, grade write or attendance mutation.
- Reuse assessment.policies[].exemptions as {sid,test,reason}. Whole selected period/date scope is explicit; an attendance-day exemption is separate. Exemptions suppress score/completeness missing status, while original measurements remain in optional history. Removing an exemption restores the normal measured/missing calculation; it does not delete history or alter manual/final grades.
- Drafts for multiple pupils survive pupil-selector navigation. Pupil navigation alone is not a dirty edit. Existing Back/close/class/period discard protection covers exemption edits; full-envelope validation and stale-window/read-back/quota failure protection remain active.
- New exemptions require exactly one current pupil with that stable ID in this real class at save time. A pupil moved during editing blocks a new exemption; a duplicated pupil ID blocks both new and retained exemption writes; names cannot assign results or exemptions.
- Saved exemptions for unavailable pupils are preserved without attribution to another pupil. Their existing reason is read-only and they can only be removed explicitly. Removing a required test with a retained exemption is blocked until the teacher explicitly removes that exemption. Other pupils/classes/periods remain intact.
- The existing report, Excel and CSV reuse the saved reason and blank exempt best/score cells. Original raw history remains. Five languages and 390px layout; English new-install default preserved.

## Validation
- npm test: 597/597 (existing calculation/export validation reused; no pure calculation change).
- Registered exemption suite 12/12 + existing requirements editor 14/14 + existing period-report/export 8/8: 34/34 together on the final source.
- New browser cases cover required reason, save/reload, measured history/manual-grade preservation, removal restoring score, duplicate names with IDs, multi-pupil drafts, explicit test/exemption removal, actual localStorage quota failure, stale configuration, moved pupil/duplicated IDs, orphan preservation/removal, discard cancellation, direct report-to-editor entry, actual backup restore and XLSX/CSV downloads, simultaneous initial requirements/exemption setup, five languages and navigation not creating edits.
- Independent openpyxl/zipfile/csv check opened actual browser downloads: selected pupil only, literal '=Medical reason' string in XLSX, CSV formula protection, blank best/score for exempt test and original measured value 35 in History. Automated file validation is not physical Excel/device acceptance.
- Desktop and Hebrew phone screenshots inspected in a separate visual check (1/1). Repeated build hashes and git diff --check verified before publication.
- Prior PR #28 exact-head Tests run 144 and native builds run 12 completed successfully. Current PR exact-head CI is recorded in the PR/Issue; prior CI is not current-feature device evidence.

## Next / limits
Review/merge #25 -> #26 -> #27 -> #28 -> this focused PR and retarget sequentially. No merge, live deployment or store upload performed. Claude review remains pending; no claim of communication with Claude.
Next inspect the existing manual/final-grade calculation and override UI before connecting scoring suggestions to an explicitly requested teacher action. Do not auto-fill or overwrite grades, or invent a second grading store. Editable desktop-grid persistence and reviewed pupil sharing/access are separate later tasks. Excel import remains unimplemented.
Claude retains builder/native and restore rollback work. Installed Android was reported working by owner; Apple physical testing remains #13. Content imports remain paused.
