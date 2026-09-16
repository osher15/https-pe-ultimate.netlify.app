"use strict";
/* ============================================================
   קבוצת הוראה במבחני כושר
   ------------------------------------------------------------
   מסך הכיתה כבר היה מודע לקבוצה (groups.e2e.js), אבל מבחני הכושר
   עצמם עוד עבדו רק על כיתה בודדת: st.grade+st.num בלבד, בלי מושג
   על קבוצה. הבדיקות כאן שומרות על שני דברים שהם בדיוק ההבטחה של
   התכונה: (1) המורה יכול לפתוח קבוצה ולמדוד את כולה כמקשה אחת,
   (2) המדידה עצמה תמיד "נופלת" חזרה על הכיתה והשכבה האמיתיות של
   התלמיד — קבוצה היא הקשר הוראה, לא כיתה חדשה שממציאה זהות משלה.
   ============================================================ */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const CLS={
  "c:ז:1":{id:"c:ז:1",name:"ז׳1",grade:"ז",num:1,key:"ז1"},
  "c:ח:1":{id:"c:ח:1",name:"ח׳1",grade:"ח",num:1,key:"ח1"}
};
const STU=[
  {id:"a",name:"דן אבירם",cls:"ז׳1",cid:"c:ז:1",sex:"boys"},
  {id:"b",name:"עדי כהן",cls:"ח׳1",cid:"c:ח:1",sex:"girls"}
];
const ROSTER={"ז1":[{id:"a",name:"דן אבירם",sex:"boys"}],
              "ח1":[{id:"b",name:"עדי כהן",sex:"girls"}]};

/* בונים את רשומת הקבוצה מראש, באותה דרך שהמסך היה בונה אותה,
   כדי שהזרעת הבדיקה תתחיל ממורה שכבר יש לו קבוצה מוגדרת. */
const memStore=(()=>{
  const data={"ft.classes":Object.assign({},CLS)};
  return {get:(k,d)=>(data[k]!==undefined?data[k]:d),set:(k,v)=>{data[k]=v;}};
})();
const GROUP=D.makeGroup(memStore,{name:"ז׳1 + ח׳1",members:["c:ז:1","c:ח:1"]}).group;
const CLS2=Object.assign({},CLS,{[GROUP.id]:GROUP});

const base={"ft.classes":CLS2,"stu.list":STU,"ft.roster":ROSTER,"pf.guideSeen":true,
  "schema.version":D.SCHEMA_VERSION};

const go=async(page,m,ms)=>{ await page.evaluate(x=>window.HM.go(x),m); await page.waitForTimeout(ms||600); };
const pickState=page=>page.evaluate(()=>({
  groupsHidden:document.getElementById("ft-groupsWrap")?document.getElementById("ft-groupsWrap").hidden:null,
  groupBtns:[...document.querySelectorAll("#ft-groups [data-gid]")].map(b=>({gid:b.dataset.gid,on:b.classList.contains("on")})),
  clsName:document.getElementById("ft-clsName").textContent,
  clsInfo:document.getElementById("ft-clsInfo").textContent,
  renameHidden:document.getElementById("ft-clsRename")?document.getElementById("ft-clsRename").hidden:null
}));
const clickGroup=async(page,gid)=>{
  await page.evaluate(g=>document.querySelector('#ft-groups [data-gid="'+g+'"]').click(),gid);
  await page.waitForTimeout(300);
};

