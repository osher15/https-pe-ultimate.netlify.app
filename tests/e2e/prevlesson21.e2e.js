"use strict";
/* ============================================================
   #21 — מה שנרשם בפעם שעברה, ליד «התחל שיעור»
   ------------------------------------------------------------
   הדירוג וההערה נשמרים כבר בסיום שיעור (מחסן השיעורים, ls.sessions).
   כאן נבדק רק שהם מוצגים בכרטיס של אותה כיתה, לפני ההתחלה:
   לפי cid ולא לפי שם, קריאה בלבד, לא מוצגים כשאין מה להציג,
   ומתורגמים. אין מחסן חדש.
   ============================================================ */
const {check,eq,ok,atToday}=require("./harness.js");
const D=require("../../hm-data.js");

const CLASSES={
  "c:ז:2":{id:"c:ז:2",name:"ז׳2",grade:"ז",num:2,key:"ז2"},
  "c:ח:1":{id:"c:ח:1",name:"ח׳1",grade:"ח",num:1,key:"ח1"}
};
const todayISO=()=>new Date().toISOString().slice(0,10);
const DAY=()=>D.dayOfISO(todayISO());
const done=(id,cid,date,at,rating,note)=>({id,cid,clsSnapshot:cid==="c:ז:2"?"ז׳2":"ח׳1",date,startedAt:at,endedAt:at+2700000,
  status:D.SESSION_DONE,planTitle:"",rating,note});
const mk=sessions=>({"ft.classes":CLASSES,"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,__now:atToday("07:00"),
  "sched.week":[{id:"s1",day:DAY(),time:"09:00",cid:"c:ז:2",clsSnapshot:"ז׳2",topic:"כדורסל — מסירה"}],
  "ls.sessions":sessions});
const focus=page=>page.evaluate(()=>{ const f=document.querySelector("#hx-todayList .hx-focus"); return f?f.textContent.replace(/\s+/g," ").trim():""; });
const prev=page=>page.evaluate(()=>{ const e=document.querySelector("#hx-todayList .hx-focus .hx-prev"); return e?e.textContent.replace(/\s+/g," ").trim():null; });

module.exports={title:"מה נרשם בפעם שעברה (#21)",tests:[

  check("הכרטיס מציג דירוג והערה של השיעור האחרון באותה כיתה",
    mk([done("a1","c:ז:2","2026-09-06",1757100000000,-1,"התרגיל האחרון היה קשה מדי")]),async page=>{
    const p=await prev(page);
    ok(p,"שורת «בפעם שעברה» קיימת");
    ok(p.includes("בפעם שעברה בכיתה הזאת"),p);
    ok(p.includes("לא עבד"),"הדירוג מוצג: "+p);
    ok(p.includes("התרגיל האחרון היה קשה מדי"),"ההערה מוצגת: "+p);
  }),

  check("מוצג השיעור האחרון, ושיעור של כיתה אחרת לא דולף",
    mk([done("a1","c:ז:2","2026-09-01",1756700000000,1,"ישן"),
        done("a2","c:ז:2","2026-09-08",1757300000000,0,"חדש"),
        done("b1","c:ח:1","2026-09-09",1757400000000,-1,"של כיתה אחרת")]),async page=>{
    const p=await prev(page);
    ok(p&&p.includes("חדש")&&p.includes("בינוני"),String(p));
    ok(!p.includes("ישן")&&!p.includes("של כיתה אחרת"),"לא ישן ולא של כיתה אחרת: "+p);
  }),

  check("בלי דירוג והערה — אין שורה, והכרטיס נשאר תקין",
    mk([done("a1","c:ז:2","2026-09-06",1757100000000,null,"")]),async page=>{
    eq(await prev(page),null,"אין שורה ריקה");
    ok((await focus(page)).includes("התחל שיעור"),"כפתור ההתחלה קיים");
  }),

  check("הערה ארוכה מקוצרת בתצוגה ואינה משנית את הנשמר",
    mk([done("a1","c:ז:2","2026-09-06",1757100000000,1,"א".repeat(300))]),async page=>{
    const p=await prev(page);
    ok(p&&p.length<200,"מקוצר: "+(p&&p.length));
    const stored=await page.evaluate(()=>window.HM.LS.get("ls.sessions",[])[0].note.length);
    eq(stored,300,"הערה נשמרת במלואה");
  }),

  check("התוכן של הערה מוצג כטקסט, לא כ-HTML",
    mk([done("a1","c:ז:2","2026-09-06",1757100000000,1,"<img src=x onerror=window.__xss=1>")]),async page=>{
    const r=await page.evaluate(()=>({x:!!window.__xss,img:!!document.querySelector("#hx-todayList .hx-prev img")}));
    ok(!r.x&&!r.img,"אין הזרקה");
  }),

  check("השורה מתורגמת לאנגלית",
    mk([done("a1","c:ז:2","2026-09-06",1757100000000,1,"")]),async page=>{
    await page.evaluate(()=>window.I18N.set("en")); await page.waitForTimeout(250);
    const p=await prev(page);
    ok(p&&p.includes("Last time in this class"),String(p));
    ok(!/[א-ת]/.test(p),"אין עברית שנשארה: "+p);
  })

]};
