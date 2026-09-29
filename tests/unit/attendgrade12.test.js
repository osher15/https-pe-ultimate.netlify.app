"use strict";
/* שלב 12 — «מילוי לפי נוכחות».
   attendanceRateOf(): Math.round((p+h*0.5)/(p+h+a)*100) — פטור (e) לא
   נספר לא במונה ולא במכנה. אין נתון → null, לא 0; רק פטור → pct null,
   כדי שהמסך לא ימציא ציון. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const D=require("../../hm-data.js");
const {memStore}=require("../helpers/memstore.js");

const X="c:ח:1", Y="c:ח:2";
const store=()=>memStore({"ft.classes":{[X]:{id:X,name:"ח׳1",grade:"ח",num:1,key:"ח1"}}});

test("1. נוכחות מלאה — 100%",()=>{
  const att={"2026-09-01|ח1":{a:"p"},"2026-09-08|ח1":{a:"p"}};
  assert.deepEqual(D.attendanceRateOf(att,{id:"a"},store(),{cid:X}),{days:2,p:2,h:0,a:0,e:0,pct:100});
});

test("2. היעדרות מלאה — 0%, לא null",()=>{
  const att={"2026-09-01|ח1":{a:"a"},"2026-09-08|ח1":{a:"a"}};
  assert.deepEqual(D.attendanceRateOf(att,{id:"a"},store(),{cid:X}),{days:2,p:0,h:0,a:2,e:0,pct:0});
});

test("3. נוכחות חלקית: h שוקל חצי",()=>{
  const att={"2026-09-01|ח1":{a:"h"},"2026-09-08|ח1":{a:"h"}};
  assert.deepEqual(D.attendanceRateOf(att,{id:"a"},store(),{cid:X}),{days:2,p:0,h:2,a:0,e:0,pct:50});
});

test("4. שילוב p/h/e/a: פטור יוצא מהמונה ומהמכנה — אינו היעדרות",()=>{
  const att={"2026-09-01|ח1":{a:"p"},"2026-09-08|ח1":{a:"h"},"2026-09-15|ח1":{a:"e"},"2026-09-22|ח1":{a:"a"}};
  const r=D.attendanceRateOf(att,{id:"a"},store(),{cid:X});
  assert.deepEqual(r,{days:3,p:1,h:1,a:1,e:1,pct:Math.round((1+0.5)/3*100)});
  assert.equal(r.pct,50);
});

test("4א. פטור בלבד — אין שיעור כשיר: pct null (לא 0), והפטור נספר לדיווח",()=>{
  const att={"2026-09-29|ח1":{a:"e"},"2026-09-22|ח1":{a:"e"}};
  const r=D.attendanceRateOf(att,{id:"a"},store(),{cid:X});
  assert.deepEqual(r,{days:0,p:0,h:0,a:0,e:2,pct:null});
});

test("4ב. פטור + מלאה: 100%, לא 50%",()=>{
  const att={"2026-09-01|ח1":{a:"p"},"2026-09-08|ח1":{a:"e"}};
  assert.equal(D.attendanceRateOf(att,{id:"a"},store(),{cid:X}).pct,100);
});

test("4ג. פטור + נעדר: 0% (ההיעדרות היא שקובעת, לא הפטור)",()=>{
  const att={"2026-09-01|ח1":{a:"a"},"2026-09-08|ח1":{a:"e"}};
  const r=D.attendanceRateOf(att,{id:"a"},store(),{cid:X});
  assert.deepEqual([r.days,r.pct],[1,0]);
});

test("4ד. פטור + חלקית: 50%",()=>{
  const att={"2026-09-01|ח1":{a:"h"},"2026-09-08|ח1":{a:"e"},"2026-09-15|ח1":{a:"e"}};
  assert.equal(D.attendanceRateOf(att,{id:"a"},store(),{cid:X}).pct,50);
});

test("4ה. תרחיש הבדיקה החיצונית (ט׳3, 29.9): מלאה/חלקית/נעדר/פטור",()=>{
  const s=memStore({"ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}}});
  const att={"2026-09-29|ט׳3":{dan:"p",itai:"h",ron:"a",omer:"e"}};
  const pct=id=>{ const r=D.attendanceRateOf(att,{id},s,{cid:"c:ט:3"}); return r&&r.pct; };
  assert.deepEqual([pct("dan"),pct("itai"),pct("ron"),pct("omer")],[100,50,0,null]);
});

test("5. דטרמיניסטית: שתי קריאות זהות נותנות אותה תוצאה",()=>{
  const att={"2026-09-01|ח1":{a:"p"},"2026-09-08|ח1":{a:"a"}};
  const a=D.attendanceRateOf(att,{id:"a"},store(),{cid:X});
  const b=D.attendanceRateOf(att,{id:"a"},store(),{cid:X});
  assert.deepEqual(a,b);
});

test("6. בידוד לפי כיתה: נוכחות מכיתה אחרת לא מדליפה",()=>{
  /* אותו תלמיד ('a') מסומן גם בח1 וגם בח2 — הצמצום לפי cid חייב
     לספור רק את הרשומות של הכיתה המבוקשת, לא לערבב בין השתיים. */
  const att={"2026-09-01|ח1":{a:"p"},"2026-09-08|ח1":{a:"p"},
             "2026-09-01|ח2":{a:"a"},"2026-09-08|ח2":{a:"a"}};
  assert.deepEqual(D.attendanceRateOf(att,{id:"a"},store(),{cid:X}),{days:2,p:2,h:0,a:0,e:0,pct:100},"רק ח1");
  assert.deepEqual(D.attendanceRateOf(att,{id:"a"},store(),{cid:Y}),{days:2,p:0,h:0,a:2,e:0,pct:0},"רק ח2 — לא מוזג עם ח1");
  /* תלמיד שמעולם לא סומן בכיתה השנייה — null, לא ממוצע/דליפה */
  assert.equal(D.attendanceRateOf(att,{id:"z"},store(),{cid:Y}),null);
});

