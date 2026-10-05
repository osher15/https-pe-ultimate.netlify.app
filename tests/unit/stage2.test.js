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

test("2.2 variantFit: טווח יעיל — הדקות מותאמות בתוכו והסכום תמיד מוסבר",()=>{
  const v={n:"מעגל תחנות",d:["שלב 1 — הדגמה","b","c","d","e"],t:[6,4,3,12,3]};
  [20,25,30,36,45].forEach(a=>{
    const f=D.variantFit(v,a);
    assert.equal(f.status,"exact","בתוך הטווח "+a);
    assert.equal(f.fitted.reduce((x,y)=>x+y,0)+f.overhead,a,"שלבים + תקורה = הזמן שהוקצה ("+a+")");
    f.fitted.forEach((m,i)=>assert.ok(m>=f.sr.lo[i]&&m<=f.sr.hi[i],"שלב "+i+" בתוך הטווח שלו"));
  });
  assert.equal(D.variantFit(v,200).status,"short","הרבה מעבר לטווח — צריך עוד סבבים, לא «מעברים»");
  assert.equal(D.variantFit(v,200).gap>0,true);
  assert.equal(D.variantFit(v,10).status,"over");
  assert.equal(D.variantFit({d:["a"]},20).known,false,"בלי t — לא יודעים");
  assert.equal(D.variantFit({d:["a","b"],t:[5]},20).known,false,"t לא באורך d — לא סומכים עליו");
  assert.equal(D.variantFit(v,0).known,false);
});

test("2.2b גמישות: אותו תרגיל — כיתה איטית מקבלת יותר, התקורה מתכווצת ראשונה, ו-r קובע טווח",()=>{
  const v={n:"מעגל תחנות",d:["שלב 1 — הדגמה","b","c"],t:[4,8,3]};            /* 15 אופייני */
  const sum=f=>f.fitted.reduce((a,b)=>a+b,0);
  const fast=D.variantFit(v,24,{pace:"fast",water:false}), slow=D.variantFit(v,24,{pace:"slow",water:false});
  assert.ok(sum(slow)>=sum(fast),"אותו זמן, אבל קצב איטי לא מקבל פחות דקות עבודה מקצב מהיר");
  const quick=D.variantFit(v,20,{trans:"quick",water:false}), slowT=D.variantFit(v,20,{trans:"slow",water:false});
  assert.ok(slowT.overhead>=quick.overhead,"מעברים איטיים — יותר תקורה");
  const tight=D.variantFit(v,D.stepRanges(v).lo.reduce((a,b)=>a+b,0)+1);
  assert.equal(tight.status,"exact","כשצפוף, התקורה מתכווצת לפני שהשלבים נדחסים מתחת למינימום");
  assert.ok(tight.overhead<=1);
  const withR=D.stepRanges({d:["a","b"],t:[10,10],r:[[8,25],[5,12]]});
  assert.deepEqual([withR.lo,withR.hi],[[8,5],[25,12]]);
  const t=D.timeOpts({pace:"nope",trans:"x"});
  assert.deepEqual(t,{pace:"normal",trans:"normal",water:true},"ערך לא מוכר → ברירת מחדל");
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

test("2.5 כיסוי: לכל 108 הוריאציות יש זמנים; r (אם יש) תקין; לענפי כדור יש ציוד נדרש",()=>{
  assert.equal(variants.length,108);
  variants.forEach(({topic,v})=>{
    assert.ok(v.t,topic+": חסר t ב-"+v.n);
    if(v.r){
      assert.equal(v.r.length,v.d.length,v.n+": r באורך d");
      v.r.forEach((x,i)=>{ assert.ok(x[0]>=1&&x[1]>=x[0],v.n+": טווח תקין בשלב "+i); assert.ok(v.t[i]>=x[0]&&v.t[i]<=x[1],v.n+": t בתוך r בשלב "+i); });
    }
  });
  const BALL={basket:"כדור סל",volley:"כדור עף",handball:"כדור יד",soccer:"כדור רגל"};
  Object.keys(BALL).forEach(id=>
    variants.filter(x=>x.topic===id).forEach(({v})=>assert.ok((v.need||[]).includes(BALL[id]),id+": חסר need ב-"+v.n)));
});

test("2.6 טווח זמן: ברוב הוריאציות הזמן הרגיל של שיעור (מ-18 עד 32 דק׳ לבלוק) נמצא בטווח היעיל",()=>{
  [18,25,32].forEach(a=>{
    const bad=variants.filter(({v})=>D.variantFit(v,a).status!=="exact");
    assert.ok(bad.length<=variants.length*0.15,a+" דק׳: יותר מדי וריאציות מחוץ לטווח ("+bad.length+"): "+bad.slice(0,5).map(x=>x.v.n).join(" | "));
  });
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
