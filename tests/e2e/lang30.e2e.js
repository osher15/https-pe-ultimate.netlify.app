"use strict";
/* שלב 30 — אנגלית כשפת ברירת המחדל למשתמש חדש, והדגמה בינלאומית.
   מה שנבדק: התקנה חדשה נפתחת באנגלית ומשמאל לימין; משתמש קיים שלא
   בחר שפה נשאר בעברית; בחירה נשמרת אחרי טעינה מחדש; מעבר שפה לא נוגע
   בנתונים ובמזהים; ההדגמה באנגלית; טעינה מחדש של הדגמה עברית ישנה
   מחליפה רק את רשומות ההדגמה; ייצוא באנגלית; ועותק של גרסת החנות
   בלי בחירת שפה משוחזר בעברית. */
const {check,eq,ok}=require("./harness.js");
const D=require("../../hm-data.js");

const HEB=/[֐-׿]/;
const V={"schema.version":D.SCHEMA_VERSION};
const fresh={__fresh:true};
const EN_KIDS=["Liam Carter","Noah Bennett","Ethan Brooks","Mason Hughes","Lucas Foster","Owen Mitchell","Caleb Turner","Ryan Walsh"];
const lang=page=>page.evaluate(()=>({lang:window.I18N.lang(),dir:document.documentElement.dir,
  stored:localStorage.getItem("peultimate.lang")}));
const ours=page=>page.evaluate(()=>{ const o={}; Object.keys(localStorage).sort()
  .filter(k=>k.indexOf("peultimate.")===0&&k!=="peultimate.lang").forEach(k=>o[k]=localStorage.getItem(k)); return o; });
/* מתחילים הדגמה מהתקנה חדשה: מדלגים על טופס הקשר ולוחצים «מצב הדגמה» */
async function startDemo(page){
  await page.click("#lead-skip"); await page.waitForTimeout(300);
  await page.click("#lock-demo"); await page.waitForTimeout(700);
}
const visHeb=(page,sel)=>page.evaluate(s=>{
  const out=[]; const root=document.querySelector(s); if(!root)return ["(missing "+s+")"];
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  for(let n=w.nextNode();n;n=w.nextNode()){ const p=n.parentElement;
    if(!/[֐-׿]/.test(n.nodeValue)||!p||!p.offsetParent)continue; out.push(n.nodeValue.trim()); }
  return out; },sel);

