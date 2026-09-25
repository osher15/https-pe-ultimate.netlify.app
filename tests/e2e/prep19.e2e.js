"use strict";
/* ============================================================
   הכנה — שלב 4 של העיצוב מחדש
   ------------------------------------------------------------
   • «להכנה» בבית: שיעורים קרובים בלי מערך, ו«הכן מערך» פותח את
     המערכים על הכיתה
   • שיוך מערך לשיעור: מופיע ב«היום» ועולה לבד במצב שיעור
   • עריכת המהלך של כל מערך — שם, דקות, תיאור, סדר, מחיקה והוספה
   • «קח למערך» ממאגר המשחקים נכנס למערך שעל המסך
   • דירוג אחד בסוף השיעור, שמלמד גם את מחולל המערכים
   ============================================================ */
const {check,eq,ok,atToday}=require("./harness.js");
const D=require("../../hm-data.js");

const S=(id,n,c)=>({id,name:n,cls:c,tests:[]});
const today=()=>new Date().toISOString().slice(0,10);
const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "ft.roster":{"ט3":[{id:"a",name:"נועה לוי"},{id:"b",name:"איתי כהן"},{id:"c",name:"מאיה פרץ"}]},
  "stu.list":[S("a","נועה לוי","ט׳3"),S("b","איתי כהן","ט׳3"),S("c","מאיה פרץ","ט׳3")]};
const withSlot=Object.assign({},base,{
  "sched.week":[{id:"s1",day:D.dayOfISO(today()),time:"13:00",cid:"c:ט:3",clsSnapshot:"ט׳3"}],
  __now:atToday("10:00")});
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(400); };
const gen=async page=>{ await go(page,"lesson"); await page.click("#ls-gen"); await page.waitForTimeout(400); };
const plan=page=>page.evaluate(()=>window.LESSON.current());

