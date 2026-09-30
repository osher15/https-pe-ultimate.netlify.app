"use strict";
/* שלב 2 (30.09) — ציוד וזמן לכל וריאציה של הבלוק הראשי במחולל. */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"), path=require("path");
const D=require("../../hm-data.js");

/* המאגר יושב בתוך קובץ הדפדפן; מחלצים אותו כפי שהוא, בלי הרצת ה-DOM */
const src=fs.readFileSync(path.join(__dirname,"../../hm-lesson.js"),"utf8");
const TOPICS=eval("("+src.match(/const TOPICS=\[[\s\S]*?\n\];/)[0].replace("const TOPICS=","").replace(/;$/,"")+")");
const variants=[];
TOPICS.forEach(t=>["mid","high"].forEach(g=>(t.main[g]||[]).forEach(v=>variants.push({topic:t.id,grade:g,v}))));

test("2.1 variantEquipConflicts: רק פריטים שנדרשים ואינם זמינים",()=>{
  const v={need:["חבל","קונוסים"]};
  assert.deepEqual(D.variantEquipConflicts(v,["חבל"]),["חבל"]);
  assert.deepEqual(D.variantEquipConflicts(v,["חבל","קונוסים"]),["חבל","קונוסים"]);
  assert.deepEqual(D.variantEquipConflicts(v,["רשת"]),[],"פריט לא נדרש — אין התנגשות");
  assert.deepEqual(D.variantEquipConflicts(v,[]),[],"הכול זמין");
  assert.deepEqual(D.variantEquipConflicts({},["חבל"]),[],"וריאציה בלי need — אין ידיעה, אין חסימה");
  assert.deepEqual(D.variantEquipConflicts(v,["לא-ציוד"]),[],"ערך שאינו ברשימה הקבועה מתעלמים ממנו");
});

test("2.2 variantFit: כל הסטטוסים, והפער נרשם כמעברים רק כשהוא קטן",()=>{
  const v={d:["a","b","c"],t:[5,10,5]};                  /* 20 */
  assert.deepEqual(D.variantFit(v,20),{known:true,base:20,gap:0,status:"exact",transit:0});
  assert.equal(D.variantFit(v,23).status,"transit");     /* פער 3 ≤ max(3, 15%) */
  assert.equal(D.variantFit(v,23).transit,3,"הפער כולו הופך לשורת מעברים");
  assert.equal(D.variantFit(v,30).status,"short");
  assert.equal(D.variantFit(v,30).transit,0,"פער גדול אינו מוסתר כ«מעברים»");
  assert.equal(D.variantFit(v,18).status,"tight");
  assert.equal(D.variantFit(v,10).status,"over");
  assert.equal(D.variantFit({d:["a"]},20).known,false,"בלי t — לא יודעים");
  assert.equal(D.variantFit({d:["a","b"],t:[5]},20).known,false,"t לא באורך d — לא סומכים עליו");
  assert.equal(D.variantFit(v,0).known,false);
});

test("2.3 שלמות הנתונים: t באורך d ובמספרים חיוביים; need רק מהרשימה הקבועה",()=>{
  assert.ok(variants.length>=100,"המאגר נטען ("+variants.length+")");
  variants.forEach(({topic,grade,v})=>{
    const id=topic+"/"+grade+"/"+v.n;
    if(v.t){
      assert.equal(v.t.length,v.d.length,id+": t חייב להיות באורך d");
      v.t.forEach(x=>assert.ok(Number.isInteger(x)&&x>0,id+": דקות חיוביות שלמות"));
    }
    (v.need||[]).forEach(k=>assert.ok(D.EQUIP_KEYS[k],id+": «"+k+"» אינו פריט ציוד מוכר"));
  });
});

test("2.4 הממצא מהביקורת: מעגל אירובי עם דילוגי חבל נחסם כשאין חבלים",()=>{
  const circuit=TOPICS.find(t=>t.id==="aerobic").main.mid.find(v=>/מעגל אירובי/.test(v.n));
  assert.ok(/דילוגי חבל/.test(circuit.d.join(" ")),"הטקסט אכן דורש חבל");
  assert.deepEqual(D.variantEquipConflicts(circuit,["חבל"]),["חבל"]);
});

test("2.5 כיסוי: לכל וריאציה בקבוצת הכושר יש זמנים; לענפי כדור יש ציוד נדרש",()=>{
  ["aerobic","strength","core","speed","flex"].forEach(id=>
    variants.filter(x=>x.topic===id).forEach(({v})=>assert.ok(v.t,id+": חסר t ב-"+v.n)));
  ["basket","volley","handball","soccer"].forEach(id=>
    variants.filter(x=>x.topic===id).forEach(({v})=>assert.ok((v.need||[]).includes("כדורים"),id+": חסר need ב-"+v.n)));
});
