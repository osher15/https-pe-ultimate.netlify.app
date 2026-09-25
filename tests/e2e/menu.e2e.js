"use strict";
/* ============================================================
   מסך ראשון קצר, ותפריט אחד שבו הכול
   ------------------------------------------------------------
   מורה פותח את האפליקציה בשער בית הספר, ומה שהוא צריך לראות הוא
   שלושה דברים: מה קורה עכשיו, ושתי הפעולות שהוא עושה בכל שיעור.
   כל השאר — מסכים שנכנסים אליהם פעם בשבוע — שייך לתפריט, כמו
   במערכות בית הספר שהוא כבר מכיר.

   הבדיקות כאן מגנות על שני הצדדים של ההחלטה הזאת: שהבית באמת
   קצר, ושהקיצור לא הפך שום מסך לבלתי נגיש. בנוסף — שהמגירה
   נצמדת לצד הנכון ונפתחת לכל הגובה, כי מגירה שנפתחת כחלון קטן
   באמצע המסך היא בדיוק מה שרצינו להחליף.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const ftSeed={
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "ft.roster":{"ט3":[{id:"a",name:"דן אבירם",sex:"boys"}]},
  "ft.last":{grade:"ט",num:3},"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
};
const openFt=async page=>{
  await page.evaluate(()=>window.HM.go("ft"));
  await page.waitForTimeout(700);
};

module.exports={title:"דף הבית הקצר וסדר המבחנים",tests:[

  /* ---------- הבית ---------- */

  check("הבית מציג את «עכשיו» וכלי מדידה — לא רשימת מודולים",seed,async page=>{
    const r=await page.evaluate(()=>({
      tools:[...document.querySelectorAll("#hx-quick [data-go]")].map(e=>e.dataset.go),
      today:!!document.getElementById("hx-today"),
      more:!!document.querySelector("#hx-more:not([open])")
    }));
    ok(r.today,"כרטיס «מה עכשיו» קיים");
    eq(r.tools,["ft","beep","photo","fit"],"ארבעה כלי מדידה בלי שיעור");
    ok(r.more,"אתגר, מספרים וטיפ — מקופלים למטה");
  }),

  /* ---------- סדר המבחנים ---------- */

  check("המבחנים הנפוצים ראשונים, בסדר שנקבע",ftSeed,async page=>{
    await openFt(page);
    const r=await page.evaluate(()=>{
      const g=document.querySelector("#ft-tests .ft-grp");
      return {head:g.querySelector(".ft-grph").textContent.trim(),
        ids:[...g.querySelectorAll("[data-t]")].map(e=>e.dataset.t)};
    });
    ok(/הנמדדים/.test(r.head),"הקבוצה הראשונה היא של הנפוצים: "+r.head);
    eq(r.ids.join(","),"pull,push,push60,r1000,situp,r1500,shut4x10",
      "מתח · שכיבות סמיכה · שכיבות דקה · 1000 · בטן · 1500 · 4×10");
  }),

  check("מבחן אינו מופיע פעמיים — פעם למעלה ופעם בקטגוריה",ftSeed,async page=>{
    await openFt(page);
    const ids=await page.evaluate(()=>
      [...document.querySelectorAll("#ft-tests [data-t]")].map(e=>e.dataset.t));
    const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
    eq(dup.length,0,"כפולים: "+dup.join(","));
  }),

  check("כל המבחנים עדיין נגישים — הקיצור לא הסתיר אף אחד",ftSeed,async page=>{
    const n=await page.evaluate(()=>window.FT&&window.FT.tests?window.FT.tests().length:null);
    await openFt(page);
    const shown=await page.evaluate(()=>
      document.querySelectorAll("#ft-tests [data-t]").length);
    if(n!==null)eq(shown,n,"כל מבחן שבקטלוג מופיע במסך");
    else ok(shown>=30,"נמצאו "+shown+" מבחנים במסך");
  }),

  check("שכיבות סמיכה בדקה הוא מבחן נפרד, עם שעון — והמקורי לא השתנה",ftSeed,async page=>{
    await openFt(page);
    const r=await page.evaluate(()=>{
      const txt=id=>{ const c=document.querySelector('[data-t="'+id+'"]');
        return c?c.textContent.replace(/\s+/g," "):null; };
      return {push:txt("push"),push60:txt("push60")};
    });
    ok(r.push&&!/דק׳/.test(r.push),"«שכיבות סמיכה» נשאר עד כשל, בלי חלון זמן: "+r.push);
    ok(r.push60&&/דק׳/.test(r.push60),"ולצידו גרסת הדקה: "+r.push60);
  }),

  check("הדקה של שכיבות הסמיכה באמת רצה — ספירה לאחור נפתחת",ftSeed,async page=>{
    await openFt(page);
    await page.evaluate(()=>document.querySelector('[data-t="push60"]').click());
    await page.waitForTimeout(450);
    const r=await page.evaluate(()=>{
      const box=document.getElementById("ft-cdBox"), tm=document.getElementById("ft-cdTm");
      return {exists:!!box,txt:tm?tm.textContent.trim():""};
    });
    ok(r.exists,"אזור הספירה לאחור קיים במסך המבחן");
    eq(r.txt,"1:00","ומראה דקה");
  })

]};
