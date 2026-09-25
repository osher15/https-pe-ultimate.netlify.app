"use strict";
/* תרגומים — מגנים על מה שהתרגום החוזר מצא (docs/BACKTRANSLATION.md):
   שגיאות שקל להחזיר בשקט כשמוסיפים או משנים טקסט, ובאגים של המנוע
   עצמו (מירכאה יתומה, פיסוק כפול, תווית «סיום:»). */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("fs"),path=require("path"),vm=require("vm");
const R=path.join(__dirname,"..","..")+path.sep;

function load(){
  const win={localStorage:{getItem:()=>null,setItem(){}},
    document:{documentElement:{setAttribute(){}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,body:null},
    addEventListener(){}};
  win.window=win;
  const ctx=vm.createContext(Object.assign(win,{console,CustomEvent:function(){}}));
  for(const f of ["hm-terms.js","hm-texts.js","hm-i18n.js"])vm.runInContext(fs.readFileSync(R+f,"utf8"),ctx,{filename:f});
  return {I:ctx.window.I18N,T:ctx.window.I18N_TERMS};
}
const {I,T}=load();
const LANGS=["en","ar","ru","es"];
function trIn(l,s){ try{I.set(l);}catch(e){} return I.tr(s); }

/* ============ מילון הממשק ============ */

test("אין מפתח כפול בתוך שפה במילון הממשק — העותק האחרון דורס בשקט",()=>{
  const src=fs.readFileSync(R+"hm-i18n.js","utf8");
  const a=src.indexOf("\nen:{"), end=src.indexOf("\n};",src.indexOf("\nes:{"));
  const pos=LANGS.map(l=>[l,src.indexOf("\n"+l+":{")]).sort((x,y)=>x[1]-y[1]);
  for(let i=0;i<pos.length;i++){
    const seg=src.slice(pos[i][1],i+1<pos.length?pos[i+1][1]:end), seen=new Set();
    for(const m of seg.matchAll(/^\s*"([a-zA-Z0-9_.]+)":"/gm)){
      assert.ok(!seen.has(m[1]),pos[i][0]+": מפתח כפול "+m[1]); seen.add(m[1]); }
  }
  assert.ok(a>0);
});

/* ============ מונחים וטקסטים ============ */

test("שלבי שיעור: «שלב N —» מתורגם אחיד (Step), לא Stage",()=>{
  const bad={en:/^Stage \d+ —/,ar:/^المرحلة \d+ —/,ru:/^Этап \d+ —/,es:/^Fase \d+ —/};
  for(const [k,v] of Object.entries(T)){ if(!/^שלב \d+ —/.test(k))continue;
    LANGS.forEach((l,i)=>assert.ok(!bad[l].test(v[i]||""),l+": "+k.slice(0,40))); }
});

test("תרגום לא מתחיל בפיסוק שהמפתח לא מתחיל בו — אחרת הוא מוצג כפול",()=>{
  const P=/^[)\]}—–]/;
  /* «מ-» ברוסית «— от» בכוונה: «זכאות לאות — от 40 נק׳» (אין מקף לפניו) */
  const OK=new Set(["מ-"]);
  for(const [k,v] of Object.entries(T)){ if(P.test(k)||OK.has(k))continue;
    v.forEach((t,i)=>assert.ok(!P.test(t||""),LANGS[i]+": "+k.slice(0,40))); }
});

test("מקטע אחרי תגית: « — …» ו«) …» מקבלים את הפיסוק פעם אחת",()=>{
  const a=" — בדיוק כמו מצלמות הסיום באולימפיאדה. בזמן מירוץ: הקש על שם מסלול ברגע החצייה, או תן למנוע לסמן אוטומטית — ותכוונן במסך «תמונת סיום».";
  const b=") נשלחת ל-Google Sheet משותף שאתה מקים, כדי שכל המורים יראו את אותה טבלה. בלי זה — הכול נשאר במכשיר בלבד, כמו היום. הקמה חד-פעמית: ראו README, סעיף «סנכרון שיאים בין כמה מורים».";
  for(const l of LANGS){
    assert.ok(!/—\s*—/.test(trIn(l,a)),l+": — כפול");
    assert.ok(!/\)\s*\)/.test(trIn(l,b)),l+": ) כפול");
  }
});

