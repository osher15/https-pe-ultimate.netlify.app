"use strict";
/* ============================================================
   קישור השיעור לנושא — planId
   ------------------------------------------------------------
   `LessonSession.planId` תועד ב-`docs/PRODUCT_EVOLUTION_PLAN.md` §11
   כתפר קיים ("מערך שיעור הוא כבר ישות מקושרת, לא טקסט") — אבל
   בפועל הוא תמיד היה `null`: המחולל בונה אובייקט `plan` בכל
   הפעלה מחדש, וה-`id` שהקוד ניסה לקרוא ממנו (`plan.id`) לא היה
   קיים על האובייקט אף פעם.

   התיקון: `plan` עצמו הוא צירוף חד-פעמי (וריאציה שהוגרלה עכשיו),
   ואין לו זהות יציבה שמשתלמת לשמור — אבל ל-**נושא** שממנו הוא
   נוצר יש זהות יציבה (`T.id`, כמו "strength"/"aerobic"), שכבר
   משמשת בקודבייס למפתח המשוב (`ls.feedback`) ולזיכרון הווריאציות
   (`ls.recentVariants`). זו ההפניה שהשיעור באמת יכול לשאת: «באיזה
   נושא עסק השיעור», לא «איזו הגרלה יצאה באותו רגע».

   הבדיקות כאן שומרות בדיוק על ההבחנה הזאת: פתיחת שיעור מהמחולל
   מקשרת ל-topic id, לא ל-undefined; אותו נושא שנוצר מחדש (הגרלה
   שונה) עדיין נותן את אותו planId; ומסלול שלא עבר דרך המחולל כלל
   נשאר `null`, בדיוק כמו קודם.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const X="c:ט:1";
const seed={
  "ft.classes":{[X]:{id:X,name:"ט׳1",grade:"ט",num:1,key:"ט1"}},
  "ft.roster":{"ט1":[{id:"a",name:"דן אבירם",sex:"boys"}]},
  "ft.results":[],
  /* הכיתה כבר נבחרה — אין צורך לעבור דרך FT.pick כדי לבדוק את
     הקישור לנושא, שהוא מה שנבדק כאן. */
  "ft.last":{grade:"ט",num:1},
  "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
};

const openLesson=async page=>{ await page.evaluate(()=>window.HM.go("lesson")); await page.waitForTimeout(500); };
const pickTopic=async(page,id)=>{
  await page.evaluate(id=>{ document.getElementById("ls-focus").value=id; },id);
};
const genPlan=async page=>{
  await page.evaluate(()=>document.getElementById("ls-gen").click());
  await page.waitForTimeout(400);
};
const startLesson=async page=>{
  await page.evaluate(()=>document.getElementById("ls-startLesson").click());
  await page.waitForTimeout(400);
};
const active=page=>page.evaluate(()=>window.HM.session.active());

module.exports={title:"קישור השיעור לנושא (planId)",tests:[

  check("שיעור שנפתח מהמחולל נושא את מזהה הנושא, לא null",seed,async page=>{
    await openLesson(page);
    await pickTopic(page,"strength");
    await genPlan(page);
    await startLesson(page);
    const a=await active(page);
    ok(a,"נפתח שיעור");
    eq(a.planId,"strength","מזהה הנושא היציב — לא plan.id שלא קיים מעולם");
    eq(a.planTitle,"כוח — משקל גוף","שם התצוגה של הנושא");
  }),

  check("נושא אחר נותן planId אחר, מאותו מקור בדיוק",seed,async page=>{
    await openLesson(page);
    await pickTopic(page,"aerobic");
    await genPlan(page);
    await startLesson(page);
    const a=await active(page);
    eq(a.planId,"aerobic");
    eq(a.planTitle,"אירובי — בניית בסיס");
  }),

  check("הגרלה חוזרת של אותו נושא נותנת את אותו planId",seed,async page=>{
    await openLesson(page);
    await pickTopic(page,"strength");
    /* שני דורות — הווריאציה הפנימית (main) עשויה להשתנות בין
       הגרלה להגרלה, אבל הנושא לא. אם planId היה נגזר מהצירוף
       שהוגרל (כמו plan.id שלא באמת קיים היה עושה, לו היה קיים)
       הוא היה משתנה בין שתי ההגרלות; כשהוא נגזר מהנושא — לא. */
    await genPlan(page);
    await genPlan(page);
    await startLesson(page);
    eq((await active(page)).planId,"strength",
      "אותו נושא — אותו מזהה, גם אחרי הגרלה נוספת");
  }),

  check("שיעור שלא נפתח דרך המחולל נשאר בלי מזהה נושא",seed,async page=>{
    await page.evaluate(()=>window.HM.session.start(
      {cid:"c:ט:1",clsSnapshot:"ט׳1",date:new Date().toISOString().slice(0,10)}));
    await page.waitForTimeout(200);
    const a=await active(page);
    eq(a.planId,null,"מסלול שלא נגע במחולל — כמו קודם התיקון");
    eq(a.planTitle,"");
  })

]};
