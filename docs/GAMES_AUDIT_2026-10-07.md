# Games integrity audit — 2026-10-07

Source main: `070c47ed7bde9c68904b4f1175cb53b6acab6c23`. Actual total **42**, owner expectation **78**, difference **-36**. 25 exception rows across 21 games. No content changed.

Language check calls I18N.tr, including current term/composite fallback, for each visible field in all five languages. Hebrew residue means fallback left untranslated text; this does not validate idiomatic quality. The yt field stores a watch-search query, not a verified video URL; external availability was not tested. Duration "open" is valid, not missing.

Equipment uses equipParts/equipConflicts and EQUIP_CHOICES. Unknown alternatives are approval questions, since generic "other equipment" and optional props are intentional. Review conflicts below test explicit foam/rubber, thick rope, four-cone and speaker decisions; remaining prose decisions need teacher review. Near-name matching is a heuristic, not proof of duplicate instructions.

## approve

| ID | Name | Category | Exception | Evidence / owner action |
|---|---|---|---|---|
| g-flags | תופסת דגלים | big | noncatalog equipment | 2 חפצים כ״דגל״; visible part: 2 חפצים כ״דגל״; no unavailable catalog match (not automatically a defect) |
| g-kadoreshet | כדורשת | ball | noncatalog equipment |  גומי נמתח ; visible part: רשת / גומי נמתח / חבל ארוך / ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-kingball | מלך הכדור (King Ball) | ball | noncatalog equipment | קווי המגרש ; visible part: קווי המגרש / קונוסים / חבלים / ציוד אחר לסימון אזור המלך; no unavailable catalog match (not automatically a defect) |
| g-crab | כדורגל סרטנים | fit | noncatalog equipment | 2 שערים מאולתרים; visible part: 2 שערים מאולתרים; no unavailable catalog match (not automatically a defect) |
| g-island | האי הבודד | social | noncatalog equipment | עיתונים ; visible part: עיתונים / מזרנים קטנים / חבלים / קונוסים / ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-island | האי הבודד | social | noncatalog equipment | משרוקית; visible part: רמקול או משרוקית או ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-bench | כדור ספסל | ball | noncatalog equipment | 2 ספסלים; visible part: 2 ספסלים או ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-catchtail | זנבות | break | noncatalog equipment | סרטים  /  חולצות לכל תלמיד; visible part: סרטים / חולצות לכל תלמיד; no unavailable catalog match (not automatically a defect) |
| g-poison | הכדור המורעל | fit | noncatalog equipment | משרוקית; visible part: רמקול או משרוקית או ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-parachute | מצנח קבוצתי | social | noncatalog equipment | מצנח פעילות  /  סדין  /  שמיכה  /  בד גדול ; visible part: מצנח פעילות / סדין / שמיכה / בד גדול / ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-medic | תופסת רופא | big | noncatalog equipment | סרט זיהוי לרופא; visible part: סרט זיהוי לרופא; no unavailable catalog match (not automatically a defect) |
| g-spikeball | כדור־רשת קרקעי (ראונדנט) | ball | noncatalog equipment | גומי נמתח; visible part: רשת נמוכה או גומי נמתח או ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-blind | מסלול מכשולים בעיניים עצומות | social | noncatalog equipment | מטפחות עיניים; visible part: מטפחות עיניים או ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-water | מרוץ ספוגים | water | noncatalog equipment | דליים; visible part: דליים; no unavailable catalog match (not automatically a defect) |
| g-water | מרוץ ספוגים | water | noncatalog equipment | ספוגים גדולים; visible part: ספוגים גדולים; no unavailable catalog match (not automatically a defect) |
| g-mem | זיכרון בתנועה | mind | noncatalog equipment | כרטיסיות זוגות; visible part: כרטיסיות זוגות; no unavailable catalog match (not automatically a defect) |
| g-dance | פריז בריקוד | classic | noncatalog equipment | משרוקית; visible part: רמקול או משרוקית או ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-crossnet | ארבע פינות כדורעף | ball | noncatalog equipment |  גומי נמתח ; visible part: רשת צולבת / גומי נמתח / חבל / ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-goldencone | קונוס הזהב | big | noncatalog equipment | סרטים לתופסים; visible part: סרטים לתופסים; no unavailable catalog match (not automatically a defect) |
| g-swampcrossing | חציית הביצה | social | noncatalog equipment |  דפי נייר ; visible part: מזרנים קטנים / דפי נייר / ציוד אחר כ״אבני דריכה״; no unavailable catalog match (not automatically a defect) |
| g-birdsnest | קן הציפורים | break | noncatalog equipment |  עצמים קטנים; visible part: כדור ספוג / עצמים קטנים; no unavailable catalog match (not automatically a defect) |
| g-teamjuggle | ג׳אגלינג קבוצתי (מעגל הזרימה) | mind | noncatalog equipment |  שקיות שעועית ; visible part: 3–8 כדורים רכים / שקיות שעועית / ציוד אחר; no unavailable catalog match (not automatically a defect) |
| g-bucketrelay | מירוץ דליים | water | noncatalog equipment | דליים / כוסות; visible part: דליים/כוסות; no unavailable catalog match (not automatically a defect) |
| g-bucketrelay | מירוץ דליים | water | noncatalog equipment | מקור מים; visible part: מקור מים; no unavailable catalog match (not automatically a defect) |
| g-bucketrelay | מירוץ דליים | water | noncatalog equipment | קו סיום מסומן; visible part: קו סיום מסומן; no unavailable catalog match (not automatically a defect) |

## fix

| ID | Name | Category | Exception | Evidence / owner action |
|---|---|---|---|---|
| — | — | — | No exceptions | — |

## add

The numerical shortfall is 36. This does not identify missing game IDs or authorize new imports. PR #46 is not merged; its reported 44 games cannot be counted as main. Re-run this tool after owner integration.
