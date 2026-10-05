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
  /* ענפים שיש להם קובץ נתונים. הקובץ נטען לפי דרישה (LESSONBANK.load) — בטעינה הראשונה של
     האפליקציה נטען רק הקובץ הזה, ולא כל שישה הענפים (כ-0.5 MB לענף). בגרסת הקובץ הבודד
     כולם כלולים מראש. ענף חדש מתווסף כאן, בקובץ שלו, ובתג data-lb ב-index.html. */
  available: ["basketball", "football", "handball", "volleyball", "athletics", "fitness"],
  lessonsPerSport: 10,
  /* מקור וסטטוס הסקירה של התוכן. התוכן נטען כפי שנכתב ב-Notion; לא נערך בייבוא.
     reviewStatus: draft = טרם נסקר באדם; imported = נטען ללא בדיקה נוספת; teacher-reviewed / native-reviewed
     יסומנו רק אחרי שאדם סקר. מתעדכן ידנית עם כל סבב ייבוא. */
  provenance: {
    source: "Notion — מאגר מערכי שיעור ספורט / סדרת מערכים לבית הספר",
    sourcePageId: "3df128d0e2178140b549dd1a82642096",
    contentVersion: "V2, תיקוני Notion עד 2026-09-28",
    importedFrom: "basketball, football: feat/international-lesson-bank (2026-09-29); handball, volleyball, athletics, fitness: Notion export via tools/notion-lessons-import.js (2026-10-05)",
    reviewStatus: "draft"
  },
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

/* טעינה לפי דרישה של קובץ ענף. מחזיר הבטחה; אם הענף כבר נטען (הקובץ הבודד) — מיידי.
   כתובת הקובץ (עם חותמת גרסה) יושבת בתג <script type="text/plain" data-lb="..."> ב-index.html,
   ולכן אותה חותמת נכנסת גם לרשימת המטמון המוקדם של ה-service worker — וזה עובד גם בלי רשת. */
(function(){
  const LB=window.LESSONBANK, pending={};
  LB.load=function(sport){
    if(LB.sports&&LB.sports[sport])return Promise.resolve();
    if(pending[sport])return pending[sport];
    const tag=document.querySelector('script[data-lb="'+sport+'"]');
    if(!tag||!tag.dataset.src)return Promise.reject(new Error("no source for "+sport));
    pending[sport]=new Promise(function(resolve,reject){
      const s=document.createElement("script");
      s.src=tag.dataset.src;
      s.onload=function(){ (LB.sports&&LB.sports[sport])?resolve():reject(new Error("empty "+sport)); };
      s.onerror=function(){ delete pending[sport]; reject(new Error("load failed "+sport)); };
      document.head.appendChild(s);
    });
    pending[sport].catch(function(){ delete pending[sport]; });
    return pending[sport];
  };
})();
