# Timing overrun audit — 2026-10-07

Source: `0e8b66ca3b2b46e837d281eaf0fc220b0f858949`. Read-only arithmetic on draft numbers; actual field duration is unknown. This is not pedagogical validation.

Current main uses the older broad timing ranges. The separate timing branch ccr-59f9e3d6-wvrg3u at 6662097 changes ranges and long-lesson handling; these findings must be rerun after owner integration. No pending branch was merged.

Coverage: 108 actual variants × 3 lesson lengths × 108 combinations (pace 3, transitions 3, water 2, weather 3, optional game 2) = 34992 rows. Outdoor, one selected main block; indoor weather equals normal. Multiple selected blocks and random choices are outside this deterministic path. Equipment is a separate eligibility check: it does not change timeOpts or fitted minutes.

Recommended = unscaled typical step minutes; allocated = main window after warm-up, cool-down and optional game; fitted = step sum plus combined transition/rest/water allowance. Explanation steps remain in the step sum. TIME_TRANS does not separately measure explanations or real rest. Overhead is reduced first. Underfilled windows are filled with free play by the generator; cannot-fit rows need an owner decision.

Important modelling ambiguity: hm-data.js describes v.t as including transitions, while the fitter adds a separate transition allowance. This audit reproduces the implementation; it cannot establish whether a specific activity double-counts transition time. The owner should clarify the intended meaning before approving numbers.

| Status | Scenarios |
|---|---:|
| ok | 27159 |
| cannot-fit | 4806 |
| under | 3027 |

Cannot-fit variants by lesson length: 30 min: 84 / 108; 45 min: 1 / 108; 60 min: 0 / 108. These counts mean at least one tested configuration cannot fit, not every use of the variant.

Input termination (child process, 2 s timeout): fractional=returned; NaN=returned; Infinity=returned; zero=returned; negative=returned.

The following table has one row per variant and lesson length. Each row aggregates all 108 configurations; the standard example is no game, normal pace/transitions/weather, water enabled. Min–max columns cover every tested configuration. Run `node tools/timing-audit.js --json` to inspect each configuration and equipment result separately.

