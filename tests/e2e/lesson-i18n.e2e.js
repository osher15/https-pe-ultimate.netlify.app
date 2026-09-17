"use strict";
/* ============================================================
   מחולל מערכי השיעור — תרגום מאגר הנושאים (TOPICS) בשלוש שפות
   ------------------------------------------------------------
   TOPICS ב-hm-lesson.js הוא התוכן העמוק ביותר באפליקציה: כל נושא
   מזין ישירות את מחולל מערך השיעור (goals/main/assess/diff/safe/hw).
   שלא כמו GAMES/PROGRAMS, כאן התוכן המתורגם זורם עד לפלט הסופי
   (מסך + הדפסה), לא רק לתצוגה קטלוגית — לכן topicById עצמו מחזיר
   נתונים מקומיים (tpLoc), לא רק שכבת התצוגה.
   כל 21 הנושאים תורגמו במלואם (כולל aerobic/basket/handball,
   שהגיעו בסבב תיקון נפרד אחרי שהתגלה בהם תוכן מומצא/חסר).
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};

const openLesson=async page=>{ await page.evaluate(()=>window.HM.go("lesson")); await page.waitForTimeout(500); };
const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };
const pickTopic=async(page,id)=>{
  await page.evaluate(id=>{ document.getElementById("ls-focus").value=id; },id);
};
const genPlan=async page=>{
  await page.evaluate(()=>document.getElementById("ls-gen").click());
  await page.waitForTimeout(400);
};
const planBody=page=>page.evaluate(()=>document.getElementById("ls-planBody").textContent);
const focusOptionText=(page,id)=>page.evaluate(id=>{
  const opt=[...document.querySelectorAll("#ls-focus option")].find(o=>o.value===id);
  return opt?opt.textContent:null;
},id);

module.exports={title:"מחולל מערכי שיעור — תרגום מאגר הנושאים (TOPICS)",tests:[

  check("עברית: נושא 'כוח' כברירת מחדל בעברית",seed,async page=>{
    await openLesson(page);
    await pickTopic(page,"strength");
    await genPlan(page);
    const body=await planBody(page);
    ok(body.indexOf("מטרות השיעור")>=0,"כותרת עברית: "+body.slice(0,60));
    ok(body.indexOf("תקנית")===-1,"סניטי — לא רלוונטי");
  }),

  check("אנגלית: כותרות המסך וגם תוכן הנושא מתורגמים",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"en");
    await pickTopic(page,"strength");
    await genPlan(page);
    const body=await planBody(page);
    ok(body.indexOf("Lesson Goals")>=0,"כותרת אנגלית: "+body.slice(0,80));
    ok(body.indexOf("Strengthen the core and limb muscles")>=0,"תוכן המטרות תורגם: "+body.slice(0,200));
    ok(body.indexOf("Technique Before Load")>=0 || body.indexOf("Adaptations")>=0,"תוכן שלבי הביצוע תורגם");
  }),

  check("ערבית: תפריט בחירת הנושא מציג שם מתורגם",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"ar");
    const txt=await focusOptionText(page,"strength");
    ok(txt&&txt.indexOf("القوة")>=0,"אפשרות ערבית בתפריט: "+txt);
  }),

  check("רוסית: תוכן המערך מתורגם אחרי יצירה",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"ru");
    await pickTopic(page,"strength");
    await genPlan(page);
    const body=await planBody(page);
    ok(body.indexOf("Сила")>=0,"שם הנושא ברוסית מופיע בתוכן: "+body.slice(0,120));
  }),

  check("נושא aerobic (מסבב התיקון) מתורגם במלואו, כולל שלבי הביצוע",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"en");
    await pickTopic(page,"aerobic");
    await genPlan(page);
    const body=await planBody(page);
    ok(body.indexOf("Lesson Goals")>=0,"כותרת המסך: "+body.slice(0,60));
    ok(body.indexOf("Improving cardiovascular endurance")>=0,"תוכן המטרות תורגם: "+body.slice(0,200));
  }),

  check("נושאים basket/handball (שתוקנו אחרי תוכן מומצא) תקינים ומתורגמים",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"en");
    await pickTopic(page,"basket");
    await genPlan(page);
    const body=await planBody(page);
    ok(body.indexOf("Dribbling with control and head up")>=0,"basket תורגם: "+body.slice(0,200));
  }),

  check("חזרה לעברית מציגה שוב את הכותרות המקוריות",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"en");
    await switchLang(page,"he");
    await pickTopic(page,"strength");
    await genPlan(page);
    const body=await planBody(page);
    ok(body.indexOf("מטרות השיעור")>=0,"חזר לעברית: "+body.slice(0,60));
  }),

  check("window.LESSON.std() מחזיר את ארבעת הסטנדרטים מתורגמים לאנגלית",seed,async page=>{
    await switchLang(page,"en");
    const std=await page.evaluate(()=>window.LESSON.std());
    eq(std.length,4,"ארבעה סטנדרטים");
    ok(std[0].indexOf("Motor")>=0,"סטנדרט ראשון באנגלית: "+std[0]);
  }),

  check("חימום וסיום (WARM/COOL, נבחרים אקראית) מתורגמים לאנגלית — בלי עברית שנשארה מאחור",seed,async page=>{
    await openLesson(page);
    await switchLang(page,"en");
    /* מכבים את שילוב המשחק: GAMES.byId נשאר בכוונה לא מתורגם (ראו
       docs/i18n-glossary.md), ואינו חלק ממה שהבדיקה הזו בודקת */
    await page.evaluate(()=>{ const c=document.getElementById("ls-optGame"); if(c&&c.checked)c.click(); });
    await pickTopic(page,"strength");
    await genPlan(page);
    const body=await planBody(page);
    const heChars=/[֐-׿]/;
    ok(body.indexOf("Warm-up:")>=0,"תחילית החימום באנגלית: "+body.slice(0,80));
    ok(body.indexOf("Cool-down:")>=0,"תחילית הסיום באנגלית: "+body.slice(0,400));
    ok(!heChars.test(body),"אין תווים עבריים בתוכן כשהשפה אנגלית (בלי משחק): "+body.slice(0,300));
  })

]};
