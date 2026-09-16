"use strict";
/* ============================================================
   רשימת הכיתה כחברוּת — מאגר תלמידים אחד
   ------------------------------------------------------------
   הבאג שהבדיקות כאן סוגרות אינו תיאורטי: המין של התלמיד ישב גם
   ב-ft.roster (כפתור «בן/בת» ברשימת הכיתה) וגם ב-stu.list (כרטיס
   התלמיד), **והמין קובע נורמה**. מורה שעדכן צד אחד קיבל את אותו
   תלמיד מנוקד לפי נורמת בנים במסך אחד ולפי נורמת בנות בשני, בלי
   שום סימן שיש כאן סתירה.

   הקו שנשמר כאן: ל-stu.list יש את השדות, ל-ft.roster יש את
   החברוּת, ואף שדה לא חי בשניהם.
   ============================================================ */
const test=require("node:test");
const assert=require("node:assert");
const D=require("../../hm-data.js");

const REG={
  "c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"},
  "c:י:1":{id:"c:י:1",name:"י׳1",grade:"י",num:1,key:"י1"}
};
/* חנות בדיקה: אותה צורה שהאפליקציה מעבירה ל-hm-data */
const store=seed=>{
  const m=Object.assign({"ft.classes":JSON.parse(JSON.stringify(REG))},seed||{});
  return {get:(k,d)=>(k in m?m[k]:(d===undefined?null:d)),set:(k,v)=>{m[k]=v;},raw:m};
};

/* ---------- קריאה ---------- */

test("רשימה בצורה החדשה נפתרת לתלמידים מ«התלמידים שלי»",()=>{
  const s=store({
    "ft.roster":{"c:ט:3":["a","b"]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3",sex:"boys"},
                {id:"b",name:"רוני",cid:"c:ט:3",sex:"girls"},
                {id:"z",name:"עדי",cid:"c:י:1"}]
  });
  const list=D.rosterOf(s,"c:ט:3");
  assert.equal(list.length,2);
  assert.deepEqual(list.map(x=>x.name),["דן","רוני"]);
  assert.equal(list[1].sex,"girls","המין מגיע מהכרטיס, לא מהרשימה");
});