| Variant | Lesson | Recommended | Allocated range | Fitted total range | Status counts (108 each) | Standard allocated / steps / overhead | Min / max pinned steps (standard) | Note |
|---|---:|---:|---|---|---|---|---|---|
| aerobic/mid/1 מעגל אירובי 6 תחנות — התקדמות הדרגתית | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+3+9+1 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| aerobic/mid/1 מעגל אירובי 6 תחנות — התקדמות הדרגתית | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 3+5+15+2 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/mid/1 מעגל אירובי 6 תחנות — התקדמות הדרגתית | 60 | 22 | 31–45 | 31–45 | ok: 108 | 42 / 4+7+21+3 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/mid/2 ריצת קצב מודרגת — 3 בלוקים | 30 | 20 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+4+4+2 / 3 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| aerobic/mid/2 ריצת קצב מודרגת — 3 בלוקים | 45 | 20 | 23–34 | 23–34 | ok: 108 | 32 / 3+7+6+6+4 / 6 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| aerobic/mid/2 ריצת קצב מודרגת — 3 בלוקים | 60 | 20 | 31–45 | 31–44 | under: 42; ok: 66 | 42 / 3+9+9+9+5 / 6 |  / 1,2,3,4,5 | Maximum reached in some configurations; residual allocated to free play |
| aerobic/mid/3 טאבטה אירובית — 8×20/10 שנ׳ | 30 | 7 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+4+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/mid/3 טאבטה אירובית — 8×20/10 שנ׳ | 45 | 7 | 23–34 | 23–32 | under: 60; ok: 48 | 32 / 3+8+8+3 / 7 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| aerobic/mid/3 טאבטה אירובית — 8×20/10 שנ׳ | 60 | 7 | 31–45 | 24–32 | under: 105; ok: 3 | 42 / 3+8+8+3 / 7 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| aerobic/high/1 אינטרוולים 8×200 מ׳ — יחס 1:1 | 30 | 26 | 14–20 | 19–20 | cannot-fit: 72; ok: 36 | 18 / 2+4+6+4+3 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| aerobic/high/1 אינטרוולים 8×200 מ׳ — יחס 1:1 | 45 | 26 | 23–34 | 23–34 | ok: 108 | 32 / 2+5+8+5+4 / 8 | 1 /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/high/1 אינטרוולים 8×200 מ׳ — יחס 1:1 | 60 | 26 | 31–45 | 31–45 | ok: 108 | 42 / 3+7+12+7+5 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/high/2 פירמידת מרחקים 1-2-3-4-3-2-1 | 30 | 36 | 14–20 | 24–24 | cannot-fit: 108 | 18 / 1+8+6+8+1 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| aerobic/high/2 פירמידת מרחקים 1-2-3-4-3-2-1 | 45 | 36 | 23–34 | 24–34 | ok: 90; cannot-fit: 18 | 32 / 1+9+6+9+1 / 6 | 1,3,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| aerobic/high/2 פירמידת מרחקים 1-2-3-4-3-2-1 | 60 | 36 | 31–45 | 31–45 | ok: 108 | 42 / 2+12+8+12+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/high/3 טאבטה רצה — 8×20/10 שנ׳ בספרינט | 30 | 8 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+4+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| aerobic/high/3 טאבטה רצה — 8×20/10 שנ׳ בספרינט | 45 | 8 | 23–34 | 23–32 | under: 60; ok: 48 | 32 / 3+8+8+3 / 7 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| aerobic/high/3 טאבטה רצה — 8×20/10 שנ׳ בספרינט | 60 | 8 | 31–45 | 24–32 | under: 105; ok: 3 | 42 / 3+8+8+3 / 7 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| strength/mid/1 מעגל כוח 6 תחנות — טכניקה לפני עומס | 30 | 28 | 14–20 | 19–20 | cannot-fit: 72; ok: 36 | 18 / 4+3+2+8+2 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| strength/mid/1 מעגל כוח 6 תחנות — טכניקה לפני עומס | 45 | 28 | 23–34 | 23–34 | ok: 108 | 32 / 5+4+2+11+2 / 8 | 3,5 /  | Steps + transition/rest/water allowance fit every tested window |
| strength/mid/1 מעגל כוח 6 תחנות — טכניקה לפני עומס | 60 | 28 | 31–45 | 31–45 | ok: 108 | 42 / 6+6+4+15+3 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| strength/mid/2 זוגות מאמנים — משוב הדדי | 30 | 24 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+6+3 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| strength/mid/2 זוגות מאמנים — משוב הדדי | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 3+9+10+5 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| strength/mid/2 זוגות מאמנים — משוב הדדי | 60 | 24 | 31–45 | 31–45 | ok: 108 | 42 / 4+13+14+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| strength/mid/3 יום פלג עליון + יום פלג תחתון | 30 | 21 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 1+6+6+2 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| strength/mid/3 יום פלג עליון + יום פלג תחתון | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 2+11+11+3 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| strength/mid/3 יום פלג עליון + יום פלג תחתון | 60 | 21 | 31–45 | 31–45 | ok: 108 | 42 / 3+15+15+4 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| strength/high/1 מעגל כוח 8 תחנות — התקדמות לגרסה קשה | 30 | 30 | 14–20 | 21–21 | cannot-fit: 108 | 18 / 5+6+2+6+2 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| strength/high/1 מעגל כוח 8 תחנות — התקדמות לגרסה קשה | 45 | 30 | 23–34 | 23–34 | ok: 108 | 32 / 6+7+2+7+2 / 8 | 3,5 /  | Steps + transition/rest/water allowance fit every tested window |
| strength/high/1 מעגל כוח 8 תחנות — התקדמות לגרסה קשה | 60 | 30 | 31–45 | 31–45 | ok: 108 | 42 / 8+9+4+9+4 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| strength/high/2 EMOM 12 דקות — עומס עולה | 30 | 16 | 14–20 | 14–20 | ok: 108 | 18 / 1+3+4+4+1 / 5 | 1,2,5 /  | Steps + transition/rest/water allowance fit every tested window |
| strength/high/2 EMOM 12 דקות — עומס עולה | 45 | 16 | 23–34 | 23–34 | under: 24; ok: 84 | 32 / 3+7+7+6+3 / 6 |  / 1,2,3,5 | Maximum reached in some configurations; residual allocated to free play |
| strength/high/2 EMOM 12 דקות — עומס עולה | 60 | 16 | 31–45 | 29–36 | under: 81; ok: 27 | 42 / 3+7+7+7+3 / 6 |  / 1,2,3,4,5 | Maximum reached in some configurations; residual allocated to free play |
| strength/high/3 סופרסטים עליון-תחתון | 30 | 20 | 14–20 | 14–20 | ok: 108 | 18 / 1+6+6+1 / 4 | 1,2,3,4 /  | Steps + transition/rest/water allowance fit every tested window |
| strength/high/3 סופרסטים עליון-תחתון | 45 | 20 | 23–34 | 23–34 | ok: 108 | 32 / 2+11+11+3 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| strength/high/3 סופרסטים עליון-תחתון | 60 | 20 | 31–45 | 31–45 | ok: 108 | 42 / 3+15+15+4 / 5 |  / 1,4 | Steps + transition/rest/water allowance fit every tested window |
| core/mid/1 סבב ליבה 5 תחנות — מבוסס זמן | 30 | 16 | 14–20 | 14–20 | ok: 108 | 18 / 1+4+1+1+4 / 7 | 1,2,3,4,5 /  | Steps + transition/rest/water allowance fit every tested window |
| core/mid/1 סבב ליבה 5 תחנות — מבוסס זמן | 45 | 16 | 23–34 | 23–34 | ok: 108 | 32 / 3+8+3+3+7 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| core/mid/1 סבב ליבה 5 תחנות — מבוסס זמן | 60 | 16 | 31–45 | 31–45 | under: 33; ok: 75 | 42 / 4+11+4+4+11 / 8 |  / 1,2,3,4,5 | Maximum reached in some configurations; residual allocated to free play |
| core/mid/2 אתגר היציבה — 5 תחנות איזון | 30 | 14 | 14–20 | 14–20 | ok: 108 | 18 / 1+3+4+4 / 6 | 1,2 /  | Steps + transition/rest/water allowance fit every tested window |
| core/mid/2 אתגר היציבה — 5 תחנות איזון | 45 | 14 | 23–34 | 23–34 | ok: 105; under: 3 | 32 / 3+8+7+7 / 7 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| core/mid/2 אתגר היציבה — 5 תחנות איזון | 60 | 14 | 31–45 | 31–40 | under: 57; ok: 51 | 42 / 3+9+9+9 / 7 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| core/mid/3 ליבה נגד סיבוב — מבוא | 30 | 13 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+3+5 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| core/mid/3 ליבה נגד סיבוב — מבוא | 45 | 13 | 23–34 | 23–34 | under: 36; ok: 72 | 32 / 3+7+5+11 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| core/mid/3 ליבה נגד סיבוב — מבוא | 60 | 13 | 31–45 | 28–34 | under: 96; ok: 12 | 42 / 3+7+5+11 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| core/high/1 סבב ליבה 6 תחנות ×2 — עם שיא כיתתי | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+4+1 / 3 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| core/high/1 סבב ליבה 6 תחנות ×2 — עם שיא כיתתי | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 3+7+7+5+2 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| core/high/1 סבב ליבה 6 תחנות ×2 — עם שיא כיתתי | 60 | 22 | 31–45 | 31–45 | ok: 108 | 42 / 4+10+10+7+3 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| core/high/2 ליבה אנטי־תנועה — התנגדות לסיבוב ולכיפוף | 30 | 21 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 1+2+3+3+6 / 3 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| core/high/2 ליבה אנטי־תנועה — התנגדות לסיבוב ולכיפוף | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 2+5+4+4+11 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| core/high/2 ליבה אנטי־תנועה — התנגדות לסיבוב ולכיפוף | 60 | 21 | 31–45 | 31–45 | ok: 105; under: 3 | 42 / 3+6+6+6+15 / 6 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| core/high/3 ליבה נפיצה — רוטציות מבוקרות | 30 | 11 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+4+4 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| core/high/3 ליבה נפיצה — רוטציות מבוקרות | 45 | 11 | 23–34 | 23–34 | under: 27; ok: 81 | 32 / 3+8+8+8 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| core/high/3 ליבה נפיצה — רוטציות מבוקרות | 60 | 11 | 31–45 | 29–35 | under: 84; ok: 24 | 42 / 3+8+8+8 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| speed/mid/1 טכניקה + ספרינטים קצרים | 30 | 16 | 14–20 | 14–20 | ok: 108 | 18 / 4+1+7+2 / 4 | 2,4 /  | Steps + transition/rest/water allowance fit every tested window |
| speed/mid/1 טכניקה + ספרינטים קצרים | 45 | 16 | 23–34 | 23–34 | ok: 108 | 32 / 6+3+12+6 / 5 |  / 2 | Steps + transition/rest/water allowance fit every tested window |
| speed/mid/1 טכניקה + ספרינטים קצרים | 60 | 16 | 31–45 | 31–40 | under: 57; ok: 51 | 42 / 7+3+15+7 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| speed/mid/2 מסלול זריזות 4 תחנות | 30 | 18 | 14–20 | 14–20 | ok: 108 | 18 / 2+5+7 / 4 | 1 /  | Steps + transition/rest/water allowance fit every tested window |
| speed/mid/2 מסלול זריזות 4 תחנות | 45 | 18 | 23–34 | 23–34 | ok: 108 | 32 / 5+8+14 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| speed/mid/2 מסלול זריזות 4 תחנות | 60 | 18 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 6+11+20 / 5 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| speed/mid/3 תרגילי תגובה בסיסיים | 30 | 12 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+4+4 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| speed/mid/3 תרגילי תגובה בסיסיים | 45 | 12 | 23–34 | 23–34 | under: 27; ok: 81 | 32 / 3+8+8+8 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| speed/mid/3 תרגילי תגובה בסיסיים | 60 | 12 | 31–45 | 29–35 | under: 84; ok: 24 | 42 / 3+8+8+8 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| speed/high/1 בלוק מהירות מלא — טכניקה, זינוק, תגובה | 30 | 41 | 14–20 | 22–22 | cannot-fit: 108 | 18 / 5+3+8+4+2 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| speed/high/1 בלוק מהירות מלא — טכניקה, זינוק, תגובה | 45 | 41 | 23–34 | 23–34 | ok: 108 | 32 / 6+3+10+5+2 / 6 | 2,5 /  | Steps + transition/rest/water allowance fit every tested window |
| speed/high/1 בלוק מהירות מלא — טכניקה, זינוק, תגובה | 60 | 41 | 31–45 | 31–45 | ok: 108 | 42 / 8+5+14+6+3 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| speed/high/2 מהירות בהקשר משחק | 30 | 20 | 14–20 | 14–20 | ok: 108 | 18 / 1+3+4+5+1 / 4 | 1,2,3,4,5 /  | Steps + transition/rest/water allowance fit every tested window |
| speed/high/2 מהירות בהקשר משחק | 45 | 20 | 23–34 | 23–34 | ok: 108 | 32 / 2+5+7+10+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| speed/high/2 מהירות בהקשר משחק | 60 | 20 | 31–45 | 31–45 | under: 12; ok: 96 | 42 / 3+7+10+13+3 / 6 |  / 1,2,5 | Maximum reached in some configurations; residual allocated to free play |
| speed/high/3 שינוי כיוון בעצימות גבוהה | 30 | 16 | 14–20 | 14–20 | ok: 108 | 18 / 1+5+5+3 / 4 | 1 /  | Steps + transition/rest/water allowance fit every tested window |
| speed/high/3 שינוי כיוון בעצימות גבוהה | 45 | 16 | 23–34 | 23–34 | ok: 108 | 32 / 3+11+9+4 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| speed/high/3 שינוי כיוון בעצימות גבוהה | 60 | 16 | 31–45 | 31–40 | under: 57; ok: 51 | 42 / 3+13+11+5 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/mid/1 תחנות ניידות — 6 מפרקים | 30 | 16 | 14–20 | 14–20 | ok: 108 | 18 / 1+6+7 / 4 | 1 /  | Steps + transition/rest/water allowance fit every tested window |
| flex/mid/1 תחנות ניידות — 6 מפרקים | 45 | 16 | 23–34 | 23–34 | ok: 108 | 32 / 3+12+12 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| flex/mid/1 תחנות ניידות — 6 מפרקים | 60 | 16 | 31–45 | 31–41 | under: 54; ok: 54 | 42 / 3+15+15 / 5 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| flex/mid/2 יוגה לתלמידים — רצף מונחה | 30 | 14 | 14–20 | 14–20 | ok: 108 | 18 / 2+5+5+2 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| flex/mid/2 יוגה לתלמידים — רצף מונחה | 45 | 14 | 23–34 | 23–34 | under: 36; ok: 72 | 32 / 3+9+11+3 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/mid/2 יוגה לתלמידים — רצף מונחה | 60 | 14 | 31–45 | 28–34 | under: 96; ok: 12 | 42 / 3+9+11+3 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/mid/3 מתיחות דינמיות לפני משחק | 30 | 12 | 14–20 | 14–20 | ok: 108 | 18 / 2+5+5+2 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| flex/mid/3 מתיחות דינמיות לפני משחק | 45 | 12 | 23–34 | 22–28 | under: 84; ok: 24 | 32 / 3+7+7+3 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/mid/3 מתיחות דינמיות לפני משחק | 60 | 12 | 31–45 | 22–28 | under: 108 | 42 / 3+7+7+3 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/high/1 ניידות ממוקדת ספורט — מיפוי אישי | 30 | 17 | 14–20 | 14–20 | ok: 108 | 18 / 2+2+8+2 / 4 | 1,2,4 /  | Steps + transition/rest/water allowance fit every tested window |
| flex/high/1 ניידות ממוקדת ספורט — מיפוי אישי | 45 | 17 | 23–34 | 23–34 | under: 9; ok: 99 | 32 / 5+5+12+5 / 5 |  / 1,2,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/high/1 ניידות ממוקדת ספורט — מיפוי אישי | 60 | 17 | 31–45 | 31–37 | under: 69; ok: 39 | 42 / 5+5+14+5 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| flex/high/2 רצף התאוששות — אחרי מאמץ גבוה | 30 | 12 | 14–20 | 14–20 | ok: 108 | 18 / 7+3+5 / 3 |  /  | Steps + transition/rest/water allowance fit every tested window |
| flex/high/2 רצף התאוששות — אחרי מאמץ גבוה | 45 | 12 | 23–34 | 23–28 | under: 78; ok: 30 | 32 / 10+4+8 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| flex/high/2 רצף התאוששות — אחרי מאמץ גבוה | 60 | 12 | 31–45 | 23–28 | under: 108 | 42 / 10+4+8 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| flex/high/3 מתיחה פעילה בעזרת שותף — מבוא ל-PNF | 30 | 16 | 14–20 | 14–20 | ok: 108 | 18 / 1+3+5+5 / 4 | 1,2 /  | Steps + transition/rest/water allowance fit every tested window |
| flex/high/3 מתיחה פעילה בעזרת שותף — מבוא ל-PNF | 45 | 16 | 23–34 | 23–34 | ok: 102; under: 6 | 32 / 3+6+10+8 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| flex/high/3 מתיחה פעילה בעזרת שותף — מבוא ל-PNF | 60 | 16 | 31–45 | 31–38 | under: 60; ok: 48 | 42 / 3+7+11+9 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| basket/mid/1 כדרור — יסודות בשליטה | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 1+2+2+4+4+3 / 2 | 1,2,3,4,5,6 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| basket/mid/1 כדרור — יסודות בשליטה | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 2+4+3+6+6+4 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/mid/1 כדרור — יסודות בשליטה | 60 | 22 | 31–45 | 31–45 | ok: 105; under: 3 | 42 / 3+6+4+8+8+6 / 7 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| basket/mid/2 מסירות וקליטה בתנועה | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+7 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| basket/mid/2 מסירות וקליטה בתנועה | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+6+6+11 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/mid/2 מסירות וקליטה בתנועה | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+8+8+16 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| basket/mid/3 הטעיות יסוד בכדרור — כתף ובין הרגליים | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+6+4 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| basket/mid/3 הטעיות יסוד בכדרור — כתף ובין הרגליים | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 5+7+9+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/mid/3 הטעיות יסוד בכדרור — כתף ובין הרגליים | 60 | 23 | 31–45 | 31–45 | ok: 105; under: 3 | 42 / 6+10+12+9 / 5 |  /  | Maximum reached in some configurations; residual allocated to free play |
| basket/high/1 מסור וחתוך (Give & Go) — בהדרגה | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+4+6+2 / 1 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| basket/high/1 מסור וחתוך (Give & Go) — בהדרגה | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 2+6+6+9+3 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/high/1 מסור וחתוך (Give & Go) — בהדרגה | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 3+8+8+12+5 / 6 |  / 1,5 | Maximum reached in some configurations; residual allocated to free play |
| basket/high/2 טורניר 3×3 עם תחנת עונשין | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+6+2 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| basket/high/2 טורניר 3×3 עם תחנת עונשין | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 3+9+9+4 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/high/2 טורניר 3×3 עם תחנת עונשין | 60 | 22 | 31–45 | 31–45 | ok: 108 | 42 / 4+13+13+5 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/high/3 כדרור הגנתי ושינוי קצב מול לחץ | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+6+1 / 1 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| basket/high/3 כדרור הגנתי ושינוי קצב מול לחץ | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 3+6+6+9+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| basket/high/3 כדרור הגנתי ושינוי קצב מול לחץ | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+8+8+12+3 / 6 |  / 1,5 | Maximum reached in some configurations; residual allocated to free play |
| volley/mid/1 מהיסודות למשחק — כדורשת כגשר | 30 | 22 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+4+6 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| volley/mid/1 מהיסודות למשחק — כדורשת כגשר | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+6+6+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| volley/mid/1 מהיסודות למשחק — כדורשת כגשר | 60 | 22 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 7+9+8+13 / 5 |  / 1,2 | Maximum reached in some configurations; residual allocated to free play |
| volley/mid/2 כדורשת מתקדם — שלוש רמות באותה כיתה | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+4+6 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| volley/mid/2 כדורשת מתקדם — שלוש רמות באותה כיתה | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 3+7+7+10 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| volley/mid/2 כדורשת מתקדם — שלוש רמות באותה כיתה | 60 | 22 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 3+10+10+14 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| volley/mid/3 הגשה עליונה — יסודות | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+2+4+7 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| volley/mid/3 הגשה עליונה — יסודות | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+5+7+11 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| volley/mid/3 הגשה עליונה — יסודות | 60 | 22 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 5+7+9+16 / 5 |  / 1,2 | Maximum reached in some configurations; residual allocated to free play |
| volley/high/1 קבלה–הרמה–התקפה — רצף בשלשות | 30 | 25 | 14–20 | 19–20 | cannot-fit: 72; ok: 36 | 18 / 3+3+3+4+6 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| volley/high/1 קבלה–הרמה–התקפה — רצף בשלשות | 45 | 25 | 23–34 | 23–34 | ok: 108 | 32 / 5+4+4+5+8 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| volley/high/1 קבלה–הרמה–התקפה — רצף בשלשות | 60 | 25 | 31–45 | 31–45 | ok: 108 | 42 / 7+7+5+7+10 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| volley/high/2 משחק 4×4 עם משימות טקטיות מתחלפות | 30 | 24 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 5+5+5+2 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| volley/high/2 משחק 4×4 עם משימות טקטיות מתחלפות | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 8+8+8+3 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| volley/high/2 משחק 4×4 עם משימות טקטיות מתחלפות | 60 | 24 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 11+11+10+5 / 5 |  / 4 | Maximum reached in some configurations; residual allocated to free play |
| volley/high/3 חסימה וקבלת הגשה חזקה | 30 | 22 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+4+4 / 4 | 1,2,3,4 /  | Steps + transition/rest/water allowance fit every tested window |
| volley/high/3 חסימה וקבלת הגשה חזקה | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+8+8+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| volley/high/3 חסימה וקבלת הגשה חזקה | 60 | 22 | 31–45 | 31–45 | ok: 105; under: 3 | 42 / 6+11+11+9 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| handball/mid/1 מסירה בתנועה → זריקה | 30 | 25 | 14–20 | 18–20 | ok: 54; cannot-fit: 54 | 18 / 3+3+2+4+6 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| handball/mid/1 מסירה בתנועה → זריקה | 45 | 25 | 23–34 | 23–34 | ok: 108 | 32 / 5+4+4+5+8 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| handball/mid/1 מסירה בתנועה → זריקה | 60 | 25 | 31–45 | 31–45 | ok: 108 | 42 / 7+6+5+7+11 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| handball/mid/2 כדור ספסל כגשר לכדוריד | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 1+7+7 / 3 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| handball/mid/2 כדור ספסל כגשר לכדוריד | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 3+13+12 / 4 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| handball/mid/2 כדור ספסל כגשר לכדוריד | 60 | 22 | 31–45 | 31–43 | under: 45; ok: 63 | 42 / 3+17+17 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| handball/mid/3 זריקת קפיצה — טכניקה מפורקת | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 3+3+4+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| handball/mid/3 זריקת קפיצה — טכניקה מפורקת | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+5+7+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| handball/mid/3 זריקת קפיצה — טכניקה מפורקת | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 7+7+9+14 / 5 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| handball/high/1 התקפה מהירה — 3 מסירות | 30 | 24 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+7 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| handball/high/1 התקפה מהירה — 3 מסירות | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 4+6+6+11 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| handball/high/1 התקפה מהירה — 3 מסירות | 60 | 24 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+8+9+15 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| handball/high/2 הגנת 6:0 מול התקפה | 30 | 22 | 14–20 | 14–20 | ok: 108 | 18 / 2+4+9 / 3 | 1,2 /  | Steps + transition/rest/water allowance fit every tested window |
| handball/high/2 הגנת 6:0 מול התקפה | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+8+15 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| handball/high/2 הגנת 6:0 מול התקפה | 60 | 22 | 31–45 | 31–42 | under: 51; ok: 57 | 42 / 6+10+20 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| handball/high/3 1 נגד 1 התקפי מול שוער | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| handball/high/3 1 נגד 1 התקפי מול שוער | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+7+9 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| handball/high/3 1 נגד 1 התקפי מול שוער | 60 | 22 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+10+9+13 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| soccer/mid/1 שליטה → מסירה → משחק קטן | 30 | 22 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 4+4+3+6 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| soccer/mid/1 שליטה → מסירה → משחק קטן | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 6+6+5+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/mid/1 שליטה → מסירה → משחק קטן | 60 | 22 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 9+8+7+13 / 5 |  / 1,3 | Maximum reached in some configurations; residual allocated to free play |
| soccer/mid/2 רונדו 4 נגד 2 | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| soccer/mid/2 רונדו 4 נגד 2 | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 3+8+8+8 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/mid/2 רונדו 4 נגד 2 | 60 | 23 | 31–45 | 31–45 | ok: 108 | 42 / 4+11+11+11 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/mid/3 בעיטות לשער — טכניקה ודיוק | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+3+6+5 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| soccer/mid/3 בעיטות לשער — טכניקה ודיוק | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+6+9+8 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/mid/3 בעיטות לשער — טכניקה ודיוק | 60 | 22 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+8+13+11 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| soccer/high/1 מעברים ומרחב — יצירת רוחב ועומק | 30 | 24 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| soccer/high/1 מעברים ומרחב — יצירת רוחב ועומק | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 4+6+7+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/high/1 מעברים ומרחב — יצירת רוחב ועומק | 60 | 24 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 6+8+9+14 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| soccer/high/2 טורניר מגרשים קטנים | 30 | 24 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+7+2 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| soccer/high/2 טורניר מגרשים קטנים | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 3+10+11+3 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/high/2 טורניר מגרשים קטנים | 60 | 24 | 31–45 | 31–45 | ok: 108 | 42 / 4+13+16+4 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/high/3 הגנה 1 נגד 1 — עיכוב וכיוון | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| soccer/high/3 הגנה 1 נגד 1 — עיכוב וכיוון | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 3+8+8+8 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| soccer/high/3 הגנה 1 נגד 1 — עיכוב וכיוון | 60 | 23 | 31–45 | 31–45 | ok: 108 | 42 / 4+11+11+11 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| altball/mid/1 תחנות ענפים — טעימה משלושה עולמות | 30 | 34 | 14–20 | 20–20 | cannot-fit: 72; ok: 36 | 18 / 1+6+6+6+1 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| altball/mid/1 תחנות ענפים — טעימה משלושה עולמות | 45 | 34 | 23–34 | 23–34 | ok: 108 | 32 / 1+7+7+8+1 / 8 | 1,5 /  | Steps + transition/rest/water allowance fit every tested window |
| altball/mid/1 תחנות ענפים — טעימה משלושה עולמות | 60 | 34 | 31–45 | 31–45 | ok: 108 | 42 / 2+10+10+10+2 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| altball/mid/2 אלטימטפריזבי מבוא | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+3+6 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| altball/mid/2 אלטימטפריזבי מבוא | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+7+5+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| altball/mid/2 אלטימטפריזבי מבוא | 60 | 22 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 6+9+7+15 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| altball/high/1 אלטימטפריזבי מלא — עם שיפוט עצמי | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 3+2+8+2 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| altball/high/1 אלטימטפריזבי מלא — עם שיפוט עצמי | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+3+16+3 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| altball/high/1 אלטימטפריזבי מלא — עם שיפוט עצמי | 60 | 22 | 31–45 | 31–45 | ok: 108 | 42 / 6+5+21+5 / 5 |  / 2,4 | Steps + transition/rest/water allowance fit every tested window |
| altball/high/2 ראונדנט (כדור־רשת קרקעי) | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+3+6+4 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| altball/high/2 ראונדנט (כדור־רשת קרקעי) | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+5+10+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| altball/high/2 ראונדנט (כדור־רשת קרקעי) | 60 | 22 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 6+7+14+10 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| athletics/mid/1 מהתחלה לקו הסיום — טכניקת זינוק והאצה | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+6+3 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| athletics/mid/1 מהתחלה לקו הסיום — טכניקת זינוק והאצה | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+7+10+5 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| athletics/mid/1 מהתחלה לקו הסיום — טכניקת זינוק והאצה | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 7+10+13+7 / 5 |  / 1,2,4 | Maximum reached in some configurations; residual allocated to free play |
| athletics/mid/2 ריצת סבולת מדורגת | 30 | 21 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+5+5 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| athletics/mid/2 ריצת סבולת מדורגת | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 3+7+9+8 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| athletics/mid/2 ריצת סבולת מדורגת | 60 | 21 | 31–45 | 31–44 | under: 42; ok: 66 | 42 / 3+9+12+12 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| athletics/mid/3 היכרות עם ריצת מכשולים נמוכים | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+5+5 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| athletics/mid/3 היכרות עם ריצת מכשולים נמוכים | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+8+8 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| athletics/mid/3 היכרות עם ריצת מכשולים נמוכים | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 5+9+12+11 / 5 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| athletics/high/1 יום מדידה 60/100 — עם תעודות | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 4+4+4+3+2 / 1 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| athletics/high/1 יום מדידה 60/100 — עם תעודות | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 6+6+6+5+3 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| athletics/high/1 יום מדידה 60/100 — עם תעודות | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 9+8+8+6+5 / 6 |  / 5 | Maximum reached in some configurations; residual allocated to free play |
| athletics/high/2 ריצת קצב 1000 מ׳ | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 3+8+4 / 3 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| athletics/high/2 ריצת קצב 1000 מ׳ | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+15+8 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| athletics/high/2 ריצת קצב 1000 מ׳ | 60 | 22 | 31–45 | 31–43 | under: 45; ok: 63 | 42 / 7+20+10 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| athletics/high/3 ריצת מכשולים — קצב צעדים | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+6+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| athletics/high/3 ריצת מכשולים — קצב צעדים | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+10+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| athletics/high/3 ריצת מכשולים — קצב צעדים | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 5+10+13+9 / 5 |  / 1,2,4 | Maximum reached in some configurations; residual allocated to free play |
| jumps/mid/1 קפיצה למרחק מהמקום | 30 | 21 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 3+2+7+3 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| jumps/mid/1 קפיצה למרחק מהמקום | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 5+4+13+5 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/mid/1 קפיצה למרחק מהמקום | 60 | 21 | 31–45 | 31–44 | under: 42; ok: 66 | 42 / 7+5+17+7 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| jumps/mid/2 תחנות קפיצה והטלה | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 4+4+4+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| jumps/mid/2 תחנות קפיצה והטלה | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 6+7+6+6 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/mid/2 תחנות קפיצה והטלה | 60 | 23 | 31–45 | 31–45 | ok: 108 | 42 / 8+9+9+9 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/mid/3 קפיצה לגובה — טכניקת מספריים | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+5+6 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| jumps/mid/3 קפיצה לגובה — טכניקת מספריים | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+6+8+9 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/mid/3 קפיצה לגובה — טכניקת מספריים | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+8+11+13 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| jumps/high/1 פליומטריקה מבוקרת | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+5+4 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| jumps/high/1 פליומטריקה מבוקרת | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+8+8+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/high/1 פליומטריקה מבוקרת | 60 | 22 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+12+11+9 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| jumps/high/2 הטלות מדודות — שלושה סגנונות | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 4+4+4+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| jumps/high/2 הטלות מדודות — שלושה סגנונות | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 7+7+7+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/high/2 הטלות מדודות — שלושה סגנונות | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 9+10+9+9 / 5 |  / 1,2,4 | Maximum reached in some configurations; residual allocated to free play |
| jumps/high/3 הטלת דיסקוס מבוא — סיבוב מבוקר | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| jumps/high/3 הטלת דיסקוס מבוא — סיבוב מבוקר | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+6+7+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| jumps/high/3 הטלת דיסקוס מבוא — סיבוב מבוקר | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 5+9+10+13 / 5 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| gym/mid/1 תחנות יסוד — 4 מיומנויות | 30 | 24 | 14–20 | 18–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+4+4+4 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| gym/mid/1 תחנות יסוד — 4 מיומנויות | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 4+5+5+5+5 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/mid/1 תחנות יסוד — 4 מיומנויות | 60 | 24 | 31–45 | 31–45 | ok: 108 | 42 / 4+8+8+7+7 / 8 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/mid/2 מסלול תנועה רציף | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+6+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| gym/mid/2 מסלול תנועה רציף | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+9+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/mid/2 מסלול תנועה רציף | 60 | 23 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 5+10+13+9 / 5 |  / 1,2 | Maximum reached in some configurations; residual allocated to free play |
| gym/mid/3 גלגול לאחור — מבוא מבוקר | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+5+4 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| gym/mid/3 גלגול לאחור — מבוא מבוקר | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+9+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/mid/3 גלגול לאחור — מבוא מבוקר | 60 | 22 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 5+10+12+10 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| gym/high/1 אקרו בזוגות — בניית רצף | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+6+4 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| gym/high/1 אקרו בזוגות — בניית רצף | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 5+6+9+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/high/1 אקרו בזוגות — בניית רצף | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 7+8+13+9 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| gym/high/2 פרקור מבוקר באולם | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+6+4 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| gym/high/2 פרקור מבוקר באולם | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 5+7+9+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/high/2 פרקור מבוקר באולם | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 7+9+13+8 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| gym/high/3 רצף אקרובטי אישי — 3 מיומנויות | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+5+5 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| gym/high/3 רצף אקרובטי אישי — 3 מיומנויות | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+8+8 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| gym/high/3 רצף אקרובטי אישי — 3 מיומנויות | 60 | 23 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 5+10+11+11 / 5 |  / 1,2 | Maximum reached in some configurations; residual allocated to free play |
| dance/mid/1 רצף כיתתי מתפתח | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+5+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| dance/mid/1 רצף כיתתי מתפתח | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+7+8+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/mid/1 רצף כיתתי מתפתח | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 7+9+11+10 / 5 |  / 1,2,4 | Maximum reached in some configurations; residual allocated to free play |
| dance/mid/2 תחנות סגנון | 30 | 24 | 14–20 | 18–20 | ok: 54; cannot-fit: 54 | 18 / 6+6+6 / 0 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| dance/mid/2 תחנות סגנון | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 9+9+9 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/mid/2 תחנות סגנון | 60 | 24 | 31–45 | 31–45 | ok: 108 | 42 / 13+12+12 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/mid/3 ריקוד עם — צעד בסיס | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+5+5 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| dance/mid/3 ריקוד עם — צעד בסיס | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+8+8 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/mid/3 ריקוד עם — צעד בסיס | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 5+9+12+11 / 5 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| dance/high/1 יצירה בקבוצות — כוריאוגרפיה קצרה | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+7+3+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| dance/high/1 יצירה בקבוצות — כוריאוגרפיה קצרה | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+11+5+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/high/1 יצירה בקבוצות — כוריאוגרפיה קצרה | 60 | 23 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 5+16+7+9 / 5 |  / 1,3 | Maximum reached in some configurations; residual allocated to free play |
| dance/high/2 קצב ותופים — Body Percussion | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+4+4 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| dance/high/2 קצב ותופים — Body Percussion | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+8+7+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/high/2 קצב ותופים — Body Percussion | 60 | 22 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 7+10+10+10 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| dance/high/3 היפ-הופ — שילוב תנועות בסיס | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 3+4+4+4 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| dance/high/3 היפ-הופ — שילוב תנועות בסיס | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+8+7+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| dance/high/3 היפ-הופ — שילוב תנועות בסיס | 60 | 22 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 7+10+10+10 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| beepprep/mid/1 היכרות עם הקצב | 30 | 21 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 3+3+6+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| beepprep/mid/1 היכרות עם הקצב | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 5+5+10+7 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| beepprep/mid/1 היכרות עם הקצב | 60 | 21 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 7+7+14+9 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| beepprep/mid/2 תרגול טכניקת פנייה | 30 | 21 | 14–20 | 14–20 | ok: 108 | 18 / 1+4+6+3 / 4 | 1,2,3,4 /  | Steps + transition/rest/water allowance fit every tested window |
| beepprep/mid/2 תרגול טכניקת פנייה | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 3+8+11+5 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| beepprep/mid/2 תרגול טכניקת פנייה | 60 | 21 | 31–45 | 31–43 | under: 48; ok: 60 | 42 / 3+10+15+7 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| beepprep/high/1 סימולציה חלקית עד שלב 5–6 | 30 | 21 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 6+2+4+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| beepprep/high/1 סימולציה חלקית עד שלב 5–6 | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 10+4+7+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| beepprep/high/1 סימולציה חלקית עד שלב 5–6 | 60 | 21 | 31–45 | 31–45 | under: 30; ok: 78 | 42 / 14+5+9+9 / 5 |  / 1,2,3,4 | Maximum reached in some configurations; residual allocated to free play |
| beepprep/high/2 עבודת קצב אישית | 30 | 21 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 2+5+5+3 / 3 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| beepprep/high/2 עבודת קצב אישית | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 4+9+9+5 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| beepprep/high/2 עבודת קצב אישית | 60 | 21 | 31–45 | 31–45 | ok: 105; under: 3 | 42 / 5+13+13+6 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| test/mid/1 מבחן מלא + רישום | 30 | 26 | 14–20 | 18–20 | ok: 54; cannot-fit: 54 | 18 / 4+8+2+3+1 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| test/mid/1 מבחן מלא + רישום | 45 | 26 | 23–34 | 23–34 | ok: 108 | 32 / 5+12+3+4+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| test/mid/1 מבחן מלא + רישום | 60 | 26 | 31–45 | 31–45 | ok: 108 | 42 / 7+16+4+6+3 / 6 |  / 5 | Steps + transition/rest/water allowance fit every tested window |
| test/high/1 מבחן מלא עם שופטי קו | 30 | 27 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+8+3+3+1 / 1 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| test/high/1 מבחן מלא עם שופטי קו | 45 | 27 | 23–34 | 23–34 | ok: 108 | 32 / 3+12+4+5+2 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| test/high/1 מבחן מלא עם שופטי קו | 60 | 27 | 31–45 | 31–45 | ok: 108 | 42 / 5+16+6+6+3 / 6 |  / 5 | Steps + transition/rest/water allowance fit every tested window |
| health/mid/1 תחנות ידע בתנועה | 30 | 25 | 14–20 | 18–20 | ok: 54; cannot-fit: 54 | 18 / 1+11+3+3 / 0 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| health/mid/1 תחנות ידע בתנועה | 45 | 25 | 23–34 | 23–34 | ok: 108 | 32 / 2+15+4+4 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| health/mid/1 תחנות ידע בתנועה | 60 | 25 | 31–45 | 31–45 | ok: 108 | 42 / 3+21+6+5 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| health/mid/2 שוברים מיתוס | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+5+4 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| health/mid/2 שוברים מיתוס | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+9+8+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| health/mid/2 שוברים מיתוס | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 5+13+11+8 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| health/high/1 קריאת מקור מדעי | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+4+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| health/high/1 קריאת מקור מדעי | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+10+7+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| health/high/1 קריאת מקור מדעי | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 5+13+10+9 / 5 |  / 1,3,4 | Maximum reached in some configurations; residual allocated to free play |
| health/high/2 תכנון יום ספורטאי | 30 | 22 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+7+4+3 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| health/high/2 תכנון יום ספורטאי | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 4+12+6+5 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| health/high/2 תכנון יום ספורטאי | 60 | 22 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 5+16+9+7 / 5 |  / 1,3,4 | Maximum reached in some configurations; residual allocated to free play |
| social/mid/1 סדרת אתגרים | 30 | 23 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 4+2+4+4+3 / 1 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| social/mid/1 סדרת אתגרים | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 6+3+6+6+5 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| social/mid/1 סדרת אתגרים | 60 | 23 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 8+5+8+9+6 / 6 |  / 2 | Maximum reached in some configurations; residual allocated to free play |
| social/mid/2 בונים יחד | 30 | 21 | 14–20 | 14–20 | ok: 108 | 18 / 2+9+4 / 3 | 1,3 /  | Steps + transition/rest/water allowance fit every tested window |
| social/mid/2 בונים יחד | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 4+16+8 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| social/mid/2 בונים יחד | 60 | 21 | 31–45 | 31–41 | under: 54; ok: 54 | 42 / 5+20+10 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| social/high/1 מנהיגות מתחלפת | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+2+6+3 / 2 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| social/high/1 מנהיגות מתחלפת | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 2+7+3+9+5 / 6 |  /  | Steps + transition/rest/water allowance fit every tested window |
| social/high/1 מנהיגות מתחלפת | 60 | 23 | 31–45 | 31–45 | under: 12; ok: 96 | 42 / 3+9+5+13+6 / 6 |  / 1,3 | Maximum reached in some configurations; residual allocated to free play |
| social/high/2 אתגר מורכב | 30 | 24 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+8+4 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| social/high/2 אתגר מורכב | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 2+6+13+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| social/high/2 אתגר מורכב | 60 | 24 | 31–45 | 31–45 | ok: 102; under: 6 | 42 / 3+8+18+8 / 5 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| game/mid/1 תחנות משחקים | 30 | 30 | 14–20 | 18–20 | ok: 54; cannot-fit: 54 | 18 / 1+5+1+6+5 / 0 | 1,2,3,4,5 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| game/mid/1 תחנות משחקים | 45 | 30 | 23–34 | 23–34 | ok: 108 | 32 / 1+7+1+8+7 / 8 | 1,3 /  | Steps + transition/rest/water allowance fit every tested window |
| game/mid/1 תחנות משחקים | 60 | 30 | 31–45 | 31–45 | under: 12; ok: 96 | 42 / 3+9+3+10+9 / 8 |  / 1,3 | Maximum reached in some configurations; residual allocated to free play |
| game/mid/2 משחק מרכזי + וריאציות | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+4+6+4 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| game/mid/2 משחק מרכזי + וריאציות | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+7+10+6 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| game/mid/2 משחק מרכזי + וריאציות | 60 | 23 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 5+9+14+9 / 5 |  / 1,4 | Maximum reached in some configurations; residual allocated to free play |
| game/high/1 טורניר מיני 3×3 | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+6+2 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| game/high/1 טורניר מיני 3×3 | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+11+9+3 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| game/high/1 טורניר מיני 3×3 | 60 | 23 | 31–45 | 31–45 | ok: 108 | 42 / 5+15+13+4 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| game/high/2 התלמידים מנהלים | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 1+4+8+3 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| game/high/2 התלמידים מנהלים | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 2+6+15+4 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| game/high/2 התלמידים מנהלים | 60 | 23 | 31–45 | 31–45 | ok: 108 | 42 / 3+7+21+6 / 5 |  / 1 | Steps + transition/rest/water allowance fit every tested window |
| rain/mid/1 HIIT ליד השולחן | 30 | 20 | 14–20 | 14–20 | ok: 108 | 18 / 2+6+7 / 3 | 1,2 /  | Steps + transition/rest/water allowance fit every tested window |
| rain/mid/1 HIIT ליד השולחן | 45 | 20 | 23–34 | 23–34 | ok: 108 | 32 / 4+13+11 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| rain/mid/1 HIIT ליד השולחן | 60 | 20 | 31–45 | 31–45 | ok: 105; under: 3 | 42 / 5+17+16 / 4 |  / 1 | Maximum reached in some configurations; residual allocated to free play |
| rain/mid/2 משחקי חשיבה־תנועה | 30 | 21 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 5+5+5 / 3 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| rain/mid/2 משחקי חשיבה־תנועה | 45 | 21 | 23–34 | 23–34 | ok: 108 | 32 / 10+9+9 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| rain/mid/2 משחקי חשיבה־תנועה | 60 | 21 | 31–45 | 31–42 | under: 51; ok: 57 | 42 / 12+12+12 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| rain/high/1 ניתוח נתוני הכיתה | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 5+6+4 / 3 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| rain/high/1 ניתוח נתוני הכיתה | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 10+10+8 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| rain/high/1 ניתוח נתוני הכיתה | 60 | 22 | 31–45 | 31–43 | under: 45; ok: 63 | 42 / 13+14+10 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |
| rain/high/2 אימון במקום + ידע | 30 | 33 | 14–20 | 19–20 | cannot-fit: 72; ok: 36 | 18 / 12+3+4 / 0 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| rain/high/2 אימון במקום + ידע | 45 | 33 | 23–34 | 23–34 | ok: 108 | 32 / 18+4+6 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| rain/high/2 אימון במקום + ידע | 60 | 33 | 31–45 | 31–45 | ok: 99; under: 9 | 42 / 20+7+11 / 4 |  / 2 | Maximum reached in some configurations; residual allocated to free play |
| inclusive/mid/1 תחנות בשלוש רמות | 30 | 24 | 14–20 | 17–20 | ok: 54; cannot-fit: 54 | 18 / 2+6+6+3 / 1 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| inclusive/mid/1 תחנות בשלוש רמות | 45 | 24 | 23–34 | 23–34 | ok: 108 | 32 / 3+9+9+4 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| inclusive/mid/1 תחנות בשלוש רמות | 60 | 24 | 31–45 | 31–45 | ok: 108 | 42 / 4+14+12+5 / 7 |  /  | Steps + transition/rest/water allowance fit every tested window |
| inclusive/mid/2 משחקים מותאמים | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 6+6+4 / 2 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| inclusive/mid/2 משחקים מותאמים | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 10+11+7 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| inclusive/mid/2 משחקים מותאמים | 60 | 23 | 31–45 | 31–45 | under: 24; ok: 84 | 42 / 14+14+10 / 4 |  / 1,3 | Maximum reached in some configurations; residual allocated to free play |
| inclusive/high/1 מודל STEP בפעולה | 30 | 23 | 14–20 | 16–20 | ok: 54; cannot-fit: 54 | 18 / 2+2+6+6 / 2 | 1,2,3,4 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| inclusive/high/1 מודל STEP בפעולה | 45 | 23 | 23–34 | 23–34 | ok: 108 | 32 / 4+4+9+10 / 5 |  /  | Steps + transition/rest/water allowance fit every tested window |
| inclusive/high/1 מודל STEP בפעולה | 60 | 23 | 31–45 | 31–45 | under: 15; ok: 93 | 42 / 5+5+13+14 / 5 |  / 1,2 | Maximum reached in some configurations; residual allocated to free play |
| inclusive/high/2 ספורט פראלימפי | 30 | 22 | 14–20 | 15–20 | ok: 54; cannot-fit: 54 | 18 / 3+8+4 / 3 | 1,2,3 /  | Minimum step sum exceeds allocation in some configurations; overhead reduced first |
| inclusive/high/2 ספורט פראלימפי | 45 | 22 | 23–34 | 23–34 | ok: 108 | 32 / 5+15+8 / 4 |  /  | Steps + transition/rest/water allowance fit every tested window |
| inclusive/high/2 ספורט פראלימפי | 60 | 22 | 31–45 | 31–43 | under: 45; ok: 63 | 42 / 7+20+10 / 4 |  / 1,2,3 | Maximum reached in some configurations; residual allocated to free play |

