# סרטוני הפרסומת — Remotion

הגרסה השנייה של הסרטונים (מורים, 30 ו־60 שנ׳, 5 שפות, 9:16).
הטקסטים, הקריינות והמבנה לא השתנו: הכול עדיין נקבע ב־`docs/marketing/ad.json`.
מה שהשתנה הוא העריכה.

## מה חדש לעומת `tools/marketing-assemble.js`
- **מצלמה מדויקת:** `tools/marketing-capture.js` רושם עכשיו, לצד כל הקלטה, איפה הייתה כל הקשה ואיפה היו האלמנטים החשובים בכל רגע (`out/<lang>_<scene>.json`). המצלמה נוסעת בדיוק לכפתור שעליו מדברים, ומסגרת ירוקה מסמנת את ההקשה. התסריט של כל סצנה נמצא ב־`shots.js`.
- **הרגע החשוב תמיד נכנס:** לכל סצנה מוגדר `until`, הרגע שחייב להיראות (הזמנים נרשמו בפוטו־פיניש, «שמור לכיתה» בביפ טסט). אם הקטע קצר מדי, ההקלטה מורצת קדימה, ועל המסך מופיעה תווית «×1.6».
- **קומדיה בפתיח:** שלוש בועות של שאלות מהתלמידים, הקפאת פריים עם שריטת תקליט, חותמת «זו אני. כל שיעור.», ושעה בלילה עם «עוד מקלידה…». הדף מתקמט ונזרק, והטלפון נוחת. ברגע הרגוע חוזרת החותמת בירוק («זו אני. עכשיו.») עם קונפטי. הטקסטים נמצאים ב־`gags` שב־`ad.json`.
- **«בלי קליטה» מוכח בתמונה:** בסצנה הזו מופיעה תווית «מצב טיסה».
- **כתוביות בסגנון רשתות:** המילה שנאמרת צבועה בירוק. התזמון לכל מילה משוער לפי אורך המילה בתוך הכתובית.
- **סאונד:** מוזיקת רקע נכנסת רק כשהטלפון נוחת. יש אפקטים לכל הקשה ולכל מעבר, והעוצמה מנורמלת ל־‎-14 LUFS.

## בנייה
```bash
# 1. הקלטות המסך (+ יומני מיקוד), מתוך שורש הריפו
FFMPEG=<ffmpeg> node tools/marketing-capture.js <work>/out he,en,ar,ru,es lesson,live,pf,beep,test,hub,player,join,att

# 2. חומרי המקור: מהענף marketing-assets מעתיקים את gemini/ vo/ fonts/ אל <work>/
git archive origin/marketing-assets | tar x -C <work>

# 3. אפקטים ומוזיקה (Mixkit, חינמי לשימוש מסחרי)
git clone --depth 1 https://github.com/Vincentwei1021/video-shotcraft.git <work>/video-shotcraft

# 4. נתונים + רינדור, מתוך marketing/video
npm install
node prepare.js <work>              # → public/props/<version>_<lang>.json
node render.js <work>               # → <work>/final/<version>_<lang>_9x16.mp4
npx remotion studio                 # תצוגה חיה; ב-props: {"id":"teachers_he","data":null}
```
אפשר להגביל גרסאות ושפות: `node render.js <work> teachers he,en`.

## רישוי
- Remotion: חינם ליחידים ולצוותים של עד 3 אנשים ([רישיון](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)).
- אפקטים ומוזיקה: Mixkit Free License, בלי חובת קרדיט. המקור של כל קובץ מתועד ב־`assets/audio/ATTRIBUTION.md` של video-shotcraft. לא בחרתי אף קובץ שמסומן שם «לא ניתן לאתר מקור». המוזיקה: «House Vibez» של Lily J.
- הקבצים עצמם לא נשמרים בריפו. `prepare.js` מעתיק אותם אל `public/` (שמוחרג ב־`.gitignore`).
