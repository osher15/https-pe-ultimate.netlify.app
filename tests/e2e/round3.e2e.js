"use strict";
/* סבב 3 (2026-09-29) — מול הקובץ הבנוי:
   1. פטור בהשתתפות: תרחיש הבדיקה החיצונית במצב הדגמה (ט׳3, 29.9).
   2. «0 מבחנים» ברשימת התלמידים מול מדידות במסך הכושר.
   3. מניעת אובדן נתונים: שתי כיתות, ציונים קיימים, מילוי, רענון,
      גיבוי ושחזור — 0 הוא ערך, שדה ריק אינו 0. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const T3="c:ט:3", H2="c:ח:2";
const DAY="2026-09-29";
const NOW={__now:DAY+"T09:00:00"};
const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const demo=async page=>{
  await page.evaluate(()=>document.getElementById("lock-demo").click());
  await page.waitForTimeout(900);
};
const partOf=(page,sid)=>page.evaluate(id=>{
  const inp=document.querySelector(`#gr-table tr[data-sid="${id}"] input[data-f="part"]`);
  return inp?inp.value:null;
},sid);
const toast=page=>page.evaluate(()=>document.getElementById("toastT").textContent);

/* שתי כיתות עם ציונים קיימים, ונוכחות בשתיהן */
const twoClasses=extra=>Object.assign({
  "ft.classes":{[T3]:{id:T3,name:"ט׳3",grade:"ט",num:3,key:"ט3"},
                [H2]:{id:H2,name:"ח׳2",grade:"ח",num:2,key:"ח2"}},
  "stu.list":[
    {id:"a",name:"אליס",cls:"ט׳3",cid:T3,sex:"girls",age:14,tests:[],grades:{"רבעון 1":{exams:{},know:0}}},
    {id:"b",name:"בני", cls:"ט׳3",cid:T3,sex:"boys", age:14,tests:[],grades:{"רבעון 1":{exams:{},part:55}}},
    {id:"x",name:"פטור תמיד",cls:"ט׳3",cid:T3,sex:"boys",age:14,tests:[]},
    {id:"o1",name:"אחר 1",cls:"ח׳2",cid:H2,sex:"boys",age:13,tests:[],grades:{"רבעון 1":{exams:{},part:90,know:0}}},
    {id:"o2",name:"אחר 2",cls:"ח׳2",cid:H2,sex:"boys",age:13,tests:[]}
  ],
  "tools.att":{"2026-09-01|ט׳3":{a:"p",b:"a",x:"e"},"2026-09-08|ט׳3":{a:"h",b:"p",x:"e"},
               "2026-09-01|ח׳2":{o1:"p",o2:"a"}},
  "grades.periodRanges":{"רבעון 1":{from:"2026-09-01",to:"2026-12-31"}},
  "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
},extra||{});

