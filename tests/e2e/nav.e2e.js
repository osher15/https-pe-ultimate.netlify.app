"use strict";
/* ============================================================
   ניווט — שכל מסך נשאר בר-הגעה
   ------------------------------------------------------------
   קודם החלוקה הייתה בין ארבעה אריחים בבית לבין חלון «עוד», והיא
   הייתה שברירה בדרך אחת: מודול שקודם לבית ונמחק מהתפריט הפך
   לבלתי נגיש לחלוטין, בלי ששום דבר נשבר בקוד. זה קרה בפועל
   ל«ידע» — הוא עלה לבית כאריח 05, יצא מהתפריט, ואז האריח הוסר.

   עכשיו יש מגירה אחת (☰) שמחזיקה את **כל** המסכים, והבית מחזיק
   קיצורים בלבד. הבדיקות כאן שומרות על שני הצדדים: שהמגירה שלמה,
   ושהיא באמת נפתחת ומנווטת.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
/* כל המודולים שמורה אמור להגיע אליהם */
const MODS=["ft","lesson","beep","photo","rec","stu","know","tools","nut","games","home"];

module.exports={title:"ניווט — נגישות המסכים",tests:[

  /* המגירה בוטלה. כל מסך נגיש מכפתור בסרגל או מלשונית האזור שלו —
     ולשוניות האזור נוצרות בקוד, ולכן הבדיקה קוראת את ההגדרה עצמה. */
  check("לכל מודול יש לפחות דרך אחת להגיע אליו — סרגל או לשונית אזור",seed,async page=>{
    const reach=await page.evaluate(async()=>{
      const got={};
      const take=()=>document.querySelectorAll("[data-go]").forEach(e=>{ got[e.dataset.go]=true; });
      take();
      for(const m of ["lesson","cls"]){ window.HM.go(m); await new Promise(r=>setTimeout(r,200)); take(); }
      return Object.keys(got).sort();
    });
    MODS.forEach(m=>ok(reach.indexOf(m)>=0,
      "אין שום דרך להגיע ל-«"+m+"» — נמצאו: "+reach.join(",")));
  }),

  check("«ידע» נפתח בפועל מלשונית «הכנה»",seed,async page=>{
    await page.click('.nav [data-go="lesson"]'); await page.waitForTimeout(300);
    await page.click('#areaTabs [data-go="know"]'); await page.waitForTimeout(400);
    eq(await page.evaluate(()=>document.body.dataset.mod),"know");
    ok(await page.evaluate(()=>document.getElementById("view-know").classList.contains("on")),"המסך מוצג");
  }),

  check("«כלי כיתה» נפתח מלשונית «כיתות»",seed,async page=>{
    await page.click('.nav [data-go="cls"]'); await page.waitForTimeout(300);
    await page.click('#areaTabs [data-go="tools"]'); await page.waitForTimeout(400);
    eq(await page.evaluate(()=>document.body.dataset.mod),"tools");
  })

]};
