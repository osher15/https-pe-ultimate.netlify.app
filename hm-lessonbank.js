"use strict";
/* ============================================================
   PE Ultimate — מאגר מערכי השיעור הבינלאומי
   ------------------------------------------------------------
   60 מערכי שיעור מלאים (10 לכל ענף × 6 ענפים), שנכתבו בנפרד בכל
   אחת מחמש השפות (לא תרגום מכונה של מקור אחד) — לכן מנגנון
   ה-DICT הרגיל של hm-i18n.js לא מתאים כאן: הבחירה היא לפי השפה
   הפעילה כרגע באפליקציה (window.I18N.lang()), לא תרגום.

   מבנה הנתונים:
     window.LESSONBANK = {
       meta: { sportOrder:[...], sportLabel:{sport:{he,en,ar,ru,es}}, langs:[...] },
       sports: { <sport>: { he:[10 lessons], en:[...], ar:[...], ru:[...], es:[...] } }
     }
   כל קובץ hm-lessonbank-<sport>.js מוסיף את המפתח שלו תחת
   sports בעצמו (ראו התבנית בקובץ כל ענף) — כך שסדר הטעינה בין
   קבצי הענפים לא משנה, וענף חדש נוסף בלי לגעת בקובץ הזה.

   כל מערך שפה הוא מערך של 10 אובייקטים בשדות נפרדים לפי 20
   הסעיפים של תקן הכתיבה (ראו hm-lesson.js renderBank* לתצוגה):
     n, title, identity, ageRange, duration, purpose, objectives[],
     priorKnowledge, pathwayPosition, unitContribution, equipment,
     safety[], sections:{opening,warmup,mainA,mainB,appliedGame,closing},
     commonErrors[], teachingPoints[], adaptations, assessment,
     reflection, continuity, bankLink, systemData, teacherSummary,
     pedagogicalValue, selfQualityCheck
   הפיצול לשדות (ובעיקר sections) הוא מכוון: הוא מאפשר בעתיד
   למשוך רכיב בודד (חימום, משחק יישומי) ולהזין אותו כאפשרות
   נוספת במחולל האוטומטי הקיים (hm-lesson.js, מערכי WARM/COOL/
   TOPICS) בלי לפרסר טקסט חופשי מחדש.

   ---------------------------------------------------------------
   תבנית מתוכננת למאגר אח עתידי — עדיין לא קיים, אין לבנות כעת:
   hm-drillbank.js יחשוף window.DRILLBANK = { items:[...] } —
   תרגילים/משחקים/הפעלות בודדים (לא מערכים מלאים) בחמש שפות,
   נבנה בנפרד. מסך הארכיון/הידע יוכל לצרוך אותו באותה שיטה בדיוק
   (בחירת שפה לפי שפה פעילה, לא DICT) — ראו renderBank* ב-hm-lesson.js
   כדוגמה לאיך לעשות זאת.
   ============================================================ */
window.LESSONBANK = window.LESSONBANK || { sports: {} };
window.LESSONBANK.meta = {
  langs: ["he", "en", "ar", "ru", "es"],
  sportOrder: ["basketball", "football", "handball", "volleyball", "athletics", "fitness"],
  sportLabel: {
    basketball: { he: "כדורסל", en: "Basketball", ar: "كرة السلة", ru: "Баскетбол", es: "Baloncesto" },
    football:   { he: "כדורגל", en: "Football",   ar: "كرة القدم", ru: "Футбол",    es: "Fútbol" },
    handball:   { he: "כדוריד", en: "Handball",   ar: "كرة اليد",  ru: "Гандбол",   es: "Balonmano" },
    volleyball: { he: "כדורעף", en: "Volleyball", ar: "الكرة الطائرة", ru: "Волейбол", es: "Voleibol" },
    athletics:  { he: "אתלטיקה", en: "Athletics", ar: "ألعاب القوى", ru: "Лёгкая атлетика", es: "Atletismo" },
    fitness:    { he: "כושר",   en: "Fitness",    ar: "اللياقة",    ru: "Фитнес",    es: "Condición física" }
  }
};