test("מירכאה פותחת שנחתכה (״…״) — אין מירכאה יתומה או לא תואמת",()=>{
  const cases=["״מגן״ אחד בכל קבוצה שיכול לחסום בידיים.","״שומר״ אחד קבוע שלא יוצא מהשטח.",
    "״קיצור דרך״ בלי לרדת עד הסוף.","״ירוק״ — רצים קדימה. ״אדום״ — עוצרים לגמרי; המורה מסתובב ובודק."];
  for(const l of LANGS) for(const s of cases){
    const o=trIn(l,s);
    assert.ok(!/״/.test(o),l+": נשארה ״ — "+o);
    assert.ok(!/^"[«“]|^"[^"«»“”]*[»”]/.test(o),l+": מירכאות לא תואמות — "+o);
  }
  assert.equal(trIn("en",cases[0]),"One “shield” per team who may block with their hands.");
  assert.equal(trIn("ru",cases[2]),"«Срезание углов» — не опускаться до конца.");
});

test("תווית שלב «סיום:» במערך איננה «Done/Готово»",()=>{
  for(const l of LANGS){
    const o=trIn(l,"סיום: מתיחות סטטיות");
    assert.ok(!/^(Done|Готово|Terminar|تم)\b/.test(o),l+": "+o);
  }
});

test("שגיאות שנמצאו בתרגום החוזר לא חוזרות",()=>{
  assert.equal(T["הטחות כדורגל"][0],"Football keepy-ups");
  const hiit="ג׳אמפינג ג׳ק · ברכיים גבוהות · מטפס הרים · סקוואט · שכיבות סמיכה (ברכיים למתקשים) · פלאנק · דילוגי חבל דמיוניים · ברפי מותאם";
  T[hiit].forEach((t,i)=>assert.equal(t.split(" · ").length,8,LANGS[i]+": פריט נשמט"));
  for(const k of Object.keys(T)){
    assert.ok(!k.includes("שכיבות שמיכה"),"«שמיכה» ← «סמיכה»");
    assert.ok(!k.includes("שתי כדורים"),"«שתי כדורים» ← «שני כדורים»");
  }
});

test("אין ← בתרגום לשפה משמאל לימין",()=>{
  for(const [k,v] of Object.entries(T)) [0,2,3].forEach(i=>
    assert.ok(!/←/.test(v[i]||""),LANGS[i]+": "+k.slice(0,40)));
});

/* ============ מפתחות המילון מול הקוד ============ */

/* הקוד בלי המילון עצמו — אחרת כל מפתח «מופיע בקוד» */
const I18SRC=fs.readFileSync(R+"hm-i18n.js","utf8");
const CODE=fs.readdirSync(R).filter(f=>/\.(js|html)$/.test(f)&&!/^(Hamegrash\.html|hm-texts\.js|hm-terms\.js|hm-i18n\.js|sw\.js)$/.test(f))
  .map(f=>fs.readFileSync(R+f,"utf8")).join("\n")+I18SRC.slice(I18SRC.indexOf("\n};",I18SRC.indexOf("\nes:{")));
function dictOf(l){
  const src=fs.readFileSync(R+"hm-i18n.js","utf8");
  const a=src.indexOf("\n"+l+":{"), nx=LANGS.map(x=>src.indexOf("\n"+x+":{")).filter(i=>i>a).sort((x,y)=>x-y)[0];
  const seg=src.slice(a,nx||src.indexOf("\n};",a));
  return new Set([...seg.matchAll(/"([a-zA-Z0-9_.]+)":"/g)].map(m=>m[1]));
}
/* מפתחות שנבנים בזמן ריצה: t("home.tip."+i), t("pfg."+i+".h"), t("nut.c."+id), tr("nut.tip."+i) */
const DYN=[/^home\.tip\.\d+$/,/^nut\.tip\.\d+$/,/^pfg\.\d+\.[hp]$/,/^nut\.c\./];

test("כל מפתח שהקוד מבקש קיים בכל ארבע השפות",()=>{
  const refs=new Set([...CODE.matchAll(/(?:\bt\(|data-i18n(?:-[a-z]+)?=)\s*["']([a-z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]*[a-zA-Z0-9_])["']/g)].map(m=>m[1]));
  for(const l of LANGS){ const d=dictOf(l); for(const k of refs) assert.ok(d.has(k),l+": חסר "+k); }
});

test("אין מפתחות מתים במילון — כל מפתח מופיע בקוד (או שייך למשפחה דינמית)",()=>{
  const dead=[...dictOf("en")].filter(k=>!DYN.some(r=>r.test(k))&&
    !CODE.includes('"'+k+'"')&&!CODE.includes("'"+k+"'")&&!CODE.includes("`"+k+"`"));
  assert.deepEqual(dead,[],"מפתחות שאף קוד לא מבקש");
});