module.exports={title:"סבב 3 — פטור, מבחנים בפרופיל, אובדן נתונים",tests:[

  check("פטור (הדגמה, ט׳3, 29.9): מלאה 100, חלקית 50, נעדר 0, פטור — חסר ולא 0",NOW,async page=>{
    await demo(page);
    /* סימון בפועל דרך מסך הנוכחות, כמו בבדיקה החיצונית */
    await page.evaluate(c=>window.TOOLS.show(c,"att"),T3);
    await page.waitForTimeout(500);
    eq(await page.$eval("#tl-attDate",e=>e.value),DAY,"הנוכחות נפתחת על 29.9");
    for(const [id,m] of [["demo0","p"],["demo1","h"],["demo2","a"],["demo3","e"]]){
      await page.click(`#tl-attList [data-att="${id}|${m}"]`); await page.waitForTimeout(120);
    }
    const att=await page.evaluate(()=>window.HM.LS.get("tools.att",{}));
    eq(att[DAY+"|ט׳3"],{demo0:"p",demo1:"h",demo2:"a",demo3:"e"},"נשמר כמו שסומן");
    /* ציון שהמורה הזין ידנית — לא נדרס */
    await page.evaluate(c=>window.STU.show(c,"grades"),T3);
    await page.waitForTimeout(500);
    await page.evaluate(()=>{ const i=document.querySelector('#gr-table tr[data-sid="demo4"] input[data-f="part"]');
      i.value="77"; i.dispatchEvent(new Event("change",{bubbles:true})); });
    await page.waitForTimeout(250);
    await page.click("#gr-fillAtt"); await page.waitForTimeout(350);
    if(await page.locator("#ask-ok").count())await page.click("#ask-ok");
    await page.waitForTimeout(450);
    eq([await partOf(page,"demo0"),await partOf(page,"demo1"),await partOf(page,"demo2"),await partOf(page,"demo3")],
       ["100","50","0",""],"דן / איתי / רון / עומר");
    eq(await partOf(page,"demo4"),"77","ציון ידני נשאר");
    const t=await toast(page);
    ok(t.indexOf("פטור בלבד")>=0,"ההודעה מסבירה למה עומר נשאר בלי ציון — "+t);
    const cell=await page.$eval('#gr-table tr[data-sid="demo3"] td:last-child',e=>e.textContent.trim());
    ok(!/^0(\.0)?\b/.test(cell),"לעומר אין ציון 0 בעמודת הסופי — "+cell);
    const hint=await page.$eval("#gr-fillAttHint",e=>e.textContent);
    ok(hint.indexOf("פטור לא נספר")>=0&&hint.indexOf("חלקית")>=0,"שיטת החישוב מוצגת למורה");
  }),

  check("פטור בדוח הנוכחות (CSV) ובמרכז הכיתה: לא נספר במכנה",twoClasses(),async page=>{
    await page.evaluate(c=>window.TOOLS.show(c,"att"),T3);
    await page.waitForTimeout(400);
    const rows=await page.evaluate(()=>{ let got=null; const o=window.HM.dlCSV; window.HM.dlCSV=(n,r)=>{ got=r; };
      try{ document.getElementById("tl-attCsv").click(); }finally{ window.HM.dlCSV=o; } return got; });
    ok(rows,"הדוח נבנה");
    const byName=Object.fromEntries(rows.slice(1).map(r=>[r[0],r[7]]));
    eq([byName["אליס"],byName["בני"],byName["פטור תמיד"]],["75%","50%",""],"פטור תמיד — בלי אחוז, לא 0%");
  }),

  check("«התלמידים שלי» בהדגמה: מדידות הכושר נספרות, וכתוב במפורש שזה לא ביפ טסט",NOW,async page=>{
    await demo(page);
    await go(page,"stu");
    const n=await page.evaluate(()=>window.HM.LS.get("ft.results",[]).filter(r=>r.sid==="demo0"&&r.test!=="beep").length);
    ok(n>0,"יש מדידות להדגמה");
    const sb=await page.$eval('#stu-list .stu-row[data-id="demo0"] .sb',e=>e.textContent);
    ok(sb.indexOf(n+" מדידות כושר")>=0,"הרשימה מראה "+n+" מדידות כושר — "+sb);
    ok(sb.indexOf("0 ביפ טסט")>=0,"ומבחיני בין ביפ טסט — "+sb);
    ok(sb.indexOf(" מבחנים")<0,"בלי «0 מבחנים» המטעה");
    await page.click('#stu-list .stu-row[data-id="demo0"]'); await page.waitForTimeout(400);
    const tests=await page.$$eval("#stu-fitTbl tbody tr",tr=>tr.map(x=>x.dataset.t));
    const want=await page.evaluate(()=>window.FT.progress.profile({id:"demo0",name:"דן אבירם",sex:"boys"}).tests.filter(t=>t.best&&t.testId!=="beep").map(t=>t.testId));
    eq(tests.sort(),want.sort(),"הפרופיל מציג את אותם מבחנים שכרטיס הכושר");
    const total=await page.$$eval("#stu-fitTbl tbody tr td:nth-child(3)",td=>td.reduce((a,x)=>a+ +x.textContent,0));
    eq(total,n,"וסכום המדידות תואם");
    const raw=await page.evaluate(()=>window.HM.LS.get("ft.results",[]).length);
    ok(raw>0,"שום מדידה לא נמחקה");
  }),

  check("מילוי בכיתה אחת → רענון: שתי הכיתות, הציונים הקיימים, 0 וחסר — כפי שהיו",twoClasses(),async page=>{
    await page.evaluate(c=>window.STU.show(c,"grades"),T3);
    await page.waitForTimeout(400);
    await page.click("#gr-fillAtt"); await page.waitForTimeout(500);
    /* רענון אמיתי: לשונית חדשה באותו דפדפן (ה-reload של הדף היה מזריע
       מחדש את נתוני הבדיקה ומסתיר בדיוק את מה שנבדק) */
    const p2=await page.context().newPage();
    await p2.goto(page.url(),{waitUntil:"domcontentloaded"}); await p2.waitForTimeout(900);
    if(await p2.locator("#lockOv.on").count()){ await p2.fill("#lock-pass","1234"); await p2.click("#lock-enter"); await p2.waitForTimeout(400); }
    await p2.evaluate(c=>window.STU.show(c,"grades"),"c:ח:2"); await p2.waitForTimeout(300);
    const raw=await p2.evaluate(()=>window.HM.LS.get("stu.list",[]));
    eq(raw.map(s=>s.id).sort(),["a","b","o1","o2","x"],"כל התלמידים משתי הכיתות");
    const g=id=>(raw.find(s=>s.id===id).grades||{})["רבעון 1"]||{};
    eq(g("a").part,75,"אליס מולאה (מלאה + חלקית)");
    eq(g("a").know,0,"ה-0 של אליס נשאר 0 ולא נמחק");
    eq(g("b").part,55,"הציון הקיים של בני לא נדרס");
    eq(g("x").part,undefined,"פטור תמיד — נשאר חסר");
    eq([g("o1").part,g("o1").know],[90,0],"הכיתה השנייה לא נגעה");
    eq(g("o2").part,undefined,"ובה שדה חסר נשאר חסר, לא 0");
  }),

  check("גיבוי ושחזור (נתונים סינתטיים): ציונים, 0, חסר ונוכחות חוזרים זהים",twoClasses(),async page=>{
    const snap=await page.evaluate(()=>window.HM.backupTest.snapshotFull());
    const before=await page.evaluate(()=>({s:window.HM.LS.get("stu.list",[]),a:window.HM.LS.get("tools.att",{})}));
    await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.indexOf("peultimate.")===0).forEach(k=>localStorage.removeItem(k)));
    const r=await page.evaluate(s=>window.HM.backupTest.apply(s),snap);
    eq(r.failed,0,"בלי כשלי כתיבה");
    const after=await page.evaluate(()=>({s:window.HM.LS.get("stu.list",[]),a:window.HM.LS.get("tools.att",{})}));
    eq(after.s,before.s,"התלמידים והציונים זהים — כולל 0 ושדות חסרים");
    eq(after.a,before.a,"הנוכחות (כולל פטור) זהה");
  }),

  check("מצב תלמיד: רק לוח השיאים; שיא שממתין לאישור, רשימת התלמידים והציונים — לא נחשפים",twoClasses(),async page=>{
    await page.evaluate(async()=>{
      const db=await new Promise((res,rej)=>{ const rq=indexedDB.open("peultimate-records",1);
        rq.onupgradeneeded=()=>{ if(!rq.result.objectStoreNames.contains("rec"))rq.result.createObjectStore("rec",{keyPath:"id"}); };
        rq.onsuccess=()=>res(rq.result); rq.onerror=()=>rej(rq.error); });
      const put=o=>new Promise((res,rej)=>{ const rq=db.transaction("rec","readwrite").objectStore("rec").put(o); rq.onsuccess=()=>res(); rq.onerror=()=>rej(rq.error); });
      await put({id:"ok1",sport:"long",name:"שיא מאושר",cls:"ט׳3",value:4.2,status:"approved",src:"manual",ts:1});
      await put({id:"pd1",sport:"long",name:"ממתין לאישור",cls:"ט׳3",value:5.9,status:"pending",src:"student",ts:2});
      db.close();
    });
    await page.evaluate(()=>{ window.HM.setRole("student"); }); await page.waitForTimeout(500);
    for(const m of ["stu","tools","ft","home"]){
      await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(250);
      eq(await page.evaluate(()=>document.body.dataset.mod),"rec","«"+m+"» מפנה ללוח השיאים");
    }
    const txt=await page.evaluate(()=>{ const v=document.getElementById("view-rec"); return v?v.innerText:""; });
    ok(txt.indexOf("שיא מאושר")>=0,"הלוח נטען — השיא המאושר מוצג (אחרת הבדיקה ריקה)");
    ok(txt.indexOf("ממתין לאישור")<0,"שיא שממתין לאישור לא מוצג בלוח");
    for(const n of ["אליס","בני","אחר 1"])ok(txt.indexOf(n)<0,"שם מרשימת התלמידים לא מוצג: "+n);
    eq(await page.evaluate(()=>getComputedStyle(document.getElementById("btnSettings")).display),"none","אין גישה להגדרות");
  }),

  check("ברכה לפי שעה: בערב — «ערב טוב», לא «בוקר טוב»",Object.assign({__now:"2026-09-29T20:30:00"},twoClasses()),async page=>{
    await go(page,"home");
    const g=await page.$eval('#view-home [data-i18n^="home.greet"]',e=>e.textContent.trim());
    eq(g,"ערב טוב,");
  }),

  check("גרסה בהגדרות: מזהה הבנייה של הדף; commit ותאריך רק מ-version.json של אותה בנייה",twoClasses(),async page=>{
    const meta=await page.evaluate(()=>document.querySelector('meta[name="hm-build"]').content);
    eq(await page.evaluate(()=>window.HM.buildId?window.HM.buildId():null)||meta,meta,"buildId = hm-build");
    /* version.json של בנייה אחרת — לא מוצג */
    await page.evaluate(()=>window.HM.LS.set("hx.verInfo",{build:"deadbeef",commit:"0123456789abcdef",deployedAt:"2026-09-29T16:53:00Z"}));
    await page.evaluate(()=>document.getElementById("btnSettings").click()); await page.waitForTimeout(300);
    ok((await page.textContent("#set-build")).indexOf(meta)>=0,"מזהה הבנייה מוצג");
    eq(await page.$eval("#set-deploy",e=>e.hidden),true,"commit של בנייה אחרת לא מוצג");
    await page.evaluate(m=>window.HM.LS.set("hx.verInfo",{build:m,commit:"0123456789abcdef",deployedAt:"2026-09-29T16:53:00Z"}),meta);
    await page.evaluate(()=>document.getElementById("btnSettings").click()); await page.waitForTimeout(300);
    const d=await page.textContent("#set-deploy");
    ok(d.indexOf("commit 0123456")>=0&&d.indexOf("פורסם")>=0,"commit ותאריך הפריסה — "+d);
  }),

  check("ייצוא ציונים: 0 מיוצא כ-0, חסר כתא ריק, ורכיב במשקל 0 לא חוסם «סופי»",twoClasses({
    "grades.weights":{part:100,exams:0,improve:0,team:0,know:0}
  }),async page=>{
    await page.evaluate(c=>window.STU.show(c,"grades"),H2);
    await page.waitForTimeout(400);
    const rows=await page.evaluate(()=>{ let got=null; const o=window.HM.dlCSV; window.HM.dlCSV=(n,r)=>{ got=r; };
      try{ document.getElementById("gr-csv").click(); }finally{ window.HM.dlCSV=o; } return got; });
    ok(rows,"ה-CSV נבנה");
    const head=rows[0], o1=rows.find(r=>r[0]==="אחר 1"), o2=rows.find(r=>r[0]==="אחר 2");
    const col=n=>head.findIndex(h=>h.indexOf(n)>=0);
    eq(String(o1[col("השתתפות")]),"90");
    eq(o1[col("סטטוס")],"סופי","משקל 0 לידע — לא חוסם ציון סופי");
    eq(String(o2[col("השתתפות")]),"","חסר — תא ריק, לא 0");
  }),

  /* ריצת ביפ אחת נשמרת גם ב-s.tests וגם כשורת beep ב-ft.results.
     הרשימה, הפרופיל והייצוא סופרים אותה פעם אחת — כביפ טסט. */
  check("ריצת ביפ אחת נספרת פעם אחת: לא גם «מדידת כושר»",twoClasses({
    "stu.list":[{id:"a",name:"אליס",cls:"ט׳3",cid:T3,sex:"girls",age:14,
      tests:[{d:"2026-09-20",type:"ביפ",dist:840,level:"7·3",speed:11.5,vo2:44.1,zone:"בריא"}]}],
    "ft.results":[
      {id:"f1",ts:1,d:"2026-09-20",cls:"ט׳3",cid:T3,test:"beep",name:"אליס",sid:"a",val:840,unit:"מ׳"},
      {id:"f2",ts:2,d:"2026-09-21",cls:"ט׳3",cid:T3,test:"r100",name:"אליס",sid:"a",val:15.2,unit:"שנ׳"},
      {id:"f3",ts:3,d:"2026-09-22",cls:"ט׳3",cid:T3,test:"push",name:"אליס",sid:"a",val:20,unit:"חזרות"}]
  }),async page=>{
    await go(page,"stu");
    const sb=await page.$eval('#stu-list .stu-row[data-id="a"] .sb',e=>e.textContent);
    ok(sb.indexOf("2 מדידות כושר")>=0,"שתי מדידות כושר, בלי הביפ — "+sb);
    ok(sb.indexOf("1 ביפ טסט")>=0,"וריצת ביפ אחת — "+sb);
    await page.click('#stu-list .stu-row[data-id="a"]'); await page.waitForTimeout(400);
    const t=await page.$$eval("#stu-fitTbl tbody tr",tr=>tr.map(x=>x.dataset.t).sort());
    eq(t,["push","r100"],"טבלת מבחני הכושר בלי שורת ביפ כפולה");
    await page.evaluate(()=>window.HM.modal("stu-modal",false));
    const rows=await page.evaluate(()=>{ let got=null; const o=window.HM.dlCSV; window.HM.dlCSV=(n,r)=>{ got=r; };
      try{ document.getElementById("stu-csv").click(); }finally{ window.HM.dlCSV=o; } return got; });
    const h=rows[0], r=rows.find(x=>x[0]==="אליס");
    ok(h.indexOf("מבחנים")<0,"בייצוא אין עמודת «מבחנים» שסופרת רק ביפ");
    eq(String(r[h.indexOf("מדידות כושר")]),"2");
    eq(String(r[h.indexOf("ביפ טסט")]),"1");
    eq(await page.evaluate(()=>window.HM.LS.get("ft.results",[]).length),3,"שום מדידה לא נמחקה");
  })
]};
