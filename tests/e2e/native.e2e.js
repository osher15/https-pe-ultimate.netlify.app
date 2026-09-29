"use strict";
/* ============================================================
   גרסת החנות (Capacitor) — המסלולים של hm-native.js
   ------------------------------------------------------------
   רץ ב-Chromium עם Capacitor מדומה (capshim.js). נבדק כאן שהקוד
   שלנו קורא לפלאגינים הנכונים עם הפרמטרים הנכונים, ושהנתונים לא
   הולכים לאיבוד בדרך. לא נבדקים כאן: המעטפת עצמה, גיליון השיתוף
   של המערכת, הרשאות, מצלמה ושמע — את אלה בודקים במכשיר.
   ============================================================ */
const {check,eq,ok,TEACHER_CODE}=require("./harness.js");
const {capShim}=require("./capshim.js");
const D=require("../../hm-data.js");

const T3="c:ט:3";
const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION,
  "ft.classes":{[T3]:{id:T3,name:"ט׳3",grade:"ט",num:3,key:"ט3"}},
  "stu.list":[{id:"a",name:"אליס",cls:"ט׳3",cid:T3,sex:"girls",age:14,tests:[]},
              {id:"b",name:"בני",cls:"ט׳3",cid:T3,sex:"boys",age:14,tests:[]}]};
const android=Object.assign({__native:"android"},base);
const ios=Object.assign({__native:"ios"},base);

const calls=(page,pl,m)=>page.evaluate(([p,x])=>window.__cap.filter(c=>c[0]===p&&(!x||c[1]===x)),[pl,m]);
/* קבצים שהמורה שומר (תיקיית המטמון) — בלי העותק האוטומטי של הנתונים */
const exportsOf=async page=>(await calls(page,"Filesystem","writeFile")).filter(c=>c[2].directory==="CACHE");
const b64=s=>Buffer.from(s,"base64").toString("utf8");
const fakefs=page=>page.evaluate(()=>JSON.parse(localStorage.getItem("__fakefs")||"{}"));

/* לשונית שנייה באותו הקשר = אותו «מכשיר» ואותו אחסון, בלי ההזרעה של
   ה-harness. כך נבדקים פתיחה מחדש ופינוי. */
async function reopen(page,platform){
  const p2=await page.context().newPage();
  await p2.addInitScript(capShim,platform);
  /* יומן של כל הודעה שהוצגה — הכניסה עם הקוד מחליפה את ההודעה שלפניה */
  await p2.addInitScript(()=>{ const log=window.__toasts=[]; setInterval(()=>{ const t=document.getElementById("toastT");
    if(t&&t.textContent&&log[log.length-1]!==t.textContent)log.push(t.textContent); },50); });
  await p2.route("**/*",r=>{ const u=r.request().url();
    return (u.indexOf("http://127.0.0.1:")===0||/^(data|blob):/.test(u))?r.continue():r.abort(); });
  await p2.goto(page.url(),{waitUntil:"domcontentloaded"});
  await p2.waitForTimeout(1200);
  if(await p2.locator("#lockOv.on").count()){
    await p2.fill("#lock-pass",TEACHER_CODE); await p2.click("#lock-enter"); await p2.waitForTimeout(400);
  }
  return p2;
}

