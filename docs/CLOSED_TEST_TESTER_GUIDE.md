# Google Play closed test — tester guide (owner-facing)

Purpose: instructions to send to friends and family who will be the closed-test testers. Testers do not need to be teachers.

Requirement being met (verify the current wording in Play Console at submission time; the rule applies to new personal developer accounts): at least 12 testers opted in to the closed track and staying opted in for 14 consecutive days. Source in this repo: `docs/NATIVE_RELEASE_CHECKLIST.md` §4. Not verified against the console from this repository.

## What a tester must do

1. Open the opt-in link the owner sends, signed in with the Google account whose email the owner added to the tester list, and tap "Become a tester".
2. Install the app from the Play Store link on that page.
3. Keep the app installed and stay opted in for the full 14 days. Do not uninstall it and do not tap "Leave the program".
4. Open the app about once a week (recommended; the console may ask the owner about engagement).

## Owner checklist (not automated)

- Add 15-20 tester emails (a margin above 12); each must be a Google account.
- Check the console every few days that the opted-in count stays at 12 or more; replace anyone who left.
- Fix and upload new builds to the same closed track if a bug is found; keep short notes of tester feedback for the production-access questionnaire.
- Day 14 or later: apply for production access in the console.

## Message to copy to testers (Hebrew)

היי! אני מבקש ממך עזרה קטנה: אני בודק אפליקציה חדשה בגוגל פליי ואני צריך 14 ימים עם 12 בודקים.

1. פתח את הקישור הזה מהטלפון (אנדרואיד): [PASTE OPT-IN LINK]
2. היכנס עם חשבון הגוגל שנתת לי (המייל שלך: ____).
3. לחץ "הפוך לבודק", ואחר כך "הורד" כדי להתקין את האפליקציה.
4. חשוב: **אל תמחק את האפליקציה ואל תעזוב את התוכנית** במשך 14 ימים. זה כל הסיפור.
5. אם אפשר, פתח אותה פעם בשבוע ותגיד לי אם משהו לא עובד.

תודה!

## Notes

- Android only. The closed test applies to Google Play; iPhone users cannot be Play testers.
- Tester count and dates are tracked by the owner in the console. This repository holds no tester data; do not commit tester emails.
