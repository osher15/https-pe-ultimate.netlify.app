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
  const BALL={basket:"כדור סל",volley:"כדור עף",handball:"כדור יד",soccer:"כדור רגל"};
  Object.keys(BALL).forEach(id=>
    variants.filter(x=>x.topic===id).forEach(({v})=>assert.ok((v.need||[]).includes(BALL[id]),id+": חסר "+BALL[id]+" ב-"+v.n)));
});

test("2.6 זיהוי ציוד: «מזרנים» ברבים מזוהה, ו«או» היא חלופה כמו «/»",()=>{
  assert.deepEqual(D.equipConflicts("מזרנים",["מזרנים"]),["מזרנים"],"רבים מזוהה");
  assert.deepEqual(D.equipConflicts("מזרן",["מזרנים"]),["מזרנים"],"יחיד עדיין מזוהה");
  assert.deepEqual(D.equipConflicts("עיתונים או מזרנים קטנים",["מזרנים"]),[],"«או» — עיתונים מספיקים");
  assert.deepEqual(D.equipConflicts("קונוסים או חישוקים",["קונוסים"]),[],"אחת מהשתיים מספיקה");
  assert.deepEqual(D.equipConflicts("קונוסים או חישוקים",["קונוסים","חישוקים"]),["קונוסים","חישוקים"],"שתיהן חסרות — חסום");
  assert.deepEqual(D.equipConflicts("רשת + כדור עף או כדור גומי",["כדור עף","כדור גומי"]),["כדור עף","כדור גומי"],"שתי החלופות חסרות — חסום");
  assert.deepEqual(D.equipConflicts("מזרנים, חישוקים, קונוסים",["מזרנים"]),["מזרנים"],"פסיק — כולם נדרשים");
});

const KNOW=fs.readFileSync(path.join(__dirname,"../../hm-know.js"),"utf8");
const GAMES=eval("("+KNOW.match(/const GAMES=\[[\s\S]*?\n\];/)[0].replace("const GAMES=","").replace(/;$/,"")+")");
const ALL_TRACKED=Object.keys(D.EQUIP_KEYS).filter(k=>k!=="ציוד אחר");

test("2.7 «ציוד אחר» מפתח את החסימה; חבל עבה (משיכה) אינו חבל קפיצה; פריזבי מזוהה",()=>{
  assert.deepEqual(D.equipConflicts("רשת / גומי נמתח / ציוד אחר",["רשת"]),[],"גומי נמתח אינו ברשימה — אף פעם לא חוסם");
  assert.deepEqual(D.equipConflicts("רשת או ציוד אחר",["רשת","ציוד אחר"]),["רשת","ציוד אחר"],"הכול חסר — חסום");
  assert.deepEqual(D.equipConflicts("רשת או ציוד אחר",["רשת"]),[],"ציוד אחר זמין — לא חסום");
  assert.deepEqual(D.equipConflicts("חבל עבה עם סימון אמצע",["חבל"]),[],"חבל קפיצה חסר אינו חוסם חבל עבה");
  assert.deepEqual(D.equipConflicts("חבל עבה עם סימון אמצע",["חבל עבה"]),["חבל עבה"]);
  assert.deepEqual(D.equipConflicts("חבל עבה (חבל טיפוס) עם סימון",["חבל עבה"]),["חבל עבה"],"חבל טיפוס = אותו פריט");
  assert.deepEqual(D.equipConflicts("חבלים",["חבל עבה"]),[],"חבלי קפיצה אינם חבל עבה");
  assert.deepEqual(D.equipConflicts("חבל ארוך",["חבל"]),["חבל"],"חבל רגיל עדיין מזוהה");
  assert.deepEqual(D.equipConflicts("צלחת מעופפת אחת (פריזבי)",["צלחת מעופפת"]),["צלחת מעופפת"]);
  assert.deepEqual(D.equipConflicts("פריזבי",["צלחת מעופפת"]),["צלחת מעופפת"],"גם השם «פריזבי»");
});

test("2.8 כל משחק ניתן לשיבוץ כשסומן רק «ציוד אחר» — אף משחק לא נחסם בגלל חוסר בציוד מקובע",()=>{
  GAMES.forEach(g=>assert.deepEqual(D.equipConflicts(g.equip,ALL_TRACKED),[],g.name+": «"+g.equip+"» חוסם גם כשיש «ציוד אחר»"));
});

test("2.9 שמות כדורים בשתי מילים («כדור סל», «כדור רגל», «כדור עף») בשדה הציוד של המשחקים",()=>{
  GAMES.forEach(g=>assert.ok(!/כדורסל|כדורגל|כדורעף/.test(g.equip),g.name+": «"+g.equip+"»"));
});

test("2.10 סוגי כדורים נפרדים: כדור ספציפי נחסם רק כשהוא חסר; «כדור» בלי סוג — רק כשאין אף כדור",()=>{
  assert.deepEqual(D.equipConflicts("כדור סל",["כדור עף"]),[],"חסר כדור עף — כדור סל לא נחסם");
  assert.deepEqual(D.equipConflicts("כדור סל",["כדור סל"]),["כדור סל"]);
  assert.deepEqual(D.equipConflicts("כדורסל",["כדור סל"]),["כדור סל"],"כתיב מחובר מזוהה");
  assert.deepEqual(D.equipConflicts("כדורגלים",["כדור רגל"]),["כדור רגל"]);
  assert.deepEqual(D.equipConflicts("כדורי עף",["כדור עף"]),["כדור עף"]);
  assert.deepEqual(D.equipConflicts("כדור אחד",["כדור סל"]),[],"כדור כלשהו — יש עוד סוגים");
  assert.deepEqual(D.equipConflicts("כדור אחד",D.BALL_TYPES),["כדורים"],"אף כדור לא זמין");
  assert.deepEqual(D.equipConflicts("כדור רך",["כדור רך"]),[],"רך מתקיים גם מספוג או גומי");
  assert.deepEqual(D.equipConflicts("כדור רך",["כדור רך","כדור ספוג","כדור גומי"]),["כדור רך"]);
  assert.deepEqual(D.equipConflicts("1–3 כדורים רכים",["כדור רך","כדור ספוג"]),[],"גומי זמין");
  assert.deepEqual(D.equipConflicts("כדור סל או כדור גומי",["כדור סל"]),[],"חלופה אחת זמינה");
  assert.deepEqual(D.equipConflicts("כדור אחד",["כדורים"]),["כדורים"],"«כדורים» ישן = כל הכדורים");
  assert.deepEqual(D.variantEquipConflicts({need:["כדור סל"]},["כדור עף"]),[]);
  assert.deepEqual(D.variantEquipConflicts({need:["כדור סל"]},["כדור סל"]),["כדור סל"]);
  assert.deepEqual(D.variantEquipConflicts({need:["כדורים"]},["כדור סל"]),[],"כדור כלשהו");
  assert.deepEqual(D.variantEquipConflicts({need:["כדורים"]},D.BALL_TYPES),["כדורים"]);
  assert.ok(D.BALL_TYPES.every(b=>D.EQUIP_KEYS[b]),"כל סוג כדור רשום כפריט");
});