## Equipment eligibility exceptions

All 19 profiles checked per variant (all, none, one catalog item at a time). Unknown noncatalog equipment is not proven available. Each row counts blocked profiles and gives the no-equipment conflicts; full per-profile results are available through --json.

| Variant | Blocked profiles / 19 | No-equipment topic conflicts | No-equipment variant conflicts |
|---|---:|---|---|
| aerobic/mid/1 | 18 | קונוסים | חבל |
| aerobic/mid/2 | 17 | קונוסים |  |
| aerobic/mid/3 | 17 | קונוסים |  |
| aerobic/high/1 | 17 | קונוסים |  |
| aerobic/high/2 | 17 | קונוסים |  |
| aerobic/high/3 | 17 | קונוסים |  |
| strength/mid/1 | 17 | מזרנים |  |
| strength/mid/2 | 17 | מזרנים |  |
| strength/mid/3 | 17 | מזרנים |  |
| strength/high/1 | 17 | מזרנים |  |
| strength/high/2 | 17 | מזרנים |  |
| strength/high/3 | 17 | מזרנים |  |
| core/mid/1 | 17 | מזרנים |  |
| core/mid/2 | 17 | מזרנים |  |
| core/mid/3 | 17 | מזרנים |  |
| core/high/1 | 17 | מזרנים |  |
| core/high/2 | 17 | מזרנים |  |
| core/high/3 | 18 | מזרנים | כדורים |
| speed/mid/1 | 17 | קונוסים |  |
| speed/mid/2 | 17 | קונוסים | קונוסים |
| speed/mid/3 | 17 | קונוסים |  |
| speed/high/1 | 17 | קונוסים |  |
| speed/high/2 | 18 | קונוסים | כדורים |
| speed/high/3 | 17 | קונוסים | קונוסים |
| flex/mid/1 | 18 | מזרנים, רמקול |  |
| flex/mid/2 | 18 | מזרנים, רמקול |  |
| flex/mid/3 | 18 | מזרנים, רמקול |  |
| flex/high/1 | 18 | מזרנים, רמקול |  |
| flex/high/2 | 18 | מזרנים, רמקול |  |
| flex/high/3 | 18 | מזרנים, רמקול |  |
| basket/mid/1 | 18 | כדור סל, קונוסים | כדור סל, קונוסים |
| basket/mid/2 | 18 | כדור סל, קונוסים | כדור סל |
| basket/mid/3 | 18 | כדור סל, קונוסים | כדור סל, קונוסים |
| basket/high/1 | 18 | כדור סל, קונוסים | כדור סל |
| basket/high/2 | 18 | כדור סל, קונוסים | כדור סל |
| basket/high/3 | 18 | כדור סל, קונוסים | כדור סל |
| volley/mid/1 | 18 | כדור עף, רשת, כדור רך | כדור עף, רשת |
| volley/mid/2 | 18 | כדור עף, רשת, כדור רך | כדור עף, רשת |
| volley/mid/3 | 18 | כדור עף, רשת, כדור רך | כדור עף, רשת |
| volley/high/1 | 18 | כדור עף, רשת, כדור רך | כדור עף, רשת |
| volley/high/2 | 18 | כדור עף, רשת, כדור רך | כדור עף, רשת |
| volley/high/3 | 18 | כדור עף, רשת, כדור רך | כדור עף, רשת |
| handball/mid/1 | 18 | כדור יד, קונוסים | כדור יד |
| handball/mid/2 | 18 | כדור יד, קונוסים | כדור יד |
| handball/mid/3 | 18 | כדור יד, קונוסים | כדור יד |
| handball/high/1 | 18 | כדור יד, קונוסים | כדור יד |
| handball/high/2 | 18 | כדור יד, קונוסים | כדור יד |
| handball/high/3 | 18 | כדור יד, קונוסים | כדור יד |
| soccer/mid/1 | 18 | כדור רגל, קונוסים, וסטים | כדור רגל, קונוסים |
| soccer/mid/2 | 18 | כדור רגל, קונוסים, וסטים | כדור רגל |
| soccer/mid/3 | 18 | כדור רגל, קונוסים, וסטים | כדור רגל, קונוסים |
| soccer/high/1 | 18 | כדור רגל, קונוסים, וסטים | כדור רגל |
| soccer/high/2 | 18 | כדור רגל, קונוסים, וסטים | כדור רגל |
| soccer/high/3 | 18 | כדור רגל, קונוסים, וסטים | כדור רגל |
| altball/mid/1 | 18 | צלחת מעופפת, רשת, כדור ספוג | כדורים, רשת |
| altball/mid/2 | 18 | צלחת מעופפת, רשת, כדור ספוג |  |
| altball/high/1 | 18 | צלחת מעופפת, רשת, כדור ספוג |  |
| altball/high/2 | 18 | צלחת מעופפת, רשת, כדור ספוג | כדורים, רשת |
| athletics/mid/1 | 17 | קונוסים |  |
| athletics/mid/2 | 17 | קונוסים |  |
| athletics/mid/3 | 17 | קונוסים |  |
| athletics/high/1 | 17 | קונוסים |  |
| athletics/high/2 | 17 | קונוסים |  |
| athletics/high/3 | 17 | קונוסים |  |
| jumps/mid/1 | 18 | מזרנים, כדורים, קונוסים |  |
| jumps/mid/2 | 18 | מזרנים, כדורים, קונוסים | כדורים |
| jumps/mid/3 | 18 | מזרנים, כדורים, קונוסים |  |
| jumps/high/1 | 18 | מזרנים, כדורים, קונוסים |  |
| jumps/high/2 | 18 | מזרנים, כדורים, קונוסים |  |
| jumps/high/3 | 18 | מזרנים, כדורים, קונוסים |  |
| gym/mid/1 | 17 | מזרנים | מזרנים |
| gym/mid/2 | 17 | מזרנים | מזרנים |
| gym/mid/3 | 17 | מזרנים | מזרנים |
| gym/high/1 | 17 | מזרנים | מזרנים |
| gym/high/2 | 17 | מזרנים | מזרנים |
| gym/high/3 | 17 | מזרנים | מזרנים |
| dance/mid/1 | 17 | רמקול |  |
| dance/mid/2 | 17 | רמקול | רמקול |
| dance/mid/3 | 17 | רמקול | רמקול |
| dance/high/1 | 17 | רמקול |  |
| dance/high/2 | 17 | רמקול |  |
| dance/high/3 | 17 | רמקול | רמקול |
| beepprep/mid/1 | 17 | רמקול | רמקול |
| beepprep/mid/2 | 17 | רמקול | רמקול |
| beepprep/high/1 | 17 | רמקול | רמקול |
| beepprep/high/2 | 17 | רמקול | רמקול |
| test/mid/1 | 17 | רמקול | רמקול |
| test/high/1 | 17 | רמקול | רמקול |
| social/mid/1 | 18 | חישוקים, קונוסים | חישוקים |
| social/mid/2 | 18 | חישוקים, קונוסים |  |
| social/high/1 | 18 | חישוקים, קונוסים |  |
| social/high/2 | 18 | חישוקים, קונוסים |  |
| game/mid/1 | 11 | כדורים |  |
| game/mid/2 | 11 | כדורים |  |
| game/high/1 | 11 | כדורים |  |
| game/high/2 | 11 | כדורים |  |
| rain/mid/1 | 17 | רמקול |  |
| rain/mid/2 | 17 | רמקול | רמקול |
| rain/high/1 | 17 | רמקול |  |
| rain/high/2 | 17 | רמקול |  |
| inclusive/mid/2 | 18 |  | כדורים, רשת |