test("הסדר ברשימה נשמר — הוא מה שהמורה סידר",()=>{
  const s=store({
    "ft.roster":{"c:ט:3":["b","a"]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"},{id:"b",name:"רוני",cid:"c:ט:3"}]
  });
  assert.deepEqual(D.rosterOf(s,"c:ט:3").map(x=>x.name),["רוני","דן"]);
});

test("מזהה בלי כרטיס יורד מהרשימה — תלמיד שנמחק אינו חצי קיים",()=>{
  const s=store({
    "ft.roster":{"c:ט:3":["a","gone"]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"}]
  });
  assert.deepEqual(D.rosterOf(s,"c:ט:3").map(x=>x.id),["a"]);
});

test("צורה ישנה עדיין נקראת — גיבוי שנפתח לפני ההסבה אינו כיתה ריקה",()=>{
  const s=store({"ft.roster":{"ט3":[{id:"a",name:"דן",sex:"boys"}]},"stu.list":[]});
  const list=D.rosterOf(s,"c:ט:3");
  assert.equal(list.length,1);
  assert.equal(list[0].name,"דן");
});

test("מפתח ישן שנפתר לאותה כיתה נמצא גם דרך ה-cid",()=>{
  const s=store({"ft.roster":{"ט3":["a"]},"stu.list":[{id:"a",name:"דן",cid:"c:ט:3"}]});
  assert.equal(D.rosterKeyOf(s,"c:ט:3"),"ט3");
  assert.deepEqual(D.rosterIds(s,"c:ט:3"),["a"]);
});

test("כיתה בלי רשימה מחזירה ריק, לא שגיאה",()=>{
  const s=store({"ft.roster":{"c:ט:3":["a"]},"stu.list":[{id:"a",name:"דן"}]});
  assert.deepEqual(D.rosterOf(s,"c:י:1"),[]);
  assert.deepEqual(D.rosterOf(s,null),[]);
});

/* ---------- כתיבה ---------- */

test("שינוי מין ברשימה נכתב לכרטיס — תשובה אחת, לא שתיים",()=>{
  const s=store({
    "ft.roster":{"c:ט:3":["a"]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3",sex:null}]
  });
  const list=D.rosterOf(s,"c:ט:3");
  list[0].sex="girls";
  D.setRosterOf(s,"c:ט:3",list);
  assert.equal(s.raw["stu.list"][0].sex,"girls");
  assert.deepEqual(s.raw["ft.roster"]["c:ט:3"],["a"],"ברשימה נשארת חברוּת בלבד");
});

test("תלמיד חדש שנוסף לרשימה נוצר ב«התלמידים שלי» עם הכיתה שלו",()=>{
  const s=store({"ft.roster":{},"stu.list":[]});
  const r=D.setRosterOf(s,"c:ט:3",[{id:"n1",name:"נועה"}]);
  assert.equal(r.added,1);
  const rec=s.raw["stu.list"][0];
  assert.equal(rec.id,"n1");
  assert.equal(rec.cid,"c:ט:3");
  assert.equal(rec.cls,"ט׳3","השם מהרישום");
  assert.deepEqual(rec.tests,[],"כרטיס מלא, לא חצי רשומה");
});

test("אותה הדבקה פעמיים אינה יוצרת שני אנשים",()=>{
  const s=store({"ft.roster":{},"stu.list":[]});
  D.setRosterOf(s,"c:ט:3",[{name:"נועה"}]);
  const first=s.raw["stu.list"][0].id;
  const cur=D.rosterOf(s,"c:ט:3");
  D.setRosterOf(s,"c:ט:3",cur.concat([{name:"נועה"}]));
  assert.equal(s.raw["stu.list"].length,1);
  assert.deepEqual(s.raw["ft.roster"]["c:ט:3"],[first]);
});

test("הסרה מהרשימה אינה מוחקת את הכרטיס",()=>{
  const s=store({
    "ft.roster":{"c:ט:3":["a","b"]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"},{id:"b",name:"רוני",cid:"c:ט:3"}]
  });
  D.setRosterOf(s,"c:ט:3",D.rosterOf(s,"c:ט:3").filter(x=>x.id!=="b"));
  assert.deepEqual(s.raw["ft.roster"]["c:ט:3"],["a"]);
  assert.equal(s.raw["stu.list"].length,2,"הכרטיס והמדידות נשארים");
});

test("כתיבה מחליפה מפתח ישן ולא משאירה שתי רשימות לאותה כיתה",()=>{
  const s=store({"ft.roster":{"ט3":[{id:"a",name:"דן"}]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"}]});
  D.setRosterOf(s,"c:ט:3",[{id:"a",name:"דן"}]);
  assert.deepEqual(Object.keys(s.raw["ft.roster"]),["c:ט:3"]);
});

test("מחיקת תלמיד מסירה אותו מכל הרשימות",()=>{
  const s=store({"ft.roster":{"c:ט:3":["a","b"],"c:י:1":["a"]}});
  assert.equal(D.removeFromRosters(s,"a"),2);
  assert.deepEqual(s.raw["ft.roster"]["c:ט:3"],["b"]);
  assert.deepEqual(s.raw["ft.roster"]["c:י:1"],[]);
});

/* ---------- ההסבה 4 → 5 ---------- */

const migStore=seed=>{
  const m=Object.assign({"schema.version":4,
    "ft.classes":JSON.parse(JSON.stringify(REG))},seed||{});
  return {get:(k,d)=>(k in m?m[k]:(d===undefined?null:d)),set:(k,v)=>{m[k]=v;},raw:m};
};

test("ההסבה הופכת רשומות מלאות לחברוּת, תחת מפתח שהוא cid",()=>{
  const s=migStore({
    "ft.roster":{"ט3":[{id:"a",name:"דן",sex:"boys"},{id:"b",name:"רוני"}]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"}]
  });
  const rep=D.migrate(s);
  assert.ok(rep.ok);
  assert.deepEqual(s.raw["ft.roster"],{"c:ט:3":["a","b"]});
  assert.equal(s.raw["stu.list"].length,2,"תלמיד שהיה רק ברשימה קיבל כרטיס");
  assert.equal(s.raw["stu.list"].find(x=>x.id==="a").sex,"boys","המין עבר לכרטיס");
  assert.equal(s.raw["stu.list"].find(x=>x.id==="b").cid,"c:ט:3");
});

test("סתירת מין — הכרטיס מנצח, והמספר נרשם בדוח",()=>{
  const s=migStore({
    "ft.roster":{"ט3":[{id:"a",name:"דן",sex:"boys"}]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3",sex:"girls"}]
  });
  const rep=D.migrate(s);
  assert.equal(s.raw["stu.list"][0].sex,"girls");
  assert.equal(rep.rosterSexConflict,1,"סתירה לא נעלמת בשקט");
});

test("שתי כיתות באותו שם — המפתח נשאר כמו שהוא, לא מנחשים",()=>{
  const reg=JSON.parse(JSON.stringify(REG));
  reg["cn:ט3בנים"]={id:"cn:ט3בנים",name:"ט׳3",grade:null,num:null,key:"ט3"};
  const m={"schema.version":4,"ft.classes":reg,
    "ft.roster":{"ט3":[{id:"a",name:"דן"}]},"stu.list":[]};
  const s={get:(k,d)=>(k in m?m[k]:(d===undefined?null:d)),set:(k,v)=>{m[k]=v;},raw:m};
  const rep=D.migrate(s);
  assert.ok(rep.ok);
  assert.ok(Array.isArray(m["ft.roster"]["ט3"]));
  assert.equal(rep.rosterKept,1);
  assert.equal(D.rosterOf(s,"c:ט:3").length,1,"והקריאה המגוננת עדיין מוצאת אותה");
});

test("שני תלמידים באותו שם עם שני מזהים נשארים שניים",()=>{
  /* ההסבה הקודמת הפרידה אותם במכוון לשני מזהים. התאמה לפי שם כאן
     הייתה מאחדת אותם בחזרה — ומוחקת אחד מהם מהרשימה. */
  const s=migStore({
    "ft.roster":{"ט3":[{id:"k1",name:"דן כהן"},{id:"k2",name:"דן כהן"}]},
    "stu.list":[]
  });
  D.migrate(s);
  assert.deepEqual(s.raw["ft.roster"]["c:ט:3"],["k1","k2"]);
  assert.equal(s.raw["stu.list"].length,2);
});

test("הרצה חוזרת אינה משנה דבר",()=>{
  const s=migStore({
    "ft.roster":{"ט3":[{id:"a",name:"דן"}]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"}]
  });
  D.migrate(s);
  const after=JSON.stringify(s.raw["ft.roster"]);
  const stu=JSON.stringify(s.raw["stu.list"]);
  D.migrate(s);
  assert.equal(JSON.stringify(s.raw["ft.roster"]),after);
  assert.equal(JSON.stringify(s.raw["stu.list"]),stu);
});

test("תווית ו-cid לאותה כיתה מתמזגות לרשימה אחת",()=>{
  const s=migStore({
    "ft.roster":{"c:ט:3":["a"],"ט3":[{id:"b",name:"רוני"}]},
    "stu.list":[{id:"a",name:"דן",cid:"c:ט:3"}]
  });
  D.migrate(s);
  assert.deepEqual(Object.keys(s.raw["ft.roster"]),["c:ט:3"]);
  assert.deepEqual(s.raw["ft.roster"]["c:ט:3"],["a","b"]);
});

test("התקנה חדשה מסומנת בגרסה הנוכחית ואינה עוברת הסבה",()=>{
  const m={};
  const s={get:(k,d)=>(k in m?m[k]:(d===undefined?null:d)),set:(k,v)=>{m[k]=v;},raw:m};
  const rep=D.migrate(s);
  assert.equal(rep.from,D.SCHEMA_VERSION);
  assert.equal(rep.applied.length,0);
});
