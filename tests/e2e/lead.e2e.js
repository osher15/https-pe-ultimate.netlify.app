"use strict";
/* ============================================================
   מסך פרטי הקשר — טופס ייעודי, דילוג ל-7 ימים ותזכורת
   ------------------------------------------------------------
   עד 2026-09 המסך שלח ל-Google Forms של המגרש PRO בלי לדעת אם
   הפנייה נקלטה, ופנייה עם נייד בלבד או אימייל בלבד נדחתה שם בשקט.
   הכללים שנבדקים כאן:
   · ארבעת השדות חובה, טלפון בפורמט בינלאומי; טופס חלקי לא יוצא.
   · «התקבל» רק אחרי שהשרת החזיר את דף האישור (contact-received.html).
   · תקלה ברשת / אישור חסר — הודעה ברורה, הפרטים נשארים, לא «נשלח».
   · דילוג לא שולח דבר ודוחה ל-7 ימים, גם אחרי פתיחה מחדש.
   · אחרי 7 ימים — פס תזכורת שאינו חוסם; לא בשיעור פעיל ולא לתלמיד.
   · אחרי קליטה מאושרת — אין תזכורות, והטופס זמין מ«אודות».

   השרת המקומי של הבדיקות אינו Netlify, ולכן כל POST מנותב כאן
   לתשובה מבוימת. «פתיחה מחדש» היא לשונית שנייה באותו הקשר: אותו
   אחסון, בלי הזרעה חוזרת של ה-harness.
   ============================================================ */
const fs=require("fs"),path=require("path");
const {check,eq,ok,TEACHER_CODE}=require("./harness.js");
const D=require("../../hm-data.js");

const ACK=fs.readFileSync(path.join(__dirname,"../../contact-received.html"),"utf8");
const DAY=86400000;
const base={"pf.guideSeen":true,"schema.version":D.SCHEMA_VERSION};
const fresh=Object.assign({"hx.leadDone":false},base);
const GOOD={first:"Test",last:"User",email:"test.user@example.com",phone:"+44 20 7946 0958"};

const shown=page=>page.evaluate(()=>document.getElementById("leadOv").classList.contains("on"));
const barShown=page=>page.evaluate(()=>{ const b=document.getElementById("leadRemind"); return !!b&&!b.hidden; });
const fill=(page,v)=>page.evaluate(x=>{
  for(const k of ["first","last","email","phone"])document.getElementById("lead-"+k).value=x[k]||"";
},v);
const send=async page=>{ await page.click("#lead-send"); await page.waitForTimeout(450); };
const state=page=>page.evaluate(()=>window.HMLead.state());
const errs=page=>page.evaluate(()=>{ const o={};
  for(const k of ["first","last","email","phone"])o[k]=document.getElementById("lead-"+k+"-err").textContent;
  return o; });

/* ניתוב POST לתשובה מבוימת. log אוסף את גוף הבקשות */
async function server(page,mode,log){
  await page.route("**/*",async r=>{
    const q=r.request();
    if(q.method()!=="POST")return r.fallback();
    if(log)log.push(q.postData());
    if(mode==="ok")return r.fulfill({status:200,contentType:"text/html;charset=utf-8",body:ACK});
    if(mode==="404")return r.fulfill({status:404,contentType:"text/html",body:"<h1>Not found</h1>"});
    if(mode==="noack")return r.fulfill({status:200,contentType:"text/html",body:"<!doctype html><title>PE Ultimate</title>"});
    return r.abort("internetdisconnected");
  });
}
/* פתיחה מחדש של האפליקציה: לשונית חדשה, אותו אחסון, שעון לבחירה */
async function reopen(env,page,nowMs){
  const p=await env.ctx.newPage();
  await p.route("**/*",r=>r.request().url().indexOf("http://127.0.0.1:")===0?r.continue():r.abort());
  if(nowMs)await p.addInitScript(ms=>{ const R=Date; function F(){ return arguments.length?new R(...arguments):new R(ms); }
    F.prototype=R.prototype; F.now=()=>ms; F.parse=R.parse; F.UTC=R.UTC; window.Date=F; },nowMs);
  await p.goto(page.url()); await p.waitForTimeout(700);
  if(await p.locator("#lockOv.on").count()){
    await p.fill("#lock-pass",TEACHER_CODE); await p.click("#lock-enter"); await p.waitForTimeout(400);
  }
  return p;
}