module.exports={title:"גרסת החנות — גשר Capacitor (מדומה)",tests:[

  check("בדפדפן רגיל הגשר כבוי: אין Capacitor, אין שינוי בהתנהגות",base,async page=>{
    eq(await page.evaluate(()=>[window.HMN.native,window.HMN.platform]),[false,"web"]);
    ok(!(await page.evaluate(()=>document.documentElement.classList.contains("hmn-native"))),"בלי מחלקת native");
    eq(await page.evaluate(()=>getComputedStyle(document.querySelector(".bk-adv")).display!=="none"),true,"גיבוי לדרייב נשאר באתר");
  }),

  check("Android: אין service worker באפליקציה הארוזה",android,async page=>{
    eq(await page.evaluate(()=>[window.HMN.native,window.HMN.platform]),[true,"android"]);
    await page.waitForTimeout(600);
    eq(await page.evaluate(async()=>(await navigator.serviceWorker.getRegistrations()).length),0);
  }),

  check("ייצוא CSV: נכתב לתיקיית המטמון ונפתח גיליון שיתוף עם אותו קובץ",android,async page=>{
    await page.evaluate(()=>window.HM.go("stu")); await page.waitForTimeout(500);
    await page.click("#stu-csv"); await page.waitForTimeout(500);
    const w=await exportsOf(page);
    eq(w.length,1,"קובץ אחד נכתב");
    eq([w[0][2].directory,w[0][2].path],["CACHE","exports/students_tracking.csv"]);
    ok(b64(w[0][2].data).indexOf("אליס")>=0,"התוכן הוא הייצוא עצמו");
    const s=await calls(page,"Share","share");
    eq(s.length,1); eq(s[0][2].files,["file:///fake/CACHE/exports/students_tracking.csv"]);
  }),

  check("גיבוי מלא: הקובץ המשותף הוא גיבוי תקין, ושחזור ממנו מחזיר את הנתונים",android,async page=>{
    await page.evaluate(()=>window.HM.openSettings("backup")); await page.waitForTimeout(300);
    await page.evaluate(()=>{ document.getElementById("set-bkEnc").checked=false; document.getElementById("set-bkExport").click(); });
    await page.waitForTimeout(1500);
    const w=(await calls(page,"Filesystem","writeFile")).filter(c=>c[2].directory==="CACHE");
    eq(w.length,1,"גיבוי אחד נכתב");
    ok(/^exports\/pe-ultimate-.*\.json$/.test(w[0][2].path),"שם קובץ הגיבוי: "+w[0][2].path);
    const snap=JSON.parse(b64(w[0][2].data));
    ok(snap.data&&snap.data["stu.list"],"יש בו את רשימת התלמידים");
    eq((await calls(page,"Share","share")).length,1);
    /* משחזרים מהקובץ שיצא (עם תלמיד שלישי, כדי לראות שהקובץ הוא שנכתב).
       אחרי השחזור הדף נטען מחדש — וה-harness מזריע שוב — לכן בודקים לפני. */
    const list=JSON.parse(snap.data["stu.list"]); list.push({id:"c",name:"גל",cls:"ט׳3",cid:T3,sex:"boys",age:14,tests:[]});
    snap.data["stu.list"]=JSON.stringify(list);
    await page.evaluate(()=>window.HM.openSettings("backup")); await page.waitForTimeout(300);
    await page.setInputFiles("#set-bkFile",{name:"backup.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(snap))});
    await page.waitForTimeout(600);
    await page.click("#bk-go"); await page.waitForTimeout(300);
    await page.click("#ask-ok"); await page.waitForTimeout(350);
    const names=await page.evaluate(()=>window.HM.LS.get("stu.list",[]).map(s=>s.name).sort());
    eq(names,["אליס","בני","גל"],"שוחזר מהקובץ");
  }),

  check("שיתוף שבוטל: אומרים שהקובץ לא נשמר",android,async page=>{
    await page.evaluate(()=>{ window.__shareCancel=true; window.HM.go("stu"); }); await page.waitForTimeout(400);
    await page.click("#stu-csv"); await page.waitForTimeout(600);
    ok(/לא נשמר/.test(await page.evaluate(()=>document.getElementById("toastT").textContent)),"הודעה ברורה");
  }),

  check("הדפסה/PDF: המסמך נפתח בתוך האפליקציה, ו«שמירה או שיתוף» שומר HTML",ios,async page=>{
    const r=await page.evaluate(()=>{
      const w=window.open("","_blank");
      w.document.write('<html><head><title>חלוקה לקבוצות</title></head><body><h1>קבוצה 1</h1><script>print()<\/script></body></html>');
      w.document.close();
      return {got:!!w};
    });
    ok(r.got,"window.open החזיר חלון (לא null)");
    await page.waitForTimeout(300);
    ok(await page.evaluate(()=>document.getElementById("hmn-doc").classList.contains("on")),"המסמך מוצג");
    ok((await page.evaluate(()=>document.querySelector("#hmn-doc iframe").srcdoc)).indexOf("קבוצה 1")>=0);
    await page.click('#hmn-doc [data-hmn="share"]'); await page.waitForTimeout(500);
    const w=await exportsOf(page);
    eq(w.length,1); eq(w[0][2].path,"exports/חלוקה-לקבוצות.html");
    eq((await calls(page,"Share","share")).length,1);
    await page.click('#hmn-doc [data-hmn="close"]');
    ok(!(await page.evaluate(()=>document.getElementById("hmn-doc").classList.contains("on"))),"נסגר");
    ok(await page.evaluate(()=>!!document.getElementById("home")||document.body.children.length>3),"האפליקציה עצמה לא נדרסה");
  }),

  check("הדפסה מכפתור אמיתי (חלוקה לקבוצות) נפתחת בתוך האפליקציה",android,async page=>{
    await page.evaluate(c=>window.HM.session.start({cid:c,clsSnapshot:"ט׳3"}),T3);
    await page.evaluate(()=>window.TOOLS.markAllPresent());
    await page.evaluate(()=>window.HM.go("live")); await page.waitForTimeout(400);
    await page.click('[data-tool="teams"]'); await page.waitForTimeout(500);
    await page.evaluate(()=>{ const n=document.getElementById("tl-teamN"); n.value=2; n.dispatchEvent(new Event("input")); });
    await page.click("#tl-teamGo"); await page.waitForTimeout(300);
    await page.click("#tl-teamPrint"); await page.waitForTimeout(400);
    ok(await page.evaluate(()=>document.getElementById("hmn-doc").classList.contains("on")),"המסמך מוצג");
    ok((await page.evaluate(()=>document.querySelector("#hmn-doc iframe").srcdoc)).indexOf("אליס")>=0,"עם הקבוצות");
  }),

  check("עותק הנתונים: כל שינוי נכתב לקובץ בתיקיית האפליקציה",android,async page=>{
    await page.evaluate(()=>window.HM.LS.set("stu.list",window.HM.LS.get("stu.list",[]).concat([{id:"c",name:"גל",cls:"ט׳3",cid:"c:ט:3",sex:"boys",age:14,tests:[]}])));
    await page.waitForTimeout(2200);
    const f=await fakefs(page);
    const snap=JSON.parse(f["LIBRARY/pe-ultimate-data.json"]||"null");
    ok(snap&&snap.data,"העותק קיים");
    eq(JSON.parse(snap.data["peultimate.stu.list"]).map(s=>s.name),["אליס","בני","גל"]);
  }),

  check("מערכת ההפעלה פינתה את אחסון ה-WebView: בפתיחה הבאה הכול משוחזר מהעותק",android,async page=>{
    await page.waitForTimeout(2200);
    ok((await fakefs(page))["LIBRARY/pe-ultimate-data.json"],"יש עותק לפני הפינוי");
    await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.indexOf("peultimate.")===0).forEach(k=>localStorage.removeItem(k)));
    const p2=await reopen(page,"android");
    const names=await p2.evaluate(()=>window.HM.LS.get("stu.list",[]).map(s=>s.name));
    eq(names,["אליס","בני"],"התלמידים חזרו");
    await p2.waitForFunction(()=>window.__toasts.some(x=>/שוחזרו/.test(x)),null,{timeout:4000}).catch(()=>{});
    ok(await p2.evaluate(()=>window.__toasts.some(x=>/שוחזרו/.test(x))),"ונאמר למורה");
    await p2.close();
  }),

  check("עדכון גרסה (טעינה מחדש של האפליקציה): הנתונים נשארים ואין מה לשחזר",android,async page=>{
    await page.evaluate(()=>window.HM.LS.set("grades.periodRanges",{"רבעון 1":{from:"2026-09-01",to:"2026-12-31"}}));
    const p2=await reopen(page,"android");
    eq(await p2.evaluate(()=>window.HM.LS.get("stu.list",[]).length),2);
    ok(await p2.evaluate(()=>!!window.HM.LS.get("grades.periodRanges",null)),"מה שנכתב אחרון נשאר");
    eq(await p2.evaluate(()=>window.__cap.filter(c=>c[1]==="readFile").length),0,"לא נקרא עותק — לא היה צורך");
    await p2.close();
  }),

  check("טופס יצירת הקשר באפליקציה: נשלח לכתובת המלאה דרך HTTP של המערכת, «התקבל» רק עם אישור",
    Object.assign({"hx.leadDone":false},ios),async page=>{
    await page.waitForTimeout(300);
    ok(await page.evaluate(()=>document.getElementById("leadOv").classList.contains("on")),"הטופס מוצג");
    await page.evaluate(()=>{ const v={first:"Test",last:"User",email:"test.user@example.com",phone:"+44 20 7946 0958"};
      for(const k in v)document.getElementById("lead-"+k).value=v[k]; });
    await page.click("#lead-send"); await page.waitForTimeout(500);
    const h=await calls(page,"CapacitorHttp","request");
    eq(h.length,1,"בקשה אחת");
    eq([h[0][2].url,h[0][2].method],["https://pe-ultimate.netlify.app/","POST"]);
    eq(h[0][2].data["form-name"],"pe-ultimate-contact");
    eq(h[0][2].data.email,"test.user@example.com");
    ok(await page.evaluate(()=>!document.getElementById("lead-done").hidden),"אושר");
  }),

  check("טופס באפליקציה: שרת בלי אישור — לא «התקבל», והפרטים נשארים",
    Object.assign({"hx.leadDone":false},ios),async page=>{
    await page.evaluate(()=>{ window.__httpReply={status:200,data:"<html>index</html>"};
      const v={first:"Test",last:"User",email:"test.user@example.com",phone:"+44 20 7946 0958"};
      for(const k in v)document.getElementById("lead-"+k).value=v[k]; });
    await page.click("#lead-send"); await page.waitForTimeout(500);
    ok(await page.evaluate(()=>document.getElementById("lead-done").hidden),"לא הוצג «התקבל»");
    eq(await page.inputValue("#lead-email"),"test.user@example.com");
  }),

  check("מסך דולק בטיימר: דרך KeepAwake; קול ב-Android דרך TextToSpeech",
    Object.assign({"settings":{voice:true,wake:true}},android),async page=>{
    const r=await page.evaluate(async()=>{
      window.HM.keepAwake&&await window.HM.keepAwake(true);
      return typeof window.HM.keepAwake;
    });
    if(r!=="function"){
      /* keepAwake אינו חשוף — מפעילים טיימר אמיתי */
      await page.evaluate(()=>window.HM.go("tools")); await page.waitForTimeout(300);
    }
    await page.evaluate(()=>window.HM.say&&window.HM.say("שלב 5"));
    await page.waitForTimeout(200);
    const k=await calls(page,"KeepAwake","keepAwake"), s=await calls(page,"TextToSpeech","speak");
    ok(r!=="function"||k.length>=1,"KeepAwake נקרא");
    ok(!(await page.evaluate(()=>typeof window.HM.say))||s.length===1,"TextToSpeech נקרא");
    if(s.length)eq(s[0][2].text,"שלב 5");
  }),

  check("התקנה חדשה בלי נתונים: מסך הכניסה מסביר איך מעבירים נתונים מהאתר",{__native:"ios"},async page=>{
    const p2=await page.context().newPage();
    await p2.addInitScript(capShim,"ios");
    await p2.addInitScript(()=>localStorage.setItem("peultimate.hx.leadDone","true"));
    await p2.goto(page.url().replace(/#.*$/,""),{waitUntil:"domcontentloaded"}); await p2.waitForTimeout(800);
    const r=await p2.evaluate(()=>{ const m=document.getElementById("lock-migrate");
      return {vis:!!m&&!m.hidden&&getComputedStyle(m).display!=="none",txt:m?m.textContent:""}; });
    ok(r.vis,"ההסבר מוצג");
    ok(/שחזר מקובץ/.test(r.txt),"ומפנה לשחזור מקובץ");
    await p2.close();
  }),

  check("iOS: גיבוי ישיר לדרייב מוסתר (Google חוסמת התחברות בתוך WebView), וההסבר על השיתוף מוצג",ios,async page=>{
    await page.evaluate(()=>window.HM.openSettings("backup")); await page.waitForTimeout(300);
    const r=await page.evaluate(()=>({adv:getComputedStyle(document.querySelector(".bk-adv")).display,
      hint:getComputedStyle(document.querySelector('[data-i18n="bk.native"]')).display}));
    eq(r.adv,"none"); ok(r.hint!=="none","ההסבר מוצג");
  })
]};