module.exports={title:"קבוצת הוראה במבחני כושר",tests:[

  check("בלי קבוצות — שורת הבורר מוסתרת לגמרי",
    {"ft.classes":CLS,"stu.list":STU,"ft.roster":ROSTER,"pf.guideSeen":true,
     "schema.version":D.SCHEMA_VERSION},
    async page=>{
      await go(page,"ft");
      const st=await pickState(page);
      eq(st.groupsHidden,true,"אין קבוצות — אין מה להציע");
    }),

  check("יש קבוצה — הבורר מוצג עם «כיתה רגילה» ושם הקבוצה",base,async page=>{
    await go(page,"ft");
    const st=await pickState(page);
    eq(st.groupsHidden,false);
    const names=st.groupBtns.map(b=>b.gid);
    ok(names.includes(""),"אפשרות «כיתה רגילה»: "+JSON.stringify(names));
    ok(names.includes(GROUP.id),"והקבוצה עצמה: "+JSON.stringify(names));
    ok(st.groupBtns.find(b=>b.gid==="").on,"כברירת מחדל נבחרת «כיתה רגילה»");
  }),

  check("בחירת הקבוצה מציגה את שמה ואת הרשימה המאוחדת",base,async page=>{
    await go(page,"ft");
    await clickGroup(page,GROUP.id);
    const st=await pickState(page);
    eq(st.clsName,"ז׳1 + ח׳1","השם המוצג הוא שם הקבוצה, לא ז׳1");
    ok(/2 תלמידים/.test(st.clsInfo),"שני התלמידים משתי הכיתות מאוחדים: "+st.clsInfo);
  }),

  check("בזמן שקבוצה פעילה, כפתור שינוי שם הכיתה מוסתר",base,async page=>{
    await go(page,"ft");
    await clickGroup(page,GROUP.id);
    const st=await pickState(page);
    eq(st.renameHidden,true,"שינוי שם קבוצה עובר דרך עורך הקבוצות, לא כאן");
  }),

  check("בחירת שכבה מבטלת את הקבוצה הפעילה — בררים סותרים",base,async page=>{
    await go(page,"ft");
    await clickGroup(page,GROUP.id);
    eq((await pickState(page)).clsName,"ז׳1 + ח׳1");
    await page.evaluate(()=>document.querySelector('#ft-grades [data-g="ז"]').click());
    await page.waitForTimeout(300);
    const st=await pickState(page);
    ok(st.groupBtns.find(b=>b.gid==="").on,"חוזר ל«כיתה רגילה»");
    eq(st.clsName,"ז׳1","ושוב על כיתה בודדת");
  }),

  check("מדידה שנרשמת בזמן שקבוצה פעילה משויכת לכיתה ולשכבה האמיתיות של התלמיד",
    base,async page=>{
      await go(page,"ft");
      await clickGroup(page,GROUP.id);
      /* עדי כהן היא מכיתה ח׳, לא ז׳ — זה בדיוק המקרה שבודק שהניקוד
         לא נצמד בטעות לשכבה של הכיתה הראשונה בקבוצה. */
      await page.evaluate(()=>document.querySelector('[data-t="ljump"]').click());
      await page.waitForTimeout(400);
      await page.evaluate(()=>{
        const inp=document.querySelector('#ft-list [data-val="id:b"]');
        inp.value="180";
        inp.dispatchEvent(new Event("change"));
      });
      await page.waitForTimeout(300);
      const rows=await page.evaluate(()=>window.HM.LS.get("ft.results",[]));
      eq(rows.length,1,"נשמרה מדידה אחת");
      const r=rows[0];
      eq(r.sid,"b","על עדי כהן");
      eq(r.cid,"c:ח:1","המדידה שייכת לכיתה האמיתית שלה, לא לקבוצה");
      eq(r.gradeKey,"ח","והשכבה היא השכבה האמיתית שלה — לא שכבת הקבוצה");
    }),

  check("אות החינוך הגופני על קבוצה משולבת שכבות אינו מתריע לשווא",base,async page=>{
    await go(page,"ft");
    await clickGroup(page,GROUP.id);
    await page.evaluate(()=>{ window.HM.$$("#ft-tabs button").find(b=>b.dataset.ft==="ot").click(); });
    await page.waitForTimeout(350);
    const warn=await page.evaluate(()=>!!document.querySelector("#ft-ot .bw-warn"));
    eq(warn,false,"אין דרך לתלות זכאות בשכבה אחת כשיש כמה שכבות בקבוצה");
  }),

  check("הבחירה נשמרת ומשוחזרת — פתיחה חוזרת של המסך נשארת על הקבוצה",base,async page=>{
    await go(page,"ft");
    await clickGroup(page,GROUP.id);
    await go(page,"home",200);
    await go(page,"ft");
    const st=await pickState(page);
    eq(st.clsName,"ז׳1 + ח׳1","עדיין על הקבוצה, בלי לבחור מחדש");
  })

]};
