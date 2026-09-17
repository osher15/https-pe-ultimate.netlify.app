"use strict";
/* בטיחות אחסון — מקצה לקצה.
   הכשל המקורי היה שקט לגמרי, ולכן הבדיקה המרכזית כאן אינה «האם
   נשמר» אלא «האם המורה יודע שלא נשמר». */
const {check,eq,ok}=require("./harness.js");

const base={"ft.roster":{"ט3":[{id:"a",name:"דן אבירם",sex:"boys"}]},
  "ft.results":[],"ft.last":{grade:"ט",num:3,sort:"name"},"pf.guideSeen":true};

const openSettings=async page=>{
  await page.evaluate(()=>document.getElementById("btnSettings").click());
  await page.waitForTimeout(500);
};
/* מפתח סרק שהאפליקציה לא קוראת בשום מקום — נמדד ע"י usedStorageBytes
   (שסופרת כל מפתח תחת התחילית, לא רק שדות מוכרים) בלי לסכן אף מסך
   שקורא ft.results/stu.list וכדומה כמערך אמיתי. */
const filled=pct=>Object.assign({},base,
  {"qa.filler":"x".repeat(Math.round(5*1024*1024*pct))});

/* מחליף את localStorage.setItem בכזה שנכשל במכסה */
async function breakStorage(page){
  await page.evaluate(()=>{
    const real=localStorage.setItem.bind(localStorage);
    window.__real=real;
    localStorage.setItem=function(k,v){
      if(String(k).indexOf("peultimate.")===0){
        const e=new Error("The quota has been exceeded.");
        e.name="QuotaExceededError"; e.code=22; throw e;
      }
      return real(k,v);
    };
  });
}