module.exports={title:"מסך פרטי הקשר — שליחה מאומתת, דילוג ותזכורת",tests:[

  check("מכשיר חדש: המסך מוצג, עם בחירת שפה והסבר שאין כאן חשבון או גיבוי",fresh,async page=>{
    eq(await shown(page),true);
    ok(await page.locator("#lead-lang button").count()>=5,"בחירת שפה");
    const t=await page.textContent(".lead-purpose");
    ok(/חשבון/.test(t)&&/לענן/.test(t),"ההסבר: "+t);
  }),

  check("מי שכבר שלח (גרסה קודמת) לא רואה מסך ולא תזכורת",Object.assign({"hx.leadDone":true},base),async page=>{
    eq(await shown(page),false); eq(await barShown(page),false);
  }),

  check("טופס חלקי לא יוצא: ריק, רק טלפון, רק אימייל — כל אחד עם הודעה בשדה",fresh,async (page)=>{
    const log=[]; await server(page,"ok",log);
    await send(page);
    const e0=await errs(page);
    ok(e0.first&&e0.last&&e0.email&&e0.phone,"ארבע הודעות: "+JSON.stringify(e0));
    await fill(page,{first:"Test",last:"User",phone:"+44 20 7946 0958"}); await send(page);
    ok((await errs(page)).email,"בלי אימייל — חסר");
    await fill(page,{first:"Test",last:"User",email:"a@example.com"}); await send(page);
    ok((await errs(page)).phone,"בלי טלפון — חסר");
    eq(log.length,0,"שום בקשה לא יצאה");
    eq((await state(page)).done,false);
    eq(await page.getAttribute("#lead-phone","aria-invalid"),"true","השדה מסומן לקוראי מסך");
  }),

  check("אימות בינלאומי: אימייל פגום וטלפון קצר נדחים; +44, +1 ו-050 מתקבלים",fresh,async page=>{
    const log=[]; await server(page,"ok",log);
    await fill(page,Object.assign({},GOOD,{email:"user@example",phone:"12345"})); await send(page);
    const e=await errs(page);
    ok(e.email&&e.phone,"שני השדות נדחו: "+JSON.stringify(e));
    eq(log.length,0);
    for(const ph of ["+1 (212) 555-0199","050-123-4567","+86 138 0013 8000"])
      eq(D.validPhone(ph),true,ph);
  }),

  check("שליחה מאושרת: «התקבל», בדיוק השדות של הטופס, ובפתיחה מחדש — בלי מסך ובלי תזכורת",fresh,async (page,env)=>{
    const log=[]; await server(page,"ok",log);
    const stuBefore=await page.evaluate(()=>localStorage.getItem("peultimate.stu.list"));
    await fill(page,GOOD); await send(page);
    ok(/התקבל/.test(await page.textContent("#lead-status")),"הודעת הצלחה");
    const st=await state(page);
    eq(st.done,true); ok(st.sentAt,"מועד שליחה נשמר");
    eq(log.length,1,"בקשה אחת");
    const body=Object.fromEntries(new URLSearchParams(log[0]));
    eq(Object.keys(body).sort(),["app_version","bot-field","email","first","form-name","kind","lang","last","message","phone"],"רק שדות הטופס");
    eq(body["form-name"],"pe-ultimate-contact");
    eq([body.email,body.phone],[GOOD.email,GOOD.phone]);
    eq(await page.evaluate(()=>localStorage.getItem("peultimate.stu.list")),stuBefore,"נתוני תלמידים לא נגעו");
    await page.click("#lead-done"); await page.waitForTimeout(200);
    eq(await shown(page),false);
    const p2=await reopen(env,page,Date.now()+30*DAY);
    eq(await shown(p2),false,"אין מסך אחרי קליטה מאושרת");
    eq(await barShown(p2),false,"ואין תזכורת גם אחרי חודש");
    ok(/נשלחו ונקלטו/.test(await p2.textContent("#ab-leadStat")),"אודות מציג שנשלח");
    ok(await p2.locator("#ab-lead").count(),"והטופס זמין מ«אודות»");
  }),

  check("תקלה ברשת: הודעה ברורה, הפרטים נשארים, ושום «נשלח»",fresh,async page=>{
    await server(page,"net");
    await fill(page,GOOD); await send(page);
    ok(/אין חיבור/.test(await page.textContent("#lead-status")),"הודעת רשת");
    eq(await page.inputValue("#lead-email"),GOOD.email,"הפרטים נשארו");
    eq((await state(page)).done,false);
    eq(await shown(page),true,"המסך נשאר פתוח לניסיון נוסף");
  }),

  check("שרת שלא אישר קליטה (404, או 200 בלי דף האישור) — לא «נשלח»",fresh,async page=>{
    await server(page,"404");
    await fill(page,GOOD); await send(page);
    ok(/לא אישר/.test(await page.textContent("#lead-status")),"404");
    await page.unrouteAll({behavior:"ignoreErrors"}).catch(()=>{});
    await server(page,"noack");
    await send(page);
    ok(/לא אישר/.test(await page.textContent("#lead-status")),"200 בלי סימן האישור");
    eq((await state(page)).done,false);
  }),

  check("דילוג: לא שולח דבר, נשמר ל-7 ימים בדיוק, ופתיחה מחדש לפני הזמן לא מציגה כלום",
    Object.assign({__now:"2026-09-29T10:00:00Z"},fresh),async (page,env)=>{
    const log=[]; await server(page,"ok",log);
    const t0=Date.parse("2026-09-29T10:00:00Z");
    await page.click("#lead-skip"); await page.waitForTimeout(250);
    eq(log.length,0,"דילוג לא שלח בקשה");
    eq(await shown(page),false);
    eq((await state(page)).snoozeUntil,t0+7*DAY,"מועד התזכורת נשמר מקומית");
    const p2=await reopen(env,page,t0+6*DAY);
    eq(await shown(p2),false,"אחרי 6 ימים — אין מסך");
    eq(await barShown(p2),false,"ואין תזכורת");
    await p2.close();
    const p3=await reopen(env,page,t0+7*DAY+60000);
    eq(await shown(p3),false,"אחרי 7 ימים — לא מסך חוסם");
    eq(await barShown(p3),true,"אלא פס תזכורת");
  }),

  check("תזכורת: לא חוסמת את האפליקציה; «בעוד 7 ימים» דוחה שוב; «השארת פרטים» פותח את הטופס",
    Object.assign({"hx.leadSnoozeUntil":Date.now()-1000},fresh),async page=>{
    eq(await shown(page),false,"אין שכבה חוסמת");
    eq(await barShown(page),true,"פס תזכורת");
    await page.evaluate(()=>window.HM.go("stu")); await page.waitForTimeout(300);
    ok(await page.evaluate(()=>document.body.dataset.mod==="stu"),"אפשר לעבור למסך התלמידים");
    await page.click("#lead-remLater"); await page.waitForTimeout(200);
    eq(await barShown(page),false);
    const until=(await state(page)).snoozeUntil;
    ok(until>Date.now()+6.9*DAY&&until<Date.now()+7.1*DAY,"נדחה ב-7 ימים");
    await page.evaluate(()=>window.HMLead.remind()); await page.waitForTimeout(100);
    eq(await barShown(page),false,"לא חוזרת לפני הזמן");
    await page.evaluate(()=>window.HM.LS.set("hx.leadSnoozeUntil",Date.now()-1));
    await page.evaluate(()=>window.HMLead.remind());
    await page.click("#lead-remFill"); await page.waitForTimeout(200);
    eq(await shown(page),true,"הטופס נפתח");
  }),

  check("תזכורת לא מוצגת בשיעור פעיל",Object.assign({"hx.leadSnoozeUntil":Date.now()-1000},fresh,{
    "ft.classes":{"c:ט:3":{id:"c:ט:3",name:"ט׳3",grade:"ט",num:3,key:"ט3"}}}),async (page,env)=>{
    await page.evaluate(()=>window.HM.session.start({cid:"c:ט:3",clsSnapshot:"ט׳3"}));
    const p2=await reopen(env,page);
    ok(await p2.evaluate(()=>!!window.HM.session.active()),"השיעור פעיל");
    eq(await barShown(p2),false,"בלי תזכורת באמצע שיעור");
  }),

  check("מעבר מגרסה קודמת: «דילגתי» הופך לדחייה של 7 ימים, ולא נחשב «נשלח»",
    Object.assign({"hx.leadDone":true,"hx.leadSkipped":true},base),async page=>{
    const st=await state(page);
    eq(st.done,false);
    ok(st.snoozeUntil>Date.now()+6.9*DAY,"דחייה מעכשיו");
    eq(await page.evaluate(()=>localStorage.getItem("peultimate.hx.leadSkipped")),null,"הדגל הישן נוקה");
    eq(await shown(page),false); eq(await barShown(page),false);
  }),

  check("כיוון: אנגלית משמאל לימין, ערבית מימין לשמאל; אימייל וטלפון תמיד LTR",fresh,async page=>{
    await page.click('#lead-lang button[data-l="en"]'); await page.waitForTimeout(200);
    eq(await page.evaluate(()=>document.documentElement.dir),"ltr");
    ok(/account/i.test(await page.textContent(".lead-purpose")),"הסבר באנגלית");
    await page.click('#lead-lang button[data-l="ar"]'); await page.waitForTimeout(200);
    eq(await page.evaluate(()=>document.documentElement.dir),"rtl");
    eq(await page.getAttribute("#lead-email","dir"),"ltr");
    eq(await page.getAttribute("#lead-phone","dir"),"ltr");
  }),

  check("שליחה כפולה: שלוש לחיצות מהירות בזמן שהשרת איטי — פנייה אחת בלבד",fresh,async page=>{
    const log=[];
    await page.route("**/*",async r=>{ const q=r.request(); if(q.method()!=="POST")return r.fallback();
      log.push(q.postData()); await new Promise(res=>setTimeout(res,700));
      return r.fulfill({status:200,contentType:"text/html;charset=utf-8",body:ACK}); });
    await fill(page,GOOD);
    await page.evaluate(()=>{ const f=document.getElementById("lead-form");
      for(let i=0;i<3;i++)f.dispatchEvent(new Event("submit",{cancelable:true,bubbles:true})); });
    await page.waitForTimeout(1300);
    eq(log.length,1,"יצאה פנייה אחת");
    eq((await state(page)).done,true,"ונקלטה");
  }),

  check("בקשת מחיקה מ«אודות»: בלי שמות, אימייל בלבד מספיק; נשלח kind=delete והתזכורות נעצרות",
    Object.assign({"hx.leadDone":false,"hx.leadSnoozeUntil":Date.parse("2026-01-01")},base),async page=>{
    const log=[]; await server(page,"ok",log);
    await page.evaluate(()=>document.getElementById("ab-leadDel").click()); await page.waitForTimeout(300);
    eq(await shown(page),true,"הטופס נפתח");
    eq(await page.evaluate(()=>document.querySelector('#lead-kind input[value="delete"]').checked),true,"במצב מחיקה");
    eq(await page.evaluate(()=>document.getElementById("lead-names").hidden),true,"בלי שדות שם");
    eq(await page.evaluate(()=>document.getElementById("lead-delnote").hidden),false,"עם ההסבר על שלושת סוגי המחיקה");
    const note=await page.textContent("#lead-delnote");
    ok(/במכשיר/.test(note)&&/Drive/.test(note),"ההסבר מבחין בין Netlify, המכשיר והגיבויים — "+note);
    /* ריק — לא יוצא כלום */
    await send(page); eq(log.length,0,"בלי אימייל וטלפון לא נשלח");
    ok((await errs(page)).email.length>0,"ויש הודעה ליד השדה");
    await page.fill("#lead-email","test.user@example.com");
    await page.fill("#lead-message","TEST — synthetic deletion request");
    await send(page);
    eq(log.length,1,"נשלחה בקשה אחת");
    const q=new URLSearchParams(log[0]);
    eq([q.get("kind"),q.get("first"),q.get("last"),q.get("email"),q.get("phone")],
       ["delete","","","test.user@example.com",""],"רק מה שנחוץ לזיהוי");
    eq(q.get("message"),"TEST — synthetic deletion request");
    const st=await state(page);
    eq([st.optOut,!!st.delAt],[true,true],"בקשת המחיקה נרשמה");
    eq(await page.evaluate(()=>window.HMDATA.leadStatus(window.HMLead.state(),Date.now())),"done","אין עוד תזכורות");
  }),

  check("בקשת מחיקה שנכשלה ברשת: הטקסט נשאר, לא נרשמה כנקלטה",Object.assign({"hx.leadDone":true},base),async page=>{
    await server(page,"net");
    await page.evaluate(()=>window.HMLead.open(true,"delete")); await page.waitForTimeout(200);
    await page.fill("#lead-phone","+972 50 123 4567"); await page.fill("#lead-message","נא למחוק");
    await send(page);
    eq(await page.inputValue("#lead-phone"),"+972 50 123 4567");
    eq(await page.inputValue("#lead-message"),"נא למחוק");
    eq((await state(page)).optOut,false);
    ok(/לא נשלח/.test(await page.textContent("#lead-status")),"הודעת כשל");
  }),

  check("קישור מדף הפרטיות (#delete-contact) פותח ישר את בקשת המחיקה",Object.assign({"hx.leadDone":true},base),async(page,env)=>{
    const p=await env.ctx.newPage();
    await p.route("**/*",r=>r.request().url().indexOf("http://127.0.0.1:")===0?r.continue():r.abort());
    await p.goto(page.url().split("#")[0]+"#delete-contact"); await p.waitForTimeout(900);
    eq(await p.evaluate(()=>document.getElementById("leadOv").classList.contains("on")),true);
    eq(await p.evaluate(()=>document.querySelector('#lead-kind input[value="delete"]').checked),true);
    const priv=fs.readFileSync(path.join(__dirname,"../../privacy.html"),"utf8");
    ok(priv.indexOf('href="/#delete-contact"')>=0,"ודף הפרטיות מקשר לשם");
  })

]};
