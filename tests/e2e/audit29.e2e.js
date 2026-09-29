"use strict";
/* ביקורת 2026-09-29 — שלושת ליקויי הליבה, מול הקובץ הבנוי:
   1. «התלמידים שלי» נפל על כיתת ההדגמה (TypeError ב-s.tests.length)
      בזמן שמרכז הכיתה, הנוכחות והציונים הציגו 8 תלמידים.
   2. «קבוצות — מאוזנות, מהנוכחים» כלל תלמיד שסומן נעדר, ונפתח על
      «כל הכיתות» גם מתוך שיעור פעיל. אותו דבר בהגרלה.
   3. «מלא לפי נוכחות» לבד הציג «ציון סופי 70», ומרכז הכיתה ספר 8/8.
      בנוסף: המילוי שמר רק את הכיתה המסוננת — ומחק את שאר הכיתות. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const T3="c:ט:3", H2="c:ח:2";
const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const demo=async page=>{
  await page.evaluate(()=>document.getElementById("lock-demo").click());
  await page.waitForTimeout(900);
};
const today=()=>new Date().toISOString().slice(0,10);

/* שתי כיתות — כדי שמחיקה של «שאר הכיתות» תיראה */
const twoClasses=extra=>Object.assign({
  "ft.classes":{[T3]:{id:T3,name:"ט׳3",grade:"ט",num:3,key:"ט3"},
                [H2]:{id:H2,name:"ח׳2",grade:"ח",num:2,key:"ח2"}},
  "stu.list":[
    {id:"a",name:"אליס",cls:"ט׳3",cid:T3,sex:"girls",age:14,tests:[]},
    {id:"b",name:"בני", cls:"ט׳3",cid:T3,sex:"boys", age:14,tests:[]},
    {id:"o1",name:"אחר 1",cls:"ח׳2",cid:H2,sex:"boys",age:13,tests:[]},
    {id:"o2",name:"אחר 2",cls:"ח׳2",cid:H2,sex:"boys",age:13,tests:[]}
  ],
  "tools.att":{"2026-09-01|ט׳3":{a:"p",b:"a"}},
  "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
},extra||{});

