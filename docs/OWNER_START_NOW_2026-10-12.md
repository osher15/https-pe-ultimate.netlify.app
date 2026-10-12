# מה לעשות עכשיו — רשימה לבעל הפרויקט (2026-10-12)

מבוסס על `docs/LAUNCH_PLAN_2026-10-12.md` (כרטיס #54). הכל כאן ניתן לביצוע היום.

## מצב ה-AAB (נבדק ב-CI)
- משימת "Android — AAB לשחרור (לא חתום)" **הצליחה** על `main` (ריצה 38270990317, קומיט 54c8afc). האפליקציה בנויה, ה-APK לבדיקה והקומפילציה של iOS הצליחו באותה ריצה.
- הקובץ: `pe-ultimate-android-release-unsigned`, 11.9 MB. **פג תוקף ב-26.10.2026** — הורד אותו וחתום לפני כן, או הרץ את workflow "Native builds" ידנית מחדש.
- מה **לא** נבדק: לא הצלחתי להוריד ולפתוח את הקובץ מכאן, ולכן לא אימתתי בתוכו את מזהה החבילה, targetSdk, גרסה ו-16KB page size. זו משימה C2 של GPT.
- קישור לריצה: https://github.com/osher15/https-pe-ultimate.netlify.app/actions/runs/38270990317

## חלק א — מה שרק אתה יכול לעשות (לפי סדר, התחל היום)
1. **פתח חשבון Google Play Console** (25$ חד-פעמי) ועבור אימות זהות. זה הצעד שמתחיל את שעון 14 הימים.
2. **אשר שמזהה החבילה `io.github.osher15.peultimate` הוא סופי** (אי אפשר לשנות אחרי העלאה ראשונה). אם כן — כתוב לי "מאשר".
3. **צור מפתח העלאה** לפי `docs/NATIVE_RELEASE_CHECKLIST.md` §4, שמור את `upload.jks` והסיסמאות מחוץ למאגר, ועשה לו גיבוי (בלי המפתח אי אפשר לעדכן את האפליקציה).
4. **הורד את ה-AAB הלא חתום** מדף הריצה למעלה (Artifacts) ושמור אותו.
5. **התקן את ה-APK לבדיקה** (`pe-ultimate-android-debug`, באותה ריצה) על טלפון אנדרואיד אמיתי, ומלא את דף הבדיקות שיכין GPT (C3). עד אז: פתח אופליין, צור כיתה, גיבוי ושחזור, והתקן עדכון מעליו.
6. **החלטות שמחכות לך**: תשובות לדירוג גיל וצהרת הכושר (`docs/PE_ULTIMATE_PLAY_READINESS_2026-09-29.md` §6-7) — GPT יביא טבלה מוכנה אחרי C1; הקהל כבר נקבע (18+).
7. **איסוף בודקים**: 15–20 כתובות Gmail של חברים (`docs/CLOSED_TEST_TESTER_GUIDE.md`). שלח רק אחרי שיש לי קישור הצטרפות מה-Console.
8. אם יש לך נתונים אמיתיים באפליקציה הישנה: צור גיבוי מוצפן עכשיו ושמור את הקובץ והסיסמה (המזהה החדש הוא התקנה נפרדת).

## חלק ב — הדבק ל-GPT (Codex)
פתח סשן חדש עם גישה למאגר `osher15/https-pe-ultimate.netlify.app` והדבק:

```
Work in the repository osher15/https-pe-ultimate.netlify.app. Fetch current main, create a new branch from it named codex/launch-support-2026-10-12.
Read AGENTS.md, COLLABORATION.md, docs/LAUNCH_PLAN_2026-10-12.md and docs/handoffs/2026-10-12-codex-launch-tasks.md completely, then do tasks C1 and C2 first, then C3, C4, C5, in that order.
Rules: do not change product code (hm-*.js, index.html, native/); do not merge, deploy, sign or upload anything; state exact commands and outputs; keep CI, emulator and physical-device evidence separate. Write your results in docs/handoffs/2026-10-12-codex-launch-result.md and push the branch. Tell me what you could not verify.
```
מה תקבל: טבלת "טענה → ראיה → תקין/שגוי" להצהרות, דוח על ה-AAB, דף בדיקות לטלפון (בעברית), דוח נגישות, וסקריפט `tools/prelaunch-check.sh`.

## חלק ג — הדבק לג'מיני
ג'מיני צריך גישה לקבצים. אם אין לו גישה ל-GitHub, צרף לו את הקבצים: `docs/handoffs/2026-10-12-gemini-launch-tasks.md`, `docs/store-listing/STORE_LISTING_2026-10-05.md`, `privacy.html` ו-`README.md`. הדבק:

```
You are helping launch the Android app "PE Ultimate App" (free, offline, for adults working in sport: PE teachers, fitness trainers, sports coaches).
Read the attached docs/handoffs/2026-10-12-gemini-launch-tasks.md and do tasks G1 to G6 in order. Follow its rules exactly: you write text only; no accuracy, certification, AI or medical claims; no invented numbers; ask me if a fact is missing.
Output each task as its own Markdown file under docs/marketing/ (listing-review.md, landing-copy.md, screenshot-captions.md, video-script.md, outreach.md, keywords.md) and a final docs/handoffs/2026-10-12-gemini-launch-result.md listing what needs a human native speaker (Arabic, Russian, Spanish).
```
אם ג'מיני לא יכול לדחוף ל-GitHub: העתק את הקבצים שהוא מחזיר אליי ואני אכניס אותם למאגר ואבדוק אותם מול העובדות.

## חלק ד — מה אני עושה במקביל
- B4: תהליך חתימה צעד-אחר-צעד כשתגיע לשלב 3.
- B7: משפט הפרטיות כבר באתר; אעדכן לפי C1.
- B10: צילומי מסך — יש סט טיוטה (אנגלית). אפיק סטים בעברית/ערבית/רוסית/ספרדית אחרי שג'מיני מחזיר כיתובים.
- M2: סעיף "הורד את האפליקציה" בדף הנחיתה, כשיהיה קישור Play.
- תיקוני באגים שהבודקים ימצאו.

## חלק ה — מה שנוגע לפוטו־פיניש
לפי הסקירה של GPT (`docs/handoffs/2026-10-09-report-review-claude-action-plan.md`) אין הסמכה או מחקר דיוק. לכן: הסרתי מנוסח החנות וה-README את "עד רמת המילישנייה", כל הניסוחים אומרים "כלי שטח מעשי", וצילום הפוטו־פיניש לא נכלל בסט הטיוטה. דף הבדיקות של GPT יכלול השוואה מול שעון עצר, כראיה בלבד.
