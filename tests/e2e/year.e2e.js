"use strict";
/* ============================================================
   התוכנית השנתית — יחידות הוראה בדפדפן
   ------------------------------------------------------------
   שכבת הנתונים נבדקת ביחידה (`tests/unit/year.test.js`). כאן
   נבדק מה שאי אפשר לבדוק בלעדיה: שהמסך באמת שומר את מה שהוקלד,
   שהיחידה נופלת בשנה הנכונה, ושהגלגול כלפי מעלה — שיעור שהתקיים
   → יחידה → תוכנית — מגיע עד הפיקסל שהמורה רואה.

   השעון מוקפא ל-10.11.2025 כדי ששנת הלימודים תהיה 2025/26 בכל
   הרצה. בדיקה שתוצאתה תלויה בחודש שבו הריצו אותה אינה בדיקה.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const CLS={
  "c:ז:1":{id:"c:ז:1",name:"ז׳1",grade:"ז",num:1,key:"ז1"},
  "c:ח:2":{id:"c:ח:2",name:"ח׳2",grade:"ח",num:2,key:"ח2"},
  "c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}
};
const NOW="2025-11-10T08:00:00";
const base={"ft.classes":CLS,"pf.guideSeen":true,
  "schema.version":D.SCHEMA_VERSION,__now:NOW};

/* שיעורים שהתקיימו — נשתלים ישירות, כי מה שנבדק הוא הגלגול
   שלהם ליחידה ולא הדרך שבה נפתחו. */
const ses=(id,cid,date,status)=>({id,cid,clsSnapshot:CLS[cid].name,date,
  startedAt:Date.parse(date+"T09:00:00"),
  endedAt:status===D.SESSION_DONE?Date.parse(date+"T09:45:00"):null,
  status:status||D.SESSION_DONE,planId:null,planTitle:""});
const withSessions=(list,results)=>Object.assign({},base,
  {"ls.sessions":list,"ft.results":results||[]});

const open=async page=>{
  await page.evaluate(()=>document.getElementById("hx-yearPlan").click());
  await page.waitForTimeout(400);
};
/* ממלא את הטופס ושומר, כפי שמורה עושה זאת */
const addUnit=async(page,o)=>{
  await page.evaluate(a=>{
    document.getElementById("yr-title").value=a.title;
    document.getElementById("yr-level").value=a.level||"";
    document.getElementById("yr-from").value=a.from;
    document.getElementById("yr-to").value=a.to;
    document.getElementById("yr-planned").value=a.planned==null?"":String(a.planned);
    document.getElementById("yr-goal").value=a.goal||"";
    document.querySelectorAll("#yr-cids [data-uc]").forEach(i=>{
      i.checked=(a.cids||[]).indexOf(i.dataset.uc)>=0;
    });
    document.getElementById("yr-save").click();
  },o);
  await page.waitForTimeout(400);
};
const listTxt=page=>page.evaluate(()=>
  document.getElementById("yr-list").textContent.replace(/\s+/g," ").trim());
const sumTxt=page=>page.evaluate(()=>
  document.getElementById("yr-sum").textContent.replace(/\s+/g," ").trim());
const errTxt=page=>page.evaluate(()=>document.getElementById("yr-err").textContent.trim());
const warnTxt=page=>page.evaluate(()=>document.getElementById("yr-warn").textContent.trim());
const stored=page=>page.evaluate(()=>window.HM.units.list());
const yearLabel=page=>page.evaluate(()=>{
  const s=document.getElementById("yr-year");
  return s.selectedOptions[0]?s.selectedOptions[0].textContent:"";
});

const VOLLEY={title:"כדורעף — מסירות",level:"בסיס",from:"2025-11-01",
  to:"2025-12-15",planned:6,cids:["c:ז:1","c:ט:3"]};

