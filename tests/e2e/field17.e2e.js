"use strict";
/* ============================================================
   כלי שטח ביד אחת — שלב 2 של העיצוב מחדש
   ------------------------------------------------------------
   • המדידה נפתחת על כיתת השיעור, לא על הכיתה האחרונה שנבחרה
   • השעון וכפתור ההפעלה בסרגל דביק באזור האגודל, לא נגללים מהמסך
   • «קלוט» גדול, ושעון עצור לא קולט זמן קפוא
   • במבחני הזנה Enter עובר לתלמיד הבא והשורה לא קופצת
   • «חזרה» ממבחן פתוח חוזרת לבחירת המבחן
   • ביפ טסט: פרוטוקול תקני כברירת מחדל, הגדרות מקופלות, השמות
     באותו כרטיס עם כפתור הנשירה
   • סיום שיעור בודק נוכחות ומסמן את השאר בהקשה אחת
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const S=(n,c)=>({id:n,name:n,cls:c,tests:[]});
const seed={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"},
                "c:ח:1":{id:"c:ח:1",name:"ח׳1",grade:"ח",num:1,key:"ח1"}},
  "ft.roster":{"ט3":[{id:"a",name:"נועה לוי",sex:"girls"},{id:"b",name:"איתי כהן",sex:"boys"},{id:"c",name:"מאיה פרץ",sex:"girls"}],
               "ח1":[{id:"d",name:"רון קפלן",sex:"boys"}]},
  "stu.list":[S("נועה לוי","ט׳3"),S("איתי כהן","ט׳3"),S("מאיה פרץ","ט׳3"),S("רון קפלן","ח׳1")],
  "ft.last":{grade:"ח",num:1}};
const go=async(page,m)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(400); };
const startLive=async(page,cid)=>{
  await go(page,"live");
  await page.click('#lv-root [data-cls="'+(cid||"c:ט:3")+'"]');
  await page.waitForTimeout(350);
};
const openTest=async(page,id)=>{
  await page.evaluate(x=>document.querySelector('#ft-tests [data-t="'+x+'"]').click(),id);
  await page.waitForTimeout(500);
};

module.exports={title:"כלי שטח ביד אחת",tests:[

  check("«מדידה» מהשיעור נפתחת על כיתת השיעור — לא על הכיתה האחרונה",seed,async page=>{
    await startLive(page,"c:ט:3");
    await page.click('#lv-root [data-tool="meas"]'); await page.waitForTimeout(500);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,cls:document.getElementById("ft-clsName").textContent}));
    eq(r.mod,"ft"); ok(/ט.?3/.test(r.cls),"הכיתה של השיעור: "+r.cls);
  }),

  check("בלי שיעור — הכיתה האחרונה נשארת כמו שהייתה",seed,async page=>{
    await go(page,"ft");
    ok(/ח.?1/.test(await page.evaluate(()=>document.getElementById("ft-clsName").textContent)));
  }),

  check("השעון בסרגל דביק אחרי הרשימה, ו«קלוט» בגודל אצבע",seed,async page=>{
    await page.setViewportSize({width:390,height:760});
    await go(page,"ft"); await page.evaluate(()=>{ window.FT&&0; });
    await page.evaluate(()=>{ document.querySelector('#ft-grades [data-g="ט"]').click(); });
    await page.waitForTimeout(150);
    await page.evaluate(()=>{ document.querySelector('#ft-nums [data-n="3"]').click(); });
    await page.waitForTimeout(150);
    await openTest(page,"r60");
    const r=await page.evaluate(()=>{
      const tool=document.getElementById("ft-tool"), list=document.getElementById("ft-list");
      const cap=document.querySelector("#ft-list [data-cap]").getBoundingClientRect();
      return {after:!!(list.compareDocumentPosition(tool)&Node.DOCUMENT_POSITION_FOLLOWING),
        pos:getComputedStyle(tool).position,go:!!tool.querySelector("#ft-clkGo"),capH:Math.round(cap.height)};
    });
    eq(r.after,true,"השעון אחרי הרשימה"); eq(r.pos,"sticky"); eq(r.go,true);
    ok(r.capH>=56,"«קלוט» בגובה "+r.capH);
    const box=await page.evaluate(()=>{ const b=document.getElementById("ft-clockBox").getBoundingClientRect();
      return {bottom:Math.round(b.bottom),vh:window.innerHeight}; });
    ok(box.bottom<=box.vh,"השעון גלוי בלי לגלול: bottom="+box.bottom+"/"+box.vh);
  }),

  check("שעון עצור לא קולט זמן קפוא",seed,async page=>{
    await startLive(page,"c:ט:3");
    await go(page,"ft"); await openTest(page,"r60");
    await page.click("#ft-clkGo"); await page.waitForTimeout(250);
    await page.click("#ft-clkStop"); await page.waitForTimeout(150);
    const before=await page.evaluate(()=>window.FT.results().length);
    await page.evaluate(()=>document.querySelector("#ft-list [data-cap]").click());
    await page.waitForTimeout(200);
    eq(await page.evaluate(()=>window.FT.results().length),before,"לא נוספה תוצאה");
  }),

  check("מבחן הזנה: Enter עובר לתלמיד הבא, והשורה נשארת במקומה",seed,async page=>{
    await startLive(page,"c:ט:3");
    await go(page,"ft"); await openTest(page,"ljump");
    const first=await page.evaluate(()=>document.querySelector("#ft-list .ft-row").dataset.n);
    await page.focus("#ft-list [data-val]");
    await page.keyboard.type("182"); await page.keyboard.press("Enter");
    await page.waitForTimeout(350);
    const r=await page.evaluate(()=>({first:document.querySelector("#ft-list .ft-row").dataset.n,
      focus:(document.activeElement&&document.activeElement.dataset.val)||null,
      firstInp:document.querySelector("#ft-list [data-val]").dataset.val,
      last:window.FT.results().slice(-1)[0]}));
    eq(r.first,first,"השורה הראשונה לא זזה");
    ok(r.focus&&r.focus!==r.firstInp,"המיקוד עבר לתלמיד הבא");
    eq(r.last.val,182);
  }),

  check("«חזרה» ממבחן פתוח חוזרת לבחירת המבחן",seed,async page=>{
    await go(page,"stu"); await go(page,"ft"); await openTest(page,"ljump");
    await page.goBack(); await page.waitForTimeout(400);
    const r=await page.evaluate(()=>({mod:document.body.dataset.mod,
      pick:getComputedStyle(document.getElementById("ft-pick")).display!=="none"}));
    eq(r,{mod:"ft",pick:true});
    await page.goBack(); await page.waitForTimeout(400);
    eq(await page.evaluate(()=>document.body.dataset.mod),"stu","וחזרה נוספת עוזבת את המודול");
  }),

  check("ביפ טסט: תקני כברירת מחדל, הגדרות מקופלות, שמות ליד כפתור הנשירה",seed,async page=>{
    await go(page,"beep");
    const r=await page.evaluate(()=>({sp:document.getElementById("bt-spVal").textContent,
      fold:document.getElementById("bt-setupFold").open,
      sum:document.getElementById("bt-setSum").textContent,
      chipsInLive:!!document.querySelector("#bt-statsCard #bt-heatChips"),
      first:document.querySelector("#view-beep > .card, #view-beep > details").id}));
    eq(r.sp,"8.0"); eq(r.fold,false,"ההגדרות מקופלות");
    ok(/20/.test(r.sum)&&/8\.0/.test(r.sum)&&/תקני/.test(r.sum),"סיכום: "+r.sum);
    eq(r.chipsInLive,true); eq(r.first,"bt-statsCard","הכרטיס החי ראשון");
  }),

  check("שבבי שמות בגודל אצבע (תיקון --touch)",seed,async page=>{
    await startLive(page,"c:ט:3");
    await go(page,"beep");
    await page.click("#bt-loadCls"); await page.waitForTimeout(350);
    await page.click("#cp-load"); await page.waitForTimeout(350);
    const h=await page.evaluate(()=>[...document.querySelectorAll("#bt-heatChips .hc")].map(b=>Math.round(b.getBoundingClientRect().height)));
    ok(h.length>=3,"השמות נטענו: "+h.length);
    ok(h.every(x=>x>=44),"גבהים: "+h.join(","));
  }),

  check("סיום שיעור בלי נוכחות: אזהרה, והקשה אחת מסמנת את השאר",seed,async page=>{
    await startLive(page,"c:ט:3");
    await page.click("#lv-end"); await page.waitForTimeout(300);
    let r=await page.evaluate(()=>({hidden:document.getElementById("end-att").hidden,
      cls:document.getElementById("end-att").className,btn:!!document.getElementById("end-attAll")}));
    eq(r,{hidden:false,cls:"end-att warn",btn:true});
    await page.click("#end-attAll"); await page.waitForTimeout(250);
    r=await page.evaluate(()=>({cls:document.getElementById("end-att").className,txt:document.getElementById("end-att").textContent}));
    eq(r.cls,"end-att ok"); ok(/3\/3/.test(r.txt),r.txt);
  }),

  check("לשוניות מבחני הכושר לא מפעילות את מסך הכושר (באג הבורר המשותף)",seed,async page=>{
    await go(page,"fit");
    const before=await page.evaluate(()=>getComputedStyle(document.getElementById("fit-sub-timer")).display);
    await go(page,"ft");
    await page.evaluate(()=>document.querySelector('#ft-tabs [data-ft="idx"]').click());
    await page.waitForTimeout(300);
    const r=await page.evaluate(()=>({timer:getComputedStyle(document.getElementById("fit-sub-timer")).display,
      fitOn:!!document.querySelector('#view-fit .pf-tabs [data-ft="timer"].on'),
      idx:getComputedStyle(document.getElementById("ft-idx")).display}));
    eq(r.timer,before,"לוח הטיימר לא הוסתר"); eq(r.fitOn,true,"והלשונית שלו עדיין מסומנת");
    ok(r.idx!=="none","ומדד הכושר נפתח");
  }),

  check("מדריך המסך במצב שיעור נפתח על «מצב שיעור»",seed,async page=>{
    await go(page,"live");
    await page.click("#btnSettings"); await page.waitForTimeout(300);
    await page.click("#btnInfo"); await page.waitForTimeout(400);
    const r=await page.evaluate(()=>{ const d=[...document.querySelectorAll("#infoModal details")].find(x=>x.open);
      return d?d.dataset.info:null; });
    eq(r,"live");
  })

]};
