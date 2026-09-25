"use strict";
/* ============================================================
   פוטו־פיניש וביפ — שלב 5 של העיצוב מחדש
   ------------------------------------------------------------
   • מרוץ מול הצבה: ליד הקו רק שעון, זינוק ומסלולים; כל ההגדרות
     החד־פעמיות באשף «הצבה» אחד (במקום שלושה מקומות)
   • יעד אחד לתוצאות: «שמור לכיתה» → מבחני הכושר (ובביפ גם כרטיס
     התלמיד); כל השיתוף והייצוא בתפריט אחד
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const S=(id,n,c,cid)=>({id,name:n,cls:c,cid,tests:[]});
const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "ft.roster":{"ט3":[{id:"a",name:"דן אבירם"},{id:"b",name:"נועה לוי"}]},
  "stu.list":[S("a","דן אבירם","ט׳3","c:ט:3"),S("b","נועה לוי","ט׳3","c:ט:3")]};
const ses={id:"ls1",cid:"c:ט:3",clsSnapshot:"ט׳3",date:new Date().toISOString().slice(0,10),
  startedAt:Date.now()-600000,endedAt:null,status:"active",planId:null,planTitle:""};
const withLesson=Object.assign({},base,{"ls.sessions":[ses]});
const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||700); };
const vis=(page,sel)=>page.evaluate(s=>{ const e=document.querySelector(s); return !!e&&e.offsetParent!==null; },sel);
const tab=async(page,k)=>{ await page.click('.pf-tabs [data-pt="'+k+'"]'); await page.waitForTimeout(250); };
const sample=async page=>{ await tab(page,"results");
  await page.evaluate(()=>{ document.getElementById("pf-arcFold").open=true; document.getElementById("pf-loadSample").click(); });
  await page.waitForTimeout(300); };

module.exports={title:"פוטו־פיניש וביפ: מרוץ, הצבה ויעד אחד",tests:[

  check("חמש לשוניות: מרוץ · הצבה · תמונת סיום · תוצאות · הקפות",base,async page=>{
    await go(page,"photo");
    eq(await page.evaluate(()=>[...document.querySelectorAll(".pf-tabs [data-pt]")].map(b=>b.dataset.pt)),
      ["live","setup","strip","results","laps"]);
  }),

  check("מסך המרוץ: שעון, זינוק ומסלולים — בלי הגדרות",base,async page=>{
    await go(page,"photo");
    for(const id of ["pf-stage","pf-clock","pf-gun","pf-chips","pf-manual"])ok(await vis(page,"#"+id),"גלוי: "+id);
    for(const id of ["pf-sens","pf-slit","pf-minT","pf-gunDist","pf-camDist","pf-lineRange","pf-setDist","pf-sanityBtn"])
      ok(!(await vis(page,"#"+id)),"לא במרוץ: "+id);
  }),

  check("כניסה ראשונה פותחת את ההצבה; «מוכן» בסוף מסמן ועובר למרוץ",{"schema.version":D.SCHEMA_VERSION},async page=>{
    await go(page,"photo",900);
    ok(await vis(page,"#pf-sub-setup"),"ההצבה פתוחה");
    ok(await vis(page,"#pf-stage"),"והתמונה מעליה — כדי ליישר את הקו");
    for(let i=0;i<4;i++){ await page.click("#pfw-next"); await page.waitForTimeout(120); }
    ok(await vis(page,"#pf-setDist"),"השלב האחרון: פרטי המירוץ");
    await page.click("#pfw-next"); await page.waitForTimeout(300);
    ok(await vis(page,"#pf-sub-live"),"עבר למרוץ");
    eq(await page.evaluate(()=>window.HM.LS.get("pf.guideSeen",false)),true);
    ok(!(await page.evaluate(()=>!!document.querySelector(".modal.on"))),"בלי חלון הדרכה");
  }),

  check("כל שלב בהצבה מחזיק את הפקדים שלו, ואפשר לקפוץ ישר לשלב",base,async page=>{
    await go(page,"photo"); await tab(page,"setup");
    const want={0:"pf-camDist",1:"pf-lineRange",2:"pf-gunDist",3:"pf-sens",4:"pf-setDist"};
    for(const k of Object.keys(want)){
      await page.click('#pfw-steps [data-ps="'+k+'"]'); await page.waitForTimeout(120);
      ok(await vis(page,"#"+want[k]),"שלב "+k+": "+want[k]);
      for(const o of Object.values(want))if(o!==want[k])ok(!(await vis(page,"#"+o)),"שלב "+k+" בלי "+o);
    }
  }),

  check("תוצאות: «שמור לכיתה» ותפריט שיתוף אחד במקום תשעה כפתורים",base,async page=>{
    await go(page,"photo"); await sample(page);
    const r=await page.evaluate(()=>{ const act=document.querySelector("#pf-sub-results .pf-resAct");
      return {direct:[...act.children].filter(e=>e.offsetParent!==null).map(e=>e.id),
        menu:[...document.querySelectorAll("#pf-share .menu button")].map(b=>b.id)}; });
    eq(r.direct,["pf-toFt","pf-share","pf-addRow"]);
    eq(r.menu,["pf-btnAI","pf-btnSave","pf-csv","pf-sheet","pf-print","pf-mail"]);
    await page.click("#pf-share > summary"); await page.waitForTimeout(150);
    ok(await vis(page,"#pf-btnAI"),"התפריט נפתח");
    await page.click("#pf-btnAI"); await page.waitForTimeout(250);
    eq(await page.evaluate(()=>document.getElementById("pf-share").open),false,"ונסגר אחרי בחירה");
  }),

  check("שיעור פתוח: הכפתור אומר לאיזו כיתה, ושומר בלי לשאול",withLesson,async page=>{
    await go(page,"photo"); await sample(page);
    ok(/ט׳3/.test(await page.evaluate(()=>document.getElementById("pf-toFt").textContent)),"שם הכיתה על הכפתור");
    await page.click("#pf-toFt"); await page.waitForTimeout(400);
    eq(await page.evaluate(()=>document.querySelectorAll(".modal.on").length),0,"בלי בורר");
    const res=await page.evaluate(()=>window.FT.results());
    eq(res.length,4); eq(res[0].test,"r60"); eq(res[0].cid,"c:ט:3");
  }),

  check("הארכיון יושב מתחת ללוח: שמירה מהתפריט מופיעה בו",base,async page=>{
    await go(page,"photo"); await sample(page);
    await page.evaluate(()=>document.getElementById("pf-btnSave").click()); await page.waitForTimeout(300);
    eq(await page.evaluate(()=>document.querySelectorAll("#pf-historyList .arc-item").length),1);
    ok(await vis(page,"#pf-historyList .arc-item"),"גלוי בקיפול הארכיון");
  }),

  check("ביפ: כפתור שמירה אחד — נכנס גם למבחני הכושר וגם לכרטיס התלמיד",Object.assign({},withLesson,{
    "bt.results":[{id:1,name:"דן אבירם",level:7,sh:5,dist:1200,time:421.3,speed:12.5}]}),async page=>{
    await go(page,"beep");
    eq(await page.evaluate(()=>!!document.getElementById("bt-toTrack")),false,"אין «שמור למעקב» נפרד");
    await page.click("#bt-toFt"); await page.waitForTimeout(500);
    const r=await page.evaluate(()=>({ft:window.FT.results().map(x=>[x.test,x.cid,x.val]),
      stu:JSON.parse(localStorage.getItem("peultimate.stu.list")).find(s=>s.name==="דן אבירם"),
      mod:document.body.dataset.mod}));
    eq(r.ft,[["beep","c:ט:3",1200]]);
    eq(r.stu.tests.length,1,"וגם בכרטיס"); eq(r.stu.tests[0].type,"ביפ"); eq(r.stu.id,"a","אותו תלמיד, לא כפיל");
    eq(r.mod,"beep","נשארים במסך הביפ");
  })

]};
