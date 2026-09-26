# PE Ultimate — חומרי מקור לסרטון השיווק

הענף הזה נפרד מהקוד (orphan), כדי שהריפו הראשי לא יתנפח בקבצים כבדים.

## מה יש כאן
- `gemini/` — קטעי ה־AI האנכיים (Meta):
  - `gemini_A.mp4`: המורה המתוסכלת
  - `gemini_B.mp4`: הרגע הרגשי
- `vo/` — הקריינות (ElevenLabs, הקול Sarah, eleven_v3) בחמש שפות:
  - `<lang>_teachers.mp3`: גרסת 30 שנ׳
  - `<lang>_teachers60.mp3`: גרסת 60 שנ׳
- `fonts/` — הגופנים שבהם הכתוביות מוצגות.

10 הסרטונים הסופיים לא נשמרו כאן (180MB). בונים אותם מחדש מהחומרים האלה.

## בנייה מחדש
מתוך הענף `claude/handoff-review-guidance-1wqywt`:

1. `node tools/marketing-capture.js` — מקליט את מסכי האפליקציה בחמש השפות. הקבצים נכתבים ל־`out/`.
2. מעתיקים לתיקיית העבודה את `gemini/`, `vo/` ו־`fonts/` מהענף הזה.
3. `node tools/marketing-assemble.js` — מרכיב את הסרטונים לפי `docs/marketing/ad.json`:
   - גרסאות: `teachers` (30 שנ׳) ו־`teachers60` (60 שנ׳)
   - שפות: he/en/ar/ru/es
   - פורמט: 9:16
