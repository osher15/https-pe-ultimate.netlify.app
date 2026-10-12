"use strict";
// Compare ordered digits in real merged game prose and all four translation columns.
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const R=path.resolve(__dirname,"../..");
const source=fs.readFileSync(path.join(R,"hm-know.js"),"utf8");
function extract(name,pattern){
  const match=source.match(pattern); assert.ok(match,"source declaration: "+name);
  return vm.runInNewContext("("+match[0].replace("const "+name+"=","").replace(/;$/,"")+")");
}
const games=extract("GAMES",/const GAMES=\[[\s\S]*?\n\];/);
const adapt=extract("GAME_ADAPT",/const GAME_ADAPT=\{[\s\S]*?\n\};/);
const menu=extract("TASK_MENU",/const TASK_MENU=\[[^\n]*\];/);
new Function("GAMES","GAME_ADAPT",source.match(/GAMES\.forEach\(g=>\{ const a=GAME_ADAPT[\s\S]*?\n\}\);/)[0])(games,adapt);
const win={localStorage:{getItem:()=>null,setItem(){}},document:{documentElement:{setAttribute(){}},addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null,body:null},addEventListener(){}};
win.window=win;
const ctx=vm.createContext({...win,CustomEvent:function(){}});
for(const file of ["hm-terms.js","hm-texts.js","hm-i18n.js"])vm.runInContext(fs.readFileSync(path.join(R,file),"utf8"),ctx,{filename:file});
const T=ctx.window.I18N_TERMS,I=ctx.window.I18N;
const LANGS=["en","ar","ru","es"];
const digits=s=>s.match(/\d+/g)||[];
// Exact language/key exceptions pin both sequences; changed quantities still fail.
// These are digit-versus-word representations, not certified translation errors.
const KNOWN=new Map([
// KNOWN: 2 חפצים כ״דגל״ (סרט, חולצה, קונוס) [ar] — number written as a word or word written as a digit.
  ["ar\u00002 חפצים כ״דגל״ (סרט, חולצה, קונוס)", {"source": ["2"], "translation": [], "text": "غرضان كـ“علمين” (شريط، قميص، قمع)"}],
// KNOWN: פיצול שרשרת ל־2 כשהיא מגיעה ל־6 שחקנים — משחק מהיר יותר. [ar] — number written as a word or word written as a digit.
  ["ar\u0000פיצול שרשרת ל־2 כשהיא מגיעה ל־6 שחקנים — משחק מהיר יותר.", {"source": ["2", "6"], "translation": ["6"], "text": "تقسيم السلسلة إلى اثنتين عندما تصل إلى 6 لاعبين — لعب أسرع."}],
// KNOWN: כדור רך או ציוד אחר + 2 שערים מאולתרים (קונוסים, חבלים, ספסלים, קופסאות או כל ציוד אחר) [ar] — number written as a word or word written as a digit.
  ["ar\u0000כדור רך או ציוד אחר + 2 שערים מאולתרים (קונוסים, חבלים, ספסלים, קופסאות או כל ציוד אחר)", {"source": ["2"], "translation": [], "text": "كرة ليّنة أو معدات أخرى + مرميان مرتجلان (أقماع، حبال، مقاعد، صناديق أو أي معدات أخرى)"}],
// KNOWN: 2 ספסלים או ציוד אחר + כדור או ציוד אחר [ar] — number written as a word or word written as a digit.
  ["ar\u00002 ספסלים או ציוד אחר + כדור או ציוד אחר", {"source": ["2"], "translation": [], "text": "مقعدان أو معدات أخرى + كرة أو معدات أخرى"}],
// KNOWN: גרסת 4 כיוונים — חבל מרובע. [en] — number written as a word or word written as a digit.
  ["en\u0000גרסת 4 כיוונים — חבל מרובע.", {"source": ["4"], "translation": [], "text": "Four-way version — square rope."}],
// KNOWN: קליעה מהשדה = 2 נק׳; אחרי קליעה — סדרת עונשין, כל אחד שווה נקודה עד להחטאה. [ar] — number written as a word or word written as a digit.
  ["ar\u0000קליעה מהשדה = 2 נק׳; אחרי קליעה — סדרת עונשין, כל אחד שווה נקודה עד להחטאה.", {"source": ["2"], "translation": [], "text": "التصويبة من الملعب = نقطتان؛ بعد التسجيل — سلسلة رميات حرة، كلٌّ منها بنقطة حتى الإخفاق."}],
// KNOWN: שער קטן אחד (2 קונוסים) במרכז, שוער אחד מתחלף, שאר השחקנים במעגל סביבו. [ar] — number written as a word or word written as a digit.
  ["ar\u0000שער קטן אחד (2 קונוסים) במרכז, שוער אחד מתחלף, שאר השחקנים במעגל סביבו.", {"source": ["2"], "translation": [], "text": "مرمى صغير واحد (قمعان) في الوسط، حارس مرمى واحد يتبدّل، وبقية اللاعبين في دائرة حوله."}],
// KNOWN: קונוס הזהב מונח במעגל מסומן במרכז המגרש. שתי קבוצות בקצוות הנגדיים, כל קבוצה עם 2 ״שומרים״ קבועים סביב המעגל. [ar] — number written as a word or word written as a digit.
  ["ar\u0000קונוס הזהב מונח במעגל מסומן במרכז המגרש. שתי קבוצות בקצוות הנגדיים, כל קבוצה עם 2 ״שומרים״ קבועים סביב המעגל.", {"source": ["2"], "translation": [], "text": "يوضع القمع الذهبي داخل دائرة مُعلَّمة في وسط الملعب. فريقان في الطرفين المتقابلين، ولكل فريق «حارسان» ثابتان حول الدائرة."}],
// KNOWN: שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5. [en] — number written as a word or word written as a digit.
  ["en\u0000שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5.", {"source": ["2", "3", "4", "5"], "translation": ["1", "2", "3", "4", "5"], "text": "The value of the goal depends on the body part that struck the ball: hand — 1 point, foot — 2, head — 3, shoulder — 4, back — 5."}],
// KNOWN: שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5. [ru] — number written as a word or word written as a digit.
  ["ru\u0000שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5.", {"source": ["2", "3", "4", "5"], "translation": ["1", "2", "3", "4", "5"], "text": "Ценность гола зависит от части тела, которая ударила по мячу: рука — 1 очко, нога — 2, голова — 3, плечо — 4, спина — 5."}],
// KNOWN: שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5. [es] — number written as a word or word written as a digit.
  ["es\u0000שווי הגול תלוי בחלק הגוף שהכה את הכדור: יד — נקודה אחת, רגל — 2, ראש — 3, כתף — 4, גב — 5.", {"source": ["2", "3", "4", "5"], "translation": ["1", "2", "3", "4", "5"], "text": "El valor del gol depende de la parte del cuerpo que golpeó el balón: mano — 1 punto, pie — 2, cabeza — 3, hombro — 4, espalda — 5."}],
// KNOWN: כדור ספוג או כדור גומי או ציוד אחר + 2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר [ar] — number written as a word or word written as a digit.
  ["ar\u0000כדור ספוג או כדור גומי או ציוד אחר + 2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר", {"source": ["2"], "translation": [], "text": "كرة إسفنجية أو مطاطية أو معدّات أخرى + هدفان يُحدَّدان بمخاريط أو مقاعد أو معدّات أخرى"}],
// KNOWN: כדור ספוג או כדור גומי או ציוד אחר + 2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר [ru] — number written as a word or word written as a digit.
  ["ru\u0000כדור ספוג או כדור גומי או ציוד אחר + 2 שערים מסומנים בקונוסים או בספסלים או ציוד אחר", {"source": ["2"], "translation": [], "text": "Мягкий или резиновый мяч или другой инвентарь + двое ворот, обозначенных конусами или скамейками или другим инвентарём"}],
// KNOWN: בכל קבוצה יש ״מלך״ (שוער) עם 3 ״פסילות״. הוא שומר על קונוס הזהב ועל הקונוסים הקטנים של קבוצתו. אחרי שנפגע 3 פעמים הוא יוצא, ומכריזים על מלך חדש מבין חברי הקבוצה. [ru] — number written as a word or word written as a digit.
  ["ru\u0000בכל קבוצה יש ״מלך״ (שוער) עם 3 ״פסילות״. הוא שומר על קונוס הזהב ועל הקונוסים הקטנים של קבוצתו. אחרי שנפגע 3 פעמים הוא יוצא, ומכריזים על מלך חדש מבין חברי הקבוצה.", {"source": ["3", "3"], "translation": ["3"], "text": "В каждой команде есть «король» (вратарь) с тремя «жизнями». Он охраняет золотой конус и маленькие конусы своей команды. После 3 попаданий король выбывает, и из игроков команды объявляют нового короля."}],
// KNOWN: לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה. [en] — number written as a word or word written as a digit.
  ["en\u0000לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה.", {"source": ["5"], "translation": ["1", "5"], "text": "Change the king’s number of lives to suit the class — 1 for a small class, 5 for a large one."}],
// KNOWN: לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה. [ru] — number written as a word or word written as a digit.
  ["ru\u0000לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה.", {"source": ["5"], "translation": ["1", "5"], "text": "Измените число «жизней» короля под класс — 1 для маленького класса, 5 для большого."}],
// KNOWN: לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה. [es] — number written as a word or word written as a digit.
  ["es\u0000לשנות את מספר הפסילות של המלך לפי הכיתה — פסילה אחת לכיתה קטנה, 5 לכיתה גדולה.", {"source": ["5"], "translation": ["1", "5"], "text": "Cambia el número de vidas del rey según la clase — 1 para una clase pequeña, 5 para una grande."}]
]);
// Seven legacy leading-quote keys use existing stripped-core dictionary entries.
// Require those entries explicitly; arbitrary missing rows must fail.
const FALLBACK=new Set(["״מחניים מציל״: קליטה נקייה של הזריקה מחזירה שבוי אחד.", "״ירוק״ — רצים קדימה. ״אדום״ — עוצרים לגמרי; המורה מסתובב ובודק.", "״כריש״ אחד או שניים באמצע, כל השאר ״דגים״ בקו אחד.", "״אוהל״: מרימים גבוה, נכנסים פנימה ומתיישבים על השוליים.", "״פופקורן״: כדורים על המצנח, המשימה להוציא את כולם — או להשאיר את כולם.", "״חילופין״: המורה קורא מספרים, ומי שקיבל את המספר מתחלף מתחת למצנח.", "״נופל״ יושב ולא נשכב על מגרש עם ריצות — למניעת דריכה."]);
const seen=new Set();
function check(key){
  assert.equal(typeof key,"string");
  const row=T[key];
  if(!row){
    assert.ok(FALLBACK.has(key),"missing full dictionary row: "+key);
    const core=key.replace(/^״/,"");assert.ok(T[core],"missing legacy core row: "+key);
  }else assert.equal(row.length,4,"translation columns: "+key);
  LANGS.forEach((lang,col)=>{
    try{I.set(lang);}catch(e){if(!/dataset/.test(e.message))throw e;}
    assert.equal(I.lang(),lang);
    const text=row?row[col]:I.tr(key);
    assert.ok(text&&!/[\u0590-\u05ff]/.test(text),lang+": untranslated "+key);
    const id=lang+"\0"+key,known=KNOWN.get(id);
    if(known){
      seen.add(id);assert.deepEqual(digits(key),known.source,id);
      assert.deepEqual(digits(text),known.translation,id);assert.equal(text,known.text,id);
    }else assert.deepEqual(digits(text),digits(key),lang+": "+key);
  });
}
const fields=["how","vars","equip","safe","goal","fit","adapt","chal","more"];
for(const game of games)test("ordered numerals: "+game.id,()=>{
  for(const field of fields){const value=game[field];
    const strings=Array.isArray(value)?value:value&&typeof value==="object"?Object.values(value):[value];
    strings.filter(x=>typeof x==="string").forEach(check);
  }
  (adapt[game.id].more||[]).forEach(check);
});
test("shared task menu ordered numerals",()=>menu.forEach(check));
test("numeral exception inventory remains exact",()=>{
  assert.equal(games.length,44);assert.equal(menu.length,5);
  assert.deepEqual([...seen].sort(),[...KNOWN.keys()].sort());
});
