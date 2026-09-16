"use strict";
/* ============================================================
   רשימת הכיתה ומאגר התלמידים — מסך אחד, תשובה אחת
   ------------------------------------------------------------
   עד סכמה 5 ניהול רשימת הכיתה לא היה מכוסה בדפדפן בכלל, ובדיוק שם
   ישב הבאג: כפתור «בן/בת» ברשימה כתב ל-ft.roster, כרטיס התלמיד כתב
   ל-stu.list, **והמין קובע נורמה**. אותו תלמיד יכול היה להיות מנוקד
   לפי נורמת בנים במסך אחד ולפי נורמת בנות בשני.

   הבדיקות כאן רצות על הממשק האמיתי — הן פותחות את חלון הרשימה
   ולוחצות בו — כי זה המקום היחיד שבו הבאג הזה היה נראה.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const X="c:ט:3";
const CLS={[X]:{id:X,name:"ט׳3",grade:"ט",num:3,key:"ט3"}};
const seed=extra=>Object.assign({
  "ft.classes":CLS,
  "ft.roster":{[X]:["a","b"]},
  "stu.list":[{id:"a",name:"דן אבירם",cls:"ט׳3",cid:X,sex:null,age:14,h:null,w:null,tests:[]},
              {id:"b",name:"רוני לוי", cls:"ט׳3",cid:X,sex:"girls",age:14,h:null,w:null,tests:[]}],
  "ft.results":[],
  "ft.last":{grade:"ט",num:3,sort:"todo"},"pf.guideSeen":true,
  "schema.version":D.SCHEMA_VERSION
},extra||{});

const stu=page=>page.evaluate(()=>window.HM.LS.get("stu.list",[]));
const rosterRaw=page=>page.evaluate(()=>window.HM.LS.get("ft.roster",{}));
/* כפתור הרשימה חי בשורת הכלים של מסך המדידה, ולכן צריך לפתוח
   מבחן קודם — בדיוק כמו מורה שנכנס למדוד. */
const openRoster=async page=>{
  await page.evaluate(()=>window.HM.go("ft"));
  await page.waitForTimeout(800);
  await page.evaluate(()=>document.querySelector('#ft-tests [data-t="ljump"]').click());
  await page.waitForTimeout(600);
  await page.evaluate(()=>document.getElementById("ft-rosterBtn").click());
  await page.waitForTimeout(500);
};