test("7. אין נתוני נוכחות — null, לא אפס מומצא",()=>{
  assert.equal(D.attendanceRateOf({},{id:"a"},store(),{cid:X}),null);
  assert.equal(D.attendanceRateOf({"2026-09-01|ח1":{b:"p"}},{id:"a"},store(),{cid:X}),null,"רשומה קיימת אבל לא לתלמיד הזה");
  assert.equal(D.attendanceRateOf(null,{id:"a"},store(),{cid:X}),null);
});

test("8. שינוי שם כיתה: אותו cid, אותם רישומי נוכחות (לפי תווית ישנה) — אותו אחוז בדיוק",()=>{
  const att={"2026-09-01|ח1":{a:"p"},"2026-09-08|ח1":{a:"h"}};
  const s=store();
  const before=D.attendanceRateOf(att,{id:"a"},s,{cid:X});
  const r=D.renameClass(s,X,"ח׳1 מצטיינים");
  assert.equal(r.ok,true);
  const after=D.attendanceRateOf(att,{id:"a"},s,{cid:X});
  assert.deepEqual(after,before,"רשומות הנוכחות (בתווית הישנה) עדיין נפתרות לאותו cid");
  assert.equal(D.classOf(s,X).name,"ח׳1 מצטיינים","רק השם ברישום השתנה");
});

test("opts.cls (תאימות): נותן אותה תוצאה כמו opts.cid על נתונים רגילים",()=>{
  const att={"2026-09-01|ח1":{a:"p"}};
  const byCls=D.attendanceRateOf(att,{id:"a"},store(),{cls:"ח1"});
  const byCid=D.attendanceRateOf(att,{id:"a"},store(),{cid:X});
  assert.deepEqual(byCls,byCid);
});

test("קלט פגום: תלמיד בלי מזהה, מפתחות בלי '|', רשומות שאינן אובייקט — לא קורס",()=>{
  assert.equal(D.attendanceRateOf({"badkey":{a:"p"}},{id:"a"},store(),{cid:X}),null);
  assert.equal(D.attendanceRateOf({"2026-09-01|ח1":"לא אובייקט"},{id:"a"},store(),{cid:X}),null);
  assert.equal(D.attendanceRateOf({"2026-09-01|ח1":{a:"p"}},{},store(),{cid:X}),null,"אין sid לתלמיד");
});

test("טהורה: לא כותבת ל-att ולא לתלמיד",()=>{
  const att={"2026-09-01|ח1":{a:"p"}}; const before=JSON.stringify(att);
  const stud={id:"a"}; const sBefore=JSON.stringify(stud);
  D.attendanceRateOf(att,stud,store(),{cid:X});
  assert.equal(JSON.stringify(att),before);
  assert.equal(JSON.stringify(stud),sBefore);
});
