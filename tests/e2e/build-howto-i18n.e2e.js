"use strict";
/* ============================================================
   הבונה הידני (hm-build.js) ומאגר הענפים (hm-howto.js) — תרגום
   ------------------------------------------------------------
   שלא כמו TOPICS, כאן יש שני דפוסים שונים:
   · הבונה הידני בונה מערך אמיתי בדיוק כמו המחולל המהיר — התוכן
     המתורגם (חימומים/תרגילים/סיום) זורם עד לפלט הסופי (#ls-planBody).
   · RECDEFAULTS.SPORTS הוא רק *זרע* חד־פעמי ל-rec.sports; התרגום
     שלו נבדק ישירות מול ה-API (לא מול מסך שכבר נשמר ב-localStorage
     במכשיר הבדיקה). RECDEFAULTS.universal לעומת זאת מוצג בזמן אמת
     בכל פתיחה של «איך מבצעים ומצלמים» ולכן הוא getter.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};

const switchLang=async(page,code)=>{ await page.evaluate(c=>window.I18N.set(c),code); await page.waitForTimeout(150); };
const openLesson=async page=>{ await page.evaluate(()=>window.HM.go("lesson")); await page.waitForTimeout(500); };
const openManual=async page=>{
  await page.evaluate(()=>document.querySelector('#ls-modeTabs [data-lm="manual"]').click());
  await page.waitForTimeout(300);
};
const bwNext=async page=>{ await page.evaluate(()=>document.getElementById("bw-next").click()); await page.waitForTimeout(150); };
const bwClick=async(page,sel)=>{ await page.evaluate(s=>document.querySelector(s).click(),sel); await page.waitForTimeout(150); };
const planBody=page=>page.evaluate(()=>document.getElementById("ls-planBody").textContent);

async function buildPlanViaWizard(page){
  await openLesson(page);
  await openManual(page);
  await bwNext(page);                         /* שלב 1 -> 2 (חימום) */
  await bwClick(page,'#bw-body [data-wu="w-ramp"]');
  await bwNext(page);                         /* שלב 2 -> 3 (עיקרי) */
  await bwClick(page,'#bw-body [data-dr="d-squat"]');
  await bwNext(page);                         /* שלב 3 -> 4 (סופי) */
  await bwClick(page,'#bw-body [data-fin="f-free"]');
  await bwNext(page);                         /* שלב 4 -> 5 (סיכום) */
  await bwClick(page,'#bw-build');
  await page.waitForTimeout(300);
}

module.exports={title:"בונה ידני + מאגר ענפים — תרגום",tests:[

  check("אנגלית: הבונה הידני מייצר מערך עם תוכן חימום/תרגיל/סיום מתורגם",seed,async page=>{
    await switchLang(page,"en");
    await buildPlanViaWizard(page);
    const body=await planBody(page);
    ok(body.indexOf("Warm-up: Full RAMP")>=0,"שם החימום המתורגם מופיע עם התחילית: "+body.slice(0,200));
    ok(body.indexOf("Bodyweight Squat")>=0,"שם התרגיל המתורגם מופיע: "+body.slice(0,400));
    ok(body.indexOf("Guided Free Play")>=0,"שם הסיום המתורגם מופיע: "+body.slice(0,600));
  }),

  check("רוסית: קטגוריית התרגילים ופורמט העבודה מתורגמים בממשק הבונה",seed,async page=>{
    await switchLang(page,"ru");
    await openLesson(page);
    await openManual(page);
    await bwNext(page);
    await bwClick(page,'#bw-body [data-wu="w-ramp"]');
    await bwNext(page);
    const catText=await page.evaluate(()=>{
      const b=document.querySelector('#bw-cats [data-cat="str"]');
      return b?b.textContent:null;
    });
    ok(catText&&/Сила/.test(catText),"קטגוריה ברוסית: "+catText);
  }),

  check("ערבית: תפריט מבנה העבודה (MAIN_FORMATS) מציג שם מתורגם",seed,async page=>{
    await switchLang(page,"ar");
    await openLesson(page);
    await openManual(page);
    await bwNext(page);
    await bwClick(page,'#bw-body [data-wu="w-ramp"]');
    await bwNext(page);
    const optText=await page.evaluate(()=>{
      const o=[...document.querySelectorAll("#bw-fmt option")].find(x=>x.value==="stations");
      return o?o.textContent:null;
    });
    ok(optText&&optText.indexOf("محطات")>=0,"אפשרות ערבית: "+optText);
  }),

  check("חזרה לעברית: הבונה הידני חוזר להציג תוכן עברי",seed,async page=>{
    await switchLang(page,"en");
    await switchLang(page,"he");
    await buildPlanViaWizard(page);
    const body=await planBody(page);
    ok(body.indexOf("חימום: RAMP מלא")>=0,"חזר לעברית: "+body.slice(0,200));
  }),

  check("תוויות הממשק הקבועות של האשף (כותרת, שלבים, שדות) מתורגמות באנגלית/ערבית",seed,async page=>{
    await switchLang(page,"en");
    await openLesson(page);
    await openManual(page);
    const enTitle=await page.evaluate(()=>document.getElementById("bw-title").textContent);
    ok(enTitle.indexOf("Manual Builder")>=0,"כותרת האשף באנגלית: "+enTitle);
    const enSteps=await page.evaluate(()=>[...document.querySelectorAll("#bw-steps .t")].map(e=>e.textContent));
    ok(enSteps.join("|")==="Lesson Details|Warm-up|Main Section|Final Section|Summary","שמות השלבים באנגלית: "+enSteps.join("|"));
    await switchLang(page,"ar");
    const arTitle=await page.evaluate(()=>document.getElementById("bw-title").textContent);
    ok(arTitle.indexOf("الباني اليدوي")>=0,"כותרת האשף בערבית: "+arTitle);
    const gradeLabel=await page.evaluate(()=>document.querySelector("#bw-body label").textContent);
    ok(gradeLabel==="المرحلة الدراسية","תווית שכבה בערבית: "+gradeLabel);
  }),

  check("RECDEFAULTS.sports() מחזיר שמות ופרוטוקולים מתורגמים לאנגלית",seed,async page=>{
    await switchLang(page,"en");
    const sp=await page.evaluate(()=>{
      const list=window.RECDEFAULTS.sports();
      return list.find(s=>s.id==="rope");
    });
    ok(sp&&sp.name==="Jump Rope","שם הענף באנגלית: "+(sp&&sp.name));
    ok(sp&&sp.proto.indexOf("60 seconds")>=0,"פרוטוקול באנגלית: "+(sp&&sp.proto));
  }),

  check("RECDEFAULTS.universal (getter) מציג כללים מתורגמים לרוסית",seed,async page=>{
    await switchLang(page,"ru");
    const uni=await page.evaluate(()=>window.RECDEFAULTS.universal);
    ok(Array.isArray(uni)&&uni.length===5,"מערך של 5 כללים: "+JSON.stringify(uni&&uni.length));
    ok(uni&&/непрерывн/i.test(uni[0]),"כלל ראשון ברוסית: "+(uni&&uni[0]));
  }),

  check("RECDEFAULTS.universal חוזר לעברית כשהשפה חוזרת לעברית",seed,async page=>{
    await switchLang(page,"ru");
    await switchLang(page,"he");
    const uni=await page.evaluate(()=>window.RECDEFAULTS.universal);
    ok(uni&&uni[0].indexOf("צילום אחד רצוף")>=0,"כלל ראשון בעברית: "+(uni&&uni[0]));
  })

]};
