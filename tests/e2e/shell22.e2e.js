"use strict";
/* ============================================================
   הקליפה שבאמת עולה לאתר — index.html
   ------------------------------------------------------------
   כל שאר הבדיקות רצות מול Hamegrash.html. האתר עצמו מגיש את
   index.html, ושם נטען פעם support.js: הוא הוריד React מ-unpkg וצייר
   מחדש את כל הדף מהתבנית. הסקריפטים רצו פעם שנייה (hm-app.js נפל
   על let כפול), וה-DOM שהכפתורים מחוברים אליו הוחלף בעותק מת —
   המסך נראה תקין ומתורגם, ושום כפתור לא הגיב. הבדיקות לא ראו את זה
   כי הן לא טוענות את index.html ואין להן רשת.

   כאן index.html נפתח כשהגישה ל-unpkg «זמינה» (React מדומה שמגיע
   מהר), כדי שאם מישהו יחזיר תלות כזו — הבדיקה תיפול.
   ============================================================ */
const {check,eq,ok,TEACHER_CODE}=require("./harness.js");
const fs=require("fs"), path=require("path");
const R=path.resolve(__dirname,"../..");

async function openIndex(page){
  const ext=[];
  await page.context().route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/,route=>{
    const u=route.request().url();
    if(/fonts\.(googleapis|gstatic)\.com/.test(u))return route.abort();
    ext.push(u);
    /* «React» מדומה — מספיק כדי שקוד שמחכה לו ימשיך לרוץ */
    route.fulfill({status:200,contentType:"application/javascript",
      body:"window.React=window.React||{createElement(){return null},useState(v){return[v,()=>{}]},useEffect(){},useMemo(f){return f()}};"+
           "window.ReactDOM=window.ReactDOM||{createRoot(){return{render(){}}},render(){}};"});
  });
  await page.goto(page.url().replace(/[^/]*$/,"index.html"),{waitUntil:"domcontentloaded"});
  await page.waitForTimeout(900);
  if(await page.locator("#lockOv.on").count()){
    await page.fill("#lock-pass",TEACHER_CODE); await page.click("#lock-enter"); await page.waitForTimeout(400);
  }
  return ext;
}

module.exports={title:"הקליפה של האתר (index.html)",tests:[

  check("index.html לא טוען סקריפט מאתר חיצוני",{},async()=>{
    const html=fs.readFileSync(path.join(R,"index.html"),"utf8").replace(/<!--[\s\S]*?-->/g,"");
    const srcs=[...html.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)].map(m=>m[1]);
    eq(srcs.filter(s=>/^(https?:)?\/\//.test(s)),[],"סקריפטים חיצוניים");
    ok(!srcs.some(s=>/support\.js/.test(s)),"support.js נטען שוב — הוא מצייר מחדש את הדף ומנתק את הכפתורים");
  }),

  check("index.html עולה ישירות — בלי React ובלי החלפת הדף",{},async page=>{
    const ext=await openIndex(page);
    eq(ext.filter(u=>/unpkg|react/i.test(u)),[],"בקשות ל-React");
    const st=await page.evaluate(()=>({root:!!document.getElementById("dc-root"),xdc:!!document.querySelector("x-dc"),
      booted:!!window.__hmBooted,home:!!document.getElementById("view-home")}));
    eq(st,{root:false,xdc:true,booted:true,home:true});
  }),

  check("index.html: הכפתורים מגיבים — כלי מהיר, ניווט תחתון והגדרות",{},async page=>{
    await openIndex(page);
    await page.locator("#view-home").getByText("מבחני כושר").first().click();
    await page.waitForTimeout(500);
    eq(await page.evaluate(()=>location.hash),"#ft","הכלי המהיר פתח את מבחני הכושר");
    await page.evaluate(()=>window.HM.go("home")); await page.waitForTimeout(400);
    await page.click("#btnSettings"); await page.waitForTimeout(400);
    ok(await page.evaluate(()=>{ const t=document.querySelector("[data-i18n='set.title']"); return !!t&&t.offsetParent!==null; }),
      "ההגדרות נפתחו");
  })

]};