module.exports={title:"רשימת הכיתה כחברוּת",tests:[

  check("הרשימה מוצגת מהכרטיסים — השם מגיע מ«התלמידים שלי»",seed(),async page=>{
    await openRoster(page);
    const names=await page.evaluate(()=>
      [...document.querySelectorAll("#ft-rosList .ttl")].map(x=>x.textContent.trim()));
    eq(names.length,2,"שני תלמידים ברשימה");
    ok(names[0].indexOf("דן אבירם")>=0,"השם הראשון: "+names[0]);
  }),

  check("«בן/בת» ברשימה נכתב לכרטיס — לא לעותק שני",seed(),async page=>{
    await openRoster(page);
    await page.evaluate(()=>{
      const b=document.querySelector('#ft-rosList [data-sx="boys"]');
      b.click();
    });
    await page.waitForTimeout(400);
    const list=await stu(page);
    eq(list.find(x=>x.id==="a").sex,"boys","המין נשמר על הכרטיס");
    const raw=await rosterRaw(page);
    eq(raw[X],["a","b"],"וברשימה נשארו מזהים בלבד");
  }),

  check("הדבקת שמות יוצרת תלמידים ב«התלמידים שלי», לא רשומות חצי",seed(),async page=>{
    await openRoster(page);
    await page.evaluate(()=>{
      document.getElementById("ft-rosBulk").value="נועה בר\nגיא פרץ";
      document.getElementById("ft-rosPaste").click();
    });
    await page.waitForTimeout(500);
    const list=await stu(page);
    eq(list.length,4,"שני החדשים נכנסו למאגר: "+JSON.stringify(list.map(x=>x.name)));
    const noa=list.find(x=>x.name==="נועה בר");
    ok(noa,"נועה נוצרה");
    eq(noa.cid,X,"עם זהות הכיתה");
    eq(noa.cls,"ט׳3","ועם השם מהרישום");
    ok(Array.isArray(noa.tests),"כרטיס מלא");
    const raw=await rosterRaw(page);
    eq(raw[X].length,4,"וברשימה ארבעה מזהים");
    ok(raw[X].every(x=>typeof x==="string"),"כולם מזהים, לא רשומות");
  }),

  check("אותה הדבקה פעמיים אינה מכפילה אף תלמיד",seed(),async page=>{
    await openRoster(page);
    for(let i=0;i<2;i++){
      await page.evaluate(()=>{
        document.getElementById("ft-rosBulk").value="נועה בר";
        document.getElementById("ft-rosPaste").click();
      });
      await page.waitForTimeout(450);
    }
    const list=await stu(page);
    eq(list.filter(x=>x.name==="נועה בר").length,1,"אחת בלבד");
  }),

  check("הסרה מהרשימה משאירה את הכרטיס ואת המדידות",seed({
    "ft.results":[{id:"r1",d:"2026-09-01",ts:1,cls:"ט׳3",cid:X,test:"ljump",
      name:"רוני לוי",sid:"b",val:170,unit:"ס״מ",gradeKey:"ט",sex:"girls"}]
  }),async page=>{
    await openRoster(page);
    await page.evaluate(()=>{
      const bs=[...document.querySelectorAll("#ft-rosList [data-rd]")];
      bs[bs.length-1].click();
    });
    await page.waitForTimeout(400);
    const raw=await rosterRaw(page);
    eq(raw[X],["a"],"ירד מהרשימה");
    const list=await stu(page);
    eq(list.length,2,"הכרטיס נשאר");
    const res=await page.evaluate(()=>window.HM.LS.get("ft.results",[]));
    eq(res.length,1,"והמדידה נשארה מקושרת");
  }),

  check("מחיקת כרטיס מ«התלמידים שלי» מסירה אותו גם מרשימת הכיתה",seed(),async page=>{
    /* בלי זה נשאר ברשימה מזהה בלי תלמיד — שורה שנעלמת מהמסך
       ונשארת בקובץ. המחיקה עוברת דרך הממשק האמיתי, כולל האישור. */
    await page.evaluate(()=>window.HM.go("stu"));
    await page.waitForTimeout(800);
    await page.evaluate(()=>{
      const row=[...document.querySelectorAll("#stu-list .arc-item, #stu-list .stu-item, #stu-list [data-id]")]
        .find(x=>x.textContent.indexOf("דן אבירם")>=0);
      (row.querySelector("[data-id]")||row).click();
    });
    await page.waitForTimeout(600);
    await page.evaluate(()=>document.getElementById("stu-fDel").click());
    await page.waitForTimeout(600);
    const list=await stu(page);
    eq(list.map(x=>x.id),["b"],"הכרטיס נמחק");
    const raw=await rosterRaw(page);
    eq(raw[X],["b"],"והמזהה ירד מהרשימה");
  }),

  check("רשימה בצורה הישנה עדיין נקראת — כיתה לא הופכת ריקה",seed({
    "ft.roster":{"ט3":[{id:"a",name:"דן אבירם",sex:"boys"},{id:"z",name:"תלמיד ישן"}]}
  }),async page=>{
    await openRoster(page);
    const names=await page.evaluate(()=>
      [...document.querySelectorAll("#ft-rosList .ttl")].map(x=>x.textContent.trim()));
    eq(names.length,2,"שני תלמידים, גם זה שאין לו כרטיס: "+JSON.stringify(names));
  })

]};
