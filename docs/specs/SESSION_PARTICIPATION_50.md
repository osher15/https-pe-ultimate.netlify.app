# #50 — Session participation adaptations specification

Status: specification and acceptance scenarios only. Main348c1ab; no product code, new global health flag, diagnosis, required feedback or grade automation.

## Three independent concepts

| Concept | Existing/proposed scope | Meaning and authority |
|---|---|---|
| Daily attendance | Existing date/class/student record, p/h/a/e unchanged | Attendance marking; current `splitByAttendance` puts p/h in present-only play group and a/e outside it. Never rewrite these marks from adaptation |
| Session adaptation | Proposed sessionId + stable sid | Optional normal/adapted/no physical activity and optional neutral role. No attendance or grade inference |
| Assessment exemption | Existing period/policy + sid + test | Existing exemption decision used by assessment reports; session notes neither create nor remove it |

A present pupil can do adapted work. A pupil with an assessment exemption can still participate in another activity. A no-physical-activity session does not exempt a whole period or imply absence. Manual grades and historical attempts remain authoritative and byte-identical.

## Proposed minimal data contract

One namespaced backup-eligible key, provisionally `session.adaptations.v1`:
`{version:1,sessions:{[sessionId]:{[sid]:{mode,role,note,updatedAt}}}}`.
Modes: `normal`, `adapted`, `noPhysical`; role optional `scorer`, `referee`, `equipment`, `observer`, or null. Private functional note up to180 characters, such as “no running today”; no diagnostic field or public health icon. Exact role suitability remains teacher/pupil choice. Do not infer a sid from a display name or a cid from a label. Validate own properties/enums/lengths/finite timestamp; reject unsafe keys and arrays masquerading as maps.

Default applies only to that active session. Reload restores that session's values; a new session has normal participation and no copied note/role. An ended session is retained as history and not silently reactivated. No retroactive rewriting after a pupil/class rename or class combination.

Optional extended duration is explicit, never the default: a separately versioned teacher-approved entry with sid, start/end dates and the same functional mode/role/note. Show its applicability in the next session and let the teacher confirm it; ending/deleting the extension does not erase historical session snapshots. Time zone follows the application's school/local-date convention. If date/session identity is unavailable, do not apply an extension silently. This extension is a later optional slice, not required for the first session-only implementation.

## Minimal workflow and eligibility

Keep one-tap p/h/a/e attendance. An optional pupil detail action opens participation settings in the active session. Save explicitly; failed write keeps draft. No mandatory prompt at lesson start/end and no silent replacement of a live lesson.

Groups preview has two distinct lists: eligible players and present non-playing roles. Reuse attendance filter first; apply session noPhysical only for automatic physical-player assignment. Adapted mode remains available but teacher chooses suitability per activity. Show why somebody is outside the proposed players privately; offer explicit teacher-controlled selection/filter choices, never silent dropping or a universal disability alternative. “All class” includes absent/exempt attendance records only under the existing explicit filter; it does not erase adaptation or automatically assign non-playing pupils to physical activity.

Public boards show neutral team/player information and optional neutral roles only. Never export names paired with injury, adaptation or exemption reasons. Pupil reports must use their own allowlist; private notes and other pupils' details remain excluded.

Backup/restore uses existing namespaced snapshot and native-mirror contracts only after schema validation is added. Unknown sid/session or invalid payload must produce a clear preview/rejection without partial writes or overwriting valid old data. No account, server or automatic cross-device sync.

## Acceptance tests (planned, no product implementation claim)

| ID | Given / when | Required result |
|---|---|---|
| P01 | Two same-name pupils, adaptation saved for one sid | Only that sid changes; attendance and grades unchanged |
| P02 | p pupil gets adapted/noPhysical and optional observer role | p stays p; assessment exemptions unchanged; roster/history retained |
| P03 | Existing period/test exemption, session set normal | Assessment report still honors exemption; old measurements untouched |
| P04 | a/e attendance, user toggles session adaptation | a/e unchanged; present-only uses existing semantics; all-class filter explained |
| P05 | Active session reload | Same sid/session values restored; labels may change without identity loss |
| P06 | Next session or next day starts | Session-only adaptation not carried; no forced dialog |
| P07 | Explicit extended interval starts/ends or is canceled | Applicability follows inclusive reviewed dates; teacher confirmation; historical snapshots retained |
| P08 | Rename class/pupil or combine classes | Stable identities retain correct association; no duplicate records/name matching |
| P09 | Inject save failure then Retry | Draft remains; one saved entry; no false success, mandatory feedback or grade change |
| P10 | Export/restore valid/invalid/unknown IDs and malicious keys | Valid round-trip/native-mirror preservation; invalid import rejects before writes; backup omission never silent |
| P11 | Public team panel and pupil-document export | No named functional/health/exemption notes; own-data allowlist enforced |
| P12 | EN/HE/AR/RU/ES,320/390px,offline | One-tap attendance preserved; optional detail usable in RTL/LTR; no intrusive alerts |
| P13 | Teacher manually edits grade and measurement history before adaptation save | Exact grade/history bytes unchanged after save/reload/backup/restore |
| P14 | Activity has no reviewed suitable adaptation | Teacher decides; equipment availability does not auto-certify safe participation |

Future implementation needs a fresh bounded reservation and schema/API review before product changes. Execute meaningful browser failure/persistence tests against that implementation; do not claim these written scenarios pass today. Native mirror shims, browser emulation and a real-class pilot must be reported separately.
