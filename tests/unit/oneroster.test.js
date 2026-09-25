"use strict";
/* רשימה אחת (סכמה 5): «התלמידים שלי» הוא המקור היחיד, ורשימת הכיתה
   במבחני הכושר היא מבט עליו. הבדיקות כאן שומרות על שלושה דברים:
   אף תלמיד לא אובד בקיפול, אף מדידה לא מתנתקת מהתלמיד שלה, ועריכה
   ברשימת הכיתה נוגעת רק במה שנערך. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");
const {memStore}=require("../helpers/memstore.js");

const REG={"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"},
           "c:י:1":{id:"c:י:1",name:"י׳1",grade:"י",num:1,key:"י1"}};

test("המבט: תלמידי הכיתה בלבד, לפי סדר ההוספה, כעותקים",()=>{
  const s=memStore({"ft.classes":REG});
  const stu=[{id:"a",name:"דן",cid:"c:ט:3",sex:"boys",age:15,grades:{x:1}},
             {id:"b",name:"רון",cid:"c:י:1"},
             {id:"c",name:"נועה",cls:"ט׳3",sex:"girls"}];
  const r=D.classRoster(s,stu,"c:ט:3");
  assert.deepEqual(r,[{id:"a",name:"דן",sex:"boys"},{id:"c",name:"נועה",sex:"girls"}]);
  r[0].name="שונה"; assert.equal(stu[0].name,"דן","שינוי בעותק לא נוגע במקור");
  assert.deepEqual(D.classRoster(s,stu,null),[]);
});

test("כתיבה חזרה: שם ומין מתעדכנים, שאר השדות נשמרים",()=>{
  const s=memStore({"ft.classes":REG});
  const stu=[{id:"a",name:"דן",cid:"c:ט:3",sex:"boys",age:15,grades:{q1:{exams:{x:90}}},tests:[1]}];
  const l=D.classRoster(s,stu,"c:ט:3"); l[0].name="דן כהן"; l[0].sex="girls";
  const r=D.applyRoster(s,stu,"c:ט:3","ט׳3",l);
  assert.equal(r.changed,2);
  assert.deepEqual(r.list[0],{id:"a",name:"דן כהן",cid:"c:ט:3",sex:"girls",age:15,grades:{q1:{exams:{x:90}}},tests:[1]});
});

test("כתיבה חזרה: תלמיד חדש נכנס עם הכיתה, והסרה נוגעת רק בכיתה הזאת",()=>{
  const s=memStore({"ft.classes":REG});
  const stu=[{id:"a",name:"דן",cid:"c:ט:3"},{id:"b",name:"רון",cid:"c:י:1"},{id:"z",name:"בלי כיתה",cid:null}];
  const l=D.classRoster(s,stu,"c:ט:3").filter(x=>x.id!=="a");
  l.push({id:"n1",name:"מיה"});
  const r=D.applyRoster(s,stu,"c:ט:3","ט׳3",l);
  assert.equal(r.added,1); assert.equal(r.removed,1);
  assert.deepEqual(r.list.map(x=>x.id),["b","z","n1"]);
  const n=r.list.find(x=>x.id==="n1");
  assert.equal(n.cid,"c:ט:3"); assert.equal(n.cls,"ט׳3"); assert.equal(n.sex,null,"מין לא מנוחש");
});

test("כתיבה חזרה: רשומה בלי מזהה נצמדת לתלמיד באותו שם ולא יוצרת כפיל",()=>{
  const s=memStore({"ft.classes":REG});
  const stu=[{id:"a",name:"דן",cid:"c:ט:3"}];
  const r=D.applyRoster(s,stu,"c:ט:3","ט׳3",[{name:"דן",sex:"boys"}]);
  assert.equal(r.list.length,1); assert.equal(r.list[0].sex,"boys"); assert.equal(r.added,0);
});

test("4→5: רשימות הכיתה מתקפלות ל«התלמידים שלי» — כולם, פעם אחת",()=>{
  const s=memStore({"schema.version":4,"ft.classes":REG,
    "ft.roster":{"ט3":[{id:"a",name:"דן",sex:"boys"},{id:"f9",name:"מיה",sex:"girls"}],"י1":[{id:"b",name:"רון"}]},
    "stu.list":[{id:"a",name:"דן",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:15,tests:[]}]});
  const rep=D.migrate(s);
  assert.equal(rep.ok,true,rep.error||"");
  assert.deepEqual(rep.applied,["single-roster"]);
  assert.equal(s.get("schema.version"),5);
  const stu=s.get("stu.list");
  assert.deepEqual(stu.map(x=>x.id).sort(),["a","b","f9"]);
  assert.equal(stu.find(x=>x.id==="f9").cid,"c:ט:3");
  assert.equal(s.get("ft.roster"),null,"הרשימה הישנה לא נקראת יותר");
  assert.deepEqual(Object.keys(s.get("ft.roster.v4")),["ט3","י1"],"ונשמרה כארכיון");
  assert.equal(rep.rosterAdded,2); assert.equal(rep.rosterUnplaced,0);
  const again=D.migrate(s);
  assert.equal(again.noop,true,"ריצה שנייה לא עושה כלום");
});

test("4→5: מזהה שונה בשתי הרשימות — «התלמידים שלי» נשאר, והמדידות עוברות אליו",()=>{
  const s=memStore({"schema.version":4,"ft.classes":REG,
    "ft.roster":{"ט3":[{id:"f1",name:"דן",sex:"boys"}]},
    "stu.list":[{id:"s1",name:"דן",cls:"ט׳3",cid:"c:ט:3",sex:"boys",tests:[]}],
    "ft.results":[{id:"r1",cid:"c:ט:3",cls:"ט3",test:"push",name:"דן",sid:"f1",val:20},
                  {id:"r2",cid:"c:ט:3",cls:"ט3",test:"push",name:"אחר",sid:"x",val:10}]});
  const rep=D.migrate(s);
  assert.equal(s.get("stu.list").length,1,"בלי כפיל");
  assert.deepEqual(s.get("ft.results").map(r=>r.sid),["s1","x"]);
  assert.equal(rep.resRekeyed,1);
  assert.equal(s.get("ft.results").length,2,"אף מדידה לא נמחקה");
});

test("4→5: המין שסומן ברשימת הכיתה גובר על ברירת המחדל",()=>{
  const s=memStore({"schema.version":4,"ft.classes":REG,
    "ft.roster":{"ט3":[{id:"a",name:"נועה",sex:"girls"},{id:"b",name:"טל"}]},
    "stu.list":[{id:"a",name:"נועה",cid:"c:ט:3",sex:"boys"},{id:"b",name:"טל",cid:"c:ט:3",sex:"boys"}]});
  D.migrate(s);
  const st=s.get("stu.list");
  assert.equal(st.find(x=>x.id==="a").sex,"girls");
  assert.equal(st.find(x=>x.id==="b").sex,"boys","בלי סימון ברשימה — לא נוגעים");
});

test("4→5: רשימה של שתי כיתות באותו שם לא משויכת בניחוש — נשמרת בצד",()=>{
  const reg={"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"},
             "c:ט:9":{id:"c:ט:9",name:"ט׳3",grade:"ט",num:9,key:"ט3"}};
  const s=memStore({"schema.version":4,"ft.classes":reg,"ft.roster":{"ט3":[{id:"q",name:"דן"}]},"stu.list":[]});
  const rep=D.migrate(s);
  assert.equal(rep.rosterUnplaced,1);
  assert.deepEqual(s.get("ft.rosterUnplaced"),{"ט3":[{id:"q",name:"דן"}]});
  assert.equal(s.get("stu.list").length,0);
});

test("גיבוי ישן ששוחזר מעל גרסה 5 (ft.roster קיים) מתקפל שוב",()=>{
  const s=memStore({"schema.version":5,"ft.classes":REG,"ft.roster":{"ט3":[{id:"a",name:"דן"}]},"stu.list":[]});
  const rep=D.migrate(s);
  assert.deepEqual(rep.applied,["single-roster"]);
  assert.equal(s.get("stu.list")[0].id,"a");
});

test("4→5: שני תלמידים באותו שם ברשימה נשארים שניים, גם כש«התלמידים שלי» מכיר רק אחד",()=>{
  const s=memStore({"schema.version":4,"ft.classes":REG,
    "ft.roster":{"ט3":[{id:"a",name:"דן כהן"},{id:"a2",name:"דן כהן"}]},
    "stu.list":[{id:"a",name:"דן כהן",cid:"c:ט:3"}],
    "ft.results":[{id:"r",cid:"c:ט:3",test:"push",name:"דן כהן",sid:"a2",val:5}]});
  const rep=D.migrate(s);
  assert.deepEqual(s.get("stu.list").map(x=>x.id),["a","a2"]);
  assert.equal(s.get("ft.results")[0].sid,"a2","המדידה נשארת של השני");
  assert.equal(rep.resRekeyed,0);
});
