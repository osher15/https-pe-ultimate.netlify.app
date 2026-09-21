"use strict";
/* ============================================================
   ארכוב שיעורים ישנים — מקצה לקצה, כולל IndexedDB
   ------------------------------------------------------------
   SESSION_MAX=300 גוזר בשקט את השיעורים הישנים ביותר מ-ls.sessions
   כשעוברים אותו, ומורה שמלמד הרבה כיתות מגיע לזה בתוך שנת לימודים
   אחת. מאז שהתוכנית השנתית (§13.3 פריט 6) נשענת על ls.sessions
   להתקדמות יחידה, גזירה שקטה אינה רק "היסטוריה נעלמת" — היא
   "ההתקדמות שכבר הוצגה יורדת". הארכוב (SARC) נותן למורה כלי לפנות
   מקום *מרצון*, הפיך, לפני שהגזירה קורית.

   אותה הערה מתודולוגית כמו archive.e2e.js: sam-go/sam-restoreAll
   מרעננים את הדף, וההזרעה של ה-harness רצה מחדש בכל רענון — כך
   שבדיקה שעוברת דרך הכפתור ובודקת ls.sessions אחרי הרענון תראה
   את הזרע המקורי, לא את התוצאה. לכן: בדיקות על ls.sessions קוראות
   ל-SARC.archiveOld/restoreAll ישירות; בדיקת הכפתור עצמו מאמתת
   דרך IndexedDB — שאינו מוזרע מחדש ולכן בטוח לבדוק גם אחרי רענון.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const OLD="2023-01-15", NEW="2026-08-01";
const CLS={"c:ז:1":{id:"c:ז:1",name:"ז׳1",grade:"ז",num:1,key:"ז1"}};
const ses=(id,date,status)=>({id,cid:"c:ז:1",clsSnapshot:"ז׳1",date,
  startedAt:Date.parse(date+"T09:00:00"),
  endedAt:status===D.SESSION_DONE?Date.parse(date+"T09:45:00"):null,
  status:status||D.SESSION_DONE,planId:null,planTitle:""});
const base={"ft.classes":CLS,"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ls.sessions":[ses("s1",OLD),ses("s2",NEW)]};
const withActive=Object.assign({},base,
  {"ls.sessions":[ses("s1",OLD),ses("s2",NEW),ses("s3","2020-01-01",D.SESSION_ACTIVE)]});

const sessions=page=>page.evaluate(()=>window.HM.session.all());
const sarcCount=page=>page.evaluate(()=>window.SARC.count());
const openSettings=async page=>{
  await page.evaluate(()=>document.getElementById("btnSettings").click());
  await page.waitForTimeout(500);
};
const openSessArchiveModal=async page=>{
  await openSettings(page);
  await page.evaluate(()=>document.getElementById("set-archiveSess").click());
  await page.waitForTimeout(500);
};

module.exports={title:"ארכוב שיעורים ישנים",tests:[

  /* ---------- הלוגיקה עצמה, דרך SARC ישירות ---------- */

  check("archiveOld מזיז שיעורים ישנים מ-ls.sessions, ומשאיר את החדשים",base,
    async page=>{
      const r=await page.evaluate(()=>window.SARC.archiveOld("2025-01-01"));
      eq(r.archived,1);
      const s=await sessions(page);
      eq(s.map(x=>x.id),["s2"],"רק השיעור החדש נשאר פעיל");
      eq(await sarcCount(page),1,"והישן עבר לארכיון");
    }),

  check("שיעור פעיל לעולם לא נארכב, גם אם התאריך שלו ישן מאוד",withActive,
    async page=>{
      const r=await page.evaluate(()=>window.SARC.archiveOld("2026-01-01"));
      eq(r.archived,1,"רק s1 — לא s3 הפעיל, למרות שתאריכו קדום יותר");
      const s=await sessions(page);
      ok(s.some(x=>x.id==="s3"&&x.status===D.SESSION_ACTIVE),
        "השיעור הפעיל נשאר במקומו, פתוח");
    }),

  check("שיעור שארכבו נשמר בשלמותו — לא נחתך",base,async page=>{
    await page.evaluate(()=>window.SARC.archiveOld("2025-01-01"));
    const item=await page.evaluate(async()=>{
      const all=await window.SARC.exportAll();
      return all.items[0];
    });
    eq(item.id,"s1"); eq(item.cid,"c:ז:1"); eq(item.clsSnapshot,"ז׳1");
    eq(item.status,D.SESSION_DONE);
  }),

  check("archiveOld על תאריך שאינו כולל כלום לא נוגע בדבר",base,async page=>{
    const r=await page.evaluate(()=>window.SARC.archiveOld("2020-01-01"));
    eq(r.archived,0);
    eq((await sessions(page)).length,2,"שני השיעורים עדיין פעילים");
    eq(await sarcCount(page),0);
  }),

  check("restoreAll מחזיר את הארכיון לפעיל ומרוקן אותו",base,async page=>{
    await page.evaluate(()=>window.SARC.archiveOld("2025-01-01"));
    eq((await sessions(page)).length,1,"אחרי ארכוב — רק אחד פעיל");
    const r=await page.evaluate(()=>window.SARC.restoreAll());
    eq(r.restored,1);
    const s=await sessions(page);
    eq(s.map(x=>x.id).sort(),["s1","s2"],"שני השיעורים פעילים שוב");
    eq(await sarcCount(page),0,"והארכיון התרוקן");
  }),

  check("restoreAll על ארכיון ריק לא עושה כלום",base,async page=>{
    const r=await page.evaluate(()=>window.SARC.restoreAll());
    eq(r.restored,0);
    eq((await sessions(page)).length,2,"ls.sessions לא זז");
  }),

  check("גיבוי מלא כולל את ארכיון השיעורים, ושחזור מחזיר אותו לארכיון — לא לפעיל",
    base,async page=>{
      await page.evaluate(()=>window.SARC.archiveOld("2025-01-01"));
      const snap=await page.evaluate(()=>window.HM.backupTest.snapshotFull());
      ok(Array.isArray(snap.sarc)&&snap.sarc.length===1,
        "הגיבוי נושא את השיעור הארכיבי, במקטע נפרד מ-arc");
      eq(snap.sarc[0].id,"s1");

      /* מנקים הכול — כמו מכשיר חדש */
      await page.evaluate(async()=>{
        Object.keys(localStorage).filter(k=>k.indexOf("peultimate.")===0).forEach(k=>localStorage.removeItem(k));
        await window.SARC.restoreAll();      /* מרוקן את oldsessions שהיה על המכשיר */
      });

      const r=await page.evaluate(s=>window.HM.backupTest.apply(s),snap);
      eq(r.sarc.added,1,"רשומת הארכיון יובאה, בנפרד מ-r.arc");
      const s=await sessions(page);
      eq(s.map(x=>x.id),["s2"],"רק הפעיל חזר ל-ls.sessions — הארכיבי לא קפץ לפעיל");
      eq(await sarcCount(page),1,"והוא נמצא בארכיון, כמו שהיה לפני הגיבוי");
    }),

  /* ---------- הסיבה האמיתית לתכונה: התקדמות היחידה ---------- */

  check("שיעור שאורכב יוצא מהתקדמות היחידה, וחוזר אליה אחרי שחזור",
    Object.assign({},base,{"ls.sessions":[ses("u1","2025-11-03"),ses("u2","2025-11-10")]}),
    async page=>{
      const unit=await page.evaluate(()=>window.HM.units.add(
        {title:"כדורעף",from:"2025-11-01",to:"2025-12-15",planned:4,cids:["c:ז:1"]}));
      const before=await page.evaluate(id=>window.HM.units.progress(id),unit.unit.id);
      eq(before.done,2,"שני השיעורים נספרים לפני הארכוב");

      await page.evaluate(()=>window.SARC.archiveOld("2025-11-05"));
      const afterArchive=await page.evaluate(id=>window.HM.units.progress(id),unit.unit.id);
      eq(afterArchive.done,1,
        "שיעור שאורכב לא נספר יותר — בדיוק החשש שהניע את הארכוב הזה");

      await page.evaluate(()=>window.SARC.restoreAll());
      const afterRestore=await page.evaluate(id=>window.HM.units.progress(id),unit.unit.id);
      eq(afterRestore.done,2,"ואחרי שחזור — חזר להיספר");
    }),

  /* ---------- חלון הארכוב: תצוגה מקדימה וכפתורים (בלי ללחוץ go) ---------- */

  check("בחירת תאריך מציגה תצוגה מקדימה נכונה ומדליקה את הכפתור",base,async page=>{
    await openSessArchiveModal(page);
    await page.evaluate(()=>{ document.getElementById("sam-date").value="2025-01-01";
      document.getElementById("sam-date").dispatchEvent(new Event("change")); });
    await page.waitForTimeout(300);
    const preview=await page.evaluate(()=>document.getElementById("sam-preview").textContent);
    ok(preview.indexOf("1")>=0,"מזכיר שיעור אחד: "+preview);
    eq(await page.evaluate(()=>document.getElementById("sam-go").disabled),false);
  }),

  check("תאריך שלא תופס כלום — הכפתור כבוי",base,async page=>{
    await openSessArchiveModal(page);
    await page.evaluate(()=>{ document.getElementById("sam-date").value="2020-01-01";
      document.getElementById("sam-date").dispatchEvent(new Event("change")); });
    await page.waitForTimeout(300);
    ok(await page.evaluate(()=>document.getElementById("sam-go").disabled),"אין מה לארכב");
  }),

  check("כפתור «שחזר הכול» כבוי כשהארכיון ריק, ואומר את זה",base,async page=>{
    await openSessArchiveModal(page);
    const disabled=await page.evaluate(()=>document.getElementById("sam-restoreAll").disabled);
    ok(disabled,"אין מה לשחזר");
    const text=await page.evaluate(()=>document.getElementById("sam-count").textContent);
    ok(text.indexOf("ריק")>=0,"וכתוב את זה בפירוש: "+text);
  }),

  check("כשיש ארכיון — «שחזר הכול» פעיל ומציג כמות",base,async page=>{
    await page.evaluate(()=>window.SARC.archiveOld("2025-01-01"));
    await openSessArchiveModal(page);
    const disabled=await page.evaluate(()=>document.getElementById("sam-restoreAll").disabled);
    eq(disabled,false);
    const text=await page.evaluate(()=>document.getElementById("sam-count").textContent);
    ok(text.indexOf("1")>=0,"מציג את הכמות: "+text);
  }),

  /* ---------- לחיצה אמיתית על הכפתור — מאומתת דרך IndexedDB בלבד ----------
     (localStorage מוזרע מחדש ברענון, כמפורט למעלה — IndexedDB לא) */

  check("לחיצה אמיתית על «ארכב» כותבת בפועל ל-IndexedDB",base,async page=>{
    await openSessArchiveModal(page);
    await page.evaluate(()=>document.querySelector('#sam-quick [data-m="24"]').click());
    await page.waitForTimeout(400);
    await page.evaluate(()=>document.getElementById("sam-go").click());
    await page.waitForTimeout(1300);      /* עובר את הרענון של 700ms */
    eq(await sarcCount(page),1,"הכפתור האמיתי ארכב בפועל");
  })

]};