module.exports={title:"הכנה: שיוך, עריכה ודירוג אחד",tests:[

  check("«להכנה» בבית מציג שיעור קרוב בלי מערך",withSlot,async page=>{
    await go(page,"home");
    const r=await page.evaluate(()=>({hidden:document.getElementById("hx-prep").hidden,
      rows:document.querySelectorAll("#hx-prep [data-prep]").length,
      txt:document.getElementById("hx-prep").textContent}));
    eq(r.hidden,false); eq(r.rows,1); ok(/ט׳3/.test(r.txt),r.txt);
  }),

  check("«הכן מערך» פותח את המערכים על הכיתה, עם מספר התלמידים שלה",withSlot,async page=>{
    await go(page,"home");
    await page.click("#hx-prep [data-prep]"); await page.waitForTimeout(450);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,cls:document.getElementById("ls-class").value,
      size:document.getElementById("ls-size").value}));
    eq(r,{mod:"lesson",cls:"ט׳3",size:"3"});
  }),

  check("אחרי בניית המערך השיוך מוצע לשיעור שממנו באו, והקשה אחת משייכת",withSlot,async page=>{
    await go(page,"home");
    await page.click("#hx-prep [data-prep]"); await page.waitForTimeout(400);
    await page.click("#ls-gen"); await page.waitForTimeout(400);
    const box=await page.evaluate(()=>({hidden:document.getElementById("ls-assignBox").hidden,
      sug:document.querySelectorAll("#ls-assignBox [data-asg-iso].acc").length}));
    eq(box,{hidden:false,sug:1});
    await page.click("#ls-assignBox [data-asg-iso].acc"); await page.waitForTimeout(350);
    const r=await page.evaluate(t=>{ const a=JSON.parse(localStorage.getItem("peultimate.ls.assign")||"{}");
      return {key:Object.keys(a)[0],title:(a["c:ט:3|"+t]||{}).title,plan:window.LESSON.current().title,
        hidden:document.getElementById("ls-assignBox").hidden}; },today());
    eq(r.key,"c:ט:3|"+today()); eq(r.title,r.plan); eq(r.hidden,true);
  }),

  check("מערך משויך: מופיע בהיום, «להכנה» יורד, והוא עולה לבד כשהשיעור מתחיל",withSlot,async page=>{
    await go(page,"home");
    await page.click("#hx-prep [data-prep]"); await page.waitForTimeout(400);
    await page.click("#ls-gen"); await page.waitForTimeout(400);
    await page.click("#ls-assignBox [data-asg-iso].acc"); await page.waitForTimeout(300);
    const title=(await plan(page)).title;
    await go(page,"home");
    const h=await page.evaluate(()=>({prep:document.getElementById("hx-prep").hidden,
      today:document.getElementById("hx-todayList").textContent}));
    eq(h.prep,true,"«להכנה» יורד כשיש מערך");
    ok(h.today.indexOf(title)>=0,"שם המערך מופיע בשורת השיעור: "+h.today.slice(0,120));
    /* מערך אחר על המסך — כדי לוודא שעולה המשויך ולא מה שבמסך */
    await page.evaluate(()=>{ const p=JSON.parse(JSON.stringify(window.LESSON.current()));
      p.title="מערך אחר"; p.phases=[{n:"שלב זר",min:5,d:""}]; window.LESSON.usePlan(p); });
    await go(page,"home");
    await page.click("#hx-todayList [data-slot]"); await page.waitForTimeout(450);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,
      ph:(document.getElementById("lv-phName")||{}).textContent,
      ses:(window.HM.session.active()||{}).planTitle}));
    eq(r.mod,"live"); ok(/חימום/.test(r.ph||""),"השלב הראשון של המשויך: "+r.ph); eq(r.ses,title);
  }),

  check("עריכת המהלך: שם, דקות, מחיקה, הוספה והזזה",base,async page=>{
    await gen(page);
    const n0=(await plan(page)).phases.length;
    await page.click('#ls-planBody [data-pe="toggle"]'); await page.waitForTimeout(200);
    await page.fill('#ls-planBody [data-pi="0"] [data-pf="n"]',"חימום בזוגות");
    await page.fill('#ls-planBody [data-pi="0"] [data-pf="min"]',"12");
    await page.click('#ls-planBody [data-pe="add"]'); await page.waitForTimeout(150);
    let p=await plan(page);
    eq(p.phases[0].n,"חימום בזוגות"); eq(p.phases[0].min,12); eq(p.phases.length,n0+1,"נוסף שלב");
    ok(/סיום/.test(p.phases[p.phases.length-1].n),"השלב החדש נכנס לפני הסיום");
    await page.click('#ls-planBody [data-pi="1"] [data-pe="up"]'); await page.waitForTimeout(150);
    p=await plan(page); eq(p.phases[1].n,"חימום בזוגות","הוזז למטה... ובחזרה");
    await page.click('#ls-planBody [data-pi="1"] [data-pe="del"]'); await page.waitForTimeout(150);
    p=await plan(page); eq(p.phases.length,n0,"נמחק שלב");
    await page.click('#ls-planBody [data-pe="toggle"]'); await page.waitForTimeout(150);
    ok(!(await page.evaluate(()=>!!document.querySelector("#ls-planBody .pe-row"))),"יוצאים ממצב עריכה");
  }),

  check("«קח למערך» ממאגר המשחקים נכנס למערך שעל המסך, לפני הסיום",base,async page=>{
    await gen(page);
    const n0=(await plan(page)).phases.length;
    await go(page,"games");
    await page.evaluate(()=>document.querySelector("#gm-grid [data-g]").click()); await page.waitForTimeout(300);
    await page.click("#gm-toLesson"); await page.waitForTimeout(400);
    const p=await plan(page);
    eq(await page.evaluate(()=>document.body.dataset.mod),"lesson");
    eq(p.phases.length,n0+1);
    ok(/^משחק:/.test(p.phases[p.phases.length-2].n),"המשחק לפני הסיום: "+p.phases[p.phases.length-2].n);
  }),

  check("כרטיס המערך בלי הפעלה, טיימר ודירוג כפולים — אלה במצב שיעור",base,async page=>{
    await gen(page);
    const r=await page.evaluate(()=>["ls-run","ls-stop","ls-phase","qt-go","ls-fbBox"].filter(id=>document.getElementById(id)));
    eq(r,[]);
  }),

  check("דירוג אחד בסוף השיעור מלמד גם את מחולל המערכים",base,async page=>{
    await gen(page);
    const topic=(await plan(page)).topic;
    await go(page,"live");
    await page.click('#lv-root [data-cls="c:ט:3"]'); await page.waitForTimeout(350);
    await page.click("#lv-end"); await page.waitForTimeout(300);
    await page.click('#end-rate button[data-r="1"]');
    await page.click("#end-go"); await page.waitForTimeout(500);
    const fb=await page.evaluate(()=>JSON.parse(localStorage.getItem("peultimate.ls.feedback")||"[]"));
    eq(fb.length,1); eq(fb[0].topic,topic); eq(fb[0].rating,1);
    ok(fb[0].variants.length>0,"עם הגרסאות שנבחרו");
  })

]};