module.exports={title:"שלב 30 — אנגלית כברירת מחדל והדגמה בינלאומית",tests:[

  check("התקנה חדשה: אנגלית, משמאל לימין, והבחירה נרשמת מיד",fresh,async page=>{
    eq(await lang(page),{lang:"en",dir:"ltr",stored:"en"});
    ok(await page.evaluate(()=>document.getElementById("leadOv").classList.contains("on")),"טופס הקשר פתוח");
    eq(await visHeb(page,"#leadOv .box").then(a=>a.filter(x=>x!=="עברית")),[],"טופס הקשר באנגלית (מלבד «עברית» בבוחר)");
    await page.click("#lead-skip"); await page.waitForTimeout(300);
    eq(await visHeb(page,"#lockOv .box").then(a=>a.filter(x=>x!=="עברית")),[],"מסך הכניסה באנגלית");
    eq(await page.evaluate(()=>document.querySelectorAll("#lock-lang button").length),5,"בוחר שפה במסך הכניסה — חמש שפות");
  }),

  check("בחירת שפה במסך הפתיחה נשמרת אחרי סגירה ופתיחה",fresh,async page=>{
    await page.click('#lead-lang [data-l="he"]'); await page.waitForTimeout(200);
    eq(await lang(page),{lang:"he",dir:"rtl",stored:"he"});
    await page.reload(); await page.waitForTimeout(700);
    eq(await lang(page),{lang:"he",dir:"rtl",stored:"he"},"אחרי טעינה מחדש");
    await page.click("#lead-skip"); await page.waitForTimeout(300);
    await page.click('#lock-lang [data-l="ru"]'); await page.waitForTimeout(200);
    await page.reload(); await page.waitForTimeout(700);
    eq(await lang(page),{lang:"ru",dir:"ltr",stored:"ru"},"גם מבוחר מסך הכניסה");
  }),

  check("משתמש קיים שלא בחר שפה (הייתה עברית כברירת מחדל) — נשאר בעברית",Object.assign({
    "stu.list":[{id:"a",name:"דן",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,tests:[]}]},V),async page=>{
    eq(await lang(page),{lang:"he",dir:"rtl",stored:"he"});
  }),

  check("בחירת שפה שכבר שמורה אצל משתמש — נשמרת, ושפות אחרות לא הופכות לאנגלית",Object.assign({lang:"ar"},V),async page=>{
    eq((await lang(page)).lang,"ar"); eq((await lang(page)).dir,"rtl");
    eq(await page.evaluate(()=>document.querySelector('[data-i18n="set.lang"]').textContent),"اللغة");
    /* (טעינה מחדש כאן הייתה מזריעה שוב «ar» — השמירה עצמה נבדקת בבדיקה 2) */
    await page.evaluate(()=>window.I18N.set("es")); await page.waitForTimeout(150);
    eq(await lang(page),{lang:"es",dir:"ltr",stored:"es"});
    eq(await page.evaluate(()=>document.querySelector('[data-i18n="set.lang"]').textContent),"Idioma");
  }),

  check("מעבר בין כל השפות לא משנה אף נתון ואף מזהה",Object.assign({
    "stu.list":[{id:"s1",name:"נועה לוי",cls:"ט׳3",cid:"c:ט:3",sex:"girls",age:14,tests:[]}],
    "ft.results":[{id:"r1",ts:1,d:"2026-09-01",cls:"ט׳3",cid:"c:ט:3",test:"push",name:"נועה לוי",sid:"s1",gradeKey:"ט",sex:"girls",val:20,unit:"חזרות"}]},V),async page=>{
    await page.evaluate(()=>window.HM.go("stu")); await page.waitForTimeout(400);
    const before=await ours(page);
    for(const l of ["en","ar","ru","es","he","en"]){ await page.evaluate(c=>window.I18N.set(c),l); await page.waitForTimeout(150); }
    eq(await ours(page),before,"localStorage זהה, מלבד מפתח השפה");
    eq(await page.evaluate(()=>document.documentElement.dir),"ltr");
  }),

  check("הדגמה בהתקנה חדשה: שמות באנגלית, מזהים קבועים, מסך התלמידים בלי עברית",fresh,async page=>{
    await startDemo(page);
    const st=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    eq(st.map(s=>s.name),EN_KIDS);
    eq(st.map(s=>s.id),EN_KIDS.map((_,i)=>"demo"+i));
    ok(st.every(s=>s.cid==="c:ט:3"),"כיתת ההדגמה היא הכיתה האוטומטית ט׳3 (מוצגת 9-3)");
    eq(await page.evaluate(()=>window.HM.LS.get("hx.demoLang",null)),"en");
    ok(await page.evaluate(()=>getComputedStyle(document.getElementById("demoReload")).display==="none"),"אין צורך בטעינה מחדש — הכפתור לא נראה");
    await page.evaluate(()=>window.HM.go("stu")); await page.waitForTimeout(500);
    eq(await visHeb(page,"#view-stu"),[],"מסך התלמידים");
    await page.evaluate(()=>window.HM.go("ft")); await page.waitForTimeout(500);
    eq(await visHeb(page,"#view-ft"),[],"מבחני הכושר");
  }),

  check("ייצוא במצב אנגלית: שם הקובץ, הכותרות והתאים — באנגלית",fresh,async page=>{
    await startDemo(page);
    await page.evaluate(()=>window.HM.go("ft")); await page.waitForTimeout(500);
    await page.evaluate(()=>document.querySelector('#ft-tests [data-t="push"]').click()); await page.waitForTimeout(500);
    const r=await page.evaluate(()=>{ let got=null; const o=window.HM.dlCSV;
      window.HM.dlCSV=(name,rows)=>{ got={name,rows}; };
      try{ document.getElementById("ft-csv").click(); }finally{ window.HM.dlCSV=o; } return got; });
    ok(/^test-Push-ups-9-3-\d{4}-\d\d-\d\d\.csv$/.test(r.name),"שם הקובץ: "+r.name);
    ok(!HEB.test(JSON.stringify(r.rows.slice(1))),"התאים: "+JSON.stringify(r.rows[1]));
    eq(r.rows[1][1],"9-3"); eq(r.rows[1][3],"Push-ups");
  }),

  check("הדגמה בממשק עברי נשארת בעברית",Object.assign({lang:"he"},V),async page=>{
    await page.evaluate(()=>document.getElementById("lock-demo").click()); await page.waitForTimeout(500);
    const st=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    ok(st.length===8&&st.every(s=>HEB.test(s.name)),"שמות עבריים: "+st.map(s=>s.name).join(", "));
    eq(await page.evaluate(()=>window.HM.LS.get("hx.demoLang",null)),"he");
  }),

  check("הדגמה עברית ישנה בממשק אנגלי: «טען מחדש באנגלית» מחליף רק את רשומות ההדגמה",Object.assign({lang:"en","hx.demo":true,
    "stu.list":[{id:"demo0",name:"דן אבירם",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,tests:[]},
                {id:"demo1",name:"איתי כהן",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,tests:[]},
                {id:"r1",name:"Real Student",cls:"ז׳1",cid:"c:ז:1",sex:"girls",age:12,tests:[]}],
    "ft.results":[{id:"dm0",ts:1,d:"2026-09-01",cls:"ט׳3",cid:"c:ט:3",test:"push",name:"דן אבירם",sid:"demo0",gradeKey:"ט",sex:"boys",val:20,unit:"חזרות"},
                  {id:"x9",ts:2,d:"2026-09-02",cls:"ז׳1",cid:"c:ז:1",test:"push",name:"Real Student",sid:"r1",gradeKey:"ז",sex:"girls",val:11,unit:"חזרות"}]},V),async page=>{
    ok(await page.evaluate(()=>getComputedStyle(document.getElementById("demoReload")).display!=="none"),"הכפתור מוצג");
    eq(await page.evaluate(()=>document.getElementById("demoReload").textContent),"↻ Reload the demo in English");
    await page.click("#demoReload"); await page.waitForTimeout(200);
    await page.click("#ask-ok"); await page.waitForTimeout(150);
    const st=await page.evaluate(()=>window.HM.LS.get("stu.list",[]));
    const res=await page.evaluate(()=>window.HM.LS.get("ft.results",[]));
    eq(st.find(s=>s.id==="r1"),{id:"r1",name:"Real Student",cls:"ז׳1",cid:"c:ז:1",sex:"girls",age:12,tests:[]},"התלמיד האמיתי לא נגע");
    eq(res.filter(r=>r.sid==="r1"),[{id:"x9",ts:2,d:"2026-09-02",cls:"ז׳1",cid:"c:ז:1",test:"push",name:"Real Student",sid:"r1",gradeKey:"ז",sex:"girls",val:11,unit:"חזרות"}],"והמדידה שלו");
    eq(st.filter(s=>/^demo/.test(s.id)).map(s=>s.name),EN_KIDS,"תלמידי ההדגמה באנגלית");
    eq(st.filter(s=>/^demo/.test(s.id)).map(s=>s.id),EN_KIDS.map((_,i)=>"demo"+i),"באותם מזהים");
    ok(res.filter(r=>/^demo/.test(r.sid)).every(r=>!HEB.test(r.name)&&r.cid==="c:ט:3"),"תוצאות ההדגמה בשמות החדשים ובאותה כיתה");
    eq(await page.evaluate(()=>window.HM.LS.get("hx.demoLang",null)),"en");
  }),

  check("גרסת החנות: אחסון ה-WebView פונה, והעותק (בלי בחירת שפה) משוחזר — בעברית",{__fresh:true,__native:"android",
    __fakefs:{"LIBRARY/pe-ultimate-data.json":JSON.stringify({v:1,ns:"peultimate.",n:2,data:{
      "peultimate.stu.list":JSON.stringify([{id:"a",name:"דן",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,tests:[]}]),
      "peultimate.hx.leadDone":"true"}})}},async page=>{
    await page.waitForFunction(()=>!!localStorage.getItem("peultimate.stu.list"),null,{timeout:5000});
    await page.waitForLoadState("load"); await page.waitForTimeout(700);
    eq(await lang(page),{lang:"he",dir:"rtl",stored:"he"});
    eq(await page.evaluate(()=>window.HM.LS.get("stu.list",[]).map(s=>s.id)),["a"],"הנתונים חזרו");
  })
]};
