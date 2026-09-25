"use strict";
/* ============================================================
   ניקוי — שלב 6 של העיצוב מחדש
   ------------------------------------------------------------
   • אין יותר confirm()/prompt(): שאלה בתוך האפליקציה (גיליון עם
     שדות), ומחיקה מיידית עם «↩ בטל» לכמה שניות
   • פוטו־פיניש: «הדבק רשימה» ו«＋ שורה» הם שדות בתוך הכרטיס
   • באגים מהסקירה: מדד הכושר נכתב לתקופה שנבחרה; חלון הקבוצות
     עולה מעל מערכת השעות; למערך יש מזהה והוא נשמר בשיעור
   • לוח המורה בשיאים בלשוניות, והגיבוי שלו הוא הגיבוי של המכשיר
   • «להגיש כשיא?» כשתוצאה במבחני הכושר עוברת את שיא בית הספר
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const iso=()=>new Date().toISOString().slice(0,10);
const S=(id,n,c,cid)=>({id,name:n,cls:c,cid,tests:[]});
const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "ft.roster":{"ט3":[{id:"a",name:"דן אבירם",sex:"boys"},{id:"b",name:"נועה לוי",sex:"girls"}]},
  "stu.list":[S("a","דן אבירם","ט׳3","c:ט:3"),S("b","נועה לוי","ט׳3","c:ט:3")],
  "ft.last":{grade:"ט",num:3}};
const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const vis=(page,sel)=>page.evaluate(s=>{ const e=document.querySelector(s); return !!e&&e.offsetParent!==null; },sel);
const askOpen=page=>page.evaluate(()=>{ const m=document.getElementById("askModal"); return !!m&&m.classList.contains("on"); });
const undoBtn=async page=>{ await page.waitForSelector("#toastAct",{state:"visible",timeout:3000}); await page.click("#toastAct"); await page.waitForTimeout(350); };
const LSget=(page,k)=>page.evaluate(x=>JSON.parse(localStorage.getItem("peultimate."+x)),k);

module.exports={title:"ניקוי: שאלות בתוך האפליקציה, ביטול, ולוח המורה",tests:[

  check("אין confirm()/prompt() בקוד — רק ההערות שמסבירות למה",{},async page=>{
    const fs=require("fs"), path=require("path"), R=path.resolve(__dirname,"../..");
    const bad=[];
    fs.readdirSync(R).filter(f=>/^hm-.*\.js$/.test(f)&&!/texts|terms|i18n/.test(f)).forEach(f=>{
      /* הערות בלוק מוחלפות ברווחים באותו אורך שורות, כדי שמספרי השורות יישמרו */
      const src=fs.readFileSync(path.join(R,f),"utf8").replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g," "));
      src.split("\n").forEach((l,i)=>{
        const code=l.replace(/\/\/.*$/,"");
        if(/(^|[^\w.])(confirm|prompt|alert)\s*\(/.test(code))bad.push(f+":"+(i+1));
      });
    });
    eq(bad,[],"חלונות דפדפן שנשארו");
  }),

  check("גיליון שאלה: שם הפרופיל בביפ, Enter שומר",base,async page=>{
    await go(page,"beep");
    await page.evaluate(()=>{ document.getElementById("bt-setupFold").open=true; });
    await page.click("#bt-profSave"); await page.waitForTimeout(200);
    ok(await askOpen(page),"הגיליון נפתח");
    const def=await page.inputValue("#ask-i0");
    ok(/20/.test(def),"ברירת מחדל: "+def);
    await page.fill("#ask-i0","בנות ט׳"); await page.keyboard.press("Enter"); await page.waitForTimeout(250);
    ok(!(await askOpen(page)),"נסגר");
    eq((await LSget(page,"bt.profiles")).map(p=>p.name),["בנות ט׳"]);
  }),

  check("גיליון שאלה: «ביטול» וחזרה של הטלפון לא שומרים",base,async page=>{
    await go(page,"beep");
    await page.evaluate(()=>{ document.getElementById("bt-setupFold").open=true; });
    await page.click("#bt-profSave"); await page.waitForTimeout(200);
    await page.click("#ask-no"); await page.waitForTimeout(200);
    ok(!(await askOpen(page)),"ביטול סוגר");
    await page.click("#bt-profSave"); await page.waitForTimeout(200);
    await page.goBack(); await page.waitForTimeout(350);
    ok(!(await askOpen(page)),"חזרה סוגרת");
    eq(await page.evaluate(()=>document.body.dataset.mod),"beep","ונשארים במסך");
    eq(await LSget(page,"bt.profiles"),null,"לא נשמר כלום");
  }),

  check("מחיקה מיידית ו«↩ בטל»: לוח הביפ",Object.assign({},base,{
    "bt.results":[{id:1,name:"דן אבירם",level:7,sh:5,dist:1200,time:421.3,speed:12.5}]}),async page=>{
    await go(page,"beep");
    await page.evaluate(()=>document.getElementById("bt-clearBtn").click()); await page.waitForTimeout(200);
    ok(!(await askOpen(page)),"בלי שאלה");
    eq((await LSget(page,"bt.results")).length,0,"נמחק מיד");
    await undoBtn(page);
    eq((await LSget(page,"bt.results")).length,1,"וחזר");
  }),

  check("«↩ בטל» מחזיר מערכת שעות שנוקתה",Object.assign({},base,{"sched.week":[
    {id:"s1",day:0,time:"08:00",cid:"c:ט:3",clsSnapshot:"ט׳3",kind:"pe"}]}),async page=>{
    await page.evaluate(()=>window.HM.openSched()); await page.waitForTimeout(300);
    await page.evaluate(()=>document.getElementById("sw-clear").click()); await page.waitForTimeout(200);
    eq((await LSget(page,"sched.week")).length,0);
    await undoBtn(page);
    eq((await LSget(page,"sched.week")).length,1);
  }),

  check("חלון הקבוצות נפתח מעל מערכת השעות, וחזרה סוגרת רק אותו",base,async page=>{
    await go(page,"stu"); await go(page,"home");
    await page.evaluate(()=>window.HM.openSched()); await page.waitForTimeout(250);
    await page.evaluate(()=>window.HM.openGroups()); await page.waitForTimeout(250);
    const z=await page.evaluate(()=>{ const f=id=>+getComputedStyle(document.getElementById(id)).zIndex;
      const g=document.getElementById("grpModal").getBoundingClientRect();
      const top=document.elementFromPoint(g.left+g.width/2,g.top+g.height/2);
      return {grp:f("grpModal"),sched:f("schedModal"),hit:!!top.closest("#grpModal")}; });
    ok(z.grp>z.sched,"z: "+JSON.stringify(z)); ok(z.hit,"הלחיצה מגיעה לחלון הקבוצות");
    await page.goBack(); await page.waitForTimeout(300);
    const on=await page.evaluate(()=>[...document.querySelectorAll(".modal.on")].map(m=>m.id));
    eq(on,["schedModal"],"מערכת השעות עדיין פתוחה");
  }),

  check("למערך יש מזהה, והוא נשמר בשיעור שנפתח ממנו",Object.assign({},base,{
    "ls.assign":{["c:ט:3|"+iso()]:{title:"כדורסל",ts:1,plan:{id:"plX1",title:"כדורסל",phases:[{n:"חימום",min:8,d:"",k:"warm"}]}}}}),async page=>{
    await page.evaluate(()=>window.HM.startFromSlot({cid:"c:ט:3",clsSnapshot:"ט׳3"})); await page.waitForTimeout(300);
    eq(await page.evaluate(()=>window.HM.session.active().planId),"plX1");
    await go(page,"lesson");
    const id=await page.evaluate(()=>{ window.LESSON.usePlan({title:"ידני",grade:"mid",date:"2025-01-01",goals:[],eq:[],std:[],assess:[],diff:[],safe:[],cur:[],hw:[],
        phases:[{n:"א",min:5,d:"",k:"warm"}]});
      return window.LESSON.current().id; });
    ok(/^pl/.test(id||""),"מערך ידני מקבל מזהה: "+id);
  }),

  check("מדד הכושר נכתב לתקופה שנבחרה בציונים — לא תמיד לראשונה",Object.assign({},base,{
    "grades.periods":["רבעון 1","רבעון 2"],
    "ft.results":[
      {id:"r0",ts:1,d:"2025-01-05",cls:"ט3",cid:"c:ט:3",test:"r60",name:"דן אבירם",sid:"a",gradeKey:"ט",val:8.4,unit:"שנ׳"},
      {id:"r1",ts:1,d:"2025-01-05",cls:"ט3",cid:"c:ט:3",test:"r60",name:"נועה לוי",sid:"b",gradeKey:"ט",val:9.6,unit:"שנ׳"},
      {id:"r2",ts:1,d:"2025-01-05",cls:"ט3",cid:"c:ט:3",test:"r60",name:"א",sid:"x1",gradeKey:"ט",val:9.0,unit:"שנ׳"},
      {id:"r3",ts:1,d:"2025-01-05",cls:"ט3",cid:"c:ט:3",test:"r60",name:"ב",sid:"x2",gradeKey:"ט",val:9.2,unit:"שנ׳"},
      {id:"r4",ts:1,d:"2025-01-05",cls:"ט3",cid:"c:ט:3",test:"r60",name:"ג",sid:"x3",gradeKey:"ט",val:8.8,unit:"שנ׳"},
      {id:"r5",ts:1,d:"2025-01-05",cls:"ט3",cid:"c:ט:3",test:"r60",name:"ד",sid:"x4",gradeKey:"ט",val:9.9,unit:"שנ׳"}]}),async page=>{
    await page.evaluate(()=>window.STU.show("","grades")); await page.waitForTimeout(400);
    await page.selectOption("#gr-period","רבעון 2"); await page.waitForTimeout(200);
    await page.evaluate(()=>window.FT.show("c:ט:3","idx")); await page.waitForTimeout(600);
    ok(await vis(page,"#ft-toGrades"),"כפתור שליחה לציונים");
    await page.click("#ft-toGrades"); await page.waitForTimeout(250);
    ok(await askOpen(page),"שואל לאיזו תקופה · "+await page.evaluate(()=>document.getElementById("toastT").textContent));
    eq(await page.inputValue("#ask-i0"),"רבעון 2","ברירת המחדל — התקופה שנבחרה");
    await page.click("#ask-ok"); await page.waitForTimeout(300);
    const st=await LSget(page,"stu.list");
    const g=st.find(s=>s.id==="a").grades;
    ok(g&&g["רבעון 2"]&&g["רבעון 2"].exams["מדד כושר"]!=null,"נכתב לרבעון 2: "+JSON.stringify(g));
    ok(!g["רבעון 1"],"ולא לרבעון 1");
  }),

  check("פוטו־פיניש: «הדבק רשימה» ו«＋ שורה» — שדות בתוך הכרטיס",base,async page=>{
    await go(page,"photo");
    await page.click("#pf-pasteNames"); await page.waitForTimeout(150);
    ok(await vis(page,"#pf-pasteTxt"),"שדה הדבקה בכרטיס"); ok(!(await askOpen(page)),"בלי חלון");
    await page.fill("#pf-pasteTxt","אלון\nבר\nגיל"); await page.click("#pf-pasteGo"); await page.waitForTimeout(250);
    ok(!(await vis(page,"#pf-pasteTxt")),"נסגר");
    eq(await LSget(page,"pf.laneN"),3);
    await page.click('.pf-tabs [data-pt="results"]'); await page.waitForTimeout(200);
    await page.click("#pf-addRow"); await page.waitForTimeout(150);
    ok(await vis(page,"#pf-rowT"),"שדה זמן בכרטיס");
    ok(/1/.test(await page.evaluate(()=>document.getElementById("pf-rowLbl").textContent)),"מסלול 1");
    await page.fill("#pf-rowT","11.2"); await page.keyboard.press("Enter"); await page.waitForTimeout(200);
    ok(/2/.test(await page.evaluate(()=>document.getElementById("pf-rowLbl").textContent)),"קפץ למסלול 2");
    eq(await page.evaluate(()=>document.querySelectorAll("#pf-chips .pf-lanechip.done").length),1,"מסלול 1 קיבל זמן");
  }),

  check("איפוס מקצה עם זמנים: מיידי, ו«↩ בטל» מחזיר את הזמנים",base,async page=>{
    await go(page,"photo");
    await page.click('.pf-tabs [data-pt="results"]'); await page.waitForTimeout(200);
    await page.evaluate(()=>{ document.getElementById("pf-arcFold").open=true; document.getElementById("pf-loadSample").click(); });
    await page.waitForTimeout(300);
    const times=()=>page.evaluate(()=>[...document.querySelectorAll("#pf-chips .pf-lanechip .tm")].map(b=>b.textContent).join("|"));
    const before=await times();
    await page.click('.pf-tabs [data-pt="live"]'); await page.waitForTimeout(150);
    await page.click("#pf-resetBtn"); await page.waitForTimeout(200);
    ok(!(await askOpen(page)),"בלי שאלה");
    ok((await times())!==before,"אופס");
    await undoBtn(page);
    eq(await times(),before,"חזר");
  }),

  check("לוח המורה בשיאים: ארבע לשוניות, והגיבוי מוביל להגדרות",Object.assign({},base,{"rec.pass":"1234"}),async page=>{
    await go(page,"rec",900);
    await page.click("#rec-adminBtn"); await page.waitForTimeout(200);
    await page.fill("#rec-admPass","1234"); await page.click("#rec-admEnter"); await page.waitForTimeout(400);
    eq(await page.evaluate(()=>[...document.querySelectorAll("#rec-admTabs [data-at]")].map(b=>b.dataset.at)),["appr","add","sports","bk"]);
    ok(await vis(page,"#rec-pendList"),"אישורים פתוחים");
    ok(!(await vis(page,"#rec-spList")),"הענפים מוסתרים");
    await page.click('#rec-admTabs [data-at="sports"]'); await page.waitForTimeout(150);
    ok(await vis(page,"#rec-spNew"),"לשונית ענפים");
    await page.click('#rec-admTabs [data-at="bk"]'); await page.waitForTimeout(150);
    eq(await page.evaluate(()=>!!document.getElementById("rec-export")||!!document.getElementById("rec-import")),false,"אין גיבוי נפרד");
    await page.click("#rec-bkOpen"); await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({set:document.getElementById("setModal").classList.contains("on"),
      open:document.getElementById("set-secBackup").open,adm:document.getElementById("rec-adminModal").classList.contains("on")}));
    eq(r,{set:true,open:true,adm:false});
  }),

  check("שחזור בהגדרות מזהה קובץ שיאים ישן וממזג אותו",Object.assign({},base,{"rec.pass":"1234"}),async page=>{
    await go(page,"rec",900);
    const old={refs:{},records:[{id:"rOld",sport:"push",name:"דן אבירם",cls:"ט׳3",value:55,status:"approved",ts:1}]};
    await page.evaluate(()=>window.HM.openSettings("backup")); await page.waitForTimeout(300);
    await page.setInputFiles("#set-bkFile",{name:"school-records.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(old))});
    await page.waitForTimeout(400);
    ok(await askOpen(page),"שואל אם למזג");
    await page.click("#ask-ok"); await page.waitForTimeout(600);
    eq(await page.evaluate(()=>window.REC.countApproved()),1);
  }),

  check("«להגיש כשיא?» כשתוצאה בכושר עוברת את שיא בית הספר",base,async page=>{
    await go(page,"rec",900);
    await page.evaluate(()=>window.REC.importLegacy({records:[{id:"rB",sport:"ljump",name:"מישהו",cls:"",value:200,status:"approved",ts:1}]}));
    await go(page,"ft");
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click()); await page.waitForTimeout(500);
    await page.focus("#ft-list [data-val]"); await page.keyboard.type("215"); await page.keyboard.press("Enter");
    await page.waitForSelector("#toastAct",{state:"visible",timeout:4000});
    ok(/215/.test(await page.evaluate(()=>document.getElementById("toastT").textContent)),"ההצעה מציינת את התוצאה");
    await page.click("#toastAct"); await page.waitForTimeout(500);
    const pend=await page.evaluate(async()=>{ const db=await new Promise(r=>{ const q=indexedDB.open("peultimate-records",1); q.onsuccess=()=>r(q.result); });
      return await new Promise(r=>{ const q=db.transaction("rec").objectStore("rec").getAll(); q.onsuccess=()=>r(q.result.filter(x=>x.status==="pending")); }); });
    eq(pend.length,1); eq([pend[0].sport,pend[0].value,pend[0].src],["ljump",215,"ft"]);
  }),

  check("תוצאה שלא עוברת את השיא — בלי הצעה",base,async page=>{
    await go(page,"rec",900);
    await page.evaluate(()=>window.REC.importLegacy({records:[{id:"rB",sport:"ljump",name:"מישהו",cls:"",value:250,status:"approved",ts:1}]}));
    await go(page,"ft");
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click()); await page.waitForTimeout(500);
    await page.focus("#ft-list [data-val]"); await page.keyboard.type("215"); await page.keyboard.press("Enter");
    await page.waitForTimeout(2200);
    eq(await page.evaluate(()=>!!document.querySelector("#toastT.act.show")),false);
  })
