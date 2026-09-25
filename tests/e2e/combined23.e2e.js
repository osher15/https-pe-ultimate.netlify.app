"use strict";
/* ============================================================
   כיתות שלומדות יחד (ט׳1 + ט׳4)
   ------------------------------------------------------------
   מורה שמלמד שתי כיתות בשיעור אחד פתח עד עכשיו את ט׳1, הזין,
   ואז פתח את ט׳4 והזין שוב. כאן מחברים אותן פעם אחת — ומאז כל מבחן,
   ציון ונוכחות מוזנים פעם אחת לכולן.

   הקו שנבדק בכל מסך: **הזנה אחת, ושמירה בכיתה של התלמיד.** אם
   מדידה של תלמיד מט׳4 תישמר תחת הקבוצה, היא תיעלם מהכיתה שלו.
   ============================================================ */
const {check,eq,ok,atToday}=require("./harness.js");
const D=require("../../hm-data.js");

const CLS={
  "c:ט:1":{id:"c:ט:1",name:"ט׳1",grade:"ט",num:1,key:"ט1"},
  "c:ט:4":{id:"c:ט:4",name:"ט׳4",grade:"ט",num:4,key:"ט4"},
  "c:ח:2":{id:"c:ח:2",name:"ח׳2",grade:"ח",num:2,key:"ח2"}
};
const STU=[
  {id:"a",name:"אבי כהן",cls:"ט׳1",cid:"c:ט:1",sex:"boys",tests:[]},
  {id:"b",name:"בני לוי",cls:"ט׳1",cid:"c:ט:1",sex:"boys",tests:[]},
  {id:"c",name:"גלי רז",cls:"ט׳4",cid:"c:ט:4",sex:"girls",tests:[]},
  {id:"d",name:"דנה מור",cls:"ט׳4",cid:"c:ט:4",sex:"girls",tests:[]},
  {id:"e",name:"ערן שחר",cls:"ח׳2",cid:"c:ח:2",sex:"boys",tests:[]}
];
const base={"ft.classes":CLS,"stu.list":STU,"pf.guideSeen":true,
  "schema.version":D.SCHEMA_VERSION,__now:atToday("07:00")};
const GID="g:t14";
const joined=Object.assign({},base,{"ft.classes":Object.assign({},CLS,{[GID]:
  {id:GID,kind:"group",name:"ט׳1+ט׳4",key:"ט׳1+ט׳4",members:["c:ט:1","c:ט:4"],sids:[]}}),
  "ft.last":{grade:"ט",num:1,gid:GID}});

/* חיבור דרך הממשק: הכפתור «🔗 חבר כיתות» ← סימון ← «חבר» */
async function joinViaUi(page,host,cids){
  await page.evaluate(h=>document.querySelector(h+" [data-join]").click(),host);
  await page.waitForTimeout(300);
  await page.evaluate(cs=>{
    document.querySelectorAll("#askModal .ask-checks input").forEach(i=>{ i.checked=cs.indexOf(i.value)>=0; });
    document.getElementById("ask-ok").click();
  },cids);
  await page.waitForTimeout(400);
}
const groups=page=>page.evaluate(()=>window.HMDATA.listGroups(window.HM.regStore));
async function openFt(page){
  await page.evaluate(()=>window.HM.go("ft")); await page.waitForTimeout(700);
}
async function openTest(page,tid){
  await page.evaluate(t=>document.querySelector('#ft-tests [data-t="'+t+'"]').click(),tid);
  await page.waitForTimeout(600);
}
async function typeVal(page,key,v){
  await page.evaluate(a=>{
    const inp=document.querySelector('#ft-list [data-val="'+CSS.escape(a.k)+'"]');
    inp.value=String(a.v); inp.dispatchEvent(new Event("change",{bubbles:true}));
  },{k:key,v});
  await page.waitForTimeout(400);
}

