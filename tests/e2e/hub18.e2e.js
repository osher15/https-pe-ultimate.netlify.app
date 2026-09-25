"use strict";
/* ============================================================
   מרכז הכיתה — שלב 3 של העיצוב מחדש
   ------------------------------------------------------------
   בוחרים כיתה פעם אחת, ורואים את מצבה; כל כרטיס פותח את המסך המלא
   כבר על הכיתה הזאת — בלי לבחור אותה שוב באף בורר.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const S=(id,n,c)=>({id,name:n,cls:c,tests:[]});
const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"},
                "c:ח:1":{id:"c:ח:1",name:"ח׳1",grade:"ח",num:1,key:"ח1"}},
  "ft.roster":{"ט3":[{id:"a",name:"נועה לוי",sex:"girls"},{id:"b",name:"איתי כהן",sex:"boys"}],
               "ח1":[{id:"d",name:"רון קפלן",sex:"boys"}]},
  "stu.list":[S("a","נועה לוי","ט׳3"),S("b","איתי כהן","ט׳3"),S("d","רון קפלן","ח׳1")],
  "ft.results":[{sid:"a",name:"נועה לוי",cid:"c:ט:3",cls:"ט׳3",test:"ljump",val:180,unit:"ס״מ",d:"2026-09-06"},
                {sid:"b",name:"איתי כהן",cid:"c:ט:3",cls:"ט׳3",test:"push",val:22,d:"2026-09-06"}],
  "hub.cls":"c:ט:3"};
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(400); };
const hub=async page=>{ await page.click('.nav [data-go="cls"]'); await page.waitForTimeout(450); };
const btn=async(page,k)=>{ await page.click('#hub-root [data-hub="'+k+'"]'); await page.waitForTimeout(500); };

module.exports={title:"מרכז הכיתה",tests:[

  check("«כיתות» בסרגל פותח את מרכז הכיתה על הכיתה האחרונה",seed,async page=>{
    await hub(page);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,title:document.getElementById("cls-title").textContent,
      chips:[...document.querySelectorAll("#hub-root .hub-chips [data-cls]")].map(b=>b.dataset.cls),
      on:(document.querySelector("#hub-root .hub-chips .on")||{}).dataset.cls,
      cards:document.querySelectorAll("#hub-root .hub-card").length}));
    eq(r.mod,"cls"); ok(/ט׳3/.test(r.title),r.title);
    eq(r.chips.sort(),["c:ח:1","c:ט:3"]); eq(r.on,"c:ט:3"); eq(r.cards,5);
  }),

  check("הקשה על כיתה אחרת מחליפה את כל המסך",seed,async page=>{
    await hub(page);
    await page.click('#hub-root [data-cls="c:ח:1"]'); await page.waitForTimeout(300);
    const r=await page.evaluate(()=>({title:document.getElementById("cls-title").textContent,
      stu:(document.querySelector("#hub-root .hub-card .bd .n")||{}).textContent,
      saved:JSON.parse(localStorage.getItem("peultimate.hub.cls"))}));
    ok(/ח׳1/.test(r.title)); eq(r.stu,"1","תלמיד אחד בח׳1"); eq(r.saved,"c:ח:1");
  }),

  check("הסיכומים נכונים: תלמידים ומדידות",seed,async page=>{
    await hub(page);
    const n=await page.evaluate(()=>[...document.querySelectorAll("#hub-root .hub-card")].map(c=>c.querySelector(".bd").textContent.replace(/\s+/g," ").trim()));
    ok(/^2/.test(n[0]),"שני תלמידים: "+n[0]);
    ok(/2 מדידות/.test(n[2])&&/2 מבחנים/.test(n[2]),"שתי מדידות בשני מבחנים: "+n[2]);
  }),

  check("«רשימת התלמידים» נפתחת מסוננת לכיתה",seed,async page=>{
    await hub(page); await btn(page,"stu");
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,sel:document.getElementById("stu-classSel").value,
      tab:(document.querySelector('#view-stu .pf-tabs [data-st].on')||{}).dataset.st}));
    eq(r,{mod:"stu",sel:"c:ט:3",tab:"list"});
  }),

  check("«טבלת הציונים» נפתחת על לשונית הציונים ועל הכיתה",seed,async page=>{
    await hub(page); await btn(page,"grades");
    const r=await page.evaluate(()=>({tab:(document.querySelector('#view-stu .pf-tabs [data-st].on')||{}).dataset.st,
      sel:document.getElementById("gr-classSel").value}));
    eq(r,{tab:"grades",sel:"c:ט:3"});
  }),

  check("«מדד הכושר» נפתח על הכיתה ועל לשונית המדד",Object.assign({},seed,{"ft.last":{grade:"ח",num:1}}),async page=>{
    await hub(page); await btn(page,"idx");
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,tab:(document.querySelector("#ft-tabs .on")||{}).dataset.ft,
      last:JSON.parse(localStorage.getItem("peultimate.ft.last"))}));
    eq(r.mod,"ft"); eq(r.tab,"idx"); eq([r.last.grade,r.last.num],["ט",3]);
  }),

  check("«נוכחות ודוח» נפתח על הכיתה — גם כששיעור בכיתה אחרת פתוח",seed,async page=>{
    await go(page,"live");
    await page.click('#lv-root [data-cls="c:ח:1"]'); await page.waitForTimeout(350);
    await hub(page);
    await page.click('#hub-root [data-cls="c:ט:3"]'); await page.waitForTimeout(300);
    await btn(page,"att");
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,tab:(document.querySelector("#tl-tabs .on")||{}).dataset.tt,
      cls:document.getElementById("tl-attCls").value}));
    eq(r.mod,"tools"); eq(r.tab,"att"); ok(/ט.?3/.test(r.cls),"הכיתה שנבחרה במרכז: "+r.cls);
  }),

  check("נוכחות שסומנה בשיעור מופיעה בסיכום הכיתה",seed,async page=>{
    await go(page,"live");
    await page.click('#lv-root [data-cls="c:ט:3"]'); await page.waitForTimeout(350);
    await page.click("#lv-allIn"); await page.waitForTimeout(250);
    await hub(page);
    const t=await page.evaluate(()=>document.querySelectorAll("#hub-root .hub-card")[1].textContent.replace(/\s+/g," "));
    ok(/1 שיעורים עם נוכחות/.test(t)&&/100%/.test(t),t);
  }),

  check("כיתה חדשה מתווספת מהמרכז ונבחרת",seed,async page=>{
    await hub(page);
    await page.evaluate(()=>{ document.getElementById("hub-add").open=true; });
    await page.click('#hub-ag [data-ag="ז"]'); await page.waitForTimeout(150);
    await page.click('#hub-an [data-an="4"]'); await page.waitForTimeout(150);
    await page.click("#hub-addGo"); await page.waitForTimeout(300);
    const r=await page.evaluate(()=>({on:(document.querySelector("#hub-root .hub-chips .on")||{}).dataset.cls,
      reg:Object.keys(JSON.parse(localStorage.getItem("peultimate.ft.classes")))}));
    eq(r.on,"c:ז:4"); ok(r.reg.indexOf("c:ז:4")>=0);
  }),

  check("מכשיר בלי כיתות: הסבר והוספה, לא מסך ריק",{"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION},async page=>{
    await hub(page);
    const r=await page.evaluate(()=>({empty:!!document.querySelector("#hub-root .empty-state"),
      add:!!document.getElementById("hub-add")&&document.getElementById("hub-add").open}));
    eq(r,{empty:true,add:true});
  })

]};