,

  check("רשימה אחת: תלמיד שנוסף במבחני הכושר מופיע ב«התלמידים שלי»",base,async page=>{
    await go(page,"ft");
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click()); await page.waitForTimeout(500);
    await page.evaluate(()=>document.getElementById("ft-rosterBtn").click()); await page.waitForTimeout(250);
    await page.fill("#ft-rosBulk","מיה כהן"); await page.click("#ft-rosPaste"); await page.waitForTimeout(250);
    const st=await LSget(page,"stu.list");
    const m=st.find(s=>s.name==="מיה כהן");
    ok(m,"נכנסה ל«התלמידים שלי»"); eq(m.cid,"c:ט:3");
    eq(await LSget(page,"ft.roster"),null,"אין רשימה שנייה");
    await page.evaluate(()=>window.STU.show("","list")); await page.waitForTimeout(300);
    ok((await page.evaluate(()=>document.getElementById("stu-list").textContent)).indexOf("מיה כהן")>=0,"ומוצגת שם");
  }),

  check("רשימה אחת: הסרה מרשימת הכיתה — מיידית, ו«↩ בטל» מחזיר עם הציונים",Object.assign({},base,{
    "stu.list":[Object.assign(S("a","דן אבירם","ט׳3","c:ט:3"),{grades:{"רבעון 1":{exams:{x:90}}}}),S("b","נועה לוי","ט׳3","c:ט:3")]}),async page=>{
    await go(page,"ft");
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click()); await page.waitForTimeout(500);
    await page.evaluate(()=>document.getElementById("ft-rosterBtn").click()); await page.waitForTimeout(250);
    await page.evaluate(()=>document.querySelector('#ft-rosList [data-rd="id:a"]').click()); await page.waitForTimeout(250);
    eq((await LSget(page,"stu.list")).map(s=>s.id),["b"]);
    await undoBtn(page);
    const a=(await LSget(page,"stu.list")).find(s=>s.id==="a");
    ok(a&&a.grades["רבעון 1"].exams.x===90,"חזר עם הציונים");
  }),

  /* שמות שתוקנו: רשימת הענפים נשמרת במכשיר, ולכן היא מתעדכנת בטעינה —
     אבל רק ענף שעדיין נושא את השם הישן. */
  check("ענפי השיאים: «הקפצות כדורגל» ו«מבחן זריזות 4×10» גם במכשיר עם רשימה ישנה",
    Object.assign({},base,{"rec.sports":[
      {id:"juggle",em:"⚽",name:"הטחות כדורגל",unit:"נגיעות בדקה",yt:"ישן"},
      {id:"shuttle",em:"↔️",name:"ריצת מעבורת 4×10",unit:"שניות"},
      {id:"sprint",em:"⚡",name:"הספרינט שלי",unit:"שניות"}]}),async page=>{
    await go(page,"rec",900);
    const l=await LSget(page,"rec.sports");
    eq(l.map(x=>x.name),["הקפצות כדורגל","מבחן זריזות 4×10","הספרינט שלי"],"שם שהמורה בחר נשאר");
    ok(l[0].yt!=="ישן","וגם החיפוש ביוטיוב עודכן");
  })
]};