module.exports={title:"כיתות שלומדות יחד",tests:[

  check("מבחני כושר: «חבר כיתות» יוצר קבוצה ופותח אותה",base,async page=>{
    await openFt(page);
    await joinViaUi(page,"#ft-groups",["c:ט:1","c:ט:4"]);
    const g=await groups(page);
    eq(g.length,1,"נוצרה קבוצה אחת");
    eq(g[0].name,"ט׳1 + ט׳4");
    eq(g[0].members.slice().sort(),["c:ט:1","c:ט:4"]);
    const r=await page.evaluate(()=>({name:document.getElementById("ft-clsName").textContent,
      on:(document.querySelector("#ft-groups .on")||{}).textContent||"",
      grades:document.querySelectorAll("#ft-grades .on").length}));
    ok(/ט׳1 \+ ט׳4/.test(r.name),"הבורר עבר לקבוצה: "+r.name);
    ok(/ט׳1 \+ ט׳4/.test(r.on),"והשבב שלה מסומן");
    eq(r.grades,0,"שכבה בודדת כבר לא מסומנת");
  }),

  check("חיבור שוב של אותן כיתות לא יוצר קבוצה כפולה",joined,async page=>{
    await openFt(page);
    await joinViaUi(page,"#ft-groups",["c:ט:1","c:ט:4"]);
    eq((await groups(page)).length,1);
  }),

  check("מבחן בקבוצה: רשימה אחת, וכל תוצאה נשמרת בכיתה של התלמיד",joined,async page=>{
    await openFt(page);
    await openTest(page,"ljump");
    const rows=await page.evaluate(()=>[...document.querySelectorAll("#ft-list .ft-row")].map(r=>({
      k:r.dataset.n,nm:r.dataset.nm,cls:(r.querySelector(".ccls")||{}).textContent||""})));
    eq(rows.map(r=>r.nm).sort(),["אבי כהן","בני לוי","גלי רז","דנה מור"],"ארבעת התלמידים יחד, בלי ח׳2");
    ok(rows.every(r=>/ט׳[14]/.test(r.cls)),"ליד כל אחד — הכיתה שלו: "+JSON.stringify(rows.map(r=>r.cls)));
    const a=rows.find(r=>r.nm==="אבי כהן"), c=rows.find(r=>r.nm==="גלי רז");
    await typeVal(page,a.k,180);
    await typeVal(page,c.k,150);
    const res=await page.evaluate(()=>window.FT.results().map(r=>({sid:r.sid,cid:r.cid,cls:r.cls,val:r.val,g:r.gradeKey})));
    eq(res.length,2);
    const ra=res.find(r=>r.sid==="a"), rc=res.find(r=>r.sid==="c");
    eq([ra.cid,ra.cls,ra.val],["c:ט:1","ט׳1",180],"אבי — בט׳1");
    eq([rc.cid,rc.cls,rc.val],["c:ט:4","ט׳4",150],"גלי — בט׳4, לא בקבוצה");
    eq(ra.g,"ט","שכבת הנורמה נשמרת");
  }),

  check("מדידה מהקבוצה מופיעה גם כשפותחים את הכיתה לבד",joined,async page=>{
    await openFt(page);
    await openTest(page,"ljump");
    const k=await page.evaluate(()=>[...document.querySelectorAll("#ft-list .ft-row")].find(r=>r.dataset.nm==="דנה מור").dataset.n);
    await typeVal(page,k,140);
    const n=await page.evaluate(()=>{ window.FT.show("c:ט:4","tests"); return window.FT.summary("c:ט:4").n; });
    eq(n,1,"ט׳4 רואה את המדידה");
    eq(await page.evaluate(()=>window.FT.summary("c:ט:1").n),0,"ט׳1 לא");
  }),

  check("ביפ/פוטו־פיניש: שליחה לקבוצה מפזרת לכיתות",joined,async page=>{
    const r=await page.evaluate(gid=>{
      const x=window.FT.ingest("ט׳1+ט׳4","r60",[{name:"בני לוי",val:9.1},{name:"גלי רז",val:9.8},{name:"לא קיים",val:9}],"test");
      const y=window.FT.ingest("","r60",[{name:"דנה מור",val:10.2}],"test",{cid:gid});
      return {x,y,rows:window.FT.results().map(r=>[r.name,r.cid])};
    },GID);
    eq([r.x.added,r.x.skipped],[2,1],"שם שאינו בקבוצה מדולג — אין לאן לשמור אותו");
    eq(r.y.added,1,"גם לפי מזהה הקבוצה");
    eq(r.rows.sort(),[["בני לוי","c:ט:1"],["גלי רז","c:ט:4"],["דנה מור","c:ט:4"]]);
  }),

  check("הבורר המשותף מציע את הקבוצה ומחזיר את כל התלמידים שלה",joined,async page=>{
    const out=await page.evaluate(()=>new Promise(res=>{
      window.FT.pick({title:"t",onPick:(names,cls,cid)=>res({names,cls,cid})});
      setTimeout(()=>{
        const b=document.querySelector('#cp-groups [data-gid]');
        if(!b.classList.contains("on"))b.click();
        setTimeout(()=>document.getElementById("cp-load").click(),150);
      },200);
    }));
    eq(out.names.length,4);
    eq(out.cls,"ט׳1+ט׳4");
    eq(out.cid,GID);
  }),

  check("ציונים: הקבוצה בבורר, וכל התלמידים שלה בטבלה אחת",joined,async page=>{
    await page.evaluate(gid=>window.STU.show(gid,"grades"),GID);
    await page.waitForTimeout(500);
    const r=await page.evaluate(()=>({
      opt:[...document.querySelectorAll("#gr-classSel option")].map(o=>o.value),
      sel:document.getElementById("gr-classSel").value,
      rows:document.querySelectorAll("#gr-body tr, #gr-table tbody tr").length}));
    ok(r.opt.indexOf("g:t14")>=0,"הקבוצה בבורר");
    eq(r.sel,"g:t14","והיא הנבחרת");
    const sum=await page.evaluate(gid=>window.STU.summary(gid),GID);
    eq(sum.total,4,"ארבעה תלמידים בקבוצה");
  }),

  check("נוכחות בקבוצה: סימון אחד, נשמר תחת הכיתה של כל תלמיד",joined,async page=>{
    await page.evaluate(gid=>window.TOOLS.show(gid,"att"),GID);
    await page.waitForTimeout(500);
    const names=await page.evaluate(()=>[...document.querySelectorAll("#tl-attList .tl-attrow b")].map(b=>b.textContent));
    eq(names.sort(),["אבי כהן","בני לוי","גלי רז","דנה מור"]);
    await page.click("#tl-attAll"); await page.waitForTimeout(300);
    await page.evaluate(()=>document.querySelector('#tl-attList [data-att="c|a"]').click());
    await page.waitForTimeout(300);
    const att=await page.evaluate(()=>window.HM.LS.get("tools.att",{}));
    const day=Object.keys(att)[0].split("|")[0];
    eq(Object.keys(att).sort(),[day+"|ט׳1",day+"|ט׳4"],"שני רישומים — אחד לכל כיתה");
    eq(att[day+"|ט׳1"],{a:"p",b:"p"});
    eq(att[day+"|ט׳4"],{c:"a",d:"p"});
    const s=await page.evaluate(gid=>({g:window.TOOLS.attSummaryFor(gid),c:window.TOOLS.attSummaryFor("c:ט:4")}),GID);
    eq(s.g,{days:1,pct:75},"הקבוצה: יום אחד, 3 מתוך 4");
    eq(s.c,{days:1,pct:50},"והכיתה לבד רואה את שלה");
  }),

  check("שיעור בקבוצה: הנוכחות והבורר נפתחים על הקבוצה",joined,async page=>{
    const r=await page.evaluate(gid=>{
      window.HM.session.start({cid:gid,clsSnapshot:"ט׳1+ט׳4",date:new Date().toISOString().slice(0,10)});
      const n=window.TOOLS.markAllPresent();
      return {n,st:window.TOOLS.attStatus()};
    },GID);
    eq(r.n,4,"«כולם נוכחים» מסמן את ארבעתם");
    eq([r.st.total,r.st.marked],[4,4]);
  }),

  check("מרכז הכיתה: לקבוצה יש את כל הכרטיסים",joined,async page=>{
    await page.evaluate(gid=>{ window.HM.LS.set("hub.cls",gid); window.HM.go("cls"); },GID);
    await page.waitForTimeout(600);
    const r=await page.evaluate(()=>({
      btns:[...document.querySelectorAll("#hub-root [data-hub]")].map(b=>b.dataset.hub),
      ft:!!document.getElementById("cls-ft")}));
    ["stu","att","idx","grades","peer"].forEach(k=>ok(r.btns.indexOf(k)>=0,"חסר כרטיס "+k+": "+r.btns));
    ok(r.ft,"וכפתור מבחני הכושר");
  })

]};