module.exports={title:"בטיחות אחסון",
  /* החבילה הזאת מביימת כשלי אחסון בכוונה, ולכן הדיווח עליהם
     בקונסול הוא הפלט הרצוי ולא תקלה. כל שגיאה אחרת עדיין מכשילה. */
  allow:/\[אחסון\]/,
  tests:[

  check("במצב תקין אין אזהרה והכתיבה מדווחת כהצלחה",base,async page=>{
    eq(await page.evaluate(()=>window.HM.LS.set("bt.age",15)),true,"הכתיבה החזירה הצלחה");
    eq(await page.evaluate(()=>window.HM.LS.get("bt.age",0)),15,"והערך חזר");
    const h=await page.evaluate(()=>window.HM.storage());
    eq(h.ok,true,"האחסון תקין");
    eq(h.backend,"localStorage");
    eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),true,"אין אזהרה על המסך");
  }),

  check("מכסה שנגמרה: הכתיבה מחזירה false ולא מעמידה פנים",base,async page=>{
    await breakStorage(page);
    eq(await page.evaluate(()=>window.HM.LS.set("bt.age",15)),false,
      "הכתיבה חייבת לדווח על כישלון — זה בדיוק מה שלא קרה קודם");
    const h=await page.evaluate(()=>window.HM.storage());
    eq(h.ok,false,"בריאות האחסון סומנה כפגועה");
    eq(h.lastErr.code,"quota","הכשל סווג נכון");
  }),

  check("מכסה שנגמרה: מוצגת אזהרה קבועה עם מסלול הצלה",base,async page=>{
    await breakStorage(page);
    await page.evaluate(()=>window.HM.LS.set("ft.results",[1,2,3]));
    await page.waitForTimeout(200);
    const bar=await page.evaluate(()=>{
      const el=document.getElementById("stWarn");
      return {hidden:el.hidden,txt:el.textContent,
        save:!!document.getElementById("stWarnSave"),
        vis:getComputedStyle(el).display};
    });
    eq(bar.hidden,false,"האזהרה מוצגת");
    ok(bar.vis!=="none","והיא באמת נראית על המסך");
    ok(bar.txt.indexOf("מלא")>=0,"והיא אומרת מה קרה — התקבל: «"+bar.txt.trim()+"»");
    ok(bar.save,"ויש כפתור ייצוא גיבוי — מסלול ההצלה");
  }),

  check("מדידה שלא נשמרה מפילה אזהרה מתוך זרימת העבודה האמיתית",base,async page=>{
    await page.evaluate(()=>window.HM.go("ft")); await page.waitForTimeout(700);
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click());
    await page.waitForTimeout(600);
    await breakStorage(page);
    await page.evaluate(()=>{
      const inp=document.querySelector("#ft-list [data-val]");
      inp.value="30"; inp.dispatchEvent(new Event("change",{bubbles:true}));
    });
    await page.waitForTimeout(500);
    eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),false,
      "המורה חייב לדעת שהמדידה לא נשמרה");
  }),

  check("נתון פגום באחסון: האפליקציה עולה ומדווחת",
    Object.assign({},base),async page=>{
    /* כותבים ידנית ערך שאינו JSON, כמו נתון שנחתך באמצע כתיבה */
    await page.evaluate(()=>localStorage.setItem("peultimate.stu.list","{נחתך באמצע"));
    const v=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    eq(v,[],"מוחזרת ברירת מחדל כדי שהמסך יעלה");
    const h=await page.evaluate(()=>window.HM.storage());
    eq(h.lastErr.code,"serialize","והכשל סווג כנתון פגום ולא נבלע");
  }),

  check("כישלון כתיבה לא הורס את הערך הקודם",base,async page=>{
    await page.evaluate(()=>window.HM.LS.set("bt.age",14));
    await breakStorage(page);
    await page.evaluate(()=>window.HM.LS.set("bt.age",99));
    await page.evaluate(()=>{ localStorage.setItem=window.__real; });
    eq(await page.evaluate(()=>window.HM.LS.get("bt.age",0)),14,"הערך הישן שרד");
  }),

  check("סגירת האזהרה לא משתיקה כשל חדש",base,async page=>{
    await breakStorage(page);
    await page.evaluate(()=>window.HM.LS.set("ft.results",[1]));
    await page.waitForTimeout(150);
    await page.evaluate(()=>document.getElementById("stWarnX").click());
    eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),true,"נסגרה");
    await page.evaluate(()=>window.HM.LS.set("ft.results",[1,2]));
    await page.waitForTimeout(150);
    eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),true,
      "אותו כשל חוזר לא מקפיץ שוב את מה שהמורה כבר סגר");
  }),

  /* ============================================================
     אזהרה מקדימה — לפני שכתיבה נכשלת, לא רק אחריה
     ------------------------------------------------------------
     עד עכשיו האזהרה על מקום נגמר הייתה מותנית בפתיחת ההגדרות
     (`paintQuotaMeter`) — מורה שמודד כיתה שלמה בלי לעצור ולפתוח
     הגדרות יכול לחצות את המכסה בלי לדעת. הבדיקות כאן ממלאות
     אחסון אמיתי (מפתח סרק שהאפליקציה לא קוראת בשום מקום אחר,
     ולכן לא מסכן אף מסך) לכל אחת משתי הרמות, ובודקות שהפס
     `#stWarn` מגיב רק ב-90%+ — ולא ב-70%, כדי שהוא לא יהפוך
     לרעש קבוע לכל מורה שמתקרב למכסה בלי להיות בסכנה אמיתית.
     ============================================================ */

  check("70% אחסון: הפס נשאר סגור — רק ההגדרות מודיעות",filled(0.75),async page=>{
    await page.evaluate(()=>window.HM.LS.set("bt.age",15));
    await page.waitForTimeout(150);
    eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),true,
      "75% אינו קריטי — הפס בצבע סכנה שמור לרגע שבו זה כבר לא נכון");
    await openSettings(page);
    const txt=await page.evaluate(()=>document.getElementById("set-quotaMeter").textContent);
    ok(/7\d%/.test(txt),"אבל ההגדרות כן מראות את האחוז: "+txt);
  }),

  check("91% אחסון: הפס נפתח כבר מהעלייה — בלי לפתוח הגדרות ובלי פעולה של המורה",
    filled(0.91),async page=>{
      /* checkStorageLevel רצה בתוך LS.set, וכבר בעלייה עצמה יש
         כתיבות שגרתיות (הסבה, סנכרון תלמידים) — בדיוק הנקודה:
         המורה לא צריך לעשות שום דבר כדי לקבל את האזהרה. */
      const bar=await page.evaluate(()=>{
        const el=document.getElementById("stWarn");
        return {hidden:el.hidden,txt:el.textContent,save:!!document.getElementById("stWarnSave")};
      });
      eq(bar.hidden,false,"נפתח מעצמו — לא נגענו בהגדרות בכלל");
      ok(bar.txt.indexOf("מלא")>=0,"מסביר מה קורה: "+bar.txt.trim());
      ok(!/נכשל|לא נשמר/.test(bar.txt),
        "בלי לטעון שמשהו כבר אבד — זו אזהרה מקדימה, לא דיווח כשל: "+bar.txt.trim());
      ok(bar.save,"ומציע את אותו מסלול הצלה — ייצוא גיבוי מיידי");
    }),

  check("אזהרה מקדימה שנסגרה לא חוזרת מכתיבה חוזרת באותה רמה",filled(0.91),
    async page=>{
      await page.evaluate(()=>window.HM.LS.set("bt.age",15));
      await page.waitForTimeout(150);
      eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),false);
      await page.evaluate(()=>document.getElementById("stWarnX").click());
      await page.evaluate(()=>window.HM.LS.set("bt.age",16));
      await page.waitForTimeout(150);
      eq(await page.evaluate(()=>document.getElementById("stWarn").hidden),true,
        "אותה רמה קריטית לא מקפיצה שוב את מה שהמורה כבר סגר");
    }),

  check("כשל אמיתי עדיין מוצג גם אחרי שהאזהרה המקדימה נסגרה",filled(0.91),
    async page=>{
      await page.evaluate(()=>window.HM.LS.set("bt.age",15));
      await page.waitForTimeout(150);
      await page.evaluate(()=>document.getElementById("stWarnX").click());
      await breakStorage(page);
      await page.evaluate(()=>window.HM.LS.set("ft.results",[1]));
      await page.waitForTimeout(150);
      const bar=await page.evaluate(()=>({
        hidden:document.getElementById("stWarn").hidden,
        txt:document.getElementById("stWarn").textContent}));
      eq(bar.hidden,false,"קוד שונה (כשל אמיתי, לא רמה) — לא נחסם ע״י הדיחוי הקודם");
      ok(bar.txt.indexOf("מלא")>=0,bar.txt.trim());
    })

]};
