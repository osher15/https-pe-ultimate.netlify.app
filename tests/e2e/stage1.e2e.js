"use strict";
/* שלב 1 (30.09) — אמינות נתונים בשימוש יומיומי:
   1. כשל אחסון באמצע שחזור אינו משאיר את המורה בלי הנתונים הקודמים.
   2. תרחיש רציף עם רענון באמצע: כיתה → שיעור → נוכחות → מדידה → רענון →
      סיום → ציון, בלי אובדן ובלי שיוך שגוי. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const T3="c:ט:3";
const oldData={
  "ft.classes":{[T3]:{id:T3,name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "stu.list":[{id:"a",name:"דן אבירם",cls:"ט׳3",cid:T3,sex:"boys",age:14,tests:[]},
              {id:"b",name:"רון לוי",cls:"ט׳3",cid:T3,sex:"boys",age:14,tests:[]}],
  "ft.results":[{id:"r1",d:"2026-09-02",ts:1,cls:"ט׳3",cid:T3,test:"push",name:"דן אבירם",sid:"a",val:22,unit:"חזרות"}],
  "settings":{school:"בית ספר ישן",theme:"dark",sound:true},
  "ft.last":{grade:"ט",num:3,sort:"name"},
  "schema.version":D.SCHEMA_VERSION,"pf.guideSeen":true
};
const dump=page=>page.evaluate(()=>{ const o={}; Object.keys(localStorage).filter(k=>k.indexOf("peultimate.")===0)
  .forEach(k=>o[k.slice(11)]=localStorage.getItem(k)); return o; });

/* גיבוי מבית ספר אחר, גדול מהנתונים שבמכשיר */
const incoming=()=>({app:D.BK_APP,v:D.BK_V,schema:D.SCHEMA_VERSION,at:"2026-09-30T08:00:00.000Z",
  data:{
    "settings":JSON.stringify({school:"בית ספר חדש",theme:"dark",sound:true}),
    "ft.classes":JSON.stringify({"c:ח:2":{id:"c:ח:2",name:"ח׳2",grade:"ח",num:2,key:"ח2"}}),
    "stu.list":JSON.stringify([{id:"z",name:"זוהר",cls:"ח׳2",cid:"c:ח:2",sex:"girls",age:13,tests:[]}]),
    "ft.results":JSON.stringify([]),
    "schema.version":String(D.SCHEMA_VERSION)
  }});

module.exports={title:"שלב 1 — אמינות נתונים",
  allow:/\[אחסון\]/,
  tests:[

  check("כשל אחסון באמצע שחזור: הנתונים הקודמים חוזרים במלואם והדיווח כן",oldData,async page=>{
    const before=await dump(page);
    const snap=incoming();
    const r=await page.evaluate(async s=>{
      /* מפתח אחד מהקובץ נכשל במכסה; כתיבת הנתונים הקודמים עוברת */
      const real=localStorage.setItem.bind(localStorage);
      const target="peultimate.stu.list", bad=s.data["stu.list"];
      localStorage.setItem=function(k,v){
        if(k===target&&v===bad){ const e=new Error("The quota has been exceeded."); e.name="QuotaExceededError"; e.code=22; throw e; }
        return real(k,v);
      };
      try{ return await window.HM.backupTest.apply(s); }
      finally{ localStorage.setItem=real; }
    },snap);
    ok(r.failed>0,"הכשל מדווח");
    eq(r.rolledBack,true,"השחזור בוטל ולא נשאר חלקי");
    const after=await dump(page);
    const SKIP={"bk.last":1,"up.seen":1};
    Object.keys(before).filter(k=>!SKIP[k]).forEach(k=>eq(after[k],before[k],"מפתח "+k+" נשאר כמו שהיה"));
    Object.keys(after).filter(k=>!SKIP[k]&&!(k in before)&&k in snap.data)
      .forEach(k=>{ throw new Error("מפתח מהקובץ דלף למכשיר: "+k); });
    eq(JSON.parse(after["stu.list"]).map(s=>s.id),["a","b"],"התלמידים הקודמים במקומם");
  }),

  check("שחזור תקין עדיין מחליף את הנתונים (אין רגרסיה מהגנת הכשל)",oldData,async page=>{
    const r=await page.evaluate(s=>window.HM.backupTest.apply(s),incoming());
    eq(r.failed,0);
    ok(!r.rolledBack,"בלי ביטול");
    eq(await page.evaluate(()=>window.HM.LS.get("stu.list",[]).map(s=>s.id)),["z"],"הקובץ החליף את הרשימה");
    eq(await page.evaluate(()=>window.HM.LS.get("settings",{}).school),"בית ספר חדש");
  }),

  check("רציף: שיעור → מדידה → נוכחות → רענון → סיום: הכול שייך לכיתה ולתלמיד הנכונים",oldData,async page=>{
    await page.evaluate(()=>window.HM.go("ft")); await page.waitForTimeout(700);
    await page.evaluate(()=>document.getElementById("ft-startLesson").click());
    await page.waitForTimeout(450);
    const sid=await page.evaluate(()=>window.HM.session.active().id);
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click());
    await page.waitForTimeout(600);
    await page.evaluate(()=>{ const i=document.querySelector("#ft-list [data-val]");
      i.value="190"; i.dispatchEvent(new Event("change",{bubbles:true})); });
    await page.waitForTimeout(450);
    await page.evaluate(()=>window.TOOLS.markAllPresent());
    await page.waitForTimeout(300);

    /* סקריפט ההזרעה של ה-harness רץ מחדש בכל רענון ומחזיר את ה-seed;
       מזריעים אחריו את המצב שנשמר, כדי שהרענון ידמה מכשיר אמיתי */
    const persisted=await dump(page);
    await page.addInitScript(d=>Object.keys(d).forEach(k=>localStorage.setItem("peultimate."+k,d[k])),persisted);
    await page.reload({waitUntil:"domcontentloaded"}); await page.waitForTimeout(900);
    eq(await page.evaluate(()=>window.HM.session.active().id),sid,"אותו שיעור אחרי רענון");

    const res=await page.evaluate(i=>window.HM.session.complete(i),sid);
    eq(res.outcome,"completed");
    const m=await page.evaluate(()=>window.FT.results().filter(r=>r.sessionId===window.HM.session.all().slice(-1)[0].id));
    eq(m.length,1,"מדידה אחת");
    eq(m[0].sessionId,sid);
    eq(m[0].cid,T3,"בכיתה הנכונה");
    ok(["a","b"].indexOf(m[0].sid)>=0,"לתלמיד מהרשימה");
    eq(m[0].val,190);
    const att=await page.evaluate(()=>window.HM.LS.get("tools.att",{}));
    const key=Object.keys(att).find(k=>/\|ט׳3$/.test(k));
    ok(key,"נוכחות נשמרה על הכיתה");
    eq(Object.values(att[key]).every(v=>v==="p"),true,"כולם נוכחים");
    /* המדידה הקודמת של דן מהחודש שעבר לא נגעה */
    eq(await page.evaluate(()=>window.FT.results().filter(r=>r.test==="push").length),1,"מדידה ישנה שלמה");
    eq(await page.evaluate(()=>window.HM.session.active()),null,"אין שיעור פעיל");
  })

]};
