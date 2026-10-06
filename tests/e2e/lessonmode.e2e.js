"use strict";
/* Lesson mode in the tools (owner feedback 2026-10-06: "loading a class
   feels slow during a lesson"). With an active lesson in the class on
   screen, Fitness tests and Attendance collapse their class/date pickers
   into one line so the content is at the top; "Change" reopens them; the
   lesson bar has "Back to lesson"; My Students opens on the lesson class.
   Outside a lesson every screen looks exactly as before. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const Z1="c:ז:1", Z2="c:ז:2";
const kids=(cls,cid,p,n)=>Array.from({length:n},(_,i)=>({id:p+i,name:"Kid "+p+i,cls,cid,sex:i%2?"girls":"boys",age:12,tests:[]}));
const seed={
  "lang":"en",
  "ft.classes":{[Z1]:{id:Z1,name:"ז׳1",grade:"ז",num:1,key:"ז1"},[Z2]:{id:Z2,name:"ז׳2",grade:"ז",num:2,key:"ז2"}},
  "stu.list":kids("ז׳1",Z1,"a",6).concat(kids("ז׳2",Z2,"b",5)),
  "pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION
};
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(450); };
const shown=(page,sel)=>page.evaluate(s=>{ const e=document.querySelector(s); return !!e&&!e.hidden&&getComputedStyle(e).display!=="none"&&!!e.offsetParent; },sel);
const startLesson=async(page,cid,label)=>{
  await page.evaluate(([c,l])=>window.HM.session.start({cid:c,clsSnapshot:l}),[cid,label]);
  await page.evaluate(()=>window.HM.paintSessionBar());
};

module.exports={title:"Lesson mode — compact tools during a lesson",tests:[
  check("no lesson: Fitness tests and Attendance show the full pickers, as before",seed,async page=>{
    await go(page,"ft");
    ok(await shown(page,"#ft-grades"),"year buttons shown");
    ok(!(await shown(page,"#ft-lessonRow")),"no lesson row");
    await go(page,"tools");
    await page.evaluate(()=>window.TOOLS.openTab("att")); await page.waitForTimeout(300);
    ok(await shown(page,"#tl-attDate"),"date shown");
    ok(await shown(page,"#tl-attStats"),"summary tiles shown");
    /* the sideways-pan guard must not break sticky elements: the header stays on top */
    await go(page,"ft");
    await page.evaluate(()=>window.scrollTo(0,700)); await page.waitForTimeout(150);
    const top=await page.evaluate(()=>document.querySelector(".apphead").getBoundingClientRect().top);
    ok(Math.abs(top)<2,"sticky header stays at the top after scrolling (top="+Math.round(top)+")");
  }),
  check("lesson in ז׳1: Measure opens compact on ז׳1; Change class reopens the pickers; Back returns to the lesson",seed,async page=>{
    await startLesson(page,Z1,"ז׳1");
    await go(page,"live");
    await page.click('#lv-root [data-tool="meas"]'); await page.waitForTimeout(500);
    eq(await page.evaluate(()=>document.body.dataset.mod),"ft");
    ok(await shown(page,"#ft-lessonRow"),"lesson row shown");
    ok(!(await shown(page,"#ft-grades")),"year buttons folded away");
    ok(/7-1/.test(await page.evaluate(()=>document.getElementById("ft-lessonRow").textContent)),"row names the class");
    const y=await page.evaluate(()=>document.querySelector(".ft-card").getBoundingClientRect().top);
    ok(y<560,"first test is on the first screen (y="+Math.round(y)+")");
    await page.click("#ft-showPick"); await page.waitForTimeout(200);
    ok(await shown(page,"#ft-grades"),"Change class reopens the pickers");
    ok(!(await shown(page,"#ft-lessonRow")),"and hides the row");
    ok(await shown(page,"#lsBarBack"),"Back to lesson on the lesson bar");
    await page.click("#lsBarBack"); await page.waitForTimeout(400);
    eq(await page.evaluate(()=>document.body.dataset.mod),"live");
  }),
  check("another class picked by hand during the lesson: full pickers, nothing hidden",seed,async page=>{
    await startLesson(page,Z1,"ז׳1");
    await go(page,"ft");
    await page.click("#ft-showPick"); await page.waitForTimeout(200);
    await page.click('#ft-nums [data-n="2"]'); await page.waitForTimeout(300);
    ok(await shown(page,"#ft-grades"),"pickers stay open on ז׳2");
    ok(!(await shown(page,"#ft-lessonRow")),"no lesson row for a class that is not the lesson's");
  }),
  check("Attendance in the lesson: one summary line, list at the top; Change reopens date and class; marks still save",seed,async page=>{
    await startLesson(page,Z1,"ז׳1");
    await go(page,"live");
    await page.click('#lv-root [data-tool="att"]'); await page.waitForTimeout(500);
    ok(!(await shown(page,"#tl-attDate")),"date folded away");
    ok(!(await shown(page,"#tl-attStats")),"tiles folded away");
    ok(await shown(page,"#tl-attAll"),"Mark all stays");
    const line=await page.evaluate(()=>document.getElementById("tl-attCtx").textContent);
    ok(/Active lesson/.test(line)&&/7-1/.test(line)&&/today/.test(line),"summary line: "+line);
    await page.click('#tl-attList [data-att="a0|a"]'); await page.waitForTimeout(200);
    const att=await page.evaluate(()=>window.HM.LS.get("tools.att",{}));
    const day=Object.keys(att).find(k=>/\|ז׳1$/.test(k));
    eq(day&&att[day].a0,"a","the mark is saved under the class, as before");
    ok(/1 absent/.test(await page.evaluate(()=>document.getElementById("tl-attCtx").textContent)),"line counts the absent pupil");
    await page.click("#tl-attChange"); await page.waitForTimeout(200);
    ok(await shown(page,"#tl-attDate"),"Change reopens the date");
    ok(await shown(page,"#tl-attStats"),"and the tiles");
  }),
  check("My Students opens on the lesson class once; All classes stays chosen after that",seed,async page=>{
    await go(page,"stu");
    eq(await page.evaluate(()=>document.getElementById("stu-classSel").value),"","no lesson: all classes");
    await startLesson(page,Z2,"ז׳2");
    await go(page,"home"); await go(page,"stu");
    eq(await page.evaluate(()=>document.getElementById("stu-classSel").value),Z2,"lesson class selected");
    await page.selectOption("#stu-classSel",""); await page.waitForTimeout(200);
    await go(page,"home"); await go(page,"stu");
    eq(await page.evaluate(()=>document.getElementById("stu-classSel").value),"","the teacher's choice is kept");
  })
]};