module.exports={title:"ביקורת 2026-09-29 — תלמידים, קבוצות מהנוכחים, ציון זמני",tests:[

  check("1. הדגמה: «התלמידים שלי» מציג את אותם 8 תלמידים כמו מרכז הכיתה — בלי שגיאה",null,async page=>{
    await demo(page);
    await go(page,"stu");
    eq(await page.textContent("#stu-count"),"8");
    eq(await page.locator("#stu-list .stu-row").count(),8,"כל הכיתות");
    await page.evaluate(c=>window.STU.show(c,"list"),T3);
    await page.waitForTimeout(300);
    const ids=await page.$$eval("#stu-list .stu-row",r=>r.map(x=>x.dataset.id).sort());
    eq(ids,["demo0","demo1","demo2","demo3","demo4","demo5","demo6","demo7"],"אותן זהויות מתוך מרכז הכיתה");
    const hubN=await page.evaluate(c=>window.HMDATA.studentsIn(window.HM.regStore,c,window.HM.LS.get("stu.list",[])).length,T3);
    eq(hubN,8,"ומרכז הכיתה סופר אותו מספר");
  }),

  check("1. רשומה ישנה בלי tests ורשומה פגומה: הרשימה מוצגת, והפגומה נשמרת ומדווחת",{
    "stu.list":[{id:"x",name:"ישן",cls:"ט׳3"},null,{id:"y",name:"תקין",cls:"ט׳3",tests:[]}],
    "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
  },async page=>{
    await go(page,"stu");
    eq(await page.locator("#stu-list .stu-row").count(),2);
    ok(await page.locator("#stu-bad").count(),"יש הודעה על הרשומה הפגומה");
    /* עריכה ושמירה לא מוחקות את הרשומה הפגומה */
    await page.evaluate(()=>document.querySelector('#stu-list .stu-row[data-id="y"]').click());
    await page.waitForTimeout(300);
    await page.evaluate(()=>document.getElementById("stu-fSave").click());
    await page.waitForTimeout(300);
    const raw=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    eq(raw.length,3,"שלוש רשומות, כולל הפגומה");
    ok(raw.includes(null),"הפגומה במקומה");
  }),

  check("2. שיעור פעיל, דן נעדר: הקבוצות וההגרלה נפתחות על ט׳3 ובלי הנעדר",null,async page=>{
    await demo(page);
    await page.evaluate(c=>window.HM.session.start({cid:c,clsSnapshot:"ט׳3"}),T3);
    await page.evaluate(()=>window.TOOLS.markAllPresent());
    await page.evaluate(d=>{ const a=window.HM.LS.get("tools.att",{}); a[d+"|ט׳3"].demo0="a"; window.HM.LS.set("tools.att",a); },today());
    await go(page,"live");
    await page.click('[data-tool="teams"]'); await page.waitForTimeout(500);
    eq(await page.$eval("#tl-teamCls",e=>e.value),T3,"הכיתה של השיעור, לא «כל הכיתות»");
    eq(await page.$eval("#tl-teamWho",e=>e.value),"present");
    await page.evaluate(()=>{ const n=document.getElementById("tl-teamN"); n.value=2; n.dispatchEvent(new Event("input")); });
    await page.click("#tl-teamGo"); await page.waitForTimeout(300);
    const names=await page.$$eval("#tl-teamsWrap li",l=>l.map(x=>x.textContent));
    eq(names.length,7,"שבעה נוכחים");
    ok(!names.some(n=>n.includes("דן אבירם")),"הנעדר לא נכלל");
    ok((await page.textContent("#tl-teamWhoInfo")).includes("1"),"המסך אומר שאחד לא נכלל");
    /* סימון מחדש כנוכח — נכלל בחלוקה הבאה */
    await page.evaluate(d=>{ const a=window.HM.LS.get("tools.att",{}); a[d+"|ט׳3"].demo0="p"; window.HM.LS.set("tools.att",a); },today());
    await page.click("#tl-teamGo"); await page.waitForTimeout(300);
    eq(await page.locator("#tl-teamsWrap li").count(),8,"שינוי נוכחות משתקף בחלוקה הבאה");
    await page.evaluate(()=>window.TOOLS.openTab("pick"));
    eq(await page.$eval("#tl-pickCls",e=>e.value),T3,"גם ההגרלה על כיתת השיעור");
  }),

  check("2. מחוץ לשיעור ובלי נוכחות: «כל הכיתה», ובחירה ב«רק נוכחים» לא מכריזה על מי שלא סומן כנוכח",twoClasses(),async page=>{
    await go(page,"tools");
    await page.selectOption("#tl-teamCls",T3); await page.waitForTimeout(200);
    eq(await page.$eval("#tl-teamWho",e=>e.value),"all","אין סימון להיום — ברירת המחדל מפורשת: כל הכיתה");
    await page.selectOption("#tl-teamWho","present"); await page.waitForTimeout(200);
    await page.evaluate(()=>{ const n=document.getElementById("tl-teamN"); n.value=2; n.dispatchEvent(new Event("input")); });
    await page.click("#tl-teamGo"); await page.waitForTimeout(300);
    eq(await page.locator("#tl-teamsWrap li").count(),0,"אף אחד לא סומן היום — אף אחד לא נחשב נוכח");
    ok((await page.textContent("#tl-teamWhoInfo")).includes("2"),"ושני הלא-מסומנים מוצגים");
  }),

  check("3. מילוי לפי נוכחות בכיתה אחת לא מוחק את תלמידי הכיתה האחרת",twoClasses(),async page=>{
    await page.evaluate(c=>window.STU.show(c,"grades"),T3);
    await page.waitForTimeout(400);
    await page.evaluate(()=>document.getElementById("gr-fillAtt").click());
    await page.waitForTimeout(300);
    ok(await page.locator("#ask-f input[type=date]").count()===2,"שואל על טווח התאריכים של התקופה");
    await page.click("#ask-ok"); await page.waitForTimeout(400);
    const raw=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    eq(raw.map(s=>s.id).sort(),["a","b","o1","o2"],"כל ארבעת התלמידים נשארו");
    const rg=await page.evaluate(()=>window.HM.LS.get("grades.periodRanges",{}));
    eq(rg["רבעון 1"],{from:"2026-09-01",to:"2026-09-01"},"הטווח נשמר לתקופה");
  }),

  check("3. השתתפות בלבד = ציון זמני: הטבלה, מרכז הכיתה וה-CSV מסכימים",twoClasses({
    "grades.periodRanges":{"רבעון 1":{from:"2026-01-01",to:"2026-12-31"}}
  }),async page=>{
    await page.evaluate(c=>window.STU.show(c,"grades"),T3);
    await page.waitForTimeout(400);
    await page.evaluate(()=>document.getElementById("gr-fillAtt").click());
    await page.waitForTimeout(400);
    const cellA=await page.$eval('#gr-table tr[data-sid="a"] td:last-child',e=>({t:e.textContent,prov:e.classList.contains("prov")}));
    ok(cellA.prov&&cellA.t.includes("70.0")&&cellA.t.includes("זמני"),"אליס: 70.0 זמני — "+cellA.t);
    const cellB=await page.$eval('#gr-table tr[data-sid="b"] td:last-child',e=>e.textContent);
    ok(cellB.startsWith("0.0")&&cellB.includes("זמני"),"בני (נעדר): 0.0 — ערך תקין, אבל זמני");
    ok(!(await page.$eval("#gr-provHint",e=>e.hidden)),"יש הסבר מתחת לטבלה");
    const sum=await page.evaluate(c=>window.STU.summary(c),T3);
    eq([sum.graded,sum.prov,sum.total],[0,2,2],"מרכז הכיתה: 0 סופיים, 2 זמניים");
    /* ה-CSV: עמודת סטטוס מפורשת ורשימת החסרים */
    const rows=await page.evaluate(()=>{ let got=null; const o=window.HM.dlCSV; window.HM.dlCSV=(n,r)=>{ got=r; };
      try{ document.getElementById("gr-csv").click(); }finally{ window.HM.dlCSV=o; } return got; });
    ok(rows,"ה-CSV נבנה");
    const hd=rows[0], iS=hd.indexOf("סטטוס"), iM=hd.indexOf("רכיבים חסרים"), iG=hd.indexOf("ציון");
    ok(iS>0&&iM>0&&iG>0,"עמודות ציון/סטטוס/חסרים: "+JSON.stringify(hd));
    const alice=rows.find(r=>r[0]==="אליס");
    eq([alice[iG],alice[iS]],["70.0","זמני"],"אליס ב-CSV: 70.0 זמני");
    ok(/שיפור/.test(alice[iM]),"והחסרים רשומים: "+alice[iM]);
    /* משלימים את כל הרכיבים במשקל — הציון הופך לסופי */
    await page.evaluate(()=>{
      const tr=document.querySelector('#gr-table tr[data-sid="a"]');
      for(const f of ["improve","team"]){ const i=tr.querySelector('input[data-f="'+f+'"]'); i.value="0"; i.dispatchEvent(new Event("change",{bubbles:true})); }
    });
    await page.waitForTimeout(200);
    ok((await page.$eval('#gr-table tr[data-sid="a"] td:last-child',e=>e.textContent)).includes("זמני"),
      "עדיין חסר רכיב המבחנים (משקל 8) — עדיין זמני");
    await page.evaluate(()=>window.HM.LS.set("grades.weights",{part:70,exams:0,improve:15,team:15,know:0,bonusMax:10}));
    const sum2=await page.evaluate(c=>window.STU.summary(c),T3);
    eq([sum2.graded,sum2.prov],[1,1],"אפס הוא ציון תקין, ורכיב במשקל 0 לא נדרש");
  }),
  /* ---------- 4. חיפוש בשפת הממשק ---------- */
  check("4. חיפוש משחקים: «Capture» באנגלית, «Захват» ברוסית, ו«דגל» בעברית — וניקוי מחזיר הכול",null,async page=>{
    const count=async(l,q)=>{ await page.evaluate(x=>window.I18N.set(x),l); await go(page,"games",300);
      await page.fill("#gm-search",q); await page.waitForTimeout(250);
      return page.$$eval("#gm-grid .gm-card b",b=>b.map(x=>x.textContent)); };
    const en=await count("en","Capture");
    ok(en.includes("Capture the flag"),"באנגלית: "+JSON.stringify(en));
    ok((await count("ru","Захват")).includes("Захват флага"));
    ok((await count("he","דגל")).includes("תופסת דגלים"));
    await page.fill("#gm-search",""); await page.waitForTimeout(250);
    eq(await page.locator("#gm-grid .gm-card").count(),await page.evaluate(()=>window.GAMES.all().length),"ניקוי — כל המשחקים");
  }),

  /* ---------- 5. ערבוב שפות ---------- */
  check("5. אנגלית: קבוצות הנושאים במחולל מתורגמות; ערבית: «השלב הבא» בשיעור פעיל בלי עברית",null,async page=>{
    await demo(page);
    await page.evaluate(()=>window.I18N.set("en"));
    await go(page,"lesson",400);
    const labels=await page.$$eval("#ls-focus optgroup",g=>g.map(x=>x.label));
    ok(labels.length&&labels.every(l=>!/[֐-׿]/.test(l)),"optgroup: "+JSON.stringify(labels));
    await page.evaluate(()=>window.I18N.set("he"));
    await page.selectOption("#ls-focus","aerobic");
    await page.click("#ls-gen"); await page.waitForTimeout(300);
    await page.evaluate(c=>{ const p=window.LESSON.current();
      window.HM.session.start({cid:c,clsSnapshot:"ט׳3",planId:p.id,planTitle:p.title,planGroup:p.group}); },T3);
    await page.evaluate(()=>window.I18N.set("ar"));
    await go(page,"live",500);
    const nx=await page.evaluate(()=>{ const e=document.getElementById("lv-next"); return e?e.textContent:null; });
    ok(nx===null||!/[֐-׿]/.test(nx),"lv-next: "+nx);
    const set=await page.evaluate(()=>[...document.querySelectorAll("#set-lang .cv")].map(e=>e.textContent));
    ok(!set.some(x=>/100%/.test(x)),"אין «100%» ליד טיוטה: "+JSON.stringify(set));
  }),

  /* ---------- 6. ציוד ---------- */
  check("6. כדורים וקונוסים בלבד: מערך אירובי לא מבקש חישוקים (15 בניות)",null,async page=>{
    await go(page,"lesson",400);
    await page.selectOption("#ls-focus","aerobic");
    for(let i=0;i<15;i++){
      await page.click("#ls-gen"); await page.waitForTimeout(60);
      const eqs=await page.evaluate(()=>window.LESSON.current().eq.join(" | "));
      ok(!/חישוק/.test(eqs),"בנייה "+(i+1)+": "+eqs);
    }
  }),

  /* ---------- 7. מערכת לדוגמה ---------- */
  check("7. י״ב1 + י״ב2 בדוגמה: שיעור אחד משותף בדף הבית, לא «הבא» ועוד «בהמשך» באותה שעה",
    {__now:"2026-09-29T12:00:00","pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION},async page=>{
    await page.evaluate(()=>window.HM.schedSample()); await page.waitForTimeout(300);
    await go(page,"home",500);
    const t=(await page.textContent("#hx-todayList")).replace(/\s+/g," ");
    ok(/י״ב1 \+ י״ב2/.test(t),"שם הקבוצה בדף הבית: "+t);
    eq((t.match(/12:35/g)||[]).length,1,"שעה אחת, שיעור אחד");
  }),

  /* ---------- 10. פתיחה ---------- */
  check("10. מסך פרטי הקשר: שפה, דילוג בלי שליחה, והדגמה זמינה",{"hx.leadDone":false,"pf.guideSeen":true},async page=>{
    ok(await page.locator("#leadOv.on").count(),"המסך פתוח");
    ok(await page.locator("#lead-lang button").count()>=5,"בחירת שפה במסך עצמו");
    await page.click('#lead-lang button[data-l="en"]'); await page.waitForTimeout(200);
    eq(await page.evaluate(()=>window.I18N.lang()),"en");
    let posted=0; page.on("request",r=>{ if(/docs\.google\.com\/forms/.test(r.url()))posted++; });
    await page.click("#lead-skip"); await page.waitForTimeout(300);
    eq(await page.locator("#leadOv.on").count(),0,"נסגר");
    eq(posted,0,"דילוג לא שולח דבר");
    eq(await page.evaluate(()=>window.HM.LS.get("hx.leadSkipped",false)),true);
    ok(await page.locator("#lock-demo").count(),"ההדגמה זמינה במסך הכניסה");
  }),

  /* ---------- 12. גיבוי ושחזור ---------- */
  check("12. גיבוי ושחזור למכשיר נקי ונפרד: כל הישויות, אותם מזהים; כפול — זהה; קובץ עתידי נדחה",null,async (page,env)=>{
    await demo(page);
    await page.evaluate(c=>window.HM.session.start({cid:c,clsSnapshot:"ט׳3"}),T3);
    await page.evaluate(()=>window.TOOLS.markAllPresent());
    await page.evaluate(()=>{ const l=window.HM.LS.get("stu.list",[]);
      l[0].grades={"רבעון 1":{part:90,improve:0,team:80,exams:{"מבחן 1":0}}}; window.HM.LS.set("stu.list",l);
      window.HM.LS.set("grades.periodRanges",{"רבעון 1":{from:"2026-09-01",to:"2026-12-31"}}); });
    await page.evaluate(()=>window.HM.schedSample()); await page.waitForTimeout(200);
    await page.evaluate(()=>{ const a=window.HM.session.active(); window.HM.session.complete(a.id,{rating:1,note:"עבד"}); });
    await page.evaluate(()=>window.HM.LS.set("tools.rubrics",[{id:"rb1",name:"מחוון",crit:["א","ב"]}]));
    const dump=pg=>pg.evaluate(()=>{ const o={}; Object.keys(localStorage).filter(k=>k.indexOf("peultimate.")===0)
      .forEach(k=>o[k.slice(11)]=localStorage.getItem(k)); return o; });
    const before=await dump(page);
    const json=JSON.stringify(await page.evaluate(()=>window.HM.backupTest.snapshotFull()));

    /* מכשיר שני: הקשר דפדפן נפרד — אחסון נפרד לגמרי */
    const ctx2=await env.ctx.browser().newContext({viewport:{width:430,height:900}});
    try{
      const p2=await ctx2.newPage();
      await p2.route("**/*",r=>r.request().url().indexOf("http://127.0.0.1:")===0?r.continue():r.abort());
      await p2.addInitScript(()=>localStorage.setItem("peultimate.hx.leadDone","true"));
      await p2.goto(page.url()); await p2.waitForTimeout(700);
      eq(await p2.evaluate(()=>window.HM.LS.get("stu.list",[]).length),0,"המכשיר השני מתחיל ריק");
      const newer=JSON.parse(json); newer.schema=D.SCHEMA_VERSION+1;
      eq(await p2.evaluate(s=>window.HMDATA.validateBackup(s).errors,newer),["newer-schema"],"קובץ מגרסה עתידית נדחה");
      eq(await p2.evaluate(s=>window.HMDATA.validateBackup(JSON.parse(s)).ok,json),true);
      const r=await p2.evaluate(s=>window.HM.backupTest.apply(JSON.parse(s)),json);
      eq(r.failed,0);
      const after=await dump(p2);
      const SKIP={"bk.last":1,"up.seen":1};
      Object.keys(before).filter(k=>!SKIP[k]).forEach(k=>eq(after[k],before[k],"מפתח "+k));
      const J=(o,k)=>JSON.parse(o[k]||"null");
      eq(J(after,"stu.list").map(s=>s.id),J(before,"stu.list").map(s=>s.id),"מזהי תלמידים");
      eq(Object.keys(J(after,"ft.classes")).sort(),Object.keys(J(before,"ft.classes")).sort(),"מזהי כיתות וקבוצות");
      ok(J(after,"stu.list")[0].grades["רבעון 1"].exams["מבחן 1"]===0,"ציון 0 נשאר 0");
      /* שחזור כפול — אותו מצב בדיוק, בלי שורות כפולות */
      await p2.evaluate(s=>window.HM.backupTest.apply(JSON.parse(s)),json);
      const again=await dump(p2);
      Object.keys(before).filter(k=>!SKIP[k]).forEach(k=>eq(again[k],before[k],"שחזור כפול — "+k));
    }finally{ await ctx2.close(); }
  })

]};