module.exports={title:"תוכנית שנתית",tests:[

  /* ---------- פתיחה ושנת לימודים ---------- */

  check("שנת הלימודים נפתחת מעצמה — מורה לא מגדיר שנה לפני שהוא מתכנן",
    base,async page=>{
      await open(page);
      eq(await yearLabel(page),"2025/26","נובמבר 2025 הוא 2025/26");
      eq(await page.evaluate(()=>window.HM.year.list().length),1);
      ok(/עוד אין יחידות/.test(await listTxt(page)),
        "ורשימה ריקה מזמינה במקום להסביר שהיא ריקה");
    }),

  check("הבוררים נטענים מהרישום — אין מקור שני לשמות הכיתות",base,
    async page=>{
      await open(page);
      const cids=await page.evaluate(()=>
        [...document.querySelectorAll("#yr-cids [data-uc]")].map(i=>i.dataset.uc));
      eq(cids,["c:ז:1","c:ח:2","c:ט:3"]);
      const names=await page.evaluate(()=>
        [...document.querySelectorAll("#yr-cids label span")].map(s=>s.textContent));
      eq(names,["ז׳1","ח׳2","ט׳3"]);
    }),

  /* ---------- יחידה רב-שכבתית ---------- */

  check("יחידה אחת חלה על ז׳ ועל ט׳ יחד — הרמה קובעת, לא הגיל",base,
    async page=>{
      await open(page);
      await addUnit(page,VOLLEY);
      eq(await errTxt(page),"","נשמרה בלי שגיאה");
      const u=(await stored(page))[0];
      ok(u,"יש יחידה באחסון");
      eq(u.cids,["c:ז:1","c:ט:3"],"שתי שכבות באותה יחידה");
      eq(u.level,"בסיס");
      eq(u.planned,6);
      const t=await listTxt(page);
      ok(/כדורעף — מסירות/.test(t),t);
      ok(/ז׳1 · ט׳3/.test(t),"ומי לומד אותה מוצג: "+t);
      ok(/1\.11–15\.12/.test(t),"והטווח: "+t);
    }),

  check("היחידה נכנסת לשנה של תאריך ההתחלה שלה, לא לשנה שעל המסך",base,
    async page=>{
      await open(page);
      eq(await yearLabel(page),"2025/26");
      await addUnit(page,Object.assign({},VOLLEY,
        {from:"2026-10-05",to:"2026-11-20"}));
      const u=(await stored(page))[0];
      const y=await page.evaluate(id=>{
        const yy=window.HM.year.byId(id); return yy?yy.label:null;
      },u.yearId);
      eq(y,"2026/27","אוקטובר 2026 הוא שנת הלימודים הבאה");
      eq(await yearLabel(page),"2026/27","והבורר עוקב — היחידה לא נעלמת");
      ok(/כדורעף/.test(await listTxt(page)),"והיא נראית");
    }),

  /* ---------- ולידציה ---------- */

  check("יחידה בלי שם או בלי כיתה אינה נשמרת, והמורה יודע למה",base,
    async page=>{
      await open(page);
      await addUnit(page,Object.assign({},VOLLEY,{title:"   "}));
      ok(/שם/.test(await errTxt(page)),"שגיאה על השם: "+await errTxt(page));
      eq((await stored(page)).length,0);
      await addUnit(page,Object.assign({},VOLLEY,{cids:[]}));
      ok(/כיתה/.test(await errTxt(page)),"שגיאה על הכיתה: "+await errTxt(page));
      eq((await stored(page)).length,0);
      await addUnit(page,Object.assign({},VOLLEY,
        {from:"2025-12-15",to:"2025-11-01"}));
      ok(/תאריכים/.test(await errTxt(page)),"שגיאה על הטווח: "+await errTxt(page));
      eq((await stored(page)).length,0,"שום דבר פגום לא נכנס לאחסון");
    }),

  /* ---------- חפיפה ---------- */

  check("חפיפה אינה חוסמת — היא מדווחת, ואומרת מי מכריע",base,async page=>{
    await open(page);
    await addUnit(page,Object.assign({},VOLLEY,{cids:["c:ז:1"]}));
    eq(await warnTxt(page),"","הראשונה לא חופפת לאיש");
    await addUnit(page,{title:"כושר — סבולת",level:"מתקדם",
      from:"2025-12-01",to:"2026-01-31",planned:8,cids:["c:ז:1"]});
    eq((await stored(page)).length,2,"שתיהן נשמרו — מורה באמת מלמד במקביל");
    const w=await warnTxt(page);
    ok(/חופפת/.test(w)&&/כדורעף/.test(w),"והוא יודע למה: "+w);
    ok(/מאוחר/.test(w),"ומי מכריע: "+w);
    ok(/חופפת ל-1/.test(await listTxt(page)),"והרשימה מסמנת את זה");
  }),

  /* ---------- הגלגול כלפי מעלה ---------- */

  check("שיעורים שהתקיימו מתגלגלים ליחידה בלי הזנה חוזרת",
    withSessions([
      ses("s1","c:ז:1","2025-11-03"),
      ses("s2","c:ט:3","2025-11-05"),
      ses("s3","c:ח:2","2025-11-05"),          /* כיתה שאינה ביחידה */
      ses("s4","c:ז:1","2025-10-20")           /* לפני תחילת היחידה */
    ],[
      {sessionId:"s1",sid:"a",test:"r60",val:9.2,d:"2025-11-03"},
      {sessionId:"s1",sid:"b",test:"r60",val:9.8,d:"2025-11-03"},
      {sessionId:"s2",sid:"a",test:"r60",val:9.4,d:"2025-11-05"},
      {sessionId:"s3",sid:"z",test:"r60",val:9.9,d:"2025-11-05"}
    ]),
    async page=>{
      await open(page);
      await addUnit(page,VOLLEY);
      const t=await listTxt(page);
      ok(/2 מתוך 6 שיעורים \(33%\)/.test(t),
        "שני השיעורים שבטווח ובכיתות הנכונות: "+t);
      ok(/3 מדידות/.test(t),"המדידות שלהם בלבד: "+t);
      ok(/2 תלמידים/.test(t),"ואותו תלמיד בשני שיעורים נספר פעם אחת: "+t);
      ok(/שיעורים התקיימו/.test(await sumTxt(page)),await sumTxt(page));
    }),

  check("היסטוריה שקדמה ליחידה נכנסת אליה — זאת כל הנקודה בשיוך לפי תאריך",
    withSessions([ses("s1","c:ז:1","2025-11-03")]),async page=>{
      /* השיעור כבר באחסון; היחידה נכתבת רק עכשיו, אחריו */
      await open(page);
      await addUnit(page,VOLLEY);
      ok(/1 מתוך 6/.test(await listTxt(page)),
        "בלי לגעת ברשומת השיעור: "+await listTxt(page));
    }),

  check("שיעור פתוח נספר כ«התקיים» רק אחרי שהסתיים",
    withSessions([ses("s1","c:ז:1","2025-11-03",D.SESSION_ACTIVE)]),
    async page=>{
      await open(page);
      await addUnit(page,VOLLEY);
      ok(/0 מתוך 6/.test(await listTxt(page)),await listTxt(page));
    }),

  check("שיעור בחפיפה נספר ביחידה אחת בלבד",
    withSessions([ses("s1","c:ז:1","2025-11-03"),ses("s2","c:ז:1","2025-12-05")]),
    async page=>{
      await open(page);
      await addUnit(page,Object.assign({},VOLLEY,{cids:["c:ז:1"],planned:4}));
      await addUnit(page,{title:"כושר — סבולת",from:"2025-12-01",
        to:"2026-01-31",planned:4,cids:["c:ז:1"]});
      /* נקרא מהאלמנט של הספירה בלבד: שם הכיתה יושב בשורה אחרת,
         ולכן «1 מתוך 4» לא יכול להידבק ל«ז׳1» ולהיקרא «11». */
      const rows=await page.evaluate(()=>
        [...document.querySelectorAll("#yr-list .yr-item .cnt")]
          .map(e=>e.textContent.replace(/\s+/g," ").trim()));
      eq(rows.length,2,"שתי יחידות");
      rows.forEach(r=>ok(/^1 מתוך 4 שיעורים/.test(r),
        "אחד לכל יחידה — לא שניים לכל אחת: "+r));
    }),

  check("יחידה בלי מספר שיעורים מתוכנן מדווחת כמה התקיימו, בלי אחוז מומצא",
    withSessions([ses("s1","c:ז:1","2025-11-03")]),async page=>{
      await open(page);
      await addUnit(page,Object.assign({},VOLLEY,{planned:""}));
      const t=await listTxt(page);
      ok(/שיעור אחד התקיים/.test(t),t);
      ok(!/%/.test(t),"ובלי אחוז: "+t);
      eq(await page.evaluate(()=>
        document.querySelectorAll("#yr-list .yr-bar").length),0,
        "ובלי פס התקדמות — אין מכנה");
    }),

  /* ---------- מצב היחידה מול היום ---------- */

  check("היחידה שמתקיימת עכשיו מסומנת, ומה שנגמר דוהה",base,async page=>{
    await open(page);
    await addUnit(page,{title:"סתיו",from:"2025-09-01",to:"2025-10-31",
      planned:4,cids:["c:ז:1"]});
    await addUnit(page,{title:"עכשיו",from:"2025-11-01",to:"2025-12-15",
      planned:4,cids:["c:ז:1"]});
    await addUnit(page,{title:"אביב",from:"2026-03-01",to:"2026-05-31",
      planned:4,cids:["c:ז:1"]});
    const cls=await page.evaluate(()=>[...document.querySelectorAll("#yr-list .yr-item")]
      .map(e=>e.className.replace("yr-item","").trim()));
    eq(cls,["past","current","upcoming"],"לפי הסדר, מול 10.11.2025");
  }),

  /* ---------- סינון ---------- */

  check("הסינון לכיתה מראה רק את מה שהיא לומדת",base,async page=>{
    await open(page);
    await addUnit(page,Object.assign({},VOLLEY,{cids:["c:ז:1","c:ט:3"]}));
    await addUnit(page,{title:"רק לח׳",from:"2025-11-01",to:"2025-12-15",
      planned:4,cids:["c:ח:2"]});
    await page.evaluate(()=>{
      document.getElementById("yr-filter").value="c:ט:3";
      document.getElementById("yr-filter").dispatchEvent(new Event("change"));
    });
    await page.waitForTimeout(300);
    const t=await listTxt(page);
    ok(/כדורעף/.test(t)&&!/רק לח׳/.test(t),"רק היחידה של ט׳3: "+t);
    ok(/מסונן לט׳3/.test(await sumTxt(page)),await sumTxt(page));
  }),

  /* ---------- עריכה ומחיקה ---------- */

  check("עריכה טוענת את היחידה, משנה אותה, ושומרת זהות",base,async page=>{
    await open(page);
    await addUnit(page,VOLLEY);
    const id=(await stored(page))[0].id;
    await page.evaluate(()=>document.querySelector("#yr-list [data-uedit]").click());
    await page.waitForTimeout(300);
    const form=await page.evaluate(()=>({
      title:document.getElementById("yr-title").value,
      level:document.getElementById("yr-level").value,
      planned:document.getElementById("yr-planned").value,
      cids:[...document.querySelectorAll("#yr-cids [data-uc]")]
        .filter(i=>i.checked).map(i=>i.dataset.uc),
      cancel:!document.getElementById("yr-cancel").hidden
    }));
    eq(form.title,"כדורעף — מסירות","הטופס נטען");
    eq(form.cids,["c:ז:1","c:ט:3"],"כולל מי לומד");
    eq(form.cancel,true,"ויש דרך לצאת מהעריכה");
    await page.evaluate(()=>{
      document.getElementById("yr-title").value="כדורעף — חבטה עליונה";
      document.getElementById("yr-planned").value="9";
      document.getElementById("yr-save").click();
    });
    await page.waitForTimeout(400);
    const all=await stored(page);
    eq(all.length,1,"לא נוצרה יחידה שנייה");
    eq(all[0].id,id,"אותה זהות");
    eq(all[0].title,"כדורעף — חבטה עליונה");
    eq(all[0].planned,9);
    eq(all[0].cids,["c:ז:1","c:ט:3"],"ומה שלא נגעו בו נשאר");
  }),

  check("מחיקת יחידה אינה נוגעת בשיעורים שהתקיימו בטווח שלה",
    withSessions([ses("s1","c:ז:1","2025-11-03"),ses("s2","c:ט:3","2025-11-05")]),
    async page=>{
      await open(page);
      await addUnit(page,VOLLEY);
      eq((await stored(page)).length,1);
      await page.evaluate(()=>document.querySelector("#yr-list [data-udel]").click());
      await page.waitForTimeout(400);
      eq((await stored(page)).length,0,"היחידה נמחקה");
      eq(await page.evaluate(()=>window.HM.session.all().length),2,
        "והשיעורים חיים בזכות עצמם");
      ok(/עוד אין יחידות/.test(await listTxt(page)),"והרשימה ריקה מחדש");
    }),

  /* ---------- המנגנון שמאחורי הציור ---------- */

  check("הרשימה נצבעת דרך hm:units-change, לא דרך קריאה ידנית",base,
    async page=>{
      await open(page);
      const seen=await page.evaluate(async()=>{
        const ev=[];
        document.addEventListener("hm:units-change",e=>ev.push(e.detail));
        window.HM.units.add({title:"מחוץ למסך",from:"2025-11-01",
          to:"2025-12-15",planned:3,cids:["c:ז:1"]});
        await new Promise(r=>setTimeout(r,250));
        return {ev,txt:document.getElementById("yr-list").textContent};
      });
      eq(seen.ev.length,1,"הכרזה אחת: "+JSON.stringify(seen.ev));
      eq(seen.ev[0].kind,"unit");
      ok(/מחוץ למסך/.test(seen.txt),
        "והרשימה התעדכנה בלי שאיש קרא לה: "+seen.txt.slice(0,70));
    }),

  check("היחידה הפעילה לכיתה נגזרת מאותה הכרעה של השיעור",base,async page=>{
    await open(page);
    await addUnit(page,Object.assign({},VOLLEY,{cids:["c:ז:1"]}));
    await addUnit(page,{title:"כושר — סבולת",from:"2025-12-01",
      to:"2026-01-31",planned:8,cids:["c:ז:1"]});
    const r=await page.evaluate(()=>({
      now:(window.HM.units.current("c:ז:1")||{}).title,
      overlap:(window.HM.units.current("c:ז:1","2025-12-05")||{}).title,
      after:window.HM.units.current("c:ז:1","2026-06-01"),
      other:window.HM.units.current("c:ח:2")
    }));
    eq(r.now,"כדורעף — מסירות","ב-10.11 — היחידה הראשונה");
    eq(r.overlap,"כושר — סבולת","ובחפיפה — המאוחרת, כמו unitOfSession");
    eq(r.after,null,"אחרי שתיהן — אין יחידה");
    eq(r.other,null,"ולכיתה שלא לומדת אותן — אין");
  })

]};
