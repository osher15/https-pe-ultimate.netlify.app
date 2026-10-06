# Issue #23 — remaining design decisions

**Design notes only. No code or storage change is authorised by this document.** Existing periods, reports, XLSX/CSV, exemptions, measurement grid and manual final-grade override are already incorporated; do not rebuild them.

## A. Score-to-grade mapping

**Decision needed:** how a raw fitness result becomes a suggested grade without overwriting the teacher's final decision.

Options: (1) linear teacher rule around a target, e.g. 40 push-ups = 100 and each 5 fewer = −5 points; (2) threshold bands; (3) per-test rubric table. Recommended starting point: explicit per-test teacher rule with preview, clamp 0–100, and no automatic final-grade write.

Risks: direction differs by test (more may be better or less time may be better); sex/age norms must not be silently assumed; rounding can surprise; missing/exempt must never become zero; changing a rule must not rewrite historical raw measurements.

Acceptance checks: example 40→100 and 35→95 under that configured rule; legitimate zero remains zero; missing/exempt stays blank; lower-is-better tests work; duplicate names resolve by stable pupil ID; combined classes use each pupil's real-class policy; UI explains the rule and teacher override remains authoritative.

## B. Pupil sharing / access

**Decision needed:** what “student can see only their own progress” means without inventing accounts or exposing a roster.

Options: (1) teacher-generated single-pupil offline/PDF report (lowest risk, already aligned with current export); (2) expiring/read-only share package created by teacher; (3) future authenticated portal/account system. Recommended current scope: option 1, with option 2 only after privacy/security design. Do not imply cloud sync or accounts today.

Risks: guessed/forwarded links exposing another pupil, names in URLs, stale shared copies, parent/student device privacy, accidental class-level data inclusion.

Acceptance checks: export contains exactly one stable pupil's data; no other roster names/IDs; teacher explicitly initiates sharing; report states its period/date; revocation limitations are clear for downloaded files; no public roster endpoint.

## C. Attendance-day exemptions

**Decision needed:** whether a pupil can be exempt for one attendance day/session independently of the existing assessment-period/test exemption.

Options: (1) fourth attendance state “exempt” for a specific lesson/day; (2) absence with a separate reason flag; (3) leave attendance unchanged and exclude selected dates only in grade calculations. Recommended model to review: explicit per-session exempt state because it is visible and auditable, but it must not redefine assessment exemptions.

Risks: denominator errors, confusing absent vs exempt, combined-class sessions, backdated edits, attendance-fill accidentally creating grades, and reports disagreeing with exports.

Acceptance checks: exempt day is excluded from participation denominator and is not 0; ordinary absence remains distinct; partial attendance remains distinct; class/pupil report and CSV/XLSX agree; combined classes retain real pupil/class identity; changing an exemption does not overwrite manual/final grades; backup/restore preserves the decision.
